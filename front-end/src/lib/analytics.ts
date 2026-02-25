/**
 * Analytics Tracking System
 *
 * Centralized analytics implementation for GA4, Facebook Pixel, and dataLayer events.
 * Supports scroll tracking, form interactions, CTA clicks, UTM capture, and ad attribution.
 *
 * PAID ADS FEATURES:
 * - UTM parameter capture and storage
 * - Google Ads GCLID capture for offline conversions
 * - Facebook/Meta FBCLID capture
 * - Facebook Pixel event tracking
 * - Enhanced conversion data support
 */

// ============================================
// TYPES
// ============================================

export interface TrackingEvent {
  name: string;
  properties?: Record<string, string | number | boolean | undefined>;
}

export interface AdAttributionData {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  gclid?: string;
  fbclid?: string;
  msclkid?: string;
  landing_page?: string;
  referrer?: string;
  timestamp?: string;
}

export interface ScrollDepthConfig {
  thresholds: number[];
  trackOnce: boolean;
}

export interface FormTrackingConfig {
  formName: string;
  formLocation: string;
}

// GA4 gtag type
type GtagCommand = 'config' | 'event' | 'set' | 'consent';

// Facebook Pixel type
type FbqCommand = 'init' | 'track' | 'trackCustom' | 'trackSingle' | 'trackSingleCustom';

declare global {
  interface Window {
    gtag?: (command: GtagCommand, targetId: string, config?: Record<string, unknown>) => void;
    dataLayer?: Record<string, unknown>[];
    GA_MEASUREMENT_ID?: string;
    fbq?: (command: FbqCommand, eventName: string, params?: Record<string, unknown>) => void;
    _fbq?: unknown;
  }
}

// Storage keys
const AD_ATTRIBUTION_KEY = 'byrde_ad_attribution';
const CLICK_ID_KEY = 'byrde_click_ids';
const CLICK_ID_EXPIRY_DAYS = 90; // Google's GCLID attribution window

// Tracking params that indicate a paid/attributed visit
const TRACKING_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid', 'msclkid'] as const;

// ============================================
// AD ATTRIBUTION & UTM TRACKING
// ============================================

/**
 * Store click IDs (GCLID, FBCLID, MSCLKID) in localStorage with 90-day expiry.
 * These persist across sessions for offline conversion tracking.
 */
function storeClickIds(clickIds: Record<string, string>): void {
  if (Object.keys(clickIds).length === 0) return;

  try {
    const data = {
      ...clickIds,
      _stored_at: new Date().toISOString(),
      _expires_at: new Date(Date.now() + CLICK_ID_EXPIRY_DAYS * 86400000).toISOString(),
    };
    localStorage.setItem(CLICK_ID_KEY, JSON.stringify(data));
  } catch {
    // localStorage not available
  }
}

/**
 * Get stored click IDs from localStorage (if not expired)
 */
function getStoredClickIds(): Record<string, string> {
  try {
    const stored = localStorage.getItem(CLICK_ID_KEY);
    if (!stored) return {};

    const data = JSON.parse(stored);
    const expiresAt = new Date(data._expires_at).getTime();

    if (Date.now() > expiresAt) {
      localStorage.removeItem(CLICK_ID_KEY);
      return {};
    }

    const { _stored_at: _, _expires_at: __, ...clickIds } = data;
    return clickIds;
  } catch {
    return {};
  }
}

/**
 * Capture and store UTM parameters and ad click IDs.
 * Call this on page load to capture attribution data.
 *
 * - UTM params → sessionStorage (session-scoped, first-touch wins)
 * - Click IDs (GCLID/FBCLID/MSCLKID) → localStorage (90-day expiry for offline conversions)
 */
