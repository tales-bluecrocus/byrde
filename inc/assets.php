<?php

/**
 * Otimiza scripts do WordPress (jQuery, Migrate, etc)
 * Move jQuery para o footer quando seguro e adiciona defer
 */
add_action('wp_enqueue_scripts', function () {
    if (is_admin()) {
        return;
    }

    // Move jQuery e jQuery Migrate para o footer
    if (!is_customize_preview()) {
        wp_scripts()->add_data('jquery', 'group', 1);
        wp_scripts()->add_data('jquery-core', 'group', 1);
        wp_scripts()->add_data('jquery-migrate', 'group', 1);
    }
}, 100);

/**
 * Adiciona defer em scripts do WordPress quando possível
 */
add_filter('script_loader_tag', function ($tag, $handle, $src) {
    // Apenas no front-end
    if (is_admin()) {
        return $tag;
    }

    // Lista de scripts que podem ter defer com segurança
    $defer_scripts = [
        'jquery-migrate',
        'wp-block-library',
        'dashicons',
    ];

    if (in_array($handle, $defer_scripts)) {
        // Adiciona defer se ainda não existir
        if (strpos($tag, 'defer') === false) {
            $tag = str_replace(' src', ' defer src', $tag);
        }
    }

    return $tag;
}, 10, 3);

/**
 * Remove CSS e JS desnecessários do WordPress
 */
add_action('wp_enqueue_scripts', function () {
    if (!is_admin()) {
        // Remove block library CSS se não houver blocos core
        global $post;
        if ($post && !has_blocks($post->post_content)) {
            wp_dequeue_style('wp-block-library');
            wp_dequeue_style('wp-block-library-theme');
            wp_dequeue_style('wc-block-style');
        }

        // Remove dashicons no front-end se usuário não logado
        if (!is_user_logged_in()) {
            wp_dequeue_style('dashicons');
        }

        // Remove global styles inline se não houver blocos
        if ($post && !has_blocks($post->post_content)) {
            wp_dequeue_style('global-styles');
        }
    }
}, 100);
