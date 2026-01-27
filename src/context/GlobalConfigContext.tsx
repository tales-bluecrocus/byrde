import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import {
  generateBrandPalette,
  generateDarkPalettes,
  generateLightPalettes,
  type ColorMode,
  type BrandPalette,
  type GeneratedPalette,
} from '../utils/colorUtils';

// Trust badge configuration
export interface TrustBadge {
  label: string;
  sublabel?: string;
}

// Brand color configuration (Primary + Accent system)
export interface BrandColors {
  primary: string;
  accent: string;  // Second color used as accent across sections
  mode: ColorMode;
}

// Form styling configuration
export interface FormConfig {
  inputBg?: string;
  inputBorder?: string;
  inputText?: string;
  inputFocusBorder?: string;
  labelColor?: string;
  buttonBg?: string;
}

// Global configuration that applies across all sections
export interface GlobalConfig {
  // Google Reviews - applies wherever reviews badge appears
  googleReview: {
    rating: string;
    reviewCount: string;
  };
  // Brand colors system
  brand: BrandColors;
  // Trust badges that appear in Hero and other sections
  trustBadges: {
    badge1: TrustBadge;
    badge2: TrustBadge;
  };
  // Form styling
  form: FormConfig;
}

// Generated palettes type
interface GeneratedPalettesState {
  dark: GeneratedPalette[];
  light: GeneratedPalette[];
  all: GeneratedPalette[];
  generatedFrom: { primary: string; accent: string } | null;
}

interface GlobalConfigContextType {
  globalConfig: GlobalConfig;
  palette: BrandPalette;
  // Generated palettes based on brand colors
  generatedPalettes: GeneratedPalettesState;
  // Check if colors have changed since last generation
  needsRegeneration: boolean;
  // Manually trigger palette generation
  generatePalettes: () => void;
  updateGlobalConfig: (updates: Partial<GlobalConfig>) => void;
  updateGoogleReview: (updates: Partial<GlobalConfig['googleReview']>) => void;
  updateBrand: (updates: Partial<BrandColors>) => void;
  updateTrustBadge: (badgeKey: 'badge1' | 'badge2', updates: Partial<TrustBadge>) => void;
  updateFormConfig: (updates: Partial<FormConfig>) => void;
  resetGlobalConfig: () => void;
}

const DEFAULT_GLOBAL_CONFIG: GlobalConfig = {
  googleReview: {
    rating: '5.0',
    reviewCount: '50+',
  },
  brand: {
    primary: '#3ab342',
    accent: '#f97316',  // Orange as default accent
    mode: 'dark',
  },
  trustBadges: {
    badge1: {
      label: 'Fully Insured',
      sublabel: 'Peace of Mind',
    },
    badge2: {
      label: 'Same-Day',
      sublabel: 'Service Available',
    },
  },
  form: {
    // All optional - uses defaults when undefined
  },
};

const STORAGE_KEY = 'lake-city-global-config';

function loadStoredConfig(): GlobalConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? { ...DEFAULT_GLOBAL_CONFIG, ...JSON.parse(stored) } : DEFAULT_GLOBAL_CONFIG;
  } catch {
    return DEFAULT_GLOBAL_CONFIG;
  }
}

const GlobalConfigContext = createContext<GlobalConfigContextType | undefined>(undefined);

// Storage key for generated palettes
const PALETTES_STORAGE_KEY = 'lake-city-generated-palettes';

function loadStoredPalettes(brand: BrandColors): GeneratedPalettesState {
  try {
    const stored = localStorage.getItem(PALETTES_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validate the stored palettes match current brand colors
      if (parsed.generatedFrom &&
          parsed.generatedFrom.primary === brand.primary &&
          parsed.generatedFrom.accent === brand.accent) {
        return parsed;
      }
    }
  } catch {
    // Fall through to generate new palettes
  }
  // Generate initial palettes
  const dark = generateDarkPalettes(brand.primary, brand.accent);
  const light = generateLightPalettes(brand.primary, brand.accent);
  return {
    dark,
    light,
    all: [...dark, ...light],
    generatedFrom: { primary: brand.primary, accent: brand.accent },
  };
}

