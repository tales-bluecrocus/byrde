/**
 * Settings Panel - Section visibility, background settings, and header/topbar config
 */

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ColorPicker } from '@/components/ui/color-picker';
import { useSectionTheme, type SectionId, SECTION_LABELS } from '../../../context/SectionThemeContext';
import { useHeaderConfig, type HeaderPadding, type BadgeTheme } from '../../../context/HeaderConfigContext';
import { useToast } from '../../Toast';
import { Eye, EyeOff, Image, Upload, Trash2, Settings2 } from 'lucide-react';

interface SettingsPanelProps {
  sectionId: SectionId;
}

const BG_POSITION_OPTIONS = [
  { value: 'center', label: 'Center' },
  { value: 'top', label: 'Top' },
  { value: 'bottom', label: 'Bottom' },
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
];

const BG_SIZE_OPTIONS = [
  { value: 'cover', label: 'Cover' },
  { value: 'contain', label: 'Contain' },
  { value: 'auto', label: 'Auto' },
];

export function SettingsPanel({ sectionId }: SettingsPanelProps) {
  const { sectionThemes, updateSectionTheme, isSectionVisible, setSectionVisibility } = useSectionTheme();
  const { headerConfig, updateHeaderConfig, updateHeaderStyle } = useHeaderConfig();
  const { toast } = useToast();
  const [imageUrl, setImageUrl] = useState('');

  const theme = sectionThemes[sectionId] || {};
  const isVisible = isSectionVisible(sectionId);
  const sectionLabel = SECTION_LABELS[sectionId];
  const hasBgImage = !!theme.bgImage;

  const handleToggleVisibility = (visible: boolean) => {
    setSectionVisibility(sectionId, visible);
    toast(visible ? `${sectionLabel} visible` : `${sectionLabel} hidden`, 'info');
  };

  const handleUploadImage = useCallback(() => {
    if (window.wp?.media) {
      const frame = window.wp.media({
        title: 'Select Background Image',
        button: { text: 'Use Image' },
        multiple: false,
      });

      frame.on('select', () => {
        const attachment = frame.state().get('selection').first().toJSON();
        updateSectionTheme(sectionId, { bgImage: attachment.url });
        toast('Background image set', 'success');
      });

      frame.open();
    } else {
      toast('WordPress Media not available', 'error');
    }
  }, [sectionId, updateSectionTheme, toast]);

  const handleSetImageUrl = () => {
    if (imageUrl.trim()) {
      updateSectionTheme(sectionId, { bgImage: imageUrl.trim() });
      setImageUrl('');
      toast('Background image set', 'success');
    }
  };

  const handleRemoveImage = () => {
    updateSectionTheme(sectionId, {
      bgImage: undefined,
      bgImageOpacity: undefined,
      bgImagePosition: undefined,
      bgImageSize: undefined,
      bgImageOverlayColor: undefined,
    });
    toast('Background image removed', 'success');
  };

  // For topheader, visibility is controlled by headerConfig.showTopbar
  const isTopheader = sectionId === 'topheader';
  const isHeader = sectionId === 'header';
  const effectiveVisible = isTopheader ? headerConfig.showTopbar : isVisible;
  const handleEffectiveVisibility = (v: boolean) => {
    if (isTopheader) {
      updateHeaderConfig({ showTopbar: v });
      toast(v ? 'Topbar visible' : 'Topbar hidden', 'info');
    } else {
      handleToggleVisibility(v);
    }
  };

  return (
    <div className="space-y-5 text-zinc-200">
      {/* Visibility Toggle (not shown for header - always visible) */}
      {!isHeader && (
        <Card className="bg-zinc-800/50 border-zinc-800">
          <CardContent className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-800">
                {effectiveVisible ? (
                  <Eye className="h-4 w-4 text-zinc-400" />
                ) : (
                  <EyeOff className="h-4 w-4 text-zinc-500" />
                )}
              </div>
              <div>
                <Label className="text-xs font-medium text-zinc-200">
                  {isTopheader ? 'Topbar Visibility' : 'Section Visibility'}
                </Label>
                <p className="text-[10px] text-zinc-500">
                  {effectiveVisible ? 'Visible on page' : 'Hidden from page'}
                </p>
              </div>
            </div>
            <Switch checked={effectiveVisible} onCheckedChange={handleEffectiveVisibility} />
          </CardContent>
        </Card>
      )}

      {/* Header-specific settings */}
      {isHeader && (
        <Card className="bg-zinc-800/50 border-zinc-800">
          <CardContent className="p-3 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-medium text-zinc-200">Fixed on Scroll</Label>
                <p className="text-[10px] text-zinc-500">Header sticks to top when scrolling</p>
              </div>
              <Switch checked={headerConfig.isFixed} onCheckedChange={(v) => updateHeaderConfig({ isFixed: v })} />
            </div>

            <Separator className="bg-zinc-800/60" />

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-medium text-zinc-200">Show Phone CTA</Label>
                <p className="text-[10px] text-zinc-500">Phone button on desktop</p>
              </div>
              <Switch checked={headerConfig.showPhone} onCheckedChange={(v) => updateHeaderConfig({ showPhone: v })} />
            </div>

            <Separator className="bg-zinc-800/60" />

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-medium text-zinc-200">Show Reviews Badge</Label>
                <p className="text-[10px] text-zinc-500">Google reviews badge</p>
              </div>
              <Switch checked={headerConfig.showBadge} onCheckedChange={(v) => updateHeaderConfig({ showBadge: v })} />
            </div>

            {headerConfig.showBadge && (
              <>
                <div className="flex items-center justify-between pl-4">
                  <div>
                    <Label className="text-xs font-medium text-zinc-200">Show Review Count</Label>
                    <p className="text-[10px] text-zinc-500">Number of reviews</p>
                  </div>
                  <Switch checked={headerConfig.showReviewCount} onCheckedChange={(v) => updateHeaderConfig({ showReviewCount: v })} />
                </div>

                <div className="space-y-2 pl-4">
                  <Label className="text-xs font-medium text-zinc-400">Badge Theme</Label>
                  <Select value={headerConfig.style.badgeTheme} onValueChange={(v) => updateHeaderStyle({ badgeTheme: v as BadgeTheme })}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-600 text-zinc-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-800 z-[10001]">
                      <SelectItem value="light" className="text-zinc-100 focus:bg-zinc-700 focus:text-zinc-100">Light</SelectItem>
                      <SelectItem value="dark" className="text-zinc-100 focus:bg-zinc-700 focus:text-zinc-100">Dark</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <Separator className="bg-zinc-800/60" />

            <div className="space-y-2">
              <Label className="text-xs font-medium text-zinc-400">Header Padding</Label>
              <Select value={headerConfig.style.headerPadding} onValueChange={(v) => updateHeaderStyle({ headerPadding: v as HeaderPadding })}>
                <SelectTrigger className="bg-zinc-800 border-zinc-600 text-zinc-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-800 z-[10001]">
                  <SelectItem value="compact" className="text-zinc-100 focus:bg-zinc-700 focus:text-zinc-100">Compact</SelectItem>
                  <SelectItem value="default" className="text-zinc-100 focus:bg-zinc-700 focus:text-zinc-100">Default</SelectItem>
                  <SelectItem value="spacious" className="text-zinc-100 focus:bg-zinc-700 focus:text-zinc-100">Spacious</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      <Separator className="bg-zinc-800/60" />

      {/* Background Image */}
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Background Image
        </Label>
        <p className="text-xs mb-3 text-zinc-400">
          Add an optional background image to this section
        </p>

        {hasBgImage ? (
          <div className="space-y-4">
            {/* Image Preview */}
            <Card className="overflow-hidden border-zinc-800">
              <div
                className="h-32 bg-cover bg-center relative"
                style={{
                  backgroundImage: `url(${theme.bgImage})`,
                  opacity: theme.bgImageOpacity ?? 1,
                }}
              >
                <div
                  className="absolute inset-0"
                  style={{ backgroundColor: theme.bgImageOverlayColor || 'transparent' }}
                />
              </div>
              <CardContent className="p-3 bg-zinc-800">
                <div className="flex items-center justify-end">
                  <Button size="sm" variant="ghost" onClick={handleRemoveImage} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Image Settings */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-zinc-400">Opacity</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[theme.bgImageOpacity ?? 1]}
                    min={0}
                    max={1}
                    step={0.05}
                    onValueChange={([val]) => updateSectionTheme(sectionId, { bgImageOpacity: val })}
                    className="flex-1 [&_[data-slot=slider-track]]:bg-gray-200 [&_[data-slot=slider-track]]:h-2 [&_[data-slot=slider-range]]:bg-emerald-600 [&_[data-slot=slider-thumb]]:border-emerald-600"
                  />
                  <span className="text-xs w-10 text-right text-zinc-400">
                    {Math.round((theme.bgImageOpacity ?? 1) * 100)}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-zinc-400">Position</Label>
                  <Select
                    value={theme.bgImagePosition || 'center'}
                    onValueChange={(val) => updateSectionTheme(sectionId, { bgImagePosition: val })}
                  >
                    <SelectTrigger className="bg-zinc-800 border-zinc-600 text-zinc-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-800 z-[10001]">
                      {BG_POSITION_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="text-zinc-100 focus:bg-zinc-700 focus:text-zinc-100">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium text-zinc-400">Size</Label>
                  <Select
                    value={theme.bgImageSize || 'cover'}
                    onValueChange={(val) => updateSectionTheme(sectionId, { bgImageSize: val })}
                  >
                    <SelectTrigger className="bg-zinc-800 border-zinc-600 text-zinc-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-800 z-[10001]">
                      {BG_SIZE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="text-zinc-100 focus:bg-zinc-700 focus:text-zinc-100">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium text-zinc-400">Overlay Color</Label>
                <ColorPicker
                  value={theme.bgImageOverlayColor || 'rgba(0,0,0,0.5)'}
                  onChange={(val) => updateSectionTheme(sectionId, { bgImageOverlayColor: val })}
                />
              </div>
            </div>
          </div>
        ) : (
          <Card className="bg-zinc-800/50 border-zinc-800">
            <CardContent className="p-4 space-y-4">
              <div className="flex flex-col items-center py-4">
                <div className="h-10 w-10 rounded-md flex items-center justify-center mb-3 bg-zinc-800">
                  <Image className="h-5 w-5 text-zinc-500" />
                </div>
                <p className="text-xs font-medium text-zinc-300">No background image</p>
                <p className="text-[10px] mt-1 text-zinc-500">Upload or enter a URL below</p>
              </div>

              <div className="space-y-3">
                <Button onClick={handleUploadImage} variant="outline" className="w-full border-zinc-600 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload from Media Library
                </Button>

                <div className="flex gap-2">
                  <Input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Enter image URL..."
                    className="flex-1 bg-zinc-800 border-zinc-600 text-zinc-100 placeholder:text-zinc-500"
                  />
                  <Button onClick={handleSetImageUrl} disabled={!imageUrl.trim()} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    Set
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Separator className="bg-zinc-800/60" />

      {/* Section Info */}
      <Card className="bg-zinc-800/50 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium flex items-center gap-2 text-zinc-400">
            <Settings2 className="h-3.5 w-3.5" />
            Section Info
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-xs text-zinc-400">
            <div className="flex justify-between">
              <span>Section ID:</span>
              <span className="font-mono text-zinc-300">{sectionId}</span>
            </div>
            <div className="flex justify-between">
              <span>Label:</span>
              <span className="text-zinc-300">{sectionLabel}</span>
            </div>
            <div className="flex justify-between">
              <span>Has Custom Colors:</span>
              <span className="text-zinc-300">{theme.overrideGlobalColors ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between">
              <span>Has Background Image:</span>
              <span className="text-zinc-300">{hasBgImage ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
