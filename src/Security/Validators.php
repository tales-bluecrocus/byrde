<?php

namespace Byrde\Security;

use Byrde\Core\Constants;

/**
 * Input validation and sanitization for theme config and content.
 */
class Validators {
    public static function is_valid_color( string $color ): bool {
        return (bool) preg_match( '/^#[0-9A-Fa-f]{6}$/', $color );
    }

    /**
     * @return array Array of error messages (empty if valid).
     */
    public static function validate_theme_config( array $config ): array {
        $errors = [];

        if ( ! is_array( $config ) ) {
            $errors[] = 'Config must be an array';
            return $errors;
        }

        // Validate global.brand colors
        if ( isset( $config['global']['brand'] ) && is_array( $config['global']['brand'] ) ) {
            $brand = $config['global']['brand'];

            if ( ! empty( $brand['primary'] ) && ! self::is_valid_color( $brand['primary'] ) ) {
                $errors[] = 'Invalid primary color format (must be #RRGGBB)';
            }

            if ( ! empty( $brand['accent'] ) && ! self::is_valid_color( $brand['accent'] ) ) {
                $errors[] = 'Invalid accent color format (must be #RRGGBB)';
            }

            if ( ! empty( $brand['mode'] ) && ! in_array( $brand['mode'], [ 'light', 'dark' ], true ) ) {
                $errors[] = 'Invalid brand mode (must be "light" or "dark")';
            }
        }

        // Validate logo.bgColor
        if ( isset( $config['global']['logo']['bgColor'] ) ) {
            $bg_color = $config['global']['logo']['bgColor'];
            if ( ! empty( $bg_color ) && ! self::is_valid_color( $bg_color ) ) {
                $errors[] = 'Invalid logo background color';
            }
        }

        // Validate sections
        $allowed_sections = [
            'topheader', 'header', 'hero', 'services', 'testimonials',
            'faq', 'mid-cta', 'service-areas', 'footer-cta',
            'featured-testimonial', 'footer',
        ];

        if ( isset( $config['sections'] ) && is_array( $config['sections'] ) ) {
            foreach ( $config['sections'] as $section_id => $section_config ) {
                if ( ! in_array( $section_id, $allowed_sections, true ) ) {
                    $errors[] = "Unknown section: $section_id";
                }

                if ( ! empty( $section_config['overrideGlobalColors'] ) ) {
                    $color_fields = [ 'bgPrimary', 'bgSecondary', 'textPrimary', 'accent', 'bgImageOverlayColor' ];
                    foreach ( $color_fields as $field ) {
                        if ( ! empty( $section_config[ $field ] ) && ! self::is_valid_color( $section_config[ $field ] ) ) {
                            $errors[] = "Invalid color in section $section_id: $field";
                        }
                    }
                }

                if ( ! empty( $section_config['bgImage'] ) && ! filter_var( $section_config['bgImage'], FILTER_VALIDATE_URL ) ) {
                    $errors[] = "Invalid background image URL in section $section_id";
                }

                if ( isset( $section_config['bgImageOpacity'] ) ) {
                    $opacity = (float) $section_config['bgImageOpacity'];
                    if ( $opacity < 0 || $opacity > 1 ) {
                        $errors[] = "Invalid opacity in section $section_id (must be 0-1)";
                    }
                }

                $gradient_color_fields = [ 'gradientColor1', 'gradientColor2' ];
                foreach ( $gradient_color_fields as $field ) {
                    if ( ! empty( $section_config[ $field ] ) && $section_config[ $field ] !== 'transparent' && ! self::is_valid_color( $section_config[ $field ] ) ) {
                        $errors[] = "Invalid gradient color in section $section_id: $field";
                    }
                }
                if ( ! empty( $section_config['gradientType'] ) && ! in_array( $section_config['gradientType'], [ 'linear', 'radial' ], true ) ) {
                    $errors[] = "Invalid gradient type in section $section_id";
                }
                $location_fields = [ 'gradientLocation1', 'gradientLocation2' ];
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
                if ( ! empty( $section_config['gradientPosition'] ) && ! in_array( $section_config['gradientPosition'], [ 'center', 'top', 'bottom', 'left', 'right' ], true ) ) {
                    $errors[] = "Invalid gradient position in section $section_id";
                }

                if ( ! empty( $section_config['formPaletteMode'] ) && ! in_array( $section_config['formPaletteMode'], [ 'dark', 'light' ], true ) ) {
                    $errors[] = "Invalid form palette mode in section $section_id";
                }
            }
        }

        $json_size = strlen( wp_json_encode( $config ) );
        if ( $json_size > Constants::MAX_THEME_CONFIG_SIZE ) {
            $errors[] = 'Theme config payload too large (max 512KB)';
        }

        return $errors;
    }

