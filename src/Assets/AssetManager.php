<?php

namespace Byrde\Assets;

use Byrde\Core\Constants;
use Byrde\Core\Helpers;
use Byrde\Core\Logo;
use Byrde\Settings\Manager;
use Byrde\Settings\Cache;

/**
 * Front-end asset management: enqueue, preload, critical CSS, async loading.
 */
class AssetManager {

    public function __construct(
        private Manager $settings,
        private Cache   $cache,
        private Logo    $logo,
    ) {}

    /**
     * Register WordPress hooks.
     */
    public function register(): void {
        add_action( 'wp_enqueue_scripts', [ $this, 'enqueue' ] );
        add_action( 'wp_head', [ $this, 'preload' ], 1 );
        add_action( 'wp_head', [ $this, 'inline_critical_css' ], 2 );
        add_filter( 'style_loader_tag', [ $this, 'async_css' ], 10, 2 );
        add_filter( 'script_loader_tag', [ $this, 'script_type' ], 10, 2 );
    }

    /**
     * Enqueue front-end assets (fixed filenames, version-based cache busting).
     */
    public function enqueue(): void {
        // Only enqueue on byrde_landing pages.
        if ( ! is_singular( Constants::CPT_LANDING ) ) {
            return;
        }

        $dist_dir = BYRDE_PLUGIN_DIR . 'front-end/dist';
        $dist_uri = Helpers::plugin_uri() . '/front-end/dist';
        $version  = $this->cache->get_version();

        if ( file_exists( $dist_dir . '/assets/style.css' ) ) {
            wp_enqueue_style(
                'byrde-main',
                $dist_uri . '/assets/style.css',
                [],
                $version
            );
        }

        if ( file_exists( $dist_dir . '/assets/main.js' ) ) {
            wp_enqueue_script(
                'byrde-main',
                $dist_uri . '/assets/main.js',
                [],
                $version,
                true
            );

            // Pass theme settings + API URL to React.
            $settings            = $this->settings->get_all();
            $settings['apiUrl']  = rest_url( Constants::REST_NAMESPACE );

            // Apply logo fallback if no logo is configured.
            if ( empty( $settings['logo'] ) ) {
                $logo_data            = $this->logo->get_data();
                $settings['logo']     = $logo_data['url'];
                $settings['logo_alt'] = $logo_data['alt'];
            }

            // Include contact form settings for admins (not exposed publicly).
            if ( current_user_can( 'manage_options' ) ) {
                $settings['postmark_api_token']      = $this->settings->get( 'postmark_api_token' );
                $settings['contact_form_to_email']   = $this->settings->get( 'contact_form_to_email' );
                $settings['contact_form_from_email'] = $this->settings->get( 'contact_form_from_email' );
                $settings['contact_form_subject']    = $this->settings->get( 'contact_form_subject' );
            }

            wp_localize_script( 'byrde-main', 'byrdeSettings', $settings );
        }
    }

