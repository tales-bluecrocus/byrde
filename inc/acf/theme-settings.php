<?php
/**
 * Theme Settings using ACF
 *
 * Replaces the old admin/theme-settings.php
 */

if (function_exists('acf_add_options_page')) {
    acf_add_options_page(array(
        'page_title'    => 'Theme Settings',
        'menu_title'    => 'Theme Settings',
        'menu_slug'     => 'theme-general-settings',
        'capability'    => 'edit_posts',
        'redirect'      => false
    ));
}

if (function_exists('acf_add_local_field_group')):

    acf_add_local_field_group(array(
        'key' => 'group_theme_settings',
        'title' => 'Theme Settings',
        'fields' => array(
            // ============================================
            // Header Settings
            // ============================================
            array(
                'key' => 'field_tab_header',
                'label' => 'Header',
                'type' => 'tab',
            ),
            array(
                'key' => 'field_header_theme',
                'label' => 'Header Theme',
                'name' => 'header_theme',
                'type' => 'select',
                'choices' => array(
                    '' => 'Default',
                    'bg-primary' => 'Primary',
                    'bg-secondary' => 'Secondary',
                    'bg-alternative' => 'Alternative',
                ),
                'default_value' => '',
                'wrapper' => array('width' => '50'),
            ),
            array(
                'key' => 'field_header_logo',
                'label' => 'Logo',
                'name' => 'logo',
                'type' => 'image',
                'return_format' => 'id',
                'preview_size' => 'medium',
                'wrapper' => array('width' => '50'),
            ),
            array(
                'key' => 'field_header_logo_mobile',
                'label' => 'Mobile Logo',
                'name' => 'logo_mobile',
                'type' => 'image',
                'return_format' => 'id',
                'preview_size' => 'medium',
                'instructions' => 'Optional: Upload a different logo for mobile devices.',
            ),

            // ============================================
            // Google Reviews Settings
            // ============================================
            array(
                'key' => 'field_header_message_reviews',
                'label' => 'Google Reviews',
                'type' => 'message',
            ),
            array(
                'key' => 'field_google_reviews_score',
                'label' => 'Score',
                'name' => 'google_reviews_score',
                'type' => 'text',
                'default_value' => '4.9',
                'wrapper' => array('width' => '50'),
            ),
            array(
                'key' => 'field_google_reviews_count',
                'label' => 'Review Count',
                'name' => 'google_reviews_count',
                'type' => 'number',
                'default_value' => '127',
                'wrapper' => array('width' => '50'),
            ),

            // ============================================
            // Contact / Phone Settings
            // ============================================
            // ============================================
            // Contact / Phone Settings
            // ============================================
            array(
                'key' => 'field_message_global_contact',
                'label' => 'Global Button Settings',
                'type' => 'message',
            ),
            array(
                'key' => 'field_global_contact_button',
                'label' => 'Global Call Button',
                'name' => 'global_contact_button',
                'type' => 'group',
                'layout' => 'block',
                'sub_fields' => byrde_get_phone_fields('global'),
            ),

            // ============================================
            // Footer Settings
            // ============================================
            array(
                'key' => 'field_tab_footer',
                'label' => 'Footer',
                'type' => 'tab',
            ),
            array(
                'key' => 'field_footer_theme',
                'label' => 'Footer Theme',
                'name' => 'footer_theme',
                'type' => 'select',
                'choices' => array(
                    '' => 'Default',
                    'bg-primary' => 'Primary',
                    'bg-secondary' => 'Secondary',
                    'bg-alternative' => 'Alternative',
                ),
                'default_value' => '',
            ),
            
            // --- Column 1: Identity ---
            array(
                'key' => 'field_footer_col1_message',
                'label' => 'Brand & Socials',
                'type' => 'message',
            ),
            array(
                'key' => 'field_footer_logo',
                'label' => 'Footer Logo',
                'name' => 'footer_logo',
                'type' => 'image',
                'return_format' => 'id',
                'preview_size' => 'medium',
                'wrapper' => array('width' => '50'),
            ),
            array(
                'key' => 'field_footer_socials',
                'label' => 'Social Media Links',
                'name' => 'footer_socials',
                'type' => 'repeater',
                'button_label' => 'Add Social Link',
                'layout' => 'table',
                'sub_fields' => array(
                    array(
                        'key' => 'field_footer_social_icon',
                        'label' => 'Icon Class',
                        'name' => 'icon',
                        'type' => 'text',
                        'default_value' => 'ph-bold ph-facebook-logo',
                        'instructions' => 'Phosphor Icon class',
                    ),
                    array(
                        'key' => 'field_footer_social_url',
                        'label' => 'URL',
                        'name' => 'url',
                        'type' => 'url',
                    ),
                ),
            ),

            // --- Column 2: Quick Links ---
            array(
                'key' => 'field_footer_col2_message',
                'label' => 'Column 2 (Quick Links)',
                'type' => 'message',
            ),
            array(
                'key' => 'field_footer_col2_show',
                'label' => 'Show Column 2',
                'name' => 'footer_col2_show',
                'type' => 'true_false',
                'default_value' => 1,
                'ui' => 1,
            ),
            array(
                'key' => 'field_footer_col2_title',
                'label' => 'Title',
                'name' => 'footer_col2_title',
                'type' => 'text',
                'default_value' => 'Quick Links',
                'wrapper' => array('width' => '50'),
                'conditional_logic' => array(
                    array(
                        array(
                            'field' => 'field_footer_col2_show',
                            'operator' => '==',
                            'value' => '1',
                        ),
                    ),
                ),
            ),
            array(
                'key' => 'field_footer_col2_icon',
                'label' => 'Icon',
                'name' => 'footer_col2_icon',
                'type' => 'text',
                'default_value' => 'ph-bold ph-list',
                'wrapper' => array('width' => '50'),
                'conditional_logic' => array(
                    array(
                        array(
                            'field' => 'field_footer_col2_show',
                            'operator' => '==',
                            'value' => '1',
                        ),
                    ),
                ),
            ),
            array(
                'key' => 'field_footer_col2_links',
                'label' => 'Links',
                'name' => 'footer_col2_links',
                'type' => 'repeater',
                'button_label' => 'Add Link',
                'layout' => 'table',
                'sub_fields' => array(
                    array(
                        'key' => 'field_footer_col2_link',
                        'label' => 'Link',
                        'name' => 'link',
                        'type' => 'link',
                    ),
                ),
                'conditional_logic' => array(
                    array(
                        array(
                            'field' => 'field_footer_col2_show',
                            'operator' => '==',
                            'value' => '1',
                        ),
                    ),
                ),
            ),

            // --- Column 3: Contact ---
            array(
                'key' => 'field_footer_col3_message',
                'label' => 'Column 3 (Contact)',
                'type' => 'message',
            ),
            array(
                'key' => 'field_footer_col3_show',
                'label' => 'Show Column 3',
                'name' => 'footer_col3_show',
                'type' => 'true_false',
                'default_value' => 1,
                'ui' => 1,
            ),
            array(
                'key' => 'field_footer_col3_title',
                'label' => 'Title',
                'name' => 'footer_col3_title',
                'type' => 'text',
                'default_value' => 'Contact Us',
                'wrapper' => array('width' => '50'),
                'conditional_logic' => array(
                    array(
                        array(
                            'field' => 'field_footer_col3_show',
                            'operator' => '==',
                            'value' => '1',
                        ),
                    ),
                ),
            ),
            array(
                'key' => 'field_footer_col3_icon',
                'label' => 'Icon',
                'name' => 'footer_col3_icon',
                'type' => 'text',
                'default_value' => 'ph-bold ph-chats-circle',
                'wrapper' => array('width' => '50'),
                'conditional_logic' => array(
                    array(
                        array(
                            'field' => 'field_footer_col3_show',
                            'operator' => '==',
                            'value' => '1',
                        ),
                    ),
                ),
            ),
            array(
                'key' => 'field_footer_phone',
                'label' => 'Phone',
                'name' => 'footer_phone',
                'type' => 'text',
                'wrapper' => array('width' => '50'),
                'conditional_logic' => array(
                    array(
                        array(
                            'field' => 'field_footer_col3_show',
                            'operator' => '==',
                            'value' => '1',
                        ),
                    ),
                ),
            ),
            array(
                'key' => 'field_footer_email',
                'label' => 'Email',
                'name' => 'footer_email',
                'type' => 'text',
                'wrapper' => array('width' => '50'),
                'conditional_logic' => array(
                    array(
                        array(
                            'field' => 'field_footer_col3_show',
                            'operator' => '==',
                            'value' => '1',
                        ),
                    ),
                ),
            ),
            array(
                'key' => 'field_footer_address',
                'label' => 'Address',
                'name' => 'footer_address',
                'type' => 'textarea',
                'rows' => 3,
                'new_lines' => 'br',
                'conditional_logic' => array(
                    array(
                        array(
                            'field' => 'field_footer_col3_show',
                            'operator' => '==',
                            'value' => '1',
                        ),
                    ),
                ),
            ),

            // --- Privacy Policy ---
            array(
                'key' => 'field_footer_privacy_link',
                'label' => 'Privacy Policy Link',
                'name' => 'footer_privacy_link',
                'type' => 'page_link',
                'post_type' => array('page'),
                'allow_null' => 1,
                'multiple' => 0,
            ),

            // ============================================
            // Colors Settings
            // ============================================
            array(
                'key' => 'field_tab_colors',
                'label' => 'Theme Colors',
                'type' => 'tab',
            ),
            
            // Global Theme Colors
            array(
                'key' => 'field_color_message_global',
                'label' => 'Global Theme Colors',
                'type' => 'message',
            ),
            array(
                'key' => 'field_primary_color',
                'label' => 'Primary Color',
                'name' => 'primary_color',
                'type' => 'color_picker',
                'default_value' => '#0f172a',
                'wrapper' => array('width' => '33'),
            ),
            array(
                'key' => 'field_primary_text',
                'label' => 'Primary Text',
                'name' => 'primary_text',
                'type' => 'color_picker',
                'default_value' => '#ffffff',
                'wrapper' => array('width' => '33'),
            ),
            array(
                'key' => 'field_primary_link',
                'label' => 'Primary Link',
                'name' => 'primary_link',
                'type' => 'color_picker',
                'default_value' => '#ffffff', // Default to white or suitable contrast
                'wrapper' => array('width' => '33'),
            ),
            array(
                'key' => 'field_secondary_color',
                'label' => 'Secondary Color',
                'name' => 'secondary_color',
                'type' => 'color_picker',
                'default_value' => '#f97316',
                'wrapper' => array('width' => '33'),
            ),
            array(
                'key' => 'field_secondary_text',
                'label' => 'Secondary Text',
                'name' => 'secondary_text',
                'type' => 'color_picker',
                'default_value' => '#ffffff',
                'wrapper' => array('width' => '33'),
            ),
            array(
                'key' => 'field_secondary_link',
                'label' => 'Secondary Link',
                'name' => 'secondary_link',
                'type' => 'color_picker',
                'default_value' => '#ffffff',
                'wrapper' => array('width' => '33'),
            ),
            array(
                'key' => 'field_alternative_color',
                'label' => 'Alternative Color',
                'name' => 'alternative_color',
                'type' => 'color_picker',
                'default_value' => '#3b82f6',
                'wrapper' => array('width' => '33'),
            ),
            array(
                'key' => 'field_alternative_text',
                'label' => 'Alternative Text',
                'name' => 'alternative_text',
                'type' => 'color_picker',
                'default_value' => '#ffffff',
                'wrapper' => array('width' => '33'),
            ),
            array(
                'key' => 'field_alternative_link',
                'label' => 'Alternative Link',
                'name' => 'alternative_link',
                'type' => 'color_picker',
                'default_value' => '#ffffff',
                'wrapper' => array('width' => '33'),
            ),

            // Specific Button Colors
            array(
                'key' => 'field_color_message_buttons',
                'label' => 'Specific Button Colors',
                'type' => 'message',
            ),
            array(
                'key' => 'field_btn_primary_bg',
                'label' => 'Button Primary BG',
                'name' => 'btn_primary_bg',
                'type' => 'color_picker',
                'default_value' => '#0f172a',
                'wrapper' => array('width' => '50'),
            ),
            array(
                'key' => 'field_btn_primary_text',
                'label' => 'Button Primary Text',
                'name' => 'btn_primary_text',
                'type' => 'color_picker',
                'default_value' => '#ffffff',
                'wrapper' => array('width' => '50'),
            ),
            array(
                'key' => 'field_btn_secondary_bg',
                'label' => 'Button Secondary BG',
                'name' => 'btn_secondary_bg',
                'type' => 'color_picker',
                'default_value' => '#f97316',
                'wrapper' => array('width' => '50'),
            ),
            array(
                'key' => 'field_btn_secondary_text',
                'label' => 'Button Secondary Text',
                'name' => 'btn_secondary_text',
                'type' => 'color_picker',
                'default_value' => '#ffffff',
                'wrapper' => array('width' => '50'),
            ),
            array(
                'key' => 'field_btn_alternative_bg',
                'label' => 'Button Alternative BG',
                'name' => 'btn_alternative_bg',
                'type' => 'color_picker',
                'default_value' => '#3b82f6',
                'wrapper' => array('width' => '50'),
            ),
            array(
                'key' => 'field_btn_alternative_text',
                'label' => 'Button Alternative Text',
                'name' => 'btn_alternative_text',
                'type' => 'color_picker',
                'default_value' => '#ffffff',
                'wrapper' => array('width' => '50'),
            ),

            // Layout Colors
            array(
                'key' => 'field_color_message_layout',
                'label' => 'Layout Colors',
                'type' => 'message',
            ),
            array(
                'key' => 'field_bg_gray',
                'label' => 'Background Gray',
                'name' => 'bg_gray',
                'type' => 'color_picker',
                'default_value' => '#f9fafb',
                'wrapper' => array('width' => '50'),
            ),
            array(
                'key' => 'field_bg_white',
                'label' => 'Background White',
                'name' => 'bg_white',
                'type' => 'color_picker',
                'default_value' => '#ffffff',
                'wrapper' => array('width' => '50'),
            ),

            // Text Colors
            array(
                'key' => 'field_color_message_text',
                'label' => 'Text Colors',
                'type' => 'message',
            ),
            array(
                'key' => 'field_text_main',
                'label' => 'Text Main',
                'name' => 'text_main',
                'type' => 'color_picker',
                'default_value' => '#1e293b',
                'wrapper' => array('width' => '50'),
            ),
            array(
                'key' => 'field_text_muted',
                'label' => 'Text Muted',
                'name' => 'text_muted',
                'type' => 'color_picker',
                'default_value' => '#475569',
                'wrapper' => array('width' => '50'),
            ),
            array(
                'key' => 'field_link_color',
                'label' => 'Global Link Color',
                'name' => 'link_color',
                'type' => 'color_picker',
                'default_value' => '#f97316',
                'wrapper' => array('width' => '50'),
            ),
            array(
                'key' => 'field_link_color_hover',
                'label' => 'Global Link Hover',
                'name' => 'link_color_hover',
                'type' => 'color_picker',
                'default_value' => '#0f172a',
                'wrapper' => array('width' => '50'),
            ),
        ),
        'location' => array(
            array(
                array(
                    'param' => 'options_page',
                    'operator' => '==',
                    'value' => 'theme-general-settings',
                ),
            ),
        ),
    ));

