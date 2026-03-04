/**
 * Hero Component
 *
 * Main hero section with headline, benefits, trust badges, and contact form.
 * All content comes from ContentContext (editable via Theme Editor).
 */

import { useState, useMemo, useCallback, memo } from 'react';
import { useGlobalConfig } from '../context/GlobalConfigContext';
import { useSectionTheme } from '../context/SectionThemeContext';
import { useSectionPalette, resolveButtonColor } from '../hooks/useSectionPalette';
import { useContent, type BadgeIconType } from '../context/ContentContext';
import { renderColoredText } from '../utils/renderHeadline';
import { useSettings } from '../hooks/useSettings';
import { useFormTracking } from '../hooks/useAnalytics';
import { trackFormSubmitted, trackFormError, trackPhoneClick, getAttributionForSubmission } from '../lib/analytics';
import GoogleReviewBadge from './GoogleReviewBadge';
import { getContrastColor, lighten, generateBrandPalette } from '../utils/colorUtils';
import { getColorsForMode } from '../hooks/useSectionPalette';
import * as LucideIcons from 'lucide-react';

// ============================================
// STATIC VALUES (hoisted outside component)
// ============================================

// Dark mode fallback colors
const DARK_FALLBACKS = {
  bgPrimary: '#171717',
  bgSecondary: '#1f1f1f',
  bgTertiary: '#262626',
  textPrimary: '#efefef',
  textSecondary: '#a3a3a3',
  borderColor: '#333333',
} as const;

// Light mode fallback colors
const LIGHT_FALLBACKS = {
  bgPrimary: '#ffffff',
  bgSecondary: '#f8f8f8',
  bgTertiary: '#f0f0f0',
  textPrimary: '#2a2a2a',
  textSecondary: '#4b5563',
  borderColor: '#d4d4d4',
} as const;

// ============================================
// MEMOIZED ICON COMPONENTS
// ============================================

const CheckIcon = memo(({ color }: { color?: string }) => (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke={color || 'currentColor'} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
  </svg>
));
CheckIcon.displayName = 'CheckIcon';

const SpinnerIcon = memo(() => (
  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
));
SpinnerIcon.displayName = 'SpinnerIcon';

// Map badge icon IDs to Lucide icon component names
const BADGE_ICON_MAP: Record<string, keyof typeof LucideIcons> = {
  // Trust & Safety
  'shield': 'Shield',
  'shield-check': 'ShieldCheck',
  'lock': 'Lock',
  'key': 'Key',
  'badge': 'Badge',
  'badge-check': 'BadgeCheck',
  // Approval & Success
  'check': 'Check',
  'check-circle': 'CheckCircle',
  'circle-check': 'CircleCheck',
  'thumbs-up': 'ThumbsUp',
  'award': 'Award',
  'trophy': 'Trophy',
  'medal': 'Medal',
  // Ratings & Favorites
  'star': 'Star',
  'heart': 'Heart',
  'sparkles': 'Sparkles',
  'zap': 'Zap',
  // Time & Speed
  'clock': 'Clock',
  'timer': 'Timer',
  'calendar': 'Calendar',
  'hourglass': 'Hourglass',
  'rocket': 'Rocket',
  // Communication
  'phone': 'Phone',
  'phone-call': 'PhoneCall',
  'mail': 'Mail',
  'message-circle': 'MessageCircle',
  'headphones': 'Headphones',
  // Location & Navigation
  'map-pin': 'MapPin',
  'navigation': 'Navigation',
  'compass': 'Compass',
  'home': 'Home',
  'building': 'Building',
  // Services & Tools
  'truck': 'Truck',
  'package': 'Package',
  'box': 'Box',
  'wrench': 'Wrench',
  'hammer': 'Hammer',
  'tool': 'Drill',
  // People & Community
  'users': 'Users',
  'user-check': 'UserCheck',
  'handshake': 'Handshake',
  'smile': 'Smile',
  // Business & Finance
  'dollar-sign': 'DollarSign',
  'credit-card': 'CreditCard',
  'wallet': 'Wallet',
  'percent': 'Percent',
  'tag': 'Tag',
  // Nature & Environment
  'leaf': 'Leaf',
  'recycle': 'Recycle',
  'sun': 'Sun',
  'droplet': 'Droplet',
  // Misc
  'gift': 'Gift',
  'target': 'Target',
  'flag': 'Flag',
  'crown': 'Crown',
  'gem': 'Gem',
};

