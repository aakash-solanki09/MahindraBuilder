import React, { useState } from 'react';
import { cn } from '../../../lib/utils';
import { Users, Shield, Layers, Maximize, MapPin, Package } from 'lucide-react';
import { resolveMediaUrl } from '../../../lib/media';

interface WarehouseProps {
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
    
    cities: Array<{ 
      name: string; 
      address?: string; 
      details: string; 
      image?: string;
      features?: Array<{ title: string; description: string; icon: string }>;
    }>;
  };
  styles: any;
  isEditing?: boolean;
  view?: 'desktop' | 'tablet' | 'mobile';
}

const iconMap: any = {
  'Users': Users,
  'Shield': Shield,
  'Layers': Layers,
  'Maximize': Maximize
};

const WarehouseNetwork: React.FC<WarehouseProps> = ({ content, styles, isEditing, view }) => {
  const isDesktopView = view === 'desktop';
  const hasHeading = Boolean((content.title1 && content.title1.trim()) || (content.title2 && content.title2.trim()));
  const isIconAsset = (icon?: string) => {
    if (!icon) return false;
    return icon.includes('/') || /\.(svg|png|jpe?g|webp|avif)$/i.test(icon);
  };
  const [activeCity, setActiveCity] = useState(content.cities[0]?.name);
  const activeData = content.cities.find(c => c.name === activeCity) || content.cities[0];

  const getStyle = (key: string, baseContent: any = content) => ({
    color: baseContent[`${key}Color`],
    backgroundColor: baseContent[`${key}BgColor`],
    padding: baseContent[`${key}BgColor`] ? '2px 8px' : undefined,
    borderRadius: baseContent[`${key}BgColor`] ? '4px' : undefined,
    border: baseContent[`${key}BorderColor`] ? `1px solid ${baseContent[`${key}BorderColor`]}` : undefined
  });

  if (!content.cities || content.cities.length === 0) return null;

  return (
    <section 
      className={cn(
        "bg-white font-['Georama']",
        isDesktopView ? "py-10 lg:py-14" : "py-8"
      )} 
      style={{ backgroundColor: styles.backgroundColor }}
    >
      <div className={cn(
        "max-w-[1600px] mx-auto px-4",
        isDesktopView ? "lg:px-8" : "px-4"
      )}>
        
        {/* Header */}
        <div className={cn(
          "mx-auto text-center mb-12 space-y-4 px-4",
          isDesktopView ? "max-w-4xl" : "max-w-2xl"
        )}>
          {hasHeading && (
            <h2 
              className={cn(
                "font-bold tracking-tight text-center flex flex-col items-center justify-center",
                isDesktopView ? "flex-col lg:flex-row lg:gap-2" : "gap-1"
              )}
              style={{ 
                fontSize: view === 'mobile' ? '28px' : (view === 'tablet' ? '34px' : '42px'), 
                lineHeight: '1.2',
                letterSpacing: '0.75px'
              }}
            >
              {content.title1?.trim() && (
                <span style={getStyle('title1')} className="block">
                  {content.title1}
                </span>
              )}
              {content.title2?.trim() && (
                <span style={getStyle('title2')} className="block text-mahindra-red">
                  {content.title2}
                </span>
              )}
            </h2>
          )}
          {content.subtitle && (
            <p 
              className="text-[#737373] mx-auto max-w-2xl text-[16px] leading-[26px]"
              style={getStyle('subtitle')}
            >
              {content.subtitle}
            </p>
          )}
        </div>

        {/* Tabs Navigation */}
        <div className="max-w-[1600px] mx-auto mb-8">
          <div className={cn(
            "flex flex-nowrap gap-3 overflow-x-auto py-2 no-scrollbar px-6 lg:px-8",
            isDesktopView ? "lg:justify-center" : "justify-start"
          )}>
            {content.cities.map((city) => (
              <button 
                key={city.name} 
                onClick={() => setActiveCity(city.name)}
                className={cn(
                  "px-8 py-1.5 rounded-full text-[13px] font-bold transition-all duration-300 border text-center font-['Georama'] whitespace-nowrap shrink-0 relative overflow-hidden",
                  activeCity === city.name 
                    ? "bg-mahindra-red border-mahindra-red text-white shadow-md" 
                    : "bg-white border-gray-200 text-gray-400 hover:border-mahindra-red/30 hover:text-[#001a3a]"
                )}
              >
                {city.name}
              </button>
            ))}
          </div>
        </div>

        {/* Active Content */}
        {activeData && (
          <div className={cn(
            "flex gap-8 items-start max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 font-['Georama'] px-4",
            isDesktopView ? "flex-row lg:gap-16" : "flex-col"
          )}>
            {/* Image Side */}
            <div className={cn(
              "shrink-0",
              isDesktopView ? "w-1/2" : "w-full"
            )}>
              <div className={cn(
                "rounded-[20px] overflow-hidden shadow-xl w-full",
                isDesktopView ? "lg:h-[600px]" : "aspect-video"
              )}>
                <img 
                  src={resolveMediaUrl(activeData.image || "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80")} 
                  alt={activeData.name} 
                  className="w-full h-full object-cover" 
                />
              </div>
            </div>

            {/* Info Side */}
            <div className="flex-1 space-y-6 lg:pt-2 min-w-0">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 
                    className="font-bold tracking-tight text-[#000000]"
                    style={{ 
                      fontSize: view === 'mobile' ? '18px' : '22px', 
                      lineHeight: '1.3', 
                      letterSpacing: '0.4px' 
                    }}
                  >
                    Warehouse Services In {activeData.name}
                  </h3>
                  <div className="w-12 h-1 bg-mahindra-red rounded-full" />
                </div>
                
                {activeData.address && (
                  <div className="text-[#999999] font-bold text-[11px] uppercase tracking-[1px]">
                    {activeData.address}
                  </div>
                )}
              </div>

              <p 
                className="w-full lg:max-w-[657px]"
                style={{ 
                  fontSize: '15px', 
                  lineHeight: '24px', 
                  color: '#737373',
                  fontWeight: 400 
                }}
              >
                {activeData.details}
              </p>
              
              {/* Feature Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                {(activeData.features || [
                  { title: "Dedicate Team", description: "Specialized handlers trained for industrial and fragile goods.", icon: "Users" },
                  { title: "24/7 Security", description: "Military-grade CCTV surveillance and round-the-clock personnel.", icon: "Shield" },
                  { title: "Modern racking", description: "Heavy-duty pallet racking systems for optimized vertical storage.", icon: "Layers" },
                  { title: "Scalable Space", description: "Flexible footprint options to match your seasonal demand surges.", icon: "Maximize" }
                ]).map((feature, i) => {
                  const Icon = iconMap[feature.icon] || Package;
                  const useImageIcon = isIconAsset(feature.icon);
                  return (
                    <div 
                      key={i} 
                      className="bg-white p-5 rounded-[16px] border border-gray-100 shadow-sm flex items-start gap-4"
                    >
                      <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
                        {useImageIcon ? (
                          <img
                            src={resolveMediaUrl(feature.icon)}
                            alt={feature.title}
                            className="w-5 h-5 object-contain"
                          />
                        ) : (
                          <Icon className="w-5 h-5 text-mahindra-red" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-[15px] font-bold text-[#000000] leading-tight">{feature.title}</h4>
                        <p 
                          className="text-[13.5px] leading-[20px] text-[#737373] font-normal"
                        >
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default WarehouseNetwork;
