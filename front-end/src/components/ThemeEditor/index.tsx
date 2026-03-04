/**
 * Theme Editor - Pure shadcn/ui
 *
 * Layout: Level 1 (200px sidebar) + Level 2 (overlays L1 at left:0, 380px)
 * When L2 is open it slides over L1 so page content stays visible.
 */

import { useState, useCallback, useEffect } from 'react';
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
import { AdvancedPanel } from './panels/AdvancedPanel';
import { PageAdvancedPanel } from './panels/PageAdvancedPanel';
import { SiteSettingsPanel } from './panels/SiteSettingsPanel';
import { SocialPanel } from './panels/SocialPanel';
import { useSettingsContext } from '../../context/SettingsContext';
import type { ThemeSettings } from '../../hooks/useSettings';
import { DEFAULT_SETTINGS } from '../../hooks/useSettings';
import {
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  Save,
  Loader2,
  RotateCcw,
  EyeOff,
  Palette,
  FileText,
  Settings2,
  GripVertical,
  PanelLeftOpen,
  Code,
  Building,
  Share2,
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

// Convert flat ThemeSettings to nested structure for PHP API
function flatToNestedSettings(flat: ThemeSettings) {
  return {
    brand: {
      logo: { url: flat.logo, alt: flat.logo_alt },
      phone: flat.phone,
      email: flat.email,
    },
    google_reviews: {
      rating: flat.google_rating,
      count: flat.google_reviews_count,
      reviews_url: flat.google_reviews_url,
    },
    footer: {
      tagline: flat.footer_tagline,
      description: flat.footer_description,
      address: flat.address,
      business_hours: flat.business_hours,
      copyright: flat.copyright,
    },
    social: {
      facebook_url: flat.facebook_url,
      instagram_url: flat.instagram_url,
      youtube_url: flat.youtube_url,
      yelp_url: flat.yelp_url,
    },
    seo: {
      site_name: flat.site_name,
      site_tagline: flat.site_tagline,
      site_description: flat.site_description,
      site_keywords: flat.site_keywords,
      site_url: flat.site_url,
      og_image: flat.og_image,
    },
    legal: {
      privacy_policy_url: flat.privacy_policy_url,
      terms_url: flat.terms_url,
      cookie_settings_url: flat.cookie_settings_url,
    },
    contact_form: {
      postmark_api_token: flat.postmark_api_token,
      to_email: flat.contact_form_to_email,
      from_email: flat.contact_form_from_email,
      subject: flat.contact_form_subject,
      cc_email: flat.contact_form_cc_email,
      bcc_email: flat.contact_form_bcc_email,
    },
    brand_colors: {
      dark_primary: flat.brand_dark_primary,
      dark_accent: flat.brand_dark_accent,
      dark_text: flat.brand_dark_text,
      light_primary: flat.brand_light_primary,
      light_accent: flat.brand_light_accent,
      light_text: flat.brand_light_text,
      mode: flat.brand_mode,
    },
    button_style: {
      border_width: flat.button_border_width,
      border_radius: flat.button_border_radius,
      dark_text_color: flat.button_dark_text_color,
      dark_accent_text_color: flat.button_dark_accent_text_color,
      light_text_color: flat.button_light_text_color,
      light_accent_text_color: flat.button_light_accent_text_color,
      shadow: flat.button_shadow,
    },
  };
}

/**
 * Bridge: syncs brand colors from SettingsContext → GlobalConfigContext
 * so palette auto-regenerates when the user changes colors in Site Settings.
 */
function BrandColorSync() {
  const { settings } = useSettingsContext();
  const { globalConfig, updateBrand } = useGlobalConfig();

  useEffect(() => {
    const updates: Partial<import('../../context/GlobalConfigContext').BrandColors> = {
      darkPrimary: settings.brand_dark_primary,
      darkAccent: settings.brand_dark_accent,
      darkText: settings.brand_dark_text,
      lightPrimary: settings.brand_light_primary,
      lightAccent: settings.brand_light_accent,
      lightText: settings.brand_light_text,
    };
    // When no per-page override, sync mode from site default
    if (!globalConfig.brand.modeOverride) {
      updates.mode = (settings.brand_mode || 'dark') as 'dark' | 'light';
    }
    updateBrand(updates);
  }, [
    settings.brand_dark_primary,
    settings.brand_dark_accent,
    settings.brand_dark_text,
    settings.brand_light_primary,
    settings.brand_light_accent,
    settings.brand_light_text,
    settings.brand_mode,
    globalConfig.brand.modeOverride,
    updateBrand,
  ]);

  return null;
}

export function ThemeEditor() {
  const { isOpen, setIsOpen } = useSidebar();
  const [selectedSection, setSelectedSection] = useState<SectionId | 'page-design' | 'site-settings' | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { sectionThemes, isSectionVisible, resetAllSectionThemes, resetSectionTheme, sectionOrder, setSectionOrder } = useSectionTheme();
  const { globalConfig, resetGlobalConfig } = useGlobalConfig();
  const { headerConfig, topbarConfig } = useHeaderConfig();
  const { sectionContent } = useContent();
  const { settings, updateSettings } = useSettingsContext();
  const { toast } = useToast();

  // Brand color + button style defaults for resetting SettingsContext
  const resetBrandColors = useCallback(() => {
    updateSettings({
      brand_dark_primary: DEFAULT_SETTINGS.brand_dark_primary,
      brand_dark_accent: DEFAULT_SETTINGS.brand_dark_accent,
      brand_dark_text: DEFAULT_SETTINGS.brand_dark_text,
      brand_light_primary: DEFAULT_SETTINGS.brand_light_primary,
      brand_light_accent: DEFAULT_SETTINGS.brand_light_accent,
      brand_light_text: DEFAULT_SETTINGS.brand_light_text,
      brand_mode: DEFAULT_SETTINGS.brand_mode,
      button_border_width: DEFAULT_SETTINGS.button_border_width,
      button_border_radius: DEFAULT_SETTINGS.button_border_radius,
      button_dark_text_color: DEFAULT_SETTINGS.button_dark_text_color,
      button_dark_accent_text_color: DEFAULT_SETTINGS.button_dark_accent_text_color,
      button_light_text_color: DEFAULT_SETTINGS.button_light_text_color,
      button_light_accent_text_color: DEFAULT_SETTINGS.button_light_accent_text_color,
      button_shadow: DEFAULT_SETTINGS.button_shadow,
    });
  }, [updateSettings]);

  const wpAdmin = typeof window !== 'undefined' ? window.byrdeAdmin : null;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleSelectSection = useCallback((id: SectionId | 'page-design' | 'site-settings') => {
    setSelectedSection(id);
    setPanelOpen(true);
    if (id !== 'page-design' && id !== 'site-settings') {
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
      // Re-inject visibility into each section theme before saving.
      // Include ALL sections: reorderable + fixed (topheader, header, footer).
      const allSectionIds = [...FIXED_TOP_SECTIONS, ...sectionOrder, ...FIXED_BOTTOM_SECTIONS];
      const sectionThemesWithVisibility: Record<string, unknown> = {};
      for (const id of allSectionIds) {
        sectionThemesWithVisibility[id] = {
          ...(sectionThemes[id] || {}),
          visible: isSectionVisible(id),
        };
      }

      const configPayload = {
        globalConfig,
        sectionThemes: sectionThemesWithVisibility,
        sectionOrder,
        header: headerConfig,
        topbar: topbarConfig,
        version: Date.now(),
      };

      const settingsPayload = flatToNestedSettings(settings);

      console.group('🔧 Byrde Save Payload');
      console.log('Theme Config:', JSON.parse(JSON.stringify(configPayload)));
      console.log('Content:', JSON.parse(JSON.stringify(sectionContent)));
      console.log('Settings:', JSON.parse(JSON.stringify(settingsPayload)));
      console.groupEnd();

      const minDelay = new Promise((r) => setTimeout(r, 600));
      const headers = { 'Content-Type': 'application/json', 'X-WP-Nonce': wpAdmin.nonce };

      const [themeRes, contentRes, settingsRes] = await Promise.all([
        fetch(`${wpAdmin.apiUrl}/pages/${wpAdmin.pageId}/theme`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(configPayload),
        }),
        fetch(`${wpAdmin.apiUrl}/pages/${wpAdmin.pageId}/content`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(sectionContent),
        }),
        fetch(`${wpAdmin.apiUrl}/settings`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(settingsPayload),
        }),
        minDelay,
      ]);

      if (!themeRes.ok || !contentRes.ok || !settingsRes.ok) {
        throw new Error('Failed to save');
      }

      toast('Saved to WordPress', 'success');
    } catch {
      toast('Failed to save', 'error');
    } finally {
      setIsSaving(false);
    }
  }, [wpAdmin, globalConfig, sectionThemes, sectionOrder, isSectionVisible, headerConfig, topbarConfig, sectionContent, settings, toast]);

  const handleResetAll = useCallback(() => {
    resetGlobalConfig();
    resetAllSectionThemes();
    resetBrandColors();
    toast('All settings reset to defaults', 'info');
  }, [resetGlobalConfig, resetAllSectionThemes, resetBrandColors, toast]);

  const isPageDesign = selectedSection === 'page-design';
  const isSiteSettings = selectedSection === 'site-settings';
  const panelLabel = isPageDesign
    ? 'Page Settings'
    : isSiteSettings
      ? 'Site Settings'
      : (selectedSection ? SECTION_LABELS[selectedSection] : '');

  return (
    <>
      <BrandColorSync />
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
              {/* Page Design */}
              <button
                onClick={() => handleSelectSection('page-design')}
                className={`w-full flex items-center gap-2 p-2 rounded-lg transition-colors ${
                  isPageDesign && panelOpen ? 'bg-zinc-800' : 'hover:bg-zinc-900'
                }`}
              >
                <div className="w-6 h-6 rounded-md flex items-center justify-center bg-zinc-800">
                  <Palette className="h-3.5 w-3.5 text-zinc-400" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <span className="text-xs font-medium block">Page Settings</span>
                  <span className="text-[9px] text-zinc-500 block">Theme mode, social sharing</span>
                </div>
                <ChevronRight className="h-3 w-3 text-zinc-600 shrink-0" />
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
                    hasOverride={!!theme?.paletteMode}
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
                        hasOverride={!!theme?.paletteMode}
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
                    hasOverride={!!theme?.paletteMode}
                    isSelected={selectedSection === id && panelOpen}
                    onSelect={() => handleSelectSection(id)}
                  />
                );
              })}
            </div>
          </ScrollArea>

          {/* Footer: Site Settings + Save */}
          <div className="shrink-0 border-t border-zinc-800">
            {/* Site Settings — prominent button above save */}
            <div className="p-2 pb-0">
              <button
                onClick={() => handleSelectSection('site-settings')}
                className={`w-full flex items-center gap-2.5 p-2.5 rounded-lg border transition-colors ${
                  isSiteSettings && panelOpen
                    ? 'bg-zinc-800 border-zinc-700'
                    : 'bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="w-7 h-7 rounded-md flex items-center justify-center bg-zinc-800 border border-zinc-700">
                  <Building className="h-3.5 w-3.5 text-zinc-300" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <span className="text-xs font-semibold text-zinc-200 block">Site Settings</span>
                  <span className="text-[9px] text-zinc-500 block">Brand, analytics, social</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
              </button>
            </div>

            {/* Save + Reset */}
            <div className="p-2 space-y-1.5">
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
          {isPageDesign ? (
            <>
              <Tabs defaultValue="design" className="flex-1 flex flex-col min-h-0">
                <div className="px-3 pt-2">
                  <TabsList className="w-full grid grid-cols-3 bg-zinc-800/60 h-8">
                    <TabsTrigger value="design" className="gap-1 text-[11px] text-zinc-500 data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-200 data-[state=active]:shadow-none h-7">
                      <Palette className="h-3 w-3" />
                      Design
                    </TabsTrigger>
                    <TabsTrigger value="social" className="gap-1 text-[11px] text-zinc-500 data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-200 data-[state=active]:shadow-none h-7">
                      <Share2 className="h-3 w-3" />
                      Social
                    </TabsTrigger>
                    <TabsTrigger value="advanced" className="gap-1 text-[11px] text-zinc-500 data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-200 data-[state=active]:shadow-none h-7">
                      <Code className="h-3 w-3" />
                      Advanced
                    </TabsTrigger>
                  </TabsList>
                </div>
                <ScrollArea className="flex-1">
                  <TabsContent value="design" className="m-0 p-4">
                    <GlobalPanel />
                  </TabsContent>
                  <TabsContent value="social" className="m-0 p-4">
                    <SocialPanel />
                  </TabsContent>
                  <TabsContent value="advanced" className="m-0 p-4">
                    <PageAdvancedPanel />
                  </TabsContent>
                </ScrollArea>
              </Tabs>
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
                  onClick={() => {
                    resetGlobalConfig();
                    resetBrandColors();
                    toast('Design reset to defaults', 'info');
                  }}
                  className="w-full text-zinc-500 hover:text-red-400 hover:bg-zinc-900 text-xs h-7"
                >
                  <RotateCcw className="h-3 w-3 mr-1.5" /> Reset Design
                </Button>
              </div>
            </>
          ) : isSiteSettings ? (
            <>
              <Tabs defaultValue="site" className="flex-1 flex flex-col min-h-0">
                <div className="px-3 pt-2">
                  <TabsList className="w-full grid grid-cols-2 bg-zinc-800/60 h-8">
                    <TabsTrigger value="site" className="gap-1 text-[11px] text-zinc-500 data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-200 data-[state=active]:shadow-none h-7">
                      <Building className="h-3 w-3" />
                      Site
                    </TabsTrigger>
                    <TabsTrigger value="advanced" className="gap-1 text-[11px] text-zinc-500 data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-200 data-[state=active]:shadow-none h-7">
                      <Code className="h-3 w-3" />
                      Advanced
                    </TabsTrigger>
                  </TabsList>
                </div>
                <ScrollArea className="flex-1">
                  <TabsContent value="site" className="m-0 p-4">
                    <SiteSettingsPanel />
                  </TabsContent>
                  <TabsContent value="advanced" className="m-0 p-4">
                    <AdvancedPanel />
                  </TabsContent>
                </ScrollArea>
              </Tabs>
              <div className="shrink-0 p-2 border-t border-zinc-800">
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
              </div>
            </>
          ) : (
            <>
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

              {/* Fixed footer for section panels */}
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
                  onClick={() => {
                    resetSectionTheme(selectedSection);
                    toast('Section reset to defaults', 'info');
                  }}
                  className="w-full text-zinc-500 hover:text-red-400 hover:bg-zinc-900 text-xs h-7"
                >
                  <RotateCcw className="h-3 w-3 mr-1.5" /> Reset Section
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

export default ThemeEditor;