export function captureAdAttribution(): AdAttributionData {
  if (typeof window === 'undefined') return {};

  const params = new URLSearchParams(window.location.search);

  const attribution: AdAttributionData = {
    utm_source: params.get('utm_source') || undefined,
    utm_medium: params.get('utm_medium') || undefined,
    utm_campaign: params.get('utm_campaign') || undefined,
    utm_content: params.get('utm_content') || undefined,
    utm_term: params.get('utm_term') || undefined,
    gclid: params.get('gclid') || undefined,
    fbclid: params.get('fbclid') || undefined,
    msclkid: params.get('msclkid') || undefined,
    landing_page: window.location.pathname,
    referrer: document.referrer || undefined,
    timestamp: new Date().toISOString(),
  };

  // Check only actual tracking params (not landing_page/referrer/timestamp which are always defined)
  const hasTrackingParams = TRACKING_PARAMS.some(key => attribution[key] !== undefined);

  // Persist click IDs to localStorage (survives session close — needed for offline conversions)
  const clickIds: Record<string, string> = {};
  if (attribution.gclid) clickIds.gclid = attribution.gclid;
  if (attribution.fbclid) clickIds.fbclid = attribution.fbclid;
  if (attribution.msclkid) clickIds.msclkid = attribution.msclkid;
  storeClickIds(clickIds);

  // Store full attribution in sessionStorage only if we have real tracking params
  if (hasTrackingParams) {
    try {
      // Don't overwrite existing attribution (first-touch wins)
      const existing = sessionStorage.getItem(AD_ATTRIBUTION_KEY);
      if (!existing) {
        sessionStorage.setItem(AD_ATTRIBUTION_KEY, JSON.stringify(attribution));
      }
    } catch {
      // sessionStorage not available
    }
  }

  return attribution;
}

/**
 * Get stored attribution data.
 * Merges sessionStorage (UTM + context) with localStorage click IDs (persistent).
 */
export function getAdAttribution(): AdAttributionData {
  if (typeof window === 'undefined') return {};

  try {
    const stored = sessionStorage.getItem(AD_ATTRIBUTION_KEY);
    const sessionData: AdAttributionData = stored ? JSON.parse(stored) : {};

    // Merge persistent click IDs (localStorage survives session close)
    const clickIds = getStoredClickIds();
    if (clickIds.gclid && !sessionData.gclid) sessionData.gclid = clickIds.gclid;
    if (clickIds.fbclid && !sessionData.fbclid) sessionData.fbclid = clickIds.fbclid;
    if (clickIds.msclkid && !sessionData.msclkid) sessionData.msclkid = clickIds.msclkid;

    return sessionData;
  } catch {
    return {};
  }
}

/**
 * Get attribution data for form submission.
 * Includes only non-empty values.
 */
export function getAttributionForSubmission(): Record<string, string> {
  const attribution = getAdAttribution();
  const result: Record<string, string> = {};

  Object.entries(attribution).forEach(([key, value]) => {
    if (value) {
      result[key] = value;
    }
  });

  return result;
}

// ============================================
// FACEBOOK PIXEL TRACKING
// ============================================

/**
 * Check if Facebook Pixel is available
 */
export function isFacebookPixelAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.fbq === 'function';
}

/**
 * Track Facebook Pixel event
 */
export function trackFacebookEvent(
  eventName: string,
  params?: Record<string, unknown>
): void {
  if (!isFacebookPixelAvailable()) return;

  window.fbq!('track', eventName, params);

  if (import.meta.env.DEV) {
    console.log('[FB Pixel]', eventName, params);
  }
}

/**
 * Track Facebook custom event
 */
export function trackFacebookCustomEvent(
  eventName: string,
  params?: Record<string, unknown>
): void {
  if (!isFacebookPixelAvailable()) return;

  window.fbq!('trackCustom', eventName, params);

  if (import.meta.env.DEV) {
    console.log('[FB Pixel Custom]', eventName, params);
  }
}

// ============================================
// GOOGLE ADS CONVERSION TRACKING
// ============================================

/**
 * Get the Google Ads conversion label from WordPress settings
 */
function getGoogleAdsConversionLabel(): string {
  // Injected via wp_localize_script as byrdeAnalytics
  const analytics = (window as unknown as Record<string, unknown>).byrdeAnalytics as Record<string, string> | undefined;
  return analytics?.gads_conversion_label || '';
}

/**
 * Fire Google Ads conversion event
 * Requires gads_conversion_label set in Theme Settings > Analytics
 */
