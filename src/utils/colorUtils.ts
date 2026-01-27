// Color utility functions for the brand color system

/**
 * Convert hex to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
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
 * Generate a full color palette from a base color
 */
export interface ColorShades {
  50: string;   // Lightest
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;  // Base
  600: string;
  700: string;
  800: string;
  900: string;  // Darkest
  950: string;  // Extra dark
}

export function generateShades(baseColor: string): ColorShades {
  return {
    50: lighten(baseColor, 95),
    100: lighten(baseColor, 85),
    200: lighten(baseColor, 70),
    300: lighten(baseColor, 50),
    400: lighten(baseColor, 25),
    500: baseColor,
    600: darken(baseColor, 10),
    700: darken(baseColor, 25),
    800: darken(baseColor, 40),
    900: darken(baseColor, 55),
    950: darken(baseColor, 70),
  };
}

/**
 * Surface palette - 8 consistent colors per mode
 * These are the base colors for backgrounds/surfaces
 */
export interface SurfacePalette {
  // From lightest to darkest (or darkest to lightest in dark mode)
  s1: string;  // Main background
  s2: string;  // Elevated surface (cards)
  s3: string;  // Subtle background
  s4: string;  // Input backgrounds
  s5: string;  // Hover states
  s6: string;  // Active states
  s7: string;  // Borders
  s8: string;  // Dividers
}

/**
 * Brand color system - simplified palette for sections (Primary + Accent)
 */
