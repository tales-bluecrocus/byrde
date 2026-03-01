/**
 * Analytics module tests
 *
 * Tests: ad attribution capture, dataLayer event pushing,
 * specialized tracking functions, ScrollDepthTracker, and FormTracker.
 */

import {
  captureAdAttribution,
  getAdAttribution,
  getAttributionForSubmission,
  pushToDataLayer,
  trackEvent,
  trackPhoneClick,
  trackFormSubmitted,
  trackScrollDepth,
  ScrollDepthTracker,
  FormTracker,
  AnalyticsEvents,
} from '../analytics';

// ============================================
// HELPERS
// ============================================

function setURL(search: string, pathname = '/lp/test-page') {
  window.history.pushState({}, '', `${pathname}${search}`);
}

function clearStorage() {
  sessionStorage.clear();
  localStorage.clear();
}

beforeEach(() => {
  clearStorage();
  window.dataLayer = [];
  setURL('');
});

// ============================================
// captureAdAttribution()
// ============================================

describe('captureAdAttribution', () => {
  it('captures UTM params from URL and stores in sessionStorage', () => {
    setURL('?utm_source=google&utm_medium=cpc&utm_campaign=brand');

    const result = captureAdAttribution();

    expect(result.utm_source).toBe('google');
    expect(result.utm_medium).toBe('cpc');
    expect(result.utm_campaign).toBe('brand');
    expect(result.landing_page).toBe('/lp/test-page');
    expect(result.timestamp).toBeDefined();

    // Verify sessionStorage
    const stored = JSON.parse(sessionStorage.getItem('byrde_ad_attribution')!);
    expect(stored.utm_source).toBe('google');
  });

  it('captures GCLID and stores in localStorage with expiry', () => {
    setURL('?gclid=abc123');

    captureAdAttribution();

    const stored = JSON.parse(localStorage.getItem('byrde_click_ids')!);
    expect(stored.gclid).toBe('abc123');
    expect(stored._expires_at).toBeDefined();

    // Verify 90-day expiry
    const expires = new Date(stored._expires_at);
    const now = new Date();
    const diffDays = (expires.getTime() - now.getTime()) / 86400000;
    expect(diffDays).toBeGreaterThan(89);
    expect(diffDays).toBeLessThanOrEqual(90);
  });

  it('captures FBCLID in localStorage', () => {
    setURL('?fbclid=fb_click_123');

    captureAdAttribution();

    const stored = JSON.parse(localStorage.getItem('byrde_click_ids')!);
    expect(stored.fbclid).toBe('fb_click_123');
  });

  it('captures MSCLKID in localStorage', () => {
    setURL('?msclkid=ms_click_456');

    captureAdAttribution();

    const stored = JSON.parse(localStorage.getItem('byrde_click_ids')!);
    expect(stored.msclkid).toBe('ms_click_456');
  });

  it('first-touch wins — does not overwrite existing sessionStorage', () => {
    setURL('?utm_source=google&utm_medium=cpc');
    captureAdAttribution();

    setURL('?utm_source=facebook&utm_medium=social');
    captureAdAttribution();

    const stored = JSON.parse(sessionStorage.getItem('byrde_ad_attribution')!);
    expect(stored.utm_source).toBe('google');
  });

  it('does not store in sessionStorage when no tracking params present', () => {
    setURL('');

    captureAdAttribution();

    expect(sessionStorage.getItem('byrde_ad_attribution')).toBeNull();
  });


});

// ============================================
// getAdAttribution()
// ============================================

describe('getAdAttribution', () => {
  it('merges sessionStorage UTM data with localStorage click IDs', () => {
    // Simulate previous visit with UTM
    sessionStorage.setItem('byrde_ad_attribution', JSON.stringify({
      utm_source: 'google',
      utm_medium: 'cpc',
    }));

    // Simulate persistent click ID
    localStorage.setItem('byrde_click_ids', JSON.stringify({
      gclid: 'abc123',
      _stored_at: new Date().toISOString(),
      _expires_at: new Date(Date.now() + 86400000).toISOString(),
    }));

    const result = getAdAttribution();

    expect(result.utm_source).toBe('google');
    expect(result.utm_medium).toBe('cpc');
    expect(result.gclid).toBe('abc123');
  });

  it('returns expired click IDs as empty', () => {
    localStorage.setItem('byrde_click_ids', JSON.stringify({
      gclid: 'expired123',
      _stored_at: new Date(Date.now() - 100 * 86400000).toISOString(),
      _expires_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    }));

    const result = getAdAttribution();

    expect(result.gclid).toBeUndefined();
  });

  it('session UTM data takes precedence over click IDs', () => {
    sessionStorage.setItem('byrde_ad_attribution', JSON.stringify({
      gclid: 'session_gclid',
    }));

    localStorage.setItem('byrde_click_ids', JSON.stringify({
      gclid: 'persistent_gclid',
      _stored_at: new Date().toISOString(),
      _expires_at: new Date(Date.now() + 86400000).toISOString(),
    }));

    const result = getAdAttribution();
    expect(result.gclid).toBe('session_gclid');
  });
});

