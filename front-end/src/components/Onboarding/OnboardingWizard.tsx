import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ColorPicker } from '@/components/ui/color-picker';
import {
  Upload, Phone, Mail, Building2, MapPin, Clock,
  Palette, Star, Share2, ArrowRight, ArrowLeft, Check, X,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface OnboardingConfig {
  nonce: string;
  apiUrl: string;
  redirectUrl: string;
}

interface WizardData {
  logo: string;
  logo_alt: string;
  site_name: string;
  phone: string;
  email: string;
  footer_tagline: string;
  footer_description: string;
  address: string;
  business_hours: string;
  copyright: string;
  brand_dark_primary: string;
  brand_dark_accent: string;
  brand_light_primary: string;
  brand_light_accent: string;
  google_rating: string;
  google_reviews_count: string;
  google_reviews_url: string;
  facebook_url: string;
  instagram_url: string;
  youtube_url: string;
  yelp_url: string;
}

const STEPS = [
  { id: 'brand', title: 'Brand & Contact', description: 'Logo, company name, phone and email', icon: Building2 },
  { id: 'about', title: 'Business Info', description: 'Footer details, address and hours', icon: MapPin },
  { id: 'colors', title: 'Brand Colors', description: 'Set your primary and accent colors', icon: Palette },
  { id: 'reviews', title: 'Google Reviews', description: 'Display your reputation', icon: Star },
  { id: 'social', title: 'Social Media', description: 'Connect your social profiles', icon: Share2 },
] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Inline style forced on every Input / Textarea so it always beats shadcn's
 *  `bg-background` (which tailwind-merge doesn't recognise as conflicting). */
const inputStyle: React.CSSProperties = {
  backgroundColor: '#27272a', // zinc-800
  borderColor: '#3f3f46',     // zinc-700
  color: '#f4f4f5',           // zinc-100
};

/** Same as inputStyle but with left padding for the icon. */
const inputIconStyle: React.CSSProperties = {
  ...inputStyle,
  paddingLeft: '2.5rem', // pl-10
};

const cls = {
  input: 'placeholder:text-zinc-500',
  label: 'block text-sm font-medium text-zinc-300 mb-1.5',
};

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className={cls.label}>{label}</label>
      {children}
      {hint && <p className="text-xs text-zinc-500 mt-1">{hint}</p>}
    </div>
  );
}

function initData(): WizardData {
  const s = (window.byrdeSettings || {}) as Record<string, string>;
  return {
    logo: s.logo || '',
    logo_alt: s.logo_alt || '',
    site_name: s.site_name || '',
    phone: s.phone || '',
    email: s.email || '',
    footer_tagline: s.footer_tagline || '',
    footer_description: s.footer_description || '',
    address: s.address || '',
    business_hours: s.business_hours || '',
    copyright: s.copyright || '',
    brand_dark_primary: s.brand_dark_primary || '',
    brand_dark_accent: s.brand_dark_accent || '',
    brand_light_primary: s.brand_light_primary || '',
    brand_light_accent: s.brand_light_accent || '',
    google_rating: s.google_rating || '5.0',
    google_reviews_count: s.google_reviews_count || '',
    google_reviews_url: s.google_reviews_url || '',
    facebook_url: s.facebook_url || '',
    instagram_url: s.instagram_url || '',
    youtube_url: s.youtube_url || '',
    yelp_url: s.yelp_url || '',
  };
}

/**
 * Format phone as user types: (123) 456-7890 or +1 (234) 567-8901.
 * Keeps raw digits (plus optional leading +) and applies mask on the fly.
 */
function formatPhone(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';

  const hasPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/\D/g, '');

  // International: +N (NNN) NNN-NNNN
  if (hasPlus) {
    const cc = digits.slice(0, 1);   // country code (1 digit)
    const area = digits.slice(1, 4);
    const pre = digits.slice(4, 7);
    const line = digits.slice(7, 11);

    if (digits.length <= 1) return `+${cc}`;
    if (digits.length <= 4) return `+${cc} (${area}`;
    if (digits.length <= 7) return `+${cc} (${area}) ${pre}`;
    return `+${cc} (${area}) ${pre}-${line}`;
  }

  // Domestic: (NNN) NNN-NNNN
  const area = digits.slice(0, 3);
  const pre = digits.slice(3, 6);
  const line = digits.slice(6, 10);

  if (digits.length <= 3) return `(${area}`;
  if (digits.length <= 6) return `(${area}) ${pre}`;
  return `(${area}) ${pre}-${line}`;
}

