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
  type FeaturedTestimonialContent,
  type ServicesContent,
  type MidCtaContent,
  type ServiceAreasContent,
  type TestimonialsContent,
  type FaqContent,
  type FooterCtaContent,
  type FooterContent,
} from '../../../context/ContentContext';
import { useHeaderConfig, type TopbarIcon, type TextAlign, type IconPosition } from '../../../context/HeaderConfigContext';
import type { SectionId } from '../../../context/SectionThemeContext';
import { Plus, Trash2, FileText, Star, Phone, Mail, MapPin, Ban, Shield, Clock, CheckCircle, Truck } from 'lucide-react';
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

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
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

// Hero Content Editor
function HeroContentEditor({ content, onChange }: { content: HeroContent; onChange: (updates: Partial<HeroContent>) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <SectionTitle>Headlines</SectionTitle>
        <div className="space-y-4 mt-3">
          <FormField label="Headline">
            <Input value={content.headline} onChange={(e) => onChange({ headline: e.target.value })} placeholder="Main headline" />
          </FormField>
          <FormField label="Subheadline">
            <Textarea value={content.subheadline} onChange={(e) => onChange({ subheadline: e.target.value })} placeholder="Supporting text" rows={3} />
          </FormField>
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
  const handleServiceChange = (index: number, field: string, value: string) => {
    const newServices = [...content.services];
    newServices[index] = { ...newServices[index], [field]: value };
    onChange({ services: newServices });
  };

  const addService = () => {
    onChange({ services: [...content.services, { id: Date.now().toString(), icon: 'wrench', title: '', description: '' }] });
  };

  const removeService = (index: number) => {
    onChange({ services: content.services.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <div>
        <SectionTitle>Section Header</SectionTitle>
        <div className="space-y-4 mt-3">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Headline">
              <Input value={content.headline} onChange={(e) => onChange({ headline: e.target.value })} placeholder="Our" />
            </FormField>
            <FormField label="Highlight Text">
              <Input value={content.highlightText} onChange={(e) => onChange({ highlightText: e.target.value })} placeholder="Services" />
            </FormField>
          </div>
          <FormField label="Subheadline">
            <Input value={content.subheadline} onChange={(e) => onChange({ subheadline: e.target.value })} placeholder="Supporting text" />
          </FormField>
        </div>
      </div>
      <Separator />
      <div>
        <div className="flex items-center justify-between mb-3">
          <SectionTitle>Services</SectionTitle>
          <Button size="sm" variant="outline" onClick={addService}>
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
        <div className="space-y-3">
          {content.services.map((service, index) => (
            <Card key={service.id} className="bg-muted">
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  <div className="flex-1 space-y-3">
                    <Input value={service.title} onChange={(e) => handleServiceChange(index, 'title', e.target.value)} placeholder="Service title" className="font-medium" />
                    <Textarea value={service.description} onChange={(e) => handleServiceChange(index, 'description', e.target.value)} placeholder="Service description" rows={2} />
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => removeService(index)} className="h-8 w-8 shrink-0 text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// Mid CTA Editor
function MidCtaContentEditor({ content, onChange }: { content: MidCtaContent; onChange: (updates: Partial<MidCtaContent>) => void }) {
  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...content.features];
    newFeatures[index] = value;
    onChange({ features: newFeatures });
  };

  return (
    <div className="space-y-6">
      <div>
        <SectionTitle>Content</SectionTitle>
        <div className="space-y-4 mt-3">
          <FormField label="Badge">
            <Input value={content.badge} onChange={(e) => onChange({ badge: e.target.value })} placeholder="Ready to Clear the Clutter?" />
          </FormField>
          <FormField label="Headline">
            <Input value={content.headline} onChange={(e) => onChange({ headline: e.target.value })} placeholder="Get Your Free Quote Today" />
          </FormField>
          <FormField label="Subheadline">
            <Textarea value={content.subheadline} onChange={(e) => onChange({ subheadline: e.target.value })} placeholder="Supporting text" rows={2} />
          </FormField>
        </div>
      </div>
      <Separator />
      <div>
        <SectionTitle>Features</SectionTitle>
        <div className="space-y-2 mt-3">
          {content.features.map((feature, index) => (
            <Input key={index} value={feature} onChange={(e) => handleFeatureChange(index, e.target.value)} placeholder={`Feature ${index + 1}`} />
          ))}
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
  const handleAreaChange = (index: number, field: string, value: string) => {
    const newAreas = [...content.areas];
    newAreas[index] = { ...newAreas[index], [field]: value };
    onChange({ areas: newAreas });
  };

  const addArea = () => {
    onChange({ areas: [...content.areas, { id: Date.now().toString(), name: '', state: '' }] });
  };

  const removeArea = (index: number) => {
    onChange({ areas: content.areas.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <div>
        <SectionTitle>Section Header</SectionTitle>
        <div className="space-y-4 mt-3">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Headline">
              <Input value={content.headline} onChange={(e) => onChange({ headline: e.target.value })} placeholder="Serving" />
            </FormField>
            <FormField label="Highlight Text">
              <Input value={content.highlightText} onChange={(e) => onChange({ highlightText: e.target.value })} placeholder="North Idaho" />
            </FormField>
          </div>
        </div>
      </div>
      <Separator />
      <div>
        <div className="flex items-center justify-between mb-3">
          <SectionTitle>Areas</SectionTitle>
          <Button size="sm" variant="outline" onClick={addArea}>
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
        <div className="space-y-2">
          {content.areas.map((area, index) => (
            <div key={area.id} className="flex gap-2">
              <Input value={area.name} onChange={(e) => handleAreaChange(index, 'name', e.target.value)} placeholder="City name" className="flex-1" />
              <Input value={area.state} onChange={(e) => handleAreaChange(index, 'state', e.target.value)} placeholder="ST" className="w-16" />
              <Button size="icon" variant="ghost" onClick={() => removeArea(index)} className="h-9 w-9 shrink-0 text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
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
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Headline">
              <Input value={content.headline} onChange={(e) => onChange({ headline: e.target.value })} placeholder="Trusted By" />
            </FormField>
            <FormField label="Highlight Text">
              <Input value={content.highlightText} onChange={(e) => onChange({ highlightText: e.target.value })} placeholder="Your Neighbors" />
            </FormField>
          </div>
          <FormField label="Subheadline">
            <Input value={content.subheadline} onChange={(e) => onChange({ subheadline: e.target.value })} placeholder="See why homeowners love us" />
          </FormField>
        </div>
      </div>
      <Separator />
      <div>
        <div className="flex items-center justify-between mb-3">
          <SectionTitle>Testimonials</SectionTitle>
          <Button size="sm" variant="outline" onClick={addTestimonial}>
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
        <div className="space-y-3">
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
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Headline">
              <Input value={content.headline} onChange={(e) => onChange({ headline: e.target.value })} placeholder="Clear answers to" />
            </FormField>
            <FormField label="Highlight Text">
              <Input value={content.highlightText} onChange={(e) => onChange({ highlightText: e.target.value })} placeholder="common concerns" />
            </FormField>
          </div>
        </div>
      </div>
      <Separator />
      <div>
        <div className="flex items-center justify-between mb-3">
          <SectionTitle>FAQs</SectionTitle>
          <Button size="sm" variant="outline" onClick={addFaq}>
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
        <div className="space-y-3">
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
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Headline">
              <Input value={content.headline} onChange={(e) => onChange({ headline: e.target.value })} placeholder="Ready to" />
            </FormField>
            <FormField label="Highlight Text">
              <Input value={content.highlightText} onChange={(e) => onChange({ highlightText: e.target.value })} placeholder="Clear the Clutter?" />
            </FormField>
          </div>
          <FormField label="Subheadline">
            <Textarea value={content.subheadline} onChange={(e) => onChange({ subheadline: e.target.value })} placeholder="Get your free quote today..." rows={2} />
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
          <FormField label="Copyright">
            <Input value={content.copyright} onChange={(e) => onChange({ copyright: e.target.value })} placeholder="© 2024 Company Name. All rights reserved." />
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

      <Separator className="bg-zinc-700" />

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

      <Separator className="bg-zinc-700" />

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

      <Separator className="bg-zinc-700" />

      <div>
        <SectionTitle>Contact Info</SectionTitle>
        <div className="space-y-4 mt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-zinc-400" />
              <Label className="text-sm font-medium text-zinc-100">Show Phone</Label>
            </div>
            <Switch checked={topbarConfig.showPhone} onCheckedChange={(v) => updateTopbarConfig({ showPhone: v })} className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-zinc-600" />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-zinc-400" />
              <Label className="text-sm font-medium text-zinc-100">Show Email</Label>
            </div>
            <Switch checked={topbarConfig.showEmail} onCheckedChange={(v) => updateTopbarConfig({ showEmail: v })} className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-zinc-600" />
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
