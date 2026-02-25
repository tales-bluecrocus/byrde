import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
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

// Logo shape options
export type LogoShape = 'square' | 'rectangle' | 'circle';

// Logo configuration (shared between Header and Footer)
export interface LogoConfig {
  bgColor: string;
  shape: LogoShape;
}

// Footer visibility configuration
export interface FooterConfig {
  showLogo: boolean;
  showDescription: boolean;
  showSocial: boolean;
  showPhone: boolean;
  showEmail: boolean;
  showAddress: boolean;
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
// Note: Google Reviews data now comes from WordPress via useSettings()
export interface GlobalConfig {
  // Brand colors system
  brand: BrandColors;
  // Logo settings (shared between header/footer)
  logo: LogoConfig;
  // Footer visibility settings
  footer: FooterConfig;
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
  updateBrand: (updates: Partial<BrandColors>) => void;
  updateLogo: (updates: Partial<LogoConfig>) => void;
  updateFooter: (updates: Partial<FooterConfig>) => void;
  updateTrustBadge: (badgeKey: 'badge1' | 'badge2', updates: Partial<TrustBadge>) => void;
  updateFormConfig: (updates: Partial<FormConfig>) => void;
  resetGlobalConfig: () => void;
}

const DEFAULT_GLOBAL_CONFIG: GlobalConfig = {
  brand: {
    primary: '#3ab342',
    accent: '#f97316',  // Orange as default accent
    mode: 'dark',
  },
  logo: {
    bgColor: '#ffffff',
    shape: 'rectangle',
  },
  footer: {
    showLogo: true,
    showDescription: true,
    showSocial: true,
    showPhone: true,
    showEmail: true,
    showAddress: true,
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

// Check for WordPress config (admin or public page)
const getWpConfig = (): GlobalConfig | null => {
  if (typeof window === 'undefined') return null;

  // Check admin config first (has apiUrl, nonce, etc.) - CORRECT KEY: globalConfig
  if (window.byrdeAdmin?.config?.globalConfig) {
    return window.byrdeAdmin.config.globalConfig as GlobalConfig;
  }

  // Check public page config (just the config object) - CORRECT KEY: globalConfig
  if (window.byrdeConfig?.globalConfig) {
    return window.byrdeConfig.globalConfig as GlobalConfig;
  }

  return null;
};

function loadConfig(): GlobalConfig {
  // Load from WordPress config, fall back to defaults
  const wpConfig = getWpConfig();
  if (wpConfig) {
    return { ...DEFAULT_GLOBAL_CONFIG, ...wpConfig };
  }
  return DEFAULT_GLOBAL_CONFIG;
}

function generateInitialPalettes(brand: BrandColors): GeneratedPalettesState {
  const dark = generateDarkPalettes(brand.primary, brand.accent);
  const light = generateLightPalettes(brand.primary, brand.accent);
  return {
    dark,
    light,
    all: [...dark, ...light],
    generatedFrom: { primary: brand.primary, accent: brand.accent },
  };
}

const GlobalConfigContext = createContext<GlobalConfigContextType | undefined>(undefined);

export function GlobalConfigProvider({ children }: { children: ReactNode }) {
  const [globalConfig, setGlobalConfig] = useState<GlobalConfig>(loadConfig);
  const [generatedPalettes, setGeneratedPalettes] = useState<GeneratedPalettesState>(() =>
    generateInitialPalettes(loadConfig().brand)
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
  }, [globalConfig.brand]);

  // Auto-regenerate palettes when brand colors change
  useEffect(() => {
    if (needsRegeneration) {
      generatePalettes();
    }
  }, [needsRegeneration, generatePalettes]);

  const updateGlobalConfig = useCallback((updates: Partial<GlobalConfig>) => {
    setGlobalConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateBrand = useCallback((updates: Partial<BrandColors>) => {
    setGlobalConfig((prev) => ({
      ...prev,
      brand: { ...prev.brand, ...updates },
    }));
  }, []);

  const updateLogo = useCallback((updates: Partial<LogoConfig>) => {
    setGlobalConfig((prev) => ({
      ...prev,
      logo: { ...prev.logo, ...updates },
    }));
  }, []);

  const updateFooter = useCallback((updates: Partial<FooterConfig>) => {
    setGlobalConfig((prev) => ({
      ...prev,
      footer: { ...prev.footer, ...updates },
    }));
  }, []);

  const updateTrustBadge = useCallback((badgeKey: 'badge1' | 'badge2', updates: Partial<TrustBadge>) => {
    setGlobalConfig((prev) => ({
      ...prev,
      trustBadges: {
        ...prev.trustBadges,
        [badgeKey]: { ...prev.trustBadges[badgeKey], ...updates },
      },
    }));
  }, []);

  const updateFormConfig = useCallback((updates: Partial<FormConfig>) => {
    setGlobalConfig((prev) => ({
      ...prev,
      form: { ...prev.form, ...updates },
    }));
  }, []);

  const resetGlobalConfig = useCallback(() => {
    setGlobalConfig(DEFAULT_GLOBAL_CONFIG);
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
        updateBrand,
        updateLogo,
        updateFooter,
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
