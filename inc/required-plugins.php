<?php
/**
 * Required Plugins - TGM Plugin Activation integration.
 *
 * Uses the TGMPA library to require/recommend plugins and provide
 * a dedicated admin page for installing and activating them.
 *
 * @package Byrde
 * @see     https://github.com/TGMPA/TGM-Plugin-Activation
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once BYRDE_PLUGIN_DIR . 'inc/class-tgm-plugin-activation.php';

/**
 * Register required and recommended plugins via TGMPA.
 */
function byrde_register_required_plugins(): void {

	$plugins = array(
		array(
			'name'     => 'Classic Editor',
			'slug'     => 'classic-editor',
			'required' => true,
		),
		array(
			'name'     => 'Site Kit by Google',
			'slug'     => 'google-site-kit',
			'required' => true,
		),
		array(
			'name'     => 'WP Activity Log',
			'slug'     => 'wp-security-audit-log',
			'required' => true,
		),
		array(
			'name'     => 'Query Monitor',
			'slug'     => 'query-monitor',
			'required' => false,
		),
	);

	$config = array(
		'id'           => 'byrde',
		'menu'         => 'byrde-install-plugins',
		'parent_slug'  => 'themes.php',
		// Use activate_plugins so multisite site admins can see the page
		// and activate pre-installed plugins. TGMPA internally checks
		// install_plugins before showing install buttons.
		'capability'   => 'activate_plugins',
		'has_notices'   => true,
		'dismissable'  => false,
		'is_automatic' => true,
	);

	tgmpa( $plugins, $config );
}
add_action( 'tgmpa_register', 'byrde_register_required_plugins' );
