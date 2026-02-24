<?php
/**
 * SEO & Structured Data
 *
 * Server-side rendering of meta tags and JSON-LD schemas.
 * All data comes from ACF Theme Settings.
 *
 * @package LakeCity
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Output SEO meta tags in wp_head
 */
function lakecity_output_seo_meta(): void {
    // Skip in admin or preview mode
    if ( is_admin() ) {
        return;
    }

    $settings = lakecity_get_all_settings();

    // Skip if no site name configured
    if ( empty( $settings['site_name'] ) ) {
        return;
    }

    $site_name    = esc_attr( $settings['site_name'] );
    $site_tagline = esc_attr( $settings['site_tagline'] ?? '' );
    $site_url     = esc_url( $settings['site_url'] ?? home_url() );

    // Build page title
    $page_title = $site_tagline
        ? "{$site_name} - {$site_tagline}"
        : $site_name;

    // Meta description
    $description = esc_attr( $settings['site_description'] ?? '' );

    // OG Image
    $og_image = esc_url( $settings['og_image'] ?? '' );

    // Keywords
    $keywords = esc_attr( $settings['site_keywords'] ?? '' );

    // Canonical URL
    $canonical = is_front_page() ? $site_url : get_permalink();
    ?>

    <!-- Primary Meta Tags -->
    <meta name="title" content="<?php echo $page_title; ?>">
    <?php if ( $description ) : ?>
    <meta name="description" content="<?php echo $description; ?>">
    <?php endif; ?>
    <meta name="robots" content="index, follow">
    <meta name="author" content="<?php echo $site_name; ?>">
    <?php if ( $keywords ) : ?>
    <meta name="keywords" content="<?php echo $keywords; ?>">
    <?php endif; ?>

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
add_action( 'wp_head', 'lakecity_output_seo_meta', 1 );

/**
 * Output JSON-LD Structured Data
 */
function lakecity_output_structured_data(): void {
    // Skip in admin
    if ( is_admin() ) {
        return;
    }

    $settings = lakecity_get_all_settings();

    // Skip if no site name configured
    if ( empty( $settings['site_name'] ) ) {
        return;
    }

    $schemas = array();

    // ========================================
    // FAQ Schema (from page content)
    // ========================================
    if ( is_singular( 'page' ) ) {
        $page_id = get_the_ID();
        if ( $page_id ) {
            $content = get_post_meta( $page_id, '_lakecity_content', true );
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
                'item'     => $settings['site_url'],
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
add_action( 'wp_head', 'lakecity_output_structured_data', 2 );

/**
 * Override WordPress title
 */
function lakecity_custom_title( array $title ): array {
    $site_name = get_bloginfo( 'name' );

    if ( ! empty( $site_name ) ) {
        $title['title'] = $site_name;

        $tagline = get_bloginfo( 'description' );
        if ( ! empty( $tagline ) ) {
            $title['tagline'] = $tagline;
        }
    }

    return $title;
}
add_filter( 'document_title_parts', 'lakecity_custom_title' );

/**
 * Custom title separator
 */
function lakecity_title_separator( string $sep ): string {
    return '-';
}
add_filter( 'document_title_separator', 'lakecity_title_separator' );
