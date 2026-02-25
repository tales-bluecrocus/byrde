<?php
/**
 * ACF Theme Settings
 *
 * Registers options page and field groups for theme settings
 *
 * @package Byrde
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Register ACF Options Page
 */
function byrde_register_options_page(): void {
    if ( ! function_exists( 'acf_add_options_page' ) ) {
        return;
    }

    acf_add_options_page( array(
        'page_title' => __( 'Theme Settings', 'byrde' ),
        'menu_title' => __( 'Theme Settings', 'byrde' ),
        'menu_slug'  => 'theme-settings',
        'capability' => 'edit_posts',
        'redirect'   => false,
        'icon_url'   => 'dashicons-admin-customizer',
        'position'   => 2,
    ) );
}
add_action( 'acf/init', 'byrde_register_options_page' );

/**
 * Register ACF Field Groups
 */
function byrde_register_acf_fields(): void {
    if ( ! function_exists( 'acf_add_local_field_group' ) ) {
        return;
    }

    // Theme Settings Field Group
    acf_add_local_field_group( array(
        'key'      => 'group_theme_settings',
        'title'    => __( 'Theme Settings', 'byrde' ),
        'fields'   => array(

            // === BRAND TAB ===
            array(
                'key'   => 'field_tab_brand',
                'label' => __( 'Brand', 'byrde' ),
                'type'  => 'tab',
            ),
            array(
                'key'           => 'field_logo',
                'label'         => __( 'Logo', 'byrde' ),
                'name'          => 'logo',
                'type'          => 'image',
                'return_format' => 'array',
                'preview_size'  => 'medium',
                'library'       => 'all',
            ),
            array(
                'key'          => 'field_phone',
                'label'        => __( 'Phone Number', 'byrde' ),
                'name'         => 'phone',
                'type'         => 'text',
                'placeholder'  => '(208) 998-0054',
            ),
            array(
                'key'          => 'field_email',
                'label'        => __( 'Email', 'byrde' ),
                'name'         => 'email',
                'type'         => 'email',
                'placeholder'  => 'info@byrde.com',
            ),

            // === GOOGLE REVIEWS TAB ===
            array(
                'key'   => 'field_tab_google',
                'label' => __( 'Google Reviews', 'byrde' ),
                'type'  => 'tab',
            ),
            array(
                'key'          => 'field_google_rating',
                'label'        => __( 'Rating', 'byrde' ),
                'name'         => 'google_rating',
                'type'         => 'text',
                'placeholder'  => '5.0',
                'instructions' => __( 'Google Reviews rating (e.g., 5.0)', 'byrde' ),
            ),
            array(
                'key'          => 'field_google_reviews_count',
                'label'        => __( 'Reviews Count', 'byrde' ),
                'name'         => 'google_reviews_count',
                'type'         => 'text',
                'placeholder'  => '50+',
                'instructions' => __( 'Number of reviews (e.g., 50+ or 127)', 'byrde' ),
            ),
            array(
                'key'          => 'field_google_reviews_url',
                'label'        => __( 'Google Reviews URL', 'byrde' ),
                'name'         => 'google_reviews_url',
                'type'         => 'url',
                'placeholder'  => 'https://g.page/r/...',
                'instructions' => __( 'Link to Google Reviews page', 'byrde' ),
            ),

            // === FOOTER TAB ===
            array(
                'key'   => 'field_tab_footer',
                'label' => __( 'Footer', 'byrde' ),
                'type'  => 'tab',
            ),
            array(
                'key'          => 'field_footer_tagline',
                'label'        => __( 'Tagline', 'byrde' ),
                'name'         => 'footer_tagline',
                'type'         => 'text',
                'placeholder'  => 'Fast & Reliable Junk Removal Services',
            ),
            array(
                'key'          => 'field_footer_description',
                'label'        => __( 'Description', 'byrde' ),
                'name'         => 'footer_description',
                'type'         => 'textarea',
                'rows'         => 3,
                'placeholder'  => 'Serving North Idaho and Spokane area with professional junk removal services.',
            ),
            array(
                'key'          => 'field_address',
                'label'        => __( 'Address', 'byrde' ),
                'name'         => 'address',
                'type'         => 'textarea',
                'rows'         => 2,
                'placeholder'  => "123 Main Street\nCoeur d'Alene, ID 83814",
            ),
            array(
                'key'          => 'field_business_hours',
                'label'        => __( 'Business Hours', 'byrde' ),
                'name'         => 'business_hours',
                'type'         => 'text',
                'placeholder'  => 'Mon-Sat: 7AM - 7PM',
            ),
            array(
                'key'          => 'field_copyright',
                'label'        => __( 'Copyright Text', 'byrde' ),
                'name'         => 'copyright',
                'type'         => 'text',
                'placeholder'  => '© 2024 Byrde. All rights reserved.',
            ),

            // === SOCIAL TAB ===
            array(
                'key'   => 'field_tab_social',
                'label' => __( 'Social', 'byrde' ),
                'type'  => 'tab',
            ),
            array(
                'key'          => 'field_facebook',
                'label'        => __( 'Facebook URL', 'byrde' ),
                'name'         => 'facebook_url',
                'type'         => 'url',
                'placeholder'  => 'https://facebook.com/...',
            ),
            array(
                'key'          => 'field_instagram',
                'label'        => __( 'Instagram URL', 'byrde' ),
                'name'         => 'instagram_url',
                'type'         => 'url',
                'placeholder'  => 'https://instagram.com/...',
            ),
            array(
                'key'          => 'field_youtube',
                'label'        => __( 'YouTube URL', 'byrde' ),
                'name'         => 'youtube_url',
                'type'         => 'url',
                'placeholder'  => 'https://youtube.com/...',
            ),
            array(
                'key'          => 'field_yelp',
                'label'        => __( 'Yelp URL', 'byrde' ),
                'name'         => 'yelp_url',
                'type'         => 'url',
                'placeholder'  => 'https://yelp.com/biz/...',
            ),

            // === SEO TAB ===
            array(
                'key'   => 'field_tab_seo',
                'label' => __( 'SEO', 'byrde' ),
                'type'  => 'tab',
            ),
            array(
                'key'          => 'field_site_description',
                'label'        => __( 'Site Meta Description', 'byrde' ),
                'name'         => 'site_description',
                'type'         => 'textarea',
                'rows'         => 3,
                'placeholder'  => 'Professional services in your area...',
                'instructions' => __( 'Default meta description for SEO (150-160 chars recommended).', 'byrde' ),
            ),
            array(
                'key'          => 'field_site_keywords',
                'label'        => __( 'SEO Keywords', 'byrde' ),
                'name'         => 'site_keywords',
                'type'         => 'text',
                'placeholder'  => 'service, local business, your city',
                'instructions' => __( 'Comma-separated keywords for meta tags.', 'byrde' ),
            ),
            array(
                'key'           => 'field_og_image',
                'label'         => __( 'Default OG Image', 'byrde' ),
                'name'          => 'og_image',
                'type'          => 'image',
                'return_format' => 'array',
                'preview_size'  => 'medium',
                'instructions'  => __( 'Default image for social sharing (1200x630 recommended).', 'byrde' ),
            ),
            array(
                'key'          => 'field_site_url',
                'label'        => __( 'Canonical Site URL', 'byrde' ),
                'name'         => 'site_url',
                'type'         => 'url',
                'placeholder'  => 'https://yourdomain.com',
                'instructions' => __( 'Full URL including https://', 'byrde' ),
            ),

            // === ANALYTICS TAB ===
            array(
                'key'   => 'field_tab_analytics',
                'label' => __( 'Analytics', 'byrde' ),
                'type'  => 'tab',
            ),
            array(
                'key'          => 'field_ga_measurement_id',
                'label'        => __( 'GA4 Measurement ID', 'byrde' ),
                'name'         => 'ga_measurement_id',
                'type'         => 'text',
                'placeholder'  => 'G-XXXXXXXXXX',
                'instructions' => __( 'Google Analytics 4 Measurement ID.', 'byrde' ),
            ),
            array(
                'key'          => 'field_fb_pixel_id',
                'label'        => __( 'Facebook Pixel ID', 'byrde' ),
                'name'         => 'fb_pixel_id',
                'type'         => 'text',
                'placeholder'  => '1234567890',
                'instructions' => __( 'Facebook/Meta Pixel ID for conversion tracking.', 'byrde' ),
            ),
            array(
                'key'          => 'field_gads_conversion_label',
                'label'        => __( 'Google Ads Conversion Label', 'byrde' ),
                'name'         => 'gads_conversion_label',
                'type'         => 'text',
                'placeholder'  => 'AW-XXXXXXXXX/YYYYYYYYYYY',
                'instructions' => __( 'Google Ads conversion label for form submissions (format: AW-ID/LABEL). Found in Google Ads > Tools > Conversions.', 'byrde' ),
            ),

            // === LEGAL PAGES TAB ===
            array(
                'key'   => 'field_tab_legal',
                'label' => __( 'Legal Pages', 'byrde' ),
                'type'  => 'tab',
            ),
            array(
                'key'          => 'field_privacy_policy_url',
                'label'        => __( 'Privacy Policy URL', 'byrde' ),
                'name'         => 'privacy_policy_url',
                'type'         => 'text',
                'placeholder'  => '/privacy-policy',
                'default_value' => '/privacy-policy',
                'instructions' => __( 'URL to your privacy policy page. Required for GDPR/CCPA compliance.', 'byrde' ),
            ),
            array(
                'key'          => 'field_terms_url',
                'label'        => __( 'Terms of Service URL', 'byrde' ),
                'name'         => 'terms_url',
                'type'         => 'text',
                'placeholder'  => '/terms-and-conditions',
                'default_value' => '/terms-and-conditions',
            ),
            array(
                'key'          => 'field_cookie_settings_url',
                'label'        => __( 'Cookie Settings URL', 'byrde' ),
                'name'         => 'cookie_settings_url',
                'type'         => 'text',
                'placeholder'  => '/cookie-settings',
                'default_value' => '/cookie-settings',
            ),

            // === CONTACT FORM TAB ===
            array(
                'key'   => 'field_tab_contact_form',
                'label' => __( 'Contact Form', 'byrde' ),
                'type'  => 'tab',
            ),
            array(
                'key'          => 'field_postmark_api_token',
                'label'        => __( 'Postmark Server API Token', 'byrde' ),
                'name'         => 'postmark_api_token',
                'type'         => 'text',
                'placeholder'  => 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
                'instructions' => __( 'Server API Token from your Postmark account.', 'byrde' ),
            ),
            array(
                'key'          => 'field_contact_form_to_email',
                'label'        => __( 'Recipient Email', 'byrde' ),
                'name'         => 'contact_form_to_email',
                'type'         => 'email',
                'placeholder'  => 'leads@yourdomain.com',
                'instructions' => __( 'Email address that receives form submissions.', 'byrde' ),
            ),
            array(
                'key'          => 'field_contact_form_from_email',
                'label'        => __( 'Sender Email', 'byrde' ),
                'name'         => 'contact_form_from_email',
                'type'         => 'email',
                'placeholder'  => 'noreply@yourdomain.com',
                'instructions' => __( 'Must be a verified Sender Signature in Postmark.', 'byrde' ),
            ),
            array(
                'key'           => 'field_contact_form_subject',
                'label'         => __( 'Email Subject', 'byrde' ),
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
add_action( 'acf/init', 'byrde_register_acf_fields' );

/**
 * Helper function to get theme setting
 */
function byrde_get_setting( string $key, $default = '' ) {
    if ( ! function_exists( 'get_field' ) ) {
        return $default;
    }

    $value = get_field( $key, 'option' );

    // Explicitly handle null/false to avoid PHP 8.1+ deprecation warnings
    // when these values reach strpos/str_replace in WP core.
    if ( null === $value || false === $value ) {
        return $default;
    }

    return $value ?: $default;
}

/**
 * Get all theme settings as array
 */
function byrde_get_all_settings(): array {
    $phone    = byrde_get_setting( 'phone' );
    $logo     = byrde_get_setting( 'logo' );
    $og_image = byrde_get_setting( 'og_image' );

    // Always use WordPress site title and tagline
    $site_name    = get_bloginfo( 'name' );
    $site_tagline = get_bloginfo( 'description' );

    // Get site URL with fallback to WP home URL
    $site_url = byrde_get_setting( 'site_url' );
    if ( empty( $site_url ) ) {
        $site_url = home_url();
    }

    // Build settings — every value MUST be a string (never null) to avoid
    // PHP 8.1+ deprecation warnings in wp_localize_script → strpos/str_replace.
    $logo_url = '';
    $logo_alt = $site_name;
    if ( is_array( $logo ) ) {
        $logo_url = $logo['sizes']['logo'] ?? $logo['sizes']['thumbnail'] ?? $logo['url'] ?? '';
        $logo_alt = $logo['alt'] ?? $site_name;
        if ( empty( $logo_alt ) ) {
            $logo_alt = $site_name;
        }
    }

    $og_image_url = '';
    if ( is_array( $og_image ) ) {
        $og_image_url = $og_image['url'] ?? '';
    }

    return array(
        // Brand — use 'logo' size (128px) for performance (displayed at 64-98px, 128px = 2x retina)
        'logo'                 => (string) $logo_url,
        'logo_alt'             => (string) $logo_alt,
        'phone'                => (string) $phone,
        'phone_raw'            => $phone ? preg_replace( '/\D/', '', $phone ) : '',
        'email'                => (string) byrde_get_setting( 'email' ),

        // Google Reviews
        'google_rating'        => (string) byrde_get_setting( 'google_rating', '5.0' ),
        'google_reviews_count' => (string) byrde_get_setting( 'google_reviews_count', '50+' ),
        'google_reviews_url'   => (string) byrde_get_setting( 'google_reviews_url' ),

        // Footer
        'footer_tagline'       => (string) byrde_get_setting( 'footer_tagline' ),
        'footer_description'   => (string) byrde_get_setting( 'footer_description' ),
        'address'              => (string) byrde_get_setting( 'address' ),
        'business_hours'       => (string) byrde_get_setting( 'business_hours' ),
        'copyright'            => (string) byrde_get_setting( 'copyright', '© ' . gmdate( 'Y' ) . ' ' . $site_name . '. All rights reserved.' ),

        // Social
        'facebook_url'         => (string) byrde_get_setting( 'facebook_url' ),
        'instagram_url'        => (string) byrde_get_setting( 'instagram_url' ),
        'youtube_url'          => (string) byrde_get_setting( 'youtube_url' ),
        'yelp_url'             => (string) byrde_get_setting( 'yelp_url' ),

        // SEO (site_name/tagline from WP Settings > General)
        'site_name'            => (string) $site_name,
        'site_tagline'         => (string) $site_tagline,
        'site_description'     => (string) byrde_get_setting( 'site_description' ),
        'site_keywords'        => (string) byrde_get_setting( 'site_keywords' ),
        'site_url'             => (string) $site_url,
        'og_image'             => (string) $og_image_url,

        // Analytics
        'ga_measurement_id'    => (string) byrde_get_setting( 'ga_measurement_id' ),
        'fb_pixel_id'          => (string) byrde_get_setting( 'fb_pixel_id' ),
        'gads_conversion_label' => (string) byrde_get_setting( 'gads_conversion_label' ),

        // Legal Pages
        'privacy_policy_url'   => (string) byrde_get_setting( 'privacy_policy_url', '/privacy-policy' ),
        'terms_url'            => (string) byrde_get_setting( 'terms_url', '/terms-and-conditions' ),
        'cookie_settings_url'  => (string) byrde_get_setting( 'cookie_settings_url', '/cookie-settings' ),
    );
}

/**
 * Register REST API endpoint
 */
function byrde_register_rest_routes(): void {
    register_rest_route( 'byrde/v1', '/settings', array(
        'methods'             => 'GET',
        'callback'            => 'byrde_rest_get_settings',
        'permission_callback' => '__return_true',
    ) );
}
add_action( 'rest_api_init', 'byrde_register_rest_routes' );

/**
 * REST API callback - returns all settings
 */
function byrde_rest_get_settings(): WP_REST_Response {
    return new WP_REST_Response( byrde_get_all_settings(), 200 );
}
