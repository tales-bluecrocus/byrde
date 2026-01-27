import { useState } from 'react';
import { useSectionTheme, SECTION_LABELS } from '../context/SectionThemeContext';
import { useHeaderConfig } from '../context/HeaderConfigContext';
import { useGlobalConfig } from '../context/GlobalConfigContext';
import { useToast } from './Toast';
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
  Download,
} from 'lucide-react';

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
  footer: 'footer-section',
};

function scrollToSection(sectionId: string) {
  const anchorId = SECTION_ANCHOR_IDS[sectionId];
  if (anchorId) {
    const element = document.getElementById(anchorId);
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

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
    <div className="flex items-center justify-between py-1">
      <div className="space-y-0.5">
        <Label className="text-sm text-[hsl(var(--sidebar-foreground))]">{label}</Label>
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
                    "relative rounded-lg overflow-hidden transition-all h-12",
                    isSelected
                      ? "ring-2 ring-[hsl(var(--sidebar-primary))] ring-offset-1 ring-offset-[hsl(var(--sidebar-background))]"
                      : "ring-1 ring-[hsl(var(--sidebar-border))] hover:ring-[hsl(var(--sidebar-muted-foreground))]"
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
                    <div className="absolute top-1 right-1 h-4 w-4 rounded-full bg-[hsl(var(--sidebar-primary))] flex items-center justify-center">
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
                    "relative rounded-lg overflow-hidden transition-all h-8",
                    isSelected
                      ? "ring-2 ring-[hsl(var(--sidebar-primary))] ring-offset-1 ring-offset-[hsl(var(--sidebar-background))]"
                      : "ring-1 ring-[hsl(var(--sidebar-border))] hover:ring-[hsl(var(--sidebar-muted-foreground))]"
                  )}
                >
                  <div className="flex h-full">
                    <div className="flex-1" style={{ backgroundColor: preset.primary }} />
                    <div className="flex-1" style={{ backgroundColor: preset.accent }} />
                  </div>
                  {isSelected && (
                    <div className="absolute top-0.5 right-0.5 h-3 w-3 rounded-full bg-[hsl(var(--sidebar-primary))] flex items-center justify-center">
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
          className="w-full justify-between px-3 py-2 h-auto font-medium"
        >
          <span className="flex items-center gap-2 text-xs uppercase tracking-wide">
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {title}
          </span>
          <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
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

function ContentPanel({ children }: { children?: React.ReactNode }) {
  return children ? (
    <div className="space-y-3">{children}</div>
  ) : (
    <p className="text-xs text-center py-4 text-[hsl(var(--sidebar-muted-foreground))]">
      No content settings available
    </p>
  );
}

function AdvancedPanel() {
  return (
    <div className="space-y-3">
      <SectionHeader>Background Image</SectionHeader>
      <div className="border-2 border-dashed rounded-lg p-4 text-center border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-background))]">
        <Image className="h-8 w-8 mx-auto mb-2 text-[hsl(var(--sidebar-muted))]" />
        <p className="text-xs text-[hsl(var(--sidebar-muted-foreground))]">Coming soon</p>
      </div>
    </div>
  );
}

// Header-specific advanced panel with logo and badge controls
function HeaderAdvancedPanel() {
  const { headerConfig, updateHeaderStyle } = useHeaderConfig();

  const logoShapes = [
    { id: 'rectangle', label: 'Rectangle', icon: RectangleHorizontal },
    { id: 'square', label: 'Square', icon: Square },
    { id: 'circle', label: 'Circle', icon: Circle },
  ] as const;

  const badgeThemes = [
    { id: 'light', label: 'Light' },
    { id: 'dark', label: 'Dark' },
  ] as const;

  return (
    <div className="space-y-4">
      {/* Logo Box Settings */}
      <div>
        <SectionHeader>Logo Box</SectionHeader>
        <div className="space-y-3">
          <FormField label="Background Color">
            <ColorPicker
              value={headerConfig.style.logoBgColor}
              onChange={(val) => updateHeaderStyle({ logoBgColor: val })}
            />
          </FormField>

          <FormField label="Shape">
            <div className="flex gap-2">
              {logoShapes.map(({ id, label, icon: Icon }) => (
                <Button
                  key={id}
                  variant={headerConfig.style.logoShape === id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateHeaderStyle({ logoShape: id })}
                  className="flex-1"
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
              className="flex-1"
            >
              {id === 'light' ? <Sun className="h-3.5 w-3.5 mr-1.5" /> : <Moon className="h-3.5 w-3.5 mr-1.5" />}
              {label}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Background Image (Coming Soon) */}
      <div>
        <SectionHeader>Background Image</SectionHeader>
        <div className="border-2 border-dashed rounded-lg p-4 text-center border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-background))]">
          <Image className="h-8 w-8 mx-auto mb-2 text-[hsl(var(--sidebar-muted))]" />
          <p className="text-xs text-[hsl(var(--sidebar-muted-foreground))]">Coming soon</p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// SECTION EDITORS
// ============================================

function GlobalEditor() {
  const { globalConfig, updateGoogleReview, updateBrand, resetGlobalConfig, needsRegeneration, generatePalettes } = useGlobalConfig();
  const { toast } = useToast();

  const darkPresets = brandPresets.filter(p => p.tone === 'dark');
  const lightPresets = brandPresets.filter(p => p.tone === 'light');

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

      {/* Google Reviews */}
      <div>
        <SectionHeader>Google Reviews</SectionHeader>
        <div className="space-y-2">
          <FormField label="Rating">
            <Input
              value={globalConfig.googleReview.rating}
              onChange={(e) => updateGoogleReview({ rating: e.target.value })}
              placeholder="5.0"
              className="h-8"
            />
          </FormField>
          <FormField label="Count">
            <Input
              value={globalConfig.googleReview.reviewCount}
              onChange={(e) => updateGoogleReview({ reviewCount: e.target.value })}
              placeholder="50+"
              className="h-8"
            />
          </FormField>
        </div>
      </div>

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
  const [openPanel, setOpenPanel] = useState<string | null>('colors');

  return (
    <div className="space-y-2">
      <ToggleRow
        label="Show Section"
        checked={headerConfig.showTopbar}
        onChange={(val) => updateHeaderConfig({ showTopbar: val })}
      />

      <div className="rounded-lg border border-[hsl(var(--sidebar-border))] overflow-hidden">
        <SubPanel title="Colors" icon={Palette} isOpen={openPanel === 'colors'} onToggle={() => setOpenPanel(openPanel === 'colors' ? null : 'colors')}>
          <ColorsPanel theme={sectionThemes['topheader'] || {}} sectionId="topheader" />
        </SubPanel>

        <Separator />

        <SubPanel title="Content" icon={FileText} isOpen={openPanel === 'content'} onToggle={() => setOpenPanel(openPanel === 'content' ? null : 'content')}>
          <ContentPanel>
            <FormField label="Message">
              <Input
                value={topbarConfig.message}
                onChange={(e) => updateTopbarConfig({ message: e.target.value })}
                placeholder="Serving North Idaho..."
                className="h-8"
              />
            </FormField>
            <FormField label="Email">
              <Input
                value={topbarConfig.email}
                onChange={(e) => updateTopbarConfig({ email: e.target.value })}
                placeholder="info@example.com"
                className="h-8"
              />
            </FormField>
            <ToggleRow label="Show Phone" checked={topbarConfig.showPhone} onChange={(val) => updateTopbarConfig({ showPhone: val })} />
            <ToggleRow label="Show Email" checked={topbarConfig.showEmail} onChange={(val) => updateTopbarConfig({ showEmail: val })} />
          </ContentPanel>
        </SubPanel>

        <Separator />

        <SubPanel title="Advanced" icon={Image} isOpen={openPanel === 'advanced'} onToggle={() => setOpenPanel(openPanel === 'advanced' ? null : 'advanced')}>
          <AdvancedPanel />
        </SubPanel>
      </div>

      <Button variant="outline" size="sm" onClick={() => resetSectionTheme('topheader')} className="w-full">
        <RotateCcw className="h-3 w-3 mr-2" />
        Reset
      </Button>
    </div>
  );
}

function HeaderEditor() {
  const { headerConfig, updateHeaderConfig, resetHeaderConfig } = useHeaderConfig();
  const { sectionThemes, resetSectionTheme, isSectionVisible, setSectionVisibility } = useSectionTheme();
  const [openPanel, setOpenPanel] = useState<string | null>('colors');

  return (
    <div className="space-y-2">
      <ToggleRow
        label="Show Section"
        checked={isSectionVisible('header')}
        onChange={(val) => setSectionVisibility('header', val)}
      />

      <div className="rounded-lg border border-[hsl(var(--sidebar-border))] overflow-hidden">
        <SubPanel title="Colors" icon={Palette} isOpen={openPanel === 'colors'} onToggle={() => setOpenPanel(openPanel === 'colors' ? null : 'colors')}>
          <ColorsPanel theme={sectionThemes['header'] || {}} sectionId="header" />
        </SubPanel>

        <Separator />

        <SubPanel title="Content" icon={FileText} isOpen={openPanel === 'content'} onToggle={() => setOpenPanel(openPanel === 'content' ? null : 'content')}>
          <ContentPanel>
            <ToggleRow label="Show Phone" checked={headerConfig.showPhone} onChange={(val) => updateHeaderConfig({ showPhone: val })} />
            <ToggleRow label="Show Badge" checked={headerConfig.showBadge} onChange={(val) => updateHeaderConfig({ showBadge: val })} />
          </ContentPanel>
        </SubPanel>

        <Separator />

        <SubPanel title="Advanced" icon={Image} isOpen={openPanel === 'advanced'} onToggle={() => setOpenPanel(openPanel === 'advanced' ? null : 'advanced')}>
          <HeaderAdvancedPanel />
        </SubPanel>
      </div>

      <Button variant="outline" size="sm" onClick={() => { resetHeaderConfig(); resetSectionTheme('header'); }} className="w-full">
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
          <ContentPanel />
        </SubPanel>

        <Separator />

        <SubPanel title="Advanced" icon={Image} isOpen={openPanel === 'advanced'} onToggle={() => setOpenPanel(openPanel === 'advanced' ? null : 'advanced')}>
          <AdvancedPanel />
        </SubPanel>
      </div>

      <Button variant="outline" size="sm" onClick={onReset} className="w-full">
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
  const [isOpen, setIsOpen] = useState(true);
  const [openSection, setOpenSection] = useState<string>('global');
  const { sectionThemes, resetSectionTheme, isSectionVisible } = useSectionTheme();
  const { headerConfig, topbarConfig, resetHeaderConfig } = useHeaderConfig();
  const { globalConfig, resetGlobalConfig } = useGlobalConfig();
  const { toast } = useToast();

  const allSections: SectionId[] = [
    'hero', 'featured-testimonial', 'services', 'mid-cta',
    'service-areas', 'testimonials', 'faq', 'footer',
  ];

  const handleResetAll = () => {
    resetGlobalConfig();
    resetHeaderConfig();
    allSections.forEach(id => resetSectionTheme(id));
    resetSectionTheme('topheader');
    resetSectionTheme('header');
    toast('All settings reset!', 'success');
  };

  // Storage key for saved theme presets
  const PRESET_STORAGE_KEY = 'lake-city-theme-preset';

  // Build the complete config object
  const buildConfig = () => {
    const allSectionIds: SectionId[] = ['topheader', 'header', ...allSections];
    const completeSections: Record<string, object> = {};

    allSectionIds.forEach(id => {
      const theme = sectionThemes[id] || {};
      completeSections[id] = {
        visible: isSectionVisible(id),
        overrideGlobalColors: theme.overrideGlobalColors ?? false,
        paletteId: theme.paletteId ?? null,
        paletteMode: theme.paletteMode ?? null,
        bgPrimary: theme.bgPrimary ?? null,
        bgSecondary: theme.bgSecondary ?? null,
        bgTertiary: theme.bgTertiary ?? null,
        textPrimary: theme.textPrimary ?? null,
        textSecondary: theme.textSecondary ?? null,
        accent: theme.accent ?? null,
        borderColor: theme.borderColor ?? null,
      };
    });

    return {
      global: {
        brand: globalConfig.brand,
        googleReview: globalConfig.googleReview,
        form: globalConfig.form,
        trustBadges: globalConfig.trustBadges,
      },
      header: {
        showTopbar: headerConfig.showTopbar,
        showPhone: headerConfig.showPhone,
        showBadge: headerConfig.showBadge,
        isFixed: headerConfig.isFixed,
        copy: headerConfig.copy,
        style: headerConfig.style,
      },
      topbar: topbarConfig,
      sections: completeSections,
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

  const handleSaveConfig = () => {
    const config = buildConfig();
    localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(config));
    toast('Theme saved to localStorage!', 'success');
  };

  const handleLoadConfig = () => {
    try {
      const savedConfig = localStorage.getItem(PRESET_STORAGE_KEY);
      if (!savedConfig) {
        toast('No saved theme found', 'error');
        return;
      }

      const config = JSON.parse(savedConfig);

      // Update individual localStorage keys that contexts read from
      if (config.global) {
        localStorage.setItem('lake-city-global-config', JSON.stringify(config.global));
      }
      if (config.header) {
        localStorage.setItem('lake-city-header-config', JSON.stringify(config.header));
      }
      if (config.topbar) {
        localStorage.setItem('lake-city-topbar-config', JSON.stringify(config.topbar));
      }
      if (config.sections) {
        // Extract themes and visibility separately
        const themes: Record<string, object> = {};
        const visibility: Record<string, boolean> = {};

        Object.entries(config.sections).forEach(([id, section]) => {
          const s = section as Record<string, unknown>;
          visibility[id] = s.visible as boolean ?? true;
          // Remove 'visible' from theme object
          const { visible: _, ...themeData } = s;
          themes[id] = themeData;
        });

        localStorage.setItem('sectionThemes', JSON.stringify(themes));
        localStorage.setItem('sectionVisibility', JSON.stringify(visibility));
      }

      // Reload the page to apply the loaded config
      toast('Theme loaded! Reloading...', 'success');
      setTimeout(() => window.location.reload(), 500);
    } catch {
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

  if (!isOpen) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsOpen(true)}
              className="fixed top-1/2 left-0 -translate-y-1/2 z-[9999] rounded-l-none border-l-0 bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))]"
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
      <div className="sidebar-theme fixed top-0 left-0 h-full z-[9999] flex flex-col shadow-2xl w-72 bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground))] border-r border-[hsl(var(--sidebar-border))]">
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
          </Accordion>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-[hsl(var(--sidebar-border))] space-y-2">
          {/* Save/Load Row */}
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={handleSaveConfig} variant="outline" size="sm">
              <Save className="h-3.5 w-3.5 mr-1.5" />
              Save
            </Button>
            <Button onClick={handleLoadConfig} variant="outline" size="sm">
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Load
            </Button>
          </div>
          {/* Copy/Download Row */}
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={handleCopyConfig} variant="secondary" size="sm">
              <Copy className="h-3.5 w-3.5 mr-1.5" />
              Copy
            </Button>
            <Button onClick={handleDownloadConfig} variant="secondary" size="sm">
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Export
            </Button>
          </div>
          <Button variant="destructive" onClick={handleResetAll} className="w-full" size="sm">
            <RotateCcw className="h-3.5 w-3.5 mr-2" />
            Reset All
          </Button>
          <p className="text-center text-[10px] text-[hsl(var(--sidebar-muted))] pt-1">
            by BlueCrocus
          </p>
        </div>
      </div>
    </TooltipProvider>
  );
}
