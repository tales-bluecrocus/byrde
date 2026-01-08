<?php

// Enqueue theme assets
function enqueue_theme_assets()
{
    // Main CSS
    if (file_exists(get_template_directory() . '/dist/style.min.css')) {
        wp_enqueue_style(
            'bryde-styles',
            get_template_directory_uri() . '/dist/style.min.css',
            [],
            time(),
        );
    }

    // Main JS
    if (file_exists(get_template_directory() . '/dist/main.min.js')) {
        wp_enqueue_script(
            'bryde-scripts',
            get_template_directory_uri() . '/dist/main.min.js',
            [],
            time(),
            true,
        );
    }
}
add_action('wp_enqueue_scripts', 'enqueue_theme_assets');
