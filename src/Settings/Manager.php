<?php

namespace Byrde\Settings;

use Byrde\Core\Constants;
use Byrde\Security\RateLimiter;
use WP_Error;
use WP_REST_Request;

/**
 * Theme Settings Manager (Native WordPress Options)
 *
 * Replaces ACF Pro dependency with native WordPress options.
 * Manages all global theme settings: brand, social, SEO, analytics, schema, etc.
 *
 * @package Byrde\Settings
 */
class Manager {

    /**
     * Register REST API endpoints for theme settings.
     */
    public function register(): void {
        add_action( 'rest_api_init', [ $this, 'register_routes' ] );
    }

    /**
     * Register REST API routes.
     */
    public function register_routes(): void {
        // GET settings
        register_rest_route(
            Constants::REST_NAMESPACE,
            '/settings',
            [
                'methods'             => 'GET',
                'callback'            => function () {
                    return rest_ensure_response( [
                        'success'  => true,
                        'settings' => $this->get_public(),
                    ] );
                },
                'permission_callback' => '__return_true', // Public endpoint
            ]
        );

        // PUT settings (admin only)
        register_rest_route(
            Constants::REST_NAMESPACE,
            '/settings',
            [
                'methods'             => 'PUT',
                'callback'            => function ( WP_REST_Request $request ) {
                    // Rate limit
                    if ( ! RateLimiter::check( 'update_settings', 5, 60 ) ) {
                        return new WP_Error(
                            'rate_limit_exceeded',
                            'Too many requests. Please try again later.',
                            [ 'status' => 429 ]
                        );
                    }

                    $settings = $request->get_json_params();

                    if ( empty( $settings ) ) {
                        return new WP_Error(
                            'empty_settings',
                            'No settings provided',
                            [ 'status' => 400 ]
                        );
                    }

                    // Save settings (update_option returns false if value unchanged, which is OK)
                    $this->update( $settings );

                    // Verify settings were saved by reading them back
                    $saved_settings = $this->get_theme_settings();
                    if ( empty( $saved_settings ) ) {
                        return new WP_Error(
                            'save_failed',
                            'Failed to save settings',
                            [ 'status' => 500 ]
                        );
                    }

                    return rest_ensure_response( [
                        'success'  => true,
                        'settings' => $this->get_all(),
                    ] );
                },
                'permission_callback' => function () {
                    return current_user_can( 'manage_options' );
                },
            ]
        );
    }

    /**
     * Convert a display phone number to tel:-compatible raw format.
     * Strips everything except digits, but preserves a leading + for international numbers.
     *
     * @param string $phone Display phone (e.g., "+1 (479) 877-5803" or "(208) 998-0054").
     * @return string Raw phone for tel: links (e.g., "+14798775803" or "2089980054").
     */
    public static function phone_to_raw( string $phone ): string {
        $phone = trim( $phone );
        if ( '' === $phone ) {
            return '';
        }
        $has_plus = str_starts_with( $phone, '+' );
        $digits   = preg_replace( '/\D/', '', $phone );
        return $has_plus ? '+' . $digits : $digits;
    }

