import React from 'react';
import { useBuilderStore } from '../../store/useBuilderStore';
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor, KeyboardSensor, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable';
import { cn } from '../../lib/utils';
import SortableSection from './SortableSection';
import SectionWorkshop from '../SectionWorkshop';
import HtmlWorkshop from '../workshop/HtmlWorkshop';

interface CanvasProps {
  moveSection: (id: string, direction: 'up' | 'down') => void;
  setShowStylePanel: (show: boolean) => void;
}

const Canvas: React.FC<CanvasProps> = ({ moveSection, setShowStylePanel }) => {
  // Properly subscribe to store changes to ensure re-renders on updates
  const page = useBuilderStore((state) => state.page);
  const selectedSectionId = useBuilderStore((state) => state.selectedSectionId);
  const setSelectedSection = useBuilderStore((state) => state.setSelectedSection);
  const removeSection = useBuilderStore((state) => state.removeSection);
  const view = useBuilderStore((state) => state.view);
  const reorderSections = useBuilderStore((state) => state.reorderSections);
  const isWorkshopMode = useBuilderStore((state) => state.isWorkshopMode);
  const isHtmlWorkshopMode = useBuilderStore((state) => state.isHtmlWorkshopMode);
  const loadLogisticsTemplate = useBuilderStore((state) => state.loadLogisticsTemplate);
  const deviceFrameRef = React.useRef<HTMLDivElement>(null);
  const [ctaFloatingStyle, setCtaFloatingStyle] = React.useState<React.CSSProperties>({});

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = page.sections.findIndex((s) => s.id === active.id);
      const newIndex = page.sections.findIndex((s) => s.id === over.id);
      
      const newSections = arrayMove(page.sections, oldIndex, newIndex);
      reorderSections(newSections);
    }
  };

  React.useEffect(() => {
    const updateCtaPosition = () => {
      if (view === 'desktop' || !deviceFrameRef.current) {
        setCtaFloatingStyle({});
        return;
      }

      const rect = deviceFrameRef.current.getBoundingClientRect();
      const buttonSize = view === 'tablet' ? 56 : 48;
      const offset = view === 'tablet' ? 20 : 16;

      setCtaFloatingStyle({
        position: 'fixed',
        left: rect.right - buttonSize - offset,
        top: rect.bottom - buttonSize - offset,
        zIndex: 9999,
      });
    };

    updateCtaPosition();
    window.addEventListener('resize', updateCtaPosition);
    window.addEventListener('scroll', updateCtaPosition, true);

    return () => {
      window.removeEventListener('resize', updateCtaPosition);
      window.removeEventListener('scroll', updateCtaPosition, true);
    };
  }, [view]);

  const scrollToHeroForm = React.useCallback(() => {
    const targets = Array.from(document.querySelectorAll<HTMLElement>('[data-hero-form-target="true"]'));
    const visibleTarget = targets.find((element) => {
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });

    if (!visibleTarget) return;

    if (view !== 'desktop' && deviceFrameRef.current) {
      const container = deviceFrameRef.current;
      const containerRect = container.getBoundingClientRect();
      const targetRect = visibleTarget.getBoundingClientRect();
      const nextScrollTop =
        container.scrollTop +
        (targetRect.top - containerRect.top) -
        Math.max(24, container.clientHeight * 0.12);

      container.scrollTo({
        top: Math.max(0, nextScrollTop),
        behavior: 'smooth',
      });
    } else {
      visibleTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    visibleTarget.animate(
      [
        { transform: 'scale(1)', boxShadow: '0 0 0 rgba(227, 24, 55, 0)' },
        { transform: 'scale(1.02)', boxShadow: '0 0 0 10px rgba(227, 24, 55, 0.12)' },
        { transform: 'scale(1)', boxShadow: '0 0 0 rgba(227, 24, 55, 0)' }
      ],
      { duration: 700, easing: 'ease-out' }
    );
  }, []);

  const floatingCta = page.meta?.floatingCta;
  const floatingCtaText = floatingCta?.text?.trim() || 'Get Free Quote';
  const floatingCtaBg = floatingCta?.backgroundColor || '#E31837';
  const floatingCtaTextColor = floatingCta?.textColor || '#ffffff';
  const floatingCtaBorderColor = floatingCta?.borderColor || '';

  if (isWorkshopMode) return <SectionWorkshop />;
  if (isHtmlWorkshopMode) return <HtmlWorkshop />;

  return (
    <div className={cn(
      "flex-1 bg-gray-100 p-4 lg:p-8 custom-scrollbar scroll-smooth transition-all",
      view === 'desktop' ? "overflow-y-auto" : "overflow-hidden flex items-center justify-center"
    )}>
      <div
        ref={deviceFrameRef}
        className={cn(
        "relative mx-auto transition-all duration-700 ease-in-out shadow-2xl ring-1 ring-black/5 bg-white custom-scrollbar",
        view === 'desktop' ? "w-full max-w-[1920px] rounded-[2.5rem] overflow-x-visible" : 
        view === 'tablet' ? "w-[768px] h-[85vh] rounded-[3rem] ring-[12px] ring-gray-900 shadow-3xl tablet-mode overflow-y-auto" : 
        "w-[480px] h-[85vh] rounded-[3.5rem] ring-[12px] ring-gray-900 shadow-3xl mobile-mode overflow-y-auto"
      )}
      >
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={page.sections.map(s => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col min-h-full">
              {page.sections.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-40 text-gray-300">
                  <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 border-2 border-dashed border-gray-200">
                    <Plus className="w-10 h-10 opacity-20" />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-widest mb-2 text-gray-400">Empty Canvas</h3>
                  <p className="text-xs font-medium text-gray-300 mb-8">Add sections from the sidebar or load a preset</p>
                  
                  <button 
                    onClick={loadLogisticsTemplate}
                    className="flex items-center gap-2 bg-mahindra-red text-white px-6 py-3 rounded-full font-bold text-sm hover:scale-105 transition-transform shadow-lg active:scale-95"
                  >
                    Load Mahindra Template
                  </button>
                </div>
              ) : (
                page.sections.map((section) => (
                  <SortableSection
                    key={section.id}
                    section={section}
                    isSelected={selectedSectionId === section.id}
                    onSelect={() => setSelectedSection(section.id)}
                    onRemove={() => removeSection(section.id)}
                    onMove={(dir) => moveSection(section.id, dir)}
                    onStyleOpen={() => {
                      setSelectedSection(section.id);
                      setShowStylePanel(true);
                      // Note: activeTab set to 'edit' should be handled in AdminBuilder or via store
                    }}
                    view={view}
                    hideControls={view !== 'desktop'}
                  />
                ))
              )}
            </div>
          </SortableContext>
        </DndContext>

        {/* Sticky CTA Preview */}
        <div
          className={view === 'desktop' ? 'fixed z-[9999] bottom-6 right-6' : 'fixed z-[9999]'}
          style={view === 'desktop' ? undefined : ctaFloatingStyle}
        >
          <button
            type="button"
            onClick={scrollToHeroForm}
            aria-label={floatingCtaText}
            className={`pointer-events-auto bg-mahindra-red text-white shadow-2xl font-bold flex items-center justify-center transition-all hover:scale-110 active:scale-95 rounded-full overflow-hidden ${
              view === 'desktop' ? 'px-8 py-4' : view === 'tablet' ? 'w-14 h-14' : 'w-12 h-12'
            }`}
            style={{
              backgroundColor: floatingCtaBg,
              color: floatingCtaTextColor,
              border: floatingCtaBorderColor ? `2px solid ${floatingCtaBorderColor}` : undefined,
            }}
          >
            {view === 'desktop' ? (
              <span className="flex items-center gap-3">{floatingCtaText}</span>
            ) : (
              <svg
                className={`${view === 'tablet' ? 'w-7 h-7' : 'w-6 h-6'}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M17 7L7 17M17 7H7M17 7V17"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Internal Helper for the empty state Plus icon
const Plus = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

export default Canvas;
