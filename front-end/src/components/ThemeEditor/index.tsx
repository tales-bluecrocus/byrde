/**
 * Theme Editor - Pure shadcn/ui
 */

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { useSidebar, SIDEBAR_WIDTH } from '../../context/SidebarContext';
import { useSectionTheme, SECTION_LABELS, type SectionId } from '../../context/SectionThemeContext';
import { useGlobalConfig } from '../../context/GlobalConfigContext';
import { useHeaderConfig } from '../../context/HeaderConfigContext';
import { useContent } from '../../context/ContentContext';
import { useToast } from '../Toast';
import { GlobalPanel } from './panels/GlobalPanel';
import { StylePanel } from './panels/StylePanel';
import { ContentPanel } from './panels/ContentPanel';
import { SettingsPanel } from './panels/SettingsPanel';
import {
  ChevronRight,
  ChevronLeft,
  Save,
  RotateCcw,
  Globe,
  EyeOff,
  Palette,
  FileText,
  Settings2,
} from 'lucide-react';

const ALL_SECTIONS: SectionId[] = [
  'topheader', 'header', 'hero', 'featured-testimonial', 'services',
  'mid-cta', 'service-areas', 'testimonials', 'faq', 'footer-cta', 'footer',
];

export function ThemeEditor() {
  const { isOpen, setIsOpen } = useSidebar();
  const [selectedSection, setSelectedSection] = useState<SectionId | 'global' | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const { sectionThemes, isSectionVisible, resetAllSectionThemes } = useSectionTheme();
  const { globalConfig, resetGlobalConfig } = useGlobalConfig();
  const { headerConfig, topbarConfig } = useHeaderConfig();
  const { sectionContent } = useContent();
  const { toast } = useToast();

  const wpAdmin = typeof window !== 'undefined' ? window.byrdeAdmin : null;

  const handleSelectSection = useCallback((id: SectionId | 'global') => {
    setSelectedSection(id);
    setSheetOpen(true);
    if (id !== 'global') {
      requestAnimationFrame(() => {
        document.getElementById(`${id}-section`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, []);

  const handleCloseSheet = useCallback(() => {
    setSheetOpen(false);
  }, []);

  const handleSaveConfig = useCallback(async () => {
    if (!wpAdmin) {
      toast('Not in admin mode', 'error');
      return;
    }

    try {
      const configPayload = {
        globalConfig,
        sectionThemes,
        header: headerConfig,
        topbar: topbarConfig,
        version: Date.now(),
      };

      const [themeRes, contentRes] = await Promise.all([
        fetch(`${wpAdmin.apiUrl}/pages/${wpAdmin.pageId}/theme`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-WP-Nonce': wpAdmin.nonce,
          },
          body: JSON.stringify(configPayload),
        }),
        fetch(`${wpAdmin.apiUrl}/pages/${wpAdmin.pageId}/content`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-WP-Nonce': wpAdmin.nonce,
          },
          body: JSON.stringify(sectionContent),
        }),
      ]);

      if (!themeRes.ok || !contentRes.ok) {
        throw new Error('Failed to save');
      }

      toast('Saved to WordPress', 'success');
    } catch {
      toast('Failed to save', 'error');
    }
  }, [wpAdmin, globalConfig, sectionThemes, headerConfig, topbarConfig, sectionContent, toast]);

  const handleResetAll = useCallback(() => {
    resetGlobalConfig();
    resetAllSectionThemes();
    toast('All settings reset to defaults', 'info');
  }, [resetGlobalConfig, resetAllSectionThemes, toast]);

  if (!isOpen) return null;

  const isGlobal = selectedSection === 'global';
  const sheetLabel = isGlobal ? 'Global Settings' : (selectedSection ? SECTION_LABELS[selectedSection] : '');

  return (
    <>
      {/* Sidebar */}
      <div
        className="fixed left-0 top-0 bottom-0 z-50 flex flex-col bg-zinc-950 text-white border-r border-zinc-800"
        style={{ width: SIDEBAR_WIDTH }}
      >
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-4 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-green-500">
              <Palette className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Theme Editor</h2>
              <p className="text-[11px] text-zinc-500">Select a section</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Section List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {/* Global Settings */}
            <button
              onClick={() => handleSelectSection('global')}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors mb-2 ${
                selectedSection === 'global'
                  ? 'bg-zinc-800'
                  : 'hover:bg-zinc-900'
              }`}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-amber-500/20">
                <Globe className="h-5 w-5 text-amber-500" />
              </div>
              <div className="flex-1 text-left">
                <span className="text-sm font-medium">Global Settings</span>
                <p className="text-[10px] text-zinc-500">Brand colors & presets</p>
              </div>
              <ChevronRight className="h-4 w-4 text-zinc-600" />
            </button>

            <Separator className="my-2 bg-zinc-800" />
            <p className="text-[10px] uppercase tracking-wider text-zinc-600 px-3 py-2">Sections</p>

            {/* Section Items */}
            {ALL_SECTIONS.map((id) => {
              const isVisible = isSectionVisible(id);
              const theme = sectionThemes[id];
              const hasOverride = theme?.overrideGlobalColors;

              return (
                <button
                  key={id}
                  onClick={() => handleSelectSection(id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    selectedSection === id
                      ? 'bg-zinc-800'
                      : 'hover:bg-zinc-900'
                  }`}
                >
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{SECTION_LABELS[id]}</span>
                      {!isVisible && <EyeOff className="h-3 w-3 text-zinc-600" />}
                    </div>
                    <p className="text-[10px] text-zinc-500">
                      {hasOverride ? 'Custom colors' : 'Using global'}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-zinc-600" />
                </button>
              );
            })}
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="shrink-0 p-3 space-y-2 border-t border-zinc-800">
          <Button
            onClick={handleSaveConfig}
            className="w-full bg-green-500 hover:bg-green-600 text-white"
            size="sm"
          >
            <Save className="h-4 w-4 mr-2" /> Save to WordPress
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetAll}
            className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <RotateCcw className="h-4 w-4 mr-2" /> Reset All
          </Button>
        </div>
      </div>

      {/* Sheet Panel - Fully controlled (no onOpenChange), modal=false so sidebar stays interactive */}
      <Sheet open={sheetOpen} modal={false}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="w-[400px] sm:max-w-[400px] p-0 flex flex-col editor-dark bg-zinc-900 text-zinc-100 border-zinc-700"
          style={{ left: SIDEBAR_WIDTH }}
        >
          <SheetHeader className="p-4 border-b border-zinc-700">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${isGlobal ? 'bg-amber-500' : 'bg-green-500'}`}>
                {isGlobal ? (
                  <Globe className="h-5 w-5 text-white" />
                ) : (
                  <Palette className="h-5 w-5 text-white" />
                )}
              </div>
              <div>
                <SheetTitle className="text-zinc-100">{sheetLabel}</SheetTitle>
                <p className="text-sm text-zinc-400">
                  {isGlobal ? 'Theme-wide settings' : 'Section configuration'}
                </p>
              </div>
            </div>
          </SheetHeader>

          {selectedSection && (
            isGlobal ? (
              <ScrollArea className="flex-1">
                <div className="p-4">
                  <GlobalPanel />
                </div>
              </ScrollArea>
            ) : (
              <Tabs defaultValue="style" className="flex-1 flex flex-col min-h-0">
                <div className="px-4 pt-2">
                  <TabsList className="w-full grid grid-cols-3 bg-zinc-800">
                    <TabsTrigger value="style" className="gap-1.5 text-zinc-400 data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-100">
                      <Palette className="h-3.5 w-3.5" />
                      Style
                    </TabsTrigger>
                    <TabsTrigger value="content" className="gap-1.5 text-zinc-400 data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-100">
                      <FileText className="h-3.5 w-3.5" />
                      Content
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="gap-1.5 text-zinc-400 data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-100">
                      <Settings2 className="h-3.5 w-3.5" />
                      Settings
                    </TabsTrigger>
                  </TabsList>
                </div>

                <ScrollArea className="flex-1">
                  <TabsContent value="style" className="m-0 p-4">
                    <StylePanel sectionId={selectedSection} />
                  </TabsContent>
                  <TabsContent value="content" className="m-0 p-4">
                    <ContentPanel sectionId={selectedSection} />
                  </TabsContent>
                  <TabsContent value="settings" className="m-0 p-4">
                    <SettingsPanel sectionId={selectedSection} />
                  </TabsContent>
                </ScrollArea>
              </Tabs>
            )
          )}

          <div className="p-4 border-t border-zinc-700">
            <Button variant="outline" size="sm" onClick={handleCloseSheet} className="w-full border-zinc-600 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100">
              Close
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

export default ThemeEditor;
