/**
 * Content Panel - Section content editing
 * Pure shadcn/ui
 */

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useContent,
  hasContentEditor,
  type ContentSectionId,
  type HeroContent,
  type BadgeIconType,
  type FeaturedTestimonialContent,
  type ServicesContent,
  type ServiceItem,
  type MidCtaContent,
  type FeatureItem,
  type ServiceAreasContent,
  type AreaItem,
  type TestimonialsContent,
  type FaqContent,
  type FooterCtaContent,
  type FooterContent,
} from '../../../context/ContentContext';
import { useHeaderConfig, type TopbarIcon, type TextAlign, type IconPosition } from '../../../context/HeaderConfigContext';
import { useSectionTheme, type SectionId } from '../../../context/SectionThemeContext';
import { Plus, Trash2, FileText, Star, Phone, Mail, MapPin, Ban, Shield, Clock, CheckCircle, Truck, Image as ImageIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';

const TOPBAR_ICON_OPTIONS: { value: TopbarIcon; label: string; icon: typeof MapPin }[] = [
  { value: 'none', label: 'None', icon: Ban },
  { value: 'map-pin', label: 'Map Pin', icon: MapPin },
  { value: 'phone', label: 'Phone', icon: Phone },
  { value: 'star', label: 'Star', icon: Star },
  { value: 'truck', label: 'Truck', icon: Truck },
  { value: 'shield', label: 'Shield', icon: Shield },
  { value: 'clock', label: 'Clock', icon: Clock },
  { value: 'check-circle', label: 'Check', icon: CheckCircle },
];

interface ContentPanelProps {
  sectionId: SectionId;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </Label>
  );
}

function FormField({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
      {hint && <p className="text-[10px] text-muted-foreground/70">{hint}</p>}
    </div>
  );
}

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} onClick={() => onChange(star)} className="p-1 transition-colors">
          <Star
            className={cn(
              "h-5 w-5",
              star <= value ? "text-amber-500 fill-amber-500" : "text-zinc-600 fill-transparent"
            )}
          />
        </button>
      ))}
    </div>
  );
}

// Common Lucide icon names for the picker
const COMMON_ICONS: { value: string; label: string }[] = [
  { value: 'Shield', label: 'Shield' },
  { value: 'ShieldCheck', label: 'Shield Check' },
  { value: 'Clock', label: 'Clock' },
  { value: 'CheckCircle', label: 'Check Circle' },
  { value: 'Star', label: 'Star' },
  { value: 'Award', label: 'Award' },
  { value: 'Trophy', label: 'Trophy' },
  { value: 'Heart', label: 'Heart' },
  { value: 'ThumbsUp', label: 'Thumbs Up' },
  { value: 'Zap', label: 'Zap' },
  { value: 'Rocket', label: 'Rocket' },
  { value: 'Phone', label: 'Phone' },
  { value: 'Mail', label: 'Mail' },
  { value: 'MapPin', label: 'Map Pin' },
  { value: 'Home', label: 'Home' },
  { value: 'Building', label: 'Building' },
  { value: 'Truck', label: 'Truck' },
  { value: 'Package', label: 'Package' },
  { value: 'Box', label: 'Box' },
  { value: 'Wrench', label: 'Wrench' },
  { value: 'Hammer', label: 'Hammer' },
  { value: 'Trash2', label: 'Trash' },
  { value: 'Users', label: 'Users' },
  { value: 'Handshake', label: 'Handshake' },
  { value: 'DollarSign', label: 'Dollar' },
  { value: 'Leaf', label: 'Leaf' },
  { value: 'RefreshCw', label: 'Recycle' },
  { value: 'Target', label: 'Target' },
  { value: 'Crown', label: 'Crown' },
  { value: 'Gem', label: 'Gem' },
  { value: 'Sparkles', label: 'Sparkles' },
  { value: 'BadgeCheck', label: 'Badge Check' },
  { value: 'Timer', label: 'Timer' },
  { value: 'Calendar', label: 'Calendar' },
  { value: 'Lock', label: 'Lock' },
  { value: 'CreditCard', label: 'Credit Card' },
  { value: 'Percent', label: 'Percent' },
  { value: 'Gift', label: 'Gift' },
  { value: 'Flag', label: 'Flag' },
  { value: 'Sun', label: 'Sun' },
];

// Render a Lucide icon preview by name
function LucideIconPreview({ name, className }: { name: string; className?: string }) {
  const Component = (LucideIcons as Record<string, unknown>)[name] as React.ComponentType<{ className?: string }> | undefined;
  if (!Component) return <LucideIcons.HelpCircle className={className || 'h-4 w-4'} />;
  return <Component className={className || 'h-4 w-4'} />;
}

