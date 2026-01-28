<?php
/**
 * WordPress Cleanup
 *
 * Remove unnecessary features: posts, pingback, comments
 *
 * @package LakeCity
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Remove Posts from admin menu
 */
function lakecity_remove_posts_menu(): void {
    remove_menu_page( 'edit.php' );
}
add_action( 'admin_menu', 'lakecity_remove_posts_menu' );

/**
 * Remove Posts from admin bar
 */
function lakecity_remove_posts_admin_bar( WP_Admin_Bar $wp_admin_bar ): void {
    $wp_admin_bar->remove_node( 'new-post' );
}
add_action( 'admin_bar_menu', 'lakecity_remove_posts_admin_bar', 999 );

/**
 * Redirect Posts to Pages if accessed directly
 */
function lakecity_redirect_posts(): void {
    global $pagenow;

    if ( $pagenow === 'edit.php' && ! isset( $_GET['post_type'] ) ) {
        wp_redirect( admin_url( 'edit.php?post_type=page' ) );
        exit;
    }
}
add_action( 'admin_init', 'lakecity_redirect_posts' );

/**
 * Remove Comments from admin menu
 */
function lakecity_remove_comments_menu(): void {
    remove_menu_page( 'edit-comments.php' );
}
add_action( 'admin_menu', 'lakecity_remove_comments_menu' );

/**
 * Remove Comments from admin bar
 */
function lakecity_remove_comments_admin_bar( WP_Admin_Bar $wp_admin_bar ): void {
    $wp_admin_bar->remove_node( 'comments' );
}
add_action( 'admin_bar_menu', 'lakecity_remove_comments_admin_bar', 999 );

/**
 * Disable comments on all post types
 */
function lakecity_disable_comments_post_types(): void {
    foreach ( get_post_types() as $post_type ) {
        if ( post_type_supports( $post_type, 'comments' ) ) {
            remove_post_type_support( $post_type, 'comments' );
            remove_post_type_support( $post_type, 'trackbacks' );
        }
    }
}
add_action( 'admin_init', 'lakecity_disable_comments_post_types' );

/**
 * Close comments on frontend
 */
add_filter( 'comments_open', '__return_false', 20, 2 );
add_filter( 'pings_open', '__return_false', 20, 2 );

/**
 * Hide existing comments
 */
add_filter( 'comments_array', '__return_empty_array', 10, 2 );

/**
 * Remove comments from dashboard
 */
function lakecity_remove_dashboard_comments(): void {
    remove_meta_box( 'dashboard_recent_comments', 'dashboard', 'normal' );
}
add_action( 'admin_init', 'lakecity_remove_dashboard_comments' );

/**
 * Disable XML-RPC and Pingback
 */
add_filter( 'xmlrpc_enabled', '__return_false' );
add_filter( 'pre_update_option_enable_xmlrpc', '__return_false' );
add_filter( 'pre_option_enable_xmlrpc', '__return_zero' );

/**
 * Remove pingback header
 */
function lakecity_remove_pingback_header( array $headers ): array {
    unset( $headers['X-Pingback'] );
    return $headers;
}
add_filter( 'wp_headers', 'lakecity_remove_pingback_header' );

/**
 * Disable pingback rewrite rules
 */
function lakecity_disable_pingback_rewrite( array $rules ): array {
    foreach ( $rules as $rule => $rewrite ) {
        if ( preg_match( '/trackback|pingback/', $rule ) ) {
            unset( $rules[ $rule ] );
        }
    }
    return $rules;
}
add_filter( 'rewrite_rules_array', 'lakecity_disable_pingback_rewrite' );

/**
 * Remove pingback from post class
 */
function lakecity_kill_pingback_url( string $output, string $show ): string {
    if ( $show === 'pingback_url' ) {
        return '';
    }
    return $output;
}
add_filter( 'bloginfo_url', 'lakecity_kill_pingback_url', 10, 2 );
