import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
}

const siteData = {
  name: 'Lake City Hauling',
  tagline: 'Fast & Reliable Junk Removal Services',
  description: 'Voted Best Junk Removal in North Idaho. Same-day service, upfront pricing, 100% guarantee. Serving Coeur d\'Alene, Spokane & surrounding areas. Call (208) 998-0054.',
  url: 'https://lakecityhauling.com',
  phone: '+1-208-998-0054',
  address: {
    street: '1402 E Best Ave',
    city: "Coeur d'Alene",
    state: 'ID',
    postalCode: '83814',
    country: 'US',
  },
  geo: {
    latitude: 47.6777,
    longitude: -116.7805,
  },
  social: {
    facebook: 'https://web.facebook.com/lakecityhauling/',
    instagram: 'https://www.instagram.com/lakecityhauling/',
  },
};

// LocalBusiness Schema
const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: siteData.name,
  description: siteData.description,
  '@id': siteData.url,
  url: siteData.url,
  logo: `${siteData.url}/logo.png`,
  image: `${siteData.url}/og-image.jpg`,
  telephone: siteData.phone,
  priceRange: '$$',
  address: {
    '@type': 'PostalAddress',
    streetAddress: siteData.address.street,
    addressLocality: siteData.address.city,
    addressRegion: siteData.address.state,
    postalCode: siteData.address.postalCode,
    addressCountry: siteData.address.country,
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: siteData.geo.latitude,
    longitude: siteData.geo.longitude,
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '07:00',
      closes: '19:00',
    },
  ],
  sameAs: [
    siteData.social.facebook,
    siteData.social.instagram,
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '5.0',
    reviewCount: '50',
    bestRating: '5',
    worstRating: '1',
  },
  areaServed: [
    { '@type': 'City', name: "Coeur d'Alene", containedInPlace: { '@type': 'State', name: 'Idaho' } },
    { '@type': 'City', name: 'Spokane', containedInPlace: { '@type': 'State', name: 'Washington' } },
    { '@type': 'City', name: 'Spokane Valley', containedInPlace: { '@type': 'State', name: 'Washington' } },
    { '@type': 'City', name: 'Post Falls', containedInPlace: { '@type': 'State', name: 'Idaho' } },
    { '@type': 'City', name: 'Hayden', containedInPlace: { '@type': 'State', name: 'Idaho' } },
  ],
};

// Service Schema
const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Junk Removal & Hauling Services',
  description: 'Professional junk removal, demolition, estate cleanouts, and dumpster rentals in North Idaho and Spokane',
  provider: {
    '@type': 'LocalBusiness',
    name: siteData.name,
    url: siteData.url,
  },
  areaServed: {
    '@type': 'GeoCircle',
    geoMidpoint: {
      '@type': 'GeoCoordinates',
      latitude: siteData.geo.latitude,
      longitude: siteData.geo.longitude,
    },
    geoRadius: '50 mi',
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Services',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Junk Removal',
          description: 'We haul away furniture, appliances, and yard waste. You point, we make it disappear.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Demolition Services',
          description: 'Expert tear-down and removal of sheds, decks, hot tubs, mobile homes, and concrete.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Estate & Hoarder Cleanouts',
          description: 'Compassionate, discreet, and thorough cleanouts for estates, foreclosures, and hoarding.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Dumpster Rentals',
          description: 'Convenient 14, 15, and 20-yard dumpster rentals for your DIY clean-up projects.',
        },
      },
    ],
  },
  availableChannel: {
    '@type': 'ServiceChannel',
    serviceUrl: siteData.url,
    servicePhone: siteData.phone,
  },
};

// FAQ Schema
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Do you offer same-day junk removal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Yes. In Coeur d'Alene and surrounding areas, we often provide same-day or next-day service depending on the size of the job and scheduling availability. Our local crews are based nearby, which means we can respond quickly to urgent requests such as move-outs, estate cleanouts, or renovation debris. Call early in the day to secure same-day pickup.",
      },
    },
    {
      '@type': 'Question',
      name: 'How does pricing work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We provide upfront, firm quotes before any work begins. Pricing is based on the volume of items, labor required, and disposal fees. What we quote is what you pay unless the project scope changes. This transparency is especially important for homeowners and property managers in North Idaho who want predictable costs without hidden fees.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can you handle large estate or hoarder cleanouts?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Absolutely. We specialize in large-scale cleanouts, including estates, foreclosures, and hoarding situations in Spokane Valley. Our team is trained to work efficiently and respectfully, removing furniture, appliances, and accumulated items. We also prioritize donations and recycling, ensuring usable items benefit local charities while minimizing landfill waste.',
      },
    },
    {
      '@type': 'Question',
      name: 'What types of items will you haul away?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We remove a wide range of items including furniture, appliances, mattresses, yard waste, hot tubs, sheds, and construction debris. Hazardous materials like chemicals or paints are excluded, but nearly everything else can be hauled away. If you\'re unsure about a specific item, just ask and we\'ll confirm whether it qualifies for removal.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you recycle or donate items from cleanouts?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Whenever possible, we donate usable furniture, appliances, and household goods to local charities. We also recycle metals, wood, and other materials to reduce landfill impact. This eco-friendly approach is part of our commitment to the community and ensures your junk removal project is handled responsibly.',
      },
    },
  ],
};

// BreadcrumbList Schema
const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: siteData.url,
    },
  ],
};

export default function SEO({
  title = `${siteData.name} - ${siteData.tagline}`,
  description = siteData.description,
  canonical = siteData.url,
  ogImage = `${siteData.url}/og-image.jpg`,
}: SEOProps) {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Helper function to set/update meta tags
    const setMetaTag = (name: string, content: string, property = false) => {
      const attr = property ? 'property' : 'name';
      let element = document.querySelector(`meta[${attr}="${name}"]`);

      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }

      element.setAttribute('content', content);
    };

    // Basic SEO
    setMetaTag('description', description);
    setMetaTag('robots', 'index, follow');
    setMetaTag('author', siteData.name);
    setMetaTag('keywords', "junk removal, hauling, demolition, estate cleanout, dumpster rental, Coeur d'Alene, Spokane, North Idaho, junk hauling, trash removal");

    // Open Graph
    setMetaTag('og:title', title, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:image', ogImage, true);
    setMetaTag('og:url', canonical, true);
    setMetaTag('og:type', 'website', true);
    setMetaTag('og:site_name', siteData.name, true);
    setMetaTag('og:locale', 'en_US', true);

    // Twitter Card
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', title);
    setMetaTag('twitter:description', description);
    setMetaTag('twitter:image', ogImage);

    // Canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonical);

    // JSON-LD Structured Data
    const schemas = [localBusinessSchema, serviceSchema, faqSchema, breadcrumbSchema];

    // Remove existing schemas
    document.querySelectorAll('script[type="application/ld+json"]').forEach((el) => el.remove());

    // Add new schemas
    schemas.forEach((schema) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    });

    // Cleanup
    return () => {
      document.querySelectorAll('script[type="application/ld+json"]').forEach((el) => el.remove());
    };
  }, [title, description, canonical, ogImage]);

  return null;
}
