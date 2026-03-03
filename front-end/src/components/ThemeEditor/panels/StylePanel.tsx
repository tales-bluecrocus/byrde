/**
 * Style Panel - Per-section mode override, section colors + gradient overlay
 */

import { useCallback, useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { ColorPicker } from '@/components/ui/color-picker';
import { Moon, Sun, Monitor, Globe, FileText, RotateCcw } from 'lucide-react';
import { useSectionTheme } from '../../../context/SectionThemeContext';
import { useGlobalConfig } from '../../../context/GlobalConfigContext';
import { useSectionPalette } from '../../../hooks/useSectionPalette';
import { generateBrandPalette, type BrandPalette } from '../../../utils/colorUtils';
import type { SectionId, SectionTheme } from '../../../context/SectionThemeContext';

/** Color fields that constitute a "section color override" */
const COLOR_FIELDS = ['accent', 'textPrimary', 'textSecondary', 'bgPrimary', 'bgSecondary', 'borderColor'] as const;
type ColorField = typeof COLOR_FIELDS[number];

/** Form-specific color fields (hero only) */
const FORM_COLOR_FIELDS = ['formBg', 'formText', 'formTextSecondary', 'formBorder', 'formAccent'] as const;
type FormColorField = typeof FORM_COLOR_FIELDS[number];

/** Per-section element color configs */
type SectionColorField = keyof SectionTheme & string;

interface SectionColorConfig {
  title: string;
  fields: SectionColorField[];
  labels: Record<string, string>;
  getDefaults: (p: BrandPalette) => Record<string, string>;
}

const SECTION_COLOR_CONFIGS: Partial<Record<SectionId, SectionColorConfig>> = {
  'testimonials': {
    title: 'Testimonials Colors',
    fields: ['tmBadgeColor', 'tmHeadlineColor', 'tmHeadlineAccent', 'tmSubheadlineColor', 'tmReviewLabelColor', 'tmCardBg', 'tmCardText', 'tmCardAuthor', 'tmCardBorder', 'tmDotColor'],
    labels: { tmBadgeColor: 'Badge', tmHeadlineColor: 'Headline', tmHeadlineAccent: 'Headline Strong', tmSubheadlineColor: 'Subheadline', tmReviewLabelColor: 'Review Label', tmCardBg: 'Card Bg', tmCardText: 'Card Text', tmCardAuthor: 'Card Author', tmCardBorder: 'Card Border', tmDotColor: 'Dots' },
    getDefaults: (p) => ({ tmBadgeColor: p.primary[500], tmHeadlineColor: p.text.primary, tmHeadlineAccent: p.primary[500], tmSubheadlineColor: p.text.secondary, tmReviewLabelColor: p.text.secondary, tmCardBg: p.background.secondary, tmCardText: p.text.secondary, tmCardAuthor: p.text.primary, tmCardBorder: p.border, tmDotColor: p.primary[500] }),
  },
  'services': {
    title: 'Services Colors',
    fields: ['svcBadgeColor', 'svcHeadlineColor', 'svcHeadlineAccent', 'svcSubheadlineColor', 'svcCardBg', 'svcCardBorder', 'svcCardTitle', 'svcCardText', 'svcIconColor', 'svcDotColor'],
    labels: { svcBadgeColor: 'Badge', svcHeadlineColor: 'Headline', svcHeadlineAccent: 'Headline Strong', svcSubheadlineColor: 'Subheadline', svcCardBg: 'Card Bg', svcCardBorder: 'Card Border', svcCardTitle: 'Card Title', svcCardText: 'Card Text', svcIconColor: 'Icon', svcDotColor: 'Dots' },
    getDefaults: (p) => ({ svcBadgeColor: p.primary[500], svcHeadlineColor: p.text.primary, svcHeadlineAccent: p.primary[500], svcSubheadlineColor: p.text.secondary, svcCardBg: p.background.secondary, svcCardBorder: p.border, svcCardTitle: p.text.primary, svcCardText: p.text.secondary, svcIconColor: p.primary[500], svcDotColor: p.primary[500] }),
  },
  'featured-testimonial': {
    title: 'Featured Testimonial Colors',
    fields: ['ftBadgeColor', 'ftQuoteColor', 'ftAuthorColor', 'ftAuthorTitle'],
    labels: { ftBadgeColor: 'Badge', ftQuoteColor: 'Quote', ftAuthorColor: 'Author Name', ftAuthorTitle: 'Author Title' },
    getDefaults: (p) => ({ ftBadgeColor: p.primary[500], ftQuoteColor: p.text.primary, ftAuthorColor: p.text.primary, ftAuthorTitle: p.text.secondary }),
  },
  'mid-cta': {
    title: 'Mid CTA Colors',
    fields: ['mcBadgeColor', 'mcHeadlineColor', 'mcHeadlineAccent', 'mcSubheadlineColor'],
    labels: { mcBadgeColor: 'Badge', mcHeadlineColor: 'Headline', mcHeadlineAccent: 'Headline Strong', mcSubheadlineColor: 'Subheadline' },
    getDefaults: (p) => ({ mcBadgeColor: p.text.primary, mcHeadlineColor: p.text.primary, mcHeadlineAccent: p.primary[500], mcSubheadlineColor: p.text.secondary }),
  },
  'service-areas': {
    title: 'Service Areas Colors',
    fields: ['saBadgeColor', 'saHeadlineColor', 'saHeadlineAccent', 'saSubheadlineColor', 'saTagBg', 'saTagText', 'saTagBorder'],
    labels: { saBadgeColor: 'Badge', saHeadlineColor: 'Headline', saHeadlineAccent: 'Headline Strong', saSubheadlineColor: 'Subheadline', saTagBg: 'Tag Bg', saTagText: 'Tag Text', saTagBorder: 'Tag Border' },
    getDefaults: (p) => ({ saBadgeColor: p.primary[500], saHeadlineColor: p.text.primary, saHeadlineAccent: p.primary[500], saSubheadlineColor: p.text.secondary, saTagBg: p.background.secondary, saTagText: p.text.secondary, saTagBorder: p.border }),
  },
  'faq': {
    title: 'FAQ Colors',
    fields: ['faqBadgeColor', 'faqHeadlineColor', 'faqHeadlineAccent', 'faqSubheadlineColor', 'faqQuestionColor', 'faqAnswerColor', 'faqItemBg', 'faqItemBorder', 'faqIconColor'],
    labels: { faqBadgeColor: 'Badge', faqHeadlineColor: 'Headline', faqHeadlineAccent: 'Headline Strong', faqSubheadlineColor: 'Subheadline', faqQuestionColor: 'Question', faqAnswerColor: 'Answer', faqItemBg: 'Item Bg', faqItemBorder: 'Item Border', faqIconColor: 'Chevron' },
    getDefaults: (p) => ({ faqBadgeColor: p.primary[500], faqHeadlineColor: p.text.primary, faqHeadlineAccent: p.primary[500], faqSubheadlineColor: p.text.secondary, faqQuestionColor: p.text.primary, faqAnswerColor: p.text.secondary, faqItemBg: p.background.secondary, faqItemBorder: p.border, faqIconColor: p.primary[500] }),
  },
  'footer-cta': {
    title: 'Footer CTA Colors',
    fields: ['fcHeadlineColor', 'fcHeadlineAccent', 'fcSubheadlineColor'],
    labels: { fcHeadlineColor: 'Headline', fcHeadlineAccent: 'Headline Strong', fcSubheadlineColor: 'Subheadline' },
    getDefaults: (p) => ({ fcHeadlineColor: p.text.primary, fcHeadlineAccent: p.accent[500], fcSubheadlineColor: p.text.secondary }),
  },
};

interface StylePanelProps {
  sectionId: SectionId;
}

const FIXED_SECTIONS: SectionId[] = ['topheader', 'header', 'footer'];

export function StylePanel({ sectionId }: StylePanelProps) {
  const { sectionThemes, updateSectionTheme } = useSectionTheme();
  const { globalConfig, palette } = useGlobalConfig();
  const sectionPalette = useSectionPalette(sectionId);
  const theme = sectionThemes[sectionId] || {};
  const pageMode = globalConfig.brand.mode;

  const paddingValue = theme.padding || 'md';

  // ── Section Colors ──────────────────────────────────────────
  const hasAnyOverride = COLOR_FIELDS.some(f => !!theme[f]);

  const handleColorChange = useCallback((field: ColorField, value: string) => {
    const updates: Partial<SectionTheme> = { [field]: value || undefined };
    if (value) {
      updates.overrideGlobalColors = true;
    } else {
      // Clearing — if all other fields are also empty, disable override
      const others = COLOR_FIELDS.filter(f => f !== field);
      if (others.every(f => !theme[f])) {
        updates.overrideGlobalColors = false;
      }
    }
    updateSectionTheme(sectionId, updates);
  }, [sectionId, theme, updateSectionTheme]);

  const handleResetAllColors = useCallback(() => {
    const reset: Partial<SectionTheme> = { overrideGlobalColors: false };
    for (const f of COLOR_FIELDS) reset[f] = undefined;
    updateSectionTheme(sectionId, reset);
  }, [sectionId, updateSectionTheme]);

  // Effective palette defaults (shown as reference swatches)
  const defaults: Record<ColorField, string> = {
    accent: sectionPalette.primary[500],
    textPrimary: sectionPalette.text.primary,
    textSecondary: sectionPalette.text.secondary,
    bgPrimary: sectionPalette.background.primary,
    bgSecondary: sectionPalette.background.secondary,
    borderColor: sectionPalette.border,
  };

  const colorLabels: Record<ColorField, string> = {
    accent: 'Accent',
    textPrimary: 'Text',
    textSecondary: 'Text 2nd',
    bgPrimary: 'Background',
    bgSecondary: 'Background 2',
    borderColor: 'Border',
  };

  const sectionColors = (
    <div>
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Section Colors
        </Label>
        {hasAnyOverride && (
          <button
            onClick={handleResetAllColors}
            className="flex items-center gap-1 text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors"
            title="Reset all section colors"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 mt-2">
        {COLOR_FIELDS.map((field) => (
          <div key={field}>
            <div className="flex items-center gap-1.5 mb-1">
              <div
                className="w-3 h-3 rounded-sm border border-zinc-600 shrink-0"
                style={{ backgroundColor: defaults[field] }}
                title={`Default: ${defaults[field]}`}
              />
              <Label className="text-[11px] text-zinc-500">{colorLabels[field]}</Label>
            </div>
            <ColorPicker
              value={theme[field] || ''}
              onChange={(val) => handleColorChange(field, val)}
              defaultValue={defaults[field]}
            />
          </div>
        ))}
      </div>
      {!hasAnyOverride && (
        <p className="text-[10px] mt-2 text-zinc-500">
          Using mode defaults. Pick a color to override.
        </p>
      )}
    </div>
  );

  // ── Form Colors (hero only) ──────────────────────────────────
  const hasAnyFormOverride = FORM_COLOR_FIELDS.some(f => !!theme[f]);

  const handleFormColorChange = useCallback((field: FormColorField, value: string) => {
    updateSectionTheme(sectionId, { [field]: value || undefined });
  }, [sectionId, updateSectionTheme]);

  const handleResetAllFormColors = useCallback(() => {
    const reset: Partial<SectionTheme> = {};
    for (const f of FORM_COLOR_FIELDS) reset[f] = undefined;
    updateSectionTheme(sectionId, reset);
  }, [sectionId, updateSectionTheme]);

  // Compute form-mode-specific palette defaults for swatches
  const formDefaults = useMemo(() => {
    const effectiveSection = theme.paletteMode || pageMode;
    const formMode = theme.formPaletteMode || effectiveSection;
    const isFormDark = formMode === 'dark';
    const b = globalConfig.brand;
    const fp = generateBrandPalette(
      isFormDark ? b.darkPrimary : b.lightPrimary,
      isFormDark ? b.darkAccent : b.lightAccent,
      formMode,
      isFormDark ? b.darkBg : b.lightBg,
      isFormDark ? b.darkText : b.lightText,
      {
        textSecondary: isFormDark ? b.darkTextSecondary : b.lightTextSecondary,
        bgSecondary: isFormDark ? b.darkBgSecondary : b.lightBgSecondary,
        border: isFormDark ? b.darkBorder : b.lightBorder,
      },
    );
    return {
      formBg: fp.background.secondary,
      formText: fp.text.primary,
      formTextSecondary: fp.text.secondary,
      formBorder: fp.border,
      formAccent: fp.primary[500],
    } as Record<FormColorField, string>;
  }, [theme.paletteMode, theme.formPaletteMode, pageMode, globalConfig.brand]);

  const formColorLabels: Record<FormColorField, string> = {
    formBg: 'Background',
    formText: 'Text',
    formTextSecondary: 'Text 2nd',
    formBorder: 'Border',
    formAccent: 'Accent',
  };

  const formColors = (
    <div>
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Form Colors
        </Label>
        {hasAnyFormOverride && (
          <button
            onClick={handleResetAllFormColors}
            className="flex items-center gap-1 text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors"
            title="Reset all form colors"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 mt-2">
        {FORM_COLOR_FIELDS.map((field) => (
          <div key={field}>
            <div className="flex items-center gap-1.5 mb-1">
              <div
                className="w-3 h-3 rounded-sm border border-zinc-600 shrink-0"
                style={{ backgroundColor: formDefaults[field] }}
                title={`Default: ${formDefaults[field]}`}
              />
              <Label className="text-[11px] text-zinc-500">{formColorLabels[field]}</Label>
            </div>
            <ColorPicker
              value={theme[field] || ''}
              onChange={(val) => handleFormColorChange(field, val)}
              defaultValue={formDefaults[field]}
            />
          </div>
        ))}
      </div>
      {!hasAnyFormOverride && (
        <p className="text-[10px] mt-2 text-zinc-500">
          Using form mode defaults. Pick a color to override.
        </p>
      )}
    </div>
  );

  // ── Per-Section Element Colors (generic) ─────────────────
  const sectionColorConfig = SECTION_COLOR_CONFIGS[sectionId];

  const handleElementColorChange = useCallback((field: string, value: string) => {
    updateSectionTheme(sectionId, { [field]: value || undefined });
  }, [sectionId, updateSectionTheme]);

  const handleResetElementColors = useCallback(() => {
    if (!sectionColorConfig) return;
    const reset: Partial<SectionTheme> = {};
    for (const f of sectionColorConfig.fields) reset[f] = undefined;
    updateSectionTheme(sectionId, reset);
  }, [sectionId, sectionColorConfig, updateSectionTheme]);

  const elementDefaults = useMemo(() => {
    if (!sectionColorConfig) return {} as Record<string, string>;
    return sectionColorConfig.getDefaults(sectionPalette);
  }, [sectionColorConfig, sectionPalette]);

  const hasAnyElementOverride = sectionColorConfig?.fields.some(f => !!theme[f as keyof SectionTheme]) ?? false;

  const elementColors = sectionColorConfig ? (
    <div>
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          {sectionColorConfig.title}
        </Label>
        {hasAnyElementOverride && (
          <button
            onClick={handleResetElementColors}
            className="flex items-center gap-1 text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors"
            title="Reset all element colors"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 mt-2">
        {sectionColorConfig.fields.map((field) => (
          <div key={field}>
            <div className="flex items-center gap-1.5 mb-1">
              <div
                className="w-3 h-3 rounded-sm border border-zinc-600 shrink-0"
                style={{ backgroundColor: elementDefaults[field] }}
                title={`Default: ${elementDefaults[field]}`}
              />
              <Label className="text-[11px] text-zinc-500">{sectionColorConfig.labels[field]}</Label>
            </div>
            <ColorPicker
              value={(theme[field as keyof SectionTheme] as string) || ''}
              onChange={(val) => handleElementColorChange(field, val)}
              defaultValue={elementDefaults[field]}
            />
          </div>
        ))}
      </div>
      {!hasAnyElementOverride && (
        <p className="text-[10px] mt-2 text-zinc-500">
          Using mode defaults. Pick a color to override.
        </p>
      )}
    </div>
  ) : null;

  const paddingToggle = (
    <div>
      <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
        Padding
      </Label>
      <ToggleGroup
        type="single"
        value={paddingValue}
        onValueChange={(val) => {
          if (!val) return;
          updateSectionTheme(sectionId, { padding: val as SectionTheme['padding'] });
        }}
        className="w-full bg-zinc-800 p-1 rounded-lg mt-2"
      >
        <ToggleGroupItem value="sm" className="flex-1 text-[11px] text-zinc-400 data-[state=on]:bg-zinc-700 data-[state=on]:text-zinc-100">
          Small
        </ToggleGroupItem>
        <ToggleGroupItem value="md" className="flex-1 text-[11px] text-zinc-400 data-[state=on]:bg-zinc-700 data-[state=on]:text-zinc-100">
          Medium
        </ToggleGroupItem>
        <ToggleGroupItem value="lg" className="flex-1 text-[11px] text-zinc-400 data-[state=on]:bg-zinc-700 data-[state=on]:text-zinc-100">
          Large
        </ToggleGroupItem>
        <ToggleGroupItem value="xl" className="flex-1 text-[11px] text-zinc-400 data-[state=on]:bg-zinc-700 data-[state=on]:text-zinc-100">
          XL
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );

  // Gradient overlay controls
  const gradientEnabled = theme.gradientEnabled ?? false;
  const gradientType = theme.gradientType || 'linear';
  const gradientAngle = theme.gradientAngle ?? 180;
  const gradientLocation1 = theme.gradientLocation1 ?? 0;
  const gradientLocation2 = theme.gradientLocation2 ?? 100;
  const gradientPosition = theme.gradientPosition || 'center';
  const effectiveBg = theme.bgPrimary || palette.background.primary;
  const gradientColor1 = theme.gradientColor1 || effectiveBg;
  const gradientColor2 = theme.gradientColor2 || 'transparent';

  // Build preview gradient string
  const previewGradient = gradientType === 'radial'
    ? `radial-gradient(circle at ${gradientPosition}, ${gradientColor1} ${gradientLocation1}%, ${gradientColor2} ${gradientLocation2}%)`
    : `linear-gradient(${gradientAngle}deg, ${gradientColor1} ${gradientLocation1}%, ${gradientColor2} ${gradientLocation2}%)`;

  const handleGradientToggle = (enabled: boolean) => {
    if (enabled) {
      // Auto-capture current bg color when enabling
      updateSectionTheme(sectionId, {
        gradientEnabled: true,
        gradientColor1: effectiveBg,
        gradientColor2: theme.gradientColor2 || 'transparent',
        gradientType: theme.gradientType || 'linear',
        gradientAngle: theme.gradientAngle ?? 180,
        gradientPosition: theme.gradientPosition || 'center',
      });
    } else {
      updateSectionTheme(sectionId, { gradientEnabled: false });
    }
  };

  const gradientOverlay = (
    <div>
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Gradient Overlay
        </Label>
        <Switch
          checked={gradientEnabled}
          onCheckedChange={handleGradientToggle}
        />
      </div>

      {gradientEnabled && (
        <div className="mt-3 space-y-4">
          {/* Live preview */}
          <div
            className="h-10 rounded-lg border border-zinc-700"
            style={{ background: previewGradient }}
          />

          {/* Type toggle */}
          <div>
            <Label className="text-[11px] text-zinc-500">Type</Label>
            <ToggleGroup
              type="single"
              value={gradientType}
              onValueChange={(val) => {
                if (!val) return;
                updateSectionTheme(sectionId, { gradientType: val as 'linear' | 'radial' });
              }}
              className="w-full bg-zinc-800 p-1 rounded-lg mt-1"
            >
              <ToggleGroupItem value="linear" className="flex-1 text-[11px] text-zinc-400 data-[state=on]:bg-zinc-700 data-[state=on]:text-zinc-100">
                Linear
              </ToggleGroupItem>
              <ToggleGroupItem value="radial" className="flex-1 text-[11px] text-zinc-400 data-[state=on]:bg-zinc-700 data-[state=on]:text-zinc-100">
                Radial
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Color 1 */}
          <div>
            <Label className="text-[11px] text-zinc-500">Color</Label>
            <div className="mt-1">
              <ColorPicker
                value={gradientColor1}
                onChange={(val) => updateSectionTheme(sectionId, { gradientColor1: val })}
              />
            </div>
            <div className="mt-2">
              <div className="flex items-center justify-between">
                <Label className="text-[11px] text-zinc-500">Location</Label>
                <span className="text-[11px] text-zinc-500">{gradientLocation1}%</span>
              </div>
              <Slider
                min={0}
                max={100}
                step={1}
                value={[gradientLocation1]}
                onValueChange={([val]) => updateSectionTheme(sectionId, { gradientLocation1: val })}
                className="mt-1"
              />
            </div>
          </div>

          {/* Color 2 */}
          <div>
            <Label className="text-[11px] text-zinc-500">Second Color</Label>
            <div className="mt-1">
              <ColorPicker
                value={gradientColor2}
                onChange={(val) => updateSectionTheme(sectionId, { gradientColor2: val })}
              />
            </div>
            <div className="mt-2">
              <div className="flex items-center justify-between">
                <Label className="text-[11px] text-zinc-500">Location</Label>
                <span className="text-[11px] text-zinc-500">{gradientLocation2}%</span>
              </div>
              <Slider
                min={0}
                max={100}
                step={1}
                value={[gradientLocation2]}
                onValueChange={([val]) => updateSectionTheme(sectionId, { gradientLocation2: val })}
                className="mt-1"
              />
            </div>
          </div>

          {/* Angle slider (linear only) */}
          {gradientType === 'linear' && (
            <div>
              <div className="flex items-center justify-between">
                <Label className="text-[11px] text-zinc-500">Angle</Label>
                <span className="text-[11px] text-zinc-500">{gradientAngle}°</span>
              </div>
              <Slider
                min={0}
                max={360}
                step={1}
                value={[gradientAngle]}
                onValueChange={([val]) => updateSectionTheme(sectionId, { gradientAngle: val })}
                className="mt-2"
              />
            </div>
          )}

          {/* Position (radial only) */}
          {gradientType === 'radial' && (
            <div>
              <Label className="text-[11px] text-zinc-500">Position</Label>
              <ToggleGroup
                type="single"
                value={gradientPosition}
                onValueChange={(val) => {
                  if (!val) return;
                  updateSectionTheme(sectionId, { gradientPosition: val });
                }}
                className="w-full bg-zinc-800 p-1 rounded-lg mt-1 flex-wrap"
              >
                <ToggleGroupItem value="center" className="flex-1 text-[11px] text-zinc-400 data-[state=on]:bg-zinc-700 data-[state=on]:text-zinc-100">
                  Center
                </ToggleGroupItem>
                <ToggleGroupItem value="top" className="flex-1 text-[11px] text-zinc-400 data-[state=on]:bg-zinc-700 data-[state=on]:text-zinc-100">
                  Top
                </ToggleGroupItem>
                <ToggleGroupItem value="bottom" className="flex-1 text-[11px] text-zinc-400 data-[state=on]:bg-zinc-700 data-[state=on]:text-zinc-100">
                  Bottom
                </ToggleGroupItem>
                <ToggleGroupItem value="left" className="flex-1 text-[11px] text-zinc-400 data-[state=on]:bg-zinc-700 data-[state=on]:text-zinc-100">
                  Left
                </ToggleGroupItem>
                <ToggleGroupItem value="right" className="flex-1 text-[11px] text-zinc-400 data-[state=on]:bg-zinc-700 data-[state=on]:text-zinc-100">
                  Right
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Fixed sections (header/footer) always follow the page mode
  if (FIXED_SECTIONS.includes(sectionId)) {
    return (
      <div className="space-y-5 text-zinc-200">
        <div>
          <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Section Mode
          </Label>
          <div className="mt-3 flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50 border border-zinc-800">
            <Globe className="h-4 w-4 text-zinc-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium text-zinc-300">Follows page theme mode</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Currently: {pageMode === 'dark' ? 'Dark' : 'Light'}
              </p>
            </div>
          </div>
        </div>
        {sectionColors}
        {paddingToggle}
        {gradientOverlay}
      </div>
    );
  }

  const paletteMode = theme.paletteMode;
  const toggleValue = paletteMode ?? 'default';

  return (
    <div className="space-y-5 text-zinc-200">
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Section Mode
        </Label>
        <ToggleGroup
          type="single"
          value={toggleValue}
          onValueChange={(val) => {
            if (!val) return;
            if (val === 'default') {
              updateSectionTheme(sectionId, { paletteMode: undefined });
            } else {
              updateSectionTheme(sectionId, { paletteMode: val as 'dark' | 'light' });
            }
          }}
          className="w-full bg-zinc-800 p-1 rounded-lg mt-2"
        >
          <ToggleGroupItem value="default" className="flex-1 gap-1.5 text-zinc-400 data-[state=on]:bg-zinc-700 data-[state=on]:text-zinc-100">
            <Monitor className="h-3.5 w-3.5" />
            Default
          </ToggleGroupItem>
          <ToggleGroupItem value="dark" className="flex-1 gap-1.5 text-zinc-400 data-[state=on]:bg-zinc-700 data-[state=on]:text-zinc-100">
            <Moon className="h-3.5 w-3.5" />
            Dark
          </ToggleGroupItem>
          <ToggleGroupItem value="light" className="flex-1 gap-1.5 text-zinc-400 data-[state=on]:bg-zinc-700 data-[state=on]:text-zinc-100">
            <Sun className="h-3.5 w-3.5" />
            Light
          </ToggleGroupItem>
        </ToggleGroup>
        <p className="text-[10px] mt-1.5 text-zinc-500">
          {paletteMode
            ? `Overriding: ${paletteMode === 'dark' ? 'Dark' : 'Light'}`
            : `Using page default (${pageMode === 'dark' ? 'Dark' : 'Light'})`}
        </p>
      </div>
      {sectionId === 'hero' && (() => {
        const formPaletteMode = theme.formPaletteMode;
        const formToggleValue = formPaletteMode ?? 'default';
        const effectiveSectionMode = paletteMode || pageMode;
        const effectiveFormMode = formPaletteMode || effectiveSectionMode;
        return (
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Form Style
            </Label>
            <ToggleGroup
              type="single"
              value={formToggleValue}
              onValueChange={(val) => {
                if (!val) return;
                if (val === 'default') {
                  updateSectionTheme(sectionId, { formPaletteMode: undefined });
                } else {
                  updateSectionTheme(sectionId, { formPaletteMode: val as 'dark' | 'light' });
                }
              }}
              className="w-full bg-zinc-800 p-1 rounded-lg mt-2"
            >
              <ToggleGroupItem value="default" className="flex-1 gap-1.5 text-zinc-400 data-[state=on]:bg-zinc-700 data-[state=on]:text-zinc-100">
                <FileText className="h-3.5 w-3.5" />
                Default
              </ToggleGroupItem>
              <ToggleGroupItem value="dark" className="flex-1 gap-1.5 text-zinc-400 data-[state=on]:bg-zinc-700 data-[state=on]:text-zinc-100">
                <Moon className="h-3.5 w-3.5" />
                Dark
              </ToggleGroupItem>
              <ToggleGroupItem value="light" className="flex-1 gap-1.5 text-zinc-400 data-[state=on]:bg-zinc-700 data-[state=on]:text-zinc-100">
                <Sun className="h-3.5 w-3.5" />
                Light
              </ToggleGroupItem>
            </ToggleGroup>
            <p className="text-[10px] mt-1.5 text-zinc-500">
              {formPaletteMode
                ? `Form: ${formPaletteMode === 'dark' ? 'Dark' : 'Light'}`
                : `Follows section (${effectiveFormMode === 'dark' ? 'Dark' : 'Light'})`}
            </p>
          </div>
        );
      })()}
      {sectionId === 'hero' && formColors}
      {sectionColors}
      {elementColors}
      {paddingToggle}
      {gradientOverlay}
    </div>
  );
}
