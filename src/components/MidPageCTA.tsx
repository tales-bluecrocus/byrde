import { useGlobalConfig } from '../context/GlobalConfigContext';
import { useSectionTheme } from '../context/SectionThemeContext';
import { getContrastColor, withAlpha } from '../utils/colorUtils';

const PhoneIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

export default function MidPageCTA() {
  const { globalConfig, palette } = useGlobalConfig();
  const { sectionThemes } = useSectionTheme();
  const ctaTheme = sectionThemes['mid-cta'] || {};

  // Use CTA palette colors if overriding, otherwise fall back to global
  const isOverriding = ctaTheme.overrideGlobalColors ?? false;

  // Section colors - properly integrated with theme system
  const bgPrimary = isOverriding
    ? (ctaTheme.bgPrimary || palette.surface.s1)
    : palette.surface.s1;
  const accentColor = isOverriding
    ? (ctaTheme.accent || globalConfig.brand.primary)
    : globalConfig.brand.primary;
  const textPrimary = isOverriding
    ? (ctaTheme.textPrimary || palette.text.primary)
    : palette.text.primary;
  const textSecondary = isOverriding
    ? (ctaTheme.textSecondary || palette.text.secondary)
    : palette.text.secondary;

  // Determine if section is light or dark for proper contrast
  const sectionIsLight = isOverriding && ctaTheme.paletteMode === 'light';
  const isLightMode = isOverriding ? sectionIsLight : globalConfig.brand.mode === 'light';

  // Button colors with proper contrast
  const buttonBg = accentColor;
  const buttonText = getContrastColor(buttonBg);

  // Badge colors - inverted for visibility
  const badgeBg = isLightMode ? withAlpha('#000000', 0.08) : withAlpha('#ffffff', 0.1);
  const badgeText = textPrimary;

  // Divider color
  const dividerColor = isLightMode ? withAlpha('#000000', 0.15) : withAlpha('#ffffff', 0.2);

  return (
    <div
      id="mid-cta-section"
      className="relative py-20 overflow-hidden"
      style={{ backgroundColor: bgPrimary }}
    >
      {/* Subtle gradient overlay for depth */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, ${withAlpha(accentColor, 0.08)} 0%, transparent 70%)`
        }}
      />

      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='${isLightMode ? '%23000000' : '%23ffffff'}' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Decorative Circles */}
      <div
        className="absolute -left-20 top-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-3xl"
        style={{ backgroundColor: withAlpha(accentColor, 0.1) }}
      />
      <div
        className="absolute -right-20 top-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-3xl"
        style={{ backgroundColor: withAlpha(accentColor, 0.1) }}
      />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Urgency Badge */}
        <div
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold mb-8 shadow-lg"
          style={{
            backgroundColor: badgeBg,
            color: badgeText,
          }}
        >
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: accentColor }}
          />
          <span>Same-Day Service Available</span>
        </div>

        {/* Headline */}
        <h2
          className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight"
          style={{ color: textPrimary, fontFamily: 'var(--font-display)' }}
        >
          Clear Your Space Today
        </h2>

        {/* Subtext */}
        <p
          className="text-lg sm:text-xl max-w-2xl mx-auto mb-10"
          style={{ color: textSecondary }}
        >
          Same-day service available. Upfront pricing. No hidden fees.
        </p>

        {/* CTA Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="tel:2089980054"
            className="group inline-flex items-center gap-3 px-8 py-4 rounded-full font-semibold text-lg shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-3xl"
            style={{
              backgroundColor: buttonBg,
              color: buttonText,
            }}
          >
            <PhoneIcon />
            Call Now For Fast Service
          </a>
        </div>

        {/* Trust Indicators */}
        <div
          className="flex flex-wrap items-center justify-center gap-6 mt-12 pt-10 border-t"
          style={{ borderColor: dividerColor }}
        >
          <div
            className="flex items-center gap-2 font-medium"
            style={{ color: textSecondary }}
          >
            <ShieldIcon />
            <span>100% Guarantee</span>
          </div>
          <div
            className="w-px h-5 hidden sm:block"
            style={{ backgroundColor: dividerColor }}
          />
          <div
            className="flex items-center gap-2 font-medium"
            style={{ color: textSecondary }}
          >
            <ClockIcon />
            <span>Fast Response</span>
          </div>
          <div
            className="w-px h-5 hidden sm:block"
            style={{ backgroundColor: dividerColor }}
          />
          <div
            className="flex items-center gap-2 font-medium"
            style={{ color: textSecondary }}
          >
            <CheckIcon />
            <span>Upfront Pricing</span>
          </div>
        </div>
      </div>
    </div>
  );
}
