<?php

namespace Byrde\Security;

/**
 * Simple rate limiting using WordPress Transients API.
 */
class RateLimiter {
    /**
     * Check rate limit for an action.
     *
     * @return bool True if request is allowed, false if rate limit exceeded.
     */
    public static function check( string $action, int $max_requests = 10, int $time_window = 60 ): bool {
        $user_id = get_current_user_id();

        if ( ! $user_id ) {
            return false;
        }

        $transient_key = "byrde_rate_limit_{$action}_{$user_id}";
        $requests      = get_transient( $transient_key );

        if ( false === $requests ) {
            set_transient( $transient_key, 1, $time_window );
            return true;
        }

        if ( $requests >= $max_requests ) {
            return false;
        }

        // Increment without resetting TTL — prevents slow-drip bypass.
        // WordPress transients don't support atomic increment, so we update
        // the underlying option directly to preserve the original expiry.
        global $wpdb;
        $wpdb->query( $wpdb->prepare(
            "UPDATE {$wpdb->options} SET option_value = option_value + 1 WHERE option_name = %s",
            '_transient_' . $transient_key
        ) );
        wp_cache_delete( $transient_key, 'transient' );

        return true;
    }

    /**
     * Get remaining requests for an action.
     */
    public static function get_remaining( string $action, int $max_requests = 10 ): int {
        $user_id = get_current_user_id();

        if ( ! $user_id ) {
            return 0;
        }

        $transient_key = "byrde_rate_limit_{$action}_{$user_id}";
        $requests      = get_transient( $transient_key );

        if ( false === $requests ) {
            return $max_requests;
        }

        return max( 0, $max_requests - $requests );
    }

    /**
     * Reset rate limit for a user and action.
     */
    public static function reset( string $action, int $user_id = 0 ): bool {
        if ( ! $user_id ) {
            $user_id = get_current_user_id();
        }

        if ( ! $user_id ) {
            return false;
        }

        $transient_key = "byrde_rate_limit_{$action}_{$user_id}";
        return delete_transient( $transient_key );
    }
}
