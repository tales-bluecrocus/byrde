<?php
/**
 * Template Loader
 *
 * Overrides WordPress template hierarchy for byrde_landing CPT.
 * Serves a standalone HTML document that bypasses the active theme.
 *
 * @package Byrde
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Load custom templates for byrde_landing posts.
 *
 * @param string $template The path of the template to include.
 * @return string Modified template path.
 */
function byrde_template_include( string $template ): string {
    if ( ! is_singular( BYRDE_CPT_LANDING ) ) {
        return $template;
    }

    $page_type = get_post_meta( get_the_ID(), '_byrde_page_type', true );

    if ( 'legal' === $page_type ) {
        return BYRDE_PLUGIN_DIR . 'templates/template-legal.php';
    }

    return BYRDE_PLUGIN_DIR . 'templates/template-landing.php';
}
add_filter( 'template_include', 'byrde_template_include', 99 );

/**
 * Isolate Byrde assets on landing pages.
 *
 * Dequeue all theme styles and scripts so only Byrde assets render.
 * Runs at very late priority to catch everything.
 */
function byrde_isolate_assets(): void {
    if ( ! is_singular( BYRDE_CPT_LANDING ) ) {
        return;
    }

    // In editor preview mode, WordPress media library and other admin
    // scripts are needed — skip isolation entirely.
    // phpcs:ignore WordPress.Security.NonceVerification.Recommended
    if ( ! empty( $_GET['byrde_preview'] ) ) {
        return;
    }

    global $wp_styles, $wp_scripts;

    // Styles we must keep
    $allowed_styles = array( 'byrde-main', 'admin-bar', 'dashicons' );

    // Scripts we must keep
    $allowed_scripts = array( 'byrde-main', 'admin-bar' );

    if ( $wp_styles ) {
        foreach ( $wp_styles->queue as $handle ) {
            if ( ! in_array( $handle, $allowed_styles, true ) ) {
                wp_dequeue_style( $handle );
            }
        }
    }

    if ( $wp_scripts ) {
        foreach ( $wp_scripts->queue as $handle ) {
            if ( ! in_array( $handle, $allowed_scripts, true ) ) {
                wp_dequeue_script( $handle );
            }
        }
    }
}
add_action( 'wp_enqueue_scripts', 'byrde_isolate_assets', 999 );
