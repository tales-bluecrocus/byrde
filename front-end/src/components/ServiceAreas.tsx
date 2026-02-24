import { useSectionTheme } from '../context/SectionThemeContext';
import { useContent } from '../context/ContentContext';

const MapPinIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export default function ServiceAreas() {
  const { sectionThemes } = useSectionTheme();
  const { getContent } = useContent();
  const content = getContent('service-areas');
  const theme = sectionThemes['service-areas'] || {};
  const hasBgImage = !!theme.bgImage;

  return (
    <div id="areas" className={`py-24 relative overflow-hidden ${hasBgImage ? '' : 'section-bg-primary'}`}>
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
            Areas We Serve
          </span>
          <h2 className="font-[var(--font-display)] text-3xl sm:text-4xl lg:text-5xl font-bold section-text-primary mb-6">
            {content.headline} <span className="text-primary-500">{content.highlightText}</span>
          </h2>
          <p className="section-text-secondary text-lg max-w-2xl mx-auto">
            {content.subheadline}
          </p>
        </div>

        {/* Map Illustration & Areas */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Map Illustration */}
          <div className="relative flex items-center justify-center">
            <div className="relative w-full max-w-md">
              {/* Decorative Rings */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-80 h-80 section-border border rounded-full opacity-50" />
                <div className="absolute w-64 h-64 section-border border rounded-full opacity-50" />
                <div className="absolute w-48 h-48 border border-primary-500/30 rounded-full opacity-50" />
              </div>

              {/* Center Icon */}
              <div className="relative z-10 flex items-center justify-center py-20">
                <div className="w-32 h-32 bg-gradient-to-br from-primary-500 to-primary-400 rounded-full flex items-center justify-center shadow-2xl shadow-primary-500/30 animate-pulse">
                  <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>

              {/* Floating Location Pins */}
              <div className="absolute top-8 left-8 w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white shadow-lg animate-bounce" style={{ animationDelay: '0.1s' }}>
                <MapPinIcon />
              </div>
              <div className="absolute top-16 right-12 w-10 h-10 section-bg-secondary rounded-full flex items-center justify-center section-text-primary shadow-lg animate-bounce" style={{ animationDelay: '0.3s' }}>
                <MapPinIcon />
              </div>
              <div className="absolute bottom-16 left-16 w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white shadow-lg animate-bounce" style={{ animationDelay: '0.5s' }}>
                <MapPinIcon />
              </div>
              <div className="absolute bottom-8 right-8 w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white shadow-lg animate-bounce" style={{ animationDelay: '0.7s' }}>
                <MapPinIcon />
              </div>
            </div>
          </div>

          {/* Areas Tags */}
          <div>
            <h3 className="text-xl font-semibold section-text-primary mb-6">
              Service Locations
            </h3>
            <div className="flex flex-wrap gap-3">
              {content.areas.map((area, index) => {
                // Feature first 3 areas
                const isFeatured = index < 3;
                return (
                  <a
                    key={area.id}
                    href="#contato"
                    className={`group inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-medium transition-all duration-300 ${
                      isFeatured
                        ? 'bg-gradient-to-r from-primary-500 to-primary-400 text-white shadow-lg shadow-primary-500/20 hover:shadow-xl hover:shadow-primary-500/30 hover:-translate-y-0.5'
                        : 'section-bg-secondary section-text-secondary section-border border hover:border-primary-500/50 hover:text-primary-400 shadow-sm hover:shadow-md'
                    }`}
                  >
                    <MapPinIcon />
                    <span>{area.name}</span>
                    <span className={`text-xs ${isFeatured ? 'text-white/80' : 'section-text-secondary opacity-70'}`}>
                      {area.state}
                    </span>
                  </a>
                );
              })}
            </div>

            {/* Contact Link */}
            <div className="mt-8 pt-6 section-border border-t">
              <p className="section-text-secondary mb-4">
                Don't see your area? Contact us - we may still be able to help!
              </p>
              <a
                href={content.ctaLink}
                className="inline-flex items-center gap-2 section-text-accent font-semibold hover:opacity-80 transition-colors"
              >
                <span>{content.ctaText}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
