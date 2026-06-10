import React from 'react';
import { 
  MousePointer2, Pencil, Square, Circle, Type, Image as ImageIcon, 
  Undo2, Redo2, Trash2, Layers, ZoomIn, ZoomOut, Download, Play
} from 'lucide-react';
import { useWorkshopStore } from '../../store/useWorkshopStore';
import { useBuilderStore } from '../../store/useBuilderStore';
import { cn } from '../../lib/utils';
import { compileCanvasToTailwind } from '../../lib/canvas-utils';

const Toolbar: React.FC = () => {
  const { 
    tool, setTool, undo, redo, clearCanvas, elements, 
    currentTemplateId, canvasWidth, history 
  } = useWorkshopStore();
  const { saveCustomTemplate, setWorkshopMode } = useBuilderStore();

  const handleExport = async () => {
    if (elements.length === 0) return alert('Canvas is empty!');
    const name = prompt('Enter a name for this custom design:', 'My Canvas Section');
    if (!name) return;

    const compiledData = compileCanvasToTailwind(elements, canvasWidth);
    const payload = {
      type: 'custom',
      content: {
        isCanvas: true,
        elements: compiledData,
        originalElements: elements,
        canvasWidth: canvasWidth
      },
      styles: {
        backgroundColor: '#ffffff',
        minHeight: `${(600 / canvasWidth * 100).toFixed(4)}vw`
      }
    };

    const { currentTemplateId } = useWorkshopStore.getState();
    await saveCustomTemplate(payload, name, currentTemplateId);
    setWorkshopMode(false);
  };

  const tools = [
    { id: 'select', icon: MousePointer2, label: 'Select (V)' },
    { id: 'brush', icon: Pencil, label: 'Brush (P)' },
    { id: 'rect', icon: Square, label: 'Rectangle (R)' },
    { id: 'circle', icon: Circle, label: 'Circle (O)' },
    { id: 'text', icon: Type, label: 'Text (T)' },
  ];

  return (
    <div className="h-16 border-b bg-white flex items-center justify-between px-6 shadow-sm z-[100]">
      <div className="flex items-center gap-2">
        <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
          {tools.map((t) => (
            <button
              key={t.id}
              onClick={() => setTool(t.id as any)}
              className={cn(
                "p-2.5 rounded-lg transition-all flex items-center justify-center group relative",
                tool === t.id ? "bg-white shadow-md text-mahindra-red" : "text-gray-500 hover:bg-white/50"
              )}
              title={t.label}
            >
              <t.icon className="w-5 h-5" />
              <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[200]">
                {t.label}
              </span>
            </button>
          ))}
        </div>
        
        <div className="w-px h-8 bg-gray-200 mx-2" />
        
        <div className="flex items-center gap-1">
          <button 
            onClick={undo}
            disabled={history.past.length === 0}
            className="p-2.5 text-gray-500 hover:bg-gray-100 disabled:opacity-30 rounded-lg transition-all"
          >
            <Undo2 className="w-5 h-5" />
          </button>
          <button 
            onClick={redo}
            disabled={history.future.length === 0}
            className="p-2.5 text-gray-500 hover:bg-gray-100 disabled:opacity-30 rounded-lg transition-all"
          >
            <Redo2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center bg-gray-100 rounded-xl px-3 py-1.5 gap-3">
          <button className="text-gray-500 hover:text-gray-900"><ZoomOut className="w-4 h-4" /></button>
          <span className="text-xs font-bold text-gray-600 min-w-[40px] text-center">100%</span>
          <button className="text-gray-500 hover:text-gray-900"><ZoomIn className="w-4 h-4" /></button>
        </div>
        
        <button 
          onClick={clearCanvas}
          className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-xl transition-all text-xs font-bold uppercase tracking-widest"
        >
          <Trash2 className="w-4 h-4" />
          Clear
        </button>

        <div className="w-px h-8 bg-gray-200 mx-1" />

        <button className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all text-xs font-bold uppercase tracking-widest shadow-lg">
          <Play className="w-4 h-4" />
          Preview
        </button>
        
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 px-6 py-2 bg-mahindra-red text-white rounded-xl hover:brightness-110 transition-all text-xs font-bold uppercase tracking-widest shadow-lg shadow-mahindra-red/20"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
