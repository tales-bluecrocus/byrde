<?php

// Suporte a menus e featured images
add_action(
    'after_setup_theme',
    function () {
        add_theme_support('post-thumbnails'); // Enables featured images
        add_theme_support('title-tag'); // Enables dynamic title tag support
        add_theme_support('align-wide'); // Enables wide and full alignment support
        add_theme_support('title-tag');
        add_theme_support('html5', ['search-form', 'comment-form', 'comment-list', 'gallery', 'caption']); // Enables HTML5 support for various elements
        add_theme_support('menus');
        register_nav_menus(
            [
                'primary' => __('Menu Principal', 'theme-olly-olly'),
                'footer'  => __('Menu do Rodapé', 'theme-olly-olly'),
                'footer_bottom' => __('Menu Rodapé Inferior', 'theme-olly-olly'),
            ],
        );
    },
);

// Allows SVG file uploads
function allow_svg_upload($mimes)
{
    $mimes['svg'] = 'image/svg+xml';

    return $mimes;
}
add_filter('upload_mimes', 'allow_svg_upload');

// Ensures SVG files are recognized correctly
function check_svg_filetype($file, $filename, $mimes)
{
    if (strtolower(pathinfo($filename, PATHINFO_EXTENSION)) === 'svg') {
        $file['type'] = 'image/svg+xml';
    }

    return $file;
}
add_filter('wp_check_filetype_and_ext', 'check_svg_filetype', 10, 3);

// Allow WebP image upload
function allow_webp_upload($mimes)
{
    $mimes['webp'] = 'image/webp';

    return $mimes;
}
add_filter('upload_mimes', 'allow_webp_upload');

// Ensure WebP files are recognized correctly
function check_webp_filetype($file, $filename, $mimes)
{
    if (strtolower(pathinfo($filename, PATHINFO_EXTENSION)) === 'webp') {
        $file['type'] = 'image/webp';
    }

    return $file;
}
add_filter('wp_check_filetype_and_ext', 'check_webp_filetype', 10, 3);

function allow_json_upload($mimes)
{
    $mimes['json'] = 'application/json';

    return $mimes;
}
add_filter('upload_mimes', 'allow_json_upload');

function check_json_filetype($data, $file, $filename, $mimes)
{
    if (strtolower(pathinfo($filename, PATHINFO_EXTENSION)) === 'json') {
        $data['ext'] = 'json';
        $data['type'] = 'application/json';
    }

    return $data;
}
add_filter('wp_check_filetype_and_ext', 'check_json_filetype', 10, 4);

// Remove emoji scripts and styles
add_action('init', function () {
    remove_action('wp_head', 'print_emoji_detection_script', 7);
    remove_action('wp_print_styles', 'print_emoji_styles');
    remove_action('admin_print_scripts', 'print_emoji_detection_script');
    remove_action('admin_print_styles', 'print_emoji_styles');
    remove_filter('the_content_feed', 'wp_staticize_emoji');
    remove_filter('comment_text_rss', 'wp_staticize_emoji');
    remove_filter('wp_mail', 'wp_staticize_emoji_for_email');
});
