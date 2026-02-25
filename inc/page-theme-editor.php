<?php
/**
 * Page Theme Editor
 *
 * Full-screen visual theme editor (like Elementor)
 *
 * @package Byrde
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Intercept early to render full-screen editor (before WordPress admin UI)
 */
function byrde_maybe_render_editor(): void {
    // Check if we're on our editor page
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
    if ( ! $page || $page->post_type !== 'page' ) {
        wp_die( __( 'Page not found.', 'byrde' ) );
    }

    // Render full-screen editor and exit
    byrde_render_editor_page( $byrde_page_id, $page );
}
add_action( 'admin_init', 'byrde_maybe_render_editor', 1 );

/**
 * Register the editor page (hidden from menu, required for URL to work)
 */
function byrde_register_editor_page(): void {
    add_submenu_page(
        null, // Hidden from menu
        __( 'BlueCrocus Theme Editor', 'byrde' ),
        __( 'BlueCrocus Theme Editor', 'byrde' ),
        'edit_pages',
        'byrde-editor',
        '__return_false' // Dummy callback - we intercept in admin_init
    );
}
add_action( 'admin_menu', 'byrde_register_editor_page' );

/**
 * Render the full-screen editor page
 *
 * @param int     $byrde_page_id The page ID.
 * @param WP_Post $page    The page post object.
 */
