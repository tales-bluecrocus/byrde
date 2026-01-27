import { useState } from 'react';
import heroBg from '../assets/images/main-banner-background.webp';
import { useGlobalConfig } from '../context/GlobalConfigContext';
import { useSectionTheme } from '../context/SectionThemeContext';
import GoogleReviewBadge from './GoogleReviewBadge';
import { getContrastColor, lighten } from '../utils/colorUtils';

const CheckIcon = ({ color }: { color?: string }) => (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke={color || 'currentColor'} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
  </svg>
);

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
  const heroTheme = sectionThemes['hero'] || {};

  // Use hero palette colors if overriding, otherwise fall back to global
  const isOverriding = heroTheme.overrideGlobalColors ?? false;

  // Section colors - when overriding, use section's palette colors entirely
  const accentColor = isOverriding ? (heroTheme.accent || globalConfig.brand.accent) : globalConfig.brand.accent;
  const overlayColor = isOverriding ? (heroTheme.bgPrimary || palette.surface.s1) : palette.surface.s1;
  const cardBgColor = isOverriding ? (heroTheme.bgSecondary || palette.surface.s2) : palette.surface.s2;
  const borderColor = isOverriding ? (heroTheme.borderColor || palette.surface.s7) : palette.surface.s7;
  const textPrimary = isOverriding ? (heroTheme.textPrimary || palette.text.primary) : palette.text.primary;
  const textSecondary = isOverriding ? (heroTheme.textSecondary || palette.text.secondary) : palette.text.secondary;

  // Determine if section is in light mode based on palette selection
  const sectionIsLight = isOverriding && heroTheme.paletteMode === 'light';

  // Form styling - adapt to section's mode when overriding
  const formConfig = globalConfig.form;
  const inputBg = isOverriding
    ? (sectionIsLight ? '#ffffff' : (heroTheme.bgTertiary || palette.surface.s4))
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

  return (
    <div className="relative min-h-screen pt-12 pb-20 overflow-hidden section-bg-primary">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      />

      {/* Overlay - adapts to section theme color, then light/dark mode */}
      <div
        className="absolute inset-0"
        style={{
          opacity: heroTheme.bgPrimary ? 0.88 : (isLightMode ? 0.92 : 0.85),
          background: `linear-gradient(to right,
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
              Fast & Reliable{' '}
              <span className="relative">
                <span className="section-text-accent">Junk Removal</span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                  <path d="M2 10C50 4 150 4 198 10" stroke={accentColor} strokeWidth="3" strokeLinecap="round"/>
                </svg>
              </span>{' '}
              Services
            </h1>

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
                <svg className="w-8 h-8" fill="none" stroke={accentColor} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-sm leading-tight" style={{ color: textSecondary }}>{globalConfig.trustBadges.badge1.label}<br/>{globalConfig.trustBadges.badge1.sublabel}</span>
              </div>
              <div className="w-px h-10" style={{ backgroundColor: borderColor }} />
              <div className="flex items-center gap-2">
                <svg className="w-8 h-8" fill="none" stroke={accentColor} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm leading-tight" style={{ color: textSecondary }}>{globalConfig.trustBadges.badge2.label}<br/>{globalConfig.trustBadges.badge2.sublabel}</span>
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
