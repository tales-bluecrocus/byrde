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

    $src = $registry->registered[ $handle ]->src ?? '';
    if ( '' === $src ) {
        // Assets with no src are virtual/alias handles (e.g. jquery) — keep them.
        return true;
    }

    // Core assets live under /wp-includes/ or /wp-admin/
    return str_contains( $src, '/wp-includes/' ) || str_contains( $src, '/wp-admin/' );
}

/**
 * Check if a handle is allowed on Byrde landing pages.
 *
 * @param string $handle     Asset handle name.
 * @param string $type       'style' or 'script'.
 * @param bool   $is_preview Whether this is an editor preview.
 * @return bool True if the handle should be kept.
 */
function byrde_is_allowed_handle( string $handle, string $type, bool $is_preview ): bool {
    $allowed = array( 'byrde-main', 'admin-bar' );
    if ( 'style' === $type ) {
        $allowed[] = 'dashicons';
    }

    if ( in_array( $handle, $allowed, true ) ) {
        return true;
    }

    // In editor preview, keep WP core assets (media library, jQuery)
    if ( $is_preview ) {
        $registry = ( 'style' === $type ) ? $GLOBALS['wp_styles'] : $GLOBALS['wp_scripts'];
        return byrde_is_core_asset( $handle, $registry );
    }

    return false;
}

/**
 * Isolate Byrde assets on landing pages.
 *
 * Two layers of protection:
 * 1. Dequeue everything not allowed during wp_enqueue_scripts (priority 999)
 * 2. Block any surviving tags via style_loader_tag / script_loader_tag filters
 *
 * This prevents theme CSS, other plugin CSS/JS, and third-party injections
 * from leaking into landing pages — even when enqueued after priority 999.
 */
function byrde_isolate_assets(): void {
    if ( ! is_singular( BYRDE_CPT_LANDING ) ) {
        return;
    }

    // phpcs:ignore WordPress.Security.NonceVerification.Recommended
    $is_preview = ! empty( $_GET['byrde_preview'] );

    global $wp_styles, $wp_scripts;

    // Layer 1: dequeue non-allowed assets
    if ( $wp_styles ) {
        foreach ( $wp_styles->queue as $handle ) {
            if ( ! byrde_is_allowed_handle( $handle, 'style', $is_preview ) ) {
                wp_dequeue_style( $handle );
            }
        }
    }

    if ( $wp_scripts ) {
        foreach ( $wp_scripts->queue as $handle ) {
            if ( ! byrde_is_allowed_handle( $handle, 'script', $is_preview ) ) {
                wp_dequeue_script( $handle );
            }
        }
    }

    // Layer 2: tag-level filters catch anything enqueued after this hook
    add_filter( 'style_loader_tag', 'byrde_filter_style_tag', 999, 2 );
    add_filter( 'script_loader_tag', 'byrde_filter_script_tag', 999, 2 );
}
add_action( 'wp_enqueue_scripts', 'byrde_isolate_assets', 999 );

/**
 * Block non-allowed stylesheet tags from rendering.
 *
 * @param string $tag    Full <link> tag.
 * @param string $handle Asset handle.
 * @return string Tag or empty string.
 */
function byrde_filter_style_tag( string $tag, string $handle ): string {
    // phpcs:ignore WordPress.Security.NonceVerification.Recommended
    $is_preview = ! empty( $_GET['byrde_preview'] );

    if ( byrde_is_allowed_handle( $handle, 'style', $is_preview ) ) {
        return $tag;
    }
    return '';
}

/**
 * Block non-allowed script tags from rendering.
 *
 * @param string $tag    Full <script> tag.
 * @param string $handle Asset handle.
 * @return string Tag or empty string.
 */
function byrde_filter_script_tag( string $tag, string $handle ): string {
    // phpcs:ignore WordPress.Security.NonceVerification.Recommended
    $is_preview = ! empty( $_GET['byrde_preview'] );

    if ( byrde_is_allowed_handle( $handle, 'script', $is_preview ) ) {
        return $tag;
    }
    return '';
}
