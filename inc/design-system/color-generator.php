<?php
/**
 * Gerador de escalas de cores
 *
 * @package Byrde
 */

/**
 * Converte HEX para HSL
 *
 * @param string $hex Cor em hexadecimal
 * @return array Array com h, s, l
 */
function byrde_hex_to_hsl($hex) {
	// Remove #
	$hex = ltrim($hex, '#');

	// Converte para RGB
	$r = hexdec(substr($hex, 0, 2)) / 255;
	$g = hexdec(substr($hex, 2, 2)) / 255;
	$b = hexdec(substr($hex, 4, 2)) / 255;

	// Calcula HSL
	$max = max($r, $g, $b);
	$min = min($r, $g, $b);
	$l   = ($max + $min) / 2;

	if ($max === $min) {
		$h = $s = 0; // Cinza
	} else {
		$d = $max - $min;
		$s = $l > 0.5 ? $d / (2 - $max - $min) : $d / ($max + $min);

		switch ($max) {
			case $r:
				$h = (($g - $b) / $d + ($g < $b ? 6 : 0)) / 6;
				break;
			case $g:
				$h = (($b - $r) / $d + 2) / 6;
				break;
			case $b:
				$h = (($r - $g) / $d + 4) / 6;
				break;
		}
	}

	return array(
		'h' => round($h * 360),
		's' => round($s * 100),
		'l' => round($l * 100),
	);
}

/**
 * Converte HSL para HEX
 *
 * @param int $h Hue (0-360)
 * @param int $s Saturation (0-100)
 * @param int $l Lightness (0-100)
 * @return string Cor em hexadecimal
 */
function byrde_hsl_to_hex($h, $s, $l) {
	$h /= 360;
	$s /= 100;
	$l /= 100;

	if ($s === 0) {
		$r = $g = $b = $l;
	} else {
		$q = $l < 0.5 ? $l * (1 + $s) : $l + $s - $l * $s;
		$p = 2 * $l - $q;

		$r = byrde_hue_to_rgb($p, $q, $h + 1 / 3);
		$g = byrde_hue_to_rgb($p, $q, $h);
		$b = byrde_hue_to_rgb($p, $q, $h - 1 / 3);
	}

	return sprintf(
		'#%02x%02x%02x',
		round($r * 255),
		round($g * 255),
		round($b * 255)
	);
}

/**
 * Helper para conversão de hue para RGB
 *
 * @param float $p P value
 * @param float $q Q value
 * @param float $t T value
 * @return float RGB component
 */
function byrde_hue_to_rgb($p, $q, $t) {
	if ($t < 0) {
		$t += 1;
	}
	if ($t > 1) {
		$t -= 1;
	}
	if ($t < 1 / 6) {
		return $p + ($q - $p) * 6 * $t;
	}
	if ($t < 1 / 2) {
		return $q;
	}
	if ($t < 2 / 3) {
		return $p + ($q - $p) * (2 / 3 - $t) * 6;
	}
	return $p;
}

/**
 * Converte HEX para RGB
 *
 * @param string $hex Cor em hexadecimal
 * @return array Array com r, g, b
 */
function byrde_hex_to_rgb($hex) {
	$hex = ltrim($hex, '#');
	return array(
		'r' => hexdec(substr($hex, 0, 2)),
		'g' => hexdec(substr($hex, 2, 2)),
		'b' => hexdec(substr($hex, 4, 2)),
	);
}

/**
 * Gera escala de cores 50-900
 *
 * @param string $base_hex Cor base em hexadecimal
 * @param string $name Nome da cor
 * @return array Array com 9 tonalidades
 */
function byrde_generate_color_scale($base_hex, $name) {
	$hsl = byrde_hex_to_hsl($base_hex);

	// Mapa de lightness para cada tonalidade
	$lightness_map = array(
		50  => 95,
		100 => 90,
		200 => 80,
		300 => 70,
		400 => 60,
		500 => $hsl['l'], // Cor base
		600 => 40,
		700 => 30,
		800 => 20,
		900 => 10,
	);

	$scale = array();
	foreach ($lightness_map as $shade => $lightness) {
		$hex = byrde_hsl_to_hex($hsl['h'], $hsl['s'], $lightness);
		$rgb = byrde_hex_to_rgb($hex);

		$scale[ $shade ] = array(
			'hex' => $hex,
			'rgb' => "{$rgb['r']}, {$rgb['g']}, {$rgb['b']}",
		);
	}

	return $scale;
}

/**
 * Calcula cor de texto acessível (WCAG AA)
 *
 * @param string $bg_hex Cor de fundo em hexadecimal
 * @return string Cor de texto recomendada
 */
function byrde_calculate_contrast_text($bg_hex) {
	$rgb = byrde_hex_to_rgb($bg_hex);

	// Luminância relativa (WCAG)
	$r = $rgb['r'] / 255;
	$g = $rgb['g'] / 255;
	$b = $rgb['b'] / 255;

	$r = $r <= 0.03928 ? $r / 12.92 : pow(($r + 0.055) / 1.055, 2.4);
	$g = $g <= 0.03928 ? $g / 12.92 : pow(($g + 0.055) / 1.055, 2.4);
	$b = $b <= 0.03928 ? $b / 12.92 : pow(($b + 0.055) / 1.055, 2.4);

	$luminance = 0.2126 * $r + 0.7152 * $g + 0.0722 * $b;

	// Se luminância > 0.5, usar texto escuro, senão claro
	return $luminance > 0.5 ? '#1e293b' : '#ffffff';
}
