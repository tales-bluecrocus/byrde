<?php

namespace Byrde\Admin;

use Byrde\Core\Constants;
use WP_Application_Passwords;

/**
 * MCP Connection Info Page
 *
 * Displays connection details for AI agents (Claude, Cursor, etc.)
 * to connect to the WordPress site via MCP Adapter.
 * Includes one-click token generation via Application Passwords.
 *
 * @package Byrde\Admin
 */
class McpInfo {

	/** User meta key to store the MCP app password UUID. */
	private const META_APP_PASSWORD_UUID = '_byrde_mcp_app_password_uuid';

	/** Application Password name. */
	private const APP_PASSWORD_NAME = 'Byrde MCP';

	/**
	 * Register hooks.
	 */
	public function register(): void {
		add_action( 'admin_menu', [ $this, 'register_page' ] );
		add_action( 'wp_ajax_byrde_mcp_generate_token', [ $this, 'ajax_generate_token' ] );
		add_action( 'wp_ajax_byrde_mcp_revoke_token', [ $this, 'ajax_revoke_token' ] );
	}

	/**
	 * Register submenu page under Landing Pages.
	 */
	public function register_page(): void {
		add_submenu_page(
			'edit.php?post_type=' . Constants::CPT_LANDING,
			__( 'AI Connection (MCP)', 'byrde' ),
			__( 'AI Connection', 'byrde' ),
			'manage_options',
			'byrde-mcp',
			[ $this, 'render_page' ]
		);
	}

	// ─── AJAX: GENERATE TOKEN ────────────────────────────────────────

	/**
	 * Generate a new Application Password for MCP.
	 */
	public function ajax_generate_token(): void {
		check_ajax_referer( 'byrde_mcp_token', '_nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( [ 'message' => __( 'Insufficient permissions.', 'byrde' ) ] );
		}

		$user_id = get_current_user_id();

		// Revoke existing Byrde MCP token if present.
		$this->revoke_existing_token( $user_id );

		// Generate new Application Password.
		$result = WP_Application_Passwords::create_new_application_password(
			$user_id,
			[
				'name'   => self::APP_PASSWORD_NAME,
				'app_id' => 'byrde-mcp',
			]
		);

		if ( is_wp_error( $result ) ) {
			wp_send_json_error( [ 'message' => $result->get_error_message() ] );
		}

		[ $password, $item ] = $result;

		// Store the UUID so we can track/revoke it later.
		update_user_meta( $user_id, self::META_APP_PASSWORD_UUID, $item['uuid'] );

		// Build the config JSON with the real token.
		$config_json = $this->build_config_json( $password );

		wp_send_json_success( [
			'password'    => $password,
			'config_json' => $config_json,
			'created'     => wp_date( get_option( 'date_format' ) . ' ' . get_option( 'time_format' ) ),
		] );
	}

	// ─── AJAX: REVOKE TOKEN ─────────────────────────────────────────

	/**
	 * Revoke the current MCP Application Password.
	 */
	public function ajax_revoke_token(): void {
		check_ajax_referer( 'byrde_mcp_token', '_nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( [ 'message' => __( 'Insufficient permissions.', 'byrde' ) ] );
		}

		$user_id = get_current_user_id();
		$revoked = $this->revoke_existing_token( $user_id );

		if ( $revoked ) {
			wp_send_json_success( [ 'message' => __( 'Token revoked successfully.', 'byrde' ) ] );
		} else {
			wp_send_json_error( [ 'message' => __( 'No active token found.', 'byrde' ) ] );
		}
	}

	// ─── HELPERS ─────────────────────────────────────────────────────

	/**
	 * Revoke existing Byrde MCP app password for a user.
	 *
	 * @return bool Whether a token was revoked.
	 */
	private function revoke_existing_token( int $user_id ): bool {
		$uuid = get_user_meta( $user_id, self::META_APP_PASSWORD_UUID, true );

		if ( $uuid ) {
			WP_Application_Passwords::delete_application_password( $user_id, $uuid );
			delete_user_meta( $user_id, self::META_APP_PASSWORD_UUID );
			return true;
		}

		// Fallback: find by name in case meta was lost.
		$passwords = WP_Application_Passwords::get_user_application_passwords( $user_id );
		foreach ( $passwords as $pw ) {
			if ( $pw['name'] === self::APP_PASSWORD_NAME ) {
				WP_Application_Passwords::delete_application_password( $user_id, $pw['uuid'] );
				return true;
			}
		}

		return false;
	}

