<?php

namespace Byrde\Content;

use Byrde\Core\Constants;

/**
 * SEO & Structured Data.
 *
 * Server-side rendering of meta tags and JSON-LD schemas.
 * SEO data is per-page, stored in _byrde_theme_config post meta.
 */
class SEO {

    /**
     * Hook into WordPress.
     */
    public function register(): void {
        add_action( 'wp_head', [ $this, 'force_noindex' ], 0 );
        add_action( 'wp_head', [ $this, 'output_meta' ], 1 );
        add_action( 'wp_head', [ $this, 'output_structured_data' ], 2 );
        add_filter( 'wp_robots', [ $this, 'wp_robots_noindex' ], 999 );
        add_filter( 'wp_sitemaps_post_types', [ $this, 'exclude_from_sitemap' ] );
        add_filter( 'document_title_parts', [ $this, 'custom_title' ] );
        add_filter( 'document_title_separator', [ $this, 'title_separator' ] );
    }

    /**
     * Get page-level SEO config from theme config post meta.
     *
     * @return array{siteName: string, tagline: string, description: string, ogImage: string}
     */
    public function get_page_seo( ?int $page_id = null ): array {
        $defaults = [
            'siteName'    => '',
            'tagline'     => '',
            'description' => '',
            'ogImage'     => '',
        ];

        if ( ! $page_id ) {
            $page_id = get_the_ID();
        }

        if ( ! $page_id ) {
            return $defaults;
        }

        $config = get_post_meta( $page_id, Constants::META_THEME_CONFIG, true );

        if ( is_string( $config ) && ! empty( $config ) ) {
            $config = json_decode( $config, true );
        }

        if ( ! is_array( $config ) || empty( $config['globalConfig']['seo'] ) ) {
            return $defaults;
        }

        return wp_parse_args( $config['globalConfig']['seo'], $defaults );
    }

    /**
     * Output SEO meta tags in wp_head.
     */
    public function output_meta(): void {
        if ( is_admin() || ! is_singular( Constants::CPT_LANDING ) ) {
            return;
        }

        $seo = $this->get_page_seo();

        if ( empty( $seo['siteName'] ) ) {
            return;
        }

        $site_name = esc_attr( $seo['siteName'] );
        $tagline   = esc_attr( $seo['tagline'] );
        $site_url  = esc_url( home_url() );

        $page_title = $tagline
            ? "{$site_name} - {$tagline}"
            : $site_name;

        $description = esc_attr( $seo['description'] );
        $og_image    = esc_url( $seo['ogImage'] );
        $canonical   = is_front_page() ? $site_url : ( get_permalink() ?: $site_url );
        ?>

        <!-- Primary Meta Tags -->
        <meta name="title" content="<?php echo $page_title; ?>">
        <?php if ( $description ) : ?>
        <meta name="description" content="<?php echo $description; ?>">
        <?php endif; ?>
        <meta name="author" content="<?php echo $site_name; ?>">

        <!-- Canonical -->
        <link rel="canonical" href="<?php echo esc_url( $canonical ); ?>">

        <!-- Open Graph / Facebook -->
        <meta property="og:type" content="website">
        <meta property="og:url" content="<?php echo esc_url( $canonical ); ?>">
        <meta property="og:title" content="<?php echo $page_title; ?>">
        <?php if ( $description ) : ?>
        <meta property="og:description" content="<?php echo $description; ?>">
        <?php endif; ?>
        <?php if ( $og_image ) : ?>
        <meta property="og:image" content="<?php echo $og_image; ?>">
        <?php endif; ?>
        <meta property="og:site_name" content="<?php echo $site_name; ?>">
        <meta property="og:locale" content="<?php echo get_locale(); ?>">

        <!-- Twitter -->
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:url" content="<?php echo esc_url( $canonical ); ?>">
        <meta name="twitter:title" content="<?php echo $page_title; ?>">
        <?php if ( $description ) : ?>
        <meta name="twitter:description" content="<?php echo $description; ?>">
        <?php endif; ?>
        <?php if ( $og_image ) : ?>
        <meta name="twitter:image" content="<?php echo $og_image; ?>">
        <?php endif; ?>

        <?php
    }

