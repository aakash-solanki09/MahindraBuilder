import { create } from 'zustand';
import type { CanvasElement, WorkshopState, ElementType } from '../types/workshop';

interface WorkshopActions {
  addElement: (type: ElementType, props?: Partial<CanvasElement>) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  removeElement: (id: string) => void;
  setSelectedIds: (ids: string[]) => void;
  setTool: (tool: WorkshopState['tool']) => void;
  setZoom: (zoom: number) => void;
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;
  clearCanvas: () => void;
  loadDesign: (elements: CanvasElement[], templateId?: string) => void;
  resetWorkshop: () => void;
  setCanvasWidth: (width: number) => void;
  duplicateElement: (id: string) => void;
}

export const useWorkshopStore = create<WorkshopState & WorkshopActions>((set, get) => ({
  elements: [],
  selectedIds: [],
  brushSettings: {
    color: '#ed1c24',
    size: 5,
    opacity: 1,
  },
  tool: 'select',
  zoom: 1,
  canvasWidth: 1200,
  currentTemplateId: null,
  history: {
    past: [],
    future: [],
  },

  loadDesign: (elements, templateId = undefined) => {
    set({ 
      elements: JSON.parse(JSON.stringify(elements)), 
      currentTemplateId: templateId || null,
      history: { past: [], future: [] } 
    });
  },

  resetWorkshop: () => {
    set({
      elements: [],
      selectedIds: [],
      currentTemplateId: null,
      history: { past: [], future: [] }
    });
  },

  setCanvasWidth: (width) => set({ canvasWidth: width }),

  duplicateElement: (id) => {
    const { elements, saveToHistory } = get();
    const original = elements.find(el => el.id === id);
    if (!original) return;

    const newId = `el-${Date.now()}`;
    const duplicate = {
      ...JSON.parse(JSON.stringify(original)),
      id: newId,
      x: original.x + 20, // Small offset so user can see it
      y: original.y + 20,
      zIndex: elements.length + 1
    };

    saveToHistory();
    set({ 
      elements: [...elements, duplicate],
      selectedIds: [newId] // Select the new duplicate automatically
    });
  },

  saveToHistory: () => {
    const { elements, history } = get();
    // Deep clone to prevent reference leaks in history
    const snapshot = JSON.parse(JSON.stringify(elements));
    set({
      history: {
        past: [...history.past, snapshot].slice(-50),
        future: [],
      },
    });
  },

  addElement: (type, props) => {
    get().saveToHistory();
    const newElement: CanvasElement = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      fill: '#e5e7eb',
      fillType: 'color',
      fillPatternScale: 1,
      stroke: '#000000',
      strokeWidth: 0,
      opacity: 1,
      isLocked: false,
      isVisible: true,
      zIndex: get().elements.length,
      text: type === 'text' ? 'Double click to edit' : '',
      points: (type === 'brush' || type === 'line' || type === 'arrow') ? [] : undefined,
      ...props,
    };

    set((state) => ({
      elements: [...state.elements, newElement],
      selectedIds: [newElement.id],
    }));
  },

  updateElement: (id, updates) => {
    set((state) => ({
      elements: state.elements.map((el) => 
        el.id === id ? { ...el, ...updates } : el
      ),
    }));
  },

  removeElement: (id) => {
    get().saveToHistory();
    set((state) => ({
      elements: state.elements.filter((el) => el.id !== id),
      selectedIds: state.selectedIds.filter((sid) => sid !== id),
    }));
  },

  setSelectedIds: (ids) => set({ selectedIds: ids }),
  setTool: (tool) => set({ tool }),
  setZoom: (zoom) => set({ zoom }),

  undo: () => {
    const { elements, history } = get();
    if (history.past.length === 0) return;

    const previous = history.past[history.past.length - 1];
    const newPast = history.past.slice(0, history.past.length - 1);

    set({
      elements: previous,
      history: {
        past: newPast,
        future: [JSON.parse(JSON.stringify(elements)), ...history.future],
      },
    });
  },

  redo: () => {
    const { elements, history } = get();
    if (history.future.length === 0) return;

    const next = history.future[0];
    const newFuture = history.future.slice(1);

    set({
      elements: next,
      history: {
        past: [...history.past, JSON.parse(JSON.stringify(elements))],
        future: newFuture,
      },
    });
  },

  clearCanvas: () => {
    get().saveToHistory();
    set({ elements: [], selectedIds: [] });
  },
}));