	/**
	 * Check if the current user has an active MCP token.
	 *
	 * @return array|null Token info if active, null otherwise.
	 */
	private function get_active_token_info( int $user_id ): ?array {
		$uuid = get_user_meta( $user_id, self::META_APP_PASSWORD_UUID, true );

		if ( ! $uuid ) {
			return null;
		}

		$passwords = WP_Application_Passwords::get_user_application_passwords( $user_id );
		foreach ( $passwords as $pw ) {
			if ( $pw['uuid'] === $uuid ) {
				return [
					'uuid'    => $uuid,
					'created' => $pw['created'],
					'last_used' => $pw['last_used'] ?? null,
				];
			}
		}

		// UUID in meta but password deleted externally — clean up.
		delete_user_meta( $user_id, self::META_APP_PASSWORD_UUID );
		return null;
	}

	/**
	 * Build the MCP config JSON with a real password.
	 */
	private function build_config_json( string $password ): string {
		$site_url = untrailingslashit( get_site_url() );
		$mcp_url  = $site_url . '/wp-json/mcp/mcp-adapter-default-server';
		$user     = wp_get_current_user();

		$config = [
			'mcpServers' => [
				'byrde-wordpress' => [
					'command' => 'npx',
					'args'    => [ '-y', '@automattic/mcp-wordpress-remote@latest' ],
					'env'     => [
						'WP_API_URL'      => $mcp_url,
						'WP_API_USERNAME' => $user->user_login,
						'WP_API_PASSWORD' => $password,
					],
				],
			],
		];

		return wp_json_encode( $config, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES );
	}

	// ─── PAGE RENDER ─────────────────────────────────────────────────

