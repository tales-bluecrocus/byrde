<?php
/**
 * Highlight Testimonials Layout Definition
 */

function byrde_get_layout_highlight_testimonials() {
    return array(
        'key' => 'layout_highlight_testimonials',
        'name' => 'highlight_testimonials',
        'label' => 'Highlight Testimonials',
        'display' => 'block',
        'icon' => 'dashicons-format-quote', // Adds a Dashicon icon
        'sub_fields' => array_merge(
            array(
                array(
                    'key' => 'field_ht_tab_content',
                    'label' => 'Content',
                    'type' => 'tab',
                ),
                array(
                    'key' => 'field_ht_quote',
                    'label' => 'Quote',
                    'name' => 'quote',
                    'type' => 'textarea',
                    'rows' => 4,
                    'default_value' => 'Great bunch of hard working guys. I had a 100 year old shed that had a roof which fell in 30 years ago. It was full of unknown junk. They gave me a fair quote. They showed up the next day and he and his team leveled the shed. They loaded up everything and charged me what we had agreed to. I was gonna do it, but it was a mess. I could not have done it myself. I will use them again.',
                ),
                array(
                    'key' => 'field_ht_author_name',
                    'label' => 'Author Name',
                    'name' => 'author_name',
                    'type' => 'text',
                    'default_value' => 'Joshua Smith',
                ),
                array(
                    'key' => 'field_ht_author_image',
                    'label' => 'Author Image',
                    'name' => 'author_image',
                    'type' => 'image',
                    'return_format' => 'url',
                    'preview_size' => 'thumbnail',
                ),
                array(
                    'key' => 'field_ht_review_score',
                    'label' => 'Review Score',
                    'name' => 'review_score',
                    'type' => 'text',
                    'default_value' => '5.0',
                    'instructions' => 'Enter the score (e.g. 5.0) for the badge.',
                ),
                
                // Button / Contact Tab
                array(
                    'key' => 'field_ht_tab_contact',
                    'label' => 'Contact Button',
                    'type' => 'tab',
                ),
                // Reuse existing Phone Fields helper?
                // The current component uses a "Call For..." button which fits the phone helper structure.
                array(
                    'key' => 'field_ht_contact_group',
                    'label' => 'Contact Button',
                    'name' => 'contact_button',
                    'type' => 'group',
                    'sub_fields' => function_exists('byrde_get_phone_fields') ? byrde_get_phone_fields('ht') : array(),
                ),
            ),
            
            // MERGE LAYOUT SETTINGS (EXTENDS)
            function_exists('byrde_get_acf_layout_settings') ? byrde_get_acf_layout_settings('ht') : array()
        ),
    );
}
