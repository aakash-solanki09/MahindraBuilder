import React from 'react';
import { useBuilderStore } from '../../store/useBuilderStore';
import { Layout, ChevronRight, Save, CloudUpload, PanelTop, Monitor, CheckCircle, Package, Globe, Settings, Map as MapIcon, ChevronDown, Image as ImageIcon, Cpu, Users, FileText, Play as PlayIcon, Edit2, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import PropertyEditor from './PropertyEditor';
import { useWorkshopStore } from '../../store/useWorkshopStore';
import ImageUploadInput from '../ui/ImageUploadInput';
import { resolveMediaUrl } from '../../lib/media';

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  activeTab: 'add' | 'edit' | 'custom' | 'settings';
  setActiveTab: (tab: 'add' | 'edit' | 'custom' | 'settings') => void;
  showStylePanel: boolean;
  setShowStylePanel: (show: boolean) => void;
  isSaving: boolean;
  handleSave: (publish?: boolean) => void;
  activeColorPicker: string | null;
  setActiveColorPicker: (val: string | null) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
  activeTab,
  setActiveTab,
  showStylePanel,
  setShowStylePanel,
  isSaving,
  handleSave,
  activeColorPicker,
  setActiveColorPicker
}) => {
  const {
    addSection, selectedSectionId, customTemplates, 
    removeCustomTemplate, setWorkshopMode,
    setHtmlWorkshopMode, loadHtmlDesign, resetHtmlWorkshop,
    page
  } = useBuilderStore();

  const updatePageMeta = (updater: (meta: any) => any) => {
    const current = useBuilderStore.getState().page;
    useBuilderStore.getState().setPage({
      ...current,
      meta: updater(current.meta || {})
    });
  };

  // Get dynamic branding details from localStorage
  const userRaw = localStorage.getItem('user');
  let brandName = 'Mahindra Logistics';
  let brandLogo = '/assets/images/86.png';
  if (userRaw) {
    try {
      const user = JSON.parse(userRaw);
      if (user.brandName !== undefined) brandName = user.brandName;
      if (user.brandLogo !== undefined) brandLogo = user.brandLogo;
    } catch (e) {
      console.error(e);
    }
  }

  const pageName = useBuilderStore.getState().page.pageName || 'Mahindra Logistics';
  const pageSlug = useBuilderStore.getState().page.slug || 'preview';
  const title = useBuilderStore.getState().page.meta?.title || pageName;
  const description =
    useBuilderStore.getState().page.meta?.description || `Learn more about ${pageName}.`;
  const canonicalHref =
    pageSlug && pageSlug !== 'preview'
      ? `${window.location.origin}/${pageSlug}`
      : `${window.location.origin}/`;

  const defaultMetaFields = [
    { label: 'keywords', key: 'keywords', kind: 'name', fallback: `${pageName}, logistics, warehousing, supply chain` },
    { label: 'author', key: 'author', kind: 'name', fallback: 'MyWebsite' },
    { label: 'robots', key: 'robots', kind: 'name', fallback: 'index, follow' },
    { label: 'viewport', key: 'viewport', kind: 'name', fallback: 'width=device-width, initial-scale=1.0' },
    { label: 'theme-color', key: 'theme-color', kind: 'name', fallback: '#ffffff' },
    { label: 'og:type', key: 'og:type', kind: 'property', fallback: 'website' },
    { label: 'og:title', key: 'og:title', kind: 'property', fallback: title },
    { label: 'og:description', key: 'og:description', kind: 'property', fallback: description },
    { label: 'og:url', key: 'og:url', kind: 'property', fallback: canonicalHref },
    { label: 'og:image', key: 'og:image', kind: 'property', fallback: 'https://mywebsite.com/images/seo-banner.jpg' },
    { label: 'og:site_name', key: 'og:site_name', kind: 'property', fallback: 'MyWebsite' },
    { label: 'og:locale', key: 'og:locale', kind: 'property', fallback: 'en_US' },
    { label: 'twitter:card', key: 'twitter:card', kind: 'name', fallback: 'summary_large_image' },
    { label: 'twitter:title', key: 'twitter:title', kind: 'name', fallback: title },
    { label: 'twitter:description', key: 'twitter:description', kind: 'name', fallback: description },
    { label: 'twitter:image', key: 'twitter:image', kind: 'name', fallback: 'https://mywebsite.com/images/seo-banner.jpg' },
    { label: 'twitter:site', key: 'twitter:site', kind: 'name', fallback: '@mywebsite' },
    { label: 'Content-Language', key: 'Content-Language', kind: 'httpEquiv', fallback: 'en' },
    { label: 'rating', key: 'rating', kind: 'name', fallback: 'general' },
    { label: 'distribution', key: 'distribution', kind: 'name', fallback: 'global' },
    { label: 'revisit-after', key: 'revisit-after', kind: 'name', fallback: '7 days' }
  ] as const;

  const defaultLinkFields = [
    { label: 'canonical', rel: 'canonical', fallback: canonicalHref },
    { label: 'icon', rel: 'icon', fallback: '/favicon.ico' },
    { label: 'apple-touch-icon', rel: 'apple-touch-icon', fallback: '/apple-touch-icon.png' }
  ] as const;

  const matchesMetaField = (item: any, kind: 'name' | 'property' | 'httpEquiv', key: string) => {
    if (!item) return false;
    if (kind === 'name') return (item.name || '').toLowerCase() === key.toLowerCase();
    if (kind === 'property') return (item.property || '').toLowerCase() === key.toLowerCase();
    return (item.httpEquiv || '').toLowerCase() === key.toLowerCase();
  };

  const getMetaFieldValue = (kind: 'name' | 'property' | 'httpEquiv', key: string, fallback: string) => {
    const attrs = useBuilderStore.getState().page.meta?.attributes || [];
    const found = attrs.find((item: any) => matchesMetaField(item, kind, key));
    return found?.content || fallback;
  };

  const setMetaFieldValue = (kind: 'name' | 'property' | 'httpEquiv', key: string, value: string) => {
    updatePageMeta((meta) => {
      const attrs = [...(meta.attributes || [])];
      const index = attrs.findIndex((item: any) => matchesMetaField(item, kind, key));

      if (!value.trim()) {
        return {
          ...meta,
          attributes: attrs.filter((item: any, i: number) => i !== index)
        };
      }

      const nextItem =
        kind === 'name'
          ? { name: key, property: '', httpEquiv: '', content: value }
          : kind === 'property'
          ? { name: '', property: key, httpEquiv: '', content: value }
          : { name: '', property: '', httpEquiv: key, content: value };

      if (index >= 0) {
        attrs[index] = nextItem;
      } else {
        attrs.push(nextItem);
      }

      return {
        ...meta,
        attributes: attrs
      };
    });
  };

  const getLinkFieldValue = (rel: string, fallback: string) => {
    const links = useBuilderStore.getState().page.meta?.links || [];
    const found = links.find((item: any) => (item.rel || '').toLowerCase() === rel.toLowerCase());
    return found?.href || fallback;
  };

  const setLinkFieldValue = (rel: string, href: string) => {
    updatePageMeta((meta) => {
      const links = [...(meta.links || [])];
      const index = links.findIndex((item: any) => (item.rel || '').toLowerCase() === rel.toLowerCase());

      if (!href.trim()) {
        return {
          ...meta,
          links: links.filter((_: any, i: number) => i !== index)
        };
      }

      if (index >= 0) {
        links[index] = { rel, href };
      } else {
        links.push({ rel, href });
      }

      return {
        ...meta,
        links
      };
    });
  };

  const isImageMetaField = (kind: 'name' | 'property' | 'httpEquiv', key: string) => {
    return (
      (kind === 'property' && key.toLowerCase() === 'og:image') ||
      (kind === 'name' && key.toLowerCase() === 'twitter:image')
    );
  };

  const isImageLinkField = (rel: string) => {
    const normalized = rel.toLowerCase();
    return normalized === 'icon' || normalized === 'apple-touch-icon';
  };

  return (
    <aside className={cn(
      "bg-white border-r flex flex-col shadow-xl z-[100] transition-all duration-500 ease-in-out",
      isSidebarOpen ? "w-[280px] sm:w-80 translate-x-0" : "w-0 -translate-x-full lg:w-0 lg:-translate-x-full",
      "fixed lg:relative h-full"
    )}>
      <div className={cn("flex flex-col h-full w-[280px] sm:w-80", !isSidebarOpen && "invisible")}>
        <div className="p-4 border-b flex items-center justify-between bg-gray-50/50">
          <a href="/admin/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            {brandLogo && (
              <img 
                src={resolveMediaUrl(brandLogo)} 
                alt={brandName || "Logo"} 
                className="h-10 w-auto object-contain max-w-[140px]" 
              />
            )}
            {brandName && (
              <h2 className="font-black text-lg tracking-tighter text-mahindra-blue uppercase">{brandName}</h2>
            )}
          </a>
          <div className="flex gap-2">
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-400"
              title="Close Sidebar"
            >
              <ChevronRight className="rotate-180 w-4 h-4" />
            </button>
            <button
              onClick={() => handleSave(false)}
              disabled={isSaving}
              className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-mahindra-red transition-all shadow-sm bg-white/50"
              title="Save Draft"
            >
              <Save className={cn("w-4 h-4", isSaving && "animate-pulse")} />
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={isSaving}
              className="p-2 bg-mahindra-red text-white rounded-lg hover:brightness-110 shadow-md transition-all"
              title="Publish Page"
            >
              <CloudUpload className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b bg-gray-50/30">
          <button
            onClick={() => setActiveTab('add')}
            className={cn("flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all", activeTab === 'add' ? "bg-white text-mahindra-red border-b-2 border-mahindra-red" : "text-gray-400 hover:text-gray-600")}
          >
            Add
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            className={cn("flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all", activeTab === 'edit' ? "bg-white text-mahindra-red border-b-2 border-mahindra-red" : "text-gray-400 hover:text-gray-600")}
            disabled={!selectedSectionId}
          >
            Edit
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={cn("flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all", activeTab === 'custom' ? "bg-white text-mahindra-red border-b-2 border-mahindra-red" : "text-gray-400 hover:text-gray-600")}
          >
            Custom
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={cn("flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all", activeTab === 'settings' ? "bg-white text-mahindra-red border-b-2 border-mahindra-red" : "text-gray-400 hover:text-gray-600")}
          >
            Settings
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'add' ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { type: 'navbar', label: 'Navbar', icon: PanelTop },
                  { type: 'hero', label: 'Hero', icon: Monitor },
                  { type: 'about', label: 'About', icon: CheckCircle },
                  { type: 'features', label: 'Services', icon: Package },
                  { type: 'industries', label: 'Industries', icon: Globe },
                  { type: 'warehouses', label: 'Network', icon: Layout },
                  { type: 'why-choose-us', label: 'Why Us', icon: Settings },
                  { type: 'network', label: 'Map Network', icon: MapIcon },
                  { type: 'faq', label: 'FAQ', icon: ChevronDown },
                  { type: 'brands', label: 'Brands', icon: ImageIcon },
                  { type: 'technology-operations', label: 'Tech Ops', icon: Cpu },
                  { type: 'testimonials', label: 'Clients', icon: Users },
                  { type: 'case-studies', label: 'Cases', icon: FileText },
                  { type: 'facility-showcase', label: 'Showcase', icon: PlayIcon },
                  { type: 'footer', label: 'Footer', icon: ChevronRight },
                ].map((item) => (
                  <button
                    key={item.type}
                    onClick={() => addSection(item.type as any)}
                    className="p-4 border rounded-xl hover:border-mahindra-red hover:bg-red-50 transition-all text-sm font-medium flex flex-col items-center gap-2 group"
                  >
                    <item.icon className="w-5 h-5 text-gray-400 group-hover:text-mahindra-red transition-colors" />
                    <span className="text-[10px] font-bold uppercase tracking-tight">{item.label}</span>
                  </button>
                ))}
              </div>

              {customTemplates.length > 0 && (
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest px-1">Your Custom Sections</p>
                  <div className="grid grid-cols-2 gap-3">
                    {customTemplates.map((template) => (
                      <div key={template._id} className="relative group">
                        <button
                          onClick={() => addSection(template.type, template.content, template.styles)}
                          className="w-full p-4 border border-mahindra-blue/20 bg-mahindra-blue/5 rounded-xl hover:border-mahindra-red hover:bg-red-50 transition-all text-sm font-medium flex flex-col items-center gap-2 shadow-sm"
                        >
                          <Layout className="w-5 h-5 text-mahindra-blue group-hover:text-mahindra-red" />
                          <span className="text-[10px] font-bold uppercase tracking-tight truncate w-full px-1">{template.name}</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (template.type === 'html-builder') {
                              loadHtmlDesign(template);
                              setHtmlWorkshopMode(true);
                            } else if (template.content.originalElements) {
                              useWorkshopStore.getState().loadDesign(template.content.originalElements, template._id);
                              setWorkshopMode(true);
                            } else {
                              alert('This template is from an older version and cannot be re-edited.');
                            }
                          }}
                          className="absolute top-2 right-2 p-1.5 bg-white border rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-all text-mahindra-blue hover:text-mahindra-red"
                          title="Edit Design"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : activeTab === 'edit' ? (
            <PropertyEditor 
              showStylePanel={showStylePanel}
              setShowStylePanel={setShowStylePanel}
              activeColorPicker={activeColorPicker}
              setActiveColorPicker={setActiveColorPicker}
            />
          ) : activeTab === 'settings' ? (
            <div className="space-y-6">
              <div className="space-y-4">
                <p className="text-[10px] font-black text-black uppercase tracking-widest px-1">General Settings</p>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase px-1">Page Name (Internal)</label>
                  <input 
                    type="text" 
                    value={useBuilderStore.getState().page.pageName}
                    onChange={(e) => useBuilderStore.getState().setPage({ ...useBuilderStore.getState().page, pageName: e.target.value })}
                    className="w-full p-3 border rounded-xl text-sm focus:ring-1 focus:ring-mahindra-red outline-none"
                    placeholder="e.g. Warehouse Landing Page"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase px-1">Page Header Logo</label>
                  <ImageUploadInput
                    value={page.meta?.logoImage || '/assets/images/86.png'}
                    onChange={(value) => updatePageMeta((meta) => ({ ...meta, logoImage: value }))}
                    placeholder="/assets/images/86.png"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase px-1">URL Slug</label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm">/</span>
                    <input 
                      type="text" 
                      value={useBuilderStore.getState().page.slug}
                      onChange={(e) => useBuilderStore.getState().setPage({ ...useBuilderStore.getState().page, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                      className="w-full p-3 border rounded-xl text-sm focus:ring-1 focus:ring-mahindra-red outline-none"
                      placeholder="e.g. warehouse-solutions"
                    />
                  </div>
                  <p className="text-[9px] text-gray-400 px-1 italic">Use "preview" for the home page.</p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <p className="text-[10px] font-black text-black uppercase tracking-widest px-1">Floating CTA</p>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase px-1">Button Text</label>
                  <input
                    type="text"
                    value={useBuilderStore.getState().page.meta?.floatingCta?.text || 'Get Free Quote'}
                    onChange={(e) => updatePageMeta((meta) => ({
                      ...meta,
                      floatingCta: {
                        text: e.target.value,
                        backgroundColor: meta.floatingCta?.backgroundColor || '#E31837',
                        textColor: meta.floatingCta?.textColor || '#ffffff',
                        borderColor: meta.floatingCta?.borderColor || ''
                      }
                    }))}
                    className="w-full p-3 border rounded-xl text-sm focus:ring-1 focus:ring-mahindra-red outline-none"
                    placeholder="Get Free Quote"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: 'backgroundColor', label: 'Background', fallback: '#E31837' },
                    { key: 'textColor', label: 'Text', fallback: '#ffffff' },
                    { key: 'borderColor', label: 'Border', fallback: '#E31837' },
                  ].map((item) => {
                    const value = (useBuilderStore.getState().page.meta?.floatingCta as any)?.[item.key] || item.fallback;
                    return (
                      <div key={item.key} className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase px-1">{item.label}</label>
                        <div className="flex items-center gap-2 rounded-xl border px-2 py-2 bg-white">
                          <input
                            type="color"
                            value={value}
                            onChange={(e) => updatePageMeta((meta) => ({
                              ...meta,
                              floatingCta: {
                                text: meta.floatingCta?.text || 'Get Free Quote',
                                backgroundColor: meta.floatingCta?.backgroundColor || '#E31837',
                                textColor: meta.floatingCta?.textColor || '#ffffff',
                                borderColor: meta.floatingCta?.borderColor || '',
                                [item.key]: e.target.value
                              }
                            }))}
                            className="h-8 w-8 cursor-pointer rounded-lg border"
                          />
                          <span className="text-[10px] text-gray-400 font-mono uppercase truncate">{value}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <p className="text-[10px] font-black text-black uppercase tracking-widest px-1">SEO & Metadata</p>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase px-1">Browser Title</label>
                  <input 
                    type="text" 
                    value={useBuilderStore.getState().page.meta?.title || ''}
                    onChange={(e) => {
                      const page = useBuilderStore.getState().page;
                      useBuilderStore.getState().setPage({ 
                        ...page, 
                        meta: { ...page.meta, title: e.target.value } 
                      });
                    }}
                    className="w-full p-3 border rounded-xl text-sm focus:ring-1 focus:ring-mahindra-red outline-none"
                    placeholder="Title shown in browser tab"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase px-1">Meta Description</label>
                  <textarea 
                    value={useBuilderStore.getState().page.meta?.description || ''}
                    onChange={(e) => {
                      const page = useBuilderStore.getState().page;
                      useBuilderStore.getState().setPage({ 
                        ...page, 
                        meta: { ...page.meta, description: e.target.value } 
                      });
                    }}
                    rows={4}
                    className="w-full p-3 border rounded-xl text-sm focus:ring-1 focus:ring-mahindra-red outline-none resize-none"
                    placeholder="Summary for search engines..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase px-1">Google Analytics Script or Measurement ID</label>
                  <input
                    type="text"
                    value={useBuilderStore.getState().page.meta?.gaMeasurementId || ''}
                    onChange={(e) => {
                      const input = e.target.value;
                      const normalized = input.toUpperCase().replace(/\s+/g, '');
                      const extractedId = input.match(/G-[A-Z0-9]+/i)?.[0]?.toUpperCase();
                      const gaMeasurementId = (input.includes('<script') || input.includes('gtag')) && extractedId ? extractedId : normalized;
                      const page = useBuilderStore.getState().page;

                      useBuilderStore.getState().setPage({
                        ...page,
                        meta: {
                          ...page.meta,
                          gaMeasurementId
                        }
                      });
                    }}
                    className="w-full p-3 border rounded-xl text-sm focus:ring-1 focus:ring-mahindra-red outline-none"
                    placeholder="Paste full gtag script or G-XXXXXXXXXX"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase px-1">Google Tag Manager Container ID</label>
                  <input
                    type="text"
                    value={useBuilderStore.getState().page.meta?.gtmId || ''}
                    onChange={(e) => {
                      const input = e.target.value;
                      const normalized = input.toUpperCase().replace(/\s+/g, '');
                      const extractedId = input.match(/GTM-[A-Z0-9]+/i)?.[0]?.toUpperCase();
                      const gtmId = (input.includes('<script') || input.includes('dataLayer')) && extractedId ? extractedId : normalized;
                      const page = useBuilderStore.getState().page;

                      useBuilderStore.getState().setPage({
                        ...page,
                        meta: {
                          ...page.meta,
                          gtmId
                        }
                      });
                    }}
                    className="w-full p-3 border rounded-xl text-sm focus:ring-1 focus:ring-mahindra-red outline-none"
                    placeholder="e.g. GTM-XXXXXXX"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase px-1">Facebook Pixel ID</label>
                  <input
                    type="text"
                    value={useBuilderStore.getState().page.meta?.pixelId || ''}
                    onChange={(e) => {
                      const input = e.target.value;
                      const matchId = input.match(/id=([0-9]+)/i)?.[1] || input.match(/init',\s*'([0-9]+)'/i)?.[1];
                      const pixelId = matchId || input.replace(/\D/g, '');
                      const page = useBuilderStore.getState().page;

                      useBuilderStore.getState().setPage({
                        ...page,
                        meta: {
                          ...page.meta,
                          pixelId
                        }
                      });
                    }}
                    className="w-full p-3 border rounded-xl text-sm focus:ring-1 focus:ring-mahindra-red outline-none"
                    placeholder="e.g. 1234567890"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase px-1">Editable Default Meta Tags</label>
                  <div className="border rounded-xl bg-gray-50 p-3 max-h-72 overflow-y-auto space-y-2">
                    {defaultMetaFields.map((field) => (
                      <div key={`${field.kind}-${field.key}`} className="space-y-1">
                        <label className="text-[10px] text-gray-500 px-1">{field.label}</label>
                        {isImageMetaField(field.kind, field.key) ? (
                          <ImageUploadInput
                            value={getMetaFieldValue(field.kind, field.key, field.fallback)}
                            onChange={(value) => setMetaFieldValue(field.kind, field.key, value)}
                            placeholder={field.fallback}
                          />
                        ) : (
                          <input
                            type="text"
                            value={getMetaFieldValue(field.kind, field.key, field.fallback)}
                            onChange={(e) => setMetaFieldValue(field.kind, field.key, e.target.value)}
                            className="w-full p-2 border rounded-lg text-xs"
                            placeholder={field.fallback}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase px-1">Editable Default Link Tags</label>
                  <div className="border rounded-xl bg-gray-50 p-3 space-y-2">
                    {defaultLinkFields.map((field) => (
                      <div key={field.rel} className="space-y-1">
                        <label className="text-[10px] text-gray-500 px-1">{field.label}</label>
                        {isImageLinkField(field.rel) ? (
                          <ImageUploadInput
                            value={getLinkFieldValue(field.rel, field.fallback)}
                            onChange={(value) => setLinkFieldValue(field.rel, value)}
                            placeholder={field.fallback}
                          />
                        ) : (
                          <input
                            type="text"
                            value={getLinkFieldValue(field.rel, field.fallback)}
                            onChange={(e) => setLinkFieldValue(field.rel, e.target.value)}
                            className="w-full p-2 border rounded-lg text-xs"
                            placeholder={field.fallback}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-gray-500 uppercase px-1">Custom Meta Tags</label>
                    <button
                      onClick={() => {
                        updatePageMeta((meta) => ({
                          ...meta,
                          attributes: [
                            ...(meta.attributes || []),
                            { name: '', property: '', httpEquiv: '', content: '' }
                          ]
                        }));
                      }}
                      className="text-[10px] font-bold text-mahindra-red px-2 py-1 border rounded-lg hover:bg-red-50"
                    >
                      + Add
                    </button>
                  </div>

                  <div className="space-y-2">
                    {(useBuilderStore.getState().page.meta?.attributes || []).filter((attr: any) => {
                      const isDefault = defaultMetaFields.some((field) => {
                        if (field.kind === 'name' && attr.name) {
                          return attr.name.toLowerCase() === field.key.toLowerCase();
                        }
                        if (field.kind === 'property' && attr.property) {
                          return attr.property.toLowerCase() === field.key.toLowerCase();
                        }
                        if (field.kind === 'httpEquiv' && attr.httpEquiv) {
                          return attr.httpEquiv.toLowerCase() === field.key.toLowerCase();
                        }
                        return false;
                      });
                      return !isDefault;
                    }).map((attr, filteredIndex) => {
                      const index = (useBuilderStore.getState().page.meta?.attributes || []).indexOf(attr);
                      return (
                      <div key={`meta-attr-${index}`} className="p-2 border rounded-xl space-y-2 bg-gray-50">
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="text"
                            value={attr.name || ''}
                            onChange={(e) => {
                              updatePageMeta((meta) => ({
                                ...meta,
                                attributes: (meta.attributes || []).map((item: any, i: number) =>
                                  i === index ? { ...item, name: e.target.value, property: '', httpEquiv: '' } : item
                                )
                              }));
                            }}
                            className="p-2 border rounded-lg text-xs"
                            placeholder="name"
                          />
                          <input
                            type="text"
                            value={attr.property || ''}
                            onChange={(e) => {
                              updatePageMeta((meta) => ({
                                ...meta,
                                attributes: (meta.attributes || []).map((item: any, i: number) =>
                                  i === index ? { ...item, property: e.target.value, name: '', httpEquiv: '' } : item
                                )
                              }));
                            }}
                            className="p-2 border rounded-lg text-xs"
                            placeholder="property"
                          />
                          <input
                            type="text"
                            value={attr.httpEquiv || ''}
                            onChange={(e) => {
                              updatePageMeta((meta) => ({
                                ...meta,
                                attributes: (meta.attributes || []).map((item: any, i: number) =>
                                  i === index ? { ...item, httpEquiv: e.target.value, name: '', property: '' } : item
                                )
                              }));
                            }}
                            className="p-2 border rounded-lg text-xs"
                            placeholder="httpEquiv"
                          />
                        </div>
                        <div className="flex gap-2">
                          {((attr.property || '').toLowerCase() === 'og:image' ||
                            (attr.name || '').toLowerCase() === 'twitter:image') ? (
                            <div className="flex-1">
                              <ImageUploadInput
                                value={attr.content || ''}
                                onChange={(value) => {
                                  updatePageMeta((meta) => ({
                                    ...meta,
                                    attributes: (meta.attributes || []).map((item: any, i: number) =>
                                      i === index ? { ...item, content: value } : item
                                    )
                                  }));
                                }}
                                placeholder="content"
                              />
                            </div>
                          ) : (
                            <input
                              type="text"
                              value={attr.content || ''}
                              onChange={(e) => {
                                updatePageMeta((meta) => ({
                                  ...meta,
                                  attributes: (meta.attributes || []).map((item: any, i: number) =>
                                    i === index ? { ...item, content: e.target.value } : item
                                  )
                                }));
                              }}
                              className="flex-1 p-2 border rounded-lg text-xs"
                              placeholder="content"
                            />
                          )}
                          <button
                            onClick={() => {
                              updatePageMeta((meta) => ({
                                ...meta,
                                attributes: (meta.attributes || []).filter((_: any, i: number) => i !== index)
                              }));
                            }}
                            className="text-xs px-2 py-1 border rounded-lg text-red-500 hover:bg-red-50"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-gray-500 uppercase px-1">Custom Link Tags</label>
                    <button
                      onClick={() => {
                        updatePageMeta((meta) => ({
                          ...meta,
                          links: [...(meta.links || []), { rel: '', href: '' }]
                        }));
                      }}
                      className="text-[10px] font-bold text-mahindra-red px-2 py-1 border rounded-lg hover:bg-red-50"
                    >
                      + Add
                    </button>
                  </div>

                  <div className="space-y-2">
                    {(useBuilderStore.getState().page.meta?.links || []).filter((link: any) => {
                      const isDefault = defaultLinkFields.some((field) => 
                        (link.rel || '').toLowerCase() === field.rel.toLowerCase()
                      );
                      return !isDefault;
                    }).map((link, filteredIndex) => {
                      const index = (useBuilderStore.getState().page.meta?.links || []).indexOf(link);
                      return (
                      <div key={`meta-link-${index}`} className="p-2 border rounded-xl space-y-2 bg-gray-50">
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={link.rel || ''}
                            onChange={(e) => {
                              updatePageMeta((meta) => ({
                                ...meta,
                                links: (meta.links || []).map((item: any, i: number) =>
                                  i === index ? { ...item, rel: e.target.value } : item
                                )
                              }));
                            }}
                            className="p-2 border rounded-lg text-xs"
                            placeholder="rel"
                          />
                          {isImageLinkField(link.rel || '') ? (
                            <ImageUploadInput
                              value={link.href || ''}
                              onChange={(value) => {
                                updatePageMeta((meta) => ({
                                  ...meta,
                                  links: (meta.links || []).map((item: any, i: number) =>
                                    i === index ? { ...item, href: value } : item
                                  )
                                }));
                              }}
                              placeholder="href"
                            />
                          ) : (
                            <input
                              type="text"
                              value={link.href || ''}
                              onChange={(e) => {
                                updatePageMeta((meta) => ({
                                  ...meta,
                                  links: (meta.links || []).map((item: any, i: number) =>
                                    i === index ? { ...item, href: e.target.value } : item
                                  )
                                }));
                              }}
                              className="p-2 border rounded-lg text-xs"
                              placeholder="href"
                            />
                          )}
                        </div>
                        <button
                          onClick={() => {
                            updatePageMeta((meta) => ({
                              ...meta,
                              links: (meta.links || []).filter((_: any, i: number) => i !== index)
                            }));
                          }}
                          className="text-xs px-2 py-1 border rounded-lg text-red-500 hover:bg-red-50"
                        >
                          Remove
                        </button>
                      </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <button
                onClick={() => {
                  resetHtmlWorkshop();
                  setHtmlWorkshopMode(true);
                }}
                className="w-full p-6 border-2 border-dashed border-blue-300 rounded-3xl text-[11px] font-black uppercase tracking-widest text-blue-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all flex flex-col items-center gap-4 bg-white shadow-sm hover:shadow-md"
              >
                <div className="p-4 bg-blue-100 rounded-2xl">
                  <Layout className="w-8 h-8" />
                </div>
                HTML Workshop
              </button>

              <div className="space-y-3">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest px-1">Manage Library</p>
                {customTemplates.length === 0 ? (
                  <div className="p-8 text-center bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
                    <p className="text-[10px] text-gray-400 font-bold">Your library is empty</p>
                  </div>
                ) : (
                  customTemplates.map((template) => (
                    <div key={template._id} className="group relative bg-white border rounded-2xl p-4 hover:border-mahindra-red transition-all shadow-sm hover:shadow-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-mahindra-blue/10 text-mahindra-blue rounded-lg">
                            <Layout className="w-4 h-4" />
                          </div>
                          <span className="text-[11px] font-bold text-gray-700 truncate max-w-[120px]">{template.name}</span>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              if (template.type === 'html-builder') {
                                loadHtmlDesign(template);
                                setHtmlWorkshopMode(true);
                              } else if (template.content.originalElements) {
                                useWorkshopStore.getState().loadDesign(template.content.originalElements, template._id);
                                setWorkshopMode(true);
                              } else {
                                alert('This template is from an older version and cannot be re-edited.');
                              }
                            }}
                            className="p-1.5 hover:bg-mahindra-blue hover:text-white rounded-md text-mahindra-blue transition-all"
                            title="Edit Design"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => removeCustomTemplate(template._id)}
                            className="p-1.5 hover:bg-red-500 hover:text-white rounded-md text-red-400 transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
