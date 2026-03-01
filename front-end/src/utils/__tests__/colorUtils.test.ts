/**
 * Color utility tests
 *
 * Tests: hex/RGB/HSL conversions, shade generation,
 * WCAG contrast ratio, and brand palette generation.
 */

import {
  hexToRgb,
  rgbToHex,
  hexToHsl,
  hslToHex,
  rgbToHsl,
  hslToRgb,
  lighten,
  darken,
  withAlpha,
  desaturate,
  mixColors,
  getContrastColor,
  getRelativeLuminance,
  getContrastRatio,
  meetsWCAG,
  formatContrastRatio,
  generateShades,
  generateBrandPalette,
} from '../colorUtils';

// ============================================
// hexToRgb
// ============================================

describe('hexToRgb', () => {
  it('converts 6-char hex to RGB', () => {
    expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
    expect(hexToRgb('#00ff00')).toEqual({ r: 0, g: 255, b: 0 });
    expect(hexToRgb('#0000ff')).toEqual({ r: 0, g: 0, b: 255 });
  });

  it('converts hex without # prefix', () => {
    expect(hexToRgb('ff0000')).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('handles 8-char hex (strips alpha)', () => {
    expect(hexToRgb('#ff0000ff')).toEqual({ r: 255, g: 0, b: 0 });
    expect(hexToRgb('#00ff0080')).toEqual({ r: 0, g: 255, b: 0 });
  });

  it('returns null for invalid hex', () => {
    expect(hexToRgb('#xyz')).toBeNull();
    expect(hexToRgb('')).toBeNull();
    expect(hexToRgb('#ff')).toBeNull();
  });

  it('converts black and white', () => {
    expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
    expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 });
  });
});

// ============================================
// rgbToHex
// ============================================

describe('rgbToHex', () => {
  it('converts RGB to hex', () => {
    expect(rgbToHex(255, 0, 0)).toBe('#ff0000');
    expect(rgbToHex(0, 255, 0)).toBe('#00ff00');
    expect(rgbToHex(0, 0, 255)).toBe('#0000ff');
  });

  it('clamps values to 0-255', () => {
    expect(rgbToHex(300, -10, 128)).toBe('#ff0080');
  });

  it('pads single-digit hex with 0', () => {
    expect(rgbToHex(0, 0, 0)).toBe('#000000');
    expect(rgbToHex(15, 15, 15)).toBe('#0f0f0f');
  });
});

// ============================================
// Round-trip: hex → RGB → hex
// ============================================

describe('hex ↔ RGB round-trip', () => {
  const testColors = ['#ff0000', '#00ff00', '#0000ff', '#3ab342', '#f97316', '#171717', '#ffffff'];

  it.each(testColors)('round-trips %s', (hex) => {
    const rgb = hexToRgb(hex)!;
    const result = rgbToHex(rgb.r, rgb.g, rgb.b);
    expect(result).toBe(hex);
  });
});

// ============================================
// hexToHsl / hslToHex
// ============================================

describe('hexToHsl', () => {
  it('converts red to HSL', () => {
    const hsl = hexToHsl('#ff0000')!;
    expect(hsl.h).toBeCloseTo(0, 0);
    expect(hsl.s).toBeCloseTo(100, 0);
    expect(hsl.l).toBeCloseTo(50, 0);
  });

  it('converts green to HSL', () => {
    const hsl = hexToHsl('#00ff00')!;
    expect(hsl.h).toBeCloseTo(120, 0);
    expect(hsl.s).toBeCloseTo(100, 0);
    expect(hsl.l).toBeCloseTo(50, 0);
  });

  it('converts white to HSL (achromatic)', () => {
    const hsl = hexToHsl('#ffffff')!;
    expect(hsl.s).toBeCloseTo(0, 0);
    expect(hsl.l).toBeCloseTo(100, 0);
  });

  it('returns null for invalid hex', () => {
    expect(hexToHsl('#xyz')).toBeNull();
  });
});

