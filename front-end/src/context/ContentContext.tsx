import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { SectionId } from './SectionThemeContext';
import { migrateHeadline } from '../utils/renderHeadline';

// ============================================
// CONTENT TYPES FOR EACH SECTION
// ============================================

// Available icons for trust badges - comprehensive list
export type BadgeIconType =
  // Trust & Safety
  | 'shield' | 'shield-check' | 'lock' | 'key' | 'badge' | 'badge-check'
  // Approval & Success
  | 'check' | 'check-circle' | 'circle-check' | 'thumbs-up' | 'award' | 'trophy' | 'medal'
  // Ratings & Favorites
  | 'star' | 'heart' | 'sparkles' | 'zap'
  // Time & Speed
  | 'clock' | 'timer' | 'calendar' | 'hourglass' | 'rocket'
  // Communication
  | 'phone' | 'phone-call' | 'mail' | 'message-circle' | 'headphones'
  // Location & Navigation
  | 'map-pin' | 'navigation' | 'compass' | 'home' | 'building'
  // Services & Tools
  | 'truck' | 'package' | 'box' | 'wrench' | 'hammer' | 'tool'
  // People & Community
  | 'users' | 'user-check' | 'handshake' | 'smile'
  // Business & Finance
  | 'dollar-sign' | 'credit-card' | 'wallet' | 'percent' | 'tag'
  // Nature & Environment
  | 'leaf' | 'recycle' | 'sun' | 'droplet'
  // Misc
  | 'gift' | 'target' | 'flag' | 'crown' | 'gem';

export interface HeroContent {
  headline: string;
  subheadline: string;
  ctaText: string;
  ctaLink: string;
  // Benefits list (bullet points)
  benefits: string[];
  // Contact form texts
  formTitle: string;
  formSubtitle: string;
  formSubmitText: string;
  formDefaultService: string;
  // Hero badge (above headline)
  heroBadgeText: string;
  showHeroBadge: boolean;
  // Trust badges (below benefits list)
  badge1Icon: BadgeIconType;
  badge1Label: string;
  badge1Sublabel: string;
  showBadge1: boolean;
  badge2Icon: BadgeIconType;
  badge2Label: string;
  badge2Sublabel: string;
  showBadge2: boolean;
}

export interface FeaturedTestimonialContent {
  badgeText: string;
  verifiedText: string;
  quote: string;
  authorName: string;
  authorTitle: string;
  rating: number;
  ctaText: string;
  ctaLink: string;
}

export interface ServiceItem {
  id: string;
  icon: string; // Lucide icon name or custom SVG
  iconType: 'lucide' | 'image'; // Icon source type
  iconImage?: string; // WordPress media URL (when iconType is 'image')
  title: string;
  description: string;
}

export interface ServicesContent {
  badgeText: string; // Small uppercase text above heading
  headline: string; // Use <strong> for accent color
  subheadline: string;
  services: ServiceItem[];
}

export interface FeatureItem {
  id: string;
  icon: string; // Lucide icon name
  text: string;
}

export interface MidCtaContent {
  badge: string;
  headline: string;
  subheadline: string;
  ctaText: string;
  ctaLink: string;
  features: FeatureItem[];
}

export interface AreaItem {
  id: string;
  name: string;
  state: string;
  highlighted: boolean;
}

export interface ServiceAreasContent {
  badgeText: string;
  headline: string; // Use <strong> for accent color
  subheadline: string;
  locationsHeading: string;
  missingAreaText: string;
  areas: AreaItem[];
  ctaText: string;
  ctaLink: string;
}

export interface TestimonialItem {
  id: string;
  quote: string;
  authorName: string;
  authorTitle?: string; // e.g., "Verified Customer", "Business Owner"
  rating: number;
}

export interface TestimonialsContent {
  badgeText: string;
  headline: string; // Use <strong> for accent color
  subheadline: string;
  reviewLabel: string;
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
  badgeText: string;
  headline: string; // Use <strong> for accent color
  subheadline: string;
  contactTitle: string;
  contactDescription: string;
  contactCtaText: string;
  contactCtaLink: string;
  faqs: FaqItem[];
}

export interface FooterCtaContent {
  headline: string; // Use <strong> for accent color
  subheadline: string;
  reassuranceText: string;
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
  // Benefits
  benefits: [
    'Fully Licensed & Insured Pros',
    'Same-Day Services Available',
    'Locally Owned & Operated',
    'Honest & Upfront Pricing',
  ],
  // Contact form
  formTitle: 'Fill Out This Form for Your Free Estimate',
  formSubtitle: "We'll get back to you within 30 minutes",
  formSubmitText: 'Get My Free Quote',
  formDefaultService: 'junk-removal',
  // Hero badge
  heroBadgeText: 'Fully Insured. Peace of Mind.',
  showHeroBadge: true,
  // Trust badges
  badge1Icon: 'shield',
  badge1Label: 'Fully Insured',
  badge1Sublabel: 'Peace of Mind',
  showBadge1: true,
  badge2Icon: 'clock',
  badge2Label: 'Same-Day',
  badge2Sublabel: 'Service Available',
  showBadge2: true,
};

