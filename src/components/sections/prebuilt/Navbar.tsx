import React from 'react';
import { resolveMediaUrl } from '../../../lib/media';
import { cn } from '../../../lib/utils';
import { useBuilderStore } from '../../../store/useBuilderStore';

interface NavbarProps {
  content: {
    logoImage?: string;
    links?: Array<{ label: string; url: string }>;
  };
  styles: any;
  isEditing?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ content, styles, isEditing }) => {
  const { view } = useBuilderStore();
  const logoSrc = resolveMediaUrl(content.logoImage || '/assets/images/86.png');
  const isCenteredView = view === 'mobile' || view === 'tablet';

  return (
    <nav className={cn(
      "w-full transition-all duration-300",
      !isEditing && "sticky top-0 z-[1000]",
      !styles.backgroundColor && "bg-white"
    )} style={{ backgroundColor: styles.backgroundColor }}>
      <div className={cn(
        "mx-auto flex items-center w-full px-4",
        isCenteredView ? "h-[50px] lg:h-[60px] justify-center" : "h-[50px] lg:h-[83px] lg:px-0 lg:pl-[129px]"
      )}>
        <div className={cn(
          "flex w-full",
          isCenteredView ? "justify-center" : "justify-center lg:justify-start"
        )}>
          <img 
              src={logoSrc} 
              alt="Mahindra Logistics" 
              className={cn(
                "object-contain",
                isCenteredView ? "h-[30px] w-auto lg:h-[40px]" : "h-[30px] w-auto lg:h-[65px] lg:w-[271px]"
              )}
            />
        </div>

        {/* Navigation Links */}
        {!isCenteredView && content.links && content.links.length > 0 && (
          <div className="hidden lg:flex items-center gap-8 ml-auto pr-8">
            {content.links.map((link: any, idx: number) => (
              <a 
                key={idx} 
                href={link.url} 
                className={cn(
                  "text-[14px] font-bold transition-colors uppercase tracking-tight",
                  !link.labelColor && "text-mahindra-blue hover:text-mahindra-red"
                )}
                style={{
                  color: link.labelColor,
                  backgroundColor: link.labelBgColor,
                  padding: link.labelBgColor ? '4px 12px' : undefined,
                  borderRadius: link.labelBgColor ? '6px' : undefined,
                }}
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
