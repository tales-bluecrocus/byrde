import { useEffect } from 'react';
import { useGlobalConfig } from '../context/GlobalConfigContext';
import { withAlpha } from '../utils/colorUtils';

/**
 * Injects CSS variables based on the current brand palette
 * This allows all existing CSS to automatically use palette colors
 */
export default function PaletteInjector() {
  const { palette, globalConfig } = useGlobalConfig();

  useEffect(() => {
    const root = document.documentElement;

    // Primary brand colors
    root.style.setProperty('--color-primary-600', palette.primary.dark);
    root.style.setProperty('--color-primary-500', palette.primary.base);
    root.style.setProperty('--color-primary-400', palette.primary.light);

    // Button colors (use primary)
    root.style.setProperty('--color-button-bg', palette.primary.base);
    root.style.setProperty('--color-button-hover', palette.primary.light);
    root.style.setProperty('--color-button-active', palette.primary.dark);

    // Text colors based on mode
    root.style.setProperty('--color-text-primary', palette.text.primary);
    root.style.setProperty('--color-text-secondary', palette.text.secondary);
    root.style.setProperty('--color-text-muted', palette.text.muted);

    // 8 Surface colors based on mode
    root.style.setProperty('--color-surface-1', palette.surface.s1);
    root.style.setProperty('--color-surface-2', palette.surface.s2);
    root.style.setProperty('--color-surface-3', palette.surface.s3);
    root.style.setProperty('--color-surface-4', palette.surface.s4);
    root.style.setProperty('--color-surface-5', palette.surface.s5);
    root.style.setProperty('--color-surface-6', palette.surface.s6);
    root.style.setProperty('--color-surface-7', palette.surface.s7);
    root.style.setProperty('--color-surface-8', palette.surface.s8);

    // Background colors based on mode (mapped from surface)
    root.style.setProperty('--color-dark-950', palette.background.primary);
    root.style.setProperty('--color-dark-900', palette.background.secondary);
    root.style.setProperty('--color-dark-800', palette.background.tertiary);

    // Body background and text
    document.body.style.backgroundColor = palette.background.primary;
    document.body.style.color = palette.text.primary;

    // Accent brand color for highlights and accents
    root.style.setProperty('--color-accent-500', palette.accent.base);
    root.style.setProperty('--color-accent-400', palette.accent.light);
    root.style.setProperty('--color-accent-600', palette.accent.dark);

    // Alternating section backgrounds (primary for even, accent-tinted for odd)
    root.style.setProperty('--section-bg-even', palette.background.primary);
    root.style.setProperty('--section-bg-odd', palette.background.secondary);
    // Use accent color tinted backgrounds for odd sections
    root.style.setProperty('--section-bg-odd-accent', withAlpha(palette.accent.base, 0.08));

    // Border color based on mode
    root.style.setProperty('--color-border', palette.border);

    // Selection color
    root.style.setProperty('--color-selection-bg', palette.primary.base);
    root.style.setProperty('--color-selection-text', '#ffffff');

    // Focus ring color
    root.style.setProperty('--color-focus-ring', palette.primary.base);

    // Semi-transparent variants for backgrounds
    root.style.setProperty('--color-primary-bg-10', withAlpha(palette.primary.base, 0.1));
    root.style.setProperty('--color-primary-bg-20', withAlpha(palette.primary.base, 0.2));
    root.style.setProperty('--color-primary-bg-30', withAlpha(palette.primary.base, 0.3));

  }, [palette, globalConfig.brand.mode]);

  return null;
}
