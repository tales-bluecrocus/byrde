# Byrde - Frontend

React frontend for the Byrde WordPress plugin. Renders landing pages for PPC campaigns.

## Stack

- **React 18** + **TypeScript**
- **Vite** - Build tool
- **Tailwind CSS 4** - Styling
- **shadcn/ui** - UI components (Radix primitives)

## Scripts

```bash
npm run dev        # Start dev server (hot-reload)
npm run build      # Production build → dist/
npm run preview    # Preview production build
npm run lint       # ESLint check
npm test           # Run Jest tests
npm run test:watch # Watch mode
```

## Project Structure

```
src/
├── assets/images/           # Logo, hero background
├── components/
│   ├── Header.tsx           # Header with logo, Google badge, CTA
│   ├── Hero.tsx             # Hero section with contact form
│   ├── FeaturedTestimonial.tsx
│   ├── ServicesGrid.tsx     # Services grid
│   ├── MidPageCTA.tsx       # Mid-page CTA
│   ├── ServiceAreas.tsx     # Service areas
│   ├── TestimonialsGrid.tsx
│   ├── FAQ.tsx              # FAQ accordion
│   ├── Footer.tsx
│   ├── ThemedSection.tsx    # Wrapper for themed sections
│   ├── PaletteInjector.tsx  # Injects CSS variables from palette
│   ├── GoogleReviewBadge.tsx
│   └── ThemeEditor/         # Visual editor (admin only)
├── context/
│   ├── GlobalConfigContext.tsx   # Brand colors, mode, form config
│   ├── SectionThemeContext.tsx   # Per-section themes and palettes
│   ├── SettingsContext.tsx       # Plugin settings from window.byrdeSettings
│   ├── ContentContext.tsx        # Section content from window.byrdeContent
│   └── HeaderConfigContext.tsx   # Header configuration
├── hooks/
│   ├── useAnalytics.ts      # Analytics tracking hooks
│   └── useSettings.ts       # Settings accessor hook
├── lib/
│   └── analytics.ts         # GA4/GTM/Meta tracking, UTM capture
├── utils/
│   └── colorUtils.ts        # Color conversions, palette generation
└── config/
    └── sectionPalettes.ts   # 16 pre-defined palettes (8 dark, 8 light)
```

## Data Sources

The React app receives data from WordPress via `window.*` globals:

1. **`window.byrdeSettings`** — Plugin settings (logo, phone, social URLs)
2. **`window.byrdeConfig`** — Page config (colors, palettes, visibility)
3. **`window.byrdeContent`** — Section content (headlines, text)

In editor mode (`?byrde_preview=1`), content is fetched via REST API.

## Theming System

### Brand Colors
- **GlobalConfigContext** defines primary/secondary colors and mode (light/dark)
- **PaletteInjector** injects CSS variables dynamically on `:root`
- Palette generated automatically with light, base, dark variants

### Section Palettes (16 pre-defined)
8 dark (Charcoal, Midnight, Forest, etc.) + 8 light (Snow, Cream, Ice, etc.)

Each palette includes: `bgPrimary`, `bgSecondary`, `bgTertiary`, `textPrimary`, `textSecondary`, `textAccent`, `borderColor`

## CSS Variables

```css
/* Brand */
--color-primary-500, --color-secondary-500

/* Buttons */
--color-button-bg, --color-button-hover

/* Section-specific (via ThemedSection) */
--section-bg-primary, --section-bg-secondary, --section-bg-tertiary
--section-text-primary, --section-text-secondary, --section-text-accent
--section-button-bg, --section-button-text, --section-border
```

## Testing

Tests use Jest with jsdom environment. No running WordPress server needed.

```bash
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # Coverage report
```

Test files live in `__tests__/` directories next to their source files.
