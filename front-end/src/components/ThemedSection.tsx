import { useMemo } from 'react';
import type { ReactNode, CSSProperties } from 'react';
import { useSectionTheme } from '../context/SectionThemeContext';
import { useGlobalConfig } from '../context/GlobalConfigContext';
import { useSettingsContext } from '../context/SettingsContext';
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

/** Convert a BrandPalette into CSS variable overrides (same vars as PaletteInjector).
 *  When sectionMode is provided, uses the correct button settings for that mode. */
interface ButtonSettings {
  bg: string;
  text: string;
  borderColor: string;
}

function paletteToStyles(p: BrandPalette, btnSettings?: ButtonSettings): Record<string, string> {
  const styles: Record<string, string> = {};

  // Primary shade scale
  const shadeKeys = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
  for (const shade of shadeKeys) {
    styles[`--color-primary-${shade}`] = p.primary[shade];
    styles[`--color-accent-${shade}`] = p.accent[shade];
  }

  // Button colors — use settings for the target mode, fallback to palette primary
  const btnBg = btnSettings?.bg || p.primary[500];
  const btnText = btnSettings?.text || '#ffffff';
  const btnBorder = btnSettings?.borderColor || 'transparent';
  styles['--color-button-bg'] = btnBg;
  styles['--color-button-hover'] = btnBg;
  styles['--color-button-active'] = btnBg;
  styles['--color-button-text'] = btnText;
  styles['--color-button-border'] = btnBorder;
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
  styles['--section-bg-odd-accent'] = withAlpha(p.accent[500], 0.08);

  // Section-scoped vars
  styles['--section-bg-primary'] = p.background.primary;
  styles['--section-bg-secondary'] = p.background.secondary;
  styles['--section-bg-tertiary'] = p.background.tertiary;
  styles['--section-text-primary'] = p.text.primary;
  styles['--section-text-secondary'] = p.text.secondary;
  styles['--section-text-accent'] = p.primary[500];
  styles['--section-border'] = p.border;

  // Border
  styles['--color-border'] = p.border;
  styles['--color-dark-700'] = p.border;

  // Muted backgrounds (pagination dots, scrollbar, etc.)
  styles['--color-dark-600'] = p.border;      // Slightly lighter than border
  styles['--color-dark-500'] = p.text.muted;  // Muted text color as bg

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
  const { settings } = useSettingsContext();
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
      {
        textSecondary: isDark ? b.darkTextSecondary : b.lightTextSecondary,
        bgSecondary: isDark ? b.darkBgSecondary : b.lightBgSecondary,
        border: isDark ? b.darkBorder : b.lightBorder,
      },
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

  // Resolve button settings for this section's effective mode
  const effectiveMode = theme.paletteMode || globalConfig.brand.mode;
  const sectionBtnSettings: ButtonSettings = effectiveMode === 'dark'
    ? { bg: settings.button_dark_bg, text: settings.button_dark_text, borderColor: settings.button_dark_border_color }
    : { bg: settings.button_light_bg, text: settings.button_light_text, borderColor: settings.button_light_border_color };

  // Build mode-override styles (if section has different mode than page)
  const modeStyles: CSSProperties = sectionModePalette
    ? {
        ...paletteToStyles(sectionModePalette, sectionBtnSettings),
        backgroundColor: sectionModePalette.background.primary,
        color: sectionModePalette.text.primary,
      } as CSSProperties
    : {};

  // Merge: sectionStyles (custom overrides) > modeStyles (mode palette) > global
  const mergedStyles: CSSProperties = { ...modeStyles, ...sectionStyles };

  // Background image settings
  const hasBgImage = !!theme.bgImage;
  const bgImageOpacity = theme.bgImageOpacity ?? 0.5;
  const bgImageSize = theme.bgImageSize || 'cover';
  const bgImagePosition = theme.bgImagePosition || 'center';

  // Get the background color for the overlay
  const effectivePalette = sectionModePalette || palette;
  const overlayColor = theme.bgImageOverlayColor || theme.bgPrimary || effectivePalette.background.primary;

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
