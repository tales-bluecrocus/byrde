import { useMemo } from 'react';
import type { ReactNode, CSSProperties } from 'react';
import { useSectionTheme } from '../context/SectionThemeContext';
import { useGlobalConfig } from '../context/GlobalConfigContext';
import type { SectionId } from '../context/SectionThemeContext';
import { generateBrandPalette, withAlpha, lighten, darken } from '../utils/colorUtils';
import { getColorsForMode } from '../hooks/useSectionPalette';
import type { BrandPalette } from '../utils/colorUtils';

interface ThemedSectionProps {
  id: SectionId;
  children: ReactNode;
  className?: string;
  as?: 'section' | 'div' | 'footer';
  index?: number; // Used for alternating backgrounds (even/odd)
}

/** Convert a BrandPalette into CSS variable overrides (same vars as PaletteInjector).
 *  When accentSource is 'accent', primary and accent shades swap for section elements.
 *  buttonStyle: 1=primary, 2=accent (from brand palette, independent of accentSource), 3=dark, 4=light
 *  sectionMode: effective mode for this section (picks correct per-mode button text vars) */
function paletteToStyles(p: BrandPalette, accentSource?: 'primary' | 'accent', buttonStyle?: 1 | 2 | 3 | 4, sectionMode?: 'dark' | 'light'): Record<string, string> {
  const styles: Record<string, string> = {};
  const useAccent = accentSource === 'accent';

  // Primary and accent shade scales — swap when accentSource is 'accent'
  const sectionPrimary = useAccent ? p.accent : p.primary;
  const sectionAccent = useAccent ? p.primary : p.accent;

  const shadeKeys = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
  for (const shade of shadeKeys) {
    styles[`--color-primary-${shade}`] = sectionPrimary[shade];
    styles[`--color-accent-${shade}`] = sectionAccent[shade];
  }

  // Button colors — independent of accentSource; uses BRAND palette directly
  // Text color references mode-specific CSS vars set by PaletteInjector
  const m = sectionMode || 'dark';
  let btnBg: string;
  let btnText: string | undefined;
  switch (buttonStyle) {
    case 2:
      btnBg = p.accent[500];
      btnText = `var(--btn-${m}-accent-text, #ffffff)`;
      break;
    case 3: btnBg = '#171717'; btnText = '#ffffff'; break;
    case 4: btnBg = '#efefef'; btnText = '#171717'; break;
    default:
      btnBg = p.primary[500];
      btnText = `var(--btn-${m}-text, #ffffff)`;
      break;
  }
  styles['--color-button-bg'] = btnBg;
  styles['--color-button-hover'] = btnBg;
  styles['--color-button-active'] = btnBg;
  styles['--color-button-text'] = btnText;
  styles['--color-button-accent-text'] = `var(--btn-${m}-accent-text, #ffffff)`;
  styles['--color-button-border'] = 'transparent';
  styles['--section-button-bg'] = btnBg;
  styles['--section-button-text'] = btnText;

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
  styles['--section-bg-odd-accent'] = withAlpha(sectionAccent[500], 0.08);

  // Section-scoped vars
  styles['--section-bg-primary'] = p.background.primary;
  styles['--section-bg-secondary'] = p.background.secondary;
  styles['--section-bg-tertiary'] = p.background.tertiary;
  styles['--section-text-primary'] = p.text.primary;
  styles['--section-text-secondary'] = p.text.secondary;
  styles['--section-text-accent'] = sectionPrimary[500];
  styles['--section-border'] = p.border;

  // Border
  styles['--color-border'] = p.border;
  styles['--color-dark-700'] = p.border;

  // Muted backgrounds (pagination dots, scrollbar, etc.)
  styles['--color-dark-600'] = p.border;
  styles['--color-dark-500'] = p.text.muted;

  return styles;
}

