<?php

namespace Byrde\Assets;

use Byrde\Core\Constants;
use Byrde\Core\Helpers;
use Byrde\Core\Logo;
use Byrde\Settings\Manager;
use Byrde\Settings\Cache;

/**
 * Front-end asset management: enqueue, preload, critical CSS, async loading.
 *
 * Uses Vite manifest (.vite/manifest.json) to resolve hashed filenames,
 * ensuring CDN-safe cache busting without relying on ?ver= query params.
 */
class AssetManager {

    /** @var array<string, array{file: string, css?: string[]}> Vite manifest cache. */
    private ?array $manifest = null;

    /** @var bool Whether current request is editor preview. */
    private ?bool $is_preview = null;

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
     * Check if current request is editor preview.
     */
    private function is_preview(): bool {
        if ( null === $this->is_preview ) {
            // phpcs:ignore WordPress.Security.NonceVerification.Recommended
            $this->is_preview = ! empty( $_GET[ Constants::QUERY_PREVIEW ] );
        }
        return $this->is_preview;
    }

    /**
     * Get the dist subdirectory for the current build.
     *
     * Production: dist/          (built by vite.config.ts)
     * Editor:     dist/editor/   (built by vite.config.editor.ts)
     */
    private function dist_subdir(): string {
        return $this->is_preview() ? 'front-end/dist/editor/' : 'front-end/dist/';
    }

    /**
     * Get the Vite manifest entry key for the current build.
     */
    private function get_entry(): string {
        return $this->is_preview() ? 'editor.html' : 'index.html';
    }

    /**
     * Read and cache the Vite manifest for the current build.
     *
     * @return array<string, array{file: string, css?: string[]}>
     */
    private function get_manifest(): array {
        if ( null !== $this->manifest ) {
            return $this->manifest;
        }

        $manifest_path = BYRDE_PLUGIN_DIR . $this->dist_subdir() . '.vite/manifest.json';
        if ( ! file_exists( $manifest_path ) ) {
            $this->manifest = [];
            return $this->manifest;
        }

        $json = file_get_contents( $manifest_path );
        $this->manifest = json_decode( $json, true ) ?: [];
        return $this->manifest;
    }

    /**
     * Resolve a source file to its hashed dist URL.
     *
     * @param string $entry Source entry (e.g. 'index.html').
     * @return string|null Full URL or null if not found.
     */
    private function asset_url( string $entry ): ?string {
        $manifest = $this->get_manifest();
        if ( ! isset( $manifest[ $entry ]['file'] ) ) {
            return null;
        }
        return Helpers::plugin_uri() . '/' . $this->dist_subdir() . $manifest[ $entry ]['file'];
    }

    /**
     * Resolve a source file to its hashed dist path.
     *
     * @param string $entry Source entry (e.g. 'index.html').
     * @return string|null Absolute filesystem path or null if not found.
     */
    private function asset_path( string $entry ): ?string {
        $manifest = $this->get_manifest();
        if ( ! isset( $manifest[ $entry ]['file'] ) ) {
            return null;
        }
        return BYRDE_PLUGIN_DIR . $this->dist_subdir() . $manifest[ $entry ]['file'];
    }

    /**
     * Get CSS files associated with a manifest entry (including imported chunks).
     *
     * @param string $entry Source entry.
     * @return string[] Array of full CSS URLs.
     */
    private function css_urls( string $entry ): array {
        $manifest = $this->get_manifest();
        $base     = Helpers::plugin_uri() . '/' . $this->dist_subdir();
        $css      = [];

        // Collect CSS from the entry itself.
        foreach ( $manifest[ $entry ]['css'] ?? [] as $file ) {
            $css[] = $base . $file;
        }

        // Collect CSS from imported chunks (e.g. vendor chunk).
        foreach ( $manifest[ $entry ]['imports'] ?? [] as $import_key ) {
            foreach ( $manifest[ $import_key ]['css'] ?? [] as $file ) {
                $css[] = $base . $file;
            }
        }

        return array_unique( $css );
    }

    /**
     * Enqueue front-end assets using Vite manifest for hashed filenames.
     */
    public function enqueue(): void {
        // Only enqueue on byrde_landing pages.
        if ( ! is_singular( Constants::CPT_LANDING ) ) {
            return;
        }

        $entry    = $this->get_entry();
        $js_url   = $this->asset_url( $entry );
        $js_path  = $this->asset_path( $entry );
        $css_urls = $this->css_urls( $entry );

        // Enqueue CSS (extracted by Vite from the JS entry).
        if ( ! empty( $css_urls ) ) {
            wp_enqueue_style(
                'byrde-main',
                $css_urls[0],
                [],
                null // Hash is in the filename — no ?ver= needed.
            );
        }

        if ( $js_url && $js_path && file_exists( $js_path ) ) {
            wp_enqueue_script(
                'byrde-main',
                $js_url,
                [],
                null, // Hash is in the filename — no ?ver= needed.
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

        $entry    = $this->get_entry();
        $css_urls = $this->css_urls( $entry );
        $js_url   = $this->asset_url( $entry );

        // Preload CSS -- browser discovers stylesheet before parsing full HTML.
        if ( ! empty( $css_urls ) ) {
            printf(
                '<link rel="preload" as="style" href="%s">' . "\n",
                esc_url( $css_urls[0] )
            );
        }

        // Modulepreload JS bundle -- browser downloads in parallel with CSS.
        if ( $js_url ) {
            printf(
                '<link rel="modulepreload" href="%s">' . "\n",
                esc_url( $js_url )
            );
        }

        // Modulepreload imported chunks (vendor) — browser fetches in parallel.
        $manifest = $this->get_manifest();
        $base     = Helpers::plugin_uri() . '/' . $this->dist_subdir();
        foreach ( $manifest[ $entry ]['imports'] ?? [] as $import_key ) {
            if ( isset( $manifest[ $import_key ]['file'] ) ) {
                printf(
                    '<link rel="modulepreload" href="%s">' . "\n",
                    esc_url( $base . $manifest[ $import_key ]['file'] )
                );
            }
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
        body{font-family:"DM Sans",system-ui,sans-serif;line-height:1.6;-webkit-font-smoothing:antialiased;margin:0}
        #root{min-height:100vh}
        @keyframes sk-shimmer{0%{background-position:200% 0}to{background-position:-200% 0}}
        [data-skeleton] .sk{animation:sk-shimmer 1.8s ease-in-out infinite}
        @media(max-width:639px){.sk-hide-mobile{display:none!important}}
        @media(min-width:1024px){.sk-hero-grid{grid-template-columns:1fr 1fr!important;gap:5rem!important}}
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
