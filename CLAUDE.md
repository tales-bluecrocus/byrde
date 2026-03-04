# Byrde Plugin - Development Instructions

## Architecture

WordPress plugin with headless landing pages: PHP backend (CPT, data storage, REST API) with React frontend rendering all UI. Runs alongside any active theme — landing pages use standalone templates that bypass the theme entirely.

PHP backend uses PSR-4 autoloading via Composer with `Byrde\` namespace. All classes live in `src/`.

## Tech Stack

- **CMS**: WordPress 6.x
- **Backend**: PHP 8.0+ with PSR-4 autoloading (Composer)
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui (Radix primitives)
- **State**: React Context API
- **Settings**: Native WordPress options (`byrde_theme_settings` in `wp_options`)
- **Auto-updates**: Plugin Update Checker (Composer) via GitHub Releases

## Key Directories

- `src/` — PHP classes (PSR-4, namespace `Byrde\`)
  - `src/Core/` — Constants, Helpers, Logo
  - `src/Assets/` — Asset enqueue, preload, critical CSS
  - `src/Settings/` — Theme settings CRUD, cache management
  - `src/Security/` — Cleanup, Validators, RateLimiter, CookieConsent
  - `src/Content/` — CPT, TemplateLoader, SEO, Shortcodes, LegalPages
  - `src/API/` — REST endpoints, ContactForm
  - `src/Admin/` — SettingsPage, PageEditor, Onboarding
  - `src/Migration/` — Theme and color schema migrations
- `front-end/src/components/` — React components (one per section)
- `front-end/src/context/` — React Contexts (global state)
- `front-end/src/hooks/` — Custom hooks
- `templates/` — Standalone HTML templates (landing + legal)
- `.config/` — Release/build scripts
- `.github/workflows/` — GitHub Actions (release automation)

## Plugin Architecture

- **Entry point**: `byrde.php` defines constants, loads Composer autoload, calls `byrde()->boot()`
- **Global accessor**: `byrde()` returns the `Byrde\Plugin` singleton
- **Bootstrap**: `Plugin::boot()` instantiates and registers all modules in dependency order
- **CPT**: `Byrde\Content\LandingCPT` registers `byrde_landing` with rewrite slug `/lp/`
- **Template loader**: `Byrde\Content\TemplateLoader` intercepts via `template_include` at priority 99
- **Asset isolation**: `TemplateLoader::isolate_assets()` at priority 999 dequeues all non-Byrde styles/scripts
- **Constants**: `Byrde\Core\Constants` — all constants as class constants (e.g. `Constants::CPT_LANDING`)

## Data Flow

Three data sources injected into React via `window.*`:

1. **`window.byrdeSettings`** — Plugin settings (logo, phone, social URLs). Stored in `wp_options` as `byrde_theme_settings`.
2. **`window.byrdeConfig`** — Page config (colors, palettes, visibility). Stored in `wp_postmeta` as `_byrde_theme_config`.
3. **`window.byrdeContent`** — Section content (headlines, text). Stored in `wp_postmeta` as `_byrde_content`.

In editor mode (`?byrde_preview=1`), content is fetched via REST API instead.

## REST API

Base: `/wp-json/byrde/v1`

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/pages/{id}/theme` | Get color/palette config | `edit_post` |
| PUT | `/pages/{id}/theme` | Save color/palette config | `edit_post` |
| GET | `/pages/{id}/content` | Get section content | `edit_post` |
| PUT | `/pages/{id}/content` | Save section content | `edit_post` |
| PUT | `/pages/{id}/save-all` | Atomic save (theme + content) | `edit_post` |
| GET | `/settings` | Get plugin settings | Public |
| PUT | `/settings` | Update plugin settings | `manage_options` |
| POST | `/upload-image` | Upload image | `upload_files` |

## Build Commands

```bash
cd front-end && npm run dev     # Dev server with HMR
cd front-end && npm run build   # Production build → front-end/dist/
cd front-end && npm test        # Run Jest tests
composer dump-autoload          # Regenerate PSR-4 autoload after adding classes
```

## Release System

```bash
.config/bump-version.sh patch   # 1.1.0 → 1.1.1
.config/bump-version.sh minor   # 1.1.0 → 1.2.0
.config/bump-version.sh major   # 1.1.0 → 2.0.0
.config/build-zip.sh            # Local ZIP for manual upload
```

Tag push triggers GitHub Actions → builds frontend → creates release ZIP → WordPress auto-detects update via `Plugin::setup_update_checker()`.

## Important Rules

- **CPT only** — Landing pages use `byrde_landing` CPT. All hooks guard with `is_singular( Constants::CPT_LANDING )`.
- **PSR-4** — All PHP classes in `src/` with `Byrde\` namespace. Use `Byrde\Core\Constants::*` for constants.
- **Global accessor** — Use `byrde()` to access plugin modules: `byrde()->settings->get_all()`, `byrde()->logo->render_shell()`.
- **No `json_encode`** on save — WordPress serializes post_meta arrays automatically.
- **Nonce required** — All authenticated requests need `X-WP-Nonce` header.
- **Multisite aware** — Use `Helpers::plugin_uri()` instead of `plugins_url()` directly.
- **Fixed filenames** — Vite outputs `main.js` and `style.css` (no hashes). Version-based cache busting via `byrde.php` Version field.
- **Version source** — Plugin version lives in `byrde.php` header, read by `get_plugin_data()`.
