<?php
/**
 * Admin Settings Page
 *
 * Creates a WordPress admin page for global theme settings
 * (replacement for ACF options page)
 *
 * @package Byrde
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Add Theme Settings menu to WordPress admin
 */
function byrde_add_settings_menu(): void {
	add_menu_page(
		'Theme Settings',           // Page title
		'Theme Settings',           // Menu title
		'manage_options',           // Capability
		'byrde-theme-settings',  // Menu slug
		'byrde_render_settings_page', // Callback
		'dashicons-admin-generic',  // Icon
		30                          // Position
	);
}
add_action( 'admin_menu', 'byrde_add_settings_menu' );

/**
 * Render the settings page
 */
function byrde_render_settings_page(): void {
	// Check permissions
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( 'Unauthorized', 403 );
	}

	// Get settings
	$settings = byrde_get_all_settings();
	?>
	<!DOCTYPE html>
	<html>
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Theme Settings</title>
		<style>
			body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 0; background: #f0f0f1; }
			.settings-wrap { max-width: 1200px; margin: 0 auto; padding: 40px 20px; }
			.settings-header { background: #fff; padding: 20px 30px; margin-bottom: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
			.settings-header h1 { margin: 0 0 10px 0; font-size: 24px; color: #1d2327; }
			.settings-header p { margin: 0; color: #646970; font-size: 14px; }
			.settings-card { background: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
			.notice { padding: 15px; margin-bottom: 20px; border-left: 4px solid #2271b1; background: #fff; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
			.notice.success { border-left-color: #00a32a; }
			.notice.error { border-left-color: #d63638; }
			.notice strong { display: block; margin-bottom: 5px; font-size: 14px; }
			.notice p { margin: 0; font-size: 13px; color: #646970; }
			.editor-link { display: inline-block; padding: 12px 24px; background: #2271b1; color: #fff; text-decoration: none; border-radius: 4px; font-weight: 500; transition: background 0.15s; }
			.editor-link:hover { background: #135e96; color: #fff; }
			.features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-top: 30px; }
			.feature-card { padding: 20px; border: 1px solid #dcdcde; border-radius: 6px; background: #f6f7f7; }
			.feature-card h3 { margin: 0 0 10px 0; font-size: 16px; color: #1d2327; }
			.feature-card ul { margin: 0; padding-left: 20px; color: #646970; font-size: 14px; }
			.feature-card ul li { margin-bottom: 5px; }
			.instructions { background: #f0f6fc; border: 1px solid #c5d9ed; padding: 20px; border-radius: 6px; margin-bottom: 30px; }
			.instructions h2 { margin: 0 0 15px 0; font-size: 18px; color: #1d2327; }
			.instructions ol { margin: 0; padding-left: 20px; color: #3c434a; }
			.instructions ol li { margin-bottom: 8px; }
			.instructions code { background: #fff; padding: 2px 6px; border-radius: 3px; font-size: 13px; color: #d63638; }
		</style>
	</head>
	<body>
		<div class="settings-wrap">
			<div class="settings-header">
				<h1>🎨 Theme Settings</h1>
				<p>Configure logo, contact info, social media, SEO, analytics, and more.</p>
			</div>

			<div class="notice success">
				<strong>✅ Settings Manager Active</strong>
				<p>You can now edit all theme settings using the visual editor. Click the button below to get started!</p>
			</div>

			<div class="settings-card">
				<div class="instructions">
					<h2>📍 How to Edit Settings</h2>
					<ol>
						<li>Click the <strong>"Open Theme Editor"</strong> button below</li>
						<li>In the sidebar, click <strong>"Global Settings"</strong> (first option)</li>
						<li>Upload logo, add phone/email, configure social media, SEO, analytics, etc.</li>
						<li>Click <strong>"Save Global Settings"</strong> when done!</li>
					</ol>
				</div>

				<div style="text-align: center; margin: 30px 0;">
					<?php
					// Get a page to edit (preferably homepage)
					$homepage = get_option( 'page_on_front' );
					if ( ! $homepage ) {
						// Get any published page
						$pages = get_posts( array(
							'post_type'      => 'page',
							'posts_per_page' => 1,
							'post_status'    => 'publish',
						) );
						$homepage = ! empty( $pages ) ? $pages[0]->ID : 0;
					}

					$editor_url = $homepage
						? admin_url( 'admin.php?page=byrde-editor&byrde_page_id=' . $homepage )
						: admin_url( 'admin.php?page=byrde-editor' );
					?>
					<a href="<?php echo esc_url( $editor_url ); ?>" class="editor-link">
						🎨 Open Theme Editor
					</a>
				</div>

				<div class="features-grid">
					<div class="feature-card">
						<h3>🏢 Brand Information</h3>
						<ul>
							<li>Logo upload</li>
							<li>Company phone</li>
							<li>Contact email</li>
						</ul>
					</div>
					<div class="feature-card">
						<h3>⭐ Google Reviews</h3>
						<ul>
							<li>Rating display</li>
							<li>Review count</li>
							<li>Reviews link</li>
						</ul>
					</div>
					<div class="feature-card">
						<h3>💬 Footer Content</h3>
						<ul>
							<li>Tagline & description</li>
							<li>Address</li>
							<li>Business hours</li>
							<li>Copyright text</li>
						</ul>
					</div>
					<div class="feature-card">
						<h3>📱 Social Media</h3>
						<ul>
							<li>Facebook URL</li>
							<li>Instagram URL</li>
							<li>YouTube URL</li>
							<li>Yelp URL</li>
						</ul>
					</div>
					<div class="feature-card">
						<h3>🔍 SEO Settings</h3>
						<ul>
							<li>Site name & tagline</li>
							<li>Meta description</li>
							<li>Keywords</li>
							<li>OG image</li>
						</ul>
					</div>
					<div class="feature-card">
						<h3>📊 Analytics</h3>
						<ul>
							<li>Google Analytics GA4</li>
							<li>Google Tag Manager</li>
							<li>Facebook Pixel</li>
						</ul>
					</div>
					<div class="feature-card">
						<h3>📄 Schema Data</h3>
						<ul>
							<li>Business type</li>
							<li>Address & location</li>
							<li>Opening hours</li>
							<li>Service radius</li>
						</ul>
					</div>
					<div class="feature-card">
						<h3>⚖️ Legal Pages</h3>
						<ul>
							<li>Privacy policy</li>
							<li>Terms & conditions</li>
							<li>Cookie settings</li>
						</ul>
					</div>
				</div>

				<div style="margin-top: 40px; padding: 20px; background: #fcf9e8; border: 1px solid #dba617; border-radius: 6px;">
					<strong style="color: #8a6116;">💡 Note:</strong>
					<p style="margin: 5px 0 0 0; color: #8a6116; font-size: 13px;">
						This replaces the previous ACF options page. All 39 settings fields are now available in the visual Theme Editor with a modern, user-friendly interface.
					</p>
				</div>
			</div>
		</div>
	</body>
	</html>
	<?php
	exit;
}
