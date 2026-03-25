import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';

// Section theme configuration (simplified: mode + form + layout + bg)
export interface SectionTheme {
  paletteMode?: 'dark' | 'light'; // Individual dark/light mode for this section
  formPaletteMode?: 'dark' | 'light'; // Independent form card mode (follows section mode if unset)
  // Form card-specific color overrides (hero only)
  formBg?: string;
  formText?: string;
  formTextSecondary?: string;
  formBorder?: string;
  formAccent?: string;
  // Visual style
  accentSource?: 'primary' | 'accent'; // Which brand color drives section accents (badges, headlines, icons, buttons)
  buttonStyle?: 1 | 2 | 3 | 4; // 1 = primary, 2 = accent, 3 = dark background, 4 = light text
  // Custom background color (overrides mode-derived bg)
  bgColor?: string;
  // Layout
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  // Background image
  bgImage?: string;
  bgImageOpacity?: number;
  bgImagePosition?: string;
  bgImageSize?: string;
  bgImageOverlayColor?: string;
  // Gradient overlay
  gradientEnabled?: boolean;
  gradientType?: 'linear' | 'radial';
  gradientColor1?: string;
  gradientColor2?: string;
  gradientLocation1?: number;
  gradientLocation2?: number;
  gradientAngle?: number;
  gradientPosition?: string;
}

// Resolved theme (bg image + gradient only)
export interface ResolvedSectionTheme {
  bgImage?: string;
  bgImageOpacity?: number;
  bgImagePosition?: string;
  bgImageSize?: string;
  bgImageOverlayColor?: string;
  gradientEnabled?: boolean;
  gradientType?: 'linear' | 'radial';
  gradientColor1?: string;
  gradientColor2?: string;
  gradientLocation1?: number;
  gradientLocation2?: number;
  gradientAngle?: number;
  gradientPosition?: string;
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
  getResolvedTheme: (sectionId: SectionId) => ResolvedSectionTheme;
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

  // Get resolved theme (bg image + gradient only)
  const getResolvedTheme = useCallback((sectionId: SectionId): ResolvedSectionTheme => {
    const theme = sectionThemes[sectionId] || {};

    return {
      bgImage: theme.bgImage,
      bgImageOpacity: theme.bgImageOpacity,
      bgImagePosition: theme.bgImagePosition,
      bgImageSize: theme.bgImageSize,
      bgImageOverlayColor: theme.bgImageOverlayColor,
      gradientEnabled: theme.gradientEnabled,
      gradientType: theme.gradientType,
      gradientColor1: theme.gradientColor1,
      gradientColor2: theme.gradientColor2,
      gradientLocation1: theme.gradientLocation1,
      gradientLocation2: theme.gradientLocation2,
      gradientAngle: theme.gradientAngle,
      gradientPosition: theme.gradientPosition,
    };
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

  const value = useMemo(() => ({
    sectionThemes,
    sectionVisibility,
    sectionOrder,
    updateSectionTheme,
    resetSectionTheme,
    resetAllSectionThemes,
    getResolvedTheme,
    setSectionVisibility,
    isSectionVisible,
    setSectionOrder,
    importSectionData,
  }), [sectionThemes, sectionVisibility, sectionOrder, updateSectionTheme, resetSectionTheme, resetAllSectionThemes, getResolvedTheme, setSectionVisibility, isSectionVisible, setSectionOrder, importSectionData]);

  return (
    <SectionThemeContext.Provider value={value}>
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
