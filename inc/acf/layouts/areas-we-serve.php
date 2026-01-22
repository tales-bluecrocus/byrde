<?php
/**
 * Areas We Serve Layout Definition
 */

function byrde_get_layout_areas_we_serve() {
    return array(
        'key' => 'layout_areas_we_serve',
        'name' => 'areas_we_serve',
        'label' => 'Areas We Serve',
        'icon' => 'dashicons-location-alt',
        'display' => 'block',
        'sub_fields' => array_merge(
            array(
                array(
                    'key' => 'field_areas_tab_content',
                    'label' => 'Content',
                    'type' => 'tab',
                ),
                array(
                    'key' => 'field_areas_title',
                    'label' => 'Title',
                    'name' => 'title',
                    'type' => 'text',
                    'default_value' => 'Proudly Serving Local Communities',
                ),
                array(
                    'key' => 'field_areas_description',
                    'label' => 'Description',
                    'name' => 'description',
                    'type' => 'textarea',
                    'default_value' => 'We provide fast, reliable junk removal throughout Sacramento County, Placer County, and El Dorado County.',
                    'rows' => 2,
                ),
                array(
                    'key' => 'field_areas_locations',
                    'label' => 'Locations',
                    'name' => 'locations',
                    'type' => 'repeater',
                    'button_label' => 'Add Location',
                    'sub_fields' => array(
                        array(
                            'key' => 'field_areas_location_item',
                            'label' => 'Location Name',
                            'name' => 'location',
                            'type' => 'text',
                        ),
                    ),
                ),
            ),
            // MERGE LAYOUT SETTINGS (EXTENDS)
            function_exists('byrde_get_acf_layout_settings') ? byrde_get_acf_layout_settings('areas') : array()
        ),
    );
}
