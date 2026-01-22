<?php

/**
 * Optimizes WordPress scripts (jQuery, Migrate, etc)
 * Moves jQuery to footer when safe and adds defer
 */
add_action('wp_enqueue_scripts', function () {
    if (is_admin()) {
        return;
    }

    // Move jQuery and jQuery Migrate to footer
    if (!is_customize_preview()) {
        wp_scripts()->add_data('jquery', 'group', 1);
        wp_scripts()->add_data('jquery-core', 'group', 1);
        wp_scripts()->add_data('jquery-migrate', 'group', 1);
    }
}, 100);

/**
 * Adds defer to WordPress scripts when possible
 */
add_filter('script_loader_tag', function ($tag, $handle, $src) {
    // Front-end only
    if (is_admin()) {
        return $tag;
    }

    // List of scripts that can safely have defer
    $defer_scripts = [
        'jquery-migrate',
        'wp-block-library',
        'dashicons',
    ];

    if (in_array($handle, $defer_scripts)) {
        // Add defer if it doesn't already exist
        if (strpos($tag, 'defer') === false) {
            $tag = str_replace(' src', ' defer src', $tag);
        }
    }

    return $tag;
}, 10, 3);

/**
 * Remove unnecessary CSS and JS from WordPress
 */
add_action('wp_enqueue_scripts', function () {
    if (!is_admin()) {
        // Remove block library CSS if there are no core blocks
        global $post;
        if ($post && !has_blocks($post->post_content)) {
            wp_dequeue_style('wp-block-library');
            wp_dequeue_style('wp-block-library-theme');
            wp_dequeue_style('wc-block-style');
        }

        // Remove dashicons on front-end if user is not logged in
        if (!is_user_logged_in()) {
            wp_dequeue_style('dashicons');
        }

        // Remove inline global styles if there are no blocks
        if ($post && !has_blocks($post->post_content)) {
            wp_dequeue_style('global-styles');
        }
    }
}, 100);
