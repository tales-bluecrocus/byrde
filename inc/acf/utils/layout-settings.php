<?php
/**
 * Layout Settings Helper
 */

/**
 * Get Standard Layout Settings Fields
 * (The "ACF Extends" equivalent for reusing layout options)
 *
 * @param string $prefix Prefix for field keys
 * @return array
 */
function byrde_get_acf_layout_settings($prefix = '') {
    return array(
        array(
            'key' => "field_{$prefix}_tab_layout",
            'label' => 'Layout Settings',
            'type' => 'tab',
        ),
        array(
            'key' => "field_{$prefix}_section_theme",
            'label' => 'Section Theme',
            'name' => 'section_theme',
            'type' => 'select',
            'choices' => array(
                '' => 'Default',
                'bg-primary' => 'Primary',
                'bg-secondary' => 'Secondary',
                'bg-alternative' => 'Alternative',
            ),
            'default_value' => '',
            'wrapper' => array('width' => '100'),
        ),

        array(
            'key' => "field_{$prefix}_section_id",
            'label' => 'Section ID',
            'name' => 'section_id',
            'type' => 'text',
            'instructions' => 'Optional: Add a unique ID for anchor links.',
            'wrapper' => array('width' => '50'),
        ),
        array(
            'key' => "field_{$prefix}_section_class",
            'label' => 'Custom Class',
            'name' => 'section_class',
            'type' => 'text',
            'instructions' => 'Optional: Add custom CSS classes.',
            'wrapper' => array('width' => '50'),
        ),
    );
}
