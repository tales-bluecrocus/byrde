<?php
/**
 * Theme Settings Page
 *
 * @package Byrde
 */

class Byrde_Theme_Settings
{
    /**
     * Option name for settings
     */
    public const OPTION_NAME = 'byrde_theme_settings';

    /**
     * Initialize the class
     */
    public function __construct()
    {
        add_action('admin_menu', [ $this, 'add_admin_menu' ]);
        add_action('admin_init', [ $this, 'register_settings' ]);
        add_action('admin_enqueue_scripts', [ $this, 'enqueue_admin_assets' ]);
    }

    /**
     * Add admin menu page
     */
    public function add_admin_menu()
    {
        add_menu_page(
            __('Byrde Settings', 'byrde'),
            __('Byrde Settings', 'byrde'),
            'manage_options',
            'byrde-theme-settings',
            [ $this, 'render_settings_page' ],
            'dashicons-admin-customizer',
            61,
        );
    }

    /**
     * Register settings
     */
    public function register_settings()
    {
        register_setting(
            'byrde_theme_settings_group',
            self::OPTION_NAME,
            [
                'sanitize_callback' => [ $this, 'sanitize_settings' ],
            ],
        );

        // Logo Section
        add_settings_section(
            'byrde_logo_section',
            __('Logo Settings', 'byrde'),
            [ $this, 'render_logo_section_description' ],
            'byrde-theme-settings',
        );

        add_settings_field(
            'logo',
            __('Logo', 'byrde'),
            [ $this, 'render_logo_field' ],
            'byrde-theme-settings',
            'byrde_logo_section',
        );

        add_settings_field(
            'logo_mobile',
            __('Mobile Logo', 'byrde'),
            [ $this, 'render_logo_mobile_field' ],
            'byrde-theme-settings',
            'byrde_logo_section',
        );

        // Hero Section
        add_settings_section(
            'byrde_hero_section',
            __('Hero Settings', 'byrde'),
            [ $this, 'render_hero_section_description' ],
            'byrde-theme-settings',
        );

        add_settings_field(
            'hero_background',
            __('Hero Background Image', 'byrde'),
            [ $this, 'render_hero_background_field' ],
            'byrde-theme-settings',
            'byrde_hero_section',
        );
    }

    /**
     * Enqueue admin assets
     */
    public function enqueue_admin_assets($hook)
    {
        if ('toplevel_page_byrde-theme-settings' !== $hook) {
            return;
        }

        wp_enqueue_media();
        wp_enqueue_style(
            'byrde-admin-settings',
            get_template_directory_uri() . '/inc/admin/assets/css/theme-settings.css',
            [],
            '1.0.0',
        );
        wp_enqueue_script(
            'byrde-admin-settings',
            get_template_directory_uri() . '/inc/admin/assets/js/theme-settings.js',
            [ 'jquery' ],
            '1.0.0',
            true,
        );
    }

    /**
     * Sanitize settings
     */
    public function sanitize_settings($input)
    {
        $sanitized = [];

        if (isset($input['logo'])) {
            $sanitized['logo'] = absint($input['logo']);
        }

        if (isset($input['logo_mobile'])) {
            $sanitized['logo_mobile'] = absint($input['logo_mobile']);
        }

        if (isset($input['hero_background'])) {
            $sanitized['hero_background'] = absint($input['hero_background']);
        }

        return $sanitized;
    }

    /**
     * Render logo section description
     */
    public function render_logo_section_description()
    {
        echo '<p>' . esc_html__('Upload and manage your theme logos.', 'byrde') . '</p>';
    }

    /**
     * Render logo field
     */
    public function render_logo_field()
    {
        $settings = get_option(self::OPTION_NAME, []);
        $logo_id  = isset($settings['logo']) ? $settings['logo'] : '';
        $logo_url = $logo_id ? wp_get_attachment_image_url($logo_id, 'medium') : '';
        ?>
<div class="byrde-media-upload">
	<div class="byrde-media-preview">
		<?php if ($logo_url) : ?>
		<img src="<?php echo esc_url($logo_url); ?>" alt="Logo"
			style="max-width: 200px; height: auto;">
		<?php else : ?>
		<div class="byrde-media-placeholder">
			<span class="dashicons dashicons-format-image"></span>
			<p><?php esc_html_e('No logo selected', 'byrde'); ?>
			</p>
		</div>
		<?php endif; ?>
	</div>
	<input type="hidden"
		name="<?php echo esc_attr(self::OPTION_NAME); ?>[logo]"
		class="byrde-media-id"
		value="<?php echo esc_attr($logo_id); ?>">
	<button type="button" class="button byrde-media-upload-btn">
		<?php echo $logo_url ? esc_html__('Change Logo', 'byrde') : esc_html__('Upload Logo', 'byrde'); ?>
	</button>
	<?php if ($logo_url) : ?>
	<button type="button"
		class="button byrde-media-remove-btn"><?php esc_html_e('Remove', 'byrde'); ?></button>
	<?php endif; ?>
</div>
<?php
    }

