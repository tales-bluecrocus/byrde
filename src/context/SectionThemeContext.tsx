import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { DEFAULT_DARK_PALETTE, DEFAULT_LIGHT_PALETTE } from '../config/sectionPalettes';
import type { GeneratedPalette } from '../utils/colorUtils';

// Re-export for convenience
export type SectionPalette = GeneratedPalette;

// Section theme configuration
export interface SectionTheme {
  // Override global colors with section-specific palette
  overrideGlobalColors?: boolean; // If true, use palette colors instead of global
  paletteId?: string;             // ID of the selected palette (only used when override is true)
  paletteMode?: 'dark' | 'light'; // Individual dark/light mode for this section

  // Palette colors (applied when overrideGlobalColors is true)
  bgPrimary?: string;
  bgSecondary?: string;
  bgTertiary?: string;
  textPrimary?: string;
  textSecondary?: string;
  accent?: string;           // Distinct accent color (NOT brand primary)
  buttonBg?: string;
  buttonText?: string;
  borderColor?: string;
}

// Resolved theme with all colors (palette + overrides)
export interface ResolvedSectionTheme {
  overrideGlobalColors: boolean;
  paletteId?: string;
  palette?: SectionPalette;
  bgPrimary?: string;
  bgSecondary?: string;
  bgTertiary?: string;
  textPrimary?: string;
  textSecondary?: string;
  accent?: string;
  buttonBg?: string;
  buttonText?: string;
  borderColor?: string;
}

// All sections in the page
export type SectionId =
  | 'topheader'
  | 'header'
  | 'hero'
  | 'featured-testimonial'
  | 'services'
  | 'mid-cta'
  | 'service-areas'
  | 'testimonials'
  | 'faq'
  | 'footer';

export const SECTION_LABELS: Record<SectionId, string> = {
  'topheader': 'Top Header',
  'header': 'Header',
  'hero': 'Hero',
  'featured-testimonial': 'Featured Testimonial',
  'services': 'Services',
  'mid-cta': 'Mid-Page CTA',
  'service-areas': 'Service Areas',
  'testimonials': 'Testimonials',
  'faq': 'FAQ',
  'footer': 'Footer',
};

interface SectionThemeContextType {
  sectionThemes: Record<SectionId, SectionTheme>;
  sectionVisibility: Record<SectionId, boolean>;
  updateSectionTheme: (sectionId: SectionId, theme: Partial<SectionTheme>) => void;
  resetSectionTheme: (sectionId: SectionId) => void;
  getSectionStyles: (sectionId: SectionId) => React.CSSProperties;
  getResolvedTheme: (sectionId: SectionId) => ResolvedSectionTheme;
  setSectionPalette: (sectionId: SectionId, palette: SectionPalette) => void;
  setOverrideGlobalColors: (sectionId: SectionId, override: boolean) => void;
  setSectionVisibility: (sectionId: SectionId, visible: boolean) => void;
  isSectionVisible: (sectionId: SectionId) => boolean;
}

const SectionThemeContext = createContext<SectionThemeContextType | null>(null);

// Load saved themes from localStorage
function loadSavedThemes(): Record<SectionId, SectionTheme> {
  try {
    const saved = localStorage.getItem('sectionThemes');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load section themes:', e);
  }
  return {} as Record<SectionId, SectionTheme>;
}

// Save themes to localStorage
function saveThemes(themes: Record<SectionId, SectionTheme>) {
  try {
    localStorage.setItem('sectionThemes', JSON.stringify(themes));
  } catch (e) {
    console.error('Failed to save section themes:', e);
  }
}

// Load saved visibility from localStorage
function loadSavedVisibility(): Record<SectionId, boolean> {
  try {
    const saved = localStorage.getItem('sectionVisibility');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load section visibility:', e);
  }
  // Default: all sections visible
  return {} as Record<SectionId, boolean>;
}

// Save visibility to localStorage
function saveVisibility(visibility: Record<SectionId, boolean>) {
  try {
    localStorage.setItem('sectionVisibility', JSON.stringify(visibility));
  } catch (e) {
    console.error('Failed to save section visibility:', e);
  }
}

