import React, { useState, useEffect } from 'react';
import { useBuilderStore } from '../../store/useBuilderStore';
import { 
  X, Save, Trash2, Layout, ChevronDown, ChevronRight, Eye, Monitor, Tablet, Smartphone, Upload, 
  Image as ImageIcon, Type, Palette, Maximize2, Move, Layers, Square, AlignCenter, AlignLeft, 
  AlignRight, AlignJustify, Box, Settings2, Sliders, Type as TextIcon, Move as MoveIcon, 
  Maximize2 as SizeIcon, Square as BorderIcon 
} from 'lucide-react';
import HtmlBuilderSection from '../sections/custom/HtmlBuilderSection';
import { cn } from '../../lib/utils';
import api from '../../lib/api';
import { parseHtmlCssToWorkshopSection } from '../../lib/htmlImport';

const LayerNode: React.FC<{ el: any, level: number }> = ({ el, level }) => {
  const { selectedHtmlElementId, setSelectedHtmlElement } = useBuilderStore();
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = el.children && el.children.length > 0;

  return (
    <div>
      <div 
        onClick={() => setSelectedHtmlElement(el.id)}
        className={`flex items-center py-1.5 text-[10px] font-bold cursor-pointer rounded transition-colors ${selectedHtmlElementId === el.id ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
        style={{ paddingLeft: `${(level * 12) + 8}px`, paddingRight: '8px' }}
      >
        {hasChildren ? (
          <button 
            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
            className="w-4 h-4 flex items-center justify-center mr-1 hover:bg-blue-200/50 rounded transition-colors"
          >
            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
        ) : (
          <span className="w-4 mr-1 inline-block" />
        )}
        <span className="truncate">{el.type.charAt(0).toUpperCase() + el.type.slice(1)} {el.id === 'root-container' ? '(Root)' : ''}</span>
      </div>
      {hasChildren && isExpanded && (
        <LayerTree elements={el.children} level={level + 1} />
      )}
    </div>
  );
};

const LayerTree: React.FC<{ elements: any[], level: number }> = ({ elements, level }) => {
  return (
    <div className="space-y-[2px]">
      {elements.map(el => (
        <LayerNode key={el.id} el={el} level={level} />
      ))}
    </div>
  );
};

const HtmlWorkshop: React.FC = () => {
  const { 
    htmlWorkshopSection, 
    selectedHtmlElementId, 
    setSelectedHtmlElement,
    setHtmlWorkshopMode,
    addWorkshopHtmlElement,
    updateWorkshopHtmlElement,
    removeWorkshopHtmlElement,
    saveCustomTemplate,
    htmlWorkshopTemplateId,
    htmlWorkshopTemplateName,
    setView: setStoreView
  } = useBuilderStore();

  const [name, setName] = useState(htmlWorkshopTemplateName || '');

  useEffect(() => {
    if (htmlWorkshopTemplateName) {
      setName(htmlWorkshopTemplateName);
    }
  }, [htmlWorkshopTemplateName]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importHtml, setImportHtml] = useState('');
  const [importCss, setImportCss] = useState('');
  const [importError, setImportError] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const { view, setView } = useBuilderStore();
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedHtmlElement) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('image', file);

      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const urlWithCacheBuster = `${res.data.url}?t=${Date.now()}`;
      updateWorkshopHtmlElement(selectedHtmlElement.id, { content: urlWithCacheBuster });
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!htmlWorkshopSection) return null;

  const handleSave = async () => {
    if (!name.trim()) return;
    await saveCustomTemplate(htmlWorkshopSection, name, htmlWorkshopTemplateId, 'html-builder');
    setShowSaveDialog(false);
  };

  const handleImport = () => {
    if (!importHtml.trim()) {
      setImportError('Paste HTML markup first.');
      return;
    }

    try {
      setIsImporting(true);
      const parsed = parseHtmlCssToWorkshopSection(importHtml, importCss);
      useBuilderStore.setState({
        htmlWorkshopSection: {
          ...(htmlWorkshopSection || { type: 'html-builder', content: { elements: [] }, styles: {} }),
          content: { elements: parsed.elements },
          styles: parsed.styles,
        },
        selectedHtmlElementId: 'root-container'
      });
      setSelectedHtmlElement('root-container');
      setImportError('');
      setShowImportDialog(false);
    } catch (error) {
      console.error('Failed to import HTML/CSS', error);
      setImportError('Could not parse the provided HTML/CSS.');
    } finally {
      setIsImporting(false);
    }
  };

  const findHtmlElement = (elements: any[], id: string): any => {
    for (const el of elements) {
      if (el.id === id) return el;
      if (el.children) {
        const found = findHtmlElement(el.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const selectedHtmlElement = selectedHtmlElementId 
    ? findHtmlElement(htmlWorkshopSection.content.elements || [], selectedHtmlElementId) 
    : null;

  const activeStyles = selectedHtmlElement ? (
    view === 'mobile' ? (selectedHtmlElement.mobileStyles || {}) :
    view === 'tablet' ? (selectedHtmlElement.tabletStyles || {}) :
    (selectedHtmlElement.styles || {})
  ) : {};

  return (
    <div className="fixed inset-0 z-[100] bg-gray-100 flex flex-col font-sans">
      {/* Header */}
      <header className="h-14 bg-white border-b flex items-center justify-between px-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-mahindra-red/10 text-mahindra-red rounded-lg">
            <Layout className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-black text-sm tracking-tight text-gray-800 uppercase">HTML Workshop</h1>
            <p className="text-[10px] text-gray-400 font-bold">Design your structural blocks</p>
          </div>
        </div>

        {/* Preview / Device Controls */}
        <div className="flex items-center gap-4 select-none">
          <div className="flex bg-gray-100 p-1 rounded-xl gap-1 border border-gray-200 shadow-inner">
            <button
              onClick={() => setIsPreviewMode(false)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg transition-all text-[10px] font-black uppercase tracking-wider select-none ${
                !isPreviewMode ? 'bg-white shadow text-mahindra-red' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
              Edit
            </button>
            <button
              onClick={() => setIsPreviewMode(true)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg transition-all text-[10px] font-black uppercase tracking-wider select-none ${
                isPreviewMode ? 'bg-white shadow text-mahindra-red' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Preview
            </button>
          </div>

          <div className="h-5 w-px bg-gray-200" />

          <div className="flex bg-gray-100 p-1 rounded-xl gap-1 border border-gray-200 shadow-inner">
            <button
              onClick={() => { setView('desktop'); setStoreView('desktop'); }}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg transition-all text-[10px] font-black uppercase tracking-wider select-none ${
                view === 'desktop' ? 'bg-white shadow text-mahindra-red' : 'text-gray-500 hover:text-gray-900'
              }`}
              title="Desktop View (1024px)"
            >
              <Monitor className="w-3.5 h-3.5" />
              Desktop
            </button>
            <button
              onClick={() => { setView('tablet'); setStoreView('tablet'); }}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg transition-all text-[10px] font-black uppercase tracking-wider select-none ${
                view === 'tablet' ? 'bg-white shadow text-mahindra-red' : 'text-gray-500 hover:text-gray-900'
              }`}
              title="Tablet View (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
              Tablet
            </button>
            <button
              onClick={() => { setView('mobile'); setStoreView('mobile'); }}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg transition-all text-[10px] font-black uppercase tracking-wider select-none ${
                view === 'mobile' ? 'bg-white shadow text-mahindra-red' : 'text-gray-500 hover:text-gray-900'
              }`}
              title="Mobile View (400px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              Mobile
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowImportDialog(true)}
            className="flex items-center gap-2 px-4 py-2 border border-mahindra-red/20 text-mahindra-red text-xs font-black uppercase tracking-widest rounded-xl hover:bg-red-50 transition-all"
          >
            Import HTML/CSS
          </button>
          <button
            onClick={() => setShowSaveDialog(true)}
            className="flex items-center gap-2 px-6 py-2 bg-mahindra-red text-white text-xs font-black uppercase tracking-widest rounded-xl hover:brightness-110 transition-all shadow-md"
          >
            <Save className="w-4 h-4" />
            Save Design
          </button>
          <button
            onClick={() => setHtmlWorkshopMode(false)}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        {!isPreviewMode && (
          <aside className="w-64 bg-white border-r flex flex-col shadow-lg z-10">
            <div className="p-4 border-b bg-gray-50/50">
              <h2 className="font-black text-[10px] text-gray-400 uppercase tracking-widest">Add Elements</h2>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {['div', 'heading', 'paragraph', 'image', 'button'].map(type => (
                  <button
                    key={type}
                    onClick={() => addWorkshopHtmlElement(selectedHtmlElementId || 'root-container', type as any)}
                    className="p-3 bg-gray-50 border rounded-xl hover:border-mahindra-red hover:text-mahindra-red transition-all text-[10px] font-bold uppercase"
                  >
                    + {type}
                  </button>
                ))}
              </div>
              
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-6 pt-4 border-t">Selected Element</p>
              {selectedHtmlElementId ? (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex justify-between items-center group">
                  <span className="text-[10px] font-bold text-blue-700 truncate w-32">ID: {selectedHtmlElementId}</span>
                  {selectedHtmlElementId !== 'root-container' && (
                    <button 
                      onClick={() => removeWorkshopHtmlElement(selectedHtmlElementId)}
                      className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete Element"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-[10px] text-gray-400 font-bold p-3 bg-gray-50 rounded-xl border border-dashed">Select an element on canvas</p>
              )}

              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-6 pt-4 border-t">Layers</p>
              <div className="bg-gray-50 border rounded-xl p-2 max-h-64 overflow-y-auto">
                <LayerTree elements={htmlWorkshopSection.content.elements || []} level={0} />
              </div>
            </div>
          </aside>
        )}

        {/* Main Canvas Area */}
        <main className="flex-1 bg-gray-200 overflow-auto flex justify-center p-8 relative">
          <div 
            className={cn(
              "bg-white shadow-2xl min-h-[calc(100vh-8rem)] transition-all duration-500 rounded-xl relative border border-gray-100 mx-auto",
              view === 'desktop' ? "w-[1280px]" : 
              view === 'tablet' ? "w-[768px]" : 
              "w-[400px]"
            )}
          >
            <HtmlBuilderSection 
              content={htmlWorkshopSection.content} 
              styles={htmlWorkshopSection.styles}
              isEditing={!isPreviewMode} 
              view={view}
            />
          </div>
        </main>

        {/* Right Sidebar (Styles) */}
        {!isPreviewMode && (
          <aside className="w-80 bg-white border-l flex flex-col shadow-xl z-10 overflow-y-auto custom-scrollbar">
          <div className="p-4 border-b bg-gray-50/50 flex justify-between items-center sticky top-0 bg-white z-20">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-mahindra-red/10 rounded-lg text-mahindra-red">
                <Settings2 className="w-4 h-4" />
              </div>
              <h2 className="font-black text-sm tracking-tighter text-mahindra-blue uppercase">Element Settings</h2>
            </div>
            {selectedHtmlElementId && selectedHtmlElementId !== 'root-container' && (
              <button 
                onClick={() => removeWorkshopHtmlElement(selectedHtmlElementId)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                title="Delete Element"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {selectedHtmlElement ? (
            <div className="p-4 space-y-10 pb-20">
              {/* Info Card */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Layers className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Component</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-mahindra-blue capitalize">{selectedHtmlElement.type}</span>
                  <span className="text-[9px] font-mono text-gray-400 bg-white px-2 py-1 rounded-lg border border-gray-100 shadow-inner">ID: {selectedHtmlElement.id.slice(0, 8)}</span>
                </div>
              </div>

              {/* Content Field if applicable */}
              {['heading', 'paragraph', 'button', 'image'].includes(selectedHtmlElement.type) && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-gray-50 pb-2">
                    <div className="w-6 h-6 bg-blue-50 rounded-lg flex items-center justify-center">
                      <TextIcon className="w-3.5 h-3.5 text-blue-500" />
                    </div>
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Content & Media</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">
                        {selectedHtmlElement.type === 'image' ? 'Source URL' : 'Display Text'}
                      </label>
                      {selectedHtmlElement.type === 'image' && (
                        <label className="flex items-center gap-1.5 text-[10px] font-black text-mahindra-red uppercase cursor-pointer hover:scale-105 transition-transform active:scale-95">
                          <Upload className="w-3 h-3" />
                          {isUploading ? 'Uploading...' : 'Upload Image'}
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                        </label>
                      )}
                    </div>
                    <textarea
                      value={selectedHtmlElement.content}
                      onChange={(e) => updateWorkshopHtmlElement(selectedHtmlElement.id, { content: e.target.value })}
                      placeholder={selectedHtmlElement.type === 'image' ? "Paste image URL or upload..." : "Enter text here..."}
                      className="w-full p-4 text-xs border border-gray-100 rounded-2xl focus:border-mahindra-red focus:ring-4 focus:ring-mahindra-red/5 outline-none min-h-[100px] bg-gray-50/50 transition-all font-medium"
                    />
                  </div>

                  {selectedHtmlElement.type === 'image' && (
                    <div className="bg-mahindra-red/5 p-4 rounded-2xl border border-mahindra-red/10 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            id="isBgToggle"
                            checked={activeStyles.isBackground === 'true'}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updateWorkshopHtmlElement(selectedHtmlElement.id, { 
                                  styles: { 
                                    isBackground: 'true',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: activeStyles.width || '100%',
                                    minHeight: activeStyles.minHeight || '400px'
                                  } 
                                });
                              } else {
                                updateWorkshopHtmlElement(selectedHtmlElement.id, { 
                                  styles: { isBackground: '', display: '', flexDirection: '', alignItems: '', justifyContent: '', minHeight: '' } 
                                });
                              }
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-mahindra-red"></div>
                          <label htmlFor="isBgToggle" className="ml-3 text-[10px] font-bold text-gray-700 uppercase cursor-pointer">Use as Background</label>
                        </div>
                      </div>
                      
                      {activeStyles.isBackground === 'true' && (
                        <div className="grid grid-cols-2 gap-3 pt-2">
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-gray-400 uppercase">Cover Style</label>
                            <select value={activeStyles.backgroundSize || 'cover'} onChange={(e) => updateWorkshopHtmlElement(selectedHtmlElement.id, { styles: { backgroundSize: e.target.value } })} className="w-full p-2.5 text-[11px] border border-gray-100 rounded-xl bg-white shadow-sm outline-none focus:border-mahindra-red transition-all">
                              <option value="cover">Fill Area (Cover)</option>
                              <option value="contain">Fit Image (Contain)</option>
                              <option value="100% 100%">Stretch to Size</option>
                              <option value="auto">Original Size</option>
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-gray-400 uppercase">Focus Point</label>
                            <select value={activeStyles.backgroundPosition || 'center'} onChange={(e) => updateWorkshopHtmlElement(selectedHtmlElement.id, { styles: { backgroundPosition: e.target.value } })} className="w-full p-2.5 text-[11px] border border-gray-100 rounded-xl bg-white shadow-sm outline-none focus:border-mahindra-red transition-all">
                              <option value="center">Center</option>
                              <option value="top">Top Edge</option>
                              <option value="bottom">Bottom Edge</option>
                              <option value="left">Left Side</option>
                              <option value="right">Right Side</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {/* Layout & Alignment */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-50 pb-2">
                  <div className="w-6 h-6 bg-purple-50 rounded-lg flex items-center justify-center">
                    <MoveIcon className="w-3.5 h-3.5 text-purple-500" />
                  </div>
                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Layout & Arrangement</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Display Mode</label>
                    <select 
                      value={activeStyles.display || 'block'}
                      onChange={(e) => updateWorkshopHtmlElement(selectedHtmlElement.id, { styles: { display: e.target.value } })}
                      className="w-full p-3 text-[11px] border border-gray-100 rounded-2xl bg-gray-50/50 focus:bg-white focus:border-mahindra-red outline-none transition-all"
                    >
                      <option value="block">Full Width (Block)</option>
                      <option value="flex">Container (Flex)</option>
                      <option value="inline-block">Shrink Wrap (Inline)</option>
                      <option value="none">Hidden</option>
                    </select>
                  </div>
                  {activeStyles.display === 'flex' && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Direction</label>
                      <select 
                        value={activeStyles.flexDirection || 'row'}
                        onChange={(e) => updateWorkshopHtmlElement(selectedHtmlElement.id, { styles: { flexDirection: e.target.value } })}
                        className="w-full p-3 text-[11px] border border-gray-100 rounded-2xl bg-gray-50/50 focus:bg-white focus:border-mahindra-red outline-none transition-all"
                      >
                        <option value="row">Horizontal (Row)</option>
                        <option value="column">Vertical (Column)</option>
                      </select>
                    </div>
                  )}
                  {activeStyles.display === 'flex' && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Align Items</label>
                      <select 
                        value={activeStyles.alignItems || 'stretch'}
                        onChange={(e) => updateWorkshopHtmlElement(selectedHtmlElement.id, { styles: { alignItems: e.target.value } })}
                        className="w-full p-3 text-[11px] border border-gray-100 rounded-2xl bg-gray-50/50 focus:bg-white focus:border-mahindra-red outline-none transition-all"
                      >
                        <option value="stretch">Fill Height</option>
                        <option value="center">Center</option>
                        <option value="flex-start">Start</option>
                        <option value="flex-end">End</option>
                      </select>
                    </div>
                  )}
                  {activeStyles.display === 'flex' && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Justify Content</label>
                      <select 
                        value={activeStyles.justifyContent || 'flex-start'}
                        onChange={(e) => updateWorkshopHtmlElement(selectedHtmlElement.id, { styles: { justifyContent: e.target.value } })}
                        className="w-full p-3 text-[11px] border border-gray-100 rounded-2xl bg-gray-50/50 focus:bg-white focus:border-mahindra-red outline-none transition-all"
                      >
                        <option value="flex-start">Start</option>
                        <option value="center">Center</option>
                        <option value="flex-end">End</option>
                        <option value="space-between">Max Spacing</option>
                        <option value="space-around">Even Spacing</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Positioning (Except Root) */}
              {selectedHtmlElement.id !== 'root-container' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-gray-50 pb-2">
                    <div className="w-6 h-6 bg-orange-50 rounded-lg flex items-center justify-center">
                      <Sliders className="w-3.5 h-3.5 text-orange-500" />
                    </div>
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Positioning & Floating</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5 col-span-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Position Type</label>
                      <select 
                        value={activeStyles.position || 'static'}
                        onChange={(e) => updateWorkshopHtmlElement(selectedHtmlElement.id, { styles: { position: e.target.value } })}
                        className="w-full p-3 text-[11px] border border-gray-100 rounded-2xl bg-gray-50/50 focus:bg-white focus:border-mahindra-red outline-none transition-all"
                      >
                        <option value="static">Default (Flow)</option>
                        <option value="relative">Relative to Self</option>
                        <option value="absolute">Floating (Overlay)</option>
                        <option value="fixed">Sticky to Screen</option>
                        <option value="sticky">Sticky to Section</option>
                      </select>
                    </div>
                    {['relative', 'absolute', 'fixed', 'sticky'].includes(activeStyles.position) && (
                      <>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-gray-400 uppercase">Top Offset</label>
                          <input type="text" value={activeStyles.top || ''} onChange={(e) => updateWorkshopHtmlElement(selectedHtmlElement.id, { styles: { top: e.target.value } })} className="w-full p-3 text-xs border border-gray-100 rounded-2xl bg-gray-50/50 focus:bg-white outline-none" placeholder="auto" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-gray-400 uppercase">Right Offset</label>
                          <input type="text" value={activeStyles.right || ''} onChange={(e) => updateWorkshopHtmlElement(selectedHtmlElement.id, { styles: { right: e.target.value } })} className="w-full p-3 text-xs border border-gray-100 rounded-2xl bg-gray-50/50 focus:bg-white outline-none" placeholder="auto" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-gray-400 uppercase">Bottom Offset</label>
                          <input type="text" value={activeStyles.bottom || ''} onChange={(e) => updateWorkshopHtmlElement(selectedHtmlElement.id, { styles: { bottom: e.target.value } })} className="w-full p-3 text-xs border border-gray-100 rounded-2xl bg-gray-50/50 focus:bg-white outline-none" placeholder="auto" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-gray-400 uppercase">Left Offset</label>
                          <input type="text" value={activeStyles.left || ''} onChange={(e) => updateWorkshopHtmlElement(selectedHtmlElement.id, { styles: { left: e.target.value } })} className="w-full p-3 text-xs border border-gray-100 rounded-2xl bg-gray-50/50 focus:bg-white outline-none" placeholder="auto" />
                        </div>
                        <div className="space-y-1.5 col-span-2">
                          <label className="text-[9px] font-bold text-gray-400 uppercase">Layer Priority (Z-Index)</label>
                          <input type="number" value={activeStyles.zIndex ?? ''} onChange={(e) => updateWorkshopHtmlElement(selectedHtmlElement.id, { styles: { zIndex: e.target.value } })} className="w-full p-3 text-xs border border-gray-100 rounded-2xl bg-gray-50/50 focus:bg-white outline-none" placeholder="Default (0)" />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Dimensions */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-50 pb-2">
                  <div className="w-6 h-6 bg-green-50 rounded-lg flex items-center justify-center">
                    <SizeIcon className="w-3.5 h-3.5 text-green-500" />
                  </div>
                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Sizing & Dimensions</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Width</label>
                    <input type="text" value={activeStyles.width || ''} onChange={(e) => updateWorkshopHtmlElement(selectedHtmlElement.id, { styles: { width: e.target.value } })} className="w-full p-3 text-xs border border-gray-100 rounded-2xl bg-gray-50/50 focus:bg-white outline-none" placeholder="auto, 100%" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Height</label>
                    <input type="text" value={activeStyles.height || ''} onChange={(e) => updateWorkshopHtmlElement(selectedHtmlElement.id, { styles: { height: e.target.value } })} className="w-full p-3 text-xs border border-gray-100 rounded-2xl bg-gray-50/50 focus:bg-white outline-none" placeholder="auto, 200px" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Min Height</label>
                    <input type="text" value={activeStyles.minHeight || ''} onChange={(e) => updateWorkshopHtmlElement(selectedHtmlElement.id, { styles: { minHeight: e.target.value } })} className="w-full p-3 text-xs border border-gray-100 rounded-2xl bg-gray-50/50 focus:bg-white outline-none" placeholder="None" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Overflow</label>
                    <select 
                      value={activeStyles.overflow || 'visible'}
                      onChange={(e) => updateWorkshopHtmlElement(selectedHtmlElement.id, { styles: { overflow: e.target.value } })}
                      className="w-full p-3 text-[11px] border border-gray-100 rounded-2xl bg-gray-50/50 focus:bg-white outline-none"
                    >
                      <option value="visible">Show Overflow</option>
                      <option value="hidden">Hide Overflow</option>
                      <option value="auto">Auto Scroll</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Spacing Overhaul */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-50 pb-2">
                  <div className="w-6 h-6 bg-pink-50 rounded-lg flex items-center justify-center">
                    <Box className="w-3.5 h-3.5 text-pink-500" />
                  </div>
                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Spacing & Margins</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-3xl space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Inner Space (Padding)</label>
                      <input type="text" value={activeStyles.padding || ''} onChange={(e) => updateWorkshopHtmlElement(selectedHtmlElement.id, { styles: { padding: e.target.value } })} className="w-20 p-2 text-center text-xs border border-gray-200 rounded-xl bg-white shadow-sm" placeholder="All Sides" />
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {['Top', 'Right', 'Bottom', 'Left'].map(side => (
                        <div key={side} className="space-y-1">
                          <input 
                            type="text" 
                            value={activeStyles[`padding${side}`] || ''} 
                            onChange={(e) => updateWorkshopHtmlElement(selectedHtmlElement.id, { styles: { [`padding${side}`]: e.target.value } })} 
                            className="w-full p-2 text-center text-[10px] border border-gray-100 rounded-lg bg-white shadow-inner" 
                            placeholder={side.charAt(0)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Outer Space (Margin)</label>
                      <input type="text" value={activeStyles.margin || ''} onChange={(e) => updateWorkshopHtmlElement(selectedHtmlElement.id, { styles: { margin: e.target.value } })} className="w-20 p-2 text-center text-xs border border-gray-200 rounded-xl bg-white shadow-sm" placeholder="All Sides" />
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {['Top', 'Right', 'Bottom', 'Left'].map(side => (
                        <div key={side} className="space-y-1">
                          <input 
                            type="text" 
                            value={activeStyles[`margin${side}`] || ''} 
                            onChange={(e) => updateWorkshopHtmlElement(selectedHtmlElement.id, { styles: { [`margin${side}`]: e.target.value } })} 
                            className="w-full p-2 text-center text-[10px] border border-gray-100 rounded-lg bg-white shadow-inner" 
                            placeholder={side.charAt(0)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Visuals Overhaul */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-50 pb-2">
                  <div className="w-6 h-6 bg-mahindra-red/10 rounded-lg flex items-center justify-center">
                    <Palette className="w-3.5 h-3.5 text-mahindra-red" />
                  </div>
                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Colors & Visuals</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Text Color</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={activeStyles.color?.startsWith('#') ? activeStyles.color : '#000000'} onChange={(e) => updateWorkshopHtmlElement(selectedHtmlElement.id, { styles: { color: e.target.value } })} className="w-8 h-8 rounded-full border-0 p-0 overflow-hidden cursor-pointer shadow-sm" />
                      <input type="text" value={activeStyles.color || ''} onChange={(e) => updateWorkshopHtmlElement(selectedHtmlElement.id, { styles: { color: e.target.value } })} className="flex-1 p-2.5 text-xs border border-gray-100 rounded-xl bg-gray-50/50 outline-none" placeholder="#000000" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">BG Color</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={activeStyles.backgroundColor?.startsWith('#') ? activeStyles.backgroundColor : '#ffffff'} onChange={(e) => updateWorkshopHtmlElement(selectedHtmlElement.id, { styles: { backgroundColor: e.target.value } })} className="w-8 h-8 rounded-full border-0 p-0 overflow-hidden cursor-pointer shadow-sm" />
                      <input type="text" value={activeStyles.backgroundColor || ''} onChange={(e) => updateWorkshopHtmlElement(selectedHtmlElement.id, { styles: { backgroundColor: e.target.value } })} className="flex-1 p-2.5 text-xs border border-gray-100 rounded-xl bg-gray-50/50 outline-none" placeholder="#ffffff" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Typography Overhaul */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-50 pb-2">
                  <div className="w-6 h-6 bg-indigo-50 rounded-lg flex items-center justify-center">
                    <AlignJustify className="w-3.5 h-3.5 text-indigo-500" />
                  </div>
                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Text & Typography</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Text Size</label>
                    <input type="text" value={activeStyles.fontSize || ''} onChange={(e) => updateWorkshopHtmlElement(selectedHtmlElement.id, { styles: { fontSize: e.target.value } })} className="w-full p-3 text-xs border border-gray-100 rounded-2xl bg-gray-50/50 focus:bg-white outline-none" placeholder="16px" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Weight</label>
                    <input type="text" value={activeStyles.fontWeight || ''} onChange={(e) => updateWorkshopHtmlElement(selectedHtmlElement.id, { styles: { fontWeight: e.target.value } })} className="w-full p-3 text-xs border border-gray-100 rounded-2xl bg-gray-50/50 focus:bg-white outline-none" placeholder="600" />
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">Text Alignment</label>
                    <div className="flex bg-gray-100 p-1 rounded-2xl gap-1 border border-gray-200">
                      {[
                        { val: 'left', icon: AlignLeft },
                        { val: 'center', icon: AlignCenter },
                        { val: 'right', icon: AlignRight },
                        { val: 'justify', icon: AlignJustify }
                      ].map(item => (
                        <button
                          key={item.val}
                          onClick={() => updateWorkshopHtmlElement(selectedHtmlElement.id, { styles: { textAlign: item.val } })}
                          className={cn(
                            "flex-1 flex justify-center py-2 rounded-xl transition-all",
                            activeStyles.textAlign === item.val ? "bg-white shadow text-mahindra-red" : "text-gray-400 hover:text-gray-600"
                          )}
                        >
                          <item.icon className="w-4 h-4" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Borders Overhaul */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-50 pb-2">
                  <div className="w-6 h-6 bg-teal-50 rounded-lg flex items-center justify-center">
                    <BorderIcon className="w-3.5 h-3.5 text-teal-500" />
                  </div>
                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Borders & Corners</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Corner Rounding</label>
                    <input type="text" value={activeStyles.borderRadius || ''} onChange={(e) => updateWorkshopHtmlElement(selectedHtmlElement.id, { styles: { borderRadius: e.target.value } })} className="w-full p-3 text-xs border border-gray-100 rounded-2xl bg-gray-50/50 focus:bg-white outline-none" placeholder="12px" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Border Style</label>
                    <input type="text" value={activeStyles.border || ''} onChange={(e) => updateWorkshopHtmlElement(selectedHtmlElement.id, { styles: { border: e.target.value } })} className="w-full p-3 text-xs border border-gray-100 rounded-2xl bg-gray-50/50 focus:bg-white outline-none" placeholder="1px solid #eee" />
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-300">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 border-2 border-dashed border-gray-100">
                <Settings2 className="w-8 h-8 opacity-20" />
              </div>
              <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">No Selection</p>
              <p className="text-[10px] font-bold mt-2 text-gray-300">Select a component on the canvas to customize its appearance</p>
            </div>
          )}
        </aside>
        )}
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl w-96 shadow-2xl">
            <h3 className="text-lg font-black tracking-tight text-gray-800 mb-4">Save HTML Block</h3>
            <input
              type="text"
              placeholder="e.g., Fancy Header"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border rounded-xl mb-4 focus:border-mahindra-red focus:ring-1 focus:ring-mahindra-red outline-none text-sm"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg text-sm font-bold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!name.trim()}
                className="px-4 py-2 bg-mahindra-red text-white rounded-lg text-sm font-bold disabled:opacity-50 hover:brightness-110 transition-all"
              >
                Save to Library
              </button>
            </div>
          </div>
        </div>
      )}

      {showImportDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[210] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-auto border border-gray-100">
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
              <div>
                <h3 className="text-lg font-black tracking-tight text-gray-800">Import HTML / CSS</h3>
                <p className="text-[11px] text-gray-500 font-medium">Scripts are stripped. Basic forms, labels, inputs, selects and buttons are supported.</p>
              </div>
              <button
                onClick={() => setShowImportDialog(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">HTML</label>
                  <textarea
                    value={importHtml}
                    onChange={(e) => setImportHtml(e.target.value)}
                    placeholder="Paste your HTML form or landing page markup here..."
                    className="w-full min-h-[420px] p-4 text-sm font-mono border rounded-2xl focus:border-mahindra-red focus:ring-2 focus:ring-mahindra-red/10 outline-none bg-gray-50/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">CSS</label>
                  <textarea
                    value={importCss}
                    onChange={(e) => setImportCss(e.target.value)}
                    placeholder="Paste any CSS you want to apply to the imported markup..."
                    className="w-full min-h-[420px] p-4 text-sm font-mono border rounded-2xl focus:border-mahindra-red focus:ring-2 focus:ring-mahindra-red/10 outline-none bg-gray-50/50"
                  />
                </div>
              </div>

              {importError && (
                <p className="text-sm text-red-600 font-medium bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  {importError}
                </p>
              )}

              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={() => setShowImportDialog(false)}
                  className="px-5 py-3 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={isImporting}
                  className="px-5 py-3 rounded-xl text-sm font-black uppercase tracking-widest bg-mahindra-red text-white hover:brightness-110 transition-all disabled:opacity-60"
                >
                  {isImporting ? 'Importing...' : 'Import into Workshop'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HtmlWorkshop;
