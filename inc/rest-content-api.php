<?php
/**
 * REST API for Page Content
 *
 * @package LakeCity
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Inject content into public pages (not editor preview)
 */
add_action( 'wp_head', function() {
    // Skip if in editor preview mode (React will fetch via API)
    // phpcs:ignore WordPress.Security.NonceVerification.Recommended
    if ( ! empty( $_GET['lakecity_preview'] ) ) {
        return;
    }

    // Only on singular pages
    if ( ! is_singular( 'page' ) ) {
        return;
    }

    $page_id = get_the_ID();
    if ( ! $page_id ) {
        return;
    }

    // Get content (stored as serialized array by WordPress)
    $content = get_post_meta( $page_id, '_lakecity_content', true );

    ?>
    <script>
        window.lakecityContent = <?php echo wp_json_encode( $content ?: null ); ?>;
    </script>
    <?php
}, 1 );

/**
 * Register REST API routes
 */
add_action( 'rest_api_init', function() {
    // Save content
    register_rest_route( 'lakecity/v1', '/pages/(?P<id>\d+)/content', array(
        'methods'             => 'PUT',
        'callback'            => function( WP_REST_Request $request ) {
            // Rate limit: 10 saves per minute
            if ( ! lakecity_check_rate_limit( 'save_content', 10, 60 ) ) {
                return new WP_Error(
                    'rate_limit_exceeded',
                    'Too many save requests. Please try again in a moment.',
                    array( 'status' => 429 )
                );
            }

            $page_id = (int) $request->get_param( 'id' );
            $content = $request->get_json_params();

            // Debug logging
            error_log( '[LakeCity Content Save] Page ID: ' . $page_id );
            error_log( '[LakeCity Content Save] Content received: ' . print_r( $content, true ) );

            if ( empty( $content ) ) {
                return new WP_Error( 'empty_content', 'No content provided', array( 'status' => 400 ) );
            }

            // Validate content structure
            $errors = lakecity_validate_content( $content );
            if ( ! empty( $errors ) ) {
                error_log( '[LakeCity Content Save] Validation errors: ' . print_r( $errors, true ) );
                return new WP_Error(
                    'validation_failed',
                    implode( ', ', $errors ),
                    array( 'status' => 400 )
                );
            }

            // Sanitize content
            $sanitized = lakecity_sanitize_content( $content );
            error_log( '[LakeCity Content Save] Sanitized: ' . print_r( $sanitized, true ) );

            // Save as serialized array (WordPress handles this better than raw JSON)
            // Note: update_post_meta returns false if value unchanged, which is OK
            $result = update_post_meta( $page_id, '_lakecity_content', $sanitized );
            error_log( '[LakeCity Content Save] update_post_meta result: ' . var_export( $result, true ) );

            // CRITICAL: Clear post meta cache to ensure fresh data on next load
            wp_cache_delete( $page_id, 'post_meta' );
            clean_post_cache( $page_id );

            // Verify save by reading back (bypassing cache)
            $saved_content = get_post_meta( $page_id, '_lakecity_content', true );
            error_log( '[LakeCity Content Save] Saved content: ' . print_r( $saved_content, true ) );

            if ( empty( $saved_content ) && ! empty( $sanitized ) ) {
                return new WP_Error( 'save_failed', 'Failed to save content', array( 'status' => 500 ) );
            }

            return rest_ensure_response( array(
                'success' => true,
                'content' => $sanitized,
            ) );
        },
        'permission_callback' => function( WP_REST_Request $request ) {
            return current_user_can( 'edit_post', $request->get_param( 'id' ) );
        },
    ) );

    // Get content
    register_rest_route( 'lakecity/v1', '/pages/(?P<id>\d+)/content', array(
        'methods'             => 'GET',
        'callback'            => function( WP_REST_Request $request ) {
            $page_id = (int) $request->get_param( 'id' );
            $content = get_post_meta( $page_id, '_lakecity_content', true );

            return new WP_REST_Response( array(
                'success' => true,
                'content' => $content ?: null,
            ), 200 );
        },
        'permission_callback' => function( WP_REST_Request $request ) {
            return current_user_can( 'edit_post', $request->get_param( 'id' ) );
        },
    ) );
} );
