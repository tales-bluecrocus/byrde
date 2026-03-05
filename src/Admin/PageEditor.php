<?php

namespace Byrde\Admin;

use Byrde\Core\Constants;
use Byrde\Security\RateLimiter;
use Byrde\Security\Validators;
use WP_Admin_Bar;
use WP_Post;
use WP_REST_Request;
use WP_REST_Response;
use WP_Error;

/**
 * Page Theme Editor
 *
 * Full-screen visual theme editor (like Elementor).
 */
class PageEditor {

    /**
     * Register hooks.
     */
    public function register(): void {
        add_action( 'admin_init', [ $this, 'maybe_render_editor' ], 1 );
        add_action( 'admin_menu', [ $this, 'register_editor_page' ] );
        add_filter( 'post_row_actions', [ $this, 'add_editor_link' ], 10, 2 );
        add_action( 'wp_head', [ $this, 'inject_admin_context' ], 1 );
        add_action( 'wp_head', [ $this, 'load_page_theme_config' ], 1 );
        add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_media_library' ] );
        add_action( 'rest_api_init', [ $this, 'register_api_routes' ] );
        add_action( 'init', [ $this, 'register_theme_meta' ] );
        add_action( 'admin_bar_menu', [ $this, 'customize_admin_bar' ], 81 );
    }

    /**
     * Intercept early to render full-screen editor (before WordPress admin UI).
     */
    public function maybe_render_editor(): void {
        if ( ! is_admin() ) {
            return;
        }

        // phpcs:ignore WordPress.Security.NonceVerification.Recommended
        if ( empty( $_GET['page'] ) || $_GET['page'] !== 'byrde-editor' ) {
            return;
        }

        // phpcs:ignore WordPress.Security.NonceVerification.Recommended
        $byrde_page_id = isset( $_GET['byrde_page_id'] ) ? absint( $_GET['byrde_page_id'] ) : 0;

        // Fallback to old parameter name for backwards compatibility
        // phpcs:ignore WordPress.Security.NonceVerification.Recommended
        if ( ! $byrde_page_id && isset( $_GET['page_id'] ) ) {
            $byrde_page_id = absint( $_GET['page_id'] );
        }

        if ( ! $byrde_page_id || ! current_user_can( 'edit_post', $byrde_page_id ) ) {
            wp_die( __( 'Invalid page or insufficient permissions.', 'byrde' ) );
        }

        $page = get_post( $byrde_page_id );
        if ( ! $page || $page->post_type !== Constants::CPT_LANDING ) {
            wp_die( __( 'Page not found.', 'byrde' ) );
        }

        $this->render_editor_page( $byrde_page_id, $page );
    }

    /**
     * Register the editor page (hidden from menu, required for URL to work).
     */
    public function register_editor_page(): void {
        add_submenu_page(
            null,
            __( 'BlueCrocus Theme Editor', 'byrde' ),
            __( 'BlueCrocus Theme Editor', 'byrde' ),
            'edit_pages',
            'byrde-editor',
            '__return_false'
        );
    }

