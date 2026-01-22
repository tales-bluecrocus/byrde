<?php
/**
 * FAQ Layout Definition
 */

function byrde_get_layout_faq() {
    return array(
        'key' => 'layout_faq',
        'name' => 'faq',
        'label' => 'FAQ Section',
        'icon' => 'dashicons-editor-help',
        'display' => 'block',
        'sub_fields' => array_merge(
            array(
                array(
                    'key' => 'field_faq_tab_content',
                    'label' => 'Content',
                    'type' => 'tab',
                ),
                array(
                    'key' => 'field_faq_title',
                    'label' => 'Title',
                    'name' => 'title',
                    'type' => 'text',
                    'default_value' => 'Frequently Asked Questions',
                ),
                array(
                    'key' => 'field_faq_description',
                    'label' => 'Description',
                    'name' => 'description',
                    'type' => 'textarea',
                    'default_value' => 'Real reviews from customers who chose Clifford’s Junk Removal for fast, professional, stress-free service. We’re proud to earn your trust every day.',
                    'rows' => 2,
                ),
                array(
                    'key' => 'field_faq_items',
                    'label' => 'FAQ Items',
                    'name' => 'faq_items',
                    'type' => 'repeater',
                    'button_label' => 'Add FAQ',
                    'sub_fields' => array(
                        array(
                            'key' => 'field_faq_question',
                            'label' => 'Question',
                            'name' => 'question',
                            'type' => 'text',
                        ),
                        array(
                            'key' => 'field_faq_answer',
                            'label' => 'Answer',
                            'name' => 'answer',
                            'type' => 'textarea',
                            'rows' => 3,
                        ),
                    ),
                ),
                array(
                    'key' => 'field_faq_cta_group',
                    'label' => 'CTA Card',
                    'name' => 'cta_card',
                    'type' => 'group',
                    'layout' => 'block',
                    'sub_fields' => array(
                        array(
                            'key' => 'field_faq_cta_title',
                            'label' => 'CTA Title',
                            'name' => 'title',
                            'type' => 'text',
                            'default_value' => 'Regain Your Space Today',
                        ),
                        array(
                            'key' => 'field_faq_cta_desc',
                            'label' => 'CTA Description',
                            'name' => 'description',
                            'type' => 'textarea',
                            'default_value' => 'Choose the trusted local team for fast, fair, and eco-friendly junk removal.',
                            'rows' => 2,
                        ),
                        array(
                            'key' => 'field_faq_cta_button_group',
                            'label' => 'CTA Button',
                            'name' => 'button',
                            'type' => 'group',
                            'sub_fields' => function_exists('byrde_get_phone_fields') ? byrde_get_phone_fields('faq_cta') : array(),
                        ),
                    ),
                ),
            ),
            // MERGE LAYOUT SETTINGS (EXTENDS)
            function_exists('byrde_get_acf_layout_settings') ? byrde_get_acf_layout_settings('faq') : array()
        ),
    );
}
