import type { ReactNode } from 'react';

/**
 * Parse a headline string where <strong>text</strong> becomes accent-colored.
 * Returns an array of React nodes with accent spans applied.
 *
 * Example: "Trusted By <strong>Your Neighbors</strong>"
 * → ["Trusted By ", <span className="text-primary-500">Your Neighbors</span>]
 */
export function renderHeadline(text: string, accentClassName = 'text-primary-500'): ReactNode[] {
  if (!text) return [];
  const parts = text.split(/(<strong>.*?<\/strong>)/g);
  return parts.map((part, i) => {
    const match = part.match(/^<strong>(.*?)<\/strong>$/);
    if (match) {
      return (
        <span key={i} className={accentClassName}>
          {match[1]}
        </span>
      );
    }
    return part || null;
  });
}

/**
 * Same as renderHeadline but applies inline style instead of className.
 * Used for sections that need CSS variable-based coloring.
 */
export function renderHeadlineStyled(
  text: string,
  accentStyle: React.CSSProperties = { color: 'rgb(var(--color-primary-500))' },
): ReactNode[] {
  if (!text) return [];
  const parts = text.split(/(<strong>.*?<\/strong>)/g);
  return parts.map((part, i) => {
    const match = part.match(/^<strong>(.*?)<\/strong>$/);
    if (match) {
      return (
        <span key={i} style={accentStyle}>
          {match[1]}
        </span>
      );
    }
    return part || null;
  });
}

/**
 * Migrate old headline + highlightText format to single headline with <strong>.
 * Used during content loading to handle previously saved data.
 */
export function migrateHeadline(headline: string, highlightText?: string): string {
  if (!highlightText) return headline;
  // If headline already contains <strong>, it's already migrated
  if (headline.includes('<strong>')) return headline;
  return `${headline} <strong>${highlightText}</strong>`;
}
