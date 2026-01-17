# Template Parts

Esta pasta contém template parts (partials) do tema que são chamados via `get_template_part()`.

## Estrutura

```
template-parts/
├── components/         # Componentes reutilizáveis (badges, cards, etc.)
└── README.md          # Este arquivo
```

## Uso

### Componentes

Componentes são chamados usando `get_template_part()`:

```php
// Básico
<?php get_template_part('template-parts/components/google-reviews-badge'); ?>

// Com argumentos
<?php get_template_part('template-parts/components/google-reviews-badge', null, [
    'variant' => 'google-reviews-badge--dark',
    'score' => '4.9',
    'reviews' => '127',
    'show_reviews' => true,
    'show_logo' => true,
]); ?>
```

## ⚠️ Importante

**NÃO** coloque arquivos PHP funcionais (funções, classes, hooks) nesta pasta.

- ✅ **template-parts/**: Template parts, partials, HTML/PHP de apresentação
- ✅ **inc/**: Funções, classes, hooks, lógica PHP (auto-carregado)
- ✅ **assets/**: CSS, JS, imagens, fontes

Template parts são carregados apenas quando explicitamente chamados via `get_template_part()`, enquanto arquivos em `inc/` são carregados automaticamente no `functions.php`.
