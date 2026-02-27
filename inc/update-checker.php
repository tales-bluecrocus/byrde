<?php
/**
 * GitHub-based theme auto-updater.
 *
 * Uses the Plugin Update Checker library to let WordPress detect
 * new releases from the GitHub repository and offer one-click updates.
 *
 * Uses dirname(__DIR__) instead of get_template_directory() so the paths
 * resolve correctly in Multisite regardless of active theme context.
 *
 * @package Byrde
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Theme root = parent of /inc/ where this file lives
$byrde_dir = dirname( __DIR__ );

// Composer autoload (installed by release workflow)
$autoload = $byrde_dir . '/vendor/autoload.php';
if ( ! file_exists( $autoload ) ) {
    return;
}
require_once $autoload;

use YahnisElsts\PluginUpdateChecker\v5\PucFactory;

$myUpdateChecker = PucFactory::buildUpdateChecker(
    'https://github.com/tales-bluecrocus/byrde/',
    $byrde_dir . '/style.css',
    'byrde'
);

// Check the main branch
$myUpdateChecker->setBranch( 'main' );

// Use GitHub Releases (ZIP attached by the release workflow)
$myUpdateChecker->getVcsApi()->enableReleaseAssets();

/**
 * Fix folder name during update installation.
 *
 * GitHub release ZIPs sometimes extract into a folder with a hash suffix.
 * This ensures the theme lands in wp-content/themes/byrde/.
 */
add_filter( 'upgrader_source_selection', function ( $source, $remote_source, $upgrader, $hook_extra ) {
    if ( ! isset( $hook_extra['theme'] ) || 'byrde' !== $hook_extra['theme'] ) {
        return $source;
    }

    if ( basename( $source ) === 'byrde' ) {
        return $source;
    }

    global $wp_filesystem;

    $corrected_source = trailingslashit( $remote_source ) . 'byrde/';

    if ( $wp_filesystem->move( $source, $corrected_source ) ) {
        return $corrected_source;
    }

    return new WP_Error( 'rename_failed', 'Could not rename the theme folder during update.' );
}, 10, 4 );
