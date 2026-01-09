<?php
/**
 * Tracking Settings Page
 * Tracking settings for Google Ads and Meta Pixel
 */

// Add menu page in admin
add_action('admin_menu', 'byrde_tracking_settings_menu');

function byrde_tracking_settings_menu() {
	add_options_page(
		'Tracking Settings',           // Page title
		'Tracking',                     // Menu title
		'manage_options',               // Capability
		'byrde-tracking-settings',      // Menu slug
		'byrde_tracking_settings_page'  // Callback function
	);
}

// Register settings
add_action('admin_init', 'byrde_tracking_settings_init');

function byrde_tracking_settings_init() {
	// Register options
	register_setting('byrde_tracking_settings', 'byrde_gtm_id');
	register_setting('byrde_tracking_settings', 'byrde_google_ads_id');
	register_setting('byrde_tracking_settings', 'byrde_meta_pixel_id');
	register_setting('byrde_tracking_settings', 'byrde_ga_id');
	
	// Add section
	add_settings_section(
		'byrde_tracking_section',
		'Tracking Settings',
		'byrde_tracking_section_callback',
		'byrde-tracking-settings'
	);
	
	// GTM field
	add_settings_field(
		'byrde_gtm_id',
		'Google Tag Manager ID',
		'byrde_gtm_field_callback',
		'byrde-tracking-settings',
		'byrde_tracking_section'
	);
	
	// Google Analytics field
	add_settings_field(
		'byrde_ga_id',
		'Google Analytics ID',
		'byrde_ga_field_callback',
		'byrde-tracking-settings',
		'byrde_tracking_section'
	);
	
	// Google Ads field
	add_settings_field(
		'byrde_google_ads_id',
		'Google Ads Conversion ID',
		'byrde_google_ads_field_callback',
		'byrde-tracking-settings',
		'byrde_tracking_section'
	);
	
	// Meta Pixel field
	add_settings_field(
		'byrde_meta_pixel_id',
		'Meta (Facebook) Pixel ID',
		'byrde_meta_pixel_field_callback',
		'byrde-tracking-settings',
		'byrde_tracking_section'
	);
}

// Section callback
function byrde_tracking_section_callback() {
	echo '<p>Configure tracking IDs. GTM (Google Tag Manager) is recommended - configure Meta Pixel and Google Ads through GTM.</p>';
}

// Google Ads field callback
function byrde_google_ads_field_callback() {
	$value = get_option('byrde_google_ads_id', '');
	?>
	<input 
		type="text" 
		name="byrde_google_ads_id" 
		value="<?php echo esc_attr($value); ?>" 
		class="regular-text"
		placeholder="AW-XXXXXXXXXX"
	>
	<p class="description">
		Format: AW-XXXXXXXXXX<br>
		Find at: Google Ads > Tools > Conversions
	</p>
	<?php
}

// Meta Pixel field callback
function byrde_meta_pixel_field_callback() {
	$value = get_option('byrde_meta_pixel_id', '');
	?>
	<input 
		type="text" 
		name="byrde_meta_pixel_id" 
		value="<?php echo esc_attr($value); ?>" 
		class="regular-text"
		placeholder="XXXXXXXXXXXXXXX"
	>
	<p class="description">
		Format: Numbers only (15-16 digits)<br>
		Find at: Meta Events Manager > Data Sources > Your Pixel
	</p>
	<?php
}

// GTM field callback
function byrde_gtm_field_callback() {
	$value = get_option('byrde_gtm_id', '');
	?>
	<input 
		type="text" 
		name="byrde_gtm_id" 
		value="<?php echo esc_attr($value); ?>" 
		class="regular-text"
		placeholder="GTM-XXXXXXX"
	>
	<p class="description">
		Format: GTM-XXXXXXX<br>
		Find at: Google Tag Manager > Admin > Container ID
	</p>
	<?php
}