const DEFAULT_FEATURED_TESTIMONIAL_CONTENT: FeaturedTestimonialContent = {
  badgeText: 'Featured Review',
  verifiedText: 'Verified Google Review',
  quote: '"Great bunch of hard working guys. I had a 100 year old shed that had a roof which fell in 30 years ago. It was full of unknown junk. The gave me a fair quote. They showed up the next day and he and his team leveled the shed. They loaded up everything and charged me what we had agreed to."',
  authorName: 'Joshua Smith',
  authorTitle: 'Verified Customer',
  rating: 5,
  ctaText: 'Call For Reliable Junk Removal',
  ctaLink: 'tel:2089980054',
};

const DEFAULT_SERVICES_CONTENT: ServicesContent = {
  badgeText: 'Full-Service Junk Removal & More',
  headline: 'Full-Service <strong>Junk Removal & More</strong>',
  subheadline: 'From household clutter to light demolition, we have the heavy equipment and manpower to handle any job safely, efficiently, and professionally.',
  services: [
    { id: '1', icon: 'trash', iconType: 'lucide', title: 'Junk Removal', description: 'Full-service junk removal for homes, offices, and construction sites.' },
    { id: '2', icon: 'home', iconType: 'lucide', title: 'Estate Cleanouts', description: 'Compassionate estate and foreclosure cleanout services.' },
    { id: '3', icon: 'building', iconType: 'lucide', title: 'Commercial Services', description: 'Reliable commercial waste removal and recycling solutions.' },
    { id: '4', icon: 'truck', iconType: 'lucide', title: 'Dumpster Rentals', description: 'Convenient 14, 15, and 20-yard dumpster rentals for your DIY clean-up projects.' },
  ],
};

const DEFAULT_MID_CTA_CONTENT: MidCtaContent = {
  badge: 'Ready to Clear the Clutter?',
  headline: 'Get Your Free Quote Today',
  subheadline: 'Fast response, fair pricing, and professional service. We make junk removal easy.',
  ctaText: 'Call Now',
  ctaLink: 'tel:2089980054',
  features: [
    { id: '1', icon: 'ShieldCheck', text: 'Free Estimates' },
    { id: '2', icon: 'Clock', text: 'Same-Day Service' },
    { id: '3', icon: 'CheckCircle', text: 'Upfront Pricing' },
  ],
};

const DEFAULT_SERVICE_AREAS_CONTENT: ServiceAreasContent = {
  badgeText: 'Areas We Serve',
  headline: 'Serving <strong>North Idaho</strong>',
  subheadline: 'Professional junk removal across the region.',
  locationsHeading: 'Service Locations',
  missingAreaText: "Don't see your area? Contact us - we may still be able to help!",
  areas: [
    { id: '1', name: "Coeur d'Alene", state: 'ID', highlighted: true },
    { id: '2', name: 'Post Falls', state: 'ID', highlighted: true },
    { id: '3', name: 'Hayden', state: 'ID', highlighted: true },
    { id: '4', name: 'Rathdrum', state: 'ID', highlighted: false },
    { id: '5', name: 'Sandpoint', state: 'ID', highlighted: false },
    { id: '6', name: 'Harrison', state: 'ID', highlighted: false },
    { id: '7', name: 'Athol', state: 'ID', highlighted: false },
  ],
  ctaText: 'Get Service In Your Area',
  ctaLink: 'tel:2089980054',
};

const DEFAULT_TESTIMONIALS_CONTENT: TestimonialsContent = {
  badgeText: 'Testimonials',
  headline: 'Trusted By <strong>Your Neighbors</strong>',
  subheadline: 'See why homeowners consistently love our fast response, fair pricing, and spotless results.',
  reviewLabel: 'Google Review',
  testimonials: [
    { id: '1', quote: 'Caleb and team did an excellent job at removing all the stuff from my duplex.', authorName: 'Sharene May', rating: 5 },
    { id: '2', quote: 'Byrde made everything so easy for me. Caleb is a great guy.', authorName: 'Brady Coker', rating: 5 },
    { id: '3', quote: "Byrde is the only hauling company I'll use.", authorName: 'Makaila Wallace', rating: 5 },
  ],
  ctaText: 'Call To Get Started',
  ctaLink: 'tel:2089980054',
};

