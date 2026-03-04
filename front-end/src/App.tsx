import { useState, useEffect, useCallback, lazy, Suspense, type ComponentType } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ThemedSection from './components/ThemedSection';
import LazyMount from './components/LazyMount';

// Below-fold sections — lazy-loaded to reduce initial bundle size.
const FeaturedTestimonial = lazy(() => import('./components/FeaturedTestimonial'));
const ServicesGrid = lazy(() => import('./components/ServicesGrid'));
const MidPageCTA = lazy(() => import('./components/MidPageCTA'));
const ServiceAreas = lazy(() => import('./components/ServiceAreas'));
const TestimonialsGrid = lazy(() => import('./components/TestimonialsGrid'));
const FAQ = lazy(() => import('./components/FAQ'));
const FooterCTA = lazy(() => import('./components/FooterCTA'));
const Footer = lazy(() => import('./components/Footer'));
import PaletteInjector from './components/PaletteInjector';
import { ToastProvider } from './components/Toast';
import { SectionThemeProvider, useSectionTheme, type SectionId } from './context/SectionThemeContext';
import { HeaderConfigProvider } from './context/HeaderConfigContext';
import { GlobalConfigProvider } from './context/GlobalConfigContext';
import { SidebarProvider, useSidebar } from './context/SidebarContext';
import { ContentProvider } from './context/ContentContext';
import { SettingsProvider } from './context/SettingsContext';
import { useScrollDepthTracking, useAdAttributionCapture } from './hooks/useAnalytics';

// Map section IDs to their components
const SECTION_COMPONENTS: Record<string, ComponentType> = {
  'hero': Hero,
  'featured-testimonial': FeaturedTestimonial,
  'services': ServicesGrid,
  'mid-cta': MidPageCTA,
  'service-areas': ServiceAreas,
  'testimonials': TestimonialsGrid,
  'faq': FAQ,
  'footer-cta': FooterCTA,
};

interface AppProps {
  /** Pass the ThemeEditor component from editor entry point. Omit for production. */
  Editor?: ComponentType;
}

// Scroll to top button
function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 left-6 sm:left-auto sm:bottom-8 sm:right-8 z-50 flex items-center justify-center w-11 h-11 rounded-full bg-zinc-800 border border-zinc-600 text-zinc-300 hover:bg-zinc-700 hover:text-white hover:border-zinc-500 transition-all duration-300 active:scale-90 shadow-xl shadow-black/40"
      aria-label="Scroll to top"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
      </svg>
    </button>
  );
}

// Floating phone button for mobile — rendered by Header component
// (needs access to header button color context)

// Dynamic home page layout - renders sections based on sectionOrder
function StaticHomePage() {
  const { sectionOrder } = useSectionTheme();

  return (
    <main>
      {sectionOrder.map((id, index) => {
        const Component = SECTION_COMPONENTS[id];
        if (!Component) return null;

        // Hero renders immediately; below-fold sections defer until near viewport
        const isEager = id === 'hero';

        return (
          <ThemedSection key={id} id={id as SectionId} index={index}>
            {isEager ? (
              <Component />
            ) : (
              <LazyMount>
                <Suspense fallback={null}>
                  <Component />
                </Suspense>
              </LazyMount>
            )}
          </ThemedSection>
        );
      })}
    </main>
  );
}

// Layout without sidebar (production)
function ProductionLayout() {
  // Capture UTM/GCLID/FBCLID on page load for ad attribution
  useAdAttributionCapture();

  // Enable scroll depth tracking for analytics
  useScrollDepthTracking();

  return (
    <>
      <div
        className="min-h-screen"
        style={{ backgroundColor: 'var(--color-dark-950)' }}
      >
        <Header />
        <StaticHomePage />
        <Suspense fallback={null}>
          <ThemedSection id="footer" as="footer" index={99}>
            <Footer />
          </ThemedSection>
        </Suspense>
      </div>

      <ScrollToTopButton />
    </>
  );
}

// Layout with sidebar (editor mode)
function EditorLayout({ Editor }: { Editor: ComponentType }) {
  const { isOpen, totalWidth } = useSidebar();

  // Prevent all link navigation in editor mode to avoid editor-within-editor
  const handleClick = useCallback((e: React.MouseEvent) => {
    const target = (e.target as HTMLElement).closest('a');
    if (!target) return;

    // Allow links inside the editor sidebar (z-50+)
    const editorPanel = (e.target as HTMLElement).closest('[class*="z-50"], [class*="z-[51]"]');
    if (editorPanel) return;

    e.preventDefault();
    e.stopPropagation();
  }, []);

  return (
    <>
      <div
        className="min-h-screen transition-all duration-300 ease-in-out"
        onClick={handleClick}
        style={{
          backgroundColor: 'var(--color-dark-950)',
          marginLeft: isOpen ? `${totalWidth}px` : '0px',
        }}
      >
        <Header />
        <StaticHomePage />
        <Suspense fallback={null}>
          <ThemedSection id="footer" as="footer" index={99}>
            <Footer />
          </ThemedSection>
        </Suspense>
      </div>

      <ScrollToTopButton />
      <Editor />
    </>
  );
}

export default function App({ Editor }: AppProps) {
  return (
    <ToastProvider>
      <SettingsProvider>
        <GlobalConfigProvider>
          <PaletteInjector />
          <HeaderConfigProvider>
            <SectionThemeProvider>
              <ContentProvider>
                {Editor ? (
                  <SidebarProvider>
                    <EditorLayout Editor={Editor} />
                  </SidebarProvider>
                ) : (
                  <ProductionLayout />
                )}
              </ContentProvider>
            </SectionThemeProvider>
          </HeaderConfigProvider>
        </GlobalConfigProvider>
      </SettingsProvider>
    </ToastProvider>
  );
}
