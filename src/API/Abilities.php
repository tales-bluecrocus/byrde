<?php

namespace Byrde\API;

use Byrde\Core\Constants;
use Byrde\Security\Validators;
use Byrde\Settings\Manager;

/**
 * WordPress Abilities API integration.
 *
 * Registers Byrde abilities that the MCP Adapter can expose as MCP tools,
 * enabling AI agents (Claude Desktop, Cursor, etc.) to manage landing pages.
 *
 * Requirements:
 * - WordPress 6.9+ (Abilities API in core) OR wordpress/abilities-api Composer package
 * - wordpress/mcp-adapter plugin (optional, for MCP exposure)
 *
 * @package Byrde\API
 */
class Abilities {

	private Manager $settings;

	public function __construct( Manager $settings ) {
		$this->settings = $settings;
	}

	/**
	 * Recursively merge two arrays (deep merge).
	 *
	 * Values from $override replace values in $base. Numeric arrays
	 * in $override fully replace those in $base (not appended).
	 *
	 * @param array $base    Base array.
	 * @param array $override Override array (partial).
	 * @return array Merged array.
	 */
	private static function deep_merge( array $base, array $override ): array {
		foreach ( $override as $key => $value ) {
			if (
				is_array( $value )
				&& isset( $base[ $key ] )
				&& is_array( $base[ $key ] )
				&& ! wp_is_numeric_array( $value )
				&& ! wp_is_numeric_array( $base[ $key ] )
			) {
				$base[ $key ] = self::deep_merge( $base[ $key ], $value );
			} else {
				$base[ $key ] = $value;
			}
		}
		return $base;
	}

	/**
	 * Register hooks.
	 */
	public function register(): void {
		add_action( 'wp_abilities_api_categories_init', [ $this, 'register_category' ] );
		add_action( 'wp_abilities_api_init', [ $this, 'register_abilities' ] );
	}

	/**
	 * Register the Byrde ability category.
	 */
	public function register_category(): void {
		if ( ! function_exists( 'wp_register_ability_category' ) ) {
			return;
		}

		wp_register_ability_category( 'byrde', [
			'label'       => 'Byrde Landing Pages',
			'description' => 'Manage PPC landing pages, settings, and content.',
		] );
	}

	/**
	 * Register all Byrde abilities.
	 */
	public function register_abilities(): void {
		if ( ! function_exists( 'wp_register_ability' ) ) {
			return;
		}

		$this->register_get_settings();
		$this->register_update_settings();
		$this->register_list_pages();
		$this->register_get_page();
		$this->register_update_page_theme();
		$this->register_update_page_content();
		$this->register_save_page();
	}

	// ─── GET SETTINGS ────────────────────────────────────────────────

	private function register_get_settings(): void {
		wp_register_ability( 'byrde/get-settings', [
			'label'       => 'Get Byrde Settings',
			'description' => 'Retrieve all global plugin settings: brand (logo, phone, email), colors, SEO, schema, analytics, social links, footer, legal URLs, and button style.',
			'category'    => 'byrde',
			'input_schema' => [
				'type'       => 'object',
				'properties' => [],
			],
			'output_schema' => [
				'type'       => 'object',
				'properties' => [
					'settings' => [
						'type'        => 'object',
						'description' => 'All plugin settings (flattened key-value pairs).',
					],
				],
			],
			'execute_callback'    => function ( $input = [] ) {
				$all = $this->settings->get_all();
				// Ensure array (Manager may return stdClass in some cases).
				if ( $all instanceof \stdClass || is_object( $all ) ) {
					$all = (array) $all;
				}
				return [ 'settings' => $all ];
			},
			'permission_callback' => '__return_true',
			'meta' => [
				'mcp' => [ 'public' => true ],
			],
		] );
	}

	// ─── UPDATE SETTINGS ─────────────────────────────────────────────

