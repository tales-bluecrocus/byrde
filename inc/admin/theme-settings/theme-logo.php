<?php

/**
 * Theme Logo Functions
 *
 * @package Byrde
 */

/**
 * Get theme logo
 *
 * @param string $type Type of logo ('desktop' or 'mobile').
 * @return string|false Logo URL or false if not set.
 */
function byrde_get_logo($type = 'desktop')
{
    if (!function_exists('get_field')) {
        return false;
    }

    $key = ('mobile' === $type) ? 'logo_mobile' : 'logo';
    $logo_id = get_field($key, 'option');

    if (! $logo_id) {
        return false;
    }

    return wp_get_attachment_image_url($logo_id, 'full');
}

/**
 * Display theme logo
 *
 * @param array $args Logo display arguments.
 */
function byrde_the_logo($args = [])
{
    $defaults = [
        'class'        => 'header__logo-img',
        'show_mobile'  => true,
        'fallback'     => true,
        'site_name'    => get_bloginfo('name'),
    ];

    $args = wp_parse_args($args, $defaults);

    $desktop_logo = byrde_get_logo('desktop');
    $mobile_logo  = byrde_get_logo('mobile');

    // If no logo set and fallback is enabled, show site name
    if (! $desktop_logo && ! $mobile_logo) {
        if ($args['fallback']) {
            echo '<span class="header__logo-text">' . esc_html($args['site_name']) . '</span>';
        }

        return;
    }

    // Show desktop logo
    if ($desktop_logo) {
        $class = $args['class'];
        if ($mobile_logo && $args['show_mobile']) {
            $class .= ' header__logo-img--desktop';
        }
        echo '<img src="' . esc_url($desktop_logo) . '" alt="' . esc_attr($args['site_name']) . '" class="' . esc_attr($class) . '">';
    }

    // Show mobile logo if different from desktop
    if ($mobile_logo && $args['show_mobile']) {
        echo '<img src="' . esc_url($mobile_logo) . '" alt="' . esc_attr($args['site_name']) . '" class="' . esc_attr($args['class']) . ' header__logo-img--mobile">';
    }
}

/**
 * Get hero background image URL
 *
 * @param string $size Image size.
 * @return string|false Background image URL or false if not set.
 */
function byrde_get_hero_background($size = 'full')
{
    if (!function_exists('get_field')) {
        return false;
    }

    // Note: 'hero_background' field needs to be added to ACF Theme Settings if used
    $hero_bg_id = get_field('hero_background', 'option');

    if (! $hero_bg_id) {
        return false;
    }

    return wp_get_attachment_image_url($hero_bg_id, $size);
}

/**
 * Display hero background style
 *
 * @param array $args Display arguments.
 */
function byrde_the_hero_background_style($args = [])
{
    $defaults = [
        'size' => 'full',
        'echo' => true,
    ];

    $args = wp_parse_args($args, $defaults);
    $bg_url = byrde_get_hero_background($args['size']);

    if (! $bg_url) {
        return '';
    }

    $style = sprintf('background-image: url(%s);', esc_url($bg_url));

    if ($args['echo']) {
        echo $style;
    }

    return $style;
}
