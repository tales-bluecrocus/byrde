<?php

namespace Byrde\Core;

/**
 * Logo data and HTML shell for LCP optimization.
 */
class Logo {

    public function __construct(
        private \Byrde\Settings\Manager $settings,
    ) {}

    /**
     * Get the logo URL and alt text.
     * Shared between preload, shell render, and wp_localize_script.
     *
     * @return array{url: string, alt: string}
     */
    public function get_data(): array {
        $site_name = get_bloginfo( 'name' );
        $all       = $this->settings->get_all();
        $logo_url  = $all['logo'] ?? '';
        $logo_alt  = $all['logo_alt'] ?? '';

        if ( ! empty( $logo_url ) ) {
            return [
                'url' => $logo_url,
                'alt' => $logo_alt ?: $site_name,
            ];
        }

        // Fallback to bundled logo.
        $dist_dir = BYRDE_PLUGIN_DIR . 'front-end/dist';
        if ( file_exists( $dist_dir . '/assets/logo.webp' ) ) {
            return [
                'url' => Helpers::plugin_uri() . '/front-end/dist/assets/logo.webp',
                'alt' => $site_name,
            ];
        }

        return [ 'url' => '', 'alt' => $site_name ];
    }

    /**
     * Render an HTML shell inside #root so the browser can paint and discover
     * the LCP image (logo) before React loads. React's createRoot() replaces
     * this content on mount.
     */
    public function render_shell(): void {
        // Skip in editor preview -- React handles everything there.
        // phpcs:ignore WordPress.Security.NonceVerification.Recommended
        if ( ! empty( $_GET[ Constants::QUERY_PREVIEW ] ) ) {
            return;
        }

        $logo  = $this->get_data();
        $phone = $this->settings->get( 'phone' );
        ?>
        <div style="min-height:100vh;background:#171717">
            <header style="padding:1rem 1.5rem">
                <div style="max-width:80rem;margin:0 auto;display:flex;align-items:center;justify-content:space-between">
                    <?php if ( ! empty( $logo['url'] ) ) : ?>
                        <img
                            src="<?php echo esc_url( $logo['url'] ); ?>"
                            alt="<?php echo esc_attr( $logo['alt'] ); ?>"
                            width="64"
                            height="64"
                            fetchpriority="high"
                            style="height:3.5rem;width:auto"
                        />
                    <?php endif; ?>
                    <?php if ( $phone ) : ?>
                        <a href="tel:<?php echo esc_attr( \Byrde\Settings\Manager::phone_to_raw( $phone ) ); ?>" style="display:none"></a>
                    <?php endif; ?>
                </div>
            </header>
        </div>
        <?php
    }
}
