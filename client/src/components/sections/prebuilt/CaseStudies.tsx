import React from 'react';
import { ArrowRight, TrendingUp, Zap, Activity, Clock } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { resolveMediaUrl } from '../../../lib/media';

interface CaseStudy {
  title: string;
  subtitle: string;
  icon: string;
  link?: string;
}

interface CaseStudiesProps {
  content: {
    title1?: string;
    title2?: string;
    readStoryText?: string;
    readStoryTextColor?: string;
    items?: CaseStudy[];
  };
  styles: any;
  isEditing?: boolean;
  view?: 'desktop' | 'tablet' | 'mobile';
}

const iconMap: any = {
  'TrendingUp': TrendingUp,
  'Zap': Zap,
  'Activity': Activity,
  'Clock': Clock
};

const isIconAsset = (icon?: string) => {
  if (!icon) return false;
  return icon.includes('/') || /\.(svg|png|jpe?g|webp|avif)$/i.test(icon);
};

const CaseStudies: React.FC<CaseStudiesProps> = ({ content, styles, isEditing, view }) => {
  const hasHeading = Boolean((content.title1 && content.title1.trim()) || (content.title2 && content.title2.trim()));
  const items = content.items || [
    {
      title: "Unlocked 12% Inventory Holding Cost",
      subtitle: "for a Leading Steel Manufacturer",
      icon: "TrendingUp",
      link: ""
    },
    {
      title: "Unlocked 200% Monthly Volume Growth",
      subtitle: "for a Global Manufacturer Through B2B Express Services",
      icon: "Zap",
      link: ""
    },
    {
      title: "Achieved 97% Efficiency in Pharma Distribution",
      subtitle: "with B2B Express Solutions",
      icon: "Activity",
      link: ""
    },
    {
      title: "Engineered Efficiency with 98% On-Time Delivery",
      subtitle: "Rate for a Ayurvedic Brand",
      icon: "Clock",
      link: ""
    }
  ];

  return (
    <section 
      className="py-10 lg:py-14 font-['Georama'] overflow-hidden" 
      style={{ backgroundColor: styles.backgroundColor || '#F3F8FF' }}
    >
      <div className="max-w-[1600px] mx-auto px-4 lg:px-8">
        {/* Header */}
        {hasHeading && (
          <div className="text-center mb-8 lg:mb-10">
            <h2 className="text-[32px] lg:text-[42px] font-bold">
              {content.title1?.trim() && <span className="text-[#000000]">{content.title1}</span>}
              {content.title1?.trim() && content.title2?.trim() && ' '}
              {content.title2?.trim() && <span className="text-mahindra-red">{content.title2}</span>}
            </h2>
          </div>
        )}

        {/* Grid */}
        <div className={cn(
          "grid gap-6 lg:gap-8 max-w-7xl mx-auto",
          view === 'mobile' ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
        )}>
          {items.map((item, index) => {
            const Icon = iconMap[item.icon] || TrendingUp;
            const useImageIcon = isIconAsset(item.icon);
            const itemAny = item as any;
            return (
              <div 
                key={index}
                className={cn(
                  'bg-white rounded-[24px] border border-gray-50 shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden',
                  useImageIcon ? 'p-0 flex flex-col min-h-[520px] lg:min-h-[540px]' : 'p-6 lg:p-8 flex items-start gap-6 min-h-[220px]'
                )}
              >
                {useImageIcon ? (
                  <>
                    <div className={cn('w-full overflow-hidden bg-gray-100', view === 'mobile' ? 'h-[310px]' : 'h-[280px] lg:h-[300px]')}>
                      <img
                        src={resolveMediaUrl(item.icon)}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="flex flex-1 flex-col px-6 py-6 lg:px-8 lg:py-7 space-y-2">
                      <h3 className="text-[#001a3a] font-bold text-[18px] lg:text-[20px] leading-tight group-hover:text-mahindra-red transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-gray-400 text-[14px] lg:text-[15px] leading-relaxed">
                        {item.subtitle}
                      </p>

                      <div className="pt-4 mt-auto">
                        <a
                          href={item.link || '#'}
                          target={item.link?.startsWith('http') ? '_blank' : undefined}
                          rel={item.link?.startsWith('http') ? 'noopener noreferrer' : undefined}
                          onClick={(e) => {
                            if (isEditing || !item.link?.trim()) {
                              e.preventDefault();
                            }
                          }}
                          className={cn(
                            'inline-flex items-center gap-2 font-bold text-[13px] lg:text-[14px] transition-all',
                            item.link?.trim() && !isEditing ? 'hover:gap-3' : 'opacity-60 cursor-not-allowed'
                          )}
                          style={{ color: content.readStoryTextColor || '#E31837' }}
                        >
                          {content.readStoryText?.trim() || 'Read Full Story'}
                          <ArrowRight className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      className="w-12 h-12 lg:w-14 lg:h-14 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300"
                      style={{
                        backgroundColor: itemAny.iconBgColor || '#E31837',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(227, 24, 55, 0.25)'
                      }}
                    >
                      <Icon className="w-6 h-6 lg:w-7 lg:h-7 text-white" style={{ color: itemAny.iconColor || '#ffffff' }} />
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-[#001a3a] font-bold text-[18px] lg:text-[20px] leading-tight group-hover:text-mahindra-red transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-gray-400 text-[14px] lg:text-[15px] leading-relaxed">
                        {item.subtitle}
                      </p>

                      <div className="pt-4">
                        <a
                          href={item.link || '#'}
                          target={item.link?.startsWith('http') ? '_blank' : undefined}
                          rel={item.link?.startsWith('http') ? 'noopener noreferrer' : undefined}
                          onClick={(e) => {
                            if (isEditing || !item.link?.trim()) {
                              e.preventDefault();
                            }
                          }}
                          className={cn(
                            'inline-flex items-center gap-2 font-bold text-[13px] lg:text-[14px] transition-all',
                            item.link?.trim() && !isEditing ? 'hover:gap-3' : 'opacity-60 cursor-not-allowed'
                          )}
                          style={{ color: content.readStoryTextColor || '#E31837' }}
                        >
                          {content.readStoryText?.trim() || 'Read Full Story'}
                          <ArrowRight className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CaseStudies;
