import React, { useState, useMemo } from 'react';
import { Map as MapIcon, MapPin } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { resolveMediaUrl } from '../../../lib/media';
import IndiaMap from '../../IndiaMap';

interface Region {
  name: string;
  details: string;
  icon?: string;
  stateCode?: string;
  nameColor?: string;
  detailsColor?: string;
}

interface NetworkProps {
  content: {
    networkTitle?: string;
    networkSubtitle?: string;
    networkImage?: string;
    networkTitleColor?: string;
    networkSubtitleColor?: string;
    regions?: Region[];
  };
  styles: any;
  isEditing?: boolean;
  view?: 'desktop' | 'tablet' | 'mobile';
}

const Network: React.FC<NetworkProps> = ({ content, styles, isEditing, view }) => {
  const [activeRegion, setActiveRegion] = useState(0);
  const isDesktopView = view === 'desktop';
  const hasHeading = Boolean((content.networkTitle && content.networkTitle.trim()) || (content.networkSubtitle && content.networkSubtitle.trim()));

  const defaultRegions: Region[] = useMemo(() => [
    {
      name: "West",
      details: "Gujarat, Maharashtra, Madhya Pradesh, Rajasthan",
      stateCode: "MH"
    },
    {
      name: "North",
      details: "Haryana, Delhi, Uttar Pradesh, Punjab",
      stateCode: "DL"
    },
    {
      name: "South",
      details: "Andhra Pradesh, Karnataka, Tamil Nadu, Telangana, Kerala",
      stateCode: "KA"
    },
    {
      name: "East",
      details: "West Bengal, Jharkhand, Assam, Odisha, Bihar",
      stateCode: "WB"
    }
  ], []);

  const regions = content.regions && content.regions.length > 0 ? content.regions : defaultRegions;
  const resolvedNetworkImage = resolveMediaUrl(content.networkImage);
  const hasCustomNetworkImage = Boolean(resolvedNetworkImage);
  const safeActiveIndex = activeRegion >= regions.length ? 0 : activeRegion;
  const currentRegion = regions[safeActiveIndex];

  // SMART STATE RECOGNITION LOGIC
  const activeStateIds = useMemo(() => {
    const ids: string[] = [];
    if (currentRegion && currentRegion.details) {
      const mentionedStates = currentRegion.details
        .split(/[,;&\n]|\band\b/)
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const nameToId: Record<string, string> = {
        "Andhra Pradesh": "IN-AP", "Arunachal Pradesh": "IN-AR", "Assam": "IN-AS", "Bihar": "IN-BR",
        "Chhattisgarh": "IN-CT", "Goa": "IN-GA", "Gujarat": "IN-GJ", "Haryana": "IN-HR",
        "Himachal Pradesh": "IN-HP", "Jharkhand": "IN-JH", "Karnataka": "IN-KA", "Kerala": "IN-KL",
        "Madhya Pradesh": "IN-MP", "Maharashtra": "IN-MH", "Manipur": "IN-MN", "Meghalaya": "IN-ML",
        "Mizoram": "IN-MZ", "Nagaland": "IN-NL", "Odisha": "IN-OR", "Punjab": "IN-PB",
        "Rajasthan": "IN-RJ", "Sikkim": "IN-SK", "Tamil Nadu": "IN-TN", "Telangana": "IN-TG",
        "Tripura": "IN-TR", "Uttar Pradesh": "IN-UP", "Uttarakhand": "IN-UT", "West Bengal": "IN-WB",
        "Andaman and Nicobar Islands": "IN-AN", "Chandigarh": "IN-CH", "Dadra and Nagar Haveli": "IN-DN",
        "Daman and Diu": "IN-DD", "Delhi": "IN-DL", "Jammu and Kashmir": "IN-JK", "Ladakh": "IN-LA",
        "Lakshadweep": "IN-LD", "Puducherry": "IN-PY"
      };

      mentionedStates.forEach(state => {
        let normalized = state.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
        if (normalized === "Orissa") normalized = "Odisha";
        if (normalized === "Uttaranchal") normalized = "Uttarakhand";
        
        const id = nameToId[normalized];
        if (id) ids.push(id);
      });
    }
    return ids;
  }, [currentRegion]);


  return (
    <section
      className={cn(
        "bg-white font-['Georama'] overflow-hidden py-12",
        isDesktopView && "lg:py-14"
      )}
      style={{ backgroundColor: styles.backgroundColor }}
    >
      <div className={cn(
        "max-w-[1600px] mx-auto px-4",
        isDesktopView && "lg:px-12"
      )}>
        <div className={cn(
          "mx-auto flex flex-col items-start",
          isDesktopView && "lg:flex-row lg:gap-20 lg:items-start lg:max-w-7xl",
          !isDesktopView && "max-w-4xl"
        )}>

          {/* Content Column */}
          <div className={cn(
            "w-full flex flex-col items-start text-left order-1",
            isDesktopView && "lg:w-2/5 lg:items-start lg:text-left lg:order-2"
          )}>
            <div className="mb-12 w-full">
              {hasHeading && (
                <div className={cn(
                  "flex items-center gap-3 mb-4 justify-start",
                  isDesktopView && "lg:justify-start"
                )}>
                  <MapIcon className="w-6 h-6 text-mahindra-red" />
                  {content.networkTitle?.trim() && (
                    <h2
                      className={cn(
                        "font-bold text-[#001a3a] leading-tight text-[32px]",
                        isDesktopView && "lg:text-[36px]"
                      )}
                      style={{ color: content.networkTitleColor }}
                    >
                      {content.networkTitle}
                    </h2>
                  )}
                </div>
              )}
              {content.networkSubtitle?.trim() && (
                <p
                  className={cn(
                    "text-gray-500 leading-relaxed text-[16px] max-w-3xl",
                    isDesktopView && "lg:text-[16px] lg:mx-0"
                  )}
                  style={{ color: content.networkSubtitleColor }}
                >
                  {content.networkSubtitle}
                </p>
              )}
            </div>

            <div className="w-full space-y-4">
              {regions.map((region, index) => (
                <div
                  key={index}
                  onClick={() => setActiveRegion(index)}
                  className={cn(
                    "group cursor-pointer p-5 rounded-2xl border-2 transition-all duration-300 flex items-center gap-4",
                    safeActiveIndex === index
                      ? "bg-white border-gray-200 shadow-lg scale-[1.01]"
                      : "bg-white border-gray-50 hover:border-gray-200 shadow-sm"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300 overflow-hidden",
                    region.icon?.trim()
                      ? "bg-transparent"
                      : (safeActiveIndex === index ? "bg-mahindra-red text-white" : "bg-gray-50 text-mahindra-red group-hover:bg-gray-100")
                  )}>
                    {region.icon?.trim() ? (
                      <img
                        src={resolveMediaUrl(region.icon)}
                        alt={region.name ? `${region.name} icon` : 'Region icon'}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <MapPin className="w-5 h-5 lg:w-6 lg:h-6" />
                    )}
                  </div>
                  <div>
                    <h4
                      className="font-bold text-[#001a3a] text-[16px] lg:text-[18px]"
                      style={{ color: region.nameColor }}
                    >
                      {region.name}
                    </h4>
                    <p
                      className="text-gray-400 text-[13px] lg:text-[14px] leading-relaxed"
                      style={{ color: region.detailsColor }}
                    >
                      {region.details}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Map Column */}
          <div className={cn(
            "w-full relative group order-2 mt-16",
            isDesktopView && "lg:order-1 lg:w-3/5 lg:mt-0",
            !isDesktopView && "max-w-5xl"
          )}>
            <div className="relative">
              <div className="absolute -inset-4 bg-mahindra-blue/5 rounded-[50px] blur-3xl group-hover:bg-mahindra-red/5 transition-colors duration-700"></div>
              <div className={cn(
                "relative overflow-hidden border-white shadow-2xl transition-all duration-700 bg-gray-50 flex items-center justify-center",
                "rounded-[30px] lg:rounded-[40px] border-[8px] lg:border-[12px] p-0"
              )}>

                <div className={cn(
                  "relative w-full flex items-center justify-center",
                  "h-[450px] lg:h-[600px]"
                )}>
                  {hasCustomNetworkImage ? (
                    <img
                      src={resolvedNetworkImage}
                      alt={content.networkTitle?.trim() ? `${content.networkTitle} map` : 'Strategic network map'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <IndiaMap
                      activeStateIds={activeStateIds}
                      activeColor="#E31E24"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Network;