	private function register_update_settings(): void {
		wp_register_ability( 'byrde/update-settings', [
			'label'       => 'Update Byrde Settings',
			'description' => 'Update global plugin settings. Accepts partial updates — only provided sections are merged. Sections: brand (logo url/alt, phone, email), google_reviews (rating, count, reviews_url), footer (tagline, description, address, business_hours, copyright), social (facebook_url, instagram_url, youtube_url, yelp_url), seo (site_name, site_tagline, site_description, site_keywords, site_url, og_image), schema (type, price_range, street, city, state, postal, country, geo_lat, geo_lng, service_radius, opening_hours), analytics (ga_measurement_id, gtm_container_id, fb_pixel_id, gads_conversion_label, gads_phone_conversion_label), legal (privacy_policy_url, terms_url, cookie_settings_url), brand_colors (dark_primary, dark_accent, dark_text, light_primary, light_accent, light_text, mode), button_style (border_width, border_radius, dark_text_color, dark_accent_text_color, light_text_color, light_accent_text_color, shadow), contact_form (postmark_api_token, to_email, from_email, cc_email, bcc_email, subject).',
			'category'    => 'byrde',
			'input_schema' => [
				'type'       => 'object',
				'properties' => [
					'settings' => [
						'type'        => 'object',
						'description' => 'Nested settings object. Only include sections you want to update.',
						'required'    => true,
					],
				],
				'required' => [ 'settings' ],
			],
			'output_schema' => [
				'type'       => 'object',
				'properties' => [
					'success'  => [ 'type' => 'boolean' ],
					'settings' => [
						'type'        => 'object',
						'description' => 'Updated settings (all, flattened).',
					],
				],
			],
			'execute_callback' => function ( array $input ) {
				$settings = $input['settings'] ?? [];

				if ( empty( $settings ) ) {
					return new \WP_Error( 'empty_settings', 'No settings provided.' );
				}

				$this->settings->update( $settings );

				return [
					'success'  => true,
					'settings' => $this->settings->get_all(),
				];
			},
			'permission_callback' => function () {
				return current_user_can( 'manage_options' );
			},
			'meta' => [
				'mcp' => [ 'public' => true ],
			],
		] );
	}

	// ─── LIST PAGES ──────────────────────────────────────────────────

	private function register_list_pages(): void {
		wp_register_ability( 'byrde/list-pages', [
			'label'       => 'List Byrde Landing Pages',
			'description' => 'List all landing pages (byrde_landing CPT) with their ID, title, slug, status, URL, and page type (landing or legal).',
			'category'    => 'byrde',
			'input_schema' => [
				'type'       => 'object',
				'properties' => [
					'status' => [
						'type'        => 'string',
						'description' => 'Filter by post status. Default: "any".',
						'enum'        => [ 'publish', 'draft', 'pending', 'private', 'any' ],
					],
				],
			],
			'output_schema' => [
				'type'       => 'object',
				'properties' => [
					'pages' => [
						'type'  => 'array',
						'items' => [
							'type'       => 'object',
							'properties' => [
								'id'        => [ 'type' => 'integer' ],
								'title'     => [ 'type' => 'string' ],
								'slug'      => [ 'type' => 'string' ],
								'status'    => [ 'type' => 'string' ],
								'url'       => [ 'type' => 'string' ],
								'page_type' => [ 'type' => 'string' ],
							],
						],
					],
				],
			],
			'execute_callback' => function ( array $input ) {
				$status = $input['status'] ?? 'any';

				$posts = get_posts( [
					'post_type'      => Constants::CPT_LANDING,
					'post_status'    => $status,
					'posts_per_page' => 100,
					'orderby'        => 'title',
					'order'          => 'ASC',
				] );

				$pages = array_map( function ( $post ) {
					$page_type = get_post_meta( $post->ID, '_byrde_page_type', true );
					return [
						'id'        => $post->ID,
						'title'     => $post->post_title,
						'slug'      => $post->post_name,
						'status'    => $post->post_status,
						'url'       => get_permalink( $post->ID ),
						'page_type' => $page_type ?: 'landing',
					];
				}, $posts );

				return [ 'pages' => $pages ];
			},
			'permission_callback' => function () {
				return current_user_can( 'edit_posts' );
			},
			'meta' => [
				'mcp' => [ 'public' => true ],
			],
		] );
	}

