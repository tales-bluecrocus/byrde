<?php
/**
 * Theme Settings Manager (Native WordPress Options)
 *
 * Replaces ACF Pro dependency with native WordPress options.
 * Manages all global theme settings: brand, social, SEO, analytics, schema, etc.
 *
 * @package LakeCity
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Get default theme settings structure
 *
 * @return array Default settings with all fields.
 */
function lakecity_get_default_settings(): array {
	return array(
		// Brand
		'brand'          => array(
			'logo'       => array(
				'url' => '',
				'alt' => '',
			),
			'phone'      => '',
			'phone_raw'  => '', // Digits only
			'email'      => '',
		),

		// Google Reviews
		'google_reviews' => array(
			'rating'       => '5.0',
			'count'        => '',
			'reviews_url'  => '',
		),

		// Footer
		'footer'         => array(
			'tagline'     => '',
			'description' => '',
			'address'     => '',
			'business_hours' => '',
			'copyright'   => '',
		),

		// Social Media
		'social'         => array(
			'facebook_url'  => '',
			'instagram_url' => '',
			'youtube_url'   => '',
			'yelp_url'      => '',
		),

		// SEO
		'seo'            => array(
			'site_name'        => get_bloginfo( 'name' ),
			'site_tagline'     => get_bloginfo( 'description' ),
			'site_description' => '',
			'site_keywords'    => '',
			'site_url'         => home_url(),
			'og_image'         => '',
		),

		// Schema / Structured Data
		'schema'         => array(
			'type'           => 'LocalBusiness',
			'price_range'    => '$$',
			'street'         => '',
			'city'           => '',
			'state'          => '',
			'postal'         => '',
			'country'        => 'US',
			'geo_lat'        => '',
			'geo_lng'        => '',
			'service_radius' => '50',
			'opening_hours'  => '',
		),

		// Analytics
		'analytics'      => array(
			'ga_measurement_id' => '',
			'gtm_container_id'  => '',
			'fb_pixel_id'       => '',
		),

		// Legal Pages
		'legal'          => array(
			'privacy_policy_url' => '/privacy-policy',
			'terms_url'          => '/terms-and-conditions',
			'cookie_settings_url' => '/cookie-settings',
		),
	);
}

/**
 * Get all theme settings
 *
 * @return array Theme settings array.
 */
function lakecity_get_theme_settings(): array {
	$settings = get_option( LAKECITY_OPTION_THEME_SETTINGS, array() );
	$defaults = lakecity_get_default_settings();

	// Merge with defaults (deep merge)
	return lakecity_array_merge_recursive_distinct( $defaults, $settings );
}

/**
 * Update theme settings
 *
 * @param array $settings New settings array.
 * @return bool True on success, false on failure.
 */
function lakecity_update_theme_settings( array $settings ): bool {
	// Sanitize settings before saving
	$sanitized = lakecity_sanitize_theme_settings( $settings );

	return update_option( LAKECITY_OPTION_THEME_SETTINGS, $sanitized );
}

/**
 * Sanitize theme settings
 *
 * @param array $settings Settings to sanitize.
 * @return array Sanitized settings.
 */