function buildPayload(data: WizardData) {
  return {
    brand: {
      logo: { url: data.logo, alt: data.logo_alt },
      phone: data.phone,
      email: data.email,
    },
    seo: {
      site_name: data.site_name,
    },
    footer: {
      tagline: data.footer_tagline,
      description: data.footer_description,
      address: data.address,
      business_hours: data.business_hours,
      copyright: data.copyright,
    },
    brand_colors: {
      dark_primary: data.brand_dark_primary,
      dark_accent: data.brand_dark_accent,
      light_primary: data.brand_light_primary,
      light_accent: data.brand_light_accent,
    },
    google_reviews: {
      rating: data.google_rating,
      count: data.google_reviews_count,
      reviews_url: data.google_reviews_url,
    },
    social: {
      facebook_url: data.facebook_url,
      instagram_url: data.instagram_url,
      youtube_url: data.youtube_url,
      yelp_url: data.yelp_url,
    },
  };
}

// ---------------------------------------------------------------------------
// Step Components
// ---------------------------------------------------------------------------

function BrandStep({ data, update }: { data: WizardData; update: (d: Partial<WizardData>) => void }) {
  const handleUploadLogo = useCallback(() => {
    if (window.wp?.media) {
      const frame = window.wp.media({
        title: 'Select Logo',
        button: { text: 'Use as Logo' },
        multiple: false,
      });
      frame.on('select', () => {
        const attachment = frame.state().get('selection').first().toJSON();
        update({ logo: attachment.url, logo_alt: attachment.alt || data.site_name || '' });
      });
      frame.open();
    }
  }, [data.site_name, update]);

  return (
    <div className="space-y-5">
      {/* Logo */}
      <Field label="Logo">
        <div className="flex items-center gap-4">
          {data.logo ? (
            <div className="relative group">
              <img src={data.logo} alt={data.logo_alt} className="h-16 w-auto rounded-lg bg-zinc-800 p-2" />
              <button
                onClick={() => update({ logo: '', logo_alt: '' })}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleUploadLogo}
              className="flex items-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <Upload className="w-5 h-5" />
              <span className="text-sm">Upload Logo</span>
            </button>
          )}
          {data.logo && (
            <button onClick={handleUploadLogo} className="text-sm text-zinc-400 hover:text-zinc-200 underline">
              Change
            </button>
          )}
        </div>
      </Field>

      <Field label="Company Name">
        <Input value={data.site_name} onChange={(e) => update({ site_name: e.target.value })} placeholder="Your Company Name" className={cls.input} style={inputStyle} />
      </Field>

      <Field label="Phone" hint="Type + for international format: +1 (479) 877-5803">
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            value={data.phone}
            onChange={(e) => {
              const v = e.target.value;
              // Allow only digits, +, and mask characters during typing
              const stripped = v.replace(/[^0-9+]/g, '');
              // Limit: +1NNNNNNNNNN (11 digits) or NNNNNNNNNN (10 digits)
              const maxDigits = stripped.startsWith('+') ? 12 : 10;
              const capped = stripped.slice(0, maxDigits);
              update({ phone: formatPhone(capped) });
            }}
            placeholder="(000) 000-0000"
            inputMode="tel"
            className={cls.input}
            style={inputIconStyle}
          />
        </div>
      </Field>

      <Field label="Email">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input value={data.email} onChange={(e) => update({ email: e.target.value })} placeholder="contact@company.com" type="email" className={cls.input} style={inputIconStyle} />
        </div>
      </Field>
    </div>
  );
}

