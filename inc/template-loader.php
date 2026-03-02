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
 * Check if an enqueued asset belongs to WordPress core.
 *
 * Inspects the registered `src` URL — if it points to wp-includes/
 * or wp-admin/ it's a core asset (jQuery, media library, etc.).
 *
 * @param string                $handle    Asset handle name.
 * @param WP_Dependencies|null  $registry  $wp_styles or $wp_scripts.
 * @return bool True if the asset is from WordPress core.
 */
function byrde_is_core_asset( string $handle, $registry ): bool {
    if ( ! $registry || ! isset( $registry->registered[ $handle ] ) ) {
        return false;
    }

    $src = $registry->registered[ $handle ]->src;
    if ( empty( $src ) ) {
        // Assets with no src are virtual/alias handles (e.g. jquery) — keep them.
        return true;
    }

    // Core assets live under /wp-includes/ or /wp-admin/
    return (bool) ( strpos( $src, '/wp-includes/' ) !== false || strpos( $src, '/wp-admin/' ) !== false );
}

/**
 * Isolate Byrde assets on landing pages.
 *
 * Dequeues everything that is NOT:
 * - A Byrde asset (byrde-main)
 * - WordPress admin bar / dashicons
 * - WordPress core (wp-includes/) — only kept in editor preview for media library
 *
 * This prevents theme CSS, other plugin CSS/JS, and third-party injections
 * from leaking into landing pages.
 */
function byrde_isolate_assets(): void {
    if ( ! is_singular( BYRDE_CPT_LANDING ) ) {
        return;
    }

    // phpcs:ignore WordPress.Security.NonceVerification.Recommended
    $is_preview = ! empty( $_GET['byrde_preview'] );

    global $wp_styles, $wp_scripts;

    // Handles we always keep
    $allowed_styles  = array( 'byrde-main', 'admin-bar', 'dashicons' );
    $allowed_scripts = array( 'byrde-main', 'admin-bar' );

    if ( $wp_styles ) {
        foreach ( $wp_styles->queue as $handle ) {
            if ( in_array( $handle, $allowed_styles, true ) ) {
                continue;
            }
            // In editor preview, keep WP core styles (media library UI)
            if ( $is_preview && byrde_is_core_asset( $handle, $wp_styles ) ) {
                continue;
            }
            wp_dequeue_style( $handle );
        }
    }

    if ( $wp_scripts ) {
        foreach ( $wp_scripts->queue as $handle ) {
            if ( in_array( $handle, $allowed_scripts, true ) ) {
                continue;
            }
            // In editor preview, keep WP core scripts (media library, jQuery)
            if ( $is_preview && byrde_is_core_asset( $handle, $wp_scripts ) ) {
                continue;
            }
            wp_dequeue_script( $handle );
        }
    }
}
add_action( 'wp_enqueue_scripts', 'byrde_isolate_assets', 999 );
