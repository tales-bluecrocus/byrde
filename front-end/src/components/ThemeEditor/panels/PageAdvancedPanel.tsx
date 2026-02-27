/**
 * Page Advanced Panel - Export/Import page-level config (design + content)
 */

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { useGlobalConfig } from '../../../context/GlobalConfigContext';
import { useSectionTheme } from '../../../context/SectionThemeContext';
import { useHeaderConfig } from '../../../context/HeaderConfigContext';
import { useContent } from '../../../context/ContentContext';
import { useSettingsContext } from '../../../context/SettingsContext';
import { useToast } from '../../Toast';
import { Copy, Download, Upload, Check, AlertTriangle } from 'lucide-react';
import type { GlobalConfig } from '../../../context/GlobalConfigContext';
import type { SectionId, SectionTheme } from '../../../context/SectionThemeContext';
import type { HeaderConfig, TopbarConfig } from '../../../context/HeaderConfigContext';
import type { ContentSectionId, SectionContent } from '../../../context/ContentContext';

interface PageExport {
  _byrde: string;
  _type: 'page';
  config: {
    globalConfig: GlobalConfig;
    sectionThemes: Record<SectionId, SectionTheme>;
    sectionOrder: SectionId[];
    header: HeaderConfig;
    topbar: TopbarConfig;
  };
  content: Record<ContentSectionId, SectionContent>;
  exportedAt: string;
}

export function PageAdvancedPanel() {
  const { globalConfig, replaceGlobalConfig } = useGlobalConfig();
  const { sectionThemes, sectionOrder, sectionVisibility, importSectionData } = useSectionTheme();
  const { headerConfig, topbarConfig, replaceHeaderConfig, replaceTopbarConfig } = useHeaderConfig();
  const { sectionContent, replaceAllContent } = useContent();
  const { updateSettings } = useSettingsContext();
  const { toast } = useToast();

  const [importText, setImportText] = useState('');
  const [copied, setCopied] = useState(false);

  const exportData = useMemo((): PageExport => ({
    _byrde: '1.0',
    _type: 'page',
    config: {
      globalConfig,
      sectionThemes,
      sectionOrder,
      header: headerConfig,
      topbar: topbarConfig,
    },
    content: sectionContent,
    exportedAt: new Date().toISOString(),
  }), [globalConfig, sectionThemes, sectionOrder, headerConfig, topbarConfig, sectionContent]);

  const exportJson = useMemo(() => JSON.stringify(exportData, null, 2), [exportData]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportJson);
      setCopied(true);
      toast('Copied to clipboard', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast('Failed to copy', 'error');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([exportJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `byrde-page-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Downloaded', 'success');
  };

  const handleImport = () => {
    try {
      const data = JSON.parse(importText) as PageExport;

      if (!data._byrde) {
        toast('Invalid file: missing _byrde marker', 'error');
        return;
      }

      if (data._type && data._type !== 'page') {
        toast('This is a site settings export, not a page export', 'error');
        return;
      }

      if (data.config) {
        if (data.config.globalConfig) {
          replaceGlobalConfig(data.config.globalConfig);

          // Sync brand colors to Settings so they persist to wp_options on save
          const b = data.config.globalConfig.brand;
          if (b) {
            updateSettings({
              brand_dark_primary: b.darkPrimary,
              brand_dark_accent: b.darkAccent,
              brand_dark_bg: b.darkBg,
              brand_dark_text: b.darkText,
              brand_light_primary: b.lightPrimary,
              brand_light_accent: b.lightAccent,
              brand_light_bg: b.lightBg,
              brand_light_text: b.lightText,
              brand_mode: b.mode,
            });
          }
        }
        if (data.config.header) replaceHeaderConfig(data.config.header);
        if (data.config.topbar) replaceTopbarConfig(data.config.topbar);
        if (data.config.sectionThemes || data.config.sectionOrder) {
          importSectionData(
            data.config.sectionThemes || sectionThemes,
            sectionVisibility,
            data.config.sectionOrder || sectionOrder,
          );
        }
      }

      if (data.content) replaceAllContent(data.content);

      setImportText('');
      toast('Page imported! Click Save to persist.', 'success');
    } catch {
      toast('Invalid JSON', 'error');
    }
  };

  const importValid = (() => {
    if (!importText.trim()) return false;
    try {
      const d = JSON.parse(importText);
      return !!d._byrde && (!d._type || d._type === 'page');
    } catch {
      return false;
    }
  })();

  return (
    <div className="space-y-5 text-zinc-200">
      {/* Export */}
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Export Page
        </Label>
        <p className="text-xs mb-3 text-zinc-400">
          Design config + section content as JSON
        </p>

        <Card className="bg-zinc-800/50 border-zinc-800">
          <CardContent className="p-3 space-y-3">
            <textarea
              readOnly
              value={exportJson}
              className="w-full h-48 rounded-md bg-zinc-900 border border-zinc-700 text-[11px] font-mono text-zinc-300 p-3 resize-y focus:outline-none focus:border-zinc-600"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleCopy}
                size="sm"
                variant="outline"
                className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100 text-xs h-8"
              >
                {copied ? (
                  <><Check className="h-3.5 w-3.5 mr-1.5 text-emerald-400" /> Copied</>
                ) : (
                  <><Copy className="h-3.5 w-3.5 mr-1.5" /> Copy</>
                )}
              </Button>
              <Button
                onClick={handleDownload}
                size="sm"
                variant="outline"
                className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100 text-xs h-8"
              >
                <Download className="h-3.5 w-3.5 mr-1.5" /> Download
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator className="bg-zinc-800/60" />

      {/* Import */}
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Import Page
        </Label>
        <p className="text-xs mb-3 text-zinc-400">
          Paste a page JSON export to overwrite design + content
        </p>

        <Card className="bg-zinc-800/50 border-zinc-800">
          <CardContent className="p-3 space-y-3">
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder='Paste JSON here...'
              className="w-full h-40 rounded-md bg-zinc-900 border border-zinc-700 text-[11px] font-mono text-zinc-300 p-3 resize-y placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
            />

            {importText.trim() && !importValid && (
              <div className="flex items-center gap-2 text-amber-400 text-[11px]">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span>Invalid JSON or wrong export type</span>
              </div>
            )}

            <Button
              onClick={handleImport}
              disabled={!importValid}
              size="sm"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 text-xs h-8"
            >
              <Upload className="h-3.5 w-3.5 mr-1.5" /> Import Page
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
