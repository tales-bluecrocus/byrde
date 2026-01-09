/**
 * Tracking Core Module
 * Manages dataLayer and provides helper functions for tracking
 */

import debug from "../debug/debug";

/**
 * Initialize GTM dataLayer
 */
export function initDataLayer() {
	window.dataLayer = window.dataLayer || [];
}

/**
 * Push events to dataLayer
 * @param {string} event - Event name
 * @param {object} data - Additional event data
 */
export function pushEvent(event, data = {}) {
	if (!window.dataLayer) {
		debug.warn("dataLayer not initialized");
		return;
	}

	window.dataLayer.push({
		event: event,
		...data,
	});

	debug.log("Event pushed:", event, data);
}

/**
 * Push custom data to dataLayer
 * @param {object} data - Data to send
 */
export function pushData(data) {
	if (!window.dataLayer) {
		debug.warn("dataLayer not initialized");
		return;
	}

	window.dataLayer.push(data);
}

/**
 * Track pageview
 * @param {object} pageData - Page data
 */
export function trackPageView(pageData = {}) {
	pushEvent("pageview", {
		page_title: document.title,
		page_location: window.location.href,
		page_path: window.location.pathname,
		...pageData,
	});
}

/**
 * Track generic conversion
 * @param {string} conversionName - Conversion name
 * @param {object} conversionData - Conversion data
 */
export function trackConversion(conversionName, conversionData = {}) {
	pushEvent("conversion", {
		conversion_name: conversionName,
		...conversionData,
	});
}

/**
 * Track form submission
 * @param {string} formName - Form name
 * @param {object} formData - Form data
 */
export function trackFormSubmit(formName, formData = {}) {
	pushEvent("form_submit", {
		form_name: formName,
		...formData,
	});
}

/**
 * Track button/link click
 * @param {string} elementName - Element name
 * @param {object} clickData - Click data
 */
export function trackClick(elementName, clickData = {}) {
	pushEvent("click", {
		element_name: elementName,
		...clickData,
	});
}

/**
 * Initialize tracking system
 */
export function initTracking() {
	initDataLayer();
	debug.success("Tracking system initialized");
}

/**
 * Initialize Google Tag Manager
 * @param {string} gtmId - GTM Container ID (GTM-XXXXXXX)
 */
export function initGTM(gtmId = "") {
	if (!gtmId) {
		debug.warn("GTM ID not provided");
		return;
	}

	// GTM script injection
	(function (w, d, s, l, i) {
		w[l] = w[l] || [];
		w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
		var f = d.getElementsByTagName(s)[0],
			j = d.createElement(s),
			dl = l != "dataLayer" ? "&l=" + l : "";
		j.async = true;
		j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;
		f.parentNode.insertBefore(j, f);
	})(window, document, "script", "dataLayer", gtmId);

	debug.success("Google Tag Manager initialized with ID:", gtmId);
}

/**
 * Initialize Google Analytics
 * @param {string} gaId - GA Measurement ID (G-XXXXXXXXXX or UA-XXXXXXXXX)
 */
export function initGA(gaId = "") {
	if (!gaId) {
		debug.warn("GA ID not provided");
		return;
	}

	// Check if GA4 or Universal Analytics
	const isGA4 = gaId.startsWith("G-");

	if (isGA4) {
		// GA4 script injection
		const script = document.createElement("script");
		script.async = true;
		script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
		document.head.appendChild(script);

		window.dataLayer = window.dataLayer || [];
		window.gtag = function () {
			dataLayer.push(arguments);
		};
		window.gtag("js", new Date());
		window.gtag("config", gaId);

		debug.success("Google Analytics 4 initialized with ID:", gaId);
	} else {
		// Universal Analytics script injection
		window.ga =
			window.ga ||
			function () {
				(ga.q = ga.q || []).push(arguments);
			};
		ga.l = +new Date();
		ga("create", gaId, "auto");
		ga("send", "pageview");

		const script = document.createElement("script");
		script.async = true;
		script.src = "https://www.google-analytics.com/analytics.js";
		document.head.appendChild(script);

		debug.success("Universal Analytics initialized with ID:", gaId);
	}
}
