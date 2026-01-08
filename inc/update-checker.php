<?php

use YahnisElsts\PluginUpdateChecker\v5p4\Theme\UpdateChecker;

// Initialize the theme update checker with the correct class for themes
$updateChecker = new UpdateChecker(
    'https://github.com/tales-bluecrocus/byrde',
    __FILE__,
    'byrde',
);

// Enable release assets - uses GitHub Releases instead of branch ZIP
$updateChecker->getVcsApi()->enableReleaseAssets();
