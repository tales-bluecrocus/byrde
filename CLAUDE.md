# Byrde Theme - Documentação Técnica

## Visão Geral

Theme WordPress headless com frontend React. O WordPress serve como backend (dados + API) e o React renderiza toda a UI.

## Stack Tecnológico

| Camada | Tecnologia |
|--------|------------|
| CMS | WordPress 6.x |
| Frontend | React 18 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui (Radix primitives) |
| Estado | React Context API |
| Settings | ACF Pro (Advanced Custom Fields) |

---

## Estrutura de Diretórios

```
byrde/
├── front-end/                    # Aplicação React
│   ├── src/
│   │   ├── components/           # Componentes React
│   │   ├── context/              # React Contexts (estado global)
│   │   ├── hooks/                # Custom hooks
│   │   ├── utils/                # Utilitários
│   │   └── assets/images/        # Assets estáticos (logo fallback)
│   ├── dist/                     # Build de produção (gerado)
│   └── package.json
├── inc/                          # PHP modules
│   ├── acf-theme-settings.php    # ACF options page + settings
│   ├── cleanup.php               # Remove posts/comments do WP
│   ├── page-theme-editor.php     # Editor visual (iframe + REST API)
│   └── rest-content-api.php      # API para conteúdo das seções
├── functions.php                 # Bootstrap do theme
├── index.php                     # Template principal (monta <div id="root">)
├── page.php                      # Usa index.php
└── style.css                     # Metadata do theme
```

---

## Arquitetura de Dados

### 1. Theme Settings (ACF)
**Onde**: Options page do WordPress (`/wp-admin/admin.php?page=theme-settings`)
**Armazenamento**: `wp_options` table (ACF options)
**Uso no React**: `window.byrdeSettings` (injetado via `wp_localize_script`)

```php
// Campos disponíveis:
- logo, phone, email
- google_rating, google_reviews_count, google_reviews_url
- footer_tagline, footer_description, copyright
- facebook_url, instagram_url, youtube_url, yelp_url
```

### 2. Theme Config (cores, paletas, visibilidade)
**Onde**: Post meta `_byrde_theme_config` de cada page
**Armazenamento**: `wp_postmeta` table (serialized array)
**Uso no React**:
- Editor: `window.byrdeAdmin.config`
- Público: `window.byrdeConfig`

### 3. Section Content (textos editáveis)
**Onde**: Post meta `_byrde_content` de cada page
**Armazenamento**: `wp_postmeta` table (serialized array)
**Uso no React**:
- Editor: Fetch via REST API
- Público: `window.byrdeContent` (injetado via `wp_head`)

---

## REST API Endpoints

Base URL: `/wp-json/byrde/v1`

### Theme Config
| Method | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/pages/{id}/theme` | Retorna config de cores/paletas | `edit_post` |
| PUT | `/pages/{id}/theme` | Salva config de cores/paletas | `edit_post` |

### Section Content
| Method | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/pages/{id}/content` | Retorna conteúdo das seções | `edit_post` |
| PUT | `/pages/{id}/content` | Salva conteúdo das seções | `edit_post` |

### Outros
| Method | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/settings` | Retorna ACF settings | Público |
| POST | `/upload-image` | Upload de imagem | `upload_files` |

---

## Fluxo de Save (Editor)

```
User edita no ThemeSidebar
         ↓
Click "Save to WordPress"
         ↓
    ┌────┴────┐
    ↓         ↓
PUT /theme  PUT /content
    ↓         ↓
wp_postmeta wp_postmeta
(_byrde_theme_config) (_byrde_content)
```

**Código relevante**: `ThemeSidebar.tsx` → `handleSaveConfig()`

---

## Fluxo de Load

### Modo Editor (Preview iframe)
```
URL: /?byrde_preview=1&byrde_page_id={id}
         ↓
PHP injeta window.byrdeAdmin (com nonce, apiUrl, pageId, config)
         ↓
React monta com config do window.byrdeAdmin
         ↓
