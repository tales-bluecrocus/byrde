/**
 * Global Panel - Page theme mode override
 */

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useGlobalConfig } from '../../../context/GlobalConfigContext';
import { useSettingsContext } from '../../../context/SettingsContext';
import { Moon, Sun, Monitor } from 'lucide-react';

export function GlobalPanel() {
  const { globalConfig, updateBrand } = useGlobalConfig();
  const { settings } = useSettingsContext();
  const modeOverride = globalConfig.brand.modeOverride ?? null;
  const siteDefault = (settings.brand_mode || 'dark') as 'dark' | 'light';

  const toggleValue = modeOverride ?? 'default';

  return (
    <div className="space-y-5 text-zinc-200">
      {/* Theme Mode */}
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Page Theme Mode
        </Label>
        <ToggleGroup
          type="single"
          value={toggleValue}
          onValueChange={(val) => {
            if (!val) return;
            if (val === 'default') {
              updateBrand({ modeOverride: null, mode: siteDefault });
            } else {
              updateBrand({ modeOverride: val as 'dark' | 'light', mode: val as 'dark' | 'light' });
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
          {modeOverride
            ? `Overriding: ${modeOverride === 'dark' ? 'Dark' : 'Light'}`
            : `Using site default (${siteDefault === 'dark' ? 'Dark' : 'Light'})`}
        </p>
      </div>

      <Separator className="bg-zinc-800/60" />

      <p className="text-[10px] text-zinc-500 leading-relaxed">
        Use the <span className="text-zinc-400 font-medium">Social</span> tab to set the page title, description, and image for social sharing.
      </p>
    </div>
  );
}