function byrde_render_editor_page( int $byrde_page_id, WP_Post $page ): void {
    $preview_url = add_query_arg( array(
        'byrde_preview' => '1',
        'byrde_page_id'          => $byrde_page_id,
    ), home_url( '/' ) );

    $back_url = admin_url( 'edit.php?post_type=page' );
    $view_url = get_permalink( $byrde_page_id );

    // Output full-screen editor
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
 * Add "Edit Theme" link to page row actions
 */
function byrde_add_editor_link( array $actions, WP_Post $post ): array {
    if ( $post->post_type !== 'page' || ! current_user_can( 'edit_post', $post->ID ) ) {
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
add_filter( 'page_row_actions', 'byrde_add_editor_link', 10, 2 );

/**
 * Inject admin context into preview iframe
 */
function byrde_inject_admin_context(): void {
    // phpcs:ignore WordPress.Security.NonceVerification.Recommended
    if ( empty( $_GET['byrde_preview'] ) ) {
        return;
    }

    // phpcs:ignore WordPress.Security.NonceVerification.Recommended
    $byrde_page_id = isset( $_GET['byrde_page_id'] ) ? absint( $_GET['byrde_page_id'] ) : 0;

    // Fallback to old parameter name
    // phpcs:ignore WordPress.Security.NonceVerification.Recommended
    if ( ! $byrde_page_id && isset( $_GET['page_id'] ) ) {
        $byrde_page_id = absint( $_GET['page_id'] );
    }

    // Check user permissions
    $is_logged_in   = is_user_logged_in();
    $can_edit_pages = current_user_can( 'edit_pages' );
    $can_edit       = false;

    if ( $is_logged_in ) {
        if ( $byrde_page_id ) {
            // Check specific page permission
            $can_edit = current_user_can( 'edit_post', $byrde_page_id );
        } else {
            // Check general permission
            $can_edit = $can_edit_pages;
        }
    }

    $theme_config = $byrde_page_id ? get_post_meta( $byrde_page_id, '_byrde_theme_config', true ) : '';

    // Debug: Log what we're injecting
    error_log( '[Byrde Inject] Page ID: ' . $byrde_page_id );
    error_log( '[Byrde Inject] Raw theme_config: ' . substr( $theme_config, 0, 200 ) );

    $decoded_config = $theme_config ? json_decode( $theme_config, true ) : null;
    if ( $decoded_config && isset( $decoded_config['sectionThemes']['hero'] ) ) {
        error_log( '[Byrde Inject] Hero config: ' . print_r( $decoded_config['sectionThemes']['hero'], true ) );
    }

    // Always inject for preview mode (but mark if user can save)
    $admin_data = array(
        'isAdmin'    => true,
        'canSave'    => $can_edit,
        'apiUrl'     => rest_url( 'byrde/v1' ),
        'nonce'      => $can_edit ? wp_create_nonce( 'wp_rest' ) : '',
        'pageId'     => $byrde_page_id,
        'config'     => $decoded_config,
        '_debug'     => array(
            'loggedIn'     => $is_logged_in,
            'canEditPages' => $can_edit_pages,
            'canEdit'      => $can_edit,
        ),
    );
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
add_action( 'wp_head', 'byrde_inject_admin_context', 1 );

/**
 * Enqueue WordPress Media Library scripts for BlueCrocus Editor preview
 */
function byrde_enqueue_media_library(): void {
    // phpcs:ignore WordPress.Security.NonceVerification.Recommended
    if ( empty( $_GET['byrde_preview'] ) ) {
        return;
    }

    // Check if user can upload files
    if ( ! current_user_can( 'upload_files' ) ) {
        return;
    }

    // Enqueue WordPress Media Library
    wp_enqueue_media();
}
add_action( 'wp_enqueue_scripts', 'byrde_enqueue_media_library' );

/**
 * Register REST API routes for page theme config
 */
function byrde_register_theme_api_routes(): void {
    register_rest_route( 'byrde/v1', '/pages/(?P<id>\d+)/theme', array(
        'methods'             => 'GET',
        'callback'            => 'byrde_rest_get_page_theme',
        'permission_callback' => function( WP_REST_Request $request ) {
            return current_user_can( 'edit_post', $request->get_param( 'id' ) );
        },
    ) );

    register_rest_route( 'byrde/v1', '/pages/(?P<id>\d+)/theme', array(
        'methods'             => 'PUT',
        'callback'            => 'byrde_rest_save_page_theme',
        'permission_callback' => function( WP_REST_Request $request ) {
            return current_user_can( 'edit_post', $request->get_param( 'id' ) );
        },
    ) );

    // Atomic save endpoint (theme + content together)
    register_rest_route( 'byrde/v1', '/pages/(?P<id>\d+)/save-all', array(
        'methods'             => 'PUT',
        'callback'            => 'byrde_rest_save_all',
        'permission_callback' => function( WP_REST_Request $request ) {
            return current_user_can( 'edit_post', $request->get_param( 'id' ) );
        },
    ) );

    // Image upload endpoint
    register_rest_route( 'byrde/v1', '/upload-image', array(
        'methods'             => 'POST',
        'callback'            => 'byrde_rest_upload_image',
        'permission_callback' => function() {
            return current_user_can( 'upload_files' );
        },
    ) );
}
add_action( 'rest_api_init', 'byrde_register_theme_api_routes' );

/**
 * REST callback - Upload image to media library
 */
function byrde_rest_upload_image( WP_REST_Request $request ): WP_REST_Response {
    // Rate limit: 5 uploads per minute
    if ( ! byrde_check_rate_limit( 'upload_image', 5, 60 ) ) {
        return new WP_REST_Response( array(
            'success' => false,
            'message' => 'Too many upload requests. Please try again in a moment.',
        ), 429 );
    }

    // Check for file in the request
    $files = $request->get_file_params();

    if ( empty( $files['file'] ) ) {
        return new WP_REST_Response( array(
            'success' => false,
            'message' => 'No file uploaded',
        ), 400 );
    }

    $file = $files['file'];

    // Validate image upload (secure validation)
    $validation_result = byrde_validate_image_upload( $file );
    if ( is_wp_error( $validation_result ) ) {
        return new WP_REST_Response( array(
            'success' => false,
            'message' => $validation_result->get_error_message(),
        ), 400 );
    }

    // Include WordPress media handling functions
    require_once ABSPATH . 'wp-admin/includes/image.php';
    require_once ABSPATH . 'wp-admin/includes/file.php';
    require_once ABSPATH . 'wp-admin/includes/media.php';

    // Handle the upload
    $upload = wp_handle_upload( $file, array( 'test_form' => false ) );

    if ( isset( $upload['error'] ) ) {
        return new WP_REST_Response( array(
            'success' => false,
            'message' => $upload['error'],
        ), 500 );
    }

    // Create attachment in media library
    $attachment = array(
        'post_mime_type' => $upload['type'],
        'post_title'     => sanitize_file_name( pathinfo( $upload['file'], PATHINFO_FILENAME ) ),
        'post_content'   => '',
        'post_status'    => 'inherit',
    );

    $attachment_id = wp_insert_attachment( $attachment, $upload['file'] );

    if ( is_wp_error( $attachment_id ) ) {
        return new WP_REST_Response( array(
            'success' => false,
            'message' => $attachment_id->get_error_message(),
        ), 500 );
    }

    // Generate attachment metadata
    $attachment_data = wp_generate_attachment_metadata( $attachment_id, $upload['file'] );
    wp_update_attachment_metadata( $attachment_id, $attachment_data );

    return new WP_REST_Response( array(
        'success'      => true,
        'attachmentId' => $attachment_id,
        'url'          => $upload['url'],
        'filename'     => basename( $upload['file'] ),
    ), 200 );
}

/**
 * REST callback - Get page theme config
 */
function byrde_rest_get_page_theme( WP_REST_Request $request ): WP_REST_Response {
    $byrde_page_id = $request->get_param( 'id' );
    $config  = get_post_meta( $byrde_page_id, '_byrde_theme_config', true );

    return new WP_REST_Response( array(
        'success'     => true,
        'pageId'      => $byrde_page_id,
        'themeConfig' => $config ? json_decode( $config, true ) : null,
    ), 200 );
}

/**
 * REST callback - Save page theme config
 */
function byrde_rest_save_page_theme( WP_REST_Request $request ) {
    // Rate limit: 10 saves per minute
    if ( ! byrde_check_rate_limit( 'save_theme', 10, 60 ) ) {
        return new WP_Error(
            'rate_limit_exceeded',
            'Too many save requests. Please try again in a moment.',
            array( 'status' => 429 )
        );
    }

    $byrde_page_id = $request->get_param( 'id' );
    $config  = $request->get_json_params();

    // Debug logging
    error_log( '[Byrde Theme Save] Page ID: ' . $byrde_page_id );
    error_log( '[Byrde Theme Save] Config received: ' . print_r( $config, true ) );

    if ( empty( $config ) ) {
        return new WP_Error( 'empty_config', 'No config data provided', array( 'status' => 400 ) );
    }

    // Validate config structure
    $errors = byrde_validate_theme_config( $config );
    if ( ! empty( $errors ) ) {
        error_log( '[Byrde Theme Save] Validation errors: ' . print_r( $errors, true ) );
        return new WP_Error(
            'validation_failed',
            implode( ', ', $errors ),
            array( 'status' => 400 )
        );
    }

    // Sanitize config
    $sanitized = byrde_sanitize_theme_config( $config );
    error_log( '[Byrde Theme Save] Sanitized: ' . print_r( $sanitized, true ) );

    // Save as JSON
    $json_config = wp_json_encode( $sanitized );
    // Note: update_post_meta returns false if value unchanged, which is OK
    $result = update_post_meta( $byrde_page_id, '_byrde_theme_config', $json_config );
    error_log( '[Byrde Theme Save] update_post_meta result: ' . var_export( $result, true ) );

    // CRITICAL: Clear post meta cache to ensure fresh data on next load
    wp_cache_delete( $byrde_page_id, 'post_meta' );
    clean_post_cache( $byrde_page_id );

    // Verify save by reading back (bypassing cache)
    $saved_config = get_post_meta( $byrde_page_id, '_byrde_theme_config', true );
    error_log( '[Byrde Theme Save] Saved config: ' . $saved_config );

    if ( empty( $saved_config ) && ! empty( $json_config ) ) {
        return new WP_Error( 'save_failed', 'Failed to save theme config', array( 'status' => 500 ) );
    }

    return rest_ensure_response( array(
        'success' => true,
        'config'  => $sanitized,
    ) );
}

/**
 * REST callback - Atomic save (theme + content together)
 *
 * Saves both theme config and content in a single transaction.
 * Prevents inconsistent state if one save fails.
 */
function byrde_rest_save_all( WP_REST_Request $request ) {
    // Rate limit: 10 saves per minute (combined theme + content)
    if ( ! byrde_check_rate_limit( 'save_all', 10, 60 ) ) {
        return new WP_Error(
            'rate_limit_exceeded',
            'Too many save requests. Please try again in a moment.',
            array( 'status' => 429 )
        );
    }

    $byrde_page_id = $request->get_param( 'id' );
    $data             = $request->get_json_params();

    // Check we have both theme and content
    if ( empty( $data['theme'] ) || empty( $data['content'] ) ) {
        return new WP_Error(
            'missing_data',
            'Both theme and content are required',
            array( 'status' => 400 )
        );
    }

    $theme_config = $data['theme'];
    $content      = $data['content'];

    // Validate both
    $theme_errors   = byrde_validate_theme_config( $theme_config );
    $content_errors = byrde_validate_content( $content );
    $all_errors     = array_merge( $theme_errors, $content_errors );

    if ( ! empty( $all_errors ) ) {
        return new WP_Error(
            'validation_failed',
            implode( ', ', $all_errors ),
            array( 'status' => 400 )
        );
    }

    // Sanitize both
    $sanitized_theme   = byrde_sanitize_theme_config( $theme_config );
    $sanitized_content = byrde_sanitize_content( $content );

    // Save both atomically (WordPress doesn't have transactions, but we check both saves)
    update_post_meta( $byrde_page_id, '_byrde_theme_config', wp_json_encode( $sanitized_theme ) );
    update_post_meta( $byrde_page_id, '_byrde_content', $sanitized_content );

    // CRITICAL: Clear post meta cache to ensure fresh data on next load
    wp_cache_delete( $byrde_page_id, 'post_meta' );
    clean_post_cache( $byrde_page_id );

    // Verify both saves by reading back (bypassing cache)
    $saved_theme   = get_post_meta( $byrde_page_id, '_byrde_theme_config', true );
    $saved_content = get_post_meta( $byrde_page_id, '_byrde_content', true );

    if ( empty( $saved_theme ) || empty( $saved_content ) ) {
        return new WP_Error( 'save_failed', 'Failed to save theme and/or content', array( 'status' => 500 ) );
    }

    return rest_ensure_response( array(
        'success' => true,
        'theme'   => $sanitized_theme,
        'content' => $sanitized_content,
    ) );
}

/**
 * Load saved theme config on frontend
 */
function byrde_load_page_theme_config(): void {
    if ( ! empty( $_GET['byrde_preview'] ) ) {
        return;
    }

    if ( ! is_singular( 'page' ) ) {
        return;
    }

    $byrde_page_id      = get_the_ID();
    $theme_config = get_post_meta( $byrde_page_id, '_byrde_theme_config', true );

    if ( ! $theme_config ) {
        return;
    }

    $config_data = json_decode( $theme_config, true );

    if ( $config_data ) {
        ?>
        <script>
            window.byrdeConfig = <?php echo wp_json_encode( $config_data ); ?>;
        </script>
        <?php
    }
}
add_action( 'wp_head', 'byrde_load_page_theme_config', 1 );

/**
 * Register meta key
 */
function byrde_register_theme_meta(): void {
    register_post_meta( 'page', '_byrde_theme_config', array(
        'type'         => 'string',
        'single'       => true,
        'show_in_rest' => false,
    ) );
}
add_action( 'init', 'byrde_register_theme_meta' );

/**
 * Customize admin bar - replace Edit Page with BlueCrocus Editor
 *
 * @param WP_Admin_Bar $wp_admin_bar The admin bar instance.
 */
function byrde_customize_admin_bar( WP_Admin_Bar $wp_admin_bar ): void {
    // Only on frontend pages
    if ( is_admin() || ! is_singular( 'page' ) ) {
        return;
    }

    $page_id = get_the_ID();
    if ( ! $page_id || ! current_user_can( 'edit_post', $page_id ) ) {
        return;
    }

    // Remove default Edit link
    $wp_admin_bar->remove_node( 'edit' );

    // Add BlueCrocus Editor link
    $editor_url = admin_url( 'admin.php?page=byrde-editor&byrde_page_id=' . $page_id );

    $wp_admin_bar->add_node( array(
        'id'    => 'bluecrocus-editor',
        'title' => '<span class="ab-icon dashicons dashicons-edit" style="font-family: dashicons; font-size: 20px; line-height: 1; margin-right: 6px;"></span>' . __( 'BlueCrocus Editor', 'byrde' ),
        'href'  => $editor_url,
        'meta'  => array(
            'title' => __( 'Edit with BlueCrocus Theme Editor', 'byrde' ),
        ),
    ) );
}
add_action( 'admin_bar_menu', 'byrde_customize_admin_bar', 81 );
