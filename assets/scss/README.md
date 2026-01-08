# SCSS Documentation - Byrde Theme

## 📁 Structure

```
scss/
├── generic/
│   ├── _variables.scss   # Design tokens & system variables
│   ├── _mixins.scss      # Reusable media query mixins
│   ├── _functions.scss   # Utility classes for visibility
│   ├── _base.scss        # Base HTML resets
│   ├── _reset.scss       # Body & global styles
│   ├── _grid.scss        # Container & grid system
│   ├── _fonts.scss       # Font declarations
│   └── _load.scss        # Imports all generic files
└── load.scss             # Main entry point
```

## 🎨 Design System

### Color System

#### Primitive Colors (Raw Palette)

Use estas variáveis apenas para criar novos tokens semânticos:

```scss
// Primary Brand
$primary-color-50   // Lightest
$primary-color-700  // Default
$primary-color-950  // Darkest

// Gray Modern (preferred)
$gray-modern-50 to $gray-modern-950

// Status Colors
$success-50 to $success-950
$warning-50 to $warning-950
$error-50 to $error-950
```

#### Semantic Tokens (Use These!)

**Text Colors** - Use `text-color()`

```scss
color: text-color("primary"); // Main text (#1c1c1d)
color: text-color("secondary"); // Secondary text (#495057)
color: text-color("tertiary"); // Muted text (#868e96)
color: text-color("placeholder"); // Placeholder (#adb5bd)
color: text-color("disabled"); // Disabled state
color: text-color("inverse"); // White text
color: text-color("brand"); // Brand color text
color: text-color("success"); // Success message
color: text-color("warning"); // Warning message
color: text-color("error"); // Error message
```

**Background Colors** - Use `bg-color()`

```scss
background: bg-color("primary"); // White background
background: bg-color("secondary"); // Light gray bg
background: bg-color("tertiary"); // Medium gray bg
background: bg-color("brand"); // Brand color bg
background: bg-color("brand-light"); // Light brand tint
background: bg-color("brand-lighter"); // Lighter brand tint
background: bg-color("success"); // Success bg
background: bg-color("warning"); // Warning bg
background: bg-color("error"); // Error bg
background: bg-color("disabled"); // Disabled bg
background: bg-color("overlay"); // Modal overlay
```

**Border Colors** - Use `border-color()`

```scss
border: 1px solid border-color("primary"); // Main border
border: 1px solid border-color("secondary"); // Stronger border
border: 1px solid border-color("tertiary"); // Subtle border
border: 1px solid border-color("brand"); // Brand border
border: 1px solid border-color("success"); // Success border
border: 1px solid border-color("warning"); // Warning border
border: 1px solid border-color("error"); // Error border
border: 1px solid border-color("disabled"); // Disabled border
```

### Typography

**Font Families** - Use `font-family()`

```scss
font-family: font-family("body"); // Body text (articulat-cf)
font-family: font-family("display"); // Headings (articulat-cf)
```

**Font Sizes** - Use `font-size()`

```scss
// Text sizes
font-size: font-size("3xs"); // 0.8rem (8px)
font-size: font-size("xxs"); // 1.0rem (10px)
font-size: font-size("xs"); // 1.2rem (12px)
font-size: font-size("sm"); // 1.4rem (14px)
font-size: font-size("md"); // 1.6rem (16px) ← Base
font-size: font-size("lg"); // 1.8rem (18px)
font-size: font-size("xl"); // 2.0rem (20px)

// Display sizes
font-size: font-size("d-xs"); // 2.4rem (24px)
font-size: font-size("d-sm"); // 3.0rem (30px)
font-size: font-size("d-md"); // 3.6rem (36px)
font-size: font-size("d-lg"); // 4.0rem (40px)
font-size: font-size("d-xl"); // 4.8rem (48px)

// Hero sizes
font-size: font-size("h-md"); // 6.0rem (60px)
font-size: font-size("h-lg"); // 7.2rem (72px)
```

**Line Heights** - Use `line-height()`

```scss
// Match with font-size keys
line-height: line-height("md"); // 2.4rem
line-height: line-height("d-xl"); // 6.0rem
```

**Example Usage**

```scss
.heading {
	font-family: font-family("display");
	font-size: font-size("d-lg");
	line-height: line-height("d-lg");
	color: text-color("primary");
}

.body-text {
	font-family: font-family("body");
	font-size: font-size("md");
	line-height: line-height("md");
	color: text-color("secondary");
}
```

### Spacing System

Use `spacing()` para margins, paddings, gaps:

```scss
// Progressive scale (2xs → 12xl)
margin: spacing("2xs"); // 0.2rem (2px)
margin: spacing("xs"); // 0.4rem (4px)
margin: spacing("sm"); // 0.6rem (6px)
margin: spacing("md"); // 0.8rem (8px)
margin: spacing("lg"); // 1.0rem (10px)
margin: spacing("xl"); // 1.2rem (12px)
margin: spacing("2xl"); // 1.6rem (16px)
margin: spacing("3xl"); // 2.0rem (20px)
margin: spacing("4xl"); // 2.4rem (24px)
margin: spacing("5xl"); // 3.2rem (32px)
margin: spacing("6xl"); // 4.0rem (40px)
margin: spacing("7xl"); // 4.8rem (48px)
margin: spacing("8xl"); // 6.4rem (64px)
margin: spacing("9xl"); // 7.2rem (72px)
margin: spacing("10xl"); // 8.0rem (80px)
margin: spacing("11xl"); // 9.6rem (96px)
margin: spacing("12xl"); // 12.8rem (128px)
```

