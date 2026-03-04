<?php

namespace Byrde\Admin;

use Byrde\Core\Constants;
use Byrde\Core\Helpers;
use Byrde\Settings\Manager;
use Byrde\Settings\Cache;

/**
 * Onboarding Wizard
 *
 * Shows a setup wizard after first plugin activation.
 * Collects essential settings (logo, phone, email, colors, etc.)
 */
class Onboarding {

    /** Option key to track onboarding completion. */
    public const OPTION_ONBOARDING_COMPLETE = 'byrde_onboarding_complete';

    private Manager $settings;
    private Cache $cache;

    public function __construct( Manager $settings, Cache $cache ) {
        $this->settings = $settings;
        $this->cache    = $cache;
    }

    /**
     * Register hooks.
     */
    public function register(): void {
        add_action( 'admin_init', [ $this, 'maybe_redirect_to_onboarding' ], 2 );
        add_action( 'admin_init', [ $this, 'maybe_render_onboarding' ], 1 );
        add_action( 'admin_menu', [ $this, 'register_onboarding_page' ] );
        add_action( 'rest_api_init', [ $this, 'register_onboarding_api' ] );
        add_filter(
            'plugin_action_links_' . plugin_basename( BYRDE_PLUGIN_FILE ),
            [ $this, 'plugin_action_links' ]
        );
    }

    /**
     * Set a transient flag on activation to trigger redirect.
     * Called from register_activation_hook in byrde.php.
     */
    public function set_onboarding_redirect(): void {
        if ( get_option( self::OPTION_ONBOARDING_COMPLETE ) ) {
            return;
        }
        set_transient( 'byrde_activation_redirect', true, 30 );
    }

    /**
     * Redirect to onboarding wizard after activation.
     */
    public function maybe_redirect_to_onboarding(): void {
        if ( ! get_transient( 'byrde_activation_redirect' ) ) {
            return;
        }
        delete_transient( 'byrde_activation_redirect' );

        // Don't redirect on multisite bulk activation or AJAX.
        // phpcs:ignore WordPress.Security.NonceVerification.Recommended
        if ( is_network_admin() || isset( $_GET['activate-multi'] ) || wp_doing_ajax() ) {
            return;
        }

        if ( get_option( self::OPTION_ONBOARDING_COMPLETE ) ) {
            return;
        }

        wp_safe_redirect( admin_url( 'admin.php?page=byrde-onboarding' ) );
        exit;
    }

    /**
     * Register hidden admin page for the wizard.
     */
    public function register_onboarding_page(): void {
        add_submenu_page(
            null,
            __( 'Byrde Setup', 'byrde' ),
            __( 'Byrde Setup', 'byrde' ),
            'manage_options',
            'byrde-onboarding',
            '__return_false'
        );
    }

    /**
     * Intercept early to render full-screen wizard (before WordPress admin UI).
     */
    public function maybe_render_onboarding(): void {
        if ( ! is_admin() ) {
            return;
        }

        // phpcs:ignore WordPress.Security.NonceVerification.Recommended
        if ( empty( $_GET['page'] ) || 'byrde-onboarding' !== $_GET['page'] ) {
            return;
        }

        if ( ! current_user_can( 'manage_options' ) ) {
            wp_die( esc_html__( 'Unauthorized', 'byrde' ), 403 );
        }

        $this->render_onboarding_page();
    }

    /**
     * REST endpoint to mark onboarding complete.
     */
    public function register_onboarding_api(): void {
        register_rest_route(
            Constants::REST_NAMESPACE,
            '/onboarding/complete',
            [
                'methods'             => 'POST',
                'callback'            => function () {
                    update_option( self::OPTION_ONBOARDING_COMPLETE, '1' );
                    return rest_ensure_response( [ 'success' => true ] );
                },
                'permission_callback' => function () {
                    return current_user_can( 'manage_options' );
                },
            ]
        );
    }

    /**
     * Add "Run Setup Wizard" link on the Plugins list page.
     *
     * @param array $links Existing action links.
     * @return array Modified links.
     */
    public function plugin_action_links( array $links ): array {
        $wizard_link = sprintf(
            '<a href="%s">%s</a>',
            esc_url( admin_url( 'admin.php?page=byrde-onboarding' ) ),
            esc_html__( 'Setup Wizard', 'byrde' )
        );
        array_unshift( $links, $wizard_link );
        return $links;
    }

