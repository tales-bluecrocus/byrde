<?php
/**
 * Theme Settings Manager (Native WordPress Options)
 *
 * Replaces ACF Pro dependency with native WordPress options.
 * Manages all global theme settings: brand, social, SEO, analytics, schema, etc.
 *
 * @package Byrde
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Get default theme settings structure
 *
 * @return array Default settings with all fields.
 */
function byrde_get_default_settings(): array {
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
			'ga_measurement_id'           => '',
			'gtm_container_id'            => '',
			'fb_pixel_id'                 => '',
			'gads_conversion_label'       => '',
			'gads_phone_conversion_label' => '',
		),

		// Legal Pages
		'legal'          => array(
			'privacy_policy_url' => '/lp/privacy-policy',
			'terms_url'          => '/lp/terms-and-conditions',
			'cookie_settings_url' => '/lp/cookie-settings',
		),

		// Button Style (per-mode colors + shared structure)
		'button_style'   => array(
			'dark_bg'            => '',
			'dark_text'          => '#ffffff',
			'dark_border_color'  => '',
			'light_bg'           => '',
			'light_text'         => '#ffffff',
			'light_border_color' => '',
			'border_width'       => '0',
			'border_radius'      => '12',
		),

		// Contact Form (server-only, not exposed to frontend)
		'contact_form'   => array(
			'postmark_api_token' => '',
			'to_email'           => '',
			'from_email'         => '',
			'subject'            => 'New Lead from Website',
		),
	);
}

/**
 * Get all theme settings
 *
 * @return array Theme settings array.
 */
function byrde_get_theme_settings(): array {
	$settings = get_option( BYRDE_OPTION_THEME_SETTINGS, array() );
	$defaults = byrde_get_default_settings();

	// Merge with defaults (deep merge)
	return byrde_array_merge_recursive_distinct( $defaults, $settings );
}

/**
 * Update theme settings
 *
 * @param array $settings New settings array.
 * @return bool True on success, false on failure.
 */
function byrde_update_theme_settings( array $settings ): bool {
	// Sanitize settings before saving
	$sanitized = byrde_sanitize_theme_settings( $settings );

	return update_option( BYRDE_OPTION_THEME_SETTINGS, $sanitized );
}

/**
 * Sanitize theme settings
 *
 * @param array $settings Settings to sanitize.
 * @return array Sanitized settings.
 */
function byrde_sanitize_theme_settings( array $settings ): array {
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
			'ga_measurement_id'           => sanitize_text_field( $settings['analytics']['ga_measurement_id'] ?? '' ),
			'gtm_container_id'            => sanitize_text_field( $settings['analytics']['gtm_container_id'] ?? '' ),
			'fb_pixel_id'                 => sanitize_text_field( $settings['analytics']['fb_pixel_id'] ?? '' ),
			'gads_conversion_label'       => sanitize_text_field( $settings['analytics']['gads_conversion_label'] ?? '' ),
			'gads_phone_conversion_label' => sanitize_text_field( $settings['analytics']['gads_phone_conversion_label'] ?? '' ),
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

	// Contact Form
	if ( isset( $settings['contact_form'] ) ) {
		$sanitized['contact_form'] = array(
			'postmark_api_token' => sanitize_text_field( $settings['contact_form']['postmark_api_token'] ?? '' ),
			'to_email'           => sanitize_email( $settings['contact_form']['to_email'] ?? '' ),
			'from_email'         => sanitize_email( $settings['contact_form']['from_email'] ?? '' ),
			'subject'            => sanitize_text_field( $settings['contact_form']['subject'] ?? 'New Lead from Website' ),
		);
	}

	// Brand Colors (per-mode)
	if ( isset( $settings['brand_colors'] ) ) {
		$sanitized['brand_colors'] = array(
			'dark_primary'  => byrde_sanitize_hex_color_alpha( $settings['brand_colors']['dark_primary'] ?? '#3ab342' ) ?: '#3ab342',
			'dark_accent'   => byrde_sanitize_hex_color_alpha( $settings['brand_colors']['dark_accent'] ?? '#f97316' ) ?: '#f97316',
			'dark_bg'       => byrde_sanitize_hex_color_alpha( $settings['brand_colors']['dark_bg'] ?? '#171717' ) ?: '#171717',
			'dark_text'     => byrde_sanitize_hex_color_alpha( $settings['brand_colors']['dark_text'] ?? '#efefef' ) ?: '#efefef',
			'light_primary' => byrde_sanitize_hex_color_alpha( $settings['brand_colors']['light_primary'] ?? '#3ab342' ) ?: '#3ab342',
			'light_accent'  => byrde_sanitize_hex_color_alpha( $settings['brand_colors']['light_accent'] ?? '#f97316' ) ?: '#f97316',
			'light_bg'      => byrde_sanitize_hex_color_alpha( $settings['brand_colors']['light_bg'] ?? '#ffffff' ) ?: '#ffffff',
			'light_text'    => byrde_sanitize_hex_color_alpha( $settings['brand_colors']['light_text'] ?? '#2a2a2a' ) ?: '#2a2a2a',
			'mode'          => in_array( $settings['brand_colors']['mode'] ?? 'dark', array( 'light', 'dark' ), true )
				? $settings['brand_colors']['mode']
				: 'dark',
		);
	}

	// Button Style (per-mode colors + shared structure)
	if ( isset( $settings['button_style'] ) ) {
		$bs = $settings['button_style'];
		$sanitize_btn_color = function( $val, $default = '' ) {
			if ( empty( $val ) ) return $default;
			return byrde_sanitize_hex_color_alpha( $val ) ?: $default;
		};

		$sanitized['button_style'] = array(
			'dark_bg'            => $sanitize_btn_color( $bs['dark_bg'] ?? '' ),
			'dark_text'          => $sanitize_btn_color( $bs['dark_text'] ?? '#ffffff', '#ffffff' ),
			'dark_border_color'  => $sanitize_btn_color( $bs['dark_border_color'] ?? '' ),
			'light_bg'           => $sanitize_btn_color( $bs['light_bg'] ?? '' ),
			'light_text'         => $sanitize_btn_color( $bs['light_text'] ?? '#ffffff', '#ffffff' ),
			'light_border_color' => $sanitize_btn_color( $bs['light_border_color'] ?? '' ),
			'border_width'       => max( 0, min( 10, intval( $bs['border_width'] ?? '0' ) ) ) . '',
			'border_radius'      => max( 0, min( 9999, intval( $bs['border_radius'] ?? '12' ) ) ) . '',
		);
	}

	return $sanitized;
}

