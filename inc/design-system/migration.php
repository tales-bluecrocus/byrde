<?php
/**
 * Migração de cores legadas
 *
 * @package Byrde
 */

/**
 * Migra cores do sistema antigo para o novo
 *
 * Mapeia campos de cores antigos (primary_color, secondary_color, etc.)
 * para os novos campos do design system (brand_color_primary, etc.).
 * Executado automaticamente ao ativar o tema.
 */
function byrde_migrate_legacy_colors() {
	// Mapeamento de campos antigos para novos
	$legacy_map = array(
		'primary_color'     => 'brand_color_primary',
		'secondary_color'   => 'brand_color_secondary',
		'alternative_color' => 'brand_color_accent',
	);

	foreach ($legacy_map as $old => $new) {
		$old_value = get_field($old, 'option');

		// Se o campo antigo tem valor e o novo não tem, migrar
		if ($old_value && ! get_field($new, 'option')) {
			update_field($new, $old_value, 'option');
		}
	}
}

// Hook para executar uma vez ao ativar tema
add_action('after_switch_theme', 'byrde_migrate_legacy_colors');
