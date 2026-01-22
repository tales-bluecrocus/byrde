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
            // Brand Colors (Design System)
            // ============================================
            array(
                'key' => 'field_tab_brand_colors',
                'label' => 'Brand Colors',
                'type' => 'tab',
                'placement' => 'left',
            ),
            array(
                'key' => 'field_colors_message',
                'type' => 'message',
                'message' => '<strong>Design System - Brand Colors</strong><br>Select the 8 base brand colors. The system will automatically generate 9 shades (50-900) for each color, plus semantic tokens for backgrounds, texts, borders and shadows.',
            ),

            // Primary Brand Color
            array(
                'key' => 'field_brand_color_primary',
                'label' => 'Primary',
                'name' => 'brand_color_primary',
                'type' => 'color_picker',
                'instructions' => 'Main brand color. Used in headers, navigation and primary elements.',
                'default_value' => '#1e3a8a',
                'wrapper' => array('width' => '25'),
            ),

            // Secondary Brand Color
            array(
                'key' => 'field_brand_color_secondary',
                'label' => 'Secondary',
                'name' => 'brand_color_secondary',
                'type' => 'color_picker',
                'instructions' => 'Secondary color. Used in CTAs and highlight elements.',
                'default_value' => '#ea580c',
                'wrapper' => array('width' => '25'),
            ),

            // Accent Brand Color
            array(
                'key' => 'field_brand_color_accent',
                'label' => 'Accent',
                'name' => 'brand_color_accent',
                'type' => 'color_picker',
                'instructions' => 'Accent color. Used for variations and alternative elements.',
                'default_value' => '#0891b2',
                'wrapper' => array('width' => '25'),
            ),

            // Neutral Color
            array(
                'key' => 'field_brand_color_neutral',
                'label' => 'Neutral',
                'name' => 'brand_color_neutral',
                'type' => 'color_picker',
                'instructions' => 'Neutral color (gray). Used in texts, borders and subtle backgrounds.',
                'default_value' => '#6b7280',
                'wrapper' => array('width' => '25'),
            ),

            // Semantic Colors Message
            array(
                'key' => 'field_semantic_colors_message',
                'type' => 'message',
                'message' => '<strong>Semantic Colors</strong><br>Colors for interface states and feedback.',
            ),

            // Success Color
            array(
                'key' => 'field_brand_color_success',
                'label' => 'Success',
                'name' => 'brand_color_success',
                'type' => 'color_picker',
                'instructions' => 'Success color. Used in positive messages and confirmations.',
                'default_value' => '#059669',
                'wrapper' => array('width' => '25'),
            ),

            // Warning Color
            array(
                'key' => 'field_brand_color_warning',
                'label' => 'Warning',
                'name' => 'brand_color_warning',
                'type' => 'color_picker',
                'instructions' => 'Warning color. Used in alerts and warnings.',
                'default_value' => '#d97706',
                'wrapper' => array('width' => '25'),
            ),

            // Error Color
            array(
                'key' => 'field_brand_color_error',
                'label' => 'Error',
                'name' => 'brand_color_error',
                'type' => 'color_picker',
                'instructions' => 'Error color. Used in error messages and validations.',
                'default_value' => '#dc2626',
                'wrapper' => array('width' => '25'),
            ),

            // Info Color
            array(
                'key' => 'field_brand_color_info',
                'label' => 'Info',
                'name' => 'brand_color_info',
                'type' => 'color_picker',
                'instructions' => 'Informational color. Used in tips and information.',
                'default_value' => '#0284c7',
                'wrapper' => array('width' => '25'),
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
 * Output Theme Design System CSS Variables to :root
 *
 * Generates color scales (50-900) from base brand colors and outputs
 * semantic tokens for consistent theming throughout the site.
 */
function byrde_output_theme_css_variables() {
	// Check cache first
	$cache_key = 'byrde_css_vars_v1';
	$cached    = get_transient($cache_key);

	if ($cached && ! is_customize_preview()) {
		echo $cached;
		return;
	}

	// Get base colors from ACF
	$brand_colors = array(
		'primary'   => get_field('brand_color_primary', 'option') ?: '#1e3a8a',
		'secondary' => get_field('brand_color_secondary', 'option') ?: '#ea580c',
		'accent'    => get_field('brand_color_accent', 'option') ?: '#0891b2',
		'success'   => get_field('brand_color_success', 'option') ?: '#059669',
		'warning'   => get_field('brand_color_warning', 'option') ?: '#d97706',
		'error'     => get_field('brand_color_error', 'option') ?: '#dc2626',
		'info'      => get_field('brand_color_info', 'option') ?: '#0284c7',
		'neutral'   => get_field('brand_color_neutral', 'option') ?: '#6b7280',
	);

	// Generate color scales
	$all_scales = array();
	foreach ($brand_colors as $name => $hex) {
		$all_scales[ $name ] = byrde_generate_color_scale($hex, $name);
	}

	// Get semantic tokens
	$semantic_tokens = byrde_get_semantic_token_map();

	// Build CSS
	ob_start();
	echo "\n<style id='byrde-design-system'>\n:root {\n";

	// Output color scales
	foreach ($all_scales as $name => $scale) {
		echo "    /* {$name} scale */\n";
		foreach ($scale as $shade => $value) {
			echo "    --{$name}-{$shade}: {$value['hex']};\n";
			echo "    --{$name}-{$shade}-rgb: {$value['rgb']};\n";
		}
		echo "\n";
	}

	// Output semantic tokens
	echo "    /* Semantic tokens */\n";
	foreach ($semantic_tokens as $token => $value) {
		if (strpos($value, 'rgba') === 0) {
			// Literal value
			echo "    --{$token}: {$value};\n";
		} else {
			// Reference to scale
			echo "    --{$token}: var(--{$value});\n";
		}
	}

	// Backwards compatibility aliases
	echo "\n    /* Legacy aliases (backwards compatibility) */\n";
	echo "    --primary-color: var(--primary-600);\n";
	echo "    --primary-text: var(--primary-50);\n";
	echo "    --primary-link: var(--accent-200);\n";
	echo "    --secondary-color: var(--secondary-500);\n";
	echo "    --secondary-text: var(--secondary-50);\n";
	echo "    --secondary-link: var(--accent-100);\n";
	echo "    --alternative-color: var(--accent-500);\n";
	echo "    --alternative-text: var(--accent-50);\n";
	echo "    --alternative-link: var(--accent-200);\n";
	echo "    --btn-primary-bg: var(--primary-600);\n";
	echo "    --btn-primary-text: var(--primary-50);\n";
	echo "    --btn-secondary-bg: var(--secondary-500);\n";
	echo "    --btn-secondary-text: var(--secondary-50);\n";
	echo "    --btn-alternative-bg: var(--accent-500);\n";
	echo "    --btn-alternative-text: var(--accent-50);\n";
	echo "    --bg-gray: var(--neutral-100);\n";
	echo "    --bg-white: var(--neutral-50);\n";
	echo "    --text-main: var(--neutral-900);\n";
	echo "    --text-muted: var(--neutral-500);\n";
	echo "    --link-color: var(--secondary-500);\n";
	echo "    --link-color-hover: var(--secondary-600);\n";

	echo "}\n</style>\n";

	$output = ob_get_clean();

	// Cache for 24 hours
	set_transient($cache_key, $output, DAY_IN_SECONDS);

	echo $output;
}
add_action('wp_head', 'byrde_output_theme_css_variables');

/**
 * Clear CSS variables cache when ACF options are saved
 */
add_action(
	'acf/save_post',
	function ( $post_id ) {
		if ($post_id === 'options') {
			delete_transient('byrde_css_vars_v1');
		}
	},
	20
);
