<?php
/**
 * Color Schema Migration (v2 → v4)
 *
 * v3: Converted old 14-field per-mode brand colors to simplified (primary, accent, mode).
 * v4: Expanded to 4-color per-mode pairs (dark_primary, dark_accent, light_primary, light_accent, mode).
 * Also strips removed per-section color fields from page theme configs.
 *
 * @package Byrde
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Run the color schema migration if needed.
 * Idempotent — checks a version flag before executing.
 */
function byrde_maybe_migrate_colors(): void {
	$current_version = (int) get_option( 'byrde_color_schema_version', 1 );

	if ( $current_version < 3 ) {
		byrde_migrate_global_brand_colors_v3();
		byrde_migrate_page_theme_configs();
	}

	if ( $current_version < 4 ) {
		byrde_migrate_brand_colors_v4();
	}

	if ( $current_version < 4 ) {
		update_option( 'byrde_color_schema_version', 4 );
	}
}

/**
 * v3: Migrate global brand_colors from old 14-field format to simplified.
 */
function byrde_migrate_global_brand_colors_v3(): void {
	$settings = get_option( BYRDE_OPTION_THEME_SETTINGS, array() );
	if ( empty( $settings ) || ! is_array( $settings ) ) {
		return;
	}

	// Migrate brand_colors if old format detected
	if ( isset( $settings['brand_colors']['dark_primary'] ) && ! isset( $settings['brand_colors']['primary'] ) ) {
		$old = $settings['brand_colors'];
		$settings['brand_colors'] = array(
			'primary' => $old['dark_primary'] ?? '#3ab342',
			'accent'  => $old['dark_accent'] ?? '#f97316',
			'mode'    => $old['mode'] ?? 'dark',
		);
	}

	// Migrate button_style — strip color fields, keep shape
	if ( isset( $settings['button_style'] ) ) {
		$old_btn = $settings['button_style'];
		$settings['button_style'] = array(
			'border_width'  => $old_btn['border_width'] ?? '0',
			'border_radius' => $old_btn['border_radius'] ?? '12',
		);
	}

	update_option( BYRDE_OPTION_THEME_SETTINGS, $settings );
}

/**
 * Migrate per-page theme configs — strip removed fields.
 */
