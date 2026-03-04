<?php
/**
 * Cache Management
 *
 * Purges page cache when theme settings or page config/content change.
 * Supports major WordPress caching plugins and hosting platforms.
 *
 * Problem: byrdeSettings, byrdeConfig, and byrdeContent are injected as
 * inline <script> in the HTML. If a page cache plugin or CDN caches the
 * HTML, users see stale data even after saving in the editor.
 *
 * Solution: Purge the relevant page(s) from all known cache layers
 * whenever theme data changes, and use a dynamic version string
 * for asset cache busting.
 *
 * @package Byrde
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Purge page cache for a specific page, or all pages.
 *
 * @param int $page_id Specific page to purge (0 = purge all).
 */
function byrde_purge_page_cache( int $page_id = 0 ): void {
	// --- WordPress core ---
	if ( $page_id ) {
		clean_post_cache( $page_id );
	}

	// --- LiteSpeed Cache ---
	if ( $page_id && has_action( 'litespeed_purge_post' ) ) {
		do_action( 'litespeed_purge_post', $page_id );
	} elseif ( has_action( 'litespeed_purge_all' ) ) {
		do_action( 'litespeed_purge_all' );
	}

	// --- WP Super Cache ---
	if ( function_exists( 'wp_cache_clear_cache' ) ) {
		if ( $page_id && function_exists( 'wp_cache_post_change' ) ) {
			wp_cache_post_change( $page_id );
		} else {
			wp_cache_clear_cache();
		}
	}

	// --- W3 Total Cache ---
	if ( function_exists( 'w3tc_flush_post' ) && $page_id ) {
		w3tc_flush_post( $page_id );
	} elseif ( function_exists( 'w3tc_flush_posts' ) ) {
		w3tc_flush_posts();
	}

	// --- WP Rocket ---
	if ( $page_id && function_exists( 'rocket_clean_post' ) ) {
		rocket_clean_post( $page_id );
	} elseif ( function_exists( 'rocket_clean_domain' ) ) {
		rocket_clean_domain();
	}

	// --- WP Fastest Cache ---
	if ( isset( $GLOBALS['wp_fastest_cache'] ) && method_exists( $GLOBALS['wp_fastest_cache'], 'deleteCache' ) ) {
		$GLOBALS['wp_fastest_cache']->deleteCache( true );
	}

	// --- SG Optimizer (SiteGround) ---
	if ( function_exists( 'sg_cachepress_purge_cache' ) ) {
		sg_cachepress_purge_cache();
	}

	// --- WP Engine ---
	if ( class_exists( 'WpeCommon' ) ) {
		if ( method_exists( 'WpeCommon', 'purge_memcached' ) ) {
			WpeCommon::purge_memcached();
		}
		if ( method_exists( 'WpeCommon', 'purge_varnish_cache' ) ) {
			WpeCommon::purge_varnish_cache();
		}
	}

	// --- Kinsta ---
	if ( class_exists( '\Kinsta\Cache' ) && $page_id ) {
		wp_remote_get(
			add_query_arg( 'kinsta-clear-cache', $page_id, home_url( '/' ) ),
			array( 'timeout' => 5, 'blocking' => false )
		);
	}

	// --- Cloudflare (via official plugin) ---
	if ( has_action( 'cloudflare_purge_by_url' ) && $page_id ) {
		$url = get_permalink( $page_id );
		if ( $url ) {
			do_action( 'cloudflare_purge_by_url', $url );
		}
	}

	// --- Autoptimize ---
	if ( class_exists( 'autoptimizeCache' ) && method_exists( 'autoptimizeCache', 'clearall' ) ) {
		autoptimizeCache::clearall();
	}

	// --- Breeze (Cloudways) ---
	if ( class_exists( 'Breeze_PurgeCache' ) && method_exists( 'Breeze_PurgeCache', 'breeze_cache_flush' ) ) {
		Breeze_PurgeCache::breeze_cache_flush();
	}

	// --- Bump cache version for dynamic asset versioning ---
	update_option( 'byrde_cache_version', (string) time(), false );
}

/**
 * Purge when theme settings (wp_options) change.
 * Settings affect ALL pages (logo, phone, colors, etc.), so purge everything.
 *
 * @param string $option     Option name.
 * @param mixed  $old_value  Previous value.
 * @param mixed  $value      New value.
 */
function byrde_purge_on_settings_save( string $option, $old_value, $value ): void {
	if ( $option !== BYRDE_OPTION_THEME_SETTINGS ) {
		return;
	}
	byrde_purge_page_cache(); // Purge all — settings affect every page
}
add_action( 'updated_option', 'byrde_purge_on_settings_save', 10, 3 );

/**
 * Purge when page theme config or content (post_meta) change.
 * Only purge the specific page that was updated.
 *
 * @param int    $meta_id    Meta ID.
 * @param int    $object_id  Post ID.
 * @param string $meta_key   Meta key.
 * @param mixed  $meta_value Meta value.
 */
function byrde_purge_on_meta_save( int $meta_id, int $object_id, string $meta_key, $meta_value ): void {
	if ( $meta_key !== '_byrde_theme_config' && $meta_key !== '_byrde_content' ) {
		return;
	}
	byrde_purge_page_cache( $object_id );
}
add_action( 'updated_post_meta', 'byrde_purge_on_meta_save', 10, 4 );
add_action( 'added_post_meta', 'byrde_purge_on_meta_save', 10, 4 );

/**
 * Get cache version for asset query strings.
 *
 * Returns a timestamp that changes every time settings or config are saved.
 * Falls back to theme version if no saves have happened yet.
 *
 * @return string Version string.
 */
function byrde_get_cache_version(): string {
	$cache_ver = get_option( 'byrde_cache_version', '' );
	if ( $cache_ver ) {
		return $cache_ver;
	}
	return defined( 'BYRDE_VERSION' ) ? BYRDE_VERSION : '1.0.0';
}