export function trackGoogleAdsConversion(serviceType?: string): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;

  const conversionLabel = getGoogleAdsConversionLabel();
  if (!conversionLabel) return;

  window.gtag('event', 'conversion', {
    send_to: conversionLabel,
    value: 1.0,
    currency: 'USD',
    ...(serviceType ? { event_label: serviceType } : {}),
  } as Record<string, unknown>);

  if (import.meta.env.DEV) {
    console.log('[Google Ads] Conversion', conversionLabel, serviceType);
  }
}

// ============================================
// EVENT NAMES (Object-Action naming convention)
// ============================================

export const AnalyticsEvents = {
  // Page & Navigation
  PAGE_VIEW: 'page_view',
  SECTION_VIEWED: 'section_viewed',
  SCROLL_DEPTH: 'scroll_depth',

  // CTA Interactions
  CTA_CLICKED: 'cta_clicked',
  PHONE_CLICKED: 'phone_clicked',
  EMAIL_CLICKED: 'email_clicked',
  SOCIAL_CLICKED: 'social_clicked',

  // Form Events
  FORM_STARTED: 'form_started',
  FORM_FIELD_COMPLETED: 'form_field_completed',
  FORM_SUBMITTED: 'form_submitted',
  FORM_ERROR: 'form_error',
  FORM_ABANDONED: 'form_abandoned',

  // Engagement
  VIDEO_PLAYED: 'video_played',
  VIDEO_COMPLETED: 'video_completed',
  FAQ_EXPANDED: 'faq_expanded',
  TESTIMONIAL_VIEWED: 'testimonial_viewed',
  SERVICE_CARD_CLICKED: 'service_card_clicked',

  // Conversions
  LEAD_GENERATED: 'lead_generated',
  QUOTE_REQUESTED: 'quote_requested',
} as const;

export type AnalyticsEventName = typeof AnalyticsEvents[keyof typeof AnalyticsEvents];

// ============================================
// CORE TRACKING FUNCTIONS
// ============================================

/**
 * Check if analytics is available
 */
export function isAnalyticsAvailable(): boolean {
  return typeof window !== 'undefined' && (
    typeof window.gtag === 'function' ||
    Array.isArray(window.dataLayer)
  );
}

/**
 * Push event to dataLayer (GA4 / Site Kit compatible)
 */
export function pushToDataLayer(event: TrackingEvent): void {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: event.name,
    ...event.properties,
  });
}

/**
 * Track event with GA4 gtag
 */
export function trackEvent(
  eventName: string,
  properties?: Record<string, string | number | boolean | undefined>
): void {
  if (typeof window === 'undefined') return;

  // Clean undefined values
  const cleanProps = properties
    ? Object.fromEntries(
        Object.entries(properties).filter(([, v]) => v !== undefined)
      )
    : undefined;

  // Push to dataLayer
  pushToDataLayer({ name: eventName, properties: cleanProps });

  // Also send to gtag if available
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, cleanProps);
  }

  // Debug logging in development
  if (import.meta.env.DEV) {
    console.log('[Analytics]', eventName, cleanProps);
  }
}

// ============================================
// SPECIALIZED TRACKING FUNCTIONS
// ============================================

/**
 * Track CTA click
 */
export function trackCTAClick(
  buttonText: string,
  location: string,
  destinationType?: 'phone' | 'email' | 'link' | 'form'
): void {
  trackEvent(AnalyticsEvents.CTA_CLICKED, {
    button_text: buttonText,
    cta_location: location,
    destination_type: destinationType,
    page_location: typeof window !== 'undefined' ? window.location.pathname : undefined,
  });
}

/**
 * Track phone click (high-value conversion for local services)
 * Fires: GA4 phone_clicked, Google Ads conversion, FB Pixel Contact
 */
export function trackPhoneClick(location: string): void {
  const attribution = getAdAttribution();

  trackEvent(AnalyticsEvents.PHONE_CLICKED, {
    cta_location: location,
    page_location: typeof window !== 'undefined' ? window.location.pathname : undefined,
    utm_source: attribution.utm_source,
    utm_medium: attribution.utm_medium,
    utm_campaign: attribution.utm_campaign,
    gclid: attribution.gclid,
  });

  // Google Ads conversion for phone calls
  trackGoogleAdsConversion('phone_call');

  // Facebook Pixel - Contact event for phone calls
  trackFacebookEvent('Contact', {
    content_name: 'phone_call',
    content_category: location,
  });
}