    /**
     * Preload critical resources: CSS, JS module, Google Fonts, LCP logo image.
     * Outputs early in <head> so browser discovers resources ASAP.
     */
    public function preload(): void {
        // Only on byrde_landing pages.
        if ( ! is_singular( Constants::CPT_LANDING ) ) {
            return;
        }

        $dist_dir = BYRDE_PLUGIN_DIR . 'front-end/dist';
        $dist_uri = Helpers::plugin_uri() . '/front-end/dist';
        $version  = $this->cache->get_version();

        // Preload CSS -- browser discovers stylesheet before parsing full HTML.
        if ( file_exists( $dist_dir . '/assets/style.css' ) ) {
            printf(
                '<link rel="preload" as="style" href="%s">' . "\n",
                esc_url( $dist_uri . '/assets/style.css?ver=' . $version )
            );
        }

        // Modulepreload JS bundle -- browser downloads in parallel with CSS (breaks sequential chain).
        if ( file_exists( $dist_dir . '/assets/main.js' ) ) {
            printf(
                '<link rel="modulepreload" href="%s">' . "\n",
                esc_url( $dist_uri . '/assets/main.js?ver=' . $version )
            );
        }

        // Preconnect to Google Fonts.
        echo '<link rel="preconnect" href="https://fonts.googleapis.com">' . "\n";
        echo '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' . "\n";

        // Load Google Fonts non-blocking (media="print" trick + swap).
        echo '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&amp;family=Outfit:wght@100..900&amp;display=swap" media="print" onload="this.media=\'all\'">' . "\n";
        echo '<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&amp;family=Outfit:wght@100..900&amp;display=swap"></noscript>' . "\n";

        // Preload LCP logo image.
        $logo = $this->logo->get_data();
        if ( ! empty( $logo['url'] ) ) {
            printf(
                '<link rel="preload" as="image" href="%s" fetchpriority="high">' . "\n",
                esc_url( $logo['url'] )
            );
        }

        // Favicon -- use logo (or fallback). Skipped when WP has a site icon set.
        if ( ! has_site_icon() && ! empty( $logo['url'] ) ) {
            printf(
                '<link rel="icon" href="%s" type="%s">' . "\n",
                esc_url( $logo['url'] ),
                esc_attr( Helpers::image_mime( $logo['url'] ) )
            );
            printf(
                '<link rel="apple-touch-icon" href="%s">' . "\n",
                esc_url( $logo['url'] )
            );
        }
    }

    /**
     * Inline critical CSS so the browser can paint the shell immediately,
     * without waiting for the external stylesheet to download.
     */
    public function inline_critical_css(): void {
        if ( ! is_singular( Constants::CPT_LANDING ) ) {
            return;
        }
        ?>
        <style id="byrde-critical">
        html{scroll-behavior:smooth}
        body{font-family:"DM Sans",system-ui,sans-serif;background-color:#000;color:#fff;line-height:1.6;-webkit-font-smoothing:antialiased;margin:0}
        #root{min-height:100vh}
        </style>
        <?php
    }

    /**
     * Make byrde-main CSS load non-blocking (media="print" -> swap to "all" on load).
     * Critical CSS is already inlined, so full stylesheet is enhancement-only.
     *
     * @param string $tag    Full <link> tag.
     * @param string $handle Asset handle.
     * @return string Modified tag.
     */
    public function async_css( string $tag, string $handle ): string {
        if ( 'byrde-main' !== $handle || ! is_singular( Constants::CPT_LANDING ) ) {
            return $tag;
        }
        // Skip in editor preview -- load CSS normally for FOUC-free editing.
        // phpcs:ignore WordPress.Security.NonceVerification.Recommended
        if ( ! empty( $_GET[ Constants::QUERY_PREVIEW ] ) ) {
            return $tag;
        }
        // Replace media="all" with media="print" + onload swap.
        $tag = str_replace(
            "media='all'",
            "media='print' onload=\"this.media='all'\"",
            $tag
        );
        // Also handle double-quoted variant.
        $tag = str_replace(
            'media="all"',
            'media="print" onload="this.media=\'all\'"',
            $tag
        );
        // Add noscript fallback.
        $tag .= '<noscript>' . str_replace(
            [ "media='print'", 'media="print"' ],
            [ "media='all'", 'media="all"' ],
            // Remove the onload attribute from noscript version.
            preg_replace( '/\s*onload="[^"]*"/', '', $tag )
        ) . '</noscript>' . "\n";
        return $tag;
    }

    /**
     * Add module type to our script tag.
     *
     * @param string $tag    Full <script> tag.
     * @param string $handle Asset handle.
     * @return string Modified tag.
     */
    public function script_type( string $tag, string $handle ): string {
        if ( 'byrde-main' === $handle ) {
            return str_replace( '<script ', '<script type="module" ', $tag );
        }
        return $tag;
    }
}
