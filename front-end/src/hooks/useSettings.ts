/**
 * WordPress Theme Settings Hook
 *
 * Access theme settings injected from WordPress via wp_localize_script
 */

export interface ThemeSettings {
  logo: string;
  logo_alt: string;
  phone: string;
  phone_raw: string;
  email: string;
  google_rating: string;
  google_reviews_count: string;
  google_reviews_url: string;
  footer_tagline: string;
  footer_description: string;
  address: string;
  business_hours: string;
  copyright: string;
  facebook_url: string;
  instagram_url: string;
  youtube_url: string;
  yelp_url: string;
  // Legal pages
  privacy_policy_url: string;
  terms_url: string;
  cookie_settings_url: string;
}

declare global {
  interface Window {
    lakecitySettings?: ThemeSettings;
  }
}

const DEFAULT_SETTINGS: ThemeSettings = {
  logo: '',
  logo_alt: 'Lake City Hauling',
  phone: '(208) 998-0054',
  phone_raw: '2089980054',
  email: 'info@lakecityhauling.com',
  google_rating: '5.0',
  google_reviews_count: '50+',
  google_reviews_url: '',
  footer_tagline: 'Fast & Reliable Junk Removal Services',
  footer_description: '',
  address: '',
  business_hours: 'Mon-Sat: 7AM - 7PM',
  copyright: `© ${new Date().getFullYear()} Lake City Hauling. All rights reserved.`,
  facebook_url: '',
  instagram_url: '',
  youtube_url: '',
  yelp_url: '',
  // Legal pages - default to # if not set
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
  };
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
