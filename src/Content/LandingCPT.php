<?php

namespace Byrde\Content;

use Byrde\Core\Constants;

/**
 * Custom Post Type: Landing Pages
 *
 * Registers the byrde_landing CPT with /lp/ URL slug.
 */
class LandingCPT {

    /**
     * Register WordPress hooks.
     */
    public function register(): void {
        add_action( 'init', [ $this, 'register_cpt' ] );
    }

    /**
     * Register the byrde_landing Custom Post Type.
     */
    public function register_cpt(): void {
        register_post_type( Constants::CPT_LANDING, [
            'labels' => [
                'name'               => __( 'Landing Pages', 'byrde' ),
                'singular_name'      => __( 'Landing Page', 'byrde' ),
                'menu_name'          => __( 'PPC Pages', 'byrde' ),
                'add_new'            => __( 'Add New', 'byrde' ),
                'add_new_item'       => __( 'Add Landing Page', 'byrde' ),
                'edit_item'          => __( 'Edit Landing Page', 'byrde' ),
                'view_item'          => __( 'View Landing Page', 'byrde' ),
                'all_items'          => __( 'All Landing Pages', 'byrde' ),
                'search_items'       => __( 'Search Landing Pages', 'byrde' ),
                'not_found'          => __( 'No landing pages found.', 'byrde' ),
                'not_found_in_trash' => __( 'No landing pages found in Trash.', 'byrde' ),
            ],
            'public'              => true,
            'show_ui'             => true,
            'show_in_rest'        => true,
            'show_in_menu'        => true,
            'menu_icon'           => 'dashicons-welcome-widgets-menus',
            'menu_position'       => 20,
            'supports'            => [ 'title', 'thumbnail', 'custom-fields' ],
            'has_archive'         => false,
            'rewrite'             => [ 'slug' => 'lp', 'with_front' => false ],
            'capability_type'     => 'page',
            'map_meta_cap'        => true,
            'exclude_from_search' => false,
        ] );

        // Register page type meta (used to flag legal pages).
        register_post_meta( Constants::CPT_LANDING, '_byrde_page_type', [
            'type'              => 'string',
            'single'            => true,
            'show_in_rest'      => true,
            'sanitize_callback' => 'sanitize_text_field',
        ] );
    }
}
