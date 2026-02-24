<?php
/**
 * ACF to Native Options Migration Script
 *
 * ONE-TIME USE: Migrates all ACF theme settings to native WordPress options.
 * Run this ONCE, then deactivate ACF Pro plugin.
 *
 * Usage:
 * 1. Via WP-CLI: wp eval-file inc/migrate-acf-to-options.php
 * 2. Via Admin: Access /wp-admin/?lakecity_migrate_acf=1 (admin only)
 * 3. Via Code: Call lakecity_migrate_acf_to_native()
 *
 * @package LakeCity
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Migrate ACF settings to native options
 *
 * @return array Migration results with counts and errors.
 */
function lakecity_migrate_acf_to_native(): array {
	$results = array(
		'success'        => false,
		'fields_migrated' => 0,
		'errors'         => array(),
		'log'            => array(),
	);

	// Check if ACF is active
	if ( ! function_exists( 'get_field' ) ) {
		$results['errors'][] = 'ACF Pro plugin not found. Migration requires ACF to be active.';
		return $results;
	}

	$results['log'][] = 'Starting ACF migration...';

	// Prepare new settings structure
	$new_settings = array(
		'brand'          => array(),
		'google_reviews' => array(),
		'footer'         => array(),
		'social'         => array(),
		'seo'            => array(),
		'schema'         => array(),
		'analytics'      => array(),
		'legal'          => array(),
	);

	// Map ACF fields to new structure
	$field_map = array(
		// Brand
		'logo'                   => array( 'brand', 'logo' ),
		'phone'                  => array( 'brand', 'phone' ),
		'email'                  => array( 'brand', 'email' ),

		// Google Reviews
		'google_rating'          => array( 'google_reviews', 'rating' ),
		'google_reviews_count'   => array( 'google_reviews', 'count' ),
		'google_reviews_url'     => array( 'google_reviews', 'reviews_url' ),

		// Footer
		'footer_tagline'         => array( 'footer', 'tagline' ),
		'footer_description'     => array( 'footer', 'description' ),
		'address'                => array( 'footer', 'address' ),
		'business_hours'         => array( 'footer', 'business_hours' ),
		'copyright'              => array( 'footer', 'copyright' ),

		// Social
		'facebook_url'           => array( 'social', 'facebook_url' ),
		'instagram_url'          => array( 'social', 'instagram_url' ),
		'youtube_url'            => array( 'social', 'youtube_url' ),
		'yelp_url'               => array( 'social', 'yelp_url' ),

		// SEO
		'site_name'              => array( 'seo', 'site_name' ),
		'site_tagline'           => array( 'seo', 'site_tagline' ),
		'site_description'       => array( 'seo', 'site_description' ),
		'site_keywords'          => array( 'seo', 'site_keywords' ),
		'site_url'               => array( 'seo', 'site_url' ),
		'og_image'               => array( 'seo', 'og_image' ),

		// Schema
		'schema_type'            => array( 'schema', 'type' ),
		'schema_price_range'     => array( 'schema', 'price_range' ),
		'schema_street'          => array( 'schema', 'street' ),
		'schema_city'            => array( 'schema', 'city' ),
		'schema_state'           => array( 'schema', 'state' ),
		'schema_postal'          => array( 'schema', 'postal' ),
		'schema_country'         => array( 'schema', 'country' ),
		'schema_geo_lat'         => array( 'schema', 'geo_lat' ),
		'schema_geo_lng'         => array( 'schema', 'geo_lng' ),
		'schema_service_radius'  => array( 'schema', 'service_radius' ),
		'schema_opening_hours'   => array( 'schema', 'opening_hours' ),

		// Analytics
		'ga_measurement_id'      => array( 'analytics', 'ga_measurement_id' ),
		'gtm_container_id'       => array( 'analytics', 'gtm_container_id' ),
		'fb_pixel_id'            => array( 'analytics', 'fb_pixel_id' ),

		// Legal
		'privacy_policy_url'     => array( 'legal', 'privacy_policy_url' ),
		'terms_url'              => array( 'legal', 'terms_url' ),
		'cookie_settings_url'    => array( 'legal', 'cookie_settings_url' ),
	);

	// Migrate each field
	foreach ( $field_map as $acf_field => $path ) {
		$value = get_field( $acf_field, 'option' );

		if ( null !== $value && '' !== $value ) {
			// Special handling for logo (ACF returns array with url, alt, etc.)
			if ( 'logo' === $acf_field && is_array( $value ) ) {
				$new_settings['brand']['logo'] = array(
					'url' => $value['url'] ?? '',
					'alt' => $value['alt'] ?? '',
				);
			} else {
				// Set nested value
				lakecity_set_nested_value( $new_settings, $path, $value );
			}

			$results['fields_migrated']++;
			$results['log'][] = "Migrated: {$acf_field} = " . ( is_array( $value ) ? 'Array' : substr( $value, 0, 50 ) );
		}
	}

	// Save to WordPress options
	$saved = lakecity_update_theme_settings( $new_settings );

	if ( $saved ) {
		$results['success'] = true;
		$results['log'][]   = "Successfully saved {$results['fields_migrated']} fields to " . LAKECITY_OPTION_THEME_SETTINGS;
	} else {
		$results['errors'][] = 'Failed to save settings to database';
		$results['log'][]    = 'ERROR: Could not save to wp_options';
	}

	return $results;
}

