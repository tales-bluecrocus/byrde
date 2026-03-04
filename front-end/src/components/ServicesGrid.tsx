import { memo, useCallback, useEffect, useState } from 'react';
import { useSectionTheme } from '../context/SectionThemeContext';
import { useContent, type ServiceItem } from '../context/ContentContext';
import { renderColoredText } from '../utils/renderHeadline';
import * as LucideIcons from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

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

function ServiceCard({ service, className = '' }: { service: ServiceItem; className?: string }) {
  return (
    <article
      className={`group relative section-bg-secondary rounded-2xl p-8 section-border border hover:border-opacity-70 shadow-sm hover:shadow-xl hover:shadow-black/20 transition-all duration-500 hover:-translate-y-1 ${className}`}
    >
      {/* Hover Gradient */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-500/5 via-transparent to-primary-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative">
        {/* Icon */}
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg"
          style={{ backgroundColor: 'var(--section-button-bg)', color: 'var(--section-button-text)' }}
        >
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
  );
}

function ServicesSlider({ services }: { services: ServiceItem[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'start', slidesToScroll: 1 },
    [Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: true })]
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    onSelect();
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi]);

  return (
    <div className="relative">
      {/* Carousel */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex -ml-6">
          {services.map((service) => (
            <div key={service.id} className="flex-[0_0_100%] min-w-0 pl-6 md:flex-[0_0_50%] lg:flex-[0_0_33.333%]">
              <ServiceCard service={service} className="h-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <button
          onClick={scrollPrev}
          className="w-10 h-10 rounded-full section-bg-secondary section-border border flex items-center justify-center section-text-secondary hover:text-primary-400 hover:border-primary-500/50 transition-colors"
          aria-label="Previous"
        >
          <LucideIcons.ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex gap-2">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                index === selectedIndex
                  ? 'bg-primary-500 w-8'
                  : 'bg-dark-600 hover:bg-dark-500'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <button
          onClick={scrollNext}
          className="w-10 h-10 rounded-full section-bg-secondary section-border border flex items-center justify-center section-text-secondary hover:text-primary-400 hover:border-primary-500/50 transition-colors"
          aria-label="Next"
        >
          <LucideIcons.ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default function ServicesGrid() {
  const { sectionThemes } = useSectionTheme();
  const { getContent } = useContent();
  const content = getContent('services');
  const theme = sectionThemes['services'] || {};
  const hasBgImage = !!theme.bgImage;

  const count = content.services.length;
  const useSlider = count > 6;

  // Grid layout logic
  const getGridClass = () => {
    if (count === 4) return 'grid md:grid-cols-2 gap-8';
    if (count === 5) return 'grid md:grid-cols-2 lg:grid-cols-6 gap-8';
    return 'grid md:grid-cols-2 lg:grid-cols-3 gap-8';
  };

  const getCardClass = (index: number) => {
    if (count === 5) return index < 2 ? 'lg:col-span-3' : 'lg:col-span-2';
    return '';
  };

  return (
    <div id="services" className={`section-padding relative ${hasBgImage ? '' : 'section-bg-primary'}`}>
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
            {renderColoredText(content.headline)}
          </h2>
          <p className="section-text-secondary text-lg max-w-3xl mx-auto">
            {renderColoredText(content.subheadline)}
          </p>
        </div>

        {/* Services: Grid or Slider */}
        {useSlider ? (
          <ServicesSlider services={content.services} />
        ) : (
          <div className={getGridClass()}>
            {content.services.map((service, index) => (
              <ServiceCard
                key={service.id}
                service={service}
                className={getCardClass(index)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
