import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { resolveMediaUrl } from '../../../lib/media';

interface BrandsProps {
  content: {
    title1?: string;
    title2?: string;
    logos?: string[];
  };
  styles: any;
  isEditing?: boolean;
  view?: 'desktop' | 'tablet' | 'mobile';
}

const Brands: React.FC<BrandsProps> = ({ content, styles, view }) => {
  const hasHeading = Boolean((content.title1 && content.title1.trim()) || (content.title2 && content.title2.trim()));

  const allLogos = content.logos || [
    'https://logo.clearbit.com/amazon.com',
    'https://logo.clearbit.com/apple.com',
    'https://logo.clearbit.com/google.com',
    'https://logo.clearbit.com/microsoft.com',
    'https://logo.clearbit.com/meta.com',
    'https://logo.clearbit.com/netflix.com',
    'https://logo.clearbit.com/spotify.com',
    'https://logo.clearbit.com/tesla.com',
    'https://logo.clearbit.com/nike.com',
    'https://logo.clearbit.com/adidas.com',
    'https://logo.clearbit.com/zara.com',
    'https://logo.clearbit.com/samsung.com',
  ];

  const [mobileIndex, setMobileIndex] = useState(0);
  const [desktopPageIndex, setDesktopPageIndex] = useState(0);

  const moveRows = (direction: 'next' | 'prev') => {
    if (isMobile) {
      const mobileMaxStart = Math.max(allLogos.length - mobileVisibleCount, 0);
      if (direction === 'next') {
        setMobileIndex((prev) => Math.min(prev + 1, mobileMaxStart));
        return;
      }

      setMobileIndex((prev) => Math.max(prev - 1, 0));
      return;
    }

    const maxStart = Math.max(allLogos.length - 8, 0);
    if (direction === 'next') {
      setDesktopPageIndex((prev) => Math.min(prev + 1, maxStart));
      return;
    }

    setDesktopPageIndex((prev) => Math.max(prev - 1, 0));
  };

  const isMobile = view === 'mobile';
  const isTablet = view === 'tablet';
  const mobileVisibleCount = 4;
  const title2Parts = (content.title2 || 'Leading Brands').trim().split(/\s+/);
  const title2FirstWord = title2Parts[0] || 'Leading';
  const title2LastWord = title2Parts.slice(1).join(' ') || 'Brands';

  const cardWidth = isMobile ? 156 : isTablet ? 188 : 198;
  const cardHeight = isMobile ? 64 : 70;
  const rowGap = isMobile ? 8 : isTablet ? 16 : 20;
  const sideFade = isMobile ? 8 : 54;

  const mobileVisibleItems = allLogos.slice(mobileIndex, mobileIndex + mobileVisibleCount);

  const desktopPageItems = allLogos.slice(desktopPageIndex, desktopPageIndex + 8);
  const desktopShouldSplit = desktopPageItems.length >= 8;
  const desktopTopRow = desktopShouldSplit ? desktopPageItems.slice(0, 4) : desktopPageItems;
  const desktopBottomRow = desktopShouldSplit ? desktopPageItems.slice(4, 8) : [];

  const cardStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: isMobile ? '170px' : `${cardWidth}px`,
    minWidth: '0',
    height: `${cardHeight}px`,
    minHeight: `${cardHeight}px`,
    borderRadius: '10px',
    borderWidth: '1px',
    paddingTop: isMobile ? '16px' : '16px',
    paddingRight: isMobile ? '16px' : '20px',
    paddingBottom: isMobile ? '16px' : '16px',
    paddingLeft: isMobile ? '16px' : '20px',
    boxSizing: 'border-box',
  };

  const logoStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: isMobile ? '120px' : '170px',
    height: '100%',
    maxHeight: isMobile ? '30px' : '38px',
    objectFit: 'contain',
    objectPosition: 'center',
    display: 'block',
  };

  const mobileListStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '100%',
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    justifyItems: 'center',
    columnGap: '10px',
    rowGap: '10px',
  };

  return (
    <section className="bg-white py-6 lg:py-8 font-['Georama']" style={{ backgroundColor: styles.backgroundColor }}>
      <div className="mx-auto max-w-[1600px] px-4 lg:px-8">
        {hasHeading && (
          <div className="mb-12 text-center">
            <h2 className="text-[28px] font-bold lg:text-[36px] leading-[1.05]">
              <span className="block text-[#000000]">
                {content.title1?.trim() || 'Trusted by'}{' '}
                <span className="text-mahindra-red">{title2FirstWord}</span>
              </span>
              <span className="block text-mahindra-red">
                {title2LastWord}
              </span>
            </h2>
          </div>
        )}

        <div className="relative mx-auto w-full max-w-[1640px] px-10 lg:px-16">
          <button
            onClick={() => moveRows('prev')}
            className={cn(
              'absolute z-20 -translate-y-1/2 rounded-full border border-gray-200 bg-white shadow-md transition-all hover:bg-gray-50',
              isMobile ? 'left-0 top-1/2 h-10 w-10' : 'left-2 top-1/2 h-12 w-12',
            )}
            aria-label="Previous brands"
          >
            <ChevronLeft className={cn('mx-auto text-gray-400', view === 'mobile' ? 'h-5 w-5' : 'h-6 w-6')} />
          </button>

          <button
            onClick={() => moveRows('next')}
            className={cn(
              'absolute z-20 -translate-y-1/2 rounded-full bg-mahindra-red shadow-md transition-all hover:bg-mahindra-red/90',
              isMobile ? 'right-0 top-1/2 h-10 w-10' : 'right-2 top-1/2 h-12 w-12',
            )}
            aria-label="Next brands"
          >
            <ChevronRight className={cn('mx-auto text-white', view === 'mobile' ? 'h-5 w-5' : 'h-6 w-6')} />
          </button>

          <div className="flex flex-col items-center gap-4">
            {isMobile ? (
              <div style={mobileListStyle}>
                {mobileVisibleItems.map((logo, idx) => (
                  <motion.div key={`m-${idx}`} layout className={cn('flex items-center justify-center border border-[#D1D5DB] bg-white shadow-sm')} style={cardStyle}>
                    <img src={resolveMediaUrl(logo)} alt="Brand" style={logoStyle} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <>
                {desktopShouldSplit ? (
                  <>
                    <div
                      style={{
                        width: '100%',
                        maxWidth: '100%',
                        overflow: 'hidden',
                        WebkitMaskImage: `linear-gradient(to right, transparent 0px, black ${sideFade}px, black calc(100% - ${sideFade}px), transparent 100%)`,
                        maskImage: `linear-gradient(to right, transparent 0px, black ${sideFade}px, black calc(100% - ${sideFade}px), transparent 100%)`,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'center', gap: `${rowGap}px`, width: '100%' }}>
                        {desktopTopRow.map((logo, idx) => (
                          <motion.div key={`d1-${idx}`} layout className={cn('flex items-center justify-center border border-[#D1D5DB] bg-white shadow-sm')} style={cardStyle}>
                            <img src={resolveMediaUrl(logo)} alt="Brand" style={logoStyle} />
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <div
                      style={{
                        width: '100%',
                        maxWidth: '100%',
                        overflow: 'hidden',
                        WebkitMaskImage: `linear-gradient(to right, transparent 0px, black ${sideFade}px, black calc(100% - ${sideFade}px), transparent 100%)`,
                        maskImage: `linear-gradient(to right, transparent 0px, black ${sideFade}px, black calc(100% - ${sideFade}px), transparent 100%)`,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'center', gap: `${rowGap}px`, width: '100%' }}>
                        {desktopBottomRow.map((logo, idx) => (
                          <motion.div key={`d2-${idx}`} layout className={cn('flex items-center justify-center border border-[#D1D5DB] bg-white shadow-sm')} style={cardStyle}>
                            <img src={resolveMediaUrl(logo)} alt="Brand" style={logoStyle} />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '100%',
                      overflow: 'hidden',
                      WebkitMaskImage: `linear-gradient(to right, transparent 0px, black ${sideFade}px, black calc(100% - ${sideFade}px), transparent 100%)`,
                      maskImage: `linear-gradient(to right, transparent 0px, black ${sideFade}px, black calc(100% - ${sideFade}px), transparent 100%)`,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'center', gap: `${rowGap}px`, width: '100%', flexWrap: 'nowrap' }}>
                      {desktopPageItems.map((logo, idx) => (
                        <motion.div key={`d3-${idx}`} layout className={cn('flex items-center justify-center border border-[#D1D5DB] bg-white shadow-sm')} style={cardStyle}>
                          <img src={resolveMediaUrl(logo)} alt="Brand" style={logoStyle} />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Brands;
