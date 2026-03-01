<?php
/**
 * WordPress Security Cleanup
 *
 * Disable XML-RPC and pingbacks for security.
 * As a plugin, we do NOT remove posts/comments from the admin —
 * that's the site owner's choice.
 *
 * @package Byrde
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Disable XML-RPC and Pingback (security measure)
 * Can be disabled via filter: add_filter('byrde_disable_xmlrpc', '__return_false');
 */
if ( apply_filters( 'byrde_disable_xmlrpc', true ) ) {
    add_filter( 'xmlrpc_enabled', '__return_false' );
    add_filter( 'pre_update_option_enable_xmlrpc', '__return_false' );
    add_filter( 'pre_option_enable_xmlrpc', '__return_zero' );

    /**
     * Remove pingback header
     */
    function byrde_remove_pingback_header( array $headers ): array {
        unset( $headers['X-Pingback'] );
        return $headers;
    }
    add_filter( 'wp_headers', 'byrde_remove_pingback_header' );

    /**
     * Disable pingback rewrite rules
     */
    function byrde_disable_pingback_rewrite( array $rules ): array {
        foreach ( $rules as $rule => $rewrite ) {
            if ( preg_match( '/trackback|pingback/', $rule ) ) {
                unset( $rules[ $rule ] );
            }
        }
        return $rules;
    }
    add_filter( 'rewrite_rules_array', 'byrde_disable_pingback_rewrite' );

    /**
     * Remove pingback URL from bloginfo
     */
    function byrde_kill_pingback_url( string $output, string $show ): string {
        if ( $show === 'pingback_url' ) {
            return '';
        }
        return $output;
    }
    add_filter( 'bloginfo_url', 'byrde_kill_pingback_url', 10, 2 );
}
