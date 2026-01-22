<?php
/**
 * ACF Backend Customizations
 * 
 * Handles dynamic preview titles and other admin-side enhancements.
 */

/**
 * Filter Flexible Content Layout Title
 * 
 * Adds "Section Theme" badge to the layout title bar in Admin.
 * 
 * @param string $title The original title.
 * @param array $field The flexible content field array.
 * @param array $layout The current layout array.
 * @param int $i The index of the layout.
 * @return string Modified title.
 */
function byrde_acf_flexible_content_layout_title($title, $field, $layout, $i) {
    if ($field['name'] !== 'sections') {
        return $title;
    }

    // Get the base content summary
    $custom_title = '';
    
    // Customize based on layout type
    if ($layout['name'] === 'hero') {
        $text = get_sub_field('title');
        if ($text) {
             $custom_title = '<b>' . esc_html(wp_trim_words($text, 5)) . '</b>';
        }
    } elseif ($layout['name'] === 'highlight_testimonials') {
        $text = get_sub_field('quote');
        if ($text) {
            $custom_title = '<b>' . esc_html(wp_trim_words($text, 8)) . '</b>';
        }
    }

    // If we found specific content, use it, otherwise keep default label
    if ($custom_title) {
        $title = $custom_title;
    }

    // --- "Dynamic Preview of ACF Extends" ---
    // Badge for Section Theme
    $theme = get_sub_field('section_theme');
    
    if ($theme) {
        $theme_label = '';
        $bg_color = '#e2e8f0'; // Default gray
        $text_color = '#000';

        switch ($theme) {
            case 'bg-primary':
                $theme_label = 'Primary';
                $bg_color = '#0f172a'; // Dark Blue
                $text_color = '#fff';
                break;
            case 'bg-secondary':
                $theme_label = 'Secondary';
                $bg_color = '#f97316'; // Orange
                $text_color = '#fff';
                break;
            case 'bg-alternative':
                $theme_label = 'Alternative';
                $bg_color = '#3b82f6'; // Blue
                $text_color = '#fff';
                break;
            case 'bg-white':
                $theme_label = 'White';
                $bg_color = '#fff';
                $text_color = '#000';
                break;
            case 'bg-gray':
                $theme_label = 'Gray';
                $bg_color = '#f3f4f6';
                $text_color = '#000';
                break;
            case 'bg-dark':
                $theme_label = 'Dark';
                $bg_color = '#000';
                $text_color = '#fff';
                break;
        }

        if ($theme_label) {
            $title .= ' <span style="
                background-color: ' . $bg_color . '; 
                color: ' . $text_color . '; 
                padding: 2px 6px; 
                border-radius: 4px; 
                font-size: 10px; 
                text-transform: uppercase; 
                margin-left: 8px; 
                border: 1px solid #ccc;
                vertical-align: middle;
            ">' . $theme_label . '</span>';
        }
    }

    return $title;
}

// Target the 'sections' field specifically if strictly needed, or global
add_filter('acf/fields/flexible_content/layout_title/name=sections', 'byrde_acf_flexible_content_layout_title', 10, 4);