export default function ThemedSection({
  id,
  children,
  className = '',
  as: Component = 'section',
  index,
}: ThemedSectionProps) {
  const { isSectionVisible, sectionThemes } = useSectionTheme();
  const { palette, globalConfig } = useGlobalConfig();
  const theme = sectionThemes[id] || {};

  // Generate per-section palette when paletteMode differs from page mode
  const sectionModePalette = useMemo(() => {
    const sectionMode = theme.paletteMode;
    if (!sectionMode || sectionMode === globalConfig.brand.mode) return null;

    const colors = getColorsForMode(globalConfig.brand, sectionMode);
    return generateBrandPalette(colors.primary, colors.accent, sectionMode, colors.text);
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

  // Build mode-override styles (if section has different mode, accentSource, buttonStyle, or bgColor)
  const accentSource = theme.accentSource;
  const buttonStyle = theme.buttonStyle;
  const customBg = theme.bgColor;
  const needsStyleOverride = sectionModePalette || accentSource === 'accent' || (buttonStyle && buttonStyle !== 1) || customBg;
  const effectivePaletteForStyles = sectionModePalette || palette;
  const effectiveMode = theme.paletteMode || globalConfig.brand.mode;
  const modeStyles: CSSProperties = needsStyleOverride
    ? {
        ...paletteToStyles(effectivePaletteForStyles, accentSource, buttonStyle, effectiveMode),
        ...(sectionModePalette ? {
          backgroundColor: sectionModePalette.background.primary,
          color: sectionModePalette.text.primary,
        } : {}),
        // Custom background color override — derive secondary/tertiary from it
        ...(customBg ? (() => {
          const bgSecondary = effectiveMode === 'dark' ? lighten(customBg, 4) : darken(customBg, 2);
          const bgTertiary = effectiveMode === 'dark' ? lighten(customBg, 8) : darken(customBg, 5);
          return {
            backgroundColor: customBg,
            '--section-bg-primary': customBg,
            '--section-bg-secondary': bgSecondary,
            '--section-bg-tertiary': bgTertiary,
            '--color-dark-950': customBg,
            '--color-dark-900': bgSecondary,
            '--color-dark-800': bgTertiary,
            '--section-bg-even': customBg,
            '--section-bg-odd': bgSecondary,
          };
        })() : {}),
      } as CSSProperties
    : {};

  // Merge mode palette overrides into styles
  const mergedStyles: CSSProperties = { ...modeStyles };

  // Background image settings
  const hasBgImage = !!theme.bgImage;
  const bgImageOpacity = theme.bgImageOpacity ?? 0.5;
  const bgImageSize = theme.bgImageSize || 'cover';
  const bgImagePosition = theme.bgImagePosition || 'center';

  // Get the background color for the overlay
  const effectivePalette = sectionModePalette || palette;
  const overlayColor = theme.bgImageOverlayColor || effectivePalette.background.primary;

  // Per-section padding — exposed as CSS variable for child components
  const PADDING_VALUES: Record<string, string> = {
    sm: '1.5rem',
    md: '3rem',
    lg: '4rem',
    xl: '5rem',
  };
  const sectionPadding = PADDING_VALUES[theme.padding || 'md'] || '3rem';

  // When we have a background image, make section bg transparent
  const paddingVar = { '--section-py': sectionPadding } as CSSProperties;
  const combinedStyles: CSSProperties = hasBgImage
    ? { ...mergedStyles, ...paddingVar, backgroundColor: 'transparent' }
    : { ...mergedStyles, ...paddingVar };

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

  // Gradient overlay
  const hasGradient = !!theme.gradientEnabled;
  const gradientStyle: CSSProperties = hasGradient ? (() => {
    const type = theme.gradientType || 'linear';
    const color1 = theme.gradientColor1 || effectivePalette.background.primary;
    const color2 = theme.gradientColor2 || 'transparent';
    const loc1 = theme.gradientLocation1 ?? 0;
    const loc2 = theme.gradientLocation2 ?? 100;
    const angle = theme.gradientAngle ?? 180;
    const position = theme.gradientPosition || 'center';

    const gradient = type === 'radial'
      ? `radial-gradient(circle at ${position}, ${color1} ${loc1}%, ${color2} ${loc2}%)`
      : `linear-gradient(${angle}deg, ${color1} ${loc1}%, ${color2} ${loc2}%)`;

    return {
      position: 'absolute',
      inset: 0,
      background: gradient,
      pointerEvents: 'none',
      zIndex: 2,
    };
  })() : {};

  const contentZIndex = hasGradient ? 3 : 2;

  return (
    <Component
      id={`${id}-section`}
      data-section={id}
      className={`themed-section relative overflow-hidden ${alternatingClass} ${hasGradient ? 'has-gradient' : ''} ${className}`}
      style={combinedStyles}
    >
      {/* Background image layer */}
      {hasBgImage && <div style={bgImageLayerStyle} aria-hidden="true" />}
      {/* Color overlay for readability */}
      {hasBgImage && <div style={colorOverlayStyle} aria-hidden="true" />}
      {/* Gradient overlay */}
      {hasGradient && <div style={gradientStyle} aria-hidden="true" />}
      {/* Content */}
      <div style={{ position: 'relative', zIndex: contentZIndex }}>
        {children}
      </div>
    </Component>
  );
}
