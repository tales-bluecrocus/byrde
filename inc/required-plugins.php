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
		'parent_slug'  => 'plugins.php',
		// Use activate_plugins so multisite site admins can see the page
		// and activate pre-installed plugins. TGMPA internally checks
		// install_plugins before showing install buttons.
		'capability'   => 'activate_plugins',
		'has_notices'   => true,
		'dismissable'  => false,
		'is_automatic' => true,
		'strings'      => array(
			'notice_can_install_required'    => _n_noop(
				'Byrde requires the following plugin: %1$s.',
				'Byrde requires the following plugins: %1$s.',
				'tgmpa'
			),
			'notice_can_install_recommended' => _n_noop(
				'Byrde recommends the following plugin: %1$s.',
				'Byrde recommends the following plugins: %1$s.',
				'tgmpa'
			),
			'notice_ask_to_update'           => _n_noop(
				'The following plugin needs to be updated for compatibility with Byrde: %1$s.',
				'The following plugins need to be updated for compatibility with Byrde: %1$s.',
				'tgmpa'
			),
		),
	);

	tgmpa( $plugins, $config );
}
add_action( 'tgmpa_register', 'byrde_register_required_plugins' );