// ============================================
// getAttributionForSubmission()
// ============================================

describe('getAttributionForSubmission', () => {
  it('returns only non-empty values', () => {
    sessionStorage.setItem('byrde_ad_attribution', JSON.stringify({
      utm_source: 'google',
      utm_medium: undefined,
      utm_campaign: '',
    }));

    const result = getAttributionForSubmission();

    expect(result.utm_source).toBe('google');
    expect(result).not.toHaveProperty('utm_medium');
    expect(result).not.toHaveProperty('utm_campaign');
  });
});

// ============================================
// pushToDataLayer()
// ============================================

describe('pushToDataLayer', () => {
  it('pushes event with name and properties to dataLayer', () => {
    pushToDataLayer({
      name: 'test_event',
      properties: { foo: 'bar', count: 42 },
    });

    expect(window.dataLayer).toHaveLength(1);
    expect(window.dataLayer![0]).toEqual({
      event: 'test_event',
      foo: 'bar',
      count: 42,
    });
  });

  it('initializes dataLayer if not present', () => {
    window.dataLayer = undefined;

    pushToDataLayer({ name: 'init_test' });

    expect(window.dataLayer).toHaveLength(1);
    expect(window.dataLayer![0]).toEqual({ event: 'init_test' });
  });

  it('pushes event without properties', () => {
    pushToDataLayer({ name: 'simple_event' });

    expect(window.dataLayer![0]).toEqual({ event: 'simple_event' });
  });
});

// ============================================
// trackEvent()
// ============================================

describe('trackEvent', () => {
  it('strips undefined values from properties', () => {
    trackEvent('clean_event', {
      visible: 'yes',
      hidden: undefined,
      count: 5,
    });

    expect(window.dataLayer![0]).toEqual({
      event: 'clean_event',
      visible: 'yes',
      count: 5,
    });
    expect(window.dataLayer![0]).not.toHaveProperty('hidden');
  });

  it('works without properties', () => {
    trackEvent('bare_event');

    expect(window.dataLayer![0]).toEqual({ event: 'bare_event' });
  });
});

// ============================================
// trackPhoneClick()
// ============================================

describe('trackPhoneClick', () => {
  it('pushes phone_clicked event with location and attribution', () => {
    sessionStorage.setItem('byrde_ad_attribution', JSON.stringify({
      utm_source: 'google',
      utm_medium: 'cpc',
      utm_campaign: 'brand',
      gclid: 'gclid123',
    }));

    trackPhoneClick('header');

    expect(window.dataLayer![0]).toMatchObject({
      event: 'phone_clicked',
      cta_location: 'header',
      utm_source: 'google',
      utm_medium: 'cpc',
      utm_campaign: 'brand',
      gclid: 'gclid123',
    });
  });
});

// ============================================
// trackFormSubmitted()
// ============================================

describe('trackFormSubmitted', () => {
  it('fires both form_submitted and lead_generated events', () => {
    trackFormSubmitted('contact', 'hero', { service: 'plumbing' });

    expect(window.dataLayer).toHaveLength(2);

    expect(window.dataLayer![0]).toMatchObject({
      event: 'form_submitted',
      form_name: 'contact',
      form_location: 'hero',
      service_type: 'plumbing',
    });

    expect(window.dataLayer![1]).toMatchObject({
      event: 'lead_generated',
      lead_source: 'hero',
      service_requested: 'plumbing',
    });
  });
});

// ============================================
// ScrollDepthTracker
// ============================================

describe('ScrollDepthTracker', () => {
  function simulateScroll(scrollY: number, docHeight: number) {
    Object.defineProperty(window, 'scrollY', { value: scrollY, writable: true });
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: docHeight, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 800, writable: true });
  }

  it('tracks thresholds as scroll progresses', () => {
    const tracker = new ScrollDepthTracker({
      thresholds: [25, 50, 75, 100],
      trackOnce: true,
    });

    // Scroll to 30% — should fire 25%
    simulateScroll(600, 2800);
    tracker.track();

    expect(window.dataLayer).toHaveLength(1);
    expect(window.dataLayer![0]).toMatchObject({
      event: 'scroll_depth',
      depth_percentage: 25,
    });

    // Scroll to 55% — should fire 50%
    simulateScroll(1100, 2800);
    tracker.track();

    expect(window.dataLayer).toHaveLength(2);
    expect(window.dataLayer![1]).toMatchObject({
      event: 'scroll_depth',
      depth_percentage: 50,
    });
  });

  it('fires each threshold only once when trackOnce is true', () => {
    const tracker = new ScrollDepthTracker({
      thresholds: [25, 50],
      trackOnce: true,
    });

    simulateScroll(600, 2800); // 30%
    tracker.track();
    tracker.track(); // duplicate

    expect(window.dataLayer).toHaveLength(1);
  });

  it('resets tracked thresholds', () => {
    const tracker = new ScrollDepthTracker({
      thresholds: [25],
      trackOnce: true,
    });

    simulateScroll(600, 2800);
    tracker.track();
    expect(window.dataLayer).toHaveLength(1);

    tracker.reset();
    tracker.track();
    expect(window.dataLayer).toHaveLength(2);
  });
});

