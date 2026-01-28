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
            $page_id = (int) $request->get_param( 'id' );
            $content = $request->get_json_params();

            if ( empty( $content ) ) {
                return new WP_REST_Response( array( 'success' => false, 'message' => 'No content' ), 400 );
            }

            // Save as serialized array (WordPress handles this better than raw JSON)
            update_post_meta( $page_id, '_lakecity_content', $content );

            return new WP_REST_Response( array( 'success' => true, 'pageId' => $page_id ), 200 );
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