    /**
     * Get default theme settings structure.
     *
     * @return array Default settings with all fields.
     */
    public function get_defaults(): array {
        return [
            // Brand
            'brand'          => [
                'logo'      => [
                    'url' => '',
                    'alt' => '',
                ],
                'phone'     => '',
                'phone_raw' => '', // Digits only
                'email'     => '',
            ],

            // Google Reviews
            'google_reviews' => [
                'rating'      => '5.0',
                'count'       => '',
                'reviews_url' => '',
            ],

            // Footer
            'footer'         => [
                'tagline'        => 'Your Trusted Local Service Provider',
                'description'    => 'Professional services you can count on. Licensed, insured, and locally owned.',
                'address'        => '123 Main St, City, ST',
                'business_hours' => 'Mon-Sat: 7AM – 7PM',
                'copyright'      => '© ' . gmdate( 'Y' ) . ' Company. All rights reserved.',
            ],

            // Social Media
            'social'         => [
                'facebook_url'  => '',
                'instagram_url' => '',
                'youtube_url'   => '',
                'yelp_url'      => '',
            ],

            // SEO
            'seo'            => [
                'site_name'        => get_bloginfo( 'name' ),
                'site_tagline'     => get_bloginfo( 'description' ),
                'site_description' => '',
                'site_keywords'    => '',
                'site_url'         => home_url(),
                'og_image'         => '',
            ],

            // Schema / Structured Data
            'schema'         => [
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
            ],

            // Analytics
            'analytics'      => [
                'ga_measurement_id'           => '',
                'gtm_container_id'            => '',
                'fb_pixel_id'                 => '',
                'gads_conversion_label'       => '',
                'gads_phone_conversion_label' => '',
            ],

            // Legal Pages
            'legal'          => [
                'privacy_policy_url'  => '/lp/privacy-policy',
                'terms_url'           => '/lp/terms-and-conditions',
                'cookie_settings_url' => '/lp/cookie-settings',
            ],

            // Button Style (shape + per-mode text colors + shadow)
            'button_style'   => [
                'border_width'            => '0',
                'border_radius'           => '12',
                'dark_text_color'         => '#ffffff',
                'dark_accent_text_color'  => '#ffffff',
                'light_text_color'        => '#ffffff',
                'light_accent_text_color' => '#000000',
                'shadow'                  => 'md',
            ],

            // Brand Colors (per-mode primary + accent + text + default mode)
            'brand_colors'   => [
                'dark_primary'  => '#3ab342',
                'dark_accent'   => '#f97316',
                'dark_text'     => '#efefef',
                'light_primary' => '#3ab342',
                'light_accent'  => '#f97316',
                'light_text'    => '#2a2a2a',
                'mode'          => 'dark',
            ],

            // Contact Form (server-only, not exposed to frontend)
            'contact_form'   => [
                'postmark_api_token' => '',
                'to_email'           => '',
                'from_email'         => '',
                'subject'            => 'New Lead from Website',
            ],
        ];
    }

    /**
     * Get all theme settings (nested structure).
     *
     * @return array Theme settings array.
     */
    public function get_theme_settings(): array {
        $settings = get_option( Constants::OPTION_THEME_SETTINGS, [] );
        $defaults = $this->get_defaults();

        // Merge with defaults (deep merge)
        return $this->array_merge_recursive_distinct( $defaults, $settings );
    }

    /**
     * Update theme settings.
     *
     * @param array $settings New settings array.
     * @return bool True on success, false on failure.
     */
    public function update( array $settings ): bool {
        // Merge with existing settings so partial updates don't erase other sections.
        $existing  = get_option( Constants::OPTION_THEME_SETTINGS, [] );
        $sanitized = $this->sanitize( $settings );
        $merged    = $this->array_merge_recursive_distinct( $existing, $sanitized );

        return update_option( Constants::OPTION_THEME_SETTINGS, $merged );
    }

