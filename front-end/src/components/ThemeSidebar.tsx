import { useState, useRef } from 'react';
import { useSectionTheme, SECTION_LABELS } from '../context/SectionThemeContext';
import { useHeaderConfig } from '../context/HeaderConfigContext';
import { useGlobalConfig } from '../context/GlobalConfigContext';
import { useSidebar, SIDEBAR_WIDTH } from '../context/SidebarContext';
import { hasContentEditor, useContent } from '../context/ContentContext';
import { useToast } from './Toast';
import { ContentEditorModal } from './ContentEditorModal';
import type { SectionId, SectionTheme } from '../context/SectionThemeContext';
import { brandPresets, type GeneratedPalette } from '../utils/colorUtils';

// shadcn/ui components
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ColorPicker } from '@/components/ui/color-picker';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Icons from lucide-react
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Palette,
  Globe,
  LayoutList,
  FileText,
  Copy,
  RotateCcw,
  RefreshCw,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Check,
  Image,
  Square,
  Circle,
  RectangleHorizontal,
  Save,
  Upload,
  X,
  Pencil,
  // Download, // TODO: uncomment when Load/Export is implemented
  // Topbar icons
  MapPin,
  Phone,
  Star,
  Truck,
  Shield,
  Clock,
  CheckCircle,
  Ban,
  // Alignment icons
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';
import type { TopbarIcon, TextAlign, IconPosition, HeaderPadding } from '../context/HeaderConfigContext';

type SectionPalette = GeneratedPalette;

// Section anchor IDs for scroll navigation
const SECTION_ANCHOR_IDS: Record<string, string> = {
  topheader: 'topheader-section',
  header: 'header-section',
  hero: 'hero-section',
  'featured-testimonial': 'featured-testimonial-section',
  services: 'services-section',
  'mid-cta': 'mid-cta-section',
  'service-areas': 'service-areas-section',
  testimonials: 'testimonials-section',
  faq: 'faq-section',
  'footer-cta': 'footer-cta-section',
  footer: 'footer-section',
};

function scrollToSection(sectionId: string) {
  const anchorId = SECTION_ANCHOR_IDS[sectionId];
  if (anchorId) {
    const element = document.getElementById(anchorId);
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// Topbar icon options with their Lucide components
const TOPBAR_ICONS: { id: TopbarIcon; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'none', label: 'None', icon: Ban },
  { id: 'map-pin', label: 'Location', icon: MapPin },
  { id: 'phone', label: 'Phone', icon: Phone },
  { id: 'star', label: 'Star', icon: Star },
  { id: 'truck', label: 'Truck', icon: Truck },
  { id: 'shield', label: 'Shield', icon: Shield },
  { id: 'clock', label: 'Clock', icon: Clock },
  { id: 'check-circle', label: 'Check', icon: CheckCircle },
];

// Text alignment options
const TEXT_ALIGN_OPTIONS: { id: TextAlign; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'left', label: 'Left', icon: AlignLeft },
  { id: 'center', label: 'Center', icon: AlignCenter },
  { id: 'right', label: 'Right', icon: AlignRight },
];

// Icon position options
const ICON_POSITION_OPTIONS: { id: IconPosition; label: string }[] = [
  { id: 'before', label: 'Before' },
  { id: 'after', label: 'After' },
];

// Header padding options
const HEADER_PADDING_OPTIONS: { id: HeaderPadding; label: string }[] = [
  { id: 'compact', label: 'Compact' },
  { id: 'default', label: 'Default' },
  { id: 'spacious', label: 'Spacious' },
];

// ============================================
// REUSABLE FORM COMPONENTS
// ============================================

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-[hsl(var(--sidebar-muted-foreground))]">{label}</Label>
      {children}
    </div>
  );
}

function ToggleRow({ label, checked, onChange, description }: {
  label: string;
  checked: boolean;
  onChange: (val: boolean) => void;
  description?: string;
}) {
  return (
    <div className="flex items-center justify-between py-1.5 px-2 -mx-2 rounded-md transition-colors hover:bg-[hsl(var(--sidebar-accent)/0.5)]">
      <div className="space-y-0.5">
        <Label className="text-sm text-[hsl(var(--sidebar-foreground))] cursor-pointer">{label}</Label>
        {description && (
          <p className="text-[10px] text-[hsl(var(--sidebar-muted-foreground))]">{description}</p>
        )}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-xs font-medium uppercase tracking-wider text-[hsl(var(--sidebar-muted-foreground))] mb-2">
      {children}
    </h4>
  );
}

// Segmented control for icon/alignment selection
function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = 'default',
}: {
  options: { id: T; label: string; icon?: React.ComponentType<{ className?: string }> }[];
  value: T;
  onChange: (val: T) => void;
  size?: 'default' | 'sm';
}) {
  return (
    <div className="flex gap-1 p-1 rounded-lg bg-[hsl(var(--sidebar-accent)/0.3)]">
      {options.map(({ id, label, icon: Icon }) => {
        const isSelected = value === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 rounded-md transition-all duration-150",
              size === 'sm' ? "px-2 py-1.5 text-[10px]" : "px-3 py-2 text-xs",
              isSelected
                ? "bg-[hsl(var(--sidebar-primary))] text-white shadow-sm scale-[1.02]"
                : "text-[hsl(var(--sidebar-muted-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))] active:scale-95"
            )}
            title={label}
          >
            {Icon && <Icon className={size === 'sm' ? "h-3 w-3" : "h-3.5 w-3.5"} />}
            {!Icon && <span className="font-medium">{label}</span>}
          </button>
        );
      })}
    </div>
  );
}

