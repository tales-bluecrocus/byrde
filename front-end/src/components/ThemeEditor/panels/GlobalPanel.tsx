/**
 * Global Panel - Brand colors, logo settings, presets
 * Light theme with explicit Tailwind colors
 */

import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { ColorPicker } from '@/components/ui/color-picker';
import { useGlobalConfig } from '../../../context/GlobalConfigContext';
import { useToast } from '../../Toast';
import { Moon, Sun, RefreshCw, Search, Image } from 'lucide-react';

const inputCls = "bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 text-xs h-8";
const textareaCls = "w-full rounded-md bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder:text-zinc-600 text-xs p-2 resize-y min-h-[60px] focus:outline-none focus:border-zinc-600";

export function GlobalPanel() {
  const { globalConfig, updateBrand, updateSeo, needsRegeneration, generatePalettes } = useGlobalConfig();
  const { toast } = useToast();
  const seo = globalConfig.seo;

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

  return (
    <div className="space-y-5 text-zinc-200">
      {/* Theme Mode */}
      <Card className="bg-zinc-800/50 border-zinc-800">
        <CardContent className="flex items-center justify-between p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-800">
              {globalConfig.brand.mode === 'dark' ? (
                <Moon className="h-4 w-4 text-zinc-400" />
              ) : (
                <Sun className="h-4 w-4 text-zinc-400" />
              )}
            </div>
            <div>
              <Label className="text-xs font-medium text-zinc-200">
                {globalConfig.brand.mode === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </Label>
              <p className="text-[10px] text-zinc-500">Theme appearance</p>
            </div>
          </div>
          <Switch
            checked={globalConfig.brand.mode === 'light'}
            onCheckedChange={(checked) => updateBrand({ mode: checked ? 'light' : 'dark' })}
          />
        </CardContent>
      </Card>

      <Separator className="bg-zinc-800/60" />

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

      {/* Generate Palettes */}
      <Button
        onClick={() => {
          generatePalettes();
          toast('Palettes generated!', 'success');
        }}
        className={`w-full ${needsRegeneration ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'}`}
        variant={needsRegeneration ? 'default' : 'outline'}
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        {needsRegeneration ? 'Generate Palettes' : 'Regenerate Palettes'}
      </Button>

      {/* Divider between page design and page SEO */}
      <div className="py-1">
        <Separator className="bg-zinc-700" />
      </div>

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