/**
 * Track email click
 */
export function trackEmailClick(location: string): void {
  trackEvent(AnalyticsEvents.EMAIL_CLICKED, {
    cta_location: location,
    page_location: typeof window !== 'undefined' ? window.location.pathname : undefined,
  });
}

/**
 * Track social media click
 */
export function trackSocialClick(platform: string, location: string): void {
  trackEvent(AnalyticsEvents.SOCIAL_CLICKED, {
    platform,
    cta_location: location,
  });
}

/**
 * Track section view (for scroll-based visibility)
 */
export function trackSectionViewed(sectionId: string, sectionName: string): void {
  trackEvent(AnalyticsEvents.SECTION_VIEWED, {
    section_id: sectionId,
    section_name: sectionName,
  });
}

/**
 * Track scroll depth
 */
export function trackScrollDepth(depth: number): void {
  trackEvent(AnalyticsEvents.SCROLL_DEPTH, {
    depth_percentage: depth,
    depth_threshold: `${depth}%`,
  });
}

/**
 * Track FAQ expansion
 */
export function trackFAQExpanded(question: string, index: number): void {
  trackEvent(AnalyticsEvents.FAQ_EXPANDED, {
    question_text: question.substring(0, 100), // Limit length
    question_index: index,
  });
}

/**
 * Track service card click
 */
export function trackServiceCardClick(serviceName: string, serviceId: string): void {
  trackEvent(AnalyticsEvents.SERVICE_CARD_CLICKED, {
    service_name: serviceName,
    service_id: serviceId,
  });
}

// ============================================
// FORM TRACKING
// ============================================

/**
 * Track form start (first interaction)
 */
export function trackFormStarted(formName: string, formLocation: string): void {
  trackEvent(AnalyticsEvents.FORM_STARTED, {
    form_name: formName,
    form_location: formLocation,
  });
}

/**
 * Track form field completion
 */
export function trackFormFieldCompleted(
  formName: string,
  fieldName: string,
  fieldIndex: number
): void {
  trackEvent(AnalyticsEvents.FORM_FIELD_COMPLETED, {
    form_name: formName,
    field_name: fieldName,
    field_index: fieldIndex,
  });
}

/**
 * Track form submission with full attribution
 * Fires: GA4 form_submitted, GA4 lead_generated, Google Ads conversion, FB Pixel Lead
 */
export function trackFormSubmitted(
  formName: string,
  formLocation: string,
  formData?: Record<string, string>
): void {
  // Get attribution data for this conversion
  const attribution = getAdAttribution();

  trackEvent(AnalyticsEvents.FORM_SUBMITTED, {
    form_name: formName,
    form_location: formLocation,
    // Only include non-PII fields
    service_type: formData?.service,
    // Include attribution
    utm_source: attribution.utm_source,
    utm_medium: attribution.utm_medium,
    utm_campaign: attribution.utm_campaign,
  });

  // Also track as conversion
  trackEvent(AnalyticsEvents.LEAD_GENERATED, {
    lead_source: formLocation,
    service_requested: formData?.service,
    // Attribution for conversion
    utm_source: attribution.utm_source,
    utm_medium: attribution.utm_medium,
    utm_campaign: attribution.utm_campaign,
    gclid: attribution.gclid,
  });

  // Google Ads conversion event (requires gads_conversion_label in settings)
  trackGoogleAdsConversion(formData?.service);

  // Facebook Pixel Lead event
  trackFacebookEvent('Lead', {
    content_name: formName,
    content_category: formData?.service,
    value: 1,
    currency: 'USD',
  });
}

/**
 * Track form error
 */
export function trackFormError(
  formName: string,
  errorType: string,
  fieldName?: string
): void {
  trackEvent(AnalyticsEvents.FORM_ERROR, {
    form_name: formName,
    error_type: errorType,
    field_name: fieldName,
  });
}

/**
 * Track form abandonment
 */
export function trackFormAbandoned(
  formName: string,
  lastFieldCompleted?: string,
  fieldsCompleted?: number
): void {
  trackEvent(AnalyticsEvents.FORM_ABANDONED, {
    form_name: formName,
    last_field: lastFieldCompleted,
    fields_completed: fieldsCompleted,
  });
}