/**
 * Sanitize hex color with optional alpha (supports #RGB, #RGBA, #RRGGBB, #RRGGBBAA)
 *
 * @param string $color Hex color string.
 * @return string|false Sanitized hex or false if invalid.
 */
function byrde_sanitize_hex_color_alpha( string $color ) {
	if ( preg_match( '/^#([a-fA-F0-9]{3,4}|[a-fA-F0-9]{6}|[a-fA-F0-9]{8})$/', $color ) ) {
		return $color;
	}
	return false;
}

/**
 * Deep merge arrays (overrides array_merge_recursive behavior)
 *
 * @param array $array1 Base array.
 * @param array $array2 Override array.
 * @return array Merged array.
 */
function byrde_array_merge_recursive_distinct( array $array1, array $array2 ): array {
	$merged = $array1;

	foreach ( $array2 as $key => $value ) {
		if ( is_array( $value ) && isset( $merged[ $key ] ) && is_array( $merged[ $key ] ) ) {
			$merged[ $key ] = byrde_array_merge_recursive_distinct( $merged[ $key ], $value );
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
function byrde_get_all_settings(): array {
	$settings = byrde_get_theme_settings();
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
	$flattened['ga_measurement_id']     = $settings['analytics']['ga_measurement_id'] ?? '';
	$flattened['gtm_container_id']      = $settings['analytics']['gtm_container_id'] ?? '';
	$flattened['fb_pixel_id']           = $settings['analytics']['fb_pixel_id'] ?? '';
	$flattened['gads_conversion_label']       = $settings['analytics']['gads_conversion_label'] ?? '';
	$flattened['gads_phone_conversion_label'] = $settings['analytics']['gads_phone_conversion_label'] ?? '';

	// Legal — use home_url() so multisite subdirectory prefix is included
	$privacy = $settings['legal']['privacy_policy_url'] ?? '';
	$terms   = $settings['legal']['terms_url'] ?? '';
	$cookie  = $settings['legal']['cookie_settings_url'] ?? '';
	$flattened['privacy_policy_url']  = $privacy ?: home_url( '/lp/privacy-policy' );
	$flattened['terms_url']           = $terms ?: home_url( '/lp/terms-and-conditions' );
	$flattened['cookie_settings_url'] = $cookie ?: home_url( '/lp/cookie-settings' );

	// Brand Colors (per-mode)
	$flattened['brand_dark_primary']  = $settings['brand_colors']['dark_primary'] ?? '#3ab342';
	$flattened['brand_dark_accent']   = $settings['brand_colors']['dark_accent'] ?? '#f97316';
	$flattened['brand_dark_bg']       = $settings['brand_colors']['dark_bg'] ?? '#171717';
	$flattened['brand_dark_text']     = $settings['brand_colors']['dark_text'] ?? '#efefef';
	$flattened['brand_light_primary'] = $settings['brand_colors']['light_primary'] ?? '#3ab342';
	$flattened['brand_light_accent']  = $settings['brand_colors']['light_accent'] ?? '#f97316';
	$flattened['brand_light_bg']      = $settings['brand_colors']['light_bg'] ?? '#ffffff';
	$flattened['brand_light_text']    = $settings['brand_colors']['light_text'] ?? '#2a2a2a';
	$flattened['brand_mode']          = $settings['brand_colors']['mode'] ?? 'dark';
	// Button style (per-mode + shared)
	$flattened['button_dark_bg']            = $settings['button_style']['dark_bg'] ?? '';
	$flattened['button_dark_text']          = $settings['button_style']['dark_text'] ?? '#ffffff';
	$flattened['button_dark_border_color']  = $settings['button_style']['dark_border_color'] ?? '';
	$flattened['button_light_bg']           = $settings['button_style']['light_bg'] ?? '';
	$flattened['button_light_text']         = $settings['button_style']['light_text'] ?? '#ffffff';
	$flattened['button_light_border_color'] = $settings['button_style']['light_border_color'] ?? '';
	$flattened['button_border_width']       = $settings['button_style']['border_width'] ?? '0';
	$flattened['button_border_radius']      = $settings['button_style']['border_radius'] ?? '12';

	// Ensure all values are strings (PHP 8.1+ wp_localize_script compat)
	return array_map( 'strval', $flattened );
}

/**
 * Get a single theme setting by flat key
 *
 * Reads from the nested settings structure using a key map.
 * Used by contact-form-handler.php and functions.php.
 *
 * @param string $key     Setting key (flat format).
 * @param mixed  $default Default value if not found.
 * @return mixed Setting value.
 */
function byrde_get_setting( string $key, $default = '' ) {
	static $cache = null;

	if ( null === $cache ) {
		$cache = byrde_get_all_settings();

		// Add contact form settings (server-only, not in frontend)
		$settings = byrde_get_theme_settings();
		$cache['postmark_api_token']      = $settings['contact_form']['postmark_api_token'] ?? '';
		$cache['contact_form_to_email']   = $settings['contact_form']['to_email'] ?? '';
		$cache['contact_form_from_email'] = $settings['contact_form']['from_email'] ?? '';
		$cache['contact_form_subject']    = $settings['contact_form']['subject'] ?? 'New Lead from Website';
	}

	$value = $cache[ $key ] ?? null;

	if ( null === $value || false === $value ) {
		return $default;
	}

	return $value ?: $default;
}

/**
 * Register REST API endpoints for theme settings
 */
function byrde_register_settings_api(): void {
	// GET settings
	register_rest_route(
		BYRDE_REST_NAMESPACE,
		'/settings',
		array(
			'methods'             => 'GET',
			'callback'            => function() {
				return rest_ensure_response( array(
					'success'  => true,
					'settings' => byrde_get_all_settings(),
				) );
			},
			'permission_callback' => '__return_true', // Public endpoint
		)
	);

	// PUT settings (admin only)
	register_rest_route(
		BYRDE_REST_NAMESPACE,
		'/settings',
		array(
			'methods'             => 'PUT',
			'callback'            => function( WP_REST_Request $request ) {
				// Rate limit
				if ( ! byrde_check_rate_limit( 'update_settings', 5, 60 ) ) {
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
				byrde_update_theme_settings( $settings );

				// Verify settings were saved by reading them back
				$saved_settings = byrde_get_theme_settings();
				if ( empty( $saved_settings ) ) {
					return new WP_Error(
						'save_failed',
						'Failed to save settings',
						array( 'status' => 500 )
					);
				}

				return rest_ensure_response( array(
					'success'  => true,
					'settings' => byrde_get_all_settings(),
				) );
			},
			'permission_callback' => function() {
				return current_user_can( 'manage_options' );
			},
		)
	);
}
add_action( 'rest_api_init', 'byrde_register_settings_api' );

// Note: byrde_enqueue_assets() in functions.php handles wp_localize_script
// for byrdeSettings, including the apiUrl and admin-only contact form fields.
