<?php
/**
 * Byrde Theme Functions
 *
 * @package Byrde
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Include theme modules
 */
require_once get_template_directory() . '/inc/constants.php'; // Theme constants
require_once get_template_directory() . '/inc/required-plugins.php'; // Required plugin checks
require_once get_template_directory() . '/inc/cleanup.php';
require_once get_template_directory() . '/inc/validators.php'; // Input validation & sanitization
require_once get_template_directory() . '/inc/rate-limiter.php'; // Rate limiting
require_once get_template_directory() . '/inc/theme-settings-manager.php';
require_once get_template_directory() . '/inc/page-theme-editor.php';
require_once get_template_directory() . '/inc/rest-content-api.php';
require_once get_template_directory() . '/inc/contact-form-handler.php';
require_once get_template_directory() . '/inc/analytics.php';
require_once get_template_directory() . '/inc/seo.php';
require_once get_template_directory() . '/inc/shortcodes.php';
require_once get_template_directory() . '/inc/legal-pages.php';
require_once get_template_directory() . '/inc/cookie-consent.php';
require_once get_template_directory() . '/inc/update-checker.php';

/**
 * Get the theme directory URI relative to the network root.
 *
 * In multisite subdirectory installs, get_template_directory_uri() includes
 * the subsite prefix (e.g. /lp/wp-content/...) which causes 404s since
 * wp-content lives at the root. This helper uses network_site_url() to
 * generate the correct path from the installation root.
 */
function byrde_theme_uri(): string {
    if ( is_multisite() ) {
        return network_site_url( 'wp-content/themes/' . get_template() );
    }
    return get_template_directory_uri();
}

/**
 * Get the logo URL and alt text.
 * Shared between preload, shell render, and wp_localize_script.
 *
 * @return array{url: string, alt: string}
 */
function byrde_get_logo_data(): array {
    $site_name = get_bloginfo( 'name' );
    $settings  = byrde_get_all_settings();
    $logo_url  = $settings['logo'] ?? '';
    $logo_alt  = $settings['logo_alt'] ?? '';

    if ( ! empty( $logo_url ) ) {
        return array(
            'url' => $logo_url,
            'alt' => $logo_alt ?: $site_name,
        );
    }

    // Fallback to bundled logo
    $dist_dir = get_template_directory() . '/front-end/dist';
    if ( file_exists( $dist_dir . '/assets/byrde-logo.webp' ) ) {
        return array(
            'url' => byrde_theme_uri() . '/front-end/dist/assets/byrde-logo.webp',
            'alt' => $site_name,
        );
    }

    return array( 'url' => '', 'alt' => $site_name );
}

/**
 * Render an HTML shell inside #root so the browser can paint and discover
 * the LCP image (logo) before React loads. React's createRoot() replaces
 * this content on mount.
 */
function byrde_render_shell(): void {
    // Skip in editor preview — React handles everything there
    // phpcs:ignore WordPress.Security.NonceVerification.Recommended
    if ( ! empty( $_GET['byrde_preview'] ) ) {
        return;
    }

    $logo  = byrde_get_logo_data();
    $phone = byrde_get_setting( 'phone' );
    ?>
    <div style="min-height:100vh;background:#171717">
        <header style="padding:1rem 1.5rem">
            <div style="max-width:80rem;margin:0 auto;display:flex;align-items:center;justify-content:space-between">
                <?php if ( ! empty( $logo['url'] ) ) : ?>
                    <img
                        src="<?php echo esc_url( $logo['url'] ); ?>"
                        alt="<?php echo esc_attr( $logo['alt'] ); ?>"
                        width="64"
                        height="64"
                        fetchpriority="high"
                        style="height:3.5rem;width:auto"
                    />
                <?php endif; ?>
                <?php if ( $phone ) : ?>
                    <a href="tel:<?php echo esc_attr( preg_replace( '/\D/', '', $phone ) ); ?>" style="display:none"></a>
                <?php endif; ?>
            </div>
        </header>
    </div>
    <?php
}

/**
 * Enqueue front-end assets (fixed filenames, version-based cache busting)
 */
function byrde_enqueue_assets(): void {
    $dist_dir = get_template_directory() . '/front-end/dist';
    $dist_uri = byrde_theme_uri() . '/front-end/dist';
    $version  = wp_get_theme()->get( 'Version' );

    if ( file_exists( $dist_dir . '/assets/style.css' ) ) {
        wp_enqueue_style(
            'byrde-main',
            $dist_uri . '/assets/style.css',
            array(),
            $version
        );
    }

    if ( file_exists( $dist_dir . '/assets/main.js' ) ) {
        wp_enqueue_script(
            'byrde-main',
            $dist_uri . '/assets/main.js',
            array(),
            $version,
            true
        );

        // Pass theme settings + API URL to React
        $settings            = byrde_get_all_settings();
        $settings['apiUrl']  = rest_url( 'byrde/v1' );

        // Include contact form settings for admins (not exposed publicly)
        if ( current_user_can( 'manage_options' ) ) {
            $settings['postmark_api_token']      = byrde_get_setting( 'postmark_api_token' );
            $settings['contact_form_to_email']   = byrde_get_setting( 'contact_form_to_email' );
            $settings['contact_form_from_email'] = byrde_get_setting( 'contact_form_from_email' );
            $settings['contact_form_subject']    = byrde_get_setting( 'contact_form_subject' );
        }

        wp_localize_script( 'byrde-main', 'byrdeSettings', $settings );
    }
}
add_action( 'wp_enqueue_scripts', 'byrde_enqueue_assets' );

