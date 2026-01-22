<?php
/**
 * Testimonials Layout Definition
 */

function byrde_get_layout_testimonials() {
    return array(
        'key' => 'layout_testimonials',
        'name' => 'testimonials',
        'label' => 'Testimonials Carousel',
        'icon' => 'dashicons-testimonial',
        'display' => 'block',
        'sub_fields' => array_merge(
            array(
                array(
                    'key' => 'field_testimonials_tab_content',
                    'label' => 'Content',
                    'type' => 'tab',
                ),
                array(
                    'key' => 'field_testimonials_title',
                    'label' => 'Title',
                    'name' => 'title',
                    'type' => 'text',
                    'default_value' => 'Trusted By Local Homeowners',
                ),
                array(
                    'key' => 'field_testimonials_description',
                    'label' => 'Description',
                    'name' => 'description',
                    'type' => 'textarea',
                    'default_value' => 'Real reviews from customers who chose Clifford’s Junk Removal for fast, professional, stress-free service. We’re proud to earn your trust every day.',
                    'rows' => 2,
                ),
                array(
                    'key' => 'field_testimonials_items',
                    'label' => 'Testimonials',
                    'name' => 'testimonials',
                    'type' => 'repeater',
                    'button_label' => 'Add Testimonial',
                    'sub_fields' => array(
                        array(
                            'key' => 'field_testimonials_quote',
                            'label' => 'Quote',
                            'name' => 'quote',
                            'type' => 'textarea',
                            'rows' => 3,
                        ),
                        array(
                            'key' => 'field_testimonials_name',
                            'label' => 'Name',
                            'name' => 'name',
                            'type' => 'text',
                        ),
                        array(
                            'key' => 'field_testimonials_role',
                            'label' => 'Role/Location',
                            'name' => 'role',
                            'type' => 'text',
                        ),
                        array(
                            'key' => 'field_testimonials_score',
                            'label' => 'Score (0-5)',
                            'name' => 'score',
                            'type' => 'text',
                            'default_value' => '5.0',
                        ),
                    ),
                ),
            ),
            // MERGE LAYOUT SETTINGS (EXTENDS)
            function_exists('byrde_get_acf_layout_settings') ? byrde_get_acf_layout_settings('testimonials') : array()
        ),
    );
}
