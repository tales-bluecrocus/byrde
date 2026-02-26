/**
 * Advanced Panel - Export/Import site-level settings (brand, social, analytics, etc.)
 */

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { useSettingsContext } from '../../../context/SettingsContext';
import { useToast } from '../../Toast';
import { Copy, Download, Upload, Check, AlertTriangle } from 'lucide-react';
import type { ThemeSettings } from '../../../hooks/useSettings';

interface SiteExport {
  _byrde: string;
  _type: 'site';
  settings: Partial<ThemeSettings>;
  exportedAt: string;
}

export function AdvancedPanel() {
  const { settings, replaceSettings } = useSettingsContext();
  const { toast } = useToast();

  const [importText, setImportText] = useState('');
  const [copied, setCopied] = useState(false);

  const exportData = useMemo((): SiteExport => ({
    _byrde: '1.0',
    _type: 'site',
    settings,
    exportedAt: new Date().toISOString(),
  }), [settings]);

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
    a.download = `byrde-site-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Downloaded', 'success');
  };

  const handleImport = () => {
    try {
      const data = JSON.parse(importText) as SiteExport;

      if (!data._byrde) {
        toast('Invalid file: missing _byrde marker', 'error');
        return;
      }

      if (data._type && data._type !== 'site') {
        toast('This is a page export, not a site settings export', 'error');
        return;
      }

      if (data.settings) {
        replaceSettings({ ...settings, ...data.settings });
      }

      setImportText('');
      toast('Settings imported! Click Save to persist.', 'success');
    } catch {
      toast('Invalid JSON', 'error');
    }
  };

  const importValid = (() => {
    if (!importText.trim()) return false;
    try {
      const d = JSON.parse(importText);
      return !!d._byrde && (!d._type || d._type === 'site');
    } catch {
      return false;
    }
  })();

  return (
    <div className="space-y-5 text-zinc-200">
      {/* Export */}
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Export Settings
        </Label>
        <p className="text-xs mb-3 text-zinc-400">
          Brand, social, analytics and other site settings as JSON
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
          Import Settings
        </Label>
        <p className="text-xs mb-3 text-zinc-400">
          Paste a site settings JSON export to overwrite current settings
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
              <Upload className="h-3.5 w-3.5 mr-1.5" /> Import Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
