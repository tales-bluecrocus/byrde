<?php
/**
 * Input Validation & Sanitization
 *
 * Security functions to validate and sanitize data before saving to database.
 * Prevents injection attacks, data corruption, and DoS via large payloads.
 *
 * @package Byrde
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Validate color hex code
 *
 * @param string $color Color value to validate.
 * @return bool
 */
function byrde_is_valid_color( string $color ): bool {
	return (bool) preg_match( '/^#[0-9A-Fa-f]{6}$/', $color );
}

/**
 * Validate theme config structure
 *
 * @param array $config Theme configuration array.
 * @return array Array of error messages (empty if valid).
 */
function byrde_validate_theme_config( array $config ): array {
	$errors = array();

	// Check overall structure
	if ( ! is_array( $config ) ) {
		$errors[] = 'Config must be an array';
		return $errors;
	}

	// Validate global.brand colors
	if ( isset( $config['global']['brand'] ) && is_array( $config['global']['brand'] ) ) {
		$brand = $config['global']['brand'];

		if ( ! empty( $brand['primary'] ) && ! byrde_is_valid_color( $brand['primary'] ) ) {
			$errors[] = 'Invalid primary color format (must be #RRGGBB)';
		}

		if ( ! empty( $brand['accent'] ) && ! byrde_is_valid_color( $brand['accent'] ) ) {
			$errors[] = 'Invalid accent color format (must be #RRGGBB)';
		}

		if ( ! empty( $brand['mode'] ) && ! in_array( $brand['mode'], array( 'light', 'dark' ), true ) ) {
			$errors[] = 'Invalid brand mode (must be "light" or "dark")';
		}
	}

	// Validate logo.bgColor
	if ( isset( $config['global']['logo']['bgColor'] ) ) {
		$bg_color = $config['global']['logo']['bgColor'];
		if ( ! empty( $bg_color ) && ! byrde_is_valid_color( $bg_color ) ) {
			$errors[] = 'Invalid logo background color';
		}
	}

	// Validate sections
	$allowed_sections = array(
		'topheader',
		'header',
		'hero',
		'services',
		'testimonials',
		'faq',
		'mid-cta',
		'service-areas',
		'footer-cta',
		'featured-testimonial',
		'footer',
	);

	if ( isset( $config['sections'] ) && is_array( $config['sections'] ) ) {
		foreach ( $config['sections'] as $section_id => $section_config ) {
			if ( ! in_array( $section_id, $allowed_sections, true ) ) {
				$errors[] = "Unknown section: $section_id";
			}

			// Validate section colors if override is enabled
			if ( ! empty( $section_config['overrideGlobalColors'] ) ) {
				$color_fields = array( 'bgPrimary', 'bgSecondary', 'textPrimary', 'accent', 'bgImageOverlayColor' );
				foreach ( $color_fields as $field ) {
					if ( ! empty( $section_config[ $field ] ) && ! byrde_is_valid_color( $section_config[ $field ] ) ) {
						$errors[] = "Invalid color in section $section_id: $field";
					}
				}
			}

			// Validate bgImage URL
			if ( ! empty( $section_config['bgImage'] ) && ! filter_var( $section_config['bgImage'], FILTER_VALIDATE_URL ) ) {
				$errors[] = "Invalid background image URL in section $section_id";
			}

			// Validate numeric values
			if ( isset( $section_config['bgImageOpacity'] ) ) {
				$opacity = (float) $section_config['bgImageOpacity'];
				if ( $opacity < 0 || $opacity > 1 ) {
					$errors[] = "Invalid opacity in section $section_id (must be 0-1)";
				}
			}

			// Validate gradient fields
			$gradient_color_fields = array( 'gradientColor1', 'gradientColor2' );
			foreach ( $gradient_color_fields as $field ) {
				if ( ! empty( $section_config[ $field ] ) && $section_config[ $field ] !== 'transparent' && ! byrde_is_valid_color( $section_config[ $field ] ) ) {
					$errors[] = "Invalid gradient color in section $section_id: $field";
				}
			}
			if ( ! empty( $section_config['gradientType'] ) && ! in_array( $section_config['gradientType'], array( 'linear', 'radial' ), true ) ) {
				$errors[] = "Invalid gradient type in section $section_id";
			}
			$location_fields = array( 'gradientLocation1', 'gradientLocation2' );
			foreach ( $location_fields as $field ) {
				if ( isset( $section_config[ $field ] ) ) {
					$loc = (int) $section_config[ $field ];
					if ( $loc < 0 || $loc > 100 ) {
						$errors[] = "Invalid gradient location in section $section_id: $field (must be 0-100)";
					}
				}
			}
			if ( isset( $section_config['gradientAngle'] ) ) {
				$angle = (int) $section_config['gradientAngle'];
				if ( $angle < 0 || $angle > 360 ) {
					$errors[] = "Invalid gradient angle in section $section_id (must be 0-360)";
				}
			}
			if ( ! empty( $section_config['gradientPosition'] ) && ! in_array( $section_config['gradientPosition'], array( 'center', 'top', 'bottom', 'left', 'right' ), true ) ) {
				$errors[] = "Invalid gradient position in section $section_id";
			}

			// Validate form palette mode
			if ( ! empty( $section_config['formPaletteMode'] ) && ! in_array( $section_config['formPaletteMode'], array( 'dark', 'light' ), true ) ) {
				$errors[] = "Invalid form palette mode in section $section_id";
			}
		}
	}

	// Check payload size (prevent DoS)
	$json_size = strlen( wp_json_encode( $config ) );
	if ( $json_size > 524288 ) { // 512KB limit
		$errors[] = 'Theme config payload too large (max 512KB)';
	}

	return $errors;
}

