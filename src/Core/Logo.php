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
     * Render a styled skeleton inside #root for instant FCP.
     *
     * The browser paints this HTML immediately (no JS needed).
     * React's createRoot() replaces it when the app mounts.
     *
     * Reads page config (header, topbar, hero) from post meta to replicate
     * the exact layout structure and minimize CLS when React takes over.
     */
    public function render_shell(): void {
        $logo     = $this->get_data();
        $settings = $this->settings->get_all();
        $phone    = $settings['phone'] ?? '';

        // Read page config from post meta.
        $page_id   = get_the_ID();
        $theme_raw = $page_id ? get_post_meta( $page_id, Constants::META_THEME_CONFIG, true ) : '';
        $cfg       = $theme_raw ? json_decode( $theme_raw, true ) : [];

        // Color mode: page override → site default.
        $mode    = $cfg['globalConfig']['brand']['mode'] ?? ( $settings['brand_mode'] ?? 'dark' );
        $is_dark = 'dark' === $mode;

        // Hero section can override page mode.
        $hero_theme = $cfg['sectionThemes']['hero'] ?? [];
        $hero_mode  = $hero_theme['paletteMode'] ?? $mode;
        $hero_dark  = 'dark' === $hero_mode;

        // Colors.
        $bg        = $is_dark ? '#09090b' : '#ffffff';
        $hero_bg   = $hero_dark ? '#171717' : '#f8f8f8';
        $bar_bg    = $hero_dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
        $bar_shine = $hero_dark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.12)';
        $primary   = $is_dark
            ? ( $settings['brand_dark_primary'] ?? '#3ab342' )
            : ( $settings['brand_light_primary'] ?? '#3ab342' );

        $shimmer = "linear-gradient(90deg,{$bar_bg} 25%,{$bar_shine} 50%,{$bar_bg} 75%)";

        // Header/topbar config.
        $header_cfg  = $cfg['header'] ?? [];
        $topbar_cfg  = $cfg['topbar'] ?? [];
        $show_topbar = ! empty( $header_cfg['showTopbar'] );
        $show_phone  = $header_cfg['showPhone'] ?? true;
        $show_badge  = $header_cfg['showBadge'] ?? true;

        // Topbar section theme for bg color.
        $top_theme  = $cfg['sectionThemes']['topheader'] ?? [];
        $topbar_bg  = $top_theme['bgColor'] ?? ( $is_dark ? '#1f1f1f' : '#f8f8f8' );
        $topbar_pad = [ 'sm' => '0.25rem', 'md' => '0.5rem', 'lg' => '0.75rem', 'xl' => '1rem' ];
        $top_py     = $topbar_pad[ $top_theme['padding'] ?? 'md' ] ?? '0.5rem';

        // Header section theme for padding.
        $hdr_theme = $cfg['sectionThemes']['header'] ?? [];
        $hdr_pad   = [ 'sm' => '0.5rem', 'md' => '1rem', 'lg' => '1.5rem', 'xl' => '2rem' ];
        $hdr_py    = $hdr_pad[ $hdr_theme['padding'] ?? 'md' ] ?? '1rem';

        // Hero bg image.
        $hero_has_bg = ! empty( $hero_theme['bgImage'] );
        $hero_bg_img = $hero_theme['bgImage'] ?? '';
        $hero_bg_opacity = $hero_theme['bgImageOpacity'] ?? 0.5;

        // Form card colors.
        $form_dark   = 'dark' === ( $hero_theme['formPaletteMode'] ?? $hero_mode );
        $form_bg     = $hero_theme['formBg'] ?? ( $form_dark ? '#1f1f1f' : '#f8f8f8' );
        $form_border = $form_dark ? '#333333' : '#d4d4d4';

        ?>
        <div data-skeleton style="background:<?php echo esc_attr( $bg ); ?>;min-height:100vh">

            <?php // ─── Topbar skeleton ─── ?>
            <?php if ( $show_topbar ) : ?>
                <div style="padding:<?php echo esc_attr( $top_py ); ?> 0;background:<?php echo esc_attr( $topbar_bg ); ?>;font-size:0.875rem">
                    <div style="max-width:80rem;margin:0 auto;padding:0 1.5rem;display:flex;align-items:center;justify-content:space-between">
                        <span class="sk" style="display:inline-block;width:220px;height:1rem;border-radius:0.25rem;background:<?php echo esc_attr( $shimmer ); ?>;background-size:200% 100%"></span>
                        <span class="sk sk-hide-mobile" style="display:inline-block;width:280px;height:1rem;border-radius:0.25rem;background:<?php echo esc_attr( $shimmer ); ?>;background-size:200% 100%"></span>
                    </div>
                </div>
            <?php endif; ?>

            <?php // ─── Header skeleton ─── ?>
            <header style="padding:<?php echo esc_attr( $hdr_py ); ?> 0">
                <div style="max-width:80rem;margin:0 auto;padding:0 1.5rem;display:flex;align-items:center;justify-content:space-between">
                    <?php // Logo ?>
                    <?php if ( ! empty( $logo['url'] ) ) : ?>
                        <div style="padding:0.5rem 0.75rem">
                            <img src="<?php echo esc_url( $logo['url'] ); ?>"
                                 alt="<?php echo esc_attr( $logo['alt'] ); ?>"
                                 width="auto" height="56"
                                 style="height:56px;width:auto"
                                 fetchpriority="high">
                        </div>
                    <?php endif; ?>

                    <?php // Right side: badge + phone button placeholders ?>
                    <div style="display:flex;align-items:center;gap:0.75rem">
                        <?php if ( $show_badge ) : ?>
                            <span class="sk sk-hide-mobile" style="display:inline-block;width:130px;height:40px;border-radius:9999px;background:<?php echo esc_attr( $shimmer ); ?>;background-size:200% 100%"></span>
                        <?php endif; ?>
                        <?php if ( $show_phone && $phone ) : ?>
                            <span class="sk sk-hide-mobile" style="display:inline-block;width:170px;height:44px;border-radius:var(--color-button-radius,12px);background:<?php echo esc_attr( $primary ); ?>;opacity:0.3"></span>
                        <?php endif; ?>
                    </div>
                </div>
            </header>

            <?php // ─── Hero skeleton ─── ?>
            <main>
            <div style="position:relative;overflow:hidden;padding:4rem 1rem 4rem;<?php echo $hero_has_bg ? '' : 'background:' . esc_attr( $hero_bg ) . ';'; ?>">
                <?php // Background image + overlay (if set) ?>
                <?php if ( $hero_has_bg ) : ?>
                    <div style="position:absolute;inset:0;background:url(<?php echo esc_url( $hero_bg_img ); ?>) center/cover no-repeat"></div>
                    <div style="position:absolute;inset:0;background:<?php echo esc_attr( $hero_dark ? '#171717' : '#ffffff' ); ?>;opacity:<?php echo esc_attr( 1 - $hero_bg_opacity ); ?>"></div>
                <?php endif; ?>

                <?php // 2-column grid matching Hero component: lg:grid-cols-2 gap-20 ?>
                <div style="position:relative;max-width:80rem;margin:0 auto;padding:0 0.5rem;display:grid;grid-template-columns:1fr;gap:1.5rem" class="sk-hero-grid">
                    <?php // Left column: headline + subheadline placeholders ?>
                    <div style="display:flex;flex-direction:column;gap:1rem;padding-top:1rem">
                        <?php // Badge pill ?>
                        <span class="sk" style="display:inline-block;width:200px;height:2rem;border-radius:9999px;background:<?php echo esc_attr( $shimmer ); ?>;background-size:200% 100%"></span>

                        <?php // Headline bars ?>
                        <div style="display:flex;flex-direction:column;gap:0.75rem">
                            <span class="sk" style="display:block;height:2.75rem;width:90%;border-radius:0.5rem;background:<?php echo esc_attr( $shimmer ); ?>;background-size:200% 100%"></span>
                            <span class="sk" style="display:block;height:2.75rem;width:70%;border-radius:0.5rem;background:<?php echo esc_attr( $shimmer ); ?>;background-size:200% 100%"></span>
                            <span class="sk" style="display:block;height:2.75rem;width:50%;border-radius:0.5rem;background:<?php echo esc_attr( $shimmer ); ?>;background-size:200% 100%"></span>
                        </div>

                        <?php // Subheadline bars ?>
                        <div style="display:flex;flex-direction:column;gap:0.5rem;margin-top:0.5rem">
                            <span class="sk" style="display:block;height:1rem;width:85%;border-radius:0.25rem;background:<?php echo esc_attr( $shimmer ); ?>;background-size:200% 100%"></span>
                            <span class="sk" style="display:block;height:1rem;width:65%;border-radius:0.25rem;background:<?php echo esc_attr( $shimmer ); ?>;background-size:200% 100%"></span>
                        </div>
                    </div>

                    <?php // Right column: form card placeholder ?>
                    <div style="background:<?php echo esc_attr( $form_bg ); ?>;border:1px solid <?php echo esc_attr( $form_border ); ?>;border-radius:1rem;padding:2rem;display:flex;flex-direction:column;gap:1.25rem">
                        <?php // Form title ?>
                        <span class="sk" style="display:block;height:1.5rem;width:70%;border-radius:0.25rem;margin:0 auto;background:<?php echo esc_attr( $shimmer ); ?>;background-size:200% 100%"></span>
                        <span class="sk" style="display:block;height:0.875rem;width:55%;border-radius:0.25rem;margin:0 auto;background:<?php echo esc_attr( $shimmer ); ?>;background-size:200% 100%"></span>

                        <?php // Form inputs ?>
                        <span class="sk" style="display:block;height:3rem;width:100%;border-radius:0.5rem;background:<?php echo esc_attr( $shimmer ); ?>;background-size:200% 100%"></span>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
                            <span class="sk" style="display:block;height:3rem;border-radius:0.5rem;background:<?php echo esc_attr( $shimmer ); ?>;background-size:200% 100%"></span>
                            <span class="sk" style="display:block;height:3rem;border-radius:0.5rem;background:<?php echo esc_attr( $shimmer ); ?>;background-size:200% 100%"></span>
                        </div>
                        <span class="sk" style="display:block;height:3rem;width:100%;border-radius:0.5rem;background:<?php echo esc_attr( $shimmer ); ?>;background-size:200% 100%"></span>

                        <?php // Submit button ?>
                        <span class="sk" style="display:block;height:3rem;width:100%;border-radius:0.5rem;background:<?php echo esc_attr( $primary ); ?>;opacity:0.4"></span>
                    </div>
                </div>
            </div>
            </main>
        </div>
        <?php
    }
}
