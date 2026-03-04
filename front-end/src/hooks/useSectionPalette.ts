/**
 * Returns the effective BrandPalette for a section, considering paletteMode.
 *
 * When the section's paletteMode differs from the page mode, generates a
 * palette for that mode using the correct per-mode color pair.
 */

import { useMemo } from 'react';
import { useGlobalConfig } from '../context/GlobalConfigContext';
import { useSectionTheme } from '../context/SectionThemeContext';
import { generateBrandPalette } from '../utils/colorUtils';
import type { BrandPalette } from '../utils/colorUtils';
import type { SectionId } from '../context/SectionThemeContext';
import type { BrandColors } from '../context/GlobalConfigContext';

/** Helper: pick the correct color pair for a given mode from BrandColors. */
export function getColorsForMode(brand: BrandColors, mode: 'dark' | 'light') {
  const isDark = mode === 'dark';
  return {
    primary: isDark ? brand.darkPrimary : brand.lightPrimary,
    accent: isDark ? brand.darkAccent : brand.lightAccent,
    text: isDark ? brand.darkText : brand.lightText,
  };
}

export function useSectionPalette(sectionId: SectionId): BrandPalette {
  const { palette, globalConfig } = useGlobalConfig();
  const { sectionThemes } = useSectionTheme();
  const theme = sectionThemes[sectionId] || {};

  return useMemo(() => {
    const sectionMode = theme.paletteMode;
    if (!sectionMode || sectionMode === globalConfig.brand.mode) return palette;

    const colors = getColorsForMode(globalConfig.brand, sectionMode);
    return generateBrandPalette(colors.primary, colors.accent, sectionMode, colors.text);
  }, [theme.paletteMode, globalConfig.brand, palette]);
}

/**
 * Resolve buttonStyle (1-4) to a hex color from brand colors.
 * 1 = section accent (primary or accent based on accentSource), 2 = opposite, 3 = dark, 4 = light.
 * Default (undefined/1) returns the fallback (typically the section accent color).
 */
export function resolveButtonColor(
  style: number | undefined,
  brand: BrandColors,
  fallback: string,
  mode: 'dark' | 'light' = 'dark',
): string {
  const colors = getColorsForMode(brand, mode);
  switch (style) {
    case 2: return colors.accent;
    case 3: return '#171717';
    case 4: return '#efefef';
    default: return fallback; // style 1 or undefined: use section palette primary
  }
}
