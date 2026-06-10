import React from 'react';
import { cn } from '../../../lib/utils';
import { Zap } from 'lucide-react';
import { resolveMediaUrl } from '../../../lib/media';

interface TechnologyOperationsProps {
  content: {
    title1?: string;
    title2?: string;
    items: Array<{ title: string; icon?: string }>;
  };
  styles: any;
  isEditing?: boolean;
}

const isIconAsset = (icon?: string) => {
  if (!icon) return false;
  return icon.includes('/') || /\.(svg|png|jpe?g|webp|avif)$/i.test(icon);
};

const TechnologyOperations: React.FC<TechnologyOperationsProps> = ({ content, styles, isEditing }) => {
  const hasHeading = Boolean((content.title1 && content.title1.trim()) || (content.title2 && content.title2.trim()));
  const items = content.items || [
    { title: "API integration with customers" },
    { title: "Real time E2E visibility" },
    { title: "Automated MIS" },
    { title: "Easy customer onboarding" },
    { title: "Trip planning & Automated invoicing" },
    { title: "Shop floor management for auto stock audits & placement" }
  ];

  return (
    <section 
      className="py-10 lg:py-14 font-['Georama'] transition-colors duration-300" 
      style={{ backgroundColor: !styles.backgroundColor || styles.backgroundColor === '#ffffff' ? '#F3F8FF' : styles.backgroundColor }}
    >
      <div className="max-w-[1600px] mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center mb-10 lg:mb-12 px-4">
          {hasHeading && (
            <h2 
              className="font-bold tracking-tight text-center"
              style={{ 
                fontSize: '37px', 
                lineHeight: '36px', 
                letterSpacing: '0.75px' 
              }}
            >
              {content.title1?.trim() && <span className="text-[#000000]">{content.title1}</span>}
              {content.title1?.trim() && content.title2?.trim() && ' '}
              {content.title2?.trim() && <span className="text-mahindra-red">{content.title2}</span>}
            </h2>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-x-8 lg:gap-y-6 max-w-[1400px] mx-auto">
          {items.map((item, index) => {
            const itemAny = item as any;
            const useImageIcon = isIconAsset(item.icon);
            return (
            <div 
              key={index}
              className="bg-white p-2.5 lg:p-3 pr-6 rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] flex items-center gap-4 border border-white hover:shadow-md transition-all duration-300"
            >
              <div
                className="w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: itemAny.iconBgColor || (useImageIcon ? '#ffffff' : '#E31837'),
                  border: 'none',
                  boxShadow: useImageIcon ? '0 2px 8px rgba(227, 24, 55, 0.12)' : '0 4px 12px rgba(227, 24, 55, 0.25)'
                }}
              >
                {useImageIcon ? (
                  <img
                    src={resolveMediaUrl(item.icon)}
                    alt={item.title}
                    className="w-8 h-8 lg:w-10 lg:h-10 object-contain"
                  />
                ) : (
                  <Zap className="w-5 h-5 lg:w-6 lg:h-6 text-white fill-white" style={{ color: itemAny.iconColor || '#ffffff' }} />
                )}
              </div>
              <p 
                className="font-semibold text-[#000000]/90"
                style={{ 
                  fontSize: '18px', 
                  lineHeight: '24px',
                  letterSpacing: '0px'
                }}
              >
                {item.title}
              </p>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TechnologyOperations;
