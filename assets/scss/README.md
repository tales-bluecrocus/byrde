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

#### Primitive Colors (Base Palette)

Use apenas para criar novos tokens semânticos. **Prefira sempre as funções semânticas**.

```scss
// Brand
$primary-color: #1b67f6;
$primary-color-hover: #1350e2;
$primary-color-light: #eef7ff;

// Neutral
$white: #fff;
$black: #000;
$gray-50, $gray-100, $gray-200, $gray-300
$gray-500, $gray-700, $gray-900

// Status
$success: #17b26a;
$success-light: #edfcf3;
$warning: #f78e09;
$warning-light: #fffaeb;
$error: #f04438;
$error-light: #fef3f2;
```

#### Semantic Tokens (Use These!)

**Text Colors** - Use `text-color()`

```scss
color: text-color("primary"); // Main text (#212529)
color: text-color("secondary"); // Secondary text (#495057)
color: text-color("tertiary"); // Muted text (#adb5bd)
color: text-color("brand"); // Brand color
color: text-color("success"); // Success message
color: text-color("warning"); // Warning message
color: text-color("error"); // Error message
color: text-color("inverse"); // White text
```

**Button Colors** - Use `button-color()`

```scss
// Primary button
background: button-color("primary-bg");
color: button-color("primary-text");
&:hover {
	background: button-color("primary-hover");
}

// Secondary button
background: button-color("secondary-bg");
color: button-color("secondary-text");
&:hover {
	background: button-color("secondary-hover");
}

// Status buttons (success, warning, error)
background: button-color("success-bg");
color: button-color("success-text");
&:hover {
	background: button-color("success-hover");
}
```

**Form Colors** - Use `form-color()`

```scss
// Input styles
border: 1px solid form-color("border");
background: form-color("bg");
color: form-color("text");

// States
&:hover {
	border-color: form-color("border-hover");
}
&:focus {
	border-color: form-color("border-focus");
	outline: 2px solid form-color("outline");
}
&.error {
	border-color: form-color("border-error");
}
&:disabled {
	background: form-color("bg-disabled");
	color: form-color("text-disabled");
}

// Placeholder
&::placeholder {
	color: form-color("placeholder");
}
```

**Background Colors** - Use `bg-color()`

```scss
background: bg-color("primary"); // White
background: bg-color("secondary"); // Light gray
background: bg-color("tertiary"); // Medium gray
background: bg-color("brand"); // Brand tint
background: bg-color("success"); // Success bg
background: bg-color("warning"); // Warning bg
background: bg-color("error"); // Error bg
```

**Border Colors** - Use `border-color()`

```scss
border: 1px solid border-color("primary"); // Main border
border: 1px solid border-color("secondary"); // Stronger border
border: 1px solid border-color("brand"); // Brand border
border: 1px solid border-color("success"); // Success border
border: 1px solid border-color("warning"); // Warning border
border: 1px solid border-color("error"); // Error border
```

### Typography

**Font Families** - Use `font-family()`

```scss
font-family: font-family("body"); // Body text (articulat-cf)
font-family: font-family("display"); // Headings (articulat-cf)
```

**Font Sizes** - Use `font-size()`

```scss
font-size: font-size("xs"); // 1.2rem (12px)
font-size: font-size("sm"); // 1.4rem (14px)
font-size: font-size("md"); // 1.6rem (16px) ← Base
font-size: font-size("lg"); // 1.8rem (18px)
font-size: font-size("xl"); // 2.0rem (20px)
font-size: font-size("2xl"); // 2.4rem (24px)
font-size: font-size("3xl"); // 3.0rem (30px)
font-size: font-size("4xl"); // 3.6rem (36px)
font-size: font-size("5xl"); // 4.8rem (48px)
font-size: font-size("6xl"); // 6.0rem (60px)
```

**Line Heights** - Use `line-height()`

```scss
// Match with font-size keys
line-height: line-height("md"); // 2.4rem
line-height: line-height("3xl"); // 4.0rem
line-height: line-height("6xl"); // 7.2rem
```

**Example Usage**

```scss
.heading {
	font-family: font-family("display");
	font-size: font-size("4xl");
	line-height: line-height("4xl");
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
margin: spacing("xs"); // 0.4rem (4px)
margin: spacing("sm"); // 0.8rem (8px)
margin: spacing("md"); // 1.6rem (16px)
margin: spacing("lg"); // 2.4rem (24px)
margin: spacing("xl"); // 3.2rem (32px)
margin: spacing("2xl"); // 4.0rem (40px)
margin: spacing("3xl"); // 4.8rem (48px)
margin: spacing("4xl"); // 6.4rem (64px)
margin: spacing("5xl"); // 8.0rem (80px)
margin: spacing("6xl"); // 9.6rem (96px)
margin: spacing("7xl"); // 12.8rem (128px)
```

**Example**

```scss
.card {
	padding: spacing("2xl");
	margin-bottom: spacing("lg");
	gap: spacing("md");
}
```

### Border Radius

Use `radius()`:

