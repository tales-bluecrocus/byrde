<?php
/**
 * Services Layout Definition
 */

function byrde_get_layout_services() {
    return array(
        'key' => 'layout_services',
        'name' => 'services',
        'label' => 'Services Overview',
        'icon' => 'dashicons-grid-view',
        'display' => 'block',
        'sub_fields' => array_merge(
            array(
                array(
                    'key' => 'field_services_tab_content',
                    'label' => 'Content',
                    'type' => 'tab',
                ),
                array(
                    'key' => 'field_services_title',
                    'label' => 'Title',
                    'name' => 'title',
                    'type' => 'text',
                    'default_value' => 'Our Junk Removal Services',
                ),
                array(
                    'key' => 'field_services_description',
                    'label' => 'Description',
                    'name' => 'description',
                    'type' => 'textarea',
                    'default_value' => 'Explore our trusted services. We’re here to make junk removal simple and stress-free',
                    'rows' => 2,
                ),
                array(
                    'key' => 'field_services_items',
                    'label' => 'Service Items',
                    'name' => 'services',
                    'type' => 'repeater',
                    'button_label' => 'Add Service',
                    'sub_fields' => array(
                        array(
                            'key' => 'field_services_item_icon',
                            'label' => 'Icon (Phosphor icon class)',
                            'name' => 'icon',
                            'type' => 'text',
                            'placeholder' => 'ph ph-house',
                        ),
                        array(
                            'key' => 'field_services_item_title',
                            'label' => 'Title',
                            'name' => 'title',
                            'type' => 'text',
                        ),
                        array(
                            'key' => 'field_services_item_description',
                            'label' => 'Description',
                            'name' => 'description',
                            'type' => 'textarea',
                            'rows' => 2,
                        ),
                    ),
                ),
            ),
            // MERGE LAYOUT SETTINGS (EXTENDS)
            function_exists('byrde_get_acf_layout_settings') ? byrde_get_acf_layout_settings('services') : array()
        ),
    );
}
