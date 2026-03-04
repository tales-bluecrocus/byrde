<?php

namespace Byrde\Core;

/**
 * Static utility methods used across multiple modules.
 */
class Helpers {
    /**
     * Get the plugin directory URI, multisite-aware.
     *
     * In multisite subdirectory installs, plugins_url() may include
     * the subsite prefix which causes 404s since wp-content lives
     * at the root.
     */
    public static function plugin_uri(): string {
        if ( is_multisite() ) {
            return network_site_url( 'wp-content/plugins/byrde' );
        }
        return untrailingslashit( BYRDE_PLUGIN_URL );
    }

    /**
     * Guess MIME type from image URL extension.
     */
    public static function image_mime( string $url ): string {
        $ext = strtolower( pathinfo( wp_parse_url( $url, PHP_URL_PATH ) ?: '', PATHINFO_EXTENSION ) );
        $map = [
            'webp' => 'image/webp',
            'png'  => 'image/png',
            'jpg'  => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'gif'  => 'image/gif',
            'svg'  => 'image/svg+xml',
            'ico'  => 'image/x-icon',
        ];
        return $map[ $ext ] ?? 'image/png';
    }
}
