import type { ReactNode } from 'react';
import { useSectionTheme } from '../context/SectionThemeContext';
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
  const { getSectionStyles, isSectionVisible } = useSectionTheme();
  const sectionStyles = getSectionStyles(id);

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

  return (
    <Component
      id={`${id}-section`}
      data-section={id}
      className={`themed-section relative ${alternatingClass} ${className}`}
      style={sectionStyles}
    >
      {children}
    </Component>
  );
}