// ============================================
// FormTracker
// ============================================

describe('FormTracker', () => {
  it('tracks form lifecycle: start → field → submit', () => {
    const tracker = new FormTracker({
      formName: 'contact',
      formLocation: 'hero',
    });

    tracker.trackStart();
    expect(window.dataLayer![0]).toMatchObject({
      event: 'form_started',
      form_name: 'contact',
      form_location: 'hero',
    });

    tracker.trackFieldComplete('name');
    expect(window.dataLayer![1]).toMatchObject({
      event: 'form_field_completed',
      form_name: 'contact',
      field_name: 'name',
      field_index: 1,
    });

    tracker.trackFieldComplete('email');
    expect(window.dataLayer![2]).toMatchObject({
      event: 'form_field_completed',
      field_name: 'email',
      field_index: 2,
    });

    tracker.trackSubmit({ service: 'hvac' });
    // form_submitted + lead_generated = 2 more events
    expect(window.dataLayer).toHaveLength(5);
  });

  it('auto-starts on first field completion if not started', () => {
    const tracker = new FormTracker({
      formName: 'quote',
      formLocation: 'sidebar',
    });

    tracker.trackFieldComplete('phone');

    // Should fire form_started THEN form_field_completed
    expect(window.dataLayer).toHaveLength(2);
    expect(window.dataLayer![0]).toMatchObject({ event: 'form_started' });
    expect(window.dataLayer![1]).toMatchObject({ event: 'form_field_completed' });
  });

  it('does not fire duplicate start events', () => {
    const tracker = new FormTracker({
      formName: 'contact',
      formLocation: 'footer',
    });

    tracker.trackStart();
    tracker.trackStart();

    const starts = window.dataLayer!.filter(e => e.event === 'form_started');
    expect(starts).toHaveLength(1);
  });

  it('does not fire duplicate field events for same field', () => {
    const tracker = new FormTracker({
      formName: 'contact',
      formLocation: 'hero',
    });

    tracker.trackStart();
    tracker.trackFieldComplete('name');
    tracker.trackFieldComplete('name'); // duplicate

    const fields = window.dataLayer!.filter(e => e.event === 'form_field_completed');
    expect(fields).toHaveLength(1);
  });

  it('tracks abandonment with last field and count', () => {
    const tracker = new FormTracker({
      formName: 'contact',
      formLocation: 'hero',
    });

    tracker.trackStart();
    tracker.trackFieldComplete('name');
    tracker.trackFieldComplete('email');
    tracker.trackAbandonment();

    const abandon = window.dataLayer!.find(e => e.event === 'form_abandoned');
    expect(abandon).toMatchObject({
      event: 'form_abandoned',
      form_name: 'contact',
      last_field: 'email',
      fields_completed: 2,
    });
  });

  it('does not fire abandonment if form was not started', () => {
    const tracker = new FormTracker({
      formName: 'contact',
      formLocation: 'hero',
    });

    tracker.trackAbandonment();

    expect(window.dataLayer).toHaveLength(0);
  });

  it('resets state after submit', () => {
    const tracker = new FormTracker({
      formName: 'contact',
      formLocation: 'hero',
    });

    tracker.trackStart();
    tracker.trackFieldComplete('name');
    tracker.trackSubmit();

    // After submit + reset, a new start should work
    tracker.trackStart();
    const starts = window.dataLayer!.filter(e => e.event === 'form_started');
    expect(starts).toHaveLength(2);
  });

  it('tracks form errors', () => {
    const tracker = new FormTracker({
      formName: 'contact',
      formLocation: 'hero',
    });

    tracker.trackError('validation', 'email');

    expect(window.dataLayer![0]).toMatchObject({
      event: 'form_error',
      form_name: 'contact',
      error_type: 'validation',
      field_name: 'email',
    });
  });
});

// ============================================
// AnalyticsEvents constants
// ============================================

describe('AnalyticsEvents', () => {
  it('has expected event names', () => {
    expect(AnalyticsEvents.PAGE_VIEW).toBe('page_view');
    expect(AnalyticsEvents.PHONE_CLICKED).toBe('phone_clicked');
    expect(AnalyticsEvents.FORM_SUBMITTED).toBe('form_submitted');
    expect(AnalyticsEvents.LEAD_GENERATED).toBe('lead_generated');
    expect(AnalyticsEvents.SCROLL_DEPTH).toBe('scroll_depth');
    expect(AnalyticsEvents.FORM_ABANDONED).toBe('form_abandoned');
  });
});
