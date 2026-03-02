# Byrde

A WordPress plugin for building headless PPC landing pages. WordPress handles the backend (data storage, REST API, CPT), while React renders the entire frontend UI. Runs alongside any active theme without conflicts.

## Features

- **Custom Post Type** — `byrde_landing` with `/lp/...` URL structure, isolated from the active theme
- **Visual Editor** — Live preview editor with color palettes, section visibility, and content editing
- **12 Color Palettes** — Each section can use a different palette
- **9 Configurable Sections** — Hero, Services, Testimonials, FAQ, Service Areas, CTAs, Footer
- **SEO Optimized** — JSON-LD structured data, Open Graph, meta tags
- **Analytics Ready** — GA4, GTM, Meta Pixel with UTM tracking
- **Auto-Updates** — Push a git tag, WordPress detects the update automatically
- **Multisite Compatible** — Works with WordPress multisite subdirectory installs

## Requirements

- WordPress 6.0+
- PHP 8.0+
- Node.js 20+

## Installation

### From GitHub Release (Recommended)

1. Download `byrde.zip` from the [latest release](https://github.com/tales-bluecrocus/byrde/releases/latest)
2. In WordPress, go to **Plugins → Add New → Upload Plugin**
3. Upload the ZIP and activate

### From Source

```bash
git clone git@github.com:tales-bluecrocus/byrde.git
cd byrde/front-end
npm install
npm run build
cd ..
composer install --no-dev
```

Then symlink or copy the `byrde/` folder into `wp-content/plugins/`.

## Configuration

### Plugin Settings

Go to **Settings → Theme Settings** in the WordPress admin. Configure:

- **Brand** — Logo, phone number, email
- **Google Reviews** — Rating, review count, reviews URL
- **Footer** — Tagline, description, copyright
- **Social Links** — Facebook, Instagram, YouTube, Yelp
- **SEO** — Site name, description, keywords, OG image
- **Analytics** — GA4 Measurement ID, GTM Container ID, Meta Pixel ID

### Visual Editor

Go to **Byrde Pages** in the admin menu, then click **Edit with Byrde** on any landing page.

The editor lets you:

- Toggle section visibility
- Change color palettes per section
- Edit all text content (headlines, descriptions, CTAs)
- Upload images (hero background, logo)
- Preview changes in real-time
- Save everything to WordPress with one click

## Tech Stack

| Layer | Technology |
|-------|-----------|
| CMS | WordPress 6.x |
| Frontend | React 18 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui (Radix primitives) |
| State Management | React Context API |
| Settings | Native WordPress options (`byrde_theme_settings`) |
| Auto-Updates | Plugin Update Checker via GitHub Releases |

## Project Structure

```
byrde/
├── byrde.php                     # Plugin entry point
├── functions.php                 # Plugin bootstrap (requires all modules)
├── front-end/                    # React application
│   ├── src/
│   │   ├── components/           # React components (one per section)
│   │   ├── context/              # React Contexts (global state)
│   │   ├── hooks/                # Custom hooks
│   │   ├── utils/                # Utilities
│   │   └── assets/images/        # Static assets (logo fallback)
│   └── dist/                     # Production build (generated)
├── inc/                          # PHP modules
│   ├── cpt-landing.php           # byrde_landing CPT registration
│   ├── template-loader.php       # Template override + asset isolation
│   ├── migration.php             # Theme-to-plugin data migration
│   ├── cleanup.php               # XML-RPC/pingback security
│   ├── constants.php             # Plugin constants
│   ├── contact-form-handler.php  # Contact form REST endpoint
│   ├── page-theme-editor.php     # Visual editor (iframe + REST API)
│   ├── rate-limiter.php          # Rate limiting for REST endpoints
│   ├── required-plugins.php      # Required plugin checks (TGM)
│   ├── rest-content-api.php      # REST API for section content
│   ├── seo.php                   # Meta tags, JSON-LD, Open Graph
│   ├── update-checker.php        # GitHub-based auto-updater
│   └── validators.php            # Input validation & sanitization
├── templates/
│   ├── template-landing.php      # Standalone HTML for landing pages
│   └── template-legal.php        # Server-rendered legal pages
├── .config/                      # Release & build scripts
│   ├── bump-version.sh           # Auto-increment version (patch/minor/major)
│   ├── create-release.sh         # Create a tagged release
│   └── build-zip.sh              # Build local ZIP for manual upload
└── .github/workflows/
    └── release.yml               # GitHub Actions: build + release on tag
```

## Sections

| Section | Component | Editable Content |
|---------|-----------|-----------------|
| Hero | `Hero.tsx` | Headline, subheadline, badges, CTA |
| Featured Testimonial | `FeaturedTestimonial.tsx` | Quote, author, CTA |
| Services | `ServicesGrid.tsx` | Headline, services list |
| Mid-Page CTA | `MidPageCTA.tsx` | Badge, headline, features, CTA |
| Service Areas | `ServiceAreas.tsx` | Headline, areas list, CTA |
| Testimonials | `TestimonialsGrid.tsx` | Headline, testimonials list |
| FAQ | `FAQ.tsx` | Headline, FAQ list, contact CTA |
| Footer CTA | `FooterCTA.tsx` | Headline, CTA |
| Footer | `Footer.tsx` | Description, copyright, links |

## REST API

Base URL: `/wp-json/byrde/v1`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/pages/{id}/theme` | Get color/palette config | `edit_post` |
| `PUT` | `/pages/{id}/theme` | Save color/palette config | `edit_post` |
| `GET` | `/pages/{id}/content` | Get section content | `edit_post` |
| `PUT` | `/pages/{id}/content` | Save section content | `edit_post` |
| `PUT` | `/pages/{id}/save-all` | Atomic save (theme + content) | `edit_post` |
| `GET` | `/settings` | Get plugin settings | Public |
| `POST` | `/upload-image` | Upload an image | `upload_files` |

All authenticated endpoints require the `X-WP-Nonce` header.

## Development

### Prerequisites

```bash
node -v  # v20+
php -v   # 8.0+
composer -V
```

### Frontend Development

```bash
cd front-end
npm install
npm run dev    # Vite dev server with HMR
```

### Production Build

```bash
cd front-end
npm run build  # Outputs to front-end/dist/
```

### Tests

```bash
cd front-end
npm test             # Run all tests
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report
```

## Releasing

### Automated Release (via GitHub Actions)

```bash
# Bump patch version (1.1.0 → 1.1.1)
.config/bump-version.sh patch

# Bump minor version (1.1.0 → 1.2.0)
.config/bump-version.sh minor

# Bump major version (1.1.0 → 2.0.0)
.config/bump-version.sh major

# Or specify an exact version
.config/create-release.sh 2.0.0
```

This will:

1. Update the version in `byrde.php`
2. Commit and create a git tag
3. Push to GitHub
4. GitHub Actions builds the frontend, packages the ZIP, and creates a release
5. WordPress installations with Byrde detect the update automatically

### Manual ZIP (for direct upload)

```bash
.config/build-zip.sh
# Output: ../byrde.zip
```

## How Auto-Updates Work

The plugin includes `inc/update-checker.php` which uses the [Plugin Update Checker](https://github.com/YahniS98/plugin-update-checker) library to poll GitHub Releases. When a new release is published:

1. WordPress checks for updates periodically (or manually via **Plugins → Installed Plugins**)
2. If a newer version exists on GitHub, WordPress shows an update notification
3. The admin clicks **Update** and WordPress downloads the release ZIP automatically

No tokens needed — the repository is public.

## Security

- Input validation and sanitization on all REST endpoints
- Rate limiting (10 saves/min, 5 uploads/min)
- MIME type verification on file uploads
- Nonce-based authentication
- Permission checks per page (`edit_post` capability)

## License

GPL v2 or later.
