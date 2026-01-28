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
    $phone = lakecity_get_setting( 'phone', '(208) 998-0054' );
    $logo  = lakecity_get_setting( 'logo' );

    return array(
        'logo'                 => $logo ? $logo['url'] : '',
        'logo_alt'             => $logo ? $logo['alt'] : 'Lake City Hauling',
        'phone'                => $phone,
        'phone_raw'            => preg_replace( '/\D/', '', $phone ),
        'email'                => lakecity_get_setting( 'email', 'info@lakecityhauling.com' ),
        'google_rating'        => lakecity_get_setting( 'google_rating', '5.0' ),
        'google_reviews_count' => lakecity_get_setting( 'google_reviews_count', '50+' ),
        'google_reviews_url'   => lakecity_get_setting( 'google_reviews_url' ),
        'footer_tagline'       => lakecity_get_setting( 'footer_tagline', 'Fast & Reliable Junk Removal Services' ),
        'footer_description'   => lakecity_get_setting( 'footer_description' ),
        'address'              => lakecity_get_setting( 'address' ),
        'business_hours'       => lakecity_get_setting( 'business_hours', 'Mon-Sat: 7AM - 7PM' ),
        'copyright'            => lakecity_get_setting( 'copyright', '© ' . date( 'Y' ) . ' Lake City Hauling. All rights reserved.' ),
        'facebook_url'         => lakecity_get_setting( 'facebook_url' ),
        'instagram_url'        => lakecity_get_setting( 'instagram_url' ),
        'youtube_url'          => lakecity_get_setting( 'youtube_url' ),
        'yelp_url'             => lakecity_get_setting( 'yelp_url' ),
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
