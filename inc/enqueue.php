<?php

// Enqueue theme assets
function enqueue_theme_assets()
{
    // Get theme version for cache busting
    $theme = wp_get_theme();
    $version = $theme->get('Version');

    // In development, use time() for instant cache busting
    if (defined('WP_DEBUG') && WP_DEBUG) {
        $version = time();
    }

    // Google Fonts - Urbanist
    wp_enqueue_style(
        'byrde-google-fonts',
        'https://fonts.googleapis.com/css2?family=Urbanist:ital,wght@0,100..900;1,100..900&display=swap',
        [],
        null,
    );

    // Main CSS
    if (file_exists(get_template_directory() . '/dist/style.min.css')) {
        wp_enqueue_style(
            'bryde-styles',
            get_template_directory_uri() . '/dist/style.min.css',
            ['byrde-google-fonts'],
            $version,
        );
    }

    // Main JS
    if (file_exists(get_template_directory() . '/dist/main.min.js')) {
        wp_enqueue_script(
            'bryde-scripts',
            get_template_directory_uri() . '/dist/main.min.js',
            [],
            $version,
            true,
        );

        // Pass tracking settings to JavaScript
        wp_localize_script(
            'bryde-scripts',
            'byrdeTracking',
            [
                'gtmId' => get_option('byrde_gtm_id', ''),
                'gaId' => get_option('byrde_ga_id', ''),
                'googleAdsId' => get_option('byrde_google_ads_id', ''),
                'metaPixelId' => get_option('byrde_meta_pixel_id', ''),
                'nonce' => wp_create_nonce('byrde_tracking_nonce'),
            ],
        );
    }
}
add_action('wp_enqueue_scripts', 'enqueue_theme_assets');

// Add preconnect for Google Fonts
function byrde_add_resource_hints($urls, $relation_type)
{
    if ('preconnect' === $relation_type) {
        $urls[] = [
            'href' => 'https://fonts.googleapis.com',
            'crossorigin' => 'anonymous',
        ];
        $urls[] = [
            'href' => 'https://fonts.gstatic.com',
            'crossorigin' => 'anonymous',
        ];
    }

    return $urls;
}
add_filter('wp_resource_hints', 'byrde_add_resource_hints', 10, 2);
