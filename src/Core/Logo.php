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
     * Render a static skeleton inside #root for instant FCP.
     *
     * The browser paints this HTML immediately (no JS needed).
     * React's createRoot() replaces it when the app mounts.
     * Matches the Header + Hero visual layout so the transition is seamless.
     */
    public function render_shell(): void {
        $logo     = $this->get_data();
        $settings = $this->settings->get_all();
        $phone    = $settings['phone'] ?? '';

        // Get hero content from post meta.
        $page_id  = get_the_ID();
        $content  = $page_id ? get_post_meta( $page_id, Constants::META_CONTENT, true ) : [];
        $headline = $content['hero']['headline'] ?? '';

        ?>
        <div data-skeleton style="background:var(--color-dark-950,#09090b);min-height:100vh">
            <?php // Header skeleton ?>
            <header style="padding:1rem 1.5rem;display:flex;align-items:center;justify-content:space-between">
                <?php if ( ! empty( $logo['url'] ) ) : ?>
                    <img src="<?php echo esc_url( $logo['url'] ); ?>"
                         alt="<?php echo esc_attr( $logo['alt'] ); ?>"
                         width="auto" height="56"
                         style="height:56px;width:auto"
                         fetchpriority="high">
                <?php endif; ?>
                <?php if ( $phone ) : ?>
                    <a href="tel:<?php echo esc_attr( $settings['phone_raw'] ?? '' ); ?>"
                       style="display:none;padding:0.75rem 1.5rem;border-radius:12px;background:var(--color-dark-accent,#3ab342);color:#fff;text-decoration:none;font-weight:600;font-size:0.875rem"
                       class="byrde-sk-phone">
                        <?php echo esc_html( $phone ); ?>
                    </a>
                <?php endif; ?>
            </header>

            <?php // Hero skeleton ?>
            <div style="padding:3rem 1.5rem;max-width:80rem;margin:0 auto">
                <?php if ( $headline ) : ?>
                    <h1 style="font-family:Outfit,system-ui,sans-serif;font-size:clamp(2.25rem,5vw,3.75rem);font-weight:800;line-height:1.1;color:var(--color-dark-text,#fafafa);margin:0 0 1rem">
                        <?php echo wp_kses_post( $headline ); ?>
                    </h1>
                <?php endif; ?>
            </div>
        </div>
        <?php
    }
}