function AboutStep({ data, update }: { data: WizardData; update: (d: Partial<WizardData>) => void }) {
  return (
    <div className="space-y-5">
      <Field label="Tagline">
        <Input value={data.footer_tagline} onChange={(e) => update({ footer_tagline: e.target.value })} placeholder="Your Trusted Local Service Provider" className={cls.input} style={inputStyle} />
      </Field>

      <Field label="Description">
        <Textarea value={data.footer_description} onChange={(e) => update({ footer_description: e.target.value })} placeholder="Professional services you can count on..." className={`${cls.input} resize-none`} rows={3} style={inputStyle} />
      </Field>

      <Field label="Address">
        <div className="relative">
          <MapPin className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
          <Input value={data.address} onChange={(e) => update({ address: e.target.value })} placeholder="123 Main St, City, ST" className={cls.input} style={inputIconStyle} />
        </div>
      </Field>

      <Field label="Business Hours">
        <div className="relative">
          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input value={data.business_hours} onChange={(e) => update({ business_hours: e.target.value })} placeholder="Mon-Sat: 7AM - 7PM" className={cls.input} style={inputIconStyle} />
        </div>
      </Field>

      <Field label="Copyright">
        <Input value={data.copyright} onChange={(e) => update({ copyright: e.target.value })} placeholder={`© ${new Date().getFullYear()} Company. All rights reserved.`} className={cls.input} style={inputStyle} />
      </Field>
    </div>
  );
}

function ColorsStep({ data, update }: { data: WizardData; update: (d: Partial<WizardData>) => void }) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-zinc-400">Set the main colors for your landing pages. You can fine-tune these later in the editor.</p>

      {/* Dark Mode */}
      <div>
        <h4 className="text-sm font-medium text-zinc-200 mb-3">Dark Mode</h4>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Primary Color">
            <ColorPicker value={data.brand_dark_primary} onChange={(v) => update({ brand_dark_primary: v })} defaultValue="#3ab342" />
          </Field>
          <Field label="Accent Color">
            <ColorPicker value={data.brand_dark_accent} onChange={(v) => update({ brand_dark_accent: v })} defaultValue="#2d8a33" />
          </Field>
        </div>
      </div>

      {/* Light Mode */}
      <div>
        <h4 className="text-sm font-medium text-zinc-200 mb-3">Light Mode</h4>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Primary Color">
            <ColorPicker value={data.brand_light_primary} onChange={(v) => update({ brand_light_primary: v })} defaultValue="#3ab342" />
          </Field>
          <Field label="Accent Color">
            <ColorPicker value={data.brand_light_accent} onChange={(v) => update({ brand_light_accent: v })} defaultValue="#2d8a33" />
          </Field>
        </div>
      </div>
    </div>
  );
}

function ReviewsStep({ data, update }: { data: WizardData; update: (d: Partial<WizardData>) => void }) {
  return (
    <div className="space-y-5">
      <p className="text-sm text-zinc-400">Display your Google Reviews rating to build trust with visitors.</p>

      <Field label="Rating" hint="e.g. 4.8 or 5.0">
        <div className="relative">
          <Star className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input value={data.google_rating} onChange={(e) => update({ google_rating: e.target.value })} placeholder="5.0" className={cls.input} style={inputIconStyle} />
        </div>
      </Field>

      <Field label="Review Count" hint="Total number of reviews">
        <Input value={data.google_reviews_count} onChange={(e) => update({ google_reviews_count: e.target.value })} placeholder="150" className={cls.input} style={inputStyle} />
      </Field>

      <Field label="Google Reviews URL" hint="Google Maps > Your business > Reviews > Share. Copy the link.">
        <Input value={data.google_reviews_url} onChange={(e) => update({ google_reviews_url: e.target.value })} placeholder="https://g.page/your-business/review" className={cls.input} style={inputStyle} />
      </Field>
    </div>
  );
}