	// ─── GET PAGE ────────────────────────────────────────────────────

	private function register_get_page(): void {
		wp_register_ability( 'byrde/get-page', [
			'label'       => 'Get Byrde Page Data',
			'description' => 'Retrieve theme config and section content for a specific landing page. Returns globalConfig (brand, logo, seo), sectionThemes, sectionVisibility, sectionOrder, header, topbar, and all section content (hero, services, testimonials, faq, etc.).',
			'category'    => 'byrde',
			'input_schema' => [
				'type'       => 'object',
				'properties' => [
					'page_id' => [
						'type'        => 'integer',
						'description' => 'Landing page post ID.',
						'required'    => true,
					],
				],
				'required' => [ 'page_id' ],
			],
			'output_schema' => [
				'type'       => 'object',
				'properties' => [
					'page_id' => [ 'type' => 'integer' ],
					'title'   => [ 'type' => 'string' ],
					'config'  => [
						'type'        => 'object',
						'description' => 'Theme config (globalConfig, sectionThemes, sectionVisibility, sectionOrder, header, topbar).',
					],
					'content' => [
						'type'        => 'object',
						'description' => 'Section content (hero, services, testimonials, faq, etc.).',
					],
				],
			],
			'execute_callback' => function ( array $input ) {
				$page_id = (int) ( $input['page_id'] ?? 0 );

				$post = get_post( $page_id );
				if ( ! $post || $post->post_type !== Constants::CPT_LANDING ) {
					return new \WP_Error( 'not_found', 'Landing page not found.' );
				}

				$config_raw = get_post_meta( $page_id, Constants::META_THEME_CONFIG, true );
				$config     = $config_raw ? json_decode( $config_raw, true ) : null;
				$content    = get_post_meta( $page_id, Constants::META_CONTENT, true );

				return [
					'page_id' => $page_id,
					'title'   => $post->post_title,
					'config'  => $config ?: null,
					'content' => $content ?: null,
				];
			},
			'permission_callback' => function () {
				return current_user_can( 'edit_posts' );
			},
			'meta' => [
				'mcp' => [ 'public' => true ],
			],
		] );
	}

	// ─── UPDATE PAGE THEME ───────────────────────────────────────────

