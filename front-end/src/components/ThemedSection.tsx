import type { ReactNode, CSSProperties } from 'react';
import { useSectionTheme } from '../context/SectionThemeContext';
import { useGlobalConfig } from '../context/GlobalConfigContext';
import type { SectionId } from '../context/SectionThemeContext';

interface ThemedSectionProps {
  id: SectionId;
  children: ReactNode;
  className?: string;
  as?: 'section' | 'div' | 'footer';
  index?: number; // Used for alternating backgrounds (even/odd)
}

export default function ThemedSection({
  id,
  children,
  className = '',
  as: Component = 'section',
  index,
}: ThemedSectionProps) {
  const { getSectionStyles, isSectionVisible, sectionThemes } = useSectionTheme();
  const { palette } = useGlobalConfig();
  const sectionStyles = getSectionStyles(id);
  const theme = sectionThemes[id] || {};

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

  // Background image settings
  const hasBgImage = !!theme.bgImage;
  const bgImageOpacity = theme.bgImageOpacity ?? 0.5;
  const bgImageSize = theme.bgImageSize || 'cover';
  const bgImagePosition = theme.bgImagePosition || 'center';

  // Get the background color for the overlay (custom overlay color, section color, or global)
  const overlayColor = theme.bgImageOverlayColor || theme.bgPrimary || palette.background.primary;

  // When we have a background image:
  // 1. Section has transparent background
  // 2. Image layer at full opacity
  // 3. Color overlay with (1 - bgImageOpacity) to darken/tint
  // 4. Content on top
  const combinedStyles: CSSProperties = hasBgImage
    ? { ...sectionStyles, backgroundColor: 'transparent' }
    : sectionStyles;

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
  // Opacity is inverted: bgImageOpacity=1 means full image (0% overlay), bgImageOpacity=0 means no image (100% overlay)
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
