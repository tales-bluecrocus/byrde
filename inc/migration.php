<?php
/**
 * Theme-to-Plugin Migration
 *
 * Converts existing Byrde theme pages to the byrde_landing CPT.
 * Runs once on plugin activation if pages with Byrde meta are found.
 *
 * @package Byrde
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Migrate pages created by the Byrde theme to byrde_landing CPT.
 */
function byrde_maybe_migrate_from_theme(): void {
    if ( get_option( 'byrde_migrated_to_plugin' ) ) {
        return;
    }

    // Find pages that have Byrde-specific post meta
    $pages_with_byrde_meta = get_posts( array(
        'post_type'      => 'page',
        'posts_per_page' => -1,
        'post_status'    => 'any',
        'meta_query'     => array(
            'relation' => 'OR',
            array( 'key' => BYRDE_META_THEME_CONFIG, 'compare' => 'EXISTS' ),
            array( 'key' => BYRDE_META_CONTENT, 'compare' => 'EXISTS' ),
        ),
    ) );

    if ( empty( $pages_with_byrde_meta ) ) {
        update_option( 'byrde_migrated_to_plugin', '1' );
        return;
    }

    foreach ( $pages_with_byrde_meta as $page ) {
        // Change post type to byrde_landing
        wp_update_post( array(
            'ID'        => $page->ID,
            'post_type' => BYRDE_CPT_LANDING,
        ) );

        // Convert legal page template flag to meta
        $template = get_post_meta( $page->ID, '_wp_page_template', true );
        if ( 'page-legal.php' === $template ) {
            update_post_meta( $page->ID, '_byrde_page_type', 'legal' );
            delete_post_meta( $page->ID, '_wp_page_template' );
        }
    }

    // If the old front page was a Byrde page, remove static front page setting
    $front_page_id = (int) get_option( 'page_on_front' );
    if ( $front_page_id ) {
        $front_page = get_post( $front_page_id );
        if ( $front_page && $front_page->post_type === BYRDE_CPT_LANDING ) {
            update_option( 'show_on_front', 'posts' );
            update_option( 'page_on_front', 0 );
        }
    }

    update_option( 'byrde_migrated_to_plugin', '1' );
}
