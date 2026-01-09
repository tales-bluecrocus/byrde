<?php

/**
 * Display footer credits (copyright + agency)
 *
 * @param bool $echo Whether to echo or return the output
 * @return string|void
 */
function BlueCrocusCredits($echo = true)
{
    $agency_name = 'Blue Crocus';
    $agency_url = 'https://bluecrocus.ca';
    $current_year = date('Y');
    $site_name = get_bloginfo('name');

    $output = sprintf(
        '<p>&copy; %s %s. All rights reserved.</p>' . "\n\t" . '<p>Developed by <a href="%s" target="_blank" rel="noopener">%s</a></p>',
        esc_html($current_year),
        esc_html($site_name),
        esc_url($agency_url),
        esc_html($agency_name),
    );

    if ($echo) {
        echo $output;
    } else {
        return $output;
    }
}
