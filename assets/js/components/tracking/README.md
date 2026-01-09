# Sistema de Tracking

Sistema completo de tracking para Google Ads, Meta Ads, UTMs e GTM.

## Estrutura

### 📊 tracking.js

Módulo core que gerencia o dataLayer e funções helpers.

**Funções principais:**

-   `initTracking()` - Inicializa o sistema
-   `pushEvent(event, data)` - Envia evento para dataLayer
-   `trackPageView(pageData)` - Tracking de pageview
-   `trackConversion(name, data)` - Tracking de conversão
-   `trackFormSubmit(formName, data)` - Tracking de formulário
-   `trackClick(elementName, data)` - Tracking de cliques

### 🔗 utms.js

Gerencia captura e armazenamento de parâmetros UTM.

**Funções principais:**

-   `initUtmTracking()` - Captura UTMs da URL automaticamente
-   `getCurrentUtms()` - Retorna UTMs atuais
-   `getStoredUtms()` - Retorna UTMs armazenados
-   `clearUtms()` - Limpa UTMs salvos

**Parâmetros capturados:**

-   utm_source, utm_medium, utm_campaign, utm_term, utm_content
-   gclid (Google), fbclid (Facebook), msclkid (Microsoft)

### 📱 ads.js

Funções para Google Ads tracking.

**Funções principais:**

-   `initGoogleAds(conversionId)` - Inicializa Google Ads
-   `trackGoogleAdsConversion(label, data)` - Tracking de conversão
-   `trackGoogleAdsLead(label, data)` - Tracking de lead
-   `trackGoogleAdsPurchase(label, data)` - Tracking de compra
-   `trackGoogleAdsEvent(name, data)` - Evento customizado

### 👥 capi.js

Funções para Meta (Facebook) Ads tracking.

**Funções principais:**

-   `initMetaPixel(pixelId)` - Inicializa Facebook Pixel
-   `trackMetaEvent(eventName, data)` - Evento padrão
-   `trackMetaLead(data)` - Tracking de lead
-   `trackMetaPurchase(data)` - Tracking de compra
-   `trackMetaAddToCart(data)` - Adicionar ao carrinho
-   `trackMetaViewContent(data)` - Visualização de conteúdo

## Como Usar

### 1. Configuração Inicial

No [load.js](../load.js), descomentar e adicionar seus IDs:

```javascript
// Descomentar e adicionar seus IDs
initGoogleAds("AW-XXXXXXXXXX"); // Seu Google Ads Conversion ID
initMetaPixel("XXXXXXXXXXXXXXX"); // Seu Facebook Pixel ID
```

### 2. Tracking de Conversões

**Google Ads:**

```javascript
import { trackGoogleAdsLead } from "./components/tracking/ads";

// Ao enviar formulário
trackGoogleAdsLead("AW-XXXXX/YYYY", {
	value: 100,
	currency: "BRL",
});
```

**Meta Ads:**

```javascript
import { trackMetaLead } from "./components/tracking/capi";

// Ao enviar formulário
trackMetaLead({
	value: 100,
	currency: "BRL",
	content_name: "Contact Form",
});
```

### 3. Tracking de Eventos Customizados

```javascript
import { pushEvent } from "./components/tracking/tracking";

// Evento customizado
pushEvent("custom_event", {
	category: "engagement",
	action: "video_play",
	label: "homepage_hero",
});
```

### 4. Acessar UTMs

```javascript
import { getCurrentUtms } from "./components/tracking/utms";

// Pegar UTMs atuais
const utms = getCurrentUtms();
console.log(utms);
// { utm_source: 'google', utm_medium: 'cpc', ... }
```

### 5. Tracking de Formulários

```javascript
import { trackFormSubmit } from "./components/tracking/tracking";
import { trackGoogleAdsLead } from "./components/tracking/ads";
import { trackMetaLead } from "./components/tracking/capi";

document.querySelector("#contact-form").addEventListener("submit", (e) => {
	// Tracking genérico
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

Todos os eventos são automaticamente enviados para `window.dataLayer`, permitindo configurar triggers no GTM.

**Estrutura do dataLayer:**

```javascript
{
  event: 'nome_do_evento',
  // ... dados do evento
}
```

## Eventos Disponíveis

| Evento                  | Descrição               |
| ----------------------- | ----------------------- |
| `pageview`              | Visualização de página  |
| `conversion`            | Conversão genérica      |
| `form_submit`           | Envio de formulário     |
| `click`                 | Clique em elemento      |
| `google_ads_conversion` | Conversão Google Ads    |
| `google_ads_event`      | Evento Google Ads       |
| `meta_ads_event`        | Evento Meta Ads         |
| `meta_custom_event`     | Evento customizado Meta |

## Storage

**UTMs são armazenados em:**

-   localStorage: `utm_params`
-   Cookie: `utm_params` (fallback, 30 dias)

**Estrutura dos dados:**

```javascript
{
  utm_source: 'google',
  utm_medium: 'cpc',
  utm_campaign: 'summer_sale',
  gclid: 'xxx',
  timestamp: '2026-01-09T...'
}
```

## Exemplos Práticos

### E-commerce

```javascript
import { trackGoogleAdsPurchase } from "./components/tracking/ads";
import { trackMetaPurchase } from "./components/tracking/capi";

// Ao finalizar compra
const purchaseData = {
	value: 299.9,
	currency: "BRL",
	transaction_id: "ORDER-123",
	items: [{ id: "SKU-001", name: "Product Name", quantity: 1, price: 299.9 }],
};

trackGoogleAdsPurchase("AW-XXXXX/YYYY", purchaseData);
trackMetaPurchase(purchaseData);
```

### Landing Page de Lead

```javascript
import { trackGoogleAdsLead } from "./components/tracking/ads";
import { trackMetaLead } from "./components/tracking/capi";
import { trackFormSubmit } from "./components/tracking/tracking";

// Formulário de captura
form.addEventListener("submit", async (e) => {
	e.preventDefault();

	// Tracking
	trackFormSubmit("lead_form");
	trackGoogleAdsLead("AW-XXXXX/YYYY");
	trackMetaLead();

	// Enviar dados...
});
```

## Debugging

Todos os módulos fazem `console.log` das ações. Abra o DevTools para ver:

-   UTMs capturados
-   Eventos enviados
-   Conversões registradas

## GTM Integration

No GTM, você pode criar triggers baseados nos eventos do dataLayer:

**Trigger exemplo:**

-   Tipo: Evento Personalizado
-   Nome do evento: `form_submit`
-   Condição: `form_name` equals `contact_form`
