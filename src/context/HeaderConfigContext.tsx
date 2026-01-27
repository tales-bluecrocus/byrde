import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

// Header copy/content configuration
export interface HeaderCopy {
  phone: string;
  phoneDisplay: string;
  rating: string;
  logoAlt: string;
}

// Logo shape options
export type LogoShape = 'square' | 'rectangle' | 'circle';

// Badge theme options (only light/dark for brand consistency)
export type BadgeTheme = 'light' | 'dark';

// Header style configuration
export interface HeaderStyle {
  logoBgColor: string;
  logoShape: LogoShape;
  badgeTheme: BadgeTheme;
}

// Header layout configuration
export interface HeaderConfig {
  isFixed: boolean;
  showTopbar: boolean;
  showPhone: boolean;
  showBadge: boolean;
  copy: HeaderCopy;
  style: HeaderStyle;
}

// Topbar configuration
export interface TopbarConfig {
  message: string;
  showPhone: boolean;
  showEmail: boolean;
  email: string;
  bgColor: string;
  textColor: string;
}

interface HeaderConfigContextType {
  headerConfig: HeaderConfig;
  topbarConfig: TopbarConfig;
  updateHeaderConfig: (updates: Partial<HeaderConfig>) => void;
  updateHeaderCopy: (updates: Partial<HeaderCopy>) => void;
  updateHeaderStyle: (updates: Partial<HeaderStyle>) => void;
  updateTopbarConfig: (updates: Partial<TopbarConfig>) => void;
  resetHeaderConfig: () => void;
}

const DEFAULT_HEADER_CONFIG: HeaderConfig = {
  isFixed: true,
  showTopbar: false,
  showPhone: true,
  showBadge: true,
  copy: {
    phone: '2089980054',
    phoneDisplay: '(208) 998-0054',
    rating: '5.0',
    logoAlt: 'Lake City Hauling',
  },
  style: {
    logoBgColor: '#ffffff',
    logoShape: 'rectangle',
    badgeTheme: 'light',
  },
};

const DEFAULT_TOPBAR_CONFIG: TopbarConfig = {
  message: 'Serving North Idaho & Spokane Area',
  showPhone: true,
  showEmail: true,
  email: 'info@lakecityhauling.com',
  bgColor: '#3ab342', // primary color
  textColor: '#ffffff',
};

const STORAGE_KEY = 'lake-city-header-config';
const TOPBAR_STORAGE_KEY = 'lake-city-topbar-config';

function loadStoredConfig(): { header: HeaderConfig; topbar: TopbarConfig } {
  try {
    const storedHeader = localStorage.getItem(STORAGE_KEY);
    const storedTopbar = localStorage.getItem(TOPBAR_STORAGE_KEY);
    return {
      header: storedHeader ? { ...DEFAULT_HEADER_CONFIG, ...JSON.parse(storedHeader) } : DEFAULT_HEADER_CONFIG,
      topbar: storedTopbar ? { ...DEFAULT_TOPBAR_CONFIG, ...JSON.parse(storedTopbar) } : DEFAULT_TOPBAR_CONFIG,
    };
  } catch {
    return { header: DEFAULT_HEADER_CONFIG, topbar: DEFAULT_TOPBAR_CONFIG };
  }
}

const HeaderConfigContext = createContext<HeaderConfigContextType | undefined>(undefined);

export function HeaderConfigProvider({ children }: { children: ReactNode }) {
  const [headerConfig, setHeaderConfig] = useState<HeaderConfig>(() => loadStoredConfig().header);
  const [topbarConfig, setTopbarConfig] = useState<TopbarConfig>(() => loadStoredConfig().topbar);

  const saveHeaderConfig = useCallback((config: HeaderConfig) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, []);

  const saveTopbarConfig = useCallback((config: TopbarConfig) => {
    localStorage.setItem(TOPBAR_STORAGE_KEY, JSON.stringify(config));
  }, []);

  const updateHeaderConfig = useCallback((updates: Partial<HeaderConfig>) => {
    setHeaderConfig((prev) => {
      const updated = { ...prev, ...updates };
      saveHeaderConfig(updated);
      return updated;
    });
  }, [saveHeaderConfig]);

  const updateHeaderCopy = useCallback((updates: Partial<HeaderCopy>) => {
    setHeaderConfig((prev) => {
      const updated = { ...prev, copy: { ...prev.copy, ...updates } };
      saveHeaderConfig(updated);
      return updated;
    });
  }, [saveHeaderConfig]);

  const updateHeaderStyle = useCallback((updates: Partial<HeaderStyle>) => {
    setHeaderConfig((prev) => {
      const updated = { ...prev, style: { ...prev.style, ...updates } };
      saveHeaderConfig(updated);
      return updated;
    });
  }, [saveHeaderConfig]);

  const updateTopbarConfig = useCallback((updates: Partial<TopbarConfig>) => {
    setTopbarConfig((prev) => {
      const updated = { ...prev, ...updates };
      saveTopbarConfig(updated);
      return updated;
    });
  }, [saveTopbarConfig]);

  const resetHeaderConfig = useCallback(() => {
    setHeaderConfig(DEFAULT_HEADER_CONFIG);
    setTopbarConfig(DEFAULT_TOPBAR_CONFIG);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOPBAR_STORAGE_KEY);
  }, []);

  return (
    <HeaderConfigContext.Provider
      value={{
        headerConfig,
        topbarConfig,
        updateHeaderConfig,
        updateHeaderCopy,
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
