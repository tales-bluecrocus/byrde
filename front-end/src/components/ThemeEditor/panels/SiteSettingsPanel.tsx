/**
 * Site Settings Panel - Edit WordPress theme settings (phone, social, SEO, etc.)
 */

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ColorPicker } from '@/components/ui/color-picker';
import { useSettingsContext } from '../../../context/SettingsContext';
import { useGlobalConfig } from '../../../context/GlobalConfigContext';
import { useToast } from '../../Toast';
import { getContrastRatio, meetsWCAG, formatContrastRatio } from '../../../utils/colorUtils';
import {
  ChevronDown,
  Building,
  Star,
  FileText,
  Share2,
  Scale,
  Upload,
  Mail,
  Square,
  Circle,
  RectangleHorizontal,
  Palette,
  Sun,
  Moon,
  MousePointerClick,
} from 'lucide-react';
import type { ThemeSettings } from '../../../hooks/useSettings';

// Collapsible section wrapper (accordion: only one open at a time)
function Section({
  icon: Icon,
  title,
  open,
  onToggle,
  children,
}: {
  icon: React.ElementType;
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <Collapsible open={open} onOpenChange={onToggle}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full py-2 px-3 rounded-lg hover:bg-zinc-800/50 transition-colors group">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-800">
          <Icon className="h-3.5 w-3.5 text-zinc-400" />
        </div>
        <span className="text-xs font-medium text-zinc-200 flex-1 text-left">{title}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-zinc-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-3 pb-4 pt-2 space-y-3">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// Field wrapper
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] font-medium text-zinc-400">{label}</Label>
      {children}
    </div>
  );
}

// Contrast badge: shows WCAG ratio + pass/fail
function ContrastBadge({ bg, text }: { bg: string; text: string }) {
  const ratio = getContrastRatio(bg, text);
  const passes = meetsWCAG(ratio);
  return (
    <div className="flex items-center gap-1.5 mt-1.5">
      <span
        className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold"
        style={{
          backgroundColor: passes ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
          color: passes ? '#22c55e' : '#ef4444',
        }}
      >
        {passes ? 'AA' : 'Fail'}
      </span>
      <span className="text-[10px] text-zinc-500">{formatContrastRatio(ratio)}</span>
    </div>
  );
}

// Shared input class
const inputCls = "bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 text-xs h-8";
const textareaCls = "w-full rounded-md bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder:text-zinc-600 text-xs p-2 resize-y min-h-[60px] focus:outline-none focus:border-zinc-600";

type SectionKey = 'brand' | 'colors' | 'buttons' | 'reviews' | 'footer' | 'social' | 'analytics' | 'legal' | 'form';

