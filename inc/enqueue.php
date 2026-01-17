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

    // Google Fonts - Lato (Headings) & Nunito (Body)
    wp_enqueue_style(
        'byrde-google-fonts',
        'https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&family=Nunito:wght@300;400;500;600;700&display=swap',
        [],
        null,
    );

    // Material Symbols - For star ratings
    wp_enqueue_style(
        'byrde-material-symbols',
        'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=star',
        [],
        null,
    );

    // Phosphor Icons - Local files for better performance
    wp_enqueue_style(
        'byrde-phosphor-icons',
        get_template_directory_uri() . '/assets/fonts/phosphor-icons/regular/style.css',
        [],
        $version,
    );

    wp_enqueue_style(
        'byrde-phosphor-icons-bold',
        get_template_directory_uri() . '/assets/fonts/phosphor-icons/bold/style.css',
        [],
        $version,
    );

    wp_enqueue_style(
        'byrde-phosphor-icons-fill',
        get_template_directory_uri() . '/assets/fonts/phosphor-icons/fill/style.css',
        [],
        $version,
    );

    // Main CSS
    if (file_exists(get_template_directory() . '/dist/style.min.css')) {
        wp_enqueue_style(
            'bryde-styles',
            get_template_directory_uri() . '/dist/style.min.css',
            ['byrde-google-fonts', 'byrde-phosphor-icons', 'byrde-phosphor-icons-bold', 'byrde-phosphor-icons-fill'],
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
