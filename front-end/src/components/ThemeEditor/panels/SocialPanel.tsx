/**
 * Social Panel - Per-page Open Graph / social sharing metadata.
 * Falls back to site defaults (from wizard) when left blank.
 */

import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Image } from 'lucide-react';
import { useGlobalConfig } from '../../../context/GlobalConfigContext';
import { useSettingsContext } from '../../../context/SettingsContext';
import { useToast } from '../../Toast';

const inputCls = "bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 text-xs h-8";
const textareaCls = "w-full rounded-md bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 text-xs p-2 resize-y min-h-[64px] focus:outline-none focus:border-zinc-600";

export function SocialPanel() {
  const { globalConfig, updateSeo } = useGlobalConfig();
  const { settings } = useSettingsContext();
  const { toast } = useToast();
  const seo = globalConfig.seo;

  const handleUploadImage = useCallback(() => {
    if (window.wp?.media) {
      const frame = window.wp.media({
        title: 'Select Social Image',
        button: { text: 'Use Image' },
        multiple: false,
      });
      frame.on('select', () => {
        const attachment = frame.state().get('selection').first().toJSON();
        updateSeo({ ogImage: attachment.url });
        toast('Image set', 'success');
      });
      frame.open();
    } else {
      toast('WordPress Media not available', 'error');
    }
  }, [updateSeo, toast]);

  // Effective preview values (page override or site default)
  const effectiveTitle = seo.siteName || settings.site_name;
  const effectiveDesc  = seo.description || settings.site_description;
  const effectiveImage = seo.ogImage || settings.og_image;

  return (
    <div className="space-y-5 text-zinc-200">

      <p className="text-[10px] text-zinc-500 leading-relaxed">
        Controls the preview card when this page is shared on Facebook, WhatsApp, and other social networks.
        Leave blank to use the site defaults.
      </p>

      {/* Live preview */}
      {(effectiveTitle || effectiveImage) && (
        <div className="rounded-lg border border-zinc-700 overflow-hidden">
          {effectiveImage && (
            <div className="h-28 bg-zinc-800">
              <img
                src={effectiveImage}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          )}
          <div className="p-2.5 bg-zinc-800/60">
            {effectiveTitle && (
              <p className="text-[11px] font-semibold text-zinc-200 leading-snug truncate">{effectiveTitle}</p>
            )}
            {effectiveDesc && (
              <p className="text-[10px] text-zinc-500 mt-0.5 line-clamp-2 leading-snug">{effectiveDesc}</p>
            )}
            {!seo.siteName && !seo.description && !seo.ogImage && (
              <span className="text-[9px] text-zinc-600 italic">Using site defaults</span>
            )}
          </div>
        </div>
      )}

      {/* Title */}
      <div className="space-y-1.5">
        <Label className="text-[11px] font-medium text-zinc-400">Title</Label>
        <Input
          value={seo.siteName}
          onChange={(e) => updateSeo({ siteName: e.target.value })}
          placeholder={settings.site_name || 'Page title...'}
          className={inputCls}
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label className="text-[11px] font-medium text-zinc-400">Description</Label>
        <textarea
          value={seo.description}
          onChange={(e) => updateSeo({ description: e.target.value })}
          placeholder={settings.site_description || '150–160 characters recommended...'}
          className={textareaCls}
          rows={3}
        />
      </div>

      {/* Image */}
      <div className="space-y-1.5">
        <Label className="text-[11px] font-medium text-zinc-400">
          Image
          <span className="ml-1 text-zinc-600 font-normal">1200×630 recommended</span>
        </Label>
        <div className="flex gap-2">
          <Input
            value={seo.ogImage}
            onChange={(e) => updateSeo({ ogImage: e.target.value })}
            placeholder={settings.og_image || 'Image URL...'}
            className={`flex-1 ${inputCls}`}
          />
          <Button
            onClick={handleUploadImage}
            size="sm"
            variant="outline"
            className="border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100 h-8 px-2 shrink-0"
          >
            <Image className="h-3.5 w-3.5" />
          </Button>
        </div>
        {seo.ogImage && (
          <div className="h-16 rounded-md bg-zinc-800 border border-zinc-700 p-1 flex items-center">
            <img src={seo.ogImage} alt="OG preview" className="h-full w-auto object-contain rounded" />
          </div>
        )}
      </div>

    </div>
  );
}
