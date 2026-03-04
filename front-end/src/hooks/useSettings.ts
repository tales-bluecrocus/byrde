/**
 * WordPress Theme Settings Hook
 *
 * Reads from SettingsContext (reactive) for editor live-updates.
 */

import { useSettingsContext } from '../context/SettingsContext';

export interface ThemeSettings {
  // Brand
  logo: string;
  logo_alt: string;
  phone: string;
  phone_raw: string;
  email: string;

  // Brand Colors (per-mode primary + accent + text + default mode)
  brand_dark_primary: string;
  brand_dark_accent: string;
  brand_dark_text: string;
  brand_light_primary: string;
  brand_light_accent: string;
  brand_light_text: string;
  brand_mode: string;

  // Button Style (per-mode text colors)
  button_border_width: string;
  button_border_radius: string;
  button_dark_text_color: string;
  button_dark_accent_text_color: string;
  button_light_text_color: string;
  button_light_accent_text_color: string;
  button_shadow: string;

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

  // Legal pages
  privacy_policy_url: string;
  terms_url: string;
  cookie_settings_url: string;

  // Contact Form (admin-only, not exposed publicly)
  postmark_api_token: string;
  contact_form_to_email: string;
  contact_form_from_email: string;
  contact_form_subject: string;
  contact_form_cc_email: string;
  contact_form_bcc_email: string;

  // API
  apiUrl: string;
}

declare global {
  interface Window {
    byrdeSettings?: Partial<ThemeSettings>;
  }
}

export const DEFAULT_SETTINGS: ThemeSettings = {
  // Brand - NO defaults, must be configured
  logo: '',
  logo_alt: '',
  phone: '',
  phone_raw: '',
  email: '',

  // Brand Colors (per-mode)
  brand_dark_primary: '#3ab342',
  brand_dark_accent: '#f97316',
  brand_dark_text: '#efefef',
  brand_light_primary: '#3ab342',
  brand_light_accent: '#f97316',
  brand_light_text: '#2a2a2a',
  brand_mode: 'dark',

  // Button Style (per-mode text colors)
  button_border_width: '0',
  button_border_radius: '12',
  button_dark_text_color: '#ffffff',
  button_dark_accent_text_color: '#ffffff',
  button_light_text_color: '#ffffff',
  button_light_accent_text_color: '#000000',
  button_shadow: 'md',

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

  // Legal pages
  privacy_policy_url: '/privacy-policy',
  terms_url: '/terms-and-conditions',
  cookie_settings_url: '/cookie-settings',

  // Contact Form
  postmark_api_token: '',
  contact_form_to_email: '',
  contact_form_from_email: '',
  contact_form_subject: 'New Lead from Ads',
  contact_form_cc_email: '',
  contact_form_bcc_email: '',

  // API
  apiUrl: '/wp-json/byrde/v1',
};

/**
 * Get all theme settings (reactive via context)
 */
export function useSettings(): ThemeSettings {
  const { settings } = useSettingsContext();
  return settings;
}

/**
 * Get a single setting value
 */
export function useSetting<K extends keyof ThemeSettings>(
  key: K,
  fallback?: ThemeSettings[K]
): ThemeSettings[K] {
  const { settings } = useSettingsContext();
  return settings[key] ?? fallback ?? DEFAULT_SETTINGS[key];
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
