<?php

// Enqueue theme assets
function enqueue_theme_assets()
{
    // Get theme version for cache busting
    // In development: use time() for instant updates
    // In production: use theme version from style.css
    $theme = wp_get_theme();
    $version = (wp_get_environment_type() === 'development')
        ? time()
        : $theme->get('Version');

    // Main CSS
    if (file_exists(get_template_directory() . '/dist/style.min.css')) {
        wp_enqueue_style(
            'bryde-styles',
            get_template_directory_uri() . '/dist/style.min.css',
            [],
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
            ]
        );
    }
}
add_action('wp_enqueue_scripts', 'enqueue_theme_assets');