describe('hex ↔ HSL round-trip', () => {
  const testColors = ['#ff0000', '#00ff00', '#0000ff', '#3ab342', '#f97316'];

  it.each(testColors)('round-trips %s within ±1', (hex) => {
    const hsl = hexToHsl(hex)!;
    const result = hslToHex(hsl.h, hsl.s, hsl.l);
    // Allow small rounding differences
    const orig = hexToRgb(hex)!;
    const back = hexToRgb(result)!;
    expect(Math.abs(orig.r - back.r)).toBeLessThanOrEqual(1);
    expect(Math.abs(orig.g - back.g)).toBeLessThanOrEqual(1);
    expect(Math.abs(orig.b - back.b)).toBeLessThanOrEqual(1);
  });
});

// ============================================
// rgbToHsl / hslToRgb
// ============================================

describe('rgbToHsl', () => {
  it('converts pure gray', () => {
    const hsl = rgbToHsl(128, 128, 128);
    expect(hsl.s).toBeCloseTo(0, 0);
    expect(hsl.l).toBeCloseTo(50, 0);
  });
});

describe('hslToRgb', () => {
  it('converts achromatic (gray)', () => {
    const rgb = hslToRgb(0, 0, 50);
    expect(rgb.r).toBe(128);
    expect(rgb.g).toBe(128);
    expect(rgb.b).toBe(128);
  });
});

// ============================================
// lighten / darken
// ============================================

describe('lighten', () => {
  it('lightens black by 50% → gray', () => {
    const result = lighten('#000000', 50);
    const rgb = hexToRgb(result)!;
    expect(rgb.r).toBeCloseTo(128, 0);
    expect(rgb.g).toBeCloseTo(128, 0);
    expect(rgb.b).toBeCloseTo(128, 0);
  });

  it('lightens by 100% → white', () => {
    expect(lighten('#000000', 100)).toBe('#ffffff');
  });

  it('returns original for invalid hex', () => {
    expect(lighten('invalid', 50)).toBe('invalid');
  });
});

describe('darken', () => {
  it('darkens white by 50% → gray', () => {
    const result = darken('#ffffff', 50);
    const rgb = hexToRgb(result)!;
    expect(rgb.r).toBeCloseTo(128, 0);
    expect(rgb.g).toBeCloseTo(128, 0);
    expect(rgb.b).toBeCloseTo(128, 0);
  });

  it('darkens by 100% → black', () => {
    expect(darken('#ffffff', 100)).toBe('#000000');
  });
});

// ============================================
// withAlpha
// ============================================

describe('withAlpha', () => {
  it('returns rgba string', () => {
    expect(withAlpha('#ff0000', 0.5)).toBe('rgba(255, 0, 0, 0.5)');
  });

  it('returns original for invalid hex', () => {
    expect(withAlpha('bad', 0.5)).toBe('bad');
  });
});

// ============================================
// desaturate / mixColors
// ============================================

describe('desaturate', () => {
  it('reduces saturation', () => {
    const original = hexToHsl('#ff0000')!;
    const result = hexToHsl(desaturate('#ff0000', 50))!;
    expect(result.s).toBeLessThan(original.s);
  });
});

describe('mixColors', () => {
  it('mixes black and white at 50% → gray', () => {
    const result = mixColors('#000000', '#ffffff', 50);
    const rgb = hexToRgb(result)!;
    expect(rgb.r).toBe(128);
    expect(rgb.g).toBe(128);
    expect(rgb.b).toBe(128);
  });

  it('weight 0 returns first color', () => {
    expect(mixColors('#ff0000', '#0000ff', 0)).toBe('#ff0000');
  });

  it('weight 100 returns second color', () => {
    expect(mixColors('#ff0000', '#0000ff', 100)).toBe('#0000ff');
  });
});

// ============================================
// getContrastColor
// ============================================

describe('getContrastColor', () => {
  it('returns black text for white background', () => {
    expect(getContrastColor('#ffffff')).toBe('#000000');
  });

  it('returns white text for black background', () => {
    expect(getContrastColor('#000000')).toBe('#ffffff');
  });

  it('returns white text for dark blue', () => {
    expect(getContrastColor('#000080')).toBe('#ffffff');
  });
});

// ============================================
// WCAG Contrast
// ============================================

describe('getRelativeLuminance', () => {
  it('black = 0', () => {
    expect(getRelativeLuminance('#000000')).toBeCloseTo(0, 3);
  });

  it('white = 1', () => {
    expect(getRelativeLuminance('#ffffff')).toBeCloseTo(1, 3);
  });
});

