import React from 'react';
import { cn } from '../../../lib/utils';
import { resolveMediaUrl } from '../../../lib/media';
import { 
  Car, 
  ShoppingCart, 
  Shirt, 
  Monitor, 
  Pill, 
  Package,
  type LucideIcon 
} from 'lucide-react';

interface IndustriesProps {
  content: {
    title1?: string;
    title2?: string;
    title1Color?: string;
    title1BgColor?: string;
    title2Color?: string;
    title2BgColor?: string;
    
    subtitle?: string;
    subtitleColor?: string;
    subtitleBgColor?: string;
    
    cards: Array<{
      title: string;
      icon: string;
      iconColor?: string;
      iconBgColor?: string;
      titleColor?: string;
      cardBgColor?: string;
      cardBorderColor?: string;
    }>;
  };
  styles: any;
  isEditing?: boolean;
}

const iconMap: Record<string, LucideIcon> = {
  'Car': Car,
  'ShoppingCart': ShoppingCart,
  'Shirt': Shirt,
  'Monitor': Monitor,
  'Pill': Pill,
  'Package': Package,
  'Automotive': Car,
  'E-commerce': ShoppingCart,
  'Fashion': Shirt,
  'Electronics': Monitor,
  'Pharmaceutical': Pill,
  'FMCG': Package
};

const Industries: React.FC<IndustriesProps> = ({ content, styles, isEditing }) => {
  const hasHeading = Boolean((content.title1 && content.title1.trim()) || (content.title2 && content.title2.trim()));
  const isIconAsset = (icon?: string) => {
    if (!icon) return false;
    return icon.includes('/') || /\.(svg|png|jpe?g|webp|avif)$/i.test(icon);
  };
  const getStyle = (key: string, baseContent: any = content) => ({
    color: baseContent[`${key}Color`],
    backgroundColor: baseContent[`${key}BgColor`],
    padding: baseContent[`${key}BgColor`] ? '2px 8px' : undefined,
    borderRadius: baseContent[`${key}BgColor`] ? '4px' : undefined,
    border: baseContent[`${key}BorderColor`] ? `1px solid ${baseContent[`${key}BorderColor`]}` : undefined
  });

  return (
    <section className="py-8 lg:py-12 bg-white" style={{ backgroundColor: styles.backgroundColor }}>
      <div className="max-w-[1600px] mx-auto px-4 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-10 lg:mb-12 space-y-4">
          {hasHeading && (
            <h2 className="text-[32px] lg:text-[40px] font-black tracking-tight leading-tight">
              {content.title1?.trim() && (
                <span 
                  className={cn(!content.title1Color && "text-[#001a3a]")}
                  style={getStyle('title1')}
                >
                  {content.title1}
                </span>
              )}
              {content.title1?.trim() && content.title2?.trim() && ' '}
              {content.title2?.trim() && (
                <span 
                  className={cn(!content.title2Color && "text-mahindra-red")}
                  style={getStyle('title2')}
                >
                  {content.title2}
                </span>
              )}
            </h2>
          )}
          {content.subtitle && (
            <p 
              className={cn(
                "text-[15px] lg:text-[16px] leading-relaxed text-gray-500 max-w-2xl mx-auto",
                !content.subtitleColor && "text-gray-500"
              )}
              style={getStyle('subtitle')}
            >
              {content.subtitle}
            </p>
          )}
        </div>

        {/* Industries Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {content.cards?.map((card, idx) => {
            const Icon = iconMap[card.icon] || iconMap[card.title.split(' ')[0]] || Package;
            const useImageIcon = isIconAsset(card.icon);
            return (
              <div 
                key={idx} 
                className="flex items-center p-5 lg:p-6 bg-white border border-gray-100 rounded-[12px] shadow-sm hover:shadow-md transition-all duration-300 group"
                style={{
                  backgroundColor: card.cardBgColor,
                  borderColor: card.cardBorderColor
                }}
              >
                {/* Icon Box */}
                <div 
                  className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center mr-5 shrink-0 transition-transform group-hover:scale-110",
                    !card.iconBgColor && !useImageIcon && "bg-mahindra-red"
                  )}
                  style={{
                    backgroundColor: card.iconBgColor || (useImageIcon ? '#ffffff' : undefined),
                    border: 'none'
                  }}
                >
                  {useImageIcon ? (
                    <img
                      src={resolveMediaUrl(card.icon)}
                      alt={card.title}
                      className="w-10 h-10 object-contain"
                    />
                  ) : (
                    <Icon 
                      className="w-6 h-6 text-white" 
                      style={{ color: card.iconColor || 'white' }}
                    />
                  )}
                </div>

                {/* Title */}
                <h3 
                  className={cn(
                    "text-[16px] lg:text-[18px] font-bold tracking-tight",
                    !card.titleColor && "text-[#001a3a]"
                  )}
                  style={getStyle('title', card)}
                >
                  {card.title}
                </h3>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Industries;
