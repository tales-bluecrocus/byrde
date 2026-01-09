<?php
/**
 * Required Plugins Configuration
 * 
 * This file uses TGM Plugin Activation to manage required and recommended plugins
 * 
 * @package Byrde
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Include the TGM Plugin Activation class
require_once get_template_directory() . '/vendor/tgmpa/tgm-plugin-activation/class-tgm-plugin-activation.php';

/**
 * Register the required plugins for this theme
 */
add_action('tgmpa_register', 'byrde_register_required_plugins');

function byrde_register_required_plugins()
{
    /**
     * Array of plugin arrays. Required keys are name and slug.
     * If the source is NOT from the .org repo, then source is also required.
     */
    $plugins = array(
        // Site Kit by Google - Required plugin for Google Analytics and Search Console integration
        array(
            'name'     => 'Site Kit by Google',
            'slug'     => 'google-site-kit',
            'required' => true,
        ),
        // WP Activity Log - Required plugin
        array(
            'name'     => 'WP Activity Log',
            'slug'     => 'wp-security-audit-log',
            'required' => true,
        ),
        // Query Monitor - Required plugin
        array(
            'name'     => 'Query Monitor',
            'slug'     => 'query-monitor',
            'required' => true,
        ),
    );

    /**
     * Array of configuration settings
     */
    $config = array(
        'id'           => 'byrde',                  // Unique ID for hashing notices for multiple instances of TGMPA
        'default_path' => '',                       // Default absolute path to bundled plugins
        'menu'         => 'tgmpa-install-plugins',  // Menu slug
        'parent_slug'  => 'themes.php',             // Parent menu slug
        'capability'   => 'edit_theme_options',     // Capability needed to view plugin install page
        'has_notices'  => true,                     // Show admin notices or not
        'dismissable'  => false,                    // If false, a user cannot dismiss the nag message
        'dismiss_msg'  => '',                       // If 'dismissable' is false, this message will be output at top of nag
        'is_automatic' => true,                     // Automatically activate plugins after installation or not
        'message'      => '<p><strong>This theme requires the following plugin to function properly. Please install and activate it.</strong></p>',
        'strings'      => array(
            'page_title'                      => __('Install Required Plugins', 'byrde'),
            'menu_title'                      => __('Install Plugins', 'byrde'),
            'installing'                      => __('Installing Plugin: %s', 'byrde'),
            'updating'                        => __('Updating Plugin: %s', 'byrde'),
            'oops'                            => __('Something went wrong with the plugin API.', 'byrde'),
            'notice_can_install_required'     => _n_noop(
                'This theme requires the following plugin: %1$s.',
                'This theme requires the following plugins: %1$s.',
                'byrde'
            ),
            'notice_can_install_recommended'  => _n_noop(
                'This theme recommends the following plugin: %1$s.',
                'This theme recommends the following plugins: %1$s.',
                'byrde'
            ),
            'notice_ask_to_update'            => _n_noop(
                'The following plugin needs to be updated to its latest version to ensure maximum compatibility with this theme: %1$s.',
                'The following plugins need to be updated to their latest version to ensure maximum compatibility with this theme: %1$s.',
                'byrde'
            ),
            'notice_ask_to_update_maybe'      => _n_noop(
                'There is an update available for: %1$s.',
                'There are updates available for the following plugins: %1$s.',
                'byrde'
            ),
            'notice_can_activate_required'    => _n_noop(
                'The following required plugin is currently inactive: %1$s.',
                'The following required plugins are currently inactive: %1$s.',
                'byrde'
            ),
            'notice_can_activate_recommended' => _n_noop(
                'The following recommended plugin is currently inactive: %1$s.',
                'The following recommended plugins are currently inactive: %1$s.',
                'byrde'
            ),
            'install_link'                    => _n_noop(
                'Begin installing plugin',
                'Begin installing plugins',
                'byrde'
            ),
            'update_link'                     => _n_noop(
                'Begin updating plugin',
                'Begin updating plugins',
                'byrde'
            ),
            'activate_link'                   => _n_noop(
                'Begin activating plugin',
                'Begin activating plugins',
                'byrde'
            ),
            'return'                          => __('Return to Required Plugins Installer', 'byrde'),
            'plugin_activated'                => __('Plugin activated successfully.', 'byrde'),
            'activated_successfully'          => __('The following plugin was activated successfully:', 'byrde'),
            'plugin_already_active'           => __('No action taken. Plugin %1$s was already active.', 'byrde'),
            'plugin_needs_higher_version'     => __('Plugin not activated. A higher version of %s is needed for this theme. Please update the plugin.', 'byrde'),
            'complete'                        => __('All plugins installed and activated successfully. %1$s', 'byrde'),
            'dismiss'                         => __('Dismiss this notice', 'byrde'),
            'notice_cannot_install_activate'  => __('There are one or more required or recommended plugins to install, update or activate.', 'byrde'),
            'contact_admin'                   => __('Please contact the administrator of this site for help.', 'byrde'),
            'nag_type'                        => 'updated',
        ),
    );

    tgmpa($plugins, $config);
}
