/**
 * Settings Context - Reactive state for WordPress theme settings
 *
 * Replaces static window.byrdeSettings reads with a reactive context
 * so edits in the Theme Editor update all components in real time.
 */

import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { ThemeSettings } from '../hooks/useSettings';
import { DEFAULT_SETTINGS } from '../hooks/useSettings';

interface SettingsContextType {
  settings: ThemeSettings;
  updateSettings: (updates: Partial<ThemeSettings>) => void;
  replaceSettings: (settings: ThemeSettings) => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

function loadSettings(): ThemeSettings {
  return {
    ...DEFAULT_SETTINGS,
    ...window.byrdeSettings,
  } as ThemeSettings;
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ThemeSettings>(loadSettings);

  const updateSettings = useCallback((updates: Partial<ThemeSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const replaceSettings = useCallback((newSettings: ThemeSettings) => {
    setSettings(newSettings);
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, replaceSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettingsContext() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettingsContext must be used within a SettingsProvider');
  }
  return context;
}
