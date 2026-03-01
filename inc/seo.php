<?php
/**
 * SEO & Structured Data
 *
 * Server-side rendering of meta tags and JSON-LD schemas.
 * SEO data is per-page, stored in _byrde_theme_config post meta.
 *
 * @package Byrde
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Get page-level SEO config from theme config post meta.
 * Returns array with keys: siteName, tagline, description, ogImage.
 */
function byrde_get_page_seo( ?int $page_id = null ): array {
    $defaults = array(
        'siteName'    => '',
        'tagline'     => '',
        'description' => '',
        'ogImage'     => '',
    );

    if ( ! $page_id ) {
        $page_id = get_the_ID();
    }

    if ( ! $page_id ) {
        return $defaults;
    }

    $config = get_post_meta( $page_id, '_byrde_theme_config', true );

    if ( is_string( $config ) && ! empty( $config ) ) {
        $config = json_decode( $config, true );
    }

    if ( ! is_array( $config ) || empty( $config['globalConfig']['seo'] ) ) {
        return $defaults;
    }

    return wp_parse_args( $config['globalConfig']['seo'], $defaults );
}

/**
 * Output SEO meta tags in wp_head
 */
function byrde_output_seo_meta(): void {
    // Skip in admin or non-Byrde pages
    if ( is_admin() || ! is_singular( BYRDE_CPT_LANDING ) ) {
        return;
    }

    $seo = byrde_get_page_seo();

    // Skip if no site name configured
    if ( empty( $seo['siteName'] ) ) {
        return;
    }

    $site_name = esc_attr( $seo['siteName'] );
    $tagline   = esc_attr( $seo['tagline'] );
    $site_url  = esc_url( home_url() );

    // Build page title
    $page_title = $tagline
        ? "{$site_name} - {$tagline}"
        : $site_name;

    // Meta description
    $description = esc_attr( $seo['description'] );

    // OG Image
    $og_image = esc_url( $seo['ogImage'] );

    // Canonical URL
    $canonical = is_front_page() ? $site_url : ( get_permalink() ?: $site_url );
    ?>

    <!-- Primary Meta Tags -->
    <meta name="title" content="<?php echo $page_title; ?>">
    <?php if ( $description ) : ?>
    <meta name="description" content="<?php echo $description; ?>">
    <?php endif; ?>
    <meta name="robots" content="noindex, nofollow">
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
add_action( 'wp_head', 'byrde_output_seo_meta', 1 );

/**
 * Output JSON-LD Structured Data
 */
function byrde_output_structured_data(): void {
    // Skip in admin or non-Byrde pages
    if ( is_admin() || ! is_singular( BYRDE_CPT_LANDING ) ) {
        return;
    }

    $seo = byrde_get_page_seo();

    // Skip if no site name configured
    if ( empty( $seo['siteName'] ) ) {
        return;
    }

    $schemas = array();

    // ========================================
    // FAQ Schema (from page content)
    // ========================================
    if ( is_singular( BYRDE_CPT_LANDING ) ) {
        $page_id = get_the_ID();
        if ( $page_id ) {
            $content = get_post_meta( $page_id, '_byrde_content', true );
            if ( ! empty( $content['faq']['faqs'] ) && is_array( $content['faq']['faqs'] ) ) {
                $faq_items = array();
                foreach ( $content['faq']['faqs'] as $faq ) {
                    if ( ! empty( $faq['question'] ) && ! empty( $faq['answer'] ) ) {
                        $faq_items[] = array(
                            '@type'          => 'Question',
                            'name'           => $faq['question'],
                            'acceptedAnswer' => array(
                                '@type' => 'Answer',
                                'text'  => $faq['answer'],
                            ),
                        );
                    }
                }
                if ( ! empty( $faq_items ) ) {
                    $schemas[] = array(
                        '@context'   => 'https://schema.org',
                        '@type'      => 'FAQPage',
                        'mainEntity' => $faq_items,
                    );
                }
            }
        }
    }

    // ========================================
    // Breadcrumb Schema
    // ========================================
    $schemas[] = array(
        '@context'        => 'https://schema.org',
        '@type'           => 'BreadcrumbList',
        'itemListElement' => array(
            array(
                '@type'    => 'ListItem',
                'position' => 1,
                'name'     => 'Home',
                'item'     => home_url(),
            ),
        ),
    );

    // ========================================
    // Output Schemas
    // ========================================
    foreach ( $schemas as $schema ) {
        echo '<script type="application/ld+json">' . wp_json_encode( $schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE ) . '</script>' . "\n";
    }
}
add_action( 'wp_head', 'byrde_output_structured_data', 2 );

/**
 * Override WordPress title with page-level SEO
 */
function byrde_custom_title( array $title ): array {
    if ( ! is_singular( BYRDE_CPT_LANDING ) ) {
        return $title;
    }

    $seo = byrde_get_page_seo();

    if ( ! empty( $seo['siteName'] ) ) {
        $title['title'] = $seo['siteName'];

        if ( ! empty( $seo['tagline'] ) ) {
            $title['tagline'] = $seo['tagline'];
        }
    }

    return $title;
}
add_filter( 'document_title_parts', 'byrde_custom_title' );

/**
 * Custom title separator
 */
function byrde_title_separator( string $sep ): string {
    if ( ! is_singular( BYRDE_CPT_LANDING ) ) {
        return $sep;
    }
    return '-';
}
add_filter( 'document_title_separator', 'byrde_title_separator' );
