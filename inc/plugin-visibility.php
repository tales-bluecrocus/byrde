<?php
/**
 * Plugin Visibility Control
 * 
 * Hide WP Activity Log and Query Monitor UI for users without @bluecrocus.ca email
 * Plugins remain active and working, just hidden from view
 * 
 * @package Byrde
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Check if current user should see restricted plugins
 * 
 * @return bool True if user has @bluecrocus.ca email
 */
function byrde_can_see_restricted_plugins()
{
    $user = wp_get_current_user();
    
    if (!$user || !$user->user_email) {
        return false;
    }
    
    // Check if email ends with @bluecrocus.ca (case-insensitive)
    $email = strtolower($user->user_email);
    $domain = '@bluecrocus.ca';
    
    return (substr($email, -strlen($domain)) === $domain);
}

/**
 * Get list of restricted plugins
 * 
 * @return array List of restricted plugin configurations
 */
function byrde_get_restricted_plugins()
{
    return array(
        'wp-security-audit-log' => array(
            'menu_slug'   => 'wsal-auditlog',
            'plugin_file' => 'wp-security-audit-log/wp-security-audit-log.php',
            'admin_bar'   => null,
        ),
        'query-monitor' => array(
            'menu_slug'   => 'query-monitor',
            'plugin_file' => 'query-monitor/query-monitor.php',
            'admin_bar'   => 'query-monitor',
        ),
    );
}

/**
 * Hide restricted plugins from admin (menus, plugins list, admin bar)
 */
add_action('admin_menu', 'byrde_restrict_plugins_visibility', 999);
add_action('admin_bar_menu', 'byrde_restrict_plugins_visibility', 999);
add_filter('all_plugins', 'byrde_restrict_plugins_visibility', 999);

function byrde_restrict_plugins_visibility($arg = null)
{
    // Allow Blue Crocus users to see everything
    if (byrde_can_see_restricted_plugins()) {
        // Return plugins array if called as filter
        return is_array($arg) ? $arg : null;
    }
    
    $restricted = byrde_get_restricted_plugins();
    $current_filter = current_filter();
    
    // Handle different hooks
    switch ($current_filter) {
        case 'admin_menu':
            // Remove menu pages
            foreach ($restricted as $plugin) {
                if (!empty($plugin['menu_slug'])) {
                    remove_menu_page($plugin['menu_slug']);
                }
            }
            break;
            
        case 'admin_bar_menu':
            // Remove admin bar nodes
            if (is_object($arg)) {
                foreach ($restricted as $plugin) {
                    if (!empty($plugin['admin_bar'])) {
                        $arg->remove_node($plugin['admin_bar']);
                    }
                }
            }
            break;
            
        case 'all_plugins':
            // Remove from plugins list
            if (is_array($arg)) {
                foreach ($restricted as $plugin) {
                    if (!empty($plugin['plugin_file'])) {
                        unset($arg[$plugin['plugin_file']]);
                    }
                }
            }
            return $arg;
    }
    
    return is_array($arg) ? $arg : null;
}
