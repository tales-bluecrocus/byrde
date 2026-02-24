<?php
/**
 * Diagnostic script to check theme config save/load flow
 *
 * Run with: lando wp eval-file wp-content/themes/lakecity/diagnose.php
 */

$page_id = 138;
global $wpdb;

echo "\n=== DIAGNOSTIC REPORT ===\n\n";

// 1. Check what's in the database
echo "1. RAW DATABASE VALUE:\n";
$raw_value = $wpdb->get_var( $wpdb->prepare(
    "SELECT meta_value FROM {$wpdb->postmeta} WHERE post_id = %d AND meta_key = '_lakecity_theme_config'",
    $page_id
) );
echo "Length: " . strlen($raw_value) . " bytes\n";
echo "First 200 chars: " . substr($raw_value, 0, 200) . "\n\n";

// 2. Check via get_post_meta
echo "2. VIA get_post_meta():\n";
$meta_value = get_post_meta( $page_id, '_lakecity_theme_config', true );
echo "Type: " . gettype($meta_value) . "\n";
echo "Length: " . strlen($meta_value) . " bytes\n";
echo "First 200 chars: " . substr($meta_value, 0, 200) . "\n\n";

// 3. Decode and check hero section
echo "3. DECODED CONFIG:\n";
$decoded = json_decode( $meta_value, true );
if ( json_last_error() !== JSON_ERROR_NONE ) {
    echo "JSON DECODE ERROR: " . json_last_error_msg() . "\n\n";
} else {
    echo "JSON decoded successfully\n";
    if ( isset( $decoded['sectionThemes']['hero'] ) ) {
        echo "Hero config found:\n";
        print_r( $decoded['sectionThemes']['hero'] );
    } else {
        echo "Hero config NOT FOUND in decoded data\n";
        echo "Available top-level keys: " . implode(', ', array_keys($decoded)) . "\n";
        if ( isset( $decoded['sectionThemes'] ) ) {
            echo "sectionThemes type: " . gettype($decoded['sectionThemes']) . "\n";
            if ( is_array( $decoded['sectionThemes'] ) ) {
                echo "sectionThemes keys: " . implode(', ', array_keys($decoded['sectionThemes'])) . "\n";
                echo "sectionThemes content:\n";
                print_r( $decoded['sectionThemes'] );
            }
        }
    }
}

echo "\n=== END REPORT ===\n\n";
