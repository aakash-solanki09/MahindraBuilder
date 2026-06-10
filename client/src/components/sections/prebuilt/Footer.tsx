import React from 'react';
import { resolveMediaUrl } from '../../../lib/media';
import { cn } from '../../../lib/utils';

interface FooterProps {
  content: {
    logo?: string;
    logoImage?: string;
    description?: string;
    links?: Array<{ label: string; url: string; color?: string }>;
    phone?: string;
    copyright?: string;
    ctaText?: string;
    logoColor?: string;
    descriptionColor?: string;
    textColor?: string;
  };
  styles: any;
  isEditing?: boolean;
  view?: 'desktop' | 'tablet' | 'mobile';
}

const Footer: React.FC<FooterProps> = ({ content, styles, view }) => {
  const bgColor = styles.backgroundColor || '#231F20';
  const descColor = content.descriptionColor || '#cbd5e1';
  const textColor = content.textColor || '#cbd5e1';

  const isMobile = view === 'mobile' || view === 'tablet';
  const hasDescription = Boolean(content.description?.trim());

  return (
    <footer 
      className="text-white py-8 lg:py-12 font-['Georama']" 
      style={{ backgroundColor: bgColor === '#ffffff' ? '#231F20' : bgColor }}
    >
      <div className="max-w-[1600px] mx-auto px-4 lg:px-8">
        {/* Top Row: Logo & Description */}
        <div className={cn(
          "flex flex-col md:flex-row justify-between gap-4 lg:gap-6 mb-4 lg:mb-8",
          isMobile ? "items-center text-center" : "items-center md:items-start"
        )}>
          <div className={cn(hasDescription ? "space-y-3" : "space-y-0", "max-w-xl", isMobile && "flex flex-col items-center") }>
            <div className={cn("flex items-center gap-3", isMobile && "justify-center") }>
              <img 
                src={resolveMediaUrl(content.logoImage || '/assets/images/86.png')} 
                alt="Mahindra Logistics" 
                className="h-[35px] lg:h-[45px] w-auto object-contain" 
              />
            </div>
            {hasDescription && (
              <p className={cn("text-[13px] leading-relaxed opacity-80 md:max-w-md", isMobile && "text-center") } style={{ color: descColor }}>
                {content.description}
              </p>
            )}
          </div>
        </div>

        {/* Bottom Row: Links & Copyright */}
        <div className={cn(
          "pt-2 lg:pt-4 flex flex-col md:flex-row justify-between gap-3 lg:gap-5 text-[13px] lg:text-[14px]",
          isMobile ? "items-center text-center" : "items-start md:items-center"
        )} style={{ color: textColor }}>
          <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-2 opacity-80", isMobile && "justify-center") }>
            {content.links && content.links.length > 0 ? (
              content.links.map((link, idx) => (
                <React.Fragment key={idx}>
                  <a href={link.url} className="hover:text-white transition-colors">{link.label}</a>
                  {idx < (content.links?.length || 0) - 1 && <span className="text-white/20">|</span>}
                </React.Fragment>
              ))
            ) : (
              <>
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <span className="text-white/20">|</span>
                <a href="#" className="hover:text-white transition-colors">Terms & Conditions</a>
              </>
            )}
            {content.phone?.trim() && <span className="text-white/20">|</span>}
            {content.phone?.trim() && <span className="font-medium">{content.phone}</span>}
          </div>

          <div className={cn("opacity-60 italic", isMobile && "text-center") }>
            {content.copyright || `© ${new Date().getFullYear()} CompanyName. All rights reserved.`}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
