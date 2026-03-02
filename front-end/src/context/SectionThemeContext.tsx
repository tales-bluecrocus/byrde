import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

// Section theme configuration
export interface SectionTheme {
  // Override global colors with section-specific palette
  overrideGlobalColors?: boolean; // If true, use palette colors instead of global
  paletteId?: string;             // ID of the selected palette (only used when override is true)
  paletteMode?: 'dark' | 'light'; // Individual dark/light mode for this section
  buttonStyle?: 1 | 2 | 3 | 4;    // 1 = primary, 2 = accent, 3 = dark background, 4 = dark text
  iconBgEnabled?: boolean;   // Show icon box background (default true)
  iconBgColor?: string;      // Custom icon box background color (default: section primary)

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

  // Layout
  padding?: 'sm' | 'md' | 'lg' | 'xl'; // Section vertical padding (default: md = py-12)

  // Background image
  bgImage?: string;          // URL of the background image
  bgImageOpacity?: number;   // Opacity of the background image (0-1)
  bgImagePosition?: string;  // CSS background-position value
  bgImageSize?: string;      // CSS background-size value (cover, contain, etc)
  bgImageOverlayColor?: string; // Custom overlay color on top of image
}

// Resolved theme with all colors
export interface ResolvedSectionTheme {
  overrideGlobalColors: boolean;
  paletteId?: string;
  bgPrimary?: string;
  bgSecondary?: string;
  bgTertiary?: string;
  textPrimary?: string;
  textSecondary?: string;
  accent?: string;
  buttonBg?: string;
  buttonText?: string;
  borderColor?: string;
  bgImage?: string;
  bgImageOpacity?: number;
  bgImagePosition?: string;
  bgImageSize?: string;
  bgImageOverlayColor?: string;
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
  | 'footer-cta'
  | 'footer';

// Reorderable sections (rendered dynamically in StaticHomePage)
export const DEFAULT_SECTION_ORDER: SectionId[] = [
  'hero', 'featured-testimonial', 'services', 'mid-cta', 'service-areas', 'testimonials', 'faq', 'footer-cta',
];

// Fixed sections (not reorderable)
export const FIXED_TOP_SECTIONS: SectionId[] = ['topheader', 'header'];
export const FIXED_BOTTOM_SECTIONS: SectionId[] = ['footer'];

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
  'footer-cta': 'Footer CTA',
  'footer': 'Footer',
};

interface SectionThemeContextType {
  sectionThemes: Record<SectionId, SectionTheme>;
  sectionVisibility: Record<SectionId, boolean>;
  sectionOrder: SectionId[];
  updateSectionTheme: (sectionId: SectionId, theme: Partial<SectionTheme>) => void;
  resetSectionTheme: (sectionId: SectionId) => void;
  resetAllSectionThemes: () => void;
  getSectionStyles: (sectionId: SectionId) => React.CSSProperties;
  getResolvedTheme: (sectionId: SectionId) => ResolvedSectionTheme;
  setOverrideGlobalColors: (sectionId: SectionId, override: boolean) => void;
  setSectionVisibility: (sectionId: SectionId, visible: boolean) => void;
  isSectionVisible: (sectionId: SectionId) => boolean;
  setSectionOrder: (order: SectionId[]) => void;
  importSectionData: (themes: Record<SectionId, SectionTheme>, visibility: Record<SectionId, boolean>, order: SectionId[]) => void;
}

const SectionThemeContext = createContext<SectionThemeContextType | null>(null);

// Get WordPress sections config (admin or public page)
const getWpSectionsConfig = (): Record<string, unknown> | null => {
  if (typeof window === 'undefined') return null;

  // Check admin config first (CORRECT KEY: sectionThemes)
  if (window.byrdeAdmin?.config?.sectionThemes) {
    return window.byrdeAdmin.config.sectionThemes as Record<string, unknown>;
  }

  // Check public page config (CORRECT KEY: sectionThemes)
  if (window.byrdeConfig?.sectionThemes) {
    return window.byrdeConfig.sectionThemes as Record<string, unknown>;
  }

  return null;
};

// Check for WordPress config (admin or public)
const getWpSections = (): Record<SectionId, SectionTheme> | null => {
  const sections = getWpSectionsConfig();
  if (!sections) return null;

  // Convert WordPress sections format to SectionTheme format
  const themes: Record<string, SectionTheme> = {};
  for (const [id, section] of Object.entries(sections)) {
    const s = section as Record<string, unknown>;
    // Extract theme data (exclude 'visible' which is stored separately)
    const { visible: _, ...themeData } = s;
    themes[id] = themeData as SectionTheme;
  }
  return themes as Record<SectionId, SectionTheme>;
};

const getWpVisibility = (): Record<SectionId, boolean> | null => {
  const sections = getWpSectionsConfig();
  if (!sections) return null;

  const visibility: Record<string, boolean> = {};
  for (const [id, section] of Object.entries(sections)) {
    const s = section as Record<string, unknown>;
    visibility[id] = s.visible as boolean ?? true;
  }
  return visibility as Record<SectionId, boolean>;
};

