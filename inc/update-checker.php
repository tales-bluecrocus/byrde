<?php

use YahnisElsts\PluginUpdateChecker\v5\PucFactory;

// Initialize the theme update checker
$updateChecker = PucFactory::buildUpdateChecker(
    'https://github.com/tales-bluecrocus/byrde',
    __DIR__ . '/../style.css',
    'byrde',
);

// Enable release assets - uses GitHub Releases instead of branch ZIP
$updateChecker->getVcsApi()->enableReleaseAssets();
