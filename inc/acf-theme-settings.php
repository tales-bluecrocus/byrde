<?php
/**
 * ACF Theme Settings
 *
 * Registers options page and field groups for theme settings
 *
 * @package LakeCity
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Register ACF Options Page
 */
function lakecity_register_options_page(): void {
    if ( ! function_exists( 'acf_add_options_page' ) ) {
        return;
    }

    acf_add_options_page( array(
        'page_title' => __( 'Theme Settings', 'lakecity' ),
        'menu_title' => __( 'Theme Settings', 'lakecity' ),
        'menu_slug'  => 'theme-settings',
        'capability' => 'edit_posts',
        'redirect'   => false,
        'icon_url'   => 'dashicons-admin-customizer',
        'position'   => 2,
    ) );
}
add_action( 'acf/init', 'lakecity_register_options_page' );

/**
 * Register ACF Field Groups
 */
function lakecity_register_acf_fields(): void {
    if ( ! function_exists( 'acf_add_local_field_group' ) ) {
        return;
    }

    // Theme Settings Field Group
    acf_add_local_field_group( array(
        'key'      => 'group_theme_settings',
        'title'    => __( 'Theme Settings', 'lakecity' ),
        'fields'   => array(

            // === BRAND TAB ===
            array(
                'key'   => 'field_tab_brand',
                'label' => __( 'Brand', 'lakecity' ),
                'type'  => 'tab',
            ),
            array(
                'key'           => 'field_logo',
                'label'         => __( 'Logo', 'lakecity' ),
                'name'          => 'logo',
                'type'          => 'image',
                'return_format' => 'array',
                'preview_size'  => 'medium',
                'library'       => 'all',
            ),
            array(
                'key'          => 'field_phone',
                'label'        => __( 'Phone Number', 'lakecity' ),
                'name'         => 'phone',
                'type'         => 'text',
                'placeholder'  => '(208) 998-0054',
            ),
            array(
                'key'          => 'field_email',
                'label'        => __( 'Email', 'lakecity' ),
                'name'         => 'email',
                'type'         => 'email',
                'placeholder'  => 'info@lakecityhauling.com',
            ),

            // === GOOGLE REVIEWS TAB ===
            array(
                'key'   => 'field_tab_google',
                'label' => __( 'Google Reviews', 'lakecity' ),
                'type'  => 'tab',
            ),
            array(
                'key'          => 'field_google_rating',
                'label'        => __( 'Rating', 'lakecity' ),
                'name'         => 'google_rating',
                'type'         => 'text',
                'placeholder'  => '5.0',
                'instructions' => __( 'Google Reviews rating (e.g., 5.0)', 'lakecity' ),
            ),
            array(
                'key'          => 'field_google_reviews_count',
                'label'        => __( 'Reviews Count', 'lakecity' ),
                'name'         => 'google_reviews_count',
                'type'         => 'text',
                'placeholder'  => '50+',
                'instructions' => __( 'Number of reviews (e.g., 50+ or 127)', 'lakecity' ),
            ),
            array(
                'key'          => 'field_google_reviews_url',
                'label'        => __( 'Google Reviews URL', 'lakecity' ),
                'name'         => 'google_reviews_url',
                'type'         => 'url',
                'placeholder'  => 'https://g.page/r/...',
                'instructions' => __( 'Link to Google Reviews page', 'lakecity' ),
            ),

            // === FOOTER TAB ===
            array(
                'key'   => 'field_tab_footer',
                'label' => __( 'Footer', 'lakecity' ),
                'type'  => 'tab',
            ),
            array(
                'key'          => 'field_footer_tagline',
                'label'        => __( 'Tagline', 'lakecity' ),
                'name'         => 'footer_tagline',
                'type'         => 'text',
                'placeholder'  => 'Fast & Reliable Junk Removal Services',
            ),
            array(
                'key'          => 'field_footer_description',
                'label'        => __( 'Description', 'lakecity' ),
                'name'         => 'footer_description',
                'type'         => 'textarea',
                'rows'         => 3,
                'placeholder'  => 'Serving North Idaho and Spokane area with professional junk removal services.',
            ),
            array(
                'key'          => 'field_address',
                'label'        => __( 'Address', 'lakecity' ),
                'name'         => 'address',
                'type'         => 'textarea',
                'rows'         => 2,
                'placeholder'  => "123 Main Street\nCoeur d'Alene, ID 83814",
            ),
            array(
                'key'          => 'field_business_hours',
                'label'        => __( 'Business Hours', 'lakecity' ),
                'name'         => 'business_hours',
                'type'         => 'text',
                'placeholder'  => 'Mon-Sat: 7AM - 7PM',
            ),
            array(
                'key'          => 'field_copyright',
                'label'        => __( 'Copyright Text', 'lakecity' ),
                'name'         => 'copyright',
                'type'         => 'text',
                'placeholder'  => '© 2024 Lake City Hauling. All rights reserved.',
            ),

            // === SOCIAL TAB ===
            array(
                'key'   => 'field_tab_social',
                'label' => __( 'Social', 'lakecity' ),
                'type'  => 'tab',
            ),
            array(
                'key'          => 'field_facebook',
                'label'        => __( 'Facebook URL', 'lakecity' ),
                'name'         => 'facebook_url',
                'type'         => 'url',
                'placeholder'  => 'https://facebook.com/...',
            ),
            array(
                'key'          => 'field_instagram',
                'label'        => __( 'Instagram URL', 'lakecity' ),
                'name'         => 'instagram_url',
                'type'         => 'url',
                'placeholder'  => 'https://instagram.com/...',
            ),
            array(
                'key'          => 'field_youtube',
                'label'        => __( 'YouTube URL', 'lakecity' ),
                'name'         => 'youtube_url',
                'type'         => 'url',
                'placeholder'  => 'https://youtube.com/...',
            ),
            array(
                'key'          => 'field_yelp',
                'label'        => __( 'Yelp URL', 'lakecity' ),
                'name'         => 'yelp_url',
                'type'         => 'url',
                'placeholder'  => 'https://yelp.com/biz/...',
            ),

            // === SEO TAB ===
            array(
                'key'   => 'field_tab_seo',
                'label' => __( 'SEO & Schema', 'lakecity' ),
                'type'  => 'tab',
            ),
            array(
                'key'          => 'field_site_name',
                'label'        => __( 'Site/Business Name', 'lakecity' ),
                'name'         => 'site_name',
                'type'         => 'text',
                'placeholder'  => 'My Business Name',
                'instructions' => __( 'The name that appears in search results and schema.', 'lakecity' ),
            ),
            array(
                'key'          => 'field_site_tagline',
                'label'        => __( 'Site Tagline', 'lakecity' ),
                'name'         => 'site_tagline',
                'type'         => 'text',
                'placeholder'  => 'Fast & Reliable Services',
                'instructions' => __( 'Short tagline for SEO title.', 'lakecity' ),
            ),
            array(
                'key'          => 'field_site_description',
                'label'        => __( 'Site Meta Description', 'lakecity' ),
                'name'         => 'site_description',
                'type'         => 'textarea',
                'rows'         => 3,
                'placeholder'  => 'Professional services in your area...',
                'instructions' => __( 'Default meta description for SEO (150-160 chars recommended).', 'lakecity' ),
            ),
            array(
                'key'          => 'field_site_keywords',
                'label'        => __( 'SEO Keywords', 'lakecity' ),
                'name'         => 'site_keywords',
                'type'         => 'text',
                'placeholder'  => 'service, local business, your city',
                'instructions' => __( 'Comma-separated keywords for meta tags.', 'lakecity' ),
            ),
            array(
                'key'           => 'field_og_image',
                'label'         => __( 'Default OG Image', 'lakecity' ),
                'name'          => 'og_image',
                'type'          => 'image',
                'return_format' => 'array',
                'preview_size'  => 'medium',
                'instructions'  => __( 'Default image for social sharing (1200x630 recommended).', 'lakecity' ),
            ),
            array(
                'key'          => 'field_site_url',
                'label'        => __( 'Canonical Site URL', 'lakecity' ),
                'name'         => 'site_url',
                'type'         => 'url',
                'placeholder'  => 'https://yourdomain.com',
                'instructions' => __( 'Full URL including https://', 'lakecity' ),
            ),

            // === SCHEMA/STRUCTURED DATA TAB ===
            array(
                'key'   => 'field_tab_schema',
                'label' => __( 'Schema Data', 'lakecity' ),
                'type'  => 'tab',
            ),
            array(
                'key'           => 'field_schema_type',
                'label'         => __( 'Business Type', 'lakecity' ),
                'name'          => 'schema_type',
                'type'          => 'select',
                'choices'       => array(
                    'LocalBusiness'            => 'Local Business',
                    'HomeAndConstructionBusiness' => 'Home & Construction',
                    'ProfessionalService'      => 'Professional Service',
                    'Organization'             => 'Organization',
                ),
                'default_value' => 'LocalBusiness',
            ),
            array(
                'key'          => 'field_schema_price_range',
                'label'        => __( 'Price Range', 'lakecity' ),
                'name'         => 'schema_price_range',
                'type'         => 'select',
                'choices'      => array(
                    '$'    => '$ (Budget)',
                    '$$'   => '$$ (Moderate)',
                    '$$$'  => '$$$ (Premium)',
                    '$$$$' => '$$$$ (Luxury)',
                ),
                'default_value' => '$$',
            ),
            array(
                'key'          => 'field_schema_street',
                'label'        => __( 'Street Address', 'lakecity' ),
                'name'         => 'schema_street',
                'type'         => 'text',
                'placeholder'  => '123 Main Street',
            ),
            array(
                'key'          => 'field_schema_city',
                'label'        => __( 'City', 'lakecity' ),
                'name'         => 'schema_city',
                'type'         => 'text',
                'placeholder'  => 'Your City',
            ),
            array(
                'key'          => 'field_schema_state',
                'label'        => __( 'State/Region', 'lakecity' ),
                'name'         => 'schema_state',
                'type'         => 'text',
                'placeholder'  => 'ID',
            ),
            array(
                'key'          => 'field_schema_postal',
                'label'        => __( 'Postal Code', 'lakecity' ),
                'name'         => 'schema_postal',
                'type'         => 'text',
                'placeholder'  => '83814',
            ),
            array(
                'key'          => 'field_schema_country',
                'label'        => __( 'Country', 'lakecity' ),
                'name'         => 'schema_country',
                'type'         => 'text',
                'default_value' => 'US',
            ),
            array(
                'key'          => 'field_schema_geo_lat',
                'label'        => __( 'Latitude', 'lakecity' ),
                'name'         => 'schema_geo_lat',
                'type'         => 'text',
                'placeholder'  => '47.6777',
                'instructions' => __( 'For Google Maps schema (get from Google Maps).', 'lakecity' ),
            ),
            array(
                'key'          => 'field_schema_geo_lng',
                'label'        => __( 'Longitude', 'lakecity' ),
                'name'         => 'schema_geo_lng',
                'type'         => 'text',
                'placeholder'  => '-116.7805',
            ),
            array(
                'key'          => 'field_schema_service_radius',
                'label'        => __( 'Service Radius (miles)', 'lakecity' ),
                'name'         => 'schema_service_radius',
                'type'         => 'text',
                'placeholder'  => '50',
                'default_value' => '50',
            ),
            array(
                'key'          => 'field_schema_opening_hours',
                'label'        => __( 'Opening Hours', 'lakecity' ),
                'name'         => 'schema_opening_hours',
                'type'         => 'textarea',
                'rows'         => 4,
                'placeholder'  => "Monday-Friday: 7AM-7PM\nSaturday: 8AM-5PM\nSunday: Closed",
                'instructions' => __( 'One line per schedule.', 'lakecity' ),
            ),

            // === ANALYTICS TAB ===
            array(
                'key'   => 'field_tab_analytics',
                'label' => __( 'Analytics', 'lakecity' ),
                'type'  => 'tab',
            ),
            array(
                'key'          => 'field_ga_measurement_id',
                'label'        => __( 'GA4 Measurement ID', 'lakecity' ),
                'name'         => 'ga_measurement_id',
                'type'         => 'text',
                'placeholder'  => 'G-XXXXXXXXXX',
                'instructions' => __( 'Google Analytics 4 Measurement ID.', 'lakecity' ),
            ),
            array(
                'key'          => 'field_gtm_container_id',
                'label'        => __( 'GTM Container ID', 'lakecity' ),
                'name'         => 'gtm_container_id',
                'type'         => 'text',
                'placeholder'  => 'GTM-XXXXXXX',
                'instructions' => __( 'Google Tag Manager Container ID (optional, use if you prefer GTM over direct GA4).', 'lakecity' ),
            ),
            array(
                'key'          => 'field_fb_pixel_id',
                'label'        => __( 'Facebook Pixel ID', 'lakecity' ),
                'name'         => 'fb_pixel_id',
                'type'         => 'text',
                'placeholder'  => '1234567890',
                'instructions' => __( 'Facebook/Meta Pixel ID for conversion tracking.', 'lakecity' ),
            ),

            // === LEGAL PAGES TAB ===
            array(
                'key'   => 'field_tab_legal',
                'label' => __( 'Legal Pages', 'lakecity' ),
                'type'  => 'tab',
            ),
            array(
                'key'          => 'field_privacy_policy_url',
                'label'        => __( 'Privacy Policy URL', 'lakecity' ),
                'name'         => 'privacy_policy_url',
                'type'         => 'text',
                'placeholder'  => '/privacy-policy',
                'default_value' => '/privacy-policy',
                'instructions' => __( 'URL to your privacy policy page. Required for GDPR/CCPA compliance.', 'lakecity' ),
            ),
            array(
                'key'          => 'field_terms_url',
                'label'        => __( 'Terms of Service URL', 'lakecity' ),
                'name'         => 'terms_url',
                'type'         => 'text',
                'placeholder'  => '/terms-and-conditions',
                'default_value' => '/terms-and-conditions',
            ),
            array(
                'key'          => 'field_cookie_settings_url',
                'label'        => __( 'Cookie Settings URL', 'lakecity' ),
                'name'         => 'cookie_settings_url',
                'type'         => 'text',
                'placeholder'  => '/cookie-settings',
                'default_value' => '/cookie-settings',
            ),

            // === CONTACT FORM TAB ===
            array(
                'key'   => 'field_tab_contact_form',
                'label' => __( 'Contact Form', 'lakecity' ),
                'type'  => 'tab',
            ),
            array(
                'key'          => 'field_postmark_api_token',
                'label'        => __( 'Postmark Server API Token', 'lakecity' ),
                'name'         => 'postmark_api_token',
                'type'         => 'text',
                'placeholder'  => 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
                'instructions' => __( 'Server API Token from your Postmark account.', 'lakecity' ),
            ),
            array(
                'key'          => 'field_contact_form_to_email',
                'label'        => __( 'Recipient Email', 'lakecity' ),
                'name'         => 'contact_form_to_email',
                'type'         => 'email',
                'placeholder'  => 'leads@yourdomain.com',
                'instructions' => __( 'Email address that receives form submissions.', 'lakecity' ),
            ),
            array(
                'key'          => 'field_contact_form_from_email',
                'label'        => __( 'Sender Email', 'lakecity' ),
                'name'         => 'contact_form_from_email',
                'type'         => 'email',
                'placeholder'  => 'noreply@yourdomain.com',
                'instructions' => __( 'Must be a verified Sender Signature in Postmark.', 'lakecity' ),
            ),
            array(
                'key'           => 'field_contact_form_subject',
                'label'         => __( 'Email Subject', 'lakecity' ),
                'name'          => 'contact_form_subject',
                'type'          => 'text',
                'default_value' => 'New Lead from Website',
                'placeholder'   => 'New Lead from Website',
            ),

        ),
        'location' => array(
            array(
                array(
                    'param'    => 'options_page',
                    'operator' => '==',
                    'value'    => 'theme-settings',
                ),
            ),
        ),
        'menu_order' => 0,
        'style'      => 'default',
    ) );
}
add_action( 'acf/init', 'lakecity_register_acf_fields' );

