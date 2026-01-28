import type { ChangeEvent } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useContent, hasContentEditor } from '../context/ContentContext';
import type {
  ContentSectionId,
  HeroContent,
  FeaturedTestimonialContent,
  ServicesContent,
  MidCtaContent,
  ServiceAreasContent,
  TestimonialsContent,
  FaqContent,
  FooterCtaContent,
  FooterContent,
  ServiceItem,
  AreaItem,
  TestimonialItem,
  FaqItem,
  BadgeIconType,
} from '../context/ContentContext';

type InputChangeEvent = ChangeEvent<HTMLInputElement>;
type TextareaChangeEvent = ChangeEvent<HTMLTextAreaElement>;
import type { SectionId } from '../context/SectionThemeContext';
import { SECTION_LABELS } from '../context/SectionThemeContext';
import { Plus, Trash2, GripVertical, RotateCcw } from 'lucide-react';
import { useToast } from './Toast';

// ============================================
// FORM FIELD COMPONENTS
// ============================================

function FormField({ label, children, description }: { label: string; children: React.ReactNode; description?: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      {description && <p className="text-xs text-gray-500">{description}</p>}
      {children}
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500 pt-2">
      {children}
    </h4>
  );
}

// Badge icon options for the selector
const BADGE_ICON_OPTIONS: { id: BadgeIconType; label: string; icon: React.ReactNode }[] = [
  { id: 'shield', label: 'Shield', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> },
  { id: 'clock', label: 'Clock', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  { id: 'check', label: 'Check', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  { id: 'star', label: 'Star', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg> },
  { id: 'truck', label: 'Truck', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg> },
  { id: 'phone', label: 'Phone', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg> },
  { id: 'map-pin', label: 'Location', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
  { id: 'award', label: 'Award', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15l-2 5 2-1 2 1-2-5zm0 0a6 6 0 100-12 6 6 0 000 12z" /></svg> },
  { id: 'thumbs-up', label: 'Thumbs Up', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg> },
  { id: 'heart', label: 'Heart', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg> },
];

// Badge icon selector component
function BadgeIconSelector({ value, onChange }: { value: BadgeIconType; onChange: (icon: BadgeIconType) => void }) {
  return (
    <div className="grid grid-cols-5 gap-1.5">
      {BADGE_ICON_OPTIONS.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={`flex items-center justify-center p-2 rounded-md border transition-all ${
            value === option.id
              ? 'border-primary-500 bg-primary-50 text-primary-600 ring-2 ring-primary-200'
              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
          }`}
          title={option.label}
        >
          {option.icon}
        </button>
      ))}
    </div>
  );
}

// ============================================
// SECTION-SPECIFIC EDITORS
// ============================================

function HeroEditor({ content, onChange }: { content: HeroContent; onChange: (c: Partial<HeroContent>) => void }) {
  return (
    <div className="space-y-4">
      <SectionHeader>Main Content</SectionHeader>
      <FormField label="Headline">
        <Input value={content.headline} onChange={(e: InputChangeEvent) => onChange({ headline: e.target.value })} />
      </FormField>
      <FormField label="Subheadline">
        <Textarea value={content.subheadline} onChange={(e: TextareaChangeEvent) => onChange({ subheadline: e.target.value })} rows={3} />
      </FormField>

      <Separator />
      <SectionHeader>Call to Action</SectionHeader>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Button Text">
          <Input value={content.ctaText} onChange={(e: InputChangeEvent) => onChange({ ctaText: e.target.value })} />
        </FormField>
        <FormField label="Button Link">
          <Input value={content.ctaLink} onChange={(e: InputChangeEvent) => onChange({ ctaLink: e.target.value })} placeholder="tel: or https://" />
        </FormField>
      </div>

      <Separator />
      <SectionHeader>Trust Badges</SectionHeader>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3 p-3 rounded-lg border border-gray-200 bg-gray-50">
          <FormField label="Badge 1 Icon">
            <BadgeIconSelector value={content.badge1Icon || 'shield'} onChange={(icon) => onChange({ badge1Icon: icon })} />
          </FormField>
          <FormField label="Badge 1 Label">
            <Input value={content.badge1Label} onChange={(e: InputChangeEvent) => onChange({ badge1Label: e.target.value })} />
          </FormField>
          <FormField label="Badge 1 Sublabel">
            <Input value={content.badge1Sublabel} onChange={(e: InputChangeEvent) => onChange({ badge1Sublabel: e.target.value })} />
          </FormField>
        </div>
        <div className="space-y-3 p-3 rounded-lg border border-gray-200 bg-gray-50">
          <FormField label="Badge 2 Icon">
            <BadgeIconSelector value={content.badge2Icon || 'clock'} onChange={(icon) => onChange({ badge2Icon: icon })} />
          </FormField>
          <FormField label="Badge 2 Label">
            <Input value={content.badge2Label} onChange={(e: InputChangeEvent) => onChange({ badge2Label: e.target.value })} />
          </FormField>
          <FormField label="Badge 2 Sublabel">
            <Input value={content.badge2Sublabel} onChange={(e: InputChangeEvent) => onChange({ badge2Sublabel: e.target.value })} />
          </FormField>
        </div>
      </div>
    </div>
  );
}

function FeaturedTestimonialEditor({ content, onChange }: { content: FeaturedTestimonialContent; onChange: (c: Partial<FeaturedTestimonialContent>) => void }) {
  return (
    <div className="space-y-4">
      <SectionHeader>Testimonial</SectionHeader>
      <FormField label="Quote" description="Include quotation marks if desired">
        <Textarea value={content.quote} onChange={(e: TextareaChangeEvent) => onChange({ quote: e.target.value })} rows={4} />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Author Name">
          <Input value={content.authorName} onChange={(e: InputChangeEvent) => onChange({ authorName: e.target.value })} />
        </FormField>
        <FormField label="Author Title">
          <Input value={content.authorTitle} onChange={(e: InputChangeEvent) => onChange({ authorTitle: e.target.value })} />
        </FormField>
      </div>
      <FormField label="Rating (1-5)">
        <Input type="number" min={1} max={5} value={content.rating} onChange={(e: InputChangeEvent) => onChange({ rating: parseInt(e.target.value) || 5 })} />
      </FormField>

      <Separator />
      <SectionHeader>Call to Action</SectionHeader>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Button Text">
          <Input value={content.ctaText} onChange={(e: InputChangeEvent) => onChange({ ctaText: e.target.value })} />
        </FormField>
        <FormField label="Button Link">
          <Input value={content.ctaLink} onChange={(e: InputChangeEvent) => onChange({ ctaLink: e.target.value })} />
        </FormField>
      </div>
    </div>
  );
}

function ServicesEditor({ content, onChange }: { content: ServicesContent; onChange: (c: Partial<ServicesContent>) => void }) {
  const addService = () => {
    const newService: ServiceItem = {
      id: Date.now().toString(),
      icon: 'box',
      title: 'New Service',
      description: 'Service description here.',
    };
    onChange({ services: [...content.services, newService] });
  };

  const updateService = (id: string, updates: Partial<ServiceItem>) => {
    onChange({
      services: content.services.map(s => s.id === id ? { ...s, ...updates } : s),
    });
  };

  const removeService = (id: string) => {
    onChange({ services: content.services.filter(s => s.id !== id) });
  };

  return (
    <div className="space-y-4">
      <SectionHeader>Section Header</SectionHeader>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Headline">
          <Input value={content.headline} onChange={(e: InputChangeEvent) => onChange({ headline: e.target.value })} />
        </FormField>
        <FormField label="Highlight Text">
          <Input value={content.highlightText} onChange={(e: InputChangeEvent) => onChange({ highlightText: e.target.value })} />
        </FormField>
      </div>
      <FormField label="Subheadline">
        <Input value={content.subheadline} onChange={(e: InputChangeEvent) => onChange({ subheadline: e.target.value })} />
      </FormField>

      <Separator />
      <div className="flex items-center justify-between">
        <SectionHeader>Services ({content.services.length})</SectionHeader>
        <Button variant="outline" size="sm" onClick={addService}>
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>

      <div className="space-y-3">
        {content.services.map((service, index) => (
          <div key={service.id} className="p-3 rounded-lg border bg-muted/30 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">#{index + 1}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => removeService(service.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <FormField label="Title">
                <Input value={service.title} onChange={(e: InputChangeEvent) => updateService(service.id, { title: e.target.value })} />
              </FormField>
              <FormField label="Icon">
                <Input value={service.icon} onChange={(e: InputChangeEvent) => updateService(service.id, { icon: e.target.value })} placeholder="trash, home, truck..." />
              </FormField>
            </div>
            <FormField label="Description">
              <Textarea value={service.description} onChange={(e: TextareaChangeEvent) => updateService(service.id, { description: e.target.value })} rows={2} />
            </FormField>
          </div>
        ))}
      </div>
    </div>
  );
}

function MidCtaEditor({ content, onChange }: { content: MidCtaContent; onChange: (c: Partial<MidCtaContent>) => void }) {
  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...content.features];
    newFeatures[index] = value;
    onChange({ features: newFeatures });
  };

  const addFeature = () => {
    onChange({ features: [...content.features, 'New Feature'] });
  };

  const removeFeature = (index: number) => {
    onChange({ features: content.features.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      <SectionHeader>Content</SectionHeader>
      <FormField label="Badge Text">
        <Input value={content.badge} onChange={(e: InputChangeEvent) => onChange({ badge: e.target.value })} />
      </FormField>
      <FormField label="Headline">
        <Input value={content.headline} onChange={(e: InputChangeEvent) => onChange({ headline: e.target.value })} />
      </FormField>
      <FormField label="Subheadline">
        <Textarea value={content.subheadline} onChange={(e: TextareaChangeEvent) => onChange({ subheadline: e.target.value })} rows={2} />
      </FormField>

      <Separator />
      <SectionHeader>Call to Action</SectionHeader>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Button Text">
          <Input value={content.ctaText} onChange={(e: InputChangeEvent) => onChange({ ctaText: e.target.value })} />
        </FormField>
        <FormField label="Button Link">
          <Input value={content.ctaLink} onChange={(e: InputChangeEvent) => onChange({ ctaLink: e.target.value })} />
        </FormField>
      </div>

      <Separator />
      <div className="flex items-center justify-between">
        <SectionHeader>Features</SectionHeader>
        <Button variant="outline" size="sm" onClick={addFeature}>
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>
      <div className="space-y-2">
        {content.features.map((feature, index) => (
          <div key={index} className="flex gap-2">
            <Input value={feature} onChange={(e: InputChangeEvent) => updateFeature(index, e.target.value)} />
            <Button variant="ghost" size="icon" onClick={() => removeFeature(index)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ServiceAreasEditor({ content, onChange }: { content: ServiceAreasContent; onChange: (c: Partial<ServiceAreasContent>) => void }) {
  const addArea = () => {
    const newArea: AreaItem = { id: Date.now().toString(), name: 'New City', state: 'ID' };
    onChange({ areas: [...content.areas, newArea] });
  };

  const updateArea = (id: string, updates: Partial<AreaItem>) => {
    onChange({ areas: content.areas.map(a => a.id === id ? { ...a, ...updates } : a) });
  };

  const removeArea = (id: string) => {
    onChange({ areas: content.areas.filter(a => a.id !== id) });
  };

  return (
    <div className="space-y-4">
      <SectionHeader>Section Header</SectionHeader>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Headline">
          <Input value={content.headline} onChange={(e: InputChangeEvent) => onChange({ headline: e.target.value })} />
        </FormField>
        <FormField label="Highlight Text">
          <Input value={content.highlightText} onChange={(e: InputChangeEvent) => onChange({ highlightText: e.target.value })} />
        </FormField>
      </div>
      <FormField label="Subheadline">
        <Input value={content.subheadline} onChange={(e: InputChangeEvent) => onChange({ subheadline: e.target.value })} />
      </FormField>

      <Separator />
      <SectionHeader>Call to Action</SectionHeader>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Button Text">
          <Input value={content.ctaText} onChange={(e: InputChangeEvent) => onChange({ ctaText: e.target.value })} />
        </FormField>
        <FormField label="Button Link">
          <Input value={content.ctaLink} onChange={(e: InputChangeEvent) => onChange({ ctaLink: e.target.value })} />
        </FormField>
      </div>

      <Separator />
      <div className="flex items-center justify-between">
        <SectionHeader>Service Areas ({content.areas.length})</SectionHeader>
        <Button variant="outline" size="sm" onClick={addArea}>
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {content.areas.map((area) => (
          <div key={area.id} className="flex gap-2 items-center p-2 rounded border bg-muted/30">
            <Input value={area.name} onChange={(e: InputChangeEvent) => updateArea(area.id, { name: e.target.value })} className="flex-1" />
            <Input value={area.state} onChange={(e: InputChangeEvent) => updateArea(area.id, { state: e.target.value })} className="w-16" />
            <Button variant="ghost" size="icon" onClick={() => removeArea(area.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function TestimonialsEditor({ content, onChange }: { content: TestimonialsContent; onChange: (c: Partial<TestimonialsContent>) => void }) {
  const addTestimonial = () => {
    const newItem: TestimonialItem = { id: Date.now().toString(), quote: 'New testimonial...', authorName: 'Customer Name', rating: 5 };
    onChange({ testimonials: [...content.testimonials, newItem] });
  };

  const updateTestimonial = (id: string, updates: Partial<TestimonialItem>) => {
    onChange({ testimonials: content.testimonials.map(t => t.id === id ? { ...t, ...updates } : t) });
  };

  const removeTestimonial = (id: string) => {
    onChange({ testimonials: content.testimonials.filter(t => t.id !== id) });
  };

  return (
    <div className="space-y-4">
      <SectionHeader>Section Header</SectionHeader>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Headline">
          <Input value={content.headline} onChange={(e: InputChangeEvent) => onChange({ headline: e.target.value })} />
        </FormField>
        <FormField label="Highlight Text">
          <Input value={content.highlightText} onChange={(e: InputChangeEvent) => onChange({ highlightText: e.target.value })} />
        </FormField>
      </div>
      <FormField label="Subheadline">
        <Input value={content.subheadline} onChange={(e: InputChangeEvent) => onChange({ subheadline: e.target.value })} />
      </FormField>

      <Separator />
      <SectionHeader>Call to Action</SectionHeader>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Button Text">
          <Input value={content.ctaText} onChange={(e: InputChangeEvent) => onChange({ ctaText: e.target.value })} />
        </FormField>
        <FormField label="Button Link">
          <Input value={content.ctaLink} onChange={(e: InputChangeEvent) => onChange({ ctaLink: e.target.value })} />
        </FormField>
      </div>

      <Separator />
      <div className="flex items-center justify-between">
        <SectionHeader>Testimonials ({content.testimonials.length})</SectionHeader>
        <Button variant="outline" size="sm" onClick={addTestimonial}>
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>
      <div className="space-y-3">
        {content.testimonials.map((item, index) => (
          <div key={item.id} className="p-3 rounded-lg border bg-muted/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">#{index + 1}</span>
              <Button variant="ghost" size="sm" onClick={() => removeTestimonial(item.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <FormField label="Quote">
              <Textarea value={item.quote} onChange={(e: TextareaChangeEvent) => updateTestimonial(item.id, { quote: e.target.value })} rows={2} />
            </FormField>
            <div className="grid grid-cols-2 gap-2">
              <FormField label="Author">
                <Input value={item.authorName} onChange={(e: InputChangeEvent) => updateTestimonial(item.id, { authorName: e.target.value })} />
              </FormField>
              <FormField label="Rating">
                <Input type="number" min={1} max={5} value={item.rating} onChange={(e: InputChangeEvent) => updateTestimonial(item.id, { rating: parseInt(e.target.value) || 5 })} />
              </FormField>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FaqEditor({ content, onChange }: { content: FaqContent; onChange: (c: Partial<FaqContent>) => void }) {
  const addFaq = () => {
    const newItem: FaqItem = { id: Date.now().toString(), question: 'New question?', answer: 'Answer here...' };
    onChange({ faqs: [...content.faqs, newItem] });
  };

  const updateFaq = (id: string, updates: Partial<FaqItem>) => {
    onChange({ faqs: content.faqs.map(f => f.id === id ? { ...f, ...updates } : f) });
  };

  const removeFaq = (id: string) => {
    onChange({ faqs: content.faqs.filter(f => f.id !== id) });
  };

  return (
    <div className="space-y-4">
      <SectionHeader>Section Header</SectionHeader>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Headline">
          <Input value={content.headline} onChange={(e: InputChangeEvent) => onChange({ headline: e.target.value })} />
        </FormField>
        <FormField label="Highlight Text">
          <Input value={content.highlightText} onChange={(e: InputChangeEvent) => onChange({ highlightText: e.target.value })} />
        </FormField>
      </div>
      <FormField label="Subheadline">
        <Input value={content.subheadline} onChange={(e: InputChangeEvent) => onChange({ subheadline: e.target.value })} />
      </FormField>

      <Separator />
      <SectionHeader>Contact Card</SectionHeader>
      <FormField label="Title">
        <Input value={content.contactTitle} onChange={(e: InputChangeEvent) => onChange({ contactTitle: e.target.value })} />
      </FormField>
      <FormField label="Description">
        <Textarea value={content.contactDescription} onChange={(e: TextareaChangeEvent) => onChange({ contactDescription: e.target.value })} rows={2} />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Button Text">
          <Input value={content.contactCtaText} onChange={(e: InputChangeEvent) => onChange({ contactCtaText: e.target.value })} />
        </FormField>
        <FormField label="Button Link">
          <Input value={content.contactCtaLink} onChange={(e: InputChangeEvent) => onChange({ contactCtaLink: e.target.value })} />
        </FormField>
      </div>

      <Separator />
      <div className="flex items-center justify-between">
        <SectionHeader>FAQ Items ({content.faqs.length})</SectionHeader>
        <Button variant="outline" size="sm" onClick={addFaq}>
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>
      <div className="space-y-3">
        {content.faqs.map((item, index) => (
          <div key={item.id} className="p-3 rounded-lg border bg-muted/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">#{index + 1}</span>
              <Button variant="ghost" size="sm" onClick={() => removeFaq(item.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <FormField label="Question">
              <Input value={item.question} onChange={(e: InputChangeEvent) => updateFaq(item.id, { question: e.target.value })} />
            </FormField>
            <FormField label="Answer">
              <Textarea value={item.answer} onChange={(e: TextareaChangeEvent) => updateFaq(item.id, { answer: e.target.value })} rows={3} />
            </FormField>
          </div>
        ))}
      </div>
    </div>
  );
}

function FooterCtaEditor({ content, onChange }: { content: FooterCtaContent; onChange: (c: Partial<FooterCtaContent>) => void }) {
  return (
    <div className="space-y-4">
      <SectionHeader>Content</SectionHeader>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Headline">
          <Input value={content.headline} onChange={(e: InputChangeEvent) => onChange({ headline: e.target.value })} />
        </FormField>
        <FormField label="Highlight Text">
          <Input value={content.highlightText} onChange={(e: InputChangeEvent) => onChange({ highlightText: e.target.value })} />
        </FormField>
      </div>
      <FormField label="Subheadline">
        <Textarea value={content.subheadline} onChange={(e: TextareaChangeEvent) => onChange({ subheadline: e.target.value })} rows={2} />
      </FormField>

      <Separator />
      <SectionHeader>Call to Action</SectionHeader>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Button Text">
          <Input value={content.ctaText} onChange={(e: InputChangeEvent) => onChange({ ctaText: e.target.value })} />
        </FormField>
        <FormField label="Button Link">
          <Input value={content.ctaLink} onChange={(e: InputChangeEvent) => onChange({ ctaLink: e.target.value })} />
        </FormField>
      </div>
    </div>
  );
}

function FooterEditor({ content, onChange }: { content: FooterContent; onChange: (c: Partial<FooterContent>) => void }) {
  return (
    <div className="space-y-4">
      <SectionHeader>Main Content</SectionHeader>
      <FormField label="Description">
        <Textarea value={content.description} onChange={(e: TextareaChangeEvent) => onChange({ description: e.target.value })} rows={2} />
      </FormField>
      <FormField label="Copyright">
        <Input value={content.copyright} onChange={(e: InputChangeEvent) => onChange({ copyright: e.target.value })} />
      </FormField>

      <Separator />
      <SectionHeader>Links</SectionHeader>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Privacy Policy Label">
          <Input value={content.privacyLabel} onChange={(e: InputChangeEvent) => onChange({ privacyLabel: e.target.value })} />
        </FormField>
        <FormField label="Privacy Policy Link">
          <Input value={content.privacyLink} onChange={(e: InputChangeEvent) => onChange({ privacyLink: e.target.value })} />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Terms Label">
          <Input value={content.termsLabel} onChange={(e: InputChangeEvent) => onChange({ termsLabel: e.target.value })} />
        </FormField>
        <FormField label="Terms Link">
          <Input value={content.termsLink} onChange={(e: InputChangeEvent) => onChange({ termsLink: e.target.value })} />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Cookie Label">
          <Input value={content.cookieLabel} onChange={(e: InputChangeEvent) => onChange({ cookieLabel: e.target.value })} />
        </FormField>
        <FormField label="Cookie Link">
          <Input value={content.cookieLink} onChange={(e: InputChangeEvent) => onChange({ cookieLink: e.target.value })} />
        </FormField>
      </div>
    </div>
  );
}

// ============================================
// MAIN MODAL COMPONENT
// ============================================

interface ContentEditorModalProps {
  sectionId: SectionId;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContentEditorModal({ sectionId, open, onOpenChange }: ContentEditorModalProps) {
  const { getContent, updateSectionContent, resetSectionContent } = useContent();
  const { toast } = useToast();

  // Only render for content-enabled sections
  if (!hasContentEditor(sectionId)) {
    return null;
  }

  const contentSectionId = sectionId as ContentSectionId;
  const content = getContent(contentSectionId);

  const handleChange = (updates: Partial<typeof content>) => {
    updateSectionContent(contentSectionId, updates as any);
  };

  const handleReset = () => {
    resetSectionContent(contentSectionId);
    toast('Content reset to default', 'success');
  };

  const renderEditor = () => {
    switch (contentSectionId) {
      case 'hero':
        return <HeroEditor content={content as HeroContent} onChange={handleChange} />;
      case 'featured-testimonial':
        return <FeaturedTestimonialEditor content={content as FeaturedTestimonialContent} onChange={handleChange} />;
      case 'services':
        return <ServicesEditor content={content as ServicesContent} onChange={handleChange} />;
      case 'mid-cta':
        return <MidCtaEditor content={content as MidCtaContent} onChange={handleChange} />;
      case 'service-areas':
        return <ServiceAreasEditor content={content as ServiceAreasContent} onChange={handleChange} />;
      case 'testimonials':
        return <TestimonialsEditor content={content as TestimonialsContent} onChange={handleChange} />;
      case 'faq':
        return <FaqEditor content={content as FaqContent} onChange={handleChange} />;
      case 'footer-cta':
        return <FooterCtaEditor content={content as FooterCtaContent} onChange={handleChange} />;
      case 'footer':
        return <FooterEditor content={content as FooterContent} onChange={handleChange} />;
      default:
        return <p>No editor available for this section.</p>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col bg-white text-gray-900 border-gray-200 overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-gray-900">Edit {SECTION_LABELS[sectionId]} Content</DialogTitle>
          <DialogDescription className="text-gray-600">
            Customize the text, links, and items for this section.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 -mx-6 px-6">
          <div className="py-4 content-editor-light">
            {renderEditor()}
          </div>
        </ScrollArea>

        <div className="flex justify-between pt-4 border-t border-gray-200 flex-shrink-0">
          <Button variant="outline" onClick={handleReset} className="border-gray-300 text-gray-700 hover:bg-gray-100">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Default
          </Button>
          <Button onClick={() => onOpenChange(false)} className="bg-primary-500 hover:bg-primary-600 text-white">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
