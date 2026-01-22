<?php
/**
 * Mapeamento de tokens semânticos
 *
 * @package Byrde
 */

/**
 * Retorna mapeamento de tokens semânticos
 *
 * Define como as escalas de cores geradas devem ser mapeadas
 * para casos de uso específicos no design system.
 *
 * @return array Array de mapeamentos token => escala
 */
function byrde_get_semantic_token_map() {
	return array(
		// Backgrounds principais
		'color-bg-primary'   => 'primary-600',
		'color-bg-secondary' => 'secondary-500',
		'color-bg-accent'    => 'accent-500',
		'color-bg-body'      => 'neutral-50',
		'color-bg-surface'   => 'neutral-100',

		// Texto
		'color-text-primary'   => 'neutral-900',
		'color-text-secondary' => 'neutral-700',
		'color-text-muted'     => 'neutral-500',
		'color-text-inverse'   => 'neutral-50',

		// Bordas
		'color-border-default'  => 'neutral-200',
		'color-border-emphasis' => 'neutral-300',
		'color-border-inverse'  => 'neutral-800', // Para fundos escuros

		// Links
		'color-link-default' => 'secondary-500',
		'color-link-hover'   => 'secondary-600',
		'color-link-inverse' => 'accent-200', // Para fundos escuros

		// Estados semânticos - Success
		'color-success-bg'     => 'success-100',
		'color-success-text'   => 'success-800',
		'color-success-border' => 'success-500',

		// Estados semânticos - Warning
		'color-warning-bg'     => 'warning-100',
		'color-warning-text'   => 'warning-800',
		'color-warning-border' => 'warning-500',

		// Estados semânticos - Error
		'color-error-bg'     => 'error-100',
		'color-error-text'   => 'error-800',
		'color-error-border' => 'error-500',

		// Estados semânticos - Info
		'color-info-bg'     => 'info-100',
		'color-info-text'   => 'info-800',
		'color-info-border' => 'info-500',

		// Sombras (RGB para rgba)
		'shadow-sm-rgb' => 'neutral-900-rgb',
		'shadow-md-rgb' => 'neutral-900-rgb',
		'shadow-lg-rgb' => 'neutral-900-rgb',

		// Overlays
		'color-overlay-light' => 'rgba(255, 255, 255, 0.1)',
		'color-overlay-dark'  => 'rgba(0, 0, 0, 0.1)',

		// Especiais
		'color-google-star' => 'warning-500',
	);
}
