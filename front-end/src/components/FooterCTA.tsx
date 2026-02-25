import { useGlobalConfig } from '../context/GlobalConfigContext';
import { useSectionTheme } from '../context/SectionThemeContext';
import { useContent } from '../context/ContentContext';
import { renderHeadlineStyled } from '../utils/renderHeadline';
import { getContrastColor, withAlpha } from '../utils/colorUtils';
import { trackPhoneClick } from '../lib/analytics';

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

  const isOverriding = ctaTheme.overrideGlobalColors ?? false;
  const hasBgImage = !!ctaTheme.bgImage;

  // Follow same pattern as MidPageCTA — use section bg, not primary as bg
  const bgPrimary = isOverriding
    ? (ctaTheme.bgPrimary || palette.background.primary)
    : palette.background.primary;
  const accentColor = isOverriding
    ? (ctaTheme.accent || globalConfig.brand.accent)
    : globalConfig.brand.accent;
  const textPrimary = isOverriding
    ? (ctaTheme.textPrimary || palette.text.primary)
    : palette.text.primary;
  const textSecondary = isOverriding
    ? (ctaTheme.textSecondary || palette.text.secondary)
    : palette.text.secondary;

  const sectionIsLight = isOverriding && ctaTheme.paletteMode === 'light';
  const isLightMode = isOverriding ? sectionIsLight : globalConfig.brand.mode === 'light';

  const buttonBg = accentColor;
  const buttonText = getContrastColor(buttonBg);

  const dividerColor = isLightMode ? withAlpha('#000000', 0.1) : withAlpha('#ffffff', 0.1);

  const backgroundStyle = hasBgImage
    ? {}
    : { backgroundColor: bgPrimary };

  return (
    <div
      className="relative py-24 sm:py-28 overflow-hidden"
      style={backgroundStyle}
    >
      {/* Subtle radial accent glow */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, ${withAlpha(accentColor, 0.06)} 0%, transparent 70%)`
        }}
      />

      {/* Decorative blurred orbs */}
      <div
        className="absolute -left-32 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl"
        style={{ backgroundColor: withAlpha(accentColor, 0.08) }}
      />
      <div
        className="absolute -right-32 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl"
        style={{ backgroundColor: withAlpha(accentColor, 0.06) }}
      />

      {/* Subtle top divider */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-2/3"
        style={{ background: `linear-gradient(to right, transparent, ${dividerColor}, transparent)` }}
      />

      <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
        {/* Headline */}
        <h2
          className="font-[var(--font-display)] text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight"
          style={{ color: textPrimary }}
        >
          {renderHeadlineStyled(content.headline, { color: accentColor })}
        </h2>

        {/* Subheadline */}
        <p
          className="text-lg sm:text-xl max-w-2xl mx-auto mb-10"
          style={{ color: textSecondary }}
        >
          {content.subheadline}
        </p>

        {/* CTA Button */}
        <a
          href={content.ctaLink}
          className="inline-flex items-center gap-3 px-10 py-5 rounded-full font-semibold text-lg shadow-2xl shadow-black/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-3xl hover:brightness-110 active:scale-95"
          style={{
            backgroundColor: buttonBg,
            color: buttonText,
          }}
          onClick={() => trackPhoneClick('footer_cta')}
        >
          <PhoneIcon />
          {content.ctaText}
        </a>

        {/* Reassurance text */}
        <p
          className="mt-6 text-sm font-medium"
          style={{ color: textSecondary, opacity: 0.6 }}
        >
          {content.reassuranceText}
        </p>
      </div>
    </div>
  );
}
