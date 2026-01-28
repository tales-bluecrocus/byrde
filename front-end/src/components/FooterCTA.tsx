import { useGlobalConfig } from '../context/GlobalConfigContext';
import { useSectionTheme } from '../context/SectionThemeContext';
import { useContent } from '../context/ContentContext';
import { getContrastColor, withAlpha } from '../utils/colorUtils';

const PhoneIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

export default function FooterCTA() {
  const { globalConfig, palette } = useGlobalConfig();
  const { sectionThemes } = useSectionTheme();
  const { getContent } = useContent();
  const content = getContent('footer-cta');
  const ctaTheme = sectionThemes['footer-cta'] || {};

  // Use section palette colors if overriding, otherwise fall back to global
  const isOverriding = ctaTheme.overrideGlobalColors ?? false;
  const hasBgImage = !!ctaTheme.bgImage;

  // Section colors - properly integrated with theme system
  const bgPrimary = isOverriding
    ? (ctaTheme.bgPrimary || palette.primary.base)
    : palette.primary.base;
  const accentColor = isOverriding
    ? (ctaTheme.accent || globalConfig.brand.accent)
    : globalConfig.brand.accent;
  const textPrimary = isOverriding
    ? (ctaTheme.textPrimary || palette.text.primary)
    : getContrastColor(bgPrimary);
  const textSecondary = isOverriding
    ? (ctaTheme.textSecondary || withAlpha(textPrimary, 0.85))
    : withAlpha(textPrimary, 0.85);

  // Button uses accent color for contrast against primary bg
  const buttonBg = accentColor;
  const buttonText = getContrastColor(buttonBg);

  // When bgImage is set, use transparent background to let image show through
  // ThemedSection handles the background image and color overlay
  const backgroundStyle = hasBgImage
    ? {} // Transparent - let ThemedSection's bgImage show
    : { background: `linear-gradient(to right, ${bgPrimary}, ${bgPrimary})` };

  return (
    <div
      className="py-16"
      style={backgroundStyle}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2
          className="font-[var(--font-display)] text-3xl sm:text-4xl font-bold mb-4"
          style={{ color: textPrimary }}
        >
          {content.headline}{' '}
          <span style={{ color: accentColor }}>{content.highlightText}</span>
        </h2>
        <p
          className="text-lg mb-8"
          style={{ color: textSecondary }}
        >
          {content.subheadline}
        </p>
        <a
          href={content.ctaLink}
          className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-semibold text-lg shadow-2xl shadow-black/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-3xl hover:brightness-110 active:scale-95"
          style={{
            backgroundColor: buttonBg,
            color: buttonText,
          }}
        >
          <PhoneIcon />
          {content.ctaText}
        </a>
      </div>
    </div>
  );
}
