/**
 * UTM Parameters Tracking Module
 * Captures and stores UTM parameters from URL
 */

import { pushData } from "./tracking";
import debug from "../debug/debug";

// Standard UTM parameters
const UTM_PARAMS = [
	"utm_source",
	"utm_medium",
	"utm_campaign",
	"utm_term",
	"utm_content",
	"gclid", // Google Click ID
	"fbclid", // Facebook Click ID
	"msclkid", // Microsoft Click ID
];

/**
 * Get URL parameters
 * @returns {object} Object with URL parameters
 */
function getUrlParams() {
	const params = {};
	const urlParams = new URLSearchParams(window.location.search);

	UTM_PARAMS.forEach((param) => {
		const value = urlParams.get(param);
		if (value) {
			params[param] = value;
		}
	});

	return params;
}

/**
 * Save UTMs to localStorage
 * @param {object} utms - Object with UTMs
 */
function saveUtmsToStorage(utms) {
	if (Object.keys(utms).length === 0) return;

	try {
		// Save with timestamp
		const utmData = {
			...utms,
			timestamp: new Date().toISOString(),
		};

		localStorage.setItem("utm_params", JSON.stringify(utmData));
	} catch (e) {
		debug.error("Error saving UTMs:", e);
	}
}

/**
 * Save UTMs to cookie (fallback for localStorage)
 * @param {object} utms - Object with UTMs
 * @param {number} days - Expiration days (default: 30)
 */
function saveUtmsToCookie(utms, days = 30) {
	if (Object.keys(utms).length === 0) return;

	try {
		const expires = new Date();
		expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

		const utmString = JSON.stringify(utms);
		document.cookie = `utm_params=${encodeURIComponent(
			utmString
		)}; expires=${expires.toUTCString()}; path=/`;
	} catch (e) {
		debug.error("Error saving UTMs to cookie:", e);
	}
}

/**
 * Retrieve UTMs from localStorage
 * @returns {object|null} Object with UTMs or null
 */
export function getStoredUtms() {
	try {
		const stored = localStorage.getItem("utm_params");
		if (stored) {
			return JSON.parse(stored);
		}
	} catch (e) {
		debug.error("Error retrieving UTMs:", e);
	}

	// Fallback to cookie
	try {
		const cookies = document.cookie.split(";");
		for (let cookie of cookies) {
			const [name, value] = cookie.trim().split("=");
			if (name === "utm_params") {
				return JSON.parse(decodeURIComponent(value));
			}
		}
	} catch (e) {
		debug.error("Error retrieving UTMs from cookie:", e);
	}

	return null;
}

/**
 * Clear stored UTMs
 */
export function clearUtms() {
	try {
		localStorage.removeItem("utm_params");
		document.cookie =
			"utm_params=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
	} catch (e) {
		debug.error("Error clearing UTMs:", e);
	}
}

/**
 * Initialize UTM tracking
 * Captures UTMs from URL and sends to dataLayer
 */
export function initUtmTracking() {
	// Capture UTMs from current URL
	const currentUtms = getUrlParams();

	// If found UTMs in URL, save them
	if (Object.keys(currentUtms).length > 0) {
		saveUtmsToStorage(currentUtms);
		saveUtmsToCookie(currentUtms);

		// Push to dataLayer
		pushData({
			utm_data: currentUtms,
		});

		debug.success("UTMs captured:", currentUtms);
	}

	// Retrieve stored UTMs and add to dataLayer
	const storedUtms = getStoredUtms();
	if (storedUtms) {
		pushData({
			stored_utm_data: storedUtms,
		});
	}
}

/**
 * Return current UTMs (from URL or stored)
 * @returns {object} Object with UTMs
 */
export function getCurrentUtms() {
	const urlUtms = getUrlParams();

	// If has UTMs in URL, use them
	if (Object.keys(urlUtms).length > 0) {
		return urlUtms;
	}

	// Otherwise, return stored ones
	return getStoredUtms() || {};
}
