import { useState } from 'react';
import { useGlobalConfig } from '../context/GlobalConfigContext';
import { useSectionTheme } from '../context/SectionThemeContext';
import { useContent, type BadgeIconType } from '../context/ContentContext';
import GoogleReviewBadge from './GoogleReviewBadge';
import { getContrastColor, lighten } from '../utils/colorUtils';

const CheckIcon = ({ color }: { color?: string }) => (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke={color || 'currentColor'} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
  </svg>
);

// Badge icon components for trust badges
const BadgeIcons: Record<BadgeIconType, React.FC<{ color?: string }>> = {
  shield: ({ color }) => (
    <svg className="w-8 h-8" fill="none" stroke={color || 'currentColor'} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  clock: ({ color }) => (
    <svg className="w-8 h-8" fill="none" stroke={color || 'currentColor'} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  check: ({ color }) => (
    <svg className="w-8 h-8" fill="none" stroke={color || 'currentColor'} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  star: ({ color }) => (
    <svg className="w-8 h-8" fill="none" stroke={color || 'currentColor'} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
  truck: ({ color }) => (
    <svg className="w-8 h-8" fill="none" stroke={color || 'currentColor'} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
    </svg>
  ),
  phone: ({ color }) => (
    <svg className="w-8 h-8" fill="none" stroke={color || 'currentColor'} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  ),
  'map-pin': ({ color }) => (
    <svg className="w-8 h-8" fill="none" stroke={color || 'currentColor'} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  award: ({ color }) => (
    <svg className="w-8 h-8" fill="none" stroke={color || 'currentColor'} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15l-2 5 2-1 2 1-2-5zm0 0a6 6 0 100-12 6 6 0 000 12z" />
    </svg>
  ),
  'thumbs-up': ({ color }) => (
    <svg className="w-8 h-8" fill="none" stroke={color || 'currentColor'} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
    </svg>
  ),
  heart: ({ color }) => (
    <svg className="w-8 h-8" fill="none" stroke={color || 'currentColor'} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
};

interface FormData {
  name: string;
  phone: string;
  email: string;
  service: string;
  message: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  email?: string;
  service?: string;
}

export default function Hero() {
  const { globalConfig, palette } = useGlobalConfig();
  const { sectionThemes } = useSectionTheme();
  const { getContent } = useContent();
  const content = getContent('hero');
  const heroTheme = sectionThemes['hero'] || {};

  // Use hero palette colors if overriding, otherwise fall back to global
  const isOverriding = heroTheme.overrideGlobalColors ?? false;

  // Check if custom background image is set via theme editor
  const hasBgImage = !!heroTheme.bgImage;
  const bgImageUrl = heroTheme.bgImage || '';

  // Determine if section is in light mode based on palette selection
  const sectionIsLight = isOverriding && heroTheme.paletteMode === 'light';
  const sectionIsDark = isOverriding && heroTheme.paletteMode === 'dark';

  // Dark mode fallback colors (used when overriding in dark mode and values are null)
  const darkFallbacks = {
    bgPrimary: '#0a0a0a',
    bgSecondary: '#141414',
    bgTertiary: '#1f1f1f',
    textPrimary: '#ffffff',
    textSecondary: '#a3a3a3',
    borderColor: '#2a2a2a',
  };

  // Light mode fallback colors
  const lightFallbacks = {
    bgPrimary: '#ffffff',
    bgSecondary: '#f8f8f8',
    bgTertiary: '#f0f0f0',
    textPrimary: '#111827',
    textSecondary: '#4b5563',
    borderColor: '#d4d4d4',
  };

  // Choose fallbacks based on section mode
  const fallbacks = sectionIsDark ? darkFallbacks : (sectionIsLight ? lightFallbacks : darkFallbacks);

  // Section colors - when overriding, use section's palette colors with appropriate fallbacks
  const accentColor = isOverriding ? (heroTheme.accent || globalConfig.brand.accent) : globalConfig.brand.accent;
  const overlayColor = isOverriding ? (heroTheme.bgPrimary || fallbacks.bgPrimary) : palette.surface.s1;
  const cardBgColor = isOverriding ? (heroTheme.bgSecondary || fallbacks.bgSecondary) : palette.surface.s2;
  const borderColor = isOverriding ? (heroTheme.borderColor || fallbacks.borderColor) : palette.surface.s7;
  const textPrimary = isOverriding ? (heroTheme.textPrimary || fallbacks.textPrimary) : palette.text.primary;
  const textSecondary = isOverriding ? (heroTheme.textSecondary || fallbacks.textSecondary) : palette.text.secondary;

  // Form styling - adapt to section's mode when overriding
  const formConfig = globalConfig.form;
  const inputBg = isOverriding
    ? (heroTheme.bgTertiary || fallbacks.bgTertiary)
    : (formConfig.inputBg || palette.surface.s4);
  const inputBorder = isOverriding
    ? borderColor
    : (formConfig.inputBorder || palette.surface.s7);
  const inputText = isOverriding
    ? textPrimary
    : (formConfig.inputText || palette.text.primary);
  const inputFocusBorder = formConfig.inputFocusBorder || palette.primary.base;
  const labelColor = isOverriding
    ? textSecondary
    : (formConfig.labelColor || palette.text.secondary);
  const buttonBg = formConfig.buttonBg || palette.primary.base;
  // Auto-calculate hover: slightly lighter version of button bg
  const buttonHoverBg = lighten(buttonBg, 15);

  // Determine if we're in light mode (section mode takes precedence when overriding)
  const isLightMode = isOverriding ? sectionIsLight : globalConfig.brand.mode === 'light';

  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    email: '',
    service: '',
    message: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      setFormData(prev => ({ ...prev, [name]: formatPhone(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (formData.phone.replace(/\D/g, '').length < 10) {
      newErrors.phone = 'Invalid phone number';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email';
    }

    if (!formData.service) {
      newErrors.service = 'Please select a service';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSuccess(true);
    setFormData({ name: '', phone: '', email: '', service: '', message: '' });

    setTimeout(() => setIsSuccess(false), 5000);
  };

  const benefits = [
    'Fully Licensed & Insured Pros',
    'Same-Day Services Available',
    'Locally Owned & Operated',
    'Honest & Upfront Pricing',
  ];

  // Background image settings from theme editor
  const bgImageOpacity = heroTheme.bgImageOpacity ?? 0.5;
  const bgImageOverlayColor = heroTheme.bgImageOverlayColor || overlayColor;

  return (
    <div className={`relative min-h-screen pt-12 pb-20 overflow-hidden ${hasBgImage ? '' : 'section-bg-primary'}`}>
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${bgImageUrl})`,
          backgroundSize: heroTheme.bgImageSize || 'cover',
          backgroundPosition: heroTheme.bgImagePosition || 'center',
        }}
      />

      {/* Overlay - uses theme editor settings when custom bgImage is set */}
      <div
        className="absolute inset-0"
        style={{
          opacity: hasBgImage ? (1 - bgImageOpacity) : (heroTheme.bgPrimary ? 0.88 : (isLightMode ? 0.92 : 0.85)),
          background: hasBgImage
            ? bgImageOverlayColor
            : `linear-gradient(to right,
                ${overlayColor} 0%,
                ${overlayColor} 50%,
                transparent 100%)`
        }}
      />

      {/* Accent Gradient */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l to-transparent" style={{ background: `linear-gradient(to left, ${accentColor}10, transparent)` }} />

      {/* Decorative Shapes */}
      <div className="absolute top-40 left-10 w-72 h-72 rounded-full blur-3xl" style={{ backgroundColor: `${accentColor}1a` }} />
      <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: `${accentColor}0d` }} />

      <div className="relative max-w-7xl mx-auto px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <div className="opacity-0 animate-[slide-right_0.8s_ease-out_0.2s_forwards]">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 section-text-accent px-4 py-2 rounded-full text-sm font-semibold mb-6"
              style={{ backgroundColor: `${accentColor}33`, borderWidth: '1px', borderColor: `${accentColor}4d` }}
            >
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: accentColor }} />
              Voted Best In North Idaho. 100% Guarantee.
            </div>

            {/* Heading */}
            <h1 className="font-[var(--font-display)] text-4xl sm:text-5xl lg:text-6xl font-bold section-text-primary leading-[1.1] mb-6">
              {content.headline}
            </h1>

            {/* Subheadline */}
            <p className="text-lg mb-6" style={{ color: textSecondary }}>
              {content.subheadline}
            </p>

            {/* Benefits */}
            <ul className="space-y-4 mb-8">
              {benefits.map((benefit, index) => (
                <li
                  key={index}
                  className="flex items-center gap-3 opacity-0 animate-[slide-right_0.6s_ease-out_forwards]"
                  style={{ animationDelay: `${0.4 + index * 0.1}s` }}
                >
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: `${accentColor}33` }}>
                    <CheckIcon color={accentColor} />
                  </div>
                  <span className="font-medium" style={{ color: textSecondary }}>{benefit}</span>
                </li>
              ))}
            </ul>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-6 pt-6 border-t" style={{ borderColor: borderColor }}>
              <GoogleReviewBadge variant="full" />
              <div className="w-px h-10" style={{ backgroundColor: borderColor }} />
              <div className="flex items-center gap-2">
                {(() => {
                  const Badge1Icon = BadgeIcons[content.badge1Icon] || BadgeIcons.shield;
                  return <Badge1Icon color={accentColor} />;
                })()}
                <span className="text-sm leading-tight" style={{ color: textSecondary }}>{content.badge1Label}<br/>{content.badge1Sublabel}</span>
              </div>
              <div className="w-px h-10" style={{ backgroundColor: borderColor }} />
              <div className="flex items-center gap-2">
                {(() => {
                  const Badge2Icon = BadgeIcons[content.badge2Icon] || BadgeIcons.clock;
                  return <Badge2Icon color={accentColor} />;
                })()}
                <span className="text-sm leading-tight" style={{ color: textSecondary }}>{content.badge2Label}<br/>{content.badge2Sublabel}</span>
              </div>
            </div>
          </div>

          {/* Right - Contact Form */}
          <div className="opacity-0 animate-[slide-up_0.8s_ease-out_0.4s_forwards]">
            <div className="relative">
              {/* Floating Card Effect */}
              <div className="absolute -inset-4 rounded-3xl blur-2xl opacity-60" style={{ background: `linear-gradient(to right, ${accentColor}33, ${accentColor}1a, ${accentColor}33)` }} />

              <div
                className="relative backdrop-blur-sm rounded-2xl shadow-2xl p-8 border"
                style={{
                  backgroundColor: cardBgColor,
                  borderColor: borderColor,
                  boxShadow: heroTheme.bgPrimary
                    ? '0 25px 50px -12px rgba(0, 0, 0, 0.35)'
                    : (isLightMode ? '0 25px 50px -12px rgba(0, 0, 0, 0.15)' : '0 25px 50px -12px rgba(0, 0, 0, 0.5)')
                }}
              >
                {/* Form Header */}
                <div className="text-center mb-8">
                  <h2 className="font-[var(--font-display)] text-2xl font-bold section-text-primary mb-2">
                    Fill Out This Form for Your Free Estimate
                  </h2>
                  <p className="section-text-secondary text-sm">
                    We'll get back to you within 30 minutes
                  </p>
                </div>

                {isSuccess ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${accentColor}33` }}>
                      <svg className="w-8 h-8" fill="none" stroke={accentColor} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold section-text-primary mb-2">Request Sent!</h3>
                    <p className="section-text-secondary">We'll contact you shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-1.5" style={{ color: labelColor }}>
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border transition-all duration-300 outline-none focus:ring-2"
                        style={{
                          backgroundColor: errors.name ? 'rgba(239, 68, 68, 0.1)' : inputBg,
                          borderColor: errors.name ? '#ef4444' : inputBorder,
                          color: inputText,
                          '--tw-ring-color': `${inputFocusBorder}33`,
                        } as React.CSSProperties}
                        onFocus={(e) => { e.target.style.borderColor = inputFocusBorder; }}
                        onBlur={(e) => { if (!errors.name) e.target.style.borderColor = inputBorder; }}
                        placeholder="Your name"
                      />
                      {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                    </div>

                    {/* Phone & Email */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium mb-1.5" style={{ color: labelColor }}>
                          Phone
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl border transition-all duration-300 outline-none focus:ring-2"
                          style={{
                            backgroundColor: errors.phone ? 'rgba(239, 68, 68, 0.1)' : inputBg,
                            borderColor: errors.phone ? '#ef4444' : inputBorder,
                            color: inputText,
                            '--tw-ring-color': `${inputFocusBorder}33`,
                          } as React.CSSProperties}
                          onFocus={(e) => { e.target.style.borderColor = inputFocusBorder; }}
                          onBlur={(e) => { if (!errors.phone) e.target.style.borderColor = inputBorder; }}
                          placeholder="(208) 555-1234"
                        />
                        {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-1.5" style={{ color: labelColor }}>
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl border transition-all duration-300 outline-none focus:ring-2"
                          style={{
                            backgroundColor: errors.email ? 'rgba(239, 68, 68, 0.1)' : inputBg,
                            borderColor: errors.email ? '#ef4444' : inputBorder,
                            color: inputText,
                            '--tw-ring-color': `${inputFocusBorder}33`,
                          } as React.CSSProperties}
                          onFocus={(e) => { e.target.style.borderColor = inputFocusBorder; }}
                          onBlur={(e) => { if (!errors.email) e.target.style.borderColor = inputBorder; }}
                          placeholder="you@email.com"
                        />
                        {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                      </div>
                    </div>

                    {/* Service */}
                    <div>
                      <label htmlFor="service" className="block text-sm font-medium mb-1.5" style={{ color: labelColor }}>
                        Service Needed
                      </label>
                      <select
                        id="service"
                        name="service"
                        value={formData.service}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border transition-all duration-300 outline-none appearance-none cursor-pointer focus:ring-2"
                        style={{
                          backgroundColor: errors.service ? 'rgba(239, 68, 68, 0.1)' : inputBg,
                          borderColor: errors.service ? '#ef4444' : inputBorder,
                          color: inputText,
                          '--tw-ring-color': `${inputFocusBorder}33`,
                        } as React.CSSProperties}
                        onFocus={(e) => { e.target.style.borderColor = inputFocusBorder; }}
                        onBlur={(e) => { if (!errors.service) e.target.style.borderColor = inputBorder; }}
                      >
                        <option value="" style={{ backgroundColor: inputBg }}>Select a service</option>
                        <option value="junk-removal" style={{ backgroundColor: inputBg }}>Junk Removal</option>
                        <option value="demolition" style={{ backgroundColor: inputBg }}>Demolition Services</option>
                        <option value="estate-cleanout" style={{ backgroundColor: inputBg }}>Estate & Hoarder Cleanouts</option>
                        <option value="move-out" style={{ backgroundColor: inputBg }}>Apartment & Move-Out Cleanouts</option>
                        <option value="bobcat" style={{ backgroundColor: inputBg }}>Bobcat & Excavation Work</option>
                        <option value="dumpster" style={{ backgroundColor: inputBg }}>Dumpster Rentals</option>
                      </select>
                      {errors.service && <p className="text-red-400 text-xs mt-1">{errors.service}</p>}
                    </div>

                    {/* Message */}
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium mb-1.5" style={{ color: labelColor }}>
                        Message <span style={{ color: textSecondary, opacity: 0.7 }}>(optional)</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border transition-all duration-300 outline-none resize-none focus:ring-2"
                        style={{
                          backgroundColor: inputBg,
                          borderColor: inputBorder,
                          color: inputText,
                          '--tw-ring-color': `${inputFocusBorder}33`,
                        } as React.CSSProperties}
                        onFocus={(e) => { e.target.style.borderColor = inputFocusBorder; }}
                        onBlur={(e) => { e.target.style.borderColor = inputBorder; }}
                        placeholder="Tell us about your project..."
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 rounded-xl font-semibold text-lg shadow-lg shadow-black/25 hover:shadow-xl hover:shadow-black/30 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                      style={{
                        backgroundColor: buttonBg,
                        color: getContrastColor(buttonBg),
                      }}
                      onMouseEnter={(e) => { if (!isSubmitting) e.currentTarget.style.backgroundColor = buttonHoverBg; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = buttonBg; }}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Sending...
                        </span>
                      ) : (
                        'Get My Free Quote'
                      )}
                    </button>

                    {/* Privacy Note */}
                    <p className="text-center text-xs text-gray-500">
                      By submitting, you agree to our{' '}
                      <a href="#" className="hover:underline" style={{ color: accentColor }}>Privacy Policy</a>
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
