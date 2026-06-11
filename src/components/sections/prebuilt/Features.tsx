import React from 'react';
import { resolveMediaUrl } from '../../../lib/media';
import { cn } from '../../../lib/utils';

interface FeaturesProps {
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
      description: string;
      image?: string;
      link?: string;
      titleColor?: string;
      titleBgColor?: string;
      descriptionColor?: string;
      descriptionBgColor?: string;
      cardBgColor?: string;
      cardBorderColor?: string;
    }>;
  };
  styles: any;
  isEditing?: boolean;
}

const Features: React.FC<FeaturesProps> = ({ content, styles, isEditing }) => {
  const hasHeading = Boolean((content.title1 && content.title1.trim()) || (content.title2 && content.title2.trim()));
  const getStyle = (key: string, baseContent: any = content) => ({
    color: baseContent[`${key}Color`],
    backgroundColor: baseContent[`${key}BgColor`],
    padding: baseContent[`${key}BgColor`] ? '2px 8px' : undefined,
    borderRadius: baseContent[`${key}BgColor`] ? '4px' : undefined,
    border: baseContent[`${key}BorderColor`] ? `1px solid ${baseContent[`${key}BorderColor`]}` : undefined
  });

  const getResolvedLink = (rawLink?: string) => {
    const link = rawLink?.trim();
    if (!link) return '';
    if (/^(https?:)?\/\//i.test(link) || link.startsWith('/') || link.startsWith('#') || link.startsWith('mailto:') || link.startsWith('tel:')) {
      return link;
    }
    return `https://${link}`;
  };

  return (
    <section className="py-10 lg:py-14 bg-[#F8FBFF]" style={{ backgroundColor: styles.backgroundColor }}>
      <div className="max-w-[1600px] mx-auto px-4 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-10 lg:mb-12 space-y-4">
          {hasHeading && (
            <h2 className="text-[32px] lg:text-[48px] font-black tracking-tight leading-tight">
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
                "text-[15px] lg:text-[16px] leading-relaxed max-w-2xl mx-auto",
                !content.subtitleColor && "text-gray-500"
              )}
              style={getStyle('subtitle')}
            >
              {content.subtitle}
            </p>
          )}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {content.cards?.map((card, idx) => {
            const cardClasses = "bg-white rounded-[12px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 group border border-gray-100 flex flex-col";
            const resolvedLink = getResolvedLink(card.link);
            const CardTag = resolvedLink ? 'a' : 'div';
            const cardProps = resolvedLink ? {
              href: isEditing ? undefined : resolvedLink,
              target: "_blank",
              rel: "noopener noreferrer",
              onClick: isEditing ? (e: React.MouseEvent) => e.preventDefault() : undefined
            } : {};

            return (
              <CardTag
                key={idx}
                className={cn(cardClasses, resolvedLink && "cursor-pointer")}
                style={{
                  backgroundColor: card.cardBgColor,
                  borderColor: card.cardBorderColor
                }}
                {...cardProps}
              >
              <>
                {/* Card Image */}
                <div className="aspect-[16/10] overflow-hidden relative rounded-t-[12px] bg-[#EEF3F9]">
                  <img 
                    src={resolveMediaUrl(card.image || "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80")} 
                    alt={card.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                    style={{ imageRendering: 'auto' }}
                  />
                </div>

                {/* Card Content */}
                <div className="p-8 flex flex-col items-start flex-grow w-full">
                  <h3 
                    className={cn(
                      "text-[20px] font-bold mb-3 tracking-tight",
                      !card.titleColor && "text-[#001a3a]"
                    )}
                    style={getStyle('title', card)}
                  >
                    {card.title}
                  </h3>
                  
                  {/* Red Underline */}
                  <div 
                    className="w-8 h-[2px] bg-mahindra-red mb-4" 
                    style={{ backgroundColor: styles.primaryColor || '#E31837' }}
                  />

                  <p 
                    className={cn(
                      "text-[14px] leading-relaxed text-left flex-grow",
                      !card.descriptionColor && "text-gray-500"
                    )}
                    style={getStyle('description', card)}
                  >
                    {card.description}
                  </p>

                  {resolvedLink && (
                    <div 
                      className="mt-6 flex items-center gap-1.5 text-[12px] font-extrabold text-mahindra-red uppercase tracking-wider group-hover:text-red-700 transition-colors"
                      style={{ color: styles.primaryColor || '#E31837' }}
                    >
                      Read More
                      <svg className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </div>
                  )}
                </div>
              </>
              </CardTag>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
