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