	private function register_update_page_theme(): void {
		wp_register_ability( 'byrde/update-page-theme', [
			'label'       => 'Update Page Theme Config',
			'description' => 'Update theme configuration for a landing page. Includes globalConfig (brand colors, logo, seo), sectionThemes (per-section palette overrides), sectionVisibility, sectionOrder, header, and topbar settings.',
			'category'    => 'byrde',
			'input_schema' => [
				'type'       => 'object',
				'properties' => [
					'page_id' => [
						'type'        => 'integer',
						'description' => 'Landing page post ID.',
						'required'    => true,
					],
					'config' => [
						'type'        => 'object',
						'description' => 'Theme config object. Same structure as returned by byrde/get-page config field.',
						'required'    => true,
					],
				],
				'required' => [ 'page_id', 'config' ],
			],
			'output_schema' => [
				'type'       => 'object',
				'properties' => [
					'success' => [ 'type' => 'boolean' ],
					'config'  => [ 'type' => 'object' ],
				],
			],
			'execute_callback' => function ( array $input ) {
				$page_id = (int) ( $input['page_id'] ?? 0 );
				$config  = $input['config'] ?? [];

				$post = get_post( $page_id );
				if ( ! $post || $post->post_type !== Constants::CPT_LANDING ) {
					return new \WP_Error( 'not_found', 'Landing page not found.' );
				}

				if ( empty( $config ) ) {
					return new \WP_Error( 'empty_config', 'No config data provided.' );
				}

				// Deep merge with existing config so partial updates work.
				$existing_raw = get_post_meta( $page_id, Constants::META_THEME_CONFIG, true );
				$existing     = $existing_raw ? json_decode( $existing_raw, true ) : [];
				$existing     = is_array( $existing ) ? $existing : [];
				$merged       = self::deep_merge( $existing, $config );

				$errors = Validators::validate_theme_config( $merged );
				if ( ! empty( $errors ) ) {
					return new \WP_Error( 'validation_failed', implode( ', ', $errors ) );
				}

				$sanitized = Validators::sanitize_theme_config( $merged );
				$json      = wp_json_encode( $sanitized, JSON_UNESCAPED_UNICODE );

				update_post_meta( $page_id, Constants::META_THEME_CONFIG, $json );
				wp_cache_delete( $page_id, 'post_meta' );
				clean_post_cache( $page_id );

				return [
					'success' => true,
					'config'  => $sanitized,
				];
			},
			'permission_callback' => function () {
				return current_user_can( 'edit_posts' );
			},
			'meta' => [
				'mcp' => [ 'public' => true ],
			],
		] );
	}

	// ─── UPDATE PAGE CONTENT ─────────────────────────────────────────

	private function register_update_page_content(): void {
		wp_register_ability( 'byrde/update-page-content', [
			'label'       => 'Update Page Section Content',
			'description' => 'Update section content for a landing page. Sections: hero (headline, subheadline, benefits, formTitle, formSubtitle, formSubmitText, badges), featured-testimonial (quote, authorName, ctaText), services (headline, services array with icon/title/description), mid-cta (headline, features, ctaText), service-areas (headline, areas array with name/state/highlighted), testimonials (headline, testimonials array with quote/authorName/rating), faq (headline, faqs array with question/answer, contactTitle, contactCtaText), footer-cta (headline, subheadline, ctaText), footer (description, copyright).',
			'category'    => 'byrde',
			'input_schema' => [
				'type'       => 'object',
				'properties' => [
					'page_id' => [
						'type'        => 'integer',
						'description' => 'Landing page post ID.',
						'required'    => true,
					],
					'content' => [
						'type'        => 'object',
						'description' => 'Section content object. Same structure as returned by byrde/get-page content field. Only include sections you want to update — others remain unchanged.',
						'required'    => true,
					],
				],
				'required' => [ 'page_id', 'content' ],
			],
			'output_schema' => [
				'type'       => 'object',
				'properties' => [
					'success' => [ 'type' => 'boolean' ],
					'content' => [ 'type' => 'object' ],
				],
			],
			'execute_callback' => function ( array $input ) {
				$page_id = (int) ( $input['page_id'] ?? 0 );
				$content = $input['content'] ?? [];

				$post = get_post( $page_id );
				if ( ! $post || $post->post_type !== Constants::CPT_LANDING ) {
					return new \WP_Error( 'not_found', 'Landing page not found.' );
				}

				if ( empty( $content ) ) {
					return new \WP_Error( 'empty_content', 'No content provided.' );
				}

				$errors = Validators::validate_content( $content );
				if ( ! empty( $errors ) ) {
					return new \WP_Error( 'validation_failed', implode( ', ', $errors ) );
				}

				// Deep merge with existing content so partial updates work.
				// This ensures sending {"hero": {"ctaLink": "..."}} only updates
				// that field without wiping out headline, subheadline, etc.
				$existing  = get_post_meta( $page_id, Constants::META_CONTENT, true );
				$existing  = is_array( $existing ) ? $existing : [];
				$sanitized = Validators::sanitize_content( $content );
				$merged    = self::deep_merge( $existing, $sanitized );

				update_post_meta( $page_id, Constants::META_CONTENT, $merged );
				wp_cache_delete( $page_id, 'post_meta' );
				clean_post_cache( $page_id );

				return [
					'success' => true,
					'content' => $merged,
				];
			},
			'permission_callback' => function () {
				return current_user_can( 'edit_posts' );
			},
			'meta' => [
				'mcp' => [ 'public' => true ],
			],
		] );
	}

