// Theme Configuration
// Change these values to update the entire color scheme

export const themeConfig = {
  // Primary brand color (for accents, highlights)
  primary: '#3ab342',

  // Secondary/dark color (backgrounds)
  secondary: '#000000',

  // Text colors
  textPrimary: '#ffffff',
  textSecondary: '#a3a3a3',

  // Button colors (hover/active are auto-derived)
  buttonBg: '#3ab342',
  buttonText: '#ffffff',
};

// Color shade generator - creates lighter/darker variants
function hexToHSL(hex: string): { h: number; s: number; l: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { h: 0, s: 0, l: 0 };

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
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

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function generateShades(baseColor: string): Record<string, string> {
  const { h, s } = hexToHSL(baseColor);

  return {
    '50': hslToHex(h, Math.min(s, 30), 95),
    '100': hslToHex(h, Math.min(s, 40), 90),
    '200': hslToHex(h, Math.min(s, 50), 80),
    '300': hslToHex(h, Math.min(s, 60), 65),
    '400': hslToHex(h, s, 55),
    '500': baseColor,
    '600': hslToHex(h, s, 40),
  };
}

function generateDarkShades(baseColor: string): Record<string, string> {
  const { h, s } = hexToHSL(baseColor);

  return {
    '50': hslToHex(h, Math.min(s, 5), 96),
    '100': hslToHex(h, Math.min(s, 5), 83),
    '200': hslToHex(h, Math.min(s, 5), 64),
    '300': hslToHex(h, Math.min(s, 5), 45),
    '400': hslToHex(h, Math.min(s, 5), 32),
    '500': hslToHex(h, Math.min(s, 5), 25),
    '600': hslToHex(h, Math.min(s, 5), 15),
    '700': hslToHex(h, Math.min(s, 5), 10),
    '800': hslToHex(h, Math.min(s, 5), 7),
    '900': hslToHex(h, Math.min(s, 5), 4),
    '950': baseColor,
  };
}

// Generate button hover/active colors from base
function generateButtonColors(baseColor: string): { hover: string; active: string } {
  const { h, s, l } = hexToHSL(baseColor);
  return {
    hover: hslToHex(h, s, Math.min(l + 10, 70)), // Lighter for hover
    active: hslToHex(h, s, Math.max(l - 10, 30)), // Darker for active
  };
}

// Generate the full color palette
export const colors = {
  primary: generateShades(themeConfig.primary),
  dark: generateDarkShades(themeConfig.secondary),
};

// Apply theme to CSS variables
export function applyTheme(): void {
  const root = document.documentElement;

  // Primary colors
  Object.entries(colors.primary).forEach(([shade, color]) => {
    root.style.setProperty(`--color-primary-${shade}`, color);
  });

  // Dark colors
  Object.entries(colors.dark).forEach(([shade, color]) => {
    root.style.setProperty(`--color-dark-${shade}`, color);
  });

  // Text colors
  root.style.setProperty('--color-text-primary', themeConfig.textPrimary);
  root.style.setProperty('--color-text-secondary', themeConfig.textSecondary);

  // Button colors (hover/active auto-generated)
  const buttonColors = generateButtonColors(themeConfig.buttonBg);
  root.style.setProperty('--color-button-bg', themeConfig.buttonBg);
  root.style.setProperty('--color-button-text', themeConfig.buttonText);
  root.style.setProperty('--color-button-hover', buttonColors.hover);
  root.style.setProperty('--color-button-active', buttonColors.active);
}

// Update theme dynamically
export function updateTheme(options: {
  primary?: string;
  secondary?: string;
  textPrimary?: string;
  textSecondary?: string;
  buttonBg?: string;
  buttonText?: string;
}): void {
  const root = document.documentElement;

  if (options.primary) {
    const newPrimaryShades = generateShades(options.primary);
    Object.entries(newPrimaryShades).forEach(([shade, color]) => {
      root.style.setProperty(`--color-primary-${shade}`, color);
    });
  }

  if (options.secondary) {
    const newDarkShades = generateDarkShades(options.secondary);
    Object.entries(newDarkShades).forEach(([shade, color]) => {
      root.style.setProperty(`--color-dark-${shade}`, color);
    });
  }

  if (options.textPrimary) {
    root.style.setProperty('--color-text-primary', options.textPrimary);
  }

  if (options.textSecondary) {
    root.style.setProperty('--color-text-secondary', options.textSecondary);
  }

  if (options.buttonBg) {
    const buttonColors = generateButtonColors(options.buttonBg);
    root.style.setProperty('--color-button-bg', options.buttonBg);
    root.style.setProperty('--color-button-hover', buttonColors.hover);
    root.style.setProperty('--color-button-active', buttonColors.active);
  }

  if (options.buttonText) {
    root.style.setProperty('--color-button-text', options.buttonText);
  }
}
