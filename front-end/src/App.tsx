import { useState, useEffect, useCallback, lazy, Suspense, type ComponentType } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ThemedSection from './components/ThemedSection';

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
import { useSettings } from './hooks/useSettings';
import { useScrollDepthTracking, useAdAttributionCapture } from './hooks/useAnalytics';
import { trackPhoneClick } from './lib/analytics';

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

const PhoneIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
    />
  </svg>
);

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

// Floating phone button for mobile
function FloatingPhoneButton() {
  const settings = useSettings();

  const handleClick = () => {
    trackPhoneClick('floating_button');
  };

  return (
    <a
      href={`tel:${settings.phone_raw}`}
      onClick={handleClick}
      className="sm:hidden fixed bottom-6 right-6 z-60 flex items-center justify-center w-14 h-14 btn-themed rounded-full shadow-xl shadow-black/30 transition-all duration-300 active:scale-95 phone-pulse"
      aria-label={`Call ${settings.phone}`}
    >
      <PhoneIcon />
    </a>
  );
}

// Dynamic home page layout - renders sections based on sectionOrder
function StaticHomePage() {
  const { sectionOrder } = useSectionTheme();

  return (
    <main>
      {sectionOrder.map((id, index) => {
        const Component = SECTION_COMPONENTS[id];
        if (!Component) return null;
        return (
          <ThemedSection key={id} id={id as SectionId} index={index}>
            <Suspense fallback={null}>
              <Component />
            </Suspense>
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
      <FloatingPhoneButton />
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
      <FloatingPhoneButton />
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