```scss
border-radius: radius("none"); // 0
border-radius: radius("sm"); // 0.4rem
border-radius: radius("md"); // 0.8rem
border-radius: radius("lg"); // 1.2rem
border-radius: radius("xl"); // 1.6rem
border-radius: radius("2xl"); // 2.4rem
border-radius: radius("full"); // 9999px (circles/pills)
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
	font-size: font-size("6xl");
	padding: spacing("7xl");

	@include max($mobile) {
		font-size: font-size("4xl");
		padding: spacing("4xl");
	}
}
```

### Utility Classes

```html
<!-- Show only on mobile (<= 767px) -->
<div class="mobile-only">...</div>

<!-- Show only on tablet (768px - 1024px) -->
<div class="tablet-only">...</div>

<!-- Show only on desktop (>= 768px) -->
<div class="desktop-only">...</div>
```

## 🏗️ Grid System

```scss
.container {
	max-width: 1280px;
	padding: 0 spacing("2xl"); // 40px sides
	margin: 0 auto;

	@include max($tablet) {
		padding: 0 spacing("lg"); // 24px on tablet/mobile
	}
}
```

## 🎯 Component Examples

### Button Component

```scss
.btn {
	display: inline-flex;
	align-items: center;
	gap: spacing("sm");
	padding: spacing("sm") spacing("lg");
	font-family: font-family("body");
	font-size: font-size("md");
	line-height: line-height("md");
	border-radius: radius("md");
	border: none;
	cursor: pointer;
	transition: all 0.2s;

	// Primary variant
	&--primary {
		background: button-color("primary-bg");
		color: button-color("primary-text");

		&:hover {
			background: button-color("primary-hover");
		}
	}

	// Secondary variant
	&--secondary {
		background: button-color("secondary-bg");
		color: button-color("secondary-text");

		&:hover {
			background: button-color("secondary-hover");
		}
	}

	// Success variant
	&--success {
		background: button-color("success-bg");
		color: button-color("success-text");

		&:hover {
			background: button-color("success-hover");
		}
	}
}
```

### Form Input Component

```scss
.input {
	width: 100%;
	padding: spacing("sm") spacing("md");
	font-family: font-family("body");
	font-size: font-size("md");
	line-height: line-height("md");
	color: form-color("text");
	background: form-color("bg");
	border: 1px solid form-color("border");
	border-radius: radius("md");
	transition: all 0.2s;

	&::placeholder {
		color: form-color("placeholder");
	}

	&:hover {
		border-color: form-color("border-hover");
	}

	&:focus {
		outline: 2px solid form-color("outline");
		border-color: form-color("border-focus");
	}

	&--error {
		border-color: form-color("border-error");
	}

	&:disabled {
		background: form-color("bg-disabled");
		color: form-color("text-disabled");
		cursor: not-allowed;
	}
}
```

## ✅ Best Practices

### ✅ DO

```scss
// Use semantic tokens
color: text-color("primary");
background: button-color("primary-bg");
padding: spacing("lg");
border-radius: radius("md");

// Use functions consistently
font-family: font-family("body");
font-size: font-size("md");

// Mobile-first approach
.element {
	padding: spacing("2xl");

	@include max($tablet) {
		padding: spacing("lg");
	}
}
```

### ❌ DON'T

```scss
// Don't use primitive colors directly
color: $gray-700; // ❌
color: text-color("secondary"); // ✅

// Don't use magic numbers
padding: 2.4rem; // ❌
padding: spacing("lg"); // ✅

// Don't hardcode breakpoints
@media (max-width: 768px) {
} // ❌
@include max($tablet) {
} // ✅

// Don't mix units
padding: 24px; // ❌
padding: spacing("lg"); // ✅ (rem-based)
```

## 🔧 Configuration

### HTML Font Size

Base font-size is set to **62.5%** (10px), making rem calculations easy:

-   `1rem = 10px`
-   `1.6rem = 16px`
-   `2.4rem = 24px`

## 📦 How to Use

### In Components

```scss
@use "../generic/variables" as *;
@use "../generic/mixins" as *;

.my-component {
	padding: spacing("2xl");
	background: bg-color("primary");
	color: text-color("primary");
	border: 1px solid border-color("primary");
	border-radius: radius("lg");

	@include max($tablet) {
		padding: spacing("lg");
	}
}
```

## 🎯 Quick Reference

| Token Type   | Function              | Example                      |
| ------------ | --------------------- | ---------------------------- |
| Text Color   | `text-color('key')`   | `text-color('primary')`      |
| Button Color | `button-color('key')` | `button-color('primary-bg')` |
| Form Color   | `form-color('key')`   | `form-color('border-focus')` |
| Background   | `bg-color('key')`     | `bg-color('brand')`          |
| Border Color | `border-color('key')` | `border-color('primary')`    |
| Font Family  | `font-family('key')`  | `font-family('body')`        |
| Font Size    | `font-size('key')`    | `font-size('md')`            |
| Line Height  | `line-height('key')`  | `line-height('md')`          |
| Spacing      | `spacing('key')`      | `spacing('lg')`              |
| Radius       | `radius('key')`       | `radius('md')`               |

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
