import React from 'react';
import { useBuilderStore } from '../../store/useBuilderStore';
import { Palette, Trash2, Layout, Plus, CheckCircle, Package, Globe, Settings, Map as MapIcon, ChevronDown, ChevronUp, Image as ImageIcon, Cpu, Users, FileText, Play as PlayIcon, ChevronRight, Link as LinkIcon, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import ImageUploadInput from '../ui/ImageUploadInput';
import VideoUploadInput from '../ui/VideoUploadInput';
import StylePlate from './StylePlate';
import { useWorkshopStore } from '../../store/useWorkshopStore';

interface PropertyEditorProps {
  showStylePanel: boolean;
  setShowStylePanel: (show: boolean) => void;
  activeColorPicker: string | null;
  setActiveColorPicker: (val: string | null) => void;
}

const PropertyEditor: React.FC<PropertyEditorProps> = ({ 
  showStylePanel, 
  setShowStylePanel,
  activeColorPicker,
  setActiveColorPicker
}) => {
  const formatFieldLabel = (rawKey: string) => rawKey
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const page = useBuilderStore((state) => state.page);
  const selectedSectionId = useBuilderStore((state) => state.selectedSectionId);
  const setSelectedSection = useBuilderStore((state) => state.setSelectedSection);
  const updateSectionContent = useBuilderStore((state) => state.updateSectionContent);
  const updateSectionStyles = useBuilderStore((state) => state.updateSectionStyles);
  const removeSection = useBuilderStore((state) => state.removeSection);
  const setWorkshopMode = useBuilderStore((state) => state.setWorkshopMode);
  const setHtmlWorkshopMode = useBuilderStore((state) => state.setHtmlWorkshopMode);
  const loadHtmlDesign = useBuilderStore((state) => state.loadHtmlDesign);

  const selectedSection = page.sections.find(s => s.id === selectedSectionId);

  // HTML Import modal state
  const [showHtmlImport, setShowHtmlImport] = React.useState(false);
  const [htmlImportCode, setHtmlImportCode] = React.useState('');

  if (!selectedSection) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
          <Settings className="w-8 h-8 opacity-20" />
        </div>
        <p className="text-xs font-bold uppercase tracking-widest">Select a section to edit</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Access for Fixed Sections */}
      <div className="p-3 bg-gray-50 border rounded-2xl space-y-2 mb-2">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Fixed Sections</p>
        <div className="flex gap-2">
          {page.sections.filter(s => ['navbar', 'hero', 'thank-you'].includes(s.type)).map(s => (
            <button 
              key={s.id}
              onClick={() => setSelectedSection(s.id)}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-tight transition-all border",
                selectedSectionId === s.id 
                  ? "bg-mahindra-red text-white border-mahindra-red shadow-lg shadow-red-200" 
                  : "bg-white text-gray-500 border-gray-100 hover:border-mahindra-red/30 hover:text-mahindra-red"
              )}
            >
              {s.type}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between sticky top-0 bg-white pb-4 z-10 border-b mb-4 pt-2">
          <h3 className="font-black uppercase text-[10px] text-gray-400 tracking-widest">{selectedSection.type}</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setShowStylePanel(!showStylePanel)}
              className={cn("p-2 rounded-full transition-all", showStylePanel ? "bg-mahindra-red text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}
              title="Styles"
            >
              <Palette className="w-4 h-4" />
            </button>
            <button
              onClick={() => selectedSection.type !== 'thank-you' && removeSection(selectedSection.id)}
              disabled={selectedSection.type === 'thank-you'}
              className={cn(
                "p-2 rounded-full transition-all",
                selectedSection.type === 'thank-you'
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-red-500 hover:bg-red-50"
              )}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {showStylePanel && (
          <div className="p-4 bg-gray-50 border rounded-xl space-y-4 animate-in fade-in slide-in-from-top-2">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Visual Styling</p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'backgroundColor', label: 'Background', default: '#ffffff' },
                { key: 'textColor', label: 'Body Text', default: '#333333' },
                { key: 'headingColor', label: 'Headings', default: '#000000' },
                { key: 'primaryColor', label: 'Primary', default: '#ed1c24' },
                { key: 'accentColor', label: 'Accent', default: '#ed1c24' },
                { key: 'borderColor', label: 'Borders', default: '#e5e7eb' },
              ].map((item) => (
                <div key={item.key} className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-500 uppercase block">{item.label}</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={(selectedSection.styles as any)?.[item.key] || item.default} 
                      onChange={(e) => updateSectionStyles(selectedSection.id, { [item.key]: e.target.value })} 
                      className="w-6 h-6 rounded-full cursor-pointer border-2 border-white shadow-sm overflow-hidden" 
                    />
                    <span className="text-[8px] text-gray-400 font-mono uppercase">{(selectedSection.styles as any)?.[item.key] || item.default}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedSection.type === 'html-builder' ? (
          <div className="space-y-4 pb-10">
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
              <p className="text-xs text-blue-800 mb-3">HTML Builder sections are edited in an isolated workspace. To make changes to the layout or styling, open it in the HTML Workshop.</p>
              <button
                onClick={() => {
                  loadHtmlDesign(selectedSection, selectedSection.id);
                  setHtmlWorkshopMode(true);
                }}
                className="w-full p-3 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-all shadow-sm"
              >
                Open in HTML Workshop
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pb-10">
            {Object.keys(selectedSection.content)
              .concat(
                selectedSection?.type === 'hero' 
                  ? ['formTitle', 'formFields'].filter(k => !Object.keys(selectedSection.content).includes(k)) 
                  : selectedSection?.type === 'navbar'
                    ? ['logoImage', 'links'].filter(k => !Object.keys(selectedSection.content).includes(k))
                    : selectedSection?.type === 'case-studies'
                      ? ['readStoryText'].filter(k => !Object.keys(selectedSection.content).includes(k))
                    : []
              )
              .filter(key => {
                if (selectedSection?.type === 'hero') {
                  return !['title', 'buttonText'].includes(key);
                }
                return true;
              })
              .map(key => {
                if (['isCanvas', 'elements', 'canvasWidth'].includes(key)) return null;

                const baseKey = key.replace(/Color$|BgColor$|BorderColor$/i, '');
                if ((key.toLowerCase().includes('color') || key.toLowerCase().includes('bgcolor') || key.toLowerCase().includes('bordercolor')) && selectedSection.content[baseKey] !== undefined) {
                  return null;
                }

                const value = selectedSection.content[key] || (key === 'formFields' ? [] : (key === 'formTitle' ? 'Get a Free Quote' : ''));
                const isList = Array.isArray(value);
                const isLockedHeroFormFields = selectedSection?.type === 'hero' && key === 'formFields';

                // 🔥 UNLOCKED: Form fields are now fully editable

                if (isList) {
                  return (
                    <div key={key} className="space-y-3 p-3 bg-gray-50 rounded-xl border">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          {formatFieldLabel(key)}
                        </label>
                        {key === 'formFields' && (
                          <button
                            onClick={() => { setShowHtmlImport(true); setHtmlImportCode(''); }}
                            className="text-[9px] text-amber-600 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded border border-amber-200 font-bold transition-all"
                          >
                            📄 Import HTML
                          </button>
                        )}
                          <button
                            onClick={() => {
                              let defaultItem: any = { title: 'New Item', description: '' };
                              if (key === 'formFields') {
                                defaultItem = { name: `field_${value.length + 1}`, label: 'New Field', placeholder: 'Enter value', type: 'text', required: true, salesforceFieldId: '' };
                              } else if (key === 'stats' || key === 'counters') {
                                defaultItem = { label: 'New Stat', value: '100+', color: '#ed1c24' };
                              } else if (key === 'cards' || key === 'features') {
                                if (selectedSection.type === 'industries') {
                                  defaultItem = { title: 'New Industry', icon: 'Package' };
                                } else if (selectedSection.type === 'why-choose-us') {
                                  defaultItem = {
                                    title: 'New Card',
                                    icon: 'ShieldCheck',
                                    points: ['Add point 1', 'Add point 2']
                                  };
                                } else {
                                  defaultItem = { title: 'New Feature', description: 'Description here', image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80', link: '' };
                                }
                              } else if (key === 'links') {
                                defaultItem = { label: '', url: '#' };
                              } else if (key === 'items') {
                                if (selectedSection.type === 'testimonials') {
                                  defaultItem = { 
                                    name: 'New Client', 
                                    role: 'Position, Company', 
                                    feedback: 'Feedback here...', 
                                    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80',
                                    stars: 5 
                                  };
                                } else if (selectedSection.type === 'case-studies') {
                                  defaultItem = { title: 'New Case Study', subtitle: 'Project details...', icon: 'TrendingUp', link: '' };
                                } else {
                                  defaultItem = { question: 'New Question', answer: 'Answer here...' };
                                }
                              } else if (key === 'logos') {
                                defaultItem = 'https://logo.clearbit.com/google.com';
                              } else if (value.length > 0) {
                                defaultItem = typeof value[0] === 'string' ? value[0] : { ...value[0] };
                              }
                              
                              updateSectionContent(selectedSection.id, { [key]: [...value, defaultItem] });
                            }}
                            className="text-mahindra-red text-[9px] hover:underline bg-white px-2 py-1 rounded shadow-sm border"
                          >
                            + Add Item
                          </button>
                      </div>

                      <div className="space-y-3">
                        {value.map((item: any, idx: number) => (
                          <div key={idx} className="space-y-3 p-4 bg-white border-2 border-gray-50 rounded-2xl relative group shadow-sm hover:border-mahindra-red/20 transition-all">
                              <div className="absolute right-2 top-2 flex items-center gap-1 z-10">
                                <button
                                  onClick={() => {
                                    if (idx === 0) return;
                                    const newList = [...value];
                                    [newList[idx - 1], newList[idx]] = [newList[idx], newList[idx - 1]];
                                    updateSectionContent(selectedSection.id, { [key]: newList });
                                  }}
                                  disabled={idx === 0}
                                  className="bg-white border text-gray-500 rounded p-1 shadow-sm hover:text-mahindra-red disabled:opacity-40 disabled:cursor-not-allowed"
                                  title="Move Up"
                                >
                                  <ChevronUp className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (idx === value.length - 1) return;
                                    const newList = [...value];
                                    [newList[idx + 1], newList[idx]] = [newList[idx], newList[idx + 1]];
                                    updateSectionContent(selectedSection.id, { [key]: newList });
                                  }}
                                  disabled={idx === value.length - 1}
                                  className="bg-white border text-gray-500 rounded p-1 shadow-sm hover:text-mahindra-red disabled:opacity-40 disabled:cursor-not-allowed"
                                  title="Move Down"
                                >
                                  <ChevronDown className="w-3 h-3" />
                                </button>
                              </div>
                              <button
                                onClick={() => {
                                  const newList = [...value];
                                  newList.splice(idx, 1);
                                  updateSectionContent(selectedSection.id, { [key]: newList });
                                }}
                                className="absolute -right-2 -top-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow-lg hover:bg-red-600"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>

                            {key === 'formFields' ? (
                              <div className="grid grid-cols-1 gap-3">
                                <p className="text-[9px] font-semibold text-amber-600 bg-amber-50 p-2 rounded-lg uppercase tracking-wide">
                                  ⚡ Unlocked: You can now add, remove, and fully edit form fields including Salesforce mapping.
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="space-y-1">
                                    <label className="text-[8px] font-black text-gray-400 uppercase">Field Name</label>
                                    <input
                                      type="text"
                                      placeholder="e.g. first_name"
                                      value={item.name || ''}
                                      onChange={(e) => {
                                        const newList = [...value];
                                        newList[idx] = { ...newList[idx], name: e.target.value };
                                        updateSectionContent(selectedSection.id, { [key]: newList });
                                      }}
                                      className="w-full p-2 text-[10px] border rounded-lg focus:border-mahindra-red outline-none bg-white"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[8px] font-black text-gray-400 uppercase">Salesforce Field ID</label>
                                    <input
                                      type="text"
                                      placeholder="e.g. 00N4x00000bbbEM"
                                      value={item.salesforceFieldId || ''}
                                      onChange={(e) => {
                                        const newList = [...value];
                                        newList[idx] = { ...newList[idx], salesforceFieldId: e.target.value };
                                        updateSectionContent(selectedSection.id, { [key]: newList });
                                      }}
                                      className="w-full p-2 text-[10px] border rounded-lg focus:border-mahindra-red outline-none bg-amber-50"
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                      <label className="text-[8px] font-black text-gray-400 uppercase">Label</label>
                                      <StylePlate 
                                        id={`${selectedSection.id}-${key}-${idx}-label`}
                                        color={item.labelColor || ''}
                                        bgColor={item.labelBgColor || ''}
                                        borderColor={item.labelBorderColor || ''}
                                        activeColorPicker={activeColorPicker}
                                        setActiveColorPicker={setActiveColorPicker}
                                        onColorChange={(val) => {
                                          const newList = [...value];
                                          newList[idx] = { ...newList[idx], labelColor: val };
                                          updateSectionContent(selectedSection.id, { [key]: newList });
                                        }}
                                        onBgChange={(val) => {
                                          const newList = [...value];
                                          newList[idx] = { ...newList[idx], labelBgColor: val };
                                          updateSectionContent(selectedSection.id, { [key]: newList });
                                        }}
                                        onBorderChange={(val) => {
                                          const newList = [...value];
                                          newList[idx] = { ...newList[idx], labelBorderColor: val };
                                          updateSectionContent(selectedSection.id, { [key]: newList });
                                        }}
                                      />
                                    </div>
                                    <input
                                      type="text"
                                      placeholder="Field Label"
                                      value={item.label || ''}
                                      onChange={(e) => {
                                        const newList = [...value];
                                        newList[idx] = { ...newList[idx], label: e.target.value };
                                        updateSectionContent(selectedSection.id, { [key]: newList });
                                      }}
                                      className="w-full p-2 text-[10px] border rounded-lg focus:border-mahindra-red outline-none bg-white"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[8px] font-black text-gray-400 uppercase">Input Type</label>
                                    <select
                                      value={item.type || 'text'}
                                      onChange={(e) => {
                                        const newList = [...value];
                                        newList[idx] = { ...newList[idx], type: e.target.value };
                                        updateSectionContent(selectedSection.id, { [key]: newList });
                                      }}
                                      className="w-full p-2 text-[10px] border rounded-lg focus:border-mahindra-red outline-none bg-white"
                                    >
                                      <option value="text">Text</option>
                                      <option value="number">Number</option>
                                      <option value="email">Email</option>
                                      <option value="tel">Phone</option>
                                      <option value="textarea">Message Box</option>
                                      <option value="select">Dropdown</option>
                                      <option value="hidden">Hidden</option>
                                    </select>
                                  </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                  <div className="space-y-1 flex items-end gap-2">
                                    <input
                                      type="checkbox"
                                      checked={item.required !== false}
                                      onChange={(e) => {
                                        const newList = [...value];
                                        newList[idx] = { ...newList[idx], required: e.target.checked };
                                        updateSectionContent(selectedSection.id, { [key]: newList });
                                      }}
                                      className="w-4 h-4 accent-mahindra-red mb-2"
                                    />
                                    <label className="text-[8px] font-black text-gray-400 uppercase">Required</label>
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[8px] font-black text-gray-400 uppercase">Max Length</label>
                                    <input
                                      type="number"
                                      placeholder="255"
                                      value={item.maxLength || ''}
                                      onChange={(e) => {
                                        const newList = [...value];
                                        newList[idx] = { ...newList[idx], maxLength: parseInt(e.target.value) || undefined };
                                        updateSectionContent(selectedSection.id, { [key]: newList });
                                      }}
                                      className="w-full p-2 text-[10px] border rounded-lg focus:border-mahindra-red outline-none bg-white"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[8px] font-black text-gray-400 uppercase">Pattern</label>
                                    <input
                                      type="text"
                                      placeholder="^[A-Za-z ]+$"
                                      value={item.pattern || ''}
                                      onChange={(e) => {
                                        const newList = [...value];
                                        newList[idx] = { ...newList[idx], pattern: e.target.value };
                                        updateSectionContent(selectedSection.id, { [key]: newList });
                                      }}
                                      className="w-full p-2 text-[10px] border rounded-lg focus:border-mahindra-red outline-none bg-white font-mono"
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                      <label className="text-[8px] font-black text-gray-400 uppercase">Placeholder</label>
                                      <StylePlate 
                                        id={`${selectedSection.id}-${key}-${idx}-placeholder`}
                                        color={item.placeholderColor || ''}
                                        bgColor={item.placeholderBgColor || ''}
                                        borderColor={item.placeholderBorderColor || ''}
                                        activeColorPicker={activeColorPicker}
                                        setActiveColorPicker={setActiveColorPicker}
                                        onColorChange={(val) => {
                                          const newList = [...value];
                                          newList[idx] = { ...newList[idx], placeholderColor: val };
                                          updateSectionContent(selectedSection.id, { [key]: newList });
                                        }}
                                        onBgChange={(val) => {
                                          const newList = [...value];
                                          newList[idx] = { ...newList[idx], placeholderBgColor: val };
                                          updateSectionContent(selectedSection.id, { [key]: newList });
                                        }}
                                        onBorderChange={(val) => {
                                          const newList = [...value];
                                          newList[idx] = { ...newList[idx], placeholderBorderColor: val };
                                          updateSectionContent(selectedSection.id, { [key]: newList });
                                        }}
                                      />
                                    </div>
                                    <input
                                      type="text"
                                      placeholder="Enter placeholder text..."
                                      value={item.placeholder || ''}
                                      onChange={(e) => {
                                        const newList = [...value];
                                        newList[idx] = { ...newList[idx], placeholder: e.target.value };
                                        updateSectionContent(selectedSection.id, { [key]: newList });
                                      }}
                                      className="w-full p-2 text-[10px] border rounded-lg focus:border-mahindra-red outline-none bg-white"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[8px] font-black text-gray-400 uppercase">Prefix (optional)</label>
                                    <input
                                      type="text"
                                      placeholder="e.g. +91"
                                      value={item.prefix || ''}
                                      onChange={(e) => {
                                        const newList = [...value];
                                        newList[idx] = { ...newList[idx], prefix: e.target.value };
                                        updateSectionContent(selectedSection.id, { [key]: newList });
                                      }}
                                      className="w-full p-2 text-[10px] border rounded-lg focus:border-mahindra-red outline-none bg-white"
                                    />
                                  </div>
                                </div>

                                {item.type === 'select' && (
                                  <div className="space-y-1">
                                    <label className="text-[8px] font-black text-gray-400 uppercase">Options (comma separated)</label>
                                    <input
                                      type="text"
                                      placeholder="Option 1, Option 2, Option 3"
                                      value={item.options?.join(', ') || ''}
                                      onChange={(e) => {
                                        const newList = [...value];
                                        newList[idx] = { ...newList[idx], options: e.target.value.split(',').map(s => s.trim()) };
                                        updateSectionContent(selectedSection.id, { [key]: newList });
                                      }}
                                      className="w-full p-2 text-[10px] border rounded-lg focus:border-mahindra-red outline-none bg-white"
                                    />
                                  </div>
                                )}
                              </div>
                            ) : (
                              <>
                                {typeof item === 'string' ? (
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                      <label className="text-[8px] font-bold text-gray-400 uppercase flex items-center gap-1">
                                        <ImageIcon className="w-2 h-2" />
                                        URL
                                      </label>
                                    </div>
                                    <ImageUploadInput
                                      value={item}
                                      onChange={(val) => {
                                        const newList = [...value];
                                        newList[idx] = val;
                                        updateSectionContent(selectedSection.id, { [key]: newList });
                                      }}
                                    />
                                  </div>
                                ) : (
                                  (((selectedSection.type === 'case-studies') || (selectedSection.type === 'features' && key === 'cards')) && !Object.keys(item).includes('link')
                                    ? [...Object.keys(item), 'link']
                                    : (selectedSection.type === 'network' && key === 'regions' && !Object.keys(item).includes('icon')
                                      ? [...Object.keys(item), 'icon']
                                      : Object.keys(item))
                                  ).map(itemKey => {
                                    const baseItemKey = itemKey.replace(/Color$|BgColor$|BorderColor$/i, '');
                                    if ((itemKey.toLowerCase().includes('color') || itemKey.toLowerCase().includes('bgcolor') || itemKey.toLowerCase().includes('bordercolor')) && item[baseItemKey] !== undefined) {
                                      return null;
                                    }
                                    const isArrayValue = Array.isArray(item[itemKey]);
                                    
                                    const itemColorKey = `${itemKey}Color`;
                                    const shouldShowColor = !itemKey.toLowerCase().includes('color');
                                    const effectiveColorKey = item[itemColorKey] !== undefined ? itemColorKey : (item['color'] !== undefined ? 'color' : itemColorKey);

                                    return (
                                      <div key={itemKey} className="space-y-1">
                                        <div className="flex items-center justify-between">
                                          <label className="text-[8px] font-bold text-gray-400 uppercase flex items-center gap-1">
                                            {(itemKey.toLowerCase().includes('image') || itemKey.toLowerCase().includes('avatar') || itemKey.toLowerCase().includes('icon')) && <ImageIcon className="w-2 h-2" />}
                                            {itemKey.toLowerCase().includes('link') && !(itemKey.toLowerCase().includes('image') || itemKey.toLowerCase().includes('avatar') || itemKey.toLowerCase().includes('icon')) && <LinkIcon className="w-2 h-2" />}
                                            {itemKey.toLowerCase().includes('readstory') && <FileText className="w-2 h-2" />}
                                            {formatFieldLabel(itemKey)}
                                          </label>
                                          {shouldShowColor && (
                                            <StylePlate 
                                              id={`${selectedSection.id}-${key}-${idx}-${itemKey}`}
                                              color={item[effectiveColorKey] || ''}
                                              bgColor={item[`${itemKey}BgColor`] || ''}
                                              borderColor={item[`${itemKey}BorderColor`] || ''}
                                              activeColorPicker={activeColorPicker}
                                              setActiveColorPicker={setActiveColorPicker}
                                              onColorChange={(val) => {
                                                const newList = [...value];
                                                newList[idx] = { ...newList[idx], [effectiveColorKey]: val };
                                                updateSectionContent(selectedSection.id, { [key]: newList });
                                              }}
                                              onBgChange={(val) => {
                                                const newList = [...value];
                                                newList[idx] = { ...newList[idx], [`${itemKey}BgColor`]: val };
                                                updateSectionContent(selectedSection.id, { [key]: newList });
                                              }}
                                              onBorderChange={(val) => {
                                                const newList = [...value];
                                                newList[idx] = { ...newList[idx], [`${itemKey}BorderColor`]: val };
                                                updateSectionContent(selectedSection.id, { [key]: newList });
                                              }}
                                            />
                                          )}
                                        </div>
                                        {itemKey.toLowerCase().includes('image') || itemKey.toLowerCase().includes('avatar') || itemKey.toLowerCase().includes('logo') || itemKey.toLowerCase().includes('thumbnail') || itemKey.toLowerCase().includes('icon') ? (
                                          <ImageUploadInput
                                            value={item[itemKey] || ''}
                                            onChange={(val) => {
                                              const newList = [...value];
                                              newList[idx] = { ...newList[idx], [itemKey]: val };
                                              updateSectionContent(selectedSection.id, { [key]: newList });
                                            }}
                                          />
                                        ) : itemKey.toLowerCase().includes('video') ? (
                                          <VideoUploadInput
                                            value={item[itemKey] || ''}
                                            onChange={(val) => {
                                              const newList = [...value];
                                              newList[idx] = { ...newList[idx], [itemKey]: val };
                                              updateSectionContent(selectedSection.id, { [key]: newList });
                                            }}
                                          />
                                        ) : !itemKey.toLowerCase().includes('color') && (
                                          <input
                                            type={itemKey === 'stars' ? "number" : "text"}
                                            min={itemKey === 'stars' ? "1" : undefined}
                                            max={itemKey === 'stars' ? "5" : undefined}
                                            placeholder={isArrayValue ? "e.g. Fast delivery, 24x7 support, Quality assured" : "Enter value..."}
                                            value={isArrayValue ? item[itemKey].join(', ') : (item[itemKey] || '')}
                                            onChange={(e) => {
                                              const newList = [...value];
                                              const nextValue = isArrayValue
                                                ? e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                                                : (itemKey === 'stars' ? parseInt(e.target.value) : e.target.value);
                                              newList[idx] = { ...newList[idx], [itemKey]: nextValue };
                                              updateSectionContent(selectedSection.id, { [key]: newList });
                                            }}
                                            className="w-full p-2 text-[11px] border rounded-lg focus:border-mahindra-red outline-none bg-gray-50/30"
                                          />
                                        )}
                                      </div>
                                    );
                                  })
                                )}
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                // Standard field rendering (text, image, color)
                const isImage = key.toLowerCase().includes('image') || key === 'logo' || key === 'avatar' || key === 'thumbnail' || key.toLowerCase().includes('icon');
                const isVideo = key.toLowerCase().includes('videourl');
                const isColor = key.toLowerCase().includes('color') || key.toLowerCase().includes('bgcolor') || key.toLowerCase().includes('bordercolor');
                const isTextarea = key === 'text' || key === 'description' || key === 'subtitle' || key === 'details' || key === 'embedCode' || key === 'feedback';

                return (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                        {key.toLowerCase().includes('link') && <LinkIcon className="w-3 h-3" />}
                        {key.toLowerCase().includes('readstory') && <FileText className="w-3 h-3" />}
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      <StylePlate 
                        id={`${selectedSection.id}-${key}`}
                        color={selectedSection.content[`${key}Color`] || ''}
                        bgColor={selectedSection.content[`${key}BgColor`] || ''}
                        borderColor={selectedSection.content[`${key}BorderColor`] || ''}
                        activeColorPicker={activeColorPicker}
                        setActiveColorPicker={setActiveColorPicker}
                        onColorChange={(val) => updateSectionContent(selectedSection.id, { [`${key}Color`]: val })}
                        onBgChange={(val) => updateSectionContent(selectedSection.id, { [`${key}BgColor`]: val })}
                        onBorderChange={(val) => updateSectionContent(selectedSection.id, { [`${key}BorderColor`]: val })}
                      />
                    </div>

                    {isImage ? (
                      <ImageUploadInput
                        value={value}
                        onChange={(val) => updateSectionContent(selectedSection.id, { [key]: val })}
                      />
                    ) : isVideo ? (
                      <VideoUploadInput
                        value={value}
                        onChange={(val) => updateSectionContent(selectedSection.id, { [key]: val })}
                      />
                    ) : isColor ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={value || '#000000'}
                          onChange={(e) => updateSectionContent(selectedSection.id, { [key]: e.target.value })}
                          className="w-8 h-8 rounded-lg cursor-pointer border shadow-sm"
                        />
                        <span className="text-[10px] text-gray-400 font-mono uppercase">{value || '#000000'}</span>
                      </div>
                    ) : isTextarea ? (
                      <textarea
                        value={value}
                        onChange={(e) => updateSectionContent(selectedSection.id, { [key]: e.target.value })}
                        className="w-full p-3 text-xs border rounded-xl focus:border-mahindra-red outline-none min-h-[100px] bg-gray-50/50"
                      />
                    ) : (
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => updateSectionContent(selectedSection.id, { [key]: e.target.value })}
                        className="w-full p-3 text-xs border rounded-xl focus:border-mahindra-red outline-none bg-gray-50/50"
                      />
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* HTML Import Modal */}
      {showHtmlImport && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowHtmlImport(false)} />
          <div className="bg-white rounded-2xl w-full max-w-xl p-6 shadow-2xl relative animate-in zoom-in-95 z-10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Import Form from HTML</h3>
                <p className="text-xs text-gray-500 mt-1">Paste your HTML form code below</p>
              </div>
              <button onClick={() => setShowHtmlImport(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <textarea
              value={htmlImportCode}
              onChange={(e) => setHtmlImportCode(e.target.value)}
              rows={12}
              placeholder={`<form action="https://webto.salesforce.com/..." method="POST">\n  <input type="hidden" name="oid" value="00D4x000007sh6p">\n  <label for="first_name">First Name</label>\n  <input name="first_name" type="text" required>\n  ...\n</form>`}
              className="w-full p-4 border rounded-xl text-xs focus:ring-2 focus:ring-mahindra-red outline-none font-mono resize-y bg-gray-50"
              autoFocus
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowHtmlImport(false)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!htmlImportCode.trim()) { alert('Please paste HTML code first.'); return; }
                  try {
                    const { parseHtmlForm, parseFormMeta } = await import('../../lib/formParser');
                    const fields = parseHtmlForm(htmlImportCode);
                    const meta = parseFormMeta(htmlImportCode);
                    if (fields.length === 0) { alert('No form fields found. Check your HTML.'); return; }
                    
                    const salesforceConfig: any = {};
                    if (meta.action) salesforceConfig.url = meta.action;
                    if (meta.hiddenFields.oid) salesforceConfig.orgId = meta.hiddenFields.oid;
                    if (meta.hiddenFields.recordType) salesforceConfig.recordType = meta.hiddenFields.recordType;
                    if (meta.hiddenFields.debug) salesforceConfig.debug = parseInt(meta.hiddenFields.debug);
                    if (meta.hiddenFields.debugEmail) salesforceConfig.debugEmail = meta.hiddenFields.debugEmail;
                    
                    const updates: any = { formFields: fields };
                    if (Object.keys(salesforceConfig).length > 0) updates.salesforce = salesforceConfig;
                    updateSectionContent(selectedSection!.id, updates);
                    setShowHtmlImport(false);
                    setHtmlImportCode('');
                    alert(`✅ Imported ${fields.length} fields!${Object.keys(salesforceConfig).length > 0 ? '\nSalesforce config also detected.' : ''}`);
                  } catch { alert('Failed to parse HTML.'); }
                }}
                className="flex-1 py-2.5 bg-mahindra-red text-white font-bold rounded-xl hover:brightness-110 text-sm"
              >
                Import Fields
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyEditor;