export function SiteSettingsPanel() {
  const { settings, updateSettings } = useSettingsContext();
  const { globalConfig, updateLogo } = useGlobalConfig();
  const { toast } = useToast();
  const [openSection, setOpenSection] = useState<SectionKey | null>('brand');

  const toggle = useCallback((key: SectionKey) => {
    setOpenSection(prev => prev === key ? null : key);
  }, []);

  const update = useCallback((key: keyof ThemeSettings, value: string) => {
    updateSettings({ [key]: value });
  }, [updateSettings]);

  const handleUploadImage = useCallback((field: 'logo' | 'og_image', altField?: keyof ThemeSettings) => {
    if (window.wp?.media) {
      const frame = window.wp.media({
        title: field === 'logo' ? 'Select Logo' : 'Select OG Image',
        button: { text: 'Use Image' },
        multiple: false,
      });

      frame.on('select', () => {
        const attachment = frame.state().get('selection').first().toJSON();
        const updates: Partial<ThemeSettings> = { [field]: attachment.url };
        if (altField) updates[altField] = attachment.alt || '';
        updateSettings(updates);
        toast('Image set', 'success');
      });

      frame.open();
    } else {
      toast('WordPress Media not available', 'error');
    }
  }, [updateSettings, toast]);

  return (
    <div className="space-y-1 text-zinc-200">
      {/* Brand */}
      <Section icon={Building} title="Brand" open={openSection === 'brand'} onToggle={() => toggle('brand')}>
        <Field label="Company Name">
          <Input
            value={settings.site_name}
            onChange={(e) => update('site_name', e.target.value)}
            placeholder="My Business Name"
            className={inputCls}
          />
        </Field>
        <Field label="Logo">
          <div className="space-y-2">
            {settings.logo && (
              <div className="h-16 rounded-md bg-zinc-800 border border-zinc-700 p-2 flex items-center">
                <img src={settings.logo} alt={settings.logo_alt} className="h-full w-auto object-contain" />
              </div>
            )}
            <div className="flex gap-2">
              <Input
                value={settings.logo}
                onChange={(e) => update('logo', e.target.value)}
                placeholder="Logo URL..."
                className={`flex-1 ${inputCls}`}
              />
              <Button
                onClick={() => handleUploadImage('logo', 'logo_alt')}
                size="sm"
                variant="outline"
                className="border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100 h-8 px-2"
              >
                <Upload className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </Field>
        <Field label="Logo Background">
          <ColorPicker value={globalConfig.logo.bgColor} onChange={(val) => updateLogo({ bgColor: val })} />
        </Field>
        <Field label="Logo Shape">
          <ToggleGroup
            type="single"
            value={globalConfig.logo.shape}
            onValueChange={(val) => val && updateLogo({ shape: val as 'rectangle' | 'square' | 'circle' })}
            className="w-full bg-zinc-800 p-1 rounded-lg"
          >
            <ToggleGroupItem value="rectangle" className="flex-1 text-zinc-400 data-[state=on]:bg-zinc-700 data-[state=on]:text-zinc-100">
              <RectangleHorizontal className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="square" className="flex-1 text-zinc-400 data-[state=on]:bg-zinc-700 data-[state=on]:text-zinc-100">
              <Square className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="circle" className="flex-1 text-zinc-400 data-[state=on]:bg-zinc-700 data-[state=on]:text-zinc-100">
              <Circle className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </Field>
        <Field label="Phone">
          <Input
            value={settings.phone}
            onChange={(e) => {
              const phone = e.target.value;
              const hasPlus = phone.trimStart().startsWith('+');
              const digits = phone.replace(/\D/g, '');
              updateSettings({ phone, phone_raw: hasPlus ? `+${digits}` : digits });
            }}
            placeholder="(000) 000-0000"
            className={inputCls}
          />
        </Field>
        <Field label="Email">
          <Input
            value={settings.email}
            onChange={(e) => update('email', e.target.value)}
            placeholder="info@company.com"
            type="email"
            className={inputCls}
          />
        </Field>
      </Section>

      {/* Brand Colors */}
      <Section icon={Palette} title="Brand Colors" open={openSection === 'colors'} onToggle={() => toggle('colors')}>
        {/* Default Mode toggle */}
        <div className="mb-3">
          <Label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Default Mode
          </Label>
          <ToggleGroup
            type="single"
            value={settings.brand_mode || 'dark'}
            onValueChange={(val) => {
              if (val) update('brand_mode', val);
            }}
            className="w-full bg-zinc-800 p-1 rounded-lg mt-1.5"
          >
            <ToggleGroupItem value="dark" className="flex-1 gap-1.5 text-zinc-400 data-[state=on]:bg-zinc-700 data-[state=on]:text-zinc-100">
              <Moon className="h-3 w-3" />
              Dark
            </ToggleGroupItem>
            <ToggleGroupItem value="light" className="flex-1 gap-1.5 text-zinc-400 data-[state=on]:bg-zinc-700 data-[state=on]:text-zinc-100">
              <Sun className="h-3 w-3" />
              Light
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Dark Mode */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Moon className="h-3 w-3 text-zinc-500" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Dark Mode</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Background">
              <ColorPicker value={settings.brand_dark_bg} onChange={(val) => update('brand_dark_bg', val)} />
            </Field>
            <Field label="Text">
              <ColorPicker value={settings.brand_dark_text} onChange={(val) => update('brand_dark_text', val)} />
            </Field>
          </div>
          <ContrastBadge bg={settings.brand_dark_bg} text={settings.brand_dark_text} />
          <div className="grid grid-cols-2 gap-3 mt-3">
            <Field label="Primary">
              <ColorPicker value={settings.brand_dark_primary} onChange={(val) => update('brand_dark_primary', val)} />
              <ContrastBadge bg={settings.brand_dark_bg} text={settings.brand_dark_primary} />
            </Field>
            <Field label="Accent">
              <ColorPicker value={settings.brand_dark_accent} onChange={(val) => update('brand_dark_accent', val)} />
              <ContrastBadge bg={settings.brand_dark_bg} text={settings.brand_dark_accent} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <Field label="Text Secondary">
              <ColorPicker value={settings.brand_dark_text_secondary} onChange={(val) => update('brand_dark_text_secondary', val)} />
            </Field>
            <Field label="Background 2">
              <ColorPicker value={settings.brand_dark_bg_secondary} onChange={(val) => update('brand_dark_bg_secondary', val)} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <Field label="Border">
              <ColorPicker value={settings.brand_dark_border} onChange={(val) => update('brand_dark_border', val)} />
            </Field>
          </div>
        </div>

        {/* Light Mode */}
        <div className="pt-2">
          <div className="flex items-center gap-1.5 mb-2">
            <Sun className="h-3 w-3 text-zinc-500" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Light Mode</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Background">
              <ColorPicker value={settings.brand_light_bg} onChange={(val) => update('brand_light_bg', val)} />
            </Field>
            <Field label="Text">
              <ColorPicker value={settings.brand_light_text} onChange={(val) => update('brand_light_text', val)} />
            </Field>
          </div>
          <ContrastBadge bg={settings.brand_light_bg} text={settings.brand_light_text} />
          <div className="grid grid-cols-2 gap-3 mt-3">
            <Field label="Primary">
              <ColorPicker value={settings.brand_light_primary} onChange={(val) => update('brand_light_primary', val)} />
              <ContrastBadge bg={settings.brand_light_bg} text={settings.brand_light_primary} />
            </Field>
            <Field label="Accent">
              <ColorPicker value={settings.brand_light_accent} onChange={(val) => update('brand_light_accent', val)} />
              <ContrastBadge bg={settings.brand_light_bg} text={settings.brand_light_accent} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <Field label="Text Secondary">
              <ColorPicker value={settings.brand_light_text_secondary} onChange={(val) => update('brand_light_text_secondary', val)} />
            </Field>
            <Field label="Background 2">
              <ColorPicker value={settings.brand_light_bg_secondary} onChange={(val) => update('brand_light_bg_secondary', val)} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <Field label="Border">
              <ColorPicker value={settings.brand_light_border} onChange={(val) => update('brand_light_border', val)} />
            </Field>
          </div>
        </div>

      </Section>

      {/* Button Style */}
      <Section icon={MousePointerClick} title="Button Style" open={openSection === 'buttons'} onToggle={() => toggle('buttons')}>
        {/* Live Preview — shows current mode button */}
        {(() => {
          const isDark = (settings.brand_mode || 'dark') === 'dark';
          const previewBg = isDark
            ? (settings.button_dark_bg || settings.brand_dark_primary || '#3ab342')
            : (settings.button_light_bg || settings.brand_light_primary || '#3ab342');
          const previewText = isDark
            ? (settings.button_dark_text || '#ffffff')
            : (settings.button_light_text || '#ffffff');
          const previewBorder = isDark ? settings.button_dark_border_color : settings.button_light_border_color;
          return (
            <div className="flex justify-center py-3">
              <div
                className="px-6 py-3 font-semibold text-sm transition-all"
                style={{
                  backgroundColor: previewBg,
                  color: previewText,
                  border: previewBorder
                    ? `${settings.button_border_width || '0'}px solid ${previewBorder}`
                    : 'none',
                  borderRadius: `${settings.button_border_radius || '12'}px`,
                }}
              >
                Button Preview
              </div>
            </div>
          );
        })()}

        {/* Dark Mode */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Moon className="h-3 w-3 text-zinc-500" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Dark Mode</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Background">
              <ColorPicker
                value={settings.button_dark_bg || settings.brand_dark_primary || '#3ab342'}
                onChange={(val) => update('button_dark_bg', val)}
              />
            </Field>
            <Field label="Text">
              <ColorPicker
                value={settings.button_dark_text || '#ffffff'}
                onChange={(val) => update('button_dark_text', val)}
              />
            </Field>
          </div>
          <ContrastBadge bg={settings.button_dark_bg || settings.brand_dark_primary || '#3ab342'} text={settings.button_dark_text || '#ffffff'} />
          <div className="mt-3">
            <Field label="Border Color">
              <ColorPicker
                value={settings.button_dark_border_color || ''}
                onChange={(val) => update('button_dark_border_color', val)}
              />
              {settings.button_dark_border_color && (
                <button
                  type="button"
                  onClick={() => update('button_dark_border_color', '')}
                  className="text-[10px] text-zinc-500 hover:text-zinc-300 underline underline-offset-2 mt-1"
                >
                  Remove border
                </button>
              )}
            </Field>
          </div>
        </div>

        {/* Light Mode */}
        <div className="pt-2">
          <div className="flex items-center gap-1.5 mb-2">
            <Sun className="h-3 w-3 text-zinc-500" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Light Mode</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Background">
              <ColorPicker
                value={settings.button_light_bg || settings.brand_light_primary || '#3ab342'}
                onChange={(val) => update('button_light_bg', val)}
              />
            </Field>
            <Field label="Text">
              <ColorPicker
                value={settings.button_light_text || '#ffffff'}
                onChange={(val) => update('button_light_text', val)}
              />
            </Field>
          </div>
          <ContrastBadge bg={settings.button_light_bg || settings.brand_light_primary || '#3ab342'} text={settings.button_light_text || '#ffffff'} />
          <div className="mt-3">
            <Field label="Border Color">
              <ColorPicker
                value={settings.button_light_border_color || ''}
                onChange={(val) => update('button_light_border_color', val)}
              />
              {settings.button_light_border_color && (
                <button
                  type="button"
                  onClick={() => update('button_light_border_color', '')}
                  className="text-[10px] text-zinc-500 hover:text-zinc-300 underline underline-offset-2 mt-1"
                >
                  Remove border
                </button>
              )}
            </Field>
          </div>
        </div>

        {/* Shared: border width + radius */}
        <div className="pt-2 grid grid-cols-2 gap-3">
          {(settings.button_dark_border_color || settings.button_light_border_color) && (
            <Field label="Border Width (px)">
              <Input
                type="number"
                min="0"
                max="10"
                value={settings.button_border_width || '0'}
                onChange={(e) => update('button_border_width', e.target.value)}
                className={inputCls}
              />
            </Field>
          )}
        </div>

        <div>
          <Label className="text-[11px] font-medium text-zinc-400">Border Radius</Label>
          <ToggleGroup
            type="single"
            value={settings.button_border_radius || '12'}
            onValueChange={(val) => val && update('button_border_radius', val)}
            className="w-full bg-zinc-800 p-1 rounded-lg mt-1.5"
          >
            <ToggleGroupItem value="0" className="flex-1 text-[11px] text-zinc-400 data-[state=on]:bg-zinc-700 data-[state=on]:text-zinc-100">
              None
            </ToggleGroupItem>
            <ToggleGroupItem value="4" className="flex-1 text-[11px] text-zinc-400 data-[state=on]:bg-zinc-700 data-[state=on]:text-zinc-100">
              Small
            </ToggleGroupItem>
            <ToggleGroupItem value="12" className="flex-1 text-[11px] text-zinc-400 data-[state=on]:bg-zinc-700 data-[state=on]:text-zinc-100">
              Medium
            </ToggleGroupItem>
            <ToggleGroupItem value="9999" className="flex-1 text-[11px] text-zinc-400 data-[state=on]:bg-zinc-700 data-[state=on]:text-zinc-100">
              Full
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </Section>

      {/* Google Reviews */}
      <Section icon={Star} title="Google Reviews" open={openSection === 'reviews'} onToggle={() => toggle('reviews')}>
        <Field label="Rating">
          <Input
            value={settings.google_rating}
            onChange={(e) => update('google_rating', e.target.value)}
            placeholder="5.0"
            className={inputCls}
          />
        </Field>
        <Field label="Review Count">
          <Input
            value={settings.google_reviews_count}
            onChange={(e) => update('google_reviews_count', e.target.value)}
            placeholder="50+"
            className={inputCls}
          />
        </Field>
        <Field label="Reviews URL">
          <Input
            value={settings.google_reviews_url}
            onChange={(e) => update('google_reviews_url', e.target.value)}
            placeholder="https://g.page/..."
            className={inputCls}
          />
        </Field>
      </Section>

      {/* Footer */}
      <Section icon={FileText} title="Footer" open={openSection === 'footer'} onToggle={() => toggle('footer')}>
        <Field label="Tagline">
          <Input
            value={settings.footer_tagline}
            onChange={(e) => update('footer_tagline', e.target.value)}
            placeholder="Short tagline"
            className={inputCls}
          />
        </Field>
        <Field label="Description">
          <textarea
            value={settings.footer_description}
            onChange={(e) => update('footer_description', e.target.value)}
            placeholder="Footer description..."
            className={textareaCls}
            rows={2}
          />
        </Field>
        <Field label="Address">
          <textarea
            value={settings.address}
            onChange={(e) => update('address', e.target.value)}
            placeholder="123 Main St, City, ST"
            className={textareaCls}
            rows={2}
          />
        </Field>
        <Field label="Business Hours">
          <Input
            value={settings.business_hours}
            onChange={(e) => update('business_hours', e.target.value)}
            placeholder="Mon-Sat: 7AM - 7PM"
            className={inputCls}
          />
        </Field>
        <Field label="Copyright">
          <Input
            value={settings.copyright}
            onChange={(e) => update('copyright', e.target.value)}
            placeholder="© 2024 Company. All rights reserved."
            className={inputCls}
          />
        </Field>
      </Section>

      {/* Social */}
      <Section icon={Share2} title="Social Media" open={openSection === 'social'} onToggle={() => toggle('social')}>
        <Field label="Facebook URL">
          <Input
            value={settings.facebook_url}
            onChange={(e) => update('facebook_url', e.target.value)}
            placeholder="https://facebook.com/..."
            className={inputCls}
          />
        </Field>
        <Field label="Instagram URL">
          <Input
            value={settings.instagram_url}
            onChange={(e) => update('instagram_url', e.target.value)}
            placeholder="https://instagram.com/..."
            className={inputCls}
          />
        </Field>
        <Field label="YouTube URL">
          <Input
            value={settings.youtube_url}
            onChange={(e) => update('youtube_url', e.target.value)}
            placeholder="https://youtube.com/..."
            className={inputCls}
          />
        </Field>
        <Field label="Yelp URL">
          <Input
            value={settings.yelp_url}
            onChange={(e) => update('yelp_url', e.target.value)}
            placeholder="https://yelp.com/biz/..."
            className={inputCls}
          />
        </Field>
      </Section>

      {/* Legal Pages */}
      <Section icon={Scale} title="Legal Pages" open={openSection === 'legal'} onToggle={() => toggle('legal')}>
        <Field label="Privacy Policy URL">
          <Input
            value={settings.privacy_policy_url}
            onChange={(e) => update('privacy_policy_url', e.target.value)}
            placeholder="/privacy-policy"
            className={inputCls}
          />
        </Field>
        <Field label="Terms & Conditions URL">
          <Input
            value={settings.terms_url}
            onChange={(e) => update('terms_url', e.target.value)}
            placeholder="/terms-and-conditions"
            className={inputCls}
          />
        </Field>
        <Field label="Cookie Settings URL">
          <Input
            value={settings.cookie_settings_url}
            onChange={(e) => update('cookie_settings_url', e.target.value)}
            placeholder="/cookie-settings"
            className={inputCls}
          />
        </Field>
      </Section>

      {/* Contact Form */}
      <Section icon={Mail} title="Contact Form" open={openSection === 'form'} onToggle={() => toggle('form')}>
        <Field label="Postmark API Token">
          <Input
            value={settings.postmark_api_token}
            onChange={(e) => update('postmark_api_token', e.target.value)}
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            type="password"
            className={inputCls}
          />
        </Field>
        <Field label="Recipient Email">
          <Input
            value={settings.contact_form_to_email}
            onChange={(e) => update('contact_form_to_email', e.target.value)}
            placeholder="leads@yourdomain.com"
            type="email"
            className={inputCls}
          />
        </Field>
        <Field label="Sender Email">
          <Input
            value={settings.contact_form_from_email}
            onChange={(e) => update('contact_form_from_email', e.target.value)}
            placeholder="noreply@yourdomain.com"
            type="email"
            className={inputCls}
          />
        </Field>
        <Field label="Email Subject">
          <Input
            value={settings.contact_form_subject}
            onChange={(e) => update('contact_form_subject', e.target.value)}
            placeholder="New Lead from Website"
            className={inputCls}
          />
        </Field>
      </Section>
    </div>
  );
}