const DEFAULT_FAQ_CONTENT: FaqContent = {
  badgeText: 'Frequently Asked Questions',
  headline: 'Clear answers to <strong>common concerns</strong>',
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
  headline: 'Ready to <strong>Clear the Clutter?</strong>',
  subheadline: 'Get your free quote today. Fast response, fair pricing, professional service.',
  reassuranceText: 'No obligation \u00b7 Free estimates \u00b7 Fast response',
  ctaText: 'Call For Free Quote',
  ctaLink: 'tel:2089980054',
};

const DEFAULT_FOOTER_CONTENT: FooterContent = {
  description: 'Fast, reliable junk removal services in North Idaho and Spokane. Licensed, insured, and locally owned.',
  copyright: '\u00a9 2024 Byrde. All rights reserved.',
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
// MIGRATION (backward compat with old data)
// ============================================

/**
 * Migrate old content format to new format.
 * Handles: headline+highlightText → single headline with <strong>,
 * features string[] → FeatureItem[], areas without highlighted, etc.
 */
function migrateContent(raw: Record<string, unknown>): Record<string, unknown> {
  const content = { ...raw };

  // Helper to migrate headline+highlightText → single headline
  const migrateSection = (key: string) => {
    const section = content[key] as Record<string, unknown> | undefined;
    if (!section) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = section as any;
    if (s.highlightText && typeof s.headline === 'string') {
      s.headline = migrateHeadline(s.headline, s.highlightText);
      delete s.highlightText;
    }
  };

  // Migrate headlines for all sections that used highlightText
  migrateSection('services');
  migrateSection('service-areas');
  migrateSection('testimonials');
  migrateSection('faq');
  migrateSection('footer-cta');

  // Migrate mid-cta features: string[] → FeatureItem[]
  const midCta = content['mid-cta'] as Record<string, unknown> | undefined;
  if (midCta?.features && Array.isArray(midCta.features) && midCta.features.length > 0) {
    if (typeof midCta.features[0] === 'string') {
      const defaultIcons = ['ShieldCheck', 'Clock', 'CheckCircle'];
      midCta.features = (midCta.features as string[]).map((text, i) => ({
        id: String(i + 1),
        icon: defaultIcons[i] || 'CheckCircle',
        text,
      }));
    }
  }

  // Migrate service-areas: add highlighted if missing
  const serviceAreas = content['service-areas'] as Record<string, unknown> | undefined;
  if (serviceAreas?.areas && Array.isArray(serviceAreas.areas)) {
    serviceAreas.areas = (serviceAreas.areas as Record<string, unknown>[]).map((area, i) => ({
      ...area,
      highlighted: area.highlighted ?? (i < 3),
    }));
  }

  return content;
}

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
  replaceAllContent: (content: Record<ContentSectionId, SectionContent>) => void;
}

const ContentContext = createContext<ContentContextType | null>(null);

// Load initial content from PHP injection or defaults
function loadContent(): Record<ContentSectionId, SectionContent> {
  // Check for PHP-injected content (public pages)
  if (typeof window !== 'undefined' && window.byrdeContent) {
    const migrated = migrateContent(window.byrdeContent as Record<string, unknown>);
    return { ...DEFAULT_CONTENT, ...migrated } as Record<ContentSectionId, SectionContent>;
  }
  return { ...DEFAULT_CONTENT };
}

export function ContentProvider({ children }: { children: ReactNode }) {
  const [sectionContent, setSectionContent] = useState<Record<ContentSectionId, SectionContent>>(loadContent);

  // Fetch content from API when in editor mode
  useEffect(() => {
    const wpAdmin = window.byrdeAdmin;
    if (!wpAdmin?.pageId || !wpAdmin?.apiUrl) return;

    const fetchContent = async () => {
      try {
        const response = await fetch(`${wpAdmin.apiUrl}/pages/${wpAdmin.pageId}/content`, {
          headers: { 'X-WP-Nonce': wpAdmin.nonce },
        });

        // Check response status BEFORE parsing JSON
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${response.statusText}. ${errorText}`);
        }

        const data = await response.json();

        if (data.success) {
          if (data.content) {
            const migrated = migrateContent(data.content as Record<string, unknown>);
            setSectionContent(prev => ({ ...prev, ...migrated } as Record<ContentSectionId, SectionContent>));
          }
          // content: null means new page with no saved content — keep defaults
        } else {
          throw new Error('Invalid response format from server');
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

  const replaceAllContent = useCallback((content: Record<ContentSectionId, SectionContent>) => {
    setSectionContent(content);
  }, []);

  return (
    <ContentContext.Provider
      value={{
        sectionContent,
        updateSectionContent,
        resetSectionContent,
        getContent,
        replaceAllContent,
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
