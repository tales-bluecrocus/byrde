# Byrde — BlueCrocus PPC

A WordPress plugin for building headless PPC landing pages. WordPress handles the backend (data storage, REST API, CPT), while React renders the entire frontend UI. Runs alongside any active theme without conflicts.

## Features

- **Custom Post Type** — `byrde_landing` with `/lp/...` URL structure, fully isolated from the active theme
- **Visual Editor** — Full-screen live preview editor with color palettes, section visibility, drag-and-drop reordering, and content editing
- **Brand Palette System** — Dark/light mode support with per-section theme overrides (palette mode, accent source, gradients, background images)
- **11 Configurable Sections** — Header, Topbar, Hero, Featured Testimonial, Services, Mid-Page CTA, Service Areas, Testimonials, FAQ, Footer CTA, Footer — all reorderable (except Header/Footer)
- **Contact Form** — Built-in form with validation, honeypot spam protection, ad attribution capture, and email notifications via Postmark (with `wp_mail()` fallback)
- **Lead Management** — `byrde_lead` CPT stores submissions with UTM tracking, GCLID/FBCLID/MSCLKID, and full attribution data
- **Cookie Consent** — GDPR-compliant cookie modal with granular consent (Necessary, Analytics, Marketing) and `window.byrdeCookieConsent` API
- **Onboarding Wizard** — First-run setup wizard collects logo, brand colors, contact info, SEO, schema, and analytics IDs
- **SEO Optimized** — JSON-LD structured data (FAQ, Breadcrumb), Open Graph, Twitter Cards, meta tags, custom title
- **Analytics Ready** — GA4, GTM, Meta Pixel, Google Ads with UTM tracking and scroll/section/form event tracking via `dataLayer`
- **Auto-Updates** — Push a git tag, WordPress detects the update automatically via GitHub Releases
- **Multisite Compatible** — Works with WordPress multisite subdirectory installs
- **Legal Pages** — Auto-generated Privacy Policy, Terms & Conditions, and Cookie Settings pages with dynamic shortcodes

## Requirements

