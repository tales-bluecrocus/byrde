<?php
/**
 * Main ACF Fields Registration
 *
 * Imports definitions from subdirectories and registers the main field groups.
 */

// Import Utilities
require_once __DIR__ . '/utils/phone.php';
require_once __DIR__ . '/utils/layout-settings.php';
require_once __DIR__ . '/admin-functions.php';

// Import Layouts
require_once __DIR__ . '/layouts/hero.php';
require_once __DIR__ . '/layouts/highlight-testimonials.php';
require_once __DIR__ . '/layouts/services.php';
require_once __DIR__ . '/layouts/faq.php';
require_once __DIR__ . '/layouts/cta-section.php';
require_once __DIR__ . '/layouts/areas-we-serve.php';
require_once __DIR__ . '/layouts/testimonials.php';

if (function_exists('acf_add_local_field_group')):

    acf_add_local_field_group(array(
        'key' => 'group_page_builder',
        'title' => 'Flexible Page Content',
        'fields' => array(
            array(
                'key' => 'field_page_builder_layouts',
                'label' => 'Sections',
                'name' => 'sections',
                'type' => 'flexible_content',
                'layouts' => array(
                    'layout_hero' => function_exists('byrde_get_layout_hero') ? byrde_get_layout_hero() : array(),
                    'layout_highlight_testimonials' => function_exists('byrde_get_layout_highlight_testimonials') ? byrde_get_layout_highlight_testimonials() : array(),
                    'layout_services' => function_exists('byrde_get_layout_services') ? byrde_get_layout_services() : array(),
                    'layout_faq' => function_exists('byrde_get_layout_faq') ? byrde_get_layout_faq() : array(),
                    'layout_cta_section' => function_exists('byrde_get_layout_cta_section') ? byrde_get_layout_cta_section() : array(),
                    'layout_areas_we_serve' => function_exists('byrde_get_layout_areas_we_serve') ? byrde_get_layout_areas_we_serve() : array(),
                    'layout_testimonials' => function_exists('byrde_get_layout_testimonials') ? byrde_get_layout_testimonials() : array(),
                ),
                'button_label' => 'Add Section',
            ),
        ),
        'location' => array(
            array(
                array(
                    'param' => 'post_template',
                    'operator' => '==',
                    'value' => 'page.php',
                ),
            ),
        ),
        'hide_on_screen' => array(
            'the_content',
        ),
    ));

endif;