	// ─── SAVE PAGE (ATOMIC) ──────────────────────────────────────────

	private function register_save_page(): void {
		wp_register_ability( 'byrde/save-page', [
			'label'       => 'Save Page (Theme + Content)',
			'description' => 'Atomic save of both theme config and section content for a landing page. Use this when updating both theme and content together to prevent inconsistent state.',
			'category'    => 'byrde',
			'input_schema' => [
				'type'       => 'object',
				'properties' => [
					'page_id' => [
						'type'        => 'integer',
						'description' => 'Landing page post ID.',
						'required'    => true,
					],
					'config' => [
						'type'        => 'object',
						'description' => 'Theme config object.',
						'required'    => true,
					],
					'content' => [
						'type'        => 'object',
						'description' => 'Section content object.',
						'required'    => true,
					],
				],
				'required' => [ 'page_id', 'config', 'content' ],
			],
			'output_schema' => [
				'type'       => 'object',
				'properties' => [
					'success' => [ 'type' => 'boolean' ],
					'config'  => [ 'type' => 'object' ],
					'content' => [ 'type' => 'object' ],
				],
			],
			'execute_callback' => function ( array $input ) {
				$page_id = (int) ( $input['page_id'] ?? 0 );
				$config  = $input['config'] ?? [];
				$content = $input['content'] ?? [];

				$post = get_post( $page_id );
				if ( ! $post || $post->post_type !== Constants::CPT_LANDING ) {
					return new \WP_Error( 'not_found', 'Landing page not found.' );
				}

				if ( empty( $config ) || empty( $content ) ) {
					return new \WP_Error( 'missing_data', 'Both config and content are required.' );
				}

				// Deep merge with existing data so partial updates work.
				$existing_config_raw = get_post_meta( $page_id, Constants::META_THEME_CONFIG, true );
				$existing_config     = $existing_config_raw ? json_decode( $existing_config_raw, true ) : [];
				$existing_config     = is_array( $existing_config ) ? $existing_config : [];
				$merged_config       = self::deep_merge( $existing_config, $config );

				$existing_content = get_post_meta( $page_id, Constants::META_CONTENT, true );
				$existing_content = is_array( $existing_content ) ? $existing_content : [];
				$merged_content   = self::deep_merge( $existing_content, $content );

				$theme_errors   = Validators::validate_theme_config( $merged_config );
				$content_errors = Validators::validate_content( $merged_content );
				$all_errors     = array_merge( $theme_errors, $content_errors );

				if ( ! empty( $all_errors ) ) {
					return new \WP_Error( 'validation_failed', implode( ', ', $all_errors ) );
				}

				$sanitized_config  = Validators::sanitize_theme_config( $merged_config );
				$sanitized_content = Validators::sanitize_content( $merged_content );

				update_post_meta( $page_id, Constants::META_THEME_CONFIG, wp_json_encode( $sanitized_config, JSON_UNESCAPED_UNICODE ) );
				update_post_meta( $page_id, Constants::META_CONTENT, $sanitized_content );

				wp_cache_delete( $page_id, 'post_meta' );
				clean_post_cache( $page_id );

				return [
					'success' => true,
					'config'  => $sanitized_config,
					'content' => $sanitized_content,
				];
			},
			'permission_callback' => function () {
				return current_user_can( 'edit_posts' );
			},
			'meta' => [
				'mcp' => [ 'public' => true ],
			],
		] );
	}
}