function lakecity_sanitize_theme_settings( array $settings ): array {
	$sanitized = array();

	// Brand
	if ( isset( $settings['brand'] ) ) {
		$sanitized['brand'] = array(
			'logo'      => isset( $settings['brand']['logo'] ) ? array(
				'url' => esc_url_raw( $settings['brand']['logo']['url'] ?? '' ),
				'alt' => sanitize_text_field( $settings['brand']['logo']['alt'] ?? '' ),
			) : array( 'url' => '', 'alt' => '' ),
			'phone'     => sanitize_text_field( $settings['brand']['phone'] ?? '' ),
			'phone_raw' => preg_replace( '/\D/', '', $settings['brand']['phone'] ?? '' ),
			'email'     => sanitize_email( $settings['brand']['email'] ?? '' ),
		);
	}

	// Google Reviews
	if ( isset( $settings['google_reviews'] ) ) {
		$sanitized['google_reviews'] = array(
			'rating'      => sanitize_text_field( $settings['google_reviews']['rating'] ?? '5.0' ),
			'count'       => sanitize_text_field( $settings['google_reviews']['count'] ?? '' ),
			'reviews_url' => esc_url_raw( $settings['google_reviews']['reviews_url'] ?? '' ),
		);
	}

	// Footer
	if ( isset( $settings['footer'] ) ) {
		$sanitized['footer'] = array(
			'tagline'        => sanitize_text_field( $settings['footer']['tagline'] ?? '' ),
			'description'    => wp_kses_post( $settings['footer']['description'] ?? '' ),
			'address'        => sanitize_textarea_field( $settings['footer']['address'] ?? '' ),
			'business_hours' => sanitize_text_field( $settings['footer']['business_hours'] ?? '' ),
			'copyright'      => sanitize_text_field( $settings['footer']['copyright'] ?? '' ),
		);
	}

	// Social
	if ( isset( $settings['social'] ) ) {
		$sanitized['social'] = array(
			'facebook_url'  => esc_url_raw( $settings['social']['facebook_url'] ?? '' ),
			'instagram_url' => esc_url_raw( $settings['social']['instagram_url'] ?? '' ),
			'youtube_url'   => esc_url_raw( $settings['social']['youtube_url'] ?? '' ),
			'yelp_url'      => esc_url_raw( $settings['social']['yelp_url'] ?? '' ),
		);
	}

	// SEO
	if ( isset( $settings['seo'] ) ) {
		$sanitized['seo'] = array(
			'site_name'        => sanitize_text_field( $settings['seo']['site_name'] ?? '' ),
			'site_tagline'     => sanitize_text_field( $settings['seo']['site_tagline'] ?? '' ),
			'site_description' => sanitize_textarea_field( $settings['seo']['site_description'] ?? '' ),
			'site_keywords'    => sanitize_text_field( $settings['seo']['site_keywords'] ?? '' ),
			'site_url'         => esc_url_raw( $settings['seo']['site_url'] ?? '' ),
			'og_image'         => esc_url_raw( $settings['seo']['og_image'] ?? '' ),
		);
	}

	// Schema
	if ( isset( $settings['schema'] ) ) {
		$sanitized['schema'] = array(
			'type'           => sanitize_text_field( $settings['schema']['type'] ?? 'LocalBusiness' ),
			'price_range'    => sanitize_text_field( $settings['schema']['price_range'] ?? '$$' ),
			'street'         => sanitize_text_field( $settings['schema']['street'] ?? '' ),
			'city'           => sanitize_text_field( $settings['schema']['city'] ?? '' ),
			'state'          => sanitize_text_field( $settings['schema']['state'] ?? '' ),
			'postal'         => sanitize_text_field( $settings['schema']['postal'] ?? '' ),
			'country'        => sanitize_text_field( $settings['schema']['country'] ?? 'US' ),
			'geo_lat'        => sanitize_text_field( $settings['schema']['geo_lat'] ?? '' ),
			'geo_lng'        => sanitize_text_field( $settings['schema']['geo_lng'] ?? '' ),
			'service_radius' => sanitize_text_field( $settings['schema']['service_radius'] ?? '50' ),
			'opening_hours'  => sanitize_textarea_field( $settings['schema']['opening_hours'] ?? '' ),
		);
	}

	// Analytics
	if ( isset( $settings['analytics'] ) ) {
		$sanitized['analytics'] = array(
			'ga_measurement_id' => sanitize_text_field( $settings['analytics']['ga_measurement_id'] ?? '' ),
			'gtm_container_id'  => sanitize_text_field( $settings['analytics']['gtm_container_id'] ?? '' ),
			'fb_pixel_id'       => sanitize_text_field( $settings['analytics']['fb_pixel_id'] ?? '' ),
		);
	}

	// Legal
	if ( isset( $settings['legal'] ) ) {
		$sanitized['legal'] = array(
			'privacy_policy_url'  => esc_url_raw( $settings['legal']['privacy_policy_url'] ?? '' ),
			'terms_url'           => esc_url_raw( $settings['legal']['terms_url'] ?? '' ),
			'cookie_settings_url' => esc_url_raw( $settings['legal']['cookie_settings_url'] ?? '' ),
		);
	}

	return $sanitized;
}

/**
 * Deep merge arrays (overrides array_merge_recursive behavior)
 *
 * @param array $array1 Base array.
 * @param array $array2 Override array.
 * @return array Merged array.
 */
function lakecity_array_merge_recursive_distinct( array $array1, array $array2 ): array {
	$merged = $array1;

	foreach ( $array2 as $key => $value ) {
		if ( is_array( $value ) && isset( $merged[ $key ] ) && is_array( $merged[ $key ] ) ) {
			$merged[ $key ] = lakecity_array_merge_recursive_distinct( $merged[ $key ], $value );
		} else {
			$merged[ $key ] = $value;
		}
	}

	return $merged;
}

/**
 * Flatten settings for backward compatibility with existing code
 *
 * Converts nested structure to flat key-value pairs (ACF-style)
 *
 * @return array Flattened settings.
 */
