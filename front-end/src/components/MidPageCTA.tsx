import { memo } from 'react';
import { useGlobalConfig } from '../context/GlobalConfigContext';
import { useSectionTheme } from '../context/SectionThemeContext';
import { useSectionPalette } from '../hooks/useSectionPalette';
import { useContent, type FeatureItem } from '../context/ContentContext';
import { renderColoredText } from '../utils/renderHeadline';
import { withAlpha } from '../utils/colorUtils';
import { trackPhoneClick } from '../lib/analytics';
import LucideIcon from './LucideIcon';


// Render Lucide icon by name (kebab-case)
const FeatureIcon = memo(({ feature }: { feature: FeatureItem }) => {
  return <LucideIcon name={feature.icon || 'check-circle'} className="w-5 h-5" />;
});
FeatureIcon.displayName = 'FeatureIcon';

export default function MidPageCTA() {
  const { globalConfig } = useGlobalConfig();
  const { sectionThemes } = useSectionTheme();
  const palette = useSectionPalette('mid-cta');
  const { getContent } = useContent();
  const content = getContent('mid-cta');
  const ctaTheme = sectionThemes['mid-cta'] || {};
  const hasBgImage = !!ctaTheme.bgImage;

  // Section accent: follows accentSource toggle (primary or accent brand color)
  const accentColor = ctaTheme.accentSource === 'accent' ? palette.accent[500] : palette.primary[500];

  // Determine if section is light or dark
  const effectiveMode = ctaTheme.paletteMode || globalConfig.brand.mode;
  const isLightMode = effectiveMode === 'light';

  // Badge colors - inverted for visibility
  const badgeBg = isLightMode ? withAlpha('#000000', 0.08) : withAlpha('#ffffff', 0.1);

  // Divider color
  const dividerColor = isLightMode ? withAlpha('#000000', 0.15) : withAlpha('#ffffff', 0.2);

  return (
    <div
      id="mid-cta-section"
      className={`section-padding relative overflow-hidden ${hasBgImage ? '' : 'section-bg-primary'}`}
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

      <div className="relative max-w-5xl mx-auto px-6 lg:px-8 text-center">
        {/* Urgency Badge */}
        <div
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold mb-8 shadow-lg section-text-primary"
          style={{ backgroundColor: badgeBg }}
        >
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: accentColor }}
          />
          <span>{renderColoredText(content.badge)}</span>
        </div>

        {/* Headline */}
        <h2 className="font-[var(--font-display)] text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight section-text-primary">
          {renderColoredText(content.headline)}
        </h2>

        {/* Subtext */}
        <p className="section-text-secondary text-lg sm:text-xl max-w-2xl mx-auto mb-10">
          {renderColoredText(content.subheadline)}
        </p>

        {/* CTA Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={content.ctaLink}
            className="group inline-flex items-center gap-3 btn-section px-8 py-4 rounded-full font-semibold text-lg shadow-2xl"
            onClick={() => trackPhoneClick('mid_cta')}
          >
            <LucideIcon name="phone" className="w-6 h-6" />
            {renderColoredText(content.ctaText)}
          </a>
        </div>

        {/* Trust Indicators */}
        {content.features.length > 0 && (
          <div
            className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-8 pt-6 border-t"
            style={{ borderColor: dividerColor }}
          >
            {content.features.map((feature, index) => (
              <div key={feature.id} className="flex items-center gap-2">
                {index > 0 && (
                  <div
                    className="w-px h-5 hidden sm:block mr-6"
                    style={{ backgroundColor: dividerColor }}
                  />
                )}
                <div className="flex items-center gap-2 font-medium section-text-secondary">
                  <FeatureIcon feature={feature} />
                  <span>{renderColoredText(feature.text)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