/**
 * Set nested array value using path
 *
 * @param array $array Array to modify (passed by reference).
 * @param array $path Path array (e.g., ['brand', 'phone']).
 * @param mixed $value Value to set.
 */
function lakecity_set_nested_value( array &$array, array $path, $value ): void {
	$current = &$array;

	foreach ( $path as $key ) {
		if ( ! isset( $current[ $key ] ) || ! is_array( $current[ $key ] ) ) {
			$current[ $key ] = array();
		}
		$current = &$current[ $key ];
	}

	$current = $value;
}

/**
 * Admin page handler for migration
 *
 * Access via: /wp-admin/?lakecity_migrate_acf=1
 */
function lakecity_maybe_run_migration(): void {
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended
	if ( ! isset( $_GET['lakecity_migrate_acf'] ) ) {
		return;
	}

	// Security: Admin only
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( 'Unauthorized', 403 );
	}

	// Run migration
	$results = lakecity_migrate_acf_to_native();

	// Display results
	?>
	<!DOCTYPE html>
	<html>
	<head>
		<title>ACF Migration Results</title>
		<style>
			body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
			.success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 4px; margin: 20px 0; }
			.error { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 15px; border-radius: 4px; margin: 20px 0; }
			.log { background: #f8f9fa; border: 1px solid #dee2e6; padding: 15px; border-radius: 4px; font-family: monospace; font-size: 12px; max-height: 400px; overflow-y: auto; }
			.log div { margin: 5px 0; }
			h1 { color: #333; }
			.stats { background: #e7f3ff; border: 1px solid #b3d9ff; padding: 15px; border-radius: 4px; margin: 20px 0; }
			code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-size: 14px; }
		</style>
	</head>
	<body>
		<h1>🔄 ACF to Native Options Migration</h1>

		<?php if ( $results['success'] ) : ?>
			<div class="success">
				<strong>✅ Migration Successful!</strong><br>
				Migrated <?php echo esc_html( $results['fields_migrated'] ); ?> fields to <code><?php echo esc_html( LAKECITY_OPTION_THEME_SETTINGS ); ?></code>
			</div>
		<?php else : ?>
			<div class="error">
				<strong>❌ Migration Failed</strong><br>
				<?php foreach ( $results['errors'] as $error ) : ?>
					• <?php echo esc_html( $error ); ?><br>
				<?php endforeach; ?>
			</div>
		<?php endif; ?>

		<div class="stats">
			<strong>📊 Statistics:</strong><br>
			• Fields migrated: <?php echo esc_html( $results['fields_migrated'] ); ?><br>
			• Errors: <?php echo count( $results['errors'] ); ?><br>
			• Status: <?php echo $results['success'] ? '✅ Success' : '❌ Failed'; ?>
		</div>

		<h2>📝 Migration Log</h2>
		<div class="log">
			<?php foreach ( $results['log'] as $entry ) : ?>
				<div><?php echo esc_html( $entry ); ?></div>
			<?php endforeach; ?>
		</div>

		<?php if ( $results['success'] ) : ?>
			<h2>✅ Next Steps</h2>
			<ol>
				<li>Verify the migrated data at <code>/wp-json/lakecity/v1/settings</code></li>
				<li>Test the frontend to ensure all settings display correctly</li>
				<li>Once verified, you can deactivate <strong>ACF Pro</strong> plugin</li>
				<li>Remove <code>inc/acf-theme-settings.php</code> from <code>functions.php</code></li>
			</ol>
		<?php endif; ?>

		<p><a href="<?php echo esc_url( admin_url() ); ?>">← Back to Dashboard</a></p>
	</body>
	</html>
	<?php
	exit;
}
add_action( 'admin_init', 'lakecity_maybe_run_migration' );

/**
 * WP-CLI command for migration
 *
 * Usage: wp eval-file wp-content/themes/lakecity/inc/migrate-acf-to-options.php
 */
if ( defined( 'WP_CLI' ) && WP_CLI ) {
	$results = lakecity_migrate_acf_to_native();

	if ( $results['success'] ) {
		WP_CLI::success( "Migrated {$results['fields_migrated']} fields successfully!" );
		foreach ( $results['log'] as $entry ) {
			WP_CLI::log( $entry );
		}
	} else {
		WP_CLI::error( 'Migration failed: ' . implode( ', ', $results['errors'] ) );
	}
}
