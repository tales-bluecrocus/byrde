/**
 * Global Panel - Brand colors, logo settings, presets
 * Light theme with explicit Tailwind colors
 */

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ColorPicker } from '@/components/ui/color-picker';
import { useGlobalConfig } from '../../../context/GlobalConfigContext';
import { useToast } from '../../Toast';
import { Moon, Sun, RefreshCw, RotateCcw, Square, Circle, RectangleHorizontal } from 'lucide-react';

export function GlobalPanel() {
  const { globalConfig, updateBrand, updateLogo, resetGlobalConfig, needsRegeneration, generatePalettes } = useGlobalConfig();
  const { toast } = useToast();

  return (
    <div className="space-y-6 text-zinc-100">
      {/* Theme Mode */}
      <Card className="bg-zinc-800 border-zinc-700">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            {globalConfig.brand.mode === 'dark' ? (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-700">
                <Moon className="h-5 w-5 text-slate-300" />
              </div>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20">
                <Sun className="h-5 w-5 text-amber-400" />
              </div>
            )}
            <div>
              <Label className="text-sm font-semibold text-zinc-100">
                {globalConfig.brand.mode === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </Label>
              <p className="text-xs text-zinc-400">Global theme appearance</p>
            </div>
          </div>
          <Switch
            checked={globalConfig.brand.mode === 'light'}
            onCheckedChange={(checked) => updateBrand({ mode: checked ? 'light' : 'dark' })}
          />
        </CardContent>
      </Card>

      <Separator className="bg-zinc-700" />

      {/* Brand Colors */}
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Brand Colors
        </Label>
        <p className="text-xs mb-3 text-zinc-400">Primary brand colors used throughout</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-zinc-400">Primary Color</Label>
            <ColorPicker value={globalConfig.brand.primary} onChange={(val) => updateBrand({ primary: val })} />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium text-zinc-400">Accent Color</Label>
            <ColorPicker value={globalConfig.brand.accent} onChange={(val) => updateBrand({ accent: val })} />
          </div>
        </div>
      </div>

      <Separator className="bg-zinc-700" />

      {/* Logo Settings */}
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Logo Settings
        </Label>
        <p className="text-xs mb-3 text-zinc-400">Logo background and shape</p>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-zinc-400">Background Color</Label>
            <ColorPicker value={globalConfig.logo.bgColor} onChange={(val) => updateLogo({ bgColor: val })} />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-zinc-400">Shape</Label>
            <ToggleGroup
              type="single"
              value={globalConfig.logo.shape}
              onValueChange={(val) => val && updateLogo({ shape: val as 'rectangle' | 'square' | 'circle' })}
              className="w-full bg-zinc-800 p-1 rounded-lg"
            >
              <ToggleGroupItem value="rectangle" className="flex-1 text-zinc-400 data-[state=on]:bg-zinc-700 data-[state=on]:text-zinc-100">
                <RectangleHorizontal className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="square" className="flex-1 text-zinc-400 data-[state=on]:bg-zinc-700 data-[state=on]:text-zinc-100">
                <Square className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="circle" className="flex-1 text-zinc-400 data-[state=on]:bg-zinc-700 data-[state=on]:text-zinc-100">
                <Circle className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </div>

      <Separator className="bg-zinc-700" />

      {/* Generate Palettes */}
      <Button
        onClick={() => {
          generatePalettes();
          toast('Palettes generated!', 'success');
        }}
        className={`w-full ${needsRegeneration ? 'bg-green-500 hover:bg-green-600 text-white' : 'border-zinc-600 text-zinc-300 hover:bg-zinc-800'}`}
        variant={needsRegeneration ? 'default' : 'outline'}
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        {needsRegeneration ? 'Generate Palettes' : 'Regenerate Palettes'}
      </Button>

      <Separator className="bg-zinc-700" />

      {/* Reset */}
      <Button
        variant="outline"
        size="sm"
        onClick={resetGlobalConfig}
        className="w-full border-zinc-600 text-red-400 hover:text-red-300 hover:bg-red-500/10"
      >
        <RotateCcw className="h-4 w-4 mr-2" />
        Reset to Default
      </Button>
    </div>
  );
}
