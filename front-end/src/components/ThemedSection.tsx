import { useMemo } from 'react';
import type { ReactNode, CSSProperties } from 'react';
import { useSectionTheme } from '../context/SectionThemeContext';
import { useGlobalConfig } from '../context/GlobalConfigContext';
import type { SectionId } from '../context/SectionThemeContext';
import { generateBrandPalette, withAlpha } from '../utils/colorUtils';
import type { BrandPalette } from '../utils/colorUtils';

interface ThemedSectionProps {
  id: SectionId;
  children: ReactNode;
  className?: string;
  as?: 'section' | 'div' | 'footer';
  index?: number; // Used for alternating backgrounds (even/odd)
}

/** Convert a BrandPalette into CSS variable overrides (same vars as PaletteInjector). */
function paletteToStyles(p: BrandPalette): Record<string, string> {
  const styles: Record<string, string> = {};

  // Primary shade scale
  const shadeKeys = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
  for (const shade of shadeKeys) {
    styles[`--color-primary-${shade}`] = p.primary[shade];
    styles[`--color-accent-${shade}`] = p.accent[shade];
  }

  // Button colors
  styles['--color-button-bg'] = p.primary[500];
  styles['--color-button-hover'] = p.primary[400];
  styles['--color-button-active'] = p.primary[600];
  styles['--color-button-text'] = '#ffffff';

  // Text
  styles['--color-text-primary'] = p.text.primary;
  styles['--color-text-secondary'] = p.text.secondary;
  styles['--color-white'] = p.text.primary;
  styles['--color-gray-400'] = p.text.secondary;

  // Backgrounds
  styles['--color-dark-950'] = p.background.primary;
  styles['--color-dark-900'] = p.background.secondary;
  styles['--color-dark-800'] = p.background.tertiary;
  styles['--section-bg-even'] = p.background.primary;
  styles['--section-bg-odd'] = p.background.secondary;
  styles['--section-bg-odd-accent'] = withAlpha(p.accent[500], 0.08);

  // Section-scoped vars
  styles['--section-bg-primary'] = p.background.primary;
  styles['--section-bg-secondary'] = p.background.secondary;
  styles['--section-bg-tertiary'] = p.background.tertiary;
  styles['--section-text-primary'] = p.text.primary;
  styles['--section-text-secondary'] = p.text.secondary;
  styles['--section-text-accent'] = p.primary[500];
  styles['--section-button-bg'] = p.primary[500];
  styles['--section-button-text'] = '#ffffff';
  styles['--section-border'] = p.border;

  // Border
  styles['--color-border'] = p.border;
  styles['--color-dark-700'] = p.border;

  return styles;
}

export default function ThemedSection({
  id,
  children,
  className = '',
  as: Component = 'section',
  index,
}: ThemedSectionProps) {
  const { getSectionStyles, isSectionVisible, sectionThemes } = useSectionTheme();
  const { palette, globalConfig } = useGlobalConfig();
  const sectionStyles = getSectionStyles(id);
  const theme = sectionThemes[id] || {};

  // Generate per-section palette when paletteMode differs from page mode
  const sectionModePalette = useMemo(() => {
    const sectionMode = theme.paletteMode;
    if (!sectionMode || sectionMode === globalConfig.brand.mode) return null;

    const b = globalConfig.brand;
    const isDark = sectionMode === 'dark';
    return generateBrandPalette(
      isDark ? b.darkPrimary : b.lightPrimary,
      isDark ? b.darkAccent : b.lightAccent,
      sectionMode,
      isDark ? b.darkBg : b.lightBg,
      isDark ? b.darkText : b.lightText,
    );
  }, [theme.paletteMode, globalConfig.brand]);

  // Don't render if section is hidden
  if (!isSectionVisible(id)) {
    return null;
  }

  // Apply alternating background based on index (if provided)
  const alternatingClass = index !== undefined
    ? index % 2 === 0
      ? 'section-bg-even'
      : 'section-bg-odd'
    : '';

  // Build mode-override styles (if section has different mode than page)
  const modeStyles: CSSProperties = sectionModePalette
    ? {
        ...paletteToStyles(sectionModePalette),
        backgroundColor: sectionModePalette.background.primary,
        color: sectionModePalette.text.primary,
      } as CSSProperties
    : {};

  // Button style override: 1=primary, 2=accent, 3=dark background, 4=dark text
  const b = globalConfig.brand;
  const btnColorMap: Record<number, string> = {
    1: b.darkPrimary,
    2: b.darkAccent,
    3: b.darkBg,
    4: b.darkText,
  };
  const btnColor = theme.buttonStyle ? btnColorMap[theme.buttonStyle] : undefined;
  const buttonStyleOverride: CSSProperties = btnColor
    ? {
        '--color-button-bg': btnColor,
        '--color-button-hover': btnColor,
        '--color-button-active': btnColor,
        '--section-button-bg': btnColor,
      } as CSSProperties
    : {};

  // Merge: buttonStyle > sectionStyles (custom overrides) > modeStyles (mode palette) > global
  const mergedStyles: CSSProperties = { ...modeStyles, ...buttonStyleOverride, ...sectionStyles };

  // Background image settings
  const hasBgImage = !!theme.bgImage;
  const bgImageOpacity = theme.bgImageOpacity ?? 0.5;
  const bgImageSize = theme.bgImageSize || 'cover';
  const bgImagePosition = theme.bgImagePosition || 'center';

  // Get the background color for the overlay
  const effectivePalette = sectionModePalette || palette;
  const overlayColor = theme.bgImageOverlayColor || theme.bgPrimary || effectivePalette.background.primary;

  // When we have a background image, make section bg transparent
  const combinedStyles: CSSProperties = hasBgImage
    ? { ...mergedStyles, backgroundColor: 'transparent' }
    : mergedStyles;

  // Background image layer - full opacity, behind everything
  const bgImageLayerStyle: CSSProperties = hasBgImage ? {
    position: 'absolute',
    inset: 0,
    backgroundImage: `url(${theme.bgImage})`,
    backgroundSize: bgImageSize,
    backgroundPosition: bgImagePosition,
    backgroundRepeat: 'no-repeat',
    pointerEvents: 'none',
    zIndex: 0,
  } : {};

  // Color overlay layer - darkens the image for text readability
  const colorOverlayStyle: CSSProperties = hasBgImage ? {
    position: 'absolute',
    inset: 0,
    backgroundColor: overlayColor,
    opacity: 1 - bgImageOpacity,
    pointerEvents: 'none',
    zIndex: 1,
  } : {};

  return (
    <Component
      id={`${id}-section`}
      data-section={id}
      className={`themed-section relative overflow-hidden ${alternatingClass} ${className}`}
      style={combinedStyles}
    >
      {/* Background image layer */}
      {hasBgImage && <div style={bgImageLayerStyle} aria-hidden="true" />}
      {/* Color overlay for readability */}
      {hasBgImage && <div style={colorOverlayStyle} aria-hidden="true" />}
      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        {children}
      </div>
    </Component>
  );
}