/**
 * Sanitize theme config (recursive)
 *
 * @param mixed $data Data to sanitize.
 * @return mixed Sanitized data.
 */
function byrde_sanitize_theme_config( $data, $depth = 0 ) {
	if ( is_array( $data ) ) {
		$result = array();
		foreach ( $data as $key => $value ) {
			$sanitized = byrde_sanitize_theme_config( $value, $depth + 1 );
			if ( $sanitized !== null ) {
				$result[ $key ] = $sanitized;
			}
		}
		return $result;
	}

	if ( is_string( $data ) ) {
		// Don't use wp_kses_post for config - only plain text
		return sanitize_text_field( $data );
	}

	if ( is_bool( $data ) || is_numeric( $data ) ) {
		return $data;
	}

	if ( is_null( $data ) ) {
		return null;
	}

	// Unknown type - return null for safety
	error_log( '[Sanitize] Rejecting unknown type: ' . gettype( $data ) );
	return null;
}

/**
 * Validate section content
 *
 * @param array $content Section content array.
 * @return array Array of error messages (empty if valid).
 */
function byrde_validate_content( array $content ): array {
	$allowed_sections = array(
		'hero',
		'services',
		'testimonials',
		'faq',
		'mid-cta',
		'service-areas',
		'footer-cta',
		'featured-testimonial',
		'footer',
	);

	$errors = array();

	// Check overall structure
	if ( ! is_array( $content ) ) {
		$errors[] = 'Content must be an array';
		return $errors;
	}

	// Validate section IDs
	foreach ( $content as $section_id => $section_data ) {
		if ( ! in_array( $section_id, $allowed_sections, true ) ) {
			$errors[] = "Unknown section: $section_id";
		}

		// Section data must be an array
		if ( ! is_array( $section_data ) ) {
			$errors[] = "Section $section_id must be an array";
		}
	}

	// Check payload size (prevent DoS)
	$json_size = strlen( wp_json_encode( $content ) );
	if ( $json_size > 1048576 ) { // 1MB limit
		$errors[] = 'Content payload too large (max 1MB)';
	}

	// Validate specific section structures
	if ( isset( $content['services']['services'] ) && is_array( $content['services']['services'] ) ) {
		if ( count( $content['services']['services'] ) > 50 ) {
			$errors[] = 'Too many services (max 50)';
		}
	}

	if ( isset( $content['testimonials']['testimonials'] ) && is_array( $content['testimonials']['testimonials'] ) ) {
		if ( count( $content['testimonials']['testimonials'] ) > 100 ) {
			$errors[] = 'Too many testimonials (max 100)';
		}
	}

	if ( isset( $content['faq']['faqs'] ) && is_array( $content['faq']['faqs'] ) ) {
		if ( count( $content['faq']['faqs'] ) > 50 ) {
			$errors[] = 'Too many FAQ items (max 50)';
		}
	}

	if ( isset( $content['service-areas']['areas'] ) && is_array( $content['service-areas']['areas'] ) ) {
		if ( count( $content['service-areas']['areas'] ) > 100 ) {
			$errors[] = 'Too many service areas (max 100)';
		}
	}

	return $errors;
}

