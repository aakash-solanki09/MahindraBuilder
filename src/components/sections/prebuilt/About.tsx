import React from 'react';
import { resolveMediaUrl } from '../../../lib/media';
import { cn } from '../../../lib/utils';

interface AboutProps {
  content: {
    tagline?: string;
    taglineColor?: string;
    taglineBgColor?: string;
    taglineBorderColor?: string;

    title1?: string;
    title2?: string;
    title3?: string;
    title1Color?: string;
    title2Color?: string;
    title3Color?: string;
    title1BgColor?: string;
    title2BgColor?: string;
    title3BgColor?: string;
    title1BorderColor?: string;
    title2BorderColor?: string;
    title3BorderColor?: string;

    text: string;
    textColor?: string;
    textBgColor?: string;
    textBorderColor?: string;

    stats: Array<{ 
      label: string; 
      value: string;
      labelColor?: string;
      labelBgColor?: string;
      labelBorderColor?: string;
      valueColor?: string;
      valueBgColor?: string;
      valueBorderColor?: string;
    }>;
    image?: string;
  };
  styles: any;
  isEditing?: boolean;
  view?: 'desktop' | 'tablet' | 'mobile';
}

const About: React.FC<AboutProps> = ({ content, styles, isEditing, view }) => {
  const hasText = (value?: string) => Boolean(value && value.trim());
  const getStyle = (key: string) => ({
    color: (content as any)[`${key}Color`],
    backgroundColor: (content as any)[`${key}BgColor`],
    padding: (content as any)[`${key}BgColor`] ? '2px 8px' : undefined,
    borderRadius: (content as any)[`${key}BgColor`] ? '4px' : undefined,
    border: (content as any)[`${key}BorderColor`] ? `1px solid ${(content as any)[`${key}BorderColor`]}` : undefined
  });

  const renderTitle = () => {
    const lines = [
      { text: content.title1, key: 'title1' },
      { text: content.title2, key: 'title2' },
      { text: content.title3, key: 'title3' },
    ];

    return (
      <div className="flex flex-col items-start text-left space-y-1">
        {lines.map((line, idx) => hasText(line.text) && (
          <span 
            key={idx} 
            className={cn(
              "block w-fit",
              !(content as any)[`${line.key}Color`] && (idx === 2 || line.text?.includes('B2B') ? 'text-mahindra-red' : 'text-[#001a3a]')
            )}
            style={getStyle(line.key)}
          >
            {line.text}
          </span>
        ))}
      </div>
    );
  };

  const isDesktop = view === 'desktop';
  const hasAnyTitle = hasText(content.title1) || hasText(content.title2) || hasText(content.title3);
  
  return (
    <section className={cn("py-10 lg:py-14 overflow-hidden bg-white")} style={{ backgroundColor: styles.backgroundColor }}>
      <div className={cn("mx-auto px-4 lg:px-8", isDesktop ? "max-w-[1600px]" : "max-w-7xl")}>
        <div className={cn(
          "grid gap-12 lg:gap-24 items-center",
          isDesktop ? "grid-cols-1 lg:grid-cols-[1.1fr,0.9fr]" : "grid-cols-1"
        )}>
          
          {/* Left Content */}
          <div className="flex flex-col items-start text-left space-y-6 lg:space-y-8">
            {/* Tagline */}
            {hasText(content.tagline) && (
              <div className="flex flex-col items-start">
                <span 
                  className={cn(
                    "text-[13px] font-bold tracking-[0.1em] uppercase",
                    !content.taglineColor && "text-mahindra-red"
                  )}
                  style={getStyle('tagline')}
                >
                  {content.tagline}
                </span>
              </div>
            )}

            {/* Title */}
            {/* Title */}
            {hasAnyTitle && (
              <h2 
                className="font-black leading-[1.2] lg:leading-[1.15] tracking-tight max-w-[600px]"
                style={{
                  fontSize: view === 'mobile' ? '28px' : (view === 'tablet' ? '32px' : '44px')
                }}
              >
                {renderTitle()}
              </h2>
            )}

            {/* Description */}
            {hasText(content.text) && (
              <p 
                className={cn(
                  "leading-relaxed tracking-[0.01em]",
                  !content.textColor && "text-[#737373]"
                )}
                style={{
                  ...getStyle('text'),
                  fontSize: view === 'mobile' ? '14px' : (view === 'tablet' ? '16px' : '17px'),
                  fontWeight: 400,
                  maxWidth: '675px',
                  fontFamily: "'Georama', sans-serif"
                }}
              >
                {content.text}
              </p>
            )}

            {/* Stats Grid */}
            <div className={cn(
              "flex flex-wrap w-full pt-6 lg:pt-10 max-w-[675px]",
              view === 'desktop' ? "gap-0" : "gap-y-8"
            )}>
              {content.stats?.map((stat, idx) => (
                <div 
                  key={idx} 
                  className={cn(
                    "flex flex-col items-start text-left space-y-1 relative",
                    view === 'desktop' ? "w-1/4 pl-8" : "w-1/2",
                    (view !== 'desktop' && idx % 2 !== 0) && "pl-4",
                    (view === 'desktop' && idx === 0) && "pl-0"
                  )}
                  style={{ width: view === 'desktop' ? '25%' : '50%' }}
                >
                  <span 
                    className={cn(
                      "font-extrabold tracking-tight leading-[32px] mb-2 block",
                      !stat.valueColor && "text-[#E31837]"
                    )}
                    style={{
                      color: stat.valueColor,
                      backgroundColor: stat.valueBgColor,
                      padding: stat.valueBgColor ? '2px 6px' : undefined,
                      borderRadius: stat.valueBgColor ? '4px' : undefined,
                      border: stat.valueBorderColor ? `1px solid ${stat.valueBorderColor}` : undefined,
                      fontSize: view === 'mobile' ? '28px' : '34px',
                      fontFamily: "'Georama', sans-serif"
                    }}
                  >
                    {stat.value}
                  </span>
                  <span 
                    className={cn(
                      "font-normal tracking-wide leading-[20px] block"
                    )}
                    style={{
                      color: stat.labelColor || (stat as any).textColor || '#737373',
                      backgroundColor: stat.labelBgColor,
                      padding: stat.labelBgColor ? '2px 6px' : undefined,
                      borderRadius: stat.labelBgColor ? '4px' : undefined,
                      border: stat.labelBorderColor ? `1px solid ${stat.labelBorderColor}` : undefined,
                      fontSize: '14px',
                      maxWidth: '140px',
                      fontFamily: "'Georama', sans-serif"
                    }}
                  >
                    {stat.label}
                  </span>

                  {/* Vertical Divider */}
                  {view === 'desktop' && idx % 4 !== 3 && (
                    <div className="absolute right-0 h-12 w-[1px] bg-gray-200 top-1/2 -translate-y-1/2" />
                  )}
                  {view !== 'desktop' && idx % 2 === 0 && (
                    <div className="absolute right-0 h-12 w-[1px] bg-gray-200 top-1/2 -translate-y-1/2" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Image */}
          <div className="relative group w-full">
            <div className="aspect-[4/3] lg:aspect-[5/4] w-full overflow-hidden rounded-[24px] shadow-2xl">
              <img 
                src={resolveMediaUrl(content.image || "/assets/images/about-image.png")} 
                alt="About Logiscore" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            
            {/* Subtle Decorative */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-mahindra-red/5 rounded-full blur-3xl -z-10" />
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-mahindra-red/5 rounded-full blur-3xl -z-10" />
          </div>

        </div>
      </div>
    </section>
  );
};

export default About;
