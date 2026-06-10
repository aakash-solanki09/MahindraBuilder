import React, { useEffect, useState, useRef, useMemo } from 'react';
import { cn } from '../../../lib/utils';
import ElementRenderer from './ElementRenderer';

interface CustomSectionProps {
  content: {
    isCanvas?: boolean;
    elements?: any[];
    canvasWidth?: number;
  };
  styles: any;
  isEditing?: boolean;
}

const CustomSection: React.FC<CustomSectionProps> = ({ content, styles }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  // Calculate the TRUE bounds of the design dynamically
  const bounds = useMemo(() => {
    if (!content.elements || content.elements.length === 0) return { width: 1200, height: 600 };
    
    let maxX = 0;
    let maxY = 0;
    
    content.elements.forEach(el => {
      const x = Number(el.x) || 0;
      const y = Number(el.y) || 0;
      const w = Number(el.width) || 0;
      const h = Number(el.height) || 0;
      
      maxX = Math.max(maxX, x + w);
      maxY = Math.max(maxY, y + h);
    });
    
    return {
      width: Math.max(maxX + 100, content.canvasWidth || 1200),
      height: Math.max(maxY + 60, 600)
    };
  }, [content.elements, content.canvasWidth]);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const currentWidth = entry.contentRect.width;
        setIsMobile(currentWidth < 768);
        setScale(currentWidth / bounds.width);
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [bounds.width]);

  if (content.isCanvas && content.elements) {
    const scaledHeight = bounds.height * scale;

    if (!isMobile) {
      return (
        <section 
          ref={containerRef}
          className="relative w-full flex justify-center overflow-hidden" 
          style={{ 
            backgroundColor: styles.backgroundColor || '#ffffff', 
            height: `${scaledHeight}px`,
            minHeight: `${scaledHeight}px`
          }}
        >
          <div 
            style={{ 
              width: `${bounds.width * scale}px`,
              height: `${bounds.height * scale}px`,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div 
              style={{ 
                width: `${bounds.width}px`,
                height: `${bounds.height}px`,
                position: 'absolute',
                left: '0',
                top: '0',
                transform: `scale(${scale})`,
                transformOrigin: 'top left'
              }}
            >
              {content.elements.map((el, idx) => (
                <div key={idx} style={el.style} className={cn("flex items-center justify-center", (el.type === 'image' || el.fillType === 'image') && 'overflow-hidden')}>
                  <ElementRenderer element={el} />
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    // MOBILE: Smart Stacking Logic (Reflow)
    const allRects = content.elements.filter(el => el.type === 'rect');
    const leafContainers = allRects.filter(rect => {
      const containsOtherRect = allRects.some(other => 
        other.id !== rect.id && other.x > rect.x && other.x < rect.x + (rect.width || 0) && other.y > rect.y && other.y < rect.y + (rect.height || 0)
      );
      return !containsOtherRect && (rect.width || 0) > 100 && rect.fillType !== 'image';
    });

    const backgroundRect = allRects.find(rect => !leafContainers.includes(rect) && (rect.width || 0) > 800);

    const stackedItems = leafContainers.map(container => {
      const children = content.elements?.filter(el => 
        el.id !== container.id && el.x >= container.x - 20 && el.x <= container.x + (container.width || 0) + 20 && el.y >= container.y - 20 && el.y <= container.y + (container.height || 0) + 20
      ) || [];
      return { container, children, y: container.y };
    });

    const standalone = content.elements.filter(el => 
      !leafContainers.some(c => c.id === el.id) && !stackedItems.some(item => item.children.some(child => child.id === el.id))
    );

    const allMobileItems = [
      ...stackedItems.map(item => ({ ...item, isCard: true })),
      ...standalone.map(el => ({ element: el, y: el.y, isCard: false }))
    ].sort((a, b) => a.y - b.y);

    return (
      <section ref={containerRef} className="py-16 px-6 flex flex-col gap-12 w-full" style={{ backgroundColor: backgroundRect?.fill || styles.backgroundColor || '#ffffff' }}>
        {allMobileItems.map((item: any, idx) => {
          if (item.isCard) {
            return (
              <div key={idx} className="w-full rounded-[2.5rem] p-10 flex flex-col items-center gap-6 shadow-md" style={{ backgroundColor: item.container.fill || '#ffffff', border: item.container.strokeWidth > 0 ? `${item.container.strokeWidth}px solid ${item.container.stroke}` : 'none' }}>
                {item.children.map((child: any, cIdx: number) => (
                  <div key={cIdx} style={{ color: child.fill, fontSize: '18px', fontWeight: child.fontWeight, textAlign: 'center' }}>
                    <ElementRenderer element={child} />
                  </div>
                ))}
              </div>
            );
          }
          return (
            <div key={idx} className="w-full text-center px-4" style={{ color: item.element.fill, fontSize: '32px', fontWeight: '900', lineHeight: '1.2' }}>
              <ElementRenderer element={item.element} />
            </div>
          );
        })}
      </section>
    );
  }

  return <section ref={containerRef} className="py-12 px-4" style={{ backgroundColor: styles.backgroundColor || '#ffffff' }}><div className="text-center opacity-20">No content available</div></section>;
};

export default CustomSection;
