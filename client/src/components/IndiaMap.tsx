import React, { useMemo } from 'react';
import { INDIA_SVG_MAP } from './IndiaMapData';

interface IndiaMapProps {
  activeStateIds: string[];
  activeColor?: string;
  defaultColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  className?: string;
}

const IndiaMap: React.FC<IndiaMapProps> = ({
  activeStateIds,
  activeColor = '#E31E24',
  defaultColor = '#f9fafb',
  strokeColor = '#d1d5db',
  strokeWidth = 0.5,
  className = '',
}) => {
  // We wrap the SVG string in a div and use CSS to color the paths
  // This is much faster and more reliable in React 19 than parsing the SVG into React elements
  const styles = useMemo(() => {
    const activeSelectors = activeStateIds
      .map(id => `.india-map-svg path#${id} { fill: ${activeColor} !important; stroke: ${activeColor}; stroke-width: ${strokeWidth * 1.5}px; }`)
      .join('\n');

    return `
      .india-map-container {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }
      .india-map-svg svg {
        width: 100% !important;
        height: 100% !important;
        display: block;
        margin: auto;
      }
      .india-map-svg path {
        fill: ${defaultColor};
        stroke: ${strokeColor};
        stroke-width: ${strokeWidth}px;
        transition: all 0.3s ease;
      }
      .india-map-svg path:hover {
        fill: ${activeColor}44 !important;
        cursor: pointer;
      }
      ${activeSelectors}
    `;
  }, [activeStateIds, activeColor, defaultColor, strokeColor, strokeWidth]);

  return (
    <div className={`india-map-container ${className}`}>
      <style>{styles}</style>
      <div 
        className="india-map-svg w-full h-full" 
        dangerouslySetInnerHTML={{ __html: INDIA_SVG_MAP }} 
      />
    </div>
  );
};

export default IndiaMap;
