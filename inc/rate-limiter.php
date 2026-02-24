<?php
/**
 * Rate Limiter
 *
 * Simple rate limiting using WordPress Transients API.
 * Prevents DoS attacks on REST endpoints.
 *
 * @package LakeCity
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Check rate limit for an action
 *
 * @param string $action Action identifier (e.g., 'save_theme', 'upload_image').
 * @param int    $max_requests Maximum number of requests allowed in the time window.
 * @param int    $time_window Time window in seconds (default: 60 seconds).
 * @return bool True if request is allowed, false if rate limit exceeded.
 */
function lakecity_check_rate_limit( string $action, int $max_requests = 10, int $time_window = 60 ): bool {
	$user_id = get_current_user_id();

	// Not logged in users can't be rate limited (they shouldn't access protected endpoints anyway)
	if ( ! $user_id ) {
		return false;
	}

	$transient_key = "lakecity_rate_limit_{$action}_{$user_id}";
	$requests      = get_transient( $transient_key );

	if ( false === $requests ) {
		// First request in window
		set_transient( $transient_key, 1, $time_window );
		return true;
	}

	if ( $requests >= $max_requests ) {
		// Rate limit exceeded
		return false;
	}

	// Increment counter
	set_transient( $transient_key, $requests + 1, $time_window );
	return true;
}

/**
 * Get remaining requests for an action
 *
 * Useful for debugging or showing users how many requests they have left.
 *
 * @param string $action Action identifier.
 * @param int    $max_requests Maximum allowed requests.
 * @return int Number of remaining requests.
 */
function lakecity_get_remaining_requests( string $action, int $max_requests = 10 ): int {
	$user_id = get_current_user_id();

	if ( ! $user_id ) {
		return 0;
	}

	$transient_key = "lakecity_rate_limit_{$action}_{$user_id}";
	$requests      = get_transient( $transient_key );

	if ( false === $requests ) {
		return $max_requests;
	}

	return max( 0, $max_requests - $requests );
}

/**
 * Reset rate limit for a user and action
 *
 * Useful for testing or manual intervention.
 *
 * @param string $action Action identifier.
 * @param int    $user_id User ID (defaults to current user).
 * @return bool True on success.
 */
function lakecity_reset_rate_limit( string $action, int $user_id = 0 ): bool {
	if ( ! $user_id ) {
		$user_id = get_current_user_id();
	}

	if ( ! $user_id ) {
		return false;
	}

	$transient_key = "lakecity_rate_limit_{$action}_{$user_id}";
	return delete_transient( $transient_key );
}