export interface BrandPalette {
  primary: {
    light: string;
    base: string;
    dark: string;
  };
  accent: {
    light: string;
    base: string;
    dark: string;
  };
  neutral: {
    light: string;
    base: string;
    dark: string;
  };
  // 8 surface colors based on mode
  surface: SurfacePalette;
  // Pre-computed backgrounds and text colors based on mode
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

export type ColorMode = 'light' | 'dark';

/**
 * Generate the complete brand palette based on primary + accent colors and mode
 */
export function generateBrandPalette(
  primaryColor: string,
  accentColor: string,
  mode: ColorMode
): BrandPalette {
  const primaryShades = generateShades(primaryColor);
  const accentShades = generateShades(accentColor);

  if (mode === 'dark') {
    // Dark mode: 8 surface colors from darkest to lightest
    const surface: SurfacePalette = {
      s1: '#0a0a0a',   // Main background (darkest)
      s2: '#111111',   // Elevated surface
      s3: '#161616',   // Subtle background
      s4: '#1a1a1a',   // Input backgrounds
      s5: '#222222',   // Hover states
      s6: '#2a2a2a',   // Active states
      s7: '#333333',   // Borders
      s8: '#404040',   // Dividers (lightest)
    };

    return {
      primary: {
        light: primaryShades[400],
        base: primaryShades[500],
        dark: primaryShades[600],
      },
      accent: {
        light: accentShades[400],
        base: accentShades[500],
        dark: accentShades[600],
      },
      neutral: {
        light: '#374151',  // gray-700
        base: '#1f2937',   // gray-800
        dark: '#111827',   // gray-900
      },
      surface,
      background: {
        primary: surface.s1,
        secondary: surface.s2,
        tertiary: surface.s4,
      },
      text: {
        primary: '#ffffff',
        secondary: '#d1d5db',  // gray-300
        muted: '#9ca3af',      // gray-400
      },
      border: surface.s7,
    };
  }

  // Light mode: 8 surface colors from lightest to darkest
  const surface: SurfacePalette = {
    s1: '#ffffff',   // Main background (lightest)
    s2: '#fafafa',   // Elevated surface
    s3: '#f5f5f5',   // Subtle background
    s4: '#f0f0f0',   // Input backgrounds
    s5: '#e8e8e8',   // Hover states
    s6: '#e0e0e0',   // Active states
    s7: '#d4d4d4',   // Borders
    s8: '#c0c0c0',   // Dividers (darkest)
  };

  return {
    primary: {
      light: primaryShades[400],
      base: primaryShades[500],
      dark: primaryShades[600],
    },
    accent: {
      light: accentShades[300],
      base: accentShades[500],
      dark: accentShades[700],
    },
    neutral: {
      light: '#f9fafb',  // gray-50
      base: '#f3f4f6',   // gray-100
      dark: '#e5e7eb',   // gray-200
    },
    surface,
    background: {
      primary: surface.s1,
      secondary: surface.s2,
      tertiary: surface.s4,
    },
    text: {
      primary: '#111827',  // gray-900
      secondary: '#374151', // gray-700
      muted: '#6b7280',     // gray-500
    },
    border: surface.s7,
  };
}

/**
 * Preset brand color combinations (Primary + Accent)
 * 4 Dark presets (saturated, bold colors for dark mode)
 * 4 Light presets (softer, muted colors for light mode)
 */
export const brandPresets = [
  // === DARK PRESETS (4) - Bold, saturated colors ===
  { name: 'Forest', primary: '#22c55e', accent: '#10b981', tone: 'dark' },
  { name: 'Ocean', primary: '#3b82f6', accent: '#0ea5e9', tone: 'dark' },
  { name: 'Sunset', primary: '#f97316', accent: '#f59e0b', tone: 'dark' },
  { name: 'Berry', primary: '#a855f7', accent: '#c026d3', tone: 'dark' },
  // === LIGHT PRESETS (4) - Softer, muted colors ===
  { name: 'Sage', primary: '#059669', accent: '#14b8a6', tone: 'light' },
  { name: 'Sky', primary: '#0284c7', accent: '#6366f1', tone: 'light' },
  { name: 'Coral', primary: '#dc2626', accent: '#ef4444', tone: 'light' },
  { name: 'Lavender', primary: '#7c3aed', accent: '#a855f7', tone: 'light' },
];

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
 * Adjust saturation of a color
 */
export function saturate(hex: string, amount: number): string {
  const hsl = hexToHsl(hex);
  if (!hsl) return hex;
  return hslToHex(hsl.h, Math.min(100, Math.max(0, hsl.s + amount)), hsl.l);
}

/**
 * Desaturate a color
 */
export function desaturate(hex: string, amount: number): string {
  return saturate(hex, -amount);
}

/**
 * Shift hue of a color
 */
export function shiftHue(hex: string, degrees: number): string {
  const hsl = hexToHsl(hex);
  if (!hsl) return hex;
  return hslToHex((hsl.h + degrees + 360) % 360, hsl.s, hsl.l);
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
 * Set lightness of a color
 */
export function setLightness(hex: string, lightness: number): string {
  const hsl = hexToHsl(hex);
  if (!hsl) return hex;
  return hslToHex(hsl.h, hsl.s, Math.min(100, Math.max(0, lightness)));
}

/**
 * Set saturation of a color
 */
export function setSaturation(hex: string, saturation: number): string {
  const hsl = hexToHsl(hex);
  if (!hsl) return hex;
  return hslToHex(hsl.h, Math.min(100, Math.max(0, saturation)), hsl.l);
}

// ============================================
// DYNAMIC PALETTE GENERATION
// ============================================

export interface GeneratedPalette {
  id: string;
  name: string;
  mode: 'dark' | 'light';
  colors: {
    bgPrimary: string;
    bgSecondary: string;
    bgTertiary: string;
    textPrimary: string;
    textSecondary: string;
    accent: string;
    borderColor: string;
  };
}

/**
 * Generate dark palettes from brand colors (6 total)
 * Uses Primary + Accent color system
 */
export function generateDarkPalettes(primary: string, accent: string): GeneratedPalette[] {
  return [
    // 1. Brand Primary Dark - dark with PRIMARY as accent
    {
      id: 'brand-primary-dark',
      name: 'Brand Primary',
      mode: 'dark',
      colors: {
        bgPrimary: '#0a0a0a',
        bgSecondary: '#141414',
        bgTertiary: '#1f1f1f',
        textPrimary: '#ffffff',
        textSecondary: '#a3a3a3',
        accent: primary,
        borderColor: mixColors('#2a2a2a', primary, 10),
      },
    },
    // 2. Brand Accent Dark - dark with ACCENT as accent
    {
      id: 'brand-accent-dark',
      name: 'Brand Accent',
      mode: 'dark',
      colors: {
        bgPrimary: '#0a0a0a',
        bgSecondary: '#141414',
        bgTertiary: '#1f1f1f',
        textPrimary: '#ffffff',
        textSecondary: '#a3a3a3',
        accent: accent,
        borderColor: mixColors('#2a2a2a', accent, 10),
      },
    },
    // 3. Primary Tint Dark - subtle primary tint in backgrounds
    {
      id: 'primary-tint-dark',
      name: 'Primary Tint',
      mode: 'dark',
      colors: {
        bgPrimary: mixColors('#0a0a0a', primary, 6),
        bgSecondary: mixColors('#141414', primary, 8),
        bgTertiary: mixColors('#1f1f1f', primary, 6),
        textPrimary: '#ffffff',
        textSecondary: lighten(desaturate(primary, 30), 40),
        accent: primary,
        borderColor: mixColors('#2a2a2a', primary, 15),
      },
    },
    // 4. Accent Tint Dark - subtle accent tint in backgrounds
    {
      id: 'accent-tint-dark',
      name: 'Accent Tint',
      mode: 'dark',
      colors: {
        bgPrimary: mixColors('#0a0a0a', accent, 6),
        bgSecondary: mixColors('#141414', accent, 8),
        bgTertiary: mixColors('#1f1f1f', accent, 6),
        textPrimary: '#ffffff',
        textSecondary: lighten(desaturate(accent, 30), 40),
        accent: accent,
        borderColor: mixColors('#2a2a2a', accent, 15),
      },
    },
    // 5. Vibrant Dark - more saturated mix
    {
      id: 'vibrant-dark',
      name: 'Vibrant',
      mode: 'dark',
      colors: {
        bgPrimary: mixColors('#0a0a0a', primary, 10),
        bgSecondary: mixColors('#141414', accent, 12),
        bgTertiary: mixColors('#1f1f1f', primary, 8),
        textPrimary: '#ffffff',
        textSecondary: lighten(primary, 35),
        accent: saturate(accent, 20),
        borderColor: mixColors('#2a2a2a', primary, 20),
      },
    },
    // 6. Muted Dark - desaturated
    {
      id: 'muted-dark',
      name: 'Muted',
      mode: 'dark',
      colors: {
        bgPrimary: '#0f0f0f',
        bgSecondary: '#171717',
        bgTertiary: '#1e1e1e',
        textPrimary: '#e5e5e5',
        textSecondary: '#808080',
        accent: desaturate(accent, 15),
        borderColor: '#292929',
      },
    },
  ];
}

/**
 * Generate light palettes from brand colors (6 total)
 * Uses Primary + Accent color system
 */
export function generateLightPalettes(primary: string, accent: string): GeneratedPalette[] {
  return [
    // 1. Brand Primary Light - clean white with PRIMARY as accent
    {
      id: 'brand-primary-light',
      name: 'Brand Primary',
      mode: 'light',
      colors: {
        bgPrimary: '#ffffff',
        bgSecondary: '#f8f8f8',
        bgTertiary: '#f0f0f0',
        textPrimary: '#111827',
        textSecondary: '#4b5563',
        accent: primary,
        borderColor: mixColors('#d4d4d4', primary, 10),
      },
    },
    // 2. Brand Accent Light - clean white with ACCENT as accent
    {
      id: 'brand-accent-light',
      name: 'Brand Accent',
      mode: 'light',
      colors: {
        bgPrimary: '#ffffff',
        bgSecondary: '#f8f8f8',
        bgTertiary: '#f0f0f0',
        textPrimary: '#111827',
        textSecondary: '#4b5563',
        accent: accent,
        borderColor: mixColors('#d4d4d4', accent, 10),
      },
    },
    // 3. Primary Tint Light - subtle primary tint in backgrounds
    {
      id: 'primary-tint-light',
      name: 'Primary Tint',
      mode: 'light',
      colors: {
        bgPrimary: mixColors('#ffffff', primary, 3),
        bgSecondary: mixColors('#f8f8f8', primary, 5),
        bgTertiary: mixColors('#f0f0f0', primary, 7),
        textPrimary: '#111827',
        textSecondary: darken(desaturate(primary, 30), 40),
        accent: primary,
        borderColor: mixColors('#e0e0e0', primary, 12),
      },
    },
    // 4. Accent Tint Light - subtle accent tint in backgrounds
    {
      id: 'accent-tint-light',
      name: 'Accent Tint',
      mode: 'light',
      colors: {
        bgPrimary: mixColors('#ffffff', accent, 3),
        bgSecondary: mixColors('#f8f8f8', accent, 5),
        bgTertiary: mixColors('#f0f0f0', accent, 7),
        textPrimary: '#111827',
        textSecondary: darken(desaturate(accent, 30), 40),
        accent: accent,
        borderColor: mixColors('#e0e0e0', accent, 12),
      },
    },
    // 5. Vibrant Light - more saturated
    {
      id: 'vibrant-light',
      name: 'Vibrant',
      mode: 'light',
      colors: {
        bgPrimary: setLightness(setSaturation(primary, 20), 98),
        bgSecondary: setLightness(setSaturation(primary, 25), 95),
        bgTertiary: setLightness(setSaturation(primary, 30), 92),
        textPrimary: setLightness(setSaturation(primary, 70), 20),
        textSecondary: setLightness(setSaturation(primary, 50), 35),
        accent: saturate(accent, 10),
        borderColor: setLightness(setSaturation(primary, 30), 82),
      },
    },
    // 6. Muted Light - desaturated
    {
      id: 'muted-light',
      name: 'Muted',
      mode: 'light',
      colors: {
        bgPrimary: '#fafafa',
        bgSecondary: '#f5f5f5',
        bgTertiary: '#eeeeee',
        textPrimary: '#333333',
        textSecondary: '#666666',
        accent: desaturate(accent, 15),
        borderColor: '#dddddd',
      },
    },
  ];
}

/**
 * Generate all palettes from brand colors (6 dark + 6 light = 12 total)
 */
export function generateAllPalettes(primary: string, accent: string): GeneratedPalette[] {
  return [
    ...generateDarkPalettes(primary, accent),
    ...generateLightPalettes(primary, accent),
  ];
}
