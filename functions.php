<?php

// Autoload Composer
if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    require_once __DIR__ . '/vendor/autoload.php';
}

/**
 * Auto-load PHP files from inc/ directory
 *
 * NOTE: Only functional PHP files (classes, functions, hooks) should be in inc/.
 * Template parts and HTML components belong in template-parts/ directory.
 *
 * @param string $directory Directory to scan for PHP files
 */
function theme_autoload_includes($directory)
{
    // Get all PHP files in the current directory
    foreach (glob($directory . '/*.php') as $file) {
        require_once $file;
    }

    // Get all subdirectories and load their files recursively
    foreach (glob($directory . '/*', GLOB_ONLYDIR) as $subdir) {
        theme_autoload_includes($subdir);
    }
}

// Automatically include all files in the "inc" directory
// Automatically include all files in the "inc" directory
theme_autoload_includes(get_template_directory() . '/inc');

// Disable Comments
require_once get_template_directory() . '/inc/disable-comments.php';