// Load section order from WordPress config
function loadSectionOrder(): SectionId[] {
  if (typeof window === 'undefined') return DEFAULT_SECTION_ORDER;

  const config = window.byrdeAdmin?.config || window.byrdeConfig;
  if (config?.sectionOrder && Array.isArray(config.sectionOrder) && config.sectionOrder.length > 0) {
    const saved = config.sectionOrder as SectionId[];
    // Append any new sections from DEFAULT_SECTION_ORDER that aren't in the saved order
    const missing = DEFAULT_SECTION_ORDER.filter(id => !saved.includes(id));
    return missing.length > 0 ? [...saved, ...missing] : saved;
  }

  return DEFAULT_SECTION_ORDER;
}

// Load themes from WordPress config
function loadThemes(): Record<SectionId, SectionTheme> {
  const wpThemes = getWpSections();
  if (wpThemes) {
    return wpThemes;
  }
  return {} as Record<SectionId, SectionTheme>;
}

// Load visibility from WordPress config
function loadVisibility(): Record<SectionId, boolean> {
  const wpVisibility = getWpVisibility();
  if (wpVisibility) {
    return wpVisibility;
  }
  // Default: all sections visible
  return {} as Record<SectionId, boolean>;
}

export function SectionThemeProvider({ children }: { children: ReactNode }) {
  const [sectionThemes, setSectionThemes] = useState<Record<SectionId, SectionTheme>>(loadThemes);
  const [sectionVisibility, setSectionVisibilityState] = useState<Record<SectionId, boolean>>(loadVisibility);
  const [sectionOrder, setSectionOrder] = useState<SectionId[]>(loadSectionOrder);

  const updateSectionTheme = useCallback((sectionId: SectionId, theme: Partial<SectionTheme>) => {
    setSectionThemes(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        ...theme,
      },
    }));
  }, []);

  const resetSectionTheme = useCallback((sectionId: SectionId) => {
    setSectionThemes(prev => {
      const newThemes = { ...prev };
      delete newThemes[sectionId];
      return newThemes;
    });
  }, []);

  const resetAllSectionThemes = useCallback(() => {
    setSectionThemes({} as Record<SectionId, SectionTheme>);
    setSectionVisibilityState({} as Record<SectionId, boolean>);
    setSectionOrder(DEFAULT_SECTION_ORDER);
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

      return {
        ...prev,
        [sectionId]: newTheme,
      };
    });
  }, []);

  // Get resolved theme with palette + overrides
  // Note: Palette colors are already stored directly in theme when selected via setSectionPalette
  const getResolvedTheme = useCallback((sectionId: SectionId): ResolvedSectionTheme => {
    const theme = sectionThemes[sectionId] || {};

    return {
      overrideGlobalColors: theme.overrideGlobalColors ?? false,
      paletteId: theme.paletteId,
      bgPrimary: theme.bgPrimary,
      bgSecondary: theme.bgSecondary,
      bgTertiary: theme.bgTertiary,
      textPrimary: theme.textPrimary,
      textSecondary: theme.textSecondary,
      accent: theme.accent,
      buttonBg: theme.buttonBg,
      buttonText: theme.buttonText,
      borderColor: theme.borderColor,
      bgImage: theme.bgImage,
      bgImageOpacity: theme.bgImageOpacity,
      bgImagePosition: theme.bgImagePosition,
      bgImageSize: theme.bgImageSize,
      bgImageOverlayColor: theme.bgImageOverlayColor,
    };
  }, [sectionThemes]);

  const getSectionStyles = useCallback((sectionId: SectionId): React.CSSProperties => {
    const theme = sectionThemes[sectionId];
    if (!theme) return {};

    // If section doesn't override global colors, use global styles (no section-specific overrides)
    if (!theme.overrideGlobalColors) {
      return {};
    }

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

    // Also override the global CSS variables for this section
    // This ensures ALL components inside the section use the section's theme
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

    return styles as React.CSSProperties;
  }, [sectionThemes]);

  // Set section visibility
  const setSectionVisibility = useCallback((sectionId: SectionId, visible: boolean) => {
    setSectionVisibilityState(prev => ({
      ...prev,
      [sectionId]: visible,
    }));
  }, []);

  // Check if section is visible (default true if not set)
  const isSectionVisible = useCallback((sectionId: SectionId): boolean => {
    return sectionVisibility[sectionId] ?? true;
  }, [sectionVisibility]);

  // Bulk import for export/import feature
  const importSectionData = useCallback((
    themes: Record<SectionId, SectionTheme>,
    visibility: Record<SectionId, boolean>,
    order: SectionId[],
  ) => {
    setSectionThemes(themes);
    setSectionVisibilityState(visibility);
    setSectionOrder(order);
  }, []);

  return (
    <SectionThemeContext.Provider
      value={{
        sectionThemes,
        sectionVisibility,
        sectionOrder,
        updateSectionTheme,
        resetSectionTheme,
        resetAllSectionThemes,
        getSectionStyles,
        getResolvedTheme,
        setOverrideGlobalColors,
        setSectionVisibility,
        isSectionVisible,
        setSectionOrder,
        importSectionData,
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