/**
 * Sanitize content (recursive)
 *
 * Uses wp_kses with limited tag allowlist for headline fields (to support
 * <strong> for accent color), and sanitize_textarea_field for everything else.
 *
 * @param mixed  $data Data to sanitize.
 * @param string $key  Current array key (for context-aware sanitization).
 * @return mixed Sanitized data.
 */
function byrde_sanitize_content( $data, string $key = '' ) {
	if ( is_array( $data ) ) {
		$result = array();
		foreach ( $data as $k => $v ) {
			$result[ $k ] = byrde_sanitize_content( $v, (string) $k );
		}
		return $result;
	}

	if ( is_string( $data ) ) {
		// Headline fields may contain <strong> for accent coloring
		if ( $key === 'headline' ) {
			// wp_kses strips unwanted tags but entity-encodes & → &amp;
			// Decode since content goes to JSON context, not HTML
			return wp_specialchars_decode( wp_kses( $data, array( 'strong' => array() ) ), ENT_QUOTES );
		}
		// sanitize_textarea_field strips tags then runs htmlspecialchars (& → &amp;)
		// Decode since content goes to JSON context, not HTML
		return wp_specialchars_decode( sanitize_textarea_field( $data ), ENT_QUOTES );
	}

	if ( is_bool( $data ) || is_numeric( $data ) ) {
		return $data;
	}

	if ( is_null( $data ) ) {
		return null;
	}

	// Unknown type - return null for safety
	return null;
}

/**
 * Validate image upload
 *
 * @param array $file File array from $_FILES.
 * @return true|WP_Error True on success, WP_Error on failure.
 */
function byrde_validate_image_upload( array $file ) {
	// Check file size (5MB max)
	$max_size = 5 * 1024 * 1024; // 5MB in bytes
	if ( $file['size'] > $max_size ) {
		return new WP_Error( 'file_too_large', 'File size exceeds 5MB limit' );
	}

	// Validate file extension using WordPress function (secure)
	$allowed_extensions = array( 'jpg', 'jpeg', 'png', 'gif', 'webp' );
	$filetype           = wp_check_filetype( $file['name'] );

	if ( ! in_array( $filetype['ext'], $allowed_extensions, true ) ) {
		return new WP_Error(
			'invalid_type',
			'Invalid file type. Allowed: ' . implode( ', ', $allowed_extensions )
		);
	}

	// Verify it's actually an image by checking file contents
	$image_info = @getimagesize( $file['tmp_name'] );
	if ( false === $image_info ) {
		return new WP_Error( 'invalid_image', 'File is not a valid image' );
	}

	// Check image dimensions (prevent huge images)
	$max_width  = 3840; // 4K width
	$max_height = 2160; // 4K height
	if ( $image_info[0] > $max_width || $image_info[1] > $max_height ) {
		return new WP_Error(
			'image_too_large',
			"Image dimensions exceed {$max_width}x{$max_height}px"
		);
	}

	return true;
}
