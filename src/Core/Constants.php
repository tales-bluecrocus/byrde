<?php

namespace Byrde\Core;

/**
 * Centralized constants to avoid magic strings throughout the codebase.
 */
class Constants {
    // Custom Post Type
    public const CPT_LANDING = 'byrde_landing';

    // Post Meta Keys
    public const META_THEME_CONFIG = '_byrde_theme_config';
    public const META_CONTENT      = '_byrde_content';

    // Options Keys
    public const OPTION_THEME_SETTINGS = 'byrde_theme_settings';

    // REST API
    public const REST_NAMESPACE = 'byrde/v1';
    public const REST_VERSION   = '1.0';

    // Allowed Sections
    public const ALLOWED_SECTIONS = [
        'hero',
        'services',
        'testimonials',
        'faq',
        'mid-cta',
        'service-areas',
        'footer-cta',
        'featured-testimonial',
        'footer',
    ];

    // Validation Limits
    public const MAX_THEME_CONFIG_SIZE = 524288;  // 512KB
    public const MAX_CONTENT_SIZE      = 1048576; // 1MB
    public const MAX_IMAGE_SIZE        = 5242880; // 5MB
    public const MAX_IMAGE_WIDTH       = 3840;
    public const MAX_IMAGE_HEIGHT      = 2160;
    public const ALLOWED_IMAGE_EXTENSIONS = [ 'jpg', 'jpeg', 'png', 'gif', 'webp' ];

    // Content Limits
    public const MAX_SERVICES      = 50;
    public const MAX_TESTIMONIALS  = 100;
    public const MAX_FAQS          = 50;
    public const MAX_SERVICE_AREAS = 100;

    // Rate Limiting
    public const RATE_LIMIT_SAVE   = 10;
    public const RATE_LIMIT_UPLOAD = 5;
    public const RATE_LIMIT_WINDOW = 60;

    // Query Parameters
    public const QUERY_PREVIEW = 'byrde_preview';
    public const QUERY_PAGE_ID = 'byrde_page_id';
}
