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
  BarChart3,
  Scale,
  Upload,
  Mail,
  Square,
  Circle,
  RectangleHorizontal,
} from 'lucide-react';
import type { ThemeSettings } from '../../../hooks/useSettings';

// Collapsible section wrapper
function Section({
  icon: Icon,
  title,
  defaultOpen = false,
  children,
}: {
  icon: React.ElementType;
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
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

export function SiteSettingsPanel() {
  const { settings, updateSettings } = useSettingsContext();
  const { globalConfig, updateLogo } = useGlobalConfig();
  const { toast } = useToast();

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
      <Section icon={Building} title="Brand" defaultOpen>
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
              updateSettings({ phone, phone_raw: phone.replace(/\D/g, '') });
            }}
            placeholder="(208) 998-0054"
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

      {/* Google Reviews */}
      <Section icon={Star} title="Google Reviews">
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
      <Section icon={FileText} title="Footer">
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
      <Section icon={Share2} title="Social Media">
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

      {/* Analytics */}
      <Section icon={BarChart3} title="Analytics">
        <Field label="GA4 Measurement ID">
          <Input
            value={settings.ga_measurement_id}
            onChange={(e) => update('ga_measurement_id', e.target.value)}
            placeholder="G-XXXXXXXXXX"
            className={inputCls}
          />
        </Field>
        <Field label="Facebook Pixel ID">
          <Input
            value={settings.fb_pixel_id}
            onChange={(e) => update('fb_pixel_id', e.target.value)}
            placeholder="123456789"
            className={inputCls}
          />
        </Field>
        <Field label="Google Ads Conversion Label">
          <Input
            value={settings.gads_conversion_label}
            onChange={(e) => update('gads_conversion_label', e.target.value)}
            placeholder="AW-XXXXXXXXX/YYYYYYY"
            className={inputCls}
          />
        </Field>
      </Section>

      {/* Legal Pages */}
      <Section icon={Scale} title="Legal Pages">
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
      <Section icon={Mail} title="Contact Form">
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
