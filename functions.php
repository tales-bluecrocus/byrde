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
require_once get_template_directory() . '/inc/cleanup.php';
require_once get_template_directory() . '/inc/acf-theme-settings.php';
require_once get_template_directory() . '/inc/page-theme-editor.php';
require_once get_template_directory() . '/inc/rest-content-api.php';

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
}
add_action( 'after_setup_theme', 'lakecity_setup' );
