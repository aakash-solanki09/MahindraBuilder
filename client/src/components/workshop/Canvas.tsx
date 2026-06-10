import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, Text, Line, Transformer, Image as KonvaImage, Arrow, RegularPolygon } from 'react-konva';
import { useWorkshopStore } from '../../store/useWorkshopStore';
import useImage from 'use-image';

const UniversalElement = ({ element, isSelected, onSelect, onChange }: any) => {
  const shapeRef = React.useRef<any>(null);
  const trRef = React.useRef<any>(null);
  const [image] = useImage(element.src || '');
  const [patternImage] = useImage(element.fillPatternImage || '');

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const calculatePatternProps = () => {
    if (!patternImage || element.fillType !== 'image') return {};
    const shapeWidth = element.width || (element.type === 'circle' ? (element.radius || 25) * 2 : 100);
    const shapeHeight = element.height || (element.type === 'circle' ? (element.radius || 25) * 2 : 100);
    const scale = Math.max(shapeWidth / (patternImage.width || 1), shapeHeight / (patternImage.height || 1));
    const userScale = element.fillPatternScale || 1;
    return {
      fillPatternImage: patternImage,
      fillPatternScale: { x: scale * userScale, y: scale * userScale },
      fillPatternOffset: { x: patternImage.width / 2, y: patternImage.height / 2 },
      fillPatternX: shapeWidth / 2,
      fillPatternY: shapeHeight / 2,
      fillPatternRepeat: 'no-repeat'
    };
  };

  const commonProps = {
    ...element,
    id: element.id,
    fill: (element.fillType === 'image' && !patternImage) ? '#f3f4f6' : (element.fillType === 'image' ? undefined : element.fill),
    ...calculatePatternProps(),
    draggable: !element.isLocked,
    visible: element.isVisible,
    onClick: onSelect,
    onTap: onSelect,
    ref: shapeRef,
    onDragEnd: (e: any) => {
      onChange({ x: e.target.x(), y: e.target.y() });
    },
    onTransformEnd: () => {
      const node = shapeRef.current;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();
      node.scaleX(1);
      node.scaleY(1);
      onChange({
        x: node.x(),
        y: node.y(),
        width: Math.max(5, (node.width() || 0) * scaleX),
        height: Math.max(5, (node.height() || 0) * scaleY),
        rotation: node.rotation(),
      });
    }
  };

  const renderShape = () => {
    switch (element.type) {
      case 'rect': return <Rect {...commonProps} />;
      case 'circle': return <Circle {...commonProps} />;
      case 'triangle': return <RegularPolygon {...commonProps} sides={3} radius={(element.width || 50) / 2} />;
      case 'text': return <Text {...commonProps} text={element.text || 'Edit text'} fontStyle={element.fontWeight || '400'} />;
      case 'arrow': return <Arrow {...commonProps} points={element.points || [0, 0, 50, 50]} />;
      case 'line':
      case 'brush': return <Line {...commonProps} points={element.points} tension={0.5} lineCap="round" lineJoin="round" />;
      default: return null;
    }
  };

  return (
    <React.Fragment>
      {renderShape()}
      {isSelected && !element.isLocked && (
        <Transformer
          ref={trRef}
          rotateEnabled={true}
          anchorSize={8}
          borderStroke="#ed1c24"
          anchorStroke="#ed1c24"
          boundBoxFunc={(oldBox, newBox) => {
            if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) return oldBox;
            return newBox;
          }}
        />
      )}
    </React.Fragment>
  );
};

const Canvas: React.FC = () => {
  const { elements, selectedIds, setSelectedIds, updateElement, tool, addElement, brushSettings } = useWorkshopStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);
  const [scale, setScale] = useState(1);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });

  // 1. Calculate the dynamic design boundaries
  const getDesignWidth = () => {
    if (elements.length === 0) return 1200;
    let maxX = 0;
    elements.forEach(el => {
      maxX = Math.max(maxX, (el.x || 0) + (el.width || 0));
    });
    return Math.max(maxX + 100, 1200);
  };

  const designWidth = getDesignWidth();

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const containerWidth = entry.contentRect.width - 80; // Add some padding
        const containerHeight = entry.contentRect.height - 80;
        
        // Calculate scale to FIT the design width into the container
        const newScale = Math.min(containerWidth / designWidth, 1);
        setScale(newScale);
        setDimensions({ width: containerWidth, height: containerHeight });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [designWidth]);

  const handleMouseDown = (e: any) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (tool === 'select') {
      if (clickedOnEmpty) setSelectedIds([]);
      return;
    }
    const pos = e.target.getStage().getPointerPosition();
    if (!pos) return;
    // ADJUST FOR SCALE
    const adjustedX = pos.x / scale;
    const adjustedY = pos.y / scale;
    if (tool === 'brush') {
      addElement('brush', { points: [adjustedX, adjustedY], stroke: brushSettings.color, strokeWidth: brushSettings.size, opacity: brushSettings.opacity });
    } else {
      addElement(tool as any, { x: adjustedX, y: adjustedY, text: tool === 'text' ? 'New Text' : '' });
    }
  };

  const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div ref={containerRef} className="w-full h-full bg-[#f8f9fa] overflow-hidden flex items-center justify-center p-10">
      <div className="shadow-2xl rounded-sm bg-white overflow-hidden" style={{ width: `${designWidth * scale}px`, height: `${800 * scale}px` }}>
        <Stage
          width={designWidth * scale}
          height={800 * scale}
          scaleX={scale}
          scaleY={scale}
          onMouseDown={handleMouseDown}
          ref={stageRef}
        >
          <Layer>
            <Rect x={0} y={0} width={designWidth} height={2000} fill="#ffffff" listening={false} />
            {sortedElements.map((el) => (
              <UniversalElement
                key={el.id}
                element={el}
                isSelected={selectedIds.includes(el.id)}
                onSelect={() => setSelectedIds([el.id])}
                onChange={(newProps: any) => updateElement(el.id, newProps)}
              />
            ))}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default Canvas;
