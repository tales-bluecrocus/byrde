/**
 * WordPress Window Object Type Declarations
 *
 * Proper TypeScript types for WordPress data injected via wp_localize_script
 */

import type { GlobalConfig } from '../context/GlobalConfigContext';
import type { SectionTheme, SectionId } from '../context/SectionThemeContext';
import type { HeaderConfig, TopbarConfig } from '../context/HeaderConfigContext';
import type { SectionContent, ContentSectionId } from '../context/ContentContext';

// ============================================
// ACF SETTINGS (from Theme Settings page)
// ============================================

export interface ACFSettings {
  // Brand
  logo?: string;
  logo_id?: number;
  phone?: string;
  phone_raw?: string;
  email?: string;

  // Google Reviews
  google_rating?: number;
  google_reviews_count?: number;
  google_reviews_url?: string;

  // Footer
  footer_tagline?: string;
  footer_description?: string;
  address?: string;
  hours?: string;
  copyright?: string;

  // Social
  facebook_url?: string;
  instagram_url?: string;
  youtube_url?: string;
  yelp_url?: string;

  // SEO (new fields)
  site_name?: string;
  site_description?: string;
  og_image?: string;
  schema_type?: 'LocalBusiness' | 'Organization' | 'Service';
  schema_price_range?: string;
  schema_geo_lat?: string;
  schema_geo_lng?: string;
  schema_area_served?: string[];
}

// ============================================
// THEME CONFIG (stored in post meta)
// ============================================

export interface ThemeConfig {
  globalConfig?: GlobalConfig;
  header?: Partial<HeaderConfig>;
  topbar?: Partial<TopbarConfig>;
  sectionThemes?: Record<SectionId, SectionTheme & { visible?: boolean }>;
  _meta?: {
    savedAt: string;
    version: string;
  };
}

// ============================================
// ADMIN CONTEXT (injected in editor mode)
// ============================================

export interface LakecityAdmin {
  isAdmin: boolean;
  canSave: boolean;
  apiUrl: string;
  nonce: string;
  pageId: number;
  config: ThemeConfig | null;
  _debug?: {
    loggedIn: boolean;
    canEditPages: boolean;
    canEdit: boolean;
  };
}

// ============================================
// WORDPRESS MEDIA LIBRARY
// ============================================

export interface MediaFrameOptions {
  title: string;
  button: {
    text: string;
  };
  multiple: boolean;
  library?: {
    type: string;
  };
}

export interface MediaAttachment {
  id: number;
  url: string;
  title: string;
  filename: string;
  width?: number;
  height?: number;
  mime: string;
  alt?: string;
}

export interface MediaFrameSelection {
  first(): { toJSON(): MediaAttachment };
}

export interface MediaFrameState {
  get(key: 'selection'): MediaFrameSelection;
}

export interface MediaFrame {
  on(event: 'select', callback: () => void): void;
  open(): void;
  state(): MediaFrameState;
}

export interface WPMedia {
  media(options: MediaFrameOptions): MediaFrame;
}

// ============================================
// GA4 / GTM
// ============================================

export type GtagCommand = 'config' | 'event' | 'set' | 'consent' | 'js';

export interface Gtag {
  (command: 'js', date: Date): void;
  (command: 'config', targetId: string, config?: Record<string, unknown>): void;
  (command: 'event', eventName: string, eventParams?: Record<string, unknown>): void;
  (command: 'set', config: Record<string, unknown>): void;
  (command: 'consent', action: 'default' | 'update', config: Record<string, unknown>): void;
}

// ============================================
// GLOBAL WINDOW AUGMENTATION
// ============================================

declare global {
  interface Window {
    // WordPress Theme Data
    lakecityAdmin?: LakecityAdmin;
    lakecityConfig?: ThemeConfig;
    lakecityContent?: Partial<Record<ContentSectionId, SectionContent>>;
    lakecitySettings?: Partial<ACFSettings>;

    // WordPress Media Library
    wp?: WPMedia;

    // Analytics
    gtag?: Gtag;
    dataLayer?: Record<string, unknown>[];
    GA_MEASUREMENT_ID?: string;
  }
}

export {};
