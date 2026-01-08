<?php

use YahnisElsts\PluginUpdateChecker\v5\PucFactory;

// Initialize the theme update checker
// Replace these values with your actual repository information
$updateChecker = PucFactory::buildUpdateChecker(
    'https://github.com/tales-bluecrocus/byrde', // Your GitHub repository URL
    __DIR__ . '/../functions.php', // Path to the main theme file
    'byrde', // Theme slug (should match the theme folder name)
);

// Optional: Set the branch to check for updates (default is 'main' or 'master')
$updateChecker->setBranch('main');

// Optional: If your repository is private, you need to set an access token
// $updateChecker->setAuthentication('your-github-token-here');

// Enable release assets - uses GitHub Releases instead of branch ZIP
$updateChecker->getVcsApi()->enableReleaseAssets();
