import { useEffect } from 'react';
import { useGlobalConfig } from '../context/GlobalConfigContext';
import { useSettingsContext } from '../context/SettingsContext';
import { withAlpha } from '../utils/colorUtils';

/**
 * Injects CSS variables based on the current brand palette.
 *
 * In editor mode, injects into #root only (isolates from admin sidebar).
 */
export default function PaletteInjector() {
  const { palette } = useGlobalConfig();
  const { settings } = useSettingsContext();

  useEffect(() => {
    const isEditorMode = Boolean(window.byrdeAdmin);
    const target = isEditorMode
      ? document.getElementById('root')
      : document.documentElement;

    if (!target) return;

    const root = target;

    // Primary shade scale (50-950)
    const shadeKeys = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
    for (const shade of shadeKeys) {
      root.style.setProperty(`--color-primary-${shade}`, palette.primary[shade]);
    }

    // Accent shade scale (50-950)
    for (const shade of shadeKeys) {
      root.style.setProperty(`--color-accent-${shade}`, palette.accent[shade]);
    }

    // Button style — colors derived from palette, text colors per mode
    const btnBg = palette.primary[500];
    const mode = settings.brand_mode || 'dark';
    const btnText = mode === 'dark'
      ? (settings.button_dark_text_color || '#ffffff')
      : (settings.button_light_text_color || '#ffffff');
    const btnAccentText = mode === 'dark'
      ? (settings.button_dark_accent_text_color || '#ffffff')
      : (settings.button_light_accent_text_color || '#000000');
    root.style.setProperty('--color-button-bg', btnBg);
    root.style.setProperty('--color-button-hover', btnBg);
    root.style.setProperty('--color-button-active', btnBg);
    root.style.setProperty('--color-button-text', btnText);
    root.style.setProperty('--color-button-accent-text', btnAccentText);
    root.style.setProperty('--color-button-border', 'transparent');
    // All 4 mode-specific button text vars (for per-section mode overrides)
    root.style.setProperty('--btn-dark-text', settings.button_dark_text_color || '#ffffff');
    root.style.setProperty('--btn-dark-accent-text', settings.button_dark_accent_text_color || '#ffffff');
    root.style.setProperty('--btn-light-text', settings.button_light_text_color || '#ffffff');
    root.style.setProperty('--btn-light-accent-text', settings.button_light_accent_text_color || '#000000');
    root.style.setProperty('--color-button-border-width', `${settings.button_border_width || '0'}px`);
    root.style.setProperty('--color-button-radius', `${settings.button_border_radius || '12'}px`);

    // Button shadow
    const shadowMap: Record<string, string> = {
      none: 'none',
      sm: '0 2px 8px -2px rgba(0,0,0,0.15)',
      md: '0 4px 14px -3px rgba(0,0,0,0.25)',
      lg: '0 8px 24px -4px rgba(0,0,0,0.35)',
    };
    root.style.setProperty('--color-button-shadow', shadowMap[settings.button_shadow || 'md'] || shadowMap.md);

    // Text colors
    root.style.setProperty('--color-text-primary', palette.text.primary);
    root.style.setProperty('--color-text-secondary', palette.text.secondary);

    // Background colors (mapped to --color-dark-* for backward compat with CSS classes)
    root.style.setProperty('--color-dark-950', palette.background.primary);
    root.style.setProperty('--color-dark-900', palette.background.secondary);
    root.style.setProperty('--color-dark-800', palette.background.tertiary);

    // Section alternating backgrounds
    root.style.setProperty('--section-bg-even', palette.background.primary);
    root.style.setProperty('--section-bg-odd', palette.background.secondary);
    root.style.setProperty('--section-bg-odd-accent', withAlpha(palette.accent[500], 0.08));

    // Border — set all border-related vars so sections with/without overrides match
    // In editor mode, skip --color-border to avoid overriding shadcn's .editor-dark value
    if (!isEditorMode) {
      root.style.setProperty('--color-border', palette.border);
    }
    root.style.setProperty('--color-dark-700', palette.border);
    root.style.setProperty('--color-dark-600', palette.border);
    root.style.setProperty('--color-dark-500', palette.text.muted);
    root.style.setProperty('--section-border', palette.border);

    // Section-scoped semantic vars (defaults for sections without per-section overrides)
    root.style.setProperty('--section-bg-primary', palette.background.primary);
    root.style.setProperty('--section-bg-secondary', palette.background.secondary);
    root.style.setProperty('--section-bg-tertiary', palette.background.tertiary);
    root.style.setProperty('--section-text-primary', palette.text.primary);
    root.style.setProperty('--section-text-secondary', palette.text.secondary);
    root.style.setProperty('--section-text-accent', palette.primary[500]);
    // In editor mode, skip --color-white and --color-gray-400 to avoid overriding
    // Tailwind v4 theme tokens (text-white, bg-white, text-gray-400) in the sidebar.
    // ThemedSection's paletteToStyles() sets these per-section so landing content is fine.
    // On the live landing page (non-editor), set them globally for sections without overrides.
    if (!isEditorMode) {
      root.style.setProperty('--color-white', palette.text.primary);
      root.style.setProperty('--color-gray-400', palette.text.secondary);
    }
    root.style.setProperty('--section-button-bg', btnBg);
    root.style.setProperty('--section-button-text', btnText);

    // Body background and text
    if (!isEditorMode) {
      document.body.style.backgroundColor = palette.background.primary;
      document.body.style.color = palette.text.primary;
    } else {
      const rootElement = document.getElementById('root');
      if (rootElement) {
        rootElement.style.backgroundColor = palette.background.primary;
        rootElement.style.color = palette.text.primary;
      }
    }

  }, [palette, settings.brand_mode, settings.button_border_width, settings.button_border_radius, settings.button_dark_text_color, settings.button_dark_accent_text_color, settings.button_light_text_color, settings.button_light_accent_text_color, settings.button_shadow]);

  return null;
}
