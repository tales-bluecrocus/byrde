<?php

use YahnisElsts\PluginUpdateChecker\v5\PucFactory;

// Initialize the update checker for GitHub
$myUpdateChecker = PucFactory::buildUpdateChecker(
    'https://github.com/tales-bluecrocus/byrde/',
    get_template_directory() . '/style.css',
    'byrde',
);

// Set the branch to check for updates
$myUpdateChecker->setBranch('main');

// Enable release assets - uses GitHub Releases instead of branch ZIP
$myUpdateChecker->getVcsApi()->enableReleaseAssets();

// Fix the folder name during update installation
add_filter('upgrader_source_selection', function ($source, $remote_source, $upgrader, $hook_extra) {
    // Only apply this filter for theme updates
    if (!isset($hook_extra['theme'])) {
        return $source;
    }

    // Check if this is our theme
    if ($hook_extra['theme'] !== 'byrde') {
        return $source;
    }

    global $wp_filesystem;

    // Get the correct destination folder name
    $corrected_source = trailingslashit($remote_source) . 'byrde/';

    // If the source already has the correct name, return it
    if (basename($source) === 'byrde') {
        return $source;
    }

    // Rename the folder to the correct name
    if ($wp_filesystem->move($source, $corrected_source)) {
        return $corrected_source;
    }

    return new WP_Error('rename_failed', 'Could not rename the theme folder during update.');
}, 10, 4);
