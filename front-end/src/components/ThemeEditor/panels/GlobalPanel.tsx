/**
 * Global Panel - Page theme mode + page SEO
 */

import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useGlobalConfig } from '../../../context/GlobalConfigContext';
import { useSettingsContext } from '../../../context/SettingsContext';
import { useToast } from '../../Toast';
import { Moon, Sun, Monitor, Search, Image } from 'lucide-react';

const inputCls = "bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 text-xs h-8";
const textareaCls = "w-full rounded-md bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder:text-zinc-600 text-xs p-2 resize-y min-h-[60px] focus:outline-none focus:border-zinc-600";

export function GlobalPanel() {
  const { globalConfig, updateBrand, updateSeo } = useGlobalConfig();
  const { settings } = useSettingsContext();
  const { toast } = useToast();
  const seo = globalConfig.seo;
  const modeOverride = globalConfig.brand.modeOverride ?? null;
  const siteDefault = (settings.brand_mode || 'dark') as 'dark' | 'light';

  const handleUploadOgImage = useCallback(() => {
    if (window.wp?.media) {
      const frame = window.wp.media({
        title: 'Select OG Image',
        button: { text: 'Use Image' },
        multiple: false,
      });
      frame.on('select', () => {
        const attachment = frame.state().get('selection').first().toJSON();
        updateSeo({ ogImage: attachment.url });
        toast('OG Image set', 'success');
      });
      frame.open();
    } else {
      toast('WordPress Media not available', 'error');
    }
  }, [updateSeo, toast]);

  // Determine the toggle value: 'default' | 'dark' | 'light'
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

      {/* SEO / Meta */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Search className="h-3.5 w-3.5 text-zinc-400" />
          <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Page SEO
          </Label>
        </div>
        <p className="text-xs mb-3 text-zinc-500">Meta tags and social sharing</p>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-[11px] font-medium text-zinc-400">Site Name</Label>
            <Input
              value={seo.siteName}
              onChange={(e) => updateSeo({ siteName: e.target.value })}
              placeholder="My Business Name"
              className={inputCls}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] font-medium text-zinc-400">Tagline</Label>
            <Input
              value={seo.tagline}
              onChange={(e) => updateSeo({ tagline: e.target.value })}
              placeholder="Short site description"
              className={inputCls}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] font-medium text-zinc-400">Meta Description</Label>
            <textarea
              value={seo.description}
              onChange={(e) => updateSeo({ description: e.target.value })}
              placeholder="150-160 characters recommended..."
              className={textareaCls}
              rows={2}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] font-medium text-zinc-400">OG Image</Label>
            <div className="space-y-2">
              {seo.ogImage && (
                <div className="h-20 rounded-md bg-zinc-800 border border-zinc-700 p-1 flex items-center">
                  <img src={seo.ogImage} alt="OG Image" className="h-full w-auto object-contain rounded" />
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  value={seo.ogImage}
                  onChange={(e) => updateSeo({ ogImage: e.target.value })}
                  placeholder="OG Image URL..."
                  className={`flex-1 ${inputCls}`}
                />
                <Button
                  onClick={handleUploadOgImage}
                  size="sm"
                  variant="outline"
                  className="border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100 h-8 px-2"
                >
                  <Image className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