describe('getContrastRatio', () => {
  it('black vs white = 21:1', () => {
    const ratio = getContrastRatio('#000000', '#ffffff');
    expect(ratio).toBeCloseTo(21, 0);
  });

  it('same color = 1:1', () => {
    const ratio = getContrastRatio('#3ab342', '#3ab342');
    expect(ratio).toBeCloseTo(1, 1);
  });

  it('is commutative (order does not matter)', () => {
    const r1 = getContrastRatio('#3ab342', '#ffffff');
    const r2 = getContrastRatio('#ffffff', '#3ab342');
    expect(r1).toBeCloseTo(r2, 5);
  });
});

describe('meetsWCAG', () => {
  it('4.5:1 meets AA', () => {
    expect(meetsWCAG(4.5)).toBe(true);
  });

  it('4.4:1 fails AA', () => {
    expect(meetsWCAG(4.4)).toBe(false);
  });

  it('7.0:1 meets AAA', () => {
    expect(meetsWCAG(7, 'AAA')).toBe(true);
  });

  it('6.9:1 fails AAA', () => {
    expect(meetsWCAG(6.9, 'AAA')).toBe(false);
  });
});

describe('formatContrastRatio', () => {
  it('formats as X.X:1', () => {
    expect(formatContrastRatio(4.5)).toBe('4.5:1');
    expect(formatContrastRatio(21)).toBe('21.0:1');
  });
});

// ============================================
// generateShades
// ============================================

describe('generateShades', () => {
  it('returns 11 shades (50-950)', () => {
    const shades = generateShades('#3ab342');
    const keys = Object.keys(shades).map(Number);
    expect(keys).toEqual([50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]);
  });

  it('500 shade is the exact base color', () => {
    const base = '#3ab342';
    const shades = generateShades(base);
    expect(shades[500]).toBe(base);
  });

  it('lighter shades (50-400) are lighter than base', () => {
    const shades = generateShades('#3ab342');
    const baseLum = getRelativeLuminance(shades[500]);
    for (const key of [50, 100, 200, 300, 400] as const) {
      expect(getRelativeLuminance(shades[key])).toBeGreaterThan(baseLum);
    }
  });

  it('darker shades (600-950) are darker than base', () => {
    const shades = generateShades('#3ab342');
    const baseLum = getRelativeLuminance(shades[500]);
    for (const key of [600, 700, 800, 900, 950] as const) {
      expect(getRelativeLuminance(shades[key])).toBeLessThan(baseLum);
    }
  });

  it('returns all-same shades for invalid hex', () => {
    const shades = generateShades('invalid');
    expect(shades[50]).toBe('invalid');
    expect(shades[500]).toBe('invalid');
    expect(shades[950]).toBe('invalid');
  });
});

// ============================================
// generateBrandPalette
// ============================================

describe('generateBrandPalette', () => {
  it('generates dark mode palette with correct structure', () => {
    const palette = generateBrandPalette('#3ab342', '#f97316', 'dark');

    expect(palette.primary[500]).toBe('#3ab342');
    expect(palette.accent[500]).toBe('#f97316');
    expect(palette.background.primary).toBe('#171717');
    expect(palette.background.secondary).toBeDefined();
    expect(palette.background.tertiary).toBeDefined();
    expect(palette.text.primary).toBe('#efefef');
    expect(palette.text.secondary).toBeDefined();
    expect(palette.text.muted).toBeDefined();
    expect(palette.border).toBeDefined();
  });

  it('generates light mode palette', () => {
    const palette = generateBrandPalette('#3ab342', '#f97316', 'light', '#ffffff', '#18181b');

    expect(palette.background.primary).toBe('#ffffff');
    expect(palette.text.primary).toBe('#18181b');
  });

  it('dark secondary bg is lighter than primary bg', () => {
    const palette = generateBrandPalette('#3ab342', '#f97316', 'dark');
    const primLum = getRelativeLuminance(palette.background.primary);
    const secLum = getRelativeLuminance(palette.background.secondary);
    expect(secLum).toBeGreaterThan(primLum);
  });

  it('light secondary bg is darker than primary bg', () => {
    const palette = generateBrandPalette('#3ab342', '#f97316', 'light', '#ffffff', '#18181b');
    const primLum = getRelativeLuminance(palette.background.primary);
    const secLum = getRelativeLuminance(palette.background.secondary);
    expect(secLum).toBeLessThan(primLum);
  });
});
