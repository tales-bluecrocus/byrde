<?php

use YahnisElsts\PluginUpdateChecker\v5\PucFactory;

// Get the theme slug (folder name)
$theme_slug = basename(get_template_directory());

// Initialize the theme update checker
$updateChecker = PucFactory::buildUpdateChecker(
    'https://github.com/tales-bluecrocus/byrde',
    get_stylesheet_directory() . '/style.css',
    $theme_slug,
);

// Enable release assets - uses GitHub Releases instead of branch ZIP
$updateChecker->getVcsApi()->enableReleaseAssets();