    /**
     * Render mobile logo field
     */
    public function render_logo_mobile_field()
    {
        $settings        = get_option(self::OPTION_NAME, []);
        $logo_mobile_id  = isset($settings['logo_mobile']) ? $settings['logo_mobile'] : '';
        $logo_mobile_url = $logo_mobile_id ? wp_get_attachment_image_url($logo_mobile_id, 'medium') : '';
        ?>
<div class="byrde-media-upload">
	<div class="byrde-media-preview">
		<?php if ($logo_mobile_url) : ?>
		<img src="<?php echo esc_url($logo_mobile_url); ?>"
			alt="Mobile Logo" style="max-width: 200px; height: auto;">
		<?php else : ?>
		<div class="byrde-media-placeholder">
			<span class="dashicons dashicons-format-image"></span>
			<p><?php esc_html_e('No mobile logo selected', 'byrde'); ?>
			</p>
		</div>
		<?php endif; ?>
	</div>
	<input type="hidden"
		name="<?php echo esc_attr(self::OPTION_NAME); ?>[logo_mobile]"
		class="byrde-media-id"
		value="<?php echo esc_attr($logo_mobile_id); ?>">
	<button type="button" class="button byrde-media-upload-btn">
		<?php echo $logo_mobile_url ? esc_html__('Change Mobile Logo', 'byrde') : esc_html__('Upload Mobile Logo', 'byrde'); ?>
	</button>
	<?php if ($logo_mobile_url) : ?>
	<button type="button"
		class="button byrde-media-remove-btn"><?php esc_html_e('Remove', 'byrde'); ?></button>
	<?php endif; ?>
</div>
<p class="description">
	<?php esc_html_e('Optional: Upload a different logo for mobile devices.', 'byrde'); ?>
</p>
<?php
    }

    /**
     * Render hero section description
     */
    public function render_hero_section_description()
    {
        echo '<p>' . esc_html__('Configure the hero section background image for the first fold.', 'byrde') . '</p>';
    }

    /**
     * Render hero background field
     */
    public function render_hero_background_field()
    {
        $settings          = get_option(self::OPTION_NAME, []);
        $hero_bg_id        = isset($settings['hero_background']) ? $settings['hero_background'] : '';
        $hero_bg_url       = $hero_bg_id ? wp_get_attachment_image_url($hero_bg_id, 'large') : '';
        ?>
<div class="byrde-media-upload byrde-media-upload--hero">
	<div class="byrde-media-preview byrde-media-preview--hero">
		<?php if ($hero_bg_url) : ?>
		<img src="<?php echo esc_url($hero_bg_url); ?>"
			alt="Hero Background" style="max-width: 100%; height: auto;">
		<?php else : ?>
		<div class="byrde-media-placeholder">
			<span class="dashicons dashicons-format-image"></span>
			<p><?php esc_html_e('No hero background selected', 'byrde'); ?>
			</p>
		</div>
		<?php endif; ?>
	</div>
	<input type="hidden"
		name="<?php echo esc_attr(self::OPTION_NAME); ?>[hero_background]"
		class="byrde-media-id"
		value="<?php echo esc_attr($hero_bg_id); ?>">
	<button type="button" class="button byrde-media-upload-btn">
		<?php echo $hero_bg_url ? esc_html__('Change Background', 'byrde') : esc_html__('Upload Background', 'byrde'); ?>
	</button>
	<?php if ($hero_bg_url) : ?>
	<button type="button"
		class="button byrde-media-remove-btn"><?php esc_html_e('Remove', 'byrde'); ?></button>
	<?php endif; ?>
</div>
<p class="description">
	<?php esc_html_e('Upload a background image for the hero section. Recommended size: 1920x1080px or larger.', 'byrde'); ?>
</p>
<?php
    }

    /**
     * Render settings page
     */
    public function render_settings_page()
    {
        if (! current_user_can('manage_options')) {
            return;
        }

        // Check if settings were saved
        if (isset($_GET['settings-updated'])) {
            add_settings_error(
                'byrde_messages',
                'byrde_message',
                __('Settings saved successfully.', 'byrde'),
                'success',
            );
        }

        settings_errors('byrde_messages');
        ?>
<div class="wrap byrde-settings-wrap">
	<h1><?php echo esc_html(get_admin_page_title()); ?></h1>

	<form action="options.php" method="post">
		<?php
                settings_fields('byrde_theme_settings_group');
        do_settings_sections('byrde-theme-settings');
        submit_button(__('Save Settings', 'byrde'));
        ?>
	</form>
</div>
<?php
    }

    /**
     * Get a theme setting
     *
     * @param string $key     Setting key.
     * @param mixed  $default Default value.
     * @return mixed
     */
    public static function get_setting($key, $default = '')
    {
        $settings = get_option(self::OPTION_NAME, []);

        return isset($settings[ $key ]) ? $settings[ $key ] : $default;
    }
}

// Initialize the theme settings
new Byrde_Theme_Settings();
?>
