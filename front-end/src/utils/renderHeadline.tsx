import type { ReactNode } from 'react';

/**
 * Parse color tags in text: [pr]...[/pr] and [ac]...[/ac].
 * Also supports legacy [primary]/[accent] and <strong> tags.
 *
 * Example: "Trusted By [pr]Your Neighbors[/pr]"
 * Example: "Get [ac]50% Off[/ac] Today"
 */
export function renderColoredText(text: string): ReactNode[] {
  if (!text) return [];

  // Normalize legacy tags
  const normalized = text
    .replace(/<strong>/g, '[pr]')
    .replace(/<\/strong>/g, '[/pr]')
    .replace(/\[primary\]/g, '[pr]')
    .replace(/\[\/primary\]/g, '[/pr]')
    .replace(/\[accent\]/g, '[ac]')
    .replace(/\[\/accent\]/g, '[/ac]');

  const pattern = /\[(pr|ac)\](.*?)\[\/\1\]/g;
  const result: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(normalized)) !== null) {
    if (match.index > lastIndex) {
      result.push(normalized.slice(lastIndex, match.index));
    }

    const colorType = match[1];
    const innerText = match[2];
    const color = colorType === 'ac'
      ? 'var(--color-accent-500)'
      : 'var(--section-text-accent)';

    result.push(
      <span key={match.index} style={{ color }}>
        {innerText}
      </span>
    );

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < normalized.length) {
    result.push(normalized.slice(lastIndex));
  }

  return result.length ? result : [text];
}

/**
 * Legacy aliases — kept for backward compatibility.
 */
export const renderHeadline = (text: string, _accentClassName?: string): ReactNode[] =>
  renderColoredText(text);

export const renderHeadlineStyled = (
  text: string,
  _accentStyle?: React.CSSProperties,
): ReactNode[] => renderColoredText(text);

/**
 * Migrate old headline + highlightText format to single headline with [pr].
 */
export function migrateHeadline(headline: string, highlightText?: string): string {
  if (!highlightText) return headline;
  if (headline.includes('[pr]') || headline.includes('[primary]') || headline.includes('<strong>')) return headline;
  return `${headline} [pr]${highlightText}[/pr]`;
}
