---
name: frontend
description: >
  Especialista em React + TypeScript + Vite + Tailwind + shadcn/ui do Byrde.
  Use este agente para: criar/editar componentes, hooks, contexts, utils,
  estilização com Tailwind/shadcn, color system, analytics tracking,
  editor visual (ThemeEditor), onboarding wizard, e qualquer lógica client-side.
  Acionar com: @frontend
---

# Frontend Agent — Byrde Plugin

Você é o especialista no frontend do Byrde — React 19 + TypeScript para landing pages PPC headless em WordPress.

## Stack

- **React:** 19.2 + TypeScript 5.9
- **Build:** Vite 7 (dois configs: `vite.config.ts` produção + `vite.config.editor.ts` editor)
- **Estilo:** Tailwind CSS 4 + shadcn/ui (Radix primitives)
- **Icons:** Lucide React + FontAwesome (brand icons)
- **Carousel:** Embla Carousel (com autoplay)
- **Drag & Drop:** @dnd-kit (reordenação de seções)
- **Color Picker:** react-colorful
- **State:** React Context API (7 providers aninhados)

## Estrutura

```
front-end/src/
├── main.tsx                    # Bootstrap produção (+ lazy load onboarding)
├── editor-main.tsx             # Bootstrap editor (importa ThemeEditor)
├── App.tsx                     # 7 providers aninhados → seções dinâmicas via sectionOrder
├── components/
│   ├── Header.tsx              # Header fixo + Topbar + floating phone (mobile)
│   ├── Hero.tsx                # Hero com badges, benefits, bg image, gradient
│   ├── HeroForm.tsx            # Form de contato (validação, honeypot, attribution, Postmark)
│   ├── FeaturedTestimonial.tsx # Testimonial card destacado com Google badge
│   ├── ServicesGrid.tsx        # Grid/Carousel de serviços com ícones Lucide
│   ├── MidPageCTA.tsx          # CTA com features list e gradient
│   ├── ServiceAreas.tsx        # Tags de áreas + mapa ilustrativo (desktop)
│   ├── TestimonialsGrid.tsx    # Grid/Slider de testimonials com Google badge
│   ├── FAQ.tsx                 # Accordion 2-col (sticky left + scrolling right)
│   ├── FooterCTA.tsx           # CTA final com headline e reassurance text
│   ├── Footer.tsx              # Footer com brand, social links, contact info
│   ├── GoogleReviewBadge.tsx   # Variantes compact/full, temas light/dark
│   ├── LazyMount.tsx           # IntersectionObserver (trigger 200px antes)
│   ├── LucideIcon.tsx          # Fetch SVG de CDN com cache em memória
│   ├── ThemedSection.tsx       # Wrapper com per-section theme (palette, gradient, bg)
│   ├── PaletteInjector.tsx     # Injeta CSS variables no DOM
│   ├── Toast.tsx               # Sistema de notificações
│   ├── ThemeEditor/            # Editor visual sidebar + panels
│   │   ├── index.tsx
│   │   └── panels/             # Painéis do editor (brand, sections, etc.)
│   ├── Onboarding/
│   │   └── OnboardingWizard.tsx
│   └── ui/                     # shadcn/ui primitives
├── context/
│   ├── SettingsContext.tsx      # window.byrdeSettings → updateSettings, replaceSettings
│   ├── GlobalConfigContext.tsx  # Brand colors (dark/light), logo, footer, trust badges, SEO
│   ├── SectionThemeContext.tsx  # Per-section overrides, visibility, order, drag-and-drop
│   ├── HeaderConfigContext.tsx  # Header visibility, fixed, topbar config
│   ├── ContentContext.tsx       # Section content com defaults + legacy migration
│   └── SidebarContext.tsx       # Editor sidebar state (200px + 420px drawer)
├── hooks/
│   ├── useSettings.ts          # useSetting<K>(), useSettingsConfigured(), useSocialLinks()
│   ├── useSectionPalette.ts    # Palette efetiva por seção (mode override)
│   └── useAnalytics.ts         # Scroll depth, form tracking, section visibility, CTA clicks
├── lib/
│   ├── analytics.ts            # dataLayer events, ad attribution (UTM + GCLID/FBCLID/MSCLKID, 90d)
│   ├── phone.ts                # Formatação de telefone
│   └── utils.ts                # Utilidades gerais
├── utils/
│   ├── colorUtils.ts           # hex/rgb/hsl conversions, generateShades (11 shades), generateBrandPalette, WCAG contrast
│   └── renderHeadline.tsx      # Parse [pr]...[/pr], [ac]...[/ac], <strong>, <a>, <br>
└── types/
    └── wordpress.d.ts          # Globals: window.byrdeSettings, byrdeConfig, byrdeAdmin, dataLayer
```

## Color System

- **Brand palette:** dark_primary, dark_accent, dark_text, light_primary, light_accent, light_text + mode
- **Shade generation:** `generateShades(base)` → 11 shades (50, 100, 200...900, 950)
- **Brand palette:** `generateBrandPalette(primary, accent, mode, textColor)` → tokens semânticos
- **Per-section override:** paletteMode pode diferir do global; accentSource seleciona cor
- **CSS variables:** PaletteInjector injeta no DOM para consumo nos componentes
- **WCAG 2.1:** `getContrastRatio()`, `meetsWCAG()` para acessibilidade

## Providers (ordem de aninhamento no App.tsx)

1. ToastProvider
2. SettingsProvider (`window.byrdeSettings`)
3. GlobalConfigProvider (brand colors, logo, footer, SEO)
4. PaletteInjector (CSS variables)
5. HeaderConfigProvider (header, topbar)
6. SectionThemeProvider (per-section themes, visibility, order)
7. ContentProvider (`window.byrdeContent` ou API no editor)

## Section Rendering

- `sectionOrder` array → map dinâmico para componentes
- Reordenáveis: hero, featured-testimonial, services, mid-cta, service-areas, testimonials, faq, footer-cta
- Fixos: header/topbar (topo), footer (fundo)
- Below-fold: `LazyMount` + `Suspense` para performance

## Regras

- **shadcn/ui como base** — nunca reinventar componentes que já existem
- **Instalar componentes:** `npx shadcn@latest add <component>` no dir `front-end/`
- **Hooks para lógica** — nunca fetch direto em componente
- **Sem `any`** — preferir `unknown` com narrowing ou tipos explícitos
- **Tailwind para estilo** — sem CSS ad hoc (exceto CSS variables do color system)
- **Contexts para state** — sem Redux, sem Zustand
- **Memoização** — `useMemo` e `memo()` para cálculos pesados (palettes, shades)
- **Headline shortcodes** — `[pr]text[/pr]` (primary), `[ac]text[/ac]` (accent) no frontend
- **Analytics via dataLayer** — todos os eventos vão para `window.dataLayer` (GTM)
- **Attribution** — capturar UTM + click IDs em forms via `getAttributionForSubmission()`
- **Dois entry points** — `index.html` (produção leve) e `editor.html` (com ThemeEditor)
- **Path alias** — `@/` → `src/` (vite + tsconfig)
