// Color utility functions for the brand color system

/**
 * Convert hex to RGB (supports 6-char and 8-char hex with alpha)
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  // Strip alpha channel if present (8-char hex → 6-char)
  const clean = hex.replace(/^#/, '');
  const rgb = clean.length === 8 ? clean.slice(0, 6) : clean;
  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(rgb);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Convert RGB to hex
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * Lighten a color by a percentage (0-100)
 */
export function lighten(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const factor = percent / 100;
  return rgbToHex(
    rgb.r + (255 - rgb.r) * factor,
    rgb.g + (255 - rgb.g) * factor,
    rgb.b + (255 - rgb.b) * factor
  );
}

/**
 * Darken a color by a percentage (0-100)
 */
export function darken(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const factor = 1 - percent / 100;
  return rgbToHex(
    rgb.r * factor,
    rgb.g * factor,
    rgb.b * factor
  );
}

/**
 * Add alpha/opacity to a hex color (returns rgba string)
 */
export function withAlpha(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

/**
 * Convert RGB to HSL
 */
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

/**
 * Convert HSL to RGB
 */
export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

/**
 * Convert hex to HSL
 */
export function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  return rgbToHsl(rgb.r, rgb.g, rgb.b);
}

/**
 * Convert HSL to hex
 */
export function hslToHex(h: number, s: number, l: number): string {
  const rgb = hslToRgb(h, s, l);
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}

/**
 * Desaturate a color
 */
export function desaturate(hex: string, amount: number): string {
  const hsl = hexToHsl(hex);
  if (!hsl) return hex;
  return hslToHex(hsl.h, Math.min(100, Math.max(0, hsl.s - amount)), hsl.l);
}

/**
 * Mix two colors together
 */
export function mixColors(hex1: string, hex2: string, weight: number = 50): string {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return hex1;

  const w = weight / 100;
  return rgbToHex(
    Math.round(rgb1.r * (1 - w) + rgb2.r * w),
    Math.round(rgb1.g * (1 - w) + rgb2.g * w),
    Math.round(rgb1.b * (1 - w) + rgb2.b * w)
  );
}

/**
 * Get contrasting text color (black or white) based on background
 */
export function getContrastColor(hexColor: string): string {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return '#ffffff';

  // Calculate relative luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

// ============================================
// WCAG CONTRAST VALIDATION
// ============================================

/**
 * Get relative luminance of a color (WCAG 2.1 formula)
 * Uses proper sRGB linearization with gamma correction
 */
export function getRelativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const [rs, gs, bs] = [rgb.r / 255, rgb.g / 255, rgb.b / 255].map(c =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Get WCAG 2.1 contrast ratio between two colors
 * Returns a value between 1:1 and 21:1
 */
export function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getRelativeLuminance(hex1);
  const l2 = getRelativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG level
 * AA: 4.5:1 for normal text, AAA: 7:1
 */
export function meetsWCAG(ratio: number, level: 'AA' | 'AAA' = 'AA'): boolean {
  return level === 'AAA' ? ratio >= 7 : ratio >= 4.5;
}

/**
 * Format contrast ratio as readable string (e.g. "4.5:1")
 */
export function formatContrastRatio(ratio: number): string {
  return `${ratio.toFixed(1)}:1`;
}

// ============================================
// SHADE GENERATION (Tailwind-style 50-950)
// ============================================

/**
 * Full Tailwind-compatible shade scale from a single base color.
 * The base color is used as-is for the 500 shade.
 * Lighter shades (50-400) increase lightness and reduce saturation.
 * Darker shades (600-950) decrease lightness and preserve saturation.
 */
export interface ColorShades {
  50: string;   // Lightest
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;  // Base (user's color, untouched)
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;  // Darkest
}

export function generateShades(baseColor: string): ColorShades {
  const hsl = hexToHsl(baseColor);
  if (!hsl) {
    return { 50: baseColor, 100: baseColor, 200: baseColor, 300: baseColor, 400: baseColor, 500: baseColor, 600: baseColor, 700: baseColor, 800: baseColor, 900: baseColor, 950: baseColor };
  }

  const { h, s, l } = hsl;

  // For lighter shades: interpolate lightness toward ~97 and reduce saturation
  // For darker shades: interpolate lightness toward ~4 and keep saturation
  return {
    50:  hslToHex(h, Math.max(s * 0.3, 5),  97),
    100: hslToHex(h, Math.max(s * 0.4, 8),  93),
    200: hslToHex(h, Math.max(s * 0.55, 12), 85),
    300: hslToHex(h, Math.max(s * 0.7, 18),  73),
    400: hslToHex(h, Math.max(s * 0.85, 25), 60),
    500: baseColor, // The user's color, EXACTLY as provided
    600: hslToHex(h, s, Math.max(l - 8,  20)),
    700: hslToHex(h, s, Math.max(l - 18, 15)),
    800: hslToHex(h, s, Math.max(l - 28, 10)),
    900: hslToHex(h, s, Math.max(l - 38, 7)),
    950: hslToHex(h, s, Math.max(l - 45, 4)),
  };
}

// ============================================
// BRAND PALETTE
// ============================================

export type ColorMode = 'light' | 'dark';

/**
 * Brand palette: 2 full shade scales (primary + accent) + semantic tokens by mode.
 * Primary and accent are full ColorShades (50-950) generated from the client's 2 colors.
 */
export interface BrandPalette {
  primary: ColorShades;
  accent: ColorShades;
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  text: {
    primary: string;
    secondary: string;
    muted: string;
  };
  border: string;
}

/**
 * Generate the complete brand palette from primary + accent + mode.
 * Background colors are auto-derived per mode.
 * Text color can be customized (defaults to #efefef dark, #2a2a2a light).
 */
export function generateBrandPalette(
  primaryColor: string,
  accentColor: string,
  mode: ColorMode,
  textColor?: string,
): BrandPalette {
  const primary = generateShades(primaryColor);
  const accent = generateShades(accentColor);

  if (mode === 'dark') {
    const bg = '#171717';
    const text = textColor || '#efefef';
    return {
      primary,
      accent,
      background: {
        primary: bg,
        secondary: lighten(bg, 4),
        tertiary: lighten(bg, 8),
      },
      text: {
        primary: text,
        secondary: darken(text, 18),
        muted: darken(text, 38),
      },
      border: lighten(bg, 16),
    };
  }

  // Light mode
  const bg = '#ffffff';
  const text = textColor || '#2a2a2a';
  return {
    primary,
    accent,
    background: {
      primary: bg,
      secondary: darken(bg, 2),
      tertiary: darken(bg, 5),
    },
    text: {
      primary: text,
      secondary: lighten(text, 25),
      muted: lighten(text, 45),
    },
    border: darken(bg, 12),
  };
}