// Dynamic badge icon component
const BadgeIcon = memo(({ icon, color }: { icon: BadgeIconType; color?: string }) => {
  const iconName = BADGE_ICON_MAP[icon] || 'Shield';
  const IconComponent = LucideIcons[iconName] as React.ComponentType<{ className?: string; color?: string; strokeWidth?: number }>;

  if (!IconComponent) {
    return <LucideIcons.Shield className="w-8 h-8" color={color} strokeWidth={1.5} />;
  }

  return <IconComponent className="w-8 h-8" color={color} strokeWidth={1.5} />;
});
BadgeIcon.displayName = 'BadgeIcon';

// ============================================
// FORM TYPES
// ============================================

interface FormData {
  name: string;
  phone: string;
  email: string;
  message: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  email?: string;
}

const INITIAL_FORM_DATA: FormData = {
  name: '',
  phone: '',
  email: '',
  message: '',
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatPhone(value: string): string {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
  return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
}

function validateForm(formData: FormData): FormErrors {
  const errors: FormErrors = {};

  if (!formData.name.trim()) {
    errors.name = 'Name is required';
  } else if (!formData.name.trim().includes(' ')) {
    errors.name = 'Please include your last name';
  }

  if (!formData.phone.trim()) {
    errors.phone = 'Phone is required';
  } else if (formData.phone.replace(/\D/g, '').length < 10) {
    errors.phone = 'Invalid phone number';
  }

  if (!formData.email.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Invalid email';
  }

  return errors;
}

// ============================================
// MEMOIZED SUB-COMPONENTS
// ============================================

interface TrustBadgeProps {
  icon: BadgeIconType;
  label: string;
  sublabel: string;
  color: string;
  textColor: string;
}

const TrustBadge = memo(({ icon, label, sublabel, color, textColor }: TrustBadgeProps) => {
  return (
    <div className="flex items-center gap-2">
      <BadgeIcon icon={icon} color={color} />
      <span className="text-sm leading-tight" style={{ color: textColor }}>
        {label}<br/>{sublabel}
      </span>
    </div>
  );
});
TrustBadge.displayName = 'TrustBadge';

interface BenefitItemProps {
  benefit: string;
  index: number;
  accentColor: string;
  textColor: string;
}

const BenefitItem = memo(({ benefit, index, accentColor, textColor }: BenefitItemProps) => (
  <li
    className="flex items-center gap-3 opacity-0 animate-[slide-right_0.6s_ease-out_forwards]"
    style={{ animationDelay: `${0.4 + index * 0.1}s` }}
  >
    <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: `${accentColor}33` }}>
      <CheckIcon color={accentColor} />
    </div>
    <span className="font-medium" style={{ color: textColor }}>{renderColoredText(benefit)}</span>
  </li>
));
BenefitItem.displayName = 'BenefitItem';

// ============================================
// MAIN COMPONENT
// ============================================

