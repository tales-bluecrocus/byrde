<?php

namespace Byrde\API;

use Byrde\Core\Constants;
use Byrde\Security\RateLimiter;
use Byrde\Security\Validators;

/**
 * REST API for Page Content.
 *
 * Handles GET/PUT endpoints for section content stored in post meta,
 * and injects window.byrdeContent on public pages.
 */
class ContentEndpoints {

    /**
     * Hook into WordPress.
     */
    public function register(): void {
        add_action( 'wp_head', [ $this, 'inject_content' ], 1 );
        add_action( 'rest_api_init', [ $this, 'register_routes' ] );
    }

    /**
     * Decode HTML entities in stored content.
     *
     * Older saves used sanitize_textarea_field which HTML-encodes & -> &amp;.
     * Since content goes to JSON context (not HTML), decode entities on output.
     *
     * @param mixed $data Content data (array or scalar).
     * @return mixed Decoded content.
     */
    private function decode_entities( mixed $data ): mixed {
        if ( is_array( $data ) ) {
            $result = [];
            foreach ( $data as $k => $v ) {
                $result[ $k ] = $this->decode_entities( $v );
            }
            return $result;
        }

        if ( is_string( $data ) ) {
            return wp_specialchars_decode( $data, ENT_QUOTES );
        }

        return $data;
    }

    /**
     * Inject content into public pages (not editor preview).
     */
    public function inject_content(): void {
        // Skip if in editor preview mode (React will fetch via API).
        // phpcs:ignore WordPress.Security.NonceVerification.Recommended
        if ( ! empty( $_GET[ Constants::QUERY_PREVIEW ] ) ) {
            return;
        }

        // Only on byrde_landing pages.
        if ( ! is_singular( Constants::CPT_LANDING ) ) {
            return;
        }

        $page_id = get_the_ID();
        if ( ! $page_id ) {
            return;
        }

        // Get content (stored as serialized array by WordPress).
        $content = get_post_meta( $page_id, Constants::META_CONTENT, true );

        ?>
        <script>
            window.byrdeContent = <?php echo wp_json_encode( $content ? $this->decode_entities( $content ) : null ); ?>;
        </script>
        <?php
    }

    /**
     * Register REST API routes.
     */
    public function register_routes(): void {
        // Save content.
        register_rest_route( Constants::REST_NAMESPACE, '/pages/(?P<id>\d+)/content', [
            'methods'             => 'PUT',
            'callback'            => [ $this, 'save_content' ],
            'permission_callback' => [ $this, 'check_edit_permission' ],
        ] );

        // Get content.
        register_rest_route( Constants::REST_NAMESPACE, '/pages/(?P<id>\d+)/content', [
            'methods'             => 'GET',
            'callback'            => [ $this, 'get_content' ],
            'permission_callback' => [ $this, 'check_edit_permission' ],
        ] );
    }

    /**
     * PUT /pages/{id}/content — save section content.
     */
    public function save_content( \WP_REST_Request $request ): \WP_REST_Response|\WP_Error {
        // Rate limit: 10 saves per minute.
        if ( ! RateLimiter::check( 'save_content', Constants::RATE_LIMIT_SAVE, Constants::RATE_LIMIT_WINDOW ) ) {
            return new \WP_Error(
                'rate_limit_exceeded',
                'Too many save requests. Please try again in a moment.',
                [ 'status' => 429 ]
            );
        }

        $page_id = (int) $request->get_param( 'id' );
        $content = $request->get_json_params();

        if ( empty( $content ) ) {
            return new \WP_Error( 'empty_content', 'No content provided', [ 'status' => 400 ] );
        }

        // Validate content structure.
        $errors = Validators::validate_content( $content );
        if ( ! empty( $errors ) ) {
            return new \WP_Error(
                'validation_failed',
                implode( ', ', $errors ),
                [ 'status' => 400 ]
            );
        }

        // Sanitize content.
        $sanitized = Validators::sanitize_content( $content );

        // Save as serialized array (WordPress handles this better than raw JSON).
        // Note: update_post_meta returns false if value unchanged, which is OK.
        $result = update_post_meta( $page_id, Constants::META_CONTENT, $sanitized );

        // CRITICAL: Clear post meta cache to ensure fresh data on next load.
        wp_cache_delete( $page_id, 'post_meta' );
        clean_post_cache( $page_id );

        // Verify save by reading back (bypassing cache).
        $saved_content = get_post_meta( $page_id, Constants::META_CONTENT, true );

        if ( empty( $saved_content ) && ! empty( $sanitized ) ) {
            return new \WP_Error( 'save_failed', 'Failed to save content', [ 'status' => 500 ] );
        }

        return rest_ensure_response( [
            'success' => true,
            'content' => $sanitized,
        ] );
    }

    /**
     * GET /pages/{id}/content — retrieve section content.
     */
    public function get_content( \WP_REST_Request $request ): \WP_REST_Response {
        $page_id = (int) $request->get_param( 'id' );
        $content = get_post_meta( $page_id, Constants::META_CONTENT, true );

        return new \WP_REST_Response( [
            'success' => true,
            'content' => $content ? $this->decode_entities( $content ) : null,
        ], 200 );
    }

    /**
     * Permission callback: user must be able to edit the post.
     */
    public function check_edit_permission( \WP_REST_Request $request ): bool {
        return current_user_can( 'edit_post', $request->get_param( 'id' ) );
    }
}
