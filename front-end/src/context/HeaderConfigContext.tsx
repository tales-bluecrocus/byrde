import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

// Badge theme options (only light/dark for brand consistency)
export type BadgeTheme = 'light' | 'dark';

// Text alignment options
export type TextAlign = 'left' | 'center' | 'right';

// Icon position options
export type IconPosition = 'before' | 'after';

// Available icons for topbar
export type TopbarIcon = 'none' | 'map-pin' | 'phone' | 'star' | 'truck' | 'shield' | 'clock' | 'check-circle';

// Header padding options
export type HeaderPadding = 'compact' | 'default' | 'spacious';

// Header style configuration
// Note: Logo settings are now in GlobalConfig (shared between Header and Footer)
export interface HeaderStyle {
  badgeTheme: BadgeTheme;
  headerPadding: HeaderPadding;
}

// Header layout configuration
// Note: Content data (phone, email, logo, rating) comes from WordPress via useSettings()
export interface HeaderConfig {
  isFixed: boolean;
  showTopbar: boolean;
  showPhone: boolean;
  showBadge: boolean;
  showReviewCount: boolean;
  style: HeaderStyle;
}

// Topbar configuration
// Note: Email and phone values come from WordPress via useSettings()
export interface TopbarConfig {
  message: string;
  icon: TopbarIcon;
  textAlign: TextAlign;
  iconPosition: IconPosition;
  showPhone: boolean;
  showEmail: boolean;
}

interface HeaderConfigContextType {
  headerConfig: HeaderConfig;
  topbarConfig: TopbarConfig;
  updateHeaderConfig: (updates: Partial<HeaderConfig>) => void;
  updateHeaderStyle: (updates: Partial<HeaderStyle>) => void;
  updateTopbarConfig: (updates: Partial<TopbarConfig>) => void;
  resetHeaderConfig: () => void;
}

const DEFAULT_HEADER_CONFIG: HeaderConfig = {
  isFixed: true,
  showTopbar: false,
  showPhone: true,
  showBadge: true,
  showReviewCount: true,
  style: {
    badgeTheme: 'light',
    headerPadding: 'default',
  },
};

const DEFAULT_TOPBAR_CONFIG: TopbarConfig = {
  message: 'Serving North Idaho & Spokane Area',
  icon: 'map-pin',
  textAlign: 'center',
  iconPosition: 'before',
  showPhone: true,
  showEmail: true,
};

// Check for WordPress config (admin or public page)
const getWpConfig = (): { header?: HeaderConfig; topbar?: TopbarConfig } => {
  if (typeof window === 'undefined') return {};

  // Check admin config first
  if ((window as any).lakecityAdmin?.config) {
    const wpConfig = (window as any).lakecityAdmin.config;
    return {
      header: wpConfig.header,
      topbar: wpConfig.topbar,
    };
  }

  // Check public page config
  if ((window as any).lakecityConfig) {
    const wpConfig = (window as any).lakecityConfig;
    return {
      header: wpConfig.header,
      topbar: wpConfig.topbar,
    };
  }

  return {};
};

function loadConfig(): { header: HeaderConfig; topbar: TopbarConfig } {
  // Load from WordPress config, fall back to defaults
  const wpConfig = getWpConfig();

  return {
    header: wpConfig.header
      ? { ...DEFAULT_HEADER_CONFIG, ...wpConfig.header }
      : DEFAULT_HEADER_CONFIG,
    topbar: wpConfig.topbar
      ? { ...DEFAULT_TOPBAR_CONFIG, ...wpConfig.topbar }
      : DEFAULT_TOPBAR_CONFIG,
  };
}

const HeaderConfigContext = createContext<HeaderConfigContextType | undefined>(undefined);

export function HeaderConfigProvider({ children }: { children: ReactNode }) {
  const [headerConfig, setHeaderConfig] = useState<HeaderConfig>(() => loadConfig().header);
  const [topbarConfig, setTopbarConfig] = useState<TopbarConfig>(() => loadConfig().topbar);

  const updateHeaderConfig = useCallback((updates: Partial<HeaderConfig>) => {
    setHeaderConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateHeaderStyle = useCallback((updates: Partial<HeaderStyle>) => {
    setHeaderConfig((prev) => ({ ...prev, style: { ...prev.style, ...updates } }));
  }, []);

  const updateTopbarConfig = useCallback((updates: Partial<TopbarConfig>) => {
    setTopbarConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetHeaderConfig = useCallback(() => {
    setHeaderConfig(DEFAULT_HEADER_CONFIG);
    setTopbarConfig(DEFAULT_TOPBAR_CONFIG);
  }, []);

  return (
    <HeaderConfigContext.Provider
      value={{
        headerConfig,
        topbarConfig,
        updateHeaderConfig,
        updateHeaderStyle,
        updateTopbarConfig,
        resetHeaderConfig,
      }}
    >
      {children}
    </HeaderConfigContext.Provider>
  );
}

export function useHeaderConfig() {
  const context = useContext(HeaderConfigContext);
  if (!context) {
    throw new Error('useHeaderConfig must be used within a HeaderConfigProvider');
  }
  return context;
}

export { DEFAULT_HEADER_CONFIG, DEFAULT_TOPBAR_CONFIG };
