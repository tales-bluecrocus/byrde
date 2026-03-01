<?php
/**
 * Theme Constants
 *
 * Centralized constants to avoid magic strings throughout the codebase.
 *
 * @package Byrde
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// =======================
// CUSTOM POST TYPE
// =======================
define( 'BYRDE_CPT_LANDING', 'byrde_landing' );

// =======================
// POST META KEYS
// =======================

/**
 * Post meta key for theme configuration
 *
 * Stores per-page theme config (colors, palettes, section settings)
 */
define( 'BYRDE_META_THEME_CONFIG', '_byrde_theme_config' );

/**
 * Post meta key for page content
 *
 * Stores editable content for each section (headlines, CTAs, services, etc.)
 */
define( 'BYRDE_META_CONTENT', '_byrde_content' );

// =======================
// OPTIONS KEYS
// =======================

/**
 * Option key for global theme settings
 *
 * Will store all settings currently in ACF (brand, social, SEO, analytics, etc.)
 */
define( 'BYRDE_OPTION_THEME_SETTINGS', 'byrde_theme_settings' );

// =======================
// REST API
// =======================

/**
 * REST API namespace
 */
define( 'BYRDE_REST_NAMESPACE', 'byrde/v1' );

/**
 * REST API version
 */
define( 'BYRDE_REST_VERSION', '1.0' );

// =======================
// ALLOWED SECTIONS
// =======================

/**
 * List of valid section IDs
 *
 * Used for validation in both theme config and content endpoints
 */
define(
	'BYRDE_ALLOWED_SECTIONS',
	array(
		'hero',
		'services',
		'testimonials',
		'faq',
		'mid-cta',
		'service-areas',
		'footer-cta',
		'featured-testimonial',
		'footer',
	)
);

// =======================
// VALIDATION LIMITS
// =======================

/**
 * Maximum theme config payload size (bytes)
 */
define( 'BYRDE_MAX_THEME_CONFIG_SIZE', 524288 ); // 512KB

/**
 * Maximum content payload size (bytes)
 */
define( 'BYRDE_MAX_CONTENT_SIZE', 1048576 ); // 1MB

/**
 * Maximum image upload size (bytes)
 */
define( 'BYRDE_MAX_IMAGE_SIZE', 5242880 ); // 5MB

/**
 * Maximum image dimensions
 */
define( 'BYRDE_MAX_IMAGE_WIDTH', 3840 ); // 4K
define( 'BYRDE_MAX_IMAGE_HEIGHT', 2160 ); // 4K

/**
 * Allowed image file extensions
 */
define(
	'BYRDE_ALLOWED_IMAGE_EXTENSIONS',
	array( 'jpg', 'jpeg', 'png', 'gif', 'webp' )
);

/**
 * Maximum number of items per content type
 */
define( 'BYRDE_MAX_SERVICES', 50 );
define( 'BYRDE_MAX_TESTIMONIALS', 100 );
define( 'BYRDE_MAX_FAQS', 50 );
define( 'BYRDE_MAX_SERVICE_AREAS', 100 );

// =======================
// RATE LIMITING
// =======================

/**
 * Default rate limit for save operations (requests per minute)
 */
define( 'BYRDE_RATE_LIMIT_SAVE', 10 );

/**
 * Rate limit for image uploads (requests per minute)
 */
define( 'BYRDE_RATE_LIMIT_UPLOAD', 5 );

/**
 * Rate limit time window (seconds)
 */
define( 'BYRDE_RATE_LIMIT_WINDOW', 60 );

// =======================
// QUERY PARAMETER NAMES
// =======================

/**
 * Query parameter for preview mode
 */
define( 'BYRDE_QUERY_PREVIEW', 'byrde_preview' );

/**
 * Query parameter for page ID
 */
define( 'BYRDE_QUERY_PAGE_ID', 'byrde_page_id' );