function byrde_migrate_page_theme_configs(): void {
	$posts = get_posts( array(
		'post_type'      => BYRDE_CPT_LANDING,
		'posts_per_page' => -1,
		'post_status'    => 'any',
		'fields'         => 'ids',
	) );

	if ( empty( $posts ) ) {
		return;
	}

	// Fields to remove from sectionThemes
	$removed_section_fields = array(
		'overrideGlobalColors', 'paletteId',
		'bgPrimary', 'bgSecondary', 'bgTertiary',
		'textPrimary', 'textSecondary', 'accent',
		'buttonBg', 'buttonText', 'borderColor',
		'iconBgEnabled', 'iconBgColor',
		// Testimonials
		'tmBadgeColor', 'tmHeadlineColor', 'tmHeadlineAccent', 'tmSubheadlineColor',
		'tmReviewLabelColor', 'tmCardBg', 'tmCardText', 'tmCardAuthor', 'tmCardBorder', 'tmDotColor',
		// Services
		'svcBadgeColor', 'svcHeadlineColor', 'svcHeadlineAccent', 'svcSubheadlineColor',
		'svcCardBg', 'svcCardBorder', 'svcCardTitle', 'svcCardText', 'svcIconColor', 'svcDotColor',
		// Featured Testimonial
		'ftBadgeColor', 'ftQuoteColor', 'ftAuthorColor', 'ftAuthorTitle',
		// Mid-CTA
		'mcBadgeColor', 'mcHeadlineColor', 'mcHeadlineAccent', 'mcSubheadlineColor',
		// Service Areas
		'saBadgeColor', 'saHeadlineColor', 'saHeadlineAccent', 'saSubheadlineColor',
		'saTagBg', 'saTagText', 'saTagBorder',
		// FAQ
		'faqBadgeColor', 'faqHeadlineColor', 'faqHeadlineAccent', 'faqSubheadlineColor',
		'faqQuestionColor', 'faqAnswerColor', 'faqItemBg', 'faqItemBorder', 'faqIconColor',
		// Footer CTA
		'fcHeadlineColor', 'fcHeadlineAccent', 'fcSubheadlineColor',
	);

	// Fields to remove from globalConfig.brand
	$removed_brand_fields = array(
		'darkPrimary', 'darkAccent', 'darkBg', 'darkText',
		'darkTextSecondary', 'darkBgSecondary', 'darkBorder',
		'lightPrimary', 'lightAccent', 'lightBg', 'lightText',
		'lightTextSecondary', 'lightBgSecondary', 'lightBorder',
	);

	foreach ( $posts as $post_id ) {
		$raw = get_post_meta( $post_id, '_byrde_theme_config', true );
		if ( empty( $raw ) ) {
			continue;
		}

		$config = is_string( $raw ) ? json_decode( $raw, true ) : $raw;
		if ( ! is_array( $config ) ) {
			continue;
		}

		$changed = false;

		// Strip removed fields from sectionThemes
		if ( ! empty( $config['sectionThemes'] ) && is_array( $config['sectionThemes'] ) ) {
			foreach ( $config['sectionThemes'] as $section_id => &$theme ) {
				if ( ! is_array( $theme ) ) {
					continue;
				}
				foreach ( $removed_section_fields as $field ) {
					if ( array_key_exists( $field, $theme ) ) {
						unset( $theme[ $field ] );
						$changed = true;
					}
				}
			}
			unset( $theme );
		}

		// Strip removed fields from globalConfig.brand
		if ( ! empty( $config['globalConfig']['brand'] ) && is_array( $config['globalConfig']['brand'] ) ) {
			foreach ( $removed_brand_fields as $field ) {
				if ( array_key_exists( $field, $config['globalConfig']['brand'] ) ) {
					unset( $config['globalConfig']['brand'][ $field ] );
					$changed = true;
				}
			}
		}

		if ( $changed ) {
			update_post_meta( $post_id, '_byrde_theme_config', wp_json_encode( $config ) );
		}
	}
}

/**
 * v4: Expand simplified brand_colors (primary, accent) to per-mode pairs.
 * Handles both old v2 format (dark_primary existed) and v3 format (primary, accent).
 */
function byrde_migrate_brand_colors_v4(): void {
	$settings = get_option( BYRDE_OPTION_THEME_SETTINGS, array() );
	if ( empty( $settings ) || ! is_array( $settings ) ) {
		return;
	}

	$bc = $settings['brand_colors'] ?? array();

	// Already in v4 format
	if ( isset( $bc['dark_primary'] ) && isset( $bc['light_primary'] ) ) {
		return;
	}

	// v3 format: single primary/accent → copy to both modes
	if ( isset( $bc['primary'] ) ) {
		$settings['brand_colors'] = array(
			'dark_primary'  => $bc['primary'],
			'dark_accent'   => $bc['accent'] ?? '#f97316',
			'dark_text'     => '#efefef',
			'light_primary' => $bc['primary'],
			'light_accent'  => $bc['accent'] ?? '#f97316',
			'light_text'    => '#2a2a2a',
			'mode'          => $bc['mode'] ?? 'dark',
		);
	}
	// v2 format: old per-mode fields still present
	elseif ( isset( $bc['dark_primary'] ) ) {
		$settings['brand_colors'] = array(
			'dark_primary'  => $bc['dark_primary'],
			'dark_accent'   => $bc['dark_accent'] ?? '#f97316',
			'dark_text'     => $bc['dark_text'] ?? '#efefef',
			'light_primary' => $bc['light_primary'] ?? $bc['dark_primary'],
			'light_accent'  => $bc['light_accent'] ?? $bc['dark_accent'] ?? '#f97316',
			'light_text'    => $bc['light_text'] ?? '#2a2a2a',
			'mode'          => $bc['mode'] ?? 'dark',
		);
	}

	update_option( BYRDE_OPTION_THEME_SETTINGS, $settings );
}

// Run migration on admin_init (catches updates without activation)
add_action( 'admin_init', 'byrde_maybe_migrate_colors' );
