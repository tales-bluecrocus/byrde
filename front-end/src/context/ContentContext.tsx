import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { SectionId } from './SectionThemeContext';

// ============================================
// CONTENT TYPES FOR EACH SECTION
// ============================================

// Available icons for trust badges
export type BadgeIconType = 'shield' | 'clock' | 'check' | 'star' | 'truck' | 'phone' | 'map-pin' | 'award' | 'thumbs-up' | 'heart';

export interface HeroContent {
  headline: string;
  subheadline: string;
  ctaText: string;
  ctaLink: string;
  badge1Icon: BadgeIconType;
  badge1Label: string;
  badge1Sublabel: string;
  badge2Icon: BadgeIconType;
  badge2Label: string;
  badge2Sublabel: string;
}

export interface FeaturedTestimonialContent {
  quote: string;
  authorName: string;
  authorTitle: string;
  rating: number;
  ctaText: string;
  ctaLink: string;
}

export interface ServiceItem {
  id: string;
  icon: string; // Icon identifier
  title: string;
  description: string;
}

export interface ServicesContent {
  headline: string;
  highlightText: string;
  subheadline: string;
  services: ServiceItem[];
}

export interface MidCtaContent {
  badge: string;
  headline: string;
  subheadline: string;
  ctaText: string;
  ctaLink: string;
  features: string[];
}

export interface AreaItem {
  id: string;
  name: string;
  state: string;
}

export interface ServiceAreasContent {
  headline: string;
  highlightText: string;
  subheadline: string;
  areas: AreaItem[];
  ctaText: string;
  ctaLink: string;
}

export interface TestimonialItem {
  id: string;
  quote: string;
  authorName: string;
  rating: number;
}