endif;

/**
 * Output Theme Design Tokens to :root
 */
function byrde_output_theme_css_variables() {
    ?>
    <style type="text/css">
        :root {
            /* Global Theme Colors */
            --primary-color: <?php echo get_field('primary_color', 'option') ?: '#0f172a'; ?>;
            --primary-text: <?php echo get_field('primary_text', 'option') ?: '#ffffff'; ?>;
            --primary-link: <?php echo get_field('primary_link', 'option') ?: '#ffffff'; ?>;
            
            --secondary-color: <?php echo get_field('secondary_color', 'option') ?: '#f97316'; ?>;
            --secondary-text: <?php echo get_field('secondary_text', 'option') ?: '#ffffff'; ?>;
            --secondary-link: <?php echo get_field('secondary_link', 'option') ?: '#ffffff'; ?>;
            
            --alternative-color: <?php echo get_field('alternative_color', 'option') ?: '#3b82f6'; ?>;
            --alternative-text: <?php echo get_field('alternative_text', 'option') ?: '#ffffff'; ?>;
            --alternative-link: <?php echo get_field('alternative_link', 'option') ?: '#ffffff'; ?>;

            /* Specific Button Colors */
            --btn-primary-bg: <?php echo get_field('btn_primary_bg', 'option') ?: '#0f172a'; ?>;
            --btn-primary-text: <?php echo get_field('btn_primary_text', 'option') ?: '#ffffff'; ?>;
            
            --btn-secondary-bg: <?php echo get_field('btn_secondary_bg', 'option') ?: '#f97316'; ?>;
            --btn-secondary-text: <?php echo get_field('btn_secondary_text', 'option') ?: '#ffffff'; ?>;
            
            --btn-alternative-bg: <?php echo get_field('btn_alternative_bg', 'option') ?: '#3b82f6'; ?>;
            --btn-alternative-text: <?php echo get_field('btn_alternative_text', 'option') ?: '#ffffff'; ?>;
            
            /* Layout Colors */
            --bg-gray: <?php echo get_field('bg_gray', 'option') ?: '#f9fafb'; ?>;
            --bg-white: <?php echo get_field('bg_white', 'option') ?: '#ffffff'; ?>;
            
            /* Text Colors */
            --text-main: <?php echo get_field('text_main', 'option') ?: '#1e293b'; ?>;
            --text-muted: <?php echo get_field('text_muted', 'option') ?: '#475569'; ?>;

            /* Link Colors */
            --link-color: <?php echo get_field('link_color', 'option') ?: '#f97316'; ?>;
            --link-color-hover: <?php echo get_field('link_color_hover', 'option') ?: '#0f172a'; ?>;
        }
    </style>
    <?php
}
add_action('wp_head', 'byrde_output_theme_css_variables');
