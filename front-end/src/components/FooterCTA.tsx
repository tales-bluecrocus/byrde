import { useGlobalConfig } from '../context/GlobalConfigContext';
import { useSectionTheme } from '../context/SectionThemeContext';
import { useSectionPalette } from '../hooks/useSectionPalette';
import { useContent } from '../context/ContentContext';
import { renderColoredText } from '../utils/renderHeadline';
import { withAlpha } from '../utils/colorUtils';
import { trackPhoneClick } from '../lib/analytics';
import LucideIcon from './LucideIcon';

export default function FooterCTA() {
  const { globalConfig } = useGlobalConfig();
  const { sectionThemes } = useSectionTheme();
  const palette = useSectionPalette('footer-cta');
  const { getContent } = useContent();
  const content = getContent('footer-cta');
  const ctaTheme = sectionThemes['footer-cta'] || {};
  const hasBgImage = !!ctaTheme.bgImage;

  // Section accent: follows accentSource toggle
  const accentColor = ctaTheme.accentSource === 'accent' ? palette.accent[500] : palette.primary[500];

  const effectiveMode = ctaTheme.paletteMode || globalConfig.brand.mode;
  const isLightMode = effectiveMode === 'light';

  const dividerColor = isLightMode ? withAlpha('#000000', 0.1) : withAlpha('#ffffff', 0.1);

  return (
    <div className={`section-padding relative overflow-hidden ${hasBgImage ? '' : 'section-bg-primary'}`}>
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
        <h2 className="font-[var(--font-display)] text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight section-text-primary">
          {renderColoredText(content.headline)}
        </h2>

        {/* Subheadline */}
        <p className="section-text-secondary text-lg sm:text-xl max-w-2xl mx-auto mb-10">
          {renderColoredText(content.subheadline)}
        </p>

        {/* CTA Button */}
        <a
          href={content.ctaLink}
          className="inline-flex items-center gap-3 btn-section px-8 py-4 rounded-full font-semibold text-lg shadow-2xl shadow-black/25"
          onClick={() => trackPhoneClick('footer_cta')}
        >
          <LucideIcon name="phone" className="w-6 h-6" />
          {renderColoredText(content.ctaText)}
        </a>

        {/* Reassurance text */}
        <p className="mt-6 text-sm font-medium section-text-secondary opacity-60">
          {renderColoredText(content.reassuranceText)}
        </p>
      </div>
    </div>
  );
}
