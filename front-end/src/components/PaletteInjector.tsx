import { useEffect } from 'react';
import { useGlobalConfig } from '../context/GlobalConfigContext';
import { withAlpha } from '../utils/colorUtils';

/**
 * Injects CSS variables based on the current brand palette.
 * Sets full 50-950 shade scales for primary + accent colors,
 * plus semantic tokens (button, text, background, border).
 *
 * In editor mode, injects into #root only (isolates from admin sidebar).
 */
export default function PaletteInjector() {
  const { palette, globalConfig } = useGlobalConfig();

  useEffect(() => {
    const isEditorMode = Boolean(window.lakecityAdmin);
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

    // Button colors (derived from primary)
    root.style.setProperty('--color-button-bg', palette.primary[500]);
    root.style.setProperty('--color-button-hover', palette.primary[400]);
    root.style.setProperty('--color-button-active', palette.primary[600]);
    root.style.setProperty('--color-button-text', '#ffffff');

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

    // Border
    root.style.setProperty('--color-border', palette.border);

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

  }, [palette, globalConfig.brand.mode]);

  return null;
}