export function GlobalConfigProvider({ children }: { children: ReactNode }) {
  const [globalConfig, setGlobalConfig] = useState<GlobalConfig>(loadStoredConfig);
  const [generatedPalettes, setGeneratedPalettes] = useState<GeneratedPalettesState>(() =>
    loadStoredPalettes(loadStoredConfig().brand)
  );

  // Generate the brand palette based on current config (auto-updates for surface colors)
  const palette = useMemo(() => {
    return generateBrandPalette(
      globalConfig.brand.primary,
      globalConfig.brand.accent,
      globalConfig.brand.mode
    );
  }, [globalConfig.brand]);

  // Check if colors have changed since last generation
  const needsRegeneration = useMemo(() => {
    if (!generatedPalettes.generatedFrom) return true;
    return (
      generatedPalettes.generatedFrom.primary !== globalConfig.brand.primary ||
      generatedPalettes.generatedFrom.accent !== globalConfig.brand.accent
    );
  }, [generatedPalettes.generatedFrom, globalConfig.brand]);

  // Manual palette generation function
  const generatePalettes = useCallback(() => {
    const dark = generateDarkPalettes(
      globalConfig.brand.primary,
      globalConfig.brand.accent
    );
    const light = generateLightPalettes(
      globalConfig.brand.primary,
      globalConfig.brand.accent
    );
    const newPalettes: GeneratedPalettesState = {
      dark,
      light,
      all: [...dark, ...light],
      generatedFrom: {
        primary: globalConfig.brand.primary,
        accent: globalConfig.brand.accent,
      },
    };
    setGeneratedPalettes(newPalettes);
    localStorage.setItem(PALETTES_STORAGE_KEY, JSON.stringify(newPalettes));
  }, [globalConfig.brand]);

  const saveConfig = useCallback((config: GlobalConfig) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, []);

  const updateGlobalConfig = useCallback((updates: Partial<GlobalConfig>) => {
    setGlobalConfig((prev) => {
      const updated = { ...prev, ...updates };
      saveConfig(updated);
      return updated;
    });
  }, [saveConfig]);

  const updateGoogleReview = useCallback((updates: Partial<GlobalConfig['googleReview']>) => {
    setGlobalConfig((prev) => {
      const updated = {
        ...prev,
        googleReview: { ...prev.googleReview, ...updates },
      };
      saveConfig(updated);
      return updated;
    });
  }, [saveConfig]);

  const updateBrand = useCallback((updates: Partial<BrandColors>) => {
    setGlobalConfig((prev) => {
      const updated = {
        ...prev,
        brand: { ...prev.brand, ...updates },
      };
      saveConfig(updated);
      return updated;
    });
  }, [saveConfig]);

  const updateTrustBadge = useCallback((badgeKey: 'badge1' | 'badge2', updates: Partial<TrustBadge>) => {
    setGlobalConfig((prev) => {
      const updated = {
        ...prev,
        trustBadges: {
          ...prev.trustBadges,
          [badgeKey]: { ...prev.trustBadges[badgeKey], ...updates },
        },
      };
      saveConfig(updated);
      return updated;
    });
  }, [saveConfig]);

  const updateFormConfig = useCallback((updates: Partial<FormConfig>) => {
    setGlobalConfig((prev) => {
      const updated = {
        ...prev,
        form: { ...prev.form, ...updates },
      };
      saveConfig(updated);
      return updated;
    });
  }, [saveConfig]);

  const resetGlobalConfig = useCallback(() => {
    setGlobalConfig(DEFAULT_GLOBAL_CONFIG);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <GlobalConfigContext.Provider
      value={{
        globalConfig,
        palette,
        generatedPalettes,
        needsRegeneration,
        generatePalettes,
        updateGlobalConfig,
        updateGoogleReview,
        updateBrand,
        updateTrustBadge,
        updateFormConfig,
        resetGlobalConfig,
      }}
    >
      {children}
    </GlobalConfigContext.Provider>
  );
}

export function useGlobalConfig() {
  const context = useContext(GlobalConfigContext);
  if (!context) {
    throw new Error('useGlobalConfig must be used within a GlobalConfigProvider');
  }
  return context;
}

export { DEFAULT_GLOBAL_CONFIG };