    /**
     * Sanitize theme settings.
     *
     * @param array $settings Settings to sanitize.
     * @return array Sanitized settings.
     */
    public function sanitize( array $settings ): array {
        $sanitized = [];

        // Brand
        if ( isset( $settings['brand'] ) ) {
            $sanitized['brand'] = [
                'logo'      => isset( $settings['brand']['logo'] ) ? [
                    'url' => esc_url_raw( $settings['brand']['logo']['url'] ?? '' ),
                    'alt' => sanitize_text_field( $settings['brand']['logo']['alt'] ?? '' ),
                ] : [ 'url' => '', 'alt' => '' ],
                'phone'     => sanitize_text_field( $settings['brand']['phone'] ?? '' ),
                'phone_raw' => self::phone_to_raw( $settings['brand']['phone'] ?? '' ),
                'email'     => sanitize_email( $settings['brand']['email'] ?? '' ),
            ];
        }

        // Google Reviews
        if ( isset( $settings['google_reviews'] ) ) {
            $sanitized['google_reviews'] = [
                'rating'      => sanitize_text_field( $settings['google_reviews']['rating'] ?? '5.0' ),
                'count'       => sanitize_text_field( $settings['google_reviews']['count'] ?? '' ),
                'reviews_url' => esc_url_raw( $settings['google_reviews']['reviews_url'] ?? '' ),
            ];
        }

        // Footer
        if ( isset( $settings['footer'] ) ) {
            $sanitized['footer'] = [
                'tagline'        => sanitize_text_field( $settings['footer']['tagline'] ?? '' ),
                'description'    => wp_kses_post( $settings['footer']['description'] ?? '' ),
                'address'        => sanitize_textarea_field( $settings['footer']['address'] ?? '' ),
                'business_hours' => sanitize_text_field( $settings['footer']['business_hours'] ?? '' ),
                'copyright'      => sanitize_text_field( $settings['footer']['copyright'] ?? '' ),
            ];
        }

        // Social
        if ( isset( $settings['social'] ) ) {
            $sanitized['social'] = [
                'facebook_url'  => esc_url_raw( $settings['social']['facebook_url'] ?? '' ),
                'instagram_url' => esc_url_raw( $settings['social']['instagram_url'] ?? '' ),
                'youtube_url'   => esc_url_raw( $settings['social']['youtube_url'] ?? '' ),
                'yelp_url'      => esc_url_raw( $settings['social']['yelp_url'] ?? '' ),
            ];
        }

        // SEO
        if ( isset( $settings['seo'] ) ) {
            $sanitized['seo'] = [
                'site_name'        => sanitize_text_field( $settings['seo']['site_name'] ?? '' ),
                'site_tagline'     => sanitize_text_field( $settings['seo']['site_tagline'] ?? '' ),
                'site_description' => sanitize_textarea_field( $settings['seo']['site_description'] ?? '' ),
                'site_keywords'    => sanitize_text_field( $settings['seo']['site_keywords'] ?? '' ),
                'site_url'         => esc_url_raw( $settings['seo']['site_url'] ?? '' ),
                'og_image'         => esc_url_raw( $settings['seo']['og_image'] ?? '' ),
            ];
        }

        // Schema
        if ( isset( $settings['schema'] ) ) {
            $sanitized['schema'] = [
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
            ];
        }

        // Analytics
        if ( isset( $settings['analytics'] ) ) {
            $sanitized['analytics'] = [
                'ga_measurement_id'           => sanitize_text_field( $settings['analytics']['ga_measurement_id'] ?? '' ),
                'gtm_container_id'            => sanitize_text_field( $settings['analytics']['gtm_container_id'] ?? '' ),
                'fb_pixel_id'                 => sanitize_text_field( $settings['analytics']['fb_pixel_id'] ?? '' ),
                'gads_conversion_label'       => sanitize_text_field( $settings['analytics']['gads_conversion_label'] ?? '' ),
                'gads_phone_conversion_label' => sanitize_text_field( $settings['analytics']['gads_phone_conversion_label'] ?? '' ),
            ];
        }

        // Legal
        if ( isset( $settings['legal'] ) ) {
            $sanitized['legal'] = [
                'privacy_policy_url'  => esc_url_raw( $settings['legal']['privacy_policy_url'] ?? '' ),
                'terms_url'           => esc_url_raw( $settings['legal']['terms_url'] ?? '' ),
                'cookie_settings_url' => esc_url_raw( $settings['legal']['cookie_settings_url'] ?? '' ),
            ];
        }

        // Contact Form
        if ( isset( $settings['contact_form'] ) ) {
            $sanitized['contact_form'] = [
                'postmark_api_token' => sanitize_text_field( $settings['contact_form']['postmark_api_token'] ?? '' ),
                'to_email'           => sanitize_email( $settings['contact_form']['to_email'] ?? '' ),
                'from_email'         => sanitize_email( $settings['contact_form']['from_email'] ?? '' ),
                'subject'            => sanitize_text_field( $settings['contact_form']['subject'] ?? 'New Lead from Website' ),
            ];
        }

        // Brand Colors (per-mode primary + accent + text + mode)
        if ( isset( $settings['brand_colors'] ) ) {
            $bc = $settings['brand_colors'];
            $sanitized['brand_colors'] = [
                'dark_primary'  => $this->sanitize_hex_color_alpha( $bc['dark_primary'] ?? '#3ab342' ) ?: '#3ab342',
                'dark_accent'   => $this->sanitize_hex_color_alpha( $bc['dark_accent'] ?? '#f97316' ) ?: '#f97316',
                'dark_text'     => $this->sanitize_hex_color_alpha( $bc['dark_text'] ?? '#efefef' ) ?: '#efefef',
                'light_primary' => $this->sanitize_hex_color_alpha( $bc['light_primary'] ?? '#3ab342' ) ?: '#3ab342',
                'light_accent'  => $this->sanitize_hex_color_alpha( $bc['light_accent'] ?? '#f97316' ) ?: '#f97316',
                'light_text'    => $this->sanitize_hex_color_alpha( $bc['light_text'] ?? '#2a2a2a' ) ?: '#2a2a2a',
                'mode'          => in_array( $bc['mode'] ?? 'dark', [ 'light', 'dark' ], true )
                    ? $bc['mode']
                    : 'dark',
            ];
        }

        // Button Style
        if ( isset( $settings['button_style'] ) ) {
            $bs             = $settings['button_style'];
            $valid_shadows  = [ 'none', 'sm', 'md', 'lg' ];
            $sanitized['button_style'] = [
                'border_width'            => max( 0, min( 10, intval( $bs['border_width'] ?? '0' ) ) ) . '',
                'border_radius'           => max( 0, min( 9999, intval( $bs['border_radius'] ?? '12' ) ) ) . '',
                'dark_text_color'         => $this->sanitize_hex_color_alpha( $bs['dark_text_color'] ?? '#ffffff' ) ?: '#ffffff',
                'dark_accent_text_color'  => $this->sanitize_hex_color_alpha( $bs['dark_accent_text_color'] ?? '#ffffff' ) ?: '#ffffff',
                'light_text_color'        => $this->sanitize_hex_color_alpha( $bs['light_text_color'] ?? '#ffffff' ) ?: '#ffffff',
                'light_accent_text_color' => $this->sanitize_hex_color_alpha( $bs['light_accent_text_color'] ?? '#000000' ) ?: '#000000',
                'shadow'                  => in_array( $bs['shadow'] ?? 'md', $valid_shadows, true ) ? $bs['shadow'] : 'md',
            ];
        }

        return $sanitized;
    }

