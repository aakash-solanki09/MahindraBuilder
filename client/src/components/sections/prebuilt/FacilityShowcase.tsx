import React from 'react';
import { Play } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { resolveMediaUrl } from '../../../lib/media';

interface FacilityShowcaseProps {
  content: {
    title1?: string;
    title2?: string;
    subtitle?: string;
    videoUrl?: string;
    thumbnail?: string;
  };
  styles: any;
  isEditing?: boolean;
}

const FacilityShowcase: React.FC<FacilityShowcaseProps> = ({ content, styles, isEditing }) => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const hasHeading = Boolean((content.title1 && content.title1.trim()) || (content.title2 && content.title2.trim()));

  // Default video if none provided
  const videoUrl = content.videoUrl || "https://www.youtube.com/embed/dQw4w9WgXcQ"; // Placeholder, would use real Mahindra video
  const embedUrl = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')
    ? videoUrl.replace('watch?v=', 'embed/').split('&')[0]
    : videoUrl;

  return (
    <section 
      className="py-10 lg:py-14 bg-white font-['Georama']" 
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

        {/* Video Player / Thumbnail */}
        <div className="max-w-6xl mx-auto relative group">
          <div className="aspect-video rounded-[32px] lg:rounded-[48px] overflow-hidden shadow-2xl border-[1px] border-gray-100 bg-black">
            {isPlaying ? (
              videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') ? (
                <iframe 
                  src={`${embedUrl}?autoplay=1`}
                  className="w-full h-full"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  title="Facility Video"
                />
              ) : (
                <video 
                  src={videoUrl}
                  className="w-full h-full"
                  autoPlay
                  controls
                />
              )
            ) : (
              <div 
                className="relative w-full h-full cursor-pointer"
                onClick={() => setIsPlaying(true)}
              >
                <img 
                  src={resolveMediaUrl(content.thumbnail || "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80")} 
                  alt="Warehouse Showcase" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                  <div className="w-16 h-16 lg:w-24 lg:h-24 bg-mahindra-red rounded-full flex items-center justify-center shadow-2xl transition-transform duration-300 group-hover:scale-110">
                    <Play className="w-6 h-6 lg:w-10 lg:h-10 text-white fill-white ml-1" />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-mahindra-red/5 rounded-full -z-10 blur-2xl"></div>
          <div className="absolute -top-6 -left-6 w-32 h-32 bg-[#0089FF]/5 rounded-full -z-10 blur-2xl"></div>
        </div>
      </div>
    </section>
  );
};

export default FacilityShowcase;
