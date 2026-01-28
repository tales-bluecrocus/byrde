import Header from './components/Header';
import Hero from './components/Hero';
import FeaturedTestimonial from './components/FeaturedTestimonial';
import ServicesGrid from './components/ServicesGrid';
import MidPageCTA from './components/MidPageCTA';
import ServiceAreas from './components/ServiceAreas';
import TestimonialsGrid from './components/TestimonialsGrid';
import FAQ from './components/FAQ';
import FooterCTA from './components/FooterCTA';
import Footer from './components/Footer';
import SEO from './components/SEO';
import ThemeSidebar from './components/ThemeSidebar';
import ThemedSection from './components/ThemedSection';
import PaletteInjector from './components/PaletteInjector';
import { ToastProvider } from './components/Toast';
import { SectionThemeProvider } from './context/SectionThemeContext';
import { HeaderConfigProvider } from './context/HeaderConfigContext';
import { GlobalConfigProvider } from './context/GlobalConfigContext';
import { SidebarProvider, useSidebar } from './context/SidebarContext';
import { ContentProvider } from './context/ContentContext';
import { useSettings } from './hooks/useSettings';

const isDev = import.meta.env.DEV;

// Check if we should show the sidebar (editor mode)
function shouldShowSidebar(): boolean {
  if (isDev) return true;
  if (typeof window !== 'undefined' && (window as any).lakecityAdmin !== undefined) {
    return true;
  }
  return false;
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

// Floating phone button for mobile
function FloatingPhoneButton() {
  const settings = useSettings();
  return (
    <a
      href={`tel:${settings.phone_raw}`}
      className="sm:hidden fixed bottom-6 right-6 z-60 flex items-center justify-center w-14 h-14 btn-themed rounded-full shadow-xl shadow-black/30 transition-all duration-300 active:scale-95"
      aria-label={`Call ${settings.phone}`}
    >
      <PhoneIcon />
    </a>
  );
}

// Static home page layout
function StaticHomePage() {
  return (
    <main>
      <ThemedSection id="hero" index={0}>
        <Hero />
      </ThemedSection>
      <ThemedSection id="featured-testimonial" index={1}>
        <FeaturedTestimonial />
      </ThemedSection>
      <ThemedSection id="services" index={2}>
        <ServicesGrid />
      </ThemedSection>
      <ThemedSection id="mid-cta" index={3}>
        <MidPageCTA />
      </ThemedSection>
      <ThemedSection id="service-areas" index={4}>
        <ServiceAreas />
      </ThemedSection>
      <ThemedSection id="testimonials" index={5}>
        <TestimonialsGrid />
      </ThemedSection>
      <ThemedSection id="faq" index={6}>
        <FAQ />
      </ThemedSection>
    </main>
  );
}

// Layout without sidebar (production)
function ProductionLayout() {
  return (
    <>
      <SEO />
      <div
        className="min-h-screen"
        style={{ backgroundColor: 'var(--color-dark-950)' }}
      >
        <Header />
        <StaticHomePage />
        <ThemedSection id="footer-cta" index={98}>
          <FooterCTA />
        </ThemedSection>
        <ThemedSection id="footer" as="footer" index={99}>
          <Footer />
        </ThemedSection>
      </div>
      <FloatingPhoneButton />
    </>
  );
}

// Layout with sidebar (editor mode)
function EditorLayout() {
  const { isOpen, sidebarWidth } = useSidebar();

  return (
    <>
      <SEO />
      <div
        className="min-h-screen transition-all duration-300 ease-in-out"
        style={{
          backgroundColor: 'var(--color-dark-950)',
          marginLeft: isOpen ? `${sidebarWidth}px` : '0px',
        }}
      >
        <Header />
        <StaticHomePage />
        <ThemedSection id="footer-cta" index={98}>
          <FooterCTA />
        </ThemedSection>
        <ThemedSection id="footer" as="footer" index={99}>
          <Footer />
        </ThemedSection>
      </div>
      <FloatingPhoneButton />
      <ThemeSidebar />
    </>
  );
}

export default function App() {
  const showSidebar = shouldShowSidebar();

  const content = showSidebar ? <EditorLayout /> : <ProductionLayout />;

  return (
    <ToastProvider>
      <GlobalConfigProvider>
        <PaletteInjector />
        <HeaderConfigProvider>
          <SectionThemeProvider>
            <ContentProvider>
              {showSidebar ? (
                <SidebarProvider>{content}</SidebarProvider>
              ) : (
                content
              )}
            </ContentProvider>
          </SectionThemeProvider>
        </HeaderConfigProvider>
      </GlobalConfigProvider>
    </ToastProvider>
  );
}
