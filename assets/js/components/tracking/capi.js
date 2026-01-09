/**
 * Meta (Facebook) Ads Tracking Module
 * Functions for tracking with Facebook Pixel and Conversions API
 */

import { pushEvent } from "./tracking";
import debug from "../debug/debug";

/**
 * Check if Facebook Pixel is available
 * @returns {boolean}
 */
function isFbqAvailable() {
	return typeof window.fbq === "function";
}

/**
 * Send event to Facebook Pixel
 * @param {string} eventName - Event name
 * @param {object} eventData - Event data
 */
export function trackMetaEvent(eventName, eventData = {}) {
	if (!isFbqAvailable()) {
		debug.warn("Facebook Pixel (fbq) is not available");
		return;
	}

	// Send to Facebook Pixel
	window.fbq("track", eventName, eventData);

	// Also send to dataLayer for GTM
	pushEvent("meta_ads_event", {
		event_name: eventName,
		...eventData,
	});

	debug.success("Meta event tracked:", eventName, eventData);
}

/**
 * Send custom event to Facebook Pixel
 * @param {string} eventName - Custom event name
 * @param {object} eventData - Event data
 */
export function trackMetaCustomEvent(eventName, eventData = {}) {
	if (!isFbqAvailable()) {
		debug.warn("Facebook Pixel (fbq) is not available");
		return;
	}

	// Send as custom event
	window.fbq("trackCustom", eventName, eventData);

	// Send to dataLayer
	pushEvent("meta_custom_event", {
		event_name: eventName,
		...eventData,
	});

	debug.success("Meta custom event tracked:", eventName, eventData);
}

/**
 * Track PageView for Meta
 */
export function trackMetaPageView() {
	if (!isFbqAvailable()) {
		debug.warn("Facebook Pixel (fbq) is not available");
		return;
	}

	window.fbq("track", "PageView");
	debug.success("Meta PageView tracked");
}

/**
 * Track Lead for Meta
 * @param {object} leadData - Lead data
 */
export function trackMetaLead(leadData = {}) {
	trackMetaEvent("Lead", {
		content_category: "lead_form",
		...leadData,
	});
}

/**
 * Track contact/form for Meta
 * @param {object} contactData - Contact data
 */
export function trackMetaContact(contactData = {}) {
	trackMetaEvent("Contact", contactData);
}

/**
 * Track purchase/conversion for Meta
 * @param {object} purchaseData - Purchase data
 */
export function trackMetaPurchase(purchaseData = {}) {
	const { value, currency = "BRL", ...otherData } = purchaseData;

	trackMetaEvent("Purchase", {
		value: value,
		currency: currency,
		...otherData,
	});
}

/**
 * Track checkout initiation for Meta
 * @param {object} checkoutData - Checkout data
 */
export function trackMetaInitiateCheckout(checkoutData = {}) {
	trackMetaEvent("InitiateCheckout", checkoutData);
}

/**
 * Track add to cart for Meta
 * @param {object} cartData - Added product data
 */
export function trackMetaAddToCart(cartData = {}) {
	trackMetaEvent("AddToCart", cartData);
}

/**
 * Track content view for Meta
 * @param {object} contentData - Content data
 */
export function trackMetaViewContent(contentData = {}) {
	trackMetaEvent("ViewContent", contentData);
}

/**
 * Track search for Meta
 * @param {object} searchData - Search data
 */
export function trackMetaSearch(searchData = {}) {
	trackMetaEvent("Search", searchData);
}

/**
 * Track complete registration for Meta
 * @param {object} registrationData - Registration data
 */
export function trackMetaCompleteRegistration(registrationData = {}) {
	trackMetaEvent("CompleteRegistration", registrationData);
}

/**
 * Initialize Facebook Pixel
 * @param {string} pixelId - Facebook Pixel ID
 */
export function initMetaPixel(pixelId = "") {
	if (!pixelId) {
		debug.warn("Meta Pixel ID not provided");
		return;
	}

	// Initialize Facebook Pixel if it doesn't exist
	if (!isFbqAvailable()) {
		!(function (f, b, e, v, n, t, s) {
			if (f.fbq) return;
			n = f.fbq = function () {
				n.callMethod
					? n.callMethod.apply(n, arguments)
					: n.queue.push(arguments);
			};
			if (!f._fbq) f._fbq = n;
			n.push = n;
			n.loaded = !0;
			n.version = "2.0";
			n.queue = [];
			t = b.createElement(e);
			t.async = !0;
			t.src = v;
			s = b.getElementsByTagName(e)[0];
			s.parentNode.insertBefore(t, s);
		})(
			window,
			document,
			"script",
			"https://connect.facebook.net/en_US/fbevents.js"
		);
	}

	// Initialize with Pixel ID
	window.fbq("init", pixelId);

	debug.success("Meta Pixel initialized with ID:", pixelId);
}
