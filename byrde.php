<?php
/**
 * Plugin Name: BlueCrocus PPC
 * Plugin URI: https://bluecrocus.ca
 * Description: Headless landing page builder with visual editor for PPC campaigns.
 * Version: 2.1.8
 * Requires at least: 6.0
 * Tested up to: 6.7
 * Requires PHP: 8.0
 * Author: BlueCrocus
 * Author URI: https://bluecrocus.ca
 * License: GPL-2.0-or-later
 * Text Domain: byrde
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Plugin constants (defined before autoload — used by all modules)
define( 'BYRDE_VERSION', '2.1.8' );
define( 'BYRDE_PLUGIN_FILE', __FILE__ );
define( 'BYRDE_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'BYRDE_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

// Suppress PHP 8.x deprecation warnings from WP core passing null to
// strpos() / str_replace() in wp_is_stream() and wp_normalize_path().
// Targets only wp-includes/functions.php so plugin/theme deprecations still show.
set_error_handler( function ( $errno, $errstr, $errfile ) { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.FoundAfterLastUsed
	if ( str_contains( $errfile, 'wp-includes' . DIRECTORY_SEPARATOR . 'functions.php' ) ) {
		return true;
	}
	return false;
}, E_DEPRECATED );

// Composer autoload (PSR-4)
require_once __DIR__ . '/vendor/autoload.php';

/**
 * Global accessor for the plugin instance.
 */
function byrde(): \Byrde\Plugin {
    static $instance;
    return $instance ??= new \Byrde\Plugin();
}

// Bootstrap
byrde()->boot();

// Activation: create default pages + flush rewrite rules
register_activation_hook( __FILE__, function () {
    $prev = error_reporting( error_reporting() & ~E_DEPRECATED );

    byrde()->cpt->register_cpt();
    byrde()->activate();
    \Byrde\Migration\ThemeMigration::maybe_migrate();
    byrde()->onboarding->set_onboarding_redirect();
    flush_rewrite_rules();

    error_reporting( $prev );
} );

// Deactivation: clean up rewrite rules
register_deactivation_hook( __FILE__, function () {
    flush_rewrite_rules();
} );
