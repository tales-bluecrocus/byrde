import { useCallback, useEffect, useState } from 'react';
import { useSectionTheme } from '../context/SectionThemeContext';
import { useContent, type TestimonialItem } from '../context/ContentContext';
import { renderHeadline } from '../utils/renderHeadline';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const StarIcon = ({ filled = true }: { filled?: boolean }) => (
  <svg
    className={`w-4 h-4 ${filled ? 'text-yellow-400' : 'text-dark-600'}`}
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('');

function TestimonialCard({ testimonial, reviewLabel, className = '' }: { testimonial: TestimonialItem; reviewLabel: string; className?: string }) {
  return (
    <article
      className={`group section-bg-secondary rounded-2xl p-6 section-border border hover:border-opacity-70 shadow-sm hover:shadow-xl hover:shadow-black/20 transition-all duration-500 hover:-translate-y-1 ${className}`}
    >
      {/* Stars */}
      <div className="flex gap-0.5 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon key={star} filled={star <= testimonial.rating} />
        ))}
      </div>

      {/* Quote */}
      <blockquote className="mb-6">
        <p className="section-text-secondary leading-relaxed text-sm" style={{ color: 'var(--section-text-secondary, var(--color-gray-300))' }}>
          &ldquo;{testimonial.quote}&rdquo;
        </p>
      </blockquote>

      {/* Author */}
      <div className="flex items-center gap-3 pt-4 section-border border-t">
        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-400 rounded-full flex items-center justify-center text-white font-semibold text-sm">
          {getInitials(testimonial.authorName)}
        </div>
        <div>
          <p className="font-semibold section-text-primary text-sm">
            {testimonial.authorName}
          </p>
          <p className="section-text-secondary text-xs opacity-70">
            {testimonial.authorTitle || 'Verified Customer'}
          </p>
        </div>
      </div>

      {/* Google Badge */}
      <div className="mt-4 flex items-center gap-1.5 section-text-secondary text-xs opacity-70">
        <GoogleIcon />
        {reviewLabel}
      </div>
    </article>
  );
}

function TestimonialsSlider({ testimonials, reviewLabel }: { testimonials: TestimonialItem[]; reviewLabel: string }) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'start', slidesToScroll: 1 },
    [Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })]
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
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="flex-[0_0_100%] min-w-0 pl-6 md:flex-[0_0_50%] lg:flex-[0_0_33.333%]">
              <TestimonialCard testimonial={testimonial} reviewLabel={reviewLabel} className="h-full" />
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
          <ChevronLeft className="w-5 h-5" />
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
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default function TestimonialsGrid() {
  const { sectionThemes } = useSectionTheme();
  const { getContent } = useContent();
  const content = getContent('testimonials');
  const theme = sectionThemes['testimonials'] || {};
  const hasBgImage = !!theme.bgImage;

  const useSlider = content.testimonials.length > 3;

  return (
    <div id="reviews" className={`section-padding relative overflow-hidden ${hasBgImage ? '' : 'section-bg-primary'}`}>
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-primary-500/5 to-transparent opacity-50" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 opacity-50" style={{ background: 'linear-gradient(to top right, var(--section-bg-secondary, var(--color-dark-900)), transparent)' }} />
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
          <p className="section-text-secondary text-lg max-w-2xl mx-auto">
            {content.subheadline}
          </p>
        </div>

        {/* Testimonials: Grid or Slider */}
        {useSlider ? (
          <TestimonialsSlider testimonials={content.testimonials} reviewLabel={content.reviewLabel} />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.testimonials.map((testimonial) => (
              <TestimonialCard
                key={testimonial.id}
                testimonial={testimonial}
                reviewLabel={content.reviewLabel}
              />
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-12">
          <a
            href={content.ctaLink}
            className="inline-flex items-center gap-3 btn-section px-8 py-4 rounded-full font-semibold text-lg shadow-lg shadow-black/25"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {content.ctaText}
          </a>
        </div>
      </div>
    </div>
  );
}