    /**
     * Sanitize theme config (recursive).
     *
     * @param mixed $data Data to sanitize.
     * @return mixed Sanitized data.
     */
    public static function sanitize_theme_config( mixed $data, int $depth = 0 ): mixed {
        if ( $depth > 20 ) {
            return null;
        }

        if ( is_array( $data ) ) {
            $result = [];
            foreach ( $data as $key => $value ) {
                $sanitized = self::sanitize_theme_config( $value, $depth + 1 );
                if ( $sanitized !== null ) {
                    $result[ $key ] = $sanitized;
                }
            }
            return $result;
        }

        if ( is_string( $data ) ) {
            return sanitize_text_field( $data );
        }

        if ( is_bool( $data ) || is_numeric( $data ) ) {
            return $data;
        }

        if ( is_null( $data ) ) {
            return null;
        }

        return null;
    }

    /**
     * @return array Array of error messages (empty if valid).
     */
    public static function validate_content( array $content ): array {
        $errors = [];

        if ( ! is_array( $content ) ) {
            $errors[] = 'Content must be an array';
            return $errors;
        }

        foreach ( $content as $section_id => $section_data ) {
            if ( ! in_array( $section_id, Constants::ALLOWED_SECTIONS, true ) ) {
                $errors[] = "Unknown section: $section_id";
            }

            if ( ! is_array( $section_data ) ) {
                $errors[] = "Section $section_id must be an array";
            }
        }

        $json_size = strlen( wp_json_encode( $content ) );
        if ( $json_size > Constants::MAX_CONTENT_SIZE ) {
            $errors[] = 'Content payload too large (max 1MB)';
        }

        if ( isset( $content['services']['services'] ) && is_array( $content['services']['services'] ) ) {
            if ( count( $content['services']['services'] ) > Constants::MAX_SERVICES ) {
                $errors[] = 'Too many services (max ' . Constants::MAX_SERVICES . ')';
            }
        }

        if ( isset( $content['testimonials']['testimonials'] ) && is_array( $content['testimonials']['testimonials'] ) ) {
            if ( count( $content['testimonials']['testimonials'] ) > Constants::MAX_TESTIMONIALS ) {
                $errors[] = 'Too many testimonials (max ' . Constants::MAX_TESTIMONIALS . ')';
            }
        }

        if ( isset( $content['faq']['faqs'] ) && is_array( $content['faq']['faqs'] ) ) {
            if ( count( $content['faq']['faqs'] ) > Constants::MAX_FAQS ) {
                $errors[] = 'Too many FAQ items (max ' . Constants::MAX_FAQS . ')';
            }
        }

        if ( isset( $content['service-areas']['areas'] ) && is_array( $content['service-areas']['areas'] ) ) {
            if ( count( $content['service-areas']['areas'] ) > Constants::MAX_SERVICE_AREAS ) {
                $errors[] = 'Too many service areas (max ' . Constants::MAX_SERVICE_AREAS . ')';
            }
        }

        return $errors;
    }

    /**
     * Sanitize content (recursive).
     */
    public static function sanitize_content( mixed $data, string $key = '', int $depth = 0 ): mixed {
        if ( $depth > 20 ) {
            return null;
        }

        if ( is_array( $data ) ) {
            $result = [];
            foreach ( $data as $k => $v ) {
                $result[ $k ] = self::sanitize_content( $v, (string) $k, $depth + 1 );
            }
            return $result;
        }

        if ( is_string( $data ) ) {
            if ( $key === 'headline' ) {
                return wp_specialchars_decode( wp_kses( $data, [ 'strong' => [] ] ), ENT_QUOTES );
            }
            return wp_specialchars_decode( sanitize_textarea_field( $data ), ENT_QUOTES );
        }

        if ( is_bool( $data ) || is_numeric( $data ) ) {
            return $data;
        }

        if ( is_null( $data ) ) {
            return null;
        }

        return null;
    }

    /**
     * @return true|\WP_Error
     */
    public static function validate_image_upload( array $file ): true|\WP_Error {
        if ( $file['size'] > Constants::MAX_IMAGE_SIZE ) {
            return new \WP_Error( 'file_too_large', 'File size exceeds 5MB limit' );
        }

        $filetype = wp_check_filetype( $file['name'] );
        if ( ! in_array( $filetype['ext'], Constants::ALLOWED_IMAGE_EXTENSIONS, true ) ) {
            return new \WP_Error(
                'invalid_type',
                'Invalid file type. Allowed: ' . implode( ', ', Constants::ALLOWED_IMAGE_EXTENSIONS )
            );
        }

        $image_info = @getimagesize( $file['tmp_name'] );
        if ( false === $image_info ) {
            return new \WP_Error( 'invalid_image', 'File is not a valid image' );
        }

        if ( $image_info[0] > Constants::MAX_IMAGE_WIDTH || $image_info[1] > Constants::MAX_IMAGE_HEIGHT ) {
            return new \WP_Error(
                'image_too_large',
                "Image dimensions exceed " . Constants::MAX_IMAGE_WIDTH . "x" . Constants::MAX_IMAGE_HEIGHT . "px"
            );
        }

        return true;
    }
}
