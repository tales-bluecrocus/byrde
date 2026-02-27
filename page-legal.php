<?php
/**
 * Template Name: Legal Page
 * Template Post Type: page
 *
 * Server-rendered template for legal pages (Privacy Policy, Terms, Cookies).
 * Uses matching dark header/footer with a light, readable content area.
 * Does NOT load React — keeps pages lightweight and SEO-friendly.
 *
 * @package Byrde
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Dequeue React bundle — not needed on legal pages
add_action( 'wp_print_footer_scripts', function() {
    wp_dequeue_script( 'byrde-main' );
}, 1 );

// Page data
$logo      = byrde_get_logo_data();
$settings  = byrde_get_all_settings();
$phone     = $settings['phone'] ?? '';
$phone_raw = $settings['phone_raw'] ?? '';
$site_name = $settings['site_name'] ?? get_bloginfo( 'name' );
$copyright = $settings['copyright'] ?? '';
$brand_primary = $settings['brand_primary'] ?? '#10b981';

// Meta descriptions for legal pages
$slug = get_post_field( 'post_name', get_the_ID() );
$meta_descriptions = array(
    'privacy-policy'       => 'Learn how ' . $site_name . ' collects, uses, and protects your personal information. Read our full privacy policy.',
    'terms-and-conditions' => 'Review the terms and conditions for using the ' . $site_name . ' website and services.',
    'cookie-settings'      => 'Manage your cookie preferences and learn about the cookies used by ' . $site_name . '.',
);
$meta_description = $meta_descriptions[ $slug ] ?? 'Legal information for ' . $site_name . '.';

// Get page content — fall back to default if empty
$post_content = get_the_content();
if ( ! empty( trim( wp_strip_all_tags( $post_content ) ) ) ) {
    $content = apply_filters( 'the_content', $post_content );
} else {
    $slug    = get_post_field( 'post_name', get_the_ID() );
    $content = byrde_get_default_legal_content( $slug );
    $content = do_shortcode( wpautop( $content ) );
}
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo( 'charset' ); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="<?php echo esc_attr( $meta_description ); ?>">
    <?php wp_head(); ?>
    <style>
        /* ===== Legal Page Base ===== */
        *,*::before,*::after{box-sizing:border-box}
        body.byrde-legal{margin:0;padding:0;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}

        /* ===== Header ===== */
        .byrde-lp-header{background:#171717;border-bottom:1px solid #262626}
        .byrde-lp-header-inner{max-width:80rem;margin:0 auto;padding:1rem 1.5rem;display:flex;align-items:center;justify-content:space-between;gap:1rem}
        .byrde-lp-logo{display:flex;align-items:center;text-decoration:none}
        .byrde-lp-logo img{height:3rem;width:auto;display:block}
        .byrde-lp-cta{display:inline-flex;align-items:center;gap:.5rem;padding:.5rem 1.25rem;background:<?php echo esc_attr( $brand_primary ); ?>;color:#fff;text-decoration:none;border-radius:8px;font-size:.875rem;font-weight:600;transition:filter .15s;font-family:'DM Sans',-apple-system,BlinkMacSystemFont,sans-serif}
        .byrde-lp-cta:hover{filter:brightness(0.85);color:#fff}
        .byrde-lp-cta svg{width:16px;height:16px;flex-shrink:0}

        /* ===== Content ===== */
        .byrde-lp-content{background:#ffffff;min-height:60vh}
        .byrde-lp-content-inner{max-width:48rem;margin:0 auto;padding:3rem 1.5rem 4rem;font-family:'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#27272a;line-height:1.75;font-size:.9375rem}
        @media(min-width:640px){.byrde-lp-content-inner{padding:4rem 2rem 5rem}}

        .byrde-lp-content-inner h1{font-family:'Outfit','DM Sans',sans-serif;font-size:2rem;font-weight:700;color:#09090b;margin:0 0 .5rem;line-height:1.25}
        @media(min-width:640px){.byrde-lp-content-inner h1{font-size:2.5rem}}

        .byrde-lp-updated{font-size:.8125rem;color:#71717a;margin:0 0 2.5rem;padding-bottom:1.5rem;border-bottom:1px solid #e4e4e7}

        .byrde-lp-content-inner h2{font-family:'Outfit','DM Sans',sans-serif;font-size:1.375rem;font-weight:700;color:#18181b;margin:2.5rem 0 .75rem;line-height:1.3}
        .byrde-lp-content-inner h3{font-size:1.0625rem;font-weight:600;color:#27272a;margin:1.75rem 0 .5rem}

        .byrde-lp-content-inner p{margin:0 0 1rem}
        .byrde-lp-content-inner ul{margin:0 0 1rem;padding-left:1.5rem}
        .byrde-lp-content-inner li{margin-bottom:.375rem}

        .byrde-lp-content-inner a{color:<?php echo esc_attr( $brand_primary ); ?>;text-decoration:underline;text-underline-offset:2px}
        .byrde-lp-content-inner a:hover{filter:brightness(0.8)}

        .byrde-lp-content-inner strong{color:#18181b;font-weight:600}

        /* ===== Footer ===== */
        .byrde-lp-footer{background:#171717;border-top:1px solid #262626}
        .byrde-lp-footer-inner{max-width:80rem;margin:0 auto;padding:1.5rem;display:flex;flex-direction:column;align-items:center;gap:.75rem;text-align:center}
        @media(min-width:640px){.byrde-lp-footer-inner{flex-direction:row;justify-content:space-between;text-align:left}}
        .byrde-lp-footer-copy{font-size:.8125rem;color:#52525b;margin:0;font-family:'DM Sans',sans-serif}
        .byrde-lp-footer-links{display:flex;flex-wrap:wrap;justify-content:center;gap:1.25rem}
        .byrde-lp-footer-links a{font-size:.8125rem;color:#71717a;text-decoration:none;font-family:'DM Sans',sans-serif;transition:color .15s}
        .byrde-lp-footer-links a:hover{color:#a1a1aa}
    </style>
</head>
<body <?php body_class( 'byrde-legal' ); ?>>
<?php wp_body_open(); ?>

    <!-- Header -->
    <header class="byrde-lp-header">
        <div class="byrde-lp-header-inner">
            <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="byrde-lp-logo">
                <?php if ( ! empty( $logo['url'] ) ) : ?>
                    <img
                        src="<?php echo esc_url( $logo['url'] ); ?>"
                        alt="<?php echo esc_attr( $logo['alt'] ); ?>"
                        width="64" height="48"
                    />
                <?php else : ?>
                    <span style="color:#f4f4f5;font-weight:700;font-size:1.125rem;font-family:'Outfit',sans-serif">
                        <?php echo esc_html( $site_name ); ?>
                    </span>
                <?php endif; ?>
            </a>
            <?php if ( $phone ) : ?>
                <a href="tel:<?php echo esc_attr( $phone_raw ); ?>" class="byrde-lp-cta">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    <?php echo esc_html( $phone ); ?>
                </a>
            <?php endif; ?>
        </div>
    </header>

    <!-- Content -->
    <main class="byrde-lp-content">
        <div class="byrde-lp-content-inner">
            <h1><?php the_title(); ?></h1>
            <p class="byrde-lp-updated">Last updated: <?php echo esc_html( get_the_modified_date( 'F j, Y' ) ); ?></p>
            <?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Content is from post_content or pre-escaped default ?>
        </div>
    </main>

    <!-- Footer -->
    <footer class="byrde-lp-footer">
        <div class="byrde-lp-footer-inner">
            <p class="byrde-lp-footer-copy">
                <?php
                echo esc_html(
                    $copyright
                        ? $copyright
                        : '© ' . gmdate( 'Y' ) . ' ' . $site_name . '. All rights reserved.'
                );
                ?>
            </p>
            <nav class="byrde-lp-footer-links">
                <a href="<?php echo esc_url( home_url( '/' ) ); ?>">Home</a>
                <a href="<?php echo esc_url( $settings['privacy_policy_url'] ?? home_url( '/privacy-policy' ) ); ?>">Privacy Policy</a>
                <a href="<?php echo esc_url( $settings['terms_url'] ?? home_url( '/terms-and-conditions' ) ); ?>">Terms &amp; Conditions</a>
                <a href="<?php echo esc_url( $settings['cookie_settings_url'] ?? home_url( '/cookie-settings' ) ); ?>">Cookie Settings</a>
            </nav>
        </div>
    </footer>

<?php wp_footer(); ?>
</body>
</html>
