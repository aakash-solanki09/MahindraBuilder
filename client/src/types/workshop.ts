export type ElementType = 'rect' | 'circle' | 'text' | 'line' | 'arrow' | 'triangle' | 'brush';

export interface CanvasElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  fill: string;
  fillType: 'color' | 'image';
  fillPatternImage?: string;
  fillPatternScale?: number;
  fillPatternOffset?: { x: number; y: number };
  stroke: string;
  strokeWidth: number;
  opacity: number;
  
  // Type specific properties
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  align?: 'left' | 'center' | 'right';
  
  src?: string;
  
  points?: number[]; // For brush and lines
  
  // UI State
  isLocked: boolean;
  isVisible: boolean;
  zIndex: number;
}

export interface WorkshopActions {
  clearCanvas: () => void;
  loadDesign: (elements: CanvasElement[], templateId?: string) => void;
  resetWorkshop: () => void;
  setCanvasWidth: (width: number) => void;
  duplicateElement: (id: string) => void;
}

export interface WorkshopState {
  elements: CanvasElement[];
  selectedIds: string[];
  brushSettings: {
    color: string;
    size: number;
    opacity: number;
  };
  tool: 'select' | 'hand' | 'brush' | 'rect' | 'circle' | 'text' | 'image' | 'line' | 'arrow' | 'triangle';
  zoom: number;
  canvasWidth: number;
  currentTemplateId: string | null;
  history: {
    past: CanvasElement[][];
    future: CanvasElement[][];
  };
}
