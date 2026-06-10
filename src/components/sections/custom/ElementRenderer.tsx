import React from 'react';
import { resolveMediaUrl } from '../../../lib/media';

interface ElementRendererProps {
  element: any;
}

const ElementRenderer: React.FC<ElementRendererProps> = ({ element }) => {
  const isImageFill = element.fillType === 'image' || element.src || element.fillPatternImage;
  
  if (element.type === 'text') {
    return (
      <div style={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: element.align === 'center' ? 'center' : element.align === 'right' ? 'flex-end' : 'flex-start' 
      }}>
        {element.text}
      </div>
    );
  }
  
  if (element.type === 'image' || (element.type === 'rect' && isImageFill)) {
    return (
      <img 
        src={resolveMediaUrl(element.src || element.fillPatternImage)} 
        className="w-full h-full object-contain" 
        alt="" 
      />
    );
  }
  
  return null;
};

export default ElementRenderer;
