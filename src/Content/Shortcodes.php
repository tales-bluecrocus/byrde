<?php

namespace Byrde\Content;

use Byrde\Settings\Manager;

/**
 * Theme Shortcodes.
 *
 * Dynamic shortcodes that pull data from theme settings.
 * Used in legal pages and other WordPress content.
 *
 * Available shortcodes:
 *   [byrde_company_name]   -- Site/company name
 *   [byrde_email]          -- Contact email (with mailto link by default)
 *   [byrde_phone]          -- Phone number (with tel link by default)
 *   [byrde_address]        -- Business address
 *   [byrde_site_url]       -- Site home URL
 *   [byrde_current_year]   -- Current year (for copyright lines)
 */
class Shortcodes {

    public function __construct(
        private Manager $settings,
    ) {}

    /**
     * Register all shortcodes.
     */
    public function register(): void {
        add_shortcode( 'byrde_company_name', [ $this, 'company_name' ] );
        add_shortcode( 'byrde_email', [ $this, 'email' ] );
        add_shortcode( 'byrde_phone', [ $this, 'phone' ] );
        add_shortcode( 'byrde_address', [ $this, 'address' ] );
        add_shortcode( 'byrde_site_url', [ $this, 'site_url' ] );
        add_shortcode( 'byrde_current_year', [ $this, 'current_year' ] );
    }

    /**
     * [byrde_company_name] -- Company/Site name from settings.
     */
    public function company_name(): string {
        $name = $this->settings->get( 'site_name' );
        return esc_html( $name ?: get_bloginfo( 'name' ) );
    }

    /**
     * [byrde_email] -- Contact email.
     *
     * Attributes:
     *   link="yes"|"no" (default: yes) -- wrap in mailto link
     */
    public function email( $atts = [] ): string {
        $atts  = shortcode_atts( [ 'link' => 'yes' ], $atts );
        $email = $this->settings->get( 'email' );

        if ( empty( $email ) ) {
            return '';
        }

        if ( 'yes' === $atts['link'] ) {
            return '<a href="mailto:' . esc_attr( $email ) . '">' . esc_html( $email ) . '</a>';
        }

        return esc_html( $email );
    }

    /**
     * [byrde_phone] -- Phone number.
     *
     * Attributes:
     *   link="yes"|"no" (default: yes) -- wrap in tel link
     */
    public function phone( $atts = [] ): string {
        $atts      = shortcode_atts( [ 'link' => 'yes' ], $atts );
        $phone     = $this->settings->get( 'phone' );
        $phone_raw = $this->settings->get( 'phone_raw' );

        if ( empty( $phone ) ) {
            return '';
        }

        if ( 'yes' === $atts['link'] ) {
            return '<a href="tel:' . esc_attr( $phone_raw ?: Manager::phone_to_raw( $phone ) ) . '">' . esc_html( $phone ) . '</a>';
        }

        return esc_html( $phone );
    }

    /**
     * [byrde_address] -- Business address.
     */
    public function address(): string {
        return esc_html( $this->settings->get( 'address' ) );
    }

    /**
     * [byrde_site_url] -- Root site URL (scheme + host only).
     *
     * In multisite with path-based installs (e.g. example.com/lp/),
     * this returns just the root domain (example.com), not the subsite path.
     */
    public function site_url(): string {
        $url    = home_url();
        $parsed = wp_parse_url( $url );
        $root   = ( $parsed['scheme'] ?? 'https' ) . '://' . ( $parsed['host'] ?? '' );

        return esc_url( $root );
    }

    /**
     * [byrde_current_year] -- Current year.
     */
    public function current_year(): string {
        return gmdate( 'Y' );
    }
}