    /**
     * Render the full-screen editor page.
     */
    private function render_editor_page( int $byrde_page_id, WP_Post $page ): void {
        $preview_url = add_query_arg( [
            Constants::QUERY_PREVIEW => '1',
            Constants::QUERY_PAGE_ID => $byrde_page_id,
        ], get_permalink( $byrde_page_id ) );

        $back_url = admin_url( 'edit.php?post_type=' . Constants::CPT_LANDING );
        $view_url = get_permalink( $byrde_page_id );

        ?>
        <!DOCTYPE html>
        <html <?php language_attributes(); ?>>
        <head>
            <meta charset="<?php bloginfo( 'charset' ); ?>">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title><?php echo esc_html( sprintf( __( 'BlueCrocus Editor: %s', 'byrde' ), $page->post_title ) ); ?></title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                html, body { height: 100%; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif; }

                .byrde-editor { display: flex; flex-direction: column; height: 100vh; background: #1e1e1e; }

                .byrde-editor__header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 16px;
                    height: 48px;
                    background: #23282d;
                    border-bottom: 1px solid #32373c;
                    flex-shrink: 0;
                }

                .byrde-editor__left { display: flex; align-items: center; gap: 16px; }
                .byrde-editor__right { display: flex; align-items: center; gap: 12px; }

                .byrde-editor__back {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    color: #a7aaad;
                    text-decoration: none;
                    font-size: 13px;
                    padding: 6px 12px;
                    border-radius: 4px;
                    transition: all 0.15s;
                }
                .byrde-editor__back:hover { background: #32373c; color: #fff; }
                .byrde-editor__back svg { width: 16px; height: 16px; }

                .byrde-editor__title {
                    color: #fff;
                    font-size: 14px;
                    font-weight: 500;
                }
                .byrde-editor__title span { color: #a7aaad; font-weight: 400; }

                .byrde-editor__btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 16px;
                    border-radius: 4px;
                    font-size: 13px;
                    font-weight: 500;
                    text-decoration: none;
                    cursor: pointer;
                    border: none;
                    transition: all 0.15s;
                }
                .byrde-editor__btn svg { width: 16px; height: 16px; }

                .byrde-editor__btn--secondary {
                    background: #32373c;
                    color: #fff;
                }
                .byrde-editor__btn--secondary:hover { background: #3c4349; }

                .byrde-editor__btn--primary {
                    background: #2271b1;
                    color: #fff;
                }
                .byrde-editor__btn--primary:hover { background: #135e96; }

                .byrde-editor__iframe-wrap {
                    flex: 1;
                    position: relative;
                    overflow: hidden;
                }

                .byrde-editor__iframe {
                    width: 100%;
                    height: 100%;
                    border: none;
                }

                .byrde-editor__status {
                    font-size: 12px;
                    color: #a7aaad;
                    padding: 4px 8px;
                    border-radius: 3px;
                    background: #32373c;
                }
                .byrde-editor__status--saved { color: #68de7c; }
                .byrde-editor__status--saving { color: #f0b849; }
            </style>
        </head>
        <body>
            <div class="byrde-editor">
                <header class="byrde-editor__header">
                    <div class="byrde-editor__left">
                        <a href="<?php echo esc_url( $back_url ); ?>" class="byrde-editor__back">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                            Exit
                        </a>
                        <div class="byrde-editor__title">
                            <?php echo esc_html( $page->post_title ); ?>
                            <span>#<?php echo esc_html( $byrde_page_id ); ?></span>
                        </div>
                    </div>
                    <div class="byrde-editor__right">
                        <span id="save-status" class="byrde-editor__status">Ready</span>
                        <a href="<?php echo esc_url( $view_url ); ?>" target="_blank" class="byrde-editor__btn byrde-editor__btn--secondary">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                            Preview
                        </a>
                    </div>
                </header>
                <div class="byrde-editor__iframe-wrap">
                    <iframe
                        id="editor-iframe"
                        class="byrde-editor__iframe"
                        src="<?php echo esc_url( $preview_url ); ?>"
                    ></iframe>
                </div>
            </div>
            <script>
                // Listen for save events from iframe
                window.addEventListener('message', function(e) {
                    if (e.origin !== window.location.origin) return;
                    if (e.data && e.data.type === 'byrde-save-status') {
                        const status = document.getElementById('save-status');
                        if (e.data.status === 'saving') {
                            status.textContent = 'Saving...';
                            status.className = 'byrde-editor__status byrde-editor__status--saving';
                        } else if (e.data.status === 'saved') {
                            status.textContent = 'Saved';
                            status.className = 'byrde-editor__status byrde-editor__status--saved';
                            setTimeout(() => {
                                status.textContent = 'Ready';
                                status.className = 'byrde-editor__status';
                            }, 2000);
                        }
                    }
                });
            </script>
        </body>
        </html>
        <?php
        exit;
    }

    /**
     * Add "Edit Theme" link to page row actions.
     */
    public function add_editor_link( array $actions, WP_Post $post ): array {
        if ( $post->post_type !== Constants::CPT_LANDING || ! current_user_can( 'edit_post', $post->ID ) ) {
            return $actions;
        }

        $editor_url = admin_url( 'admin.php?page=byrde-editor&byrde_page_id=' . $post->ID );

        $actions['byrde_editor'] = sprintf(
            '<a href="%s" style="color: #2271b1; font-weight: 500;">%s</a>',
            esc_url( $editor_url ),
            __( 'BlueCrocus Editor', 'byrde' )
        );

        return $actions;
    }

    /**
     * Inject admin context into preview iframe.
     */
    public function inject_admin_context(): void {
        // phpcs:ignore WordPress.Security.NonceVerification.Recommended
        if ( empty( $_GET[ Constants::QUERY_PREVIEW ] ) ) {
            return;
        }

        // phpcs:ignore WordPress.Security.NonceVerification.Recommended
        $byrde_page_id = isset( $_GET[ Constants::QUERY_PAGE_ID ] ) ? absint( $_GET[ Constants::QUERY_PAGE_ID ] ) : 0;

        // Fallback to old parameter name
        // phpcs:ignore WordPress.Security.NonceVerification.Recommended
        if ( ! $byrde_page_id && isset( $_GET['page_id'] ) ) {
            $byrde_page_id = absint( $_GET['page_id'] );
        }

        $is_logged_in   = is_user_logged_in();
        $can_edit_pages = current_user_can( 'edit_pages' );
        $can_edit       = false;

        if ( $is_logged_in ) {
            if ( $byrde_page_id ) {
                $can_edit = current_user_can( 'edit_post', $byrde_page_id );
            } else {
                $can_edit = $can_edit_pages;
            }
        }

        $theme_config   = $byrde_page_id ? get_post_meta( $byrde_page_id, Constants::META_THEME_CONFIG, true ) : '';
        $decoded_config = $theme_config ? json_decode( $theme_config, true ) : null;

        $admin_data = [
            'isAdmin'    => true,
            'canSave'    => $can_edit,
            'apiUrl'     => rest_url( Constants::REST_NAMESPACE ),
            'nonce'      => $can_edit ? wp_create_nonce( 'wp_rest' ) : '',
            'pageId'     => $byrde_page_id,
            'config'     => $decoded_config,
            '_debug'     => [
                'loggedIn'     => $is_logged_in,
                'canEditPages' => $can_edit_pages,
                'canEdit'      => $can_edit,
            ],
        ];
        ?>
        <script>
            window.byrdeAdmin = <?php echo wp_json_encode( $admin_data ); ?>;
            <?php if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) : ?>
            console.log('[Byrde] Admin context injected:', window.byrdeAdmin);
            <?php endif; ?>
        </script>
        <style>
            /* Hide WordPress admin bar in BlueCrocus Editor preview */
            #wpadminbar { display: none !important; }
            html { margin-top: 0 !important; }
            * html body { margin-top: 0 !important; }
        </style>
        <?php
    }

    /**
     * Enqueue WordPress Media Library scripts for BlueCrocus Editor preview.
     */
    public function enqueue_media_library(): void {
        // phpcs:ignore WordPress.Security.NonceVerification.Recommended
        if ( empty( $_GET[ Constants::QUERY_PREVIEW ] ) ) {
            return;
        }

        if ( ! current_user_can( 'upload_files' ) ) {
            return;
        }

        wp_enqueue_media();
    }

    /**
     * Register REST API routes for page theme config.
     */
    public function register_api_routes(): void {
        register_rest_route( Constants::REST_NAMESPACE, '/pages/(?P<id>\d+)/theme', [
            'methods'             => 'GET',
            'callback'            => [ $this, 'rest_get_page_theme' ],
            'permission_callback' => function( WP_REST_Request $request ) {
                return current_user_can( 'edit_post', $request->get_param( 'id' ) );
            },
        ] );

        register_rest_route( Constants::REST_NAMESPACE, '/pages/(?P<id>\d+)/theme', [
            'methods'             => 'PUT',
            'callback'            => [ $this, 'rest_save_page_theme' ],
            'permission_callback' => function( WP_REST_Request $request ) {
                return current_user_can( 'edit_post', $request->get_param( 'id' ) );
            },
        ] );

        register_rest_route( Constants::REST_NAMESPACE, '/pages/(?P<id>\d+)/save-all', [
            'methods'             => 'PUT',
            'callback'            => [ $this, 'rest_save_all' ],
            'permission_callback' => function( WP_REST_Request $request ) {
                return current_user_can( 'edit_post', $request->get_param( 'id' ) );
            },
        ] );

        register_rest_route( Constants::REST_NAMESPACE, '/upload-image', [
            'methods'             => 'POST',
            'callback'            => [ $this, 'rest_upload_image' ],
            'permission_callback' => function() {
                return current_user_can( 'upload_files' );
            },
        ] );
    }

    /**
     * REST callback - Upload image to media library.
     */
    public function rest_upload_image( WP_REST_Request $request ): WP_REST_Response {
        if ( ! RateLimiter::check( 'upload_image', 5, 60 ) ) {
            return new WP_REST_Response( [
                'success' => false,
                'message' => 'Too many upload requests. Please try again in a moment.',
            ], 429 );
        }

        $files = $request->get_file_params();

        if ( empty( $files['file'] ) ) {
            return new WP_REST_Response( [
                'success' => false,
                'message' => 'No file uploaded',
            ], 400 );
        }

        $file = $files['file'];

        $validation_result = Validators::validate_image_upload( $file );
        if ( is_wp_error( $validation_result ) ) {
            return new WP_REST_Response( [
                'success' => false,
                'message' => $validation_result->get_error_message(),
            ], 400 );
        }

        require_once ABSPATH . 'wp-admin/includes/image.php';
        require_once ABSPATH . 'wp-admin/includes/file.php';
        require_once ABSPATH . 'wp-admin/includes/media.php';

        $upload = wp_handle_upload( $file, [ 'test_form' => false ] );

        if ( isset( $upload['error'] ) ) {
            return new WP_REST_Response( [
                'success' => false,
                'message' => $upload['error'],
            ], 500 );
        }

        $attachment = [
            'post_mime_type' => $upload['type'],
            'post_title'     => sanitize_file_name( pathinfo( $upload['file'], PATHINFO_FILENAME ) ),
            'post_content'   => '',
            'post_status'    => 'inherit',
        ];

        $attachment_id = wp_insert_attachment( $attachment, $upload['file'] );

        if ( is_wp_error( $attachment_id ) ) {
            return new WP_REST_Response( [
                'success' => false,
                'message' => $attachment_id->get_error_message(),
            ], 500 );
        }

        $attachment_data = wp_generate_attachment_metadata( $attachment_id, $upload['file'] );
        wp_update_attachment_metadata( $attachment_id, $attachment_data );

        return new WP_REST_Response( [
            'success'      => true,
            'attachmentId' => $attachment_id,
            'url'          => $upload['url'],
            'filename'     => basename( $upload['file'] ),
        ], 200 );
    }

    /**
     * REST callback - Get page theme config.
     */
    public function rest_get_page_theme( WP_REST_Request $request ): WP_REST_Response {
        $byrde_page_id = $request->get_param( 'id' );
        $config        = get_post_meta( $byrde_page_id, Constants::META_THEME_CONFIG, true );

        $config_data = $config ? json_decode( $config, true ) : null;

        return new WP_REST_Response( [
            'success'     => true,
            'pageId'      => $byrde_page_id,
            'themeConfig' => $config_data ? self::repair_unicode( $config_data ) : null,
        ], 200 );
    }

    /**
     * REST callback - Save page theme config.
     *
     * @return WP_REST_Response|WP_Error
     */
    public function rest_save_page_theme( WP_REST_Request $request ) {
        if ( ! RateLimiter::check( 'save_theme', 10, 60 ) ) {
            return new WP_Error(
                'rate_limit_exceeded',
                'Too many save requests. Please try again in a moment.',
                [ 'status' => 429 ]
            );
        }

        $byrde_page_id = $request->get_param( 'id' );
        $config        = $request->get_json_params();

        if ( empty( $config ) ) {
            return new WP_Error( 'empty_config', 'No config data provided', [ 'status' => 400 ] );
        }

        $errors = Validators::validate_theme_config( $config );
        if ( ! empty( $errors ) ) {
            return new WP_Error(
                'validation_failed',
                implode( ', ', $errors ),
                [ 'status' => 400 ]
            );
        }

        $sanitized = Validators::sanitize_theme_config( $config );

        $json_config = wp_json_encode( $sanitized, JSON_UNESCAPED_UNICODE );
        update_post_meta( $byrde_page_id, Constants::META_THEME_CONFIG, $json_config );

        $saved_config = get_post_meta( $byrde_page_id, Constants::META_THEME_CONFIG, true );
        if ( empty( $saved_config ) && ! empty( $json_config ) ) {
            return new WP_Error( 'save_failed', 'Failed to save theme config', [ 'status' => 500 ] );
        }

        return rest_ensure_response( [
            'success' => true,
            'config'  => $sanitized,
        ] );
    }

    /**
     * REST callback - Atomic save (theme + content together).
     *
     * Saves both theme config and content in a single transaction.
     * Prevents inconsistent state if one save fails.
     *
     * @return WP_REST_Response|WP_Error
     */
    public function rest_save_all( WP_REST_Request $request ) {
        if ( ! RateLimiter::check( 'save_all', 10, 60 ) ) {
            return new WP_Error(
                'rate_limit_exceeded',
                'Too many save requests. Please try again in a moment.',
                [ 'status' => 429 ]
            );
        }

        $byrde_page_id = $request->get_param( 'id' );
        $data          = $request->get_json_params();

        if ( empty( $data['theme'] ) || empty( $data['content'] ) ) {
            return new WP_Error(
                'missing_data',
                'Both theme and content are required',
                [ 'status' => 400 ]
            );
        }

        $theme_config = $data['theme'];
        $content      = $data['content'];

        $theme_errors   = Validators::validate_theme_config( $theme_config );
        $content_errors = Validators::validate_content( $content );
        $all_errors     = array_merge( $theme_errors, $content_errors );

        if ( ! empty( $all_errors ) ) {
            return new WP_Error(
                'validation_failed',
                implode( ', ', $all_errors ),
                [ 'status' => 400 ]
            );
        }

        $sanitized_theme   = Validators::sanitize_theme_config( $theme_config );
        $sanitized_content = Validators::sanitize_content( $content );

        update_post_meta( $byrde_page_id, Constants::META_THEME_CONFIG, wp_json_encode( $sanitized_theme, JSON_UNESCAPED_UNICODE ) );
        update_post_meta( $byrde_page_id, Constants::META_CONTENT, $sanitized_content );

        $saved_theme   = get_post_meta( $byrde_page_id, Constants::META_THEME_CONFIG, true );
        $saved_content = get_post_meta( $byrde_page_id, Constants::META_CONTENT, true );

        if ( empty( $saved_theme ) || empty( $saved_content ) ) {
            return new WP_Error( 'save_failed', 'Failed to save theme and/or content', [ 'status' => 500 ] );
        }

        return rest_ensure_response( [
            'success' => true,
            'theme'   => $sanitized_theme,
            'content' => $sanitized_content,
        ] );
    }

    /**
     * Load saved theme config on frontend.
     */
    public function load_page_theme_config(): void {
        // phpcs:ignore WordPress.Security.NonceVerification.Recommended
        if ( ! empty( $_GET[ Constants::QUERY_PREVIEW ] ) ) {
            return;
        }

        if ( ! is_singular( Constants::CPT_LANDING ) ) {
            return;
        }

        $byrde_page_id = get_the_ID();
        $theme_config  = get_post_meta( $byrde_page_id, Constants::META_THEME_CONFIG, true );

        if ( ! $theme_config ) {
            return;
        }

        $config_data = json_decode( $theme_config, true );

        if ( $config_data ) {
            // Repair legacy data: wp_unslash corrupted \uXXXX → uXXXX in older saves.
            $config_data = self::repair_unicode( $config_data );
            ?>
            <script>
                window.byrdeConfig = <?php echo wp_json_encode( $config_data, JSON_UNESCAPED_UNICODE ); ?>;
            </script>
            <?php
        }
    }

    /**
     * Register meta key.
     */
    public function register_theme_meta(): void {
        register_post_meta( Constants::CPT_LANDING, Constants::META_THEME_CONFIG, [
            'type'         => 'string',
            'single'       => true,
            'show_in_rest' => false,
        ] );
    }

    /**
     * Customize admin bar - replace Edit Page with BlueCrocus Editor.
     */
    public function customize_admin_bar( WP_Admin_Bar $wp_admin_bar ): void {
        if ( is_admin() || ! is_singular( Constants::CPT_LANDING ) ) {
            return;
        }

        $page_id = get_the_ID();
        if ( ! $page_id || ! current_user_can( 'edit_post', $page_id ) ) {
            return;
        }

        $wp_admin_bar->remove_node( 'edit' );

        $editor_url = admin_url( 'admin.php?page=byrde-editor&byrde_page_id=' . $page_id );

        $wp_admin_bar->add_node( [
            'id'    => 'bluecrocus-editor',
            'title' => '<span class="ab-icon dashicons dashicons-edit" style="font-family: dashicons; font-size: 20px; line-height: 1; margin-right: 6px;"></span>' . __( 'BlueCrocus Editor', 'byrde' ),
            'href'  => $editor_url,
            'meta'  => [
                'title' => __( 'Edit with BlueCrocus Theme Editor', 'byrde' ),
            ],
        ] );
    }

    /**
     * Repair Unicode sequences corrupted by wp_unslash.
     *
     * wp_json_encode() encodes • as \u2022. WordPress's wp_unslash()
     * strips the backslash on meta retrieval, leaving literal "u2022".
     * This restores the original Unicode characters.
     *
     * @param mixed $data Data to repair.
     * @return mixed Repaired data.
     */
    private static function repair_unicode( mixed $data ): mixed {
        if ( is_array( $data ) ) {
            return array_map( [ self::class, 'repair_unicode' ], $data );
        }
        if ( is_string( $data ) ) {
            // Match uXXXX only when NOT preceded by a word character (letter/digit/underscore).
            // This catches corrupted sequences like "text u2022 text" or "$25u2013$50"
            // but won't match inside normal words like "ubuntu".
            return preg_replace_callback(
                '/(?<![a-zA-Z_])u([0-9a-fA-F]{4})(?![0-9a-fA-F])/',
                static fn( $m ) => mb_chr( (int) hexdec( $m[1] ), 'UTF-8' ),
                $data
            );
        }
        return $data;
    }
}
