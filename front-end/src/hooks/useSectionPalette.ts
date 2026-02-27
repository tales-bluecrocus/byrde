/**
 * Returns the effective BrandPalette for a section, considering paletteMode.
 *
 * When the section's paletteMode differs from the page mode, generates a
 * palette for that mode using the brand colors. Otherwise returns the global
 * palette. This ensures components that use inline styles (Hero, CTA, etc.)
 * get the correct palette colors for per-section mode overrides.
 */

import { useMemo } from 'react';
import { useGlobalConfig } from '../context/GlobalConfigContext';
import { useSectionTheme } from '../context/SectionThemeContext';
import { generateBrandPalette } from '../utils/colorUtils';
import type { BrandPalette } from '../utils/colorUtils';
import type { SectionId } from '../context/SectionThemeContext';
import type { BrandColors } from '../context/GlobalConfigContext';

export function useSectionPalette(sectionId: SectionId): BrandPalette {
  const { palette, globalConfig } = useGlobalConfig();
  const { sectionThemes } = useSectionTheme();
  const theme = sectionThemes[sectionId] || {};

  return useMemo(() => {
    const sectionMode = theme.paletteMode;
    if (!sectionMode || sectionMode === globalConfig.brand.mode) return palette;

    const b = globalConfig.brand;
    const isDark = sectionMode === 'dark';
    return generateBrandPalette(
      isDark ? b.darkPrimary : b.lightPrimary,
      isDark ? b.darkAccent : b.lightAccent,
      sectionMode,
      isDark ? b.darkBg : b.lightBg,
      isDark ? b.darkText : b.lightText,
    );
  }, [theme.paletteMode, globalConfig.brand, palette]);
}

/**
 * Resolve buttonStyle (1-4) to a hex color from brand colors.
 * 1 = primary, 2 = accent, 3 = dark background, 4 = dark text.
 * Default (undefined/1) returns palette.primary[500] (current mode primary).
 */
export function resolveButtonColor(
  style: number | undefined,
  brand: BrandColors,
  fallback: string,
): string {
  switch (style) {
    case 2: return brand.darkAccent;
    case 3: return brand.darkBg;
    case 4: return brand.darkText;
    default: return fallback; // style 1 or undefined: use section palette primary
  }
}
