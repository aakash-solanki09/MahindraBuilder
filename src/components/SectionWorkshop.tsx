import React from 'react';
import { useBuilderStore } from '../store/useBuilderStore';
import { useWorkshopStore } from '../store/useWorkshopStore';
import Canvas from './workshop/Canvas';
import Toolbar from './workshop/Toolbar';
import Properties from './workshop/Properties';
import { 
  X, Layers, Eye, EyeOff, Lock, Unlock, MousePointer2, 
  Pencil, Square, Circle, Type, Image as ImageIcon 
} from 'lucide-react';
import { cn } from '../lib/utils';

const LayersPanel: React.FC = () => {
  const { elements, selectedIds, setSelectedIds, updateElement } = useWorkshopStore();

  const getIcon = (type: string) => {
    switch (type) {
      case 'brush': return Pencil;
      case 'rect': return Square;
      case 'circle': return Circle;
      case 'text': return Type;
      case 'image': return ImageIcon;
      default: return MousePointer2;
    }
  };

  return (
    <aside className="w-64 border-r bg-white flex flex-col overflow-hidden shadow-sm">
      <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
        <Layers className="w-4 h-4 text-gray-400" />
        <h3 className="font-black text-[10px] uppercase tracking-widest text-gray-700">Layers</h3>
      </div>
      <div className="flex-1 overflow-y-auto">
        {elements.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">No Layers</p>
          </div>
        ) : (
          [...elements].reverse().map((el) => {
            const Icon = getIcon(el.type);
            const isSelected = selectedIds.includes(el.id);
            
            return (
              <div 
                key={el.id}
                onClick={() => setSelectedIds([el.id])}
                className={cn(
                  "group flex items-center justify-between p-3 border-b cursor-pointer transition-all",
                  isSelected ? "bg-mahindra-red/5 border-l-4 border-l-mahindra-red" : "hover:bg-gray-50"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn("w-3.5 h-3.5", isSelected ? "text-mahindra-red" : "text-gray-400")} />
                  <span className={cn("text-[11px] font-bold truncate max-w-[100px]", isSelected ? "text-mahindra-red" : "text-gray-600")}>
                    {el.type.charAt(0).toUpperCase() + el.type.slice(1)} {el.id.slice(0, 4)}
                  </span>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => { e.stopPropagation(); updateElement(el.id, { isVisible: !el.isVisible }); }}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    {el.isVisible ? <Eye className="w-3 h-3 text-gray-400" /> : <EyeOff className="w-3 h-3 text-red-400" />}
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); updateElement(el.id, { isLocked: !el.isLocked }); }}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    {el.isLocked ? <Lock className="w-3 h-3 text-mahindra-blue" /> : <Unlock className="w-3 h-3 text-gray-400" />}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};

const SectionWorkshop: React.FC = () => {
  const { setWorkshopMode } = useBuilderStore();

  return (
    <div className="fixed inset-0 z-[1000] bg-white flex flex-col overflow-hidden animate-in fade-in duration-300 font-sans">
      {/* Top Header */}
      <Toolbar />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Layers */}
        <LayersPanel />

        {/* Main Canvas Area */}
        <main className="flex-1 flex flex-col relative bg-[#e5e7eb] min-w-0 overflow-hidden">
           <Canvas />
           
           {/* Close Button Overlay */}
           <button 
             onClick={() => setWorkshopMode(false)}
             className="absolute top-4 right-4 z-[200] p-2 bg-white/80 backdrop-blur-sm hover:bg-white text-gray-500 hover:text-mahindra-red rounded-full shadow-lg transition-all"
           >
             <X className="w-6 h-6" />
           </button>
        </main>

        {/* Right Sidebar: Properties */}
        <Properties />
      </div>
    </div>
  );
};

export default SectionWorkshop;