ContentContext faz fetch GET /pages/{id}/content
         ↓
Conteúdo carregado no estado
```

### Modo Público (Página normal)
```
URL: /home (ou qualquer page)
         ↓
PHP injeta:
- window.byrdeSettings (ACF)
- window.byrdeConfig (theme config)
- window.byrdeContent (section content)
         ↓
React monta com dados do window.*
```

---

## React Contexts

| Context | Arquivo | Responsabilidade |
|---------|---------|------------------|
| `GlobalConfigProvider` | `GlobalConfigContext.tsx` | Cores globais, paletas, brand settings |
| `SectionThemeProvider` | `SectionThemeContext.tsx` | Cores por seção, visibilidade, overrides |
| `HeaderConfigProvider` | `HeaderConfigContext.tsx` | Config do header (fixed, topbar, etc) |
| `ContentProvider` | `ContentContext.tsx` | Textos editáveis de cada seção |
| `SidebarProvider` | `SidebarContext.tsx` | Estado do sidebar (aberto/fechado) |
| `ToastProvider` | `Toast.tsx` | Notificações |

---

## Seções Disponíveis

| ID | Componente | Content Editable |
|----|------------|------------------|
| `hero` | `Hero.tsx` | headline, subheadline, badges, CTA |
| `featured-testimonial` | `FeaturedTestimonial.tsx` | quote, author, CTA |
| `services` | `ServicesGrid.tsx` | headline, services array |
| `mid-cta` | `MidPageCTA.tsx` | badge, headline, features, CTA |
| `service-areas` | `ServiceAreas.tsx` | headline, areas array, CTA |
| `testimonials` | `TestimonialsGrid.tsx` | headline, testimonials array |
| `faq` | `FAQ.tsx` | headline, faqs array, contact CTA |
| `footer-cta` | `FooterCTA.tsx` | headline, CTA |
| `footer` | `Footer.tsx` | description, copyright, links |

---

## Build & Deploy

### Desenvolvimento
```bash
cd front-end
npm install
npm run dev    # Vite dev server (hot reload)
```

### Produção
```bash
cd front-end
npm run build  # Gera dist/ com assets hasheados
```

**Output**: `front-end/dist/assets/index-{hash}.js` e `index-{hash}.css`

O WordPress detecta automaticamente os arquivos hasheados via `byrde_get_assets()` em `functions.php`.

---

## Editor Visual

**Acesso**: `/wp-admin/admin.php?page=byrde-editor&byrde_page_id={id}`

Estrutura:
- Header com botões (Exit, Preview, Save status)
- Iframe carregando a página com `?byrde_preview=1`
- Sidebar React (ThemeSidebar) dentro do iframe

O sidebar permite:
- Editar cores globais e por seção
- Alternar visibilidade de seções
- Editar conteúdo de cada seção
- Upload de imagens (background, logo)
- Salvar tudo no WordPress

---

## Notas Importantes

1. **Não há posts** - Removidos via `cleanup.php`. Apenas Pages.

2. **Imagens** - Background do Hero e Logo vêm do admin (Media Library). Fallback de logo existe em `assets/images/`.

3. **Paletas** - 12 paletas predefinidas em `SectionThemeContext.tsx`. Cada seção pode usar uma paleta diferente.

4. **Nonce** - Todas as requests autenticadas usam `X-WP-Nonce` header. Gerado via `wp_create_nonce('wp_rest')`.

5. **Serialização** - WordPress serializa arrays automaticamente no post_meta. Não usar `json_encode` manual no save.

---

## Troubleshooting

### Content não salva
- Verificar se `_byrde_content` está no `wp_postmeta`
- Usar `lando wp post meta get {id} _byrde_content`

### Content não carrega no público
- Verificar se `window.byrdeContent` está no page source
- PHP injeta apenas em `is_singular('page')`

### Build não reflete mudanças
- Verificar se `dist/` foi atualizado
- Limpar cache do browser
- Hash do arquivo muda a cada build
