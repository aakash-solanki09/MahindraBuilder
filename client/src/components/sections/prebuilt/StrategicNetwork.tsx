import React, { useState } from 'react';
import { Map as MapIcon, MapPin } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface StrategicNetworkProps {
  content: {
    title?: string;
    subtitle?: string;
    mapImage?: string;
    regions?: Array<{
      name: string;
      details: string;
    }>;
  };
  styles: any;
  isEditing?: boolean;
}

const StrategicNetwork: React.FC<StrategicNetworkProps> = ({ content, styles, isEditing }) => {
  const [activeRegion, setActiveRegion] = useState(0);
  const hasTitle = Boolean(content.title && content.title.trim());

  const regions = content.regions || [
    { name: "South", details: "Andhra Pradesh, Karnataka, Tamil Nadu, Telangana" },
    { name: "North", details: "Haryana, Delhi, Uttar Pradesh" },
    { name: "West", details: "Gujarat, Maharashtra, Madhya Pradesh, Rajasthan" },
    { name: "East", details: "West Bengal, Jharkhand, Assam" }
  ];

  return (
    <section 
      className="py-10 lg:py-14 bg-white font-['Georama'] overflow-hidden" 
      style={{ backgroundColor: styles.backgroundColor }}
    >
      <div className="max-w-[1600px] mx-auto px-4 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
          
          {/* Map Image Column */}
          <div className="w-full lg:w-1/2 relative group">
            <div className="rounded-[40px] overflow-hidden border-[8px] border-[#0089FF] shadow-2xl transition-transform duration-500 group-hover:scale-[1.01]">
              <img 
                src="/assets/images/strategic-map.png" 
                alt="Strategic Network Map" 
                className="w-full h-auto object-cover"
              />
            </div>
            {/* Decorative Map Pins (simulated) */}
            <div className="absolute top-[20%] right-[30%] animate-bounce">
              <MapPin className="w-10 h-10 text-mahindra-red fill-mahindra-red drop-shadow-lg" />
            </div>
            <div className="absolute top-[40%] left-[15%] animate-bounce [animation-delay:200ms]">
              <MapPin className="w-10 h-10 text-mahindra-red fill-mahindra-red drop-shadow-lg" />
            </div>
            <div className="absolute bottom-[20%] left-[20%] animate-bounce [animation-delay:400ms]">
              <MapPin className="w-10 h-10 text-mahindra-red fill-mahindra-red drop-shadow-lg" />
            </div>
            <div className="absolute bottom-[15%] right-[25%] animate-bounce [animation-delay:600ms]">
              <MapPin className="w-10 h-10 text-mahindra-red fill-mahindra-red drop-shadow-lg" />
            </div>
          </div>

          {/* Content Column */}
          <div className="w-full lg:w-1/2">
            {hasTitle && (
              <div className="flex items-center gap-3 mb-6">
                <MapIcon className="w-6 h-6 text-mahindra-red" />
                <h2 className="text-[28px] lg:text-[36px] font-bold text-[#001a3a]" style={{ color: (content as any).titleColor }}>
                  {content.title}
                </h2>
              </div>
            )}
            
            {content.subtitle?.trim() && (
              <p className="text-gray-500 text-[15px] lg:text-[16px] leading-relaxed mb-10 max-w-2xl" style={{ color: (content as any).subtitleColor }}>
                {content.subtitle}
              </p>
            )}

            <div className="space-y-4">
              {regions.map((region, index) => (
                <div 
                  key={index}
                  onClick={() => setActiveRegion(index)}
                  className={cn(
                    "p-5 lg:p-6 rounded-[16px] transition-all duration-300 cursor-pointer flex items-center gap-4 border",
                    activeRegion === index 
                      ? "bg-white border-mahindra-red shadow-lg ring-1 ring-mahindra-red/20" 
                      : "bg-white border-gray-100 hover:border-gray-300 shadow-sm"
                  )}
                >
                  <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-mahindra-red" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#001a3a] text-[16px] lg:text-[18px]">
                      {region.name}
                    </h4>
                    <p className="text-gray-400 text-[13px] lg:text-[14px]">
                      {region.details}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StrategicNetwork;
