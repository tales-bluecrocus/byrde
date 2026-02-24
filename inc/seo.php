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
    // LocalBusiness Schema
    // ========================================
    if ( ! empty( $settings['schema_street'] ) || ! empty( $settings['schema_city'] ) ) {
        $local_business = array(
            '@context'   => 'https://schema.org',
            '@type'      => $settings['schema_type'] ?? 'LocalBusiness',
            'name'       => $settings['site_name'],
            '@id'        => $settings['site_url'],
            'url'        => $settings['site_url'],
        );

        // Description
        if ( ! empty( $settings['site_description'] ) ) {
            $local_business['description'] = $settings['site_description'];
        }

        // Logo
        if ( ! empty( $settings['logo'] ) ) {
            $local_business['logo'] = $settings['logo'];
        }

        // Image
        if ( ! empty( $settings['og_image'] ) ) {
            $local_business['image'] = $settings['og_image'];
        }

        // Phone
        if ( ! empty( $settings['phone'] ) ) {
            $local_business['telephone'] = $settings['phone'];
        }

        // Price Range
        if ( ! empty( $settings['schema_price_range'] ) ) {
            $local_business['priceRange'] = $settings['schema_price_range'];
        }

        // Address
        $address = array( '@type' => 'PostalAddress' );
        $has_address = false;

        if ( ! empty( $settings['schema_street'] ) ) {
            $address['streetAddress'] = $settings['schema_street'];
            $has_address = true;
        }
        if ( ! empty( $settings['schema_city'] ) ) {
            $address['addressLocality'] = $settings['schema_city'];
            $has_address = true;
        }
        if ( ! empty( $settings['schema_state'] ) ) {
            $address['addressRegion'] = $settings['schema_state'];
            $has_address = true;
        }
        if ( ! empty( $settings['schema_postal'] ) ) {
            $address['postalCode'] = $settings['schema_postal'];
            $has_address = true;
        }
        if ( ! empty( $settings['schema_country'] ) ) {
            $address['addressCountry'] = $settings['schema_country'];
            $has_address = true;
        }

        if ( $has_address ) {
            $local_business['address'] = $address;
        }

        // Geo Coordinates
        if ( ! empty( $settings['schema_geo_lat'] ) && ! empty( $settings['schema_geo_lng'] ) ) {
            $local_business['geo'] = array(
                '@type'     => 'GeoCoordinates',
                'latitude'  => (float) $settings['schema_geo_lat'],
                'longitude' => (float) $settings['schema_geo_lng'],
            );
        }

        // Opening Hours
        $opening_hours = lakecity_parse_opening_hours( $settings['schema_opening_hours'] ?? '' );
        if ( ! empty( $opening_hours ) ) {
            $local_business['openingHoursSpecification'] = $opening_hours;
        }

        // Social Links
        $social_links = array();
        if ( ! empty( $settings['facebook_url'] ) ) {
            $social_links[] = $settings['facebook_url'];
        }
        if ( ! empty( $settings['instagram_url'] ) ) {
            $social_links[] = $settings['instagram_url'];
        }
        if ( ! empty( $settings['youtube_url'] ) ) {
            $social_links[] = $settings['youtube_url'];
        }
        if ( ! empty( $settings['yelp_url'] ) ) {
            $social_links[] = $settings['yelp_url'];
        }
        if ( ! empty( $social_links ) ) {
            $local_business['sameAs'] = $social_links;
        }

        // Aggregate Rating
        if ( ! empty( $settings['google_rating'] ) && ! empty( $settings['google_reviews_count'] ) ) {
            $review_count = (int) preg_replace( '/\D/', '', $settings['google_reviews_count'] );
            if ( $review_count > 0 ) {
                $local_business['aggregateRating'] = array(
                    '@type'       => 'AggregateRating',
                    'ratingValue' => $settings['google_rating'],
                    'reviewCount' => $review_count,
                    'bestRating'  => '5',
                    'worstRating' => '1',
                );
            }
        }

        $schemas[] = $local_business;
    }

    // ========================================
    // Service Schema
    // ========================================
    if ( ! empty( $settings['schema_geo_lat'] ) && ! empty( $settings['schema_geo_lng'] ) ) {
        $service_schema = array(
            '@context'    => 'https://schema.org',
            '@type'       => 'Service',
            'name'        => $settings['site_tagline'] ?? $settings['site_name'],
            'description' => $settings['site_description'] ?? '',
            'provider'    => array(
                '@type' => $settings['schema_type'] ?? 'LocalBusiness',
                'name'  => $settings['site_name'],
                'url'   => $settings['site_url'],
            ),
            'areaServed'  => array(
                '@type'       => 'GeoCircle',
                'geoMidpoint' => array(
                    '@type'     => 'GeoCoordinates',
                    'latitude'  => (float) $settings['schema_geo_lat'],
                    'longitude' => (float) $settings['schema_geo_lng'],
                ),
                'geoRadius'   => ( $settings['schema_service_radius'] ?? '50' ) . ' mi',
            ),
        );

        if ( ! empty( $settings['phone'] ) ) {
            $service_schema['availableChannel'] = array(
                '@type'        => 'ServiceChannel',
                'serviceUrl'   => $settings['site_url'],
                'servicePhone' => $settings['phone'],
            );
        }

        $schemas[] = $service_schema;
    }

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
 * Parse opening hours text into schema format
 *
 * Input: "Monday-Friday: 7AM-7PM\nSaturday: 8AM-5PM"
 * Output: OpeningHoursSpecification array
 *
 * @param string $hours_text Opening hours text.
 * @return array
 */