// ============================================
// CONVERSION TRACKING
// ============================================

/**
 * Track quote request conversion
 */
export function trackQuoteRequested(
  serviceType: string,
  source: string
): void {
  trackEvent(AnalyticsEvents.QUOTE_REQUESTED, {
    service_type: serviceType,
    conversion_source: source,
    value: 1, // For conversion counting
  });
}

// ============================================
// UTILITY CLASSES
// ============================================

/**
 * Scroll depth tracker - tracks when user scrolls to certain percentages
 */
export class ScrollDepthTracker {
  private trackedThresholds: Set<number> = new Set();
  private thresholds: number[];
  private trackOnce: boolean;

  constructor(config: ScrollDepthConfig = { thresholds: [25, 50, 75, 90, 100], trackOnce: true }) {
    this.thresholds = config.thresholds;
    this.trackOnce = config.trackOnce;
  }

  track(): void {
    if (typeof window === 'undefined') return;

    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = Math.round((scrollTop / docHeight) * 100);

    for (const threshold of this.thresholds) {
      if (scrollPercent >= threshold) {
        if (this.trackOnce && this.trackedThresholds.has(threshold)) {
          continue;
        }
        this.trackedThresholds.add(threshold);
        trackScrollDepth(threshold);
      }
    }
  }

  reset(): void {
    this.trackedThresholds.clear();
  }
}

/**
 * Form interaction tracker - tracks form engagement
 */
export class FormTracker {
  private formName: string;
  private formLocation: string;
  private hasStarted: boolean = false;
  private fieldsCompleted: Set<string> = new Set();
  private fieldOrder: string[] = [];

  constructor(config: FormTrackingConfig) {
    this.formName = config.formName;
    this.formLocation = config.formLocation;
  }

  trackStart(): void {
    if (this.hasStarted) return;
    this.hasStarted = true;
    trackFormStarted(this.formName, this.formLocation);
  }

  trackFieldComplete(fieldName: string): void {
    if (!this.hasStarted) {
      this.trackStart();
    }

    if (!this.fieldsCompleted.has(fieldName)) {
      this.fieldsCompleted.add(fieldName);
      this.fieldOrder.push(fieldName);
      trackFormFieldCompleted(
        this.formName,
        fieldName,
        this.fieldOrder.length
      );
    }
  }

  trackSubmit(formData?: Record<string, string>): void {
    trackFormSubmitted(this.formName, this.formLocation, formData);
    this.reset();
  }

  trackError(errorType: string, fieldName?: string): void {
    trackFormError(this.formName, errorType, fieldName);
  }

  trackAbandonment(): void {
    if (this.hasStarted && this.fieldsCompleted.size > 0) {
      const lastField = this.fieldOrder[this.fieldOrder.length - 1];
      trackFormAbandoned(this.formName, lastField, this.fieldsCompleted.size);
    }
  }

  reset(): void {
    this.hasStarted = false;
    this.fieldsCompleted.clear();
    this.fieldOrder = [];
  }
}

/**
 * Section visibility tracker using IntersectionObserver
 */
export class SectionVisibilityTracker {
  private observer: IntersectionObserver | null = null;
  private trackedSections: Set<string> = new Set();
  private trackOnce: boolean;

  constructor(trackOnce: boolean = true) {
    this.trackOnce = trackOnce;
  }

  observe(element: Element, sectionId: string, sectionName: string): void {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    if (!this.observer) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const id = entry.target.getAttribute('data-section-id');
              const name = entry.target.getAttribute('data-section-name');

              if (id && name) {
                if (this.trackOnce && this.trackedSections.has(id)) {
                  return;
                }
                this.trackedSections.add(id);
                trackSectionViewed(id, name);
              }
            }
          });
        },
        { threshold: 0.5 } // 50% visibility
      );
    }

    element.setAttribute('data-section-id', sectionId);
    element.setAttribute('data-section-name', sectionName);
    this.observer.observe(element);
  }

  unobserve(element: Element): void {
    this.observer?.unobserve(element);
  }

  disconnect(): void {
    this.observer?.disconnect();
    this.observer = null;
    this.trackedSections.clear();
  }
}