function SocialStep({ data, update }: { data: WizardData; update: (d: Partial<WizardData>) => void }) {
  return (
    <div className="space-y-5">
      <p className="text-sm text-zinc-400">Connect your social media profiles. Leave blank any you don't use.</p>

      <Field label="Facebook">
        <Input value={data.facebook_url} onChange={(e) => update({ facebook_url: e.target.value })} placeholder="https://facebook.com/yourpage" className={cls.input} style={inputStyle} />
      </Field>

      <Field label="Instagram">
        <Input value={data.instagram_url} onChange={(e) => update({ instagram_url: e.target.value })} placeholder="https://instagram.com/yourpage" className={cls.input} style={inputStyle} />
      </Field>

      <Field label="YouTube">
        <Input value={data.youtube_url} onChange={(e) => update({ youtube_url: e.target.value })} placeholder="https://youtube.com/@yourchannel" className={cls.input} style={inputStyle} />
      </Field>

      <Field label="Yelp">
        <Input value={data.yelp_url} onChange={(e) => update({ yelp_url: e.target.value })} placeholder="https://yelp.com/biz/yourbusiness" className={cls.input} style={inputStyle} />
      </Field>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Wizard
// ---------------------------------------------------------------------------

export default function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<WizardData>(initData);
  const [saving, setSaving] = useState(false);

  const onboarding = (window as unknown as { byrdeOnboarding?: OnboardingConfig }).byrdeOnboarding;
  if (!onboarding) return null;

  const { nonce, apiUrl, redirectUrl } = onboarding;

  const update = useCallback((partial: Partial<WizardData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  }, []);

  const currentStep = STEPS[step];
  const isLast = step === STEPS.length - 1;

  async function markComplete() {
    await fetch(`${apiUrl}/onboarding/complete`, {
      method: 'POST',
      headers: { 'X-WP-Nonce': nonce },
    });
  }

  async function handleFinish() {
    setSaving(true);
    try {
      // Save settings
      const payload = buildPayload(data);
      const res = await fetch(`${apiUrl}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': nonce,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Save failed');

      await markComplete();
      window.location.href = redirectUrl;
    } catch {
      setSaving(false);
      alert('Failed to save settings. Please try again.');
    }
  }

  async function handleSkipAll() {
    await markComplete();
    window.location.href = redirectUrl;
  }

  // Render step content
  const stepContent = (() => {
    switch (currentStep.id) {
      case 'brand': return <BrandStep data={data} update={update} />;
      case 'about': return <AboutStep data={data} update={update} />;
      case 'colors': return <ColorsStep data={data} update={update} />;
      case 'reviews': return <ReviewsStep data={data} update={update} />;
      case 'social': return <SocialStep data={data} update={update} />;
    }
  })();

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      {/* Skip link */}
      <div className="w-full max-w-xl flex justify-end mb-4">
        <button onClick={handleSkipAll} className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
          Skip Setup
        </button>
      </div>

      {/* Card */}
      <div className="w-full max-w-xl bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-zinc-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center">
              <currentStep.icon className="w-5 h-5 text-zinc-300" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-100">{currentStep.title}</h2>
              <p className="text-sm text-zinc-400">{currentStep.description}</p>
            </div>
          </div>

          {/* Progress */}
          <div className="flex gap-1.5 mt-4">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? 'bg-emerald-500' : 'bg-zinc-700'}`}
              />
            ))}
          </div>
          <p className="text-xs text-zinc-500 mt-2">Step {step + 1} of {STEPS.length}</p>
        </div>

        {/* Content */}
        <div className="px-8 py-6">
          {stepContent}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-zinc-800 flex items-center justify-between">
          <div>
            {step > 0 && (
              <Button variant="ghost" onClick={() => setStep(step - 1)} className="text-zinc-400 hover:text-zinc-200">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {!isLast && (
              <Button variant="ghost" onClick={() => setStep(step + 1)} className="text-zinc-500 hover:text-zinc-300">
                Skip
              </Button>
            )}

            {isLast ? (
              <Button onClick={handleFinish} disabled={saving} className="bg-emerald-600 hover:bg-emerald-500 text-white">
                {saving ? 'Saving...' : <><Check className="w-4 h-4 mr-1" /> Finish Setup</>}
              </Button>
            ) : (
              <Button onClick={() => setStep(step + 1)} className="bg-emerald-600 hover:bg-emerald-500 text-white">
                Next <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Footer text */}
      <p className="text-xs text-zinc-600 mt-6">You can change all of these settings later in the Theme Editor.</p>
    </div>
  );
}