    /**
     * Force noindex/nofollow on all byrde_landing pages.
     *
     * Runs at priority 0 in wp_head so it always fires -- even when
     * SEO fields haven't been filled in.
     */
    public function force_noindex(): void {
        if ( is_admin() || ! is_singular( Constants::CPT_LANDING ) ) {
            return;
        }

        remove_filter( 'wp_robots', 'wp_robots_max_image_preview_large' );

        echo '<meta name="robots" content="noindex, nofollow">' . "\n";
    }

    /**
     * Override wp_robots filter for landing pages.
     * This overrides any SEO plugin that respects wp_robots (Yoast, RankMath, etc.).
     */
    public function wp_robots_noindex( array $robots ): array {
        if ( is_admin() || ! is_singular( Constants::CPT_LANDING ) ) {
            return $robots;
        }

        return [
            'noindex'  => true,
            'nofollow' => true,
        ];
    }

    /**
     * Exclude byrde_landing from WordPress core sitemap.
     */
    public function exclude_from_sitemap( array $post_types ): array {
        unset( $post_types[ Constants::CPT_LANDING ] );
        return $post_types;
    }

    /**
     * Output JSON-LD Structured Data.
     */
    public function output_structured_data(): void {
        if ( is_admin() || ! is_singular( Constants::CPT_LANDING ) ) {
            return;
        }

        $seo = $this->get_page_seo();

        if ( empty( $seo['siteName'] ) ) {
            return;
        }

        $schemas = [];

        // FAQ Schema (from page content).
        if ( is_singular( Constants::CPT_LANDING ) ) {
            $page_id = get_the_ID();
            if ( $page_id ) {
                $content = get_post_meta( $page_id, Constants::META_CONTENT, true );
                if ( ! empty( $content['faq']['faqs'] ) && is_array( $content['faq']['faqs'] ) ) {
                    $faq_items = [];
                    foreach ( $content['faq']['faqs'] as $faq ) {
                        if ( ! empty( $faq['question'] ) && ! empty( $faq['answer'] ) ) {
                            $faq_items[] = [
                                '@type'          => 'Question',
                                'name'           => wp_strip_all_tags( $faq['question'] ),
                                'acceptedAnswer' => [
                                    '@type' => 'Answer',
                                    'text'  => wp_strip_all_tags( $faq['answer'] ),
                                ],
                            ];
                        }
                    }
                    if ( ! empty( $faq_items ) ) {
                        $schemas[] = [
                            '@context'   => 'https://schema.org',
                            '@type'      => 'FAQPage',
                            'mainEntity' => $faq_items,
                        ];
                    }
                }
            }
        }

        // Breadcrumb Schema.
        $schemas[] = [
            '@context'        => 'https://schema.org',
            '@type'           => 'BreadcrumbList',
            'itemListElement' => [
                [
                    '@type'    => 'ListItem',
                    'position' => 1,
                    'name'     => 'Home',
                    'item'     => home_url(),
                ],
            ],
        ];

        // Output Schemas.
        foreach ( $schemas as $schema ) {
            echo '<script type="application/ld+json">' . wp_json_encode( $schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE ) . '</script>' . "\n";
        }
    }

    /**
     * Override WordPress title with page-level SEO.
     */
    public function custom_title( array $title ): array {
        if ( ! is_singular( Constants::CPT_LANDING ) ) {
            return $title;
        }

        $seo = $this->get_page_seo();

        if ( ! empty( $seo['siteName'] ) ) {
            $title['title'] = $seo['siteName'];

            if ( ! empty( $seo['tagline'] ) ) {
                $title['tagline'] = $seo['tagline'];
            }
        }

        return $title;
    }

    /**
     * Custom title separator.
     */
    public function title_separator( string $sep ): string {
        if ( ! is_singular( Constants::CPT_LANDING ) ) {
            return $sep;
        }
        return '-';
    }
}
