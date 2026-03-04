import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import {
  generateBrandPalette,
  type ColorMode,
  type BrandPalette,
} from '../utils/colorUtils';

// Trust badge configuration
export interface TrustBadge {
  label: string;
  sublabel?: string;
}

// Brand color configuration (per-mode primary + accent + text)
export interface BrandColors {
  darkPrimary: string;
  darkAccent: string;
  darkText: string;
  lightPrimary: string;
  lightAccent: string;
  lightText: string;
  mode: ColorMode;
  // Per-page override: null = inherit site default, 'dark'/'light' = explicit override
  modeOverride?: 'dark' | 'light' | null;
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

// Page-level SEO configuration
export interface SeoConfig {
  siteName: string;
  tagline: string;
  description: string;
  ogImage: string;
}

// Global configuration that applies across all sections
export interface GlobalConfig {
  // Brand colors system (from site settings)
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
  // Page-level SEO
  seo: SeoConfig;
}

interface GlobalConfigContextType {
  globalConfig: GlobalConfig;
  palette: BrandPalette;
  updateGlobalConfig: (updates: Partial<GlobalConfig>) => void;
  updateBrand: (updates: Partial<BrandColors>) => void;
  updateLogo: (updates: Partial<LogoConfig>) => void;
  updateFooter: (updates: Partial<FooterConfig>) => void;
  updateTrustBadge: (badgeKey: 'badge1' | 'badge2', updates: Partial<TrustBadge>) => void;
  updateFormConfig: (updates: Partial<FormConfig>) => void;
  updateSeo: (updates: Partial<SeoConfig>) => void;
  resetGlobalConfig: () => void;
  replaceGlobalConfig: (config: GlobalConfig) => void;
}

const DEFAULT_GLOBAL_CONFIG: GlobalConfig = {
  brand: {
    darkPrimary: '#3ab342',
    darkAccent: '#f97316',
    darkText: '#efefef',
    lightPrimary: '#3ab342',
    lightAccent: '#f97316',
    lightText: '#2a2a2a',
    mode: 'dark',
    modeOverride: null,
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
  form: {},
  seo: {
    siteName: '',
    tagline: '',
    description: '',
    ogImage: '',
  },
};

// Check for WordPress config (admin or public page)
const getWpConfig = (): GlobalConfig | null => {
  if (typeof window === 'undefined') return null;

  if (window.byrdeAdmin?.config?.globalConfig) {
    return window.byrdeAdmin.config.globalConfig as GlobalConfig;
  }

  if (window.byrdeConfig?.globalConfig) {
    return window.byrdeConfig.globalConfig as GlobalConfig;
  }

  return null;
};

function loadConfig(): GlobalConfig {
  const wpConfig = getWpConfig();
  const base = wpConfig
    ? { ...DEFAULT_GLOBAL_CONFIG, ...wpConfig }
    : { ...DEFAULT_GLOBAL_CONFIG };

  // Strip deprecated fields from old saved configs
  delete (base as any).brandOverrides;
  delete (base as any).customColors;

  // Brand colors come from site settings (not page config)
  const s = typeof window !== 'undefined' ? window.byrdeSettings : undefined;

  // Resolve effective mode: page override > site default > 'dark'
  const modeOverride = base.brand.modeOverride ?? null;
  const siteMode = (s?.brand_mode || 'dark') as ColorMode;
  const effectiveMode: ColorMode = modeOverride ?? siteMode;

  if (s) {
    base.brand = {
      darkPrimary: s.brand_dark_primary || base.brand.darkPrimary,
      darkAccent: s.brand_dark_accent || base.brand.darkAccent,
      darkText: s.brand_dark_text || base.brand.darkText,
      lightPrimary: s.brand_light_primary || base.brand.lightPrimary,
      lightAccent: s.brand_light_accent || base.brand.lightAccent,
      lightText: s.brand_light_text || base.brand.lightText,
      mode: effectiveMode,
      modeOverride,
    };
  } else {
    base.brand.mode = effectiveMode;
    base.brand.modeOverride = modeOverride;
  }

  return base;
}

const GlobalConfigContext = createContext<GlobalConfigContextType | undefined>(undefined);

export function GlobalConfigProvider({ children }: { children: ReactNode }) {
  const [globalConfig, setGlobalConfig] = useState<GlobalConfig>(loadConfig);

  // Generate the brand palette from the active mode's color pair
  const palette = useMemo(() => {
    const b = globalConfig.brand;
    const isDark = b.mode === 'dark';
    return generateBrandPalette(
      isDark ? b.darkPrimary : b.lightPrimary,
      isDark ? b.darkAccent : b.lightAccent,
      b.mode,
      isDark ? b.darkText : b.lightText,
    );
  }, [globalConfig.brand]);

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

  const updateSeo = useCallback((updates: Partial<SeoConfig>) => {
    setGlobalConfig((prev) => ({
      ...prev,
      seo: { ...prev.seo, ...updates },
    }));
  }, []);

  const resetGlobalConfig = useCallback(() => {
    setGlobalConfig(DEFAULT_GLOBAL_CONFIG);
  }, []);

  const replaceGlobalConfig = useCallback((config: GlobalConfig) => {
    setGlobalConfig(config);
  }, []);

  return (
    <GlobalConfigContext.Provider
      value={{
        globalConfig,
        palette,
        updateGlobalConfig,
        updateBrand,
        updateLogo,
        updateFooter,
        updateTrustBadge,
        updateFormConfig,
        updateSeo,
        resetGlobalConfig,
        replaceGlobalConfig,
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
