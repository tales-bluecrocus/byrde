<?php
/**
 * Required Plugins - Admin notice when required plugins are not active.
 *
 * @package LakeCity
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Define required/recommended plugins for this theme.
 *
 * @return array
 */
function lakecity_get_required_plugins(): array {
	return array(
		array(
			'name'     => 'Advanced Custom Fields PRO',
			'slug'     => 'advanced-custom-fields-pro',
			'file'     => 'advanced-custom-fields-pro/acf.php',
			'required' => true,
		),
		array(
			'name'     => 'Advanced Custom Fields: Extended',
			'slug'     => 'acf-extended',
			'file'     => 'acf-extended/acf-extended.php',
			'required' => true,
		),
		array(
			'name'     => 'Classic Editor',
			'slug'     => 'classic-editor',
			'file'     => 'classic-editor/classic-editor.php',
			'required' => true,
		),
		array(
			'name'     => 'Site Kit by Google',
			'slug'     => 'google-site-kit',
			'file'     => 'google-site-kit/google-site-kit.php',
			'required' => true,
		),
		array(
			'name'     => 'WP Activity Log',
			'slug'     => 'wp-security-audit-log',
			'file'     => 'wp-security-audit-log/wp-security-audit-log.php',
			'required' => true,
		),
		array(
			'name'     => 'Query Monitor',
			'slug'     => 'query-monitor',
			'file'     => 'query-monitor/query-monitor.php',
			'required' => false,
		),
	);
}

/**
 * Show admin notice for missing required plugins.
 */
function lakecity_check_required_plugins(): void {
	if ( ! current_user_can( 'activate_plugins' ) ) {
		return;
	}

	$plugins  = lakecity_get_required_plugins();
	$missing  = array();
	$inactive = array();

	foreach ( $plugins as $plugin ) {
		if ( ! $plugin['required'] ) {
			continue;
		}

		$plugin_file = $plugin['file'];

		if ( ! file_exists( WP_PLUGIN_DIR . '/' . $plugin_file ) ) {
			$missing[] = $plugin['name'];
		} elseif ( ! is_plugin_active( $plugin_file ) ) {
			$inactive[] = $plugin;
		}
	}

	if ( ! empty( $missing ) ) {
		$names = implode( ', ', $missing );
		echo '<div class="notice notice-error"><p>';
		echo '<strong>LakeCity Theme:</strong> ';
		printf(
			/* translators: %s: comma-separated list of plugin names */
			esc_html__( 'The following required plugins are missing: %s. Please install them.', 'lakecity' ),
			'<strong>' . esc_html( $names ) . '</strong>'
		);
		echo '</p></div>';
	}

	if ( ! empty( $inactive ) ) {
		$names = implode( ', ', array_column( $inactive, 'name' ) );
		$activate_links = array();

		foreach ( $inactive as $plugin ) {
			$activate_url = wp_nonce_url(
				admin_url( 'plugins.php?action=activate&plugin=' . urlencode( $plugin['file'] ) ),
				'activate-plugin_' . $plugin['file']
			);
			$activate_links[] = '<a href="' . esc_url( $activate_url ) . '">' . esc_html( $plugin['name'] ) . '</a>';
		}

		echo '<div class="notice notice-warning"><p>';
		echo '<strong>LakeCity Theme:</strong> ';
		printf(
			/* translators: %s: comma-separated list of plugin activation links */
			esc_html__( 'The following required plugins are installed but not active: %s', 'lakecity' ),
			implode( ', ', $activate_links )
		);
		echo '</p></div>';
	}
}
add_action( 'admin_notices', 'lakecity_check_required_plugins' );

/**
 * Auto-activate required plugins on theme activation.
 */
function lakecity_activate_required_plugins(): void {
	$plugins = lakecity_get_required_plugins();

	foreach ( $plugins as $plugin ) {
		$plugin_file = $plugin['file'];

		if ( file_exists( WP_PLUGIN_DIR . '/' . $plugin_file ) && ! is_plugin_active( $plugin_file ) ) {
			activate_plugin( $plugin_file );
		}
	}
}
add_action( 'after_switch_theme', 'lakecity_activate_required_plugins' );
