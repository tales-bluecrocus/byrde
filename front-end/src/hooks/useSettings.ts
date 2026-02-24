/**
 * WordPress Theme Settings Hook
 *
 * Access theme settings injected from WordPress via wp_localize_script
 */

export interface ThemeSettings {
  // Brand
  logo: string;
  logo_alt: string;
  phone: string;
  phone_raw: string;
  email: string;

  // Google Reviews
  google_rating: string;
  google_reviews_count: string;
  google_reviews_url: string;

  // Footer
  footer_tagline: string;
  footer_description: string;
  address: string;
  business_hours: string;
  copyright: string;

  // Social
  facebook_url: string;
  instagram_url: string;
  youtube_url: string;
  yelp_url: string;

  // SEO (site_name/tagline come from WP Settings > General)
  site_name: string;
  site_tagline: string;
  site_description: string;
  site_keywords: string;
  site_url: string;
  og_image: string;

  // Analytics
  ga_measurement_id: string;
  fb_pixel_id: string;
  gads_conversion_label: string;

  // Legal pages
  privacy_policy_url: string;
  terms_url: string;
  cookie_settings_url: string;
}

declare global {
  interface Window {
    lakecitySettings?: Partial<ThemeSettings>;
  }
}

const DEFAULT_SETTINGS: ThemeSettings = {
  // Brand - NO defaults, must be configured
  logo: '',
  logo_alt: '',
  phone: '',
  phone_raw: '',
  email: '',

  // Google Reviews
  google_rating: '5.0',
  google_reviews_count: '',
  google_reviews_url: '',

  // Footer
  footer_tagline: '',
  footer_description: '',
  address: '',
  business_hours: '',
  copyright: `© ${new Date().getFullYear()}. All rights reserved.`,

  // Social
  facebook_url: '',
  instagram_url: '',
  youtube_url: '',
  yelp_url: '',

  // SEO (site_name/tagline from WP Settings > General)
  site_name: '',
  site_tagline: '',
  site_description: '',
  site_keywords: '',
  site_url: '',
  og_image: '',

  // Analytics - NO defaults
  ga_measurement_id: '',
  fb_pixel_id: '',
  gads_conversion_label: '',

  // Legal pages
  privacy_policy_url: '/privacy-policy',
  terms_url: '/terms-and-conditions',
  cookie_settings_url: '/cookie-settings',
};

/**
 * Get all theme settings
 */
export function useSettings(): ThemeSettings {
  return {
    ...DEFAULT_SETTINGS,
    ...window.lakecitySettings,
  } as ThemeSettings;
}

/**
 * Get a single setting value
 */
export function useSetting<K extends keyof ThemeSettings>(
  key: K,
  fallback?: ThemeSettings[K]
): ThemeSettings[K] {
  return window.lakecitySettings?.[key] ?? fallback ?? DEFAULT_SETTINGS[key];
}

/**
 * Check if essential settings are configured
 */
export function useSettingsConfigured(): { isConfigured: boolean; missing: string[] } {
  const settings = useSettings();
  const essential = ['site_name', 'phone', 'email'] as const;
  const missing = essential.filter(key => !settings[key]);

  return {
    isConfigured: missing.length === 0,
    missing,
  };
}

/**
 * Get social links as array (only non-empty ones)
 */
export function useSocialLinks(): Array<{ platform: string; url: string }> {
  const settings = useSettings();
  const links: Array<{ platform: string; url: string }> = [];

  if (settings.facebook_url) links.push({ platform: 'facebook', url: settings.facebook_url });
  if (settings.instagram_url) links.push({ platform: 'instagram', url: settings.instagram_url });
  if (settings.youtube_url) links.push({ platform: 'youtube', url: settings.youtube_url });
  if (settings.yelp_url) links.push({ platform: 'yelp', url: settings.yelp_url });

  return links;
}
