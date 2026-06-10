import React from 'react';
import { useBuilderStore } from '../../../store/useBuilderStore';
import type { HtmlElement } from '../../../types';
import { cn } from '../../../lib/utils';
import { resolveMediaUrl } from '../../../lib/media';

interface HtmlBuilderSectionProps {
  content: {
    elements?: HtmlElement[];
  };
  styles: any;
  isEditing?: boolean;
  view?: 'desktop' | 'tablet' | 'mobile';
}

const HtmlBuilderSection: React.FC<HtmlBuilderSectionProps> = ({ content, styles, isEditing, view: propView }) => {
  const { selectedHtmlElementId, setSelectedHtmlElement } = useBuilderStore();
  const [internalView, setInternalView] = React.useState<'desktop' | 'tablet' | 'mobile'>(propView || 'desktop');

  React.useEffect(() => {
    if (propView) {
      setInternalView(propView);
      return;
    }
    const handleResize = () => {
      if (window.innerWidth < 768) setInternalView('mobile');
      else if (window.innerWidth < 1024) setInternalView('tablet');
      else setInternalView('desktop');
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [propView]);

  const normalizeStyles = (s: any) => {
    if (!s) return {};
    const normalized = { ...s };
    
    const expand = (val: string) => {
      if (!val) return null;
      const p = val.trim().split(/\s+/);
      if (p.length === 1) return [p[0], p[0], p[0], p[0]];
      if (p.length === 2) return [p[0], p[1], p[0], p[1]];
      if (p.length === 3) return [p[0], p[1], p[2], p[1]];
      if (p.length === 4) return [p[0], p[1], p[2], p[3]];
      return null;
    };

    if (s.paddingTop || s.paddingRight || s.paddingBottom || s.paddingLeft || s.padding === '') {
      const parts = expand(s.padding);
      if (parts) {
        normalized.paddingTop = s.paddingTop || parts[0];
        normalized.paddingRight = s.paddingRight || parts[1];
        normalized.paddingBottom = s.paddingBottom || parts[2];
        normalized.paddingLeft = s.paddingLeft || parts[3];
      }
      delete normalized.padding;
    }

    if (s.marginTop || s.marginRight || s.marginBottom || s.marginLeft || s.margin === '') {
      const parts = expand(s.margin);
      if (parts) {
        normalized.marginTop = s.marginTop || parts[0];
        normalized.marginRight = s.marginRight || parts[1];
        normalized.marginBottom = s.marginBottom || parts[2];
        normalized.marginLeft = s.marginLeft || parts[3];
      }
      delete normalized.margin;
    }
    
    return normalized;
  };

  const renderElement = (el: HtmlElement) => {
    const isSelected = selectedHtmlElementId === el.id;
    
    const rawStyles = (
      internalView === 'mobile' ? (el.mobileStyles || {}) :
      internalView === 'tablet' ? (el.tabletStyles || {}) :
      (el.styles || {})
    );

    const activeStyles = normalizeStyles(rawStyles);
    
    const commonProps = {
      style: activeStyles,
      className: cn(
        "transition-all min-h-0",
        (!activeStyles.position || activeStyles.position === 'static') ? 'relative' : '',
        isEditing && "hover:outline hover:outline-2 hover:outline-blue-400/50 cursor-pointer",
        isEditing && isSelected && "outline outline-2 outline-blue-500 ring-2 ring-blue-500/20 z-10"
      ),
      onClick: (e: React.MouseEvent) => {
        if (!isEditing) return;
        e.stopPropagation();
        setSelectedHtmlElement(el.id);
      }
    };

    const renderChildren = () => el.children?.map((child) => renderElement(child));
    const hasChildren = !!(el.children && el.children.length > 0);
    const renderContent = (fallback: string) => (el.content ? el.content : hasChildren ? renderChildren() : fallback);
    const inputType = (el.attributes?.type || 'text').toLowerCase();
    const isCheckboxOrRadio = inputType === 'checkbox' || inputType === 'radio';

    switch (el.type) {
      case 'div':
        return (
          <div key={el.id} {...commonProps}>
            {renderChildren()}
            {isEditing && (!el.children || el.children.length === 0) && (
              <div className="w-full h-full min-w-[100px] min-h-[40px] flex items-center justify-center opacity-0 hover:opacity-100 bg-blue-50/50 text-[10px] text-blue-500 font-medium border border-dashed border-blue-200">
                Empty Div
              </div>
            )}
          </div>
        );
      case 'form':
        return (
          <form
            key={el.id}
            {...commonProps}
            action={el.attributes?.action || undefined}
            method={el.attributes?.method || undefined}
            target={el.attributes?.target || undefined}
            noValidate={el.attributes?.novalidate !== undefined}
          >
            {renderChildren()}
            {isEditing && (!el.children || el.children.length === 0) && (
              <div className="w-full h-full min-w-[100px] min-h-[40px] flex items-center justify-center opacity-0 hover:opacity-100 bg-blue-50/50 text-[10px] text-blue-500 font-medium border border-dashed border-blue-200">
                Empty Form
              </div>
            )}
          </form>
        );
      case 'label':
        return (
          <label key={el.id} {...commonProps} htmlFor={el.attributes?.for || el.attributes?.htmlFor}>
            {renderContent('Label')}
          </label>
        );
      case 'heading':
        return <h2 key={el.id} {...commonProps}>{renderContent('Heading')}</h2>;
      case 'paragraph':
        return <p key={el.id} {...commonProps}>{renderContent('Paragraph text...')}</p>;
      case 'span':
        return <span key={el.id} {...commonProps}>{renderContent('Span')}</span>;
      case 'link':
        return (
          <a
            key={el.id}
            {...commonProps}
            href={el.attributes?.href || '#'}
            target={el.attributes?.target || undefined}
            rel={el.attributes?.rel || undefined}
          >
            {renderContent('Link')}
          </a>
        );
      case 'image':
        if (el.styles.isBackground === 'true') {
          return (
            <div 
              key={el.id}
              {...commonProps} 
              style={{ 
                ...commonProps.style, 
                backgroundImage: `url('${resolveMediaUrl(el.content || 'https://images.unsplash.com/photo-1553413077-190dd305871c')}')`,
                backgroundSize: activeStyles.backgroundSize || 'cover',
                backgroundPosition: activeStyles.backgroundPosition || 'center'
              }}
            >
              {renderChildren()}
              {isEditing && (!el.children || el.children.length === 0) && (
                <div className="w-full h-full min-w-[100px] min-h-[40px] flex items-center justify-center opacity-0 hover:opacity-100 bg-blue-50/50 text-[10px] text-blue-500 font-medium border border-dashed border-blue-200">
                  Empty Background Image Container
                </div>
              )}
            </div>
          );
        }
        return (
          <img 
            key={el.id} 
            {...commonProps} 
            src={resolveMediaUrl(el.content || 'https://images.unsplash.com/photo-1553413077-190dd305871c')} 
            alt={el.attributes?.alt || ''} 
          />
        );
      case 'button':
        return (
          <button
            key={el.id}
            {...commonProps}
            type={(el.attributes?.type || 'button') as 'button' | 'submit' | 'reset'}
          >
            {renderContent('Button')}
          </button>
        );
      case 'input':
        return (
          <input
            key={el.id}
            {...commonProps}
            type={inputType as any}
            name={el.attributes?.name || undefined}
            id={el.attributes?.id || undefined}
            placeholder={el.attributes?.placeholder || undefined}
            defaultValue={el.attributes?.value || el.content || ''}
            defaultChecked={isCheckboxOrRadio ? el.attributes?.checked !== undefined && el.attributes?.checked !== 'false' : undefined}
            required={el.attributes?.required !== undefined}
            maxLength={el.attributes?.maxlength ? Number(el.attributes.maxlength) : undefined}
            size={el.attributes?.size ? Number(el.attributes.size) : undefined}
            className={cn(commonProps.className, !el.styles?.border && "border border-gray-300 rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-mahindra-red")}
          />
        );
      case 'textarea':
        return (
          <textarea
            key={el.id}
            {...commonProps}
            name={el.attributes?.name || undefined}
            id={el.attributes?.id || undefined}
            placeholder={el.attributes?.placeholder || undefined}
            defaultValue={el.content || el.attributes?.value || ''}
            required={el.attributes?.required !== undefined}
            maxLength={el.attributes?.maxlength ? Number(el.attributes.maxlength) : undefined}
            rows={el.attributes?.rows ? Number(el.attributes.rows) : undefined}
            cols={el.attributes?.cols ? Number(el.attributes.cols) : undefined}
            className={cn(commonProps.className, !el.styles?.border && "border border-gray-300 rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-mahindra-red")}
          />
        );
      case 'select':
        return (
          <select
            key={el.id}
            {...commonProps}
            name={el.attributes?.name || undefined}
            id={el.attributes?.id || undefined}
            defaultValue={el.attributes?.value || ''}
            required={el.attributes?.required !== undefined}
            className={cn(commonProps.className, !el.styles?.border && "border border-gray-300 rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-mahindra-red bg-white")}
          >
            {renderChildren()}
          </select>
        );
        return (
          <select
            key={el.id}
            {...commonProps}
            name={el.attributes?.name || undefined}
            id={el.attributes?.id || undefined}
            defaultValue={el.attributes?.value || ''}
            required={el.attributes?.required !== undefined}
          >
            {renderChildren()}
          </select>
        );
      case 'option':
        return (
          <option key={el.id} value={el.attributes?.value || el.content || ''}>
            {renderContent('Option')}
          </option>
        );
      default:
        return null;
    }
  };

  if (!content.elements || content.elements.length === 0) {
    return (
      <section className="py-12 px-4 min-h-[100px] flex items-center justify-center border-2 border-dashed border-gray-300" style={{ backgroundColor: styles?.backgroundColor || '#ffffff' }}>
        <div className="text-center opacity-50 font-medium">No HTML elements added yet. Select this section to add elements.</div>
      </section>
    );
  }

  const rootElement = content.elements?.find(el => el.id === 'root-container') || content.elements?.[0];
  const rootStyles = rootElement ? (
    internalView === 'mobile' ? (rootElement.mobileStyles || {}) :
    internalView === 'tablet' ? (rootElement.tabletStyles || {}) :
    (rootElement.styles || {})
  ) : {};

  return (
    <section 
      style={{ 
        ...styles,
        minHeight: rootStyles?.minHeight || rootStyles?.height || styles?.minHeight || 'auto'
      }}
      onClick={() => isEditing && setSelectedHtmlElement(null)}
      className="w-full relative"
    >
      {content.elements.map(el => renderElement(el))}
    </section>
  );
};

export default HtmlBuilderSection;