function lakecity_parse_opening_hours( string $hours_text ): array {
    if ( empty( $hours_text ) ) {
        return array();
    }

    $day_map = array(
        'monday'           => array( 'Monday' ),
        'tuesday'          => array( 'Tuesday' ),
        'wednesday'        => array( 'Wednesday' ),
        'thursday'         => array( 'Thursday' ),
        'friday'           => array( 'Friday' ),
        'saturday'         => array( 'Saturday' ),
        'sunday'           => array( 'Sunday' ),
        'monday-friday'    => array( 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday' ),
        'mon-fri'          => array( 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday' ),
        'monday-saturday'  => array( 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ),
        'mon-sat'          => array( 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ),
        'weekdays'         => array( 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday' ),
        'weekends'         => array( 'Saturday', 'Sunday' ),
    );

    $specs = array();
    $lines = array_filter( explode( "\n", $hours_text ) );

    foreach ( $lines as $line ) {
        // Match patterns like "Monday-Friday: 7AM-7PM"
        if ( ! preg_match( '/^([^:]+):\s*(\d{1,2}(?::\d{2})?\s*(?:AM|PM)?)\s*-\s*(\d{1,2}(?::\d{2})?\s*(?:AM|PM)?)/i', $line, $match ) ) {
            continue;
        }

        $day_part   = strtolower( str_replace( ' ', '', $match[1] ) );
        $open_time  = $match[2];
        $close_time = $match[3];

        $days = $day_map[ $day_part ] ?? array( trim( $match[1] ) );

        $specs[] = array(
            '@type'     => 'OpeningHoursSpecification',
            'dayOfWeek' => $days,
            'opens'     => lakecity_format_time_24h( $open_time ),
            'closes'    => lakecity_format_time_24h( $close_time ),
        );
    }

    return $specs;
}

/**
 * Convert time to 24h format for schema
 *
 * @param string $time Time string like "7AM" or "7:30PM".
 * @return string
 */
function lakecity_format_time_24h( string $time ): string {
    $time   = strtoupper( trim( $time ) );
    $is_pm  = strpos( $time, 'PM' ) !== false;
    $is_am  = strpos( $time, 'AM' ) !== false;

    if ( ! preg_match( '/(\d{1,2})(?::(\d{2}))?/', $time, $match ) ) {
        return '00:00';
    }

    $hours   = (int) $match[1];
    $minutes = $match[2] ?? '00';

    if ( $is_pm && 12 !== $hours ) {
        $hours += 12;
    }
    if ( $is_am && 12 === $hours ) {
        $hours = 0;
    }

    return sprintf( '%02d:%s', $hours, $minutes );
}

/**
 * Override WordPress title
 */
function lakecity_custom_title( array $title ): array {
    $settings = lakecity_get_all_settings();

    if ( ! empty( $settings['site_name'] ) ) {
        $title['title'] = $settings['site_name'];

        if ( ! empty( $settings['site_tagline'] ) ) {
            $title['tagline'] = $settings['site_tagline'];
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
