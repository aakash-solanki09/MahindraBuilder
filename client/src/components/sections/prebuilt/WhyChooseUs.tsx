import React from 'react';
import { CheckCircle2, ShieldCheck, Globe2, Cpu } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { resolveMediaUrl } from '../../../lib/media';

interface WhyChooseUsProps {
  content: {
    title1?: string;
    title2?: string;
    subtitle?: string;
    cards?: Array<{
      title: string;
      icon: string;
      points: string[] | string;
      isFeatured?: boolean;
    }>;
  };
  styles: any;
  isEditing?: boolean;
  view?: 'desktop' | 'tablet' | 'mobile';
}

const WhyChooseUs: React.FC<WhyChooseUsProps> = ({ content, styles, isEditing, view }) => {
  const isDesktopView = view === 'desktop';
  const [hoveredCard, setHoveredCard] = React.useState<number | null>(null);
  const hasHeading = Boolean((content.title1 && content.title1.trim()) || (content.title2 && content.title2.trim()));
  const cards = content.cards || [
    {
      title: "Dependable Operations",
      icon: "ShieldCheck",
      isFeatured: true,
      points: [
        "Consistent service delivery",
        "Reduced DEPS (Damage, Excess, Pilferage, Shortage)",
        "Prompt customer support",
        "Optimised TAT with transparent pricing"
      ]
    },
    {
      title: "Extensive Reach",
      icon: "Globe2",
      points: [
        "19,000+ pin codes across the country",
        "260+ strategically placed hubs & DCs",
        "16+ state-of-the-art processing centres",
        "190+ regional branches & terminals"
      ]
    },
    {
      title: "Best-in-Class Technology",
      icon: "Cpu",
      points: [
        "End-to-end operational visibility",
        "Real-time tracking for customers",
        "Seamless and quick onboarding",
        "Automated billing and reporting"
      ]
    }
  ];

  const getIcon = (iconName: string, isHovered: boolean, card: any) => {
    const isIconAsset = iconName && (iconName.includes('/') || /\.(svg|png|jpe?g|webp|avif)$/i.test(iconName));
    if (isIconAsset) {
      return (
        <img
          src={resolveMediaUrl(iconName)}
          alt={card.title || 'icon'}
          className="w-6 h-6 object-contain"
        />
      );
    }

    const props = {
      className: "w-6 h-6 transition-colors duration-300",
      style: {
        color: isHovered ? (card.iconHoverColor || '#E31837') : (card.iconColor || '#ffffff')
      }
    };
    switch (iconName) {
      case 'ShieldCheck': return <ShieldCheck {...props} />;
      case 'Globe2': return <Globe2 {...props} />;
      case 'Cpu': return <Cpu {...props} />;
      default: return <ShieldCheck {...props} />;
    }
  };

  return (
    <section 
      className={cn(
        "bg-white font-['Georama'] overflow-hidden",
        isDesktopView ? "py-12 lg:py-14" : "py-8"
      )}
      style={{ backgroundColor: styles.backgroundColor }}
    >
      <div className={cn(
        "max-w-[1600px] mx-auto px-4",
        isDesktopView ? "lg:px-8" : "px-4"
      )}>
        {/* Header */}
        <div className={cn(
          "text-center mx-auto mb-10 lg:mb-12",
          isDesktopView ? "max-w-3xl" : "max-w-xl"
        )}>
          {hasHeading && (
            <h2 className={cn(
              "font-bold mb-4",
              isDesktopView ? "text-[32px] lg:text-[42px]" : "text-[28px]"
            )}>
              {content.title1?.trim() && <span style={{ color: (content as any).title1Color || '#000000' }}>{content.title1}</span>}
              {content.title1?.trim() && content.title2?.trim() && ' '}
              {content.title2?.trim() && <span style={{ color: (content as any).title2Color || 'var(--mahindra-red)' }}>{content.title2}</span>}
            </h2>
          )}
          {content.subtitle?.trim() && (
            <p 
              className="text-gray-500 text-[14px] lg:text-[16px] leading-relaxed"
              style={{ color: (content as any).subtitleColor }}
            >
              {content.subtitle}
            </p>
          )}
        </div>

        {/* Cards Grid */}
        <div className={cn(
          "grid gap-6 lg:gap-8 mx-auto mb-4 lg:mb-6",
          isDesktopView ? "grid-cols-1 lg:grid-cols-3 max-w-7xl" : "grid-cols-1 max-w-4xl"
        )}>
          {cards.map((card, index) => {
            const isHovered = hoveredCard === index;
            const cardAny = card as any;
            const useImageIcon = !!card.icon && (card.icon.includes('/') || /\.(svg|png|jpe?g|webp|avif)$/i.test(card.icon));
            const activeTitleBg = isHovered ? cardAny.titleHoverBgColor : cardAny.titleBgColor;
            const activeTitleBorder = isHovered ? cardAny.titleHoverBorderColor : cardAny.titleBorderColor;
            const activePointsBg = isHovered ? cardAny.pointsHoverBgColor : cardAny.pointsBgColor;
            const activePointsBorder = isHovered ? cardAny.pointsHoverBorderColor : cardAny.pointsBorderColor;
            const points: string[] = Array.isArray(card.points)
              ? card.points
              : (typeof card.points === 'string'
                ? card.points.split(',').map((p: string) => p.trim()).filter(Boolean)
                : []);

            return (
            <div 
              key={index}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
              className="rounded-[24px] p-6 lg:p-8 flex flex-col"
              style={{
                backgroundColor: isHovered ? (cardAny.hoverCardBgColor || '#E31837') : (cardAny.cardBgColor || '#ffffff'),
                border: `1px solid ${isHovered ? (cardAny.hoverCardBorderColor || '#E31837') : (cardAny.cardBorderColor || '#f3f4f6')}`,
                boxShadow: isHovered ? '0 20px 40px rgba(0,0,0,0.15)' : '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
                transition: 'background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
                color: isHovered ? '#ffffff' : '#000000',
              }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-8 shrink-0"
                style={{
                  backgroundColor: isHovered
                    ? (cardAny.iconHoverBgColor || (useImageIcon ? '#ffffff' : '#ffffff'))
                    : (cardAny.iconBgColor || (useImageIcon ? '#ffffff' : '#E31837')),
                  border: 'none',
                  transition: 'background-color 0.3s ease',
                }}>
                {getIcon(card.icon, isHovered, cardAny)}
              </div>
              
              <h3
                className="text-[20px] lg:text-[22px] font-bold mb-8 leading-tight"
                style={{
                  color: isHovered ? (cardAny.titleHoverColor || '#ffffff') : (cardAny.titleColor || '#000000'),
                  transition: 'color 0.3s ease, background-color 0.3s ease',
                backgroundColor: activeTitleBg,
                padding: activeTitleBg ? '2px 8px' : undefined,
                borderRadius: activeTitleBg ? '4px' : undefined,
                border: activeTitleBorder ? `1px solid ${activeTitleBorder}` : undefined,
              }}>
                {card.title}
              </h3>

              <ul className="space-y-4 mt-auto">
                {points.map((point: string, pIdx: number) => (
                  <li key={pIdx} className="flex items-start gap-3">
                    <CheckCircle2
                      className="w-5 h-5 shrink-0 mt-0.5"
                      style={{ color: isHovered ? 'rgba(255,255,255,0.8)' : '#9ca3af', transition: 'color 0.3s ease' }}
                    />
                    <span
                      className="text-[14px] lg:text-[15px] leading-snug font-medium"
                      style={{
                        color: isHovered ? (cardAny.pointsHoverColor || 'rgba(255,255,255,0.9)') : (cardAny.pointsColor || '#4b5563'),
                        transition: 'color 0.3s ease, background-color 0.3s ease',
                      backgroundColor: activePointsBg,
                      padding: activePointsBg ? '1px 6px' : undefined,
                      borderRadius: activePointsBg ? '4px' : undefined,
                      border: activePointsBorder ? `1px solid ${activePointsBorder}` : undefined,
                    }}>
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
