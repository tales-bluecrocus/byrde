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
import { handlePhoneInput } from '../../../lib/phone';

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
            onChange={(e) => updateSettings(handlePhoneInput(e.target.value))}
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

      {/* Colors */}
      <Section icon={Palette} title="Colors" open={openSection === 'colors'} onToggle={() => toggle('colors')}>
        {/* Default Mode */}
        <div>
          <Label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Default Mode</Label>
          <p className="text-[10px] text-zinc-600 mt-0.5 mb-1.5">Choose the base appearance for your pages</p>
          <ToggleGroup
            type="single"
            value={settings.brand_mode || 'dark'}
            onValueChange={(val) => { if (val) update('brand_mode', val); }}
            className="w-full bg-zinc-800 p-1 rounded-lg"
          >
            <ToggleGroupItem value="dark" className="flex-1 gap-1.5 text-zinc-400 data-[state=on]:bg-zinc-700 data-[state=on]:text-zinc-100">
              <Moon className="h-3 w-3" /> Dark
            </ToggleGroupItem>
            <ToggleGroupItem value="light" className="flex-1 gap-1.5 text-zinc-400 data-[state=on]:bg-zinc-700 data-[state=on]:text-zinc-100">
              <Sun className="h-3 w-3" /> Light
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="border-t border-zinc-800 my-1" />

        {/* Mode colors */}
        {(() => {
          const [colorTab, setColorTab] = useState<'dark' | 'light'>(
            (settings.brand_mode as 'dark' | 'light') || 'dark'
          );
          const prefix = colorTab === 'dark' ? 'brand_dark' : 'brand_light';

          return (
            <>
              <div>
                <Label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Mode Colors</Label>
                <p className="text-[10px] text-zinc-600 mt-0.5 mb-1.5">Set brand colors for each mode</p>
              </div>
              <ToggleGroup
                type="single"
                value={colorTab}
                onValueChange={(val) => { if (val) setColorTab(val as 'dark' | 'light'); }}
                className="w-full bg-zinc-800 p-1 rounded-lg"
              >
                <ToggleGroupItem value="dark" className="flex-1 gap-1.5 text-zinc-400 data-[state=on]:bg-zinc-600 data-[state=on]:text-zinc-100">
                  <Moon className="h-3 w-3" /> Dark
                </ToggleGroupItem>
                <ToggleGroupItem value="light" className="flex-1 gap-1.5 text-zinc-400 data-[state=on]:bg-zinc-600 data-[state=on]:text-zinc-100">
                  <Sun className="h-3 w-3" /> Light
                </ToggleGroupItem>
              </ToggleGroup>

              <div className="grid grid-cols-2 gap-2">
                <Field label="Primary">
                  <ColorPicker value={settings[`${prefix}_primary` as keyof ThemeSettings] as string} onChange={(val) => update(`${prefix}_primary` as keyof ThemeSettings, val)} />
                </Field>
                <Field label="Accent">
                  <ColorPicker value={settings[`${prefix}_accent` as keyof ThemeSettings] as string} onChange={(val) => update(`${prefix}_accent` as keyof ThemeSettings, val)} />
                </Field>
              </div>
              <Field label="Text">
                <ColorPicker value={settings[`${prefix}_text` as keyof ThemeSettings] as string} onChange={(val) => update(`${prefix}_text` as keyof ThemeSettings, val)} />
              </Field>
            </>
          );
        })()}
      </Section>

      {/* Buttons */}
      <Section icon={MousePointerClick} title="Buttons" open={openSection === 'buttons'} onToggle={() => toggle('buttons')}>
        {/* Mode tabs for button text colors + preview */}
        {(() => {
          const [btnTab, setBtnTab] = useState<'dark' | 'light'>(
            (settings.brand_mode as 'dark' | 'light') || 'dark'
          );
          const isDark = btnTab === 'dark';
          const brandPrefix = isDark ? 'brand_dark' : 'brand_light';
          const btnPrefix = isDark ? 'button_dark' : 'button_light';
          const primary = settings[`${brandPrefix}_primary` as keyof ThemeSettings] as string;
          const accent = settings[`${brandPrefix}_accent` as keyof ThemeSettings] as string;
          const btnTextColor = settings[`${btnPrefix}_text_color` as keyof ThemeSettings] as string;
          const btnAccentTextColor = settings[`${btnPrefix}_accent_text_color` as keyof ThemeSettings] as string;

          const shadow = {
            none: 'none',
            sm: '0 2px 8px -2px rgba(0,0,0,0.15)',
            md: '0 4px 14px -3px rgba(0,0,0,0.25)',
            lg: '0 8px 24px -4px rgba(0,0,0,0.35)',
          }[settings.button_shadow || 'md'];
          const radius = `${settings.button_border_radius || '12'}px`;

          return (
            <>
              <ToggleGroup
                type="single"
                value={btnTab}
                onValueChange={(val) => { if (val) setBtnTab(val as 'dark' | 'light'); }}
                className="w-full bg-zinc-800 p-1 rounded-lg"
              >
                <ToggleGroupItem value="dark" className="flex-1 gap-1.5 text-zinc-400 data-[state=on]:bg-zinc-600 data-[state=on]:text-zinc-100">
                  <Moon className="h-3 w-3" /> Dark
                </ToggleGroupItem>
                <ToggleGroupItem value="light" className="flex-1 gap-1.5 text-zinc-400 data-[state=on]:bg-zinc-600 data-[state=on]:text-zinc-100">
                  <Sun className="h-3 w-3" /> Light
                </ToggleGroupItem>
              </ToggleGroup>

              {/* Preview */}
              <div className="flex justify-center gap-3 py-2">
                <div
                  className="px-5 py-2 font-semibold text-xs transition-all"
                  style={{ backgroundColor: primary || '#3ab342', color: btnTextColor || '#ffffff', borderRadius: radius, boxShadow: shadow }}
                >
                  Primary
                </div>
                <div
                  className="px-5 py-2 font-semibold text-xs transition-all"
                  style={{ backgroundColor: accent || '#f97316', color: btnAccentTextColor || (isDark ? '#ffffff' : '#000000'), borderRadius: radius, boxShadow: shadow }}
                >
                  Accent
                </div>
              </div>

              {/* Text colors */}
              <div className="grid grid-cols-2 gap-2">
                <Field label="Primary Text">
                  <ColorPicker value={btnTextColor || '#ffffff'} onChange={(val) => update(`${btnPrefix}_text_color` as keyof ThemeSettings, val)} />
                </Field>
                <Field label="Accent Text">
                  <ColorPicker value={btnAccentTextColor || (isDark ? '#ffffff' : '#000000')} onChange={(val) => update(`${btnPrefix}_accent_text_color` as keyof ThemeSettings, val)} />
                </Field>
              </div>
            </>
          );
        })()}

        {/* Shape (shared across modes) */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-[11px] font-medium text-zinc-400">Radius</Label>
            <ToggleGroup
              type="single"
              value={settings.button_border_radius || '12'}
              onValueChange={(val) => val && update('button_border_radius', val)}
              className="w-full bg-zinc-800 p-1 rounded-lg mt-1.5"
            >
              <ToggleGroupItem value="0" className="flex-1 text-[10px] text-zinc-400 data-[state=on]:bg-zinc-700 data-[state=on]:text-zinc-100">0</ToggleGroupItem>
              <ToggleGroupItem value="4" className="flex-1 text-[10px] text-zinc-400 data-[state=on]:bg-zinc-700 data-[state=on]:text-zinc-100">S</ToggleGroupItem>
              <ToggleGroupItem value="12" className="flex-1 text-[10px] text-zinc-400 data-[state=on]:bg-zinc-700 data-[state=on]:text-zinc-100">M</ToggleGroupItem>
              <ToggleGroupItem value="9999" className="flex-1 text-[10px] text-zinc-400 data-[state=on]:bg-zinc-700 data-[state=on]:text-zinc-100">Full</ToggleGroupItem>
            </ToggleGroup>
          </div>
          <div>
            <Label className="text-[11px] font-medium text-zinc-400">Shadow</Label>
            <ToggleGroup
              type="single"
              value={settings.button_shadow || 'md'}
              onValueChange={(val) => val && update('button_shadow', val)}
              className="w-full bg-zinc-800 p-1 rounded-lg mt-1.5"
            >
              <ToggleGroupItem value="none" className="flex-1 text-[10px] text-zinc-400 data-[state=on]:bg-zinc-700 data-[state=on]:text-zinc-100">0</ToggleGroupItem>
              <ToggleGroupItem value="sm" className="flex-1 text-[10px] text-zinc-400 data-[state=on]:bg-zinc-700 data-[state=on]:text-zinc-100">S</ToggleGroupItem>
              <ToggleGroupItem value="md" className="flex-1 text-[10px] text-zinc-400 data-[state=on]:bg-zinc-700 data-[state=on]:text-zinc-100">M</ToggleGroupItem>
              <ToggleGroupItem value="lg" className="flex-1 text-[10px] text-zinc-400 data-[state=on]:bg-zinc-700 data-[state=on]:text-zinc-100">L</ToggleGroupItem>
            </ToggleGroup>
          </div>
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
