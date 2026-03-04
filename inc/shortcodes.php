<?php
/**
 * Theme Shortcodes
 *
 * Dynamic shortcodes that pull data from theme settings.
 * Used in legal pages and other WordPress content.
 *
 * Available shortcodes:
 *   [byrde_company_name]   — Site/company name
 *   [byrde_email]          — Contact email (with mailto link by default)
 *   [byrde_phone]          — Phone number (with tel link by default)
 *   [byrde_address]        — Business address
 *   [byrde_site_url]       — Site home URL
 *   [byrde_current_year]   — Current year (for copyright lines)
 *
 * @package Byrde
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * [byrde_company_name] — Company/Site name from settings
 */
function byrde_shortcode_company_name(): string {
    $name = byrde_get_setting( 'site_name' );
    return esc_html( $name ?: get_bloginfo( 'name' ) );
}
add_shortcode( 'byrde_company_name', 'byrde_shortcode_company_name' );

/**
 * [byrde_email] — Contact email
 *
 * Attributes:
 *   link="yes"|"no" (default: yes) — wrap in mailto link
 */
function byrde_shortcode_email( $atts = array() ): string {
    $atts  = shortcode_atts( array( 'link' => 'yes' ), $atts );
    $email = byrde_get_setting( 'email' );

    if ( empty( $email ) ) {
        return '';
    }

    if ( 'yes' === $atts['link'] ) {
        return '<a href="mailto:' . esc_attr( $email ) . '">' . esc_html( $email ) . '</a>';
    }

    return esc_html( $email );
}
add_shortcode( 'byrde_email', 'byrde_shortcode_email' );

/**
 * [byrde_phone] — Phone number
 *
 * Attributes:
 *   link="yes"|"no" (default: yes) — wrap in tel link
 */
function byrde_shortcode_phone( $atts = array() ): string {
    $atts      = shortcode_atts( array( 'link' => 'yes' ), $atts );
    $phone     = byrde_get_setting( 'phone' );
    $phone_raw = byrde_get_setting( 'phone_raw' );

    if ( empty( $phone ) ) {
        return '';
    }

    if ( 'yes' === $atts['link'] ) {
        return '<a href="tel:' . esc_attr( $phone_raw ?: byrde_phone_to_raw( $phone ) ) . '">' . esc_html( $phone ) . '</a>';
    }

    return esc_html( $phone );
}
add_shortcode( 'byrde_phone', 'byrde_shortcode_phone' );

/**
 * [byrde_address] — Business address
 */
function byrde_shortcode_address(): string {
    return esc_html( byrde_get_setting( 'address' ) );
}
add_shortcode( 'byrde_address', 'byrde_shortcode_address' );

/**
 * [byrde_site_url] — Root site URL (scheme + host only)
 *
 * In multisite with path-based installs (e.g. example.com/lp/),
 * this returns just the root domain (example.com), not the subsite path.
 */
function byrde_shortcode_site_url(): string {
    $url    = home_url();
    $parsed = wp_parse_url( $url );
    $root   = ( $parsed['scheme'] ?? 'https' ) . '://' . ( $parsed['host'] ?? '' );

    return esc_url( $root );
}
add_shortcode( 'byrde_site_url', 'byrde_shortcode_site_url' );

/**
 * [byrde_current_year] — Current year
 */
function byrde_shortcode_current_year(): string {
    return gmdate( 'Y' );
}
add_shortcode( 'byrde_current_year', 'byrde_shortcode_current_year' );
