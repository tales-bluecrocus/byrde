import type { ReactNode } from 'react';

/**
 * Parse rich text with color shortcodes and basic HTML.
 *
 * Supported:
 *  - [pr]...[/pr]  → Primary color text
 *  - [ac]...[/ac]  → Accent color text
 *  - <strong>...</strong> or <b>...</b> → Bold
 *  - <a href="...">...</a> → Link
 *  - <br> / <br/> / <br /> → Line break
 *  - Legacy: [primary]/[accent], <strong> → [pr] normalization
 */
export function renderColoredText(text: string): ReactNode[] {
  if (!text) return [];

  // Normalize legacy shortcode aliases
  const normalized = text
    .replace(/\[primary\]/g, '[pr]')
    .replace(/\[\/primary\]/g, '[/pr]')
    .replace(/\[accent\]/g, '[ac]')
    .replace(/\[\/accent\]/g, '[/ac]');

  // Tokenize: split on shortcodes, HTML tags we support
  const TOKEN_RE =
    /(\[pr\][\s\S]*?\[\/pr\]|\[ac\][\s\S]*?\[\/ac\]|<br\s*\/?>|<strong>[\s\S]*?<\/strong>|<b>[\s\S]*?<\/b>|<a\s[^>]*>[\s\S]*?<\/a>)/gi;

  const parts = normalized.split(TOKEN_RE);
  const result: ReactNode[] = [];
  let key = 0;

  for (const part of parts) {
    if (!part) continue;

    // [pr]...[/pr]
    const prMatch = part.match(/^\[pr\]([\s\S]*?)\[\/pr\]$/i);
    if (prMatch) {
      result.push(
        <span key={key++} style={{ color: 'var(--section-text-accent)' }}>
          {renderColoredText(prMatch[1])}
        </span>
      );
      continue;
    }

    // [ac]...[/ac]
    const acMatch = part.match(/^\[ac\]([\s\S]*?)\[\/ac\]$/i);
    if (acMatch) {
      result.push(
        <span key={key++} style={{ color: 'var(--color-accent-500)' }}>
          {renderColoredText(acMatch[1])}
        </span>
      );
      continue;
    }

    // <br> / <br/> / <br />
    if (/^<br\s*\/?>$/i.test(part)) {
      result.push(<br key={key++} />);
      continue;
    }

    // <strong>...</strong>
    const strongMatch = part.match(/^<strong>([\s\S]*?)<\/strong>$/i);
    if (strongMatch) {
      result.push(<strong key={key++}>{renderColoredText(strongMatch[1])}</strong>);
      continue;
    }

    // <b>...</b>
    const bMatch = part.match(/^<b>([\s\S]*?)<\/b>$/i);
    if (bMatch) {
      result.push(<strong key={key++}>{renderColoredText(bMatch[1])}</strong>);
      continue;
    }

    // <a href="...">...</a>
    const aMatch = part.match(/^<a\s+href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>$/i);
    if (aMatch) {
      result.push(
        <a key={key++} href={aMatch[1]} className="underline hover:opacity-80" target="_blank" rel="noopener noreferrer">
          {renderColoredText(aMatch[2])}
        </a>
      );
      continue;
    }

    // Plain text
    result.push(part);
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