// Google Analytics field callback
function byrde_ga_field_callback() {
	$value = get_option('byrde_ga_id', '');
	?>
	<input 
		type="text" 
		name="byrde_ga_id" 
		value="<?php echo esc_attr($value); ?>" 
		class="regular-text"
		placeholder="G-XXXXXXXXXX or UA-XXXXXXXXX"
	>
	<p class="description">
		Format: G-XXXXXXXXXX (GA4) or UA-XXXXXXXXX (Universal Analytics)<br>
		Find at: Google Analytics > Admin > Property > Property Settings
	</p>
	<?php
}

// Render the page
function byrde_tracking_settings_page() {
	// Check permissions
	if (!current_user_can('manage_options')) {
		return;
	}
	
	// Success message
	if (isset($_GET['settings-updated'])) {
		add_settings_error(
			'byrde_tracking_messages',
			'byrde_tracking_message',
			'Settings saved successfully!',
			'updated'
		);
	}
	
	settings_errors('byrde_tracking_messages');
	?>
	<div class="wrap">
		<h1><?php echo esc_html(get_admin_page_title()); ?></h1>
		
		<form action="options.php" method="post">
			<?php
			settings_fields('byrde_tracking_settings');
			do_settings_sections('byrde-tracking-settings');
		submit_button('Save Settings');
		?>
	</form>
	
	<hr>
	
	<div class="card">
		<h2>How to use</h2>
		<ol>
			<li><strong>Google Tag Manager (Recommended):</strong> Paste the GTM Container ID (ex: GTM-XXXXXXX). Configure all other tags inside GTM.</li>
			<li><strong>Legacy Mode (without GTM):</strong> Add IDs directly:
				<ul>
					<li>Google Analytics ID (ex: G-XXXXXXXXXX or UA-XXXXXXXXX)</li>
					<li>Google Ads Conversion ID (ex: AW-123456789)</li>
					<li>Meta Pixel ID (ex: 123456789012345)</li>
				</ul>
			</li>
			<li>Save the settings</li>
			<li>Tracking codes will load automatically on the site</li>
		</ol>
		
		<div class="notice notice-info inline">
			<p><strong>💡 Tip:</strong> Using GTM is recommended. It allows you to manage all tags (Google Ads, Meta Pixel, Analytics, etc.) from one place without code changes.</p>
		</div>
		
		<h3>Current Status</h3>
		<?php
		$gtm_id = get_option('byrde_gtm_id', '');
		$ga_id = get_option('byrde_ga_id', '');
		$google_ads_id = get_option('byrde_google_ads_id', '');
		$meta_pixel_id = get_option('byrde_meta_pixel_id', '');
		?>
		<ul>
			<li>
				<strong>GTM:</strong> 
				<?php if (!empty($gtm_id)) : ?>
					<span style="color: green;">✓ Configured (<?php echo esc_html($gtm_id); ?>)</span>
				<?php else : ?>
					<span style="color: orange;">⚠ Not configured</span>
				<?php endif; ?>
			</li>
			<li>
				<strong>Google Analytics:</strong> 
				<?php if (!empty($ga_id)) : ?>
					<span style="color: green;">✓ Configured (<?php echo esc_html($ga_id); ?>)</span>
				<?php else : ?>
					<span style="color: orange;">⚠ Not configured</span>
				<?php endif; ?>
			</li>
			<li>
				<strong>Google Ads:</strong> 
				<?php if (!empty($google_ads_id)) : ?>
					<span style="color: green;">✓ Configured (<?php echo esc_html($google_ads_id); ?>)</span>
				<?php else : ?>
					<span style="color: orange;">⚠ Not configured</span>
				<?php endif; ?>
			</li>
			<li>
				<strong>Meta Pixel:</strong> 
				<?php if (!empty($meta_pixel_id)) : ?>
					<span style="color: green;">✓ Configured (<?php echo esc_html($meta_pixel_id); ?>)</span>
				<?php else : ?>
					<span style="color: orange;">⚠ Not configured</span>
				<?php endif; ?>
			</li>
		</ul>
	</div>
</div>
<?php
}
