/**
 * Style Panel - Per-section mode override, accent, button color, form colors (hero)
 */

import { useCallback, useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ColorPicker } from '@/components/ui/color-picker';
import { Moon, Sun, Monitor, Globe, FileText, RotateCcw, Palette } from 'lucide-react';
import { useSectionTheme } from '../../../context/SectionThemeContext';
import { useGlobalConfig } from '../../../context/GlobalConfigContext';
import { generateBrandPalette } from '../../../utils/colorUtils';
import { getColorsForMode } from '../../../hooks/useSectionPalette';
import type { SectionId, SectionTheme } from '../../../context/SectionThemeContext';

/** Form-specific color fields (hero only) */
const FORM_COLOR_FIELDS = ['formBg', 'formText', 'formTextSecondary', 'formBorder', 'formAccent'] as const;
type FormColorField = typeof FORM_COLOR_FIELDS[number];

interface StylePanelProps {
  sectionId: SectionId;
}

const FIXED_SECTIONS: SectionId[] = ['header'];

export function StylePanel({ sectionId }: StylePanelProps) {
  const { sectionThemes, updateSectionTheme } = useSectionTheme();
  const { globalConfig } = useGlobalConfig();
  const theme = sectionThemes[sectionId] || {};
  const pageMode = globalConfig.brand.mode;

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
    const colors = getColorsForMode(globalConfig.brand, formMode);
    const fp = generateBrandPalette(colors.primary, colors.accent, formMode, colors.text);
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
        {/* Section Accent toggle (header, footer only) */}
        {(sectionId === 'header' || sectionId === 'footer') && (
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Section Accent
            </Label>
            <ToggleGroup
              type="single"
              value={theme.accentSource || 'primary'}
              onValueChange={(val) => {
                if (!val) return;
                updateSectionTheme(sectionId, { accentSource: val === 'primary' ? undefined : val as 'accent' });
              }}
              className="w-full bg-zinc-800 p-1 rounded-lg mt-2"
            >
              <ToggleGroupItem value="primary" className="flex-1 gap-1.5 text-zinc-400 data-[state=on]:bg-zinc-700 data-[state=on]:text-zinc-100">
                <Palette className="h-3.5 w-3.5" />
                Primary
              </ToggleGroupItem>
              <ToggleGroupItem value="accent" className="flex-1 gap-1.5 text-zinc-400 data-[state=on]:bg-zinc-700 data-[state=on]:text-zinc-100">
                <Palette className="h-3.5 w-3.5" />
                Accent
              </ToggleGroupItem>
            </ToggleGroup>
            <p className="text-[10px] mt-1.5 text-zinc-500">
              Color used for accent elements
            </p>
          </div>
        )}
        {/* Button Color toggle */}
        {sectionId === 'header' && (
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Button Color
            </Label>
            <ToggleGroup
              type="single"
              value={String(theme.buttonStyle || 1)}
              onValueChange={(val) => {
                if (!val) return;
                const style = Number(val) as 1 | 2;
                updateSectionTheme(sectionId, { buttonStyle: style === 1 ? undefined : style });
              }}
              className="w-full bg-zinc-800 p-1 rounded-lg mt-2"
            >
              <ToggleGroupItem value="1" className="flex-1 gap-1.5 text-zinc-400 data-[state=on]:bg-zinc-700 data-[state=on]:text-zinc-100">
                Primary
              </ToggleGroupItem>
              <ToggleGroupItem value="2" className="flex-1 gap-1.5 text-zinc-400 data-[state=on]:bg-zinc-700 data-[state=on]:text-zinc-100">
                Accent
              </ToggleGroupItem>
            </ToggleGroup>
            <p className="text-[10px] mt-1.5 text-zinc-500">
              Background color for the CTA button
            </p>
          </div>
        )}
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
      {/* Accent Source toggle */}
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Section Accent
        </Label>
        <ToggleGroup
          type="single"
          value={theme.accentSource || 'primary'}
          onValueChange={(val) => {
            if (!val) return;
            updateSectionTheme(sectionId, { accentSource: val === 'primary' ? undefined : val as 'accent' });
          }}
          className="w-full bg-zinc-800 p-1 rounded-lg mt-2"
        >
          <ToggleGroupItem value="primary" className="flex-1 gap-1.5 text-zinc-400 data-[state=on]:bg-zinc-700 data-[state=on]:text-zinc-100">
            <Palette className="h-3.5 w-3.5" />
            Primary
          </ToggleGroupItem>
          <ToggleGroupItem value="accent" className="flex-1 gap-1.5 text-zinc-400 data-[state=on]:bg-zinc-700 data-[state=on]:text-zinc-100">
            <Palette className="h-3.5 w-3.5" />
            Accent
          </ToggleGroupItem>
        </ToggleGroup>
        <p className="text-[10px] mt-1.5 text-zinc-500">
          Color used for badges, headlines, and icons
        </p>
      </div>
      {/* Button Color toggle */}
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Button Color
        </Label>
        <ToggleGroup
          type="single"
          value={String(theme.buttonStyle || 1)}
          onValueChange={(val) => {
            if (!val) return;
            const style = Number(val) as 1 | 2;
            updateSectionTheme(sectionId, { buttonStyle: style === 1 ? undefined : style });
          }}
          className="w-full bg-zinc-800 p-1 rounded-lg mt-2"
        >
          <ToggleGroupItem value="1" className="flex-1 gap-1.5 text-zinc-400 data-[state=on]:bg-zinc-700 data-[state=on]:text-zinc-100">
            Primary
          </ToggleGroupItem>
          <ToggleGroupItem value="2" className="flex-1 gap-1.5 text-zinc-400 data-[state=on]:bg-zinc-700 data-[state=on]:text-zinc-100">
            Accent
          </ToggleGroupItem>
        </ToggleGroup>
        <p className="text-[10px] mt-1.5 text-zinc-500">
          Background color for CTA buttons in this section
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
    </div>
  );
}
