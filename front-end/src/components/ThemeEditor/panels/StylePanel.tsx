/**
 * Style Panel - Section color customization
 * Light theme with explicit Tailwind colors
 */

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { ColorPicker } from '@/components/ui/color-picker';
import { useSectionTheme, type SectionId } from '../../../context/SectionThemeContext';
import { useGlobalConfig } from '../../../context/GlobalConfigContext';
import type { SectionPalette } from '../../../config/sectionPalettes';
import { useToast } from '../../Toast';
import { RotateCcw, Check, Palette } from 'lucide-react';

interface StylePanelProps {
  sectionId: SectionId;
}

export function StylePanel({ sectionId }: StylePanelProps) {
  const { sectionThemes, updateSectionTheme, resetSectionTheme, setOverrideGlobalColors, setSectionPalette } = useSectionTheme();
  const { globalConfig, generatedPalettes } = useGlobalConfig();
  const { toast } = useToast();

  const theme = sectionThemes[sectionId] || {};
  const overrideGlobal = theme.overrideGlobalColors ?? false;

  const handleToggleOverride = (checked: boolean) => {
    setOverrideGlobalColors(sectionId, checked);
    toast(checked ? 'Custom colors enabled' : 'Using global colors', 'info');
  };

  const handleSelectPalette = (paletteId: string) => {
    const palette = generatedPalettes.all.find((p: SectionPalette) => p.id === paletteId);
    if (palette) {
      setSectionPalette(sectionId, palette);
      toast(`Applied ${palette.name} palette`, 'success');
    }
  };

  const handleReset = () => {
    resetSectionTheme(sectionId);
    toast('Section reset to defaults', 'info');
  };

  return (
    <div className="space-y-5 text-zinc-200">
      {/* Override Toggle */}
      <Card className="bg-zinc-800/50 border-zinc-800">
        <CardContent className="flex items-center justify-between p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-800">
              <Palette className="h-4 w-4 text-zinc-400" />
            </div>
            <div>
              <Label className="text-xs font-medium text-zinc-200">Custom Colors</Label>
              <p className="text-[10px] text-zinc-500">
                {overrideGlobal ? 'Using custom colors' : 'Using global colors'}
              </p>
            </div>
          </div>
          <Switch checked={overrideGlobal} onCheckedChange={handleToggleOverride} />
        </CardContent>
      </Card>

      {overrideGlobal && (
        <>
          <Separator className="bg-zinc-800/60" />

          {/* Dark Palettes */}
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Dark Palettes
            </Label>
            <p className="text-xs mb-3 text-zinc-400">Pre-designed dark color schemes</p>
            <div className="grid grid-cols-3 gap-2">
              {generatedPalettes.dark.map((palette: SectionPalette) => {
                const isSelected = theme.paletteId === palette.id;
                return (
                  <button
                    key={palette.id}
                    onClick={() => handleSelectPalette(palette.id)}
                    className={`relative rounded-lg overflow-hidden h-12 transition-all duration-150 hover:scale-105 border ${
                      isSelected ? 'border-2 border-emerald-500 ring-2 ring-emerald-500/20' : 'border-zinc-800'
                    }`}
                    title={palette.name}
                  >
                    <div className="flex h-full">
                      <div className="flex-1" style={{ backgroundColor: palette.colors.bgPrimary }} />
                      <div className="flex-1" style={{ backgroundColor: palette.colors.bgSecondary }} />
                      <div className="w-2" style={{ backgroundColor: palette.colors.accent }} />
                    </div>
                    {isSelected && (
                      <div className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full flex items-center justify-center bg-emerald-600">
                        <Check className="h-2.5 w-2.5 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Light Palettes */}
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Light Palettes
            </Label>
            <p className="text-xs mb-3 text-zinc-400">Pre-designed light color schemes</p>
            <div className="grid grid-cols-3 gap-2">
              {generatedPalettes.light.map((palette: SectionPalette) => {
                const isSelected = theme.paletteId === palette.id;
                return (
                  <button
                    key={palette.id}
                    onClick={() => handleSelectPalette(palette.id)}
                    className={`relative rounded-lg overflow-hidden h-12 transition-all duration-150 hover:scale-105 border ${
                      isSelected ? 'border-2 border-emerald-500 ring-2 ring-emerald-500/20' : 'border-zinc-800'
                    }`}
                    title={palette.name}
                  >
                    <div className="flex h-full">
                      <div className="flex-1" style={{ backgroundColor: palette.colors.bgPrimary }} />
                      <div className="flex-1" style={{ backgroundColor: palette.colors.bgSecondary }} />
                      <div className="w-2" style={{ backgroundColor: palette.colors.accent }} />
                    </div>
                    {isSelected && (
                      <div className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full flex items-center justify-center bg-emerald-600">
                        <Check className="h-2.5 w-2.5 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <Separator className="bg-zinc-800/60" />

          {/* Custom Colors */}
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Custom Colors
            </Label>
            <p className="text-xs mb-3 text-zinc-400">Fine-tune individual colors</p>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-zinc-400">Background Primary</Label>
                  <ColorPicker
                    value={theme.bgPrimary || globalConfig.brand.primary}
                    onChange={(val) => updateSectionTheme(sectionId, { bgPrimary: val })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-zinc-400">Background Secondary</Label>
                  <ColorPicker
                    value={theme.bgSecondary || '#1a1a1a'}
                    onChange={(val) => updateSectionTheme(sectionId, { bgSecondary: val })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-zinc-400">Text Primary</Label>
                  <ColorPicker
                    value={theme.textPrimary || '#ffffff'}
                    onChange={(val) => updateSectionTheme(sectionId, { textPrimary: val })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-zinc-400">Text Secondary</Label>
                  <ColorPicker
                    value={theme.textSecondary || '#a3a3a3'}
                    onChange={(val) => updateSectionTheme(sectionId, { textSecondary: val })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium text-zinc-400">Accent Color</Label>
                <ColorPicker
                  value={theme.accent || globalConfig.brand.accent}
                  onChange={(val) => updateSectionTheme(sectionId, { accent: val })}
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Preview
            </Label>
            <Card className="mt-3 overflow-hidden border-zinc-800">
              <div
                className="p-4"
                style={{ backgroundColor: theme.bgPrimary || globalConfig.brand.primary }}
              >
                <div
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: theme.bgSecondary || '#1a1a1a' }}
                >
                  <p
                    className="text-sm font-semibold"
                    style={{ color: theme.textPrimary || '#ffffff' }}
                  >
                    Primary Text
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: theme.textSecondary || '#a3a3a3' }}
                  >
                    Secondary text example
                  </p>
                  <div
                    className="mt-2 px-3 py-1 rounded text-xs font-medium inline-block"
                    style={{
                      backgroundColor: theme.accent || globalConfig.brand.accent,
                      color: '#ffffff',
                    }}
                  >
                    Accent Button
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}

      <Separator className="bg-zinc-800/60" />

      {/* Reset */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleReset}
        className="w-full border-zinc-700 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30"
      >
        <RotateCcw className="h-4 w-4 mr-2" />
        Reset Section
      </Button>
    </div>
  );
}
