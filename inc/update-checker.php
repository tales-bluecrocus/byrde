<?php
/**
 * GitHub-based plugin auto-updater.
 *
 * Uses the Plugin Update Checker library to let WordPress detect
 * new releases from the GitHub repository and offer one-click updates.
 *
 * @package Byrde
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Plugin root directory
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
    BYRDE_PLUGIN_FILE,
    'byrde'
);

// Check the main branch
$myUpdateChecker->setBranch( 'main' );

// Use GitHub Releases (ZIP attached by the release workflow)
$myUpdateChecker->getVcsApi()->enableReleaseAssets();

// Plugin icon shown in wp-admin (Plugins → Updates screen)
$myUpdateChecker->addResultFilter( function ( $info ) {
	$icon_url = byrde_plugin_uri() . '/front-end/dist/assets/logo.webp';
	$info->icons = array(
		'1x'      => $icon_url,
		'default' => $icon_url,
	);
	return $info;
} );

/**
 * Fix folder name during update installation.
 *
 * GitHub release ZIPs sometimes extract into a folder with a hash suffix.
 * This ensures the plugin lands in wp-content/plugins/byrde/.
 */
add_filter( 'upgrader_source_selection', function ( $source, $remote_source, $upgrader, $hook_extra ) {
    if ( ! isset( $hook_extra['plugin'] ) || plugin_basename( BYRDE_PLUGIN_FILE ) !== $hook_extra['plugin'] ) {
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

    return new WP_Error( 'rename_failed', 'Could not rename the plugin folder during update.' );
}, 10, 4 );
