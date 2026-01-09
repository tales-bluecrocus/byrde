/**
 * Google Ads Tracking Module
 * Functions for tracking Google Ads conversions and events
 */

import { pushEvent } from "./tracking";
import debug from "../debug/debug";

/**
 * Send conversion event to Google Ads
 * @param {string} conversionLabel - Google Ads conversion label
 * @param {object} conversionData - Conversion data
 */
export function trackGoogleAdsConversion(conversionLabel, conversionData = {}) {
	if (!window.gtag) {
		debug.warn("gtag is not available");
		return;
	}

	const { value = 0, currency = "BRL", transaction_id = "" } = conversionData;

	// Send to Google Ads via gtag
	window.gtag("event", "conversion", {
		send_to: conversionLabel,
		value: value,
		currency: currency,
		transaction_id: transaction_id,
		...conversionData,
	});

	// Also send to dataLayer for GTM
	pushEvent("google_ads_conversion", {
		conversion_label: conversionLabel,
		...conversionData,
	});

	debug.success(
		"Google Ads conversion tracked:",
		conversionLabel,
		conversionData
	);
}

/**
 * Track custom event for Google Ads
 * @param {string} eventName - Event name
 * @param {object} eventData - Event data
 */
export function trackGoogleAdsEvent(eventName, eventData = {}) {
	if (!window.gtag) {
		debug.warn("gtag is not available");
		return;
	}

	window.gtag("event", eventName, eventData);

	// Also send to dataLayer
	pushEvent("google_ads_event", {
		event_name: eventName,
		...eventData,
	});

	debug.success("Google Ads event tracked:", eventName, eventData);
}

/**
 * Track lead/form for Google Ads
 * @param {string} conversionLabel - Conversion label
 * @param {object} leadData - Lead data
 */
export function trackGoogleAdsLead(conversionLabel, leadData = {}) {
	trackGoogleAdsConversion(conversionLabel, {
		event_category: "lead",
		...leadData,
	});
}

/**
 * Track purchase/transaction for Google Ads
 * @param {string} conversionLabel - Conversion label
 * @param {object} purchaseData - Purchase data
 */
export function trackGoogleAdsPurchase(conversionLabel, purchaseData = {}) {
	const {
		value,
		currency = "BRL",
		transaction_id,
		items = [],
		...otherData
	} = purchaseData;

	trackGoogleAdsConversion(conversionLabel, {
		value: value,
		currency: currency,
		transaction_id: transaction_id,
		items: items,
		event_category: "purchase",
		...otherData,
	});
}

/**
 * Track button/CTA click for Google Ads
 * @param {string} buttonName - Button name
 * @param {object} clickData - Click data
 */
export function trackGoogleAdsButtonClick(buttonName, clickData = {}) {
	trackGoogleAdsEvent("button_click", {
		button_name: buttonName,
		...clickData,
	});
}

/**
 * Track pageview for Google Ads
 * @param {object} pageData - Page data
 */
export function trackGoogleAdsPageView(pageData = {}) {
	if (!window.gtag) {
		debug.warn("gtag is not available");
		return;
	}

	window.gtag("event", "page_view", {
		page_title: document.title,
		page_location: window.location.href,
		page_path: window.location.pathname,
		...pageData,
	});
}

/**
 * Initialize Google Ads tracking
 * Setup gtag if not already configured
 */
export function initGoogleAds(conversionId = "") {
	// Check if gtag already exists
	if (!window.gtag) {
		window.dataLayer = window.dataLayer || [];
		window.gtag = function () {
			window.dataLayer.push(arguments);
		};
		window.gtag("js", new Date());
	}

	// Configure conversion if ID provided
	if (conversionId) {
		window.gtag("config", conversionId);
		debug.success("Google Ads initialized with ID:", conversionId);
	}
}
