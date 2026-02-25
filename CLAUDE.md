# Byrde Theme - Development Instructions

## Architecture

Headless WordPress theme: PHP backend (data + REST API) with React frontend rendering all UI.

## Tech Stack

- **CMS**: WordPress 6.x
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui (Radix primitives)
- **State**: React Context API
- **Settings**: ACF Pro (Advanced Custom Fields)
- **Auto-updates**: Plugin Update Checker (Composer) via GitHub Releases

## Key Directories

- `front-end/src/components/` — React components (one per section)
- `front-end/src/context/` — React Contexts (global state)
- `front-end/src/hooks/` — Custom hooks
- `inc/` — PHP modules (each `require`d in `functions.php`)
- `.config/` — Release/build scripts
- `.github/workflows/` — GitHub Actions (release automation)

## Data Flow

Three data sources injected into React via `window.*`:

1. **`window.byrdeSettings`** — ACF options (logo, phone, social URLs). Stored in `wp_options`.
2. **`window.byrdeConfig`** — Theme config (colors, palettes, visibility). Stored in `wp_postmeta` as `_byrde_theme_config`.
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
| GET | `/settings` | Get ACF settings | Public |
| POST | `/upload-image` | Upload image | `upload_files` |

## Build Commands

```bash
cd front-end && npm run dev     # Dev server with HMR
cd front-end && npm run build   # Production build → front-end/dist/
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

- **No posts** — Only Pages exist. Posts/comments disabled via `cleanup.php`.
- **No `json_encode`** on save — WordPress serializes post_meta arrays automatically.
- **Nonce required** — All authenticated requests need `X-WP-Nonce` header.
- **Multisite aware** — Use `byrde_theme_uri()` instead of `get_template_directory_uri()`.
- **Fixed filenames** — Vite outputs `main.js` and `style.css` (no hashes). Version-based cache busting via `style.css` Version field.
