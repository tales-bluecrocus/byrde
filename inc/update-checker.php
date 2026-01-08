<?php

use YahnisElsts\PluginUpdateChecker\v5\PucFactory;

// Initialize the update checker for GitHub
$myUpdateChecker = PucFactory::buildUpdateChecker(
    'https://github.com/tales-bluecrocus/byrde/',
    get_template_directory() . '/functions.php',
    'byrde',
);

// Enable release assets - uses GitHub Releases instead of branch ZIP
$myUpdateChecker->getVcsApi()->enableReleaseAssets();
