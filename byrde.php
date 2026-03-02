<?php
/**
 * Plugin Name: BlueCrocus PPC
 * Plugin URI: https://bluecrocus.ca
 * Description: Headless landing page builder with visual editor for PPC campaigns.
 * Version: 2.0.5
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

// Plugin constants
define( 'BYRDE_PLUGIN_FILE', __FILE__ );
define( 'BYRDE_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'BYRDE_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

// Bootstrap
require_once BYRDE_PLUGIN_DIR . 'functions.php';

// Activation: create default pages + flush rewrite rules
register_activation_hook( __FILE__, function() {
    // Ensure CPT is registered before flushing
    byrde_register_landing_cpt();
    byrde_activate();
    byrde_maybe_migrate_from_theme();
    flush_rewrite_rules();
} );

// Deactivation: clean up rewrite rules
register_deactivation_hook( __FILE__, function() {
    flush_rewrite_rules();
} );
