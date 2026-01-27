# CLAUDE.md

AI assistant instructions for this project.

## Project Overview

**Lake City Hauling** - Landing page de alta conversao para servicos de junk removal.

- **Stack**: React 19 + TypeScript + Vite + Tailwind CSS 4
- **Tipo**: Single-page landing page com formulario de contato
- **Publico**: Residencias e empresas em North Idaho e Spokane

## Response Style

- Provide comprehensive explanations
- Include context and reasoning behind recommendations
- Explain the 'why' not just the 'how'

## Code Style

- Write clean, self-documenting code
- Use descriptive variable and function names
- Minimize comments unless essential for clarity
- Use TypeScript types/interfaces properly
- Follow Tailwind CSS conventions

## Task Management

- Take initiative on obvious next steps
- Suggest improvements and optimizations
- Anticipate potential issues and solutions

## Development Guidelines

- Follow existing code patterns and conventions
- Consider security and performance implications
- Follow all the .claude/skills on all steps
- **IMPORTANTE - Dev mode**: Quando `npm run dev` está ativo, NUNCA execute `npm run build`. As mudanças são hot-reloaded automaticamente. Build só quando o usuário pedir explicitamente.

---

## Theming System

O projeto usa um sistema de theming robusto com paleta de cores global e suporte a light/dark mode.

### Principios do Design System

1. **Consistencia**: Cores vem APENAS da paleta gerada (sem color picker livre)
2. **Previsibilidade**: Hover/active states sao calculados automaticamente
3. **Mode-aware**: Todas as cores adaptam para light/dark mode
4. **8 Surface Colors**: Range consistente de cores por modo

### Brand Color System

- **GlobalConfigContext** - Define primary/secondary colors e mode (light/dark)
- **PaletteInjector** - Injeta CSS variables dinamicamente no `:root`
- Paleta gerada automaticamente com variantes (light, base, dark)
- Sections escolhem cores APENAS da paleta

### Surface Palette (8 cores por modo)

Cada modo (light/dark) tem 8 cores de surface consistentes:

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

**Dark Mode** (do mais escuro ao mais claro):
- s1: `#0a0a0a` → s8: `#404040`

**Light Mode** (do mais claro ao mais escuro):
- s1: `#ffffff` → s8: `#c0c0c0`

### Section Palettes (16 Pre-defined)

Sistema de paletas pre-definidas para garantir legibilidade. Usuario escolhe uma paleta completa, nao cores individuais.

**Dark Palettes (8):**
- Charcoal, Midnight, Forest, Slate, Burgundy, Navy, Espresso, Graphite

**Light Palettes (8):**
- Snow, Cream, Ice, Mint, Sand, Lavender, Blush, Pearl

Cada paleta inclui:
- `bgPrimary`, `bgSecondary`, `bgTertiary` (backgrounds)
- `textPrimary`, `textSecondary`, `textAccent` (textos)
- `borderColor` (bordas)

**Accent Override:**
- `useGlobalAccent: true` - usa brand primary como accent em vez do accent da paleta

```typescript
// Exemplo de uso
const { setSectionPalette, setUseGlobalAccent } = useSectionTheme();
setSectionPalette('hero', 'midnight'); // Aplica paleta Midnight
setUseGlobalAccent('hero', true);      // Usa brand color como accent
```

**Arquivo:** `src/config/sectionPalettes.ts`

### Contexts

- `GlobalConfigContext` - Brand colors, mode, Google Reviews, trust badges, form config
- `SectionThemeContext` - Gerencia temas de cada secao (palettes, bg, text colors)
- `HeaderConfigContext` - Configuracoes especificas do header

### Components

- `ThemedSection` - Wrapper que aplica CSS variables por secao
- `ThemeSidebar` - UI de configuracao (dev only, sidebar fixa esquerda)
- `GoogleReviewBadge` - Badge reutilizavel para Google Reviews
- `PaletteInjector` - Injeta CSS variables baseado na paleta
- `Toast` - Sistema de notificacoes

### Form Config

O form tem configuracoes proprias no GlobalConfigContext:

```typescript
interface FormConfig {
  inputBg?: string;        // Background dos inputs
  inputBorder?: string;    // Cor da borda
  inputText?: string;      // Cor do texto
  inputFocusBorder?: string; // Borda no focus
  labelColor?: string;     // Cor dos labels
  buttonBg?: string;       // Background do botao
  // Hover é calculado automaticamente com lighten(buttonBg, 15)
}
```

### CSS Variables disponiveis

```css
/* Primary brand colors */
--color-primary-500, --color-primary-400, --color-primary-600

/* Secondary brand colors */
--color-secondary-500, --color-secondary-400, --color-secondary-600

/* Button colors */
--color-button-bg, --color-button-hover, --color-button-active

/* Text colors */
--color-text-primary, --color-text-secondary, --color-text-muted

/* 8 Surface colors (adapta ao mode) */
--color-surface-1 até --color-surface-8

/* Background aliases */
--color-dark-950, --color-dark-900, --color-dark-800

/* Border */
--color-border

/* Section-specific (via ThemedSection) */
--section-bg-primary, --section-bg-secondary, --section-bg-tertiary
--section-text-primary, --section-text-secondary, --section-text-accent
--section-button-bg, --section-button-text
--section-border
```

### Sections IDs

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

---

## Important Files

### Core
- `src/App.tsx` - Root component, providers setup
- `src/index.css` - Global styles, animations, base theme

### Components
- `src/components/Header.tsx` - Header com Google Reviews badge
- `src/components/Hero.tsx` - Hero section com form de contato
- `src/components/ThemeSidebar.tsx` - UI de configuracao (dev only)
- `src/components/GoogleReviewBadge.tsx` - Badge reutilizavel
- `src/components/PaletteInjector.tsx` - Injeta CSS variables
- `src/components/ThemedSection.tsx` - Wrapper de secao com tema
- `src/components/Toast.tsx` - Sistema de notificacoes

### Contexts
- `src/context/GlobalConfigContext.tsx` - Brand colors, mode, form config
- `src/context/SectionThemeContext.tsx` - Temas por secao, palettes
- `src/context/HeaderConfigContext.tsx` - Config do header

### Config
- `src/config/sectionPalettes.ts` - 16 paletas pre-definidas (8 dark, 8 light)

### Utils
- `src/utils/colorUtils.ts` - Geracao de paleta, lighten/darken, contrast

---

## Commands

```bash
npm run dev      # Start dev server (hot-reload)
npm run build    # Production build (só quando pedido)
npm run lint     # ESLint check
```

---

## Light/Dark Mode

Quando o mode muda de dark para light:

1. **Surface colors invertem**: s1 passa de `#0a0a0a` para `#ffffff`
2. **Text colors invertem**: primary de `#ffffff` para `#111827`
3. **Borders adaptam**: de `#333333` para `#d4d4d4`
4. **Hero overlay**: opacidade ajusta (0.85 dark, 0.92 light)
5. **Shadows**: mais sutis no light mode

Componentes que usam `palette.surface.*` automaticamente adaptam ao modo.
