<?php
/**
 * Analytics Integration
 *
 * Injects GA4 and Facebook Pixel scripts based on Theme Settings.
 *
 * @package Byrde
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Inject Google Analytics 4 (gtag.js)
 */
function byrde_inject_ga4(): void {
    $settings = byrde_get_all_settings();
    $ga_id    = $settings['ga_measurement_id'] ?? '';

    if ( empty( $ga_id ) ) {
        return;
    }

    // Don't track in preview mode or admin
    if ( is_admin() || isset( $_GET['byrde_preview'] ) ) {
        return;
    }
    ?>
    <!-- Google Analytics 4 -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=<?php echo esc_attr( $ga_id ); ?>"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '<?php echo esc_js( $ga_id ); ?>', {
            'send_page_view': true,
            'anonymize_ip': true
        });
        window.GA_MEASUREMENT_ID = '<?php echo esc_js( $ga_id ); ?>';
    </script>
    <?php
}
add_action( 'wp_head', 'byrde_inject_ga4', 1 );

/**
 * Inject Facebook/Meta Pixel
 */
function byrde_inject_fb_pixel(): void {
    $settings    = byrde_get_all_settings();
    $fb_pixel_id = $settings['fb_pixel_id'] ?? '';
    if ( empty( $fb_pixel_id ) ) {
        return;
    }

    // Don't track in preview mode or admin
    if ( is_admin() || isset( $_GET['byrde_preview'] ) ) {
        return;
    }
    ?>
    <!-- Meta Pixel Code -->
    <script>
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '<?php echo esc_js( $fb_pixel_id ); ?>');
    fbq('track', 'PageView');
    </script>
    <noscript><img height="1" width="1" style="display:none"
    src="https://www.facebook.com/tr?id=<?php echo esc_attr( $fb_pixel_id ); ?>&ev=PageView&noscript=1"
    /></noscript>
    <!-- End Meta Pixel Code -->
    <?php
}
add_action( 'wp_head', 'byrde_inject_fb_pixel', 2 );

/**
 * Pass analytics settings to React app
 */
function byrde_analytics_localize_script(): void {
    $settings = byrde_get_all_settings();

    $analytics_settings = array(
        'ga_measurement_id'     => $settings['ga_measurement_id'] ?? '',
        'fb_pixel_id'           => $settings['fb_pixel_id'] ?? '',
        'gads_conversion_label' => $settings['gads_conversion_label'] ?? '',
    );

    // Only include non-empty values
    $analytics_settings = array_filter( $analytics_settings );

    if ( ! empty( $analytics_settings ) ) {
        wp_localize_script( 'byrde-app', 'byrdeAnalytics', $analytics_settings );
    }
}
add_action( 'wp_enqueue_scripts', 'byrde_analytics_localize_script', 20 );