    /**
     * Flatten settings for backward compatibility with existing code.
     *
     * Converts nested structure to flat key-value pairs (ACF-style).
     *
     * @return array Flattened settings.
     */
    public function get_all(): array {
        $settings  = $this->get_theme_settings();
        $flattened = [];

        // Brand
        $flattened['logo']      = $settings['brand']['logo']['url'] ?? '';
        $flattened['logo_alt']  = $settings['brand']['logo']['alt'] ?? '';
        $flattened['phone']     = $settings['brand']['phone'] ?? '';
        $flattened['phone_raw'] = $settings['brand']['phone_raw'] ?? '';
        $flattened['email']     = $settings['brand']['email'] ?? '';

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
        $flattened['ga_measurement_id']           = $settings['analytics']['ga_measurement_id'] ?? '';
        $flattened['gtm_container_id']            = $settings['analytics']['gtm_container_id'] ?? '';
        $flattened['fb_pixel_id']                 = $settings['analytics']['fb_pixel_id'] ?? '';
        $flattened['gads_conversion_label']       = $settings['analytics']['gads_conversion_label'] ?? '';
        $flattened['gads_phone_conversion_label'] = $settings['analytics']['gads_phone_conversion_label'] ?? '';

        // Legal -- use home_url() so multisite subdirectory prefix is included
        $privacy = $settings['legal']['privacy_policy_url'] ?? '';
        $terms   = $settings['legal']['terms_url'] ?? '';
        $cookie  = $settings['legal']['cookie_settings_url'] ?? '';
        $flattened['privacy_policy_url']  = $privacy ?: home_url( '/lp/privacy-policy' );
        $flattened['terms_url']           = $terms ?: home_url( '/lp/terms-and-conditions' );
        $flattened['cookie_settings_url'] = $cookie ?: home_url( '/lp/cookie-settings' );

        // Brand Colors (per-mode)
        $flattened['brand_dark_primary']  = $settings['brand_colors']['dark_primary'] ?? '#3ab342';
        $flattened['brand_dark_accent']   = $settings['brand_colors']['dark_accent'] ?? '#f97316';
        $flattened['brand_dark_text']     = $settings['brand_colors']['dark_text'] ?? '#efefef';
        $flattened['brand_light_primary'] = $settings['brand_colors']['light_primary'] ?? '#3ab342';
        $flattened['brand_light_accent']  = $settings['brand_colors']['light_accent'] ?? '#f97316';
        $flattened['brand_light_text']    = $settings['brand_colors']['light_text'] ?? '#2a2a2a';
        $flattened['brand_mode']          = $settings['brand_colors']['mode'] ?? 'dark';

        // Button style
        $flattened['button_border_width']            = $settings['button_style']['border_width'] ?? '0';
        $flattened['button_border_radius']           = $settings['button_style']['border_radius'] ?? '12';
        $flattened['button_dark_text_color']         = $settings['button_style']['dark_text_color'] ?? '#ffffff';
        $flattened['button_dark_accent_text_color']  = $settings['button_style']['dark_accent_text_color'] ?? '#ffffff';
        $flattened['button_light_text_color']        = $settings['button_style']['light_text_color'] ?? '#ffffff';
        $flattened['button_light_accent_text_color'] = $settings['button_style']['light_accent_text_color'] ?? '#000000';
        $flattened['button_shadow']                  = $settings['button_style']['shadow'] ?? 'md';

        // Ensure all values are strings (PHP 8.1+ wp_localize_script compat)
        return array_map( 'strval', $flattened );
    }