	/**
	 * Render the MCP info page.
	 */
	public function render_page(): void {
		$site_url    = untrailingslashit( get_site_url() );
		$mcp_url     = $site_url . '/wp-json/mcp/mcp-adapter-default-server';
		$has_adapter = is_plugin_active( 'mcp-adapter/mcp-adapter.php' );
		$has_api     = function_exists( 'wp_register_ability' );
		$user        = wp_get_current_user();
		$token_info  = $this->get_active_token_info( $user->ID );
		$nonce       = wp_create_nonce( 'byrde_mcp_token' );

		?>
		<style>
			.byrde-mcp-wrap { max-width: 820px; }
			.byrde-mcp-wrap .card { max-width: 100%; margin-top: 15px; padding: 16px 20px; }
			.byrde-mcp-wrap h2 { margin-top: 0; }
			.byrde-mcp-wrap .byrde-muted { color: #50575e; }
			.byrde-mcp-wrap .byrde-url-box {
				display: flex; align-items: center; gap: 8px;
				background: #1d2327; padding: 12px 16px; border-radius: 6px; margin: 12px 0;
			}
			.byrde-mcp-wrap .byrde-url-box code {
				color: #50fa7b; font-size: 14px; flex: 1; word-break: break-all; background: none; padding: 0;
			}
			.byrde-mcp-wrap .byrde-url-box .button { flex-shrink: 0; }
			.byrde-mcp-wrap .byrde-pre-wrap { position: relative; }
			.byrde-mcp-wrap .byrde-pre-wrap pre {
				background: #1d2327; color: #50fa7b; padding: 16px 20px; border-radius: 6px;
				font-size: 13px; line-height: 1.5; overflow-x: auto; cursor: text;
			}
			.byrde-mcp-wrap .byrde-pre-wrap .button { position: absolute; top: 8px; right: 8px; }
			.byrde-mcp-wrap .byrde-steps { line-height: 2.2; font-size: 13px; }
			.byrde-mcp-wrap .byrde-tab-nav { display: flex; gap: 0; margin-bottom: -1px; position: relative; z-index: 1; }
			.byrde-mcp-wrap .byrde-tab-btn {
				padding: 10px 20px; border: 1px solid #c3c4c7; border-bottom: none; background: #f0f0f1;
				cursor: pointer; font-size: 13px; font-weight: 600; border-radius: 4px 4px 0 0;
			}
			.byrde-mcp-wrap .byrde-tab-btn.active { background: #fff; border-bottom: 1px solid #fff; }
			.byrde-mcp-wrap .byrde-tab-content { border: 1px solid #c3c4c7; padding: 20px; background: #fff; border-radius: 0 4px 4px 4px; }
			.byrde-mcp-wrap .byrde-tab-panel { display: none; }
			.byrde-mcp-wrap .byrde-tab-panel.active { display: block; }
			/* Token section */
			.byrde-token-status {
				display: flex; align-items: center; gap: 12px; padding: 14px 18px;
				background: #f6f7f7; border: 1px solid #c3c4c7; border-radius: 6px; margin: 12px 0;
			}
			.byrde-token-status .byrde-dot {
				width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
			}
			.byrde-token-status .byrde-dot--active { background: #00a32a; }
			.byrde-token-status .byrde-dot--inactive { background: #d63638; }
			.byrde-token-status .byrde-token-meta { flex: 1; font-size: 13px; }
			.byrde-token-status .byrde-token-meta strong { display: block; margin-bottom: 2px; }
			.byrde-token-status .byrde-token-meta .description { color: #50575e; }
			.byrde-token-generated {
				background: #f0f6e8; border: 1px solid #7ab85a; border-radius: 6px;
				padding: 16px 20px; margin: 12px 0;
			}
			.byrde-token-generated .byrde-token-warning {
				color: #826200; font-weight: 600; margin-bottom: 8px;
			}
		</style>

		<div class="wrap byrde-mcp-wrap">
			<h1><?php esc_html_e( 'AI Connection (MCP)', 'byrde' ); ?></h1>
			<p class="byrde-muted" style="font-size: 14px;">
				<?php esc_html_e( 'Connect AI agents to manage your landing pages, settings, and content remotely.', 'byrde' ); ?>
			</p>

			<?php $this->render_status( $has_api, $has_adapter ); ?>

			<?php if ( $has_api && $has_adapter ) : ?>
				<?php $this->render_token_section( $token_info, $nonce, $mcp_url ); ?>
				<?php $this->render_connection_methods( $mcp_url, $user->user_login, $token_info ); ?>
				<?php $this->render_abilities_table(); ?>
			<?php endif; ?>
		</div>

		<script>
		(function() {
			var nonce = <?php echo wp_json_encode( $nonce ); ?>;

			// Tab switching
			document.querySelectorAll('.byrde-tab-btn').forEach(function(btn) {
				btn.addEventListener('click', function() {
					var group = this.closest('.byrde-tabs');
					group.querySelectorAll('.byrde-tab-btn').forEach(function(b) { b.classList.remove('active'); });
					group.querySelectorAll('.byrde-tab-panel').forEach(function(p) { p.classList.remove('active'); });
					this.classList.add('active');
					group.querySelector('#' + this.dataset.tab).classList.add('active');
				});
			});

			// Copy to clipboard
			window.byrdeCopy = function(id) {
				var el = document.getElementById(id);
				navigator.clipboard.writeText(el.textContent.trim()).then(function() {
					var btn = event.target;
					var orig = btn.textContent;
					btn.textContent = <?php echo wp_json_encode( __( 'Copied!', 'byrde' ) ); ?>;
					setTimeout(function() { btn.textContent = orig; }, 2000);
				});
			};

			// Generate Token
			var generateBtn = document.getElementById('byrde-generate-token');
			if (generateBtn) {
				generateBtn.addEventListener('click', function() {
					var btn = this;
					btn.disabled = true;
					btn.textContent = <?php echo wp_json_encode( __( 'Generating...', 'byrde' ) ); ?>;

					var formData = new FormData();
					formData.append('action', 'byrde_mcp_generate_token');
					formData.append('_nonce', nonce);

					fetch(ajaxurl, { method: 'POST', body: formData })
						.then(function(r) { return r.json(); })
						.then(function(res) {
							if (res.success) {
								// Show generated token section
								var tokenArea = document.getElementById('byrde-token-area');
								tokenArea.innerHTML = '<div class="byrde-token-generated">' +
									'<p class="byrde-token-warning">&#9888; ' + <?php echo wp_json_encode( __( 'Copy the config below now — the token will not be shown again!', 'byrde' ) ); ?> + '</p>' +
									'<div class="byrde-pre-wrap">' +
									'<pre id="byrde-generated-config">' + escHtml(res.data.config_json) + '</pre>' +
									'<button type="button" class="button button-small" onclick="byrdeCopy(\'byrde-generated-config\')">' + <?php echo wp_json_encode( __( 'Copy', 'byrde' ) ); ?> + '</button>' +
									'</div>' +
									'</div>';

								// Update status
								var statusArea = document.getElementById('byrde-token-status');
								statusArea.innerHTML = '<div class="byrde-dot byrde-dot--active"></div>' +
									'<div class="byrde-token-meta">' +
									'<strong>' + <?php echo wp_json_encode( __( 'Token Active', 'byrde' ) ); ?> + '</strong>' +
									'<span class="description">' + <?php echo wp_json_encode( __( 'Created just now', 'byrde' ) ); ?> + '</span>' +
									'</div>';

								// Replace button with revoke
								btn.textContent = <?php echo wp_json_encode( __( 'Revoke Token', 'byrde' ) ); ?>;
								btn.className = 'button button-secondary';
								btn.disabled = false;
								btn.id = 'byrde-revoke-token';
								btn.removeEventListener('click', arguments.callee);
								attachRevoke(btn);

								// Also update config in connection methods tab
								var configPre = document.getElementById('byrde-mcp-config');
								if (configPre) {
									configPre.textContent = res.data.config_json;
								}
							} else {
								alert(res.data.message || <?php echo wp_json_encode( __( 'Error generating token.', 'byrde' ) ); ?>);
								btn.disabled = false;
								btn.textContent = <?php echo wp_json_encode( __( 'Generate Token', 'byrde' ) ); ?>;
							}
						})
						.catch(function() {
							alert(<?php echo wp_json_encode( __( 'Network error. Please try again.', 'byrde' ) ); ?>);
							btn.disabled = false;
							btn.textContent = <?php echo wp_json_encode( __( 'Generate Token', 'byrde' ) ); ?>;
						});
				});
			}

			// Revoke Token
			function attachRevoke(btn) {
				btn.addEventListener('click', function() {
					if (!confirm(<?php echo wp_json_encode( __( 'Revoke this MCP token? Connected AI agents will lose access immediately.', 'byrde' ) ); ?>)) {
						return;
					}

					btn.disabled = true;
					btn.textContent = <?php echo wp_json_encode( __( 'Revoking...', 'byrde' ) ); ?>;

					var formData = new FormData();
					formData.append('action', 'byrde_mcp_revoke_token');
					formData.append('_nonce', nonce);

					fetch(ajaxurl, { method: 'POST', body: formData })
						.then(function(r) { return r.json(); })
						.then(function(res) {
							if (res.success) {
								location.reload();
							} else {
								alert(res.data.message || <?php echo wp_json_encode( __( 'Error revoking token.', 'byrde' ) ); ?>);
								btn.disabled = false;
								btn.textContent = <?php echo wp_json_encode( __( 'Revoke Token', 'byrde' ) ); ?>;
							}
						});
				});
			}

			var revokeBtn = document.getElementById('byrde-revoke-token');
			if (revokeBtn) {
				attachRevoke(revokeBtn);
			}

			function escHtml(str) {
				var div = document.createElement('div');
				div.textContent = str;
				return div.innerHTML;
			}
		})();
		</script>
		<?php
	}

	/**
	 * Render status checks.
	 */
	private function render_status( bool $has_api, bool $has_adapter ): void {
		$all_ok = $has_api && $has_adapter;
		?>
		<div class="card">
			<h2><?php esc_html_e( 'Status', 'byrde' ); ?></h2>
			<table class="widefat striped" style="border: none;">
				<tbody>
					<tr>
						<td style="width: 30px; text-align: center;"><?php echo $has_api ? '&#9989;' : '&#10060;'; ?></td>
						<td><strong><?php esc_html_e( 'Abilities API', 'byrde' ); ?></strong></td>
						<td>
							<?php if ( $has_api ) : ?>
								<?php esc_html_e( 'Active', 'byrde' ); ?>
							<?php else : ?>
								<?php
								printf(
									wp_kses(
										__( 'Not installed. <a href="%s" target="_blank">Download from GitHub</a>', 'byrde' ),
										[ 'a' => [ 'href' => [], 'target' => [] ] ]
									),
									'https://github.com/WordPress/abilities-api'
								);
								?>
							<?php endif; ?>
						</td>
					</tr>
					<tr>
						<td style="text-align: center;"><?php echo $has_adapter ? '&#9989;' : '&#10060;'; ?></td>
						<td><strong><?php esc_html_e( 'MCP Adapter', 'byrde' ); ?></strong></td>
						<td>
							<?php if ( $has_adapter ) : ?>
								<?php esc_html_e( 'Active', 'byrde' ); ?>
							<?php else : ?>
								<?php
								printf(
									wp_kses(
										__( 'Not installed. <a href="%s" target="_blank">Download from GitHub</a>', 'byrde' ),
										[ 'a' => [ 'href' => [], 'target' => [] ] ]
									),
									'https://github.com/developer-jeremylopez/wordpress-mcp-adapter'
								);
								?>
							<?php endif; ?>
						</td>
					</tr>
					<tr>
						<td style="text-align: center;"><?php echo $all_ok ? '&#9989;' : '&#11093;'; ?></td>
						<td><strong><?php esc_html_e( 'Byrde Abilities', 'byrde' ); ?></strong></td>
						<td>
							<?php if ( $all_ok ) : ?>
								<?php esc_html_e( '7 abilities registered', 'byrde' ); ?>
							<?php else : ?>
								<?php esc_html_e( 'Waiting for dependencies above', 'byrde' ); ?>
							<?php endif; ?>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
		<?php
	}

	/**
	 * Render token generation/management section.
	 */
	private function render_token_section( ?array $token_info, string $nonce, string $mcp_url ): void {
		$has_token = ! empty( $token_info );
		?>
		<div class="card">
			<h2><?php esc_html_e( 'MCP Token', 'byrde' ); ?></h2>
			<p class="byrde-muted">
				<?php esc_html_e( 'Generate a secure token for AI agents to authenticate. This creates a dedicated Application Password that can be revoked at any time.', 'byrde' ); ?>
			</p>

			<!-- Token Status -->
			<div class="byrde-token-status" id="byrde-token-status">
				<?php if ( $has_token ) : ?>
					<div class="byrde-dot byrde-dot--active"></div>
					<div class="byrde-token-meta">
						<strong><?php esc_html_e( 'Token Active', 'byrde' ); ?></strong>
						<span class="description">
							<?php
							printf(
								/* translators: %s: date the token was created */
								esc_html__( 'Created %s', 'byrde' ),
								esc_html( wp_date( get_option( 'date_format' ), $token_info['created'] ) )
							);
							if ( ! empty( $token_info['last_used'] ) ) {
								printf(
									/* translators: %s: date the token was last used */
									' &mdash; ' . esc_html__( 'Last used %s', 'byrde' ),
									esc_html( wp_date( get_option( 'date_format' ), $token_info['last_used'] ) )
								);
							}
							?>
						</span>
					</div>
				<?php else : ?>
					<div class="byrde-dot byrde-dot--inactive"></div>
					<div class="byrde-token-meta">
						<strong><?php esc_html_e( 'No Token', 'byrde' ); ?></strong>
						<span class="description">
							<?php esc_html_e( 'Generate a token to connect AI agents.', 'byrde' ); ?>
						</span>
					</div>
				<?php endif; ?>
			</div>

			<!-- Action Button -->
			<p>
				<?php if ( $has_token ) : ?>
					<button type="button" id="byrde-generate-token" class="button button-primary" style="margin-right: 8px;">
						<?php esc_html_e( 'Regenerate Token', 'byrde' ); ?>
					</button>
					<button type="button" id="byrde-revoke-token" class="button button-secondary" style="color: #d63638;">
						<?php esc_html_e( 'Revoke Token', 'byrde' ); ?>
					</button>
				<?php else : ?>
					<button type="button" id="byrde-generate-token" class="button button-primary">
						<?php esc_html_e( 'Generate Token', 'byrde' ); ?>
					</button>
				<?php endif; ?>
			</p>

			<!-- Token output area (populated by JS after generation) -->
			<div id="byrde-token-area"></div>

			<div class="notice notice-warning inline" style="margin: 12px 0 0;">
				<p>
					<?php
					printf(
						wp_kses(
							__( '<strong>Security:</strong> The token is shown only once when generated. It grants the same permissions as your WordPress user. For production, consider creating a dedicated user with <code>Editor</code> role.', 'byrde' ),
							[ 'strong' => [], 'code' => [] ]
						)
					);
					?>
				</p>
			</div>
		</div>
		<?php
	}

	/**
	 * Render connection methods with tabs.
	 */
	private function render_connection_methods( string $mcp_url, string $username, ?array $token_info ): void {
		$placeholder = $token_info ? __( 'USE_TOKEN_FROM_ABOVE', 'byrde' ) : __( 'YOUR_APPLICATION_PASSWORD', 'byrde' );

		$config = [
			'mcpServers' => [
				'byrde-wordpress' => [
					'command' => 'npx',
					'args'    => [ '-y', '@automattic/mcp-wordpress-remote@latest' ],
					'env'     => [
						'WP_API_URL'      => $mcp_url,
						'WP_API_USERNAME' => $username,
						'WP_API_PASSWORD' => $placeholder,
					],
				],
			],
		];
		$config_json = wp_json_encode( $config, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES );

		?>
		<div class="card">
			<h2><?php esc_html_e( 'How to Connect', 'byrde' ); ?></h2>

			<div class="byrde-tabs">
				<div class="byrde-tab-nav">
					<button type="button" class="byrde-tab-btn active" data-tab="tab-claude-desktop">
						<?php esc_html_e( 'Claude Desktop / Code', 'byrde' ); ?>
					</button>
					<button type="button" class="byrde-tab-btn" data-tab="tab-claude-web">
						<?php esc_html_e( 'Claude.ai (Web)', 'byrde' ); ?>
					</button>
				</div>

				<div class="byrde-tab-content">
					<!-- Claude Desktop / Code (primary tab now) -->
					<div id="tab-claude-desktop" class="byrde-tab-panel active">
						<p class="byrde-muted">
							<?php esc_html_e( 'For Claude Desktop app or Claude Code CLI. Requires Node.js installed.', 'byrde' ); ?>
						</p>

						<h3><?php esc_html_e( 'Step 1: Generate Token', 'byrde' ); ?></h3>
						<p class="byrde-muted">
							<?php
							if ( $token_info ) {
								esc_html_e( 'You already have an active token. Click "Regenerate Token" above if you need a new one.', 'byrde' );
							} else {
								esc_html_e( 'Click "Generate Token" above to create a secure connection token.', 'byrde' );
							}
							?>
						</p>

						<h3><?php esc_html_e( 'Step 2: Add to Config File', 'byrde' ); ?></h3>
						<p class="byrde-muted">
							<?php
							printf(
								wp_kses(
									__( 'Copy the JSON config (shown after generating) into:<br><strong>Mac:</strong> <code>~/Library/Application Support/Claude/claude_desktop_config.json</code><br><strong>Windows:</strong> <code>%%APPDATA%%\\Claude\\claude_desktop_config.json</code><br><strong>Claude Code (VS Code):</strong> <code>.mcp.json</code> in your project root', 'byrde' ),
									[ 'br' => [], 'strong' => [], 'code' => [] ]
								)
							);
							?>
						</p>
						<div class="byrde-pre-wrap">
							<pre id="byrde-mcp-config"><?php echo esc_html( $config_json ); ?></pre>
							<button type="button" class="button button-small" onclick="byrdeCopy('byrde-mcp-config')">
								<?php esc_html_e( 'Copy', 'byrde' ); ?>
							</button>
						</div>

						<div class="notice notice-info inline" style="margin: 12px 0 0;">
							<p>
								<?php
								printf(
									wp_kses(
										__( '<strong>Tip:</strong> After generating the token, the config above will be updated with your real credentials — just copy and paste. Then restart Claude Desktop.', 'byrde' ),
										[ 'strong' => [] ]
									)
								);
								?>
							</p>
						</div>
					</div>

					<!-- Claude.ai Web Connector -->
					<div id="tab-claude-web" class="byrde-tab-panel">
						<p class="byrde-muted">
							<?php esc_html_e( 'Connect directly from your Claude.ai account. Requires your site to be publicly accessible (not localhost).', 'byrde' ); ?>
						</p>

						<h3><?php esc_html_e( 'MCP Server URL', 'byrde' ); ?></h3>
						<div class="byrde-url-box">
							<code id="byrde-mcp-url"><?php echo esc_html( $mcp_url ); ?></code>
							<button type="button" class="button button-small" onclick="byrdeCopy('byrde-mcp-url')">
								<?php esc_html_e( 'Copy', 'byrde' ); ?>
							</button>
						</div>

						<h3><?php esc_html_e( 'Steps', 'byrde' ); ?></h3>
						<ol class="byrde-steps">
							<li>
								<?php esc_html_e( 'Generate a token using the button above', 'byrde' ); ?>
							</li>
							<li>
								<?php
								printf(
									wp_kses(
										__( 'Go to <a href="%s" target="_blank"><strong>claude.ai/settings/connectors</strong></a>', 'byrde' ),
										[ 'a' => [ 'href' => [], 'target' => [] ], 'strong' => [] ]
									),
									'https://claude.ai/settings/connectors'
								);
								?>
							</li>
							<li>
								<?php
								printf(
									wp_kses(
										__( 'Click <strong>"Add custom connector"</strong> and paste the URL above', 'byrde' ),
										[ 'strong' => [] ]
									)
								);
								?>
							</li>
							<li><?php esc_html_e( 'When prompted, use your WordPress username and the generated token as password', 'byrde' ); ?></li>
						</ol>

						<div class="notice notice-warning inline" style="margin: 12px 0 0;">
							<p>
								<?php
								printf(
									wp_kses(
										__( '<strong>Note:</strong> Claude.ai connectors require a publicly accessible URL. Local development environments (localhost, .lndo.site) will not work. Use <strong>Claude Desktop / Code</strong> for local development.', 'byrde' ),
										[ 'strong' => [] ]
									)
								);
								?>
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
		<?php
	}

	/**
	 * Render abilities table.
	 */
	private function render_abilities_table(): void {
		$abilities = [
			[ 'byrde/get-settings', __( 'Read all plugin settings', 'byrde' ), __( 'Public', 'byrde' ) ],
			[ 'byrde/update-settings', __( 'Update plugin settings (partial merge)', 'byrde' ), 'manage_options' ],
			[ 'byrde/list-pages', __( 'List all landing pages', 'byrde' ), 'edit_posts' ],
			[ 'byrde/get-page', __( 'Get full page data (theme + content)', 'byrde' ), 'edit_posts' ],
			[ 'byrde/update-page-theme', __( 'Update page color/palette config (deep merge)', 'byrde' ), 'edit_posts' ],
			[ 'byrde/update-page-content', __( 'Update section content (deep merge)', 'byrde' ), 'edit_posts' ],
			[ 'byrde/save-page', __( 'Atomic save (theme + content, deep merge)', 'byrde' ), 'edit_posts' ],
		];
		?>
		<div class="card">
			<h2><?php esc_html_e( 'Available Abilities', 'byrde' ); ?></h2>
			<p class="byrde-muted">
				<?php esc_html_e( 'These are the tools that AI agents can use when connected:', 'byrde' ); ?>
			</p>
			<table class="widefat striped">
				<thead>
					<tr>
						<th><?php esc_html_e( 'Ability', 'byrde' ); ?></th>
						<th><?php esc_html_e( 'Description', 'byrde' ); ?></th>
						<th><?php esc_html_e( 'Permission', 'byrde' ); ?></th>
					</tr>
				</thead>
				<tbody>
					<?php foreach ( $abilities as $ability ) : ?>
						<tr>
							<td><code><?php echo esc_html( $ability[0] ); ?></code></td>
							<td><?php echo esc_html( $ability[1] ); ?></td>
							<td><code><?php echo esc_html( $ability[2] ); ?></code></td>
						</tr>
					<?php endforeach; ?>
				</tbody>
			</table>
		</div>
		<?php
	}
}