// Icon grid selector for topbar icons
function IconSelector({
  options,
  value,
  onChange,
}: {
  options: { id: TopbarIcon; label: string; icon: React.ComponentType<{ className?: string }> }[];
  value: TopbarIcon;
  onChange: (val: TopbarIcon) => void;
}) {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="grid grid-cols-4 gap-1.5">
        {options.map(({ id, label, icon: Icon }) => {
          const isSelected = value === id;
          return (
            <Tooltip key={id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onChange(id)}
                  className={cn(
                    "flex items-center justify-center h-9 rounded-md transition-all duration-150",
                    isSelected
                      ? "bg-[hsl(var(--sidebar-primary))] text-white shadow-sm ring-2 ring-[hsl(var(--sidebar-primary))] ring-offset-1 ring-offset-[hsl(var(--sidebar-background))]"
                      : "bg-[hsl(var(--sidebar-accent)/0.3)] text-[hsl(var(--sidebar-muted-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))] active:scale-95"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {label}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}

// ============================================
// PALETTE PICKER
// ============================================

function PaletteGrid({
  palettes,
  selectedId,
  onSelect,
}: {
  palettes: SectionPalette[];
  selectedId?: string;
  onSelect: (palette: SectionPalette) => void;
}) {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="grid grid-cols-4 gap-2">
        {palettes.map((palette) => {
          const isSelected = selectedId === palette.id;
          return (
            <Tooltip key={palette.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onSelect(palette)}
                  className={cn(
                    "relative rounded-lg overflow-hidden h-12",
                    "transition-all duration-150",
                    "hover:scale-105 active:scale-95",
                    isSelected
                      ? "ring-2 ring-[hsl(var(--sidebar-primary))] ring-offset-1 ring-offset-[hsl(var(--sidebar-background))] shadow-md"
                      : "ring-1 ring-[hsl(var(--sidebar-border))] hover:ring-[hsl(var(--sidebar-muted-foreground))] hover:shadow-sm"
                  )}
                >
                  <div className="flex h-full">
                    <div className="flex-1" style={{ backgroundColor: palette.colors.bgPrimary }} />
                    <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: palette.colors.bgSecondary }}>
                      <span className="text-[8px] font-bold" style={{ color: palette.colors.textPrimary }}>Aa</span>
                    </div>
                    <div className="flex-1" style={{ backgroundColor: palette.colors.accent }} />
                  </div>
                  {isSelected && (
                    <div className="absolute top-1 right-1 h-4 w-4 rounded-full bg-[hsl(var(--sidebar-primary))] flex items-center justify-center animate-in zoom-in-50 duration-200">
                      <Check className="h-2.5 w-2.5 text-white" />
                    </div>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs font-medium">{palette.name}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}

function BrandPresetGrid({
  presets,
  currentPrimary,
  currentAccent,
  onSelect,
}: {
  presets: typeof brandPresets;
  currentPrimary: string;
  currentAccent: string;
  onSelect: (preset: typeof brandPresets[0]) => void;
}) {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="grid grid-cols-4 gap-2">
        {presets.map((preset) => {
          const isSelected = currentPrimary === preset.primary &&
                             currentAccent === preset.accent;
          return (
            <Tooltip key={preset.name}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onSelect(preset)}
                  className={cn(
                    "relative rounded-lg overflow-hidden h-8",
                    "transition-all duration-150",
                    "hover:scale-105 active:scale-95",
                    isSelected
                      ? "ring-2 ring-[hsl(var(--sidebar-primary))] ring-offset-1 ring-offset-[hsl(var(--sidebar-background))] shadow-md"
                      : "ring-1 ring-[hsl(var(--sidebar-border))] hover:ring-[hsl(var(--sidebar-muted-foreground))] hover:shadow-sm"
                  )}
                >
                  <div className="flex h-full">
                    <div className="flex-1" style={{ backgroundColor: preset.primary }} />
                    <div className="flex-1" style={{ backgroundColor: preset.accent }} />
                  </div>
                  {isSelected && (
                    <div className="absolute top-0.5 right-0.5 h-3 w-3 rounded-full bg-[hsl(var(--sidebar-primary))] flex items-center justify-center animate-in zoom-in-50 duration-200">
                      <Check className="h-2 w-2 text-white" />
                    </div>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs font-medium">{preset.name}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}

// ============================================
// SUB-PANELS
// ============================================

function SubPanel({
  title,
  icon: Icon,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "w-full justify-between px-3 py-2.5 h-auto font-medium",
            "transition-all duration-150",
            "hover:bg-[hsl(var(--sidebar-accent)/0.7)]",
            "active:bg-[hsl(var(--sidebar-accent))] active:scale-[0.99]",
            isOpen && "bg-[hsl(var(--sidebar-accent)/0.5)]"
          )}
        >
          <span className="flex items-center gap-2 text-xs uppercase tracking-wide">
            {Icon && <Icon className={cn("h-3.5 w-3.5 transition-colors", isOpen && "text-[hsl(var(--sidebar-primary))]")} />}
            {title}
          </span>
          <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isOpen && "rotate-180")} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-3 pb-3 pt-1 space-y-3">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

// ============================================
// SECTION COLORS PANEL
// ============================================

function ColorsPanel({ theme, sectionId }: { theme: SectionTheme; sectionId: SectionId }) {
  const { globalConfig, generatedPalettes } = useGlobalConfig();
  const { setSectionPalette, setOverrideGlobalColors, updateSectionTheme } = useSectionTheme();
  const [showCustom, setShowCustom] = useState(false);

  const isOverriding = theme.overrideGlobalColors ?? false;
  const sectionMode = theme.paletteMode ?? globalConfig.brand.mode;

  return (
    <div className="space-y-4">
      <ToggleRow
        label="Override Global"
        checked={isOverriding}
        onChange={(val) => setOverrideGlobalColors(sectionId, val)}
        description={isOverriding ? "Custom palette active" : "Using global colors"}
      />

      {isOverriding ? (
        <>
          {/* Mode Toggle */}
          <div className="flex gap-2">
            <Button
              variant={sectionMode === 'dark' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateSectionTheme(sectionId, { paletteMode: 'dark' })}
              className="flex-1"
            >
              <Moon className="h-3.5 w-3.5 mr-1.5" />
              Dark
            </Button>
            <Button
              variant={sectionMode === 'light' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateSectionTheme(sectionId, { paletteMode: 'light' })}
              className="flex-1"
            >
              <Sun className="h-3.5 w-3.5 mr-1.5" />
              Light
            </Button>
          </div>

          {/* Palette Grid */}
          <div>
            <SectionHeader>{sectionMode} Palettes</SectionHeader>
            <PaletteGrid
              palettes={sectionMode === 'dark' ? generatedPalettes.dark : generatedPalettes.light}
              selectedId={theme.paletteId}
              onSelect={(palette) => setSectionPalette(sectionId, palette)}
            />
          </div>

          {/* Active Preview */}
          {theme.paletteId && (
            <div className="rounded-lg border border-[hsl(var(--sidebar-border))] p-3 space-y-2">
              <SectionHeader>Active Colors</SectionHeader>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <div className="h-8 rounded-md border border-[hsl(var(--sidebar-border))]" style={{ backgroundColor: theme.bgPrimary }} />
                  <span className="text-[10px] text-[hsl(var(--sidebar-muted-foreground))]">Background</span>
                </div>
                <div className="text-center">
                  <div className="h-8 rounded-md border border-[hsl(var(--sidebar-border))] flex items-center justify-center" style={{ backgroundColor: theme.bgPrimary }}>
                    <span className="text-xs font-bold" style={{ color: theme.textPrimary }}>Aa</span>
                  </div>
                  <span className="text-[10px] text-[hsl(var(--sidebar-muted-foreground))]">Text</span>
                </div>
                <div className="text-center">
                  <div className="h-8 rounded-md border border-[hsl(var(--sidebar-border))]" style={{ backgroundColor: theme.accent }} />
                  <span className="text-[10px] text-[hsl(var(--sidebar-muted-foreground))]">Accent</span>
                </div>
              </div>
            </div>
          )}

          {/* Custom Colors Collapsible */}
          <Collapsible open={showCustom} onOpenChange={setShowCustom}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between text-xs">
                Custom Colors
                <ChevronDown className={cn("h-3 w-3 transition-transform", showCustom && "rotate-180")} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-2">
              <FormField label="Background Primary">
                <ColorPicker
                  value={theme.bgPrimary || "#000000"}
                  onChange={(val) => updateSectionTheme(sectionId, { bgPrimary: val })}
                />
              </FormField>
              <FormField label="Background Secondary">
                <ColorPicker
                  value={theme.bgSecondary || "#0a0a0a"}
                  onChange={(val) => updateSectionTheme(sectionId, { bgSecondary: val })}
                />
              </FormField>
              <FormField label="Text Primary">
                <ColorPicker
                  value={theme.textPrimary || "#ffffff"}
                  onChange={(val) => updateSectionTheme(sectionId, { textPrimary: val })}
                />
              </FormField>
              <FormField label="Accent">
                <ColorPicker
                  value={theme.accent || "#3ab342"}
                  onChange={(val) => updateSectionTheme(sectionId, { accent: val })}
                />
              </FormField>
            </CollapsibleContent>
          </Collapsible>
        </>
      ) : (
        <div className="rounded-lg border border-[hsl(var(--sidebar-border))] p-3 space-y-2">
          <SectionHeader>Global Colors</SectionHeader>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center">
              <div className="h-8 rounded-md border border-[hsl(var(--sidebar-border))]" style={{ backgroundColor: globalConfig.brand.primary }} />
              <span className="text-[10px] text-[hsl(var(--sidebar-muted-foreground))]">Primary</span>
            </div>
            <div className="text-center">
              <div className="h-8 rounded-md border border-[hsl(var(--sidebar-border))]" style={{ backgroundColor: globalConfig.brand.accent }} />
              <span className="text-[10px] text-[hsl(var(--sidebar-muted-foreground))]">Accent</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ContentPanel({ sectionId, children }: { sectionId?: SectionId; children?: React.ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Check if this section supports content editing
  const hasContent = sectionId && hasContentEditor(sectionId);

  return (
    <div className="space-y-3">
      {hasContent && (
        <>
          <Button
            variant="outline"
            onClick={() => setIsModalOpen(true)}
            className="w-full justify-start"
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit Content
          </Button>
          <ContentEditorModal
            sectionId={sectionId}
            open={isModalOpen}
            onOpenChange={setIsModalOpen}
          />
        </>
      )}
      {children}
      {!hasContent && !children && (
        <p className="text-xs text-center py-4 text-[hsl(var(--sidebar-muted-foreground))]">
          No content settings available
        </p>
      )}
    </div>
  );
}

// Background image size options
const BG_SIZE_OPTIONS = [
  { id: 'cover', label: 'Cover' },
  { id: 'contain', label: 'Contain' },
  { id: 'auto', label: 'Auto' },
] as const;

// Background image position options
const BG_POSITION_OPTIONS = [
  { id: 'center', label: 'Center' },
  { id: 'top', label: 'Top' },
  { id: 'bottom', label: 'Bottom' },
] as const;

function BackgroundImagePanel({ sectionId }: { sectionId: SectionId }) {
  const { sectionThemes, updateSectionTheme } = useSectionTheme();
  const { globalConfig } = useGlobalConfig();
  const { toast } = useToast();
  const mediaFrameRef = useRef<any>(null);

  const theme = sectionThemes[sectionId] || {};
  const bgImage = theme.bgImage || '';
  const bgImageOpacity = theme.bgImageOpacity ?? 0.5;
  const bgImageSize = theme.bgImageSize || 'cover';
  const bgImagePosition = theme.bgImagePosition || 'center';
  // Default overlay color is the primary brand color
  const bgImageOverlayColor = theme.bgImageOverlayColor || globalConfig.brand.primary;

  // Check if WordPress media library is available
  const hasWpMedia = typeof window !== 'undefined' && (window as any).wp?.media;

  // Open WordPress Media Library picker
  const openMediaLibrary = () => {
    if (!hasWpMedia) {
      toast('WordPress Media Library not available', 'error');
      return;
    }

    const wp = (window as any).wp;

    // Create media frame if it doesn't exist
    if (!mediaFrameRef.current) {
      mediaFrameRef.current = wp.media({
        title: 'Select Background Image',
        button: {
          text: 'Use this image',
        },
        multiple: false,
        library: {
          type: 'image',
        },
      });

      // When an image is selected
      mediaFrameRef.current.on('select', () => {
        const attachment = mediaFrameRef.current.state().get('selection').first().toJSON();
        updateSectionTheme(sectionId, { bgImage: attachment.url });
        toast('Image selected!', 'success');
      });
    }

    // Open the media library
    mediaFrameRef.current.open();
  };

  const handleRemoveImage = () => {
    updateSectionTheme(sectionId, {
      bgImage: undefined,
      bgImageOpacity: undefined,
      bgImageSize: undefined,
      bgImagePosition: undefined,
      bgImageOverlayColor: undefined,
    });
    toast('Background image removed', 'success');
  };

  return (
    <div className="space-y-4">
      <SectionHeader>Background Image</SectionHeader>

      {bgImage ? (
        /* Image Preview */
        <div className="space-y-3">
          <div className="relative rounded-lg overflow-hidden border border-[hsl(var(--sidebar-border))]">
            <img
              src={bgImage}
              alt="Background"
              className="w-full h-24 object-cover"
            />
            {/* Overlay preview */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ backgroundColor: bgImageOverlayColor, opacity: 1 - bgImageOpacity }}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={openMediaLibrary}
                className="h-8"
              >
                <Upload className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRemoveImage}
                className="h-8"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Overlay Color */}
          <FormField label="Overlay Color">
            <ColorPicker
              value={bgImageOverlayColor}
              onChange={(val) => updateSectionTheme(sectionId, { bgImageOverlayColor: val })}
            />
          </FormField>

          {/* Image Visibility slider */}
          <FormField label={`Image Visibility: ${Math.round(bgImageOpacity * 100)}%`}>
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(bgImageOpacity * 100)}
              onChange={(e) => updateSectionTheme(sectionId, { bgImageOpacity: parseInt(e.target.value) / 100 })}
              className="w-full h-2 bg-[hsl(var(--sidebar-accent))] rounded-lg appearance-none cursor-pointer"
            />
          </FormField>

          {/* Size */}
          <FormField label="Size">
            <SegmentedControl
              options={BG_SIZE_OPTIONS.map(o => ({ id: o.id, label: o.label }))}
              value={bgImageSize}
              onChange={(val) => updateSectionTheme(sectionId, { bgImageSize: val })}
              size="sm"
            />
          </FormField>

          {/* Position */}
          <FormField label="Position">
            <SegmentedControl
              options={BG_POSITION_OPTIONS.map(o => ({ id: o.id, label: o.label }))}
              value={bgImagePosition}
              onChange={(val) => updateSectionTheme(sectionId, { bgImagePosition: val })}
              size="sm"
            />
          </FormField>
        </div>
      ) : (
        /* Select Image Zone */
        <button
          onClick={openMediaLibrary}
          className={cn(
            "w-full border-2 border-dashed rounded-lg p-6 text-center transition-all",
            "border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-background))]",
            "hover:border-[hsl(var(--sidebar-primary))] hover:bg-[hsl(var(--sidebar-accent)/0.3)]",
            "active:scale-[0.98]"
          )}
        >
          <Image className="h-8 w-8 mx-auto mb-2 text-[hsl(var(--sidebar-muted-foreground))]" />
          <p className="text-xs text-[hsl(var(--sidebar-muted-foreground))]">
            Click to select image
          </p>
          <p className="text-[10px] text-[hsl(var(--sidebar-muted))] mt-1">
            From Media Library
          </p>
        </button>
      )}
    </div>
  );
}

function AdvancedPanel({ sectionId }: { sectionId: SectionId }) {
  return (
    <div className="space-y-3">
      <BackgroundImagePanel sectionId={sectionId} />
    </div>
  );
}

// Header-specific advanced panel (badge controls only - logo is in Global)
function HeaderAdvancedPanel() {
  const { headerConfig, updateHeaderStyle } = useHeaderConfig();

  const badgeThemes = [
    { id: 'light', label: 'Light' },
    { id: 'dark', label: 'Dark' },
  ] as const;

  return (
    <div className="space-y-4">
      {/* Badge Theme */}
      <div>
        <SectionHeader>Google Badge Theme</SectionHeader>
        <p className="text-[10px] text-[hsl(var(--sidebar-muted-foreground))] mb-2">
          Fixed theme for brand consistency
        </p>
        <div className="flex gap-2">
          {badgeThemes.map(({ id, label }) => (
            <Button
              key={id}
              variant={headerConfig.style.badgeTheme === id ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateHeaderStyle({ badgeTheme: id })}
              className="flex-1 transition-all active:scale-95"
            >
              {id === 'light' ? <Sun className="h-3.5 w-3.5 mr-1.5" /> : <Moon className="h-3.5 w-3.5 mr-1.5" />}
              {label}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Background Image */}
      <BackgroundImagePanel sectionId="header" />
    </div>
  );
}

// ============================================
// SECTION EDITORS
// ============================================

function GlobalEditor() {
  const { globalConfig, updateBrand, updateLogo, resetGlobalConfig, needsRegeneration, generatePalettes } = useGlobalConfig();
  const { toast } = useToast();

  const darkPresets = brandPresets.filter(p => p.tone === 'dark');
  const lightPresets = brandPresets.filter(p => p.tone === 'light');

  const logoShapes = [
    { id: 'rectangle', label: 'Rectangle', icon: RectangleHorizontal },
    { id: 'square', label: 'Square', icon: Square },
    { id: 'circle', label: 'Circle', icon: Circle },
  ] as const;

  return (
    <div className="space-y-4">
      {/* Theme Mode Toggle */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-[hsl(var(--sidebar-accent))]">
        <div className="flex items-center gap-2">
          {globalConfig.brand.mode === 'dark' ? (
            <Moon className="h-4 w-4 text-[hsl(var(--sidebar-muted-foreground))]" />
          ) : (
            <Sun className="h-4 w-4 text-yellow-500" />
          )}
          <span className="text-sm font-medium text-[hsl(var(--sidebar-foreground))]">
            {globalConfig.brand.mode === 'dark' ? 'Dark Mode' : 'Light Mode'}
          </span>
        </div>
        <Switch
          checked={globalConfig.brand.mode === 'light'}
          onCheckedChange={(checked) => updateBrand({ mode: checked ? 'light' : 'dark' })}
        />
      </div>

      <Separator />

      {/* Brand Colors */}
      <div>
        <SectionHeader>Brand Colors</SectionHeader>
        <div className="grid grid-cols-2 gap-2">
          <FormField label="Primary">
            <ColorPicker
              value={globalConfig.brand.primary}
              onChange={(val) => updateBrand({ primary: val })}
            />
          </FormField>
          <FormField label="Accent">
            <ColorPicker
              value={globalConfig.brand.accent}
              onChange={(val) => updateBrand({ accent: val })}
            />
          </FormField>
        </div>
      </div>

      <Separator />

      {/* Logo Settings (shared between Header and Footer) */}
      <div>
        <SectionHeader>Logo Settings</SectionHeader>
        <p className="text-[10px] text-[hsl(var(--sidebar-muted-foreground))] mb-2">
          Applies to Header and Footer
        </p>
        <div className="space-y-3">
          <FormField label="Background Color">
            <ColorPicker
              value={globalConfig.logo.bgColor}
              onChange={(val) => updateLogo({ bgColor: val })}
            />
          </FormField>

          <FormField label="Shape">
            <div className="flex gap-2">
              {logoShapes.map(({ id, label, icon: Icon }) => (
                <Button
                  key={id}
                  variant={globalConfig.logo.shape === id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateLogo({ shape: id })}
                  className="flex-1 transition-all active:scale-95"
                  title={label}
                >
                  <Icon className="h-4 w-4" />
                </Button>
              ))}
            </div>
          </FormField>
        </div>
      </div>

      <Separator />

      {/* Dark Presets */}
      <div>
        <SectionHeader>Dark Presets</SectionHeader>
        <BrandPresetGrid
          presets={darkPresets}
          currentPrimary={globalConfig.brand.primary}
          currentAccent={globalConfig.brand.accent}
          onSelect={(preset) => updateBrand({ primary: preset.primary, accent: preset.accent })}
        />
      </div>

      {/* Light Presets */}
      <div>
        <SectionHeader>Light Presets</SectionHeader>
        <BrandPresetGrid
          presets={lightPresets}
          currentPrimary={globalConfig.brand.primary}
          currentAccent={globalConfig.brand.accent}
          onSelect={(preset) => updateBrand({ primary: preset.primary, accent: preset.accent })}
        />
      </div>

      {/* Generate Button */}
      <Button
        onClick={() => {
          generatePalettes();
          toast('Palettes generated!', 'success');
        }}
        className={cn("w-full", needsRegeneration && "animate-pulse")}
        variant={needsRegeneration ? "destructive" : "default"}
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        {needsRegeneration ? 'Generate Palettes' : 'Regenerate'}
      </Button>

      <Separator />

      <Button variant="outline" size="sm" onClick={resetGlobalConfig} className="w-full">
        <RotateCcw className="h-3 w-3 mr-2" />
        Reset to Default
      </Button>
    </div>
  );
}

function TopHeaderEditor() {
  const { topbarConfig, updateTopbarConfig, headerConfig, updateHeaderConfig } = useHeaderConfig();
  const { sectionThemes, resetSectionTheme } = useSectionTheme();
  const [openPanel, setOpenPanel] = useState<string | null>('content');

  return (
    <div className="space-y-2">
      <ToggleRow
        label="Show Section"
        checked={headerConfig.showTopbar}
        onChange={(val) => updateHeaderConfig({ showTopbar: val })}
      />

      <div className="rounded-lg border border-[hsl(var(--sidebar-border))] overflow-hidden">
        <SubPanel title="Content" icon={FileText} isOpen={openPanel === 'content'} onToggle={() => setOpenPanel(openPanel === 'content' ? null : 'content')}>
          <ContentPanel>
            {/* Message Text */}
            <FormField label="Message Text">
              <Input
                value={topbarConfig.message}
                onChange={(e) => updateTopbarConfig({ message: e.target.value })}
                placeholder="Serving North Idaho..."
                className="h-9 transition-all focus:ring-2 focus:ring-[hsl(var(--sidebar-primary))]"
              />
            </FormField>

            {/* Icon Selection */}
            <FormField label="Icon">
              <IconSelector
                options={TOPBAR_ICONS}
                value={topbarConfig.icon}
                onChange={(val) => updateTopbarConfig({ icon: val })}
              />
            </FormField>

            {/* Text Alignment */}
            <FormField label="Text Alignment">
              <SegmentedControl
                options={TEXT_ALIGN_OPTIONS}
                value={topbarConfig.textAlign}
                onChange={(val) => updateTopbarConfig({ textAlign: val })}
              />
            </FormField>

            {/* Icon Position (only show if icon is not 'none') */}
            {topbarConfig.icon !== 'none' && (
              <FormField label="Icon Position">
                <SegmentedControl
                  options={ICON_POSITION_OPTIONS}
                  value={topbarConfig.iconPosition}
                  onChange={(val) => updateTopbarConfig({ iconPosition: val })}
                />
              </FormField>
            )}

            <Separator className="my-3" />

            {/* Show/Hide Contact Info */}
            <SectionHeader>Contact Info</SectionHeader>
            <ToggleRow
              label="Show Phone"
              checked={topbarConfig.showPhone}
              onChange={(val) => updateTopbarConfig({ showPhone: val })}
              description="Display phone number"
            />
            <ToggleRow
              label="Show Email"
              checked={topbarConfig.showEmail}
              onChange={(val) => updateTopbarConfig({ showEmail: val })}
              description="Display email address"
            />
          </ContentPanel>
        </SubPanel>

        <Separator />

        <SubPanel title="Colors" icon={Palette} isOpen={openPanel === 'colors'} onToggle={() => setOpenPanel(openPanel === 'colors' ? null : 'colors')}>
          <ColorsPanel theme={sectionThemes['topheader'] || {}} sectionId="topheader" />
        </SubPanel>

        <Separator />

        <SubPanel title="Advanced" icon={Image} isOpen={openPanel === 'advanced'} onToggle={() => setOpenPanel(openPanel === 'advanced' ? null : 'advanced')}>
          <AdvancedPanel sectionId="topheader" />
        </SubPanel>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => resetSectionTheme('topheader')}
        className="w-full transition-all hover:bg-[hsl(var(--sidebar-accent))] active:scale-[0.98]"
      >
        <RotateCcw className="h-3 w-3 mr-2" />
        Reset
      </Button>
    </div>
  );
}

function HeaderEditor() {
  const { headerConfig, updateHeaderConfig, updateHeaderStyle, resetHeaderConfig } = useHeaderConfig();
  const { sectionThemes, resetSectionTheme } = useSectionTheme();
  const [openPanel, setOpenPanel] = useState<string | null>('content');

  return (
    <div className="space-y-2">
      <div className="rounded-lg border border-[hsl(var(--sidebar-border))] overflow-hidden">
        <SubPanel title="Content" icon={FileText} isOpen={openPanel === 'content'} onToggle={() => setOpenPanel(openPanel === 'content' ? null : 'content')}>
          <ContentPanel>
            <ToggleRow
              label="Fixed Header"
              checked={headerConfig.isFixed}
              onChange={(val) => updateHeaderConfig({ isFixed: val })}
              description="Stick to top on scroll"
            />
            <ToggleRow
              label="Show Phone"
              checked={headerConfig.showPhone}
              onChange={(val) => updateHeaderConfig({ showPhone: val })}
            />
            <ToggleRow
              label="Show Badge"
              checked={headerConfig.showBadge}
              onChange={(val) => updateHeaderConfig({ showBadge: val })}
            />
            {headerConfig.showBadge && (
              <ToggleRow
                label="Show Review Count"
                checked={headerConfig.showReviewCount}
                onChange={(val) => updateHeaderConfig({ showReviewCount: val })}
                description="Display reviews text"
              />
            )}

            <Separator className="my-3" />

            <FormField label="Header Padding">
              <SegmentedControl
                options={HEADER_PADDING_OPTIONS}
                value={headerConfig.style.headerPadding}
                onChange={(val) => updateHeaderStyle({ headerPadding: val })}
              />
            </FormField>
          </ContentPanel>
        </SubPanel>

        <Separator />

        <SubPanel title="Colors" icon={Palette} isOpen={openPanel === 'colors'} onToggle={() => setOpenPanel(openPanel === 'colors' ? null : 'colors')}>
          <ColorsPanel theme={sectionThemes['header'] || {}} sectionId="header" />
        </SubPanel>

        <Separator />

        <SubPanel title="Advanced" icon={Image} isOpen={openPanel === 'advanced'} onToggle={() => setOpenPanel(openPanel === 'advanced' ? null : 'advanced')}>
          <HeaderAdvancedPanel />
        </SubPanel>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => { resetHeaderConfig(); resetSectionTheme('header'); }}
        className="w-full transition-all duration-150 hover:bg-[hsl(var(--sidebar-accent))] active:scale-[0.98]"
      >
        <RotateCcw className="h-3 w-3 mr-2" />
        Reset
      </Button>
    </div>
  );
}

function FooterEditor() {
  const { globalConfig, updateFooter } = useGlobalConfig();
  const { sectionThemes, resetSectionTheme, isSectionVisible, setSectionVisibility } = useSectionTheme();
  const [openPanel, setOpenPanel] = useState<string | null>('content');
  const footerConfig = globalConfig.footer;

  return (
    <div className="space-y-2">
      <ToggleRow
        label="Show Section"
        checked={isSectionVisible('footer')}
        onChange={(val) => setSectionVisibility('footer', val)}
      />

      <div className="rounded-lg border border-[hsl(var(--sidebar-border))] overflow-hidden">
        <SubPanel title="Content" icon={FileText} isOpen={openPanel === 'content'} onToggle={() => setOpenPanel(openPanel === 'content' ? null : 'content')}>
          <ContentPanel sectionId="footer">
            <Separator className="my-3" />
            <SectionHeader>Visibility</SectionHeader>
            <ToggleRow
              label="Show Logo"
              checked={footerConfig.showLogo}
              onChange={(val) => updateFooter({ showLogo: val })}
            />
            <ToggleRow
              label="Show Description"
              checked={footerConfig.showDescription}
              onChange={(val) => updateFooter({ showDescription: val })}
            />
            <ToggleRow
              label="Show Social Links"
              checked={footerConfig.showSocial}
              onChange={(val) => updateFooter({ showSocial: val })}
            />

            <Separator className="my-3" />

            <SectionHeader>Contact Info</SectionHeader>
            <ToggleRow
              label="Show Phone"
              checked={footerConfig.showPhone}
              onChange={(val) => updateFooter({ showPhone: val })}
            />
            <ToggleRow
              label="Show Email"
              checked={footerConfig.showEmail}
              onChange={(val) => updateFooter({ showEmail: val })}
            />
            <ToggleRow
              label="Show Address"
              checked={footerConfig.showAddress}
              onChange={(val) => updateFooter({ showAddress: val })}
            />
          </ContentPanel>
        </SubPanel>

        <Separator />

        <SubPanel title="Colors" icon={Palette} isOpen={openPanel === 'colors'} onToggle={() => setOpenPanel(openPanel === 'colors' ? null : 'colors')}>
          <ColorsPanel theme={sectionThemes['footer'] || {}} sectionId="footer" />
        </SubPanel>

        <Separator />

        <SubPanel title="Advanced" icon={Image} isOpen={openPanel === 'advanced'} onToggle={() => setOpenPanel(openPanel === 'advanced' ? null : 'advanced')}>
          <AdvancedPanel sectionId="footer" />
        </SubPanel>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => resetSectionTheme('footer')}
        className="w-full transition-all duration-150 hover:bg-[hsl(var(--sidebar-accent))] active:scale-[0.98]"
      >
        <RotateCcw className="h-3 w-3 mr-2" />
        Reset
      </Button>
    </div>
  );
}

function SectionEditor({ sectionId, onReset }: { sectionId: SectionId; onReset: () => void }) {
  const { sectionThemes, isSectionVisible, setSectionVisibility } = useSectionTheme();
  const [openPanel, setOpenPanel] = useState<string | null>('colors');

  return (
    <div className="space-y-2">
      <ToggleRow
        label="Show Section"
        checked={isSectionVisible(sectionId)}
        onChange={(val) => setSectionVisibility(sectionId, val)}
      />

      <div className="rounded-lg border border-[hsl(var(--sidebar-border))] overflow-hidden">
        <SubPanel title="Colors" icon={Palette} isOpen={openPanel === 'colors'} onToggle={() => setOpenPanel(openPanel === 'colors' ? null : 'colors')}>
          <ColorsPanel theme={sectionThemes[sectionId] || {}} sectionId={sectionId} />
        </SubPanel>

        <Separator />

        <SubPanel title="Content" icon={FileText} isOpen={openPanel === 'content'} onToggle={() => setOpenPanel(openPanel === 'content' ? null : 'content')}>
          <ContentPanel sectionId={sectionId} />
        </SubPanel>

        <Separator />

        <SubPanel title="Advanced" icon={Image} isOpen={openPanel === 'advanced'} onToggle={() => setOpenPanel(openPanel === 'advanced' ? null : 'advanced')}>
          <AdvancedPanel sectionId={sectionId} />
        </SubPanel>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onReset}
        className="w-full transition-all duration-150 hover:bg-[hsl(var(--sidebar-accent))] active:scale-[0.98]"
      >
        <RotateCcw className="h-3 w-3 mr-2" />
        Reset
      </Button>
    </div>
  );
}

// ============================================
// MAIN SIDEBAR
// ============================================

export default function ThemeSidebar() {
  const { isOpen, setIsOpen } = useSidebar();
  const [openSection, setOpenSection] = useState<string>('global');
  const { sectionThemes, resetSectionTheme, isSectionVisible, setOverrideGlobalColors } = useSectionTheme();
  const { headerConfig, topbarConfig, resetHeaderConfig } = useHeaderConfig();
  const { globalConfig, resetGlobalConfig } = useGlobalConfig();
  const { sectionContent } = useContent();
  const { toast } = useToast();

  // Check if we're in WordPress admin context
  const wpAdmin = typeof window !== 'undefined' ? (window as any).lakecityAdmin : null;

  // Sections that use the generic SectionEditor (footer has its own editor)
  const allSections: SectionId[] = [
    'hero', 'featured-testimonial', 'services', 'mid-cta',
    'service-areas', 'testimonials', 'faq', 'footer-cta',
  ];

  const handleResetAll = async () => {
    // Reset React state to defaults
    resetGlobalConfig();
    resetHeaderConfig();
    allSections.forEach(id => resetSectionTheme(id));
    resetSectionTheme('topheader');
    resetSectionTheme('header');

    // Also reset in WordPress if in admin context
    if (wpAdmin?.apiUrl && wpAdmin?.nonce && wpAdmin?.pageId) {
      try {
        // Send empty/default config to WordPress
        const defaultConfig = {
          global: {
            brand: { primary: '#3ab342', accent: '#f97316', mode: 'dark' },
            logo: { bgColor: '#ffffff', shape: 'rectangle' },
            footer: {
              showLogo: true,
              showDescription: true,
              showSocial: true,
              showPhone: true,
              showEmail: true,
              showAddress: true,
            },
            trustBadges: {
              badge1: { label: 'Fully Insured', sublabel: 'Peace of Mind' },
              badge2: { label: 'Same-Day', sublabel: 'Service Available' },
            },
          },
          header: {
            isFixed: true,
            showTopbar: false,
            showPhone: true,
            showBadge: true,
            style: {
              badgeTheme: 'light',
              headerPadding: 'default',
            },
          },
          sections: {},
        };

        await fetch(`${wpAdmin.apiUrl}/pages/${wpAdmin.pageId}/theme`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-WP-Nonce': wpAdmin.nonce,
          },
          body: JSON.stringify(defaultConfig),
        });

        toast('Config reset! Reloading...', 'success');
        setTimeout(() => window.location.reload(), 500);
      } catch (error) {
        console.error('Failed to reset in WordPress:', error);
        toast('Reset locally. Failed to save to WordPress.', 'error');
      }
    } else {
      toast('All settings reset!', 'success');
    }
  };

  // Apply global colors to all sections (disable all overrides)
  const handleApplyGlobalToAll = () => {
    const allSectionIds: SectionId[] = ['topheader', 'header', ...allSections, 'footer'];
    allSectionIds.forEach(id => {
      setOverrideGlobalColors(id, false);
    });
    toast('All sections now follow global colors!', 'success');
  };

  // Helper to remove null/undefined values from an object
  const cleanObject = (obj: Record<string, unknown>): Record<string, unknown> => {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== null && value !== undefined) {
        cleaned[key] = value;
      }
    }
    return cleaned;
  };

  // Build the complete config object
  const buildConfig = () => {
    const allSectionIds: SectionId[] = ['topheader', 'header', ...allSections, 'footer'];
    const completeSections: Record<string, object> = {};

    allSectionIds.forEach(id => {
      const theme = sectionThemes[id] || {};
      const sectionConfig: Record<string, unknown> = {
        visible: isSectionVisible(id),
        overrideGlobalColors: theme.overrideGlobalColors ?? false,
      };

      // Only include color fields if they have values
      if (theme.paletteId) sectionConfig.paletteId = theme.paletteId;
      if (theme.paletteMode) sectionConfig.paletteMode = theme.paletteMode;
      if (theme.bgPrimary) sectionConfig.bgPrimary = theme.bgPrimary;
      if (theme.bgSecondary) sectionConfig.bgSecondary = theme.bgSecondary;
      if (theme.bgTertiary) sectionConfig.bgTertiary = theme.bgTertiary;
      if (theme.textPrimary) sectionConfig.textPrimary = theme.textPrimary;
      if (theme.textSecondary) sectionConfig.textSecondary = theme.textSecondary;
      if (theme.accent) sectionConfig.accent = theme.accent;
      if (theme.borderColor) sectionConfig.borderColor = theme.borderColor;

      // Background image fields
      if (theme.bgImage) sectionConfig.bgImage = theme.bgImage;
      if (theme.bgImageOpacity !== undefined) sectionConfig.bgImageOpacity = theme.bgImageOpacity;
      if (theme.bgImageSize) sectionConfig.bgImageSize = theme.bgImageSize;
      if (theme.bgImagePosition) sectionConfig.bgImagePosition = theme.bgImagePosition;
      if (theme.bgImageOverlayColor) sectionConfig.bgImageOverlayColor = theme.bgImageOverlayColor;

      completeSections[id] = sectionConfig;
    });

    // Clean form config to remove undefined values
    const cleanedForm = cleanObject((globalConfig.form || {}) as Record<string, unknown>);

    return {
      global: {
        brand: globalConfig.brand,
        logo: globalConfig.logo,
        footer: globalConfig.footer,
        form: Object.keys(cleanedForm).length > 0 ? cleanedForm : undefined,
        trustBadges: globalConfig.trustBadges,
      },
      header: {
        showTopbar: headerConfig.showTopbar,
        showPhone: headerConfig.showPhone,
        showBadge: headerConfig.showBadge,
        showReviewCount: headerConfig.showReviewCount,
        isFixed: headerConfig.isFixed,
        style: headerConfig.style,
      },
      topbar: topbarConfig,
      sections: completeSections,
      content: sectionContent,
      _meta: {
        savedAt: new Date().toISOString(),
        version: '2.0',
      },
    };
  };

  const handleCopyConfig = () => {
    const config = buildConfig();
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    toast('Config copied to clipboard!', 'success');
  };

  const handleSaveConfig = async () => {
    const config = buildConfig();

    // Require WordPress admin context
    if (!wpAdmin) {
      toast('WordPress admin context not available', 'error');
      return;
    }

    // Check if user can save
    if (!wpAdmin.canSave) {
      toast('You do not have permission to save. Please log in as an admin.', 'error');
      console.warn('[LakeCity] Save blocked - user cannot save:', wpAdmin._debug);
      return;
    }

    if (!wpAdmin.pageId) {
      toast('No page selected to save. Check URL has page_id parameter.', 'error');
      console.error('[LakeCity] pageId is missing or 0. wpAdmin:', wpAdmin);
      return;
    }

    try {
      // Notify parent window (editor frame) that we're saving
      window.parent?.postMessage({ type: 'lakecity-save-status', status: 'saving' }, '*');

      const themeEndpoint = `${wpAdmin.apiUrl}/pages/${wpAdmin.pageId}/theme`;
      const contentEndpoint = `${wpAdmin.apiUrl}/pages/${wpAdmin.pageId}/content`;

      // Save theme config (without content to keep it clean)
      const { content: _, ...themeConfig } = config;

      // Save both in parallel
      const [themeResponse, contentResponse] = await Promise.all([
        fetch(themeEndpoint, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-WP-Nonce': wpAdmin.nonce,
          },
          body: JSON.stringify(themeConfig),
        }),
        fetch(contentEndpoint, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-WP-Nonce': wpAdmin.nonce,
          },
          body: JSON.stringify(sectionContent),
        }),
      ]);

      const themeResult = await themeResponse.json();
      const contentResult = await contentResponse.json();

      if (themeResult.success && contentResult.success) {
        toast('Theme & Content saved!', 'success');
        window.parent?.postMessage({ type: 'lakecity-save-status', status: 'saved' }, '*');
      } else {
        const errors = [];
        if (!themeResult.success) errors.push('Theme: ' + (themeResult.message || 'failed'));
        if (!contentResult.success) errors.push('Content: ' + (contentResult.message || 'failed'));
        toast(`Save failed: ${errors.join(', ')}`, 'error');
        window.parent?.postMessage({ type: 'lakecity-save-status', status: 'error' }, '*');
      }
    } catch (error) {
      console.error('[LakeCity] Failed to save to WordPress:', error);
      toast('Failed to save to WordPress', 'error');
      window.parent?.postMessage({ type: 'lakecity-save-status', status: 'error' }, '*');
    }
  };

  // TODO: Implement Load and Export later
  /*
  const handleLoadConfig = async () => {
    if (!wpAdmin?.apiUrl || !wpAdmin?.nonce) {
      toast('WordPress admin context required to load', 'error');
      return;
    }

    const pageId = wpAdmin.pageId;
    if (!pageId) {
      toast('No page selected to load', 'error');
      return;
    }

    try {
      const endpoint = `${wpAdmin.apiUrl}/pages/${pageId}/theme`;

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'X-WP-Nonce': wpAdmin.nonce,
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.themeConfig) {
          toast('Theme loaded! Reloading...', 'success');
          setTimeout(() => window.location.reload(), 500);
        } else {
          toast('No saved theme found for this page', 'error');
        }
      } else {
        toast('Failed to load theme from WordPress', 'error');
      }
    } catch (error) {
      console.error('Failed to load from WordPress:', error);
      toast('Failed to load theme', 'error');
    }
  };

  const handleDownloadConfig = () => {
    const config = buildConfig();
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `theme-config-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast('Config downloaded!', 'success');
  };
  */

  if (!isOpen) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsOpen(true)}
              className={cn(
                "fixed top-1/2 left-0 -translate-y-1/2 z-9999 rounded-l-none border-l-0",
                "bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground))]",
                "transition-all duration-200",
                "hover:bg-[hsl(var(--sidebar-accent))] hover:w-12 hover:shadow-lg",
                "active:scale-95"
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Open Theme Settings</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div
        className="sidebar-theme fixed top-0 left-0 h-full z-9999 flex flex-col shadow-2xl bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground))] border-r border-[hsl(var(--sidebar-border))] transition-transform duration-300 ease-in-out"
        style={{ width: `${SIDEBAR_WIDTH}px` }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[hsl(var(--sidebar-border))]">
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-[hsl(var(--sidebar-primary))]" />
            <span className="font-semibold text-sm text-[hsl(var(--sidebar-foreground))]">Theme Settings</span>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Close</TooltipContent>
          </Tooltip>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <Accordion type="single" collapsible value={openSection} onValueChange={(v) => {
            setOpenSection(v);
            if (v) setTimeout(() => scrollToSection(v), 100);
          }}>
            {/* Global */}
            <AccordionItem value="global">
              <AccordionTrigger className="px-4">
                <span className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-amber-500" />
                  Global
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-4">
                <GlobalEditor />
              </AccordionContent>
            </AccordionItem>

            {/* Top Header */}
            <AccordionItem value="topheader">
              <AccordionTrigger className="px-4">
                <span className="flex items-center gap-2">
                  <LayoutList className="h-4 w-4 text-violet-500" />
                  Top Header
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-4">
                <TopHeaderEditor />
              </AccordionContent>
            </AccordionItem>

            {/* Header */}
            <AccordionItem value="header">
              <AccordionTrigger className="px-4">
                <span className="flex items-center gap-2">
                  <LayoutList className="h-4 w-4 text-blue-500" />
                  Header
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-4">
                <HeaderEditor />
              </AccordionContent>
            </AccordionItem>

            {/* Page Sections */}
            {allSections.map((id) => (
              <AccordionItem key={id} value={id}>
                <AccordionTrigger className="px-4">
                  <span className="flex items-center gap-2">
                    {isSectionVisible(id) ? (
                      <Eye className="h-4 w-4 text-[hsl(var(--sidebar-muted-foreground))]" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-[hsl(var(--sidebar-muted))]" />
                    )}
                    {SECTION_LABELS[id]}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-4">
                  <SectionEditor sectionId={id} onReset={() => resetSectionTheme(id)} />
                </AccordionContent>
              </AccordionItem>
            ))}

            {/* Footer - has its own editor with visibility toggles */}
            <AccordionItem value="footer">
              <AccordionTrigger className="px-4">
                <span className="flex items-center gap-2">
                  {isSectionVisible('footer') ? (
                    <Eye className="h-4 w-4 text-[hsl(var(--sidebar-muted-foreground))]" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-[hsl(var(--sidebar-muted))]" />
                  )}
                  {SECTION_LABELS['footer']}
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-4">
                <FooterEditor />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-[hsl(var(--sidebar-border))] space-y-2">
          {/* Save Button - Primary Action */}
          <Button
            onClick={handleSaveConfig}
            className="w-full transition-all duration-150 hover:shadow-md active:scale-[0.98] active:shadow-inner"
            size="sm"
          >
            <Save className="h-3.5 w-3.5 mr-1.5" />
            Save Theme
          </Button>

          {/* Copy for debugging */}
          <Button
            onClick={handleCopyConfig}
            variant="secondary"
            size="sm"
            className="w-full transition-all duration-150 hover:bg-[hsl(var(--sidebar-accent))] active:scale-[0.98]"
          >
            <Copy className="h-3.5 w-3.5 mr-1.5" />
            Copy Config
          </Button>

          {/* TODO: Load and Export - coming later
          <Button onClick={handleLoadConfig} variant="outline" size="sm">
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Load
          </Button>
          <Button onClick={handleDownloadConfig} variant="secondary" size="sm">
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Export
          </Button>
          */}

          <Button
            variant="outline"
            onClick={handleApplyGlobalToAll}
            className="w-full transition-all duration-150 hover:bg-[hsl(var(--sidebar-accent))] active:scale-[0.98]"
            size="sm"
          >
            <Globe className="h-3.5 w-3.5 mr-2" />
            Apply Global to All
          </Button>
          <Button
            variant="destructive"
            onClick={handleResetAll}
            className="w-full transition-all duration-150 hover:brightness-110 active:scale-[0.98]"
            size="sm"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-2" />
            Reset All
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}