// Get default palette based on global mode
export function getDefaultPaletteId(mode: 'dark' | 'light'): string {
  return mode === 'dark' ? DEFAULT_DARK_PALETTE : DEFAULT_LIGHT_PALETTE;
}

export function SectionThemeProvider({ children }: { children: ReactNode }) {
  const [sectionThemes, setSectionThemes] = useState<Record<SectionId, SectionTheme>>(loadSavedThemes);
  const [sectionVisibility, setSectionVisibilityState] = useState<Record<SectionId, boolean>>(loadSavedVisibility);

  const updateSectionTheme = useCallback((sectionId: SectionId, theme: Partial<SectionTheme>) => {
    setSectionThemes(prev => {
      const newThemes = {
        ...prev,
        [sectionId]: {
          ...prev[sectionId],
          ...theme,
        },
      };
      saveThemes(newThemes);
      return newThemes;
    });
  }, []);

  const resetSectionTheme = useCallback((sectionId: SectionId) => {
    setSectionThemes(prev => {
      const newThemes = { ...prev };
      delete newThemes[sectionId];
      saveThemes(newThemes);
      return newThemes;
    });
  }, []);

  // Set palette for a section - receives the full palette object (dynamically generated)
  // Automatically enables overrideGlobalColors when a palette is selected
  const setSectionPalette = useCallback((sectionId: SectionId, palette: SectionPalette) => {
    setSectionThemes(prev => {
      const newThemes = {
        ...prev,
        [sectionId]: {
          ...prev[sectionId],
          overrideGlobalColors: true, // Enable override when palette is selected
          paletteId: palette.id,
          paletteMode: palette.mode, // Auto-set mode based on palette type
          // Apply palette colors directly from the passed palette object
          bgPrimary: palette.colors.bgPrimary,
          bgSecondary: palette.colors.bgSecondary,
          bgTertiary: palette.colors.bgTertiary,
          textPrimary: palette.colors.textPrimary,
          textSecondary: palette.colors.textSecondary,
          accent: palette.colors.accent,
          borderColor: palette.colors.borderColor,
        },
      };
      saveThemes(newThemes);
      return newThemes;
    });
  }, []);

  // Toggle override of global colors for a section
  // When override is turned OFF, reset all palette colors to use global defaults
  const setOverrideGlobalColors = useCallback((sectionId: SectionId, override: boolean) => {
    setSectionThemes(prev => {
      let newTheme: SectionTheme;

      if (override) {
        // Turning ON override - keep existing settings
        newTheme = {
          ...prev[sectionId],
          overrideGlobalColors: true,
        };
      } else {
        // Turning OFF override - reset palette colors to use global defaults
        newTheme = {
          overrideGlobalColors: false,
          // Clear all palette-related colors
          paletteId: undefined,
          bgPrimary: undefined,
          bgSecondary: undefined,
          bgTertiary: undefined,
          textPrimary: undefined,
          textSecondary: undefined,
          accent: undefined,
          buttonBg: undefined,
          buttonText: undefined,
          borderColor: undefined,
        };
      }

      const newThemes = {
        ...prev,
        [sectionId]: newTheme,
      };
      saveThemes(newThemes);
      return newThemes;
    });
  }, []);

  // Get resolved theme with palette + overrides
  // Note: Palette colors are already stored directly in theme when selected via setSectionPalette
  const getResolvedTheme = useCallback((sectionId: SectionId): ResolvedSectionTheme => {
    const theme = sectionThemes[sectionId] || {};

    return {
      overrideGlobalColors: theme.overrideGlobalColors ?? false,
      paletteId: theme.paletteId,
      palette: undefined, // Palette colors are stored directly in theme
      bgPrimary: theme.bgPrimary,
      bgSecondary: theme.bgSecondary,
      bgTertiary: theme.bgTertiary,
      textPrimary: theme.textPrimary,
      textSecondary: theme.textSecondary,
      accent: theme.accent,
      buttonBg: theme.buttonBg,
      buttonText: theme.buttonText,
      borderColor: theme.borderColor,
    };
  }, [sectionThemes]);

  const getSectionStyles = useCallback((sectionId: SectionId): React.CSSProperties => {
    const theme = sectionThemes[sectionId];
    if (!theme) return {};

    const styles: Record<string, string> = {};

    // Section-specific variables (for themed-section classes)
    if (theme.bgPrimary) styles['--section-bg-primary'] = theme.bgPrimary;
    if (theme.bgSecondary) styles['--section-bg-secondary'] = theme.bgSecondary;
    if (theme.bgTertiary) styles['--section-bg-tertiary'] = theme.bgTertiary;
    if (theme.textPrimary) styles['--section-text-primary'] = theme.textPrimary;
    if (theme.textSecondary) styles['--section-text-secondary'] = theme.textSecondary;
    if (theme.accent) styles['--section-text-accent'] = theme.accent;
    if (theme.buttonBg) styles['--section-button-bg'] = theme.buttonBg;
    if (theme.buttonText) styles['--section-button-text'] = theme.buttonText;
    if (theme.borderColor) styles['--section-border'] = theme.borderColor;

    // When overrideGlobalColors is true, also override the global CSS variables
    // This ensures ALL components inside the section use the section's theme
    if (theme.overrideGlobalColors) {
      // Background colors
      if (theme.bgPrimary) {
        styles['--color-dark-950'] = theme.bgPrimary;
        styles['--section-bg-even'] = theme.bgPrimary;
      }
      if (theme.bgSecondary) {
        styles['--color-dark-900'] = theme.bgSecondary;
        styles['--section-bg-odd'] = theme.bgSecondary;
      }
      if (theme.bgTertiary) {
        styles['--color-dark-800'] = theme.bgTertiary;
      }

      // Text colors
      if (theme.textPrimary) {
        styles['--color-text-primary'] = theme.textPrimary;
        styles['--color-white'] = theme.textPrimary;
      }
      if (theme.textSecondary) {
        styles['--color-text-secondary'] = theme.textSecondary;
        styles['--color-gray-400'] = theme.textSecondary;
      }

      // Button colors
      if (theme.buttonBg) {
        styles['--color-button-bg'] = theme.buttonBg;
      }
      if (theme.buttonText) {
        styles['--color-button-text'] = theme.buttonText;
      }

      // Border color
      if (theme.borderColor) {
        styles['--color-border'] = theme.borderColor;
        styles['--color-dark-700'] = theme.borderColor;
      }

      // Apply accent as primary color for buttons/highlights inside this section
      if (theme.accent) {
        styles['--color-primary-500'] = theme.accent;
      }

      // Set the actual background color inline
      if (theme.bgPrimary) {
        styles['backgroundColor'] = theme.bgPrimary;
      }
    }

    return styles as React.CSSProperties;
  }, [sectionThemes]);

  // Set section visibility
  const setSectionVisibility = useCallback((sectionId: SectionId, visible: boolean) => {
    setSectionVisibilityState(prev => {
      const newVisibility = {
        ...prev,
        [sectionId]: visible,
      };
      saveVisibility(newVisibility);
      return newVisibility;
    });
  }, []);

  // Check if section is visible (default true if not set)
  const isSectionVisible = useCallback((sectionId: SectionId): boolean => {
    return sectionVisibility[sectionId] ?? true;
  }, [sectionVisibility]);

  return (
    <SectionThemeContext.Provider
      value={{
        sectionThemes,
        sectionVisibility,
        updateSectionTheme,
        resetSectionTheme,
        getSectionStyles,
        getResolvedTheme,
        setSectionPalette,
        setOverrideGlobalColors,
        setSectionVisibility,
        isSectionVisible,
      }}
    >
      {children}
    </SectionThemeContext.Provider>
  );
}

export function useSectionTheme() {
  const context = useContext(SectionThemeContext);
  if (!context) {
    throw new Error('useSectionTheme must be used within a SectionThemeProvider');
  }
  return context;
}
