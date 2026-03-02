/**
 * Style Panel - Per-section mode override
 */

import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Moon, Sun, Monitor, Globe } from 'lucide-react';
import { useSectionTheme } from '../../../context/SectionThemeContext';
import { useGlobalConfig } from '../../../context/GlobalConfigContext';
import type { SectionId, SectionTheme } from '../../../context/SectionThemeContext';

interface StylePanelProps {
  sectionId: SectionId;
}

const FIXED_SECTIONS: SectionId[] = ['topheader', 'header', 'footer'];

export function StylePanel({ sectionId }: StylePanelProps) {
  const { sectionThemes, updateSectionTheme } = useSectionTheme();
  const { globalConfig } = useGlobalConfig();
  const theme = sectionThemes[sectionId] || {};
  const pageMode = globalConfig.brand.mode;

  const paddingValue = theme.padding || 'md';

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
        {paddingToggle}
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
      {paddingToggle}
    </div>
  );
}
