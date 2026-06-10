import type { CanvasElement } from '../types/workshop';

export const compileCanvasToTailwind = (elements: CanvasElement[], canvasWidth: number = 1200) => {
  // Sort elements by zIndex to maintain layering
  const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);

  return sortedElements.map((el) => {
    const isImageFill = el.fillType === 'image' && el.fillPatternImage;
    
    // Use Pixel units for internal stability (CustomSection will handle scaling)
    const style: any = {
      position: 'absolute',
      left: `${el.x}px`,
      top: `${el.y}px`,
      width: el.width ? `${el.width}px` : 'auto',
      height: el.height ? `${el.height}px` : 'auto',
      transform: `rotate(${el.rotation}deg) scale(${el.scaleX}, ${el.scaleY})`,
      opacity: el.opacity,
      backgroundColor: isImageFill ? 'transparent' : (el.type === 'rect' || el.type === 'circle' ? el.fill : 'transparent'),
      backgroundImage: isImageFill ? `url(${el.fillPatternImage})` : 'none',
      backgroundSize: isImageFill ? 'cover' : 'auto',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      WebkitBackgroundClip: isImageFill && el.type === 'text' ? 'text' : 'border-box',
      WebkitTextFillColor: isImageFill && el.type === 'text' ? 'transparent' : 'inherit',
      borderColor: el.stroke,
      borderWidth: el.strokeWidth > 0 ? `${el.strokeWidth}px` : '0px',
      color: el.type === 'text' ? (isImageFill ? 'transparent' : el.fill) : 'inherit',
      fontSize: el.fontSize ? `${el.fontSize}px` : 'inherit',
      fontFamily: el.fontFamily || 'inherit',
      fontWeight: el.fontWeight || 'normal',
      textAlign: el.align || 'left',
      borderRadius: el.type === 'circle' ? '50%' : (el.type === 'rect' ? '24px' : '0px'),
      visibility: el.isVisible ? 'visible' : 'hidden',
      zIndex: el.zIndex,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'auto',
      boxShadow: el.type === 'rect' ? '0 10px 30px -10px rgba(0,0,0,0.1)' : 'none'
    };

    if (el.type === 'brush' || el.type === 'line') {
      return {
        ...el,
        style: {
          ...style,
          width: '100%',
          height: '100%',
          left: 0,
          top: 0,
          transform: 'none',
        }
      };
    }

    return {
      ...el,
      style
    };
  });
};
