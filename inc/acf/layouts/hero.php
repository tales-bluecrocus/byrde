<?php
/**
 * Hero Layout Definition
 */

function byrde_get_layout_hero() {
    return array(
        'key' => 'layout_hero',
        'name' => 'hero',
        'label' => 'Hero Section',
        'display' => 'block',
        'icon' => 'dashicons-cover-image', // Adds a Dashicon icon
        'sub_fields' => array_merge(
            array(
                array(
                    'key' => 'field_hero_tab_content',
                    'label' => 'Content',
                    'type' => 'tab',
                ),
                array(
                    'key' => 'field_hero_title',
                    'label' => 'Title',
                    'name' => 'title',
                    'type' => 'textarea',
                    'rows' => 2,
                    'default_value' => 'Fast & Reliable Junk Removal Services',
                ),
                array(
                    'key' => 'field_hero_subtitle',
                    'label' => 'Subtitle',
                    'name' => 'subtitle',
                    'type' => 'textarea',
                    'rows' => 2,
                    'default_value' => 'Voted Best In North Idaho. 100% Guarantee.',
                ),
                array(
                    'key' => 'field_hero_features',
                    'label' => 'Features',
                    'name' => 'features',
                    'type' => 'repeater',
                    'button_label' => 'Add Feature',
                    'sub_fields' => array(
                        array(
                            'key' => 'field_hero_feature_icon',
                            'label' => 'Icon Class',
                            'name' => 'icon',
                            'type' => 'text',
                            'default_value' => 'ph-bold ph-check-circle',
                        ),
                        array(
                            'key' => 'field_hero_feature_text',
                            'label' => 'Text',
                            'name' => 'text',
                            'type' => 'text',
                        ),
                    ),
                ),
                array(
                    'key' => 'field_hero_form_shortcode',
                    'label' => 'Form Shortcode',
                    'name' => 'form_shortcode',
                    'type' => 'text',
                    'default_value' => '[ppc_lead_form]',
                ),
                array(
                    'key' => 'field_hero_background_image',
                    'label' => 'Background Image',
                    'name' => 'background_image',
                    'type' => 'image',
                    'return_format' => 'url',
                    'preview_size' => 'medium',
                ),
            ),
            // MERGE LAYOUT SETTINGS (EXTENDS)
            function_exists('byrde_get_acf_layout_settings') ? byrde_get_acf_layout_settings('hero') : array()
        ),
    );
}