    /**
     * Render the full-screen onboarding page.
     */
    private function render_onboarding_page(): void {
        $dist_dir = BYRDE_PLUGIN_DIR . 'front-end/dist';
        $dist_uri = Helpers::plugin_uri() . '/front-end/dist';
        $version  = $this->cache->get_version();

        // Current settings for pre-filling wizard fields.
        $settings            = $this->settings->get_all();
        $settings['apiUrl']  = rest_url( Constants::REST_NAMESPACE );

        // After wizard, go to the landing pages list.
        $redirect_url = admin_url( 'edit.php?post_type=' . Constants::CPT_LANDING );

        // Enqueue media library BEFORE output.
        wp_enqueue_media();

        ?>
        <!DOCTYPE html>
        <html <?php language_attributes(); ?>>
        <head>
            <meta charset="<?php bloginfo( 'charset' ); ?>">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title><?php echo esc_html__( 'Byrde Setup Wizard', 'byrde' ); ?></title>
            <?php
            // WordPress core styles needed for media library modal.
            wp_print_styles( [ 'wp-admin', 'media-views', 'imgareaselect', 'buttons' ] );
            wp_print_head_scripts();
            ?>
            <?php
            // Plugin styles (loaded AFTER WP styles so Tailwind resets take effect).
            if ( file_exists( $dist_dir . '/assets/style.css' ) ) {
                printf(
                    '<link rel="stylesheet" href="%s">',
                    esc_url( $dist_uri . '/assets/style.css?ver=' . $version )
                );
            }
            ?>
            <style>
                /* Page layout */
                html, body { height: 100%; margin: 0; padding: 0; }
                body {
                    background: #09090b !important;
                    color: #3c434a;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                }
                #byrde-onboarding * { box-sizing: border-box; }
                #byrde-onboarding { color: #f4f4f5; }

                /* Force dark-theme form elements — beats WP admin CSS + Tailwind + shadcn */
                #byrde-onboarding input,
                #byrde-onboarding textarea {
                    background-color: #27272a !important; /* zinc-800 */
                    border: 1px solid #3f3f46 !important; /* zinc-700 */
                    color: #f4f4f5 !important;             /* zinc-100 */
                    box-shadow: none !important;
                    resize: none;
                }
                #byrde-onboarding input::placeholder,
                #byrde-onboarding textarea::placeholder {
                    color: #71717a !important; /* zinc-500 */
                }
                #byrde-onboarding input:focus,
                #byrde-onboarding textarea:focus {
                    border-color: #52525b !important; /* zinc-600 */
                    outline: none !important;
                    box-shadow: 0 0 0 1px #52525b !important;
                }

                /* Kill the global green *:focus-visible from index.css */
                #byrde-onboarding *:focus-visible { outline: none; }
                /* Hide WP admin bar */
                #wpadminbar { display: none !important; }
                html.wp-toolbar { padding-top: 0 !important; }
                /* Protect WP Media Library modal from our global index.css overrides */
                .media-modal *:focus-visible {
                    outline-color: #2271b1;
                }
            </style>
        </head>
        <body>
            <div id="byrde-onboarding"></div>
            <script>
                window.byrdeSettings = <?php echo wp_json_encode( $settings ); ?>;
                window.byrdeOnboarding = {
                    nonce: <?php echo wp_json_encode( wp_create_nonce( 'wp_rest' ) ); ?>,
                    apiUrl: <?php echo wp_json_encode( rest_url( Constants::REST_NAMESPACE ) ); ?>,
                    redirectUrl: <?php echo wp_json_encode( $redirect_url ); ?>,
                };
            </script>
            <?php
            wp_print_footer_scripts();
            wp_print_media_templates();

            if ( file_exists( $dist_dir . '/assets/main.js' ) ) {
                printf(
                    '<script type="module" src="%s"></script>',
                    esc_url( $dist_uri . '/assets/main.js?ver=' . $version )
                );
            }
            ?>
        </body>
        </html>
        <?php
        exit;
    }
}
