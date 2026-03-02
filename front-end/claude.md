# CLAUDE.md

AI assistant instructions for the Byrde frontend.

## Project Overview

**Byrde** — React frontend for the Byrde WordPress plugin. Renders PPC landing pages with a visual editor.

- **Stack**: React 18 + TypeScript + Vite + Tailwind CSS 4
- **Type**: Headless frontend for `byrde_landing` CPT (WordPress plugin)
- **URLs**: Landing pages served at `/lp/...`

## Code Style

- Write clean, self-documenting code
- Use descriptive variable and function names
- Use TypeScript types/interfaces properly
- Follow Tailwind CSS conventions
- **IMPORTANTE - Dev mode**: Quando `npm run dev` está ativo, NUNCA execute `npm run build`. Build só quando o usuário pedir explicitamente.

## Theming System

### Brand Color System

- **GlobalConfigContext** — Primary/secondary colors and mode (light/dark)
- **PaletteInjector** — Injects CSS variables dynamically on `:root`
- Palette generated automatically with variants (light, base, dark)
- Sections choose colors ONLY from the palette

### Surface Palette (8 colors per mode)

```typescript
interface SurfacePalette {
  s1: string;  // Main background
  s2: string;  // Elevated surface (cards)
  s3: string;  // Subtle background
  s4: string;  // Input backgrounds
  s5: string;  // Hover states
  s6: string;  // Active states
  s7: string;  // Borders
  s8: string;  // Dividers
}
```

### Section Palettes (16 Pre-defined)

8 dark (Charcoal, Midnight, Forest, Slate, Burgundy, Navy, Espresso, Graphite) + 8 light (Snow, Cream, Ice, Mint, Sand, Lavender, Blush, Pearl)

Each palette includes: `bgPrimary`, `bgSecondary`, `bgTertiary`, `textPrimary`, `textSecondary`, `textAccent`, `borderColor`

**File:** `src/config/sectionPalettes.ts`

### Contexts

- `GlobalConfigContext` — Brand colors, mode, Google Reviews, trust badges, form config
- `SectionThemeContext` — Per-section themes (palettes, bg, text colors)
- `SettingsContext` — Plugin settings from `window.byrdeSettings`
- `ContentContext` — Section content from `window.byrdeContent`
- `HeaderConfigContext` — Header configuration

### Key Components

- `ThemedSection` — Wrapper that applies CSS variables per section
- `PaletteInjector` — Injects CSS variables based on palette
- `ThemeEditor/` — Visual editor panel (admin only)
- `GoogleReviewBadge` — Reusable Google Reviews badge

### Section IDs

```typescript
type SectionId =
  | 'hero'
  | 'featured-testimonial'
  | 'services'
  | 'mid-cta'
  | 'service-areas'
  | 'testimonials'
  | 'faq'
  | 'footer';
```

## CSS Variables

```css
/* Primary brand colors */
--color-primary-500, --color-primary-400, --color-primary-600
--color-secondary-500, --color-secondary-400, --color-secondary-600

/* Button colors */
--color-button-bg, --color-button-hover, --color-button-active

/* Section-specific (via ThemedSection) */
--section-bg-primary, --section-bg-secondary, --section-bg-tertiary
--section-text-primary, --section-text-secondary, --section-text-accent
--section-button-bg, --section-button-text, --section-border
```

## Commands

```bash
npm run dev        # Start dev server (hot-reload)
npm run build      # Production build (only when asked)
npm test           # Run Jest tests
npm run test:watch # Watch mode
npm run lint       # ESLint check
```

## Testing

- Jest + jsdom environment (no WordPress server needed)
- `@testing-library/react` + `@testing-library/jest-dom`
- Custom AST transformer for `import.meta.env` → `src/__mocks__/importMeta.cjs`
- Test files in `__tests__/` directories next to source files
