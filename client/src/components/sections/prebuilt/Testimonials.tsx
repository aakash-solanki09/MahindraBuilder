import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { resolveMediaUrl } from '../../../lib/media';

interface Testimonial {
  name: string;
  role: string;
  feedback: string;
  avatar: string;
  stars: number;
}

interface TestimonialsProps {
  content: {
    title1?: string;
    title2?: string;
    subtitle?: string;
    items: Testimonial[];
  };
  styles: any;
  isEditing?: boolean;
  view?: 'desktop' | 'tablet' | 'mobile';
}

const Testimonials: React.FC<TestimonialsProps> = ({ content, styles, isEditing, view }) => {
  const hasHeading = Boolean((content.title1 && content.title1.trim()) || (content.title2 && content.title2.trim()));
  const [startIndex, setStartIndex] = useState(0);
  const [itemsToShow, setItemsToShow] = useState(3);

  const testimonials = content.items || [];

  // Update items to show based on view prop or window width
  useEffect(() => {
    if (view) {
      if (view === 'mobile') setItemsToShow(1);
      else if (view === 'tablet') setItemsToShow(2);
      else setItemsToShow(3);
    } else {
      const handleResize = () => {
        if (window.innerWidth < 768) setItemsToShow(1);
        else if (window.innerWidth < 1024) setItemsToShow(2);
        else setItemsToShow(3);
      };
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [view]);

  const next = () => {
    setStartIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setStartIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // Get the visible items (handling wrap around)
  const getVisibleItems = () => {
    if (testimonials.length === 0) return [];
    const visible = [];
    for (let i = 0; i < itemsToShow; i++) {
      visible.push(testimonials[(startIndex + i) % testimonials.length]);
    }
    return visible;
  };

  const visibleItems = getVisibleItems();

  return (
    <section 
      className="py-10 lg:py-14 bg-white font-['Georama'] overflow-hidden" 
      style={{ backgroundColor: styles.backgroundColor }}
    >
      <div className="max-w-[1600px] mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 lg:mb-10">
          {hasHeading && (
            <h2 className="text-[32px] lg:text-[42px] font-bold mb-4">
              {content.title1?.trim() && <span className="text-[#000000]">{content.title1}</span>}
              {content.title1?.trim() && content.title2?.trim() && ' '}
              {content.title2?.trim() && <span className="text-mahindra-red">{content.title2}</span>}
            </h2>
          )}
          {content.subtitle?.trim() && (
            <p className="text-gray-500 text-[14px] lg:text-[16px] leading-relaxed">
              {content.subtitle}
            </p>
          )}
        </div>

        {/* Carousel Container */}
        <div className="relative max-w-7xl mx-auto px-4 lg:px-12">
          {/* Navigation Arrows - Only show if testimonials > itemsToShow */}
          {testimonials.length > itemsToShow && (
            <>
              <button 
                onClick={prev}
                className="absolute -left-2 lg:left-0 top-1/2 -translate-y-1/2 w-10 h-10 lg:w-12 lg:h-12 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-100 hover:bg-gray-50 transition-all z-20"
              >
                <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6 text-gray-400" />
              </button>
              
              <button 
                onClick={next}
                className="absolute -right-2 lg:right-0 top-1/2 -translate-y-1/2 w-10 h-10 lg:w-12 lg:h-12 bg-mahindra-red rounded-full flex items-center justify-center shadow-lg hover:bg-mahindra-red/90 transition-all z-20"
              >
                <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </button>
            </>
          )}

          {/* Cards Container */}
          <div className="overflow-hidden py-4">
            <div className="flex gap-6 lg:gap-8 transition-all duration-500">
              <AnimatePresence mode="popLayout" initial={false}>
                {visibleItems.map((item, index) => (
                  <motion.div
                    key={`${startIndex}-${index}`}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className={cn(
                      "bg-white rounded-[24px] p-6 lg:p-8 relative group transition-shadow duration-300",
                      itemsToShow === 1 ? "w-full" : itemsToShow === 2 ? "w-[calc(50%-12px)]" : "w-[calc(33.333%-21px)]"
                    )}
                  >
                    <Quote className="absolute top-6 right-6 w-12 h-12 text-gray-50 opacity-10" />
                    
                    <div className="flex gap-1 mb-6">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={cn(
                            "w-4 h-4",
                            i < item.stars ? "text-amber-400 fill-amber-400" : "text-gray-200"
                          )} 
                        />
                      ))}
                    </div>

                    <p className="text-gray-600 text-[15px] lg:text-[16px] leading-relaxed mb-8 min-h-[80px]">
                      "{item.feedback}"
                    </p>

                    <div className="flex items-center gap-4 pt-6 border-t border-gray-50">
                      <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full overflow-hidden shrink-0 border-2 border-white shadow-md">
                        <img src={resolveMediaUrl(item.avatar)} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="text-[#001a3a] font-bold text-[16px] lg:text-[17px]">
                          {item.name}
                        </h4>
                        <p className="text-gray-400 text-[13px] lg:text-[14px]">
                          {item.role}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
