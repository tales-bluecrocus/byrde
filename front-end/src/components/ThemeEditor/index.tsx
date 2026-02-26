/**
 * Theme Editor - Pure shadcn/ui
 *
 * Layout: Level 1 (200px sidebar) + Level 2 (overlays L1 at left:0, 380px)
 * When L2 is open it slides over L1 so page content stays visible.
 */

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useSidebar, SIDEBAR_WIDTH } from '../../context/SidebarContext';
import {
  useSectionTheme,
  SECTION_LABELS,
  FIXED_TOP_SECTIONS,
  FIXED_BOTTOM_SECTIONS,
  type SectionId,
} from '../../context/SectionThemeContext';
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
  ArrowLeft,
  Save,
  Loader2,
  RotateCcw,
  Globe,
  EyeOff,
  Palette,
  FileText,
  Settings2,
  GripVertical,
  PanelLeftOpen,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const PANEL_WIDTH = 380;

// Sortable section item
function SortableSectionItem({
  id,
  isVisible,
  hasOverride,
  isSelected,
  onSelect,
}: {
  id: SectionId;
  isVisible: boolean;
  hasOverride: boolean;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center rounded-lg transition-colors ${
        isSelected ? 'bg-zinc-800' : 'hover:bg-zinc-900'
      }`}
    >
      <button
        className="shrink-0 p-1.5 pl-2 cursor-grab active:cursor-grabbing text-zinc-600 hover:text-zinc-400 touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={onSelect}
        className="flex-1 flex items-center gap-1.5 py-2 pr-2 min-w-0"
      >
        <span className="text-xs font-medium truncate flex-1 text-left">
          {SECTION_LABELS[id]}
        </span>
        {!isVisible && <EyeOff className="h-3 w-3 text-zinc-600 shrink-0" />}
        {hasOverride && (
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
        )}
        <ChevronRight className="h-3 w-3 text-zinc-600 shrink-0" />
      </button>
    </div>
  );
}

// Fixed (non-draggable) section item
function FixedSectionItem({
  id,
  isVisible,
  hasOverride,
  isSelected,
  onSelect,
}: {
  id: SectionId;
  isVisible: boolean;
  hasOverride: boolean;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center gap-1.5 py-2 px-2.5 rounded-lg transition-colors ${
        isSelected ? 'bg-zinc-800' : 'hover:bg-zinc-900'
      }`}
    >
      <span className="text-xs font-medium truncate flex-1 text-left">
        {SECTION_LABELS[id]}
      </span>
      {!isVisible && <EyeOff className="h-3 w-3 text-zinc-600 shrink-0" />}
      {hasOverride && (
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
      )}
      <ChevronRight className="h-3 w-3 text-zinc-600 shrink-0" />
    </button>
  );
}