export default function Hero() {
  const { globalConfig } = useGlobalConfig();
  const { sectionThemes } = useSectionTheme();
  const palette = useSectionPalette('hero');
  const { getContent } = useContent();
  const settings = useSettings();
  const content = getContent('hero');
  const heroTheme = sectionThemes['hero'] || {};

  // Form tracking
  const formTracking = useFormTracking({
    formName: 'hero_contact_form',
    formLocation: 'hero',
  });

  // Form state
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Memoized theme calculations
  const themeStyles = useMemo(() => {
    // Effective mode: section paletteMode > page mode
    const effectiveMode = heroTheme.paletteMode || globalConfig.brand.mode;
    const isLightMode = effectiveMode === 'light';

    const accentColor = heroTheme.accentSource === 'accent' ? palette.accent[500] : palette.primary[500];
    const overlayColor = palette.background.primary;
    const textPrimary = palette.text.primary;
    const textSecondary = palette.text.secondary;

    // Form mode: independent from section mode when formPaletteMode is set
    const formMode = heroTheme.formPaletteMode || effectiveMode;
    const formModeOverridden = formMode !== effectiveMode;
    const formFallbacks = formMode === 'light' ? LIGHT_FALLBACKS : DARK_FALLBACKS;

    // Generate form-specific palette when form mode differs from section mode
    let formPalette = palette;
    if (formModeOverridden) {
      const colors = getColorsForMode(globalConfig.brand, formMode);
      formPalette = generateBrandPalette(colors.primary, colors.accent, formMode, colors.text);
    }

    // Section-level colors (hero text, benefits, etc.)
    const borderColor = palette.border;

    // Form card colors — form-specific overrides take highest priority, then form mode, then section
    const cardBgColor = heroTheme.formBg
      || (formModeOverridden ? formFallbacks.bgSecondary : undefined)
      || palette.background.secondary;
    const formBorderColor = heroTheme.formBorder
      || (formModeOverridden ? formFallbacks.borderColor : undefined)
      || borderColor;
    const formTextPrimary = heroTheme.formText
      || (formModeOverridden ? formFallbacks.textPrimary : undefined)
      || textPrimary;
    const formTextSecondary = heroTheme.formTextSecondary
      || (formModeOverridden ? formFallbacks.textSecondary : undefined)
      || textSecondary;

    const formConfig = globalConfig.form;
    const formAccentColor = heroTheme.formAccent
      || (formModeOverridden ? formPalette.primary[500] : undefined)
      || accentColor;

    const inputBg = heroTheme.formBg
      ? lighten(heroTheme.formBg, 3)
      : (formModeOverridden
        ? formFallbacks.bgTertiary
        : (formConfig.inputBg || palette.background.tertiary));
    const inputBorder = heroTheme.formBorder
      || (formModeOverridden ? formFallbacks.borderColor : undefined)
      || (formConfig.inputBorder || palette.border);
    const inputText = heroTheme.formText
      || (formModeOverridden ? formFallbacks.textPrimary : undefined)
      || (formConfig.inputText || palette.text.primary);
    const inputFocusBorder = heroTheme.formAccent
      || (formModeOverridden ? formPalette.primary[500] : undefined)
      || (formConfig.inputFocusBorder || palette.primary[500]);
    const labelColor = heroTheme.formTextSecondary
      || (formModeOverridden ? formFallbacks.textSecondary : undefined)
      || (formConfig.labelColor || palette.text.secondary);
    const defaultButtonColor = resolveButtonColor(heroTheme.buttonStyle, globalConfig.brand, palette.primary[500], effectiveMode as 'dark' | 'light');
    const buttonBg = heroTheme.formAccent || formConfig.buttonBg || defaultButtonColor;
    const buttonHoverBg = lighten(buttonBg, 15);

    const hasBgImage = !!heroTheme.bgImage;
    const bgImageOpacity = heroTheme.bgImageOpacity ?? 0.5;
    const bgImageOverlayColor = heroTheme.bgImageOverlayColor || overlayColor;

    return {
      isLightMode,
      isFormLightMode: formMode === 'light',
      hasBgImage,
      accentColor,
      formAccentColor,
      overlayColor,
      cardBgColor,
      borderColor,
      formBorderColor,
      formTextPrimary,
      formTextSecondary,
      textPrimary,
      textSecondary,
      inputBg,
      inputBorder,
      inputText,
      inputFocusBorder,
      labelColor,
      buttonBg,
      buttonHoverBg,
      bgImageOpacity,
      bgImageOverlayColor,
      bgImageUrl: heroTheme.bgImage || '',
      bgImageSize: heroTheme.bgImageSize || 'cover',
      bgImagePosition: heroTheme.bgImagePosition || 'center',
    };
  }, [heroTheme, globalConfig, palette]);

  // Form handlers
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Track form start on first interaction
    formTracking.trackStart();

    if (name === 'phone') {
      setFormData(prev => ({ ...prev, [name]: formatPhone(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  }, [errors, formTracking]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (value.trim()) {
      formTracking.trackFieldComplete(name);
    }
  }, [formTracking]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Track validation errors
      Object.keys(validationErrors).forEach((field) => {
        trackFormError('hero_contact_form', 'validation_error', field);
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Run fetch and a minimum delay in parallel so the user always
      // sees the "Sending..." state for at least 1.5s
      const [response] = await Promise.all([
        fetch(`${settings.apiUrl}/contact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            service: content.formDefaultService || 'junk-removal',
            _honeypot: (document.getElementById('byrde_hp') as HTMLInputElement)?.value || '',
            attribution: getAttributionForSubmission(),
          }),
        }),
        new Promise((r) => setTimeout(r, 1500)),
      ]);

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Submission failed');
      }

      // Track successful submission
      trackFormSubmitted('hero_contact_form', 'hero', {
        service: content.formDefaultService || 'junk-removal',
      });

      setIsSuccess(true);
      setFormData(INITIAL_FORM_DATA);

      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error) {
      trackFormError('hero_contact_form', 'submission_error');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData]);

  // Hero badge (above headline) and trust badge visibility
  const heroBadgeText = content.heroBadgeText || 'Fully Insured. Peace of Mind.';
  const showHeroBadge = content.showHeroBadge ?? true;
  const showBadge1 = content.showBadge1 ?? true;
  const showBadge2 = content.showBadge2 ?? true;

  // Mobile marquee items (benefits + badges combined into scrolling pills)
  const marqueeItems = useMemo(() => {
    const items: { key: string; text: string; isRating?: boolean }[] = [];
    const b = content.benefits?.length ? content.benefits : [];
    b.forEach((text, i) => items.push({ key: `b${i}`, text }));
    if (settings.google_rating) {
      items.push({ key: 'gr', text: `${settings.google_rating} ★ ${settings.google_reviews_count || ''} Reviews`, isRating: true });
    }
    if (showBadge1 && content.badge1Label) items.push({ key: 'tb1', text: content.badge1Label });
    if (showBadge2 && content.badge2Label) items.push({ key: 'tb2', text: content.badge2Label });
    return items;
  }, [content, settings.google_rating, settings.google_reviews_count, showBadge1, showBadge2]);

  return (
    <div className={`section-padding relative overflow-hidden ${themeStyles.hasBgImage ? '' : 'section-bg-primary'}`}>
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${themeStyles.bgImageUrl})`,
          backgroundSize: themeStyles.bgImageSize,
          backgroundPosition: themeStyles.bgImagePosition,
        }}
      />

      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{
          opacity: themeStyles.hasBgImage
            ? (1 - themeStyles.bgImageOpacity)
            : (themeStyles.isLightMode ? 0.92 : 0.85),
          background: themeStyles.hasBgImage
            ? themeStyles.bgImageOverlayColor
            : `linear-gradient(to right, ${themeStyles.overlayColor} 0%, ${themeStyles.overlayColor} 50%, transparent 100%)`
        }}
      />

      {/* Accent Gradient */}
      <div className="absolute inset-0" style={{ background: `linear-gradient(to left, ${themeStyles.accentColor}10, transparent 60%)` }} />

      {/* Decorative Shapes */}
      <div className="absolute top-40 left-10 w-72 h-72 rounded-full blur-3xl" style={{ backgroundColor: `${themeStyles.accentColor}1a` }} />
      <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: `${themeStyles.accentColor}0d` }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-20 lg:items-center">
          {/* Left Content */}
          <div className="min-w-0 opacity-0 animate-[slide-right_0.8s_ease-out_0.2s_forwards]">
            {/* Hero Badge (above headline) */}
            {showHeroBadge && (
              <div
                className="inline-flex items-center gap-2 section-text-accent px-4 py-2 rounded-full text-sm font-semibold mb-6"
                style={{ backgroundColor: `${themeStyles.accentColor}33`, borderWidth: '1px', borderColor: `${themeStyles.accentColor}4d` }}
              >
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: themeStyles.accentColor }} />
                {renderColoredText(heroBadgeText)}
              </div>
            )}

            {/* Heading */}
            <h1 className="font-[var(--font-display)] text-4xl sm:text-5xl lg:text-6xl font-bold section-text-primary leading-[1.1] mb-6">
              {renderColoredText(content.headline)}
            </h1>

            {/* Subheadline */}
            <p className="text-lg mb-6" style={{ color: themeStyles.textSecondary }}>
              {renderColoredText(content.subheadline)}
            </p>

            {/* Mobile: Infinite scrolling marquee (benefits + trust badges) */}
            <div
              className="lg:hidden overflow-hidden mb-4"
              style={{
                maskImage: 'linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)',
                WebkitMaskImage: 'linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)',
              }}
            >
              <div
                className="flex w-max"
                style={{ animation: 'marquee 25s linear infinite' }}
              >
                {[0, 1].map((setIdx) => (
                  <div key={setIdx} className="flex shrink-0">
                    {marqueeItems.map((item) => (
                      <div
                        key={`${setIdx}-${item.key}`}
                        className="flex items-center gap-1.5 shrink-0 mx-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap"
                        style={{
                          backgroundColor: `${themeStyles.accentColor}1a`,
                          color: themeStyles.textSecondary,
                        }}
                      >
                        {item.isRating ? (
                          <svg className="w-3.5 h-3.5 shrink-0" fill="#facc15" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke={themeStyles.accentColor} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        {item.text}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Benefits (desktop only) */}
            {content.benefits?.length ? (
              <ul className="hidden lg:block space-y-4 mb-8">
                {content.benefits.map((benefit, index) => (
                  <BenefitItem
                    key={benefit}
                    benefit={benefit}
                    index={index}
                    accentColor={themeStyles.accentColor}
                    textColor={themeStyles.textSecondary}
                  />
                ))}
              </ul>
            ) : null}

            {/* Trust Badges (desktop only) */}
            <div className="hidden lg:flex flex-wrap items-center gap-6 pt-6 border-t" style={{ borderColor: themeStyles.borderColor }}>
              <GoogleReviewBadge variant="full" />
              {showBadge1 && (
                <>
                  <div className="w-px h-10" style={{ backgroundColor: themeStyles.borderColor }} />
                  <TrustBadge
                    icon={content.badge1Icon}
                    label={content.badge1Label}
                    sublabel={content.badge1Sublabel}
                    color={themeStyles.accentColor}
                    textColor={themeStyles.textSecondary}
                  />
                </>
              )}
              {showBadge2 && (
                <>
                  <div className="w-px h-10" style={{ backgroundColor: themeStyles.borderColor }} />
                  <TrustBadge
                    icon={content.badge2Icon}
                    label={content.badge2Label}
                    sublabel={content.badge2Sublabel}
                    color={themeStyles.accentColor}
                    textColor={themeStyles.textSecondary}
                  />
                </>
              )}
            </div>
          </div>

          {/* Right - Contact Form */}
          <div className="opacity-0 animate-[slide-up_0.8s_ease-out_0.4s_forwards]">
            <div className="relative">
              {/* Floating Card Effect */}
              <div className="absolute -inset-4 rounded-3xl blur-2xl opacity-60" style={{ background: `linear-gradient(to right, ${themeStyles.formAccentColor}33, ${themeStyles.formAccentColor}1a, ${themeStyles.formAccentColor}33)` }} />

              <div
                className="relative backdrop-blur-sm rounded-2xl shadow-2xl p-8 border"
                style={{
                  backgroundColor: themeStyles.cardBgColor,
                  borderColor: themeStyles.formBorderColor,
                  '--section-text-primary': themeStyles.formTextPrimary,
                  '--section-text-secondary': themeStyles.formTextSecondary,
                  boxShadow: themeStyles.isFormLightMode ? '0 25px 50px -12px rgba(0, 0, 0, 0.15)' : '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                } as React.CSSProperties}
              >
                {/* Form Header */}
                <div className="text-center mb-8">
                  <h2 className="font-[var(--font-display)] text-2xl font-bold section-text-primary mb-2">
                    {renderColoredText(content.formTitle || 'Fill Out This Form for Your Free Estimate')}
                  </h2>
                  <p className="section-text-secondary text-sm mb-4">
                    {renderColoredText(content.formSubtitle || "We'll get back to you within 30 minutes")}
                  </p>
                  {/* Quick Call CTA for phone-preferring users */}
                  {settings.phone_raw && (
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <span style={{ color: themeStyles.formTextSecondary }}>Or call now:</span>
                      <a
                        href={`tel:${settings.phone_raw}`}
                        onClick={() => trackPhoneClick('hero_form_header')}
                        className="text-lg font-semibold hover:underline transition-colors"
                        style={{ color: themeStyles.formAccentColor }}
                      >
                        {settings.phone}
                      </a>
                    </div>
                  )}
                </div>

                {isSuccess ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${themeStyles.formAccentColor}33` }}>
                      <svg className="w-8 h-8" fill="none" stroke={themeStyles.formAccentColor} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold section-text-primary mb-2">Request Sent!</h3>
                    <p className="section-text-secondary">We'll contact you shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Honeypot - hidden from humans */}
                    <label htmlFor="byrde_hp" className="sr-only">Leave this empty</label>
                    <input
                      type="text"
                      id="byrde_hp"
                      name="_honeypot"
                      tabIndex={-1}
                      autoComplete="off"
                      aria-hidden="true"
                      style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, width: 0 }}
                    />
                    {/* Name */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-1.5" style={{ color: themeStyles.labelColor }}>
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="w-full px-4 py-3 rounded-xl border transition-all duration-100 outline-none focus:ring-2 focus:ring-offset-1"
                        style={{
                          backgroundColor: errors.name ? 'rgba(239, 68, 68, 0.1)' : themeStyles.inputBg,
                          borderColor: errors.name ? '#ef4444' : themeStyles.inputBorder,
                          color: themeStyles.inputText,
                          '--tw-ring-color': `${themeStyles.inputFocusBorder}33`,
                        } as React.CSSProperties}
                        placeholder="Full Name"
                      />
                      {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                    </div>

                    {/* Phone & Email */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium mb-1.5" style={{ color: themeStyles.labelColor }}>
                          Phone
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className="w-full px-4 py-3 rounded-xl border transition-all duration-100 outline-none focus:ring-2 focus:ring-offset-1"
                          style={{
                            backgroundColor: errors.phone ? 'rgba(239, 68, 68, 0.1)' : themeStyles.inputBg,
                            borderColor: errors.phone ? '#ef4444' : themeStyles.inputBorder,
                            color: themeStyles.inputText,
                            '--tw-ring-color': `${themeStyles.inputFocusBorder}33`,
                          } as React.CSSProperties}
                          placeholder="Phone"
                        />
                        {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-1.5" style={{ color: themeStyles.labelColor }}>
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className="w-full px-4 py-3 rounded-xl border transition-all duration-100 outline-none focus:ring-2 focus:ring-offset-1"
                          style={{
                            backgroundColor: errors.email ? 'rgba(239, 68, 68, 0.1)' : themeStyles.inputBg,
                            borderColor: errors.email ? '#ef4444' : themeStyles.inputBorder,
                            color: themeStyles.inputText,
                            '--tw-ring-color': `${themeStyles.inputFocusBorder}33`,
                          } as React.CSSProperties}
                          placeholder="Email"
                        />
                        {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium mb-1.5" style={{ color: themeStyles.labelColor }}>
                        Message <span style={{ color: themeStyles.formTextSecondary, opacity: 0.7 }}>(optional)</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border transition-all duration-300 outline-none resize-none focus:ring-2"
                        style={{
                          backgroundColor: themeStyles.inputBg,
                          borderColor: themeStyles.inputBorder,
                          color: themeStyles.inputText,
                          '--tw-ring-color': `${themeStyles.inputFocusBorder}33`,
                        } as React.CSSProperties}
                        placeholder="Message"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-themed w-full py-4 rounded-xl font-semibold text-lg shadow-lg shadow-black/25"
                      style={globalConfig.form.buttonBg ? {
                        backgroundColor: themeStyles.buttonBg,
                        color: getContrastColor(themeStyles.buttonBg),
                      } : undefined}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <SpinnerIcon />
                          Sending...
                        </span>
                      ) : (
                        content.formSubmitText || 'Get My Free Quote'
                      )}
                    </button>

                    {/* Privacy Note */}
                    <p className="text-center text-xs opacity-60" style={{ color: themeStyles.formTextSecondary }}>
                      By submitting, you agree to our{' '}
                      <a href={settings.privacy_policy_url} className="hover:underline" style={{ color: themeStyles.formAccentColor }}>
                        Privacy Policy
                      </a>
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
