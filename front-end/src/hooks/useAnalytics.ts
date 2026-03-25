/**
 * React Hooks for Analytics Tracking
 *
 * Custom hooks for integrating analytics into React components.
 * Captures UTM/click ID attribution and pushes events to dataLayer for GTM.
 */

import { useEffect, useRef, useCallback, useMemo } from 'react';
import {
  ScrollDepthTracker,
  FormTracker,
  SectionVisibilityTracker,
  trackCTAClick,
  trackPhoneClick,
  trackEmailClick,
  trackSocialClick,
  trackFAQExpanded,
  trackServiceCardClick,
  captureAdAttribution,
  getAdAttribution,
  getAttributionForSubmission,
  type FormTrackingConfig,
  type AdAttributionData,
} from '../lib/analytics';

// ============================================
// AD ATTRIBUTION CAPTURE
// ============================================

/**
 * Hook to capture UTM parameters and ad click IDs on page load
 * Call this once at the app level to capture attribution for all conversions
 *
 * Captures: utm_source, utm_medium, utm_campaign, utm_content, utm_term,
 *           gclid (Google Ads), fbclid (Facebook), msclkid (Microsoft)
 */
export function useAdAttributionCapture(): AdAttributionData {
  const attributionRef = useRef<AdAttributionData>({});

  useEffect(() => {
    // Capture on mount
    attributionRef.current = captureAdAttribution();

    if (import.meta.env.DEV && Object.keys(attributionRef.current).length > 0) {
      console.log('[Ad Attribution] Captured:', attributionRef.current);
    }
  }, []);

  return attributionRef.current;
}

/**
 * Hook to get current ad attribution data
 * Use this in forms to include attribution with submissions
 */
export function useAdAttribution(): {
  attribution: AdAttributionData;
  getForSubmission: () => Record<string, string>;
} {
  return useMemo(() => ({
    attribution: getAdAttribution(),
    getForSubmission: getAttributionForSubmission,
  }), []);
}

// ============================================
// SCROLL DEPTH TRACKING
// ============================================

const DEFAULT_SCROLL_THRESHOLDS = [25, 50, 75, 90, 100];

/**
 * Hook to track scroll depth
 * Automatically tracks when user scrolls to 25%, 50%, 75%, 90%, 100%
 */
export function useScrollDepthTracking(
  thresholds: number[] = DEFAULT_SCROLL_THRESHOLDS
): void {
  const trackerRef = useRef<ScrollDepthTracker | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    trackerRef.current = new ScrollDepthTracker({
      thresholds,
      trackOnce: true,
    });

    const handleScroll = () => {
      trackerRef.current?.track();
    };

    // Use passive listener for performance
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      trackerRef.current = null;
    };
  }, [thresholds]);
}

// ============================================
// FORM TRACKING
// ============================================

/**
 * Hook for form interaction tracking
 * Returns methods to track form lifecycle events
 */
export function useFormTracking(config: FormTrackingConfig) {
  const trackerRef = useRef<FormTracker | null>(null);

  // Initialize tracker
  useEffect(() => {
    trackerRef.current = new FormTracker(config);

    // Track abandonment on unmount if form was started
    return () => {
      trackerRef.current?.trackAbandonment();
      trackerRef.current = null;
    };
  }, [config.formName, config.formLocation]);

  const trackStart = useCallback(() => {
    trackerRef.current?.trackStart();
  }, []);

  const trackFieldComplete = useCallback((fieldName: string) => {
    trackerRef.current?.trackFieldComplete(fieldName);
  }, []);

  const trackSubmit = useCallback((formData?: Record<string, string>) => {
    trackerRef.current?.trackSubmit(formData);
  }, []);

  const trackError = useCallback((errorType: string, fieldName?: string) => {
    trackerRef.current?.trackError(errorType, fieldName);
  }, []);

  return useMemo(() => ({
    trackStart,
    trackFieldComplete,
    trackSubmit,
    trackError,
  }), [trackStart, trackFieldComplete, trackSubmit, trackError]);
}

// ============================================
// SECTION VISIBILITY TRACKING
// ============================================

/**
 * Hook to track when a section becomes visible
 * Uses IntersectionObserver for efficiency
 */
export function useSectionVisibility(
  sectionId: string,
  sectionName: string,
  trackOnce: boolean = true
): React.RefCallback<HTMLElement> {
  const trackerRef = useRef<SectionVisibilityTracker | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    trackerRef.current = new SectionVisibilityTracker(trackOnce);

    return () => {
      trackerRef.current?.disconnect();
      trackerRef.current = null;
    };
  }, [trackOnce]);

  const setRef = useCallback((element: HTMLElement | null) => {
    // Cleanup previous element
    if (elementRef.current) {
      trackerRef.current?.unobserve(elementRef.current);
    }

    elementRef.current = element;

    // Observe new element
    if (element) {
      trackerRef.current?.observe(element, sectionId, sectionName);
    }
  }, [sectionId, sectionName]);

  return setRef;
}

// ============================================
// CTA TRACKING HOOKS
// ============================================

/**
 * Hook to create tracked click handlers
 */
export function useTrackedCTAClick(
  buttonText: string,
  location: string,
  destinationType?: 'phone' | 'email' | 'link' | 'form'
) {
  return useCallback(() => {
    trackCTAClick(buttonText, location, destinationType);
  }, [buttonText, location, destinationType]);
}

/**
 * Hook for phone link tracking
 */
export function useTrackedPhoneClick(location: string) {
  return useCallback(() => {
    trackPhoneClick(location);
  }, [location]);
}

/**
 * Hook for email link tracking
 */
export function useTrackedEmailClick(location: string) {
  return useCallback(() => {
    trackEmailClick(location);
  }, [location]);
}

/**
 * Hook for social link tracking
 */
export function useTrackedSocialClick(platform: string, location: string) {
  return useCallback(() => {
    trackSocialClick(platform, location);
  }, [platform, location]);
}

// ============================================
// COMPONENT-SPECIFIC HOOKS
// ============================================

/**
 * Hook for FAQ accordion tracking
 */
export function useFAQTracking() {
  const trackExpand = useCallback((question: string, index: number) => {
    trackFAQExpanded(question, index);
  }, []);

  return { trackExpand };
}

/**
 * Hook for service card tracking
 */
export function useServiceCardTracking() {
  const trackClick = useCallback((serviceName: string, serviceId: string) => {
    trackServiceCardClick(serviceName, serviceId);
  }, []);

  return { trackClick };
}

// ============================================
// PAGE-LEVEL TRACKING
// ============================================

/**
 * Combined hook for page-level tracking
 * Includes scroll depth and section visibility
 */
export function usePageTracking() {
  // Track scroll depth
  useScrollDepthTracking();

  // Return section visibility hook for use with sections
  return {
    useSectionRef: useSectionVisibility,
  };
}
