<?php

namespace Byrde\Security;

/**
 * Disable XML-RPC and pingbacks for security.
 */
class Cleanup {
    public function register(): void {
        if ( ! apply_filters( 'byrde_disable_xmlrpc', true ) ) {
            return;
        }

        add_filter( 'xmlrpc_enabled', '__return_false' );
        add_filter( 'pre_update_option_enable_xmlrpc', '__return_false' );
        add_filter( 'pre_option_enable_xmlrpc', '__return_zero' );
        add_filter( 'wp_headers', [ $this, 'remove_pingback_header' ] );
        add_filter( 'rewrite_rules_array', [ $this, 'disable_pingback_rewrite' ] );
        add_filter( 'bloginfo_url', [ $this, 'kill_pingback_url' ], 10, 2 );
    }

    public function remove_pingback_header( array $headers ): array {
        unset( $headers['X-Pingback'] );
        return $headers;
    }

    public function disable_pingback_rewrite( array $rules ): array {
        foreach ( $rules as $rule => $rewrite ) {
            if ( preg_match( '/trackback|pingback/', $rule ) ) {
                unset( $rules[ $rule ] );
            }
        }
        return $rules;
    }

    public function kill_pingback_url( string $output, string $show ): string {
        if ( $show === 'pingback_url' ) {
            return '';
        }
        return $output;
    }
}