/**
 * Helper function to get theme setting
 */
function lakecity_get_setting( string $key, $default = '' ) {
    if ( ! function_exists( 'get_field' ) ) {
        return $default;
    }

    $value = get_field( $key, 'option' );
    return $value ?: $default;
}

/**
 * Get all theme settings as array
 */
function lakecity_get_all_settings(): array {
    $phone    = lakecity_get_setting( 'phone' );
    $logo     = lakecity_get_setting( 'logo' );
    $og_image = lakecity_get_setting( 'og_image' );

    // Get site name with fallback to WP site title
    $site_name = lakecity_get_setting( 'site_name' );
    if ( empty( $site_name ) ) {
        $site_name = get_bloginfo( 'name' );
    }

    // Get site URL with fallback to WP home URL
    $site_url = lakecity_get_setting( 'site_url' );
    if ( empty( $site_url ) ) {
        $site_url = home_url();
    }

    return array(
        // Brand
        'logo'                 => $logo ? $logo['url'] : '',
        'logo_alt'             => $logo ? ( $logo['alt'] ?: $site_name ) : $site_name,
        'phone'                => $phone,
        'phone_raw'            => $phone ? preg_replace( '/\D/', '', $phone ) : '',
        'email'                => lakecity_get_setting( 'email' ),

        // Google Reviews
        'google_rating'        => lakecity_get_setting( 'google_rating', '5.0' ),
        'google_reviews_count' => lakecity_get_setting( 'google_reviews_count', '50+' ),
        'google_reviews_url'   => lakecity_get_setting( 'google_reviews_url' ),

        // Footer
        'footer_tagline'       => lakecity_get_setting( 'footer_tagline' ),
        'footer_description'   => lakecity_get_setting( 'footer_description' ),
        'address'              => lakecity_get_setting( 'address' ),
        'business_hours'       => lakecity_get_setting( 'business_hours' ),
        'copyright'            => lakecity_get_setting( 'copyright', '© ' . gmdate( 'Y' ) . ' ' . $site_name . '. All rights reserved.' ),

        // Social
        'facebook_url'         => lakecity_get_setting( 'facebook_url' ),
        'instagram_url'        => lakecity_get_setting( 'instagram_url' ),
        'youtube_url'          => lakecity_get_setting( 'youtube_url' ),
        'yelp_url'             => lakecity_get_setting( 'yelp_url' ),

        // SEO
        'site_name'            => $site_name,
        'site_tagline'         => lakecity_get_setting( 'site_tagline' ),
        'site_description'     => lakecity_get_setting( 'site_description' ),
        'site_keywords'        => lakecity_get_setting( 'site_keywords' ),
        'site_url'             => $site_url,
        'og_image'             => $og_image ? $og_image['url'] : '',

        // Schema
        'schema_type'          => lakecity_get_setting( 'schema_type', 'LocalBusiness' ),
        'schema_price_range'   => lakecity_get_setting( 'schema_price_range', '$$' ),
        'schema_street'        => lakecity_get_setting( 'schema_street' ),
        'schema_city'          => lakecity_get_setting( 'schema_city' ),
        'schema_state'         => lakecity_get_setting( 'schema_state' ),
        'schema_postal'        => lakecity_get_setting( 'schema_postal' ),
        'schema_country'       => lakecity_get_setting( 'schema_country', 'US' ),
        'schema_geo_lat'       => lakecity_get_setting( 'schema_geo_lat' ),
        'schema_geo_lng'       => lakecity_get_setting( 'schema_geo_lng' ),
        'schema_service_radius' => lakecity_get_setting( 'schema_service_radius', '50' ),
        'schema_opening_hours' => lakecity_get_setting( 'schema_opening_hours' ),

        // Analytics
        'ga_measurement_id'    => lakecity_get_setting( 'ga_measurement_id' ),
        'gtm_container_id'     => lakecity_get_setting( 'gtm_container_id' ),
        'fb_pixel_id'          => lakecity_get_setting( 'fb_pixel_id' ),

        // Legal Pages
        'privacy_policy_url'   => lakecity_get_setting( 'privacy_policy_url', '/privacy-policy' ),
        'terms_url'            => lakecity_get_setting( 'terms_url', '/terms-and-conditions' ),
        'cookie_settings_url'  => lakecity_get_setting( 'cookie_settings_url', '/cookie-settings' ),
    );
}

/**
 * Register REST API endpoint
 */
function lakecity_register_rest_routes(): void {
    register_rest_route( 'lakecity/v1', '/settings', array(
        'methods'             => 'GET',
        'callback'            => 'lakecity_rest_get_settings',
        'permission_callback' => '__return_true',
    ) );
}
add_action( 'rest_api_init', 'lakecity_register_rest_routes' );

/**
 * REST API callback - returns all settings
 */
function lakecity_rest_get_settings(): WP_REST_Response {
    return new WP_REST_Response( lakecity_get_all_settings(), 200 );
}
