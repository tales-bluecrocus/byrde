import { useState } from 'react';
import { useSectionTheme } from '../context/SectionThemeContext';
import { useContent } from '../context/ContentContext';
import { renderHeadline, renderHeadlineStyled } from '../utils/renderHeadline';

const ChevronIcon = ({ isOpen, color }: { isOpen: boolean; color?: string }) => (
  <svg
    className={`w-5 h-5 ${color ? '' : 'text-primary-500'} transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    style={color ? { color } : undefined}
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { sectionThemes } = useSectionTheme();
  const { getContent } = useContent();
  const content = getContent('faq');
  const theme = sectionThemes['faq'] || {};
  const hasBgImage = !!theme.bgImage;

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div id="faq" className={`section-padding relative overflow-hidden ${hasBgImage ? '' : 'section-bg-primary'}`}>
      {/* Background Decorations */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-72 h-72 section-bg-secondary rounded-full blur-3xl opacity-50" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Left Content */}
          <div className="lg:sticky lg:top-32">
            <span
              className="inline-block section-text-accent font-semibold text-sm uppercase tracking-wider mb-4"
              style={theme.faqBadgeColor ? { color: theme.faqBadgeColor } : undefined}
            >
              {content.badgeText}
            </span>
            <h2
              className="font-[var(--font-display)] text-3xl sm:text-4xl lg:text-5xl font-bold section-text-primary mb-6"
              style={theme.faqHeadlineColor ? { color: theme.faqHeadlineColor } : undefined}
            >
              {theme.faqHeadlineAccent
                ? renderHeadlineStyled(content.headline, { color: theme.faqHeadlineAccent })
                : renderHeadline(content.headline, 'section-text-accent')}
            </h2>
            <p
              className="section-text-secondary text-lg mb-8"
              style={theme.faqSubheadlineColor ? { color: theme.faqSubheadlineColor } : undefined}
            >
              {content.subheadline}
            </p>

            {/* Contact Card */}
            <div className="section-bg-secondary rounded-2xl p-6 section-border border shadow-sm">
              <h3 className="font-semibold section-text-primary mb-2">
                {content.contactTitle}
              </h3>
              <p className="section-text-secondary text-sm mb-4">
                {content.contactDescription}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={content.contactCtaLink}
                  className="inline-flex items-center justify-center gap-2 btn-section px-4 py-2.5 rounded-lg font-medium text-sm transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {content.contactCtaText}
                </a>
              </div>
            </div>
          </div>

          {/* Right - Accordion */}
          <div className="space-y-4">
            {content.faqs.map((faq, index) => (
              <div
                key={faq.id}
                className={`${theme.faqItemBg ? '' : 'section-bg-secondary'} rounded-xl border transition-all duration-300 ${
                  openIndex === index
                    ? `${theme.faqItemBorder ? '' : 'border-primary-500/30'} shadow-lg shadow-primary-500/5`
                    : `${theme.faqItemBorder ? '' : 'section-border'} shadow-sm hover:border-opacity-70`
                }`}
                style={{
                  ...(theme.faqItemBg ? { backgroundColor: theme.faqItemBg } : {}),
                  ...(theme.faqItemBorder ? { borderColor: theme.faqItemBorder } : {}),
                }}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between p-6 text-left cursor-pointer"
                  aria-expanded={openIndex === index}
                >
                  <span
                    className="font-semibold section-text-primary pr-4"
                    style={theme.faqQuestionColor ? { color: theme.faqQuestionColor } : undefined}
                  >
                    {faq.question}
                  </span>
                  <ChevronIcon isOpen={openIndex === index} color={theme.faqIconColor} />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openIndex === index ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  <div className="px-6 pb-6 pt-0">
                    <p
                      className="section-text-secondary leading-relaxed [&_a]:text-primary-500 [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:opacity-80"
                      style={theme.faqAnswerColor ? { color: theme.faqAnswerColor } : undefined}
                      dangerouslySetInnerHTML={{ __html: faq.answer }}
                    />
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
