<?php

namespace Byrde\Admin;

use Byrde\Core\Constants;

/**
 * MCP Connection Info Page
 *
 * Displays connection details for AI agents (Claude, Cursor, etc.)
 * to connect to the WordPress site via MCP Adapter.
 *
 * @package Byrde\Admin
 */
class McpInfo {

	/**
	 * Register hooks.
	 */
	public function register(): void {
		add_action( 'admin_menu', [ $this, 'register_page' ] );
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

	/**
	 * Render the MCP info page.
	 */
	public function render_page(): void {
		$site_url    = untrailingslashit( get_site_url() );
		$mcp_url     = $site_url . '/wp-json/mcp/mcp-adapter-default-server';
		$has_adapter = is_plugin_active( 'mcp-adapter/mcp-adapter.php' );
		$has_api     = function_exists( 'wp_register_ability' );
		$user        = wp_get_current_user();
		$profile_url = get_edit_profile_url( $user->ID ) . '#application-passwords-section';

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
			.byrde-mcp-wrap .byrde-steps img { vertical-align: middle; margin: 0 4px; }
			.byrde-mcp-wrap .byrde-tab-nav { display: flex; gap: 0; margin-bottom: -1px; position: relative; z-index: 1; }
			.byrde-mcp-wrap .byrde-tab-btn {
				padding: 10px 20px; border: 1px solid #c3c4c7; border-bottom: none; background: #f0f0f1;
				cursor: pointer; font-size: 13px; font-weight: 600; border-radius: 4px 4px 0 0;
			}
			.byrde-mcp-wrap .byrde-tab-btn.active { background: #fff; border-bottom: 1px solid #fff; }
			.byrde-mcp-wrap .byrde-tab-content { border: 1px solid #c3c4c7; padding: 20px; background: #fff; border-radius: 0 4px 4px 4px; }
			.byrde-mcp-wrap .byrde-tab-panel { display: none; }
			.byrde-mcp-wrap .byrde-tab-panel.active { display: block; }
		</style>

		<div class="wrap byrde-mcp-wrap">
			<h1><?php esc_html_e( 'AI Connection (MCP)', 'byrde' ); ?></h1>
			<p class="byrde-muted" style="font-size: 14px;">
				<?php esc_html_e( 'Connect AI agents to manage your landing pages, settings, and content remotely.', 'byrde' ); ?>
			</p>

			<?php $this->render_status( $has_api, $has_adapter ); ?>

			<?php if ( $has_api && $has_adapter ) : ?>
				<?php $this->render_connection_methods( $mcp_url, $user->user_login, $profile_url ); ?>
				<?php $this->render_app_password_guide( $profile_url ); ?>
				<?php $this->render_abilities_table(); ?>
			<?php endif; ?>
		</div>

		<script>
		document.addEventListener('DOMContentLoaded', function() {
			document.querySelectorAll('.byrde-tab-btn').forEach(function(btn) {
				btn.addEventListener('click', function() {
					var group = this.closest('.byrde-tabs');
					group.querySelectorAll('.byrde-tab-btn').forEach(function(b) { b.classList.remove('active'); });
					group.querySelectorAll('.byrde-tab-panel').forEach(function(p) { p.classList.remove('active'); });
					this.classList.add('active');
					group.querySelector('#' + this.dataset.tab).classList.add('active');
				});
			});
		});
		function byrdeCopy(id) {
			var el = document.getElementById(id);
			navigator.clipboard.writeText(el.textContent.trim()).then(function() {
				var btn = event.target;
				var orig = btn.textContent;
				btn.textContent = '<?php esc_html_e( 'Copied!', 'byrde' ); ?>';
				setTimeout(function() { btn.textContent = orig; }, 2000);
			});
		}
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
	 * Render connection methods with tabs.
	 */
	private function render_connection_methods( string $mcp_url, string $username, string $profile_url ): void {
		$config = [
			'mcpServers' => [
				'byrde-wordpress' => [
					'command' => 'npx',
					'args'    => [ '-y', '@automattic/mcp-wordpress-remote@latest' ],
					'env'     => [
						'WP_API_URL'      => $mcp_url,
						'WP_API_USERNAME' => $username,
						'WP_API_PASSWORD' => 'YOUR_APPLICATION_PASSWORD',
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
					<button type="button" class="byrde-tab-btn active" data-tab="tab-claude-web">
						<?php esc_html_e( 'Claude.ai (Web)', 'byrde' ); ?>
					</button>
					<button type="button" class="byrde-tab-btn" data-tab="tab-claude-desktop">
						<?php esc_html_e( 'Claude Desktop / Code', 'byrde' ); ?>
					</button>
				</div>

				<!-- Claude.ai Web Connector -->
				<div class="byrde-tab-content">
					<div id="tab-claude-web" class="byrde-tab-panel active">
						<p class="byrde-muted">
							<?php esc_html_e( 'The simplest method. Connect directly from your Claude.ai account in 3 steps.', 'byrde' ); ?>
						</p>

						<h3><?php esc_html_e( 'Step 1: Copy the MCP Server URL', 'byrde' ); ?></h3>
						<div class="byrde-url-box">
							<code id="byrde-mcp-url"><?php echo esc_html( $mcp_url ); ?></code>
							<button type="button" class="button button-small" onclick="byrdeCopy('byrde-mcp-url')">
								<?php esc_html_e( 'Copy', 'byrde' ); ?>
							</button>
						</div>

						<h3><?php esc_html_e( 'Step 2: Add Connector in Claude.ai', 'byrde' ); ?></h3>
						<ol class="byrde-steps">
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
										__( 'Click <strong>"Add custom connector"</strong>', 'byrde' ),
										[ 'strong' => [] ]
									)
								);
								?>
							</li>
							<li>
								<?php
								printf(
									wp_kses(
										__( 'Name: <code>Byrde WordPress</code>', 'byrde' ),
										[ 'code' => [] ]
									)
								);
								?>
							</li>
							<li><?php esc_html_e( 'Paste the MCP Server URL from Step 1', 'byrde' ); ?></li>
							<li>
								<?php
								printf(
									wp_kses(
										__( 'Click <strong>"Add"</strong>', 'byrde' ),
										[ 'strong' => [] ]
									)
								);
								?>
							</li>
						</ol>

						<h3><?php esc_html_e( 'Step 3: Create Application Password', 'byrde' ); ?></h3>
						<p class="byrde-muted">
							<?php
							printf(
								wp_kses(
									__( 'The MCP server requires authentication. Create an <a href="%s"><strong>Application Password</strong></a> in your WordPress profile (see instructions below).', 'byrde' ),
									[ 'a' => [ 'href' => [] ], 'strong' => [] ]
								),
								esc_url( $profile_url )
							);
							?>
						</p>

						<div class="notice notice-info inline" style="margin: 12px 0 0;">
							<p>
								<?php
								printf(
									wp_kses(
										__( '<strong>Note:</strong> Claude.ai connectors support OAuth authentication. The MCP Adapter currently uses Application Passwords (Basic Auth). If the connector asks for OAuth credentials, use the <strong>Claude Desktop / Code</strong> method instead.', 'byrde' ),
										[ 'strong' => [] ]
									)
								);
								?>
							</p>
						</div>
					</div>

					<!-- Claude Desktop / Code -->
					<div id="tab-claude-desktop" class="byrde-tab-panel">
						<p class="byrde-muted">
							<?php esc_html_e( 'For Claude Desktop app or Claude Code CLI. Requires Node.js installed on your machine.', 'byrde' ); ?>
						</p>

						<h3><?php esc_html_e( 'Step 1: Create Application Password', 'byrde' ); ?></h3>
						<p class="byrde-muted">
							<?php
							printf(
								wp_kses(
									__( 'Create an <a href="%s"><strong>Application Password</strong></a> in your WordPress profile (see instructions below).', 'byrde' ),
									[ 'a' => [ 'href' => [] ], 'strong' => [] ]
								),
								esc_url( $profile_url )
							);
							?>
						</p>

						<h3><?php esc_html_e( 'Step 2: Add to Config File', 'byrde' ); ?></h3>
						<p class="byrde-muted">
							<?php
							printf(
								wp_kses(
									__( 'Copy the JSON below into your config file:<br><strong>Mac:</strong> <code>~/Library/Application Support/Claude/claude_desktop_config.json</code><br><strong>Windows:</strong> <code>%%APPDATA%%\\Claude\\claude_desktop_config.json</code>', 'byrde' ),
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
										__( '<strong>Important:</strong> Replace <code>YOUR_APPLICATION_PASSWORD</code> with the password from Step 1. Then restart Claude Desktop.', 'byrde' ),
										[ 'strong' => [], 'code' => [] ]
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
	 * Render Application Password guide.
	 */
	private function render_app_password_guide( string $profile_url ): void {
		?>
		<div class="card">
			<h2><?php esc_html_e( 'How to Create an Application Password', 'byrde' ); ?></h2>
			<p class="byrde-muted">
				<?php esc_html_e( 'Application Passwords let AI agents authenticate without your main WordPress password. They can be revoked at any time.', 'byrde' ); ?>
			</p>
			<ol class="byrde-steps">
				<li>
					<?php
					printf(
						wp_kses(
							__( 'Go to <a href="%s"><strong>Users &rarr; Profile</strong></a>', 'byrde' ),
							[ 'a' => [ 'href' => [] ], 'strong' => [] ]
						),
						esc_url( $profile_url )
					);
					?>
				</li>
				<li><?php esc_html_e( 'Scroll down to "Application Passwords"', 'byrde' ); ?></li>
				<li>
					<?php
					printf(
						wp_kses(
							__( 'Enter a name (e.g., <code>Claude AI</code>) and click <strong>"Add New Application Password"</strong>', 'byrde' ),
							[ 'code' => [], 'strong' => [] ]
						)
					);
					?>
				</li>
				<li>
					<?php
					printf(
						wp_kses(
							__( 'Copy the generated password — it looks like: <code>xxxx xxxx xxxx xxxx xxxx xxxx</code>', 'byrde' ),
							[ 'code' => [] ]
						)
					);
					?>
				</li>
				<li>
					<?php
					printf(
						wp_kses(
							__( '<strong>Save it now!</strong> WordPress will not show it again.', 'byrde' ),
							[ 'strong' => [] ]
						)
					);
					?>
				</li>
			</ol>

			<div class="notice notice-warning inline" style="margin: 12px 0 0;">
				<p>
					<?php
					printf(
						wp_kses(
							__( '<strong>Security tip:</strong> For production, create a dedicated WordPress user with only <code>Editor</code> role instead of using your admin account.', 'byrde' ),
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
	 * Render abilities table.
	 */
	private function render_abilities_table(): void {
		$abilities = [
			[ 'byrde/get-settings', __( 'Read all plugin settings', 'byrde' ), __( 'Public', 'byrde' ) ],
			[ 'byrde/update-settings', __( 'Update plugin settings (partial merge)', 'byrde' ), 'manage_options' ],
			[ 'byrde/list-pages', __( 'List all landing pages', 'byrde' ), 'edit_posts' ],
			[ 'byrde/get-page', __( 'Get full page data (theme + content)', 'byrde' ), 'edit_posts' ],
			[ 'byrde/update-page-theme', __( 'Update page color/palette config', 'byrde' ), 'edit_posts' ],
			[ 'byrde/update-page-content', __( 'Update section content (partial merge)', 'byrde' ), 'edit_posts' ],
			[ 'byrde/save-page', __( 'Atomic save (theme + content)', 'byrde' ), 'edit_posts' ],
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
