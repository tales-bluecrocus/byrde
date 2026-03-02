# Byrde Plugin - Development Instructions

## Architecture

WordPress plugin with headless landing pages: PHP backend (CPT, data storage, REST API) with React frontend rendering all UI. Runs alongside any active theme — landing pages use standalone templates that bypass the theme entirely.

## Tech Stack

- **CMS**: WordPress 6.x
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui (Radix primitives)
- **State**: React Context API
- **Settings**: Native WordPress options (`byrde_theme_settings` in `wp_options`)
- **Auto-updates**: Plugin Update Checker (Composer) via GitHub Releases

## Key Directories

- `front-end/src/components/` — React components (one per section)
- `front-end/src/context/` — React Contexts (global state)
- `front-end/src/hooks/` — Custom hooks
- `inc/` — PHP modules (each `require`d in `functions.php`)
- `templates/` — Standalone HTML templates (landing + legal)
- `.config/` — Release/build scripts
- `.github/workflows/` — GitHub Actions (release automation)

## Plugin Architecture

- **Entry point**: `byrde.php` defines constants (`BYRDE_PLUGIN_FILE`, `BYRDE_PLUGIN_DIR`, `BYRDE_PLUGIN_URL`)
- **CPT**: `byrde_landing` registered in `inc/cpt-landing.php`, rewrite slug `/lp/`
- **Template loader**: `inc/template-loader.php` intercepts via `template_include` filter at priority 99
- **Asset isolation**: `byrde_isolate_assets()` at priority 999 dequeues all non-Byrde styles/scripts on landing pages
- **Migration**: `inc/migration.php` converts old theme pages to CPT on activation

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
```

## Release System

```bash
.config/bump-version.sh patch   # 1.1.0 → 1.1.1
.config/bump-version.sh minor   # 1.1.0 → 1.2.0
.config/bump-version.sh major   # 1.1.0 → 2.0.0
.config/build-zip.sh            # Local ZIP for manual upload
```

Tag push triggers GitHub Actions → builds frontend → creates release ZIP → WordPress auto-detects update via `inc/update-checker.php`.

## Important Rules

- **CPT only** — Landing pages use `byrde_landing` CPT, not regular pages. All hooks guard with `is_singular(BYRDE_CPT_LANDING)`.
- **No `json_encode`** on save — WordPress serializes post_meta arrays automatically.
- **Nonce required** — All authenticated requests need `X-WP-Nonce` header.
- **Multisite aware** — Use `byrde_plugin_uri()` instead of `plugins_url()` directly.
- **Fixed filenames** — Vite outputs `main.js` and `style.css` (no hashes). Version-based cache busting via `byrde.php` Version field.
- **Version source** — Plugin version lives in `byrde.php` header, read by `get_plugin_data()`.
