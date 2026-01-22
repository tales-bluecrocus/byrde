<?php
/**
 * Phone Fields Helper
 */

/**
 * Get the Phone Group Fields
 *
 * @param string $key_prefix Prefix to ensure unique field keys if used multiple times.
 * @return array The fields array for the phone group.
 */
function byrde_get_phone_fields($key_prefix = 'header')
{
    return array(
        array(
            'key' => "field_{$key_prefix}_phone_label",
            'label' => 'Label',
            'name' => 'label',
            'type' => 'text',
            'instructions' => 'e.g. Call Us 24/7',
        ),
        array(
            'key' => "field_{$key_prefix}_phone_number",
            'label' => 'Number',
            'name' => 'number',
            'type' => 'text',
            'instructions' => 'e.g. +1 (555) 123-4567',
        ),
        array(
            'key' => "field_{$key_prefix}_phone_icon",
            'label' => 'Icon Class',
            'name' => 'icon',
            'type' => 'text',
            'default_value' => 'ph-bold ph-phone',
            'instructions' => 'Enter the Phosphor Icon class (e.g. ph-bold ph-phone). See https://phosphoricons.com/',
        ),
        array(
            'key' => "field_{$key_prefix}_phone_icon_position",
            'label' => 'Icon Position',
            'name' => 'icon_position',
            'type' => 'select',
            'choices' => array(
                'left' => 'Left',
                'right' => 'Right',
            ),
            'default_value' => 'left',
            'return_format' => 'value',
        ),
        array(
            'key' => "field_{$key_prefix}_phone_btn_style",
            'label' => 'Button Style',
            'name' => 'button_style',
            'type' => 'select',
            'choices' => array(
                'btn--primary' => 'Primary',
                'btn--secondary' => 'Secondary',
                'btn--alternative' => 'Alternative',
            ),
            'default_value' => 'btn--primary',
            'return_format' => 'value',
        ),
    );
}