**Example**

```scss
.card {
	padding: spacing("6xl");
	margin-bottom: spacing("4xl");
	gap: spacing("3xl");
}
```

### Border Radius

Use `radius()`:

```scss
border-radius: radius("none"); // 0
border-radius: radius("2xs"); // 0.2rem
border-radius: radius("xs"); // 0.4rem
border-radius: radius("sm"); // 0.6rem
border-radius: radius("md"); // 0.8rem
border-radius: radius("lg"); // 1.0rem
border-radius: radius("xl"); // 1.2rem
border-radius: radius("2xl"); // 1.6rem
border-radius: radius("3xl"); // 2.0rem
border-radius: radius("4xl"); // 2.4rem
border-radius: radius("infinite"); // 999.9rem (pills)
```

## 📱 Responsive Design

### Breakpoints

```scss
$mobile: 767px; // Mobile and below
$tablet: 768px; // Tablet and above
```

### Mixins

```scss
// Max-width (mobile-first)
@include max(767) {
	// Styles for 767px and below
}

// Min-width (desktop-first)
@include min(768) {
	// Styles for 768px and above
}

// Between two breakpoints
@include between(768, 1024) {
	// Styles for tablet only
}
```

**Example**

```scss
.hero {
	font-size: font-size("h-lg");
	padding: spacing("12xl");

	@include max($mobile) {
		font-size: font-size("d-xl");
		padding: spacing("6xl");
	}
}
```

### Utility Classes

```scss
// Show only on mobile (<= 767px)
<div class="mobile-only">...</div>

// Show only on tablet (768px - 1024px)
<div class="tablet-only">...</div>

// Show only on desktop (>= 768px)
<div class="desktop-only">...</div>
```

## 🏗️ Grid System

```scss
.container {
	max-width: 1280px; // Desktop
	padding: 0 spacing("6xl"); // 40px sides
	margin: 0 auto;

	@include max($tablet) {
		padding: 0 spacing("4xl"); // 24px on tablet/mobile
	}
}
```

## ✅ Best Practices

### ✅ DO

```scss
// Use semantic tokens
color: text-color("primary");
background: bg-color("brand-light");
padding: spacing("4xl");
border-radius: radius("lg");

// Use functions consistently
font-family: font-family("body");
font-size: font-size("md");

// Mobile-first approach
.element {
	padding: spacing("6xl");

	@include max($tablet) {
		padding: spacing("4xl");
	}
}
```

### ❌ DON'T

```scss
// Don't use primitive colors directly
color: $gray-modern-700; // ❌
color: text-color("secondary"); // ✅

// Don't use magic numbers
padding: 2.4rem; // ❌
padding: spacing("4xl"); // ✅

// Don't hardcode breakpoints
@media (max-width: 768px) {
} // ❌
@include max($tablet) {
} // ✅

// Don't mix units
padding: 24px; // ❌
padding: spacing("4xl"); // ✅ (rem-based)
```

## 🔧 Configuration

### HTML Font Size

Base font-size is set to **62.5%** (10px), making rem calculations easy:

-   `1rem = 10px`
-   `1.6rem = 16px`
-   `2.4rem = 24px`

### Font Features

```scss
font-feature-settings: "ss04" on, "ss05" on;
```

## 📦 How to Use

### In Components

```scss
@use "../generic/variables" as *;
@use "../generic/mixins" as *;

.my-component {
	padding: spacing("6xl");
	background: bg-color("primary");
	color: text-color("primary");
	border: 1px solid border-color("primary");
	border-radius: radius("lg");

	@include max($tablet) {
		padding: spacing("4xl");
	}
}
```

### File Organization

```scss
// components/_button.scss
@use "../generic/variables" as *;
@use "../generic/mixins" as *;

.btn {
	font-family: font-family("body");
	font-size: font-size("md");
	padding: spacing("3xl") spacing("5xl");
	background: bg-color("brand");
	color: text-color("inverse");
	border-radius: radius("lg");

	&:hover {
		background: bg-color("brand-light");
	}

	@include max($mobile) {
		width: 100%;
	}
}
```

## 🎯 Quick Reference

| Token Type   | Function              | Example                   |
| ------------ | --------------------- | ------------------------- |
| Text Color   | `text-color('key')`   | `text-color('primary')`   |
| Background   | `bg-color('key')`     | `bg-color('brand')`       |
| Border Color | `border-color('key')` | `border-color('primary')` |
| Font Family  | `font-family('key')`  | `font-family('body')`     |
| Font Size    | `font-size('key')`    | `font-size('md')`         |
| Line Height  | `line-height('key')`  | `line-height('md')`       |
| Spacing      | `spacing('key')`      | `spacing('4xl')`          |
| Radius       | `radius('key')`       | `radius('lg')`            |

## 🚀 Adding New Components

1. Create your component file in `components/` or `blocks/`
2. Import variables and mixins:
    ```scss
    @use "../generic/variables" as *;
    @use "../generic/mixins" as *;
    ```
3. Use semantic tokens instead of primitive values
4. Follow mobile-first responsive approach
5. Add your import to the main load file

---

**Questions?** Check the source files in `/assets/scss/generic/` for all available tokens and values.
