import React from 'react';
import { useWorkshopStore } from '../../store/useWorkshopStore';
import { 
  Move, Maximize2, RotateCw, Palette, Type, AlignLeft, 
  AlignCenter, AlignRight, Layers, Trash2, Copy, Lock, Unlock,
  MousePointer2, Image as ImageIcon
} from 'lucide-react';
import { cn } from '../../lib/utils';

const Properties: React.FC = () => {
  const { 
    elements, selectedIds, updateElement, removeElement, duplicateElement 
  } = useWorkshopStore();
  
  const selectedElement = elements.find(el => selectedIds.includes(el.id));

  if (!selectedElement) {
    return (
      <div className="w-80 border-l bg-white flex flex-col p-8 items-center justify-center text-center space-y-4">
        <div className="p-4 bg-gray-50 rounded-full">
          <MousePointer2 className="w-8 h-8 text-gray-300" />
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-gray-400">No Selection</p>
          <p className="text-[10px] text-gray-400 mt-2">Select an element on the canvas to edit its properties.</p>
        </div>
      </div>
    );
  }

  const handleChange = (updates: any) => {
    updateElement(selectedElement.id, updates);
  };

  return (
    <aside className="w-80 border-l bg-white flex flex-col overflow-y-auto">
      <div className="p-6 border-b bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-mahindra-red/10 text-mahindra-red rounded-lg">
            <Layers className="w-4 h-4" />
          </div>
          <h3 className="font-black text-[10px] uppercase tracking-widest text-gray-700">Properties</h3>
        </div>
        <div className="flex gap-1">
          <button 
            onClick={() => removeElement(selectedElement.id)}
            className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Transform Group */}
        <div className="space-y-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Transform</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-gray-400 uppercase flex items-center gap-1"><Move className="w-3 h-3" /> X</label>
              <input 
                type="number" 
                value={Math.round(selectedElement.x)} 
                onChange={(e) => handleChange({ x: Number(e.target.value) })}
                className="w-full p-2 bg-gray-50 border rounded-lg text-xs font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-gray-400 uppercase flex items-center gap-1"><Move className="w-3 h-3" /> Y</label>
              <input 
                type="number" 
                value={Math.round(selectedElement.y)} 
                onChange={(e) => handleChange({ y: Number(e.target.value) })}
                className="w-full p-2 bg-gray-50 border rounded-lg text-xs font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-gray-400 uppercase flex items-center gap-1"><Maximize2 className="w-3 h-3" /> Width</label>
              <input 
                type="number" 
                value={Math.round(selectedElement.width || 0)} 
                onChange={(e) => handleChange({ width: Number(e.target.value) })}
                className="w-full p-2 bg-gray-50 border rounded-lg text-xs font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-gray-400 uppercase flex items-center gap-1"><Maximize2 className="w-3 h-3" /> Height</label>
              <input 
                type="number" 
                value={Math.round(selectedElement.height || 0)} 
                onChange={(e) => handleChange({ height: Number(e.target.value) })}
                className="w-full p-2 bg-gray-50 border rounded-lg text-xs font-bold"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-gray-400 uppercase flex items-center gap-1"><RotateCw className="w-3 h-3" /> Rotation</label>
            <input 
              type="range" min="0" max="360"
              value={selectedElement.rotation} 
              onChange={(e) => handleChange({ rotation: Number(e.target.value) })}
              className="w-full accent-mahindra-red"
            />
          </div>
        </div>

        <div className="h-px bg-gray-100" />

        {/* Appearance Group */}
        <div className="space-y-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Appearance</p>
          
          {selectedElement.type !== 'text' && (
            <div className="flex bg-gray-50 p-1 rounded-xl gap-1">
              <button 
                onClick={() => handleChange({ fillType: 'color' })}
                className={cn("flex-1 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all", selectedElement.fillType === 'color' ? "bg-white shadow-sm text-mahindra-red" : "text-gray-400")}
              >
                Solid
              </button>
              <button 
                onClick={() => handleChange({ fillType: 'image' })}
                className={cn("flex-1 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all", selectedElement.fillType === 'image' ? "bg-white shadow-sm text-mahindra-red" : "text-gray-400")}
              >
                Image
              </button>
            </div>
          )}

          {(selectedElement.fillType === 'color' || selectedElement.type === 'text') ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-gray-400 uppercase flex items-center gap-1"><Palette className="w-3 h-3" /> Fill</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    value={selectedElement.fill} 
                    onChange={(e) => handleChange({ fill: e.target.value })}
                    className="w-8 h-8 rounded-full border-2 border-white shadow-sm overflow-hidden cursor-pointer"
                  />
                  <span className="text-[10px] font-mono uppercase text-gray-400">{selectedElement.fill}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-gray-400 uppercase flex items-center gap-1"><Palette className="w-3 h-3" /> Stroke</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    value={selectedElement.stroke} 
                    onChange={(e) => handleChange({ stroke: e.target.value })}
                    className="w-8 h-8 rounded-full border-2 border-white shadow-sm overflow-hidden cursor-pointer"
                  />
                  <span className="text-[10px] font-mono uppercase text-gray-400">{selectedElement.stroke}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-gray-400 uppercase flex items-center gap-1"><ImageIcon className="w-3 h-3" /> Mask Image</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Image URL"
                    value={selectedElement.fillPatternImage || ''}
                    onChange={(e) => handleChange({ fillPatternImage: e.target.value })}
                    className="flex-1 p-2 bg-gray-50 border rounded-lg text-[10px] font-bold outline-none focus:border-mahindra-red"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-400 uppercase flex items-center gap-1"><Maximize2 className="w-3 h-3" /> Pattern Scale</label>
                <input 
                  type="range" min="0.1" max="5" step="0.1"
                  value={selectedElement.fillPatternScale || 1} 
                  onChange={(e) => handleChange({ fillPatternScale: Number(e.target.value) })}
                  className="w-full accent-mahindra-red"
                />
              </div>
            </div>
          )}
          
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-gray-400 uppercase flex items-center gap-1">Opacity</label>
            <input 
              type="range" min="0" max="1" step="0.1"
              value={selectedElement.opacity} 
              onChange={(e) => handleChange({ opacity: Number(e.target.value) })}
              className="w-full accent-mahindra-red"
            />
          </div>
        </div>

        {/* Text Specific (Conditional) */}
        {selectedElement.type === 'text' && (
          <React.Fragment>
            <div className="h-px bg-gray-100" />
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Typography</p>
              
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-gray-400 uppercase">Text Preset</label>
                <select 
                  className="w-full p-2 bg-gray-50 border rounded-lg text-xs font-bold"
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'h1') handleChange({ fontSize: 48, fontWeight: '900', text: 'Large Heading' });
                    if (val === 'h2') handleChange({ fontSize: 32, fontWeight: '700', text: 'Subheading' });
                    if (val === 'p') handleChange({ fontSize: 16, fontWeight: '400', text: 'Paragraph text goes here...' });
                    if (val === 'list') handleChange({ fontSize: 16, fontWeight: '400', text: '• List Item' });
                  }}
                >
                  <option value="">Custom</option>
                  <option value="h1">Heading (H1)</option>
                  <option value="h2">Subheading (H2)</option>
                  <option value="p">Paragraph (P)</option>
                  <option value="list">List Item</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-bold text-gray-400 uppercase">Font Family</label>
                <select 
                  className="w-full p-2 bg-gray-50 border rounded-lg text-xs font-bold"
                  value={selectedElement.fontFamily || 'Inter, sans-serif'}
                  onChange={(e) => handleChange({ fontFamily: e.target.value })}
                >
                  <option value="Inter, sans-serif">Inter (Modern)</option>
                  <option value="Roboto, sans-serif">Roboto (Clean)</option>
                  <option value="Playfair Display, serif">Playfair (Elegant)</option>
                  <option value="Georgia, serif">Georgia (Classic)</option>
                  <option value="Courier New, monospace">Courier (System)</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-[9px] font-bold text-gray-400 uppercase flex items-center gap-1"><Type className="w-3 h-3" /> Content</label>
                <textarea 
                  value={selectedElement.text} 
                  onChange={(e) => handleChange({ text: e.target.value })}
                  className="w-full p-3 bg-gray-50 border rounded-xl text-xs font-bold h-24 outline-none focus:border-mahindra-red transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase">Size</label>
                  <input 
                    type="number" 
                    value={selectedElement.fontSize} 
                    onChange={(e) => handleChange({ fontSize: Number(e.target.value) })}
                    className="w-full p-2 bg-gray-50 border rounded-lg text-xs font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase">Align</label>
                  <div className="flex bg-gray-50 p-1 rounded-lg">
                    <button onClick={() => handleChange({ align: 'left' })} className={cn("flex-1 p-1 flex justify-center rounded", selectedElement.align === 'left' && "bg-white shadow-sm")}><AlignLeft className="w-3 h-3" /></button>
                    <button onClick={() => handleChange({ align: 'center' })} className={cn("flex-1 p-1 flex justify-center rounded", selectedElement.align === 'center' && "bg-white shadow-sm")}><AlignCenter className="w-3 h-3" /></button>
                    <button onClick={() => handleChange({ align: 'right' })} className={cn("flex-1 p-1 flex justify-center rounded", selectedElement.align === 'right' && "bg-white shadow-sm")}><AlignRight className="w-3 h-3" /></button>
                  </div>
                </div>
              </div>
            </div>
          </React.Fragment>
        )}
      </div>

      <div className="mt-auto p-6 border-t bg-gray-50 space-y-3">
        <button 
          onClick={() => duplicateElement(selectedElement.id)}
          className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
        >
          <Copy className="w-3 h-3" /> Duplicate
        </button>
        <button className="w-full py-3 bg-mahindra-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-2">
          <Lock className="w-3 h-3" /> Lock Element
        </button>
      </div>
    </aside>
  );
};

export default Properties;
