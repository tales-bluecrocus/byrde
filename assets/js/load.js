import "../scss/load.scss";
import { initHeader } from "./components//general/header";
import { initFooter } from "./components//general/footer";
import { initAnimations } from "./components/general/animations";

// Tracking imports
import { initTracking, initGTM, initGA } from "./components/tracking/tracking";
import { initUtmTracking } from "./components/tracking/utms";
import { initGoogleAds } from "./components/tracking/ads";
import { initMetaPixel } from "./components/tracking/capi";

// Initialize everything on DOM ready
document.addEventListener("DOMContentLoaded", () => {
	// Initialize tracking system first
	initTracking();
	initUtmTracking();

	if (window.byrdeTracking) {
		const { gtmId, gaId, googleAdsId, metaPixelId } = window.byrdeTracking;

		// Priority 1: GTM (if configured, use only GTM)
		if (gtmId) {
			initGTM(gtmId);
		} else {
			// Legacy Mode: Load individual tracking codes
			if (gaId) {
				initGA(gaId);
			}

			if (googleAdsId) {
				initGoogleAds(googleAdsId);
			}

			if (metaPixelId) {
				initMetaPixel(metaPixelId);
			}
		}
	}

	// Always initialize core components
	initHeader();
	initFooter();
	initAnimations();
});
