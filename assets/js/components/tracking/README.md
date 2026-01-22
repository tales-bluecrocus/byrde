# Tracking System

Complete tracking system for Google Ads, Meta Ads, UTMs and GTM.

## Structure

### tracking.js

Core module that manages dataLayer and helper functions.

**Main functions:**

-   `initTracking()` - Initializes the system
-   `pushEvent(event, data)` - Sends event to dataLayer
-   `trackPageView(pageData)` - Pageview tracking
-   `trackConversion(name, data)` - Conversion tracking
-   `trackFormSubmit(formName, data)` - Form tracking
-   `trackClick(elementName, data)` - Click tracking

### utms.js

Manages UTM parameter capture and storage.

**Main functions:**

-   `initUtmTracking()` - Captures UTMs from URL automatically
-   `getCurrentUtms()` - Returns current UTMs
-   `getStoredUtms()` - Returns stored UTMs
-   `clearUtms()` - Clears saved UTMs

**Captured parameters:**

-   utm_source, utm_medium, utm_campaign, utm_term, utm_content
-   gclid (Google), fbclid (Facebook), msclkid (Microsoft)

### ads.js

Functions for Google Ads tracking.

**Main functions:**

-   `initGoogleAds(conversionId)` - Initializes Google Ads
-   `trackGoogleAdsConversion(label, data)` - Conversion tracking
-   `trackGoogleAdsLead(label, data)` - Lead tracking
-   `trackGoogleAdsPurchase(label, data)` - Purchase tracking
-   `trackGoogleAdsEvent(name, data)` - Custom event

### capi.js

Functions for Meta (Facebook) Ads tracking.

**Main functions:**

-   `initMetaPixel(pixelId)` - Initializes Facebook Pixel
-   `trackMetaEvent(eventName, data)` - Standard event
-   `trackMetaLead(data)` - Lead tracking
-   `trackMetaPurchase(data)` - Purchase tracking
-   `trackMetaAddToCart(data)` - Add to cart
-   `trackMetaViewContent(data)` - Content view

## How to Use

### 1. Initial Configuration

In [load.js](../load.js), uncomment and add your IDs:

```javascript
// Uncomment and add your IDs
initGoogleAds("AW-XXXXXXXXXX"); // Your Google Ads Conversion ID
initMetaPixel("XXXXXXXXXXXXXXX"); // Your Facebook Pixel ID
```

### 2. Conversion Tracking

**Google Ads:**

```javascript
import { trackGoogleAdsLead } from "./components/tracking/ads";

// On form submission
trackGoogleAdsLead("AW-XXXXX/YYYY", {
	value: 100,
	currency: "BRL",
});
```

**Meta Ads:**

```javascript
import { trackMetaLead } from "./components/tracking/capi";

// On form submission
trackMetaLead({
	value: 100,
	currency: "BRL",
	content_name: "Contact Form",
});
```

### 3. Custom Event Tracking

```javascript
import { pushEvent } from "./components/tracking/tracking";

// Custom event
pushEvent("custom_event", {
	category: "engagement",
	action: "video_play",
	label: "homepage_hero",
});
```

### 4. Access UTMs

```javascript
import { getCurrentUtms } from "./components/tracking/utms";

// Get current UTMs
const utms = getCurrentUtms();
console.log(utms);
// { utm_source: 'google', utm_medium: 'cpc', ... }
```

### 5. Form Tracking

```javascript
import { trackFormSubmit } from "./components/tracking/tracking";
import { trackGoogleAdsLead } from "./components/tracking/ads";
import { trackMetaLead } from "./components/tracking/capi";

document.querySelector("#contact-form").addEventListener("submit", (e) => {
	// Generic tracking
	trackFormSubmit("contact_form", {
		form_location: "homepage",
	});

	// Google Ads
	trackGoogleAdsLead("AW-XXXXX/YYYY");

	// Meta Ads
	trackMetaLead({ content_name: "Contact Form" });
});
```

## DataLayer

All events are automatically sent to `window.dataLayer`, allowing you to configure triggers in GTM.

**DataLayer structure:**

```javascript
{
  event: 'event_name',
  // ... event data
}
```

## Available Events

| Event                  | Description               |
| ----------------------- | ----------------------- |
| `pageview`              | Page view  |
| `conversion`            | Generic conversion      |
| `form_submit`           | Form submission     |
| `click`                 | Element click      |
| `google_ads_conversion` | Google Ads conversion    |
| `google_ads_event`      | Google Ads event       |
| `meta_ads_event`        | Meta Ads event         |
| `meta_custom_event`     | Meta custom event |

## Storage

**UTMs are stored in:**

-   localStorage: `utm_params`
-   Cookie: `utm_params` (fallback, 30 days)

**Data structure:**

```javascript
{
  utm_source: 'google',
  utm_medium: 'cpc',
  utm_campaign: 'summer_sale',
  gclid: 'xxx',
  timestamp: '2026-01-09T...'
}
```

## Practical Examples

### E-commerce

```javascript
import { trackGoogleAdsPurchase } from "./components/tracking/ads";
import { trackMetaPurchase } from "./components/tracking/capi";

// On checkout completion
const purchaseData = {
	value: 299.9,
	currency: "BRL",
	transaction_id: "ORDER-123",
	items: [{ id: "SKU-001", name: "Product Name", quantity: 1, price: 299.9 }],
};

trackGoogleAdsPurchase("AW-XXXXX/YYYY", purchaseData);
trackMetaPurchase(purchaseData);
```

### Lead Landing Page

```javascript
import { trackGoogleAdsLead } from "./components/tracking/ads";
import { trackMetaLead } from "./components/tracking/capi";
import { trackFormSubmit } from "./components/tracking/tracking";

// Capture form
form.addEventListener("submit", async (e) => {
	e.preventDefault();

	// Tracking
	trackFormSubmit("lead_form");
	trackGoogleAdsLead("AW-XXXXX/YYYY");
	trackMetaLead();

	// Send data...
});
```

## Debugging

All modules log their actions to console. Open DevTools to see:

-   Captured UTMs
-   Sent events
-   Registered conversions

## GTM Integration

In GTM, you can create triggers based on dataLayer events:

**Trigger example:**

-   Type: Custom Event
-   Event name: `form_submit`
-   Condition: `form_name` equals `contact_form`
