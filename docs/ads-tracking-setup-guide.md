# Guia de Configuração de Tracking — Time de Ads

> Todo o tracking de conversões é gerenciado via **GTM (Google Tag Manager)**.
> O código do site apenas pusha eventos ricos para o `dataLayer` — o GTM decide quais tags disparar.

---

## Stack de tracking

| Ferramenta | Gerenciado por | Notas |
| ---------- | -------------- | ----- |
| GA4 | **Google Site Kit** (plugin WP) | Injetado automaticamente |
| GTM | **Google Site Kit** (plugin WP) | Idem |
| Google Ads Conversions | **GTM** (time de ads) | Triggers + Tags configurados no GTM |
| Facebook Pixel | **GTM** (time de ads) | Idem |

O tema **não** injeta scripts de GA4, Google Ads ou FB Pixel diretamente. Tudo passa pelo GTM.

---

## Eventos que o site pusha para o dataLayer

### Form Submission

Quando o formulário é enviado com sucesso, o site pusha 2 eventos:

```js
// Evento 1
dataLayer.push({
  event: 'form_submitted',
  form_name: 'hero_contact_form',
  form_location: 'hero',
  service_type: 'junk-removal',  // serviço configurado no editor
  utm_source: '...',
  utm_medium: '...',
  utm_campaign: '...'
});

// Evento 2
dataLayer.push({
  event: 'lead_generated',
  lead_source: 'hero',
  service_requested: 'junk-removal',
  utm_source: '...',
  utm_medium: '...',
  utm_campaign: '...',
  gclid: '...'
});
```

### Phone Click

Quando o usuário clica em qualquer link/botão de telefone:

```js
dataLayer.push({
  event: 'phone_clicked',
  cta_location: 'header_cta',  // ou 'hero_form_header', 'mid_cta', etc.
  page_location: '/',
  utm_source: '...',
  utm_medium: '...',
  utm_campaign: '...',
  gclid: '...'
});
```

### Outros eventos disponíveis

| Evento | Quando dispara |
| ------ | -------------- |
| `cta_clicked` | Qualquer CTA clicado |
| `email_clicked` | Link de email clicado |
| `social_clicked` | Link de rede social clicado |
| `scroll_depth` | Scroll atinge 25%, 50%, 75%, 90%, 100% |
| `section_viewed` | Seção entra no viewport (50%+) |
| `form_started` | Primeira interação com o form |
| `form_field_completed` | Campo do form preenchido |
| `form_error` | Erro de validação ou envio |
| `faq_expanded` | Pergunta do FAQ aberta |
| `service_card_clicked` | Card de serviço clicado |

---

## O que o time de ads precisa configurar no GTM

### 1. Google Ads — Conversion Action para Form

1. **Google Ads**: Goals > Conversions > **+ New conversion action** > Website
2. Selecionar **"Set up conversions manually using code"**
3. Configurar:

| Campo | Valor |
| ----- | ----- |
| Name | `Lead - Form Submission` |
| Category | **Submit lead form** |
| Value | Valor médio do lead (ex: $50) ou "Don't use a value" |
| Count | **One** |
| Attribution model | **Data-driven** |

4. **No GTM**: Criar Tag → Google Ads Conversion Tracking
   - Trigger: **Custom Event** → `form_submitted` (do dataLayer)
   - Ou usar o trigger nativo **Form Submission** (All Forms)

### 2. Google Ads — Conversion Action para Phone

1. Repetir o processo acima com:

| Campo | Valor |
| ----- | ----- |
| Name | `Lead - Phone Call` |
| Category | **Phone call leads** |

2. **No GTM**: Criar Tag → Google Ads Conversion Tracking
   - Trigger: **Custom Event** → `phone_clicked` (do dataLayer)
   - Ou usar o trigger nativo **Click - Just Links** (URL contains `tel:`)

### 3. Facebook Pixel (se aplicável)

1. **No GTM**: Criar Tag → Facebook Pixel → Lead
   - Trigger: **Custom Event** → `form_submitted`
2. Criar Tag → Facebook Pixel → Contact
   - Trigger: **Custom Event** → `phone_clicked`

### 4. GA4 — Marcar Key Events

- GA4 Admin > Events > Encontrar `lead_generated` > Marcar como **Key Event**
- Fazer o mesmo para `phone_clicked`

### 5. Vincular Google Ads ao GA4

- Google Ads > Tools > Data Manager > **Google Analytics (GA4) linking**
- Importar os Key Events do GA4 para o Google Ads (opcional mas recomendado)

---

## Como testar

| Plataforma | Ferramenta | Como testar |
| ---------- | ---------- | ----------- |
| dataLayer | Console do browser | `dataLayer.filter(e => e.event)` após submeter form/clicar telefone |
| GTM | **GTM Preview Mode** | Verificar que os triggers disparam e as tags são acionadas |
| GA4 | **DebugView** | `?debug_mode=true` → confirmar eventos em tempo real |
| Google Ads | [Tag Assistant](https://tagassistant.google.com/) | Confirmar que as conversões aparecem |

---

## Atribuição UTM / Click IDs

O site captura automaticamente e armazena:

- **UTM params** (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`) → sessionStorage
- **Click IDs** (`gclid`, `fbclid`, `msclkid`) → localStorage (90 dias)

Esses dados são:
1. Incluídos em cada evento do dataLayer (para enriquecer as tags do GTM)
2. Enviados junto com o form submission para o backend (para atribuição offline)

---

## Resumo visual

```
Usuário submete form
       │
       └── dataLayer.push({ event: 'form_submitted', ... })
                │
                └── GTM ─── Trigger: form_submitted
                      ├── Tag: Google Ads Conversion (Form)
                      ├── Tag: GA4 Event
                      └── Tag: FB Pixel Lead


Usuário clica no telefone
       │
       └── dataLayer.push({ event: 'phone_clicked', ... })
                │
                └── GTM ─── Trigger: phone_clicked
                      ├── Tag: Google Ads Conversion (Phone)
                      ├── Tag: GA4 Event
                      └── Tag: FB Pixel Contact
```

Toda a lógica de qual tag disparar, qual conversion label usar, e qual pixel ID usar fica **100% no GTM** — o código do site só alimenta o dataLayer com dados ricos.
