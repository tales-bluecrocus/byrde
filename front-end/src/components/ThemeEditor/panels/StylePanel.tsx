/**
 * Style Panel - Per-section mode override + button style
 */

import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Moon, Sun, Monitor, Globe } from 'lucide-react';
import { useSectionTheme } from '../../../context/SectionThemeContext';
import { useGlobalConfig } from '../../../context/GlobalConfigContext';
import type { SectionId } from '../../../context/SectionThemeContext';

interface StylePanelProps {
  sectionId: SectionId;
}

const FIXED_SECTIONS: SectionId[] = ['topheader', 'header', 'footer'];

export function StylePanel({ sectionId }: StylePanelProps) {
  const { sectionThemes, updateSectionTheme } = useSectionTheme();
  const { globalConfig, palette } = useGlobalConfig();
  const theme = sectionThemes[sectionId] || {};
  const pageMode = globalConfig.brand.mode;

  const primaryColor = palette.primary[500];
  const accentColor = palette.accent[500];
  const buttonStyle = theme.buttonStyle ?? 1;

  // Button style toggle (shared by fixed and non-fixed sections)
  const buttonStyleToggle = (
    <div>
      <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
        Button Style
      </Label>
      <ToggleGroup
        type="single"
        value={String(buttonStyle)}
        onValueChange={(val) => {
          if (!val) return;
          updateSectionTheme(sectionId, { buttonStyle: Number(val) as 1 | 2 });
        }}
        className="w-full bg-zinc-800 p-1 rounded-lg mt-2"
      >
        <ToggleGroupItem value="1" className="flex-1 gap-2 text-zinc-400 data-[state=on]:bg-zinc-700 data-[state=on]:text-zinc-100">
          <span className="h-3 w-3 rounded-sm shrink-0" style={{ backgroundColor: primaryColor }} />
          Primary
        </ToggleGroupItem>
        <ToggleGroupItem value="2" className="flex-1 gap-2 text-zinc-400 data-[state=on]:bg-zinc-700 data-[state=on]:text-zinc-100">
          <span className="h-3 w-3 rounded-sm shrink-0" style={{ backgroundColor: accentColor }} />
          Accent
        </ToggleGroupItem>
      </ToggleGroup>
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
        <Separator className="bg-zinc-800/60" />
        {buttonStyleToggle}
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

      <Separator className="bg-zinc-800/60" />
      {buttonStyleToggle}
    </div>
  );
}
