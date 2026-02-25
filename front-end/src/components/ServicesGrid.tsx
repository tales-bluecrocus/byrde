import { memo } from 'react';
import { useSectionTheme } from '../context/SectionThemeContext';
import { useContent, type ServiceItem } from '../context/ContentContext';
import { renderHeadline } from '../utils/renderHeadline';
import * as LucideIcons from 'lucide-react';

// Map of legacy icon names → Lucide component names
const LEGACY_ICON_MAP: Record<string, keyof typeof LucideIcons> = {
  trash: 'Trash2',
  demolition: 'Hammer',
  home: 'Home',
  building: 'Building',
  truck: 'Truck',
  box: 'Box',
  package: 'Package',
  wrench: 'Wrench',
  hammer: 'Hammer',
  recycle: 'RefreshCw',
  leaf: 'Leaf',
};

// Render icon based on type
const ServiceIcon = memo(({ service }: { service: ServiceItem }) => {
  // Image from WordPress media
  if (service.iconType === 'image' && service.iconImage) {
    return <img src={service.iconImage} alt="" className="w-8 h-8 object-contain" />;
  }

  // Lucide icon (default)
  const iconName = LEGACY_ICON_MAP[service.icon] || service.icon;
  // Try exact match first, then PascalCase
  const Component = (LucideIcons as Record<string, unknown>)[iconName] as React.ComponentType<{ className?: string; strokeWidth?: number }> | undefined;

  if (Component) {
    return <Component className="w-8 h-8" strokeWidth={1.5} />;
  }

  // Fallback
  return <LucideIcons.Wrench className="w-8 h-8" strokeWidth={1.5} />;
});
ServiceIcon.displayName = 'ServiceIcon';

export default function ServicesGrid() {
  const { sectionThemes } = useSectionTheme();
  const { getContent } = useContent();
  const content = getContent('services');
  const theme = sectionThemes['services'] || {};
  const hasBgImage = !!theme.bgImage;

  const count = content.services.length;

  // Grid classes: for 5 items, use a 6-col grid so we can do 2 (span-3 each) + 3 (span-2 each)
  const useBalancedGrid = count === 5;

  return (
    <div id="services" className={`py-24 relative ${hasBgImage ? '' : 'section-bg-primary'}`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block section-text-accent font-semibold text-sm uppercase tracking-wider mb-4">
            {content.badgeText}
          </span>
          <h2 className="font-[var(--font-display)] text-3xl sm:text-4xl lg:text-5xl font-bold section-text-primary mb-6">
            {renderHeadline(content.headline, 'section-text-accent')}
          </h2>
          <p className="section-text-secondary text-lg max-w-3xl mx-auto">
            {content.subheadline}
          </p>
        </div>

        {/* Services Grid */}
        <div className={
          useBalancedGrid
            ? 'grid md:grid-cols-2 lg:grid-cols-6 gap-8'
            : 'grid md:grid-cols-2 lg:grid-cols-3 gap-8'
        }>
          {content.services.map((service, index) => (
            <article
              key={service.id}
              className={`group relative section-bg-secondary rounded-2xl p-8 section-border border hover:border-opacity-70 shadow-sm hover:shadow-xl hover:shadow-black/20 transition-all duration-500 hover:-translate-y-1 ${
                useBalancedGrid
                  ? index < 2
                    ? 'lg:col-span-3'
                    : 'lg:col-span-2'
                  : ''
              }`}
            >
              {/* Hover Gradient */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-500/5 via-transparent to-primary-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative">
                {/* Icon */}
                <div className="w-14 h-14 bg-primary-500 rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary-500/20">
                  <ServiceIcon service={service} />
                </div>

                {/* Title */}
                <h3 className="font-[var(--font-display)] text-xl font-bold section-text-primary mb-3 group-hover:text-primary-400 transition-colors duration-300">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="section-text-secondary leading-relaxed">
                  {service.description}
                </p>
              </div>

              {/* Corner Decoration */}
              <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden rounded-tr-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/10 to-transparent transform rotate-45 translate-x-16 -translate-y-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
