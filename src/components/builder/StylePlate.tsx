import React from 'react';
import { Palette, Trash2, Layout, Plus } from 'lucide-react';

interface StylePlateProps {
  id: string;
  color: string;
  bgColor: string;
  borderColor: string;
  activeColorPicker: string | null;
  setActiveColorPicker: (val: string | null) => void;
  onColorChange: (val: string) => void;
  onBgChange: (val: string) => void;
  onBorderChange: (val: string) => void;
}

const StylePlate: React.FC<StylePlateProps> = ({ 
  id, 
  color, 
  bgColor, 
  borderColor, 
  activeColorPicker,
  setActiveColorPicker,
  onColorChange, 
  onBgChange, 
  onBorderChange 
}) => {
  const isOpen = activeColorPicker === id;
  
  return (
    <div className="relative">
      <button 
        onClick={(e) => {
          e.stopPropagation();
          setActiveColorPicker(isOpen ? null : id);
        }}
        onMouseDown={(e) => e.stopPropagation()}
        className={`p-1.5 rounded-lg transition-all border ${isOpen ? 'bg-mahindra-red border-mahindra-red text-white shadow-lg scale-110' : 'bg-gray-50 border-gray-100 text-gray-400 hover:text-mahindra-red hover:bg-white'}`}
      >
        <Palette className="w-3 h-3" />
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 top-full mt-2 w-48 bg-white border-2 border-gray-100 rounded-2xl shadow-2xl p-4 z-[100] space-y-4 animate-in fade-in slide-in-from-top-2"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-gray-50 pb-2 mb-2">
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Styling</span>
            <button 
              onClick={() => setActiveColorPicker(null)} 
              className="w-6 h-6 flex items-center justify-center bg-gray-50 rounded-full text-gray-400 hover:text-mahindra-red hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between group/p">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-red-50 rounded-lg text-mahindra-red"><Palette className="w-3 h-3" /></div>
                <label className="text-[10px] font-bold text-gray-500 uppercase">Text Color</label>
              </div>
              <div className="relative">
                <input 
                  type="color" 
                  value={color || '#000000'} 
                  onChange={(e) => onColorChange(e.target.value)} 
                  className="w-6 h-6 rounded-lg cursor-pointer border-2 border-gray-50 bg-white" 
                />
              </div>
            </div>

            <div className="flex items-center justify-between group/p">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 rounded-lg text-blue-500"><Layout className="w-3 h-3" /></div>
                <label className="text-[10px] font-bold text-gray-500 uppercase">Background</label>
              </div>
              <div className="relative">
                <input 
                  type="color" 
                  value={bgColor || '#ffffff'} 
                  onChange={(e) => onBgChange(e.target.value)} 
                  className="w-6 h-6 rounded-lg cursor-pointer border-2 border-gray-50 bg-white" 
                />
              </div>
            </div>

            <div className="flex items-center justify-between group/p">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-green-50 rounded-lg text-green-500"><Plus className="w-3 h-3" /></div>
                <label className="text-[10px] font-bold text-gray-500 uppercase">Border Color</label>
              </div>
              <div className="relative">
                <input 
                  type="color" 
                  value={borderColor || '#000000'} 
                  onChange={(e) => onBorderChange(e.target.value)} 
                  className="w-6 h-6 rounded-lg cursor-pointer border-2 border-gray-50 bg-white" 
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-50">
            <button 
              onClick={() => {
                onColorChange('');
                onBgChange('');
                onBorderChange('');
                setActiveColorPicker(null);
              }}
              className="w-full py-2 bg-gray-50 hover:bg-red-50 text-mahindra-red text-[9px] font-black uppercase tracking-widest rounded-xl transition-all border border-transparent hover:border-red-100"
            >
              Reset to Default
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StylePlate;