// Icon picker: select Lucide icon or pick image from WP Media Library
function IconPicker({ value, iconType, iconImage, onChangeIcon, onChangeType, onChangeImage, label }: {
  value: string;
  iconType?: 'lucide' | 'image';
  iconImage?: string;
  onChangeIcon: (icon: string) => void;
  onChangeType: (type: 'lucide' | 'image') => void;
  onChangeImage: (url: string) => void;
  label?: string;
}) {
  const type = iconType || 'lucide';

  const handleMediaLibrary = () => {
    if (window.wp?.media) {
      const frame = window.wp.media({
        title: 'Select Icon Image',
        button: { text: 'Use Image' },
        multiple: false,
      });
      frame.on('select', () => {
        const attachment = frame.state().get('selection').first().toJSON();
        onChangeImage(attachment.url);
      });
      frame.open();
    }
  };

  return (
    <div className="space-y-2">
      {label && <Label className="text-xs font-medium text-muted-foreground">{label}</Label>}
      <div className="flex gap-2 mb-2">
        <Button
          size="sm"
          variant={type === 'lucide' ? 'default' : 'outline'}
          onClick={() => onChangeType('lucide')}
          className="flex-1 text-xs"
        >
          <LucideIcons.Sparkles className="h-3 w-3 mr-1" /> Lucide Icon
        </Button>
        <Button
          size="sm"
          variant={type === 'image' ? 'default' : 'outline'}
          onClick={() => onChangeType('image')}
          className="flex-1 text-xs"
        >
          <ImageIcon className="h-3 w-3 mr-1" /> Image
        </Button>
      </div>
      {type === 'lucide' ? (
        <Select value={value} onValueChange={onChangeIcon}>
          <SelectTrigger className="bg-zinc-800 border-zinc-600 text-zinc-100">
            <SelectValue>
              <span className="flex items-center gap-2">
                <LucideIconPreview name={value} />
                {COMMON_ICONS.find(i => i.value === value)?.label || value}
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-zinc-800 border-zinc-700 z-[10001] max-h-60">
            {COMMON_ICONS.map((icon) => (
              <SelectItem key={icon.value} value={icon.value} className="text-zinc-100 focus:bg-zinc-700 focus:text-zinc-100">
                <span className="flex items-center gap-2">
                  <LucideIconPreview name={icon.value} />
                  {icon.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <div className="space-y-2">
          {iconImage && (
            <div className="flex items-center gap-2 p-2 bg-zinc-800 rounded-lg border border-zinc-700">
              <img src={iconImage} alt="" className="w-8 h-8 object-contain rounded" />
              <span className="text-xs text-zinc-400 truncate flex-1">{iconImage.split('/').pop()}</span>
              <Button size="icon" variant="ghost" onClick={() => onChangeImage('')} className="h-6 w-6 shrink-0 text-destructive hover:text-destructive">
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={handleMediaLibrary}
            className="w-full text-xs"
          >
            <LucideIcons.Upload className="h-3 w-3 mr-1" />
            {iconImage ? 'Change Image' : 'Select from Media Library'}
          </Button>
        </div>
      )}
    </div>
  );
}

// Lucide icon picker (simple, no image option) — for features, badges etc.
function LucideIconPicker({ value, onChange, label }: { value: string; onChange: (v: string) => void; label?: string }) {
  return (
    <div className="space-y-2">
      {label && <Label className="text-xs font-medium text-muted-foreground">{label}</Label>}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="bg-zinc-800 border-zinc-600 text-zinc-100">
          <SelectValue>
            <span className="flex items-center gap-2">
              <LucideIconPreview name={value} />
              {COMMON_ICONS.find(i => i.value === value)?.label || value}
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-zinc-800 border-zinc-700 z-[10001] max-h-60">
          {COMMON_ICONS.map((icon) => (
            <SelectItem key={icon.value} value={icon.value} className="text-zinc-100 focus:bg-zinc-700 focus:text-zinc-100">
              <span className="flex items-center gap-2">
                <LucideIconPreview name={icon.value} />
                {icon.label}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// Badge icon type → Lucide name map (for hero trust badges)
const BADGE_TO_LUCIDE: Record<string, string> = {
  'shield': 'Shield', 'shield-check': 'ShieldCheck', 'lock': 'Lock', 'key': 'Key',
  'badge': 'Badge', 'badge-check': 'BadgeCheck', 'check': 'Check', 'check-circle': 'CheckCircle',
  'circle-check': 'CircleCheck', 'thumbs-up': 'ThumbsUp', 'award': 'Award', 'trophy': 'Trophy',
  'medal': 'Medal', 'star': 'Star', 'heart': 'Heart', 'sparkles': 'Sparkles', 'zap': 'Zap',
  'clock': 'Clock', 'timer': 'Timer', 'calendar': 'Calendar', 'hourglass': 'Hourglass',
  'rocket': 'Rocket', 'phone': 'Phone', 'phone-call': 'PhoneCall', 'mail': 'Mail',
  'message-circle': 'MessageCircle', 'headphones': 'Headphones', 'map-pin': 'MapPin',
  'navigation': 'Navigation', 'compass': 'Compass', 'home': 'Home', 'building': 'Building',
  'truck': 'Truck', 'package': 'Package', 'box': 'Box', 'wrench': 'Wrench', 'hammer': 'Hammer',
  'tool': 'Drill', 'users': 'Users', 'user-check': 'UserCheck', 'handshake': 'Handshake',
  'smile': 'Smile', 'dollar-sign': 'DollarSign', 'credit-card': 'CreditCard', 'wallet': 'Wallet',
  'percent': 'Percent', 'tag': 'Tag', 'leaf': 'Leaf', 'recycle': 'Recycle', 'sun': 'Sun',
  'droplet': 'Droplet', 'gift': 'Gift', 'target': 'Target', 'flag': 'Flag', 'crown': 'Crown', 'gem': 'Gem',
};

const LUCIDE_TO_BADGE: Record<string, string> = Object.fromEntries(
  Object.entries(BADGE_TO_LUCIDE).map(([k, v]) => [v, k])
);

// Badge icon picker using the BadgeIconType values but rendering Lucide icons
function BadgeIconPicker({ value, onChange, label }: { value: BadgeIconType; onChange: (v: BadgeIconType) => void; label?: string }) {
  const lucideName = BADGE_TO_LUCIDE[value] || 'Shield';

  return (
    <div className="space-y-2">
      {label && <Label className="text-xs font-medium text-muted-foreground">{label}</Label>}
      <Select value={lucideName} onValueChange={(v) => onChange((LUCIDE_TO_BADGE[v] || 'shield') as BadgeIconType)}>
        <SelectTrigger className="bg-zinc-800 border-zinc-600 text-zinc-100">
          <SelectValue>
            <span className="flex items-center gap-2">
              <LucideIconPreview name={lucideName} />
              {COMMON_ICONS.find(i => i.value === lucideName)?.label || lucideName}
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-zinc-800 border-zinc-700 z-[10001] max-h-60">
          {COMMON_ICONS.map((icon) => (
            <SelectItem key={icon.value} value={icon.value} className="text-zinc-100 focus:bg-zinc-700 focus:text-zinc-100">
              <span className="flex items-center gap-2">
                <LucideIconPreview name={icon.value} />
                {icon.label}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

const HEADLINE_HINT = 'Wrap text in <strong>...</strong> for accent color';

// Hero Content Editor
function HeroContentEditor({ content, onChange }: { content: HeroContent; onChange: (updates: Partial<HeroContent>) => void }) {
  const handleBenefitChange = (index: number, value: string) => {
    const newBenefits = [...(content.benefits || [])];
    newBenefits[index] = value;
    onChange({ benefits: newBenefits });
  };

  const addBenefit = () => {
    onChange({ benefits: [...(content.benefits || []), ''] });
  };

  const removeBenefit = (index: number) => {
    onChange({ benefits: (content.benefits || []).filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <div>
        <SectionTitle>Headlines</SectionTitle>
        <div className="space-y-4 mt-3">
          <FormField label="Headline" hint={HEADLINE_HINT}>
            <Input value={content.headline} onChange={(e) => onChange({ headline: e.target.value })} placeholder="Fast & Reliable <strong>Junk Removal</strong>" />
          </FormField>
          <FormField label="Subheadline">
            <Textarea value={content.subheadline} onChange={(e) => onChange({ subheadline: e.target.value })} placeholder="Supporting text" rows={3} />
          </FormField>
        </div>
      </div>
      <Separator />
      <div>
        <SectionTitle>Benefits</SectionTitle>
        <div className="space-y-2 mt-3">
          {(content.benefits || []).map((benefit, index) => (
            <div key={index} className="flex gap-2">
              <Input value={benefit} onChange={(e) => handleBenefitChange(index, e.target.value)} placeholder={`Benefit ${index + 1}`} className="flex-1" />
              <Button size="icon" variant="ghost" onClick={() => removeBenefit(index)} className="h-9 w-9 shrink-0 text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button size="sm" variant="outline" onClick={addBenefit} className="w-full mt-2">
            <Plus className="h-4 w-4 mr-1" /> Add Benefit
          </Button>
        </div>
      </div>
      <Separator />
      <div>
        <SectionTitle>Trust Badges</SectionTitle>
        <div className="space-y-4 mt-3">
          <Card className="bg-muted">
            <CardContent className="p-3 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Badge 1</Label>
                <Switch checked={content.showBadge1 ?? true} onCheckedChange={(v) => onChange({ showBadge1: v })} />
              </div>
              <BadgeIconPicker value={content.badge1Icon} onChange={(v) => onChange({ badge1Icon: v })} label="Icon" />
              <div className="grid grid-cols-2 gap-2">
                <FormField label="Label">
                  <Input value={content.badge1Label} onChange={(e) => onChange({ badge1Label: e.target.value })} placeholder="Fully Insured" />
                </FormField>
                <FormField label="Sublabel">
                  <Input value={content.badge1Sublabel} onChange={(e) => onChange({ badge1Sublabel: e.target.value })} placeholder="Peace of Mind" />
                </FormField>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-muted">
            <CardContent className="p-3 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Badge 2</Label>
                <Switch checked={content.showBadge2 ?? true} onCheckedChange={(v) => onChange({ showBadge2: v })} />
              </div>
              <BadgeIconPicker value={content.badge2Icon} onChange={(v) => onChange({ badge2Icon: v })} label="Icon" />
              <div className="grid grid-cols-2 gap-2">
                <FormField label="Label">
                  <Input value={content.badge2Label} onChange={(e) => onChange({ badge2Label: e.target.value })} placeholder="Same-Day" />
                </FormField>
                <FormField label="Sublabel">
                  <Input value={content.badge2Sublabel} onChange={(e) => onChange({ badge2Sublabel: e.target.value })} placeholder="Service Available" />
                </FormField>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Separator />
      <div>
        <SectionTitle>Contact Form</SectionTitle>
        <div className="space-y-4 mt-3">
          <FormField label="Form Title">
            <Input value={content.formTitle} onChange={(e) => onChange({ formTitle: e.target.value })} placeholder="Fill Out This Form for Your Free Estimate" />
          </FormField>
          <FormField label="Form Subtitle">
            <Input value={content.formSubtitle} onChange={(e) => onChange({ formSubtitle: e.target.value })} placeholder="We'll get back to you within 30 minutes" />
          </FormField>
          <FormField label="Submit Button Text">
            <Input value={content.formSubmitText} onChange={(e) => onChange({ formSubmitText: e.target.value })} placeholder="Get My Free Quote" />
          </FormField>
        </div>
      </div>
      <Separator />
      <div>
        <SectionTitle>Hero Badge</SectionTitle>
        <div className="space-y-3 mt-3">
          <FormField label="Badge Text">
            <Input value={content.heroBadgeText} onChange={(e) => onChange({ heroBadgeText: e.target.value })} placeholder="Fully Insured. Peace of Mind." />
          </FormField>
        </div>
      </div>
    </div>
  );
}

// Featured Testimonial Editor
function FeaturedTestimonialEditor({ content, onChange }: { content: FeaturedTestimonialContent; onChange: (updates: Partial<FeaturedTestimonialContent>) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <SectionTitle>Labels</SectionTitle>
        <div className="space-y-4 mt-3">
          <FormField label="Badge Text">
            <Input value={content.badgeText} onChange={(e) => onChange({ badgeText: e.target.value })} placeholder="Featured Review" />
          </FormField>
          <FormField label="Verified Text">
            <Input value={content.verifiedText} onChange={(e) => onChange({ verifiedText: e.target.value })} placeholder="Verified Google Review" />
          </FormField>
        </div>
      </div>
      <Separator />
      <div>
        <SectionTitle>Testimonial</SectionTitle>
        <div className="space-y-4 mt-3">
          <FormField label="Quote">
            <Textarea value={content.quote} onChange={(e) => onChange({ quote: e.target.value })} placeholder="Customer quote..." rows={4} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Author Name">
              <Input value={content.authorName} onChange={(e) => onChange({ authorName: e.target.value })} placeholder="John Doe" />
            </FormField>
            <FormField label="Author Title">
              <Input value={content.authorTitle} onChange={(e) => onChange({ authorTitle: e.target.value })} placeholder="Verified Customer" />
            </FormField>
          </div>
          <FormField label="Rating (1-5)">
            <StarRating value={content.rating} onChange={(rating) => onChange({ rating })} />
          </FormField>
        </div>
      </div>
      <Separator />
      <div>
        <SectionTitle>Call to Action</SectionTitle>
        <div className="grid grid-cols-2 gap-4 mt-3">
          <FormField label="Button Text">
            <Input value={content.ctaText} onChange={(e) => onChange({ ctaText: e.target.value })} placeholder="Call For Service" />
          </FormField>
          <FormField label="Button Link">
            <Input value={content.ctaLink} onChange={(e) => onChange({ ctaLink: e.target.value })} placeholder="tel:1234567890" />
          </FormField>
        </div>
      </div>
    </div>
  );
}

// Services Editor
function ServicesContentEditor({ content, onChange }: { content: ServicesContent; onChange: (updates: Partial<ServicesContent>) => void }) {
  const { sectionThemes, updateSectionTheme } = useSectionTheme();
  const servicesTheme = sectionThemes['services'] || {};
  const iconBgEnabled = servicesTheme.iconBgEnabled !== false;
  const iconBgColor = servicesTheme.iconBgColor || '';

  const handleServiceChange = (index: number, updates: Partial<ServiceItem>) => {
    const newServices = [...content.services];
    newServices[index] = { ...newServices[index], ...updates };
    onChange({ services: newServices });
  };

  const addService = () => {
    onChange({ services: [...content.services, { id: Date.now().toString(), icon: 'Wrench', iconType: 'lucide', title: '', description: '' }] });
  };

  const removeService = (index: number) => {
    onChange({ services: content.services.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      {/* Icon Background Control */}
      <div>
        <SectionTitle>Icon Style</SectionTitle>
        <div className="space-y-3 mt-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-muted-foreground">Icon Background</Label>
            <Switch
              checked={iconBgEnabled}
              onCheckedChange={(checked) => updateSectionTheme('services', { iconBgEnabled: checked })}
            />
          </div>
          {iconBgEnabled && (
            <div className="flex items-center gap-2">
              <Label className="text-xs font-medium text-muted-foreground shrink-0">Color</Label>
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="color"
                  value={iconBgColor || '#3ab342'}
                  onChange={(e) => updateSectionTheme('services', { iconBgColor: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer border border-border bg-transparent p-0.5"
                />
                <Input
                  value={iconBgColor}
                  onChange={(e) => updateSectionTheme('services', { iconBgColor: e.target.value })}
                  placeholder="Default (primary)"
                  className="flex-1 h-8 text-xs"
                />
                {iconBgColor && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => updateSectionTheme('services', { iconBgColor: undefined })}
                    className="h-8 w-8 shrink-0 text-muted-foreground"
                    title="Reset to default"
                  >
                    <LucideIcons.RotateCcw className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <Separator />
      <div>
        <SectionTitle>Section Header</SectionTitle>
        <div className="space-y-4 mt-3">
          <FormField label="Badge Text (small uppercase)">
            <Input value={content.badgeText || ''} onChange={(e) => onChange({ badgeText: e.target.value })} placeholder="Full-Service Junk Removal & More" />
          </FormField>
          <FormField label="Headline" hint={HEADLINE_HINT}>
            <Input value={content.headline} onChange={(e) => onChange({ headline: e.target.value })} placeholder="Full-Service <strong>Junk Removal</strong>" />
          </FormField>
          <FormField label="Subheadline">
            <Input value={content.subheadline} onChange={(e) => onChange({ subheadline: e.target.value })} placeholder="Supporting text" />
          </FormField>
        </div>
      </div>
      <Separator />
      <div>
        <SectionTitle>Services</SectionTitle>
        <div className="space-y-3 mt-3">
          {content.services.map((service, index) => (
            <Card key={service.id} className="bg-muted">
              <CardContent className="p-3 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-1 space-y-3">
                    <Input value={service.title} onChange={(e) => handleServiceChange(index, { title: e.target.value })} placeholder="Service title" className="font-medium" />
                    <Textarea value={service.description} onChange={(e) => handleServiceChange(index, { description: e.target.value })} placeholder="Service description" rows={2} />
                    <IconPicker
                      label="Icon"
                      value={service.icon}
                      iconType={service.iconType || 'lucide'}
                      iconImage={service.iconImage}
                      onChangeIcon={(v) => handleServiceChange(index, { icon: v })}
                      onChangeType={(v) => handleServiceChange(index, { iconType: v })}
                      onChangeImage={(v) => handleServiceChange(index, { iconImage: v })}
                    />
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => removeService(index)} className="h-8 w-8 shrink-0 text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          <Button size="sm" variant="outline" onClick={addService} className="w-full">
            <Plus className="h-4 w-4 mr-1" /> Add Service
          </Button>
        </div>
      </div>
    </div>
  );
}

// Mid CTA Editor
function MidCtaContentEditor({ content, onChange }: { content: MidCtaContent; onChange: (updates: Partial<MidCtaContent>) => void }) {
  const handleFeatureChange = (index: number, updates: Partial<FeatureItem>) => {
    const newFeatures = [...content.features];
    newFeatures[index] = { ...newFeatures[index], ...updates };
    onChange({ features: newFeatures });
  };

  const addFeature = () => {
    onChange({ features: [...content.features, { id: Date.now().toString(), icon: 'CheckCircle', text: '' }] });
  };

  const removeFeature = (index: number) => {
    onChange({ features: content.features.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <div>
        <SectionTitle>Content</SectionTitle>
        <div className="space-y-4 mt-3">
          <FormField label="Badge">
            <Input value={content.badge} onChange={(e) => onChange({ badge: e.target.value })} placeholder="Ready to Clear the Clutter?" />
          </FormField>
          <FormField label="Headline" hint={HEADLINE_HINT}>
            <Input value={content.headline} onChange={(e) => onChange({ headline: e.target.value })} placeholder="Get Your <strong>Free Quote</strong> Today" />
          </FormField>
          <FormField label="Subheadline">
            <Textarea value={content.subheadline} onChange={(e) => onChange({ subheadline: e.target.value })} placeholder="Supporting text" rows={2} />
          </FormField>
        </div>
      </div>
      <Separator />
      <div>
        <SectionTitle>Features</SectionTitle>
        <div className="space-y-3 mt-3">
          {content.features.map((feature, index) => (
            <Card key={feature.id} className="bg-muted">
              <CardContent className="p-3 space-y-3">
                <div className="flex gap-2 items-start">
                  <div className="flex-1 space-y-2">
                    <Input value={feature.text} onChange={(e) => handleFeatureChange(index, { text: e.target.value })} placeholder="Feature text" />
                    <LucideIconPicker value={feature.icon} onChange={(v) => handleFeatureChange(index, { icon: v })} label="Icon" />
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => removeFeature(index)} className="h-8 w-8 shrink-0 text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          <Button size="sm" variant="outline" onClick={addFeature} className="w-full">
            <Plus className="h-4 w-4 mr-1" /> Add Feature
          </Button>
        </div>
      </div>
      <Separator />
      <div>
        <SectionTitle>Call to Action</SectionTitle>
        <div className="grid grid-cols-2 gap-4 mt-3">
          <FormField label="Button Text">
            <Input value={content.ctaText} onChange={(e) => onChange({ ctaText: e.target.value })} placeholder="Call Now" />
          </FormField>
          <FormField label="Button Link">
            <Input value={content.ctaLink} onChange={(e) => onChange({ ctaLink: e.target.value })} placeholder="tel:1234567890" />
          </FormField>
        </div>
      </div>
    </div>
  );
}

// Service Areas Editor
function ServiceAreasContentEditor({ content, onChange }: { content: ServiceAreasContent; onChange: (updates: Partial<ServiceAreasContent>) => void }) {
  const handleAreaChange = (index: number, updates: Partial<AreaItem>) => {
    const newAreas = [...content.areas];
    newAreas[index] = { ...newAreas[index], ...updates };
    onChange({ areas: newAreas });
  };

  const addArea = () => {
    onChange({ areas: [...content.areas, { id: Date.now().toString(), name: '', state: '', highlighted: false }] });
  };

  const removeArea = (index: number) => {
    onChange({ areas: content.areas.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <div>
        <SectionTitle>Section Header</SectionTitle>
        <div className="space-y-4 mt-3">
          <FormField label="Badge Text (small uppercase)">
            <Input value={content.badgeText} onChange={(e) => onChange({ badgeText: e.target.value })} placeholder="Areas We Serve" />
          </FormField>
          <FormField label="Headline" hint={HEADLINE_HINT}>
            <Input value={content.headline} onChange={(e) => onChange({ headline: e.target.value })} placeholder="Serving <strong>North Idaho</strong>" />
          </FormField>
          <FormField label="Subheadline">
            <Input value={content.subheadline} onChange={(e) => onChange({ subheadline: e.target.value })} placeholder="Professional junk removal across the region." />
          </FormField>
          <FormField label="Locations Heading">
            <Input value={content.locationsHeading} onChange={(e) => onChange({ locationsHeading: e.target.value })} placeholder="Service Locations" />
          </FormField>
          <FormField label="Missing Area Text">
            <Input value={content.missingAreaText} onChange={(e) => onChange({ missingAreaText: e.target.value })} placeholder="Don't see your area? Contact us..." />
          </FormField>
        </div>
      </div>
      <Separator />
      <div>
        <SectionTitle>Areas</SectionTitle>
        <div className="space-y-2 mt-3">
          {content.areas.map((area, index) => (
            <div key={area.id} className="flex gap-2 items-center">
              <Input value={area.name} onChange={(e) => handleAreaChange(index, { name: e.target.value })} placeholder="City name" className="flex-1" />
              <Input value={area.state} onChange={(e) => handleAreaChange(index, { state: e.target.value })} placeholder="ST" className="w-16" />
              <div className="flex items-center gap-1" title="Highlighted">
                <Switch
                  checked={area.highlighted ?? false}
                  onCheckedChange={(v) => handleAreaChange(index, { highlighted: v })}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
              <Button size="icon" variant="ghost" onClick={() => removeArea(index)} className="h-9 w-9 shrink-0 text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button size="sm" variant="outline" onClick={addArea} className="w-full">
            <Plus className="h-4 w-4 mr-1" /> Add Area
          </Button>
        </div>
      </div>
      <Separator />
      <div>
        <SectionTitle>Call to Action</SectionTitle>
        <div className="grid grid-cols-2 gap-4 mt-3">
          <FormField label="Button Text">
            <Input value={content.ctaText} onChange={(e) => onChange({ ctaText: e.target.value })} placeholder="Get Service" />
          </FormField>
          <FormField label="Button Link">
            <Input value={content.ctaLink} onChange={(e) => onChange({ ctaLink: e.target.value })} placeholder="tel:1234567890" />
          </FormField>
        </div>
      </div>
    </div>
  );
}

// Testimonials Editor
function TestimonialsContentEditor({ content, onChange }: { content: TestimonialsContent; onChange: (updates: Partial<TestimonialsContent>) => void }) {
  const handleTestimonialChange = (index: number, field: string, value: string | number) => {
    const newTestimonials = [...content.testimonials];
    newTestimonials[index] = { ...newTestimonials[index], [field]: value };
    onChange({ testimonials: newTestimonials });
  };

  const addTestimonial = () => {
    onChange({ testimonials: [...content.testimonials, { id: Date.now().toString(), quote: '', authorName: '', rating: 5 }] });
  };

  const removeTestimonial = (index: number) => {
    onChange({ testimonials: content.testimonials.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <div>
        <SectionTitle>Section Header</SectionTitle>
        <div className="space-y-4 mt-3">
          <FormField label="Badge Text (small uppercase)">
            <Input value={content.badgeText} onChange={(e) => onChange({ badgeText: e.target.value })} placeholder="Testimonials" />
          </FormField>
          <FormField label="Headline" hint={HEADLINE_HINT}>
            <Input value={content.headline} onChange={(e) => onChange({ headline: e.target.value })} placeholder="Trusted By <strong>Your Neighbors</strong>" />
          </FormField>
          <FormField label="Subheadline">
            <Input value={content.subheadline} onChange={(e) => onChange({ subheadline: e.target.value })} placeholder="See why homeowners love us" />
          </FormField>
          <FormField label="Review Label">
            <Input value={content.reviewLabel} onChange={(e) => onChange({ reviewLabel: e.target.value })} placeholder="Google Review" />
          </FormField>
        </div>
      </div>
      <Separator />
      <div>
        <SectionTitle>Testimonials</SectionTitle>
        <div className="space-y-3 mt-3">
          {content.testimonials.map((testimonial, index) => (
            <Card key={testimonial.id} className="bg-muted">
              <CardContent className="p-3 space-y-3">
                <Textarea value={testimonial.quote} onChange={(e) => handleTestimonialChange(index, 'quote', e.target.value)} placeholder="Customer quote..." rows={2} />
                <div className="flex gap-2 items-center">
                  <Input value={testimonial.authorName} onChange={(e) => handleTestimonialChange(index, 'authorName', e.target.value)} placeholder="Author name" className="flex-1" />
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} onClick={() => handleTestimonialChange(index, 'rating', star)} className="p-0.5">
                        <Star className={cn("h-4 w-4", star <= testimonial.rating ? "text-amber-500 fill-amber-500" : "text-zinc-600 fill-transparent")} />
                      </button>
                    ))}
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => removeTestimonial(index)} className="h-8 w-8 shrink-0 text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          <Button size="sm" variant="outline" onClick={addTestimonial} className="w-full">
            <Plus className="h-4 w-4 mr-1" /> Add Testimonial
          </Button>
        </div>
      </div>
      <Separator />
      <div>
        <SectionTitle>Call to Action</SectionTitle>
        <div className="grid grid-cols-2 gap-4 mt-3">
          <FormField label="Button Text">
            <Input value={content.ctaText} onChange={(e) => onChange({ ctaText: e.target.value })} placeholder="Call To Get Started" />
          </FormField>
          <FormField label="Button Link">
            <Input value={content.ctaLink} onChange={(e) => onChange({ ctaLink: e.target.value })} placeholder="tel:1234567890" />
          </FormField>
        </div>
      </div>
    </div>
  );
}

// FAQ Editor
function FaqContentEditor({ content, onChange }: { content: FaqContent; onChange: (updates: Partial<FaqContent>) => void }) {
  const handleFaqChange = (index: number, field: string, value: string) => {
    const newFaqs = [...content.faqs];
    newFaqs[index] = { ...newFaqs[index], [field]: value };
    onChange({ faqs: newFaqs });
  };

  const addFaq = () => {
    onChange({ faqs: [...content.faqs, { id: Date.now().toString(), question: '', answer: '' }] });
  };

  const removeFaq = (index: number) => {
    onChange({ faqs: content.faqs.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <div>
        <SectionTitle>Section Header</SectionTitle>
        <div className="space-y-4 mt-3">
          <FormField label="Badge Text (small uppercase)">
            <Input value={content.badgeText} onChange={(e) => onChange({ badgeText: e.target.value })} placeholder="Frequently Asked Questions" />
          </FormField>
          <FormField label="Headline" hint={HEADLINE_HINT}>
            <Input value={content.headline} onChange={(e) => onChange({ headline: e.target.value })} placeholder="Clear answers to <strong>common concerns</strong>" />
          </FormField>
          <FormField label="Subheadline">
            <Input value={content.subheadline} onChange={(e) => onChange({ subheadline: e.target.value })} placeholder="So you can book with confidence" />
          </FormField>
        </div>
      </div>
      <Separator />
      <div>
        <SectionTitle>FAQs</SectionTitle>
        <div className="space-y-3 mt-3">
          {content.faqs.map((faq, index) => (
            <Card key={faq.id} className="bg-muted">
              <CardContent className="p-3 space-y-2">
                <div className="flex gap-2">
                  <Input value={faq.question} onChange={(e) => handleFaqChange(index, 'question', e.target.value)} placeholder="Question?" className="flex-1 font-medium" />
                  <Button size="icon" variant="ghost" onClick={() => removeFaq(index)} className="h-9 w-9 shrink-0 text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Textarea value={faq.answer} onChange={(e) => handleFaqChange(index, 'answer', e.target.value)} placeholder="Answer..." rows={2} />
              </CardContent>
            </Card>
          ))}
          <Button size="sm" variant="outline" onClick={addFaq} className="w-full">
            <Plus className="h-4 w-4 mr-1" /> Add FAQ
          </Button>
        </div>
      </div>
      <Separator />
      <div>
        <SectionTitle>Contact Card</SectionTitle>
        <div className="space-y-4 mt-3">
          <FormField label="Title">
            <Input value={content.contactTitle} onChange={(e) => onChange({ contactTitle: e.target.value })} placeholder="Still have questions?" />
          </FormField>
          <FormField label="Description">
            <Textarea value={content.contactDescription} onChange={(e) => onChange({ contactDescription: e.target.value })} placeholder="Our team is ready to help..." rows={2} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Button Text">
              <Input value={content.contactCtaText} onChange={(e) => onChange({ contactCtaText: e.target.value })} placeholder="(208) 998-0054" />
            </FormField>
            <FormField label="Button Link">
              <Input value={content.contactCtaLink} onChange={(e) => onChange({ contactCtaLink: e.target.value })} placeholder="tel:1234567890" />
            </FormField>
          </div>
        </div>
      </div>
    </div>
  );
}

// Footer CTA Editor
function FooterCtaContentEditor({ content, onChange }: { content: FooterCtaContent; onChange: (updates: Partial<FooterCtaContent>) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <SectionTitle>Content</SectionTitle>
        <div className="space-y-4 mt-3">
          <FormField label="Headline" hint={HEADLINE_HINT}>
            <Input value={content.headline} onChange={(e) => onChange({ headline: e.target.value })} placeholder="Ready to <strong>Clear the Clutter?</strong>" />
          </FormField>
          <FormField label="Subheadline">
            <Textarea value={content.subheadline} onChange={(e) => onChange({ subheadline: e.target.value })} placeholder="Get your free quote today..." rows={2} />
          </FormField>
          <FormField label="Reassurance Text">
            <Input value={content.reassuranceText} onChange={(e) => onChange({ reassuranceText: e.target.value })} placeholder="No obligation · Free estimates · Fast response" />
          </FormField>
        </div>
      </div>
      <Separator />
      <div>
        <SectionTitle>Call to Action</SectionTitle>
        <div className="grid grid-cols-2 gap-4 mt-3">
          <FormField label="Button Text">
            <Input value={content.ctaText} onChange={(e) => onChange({ ctaText: e.target.value })} placeholder="Call For Free Quote" />
          </FormField>
          <FormField label="Button Link">
            <Input value={content.ctaLink} onChange={(e) => onChange({ ctaLink: e.target.value })} placeholder="tel:1234567890" />
          </FormField>
        </div>
      </div>
    </div>
  );
}

// Footer Editor
function FooterContentEditor({ content, onChange }: { content: FooterContent; onChange: (updates: Partial<FooterContent>) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <SectionTitle>Footer Content</SectionTitle>
        <div className="space-y-4 mt-3">
          <FormField label="Description">
            <Textarea value={content.description} onChange={(e) => onChange({ description: e.target.value })} placeholder="Company description..." rows={3} />
          </FormField>
        </div>
      </div>
      <Separator />
      <div>
        <SectionTitle>Legal Links</SectionTitle>
        <div className="space-y-4 mt-3">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Privacy Label">
              <Input value={content.privacyLabel} onChange={(e) => onChange({ privacyLabel: e.target.value })} placeholder="Privacy Policy" />
            </FormField>
            <FormField label="Privacy Link">
              <Input value={content.privacyLink} onChange={(e) => onChange({ privacyLink: e.target.value })} placeholder="/privacy" />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Terms Label">
              <Input value={content.termsLabel} onChange={(e) => onChange({ termsLabel: e.target.value })} placeholder="Terms & Conditions" />
            </FormField>
            <FormField label="Terms Link">
              <Input value={content.termsLink} onChange={(e) => onChange({ termsLink: e.target.value })} placeholder="/terms" />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Cookie Label">
              <Input value={content.cookieLabel} onChange={(e) => onChange({ cookieLabel: e.target.value })} placeholder="Cookie Settings" />
            </FormField>
            <FormField label="Cookie Link">
              <Input value={content.cookieLink} onChange={(e) => onChange({ cookieLink: e.target.value })} placeholder="#cookies" />
            </FormField>
          </div>
        </div>
      </div>
    </div>
  );
}

// Topbar Content Editor
function TopbarContentEditor() {
  const { topbarConfig, updateTopbarConfig } = useHeaderConfig();

  return (
    <div className="space-y-6">
      <div>
        <SectionTitle>Message</SectionTitle>
        <div className="space-y-4 mt-3">
          <FormField label="Text">
            <Input
              value={topbarConfig.message}
              onChange={(e) => updateTopbarConfig({ message: e.target.value })}
              placeholder="Serving North Idaho & Spokane Area"
              className="bg-zinc-800 border-zinc-600 text-zinc-100 placeholder:text-zinc-500"
            />
          </FormField>
        </div>
      </div>

      <Separator className="bg-zinc-800/60" />

      <div>
        <SectionTitle>Icon</SectionTitle>
        <div className="grid grid-cols-2 gap-4 mt-3">
          <FormField label="Icon">
            <Select value={topbarConfig.icon} onValueChange={(v) => updateTopbarConfig({ icon: v as TopbarIcon })}>
              <SelectTrigger className="bg-zinc-800 border-zinc-600 text-zinc-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700 z-[10001]">
                {TOPBAR_ICON_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-zinc-100 focus:bg-zinc-700 focus:text-zinc-100">
                    <span className="flex items-center gap-2">
                      <opt.icon className="h-3.5 w-3.5" />
                      {opt.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Position">
            <Select value={topbarConfig.iconPosition} onValueChange={(v) => updateTopbarConfig({ iconPosition: v as IconPosition })}>
              <SelectTrigger className="bg-zinc-800 border-zinc-600 text-zinc-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700 z-[10001]">
                <SelectItem value="before" className="text-zinc-100 focus:bg-zinc-700 focus:text-zinc-100">Before text</SelectItem>
                <SelectItem value="after" className="text-zinc-100 focus:bg-zinc-700 focus:text-zinc-100">After text</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>
      </div>

      <Separator className="bg-zinc-800/60" />

      <div>
        <SectionTitle>Layout</SectionTitle>
        <div className="space-y-4 mt-3">
          <FormField label="Text Alignment">
            <Select value={topbarConfig.textAlign} onValueChange={(v) => updateTopbarConfig({ textAlign: v as TextAlign })}>
              <SelectTrigger className="bg-zinc-800 border-zinc-600 text-zinc-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700 z-[10001]">
                <SelectItem value="left" className="text-zinc-100 focus:bg-zinc-700 focus:text-zinc-100">Left</SelectItem>
                <SelectItem value="center" className="text-zinc-100 focus:bg-zinc-700 focus:text-zinc-100">Center</SelectItem>
                <SelectItem value="right" className="text-zinc-100 focus:bg-zinc-700 focus:text-zinc-100">Right</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>
      </div>

      <Separator className="bg-zinc-800/60" />

      <div>
        <SectionTitle>Contact Info</SectionTitle>
        <div className="space-y-4 mt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-zinc-400" />
              <Label className="text-sm font-medium text-zinc-100">Show Phone</Label>
            </div>
            <Switch checked={topbarConfig.showPhone} onCheckedChange={(v) => updateTopbarConfig({ showPhone: v })} className="data-[state=checked]:bg-emerald-600 data-[state=unchecked]:bg-zinc-600" />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-zinc-400" />
              <Label className="text-sm font-medium text-zinc-100">Show Email</Label>
            </div>
            <Switch checked={topbarConfig.showEmail} onCheckedChange={(v) => updateTopbarConfig({ showEmail: v })} className="data-[state=checked]:bg-emerald-600 data-[state=unchecked]:bg-zinc-600" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ContentPanel({ sectionId }: ContentPanelProps) {
  const { getContent, updateSectionContent } = useContent();

  // Topheader has its own content editor (via HeaderConfigContext)
  if (sectionId === 'topheader') {
    return <TopbarContentEditor />;
  }

  if (!hasContentEditor(sectionId)) {
    return (
      <Card className="bg-muted">
        <CardContent className="p-6 text-center">
          <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm font-medium">No content editor</p>
          <p className="text-xs mt-1 text-muted-foreground">This section doesn&apos;t have editable content.</p>
        </CardContent>
      </Card>
    );
  }

  const contentSectionId = sectionId as ContentSectionId;
  const content = getContent(contentSectionId);

  const handleChange = (updates: Partial<typeof content>) => {
    updateSectionContent(contentSectionId, updates);
  };

  switch (contentSectionId) {
    case 'hero':
      return <HeroContentEditor content={content as HeroContent} onChange={handleChange} />;
    case 'featured-testimonial':
      return <FeaturedTestimonialEditor content={content as FeaturedTestimonialContent} onChange={handleChange} />;
    case 'services':
      return <ServicesContentEditor content={content as ServicesContent} onChange={handleChange} />;
    case 'mid-cta':
      return <MidCtaContentEditor content={content as MidCtaContent} onChange={handleChange} />;
    case 'service-areas':
      return <ServiceAreasContentEditor content={content as ServiceAreasContent} onChange={handleChange} />;
    case 'testimonials':
      return <TestimonialsContentEditor content={content as TestimonialsContent} onChange={handleChange} />;
    case 'faq':
      return <FaqContentEditor content={content as FaqContent} onChange={handleChange} />;
    case 'footer-cta':
      return <FooterCtaContentEditor content={content as FooterCtaContent} onChange={handleChange} />;
    case 'footer':
      return <FooterContentEditor content={content as FooterContent} onChange={handleChange} />;
    default:
      return null;
  }
}
