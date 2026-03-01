/**
 * useAnalytics hooks tests
 *
 * Tests: useAdAttributionCapture, useScrollDepthTracking, useFormTracking.
 */

import { renderHook, act } from '@testing-library/react';
import {
  useAdAttributionCapture,
  useScrollDepthTracking,
  useFormTracking,
} from '../useAnalytics';

function setURL(search: string, pathname = '/lp/test-page') {
  window.history.pushState({}, '', `${pathname}${search}`);
}

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  window.dataLayer = [];
  setURL('');
});

// ============================================
// useAdAttributionCapture
// ============================================

describe('useAdAttributionCapture', () => {
  it('calls captureAdAttribution on mount', () => {
    setURL('?utm_source=google&utm_medium=cpc');

    renderHook(() => useAdAttributionCapture());

    // Verify sessionStorage was populated
    const stored = JSON.parse(sessionStorage.getItem('byrde_ad_attribution')!);
    expect(stored.utm_source).toBe('google');
    expect(stored.utm_medium).toBe('cpc');
  });

  it('captures click IDs in localStorage', () => {
    setURL('?gclid=test_gclid');

    renderHook(() => useAdAttributionCapture());

    const stored = JSON.parse(localStorage.getItem('byrde_click_ids')!);
    expect(stored.gclid).toBe('test_gclid');
  });
});

// ============================================
// useScrollDepthTracking
// ============================================

describe('useScrollDepthTracking', () => {
  it('attaches scroll listener on mount', () => {
    const addSpy = jest.spyOn(window, 'addEventListener');

    const { unmount } = renderHook(() => useScrollDepthTracking());

    expect(addSpy).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function),
      { passive: true }
    );

    addSpy.mockRestore();
    unmount();
  });

  it('removes scroll listener on unmount', () => {
    const removeSpy = jest.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useScrollDepthTracking());
    unmount();

    expect(removeSpy).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function)
    );

    removeSpy.mockRestore();
  });
});

// ============================================
// useFormTracking
// ============================================

describe('useFormTracking', () => {
  const config = { formName: 'contact', formLocation: 'hero' };

  it('returns tracking methods', () => {
    const { result } = renderHook(() => useFormTracking(config));

    expect(result.current.trackStart).toBeInstanceOf(Function);
    expect(result.current.trackFieldComplete).toBeInstanceOf(Function);
    expect(result.current.trackSubmit).toBeInstanceOf(Function);
    expect(result.current.trackError).toBeInstanceOf(Function);
  });

  it('trackStart pushes form_started event', () => {
    const { result } = renderHook(() => useFormTracking(config));

    act(() => {
      result.current.trackStart();
    });

    expect(window.dataLayer![0]).toMatchObject({
      event: 'form_started',
      form_name: 'contact',
      form_location: 'hero',
    });
  });

  it('trackFieldComplete pushes form_field_completed event', () => {
    const { result } = renderHook(() => useFormTracking(config));

    act(() => {
      result.current.trackStart();
      result.current.trackFieldComplete('email');
    });

    const fieldEvent = window.dataLayer!.find(e => e.event === 'form_field_completed');
    expect(fieldEvent).toMatchObject({
      event: 'form_field_completed',
      form_name: 'contact',
      field_name: 'email',
    });
  });

  it('trackSubmit pushes form_submitted and lead_generated events', () => {
    const { result } = renderHook(() => useFormTracking(config));

    act(() => {
      result.current.trackStart();
      result.current.trackSubmit({ service: 'plumbing' });
    });

    const submitted = window.dataLayer!.find(e => e.event === 'form_submitted');
    const lead = window.dataLayer!.find(e => e.event === 'lead_generated');

    expect(submitted).toMatchObject({
      event: 'form_submitted',
      form_name: 'contact',
      form_location: 'hero',
    });
    expect(lead).toBeDefined();
  });

  it('tracks abandonment on unmount if form was started', () => {
    const { result, unmount } = renderHook(() => useFormTracking(config));

    act(() => {
      result.current.trackStart();
      result.current.trackFieldComplete('name');
    });

    unmount();

    const abandon = window.dataLayer!.find(e => e.event === 'form_abandoned');
    expect(abandon).toMatchObject({
      event: 'form_abandoned',
      form_name: 'contact',
      last_field: 'name',
      fields_completed: 1,
    });
  });

  it('trackError pushes form_error event', () => {
    const { result } = renderHook(() => useFormTracking(config));

    act(() => {
      result.current.trackError('validation', 'email');
    });

    expect(window.dataLayer![0]).toMatchObject({
      event: 'form_error',
      form_name: 'contact',
      error_type: 'validation',
      field_name: 'email',
    });
  });
});
