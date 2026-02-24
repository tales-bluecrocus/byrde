<?php
/**
 * Lake City Theme Functions
 *
 * @package LakeCity
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
// require_once get_template_directory() . '/inc/theme-settings-manager.php'; // Disabled: using ACF instead
// require_once get_template_directory() . '/inc/admin-settings-page.php'; // Disabled: using ACF options page
require_once get_template_directory() . '/inc/acf-theme-settings.php';
require_once get_template_directory() . '/inc/page-theme-editor.php';
require_once get_template_directory() . '/inc/rest-content-api.php';
require_once get_template_directory() . '/inc/contact-form-handler.php';
require_once get_template_directory() . '/inc/analytics.php';
require_once get_template_directory() . '/inc/seo.php';

/**
 * Get the front-end build assets (JS and CSS filenames with hashes)
 */
function lakecity_get_assets(): array {
    $assets_dir = get_template_directory() . '/front-end/dist/assets';

    if ( ! is_dir( $assets_dir ) ) {
        return array( 'js' => '', 'css' => '' );
    }

    $files = scandir( $assets_dir );
    $js = '';
    $css = '';

    foreach ( $files as $file ) {
        if ( str_starts_with( $file, 'index-' ) && str_ends_with( $file, '.js' ) ) {
            $js = 'assets/' . $file;
        }
        if ( str_starts_with( $file, 'index-' ) && str_ends_with( $file, '.css' ) ) {
            $css = 'assets/' . $file;
        }
    }

    return array( 'js' => $js, 'css' => $css );
}

/**
 * Enqueue front-end assets
 */
function lakecity_enqueue_assets(): void {
    $assets = lakecity_get_assets();
    $dist_uri = get_template_directory_uri() . '/front-end/dist';

    if ( ! empty( $assets['css'] ) ) {
        wp_enqueue_style(
            'lakecity-main',
            $dist_uri . '/' . $assets['css'],
            array(),
            null
        );
    }

    if ( ! empty( $assets['js'] ) ) {
        wp_enqueue_script(
            'lakecity-main',
            $dist_uri . '/' . $assets['js'],
            array(),
            null,
            true
        );

        // Pass theme settings to React
        wp_localize_script( 'lakecity-main', 'lakecitySettings', lakecity_get_all_settings() );
    }
}
add_action( 'wp_enqueue_scripts', 'lakecity_enqueue_assets' );

/**
 * Preload critical resources: JS module, Google Fonts, LCP logo image
 * Outputs early in <head> so browser discovers resources ASAP.
 */
function lakecity_preload_resources(): void {
    $assets = lakecity_get_assets();
    $dist_uri = get_template_directory_uri() . '/front-end/dist';

    // Modulepreload JS bundle — browser downloads in parallel with CSS (breaks sequential chain)
    if ( ! empty( $assets['js'] ) ) {
        printf(
            '<link rel="modulepreload" href="%s">' . "\n",
            esc_url( $dist_uri . '/' . $assets['js'] )
        );
    }

    // Preconnect to Google Fonts
    echo '<link rel="preconnect" href="https://fonts.googleapis.com">' . "\n";
    echo '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' . "\n";

    // Load Google Fonts non-blocking (media="print" trick + swap)
    echo '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&amp;family=Outfit:wght@100..900&amp;display=swap" media="print" onload="this.media=\'all\'">' . "\n";
    echo '<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&amp;family=Outfit:wght@100..900&amp;display=swap"></noscript>' . "\n";

    // Preload LCP logo image with fetchpriority=high (use 'logo' 128px size)
    $logo = lakecity_get_setting( 'logo' );
    if ( $logo && is_array( $logo ) ) {
        $logo_url = $logo['sizes']['logo'] ?? $logo['sizes']['thumbnail'] ?? $logo['url'] ?? '';
        if ( ! empty( $logo_url ) ) {
            printf(
                '<link rel="preload" as="image" href="%s" fetchpriority="high">' . "\n",
                esc_url( $logo_url )
            );
        }
    }
}
add_action( 'wp_head', 'lakecity_preload_resources', 1 );

/**
 * Add module type to our script
 */
function lakecity_script_type( string $tag, string $handle ): string {
    if ( 'lakecity-main' === $handle ) {
        return str_replace( '<script ', '<script type="module" ', $tag );
    }
    return $tag;
}
add_filter( 'script_loader_tag', 'lakecity_script_type', 10, 2 );

/**
 * Theme setup
 */
function lakecity_setup(): void {
    add_theme_support( 'title-tag' );
    add_theme_support( 'html5', array( 'script', 'style' ) );

    // Custom image size for logo (displayed at 64-98px, 128px = 2x retina)
    add_image_size( 'logo', 128, 128, false );
}
add_action( 'after_setup_theme', 'lakecity_setup' );

/**
 * Create default pages on theme activation
 */
function lakecity_activate(): void {
    $pages = array(
        array(
            'title' => 'Home',
            'slug'  => 'home',
            'set_front' => true,
        ),
        array(
            'title' => 'Privacy Policy',
            'slug'  => 'privacy-policy',
        ),
        array(
            'title' => 'Terms & Conditions',
            'slug'  => 'terms-and-conditions',
        ),
        array(
            'title' => 'Cookie Settings',
            'slug'  => 'cookie-settings',
        ),
    );

    $front_page_id = 0;

    foreach ( $pages as $page ) {
        // Skip if a page with this slug already exists
        $existing = get_page_by_path( $page['slug'] );
        if ( $existing ) {
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

        if ( ! empty( $page['set_front'] ) && $page_id && ! is_wp_error( $page_id ) ) {
            $front_page_id = $page_id;
        }
    }

    // Set static front page
    if ( $front_page_id ) {
        update_option( 'show_on_front', 'page' );
        update_option( 'page_on_front', $front_page_id );
    }
}
add_action( 'after_switch_theme', 'lakecity_activate' );