- WordPress 6.0+ (tested up to 6.7)
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
cd byrde
composer install --no-dev
cd front-end
npm install
npm run build
```

Then symlink or copy the `byrde/` folder into `wp-content/plugins/`.

## Configuration

### Plugin Settings

Go to **Settings → Theme Settings** in the WordPress admin. Configure:

- **Brand** — Logo, phone number, email
- **Brand Colors** — Dark/light mode primary, accent, and text colors
- **Button Style** — Border width, radius, shadow, text colors per mode
- **Google Reviews** — Rating, review count, reviews URL
- **Footer** — Tagline, description, address, business hours, copyright
- **Social Links** — Facebook, Instagram, YouTube, Yelp, Google
- **SEO** — Site name, tagline, description, keywords, OG image
- **Schema** — LocalBusiness type, address, geo coordinates, opening hours, service radius
- **Analytics** — GA4 Measurement ID, GTM Container ID, Meta Pixel ID, Google Ads conversion labels
- **Legal** — Privacy policy, terms, cookie settings URLs
- **Contact Form** — Postmark API token, to/from/CC/BCC emails, subject line

### Visual Editor

Go to **Byrde Pages** in the admin menu, then click **Edit with Byrde** on any landing page.

The editor lets you:

- Toggle section visibility
- Reorder sections via drag-and-drop
- Change color palettes per section (dark/light mode, accent source, gradients)
- Configure header and topbar (message, icons, fixed behavior)
- Edit all text content (headlines, descriptions, CTAs)
- Upload images (hero background, logo, service icons)
- Configure trust badges and Google Review display
- Preview changes in real-time
- Save everything to WordPress with one click

## Tech Stack

| Layer | Technology |
|-------|-----------|
| CMS | WordPress 6.x |
| Backend | PHP 8.0+ with PSR-4 autoloading (Composer) |
| Frontend | React 19 + TypeScript 5.9 |
| Build | Vite 7 (multi-entry, content-hashed filenames) |
| Styling | Tailwind CSS 4 |
| UI Components | shadcn/ui (Radix primitives) |
| Icons | Lucide React + FontAwesome (brand icons) |
| Carousel | Embla Carousel (with autoplay) |
| Drag & Drop | @dnd-kit |
| Color Picker | react-colorful |
| State Management | React Context API |
| Settings | Native WordPress options (`byrde_theme_settings`) |
| Email | Postmark API (primary) + `wp_mail()` (fallback) |
| Auto-Updates | Plugin Update Checker v5 via GitHub Releases |

## Project Structure

```
byrde/
├── byrde.php                     # Plugin entry point (constants, autoload, boot)
├── src/                          # PHP classes (PSR-4, namespace Byrde\)
│   ├── Plugin.php                # Bootstrap: instantiates all modules
│   ├── Core/                     # Constants, Helpers, Logo
│   ├── Assets/                   # AssetManager (enqueue, preload, critical CSS)
│   ├── Settings/                 # Theme settings CRUD + Cache (12 hosting/CDN purge layers)
│   ├── Security/                 # Cleanup (XML-RPC), Validators, RateLimiter, CookieConsent
│   ├── Content/                  # CPT, TemplateLoader, SEO, Shortcodes, LegalPages
│   ├── API/                      # REST endpoints, ContactForm (Postmark + lead storage)
│   ├── Admin/                    # SettingsPage, PageEditor, Onboarding
│   └── Migration/                # Theme→Plugin migration, color schema migrations (v2→v4)
├── front-end/                    # React application
│   ├── index.html                # Production entry (lightweight, no editor)
│   ├── editor.html               # Editor entry (includes ThemeEditor)
│   ├── vite.config.ts            # Production build config
│   ├── vite.config.editor.ts     # Editor build config (separate output)
│   ├── src/
│   │   ├── main.tsx              # Production bootstrap (+ onboarding lazy load)
│   │   ├── editor-main.tsx       # Editor bootstrap (imports ThemeEditor)
│   │   ├── App.tsx               # Shared app (7 nested context providers)
│   │   ├── components/           # React components (one per section)
│   │   │   ├── ThemeEditor/      # Visual editor sidebar + panels
│   │   │   ├── Onboarding/       # Setup wizard
│   │   │   └── ui/               # shadcn/ui primitives
│   │   ├── context/              # React Contexts (Settings, GlobalConfig, SectionTheme, HeaderConfig, Content, Sidebar)
│   │   ├── hooks/                # Custom hooks (useSettings, useSectionPalette, useAnalytics)
│   │   ├── lib/                  # Utilities (analytics, phone formatting)
│   │   └── utils/                # Color utilities, headline rendering
│   └── dist/                     # Production build (generated, hashed filenames)
│       └── .vite/manifest.json   # Asset manifest for PHP resolution
├── templates/
│   ├── template-landing.php      # Standalone HTML for landing pages (React mount)
│   └── template-legal.php        # Server-rendered legal pages (no React)
├── docs/                         # Additional documentation
├── .config/                      # Release & build scripts
│   ├── bump-version.sh           # Auto-increment version (patch/minor/major)
│   ├── create-release.sh         # Create a tagged release
│   └── build-zip.sh              # Build local ZIP for manual upload
└── .github/workflows/
    └── release.yml               # GitHub Actions: build + release on tag push
