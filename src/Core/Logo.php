<?php

namespace Byrde\Core;

/**
 * Logo data for preload and wp_localize_script.
 */
class Logo {

    public function __construct(
        private \Byrde\Settings\Manager $settings,
    ) {}

    /**
     * Get the logo URL and alt text.
     * Shared between preload and wp_localize_script.
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

}