    /**
     * Public-safe subset of settings (no analytics IDs, no API keys).
     *
     * Used by the unauthenticated GET /settings endpoint.
     *
     * @return array Filtered settings safe for public exposure.
     */
    public function get_public(): array {
        $all = $this->get_all();

        // Keys that should never be exposed publicly.
        $private_keys = [
            'ga_measurement_id',
            'gtm_container_id',
            'fb_pixel_id',
            'gads_conversion_label',
            'gads_phone_conversion_label',
            'postmark_api_token',
            'contact_form_to_email',
            'contact_form_from_email',
            'contact_form_subject',
        ];

        return array_diff_key( $all, array_flip( $private_keys ) );
    }

    /**
     * Get a single theme setting by flat key.
     *
     * Reads from the nested settings structure using a key map.
     * Used by contact-form-handler.php and functions.php.
     *
     * @param string $key     Setting key (flat format).
     * @param mixed  $default Default value if not found.
     * @return mixed Setting value.
     */
    public function get( string $key, $default = '' ) {
        static $cache = null;

        if ( null === $cache ) {
            $cache = $this->get_all();

            // Add contact form settings (server-only, not in frontend)
            $settings                        = $this->get_theme_settings();
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
     * Sanitize hex color with optional alpha (supports #RGB, #RGBA, #RRGGBB, #RRGGBBAA).
     *
     * @param string $color Hex color string.
     * @return string|false Sanitized hex or false if invalid.
     */
    private function sanitize_hex_color_alpha( string $color ) {
        if ( preg_match( '/^#([a-fA-F0-9]{3,4}|[a-fA-F0-9]{6}|[a-fA-F0-9]{8})$/', $color ) ) {
            return $color;
        }
        return false;
    }

    /**
     * Deep merge arrays (overrides array_merge_recursive behavior).
     *
     * @param array $array1 Base array.
     * @param array $array2 Override array.
     * @return array Merged array.
     */
    private function array_merge_recursive_distinct( array $array1, array $array2 ): array {
        $merged = $array1;

        foreach ( $array2 as $key => $value ) {
            if ( is_array( $value ) && isset( $merged[ $key ] ) && is_array( $merged[ $key ] ) ) {
                $merged[ $key ] = $this->array_merge_recursive_distinct( $merged[ $key ], $value );
            } else {
                $merged[ $key ] = $value;
            }
        }

        return $merged;
    }
}
