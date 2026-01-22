<?php
/**
 * CTA Section Layout Definition
 */

function byrde_get_layout_cta_section() {
    return array(
        'key' => 'layout_cta_section',
        'name' => 'cta_section',
        'label' => 'CTA Section',
        'icon' => 'dashicons-megaphone',
        'display' => 'block',
        'sub_fields' => array_merge(
            array(
                array(
                    'key' => 'field_cta_tab_content',
                    'label' => 'Content',
                    'type' => 'tab',
                ),
                array(
                    'key' => 'field_cta_title',
                    'label' => 'Title',
                    'name' => 'title',
                    'type' => 'text',
                    'default_value' => 'Get Rid Of The Junk Today',
                ),
                array(
                    'key' => 'field_cta_description',
                    'label' => 'Description',
                    'name' => 'description',
                    'type' => 'textarea',
                    'default_value' => 'Fast pickup, fair pricing, no stress. Reclaim your space with one simple call.',
                    'rows' => 2,
                ),
                array(
                    'key' => 'field_cta_link_group',
                    'label' => 'Button Link',
                    'name' => 'link',
                    'type' => 'group',
                    'sub_fields' => function_exists('byrde_get_phone_fields') ? byrde_get_phone_fields('cta') : array(),
                ),
            ),
            // MERGE LAYOUT SETTINGS (EXTENDS)
            function_exists('byrde_get_acf_layout_settings') ? byrde_get_acf_layout_settings('cta') : array()
        ),
    );
}
