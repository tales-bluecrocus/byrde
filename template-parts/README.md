# Template Parts

This folder contains theme template parts (partials) that are called via `get_template_part()`.

## Structure

```
template-parts/
├── components/         # Reusable components (badges, cards, etc.)
└── README.md          # This file
```

## Usage

### Components

Components are called using `get_template_part()`:

```php
// Basic
<?php get_template_part('template-parts/components/google-reviews-badge'); ?>

// With arguments
<?php get_template_part('template-parts/components/google-reviews-badge', null, [
    'variant' => 'google-reviews-badge--dark',
    'score' => '4.9',
    'reviews' => '127',
    'show_reviews' => true,
    'show_logo' => true,
]); ?>
```

## Important

**DO NOT** place functional PHP files (functions, classes, hooks) in this folder.

- **template-parts/**: Template parts, partials, presentation HTML/PHP
- **inc/**: Functions, classes, hooks, PHP logic (auto-loaded)
- **assets/**: CSS, JS, images, fonts

Template parts are loaded only when explicitly called via `get_template_part()`, while files in `inc/` are automatically loaded in `functions.php`.
