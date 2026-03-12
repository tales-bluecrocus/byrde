# Byrde Plugin - Development Instructions

## Architecture

WordPress plugin with headless landing pages: PHP backend (CPT, data storage, REST API) with React frontend rendering all UI. Runs alongside any active theme — landing pages use standalone templates that bypass the theme entirely.

PHP backend uses PSR-4 autoloading via Composer with `Byrde\` namespace. All classes live in `src/`. Frontend is a React 19 + TypeScript app built with Vite, using 7 nested context providers for state management.

## Tech Stack

- **CMS**: WordPress 6.x (tested up to 6.7)
- **Backend**: PHP 8.0+ with PSR-4 autoloading (Composer)
- **Frontend**: React 19 + TypeScript 5.9 + Vite 7
- **Styling**: Tailwind CSS 4 + shadcn/ui (Radix primitives)
- **State**: React Context API (7 providers: Settings, GlobalConfig, SectionTheme, HeaderConfig, Content, Sidebar, Toast)
- **Settings**: Native WordPress options (`byrde_theme_settings` in `wp_options`)
- **Email**: Postmark API (primary) + `wp_mail()` (fallback)
- **Auto-updates**: Plugin Update Checker v5 (Composer) via GitHub Releases

## Key Directories

- `src/` — PHP classes (PSR-4, namespace `Byrde\`)
  - `src/Core/` — Constants (all limits, meta keys, allowed sections), Helpers (multisite URI), Logo
  - `src/Assets/` — AssetManager (Vite manifest resolution, enqueue, preload, critical CSS, async CSS)
  - `src/Settings/` — Manager (settings CRUD with deep merge, sanitization), Cache (12 hosting/CDN purge layers)
  - `src/Security/` — Cleanup (XML-RPC disable), Validators (theme config + content + image), RateLimiter (transient-based), CookieConsent (GDPR modal)
  - `src/Content/` — LandingCPT, TemplateLoader (2-layer asset isolation), SEO (meta + JSON-LD), Shortcodes (6 dynamic), LegalPages (default legal content)
  - `src/API/` — ContentEndpoints (CRUD + window injection), ContactForm (Postmark email + `byrde_lead` CPT + attribution), Abilities (WordPress Abilities API for MCP integration)
  - `src/Admin/` — SettingsPage, PageEditor (full-screen iframe editor), Onboarding (setup wizard)
  - `src/Migration/` — ThemeMigration (page→CPT), ColorMigration (v2→v3→v4 schema)
- `front-end/src/components/` — React components (one per section)
  - `front-end/src/components/ThemeEditor/` — Visual editor sidebar + panels
  - `front-end/src/components/Onboarding/` — Setup wizard component
  - `front-end/src/components/ui/` — shadcn/ui primitives
- `front-end/src/context/` — React Contexts (6 contexts managing all state)
- `front-end/src/hooks/` — Custom hooks (useSettings, useSectionPalette, useAnalytics)
- `front-end/src/lib/` — Analytics (dataLayer events, ad attribution, scroll/form/section tracking), phone formatting
- `front-end/src/utils/` — Color utilities (hex/rgb/hsl conversions, shade generation, WCAG contrast, brand palette), headline rendering (`[pr]`/`[ac]` shortcodes)
- `templates/` — Standalone HTML templates (landing = React mount, legal = server-rendered)
- `docs/` — Additional documentation (ads tracking setup guide)
- `.claude/agents/` — 6 specialized Claude Code agents (backend, frontend, devops, reviewer, marketing, design)
- `.agents/skills/` — 18 agent skills (WordPress, React, shadcn, analytics, PPC, debugging, design, MCP)
- `.config/` — Release/build scripts
- `.github/workflows/` — GitHub Actions (release automation)

## Plugin Architecture

- **Entry point**: `byrde.php` defines constants (`BYRDE_VERSION`, `BYRDE_PLUGIN_FILE`, `BYRDE_PLUGIN_DIR`, `BYRDE_PLUGIN_URL`), loads Composer autoload, calls `byrde()->boot()`
- **Global accessor**: `byrde()` returns the `Byrde\Plugin` singleton
- **Bootstrap**: `Plugin::boot()` instantiates and registers all modules in dependency order
- **Activation**: Creates 4 default pages (First PPC, Privacy Policy, Terms, Cookie Settings), triggers onboarding redirect, runs migrations
- **CPT**: `Byrde\Content\LandingCPT` registers `byrde_landing` with rewrite slug `/lp/` — also registers `byrde_lead` (read-only CPT for form submissions)
- **Template loader**: `Byrde\Content\TemplateLoader` intercepts via `template_include` at priority 99
- **Asset isolation**: Two-layer system — (1) dequeue non-allowed handles at priority 999, (2) block surviving tags via `style_loader_tag`/`script_loader_tag` filters
- **Allowed handles**: byrde-main, admin-bar, hoverintent-js, dashicons (styles only), query-monitor (admins)
- **Constants**: `Byrde\Core\Constants` — all constants as class constants (e.g. `Constants::CPT_LANDING`, `Constants::META_THEME_CONFIG`, `Constants::META_CONTENT`)

## Data Flow

Three data sources injected into React via `window.*`:

1. **`window.byrdeSettings`** — Plugin settings (logo, phone, social URLs, brand colors, button style, analytics IDs). Stored in `wp_options` as `byrde_theme_settings`. Contact form fields (Postmark token, emails) only injected for admin users.
2. **`window.byrdeConfig`** — Page config (brand colors per mode, logo config, per-section themes, SEO). Stored in `wp_postmeta` as `_byrde_theme_config`.
3. **`window.byrdeContent`** — Section content (headlines, text, items). Stored in `wp_postmeta` as `_byrde_content`.

In editor mode (`?byrde_preview=1`), content is fetched via REST API instead. Editor also gets:
- **`window.byrdeAdmin`** — `{ isAdmin, canSave, apiUrl, nonce, pageId, config }`

Onboarding mode injects:
- **`window.byrdeOnboarding`** — `{ nonce, apiUrl, redirectUrl }`

## Frontend Architecture

### Context Providers (nested in App.tsx)
1. **ToastProvider** — Notification system
2. **SettingsProvider** — WordPress theme settings from `window.byrdeSettings`
3. **GlobalConfigProvider** — Brand colors (dark/light per-mode pairs), logo config, footer config, trust badges, form styling, SEO. Auto-generates `BrandPalette` from active mode.
4. **PaletteInjector** — Injects CSS variables into DOM based on brand palette
5. **HeaderConfigProvider** — Header visibility, fixed behavior, topbar config (message, icon, gradients)
6. **SectionThemeProvider** — Per-section theme overrides (paletteMode, accentSource, buttonStyle, bgColor, padding, bgImage, gradient), section visibility, section order
7. **ContentProvider** — Section content with default values, legacy `highlightText` → `[pr]...[/pr]` migration

### Section Rendering
- `App.tsx` maps `sectionOrder` array to components dynamically
- Reorderable: hero, featured-testimonial, services, mid-cta, service-areas, testimonials, faq, footer-cta
- Fixed: header/topbar (top), footer (bottom)
- Below-fold sections use `LazyMount` (IntersectionObserver) + `Suspense` for performance

### Color System
- Brand palette: dark_primary, dark_accent, dark_text, light_primary, light_accent, light_text + mode (dark/light)
- `generateBrandPalette()` creates 11-shade scales (50–950) for primary and accent
- `generateShades()` produces consistent shade ramps from any base color
- Per-section overrides: paletteMode can differ from global, accentSource selects which color drives accents
- CSS variables injected by `PaletteInjector` for component consumption
- WCAG 2.1 contrast checking utilities included

### Headline Shortcodes (frontend)
- `[pr]text[/pr]` — Primary color
- `[ac]text[/ac]` — Accent color
- Also supports `<strong>`, `<b>`, `<a>`, `<br>` in headlines

### Analytics
- All events pushed to `window.dataLayer` for GTM
- Ad attribution: captures UTM params + GCLID/FBCLID/MSCLKID from URL, stores with 90-day expiry
- Tracking hooks: `useScrollDepthTracking`, `useFormTracking`, `useSectionVisibility`, `useTrackedCTAClick`, `useTrackedPhoneClick`, `useFAQTracking`, `useServiceCardTracking`

## REST API

Base: `/wp-json/byrde/v1`

| Method | Endpoint | Purpose | Auth | Rate Limit |
|--------|----------|---------|------|------------|
| GET | `/pages/{id}/theme` | Get color/palette config | `edit_post` | — |
| PUT | `/pages/{id}/theme` | Save color/palette config | `edit_post` | 10/min |
| GET | `/pages/{id}/content` | Get section content | `edit_post` | — |
| PUT | `/pages/{id}/content` | Save section content | `edit_post` | 10/min |
| PUT | `/pages/{id}/save-all` | Atomic save (theme + content) | `edit_post` | 10/min |
| GET | `/settings` | Get plugin settings (public subset) | Public | — |
| PUT | `/settings` | Update plugin settings | `manage_options` | 5/min |
| POST | `/upload-image` | Upload image | `upload_files` | 5/min |
| POST | `/contact` | Submit contact form | Public | 10/5min (IP) |
| POST | `/onboarding/complete` | Mark onboarding done | `manage_options` | — |

## Validation Limits (from Constants)

- Theme config payload: 512KB max
- Content payload: 1MB max
- Image upload: 5MB, max 3840x2160px
- Services: 50 items, Testimonials: 100, FAQs: 50, Service Areas: 100
- Allowed sections: hero, services, testimonials, faq, mid-cta, service-areas, footer-cta, featured-testimonial, footer

## Build Commands

```bash
cd front-end && npm run dev     # Dev server with HMR
cd front-end && npm run build   # Production build → front-end/dist/ (both entries)
cd front-end && npm test        # Run Jest tests
composer dump-autoload          # Regenerate PSR-4 autoload after adding classes
```

## Release System

```bash
.config/bump-version.sh patch   # 1.1.0 → 1.1.1
.config/bump-version.sh minor   # 1.1.0 → 1.2.0
.config/bump-version.sh major   # 1.1.0 → 2.0.0
.config/create-release.sh 2.0.0 # Specific version
.config/build-zip.sh            # Local ZIP for manual upload
```

Tag push triggers GitHub Actions → builds frontend → creates release ZIP → WordPress auto-detects update via `Plugin::setup_update_checker()`.

## Claude Code Agents

6 specialized agents in `.claude/agents/`:

| Agent | Scope | When to Use |
|-------|-------|-------------|
| `@backend` | PHP, REST API, WordPress | New/edit PHP classes, endpoints, validation, settings, CPT, migrations, cache, rate limiting |
| `@frontend` | React 19, TypeScript, Vite | Components, hooks, contexts, color system, shadcn/ui, analytics hooks, ThemeEditor |
| `@devops` | Build, release, CI/CD | GitHub Actions, Vite configs, version bumps, ZIP packaging, Composer, auto-updates |
| `@reviewer` | Code review, security | PR reviews, security audit (OWASP), WCAG accessibility, performance, TypeScript quality |
| `@marketing` | SEO, analytics, PPC | GA4/GTM/Meta Pixel setup, conversion tracking, UTM attribution, JSON-LD, landing page strategy |
| `@design` | UI/UX, design system | Visual quality, responsive design, color system, WCAG contrast, shadcn patterns, CLS/LCP |

### Installed Skills (18)

**Frontend/Design:** frontend-design, web-design-guidelines, web-design-reviewer, shadcn-ui, vercel-react-best-practices
**WordPress:** wordpress-pro, wp-rest-api, wp-performance, wp-wpcli-and-ops, wp-interactivity-api, wp-abilities-api, wp-block-themes
**Marketing:** analytics-tracking, paid-ads
**Tooling:** systematic-debugging, continuous-learning-v2, mcp-builder

## Important Rules

- **CPT only** — Landing pages use `byrde_landing` CPT. All hooks guard with `is_singular( Constants::CPT_LANDING )`.
- **PSR-4** — All PHP classes in `src/` with `Byrde\` namespace. Use `Byrde\Core\Constants::*` for constants.
- **Global accessor** — Use `byrde()` to access plugin modules: `byrde()->settings->get_all()`, `byrde()->logo->render_shell()`.
- **No `json_encode`** on save — WordPress serializes post_meta arrays automatically.
- **Nonce required** — All authenticated requests need `X-WP-Nonce` header.
- **Multisite aware** — Use `Helpers::plugin_uri()` instead of `plugins_url()` directly.
- **Hashed filenames** — Vite outputs content-hashed filenames (e.g. `index-DfB4kLG_.js`). PHP reads `.vite/manifest.json` to resolve URLs. No `?ver=` needed — CDN-safe cache busting.
- **Two entry points** — `index.html` (production, lightweight) and `editor.html` (includes ThemeEditor). `AssetManager::get_entry()` picks the right one based on `?byrde_preview=1`.
- **Two Vite configs** — `vite.config.ts` (production → `dist/`) and `vite.config.editor.ts` (editor → `dist/editor/`). Both run during `npm run build`.
- **Version source** — Plugin version lives in `byrde.php` header + `BYRDE_VERSION` constant (kept in sync by release scripts).
- **Legal pages** — Use `_byrde_page_type = 'legal'` meta. Rendered server-side via `template-legal.php` with shortcodes, not React.
- **Contact form** — Postmark is primary email transport. Falls back to `wp_mail()`. Leads stored as `byrde_lead` CPT with full attribution metadata.
- **Cache purging** — `Settings\Cache` auto-purges 12 cache layers (LiteSpeed, WP Rocket, Cloudflare, WP Engine, Kinsta, etc.) on settings/content save.
- **Color migrations** — `ColorMigration` handles v2→v3→v4 schema upgrades. Check `byrde_color_schema_version` option.
- **Abilities API** — `Byrde\API\Abilities` registers 7 abilities for WordPress MCP Adapter integration. Only activates when `wp_register_ability()` exists (WP 6.9+ or Composer package). Abilities: `byrde/get-settings`, `byrde/update-settings`, `byrde/list-pages`, `byrde/get-page`, `byrde/update-page-theme`, `byrde/update-page-content`, `byrde/save-page`. All writes use existing Validators for sanitization. Content updates do partial merge with existing data.
