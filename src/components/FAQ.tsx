import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'Do you offer same-day junk removal?',
    answer: "Yes. In Coeur d'Alene and surrounding areas, we often provide same-day or next-day service depending on the size of the job and scheduling availability. Our local crews are based nearby, which means we can respond quickly to urgent requests such as move-outs, estate cleanouts, or renovation debris. Call early in the day to secure same-day pickup.",
  },
  {
    question: 'How does pricing work?',
    answer: 'We provide upfront, firm quotes before any work begins. Pricing is based on the volume of items, labor required, and disposal fees. What we quote is what you pay unless the project scope changes. This transparency is especially important for homeowners and property managers in North Idaho who want predictable costs without hidden fees.',
  },
  {
    question: 'Can you handle large estate or hoarder cleanouts?',
    answer: 'Absolutely. We specialize in large-scale cleanouts, including estates, foreclosures, and hoarding situations in Spokane Valley. Our team is trained to work efficiently and respectfully, removing furniture, appliances, and accumulated items. We also prioritize donations and recycling, ensuring usable items benefit local charities while minimizing landfill waste.',
  },
  {
    question: 'What types of items will you haul away?',
    answer: 'We remove a wide range of items including furniture, appliances, mattresses, yard waste, hot tubs, sheds, and construction debris. Hazardous materials like chemicals or paints are excluded, but nearly everything else can be hauled away. If you\'re unsure about a specific item, just ask and we\'ll confirm whether it qualifies for removal.',
  },
  {
    question: 'Do you recycle or donate items from cleanouts?',
    answer: 'Yes. Whenever possible, we donate usable furniture, appliances, and household goods to local charities. We also recycle metals, wood, and other materials to reduce landfill impact. This eco-friendly approach is part of our commitment to the community and ensures your junk removal project is handled responsibly.',
  },
];

const ChevronIcon = ({ isOpen }: { isOpen: boolean }) => (
  <svg
    className={`w-5 h-5 text-primary-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div id="faq" className="py-24 section-bg-primary relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-72 h-72 section-bg-secondary rounded-full blur-3xl opacity-50" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Left Content */}
          <div className="lg:sticky lg:top-32">
            <span className="inline-block section-text-accent font-semibold text-sm uppercase tracking-wider mb-4">
              Frequently Asked Questions
            </span>
            <h2 className="font-[var(--font-display)] text-3xl sm:text-4xl lg:text-5xl font-bold section-text-primary mb-6">
              Clear answers to{' '}
              <span className="text-primary-500">
                common concerns
              </span>
            </h2>
            <p className="section-text-secondary text-lg mb-8">
              Clear answers to common concerns so you can book with confidence.
            </p>

            {/* Contact Card */}
            <div className="section-bg-secondary rounded-2xl p-6 section-border border shadow-sm">
              <h3 className="font-semibold section-text-primary mb-2">
                Still have questions?
              </h3>
              <p className="section-text-secondary text-sm mb-4">
                Our team is ready to help. Give us a call and we'll answer any questions you have.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="tel:2089980054"
                  className="inline-flex items-center justify-center gap-2 btn-section px-4 py-2.5 rounded-lg font-medium text-sm transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  (208) 998-0054
                </a>
              </div>
            </div>
          </div>

          {/* Right - Accordion */}
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`section-bg-secondary rounded-xl border transition-all duration-300 ${
                  openIndex === index
                    ? 'border-primary-500/30 shadow-lg shadow-primary-500/5'
                    : 'section-border shadow-sm hover:border-opacity-70'
                }`}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between p-6 text-left"
                  aria-expanded={openIndex === index}
                >
                  <span className="font-semibold section-text-primary pr-4">
                    {faq.question}
                  </span>
                  <ChevronIcon isOpen={openIndex === index} />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openIndex === index ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  <div className="px-6 pb-6 pt-0">
                    <p className="section-text-secondary leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
