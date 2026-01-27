/**
 * Section Palettes - Dynamically generated from brand colors
 *
 * Each palette has 3 main colors:
 * - Background (bgPrimary)
 * - Text (textPrimary)
 * - Accent (distinct highlight color)
 *
 * Palettes are generated based on:
 * - Temperature variations (warm/cool)
 * - Saturation levels (vibrant/muted)
 * - Brand color influence (primary/secondary tints)
 */

import {
  generateDarkPalettes,
  generateLightPalettes,
  generateAllPalettes,
  type GeneratedPalette,
} from '../utils/colorUtils';

// Re-export types
export type SectionPalette = GeneratedPalette;

// Default brand colors (used when no config is loaded)
const DEFAULT_PRIMARY = '#3ab342';
const DEFAULT_ACCENT = '#f97316';

// Generate default palettes (these will be replaced by dynamic generation in context)
export const darkPalettes = generateDarkPalettes(DEFAULT_PRIMARY, DEFAULT_ACCENT);
export const lightPalettes = generateLightPalettes(DEFAULT_PRIMARY, DEFAULT_ACCENT);
export const allPalettes = [...darkPalettes, ...lightPalettes];

// Helper to get palette by ID from a list
export function getPaletteById(id: string, palettes: SectionPalette[] = allPalettes): SectionPalette | undefined {
  return palettes.find(p => p.id === id);
}

// Helper to get palettes by mode
export function getPalettesByMode(mode: 'dark' | 'light', palettes: SectionPalette[] = allPalettes): SectionPalette[] {
  return palettes.filter(p => p.mode === mode);
}

// Default palette IDs (first palette in each list = brand primary)
export const DEFAULT_DARK_PALETTE = 'brand-primary-dark';
export const DEFAULT_LIGHT_PALETTE = 'brand-primary-light';

// Re-export generation functions for use in context
export { generateDarkPalettes, generateLightPalettes, generateAllPalettes };