```

## Sections

| Section | Component | Editable Content |
|---------|-----------|-----------------|
| Header | `Header.tsx` | Logo shape/color, fixed behavior, CTA button, Google Review badge |
| Topbar | `Header.tsx` (Topbar) | Message, icon, phone/email visibility, gradient/bg image |
| Hero | `Hero.tsx` | Headline, subheadline, badges, benefits, CTA, background image |
| Hero Form | `HeroForm.tsx` | Form title, subtitle, button text, fields |
| Featured Testimonial | `FeaturedTestimonial.tsx` | Quote, author, badge, CTA |
| Services | `ServicesGrid.tsx` | Headline, services list (icon, title, description) |
| Mid-Page CTA | `MidPageCTA.tsx` | Badge, headline, features list, CTA |
| Service Areas | `ServiceAreas.tsx` | Headline, areas list (with highlights), CTA |
| Testimonials | `TestimonialsGrid.tsx` | Headline, testimonials list (quote, author, rating) |
| FAQ | `FAQ.tsx` | Headline, FAQ list (question/answer), contact card |
| Footer CTA | `FooterCTA.tsx` | Headline, subheadline, CTA, reassurance text |
| Footer | `Footer.tsx` | Description, copyright, social links, contact info |

## REST API

Base URL: `/wp-json/byrde/v1`

| Method | Endpoint | Description | Auth | Rate Limit |
|--------|----------|-------------|------|------------|
| `GET` | `/pages/{id}/theme` | Get color/palette config | `edit_post` | — |
| `PUT` | `/pages/{id}/theme` | Save color/palette config | `edit_post` | 10/min |
| `GET` | `/pages/{id}/content` | Get section content | `edit_post` | — |
| `PUT` | `/pages/{id}/content` | Save section content | `edit_post` | 10/min |
| `PUT` | `/pages/{id}/save-all` | Atomic save (theme + content) | `edit_post` | 10/min |
| `GET` | `/settings` | Get plugin settings | Public | — |
| `PUT` | `/settings` | Update plugin settings | `manage_options` | 5/min |
| `POST` | `/upload-image` | Upload an image | `upload_files` | 5/min |
| `POST` | `/contact` | Submit contact form | Public | 10/5min (IP) |
| `POST` | `/onboarding/complete` | Mark onboarding done | `manage_options` | — |

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
npm run dev    # Vite dev server with HMR (open /editor.html for editor)
```

### Production Build

```bash
cd front-end
npm run build  # Outputs to front-end/dist/ (two entries: production + editor)
```

### PHP Autoload

```bash
composer dump-autoload  # Regenerate PSR-4 autoload after adding classes
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

1. Update the version in `byrde.php` (header + constant)
2. Commit and create an annotated git tag
3. Push to GitHub
4. GitHub Actions builds the frontend, packages the ZIP, and creates a release
5. WordPress installations with Byrde detect the update automatically

### Manual ZIP (for direct upload)

```bash
.config/build-zip.sh
# Output: ../byrde.zip
```

## How Auto-Updates Work

The plugin uses the [Plugin Update Checker](https://github.com/YahniS98/plugin-update-checker) library (via Composer) to poll GitHub Releases. When a new release is published:

1. WordPress checks for updates periodically (or manually via **Plugins → Installed Plugins**)
2. If a newer version exists on GitHub, WordPress shows an update notification
3. The admin clicks **Update** and WordPress downloads the release ZIP automatically

No tokens needed — the repository is public.

## Security

- Input validation and sanitization on all REST endpoints
- Rate limiting per user (saves, uploads) and per IP (contact form)
- Content size limits (512KB theme config, 1MB content, 5MB images)
- Item count limits (50 services, 100 testimonials, 50 FAQs, 100 service areas)
- MIME type verification and dimension checks on file uploads (max 3840x2160)
- Nonce-based authentication for all admin endpoints
- Permission checks per page (`edit_post` capability)
- Honeypot field on contact form
- XML-RPC disabled by default (`byrde_disable_xmlrpc` filter to override)
- Asset isolation on landing pages (two-layer: dequeue + tag filter)

## Cache Compatibility

The plugin automatically purges caches when settings or page content changes. Supported layers:

WordPress Core, LiteSpeed Cache, WP Super Cache, W3 Total Cache, WP Rocket, WP Fastest Cache, SG Optimizer, WP Engine, Kinsta, Cloudflare, Autoptimize, Breeze (Cloudways)

## License

GPL v2 or later.