export interface TestimonialsContent {
  headline: string;
  highlightText: string;
  subheadline: string;
  testimonials: TestimonialItem[];
  ctaText: string;
  ctaLink: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface FaqContent {
  headline: string;
  highlightText: string;
  subheadline: string;
  contactTitle: string;
  contactDescription: string;
  contactCtaText: string;
  contactCtaLink: string;
  faqs: FaqItem[];
}

export interface FooterCtaContent {
  headline: string;
  highlightText: string;
  subheadline: string;
  ctaText: string;
  ctaLink: string;
}

export interface FooterContent {
  description: string;
  copyright: string;
  privacyLabel: string;
  privacyLink: string;
  termsLabel: string;
  termsLink: string;
  cookieLabel: string;
  cookieLink: string;
}

// Union type for all content types
export type SectionContent =
  | HeroContent
  | FeaturedTestimonialContent
  | ServicesContent
  | MidCtaContent
  | ServiceAreasContent
  | TestimonialsContent
  | FaqContent
  | FooterCtaContent
  | FooterContent;

// Type mapping for each section
export type SectionContentMap = {
  hero: HeroContent;
  'featured-testimonial': FeaturedTestimonialContent;
  services: ServicesContent;
  'mid-cta': MidCtaContent;
  'service-areas': ServiceAreasContent;
  testimonials: TestimonialsContent;
  faq: FaqContent;
  'footer-cta': FooterCtaContent;
  footer: FooterContent;
};

// Content-enabled sections (excludes topheader and header)
export type ContentSectionId = keyof SectionContentMap;

// ============================================
// DEFAULT CONTENT
// ============================================

const DEFAULT_HERO_CONTENT: HeroContent = {
  headline: 'Fast & Reliable Junk Removal',
  subheadline: 'Professional junk removal services in North Idaho and Spokane. Licensed, insured, and locally owned.',
  ctaText: 'Call For Free Quote',
  ctaLink: 'tel:2089980054',
  badge1Icon: 'shield',
  badge1Label: 'Fully Insured',
  badge1Sublabel: 'Peace of Mind',
  badge2Icon: 'clock',
  badge2Label: 'Same-Day',
  badge2Sublabel: 'Service Available',
};

const DEFAULT_FEATURED_TESTIMONIAL_CONTENT: FeaturedTestimonialContent = {
  quote: '"Great bunch of hard working guys. I had a 100 year old shed that had a roof which fell in 30 years ago. It was full of unknown junk. The gave me a fair quote. They showed up the next day and he and his team leveled the shed. They loaded up everything and charged me what we had agreed to."',
  authorName: 'Joshua Smith',
  authorTitle: 'Verified Customer',
  rating: 5,
  ctaText: 'Call For Reliable Junk Removal',
  ctaLink: 'tel:2089980054',
};

const DEFAULT_SERVICES_CONTENT: ServicesContent = {
  headline: 'Our',
  highlightText: 'Services',
  subheadline: 'Comprehensive solutions for all your junk removal and hauling needs.',
  services: [
    { id: '1', icon: 'trash', title: 'Junk Removal', description: 'Full-service junk removal for homes, offices, and construction sites.' },
    { id: '2', icon: 'home', title: 'Estate Cleanouts', description: 'Compassionate estate and foreclosure cleanout services.' },
    { id: '3', icon: 'building', title: 'Commercial Services', description: 'Reliable commercial waste removal and recycling solutions.' },
    { id: '4', icon: 'truck', title: 'Dumpster Rentals', description: 'Convenient 14, 15, and 20-yard dumpster rentals for your DIY clean-up projects.' },
  ],
};

const DEFAULT_MID_CTA_CONTENT: MidCtaContent = {
  badge: 'Ready to Clear the Clutter?',
  headline: 'Get Your Free Quote Today',
  subheadline: 'Fast response, fair pricing, and professional service. We make junk removal easy.',
  ctaText: 'Call Now',
  ctaLink: 'tel:2089980054',
  features: ['Free Estimates', 'Same-Day Service', 'Upfront Pricing'],
};

const DEFAULT_SERVICE_AREAS_CONTENT: ServiceAreasContent = {
  headline: 'Serving',
  highlightText: 'North Idaho',
  subheadline: 'Professional junk removal across the region.',
  areas: [
    { id: '1', name: "Coeur d'Alene", state: 'ID' },
    { id: '2', name: 'Post Falls', state: 'ID' },
    { id: '3', name: 'Hayden', state: 'ID' },
    { id: '4', name: 'Rathdrum', state: 'ID' },
    { id: '5', name: 'Sandpoint', state: 'ID' },
    { id: '6', name: 'Harrison', state: 'ID' },
    { id: '7', name: 'Athol', state: 'ID' },
  ],
  ctaText: 'Get Service In Your Area',
  ctaLink: 'tel:2089980054',
};

const DEFAULT_TESTIMONIALS_CONTENT: TestimonialsContent = {
  headline: 'Trusted By',
  highlightText: 'Your Neighbors',
  subheadline: 'See why homeowners consistently love our fast response, fair pricing, and spotless results.',
  testimonials: [
    { id: '1', quote: 'Caleb and team did an excellent job at removing all the stuff from my duplex.', authorName: 'Sharene May', rating: 5 },
    { id: '2', quote: 'Lake City Hauling made everything so easy for me. Caleb is a great guy.', authorName: 'Brady Coker', rating: 5 },
    { id: '3', quote: "Lake city Hauling is the only hauling company I'll use.", authorName: 'Makaila Wallace', rating: 5 },
  ],
  ctaText: 'Call To Get Started',
  ctaLink: 'tel:2089980054',
};

const DEFAULT_FAQ_CONTENT: FaqContent = {
  headline: 'Clear answers to',
  highlightText: 'common concerns',
  subheadline: 'Clear answers to common concerns so you can book with confidence.',
  contactTitle: 'Still have questions?',
  contactDescription: 'Our team is ready to help. Give us a call and we\'ll answer any questions you have.',
  contactCtaText: '(208) 998-0054',
  contactCtaLink: 'tel:2089980054',
  faqs: [
    { id: '1', question: 'Do you offer same-day junk removal?', answer: 'Yes. We often provide same-day or next-day service depending on scheduling availability.' },
    { id: '2', question: 'How does pricing work?', answer: 'We provide upfront, firm quotes before any work begins.' },
    { id: '3', question: 'Can you handle large estate or hoarder cleanouts?', answer: 'Absolutely. We specialize in large-scale cleanouts.' },
  ],
};

const DEFAULT_FOOTER_CTA_CONTENT: FooterCtaContent = {
  headline: 'Ready to',
  highlightText: 'Clear the Clutter?',
  subheadline: 'Get your free quote today. Fast response, fair pricing, professional service.',
  ctaText: 'Call For Free Quote',
  ctaLink: 'tel:2089980054',
};

const DEFAULT_FOOTER_CONTENT: FooterContent = {
  description: 'Fast, reliable junk removal services in North Idaho and Spokane. Licensed, insured, and locally owned.',
  copyright: '© 2024 Lake City Hauling. All rights reserved.',
  privacyLabel: 'Privacy Policy',
  privacyLink: '/privacy',
  termsLabel: 'Terms & Conditions',
  termsLink: '/terms',
  cookieLabel: 'Cookie Settings',
  cookieLink: '#cookies',
};

const DEFAULT_CONTENT: Record<ContentSectionId, SectionContent> = {
  hero: DEFAULT_HERO_CONTENT,
  'featured-testimonial': DEFAULT_FEATURED_TESTIMONIAL_CONTENT,
  services: DEFAULT_SERVICES_CONTENT,
  'mid-cta': DEFAULT_MID_CTA_CONTENT,
  'service-areas': DEFAULT_SERVICE_AREAS_CONTENT,
  testimonials: DEFAULT_TESTIMONIALS_CONTENT,
  faq: DEFAULT_FAQ_CONTENT,
  'footer-cta': DEFAULT_FOOTER_CTA_CONTENT,
  footer: DEFAULT_FOOTER_CONTENT,
};

// ============================================
// CONTEXT
// ============================================

interface ContentContextType {
  sectionContent: Record<ContentSectionId, SectionContent>;
  updateSectionContent: <T extends ContentSectionId>(
    sectionId: T,
    content: Partial<SectionContentMap[T]>
  ) => void;
  resetSectionContent: (sectionId: ContentSectionId) => void;
  getContent: <T extends ContentSectionId>(sectionId: T) => SectionContentMap[T];
}

const ContentContext = createContext<ContentContextType | null>(null);

// Load initial content from PHP injection or defaults
function loadContent(): Record<ContentSectionId, SectionContent> {
  // Check for PHP-injected content (public pages)
  if (typeof window !== 'undefined' && (window as any).lakecityContent) {
    return { ...DEFAULT_CONTENT, ...(window as any).lakecityContent };
  }
  return { ...DEFAULT_CONTENT };
}

export function ContentProvider({ children }: { children: ReactNode }) {
  const [sectionContent, setSectionContent] = useState<Record<ContentSectionId, SectionContent>>(loadContent);

  // Fetch content from API when in editor mode
  useEffect(() => {
    const wpAdmin = (window as any).lakecityAdmin;
    if (!wpAdmin?.pageId || !wpAdmin?.apiUrl) return;

    const fetchContent = async () => {
      try {
        const response = await fetch(`${wpAdmin.apiUrl}/pages/${wpAdmin.pageId}/content`, {
          headers: { 'X-WP-Nonce': wpAdmin.nonce },
        });
        const data = await response.json();

        if (data.success && data.content) {
          setSectionContent(prev => ({ ...prev, ...data.content }));
        }
      } catch (error) {
        console.error('[ContentContext] Failed to fetch content:', error);
      }
    };

    fetchContent();
  }, []);

  const updateSectionContent = useCallback(<T extends ContentSectionId>(
    sectionId: T,
    content: Partial<SectionContentMap[T]>
  ) => {
    setSectionContent(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        ...content,
      },
    }));
  }, []);

  const resetSectionContent = useCallback((sectionId: ContentSectionId) => {
    setSectionContent(prev => ({
      ...prev,
      [sectionId]: DEFAULT_CONTENT[sectionId],
    }));
  }, []);

  const getContent = useCallback(<T extends ContentSectionId>(sectionId: T): SectionContentMap[T] => {
    return (sectionContent[sectionId] || DEFAULT_CONTENT[sectionId]) as SectionContentMap[T];
  }, [sectionContent]);

  return (
    <ContentContext.Provider
      value={{
        sectionContent,
        updateSectionContent,
        resetSectionContent,
        getContent,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
}

// Helper to check if a section has content editing
export function hasContentEditor(sectionId: SectionId): sectionId is ContentSectionId {
  return sectionId !== 'topheader' && sectionId !== 'header';
}
