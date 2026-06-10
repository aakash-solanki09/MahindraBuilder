import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Palette, MoveUp, MoveDown, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import SectionRenderer from '../SectionRenderer';

interface SortableSectionProps {
  section: any;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onMove: (direction: 'up' | 'down') => void;
  onStyleOpen: () => void;
  view?: 'desktop' | 'tablet' | 'mobile';
  hideControls?: boolean;
}

const SortableSection: React.FC<SortableSectionProps> = ({ 
  section, isSelected, onSelect, onRemove, onMove, onStyleOpen, view, hideControls 
}) => {
  const isLockedPosition = section.type === 'thank-you';
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: section.id, disabled: isLockedPosition });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 500 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group cursor-default transition-all",
        isSelected && "outline outline-4 outline-mahindra-red/30 outline-offset-[-4px] z-[50]",
        isDragging && "shadow-2xl ring-2 ring-mahindra-red border-mahindra-red z-[100]"
      )}
      onClick={onSelect}
    >
      {/* Drag Handle and Controls */}
      {!hideControls && (
        <div className="absolute right-4 top-4 flex flex-row gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-[150]">
          <div 
            {...(!isLockedPosition ? attributes : {})}
            {...(!isLockedPosition ? listeners : {})}
            className="p-3 bg-mahindra-blue/90 backdrop-blur-sm text-white shadow-xl border border-white/20 rounded-xl cursor-grab active:cursor-grabbing hover:bg-mahindra-red transition-all flex items-center justify-center"
            title="Drag to Reorder"
          >
            <GripVertical className="w-5 h-5" />
          </div>
          <div className="flex bg-white/90 backdrop-blur-sm shadow-xl border border-gray-100 rounded-xl overflow-hidden">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onStyleOpen();
              }}
              className="p-3 hover:bg-mahindra-red hover:text-white transition-all border-r"
              title="Style Settings"
            >
              <Palette className="w-5 h-5" />
            </button>
            {!isLockedPosition && (
              <button 
                onClick={(e) => { e.stopPropagation(); onMove('up'); }}
                className="p-3 hover:bg-gray-50 transition-all border-r"
                title="Move Up"
              >
                <MoveUp className="w-5 h-5" />
              </button>
            )}
            {!isLockedPosition && (
              <button 
                onClick={(e) => { e.stopPropagation(); onMove('down'); }}
                className="p-3 hover:bg-gray-50 transition-all border-r"
                title="Move Down"
              >
                <MoveDown className="w-5 h-5" />
              </button>
            )}
            {section.type !== 'thank-you' && (
              <button 
                onClick={(e) => { e.stopPropagation(); onRemove(); }}
                className="p-3 hover:bg-red-500 hover:text-white transition-all text-red-500"
                title="Delete Section"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}

      <SectionRenderer section={section} isEditing={true} view={view} />
    </div>
  );
};

export default SortableSection;
