import Header from './components/Header';
import Hero from './components/Hero';
import FeaturedTestimonial from './components/FeaturedTestimonial';
import ServicesGrid from './components/ServicesGrid';
import MidPageCTA from './components/MidPageCTA';
import ServiceAreas from './components/ServiceAreas';
import TestimonialsGrid from './components/TestimonialsGrid';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import SEO from './components/SEO';
import ThemeSidebar from './components/ThemeSidebar';
import ThemedSection from './components/ThemedSection';
import PaletteInjector from './components/PaletteInjector';
import { ToastProvider } from './components/Toast';
import { SectionThemeProvider } from './context/SectionThemeContext';
import { HeaderConfigProvider } from './context/HeaderConfigContext';
import { GlobalConfigProvider } from './context/GlobalConfigContext';

const isDev = import.meta.env.DEV;

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

export default function App() {
  return (
    <ToastProvider>
    <GlobalConfigProvider>
    <PaletteInjector />
    <HeaderConfigProvider>
    <SectionThemeProvider>
      <SEO />
      <div className="min-h-screen" style={{ backgroundColor: 'var(--color-dark-950)' }}>
        <Header />
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
        <ThemedSection id="footer" as="footer" index={7}>
          <Footer />
        </ThemedSection>
      </div>

      {/* Floating Phone Button - Mobile Only */}
      <a
        href="tel:2089980054"
        className="sm:hidden fixed bottom-6 right-6 z-60 flex items-center justify-center w-14 h-14 btn-themed rounded-full shadow-xl shadow-black/30 transition-all duration-300 active:scale-95"
        aria-label="Call (208) 998-0054"
      >
        <PhoneIcon />
      </a>

      {isDev && <ThemeSidebar />}
    </SectionThemeProvider>
    </HeaderConfigProvider>
    </GlobalConfigProvider>
    </ToastProvider>
  );
}