/**
 * Preload critical resources: JS module, Google Fonts, LCP logo image
 * Outputs early in <head> so browser discovers resources ASAP.
 */
function byrde_preload_resources(): void {
    $dist_dir = get_template_directory() . '/front-end/dist';
    $dist_uri = byrde_theme_uri() . '/front-end/dist';
    $version  = wp_get_theme()->get( 'Version' );

    // Modulepreload JS bundle — browser downloads in parallel with CSS (breaks sequential chain)
    if ( file_exists( $dist_dir . '/assets/main.js' ) ) {
        printf(
            '<link rel="modulepreload" href="%s">' . "\n",
            esc_url( $dist_uri . '/assets/main.js?ver=' . $version )
        );
    }

    // Preconnect to Google Fonts
    echo '<link rel="preconnect" href="https://fonts.googleapis.com">' . "\n";
    echo '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' . "\n";

    // Load Google Fonts non-blocking (media="print" trick + swap)
    echo '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&amp;family=Outfit:wght@100..900&amp;display=swap" media="print" onload="this.media=\'all\'">' . "\n";
    echo '<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&amp;family=Outfit:wght@100..900&amp;display=swap"></noscript>' . "\n";

    // Preload LCP logo image
    $logo = byrde_get_logo_data();
    if ( ! empty( $logo['url'] ) ) {
        printf(
            '<link rel="preload" as="image" href="%s" fetchpriority="high">' . "\n",
            esc_url( $logo['url'] )
        );
    }

    // Favicon — use logo (or fallback). Skipped when WP has a site icon set.
    if ( ! has_site_icon() && ! empty( $logo['url'] ) ) {
        printf(
            '<link rel="icon" href="%s" type="%s">' . "\n",
            esc_url( $logo['url'] ),
            esc_attr( byrde_image_mime( $logo['url'] ) )
        );
        printf(
            '<link rel="apple-touch-icon" href="%s">' . "\n",
            esc_url( $logo['url'] )
        );
    }
}
add_action( 'wp_head', 'byrde_preload_resources', 1 );

/**
 * Guess MIME type from image URL extension.
 */
function byrde_image_mime( string $url ): string {
    $ext = strtolower( pathinfo( wp_parse_url( $url, PHP_URL_PATH ) ?: '', PATHINFO_EXTENSION ) );
    $map = array(
        'webp' => 'image/webp',
        'png'  => 'image/png',
        'jpg'  => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'gif'  => 'image/gif',
        'svg'  => 'image/svg+xml',
        'ico'  => 'image/x-icon',
    );
    return $map[ $ext ] ?? 'image/png';
}

/**
 * Add module type to our script
 */
function byrde_script_type( string $tag, string $handle ): string {
    if ( 'byrde-main' === $handle ) {
        return str_replace( '<script ', '<script type="module" ', $tag );
    }
    return $tag;
}
add_filter( 'script_loader_tag', 'byrde_script_type', 10, 2 );

/**
 * Theme setup
 */
function byrde_setup(): void {
    add_theme_support( 'title-tag' );
    add_theme_support( 'html5', array( 'script', 'style' ) );

    // Custom image size for logo (displayed at 64-98px, 128px = 2x retina)
    add_image_size( 'logo', 128, 128, false );
}
add_action( 'after_setup_theme', 'byrde_setup' );

/**
 * Create default pages on theme activation
 */
function byrde_activate(): void {
    $pages = array(
        array(
            'title'     => 'Home',
            'slug'      => 'home',
            'set_front' => true,
        ),
        array(
            'title'    => 'Privacy Policy',
            'slug'     => 'privacy-policy',
            'template' => 'page-legal.php',
        ),
        array(
            'title'    => 'Terms & Conditions',
            'slug'     => 'terms-and-conditions',
            'template' => 'page-legal.php',
        ),
        array(
            'title'    => 'Cookie Settings',
            'slug'     => 'cookie-settings',
            'template' => 'page-legal.php',
        ),
    );

    $front_page_id = 0;

    foreach ( $pages as $page ) {
        $existing = get_page_by_path( $page['slug'] );

        if ( $existing ) {
            // Ensure legal page template is set on existing pages
            if ( ! empty( $page['template'] ) ) {
                $current_template = get_post_meta( $existing->ID, '_wp_page_template', true );
                if ( empty( $current_template ) || 'default' === $current_template ) {
                    update_post_meta( $existing->ID, '_wp_page_template', $page['template'] );
                }
            }
            if ( ! empty( $page['set_front'] ) ) {
                $front_page_id = $existing->ID;
            }
            continue;
        }

        $page_id = wp_insert_post( array(
            'post_title'   => $page['title'],
            'post_name'    => $page['slug'],
            'post_status'  => 'publish',
            'post_type'    => 'page',
            'post_content' => '',
        ) );

        if ( $page_id && ! is_wp_error( $page_id ) ) {
            // Set page template
            if ( ! empty( $page['template'] ) ) {
                update_post_meta( $page_id, '_wp_page_template', $page['template'] );
            }
            if ( ! empty( $page['set_front'] ) ) {
                $front_page_id = $page_id;
            }
        }
    }

    // Set static front page
    if ( $front_page_id ) {
        update_option( 'show_on_front', 'page' );
        update_option( 'page_on_front', $front_page_id );
    }
}
add_action( 'after_switch_theme', 'byrde_activate' );
