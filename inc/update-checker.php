<?php

use YahnisElsts\PluginUpdateChecker\v5\PucFactory;

// Initialize the theme update checker
$updateChecker = PucFactory::buildUpdateChecker(
    'https://github.com/tales-bluecrocus/byrde',
    get_template_directory() . '/style.css',
    'byrde',
);

// Enable release assets - uses GitHub Releases instead of branch ZIP
$updateChecker->getVcsApi()->enableReleaseAssets();

// Set the expected folder name in the ZIP (must match the theme directory name)
$updateChecker->getVcsApi()->setDirectoryName('byrde');
