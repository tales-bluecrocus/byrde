import { useSectionTheme } from '../context/SectionThemeContext';
import { useContent } from '../context/ContentContext';
import { renderColoredText } from '../utils/renderHeadline';
import LucideIcon from './LucideIcon';

export default function ServiceAreas() {
  const { sectionThemes } = useSectionTheme();
  const { getContent } = useContent();
  const content = getContent('service-areas');
  const theme = sectionThemes['service-areas'] || {};
  const hasBgImage = !!theme.bgImage;

  return (
    <div id="areas" className={`section-padding relative overflow-hidden ${hasBgImage ? '' : 'section-bg-primary'}`}>
      {/* Map Background Pattern */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 1000'%3E%3Cpath fill='none' stroke='%23fff' stroke-width='1' d='M100,200 Q200,100 300,200 T500,200 T700,200 T900,200 M100,400 Q200,300 300,400 T500,400 T700,400 T900,400 M100,600 Q200,500 300,600 T500,600 T700,600 T900,600 M100,800 Q200,700 300,800 T500,800 T700,800 T900,800 M200,100 Q100,200 200,300 T200,500 T200,700 T200,900 M400,100 Q300,200 400,300 T400,500 T400,700 T400,900 M600,100 Q500,200 600,300 T600,500 T600,700 T600,900 M800,100 Q700,200 800,300 T800,500 T800,700 T800,900'/%3E%3C/svg%3E")`,
            backgroundSize: '500px 500px',
          }}
        />
      </div>

      {/* Gradient Overlays */}
      <div className="absolute top-0 left-0 right-0 h-32" style={{ background: 'linear-gradient(to bottom, var(--section-bg-secondary, var(--color-dark-950)), transparent)' }} />
      <div className="absolute bottom-0 left-0 right-0 h-32" style={{ background: 'linear-gradient(to top, var(--section-bg-secondary, var(--color-dark-950)), transparent)' }} />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block section-text-accent font-semibold text-sm uppercase tracking-wider mb-4">
            {renderColoredText(content.badgeText)}
          </span>
          <h2 className="font-[var(--font-display)] text-3xl sm:text-4xl lg:text-5xl font-bold section-text-primary mb-6">
            {renderColoredText(content.headline)}
          </h2>
          <p className="section-text-secondary text-lg max-w-2xl mx-auto">
            {renderColoredText(content.subheadline)}
          </p>
        </div>

        {/* Map Illustration & Areas */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Map Illustration — hidden on mobile */}
          <div className="relative hidden lg:flex items-center justify-center">
            <div className="relative w-full max-w-md">
              {/* Decorative Rings */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-80 h-80 section-border border rounded-full opacity-50" />
                <div className="absolute w-64 h-64 section-border border rounded-full opacity-50" />
                <div className="absolute w-48 h-48 border border-primary-500/30 rounded-full opacity-50" />
              </div>

              {/* Center Icon */}
              <div className="relative z-10 flex items-center justify-center py-20">
                <div
                  className="w-32 h-32 rounded-full flex items-center justify-center shadow-2xl animate-pulse"
                  style={{ backgroundColor: 'var(--section-button-bg)', color: 'var(--section-button-text)' }}
                >
                  <LucideIcon name="globe" className="w-16 h-16" strokeWidth={1.5} />
                </div>
              </div>

              {/* Floating Location Pins */}
              <div className="absolute top-8 left-8 w-10 h-10 rounded-full flex items-center justify-center shadow-lg animate-bounce" style={{ animationDelay: '0.1s', backgroundColor: 'var(--section-button-bg)', color: 'var(--section-button-text)' }}>
                <LucideIcon name="map-pin" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="absolute top-16 right-12 w-10 h-10 section-bg-secondary rounded-full flex items-center justify-center section-text-primary shadow-lg animate-bounce" style={{ animationDelay: '0.3s' }}>
                <LucideIcon name="map-pin" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="absolute bottom-16 left-16 w-10 h-10 rounded-full flex items-center justify-center shadow-lg animate-bounce" style={{ animationDelay: '0.5s', backgroundColor: 'var(--section-button-bg)', color: 'var(--section-button-text)' }}>
                <LucideIcon name="map-pin" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="absolute bottom-8 right-8 w-10 h-10 rounded-full flex items-center justify-center shadow-lg animate-bounce" style={{ animationDelay: '0.7s', backgroundColor: 'var(--section-button-bg)', color: 'var(--section-button-text)' }}>
                <LucideIcon name="map-pin" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
          </div>

          {/* Areas Tags */}
          <div className="text-center lg:text-left">
            <h3 className="text-xl font-semibold section-text-primary mb-6">
              {renderColoredText(content.locationsHeading)}
            </h3>
            <div className="flex flex-wrap gap-2 sm:gap-3 justify-center lg:justify-start">
              {content.areas.map((area) => (
                <span
                  key={area.id}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-4 sm:py-2.5 rounded-full text-[13px] sm:text-base font-medium ${
                    area.highlighted
                      ? 'shadow-lg'
                      : 'section-bg-secondary section-text-secondary section-border border shadow-sm'
                  }`}
                  style={area.highlighted ? {
                    backgroundColor: 'var(--section-button-bg)',
                    color: 'var(--section-button-text)',
                  } : undefined}
                >
                  <LucideIcon name="map-pin" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>{area.name}</span>
                  <span className={`hidden sm:inline text-xs ${area.highlighted ? 'opacity-80' : 'section-text-secondary opacity-70'}`}>
                    {area.state}
                  </span>
                </span>
              ))}
            </div>

            {/* Contact CTA */}
            <div className="mt-8 pt-6 section-border border-t">
              <p className="section-text-secondary mb-4">
                {renderColoredText(content.missingAreaText)}
              </p>
              <a
                href={content.ctaLink}
                className="inline-flex items-center gap-3 btn-section px-8 py-4 rounded-full font-semibold text-lg shadow-lg shadow-black/25"
              >
                <LucideIcon name="phone" className="w-5 h-5" />
                {renderColoredText(content.ctaText)}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
