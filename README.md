# Lake City Hauling - Landing Page

Landing page de alta conversao para servicos de junk removal em North Idaho e Spokane.

## Stack

- **React 19** + **TypeScript**
- **Vite** - Build tool
- **Tailwind CSS 4** - Styling

## Scripts

```bash
npm run dev      # Inicia servidor de desenvolvimento
npm run build    # Build de producao
npm run preview  # Preview do build
npm run lint     # Lint do codigo
```

## Estrutura do Projeto

```
src/
├── assets/
│   └── images/           # Logo, hero background
├── components/
│   ├── Header.tsx        # Header com logo, badge Google, CTA
│   ├── Hero.tsx          # Hero section com form de contato
│   ├── FeaturedTestimonial.tsx
│   ├── ServicesGrid.tsx  # Grid de servicos oferecidos
│   ├── MidPageCTA.tsx    # CTA intermediario
│   ├── ServiceAreas.tsx  # Areas de atendimento
│   ├── TestimonialsGrid.tsx
│   ├── FAQ.tsx           # Accordion de perguntas frequentes
│   ├── Footer.tsx
│   ├── SEO.tsx           # Meta tags e JSON-LD
│   ├── ThemedSection.tsx # Wrapper para secoes com tema
│   ├── ThemeSidebar.tsx  # Sidebar de configuracao de temas (dev only)
│   └── Toast.tsx         # Sistema de notificacoes
└── context/
    ├── SectionThemeContext.tsx  # Contexto de temas por secao
    └── HeaderConfigContext.tsx  # Configuracoes do header
```

## Sistema de Theming

O projeto possui um sistema de theming por secao que permite customizar cores de cada bloco da pagina.

### Funcionalidades

- **Sidebar fixa** (apenas em modo dev) estilo Webflow
- **Configuracao por secao** via accordion
- **Propriedades disponiveis**:
  - Background color
  - Text color
- **Header configuravel**:
  - Fixed/sticky toggle
  - Topbar show/hide
  - Topbar background color
- **Persistencia em localStorage**
- **Export JSON** com toast notification

### Como usar

1. Rode `npm run dev`
2. A sidebar de theming aparece no lado esquerdo
3. Clique em qualquer secao para expandir
4. Ajuste as cores usando os color pickers
5. Clique em "Copy Config (JSON)" para exportar

### CSS Variables

As secoes utilizam CSS custom properties que podem ser sobrescritas:

```css
--section-bg-primary      /* Background principal da secao */
--section-bg-secondary    /* Background de cards/containers */
--section-bg-tertiary     /* Background de elementos internos */
--section-text-primary    /* Cor do texto principal */
--section-text-secondary  /* Cor do texto secundario */
--section-text-accent     /* Cor de destaque/accent */
--section-button-bg       /* Background de botoes */
--section-button-text     /* Cor do texto dos botoes */
--section-border          /* Cor das bordas */
```

## SEO

O componente `SEO.tsx` inclui:

- Meta tags basicas (title, description)
- Open Graph tags
- Twitter Cards
- JSON-LD structured data (LocalBusiness, FAQ)

## Desenvolvimento

### Adicionar nova secao

1. Crie o componente em `src/components/`
2. Adicione o ID em `SectionThemeContext.tsx` no tipo `SectionId`
3. Adicione o label em `SECTION_LABELS`
4. Envolva com `<ThemedSection id="seu-id">` no `App.tsx`

### Configurar Header

O header suporta:

- **isFixed**: Header fixo ao rolar
- **showTopbar**: Barra superior com contato
- **showPhone**: Botao de telefone
- **showBadge**: Badge de avaliacao Google
- **Rating dinamico**: Estrelas de 0-5.0 com suporte a meia estrela
