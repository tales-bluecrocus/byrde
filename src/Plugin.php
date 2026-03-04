<?php

namespace Byrde;

use Byrde\Admin\Onboarding;
use Byrde\Admin\PageEditor;
use Byrde\API\ContactForm;
use Byrde\API\ContentEndpoints;
use Byrde\Assets\AssetManager;
use Byrde\Content\LandingCPT;
use Byrde\Content\LegalPages;
use Byrde\Content\SEO;
use Byrde\Content\Shortcodes;
use Byrde\Content\TemplateLoader;
use Byrde\Core\Constants;
use Byrde\Core\Helpers;
use Byrde\Core\Logo;
use Byrde\Migration\ColorMigration;
use Byrde\Migration\ThemeMigration;
use Byrde\Security\Cleanup;
use Byrde\Security\CookieConsent;
use Byrde\Settings\Cache;
use Byrde\Settings\Manager;
use YahnisElsts\PluginUpdateChecker\v5\PucFactory;

/**
 * Main plugin bootstrap.
 *
 * Instantiates and registers all modules in dependency order.
 */
class Plugin {
    public Manager $settings;
    public Cache $cache;
    public Logo $logo;
    public LandingCPT $cpt;
    public Onboarding $onboarding;

    public function boot(): void {
        // Security (no dependencies)
        ( new Cleanup() )->register();

        // Settings & Cache
        $this->settings = new Manager();
        $this->settings->register();

        $this->cache = new Cache();
        $this->cache->register();

        // Core
        $this->logo = new Logo( $this->settings );
        $this->cpt  = new LandingCPT();
        $this->cpt->register();

        // Templates & Assets
        ( new TemplateLoader() )->register();
        ( new AssetManager( $this->settings, $this->cache, $this->logo ) )->register();

        // REST API
        ( new ContentEndpoints() )->register();
        ( new ContactForm( $this->settings ) )->register();

        // Content features
        ( new SEO() )->register();
        ( new Shortcodes( $this->settings ) )->register();
        ( new CookieConsent( $this->settings ) )->register();

        // Admin
        ( new PageEditor() )->register();

        $this->onboarding = new Onboarding( $this->settings );
        $this->onboarding->register();

        // Migrations
        ( new ColorMigration() )->register();

        // Auto-updater
        $this->setup_update_checker();

        // Theme support
        add_action( 'after_setup_theme', [ $this, 'setup' ] );
    }

    /**
     * Plugin setup (theme support, image sizes).
     */
    public function setup(): void {
        add_theme_support( 'title-tag' );
        add_theme_support( 'html5', [ 'script', 'style' ] );
        add_image_size( 'logo', 128, 128, false );
    }

    /**
     * Create default landing pages on plugin activation.
     */
    public function activate(): void {
        $pages = [
            [ 'title' => 'First PPC', 'slug' => 'first-ppc' ],
            [ 'title' => 'Privacy Policy', 'slug' => 'privacy-policy', 'page_type' => 'legal' ],
            [ 'title' => 'Terms & Conditions', 'slug' => 'terms-and-conditions', 'page_type' => 'legal' ],
            [ 'title' => 'Cookie Settings', 'slug' => 'cookie-settings', 'page_type' => 'legal' ],
        ];

        foreach ( $pages as $page ) {
            $existing = get_posts( [
                'post_type'      => Constants::CPT_LANDING,
                'name'           => $page['slug'],
                'posts_per_page' => 1,
                'post_status'    => 'any',
            ] );

            if ( ! empty( $existing ) ) {
                if ( ! empty( $page['page_type'] ) ) {
                    $current_type = get_post_meta( $existing[0]->ID, '_byrde_page_type', true );
                    if ( empty( $current_type ) ) {
                        update_post_meta( $existing[0]->ID, '_byrde_page_type', $page['page_type'] );
                    }
                }
                continue;
            }

            $page_id = wp_insert_post( [
                'post_title'   => $page['title'],
                'post_name'    => $page['slug'],
                'post_status'  => 'publish',
                'post_type'    => Constants::CPT_LANDING,
                'post_content' => '',
            ] );

            if ( $page_id && ! is_wp_error( $page_id ) ) {
                if ( ! empty( $page['page_type'] ) ) {
                    update_post_meta( $page_id, '_byrde_page_type', $page['page_type'] );
                }
            }
        }
    }

    /**
     * GitHub-based plugin auto-updater.
     */
    private function setup_update_checker(): void {
        if ( ! class_exists( PucFactory::class ) ) {
            return;
        }

        $checker = PucFactory::buildUpdateChecker(
            'https://github.com/tales-bluecrocus/byrde/',
            BYRDE_PLUGIN_FILE,
            'byrde'
        );

        $checker->setBranch( 'main' );
        $checker->getVcsApi()->enableReleaseAssets();

        $checker->addResultFilter( function ( $info ) {
            $icon_url = Helpers::plugin_uri() . '/front-end/dist/assets/logo.webp';
            $info->icons = [
                '1x'      => $icon_url,
                'default' => $icon_url,
            ];
            return $info;
        } );

        add_filter( 'upgrader_source_selection', function ( $source, $remote_source, $upgrader, $hook_extra ) {
            if ( ! isset( $hook_extra['plugin'] ) || plugin_basename( BYRDE_PLUGIN_FILE ) !== $hook_extra['plugin'] ) {
                return $source;
            }

            if ( basename( $source ) === 'byrde' ) {
                return $source;
            }

            global $wp_filesystem;

            $corrected_source = trailingslashit( $remote_source ) . 'byrde/';

            if ( $wp_filesystem->move( $source, $corrected_source ) ) {
                return $corrected_source;
            }

            return new \WP_Error( 'rename_failed', 'Could not rename the plugin folder during update.' );
        }, 10, 4 );
    }
}