export function ThemeEditor() {
  const { isOpen, setIsOpen } = useSidebar();
  const [selectedSection, setSelectedSection] = useState<SectionId | 'global' | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { sectionThemes, isSectionVisible, resetAllSectionThemes, sectionOrder, setSectionOrder } = useSectionTheme();
  const { globalConfig, resetGlobalConfig } = useGlobalConfig();
  const { headerConfig, topbarConfig } = useHeaderConfig();
  const { sectionContent } = useContent();
  const { toast } = useToast();

  const wpAdmin = typeof window !== 'undefined' ? window.byrdeAdmin : null;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleSelectSection = useCallback((id: SectionId | 'global') => {
    setSelectedSection(id);
    setPanelOpen(true);
    if (id !== 'global') {
      requestAnimationFrame(() => {
        document.getElementById(`${id}-section`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, []);

  const handleClosePanel = useCallback(() => {
    setPanelOpen(false);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sectionOrder.indexOf(active.id as SectionId);
      const newIndex = sectionOrder.indexOf(over.id as SectionId);
      setSectionOrder(arrayMove(sectionOrder, oldIndex, newIndex));
    }
  }, [sectionOrder, setSectionOrder]);

  const handleSaveConfig = useCallback(async () => {
    if (!wpAdmin) {
      toast('Not in admin mode', 'error');
      return;
    }

    setIsSaving(true);

    try {
      const configPayload = {
        globalConfig,
        sectionThemes,
        sectionOrder,
        header: headerConfig,
        topbar: topbarConfig,
        version: Date.now(),
      };

      const minDelay = new Promise((r) => setTimeout(r, 600));

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
        minDelay,
      ]);

      if (!themeRes.ok || !contentRes.ok) {
        throw new Error('Failed to save');
      }

      toast('Saved to WordPress', 'success');
    } catch {
      toast('Failed to save', 'error');
    } finally {
      setIsSaving(false);
    }
  }, [wpAdmin, globalConfig, sectionThemes, sectionOrder, headerConfig, topbarConfig, sectionContent, toast]);

  const handleResetAll = useCallback(() => {
    resetGlobalConfig();
    resetAllSectionThemes();
    toast('All settings reset to defaults', 'info');
  }, [resetGlobalConfig, resetAllSectionThemes, toast]);

  const isGlobal = selectedSection === 'global';
  const panelLabel = isGlobal ? 'Global Settings' : (selectedSection ? SECTION_LABELS[selectedSection] : '');

  return (
    <>
      {/* Floating toggle button - shown when sidebar is closed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed left-3 top-3 z-50 flex items-center justify-center w-9 h-9 rounded-lg bg-zinc-900/90 backdrop-blur border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors shadow-lg"
          aria-label="Open Theme Editor"
        >
          <PanelLeftOpen className="h-4 w-4" />
        </button>
      )}

      {/* Level 1: Sidebar navigator */}
      {isOpen && (
        <div
          className="fixed left-0 top-0 bottom-0 z-50 flex flex-col bg-zinc-950 text-white border-r border-zinc-800"
          style={{ width: SIDEBAR_WIDTH }}
        >
          {/* Header */}
          <div className="shrink-0 flex items-center justify-between px-3 py-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md flex items-center justify-center bg-emerald-600">
                <Palette className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-xs font-semibold leading-tight">Editor</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 text-zinc-500 hover:text-white hover:bg-zinc-800"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Section List */}
          <ScrollArea className="flex-1">
            <div className="p-1.5">
              {/* Global Settings */}
              <button
                onClick={() => handleSelectSection('global')}
                className={`w-full flex items-center gap-2 p-2 rounded-lg transition-colors mb-1 ${
                  selectedSection === 'global' && panelOpen
                    ? 'bg-zinc-800'
                    : 'hover:bg-zinc-900'
                }`}
              >
                <div className="w-6 h-6 rounded-md flex items-center justify-center bg-zinc-800">
                  <Globe className="h-3.5 w-3.5 text-zinc-400" />
                </div>
                <span className="text-xs font-medium flex-1 text-left">Global</span>
                <ChevronRight className="h-3 w-3 text-zinc-600" />
              </button>

              <Separator className="my-1.5 bg-zinc-800/60" />

              {/* Fixed top sections */}
              {FIXED_TOP_SECTIONS.map((id) => {
                const theme = sectionThemes[id];
                return (
                  <FixedSectionItem
                    key={id}
                    id={id}
                    isVisible={isSectionVisible(id)}
                    hasOverride={!!theme?.overrideGlobalColors}
                    isSelected={selectedSection === id && panelOpen}
                    onSelect={() => handleSelectSection(id)}
                  />
                );
              })}

              <Separator className="my-1.5 bg-zinc-800/60" />
              <p className="text-[9px] uppercase tracking-wider text-zinc-600 px-2.5 py-1">Sections</p>

              {/* Draggable sections */}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={sectionOrder} strategy={verticalListSortingStrategy}>
                  {sectionOrder.map((id) => {
                    const theme = sectionThemes[id];
                    return (
                      <SortableSectionItem
                        key={id}
                        id={id}
                        isVisible={isSectionVisible(id)}
                        hasOverride={!!theme?.overrideGlobalColors}
                        isSelected={selectedSection === id && panelOpen}
                        onSelect={() => handleSelectSection(id)}
                      />
                    );
                  })}
                </SortableContext>
              </DndContext>

              <Separator className="my-1.5 bg-zinc-800/60" />

              {/* Fixed bottom sections */}
              {FIXED_BOTTOM_SECTIONS.map((id) => {
                const theme = sectionThemes[id];
                return (
                  <FixedSectionItem
                    key={id}
                    id={id}
                    isVisible={isSectionVisible(id)}
                    hasOverride={!!theme?.overrideGlobalColors}
                    isSelected={selectedSection === id && panelOpen}
                    onSelect={() => handleSelectSection(id)}
                  />
                );
              })}
            </div>
          </ScrollArea>

          {/* Footer Actions */}
          <div className="shrink-0 p-2 space-y-1.5 border-t border-zinc-800">
            <Button
              onClick={handleSaveConfig}
              disabled={isSaving}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-70 text-xs h-8"
              size="sm"
            >
              {isSaving ? (
                <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Saving...</>
              ) : (
                <><Save className="h-3.5 w-3.5 mr-1.5" /> Save</>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetAll}
              className="w-full text-zinc-500 hover:text-red-400 hover:bg-zinc-900 text-xs h-7"
            >
              <RotateCcw className="h-3 w-3 mr-1.5" /> Reset All
            </Button>
          </div>
        </div>
      )}

      {/* Level 2: Config panel - overlays Level 1 */}
      {isOpen && panelOpen && selectedSection && (
        <div
          className="fixed left-0 top-0 bottom-0 z-[51] flex flex-col editor-dark bg-zinc-900 text-zinc-100 border-r border-zinc-800 shadow-2xl shadow-black/40"
          style={{ width: PANEL_WIDTH }}
        >
          {/* Panel header */}
          <div className="shrink-0 flex items-center gap-2 px-3 py-3 border-b border-zinc-800">
            <button
              onClick={handleClosePanel}
              className="flex items-center justify-center w-7 h-7 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-zinc-200 truncate">{panelLabel}</h3>
            </div>
          </div>

          {/* Panel content */}
          {isGlobal ? (
            <ScrollArea className="flex-1">
              <div className="p-4">
                <GlobalPanel />
              </div>
            </ScrollArea>
          ) : (
            <Tabs defaultValue="style" className="flex-1 flex flex-col min-h-0">
              <div className="px-3 pt-2">
                <TabsList className="w-full grid grid-cols-3 bg-zinc-800/60 h-8">
                  <TabsTrigger value="style" className="gap-1 text-[11px] text-zinc-500 data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-200 data-[state=active]:shadow-none h-7">
                    <Palette className="h-3 w-3" />
                    Style
                  </TabsTrigger>
                  <TabsTrigger value="content" className="gap-1 text-[11px] text-zinc-500 data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-200 data-[state=active]:shadow-none h-7">
                    <FileText className="h-3 w-3" />
                    Content
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="gap-1 text-[11px] text-zinc-500 data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-200 data-[state=active]:shadow-none h-7">
                    <Settings2 className="h-3 w-3" />
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
          )}
        </div>
      )}
    </>
  );
}

export default ThemeEditor;
