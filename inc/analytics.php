<?php
/**
 * Analytics Integration
 *
 * Injects GA4, GTM, and Facebook Pixel scripts based on Theme Settings.
 *
 * @package LakeCity
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Inject Google Analytics 4 (gtag.js)
 */
function lakecity_inject_ga4(): void {
    $settings = lakecity_get_all_settings();
    $ga_id    = $settings['ga_measurement_id'] ?? '';

    if ( empty( $ga_id ) ) {
        return;
    }

    // Don't track in preview mode or admin
    if ( is_admin() || isset( $_GET['lakecity_preview'] ) ) {
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
add_action( 'wp_head', 'lakecity_inject_ga4', 1 );

/**
 * Inject Google Tag Manager (head)
 */
function lakecity_inject_gtm_head(): void {
    $settings = lakecity_get_all_settings();
    $gtm_id   = $settings['gtm_container_id'] ?? '';
    if ( empty( $gtm_id ) ) {
        return;
    }

    // Don't track in preview mode or admin
    if ( is_admin() || isset( $_GET['lakecity_preview'] ) ) {
        return;
    }
    ?>
    <!-- Google Tag Manager -->
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','<?php echo esc_js( $gtm_id ); ?>');</script>
    <!-- End Google Tag Manager -->
    <?php
}
add_action( 'wp_head', 'lakecity_inject_gtm_head', 1 );

/**
 * Inject Google Tag Manager (body - noscript fallback)
 */
function lakecity_inject_gtm_body(): void {
    $settings = lakecity_get_all_settings();
    $gtm_id   = $settings['gtm_container_id'] ?? '';
    if ( empty( $gtm_id ) ) {
        return;
    }

    // Don't track in preview mode or admin
    if ( is_admin() || isset( $_GET['lakecity_preview'] ) ) {
        return;
    }
    ?>
    <!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=<?php echo esc_attr( $gtm_id ); ?>"
    height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <!-- End Google Tag Manager (noscript) -->
    <?php
}
add_action( 'wp_body_open', 'lakecity_inject_gtm_body', 1 );

/**
 * Inject Facebook/Meta Pixel
 */
function lakecity_inject_fb_pixel(): void {
    $settings    = lakecity_get_all_settings();
    $fb_pixel_id = $settings['fb_pixel_id'] ?? '';
    if ( empty( $fb_pixel_id ) ) {
        return;
    }

    // Don't track in preview mode or admin
    if ( is_admin() || isset( $_GET['lakecity_preview'] ) ) {
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
add_action( 'wp_head', 'lakecity_inject_fb_pixel', 2 );

/**
 * Pass analytics settings to React app
 */
function lakecity_analytics_localize_script(): void {
    $settings = lakecity_get_all_settings();

    $analytics_settings = array(
        'ga_measurement_id' => $settings['ga_measurement_id'] ?? '',
        'gtm_container_id'  => $settings['gtm_container_id'] ?? '',
        'fb_pixel_id'       => $settings['fb_pixel_id'] ?? '',
    );

    // Only include non-empty values
    $analytics_settings = array_filter( $analytics_settings );

    if ( ! empty( $analytics_settings ) ) {
        wp_localize_script( 'lakecity-app', 'lakecityAnalytics', $analytics_settings );
    }
}
add_action( 'wp_enqueue_scripts', 'lakecity_analytics_localize_script', 20 );