function lakecity_get_all_settings(): array {
	$settings = lakecity_get_theme_settings();
	$flattened = array();

	// Brand
	$flattened['logo']       = $settings['brand']['logo']['url'] ?? '';
	$flattened['logo_alt']   = $settings['brand']['logo']['alt'] ?? '';
	$flattened['phone']      = $settings['brand']['phone'] ?? '';
	$flattened['phone_raw']  = $settings['brand']['phone_raw'] ?? '';
	$flattened['email']      = $settings['brand']['email'] ?? '';

	// Google Reviews
	$flattened['google_rating']        = $settings['google_reviews']['rating'] ?? '5.0';
	$flattened['google_reviews_count'] = $settings['google_reviews']['count'] ?? '';
	$flattened['google_reviews_url']   = $settings['google_reviews']['reviews_url'] ?? '';

	// Footer
	$flattened['footer_tagline']     = $settings['footer']['tagline'] ?? '';
	$flattened['footer_description'] = $settings['footer']['description'] ?? '';
	$flattened['address']            = $settings['footer']['address'] ?? '';
	$flattened['business_hours']     = $settings['footer']['business_hours'] ?? '';
	$flattened['copyright']          = $settings['footer']['copyright'] ?? '';

	// Social
	$flattened['facebook_url']  = $settings['social']['facebook_url'] ?? '';
	$flattened['instagram_url'] = $settings['social']['instagram_url'] ?? '';
	$flattened['youtube_url']   = $settings['social']['youtube_url'] ?? '';
	$flattened['yelp_url']      = $settings['social']['yelp_url'] ?? '';

	// SEO
	$flattened['site_name']        = $settings['seo']['site_name'] ?? '';
	$flattened['site_tagline']     = $settings['seo']['site_tagline'] ?? '';
	$flattened['site_description'] = $settings['seo']['site_description'] ?? '';
	$flattened['site_keywords']    = $settings['seo']['site_keywords'] ?? '';
	$flattened['site_url']         = $settings['seo']['site_url'] ?? home_url();
	$flattened['og_image']         = $settings['seo']['og_image'] ?? '';

	// Schema
	$flattened['schema_type']           = $settings['schema']['type'] ?? 'LocalBusiness';
	$flattened['schema_price_range']    = $settings['schema']['price_range'] ?? '$$';
	$flattened['schema_street']         = $settings['schema']['street'] ?? '';
	$flattened['schema_city']           = $settings['schema']['city'] ?? '';
	$flattened['schema_state']          = $settings['schema']['state'] ?? '';
	$flattened['schema_postal']         = $settings['schema']['postal'] ?? '';
	$flattened['schema_country']        = $settings['schema']['country'] ?? 'US';
	$flattened['schema_geo_lat']        = $settings['schema']['geo_lat'] ?? '';
	$flattened['schema_geo_lng']        = $settings['schema']['geo_lng'] ?? '';
	$flattened['schema_service_radius'] = $settings['schema']['service_radius'] ?? '50';
	$flattened['schema_opening_hours']  = $settings['schema']['opening_hours'] ?? '';

	// Analytics
	$flattened['ga_measurement_id'] = $settings['analytics']['ga_measurement_id'] ?? '';
	$flattened['gtm_container_id']  = $settings['analytics']['gtm_container_id'] ?? '';
	$flattened['fb_pixel_id']       = $settings['analytics']['fb_pixel_id'] ?? '';

	// Legal
	$flattened['privacy_policy_url']  = $settings['legal']['privacy_policy_url'] ?? '/privacy-policy';
	$flattened['terms_url']           = $settings['legal']['terms_url'] ?? '/terms-and-conditions';
	$flattened['cookie_settings_url'] = $settings['legal']['cookie_settings_url'] ?? '/cookie-settings';

	return $flattened;
}

/**
 * Register REST API endpoints for theme settings
 */
function lakecity_register_settings_api(): void {
	// GET settings
	register_rest_route(
		LAKECITY_REST_NAMESPACE,
		'/settings',
		array(
			'methods'             => 'GET',
			'callback'            => function() {
				return rest_ensure_response( array(
					'success'  => true,
					'settings' => lakecity_get_all_settings(),
				) );
			},
			'permission_callback' => '__return_true', // Public endpoint
		)
	);

	// PUT settings (admin only)
	register_rest_route(
		LAKECITY_REST_NAMESPACE,
		'/settings',
		array(
			'methods'             => 'PUT',
			'callback'            => function( WP_REST_Request $request ) {
				// Rate limit
				if ( ! lakecity_check_rate_limit( 'update_settings', 5, 60 ) ) {
					return new WP_Error(
						'rate_limit_exceeded',
						'Too many requests. Please try again later.',
						array( 'status' => 429 )
					);
				}

				$settings = $request->get_json_params();

				if ( empty( $settings ) ) {
					return new WP_Error(
						'empty_settings',
						'No settings provided',
						array( 'status' => 400 )
					);
				}

				// Save settings (update_option returns false if value unchanged, which is OK)
				lakecity_update_theme_settings( $settings );

				// Verify settings were saved by reading them back
				$saved_settings = lakecity_get_theme_settings();
				if ( empty( $saved_settings ) ) {
					return new WP_Error(
						'save_failed',
						'Failed to save settings',
						array( 'status' => 500 )
					);
				}

				return rest_ensure_response( array(
					'success'  => true,
					'settings' => lakecity_get_all_settings(),
				) );
			},
			'permission_callback' => function() {
				return current_user_can( 'manage_options' );
			},
		)
	);
}
add_action( 'rest_api_init', 'lakecity_register_settings_api' );

/**
 * Inject settings into frontend (for React)
 */
function lakecity_enqueue_settings_script(): void {
	if ( is_admin() ) {
		return;
	}

	wp_localize_script(
		'lakecity-main',
		'lakecitySettings',
		lakecity_get_all_settings()
	);
}
add_action( 'wp_enqueue_scripts', 'lakecity_enqueue_settings_script', 20 );
