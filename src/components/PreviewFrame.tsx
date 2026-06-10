import React from 'react';
import SectionRenderer from './SectionRenderer';
import type { Section } from '../types';

interface PreviewFrameProps {
  sections: Section[];
  view: 'desktop' | 'tablet' | 'mobile';
  selectedSectionId: string | null;
  onSelectSection: (id: string) => void;
  pageTitle: string;
  metaDescription: string;
  canonicalUrl: string;
}

const PreviewFrame: React.FC<PreviewFrameProps> = ({ pageTitle, metaDescription, canonicalUrl }) => {
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  // Inject Tailwind and styles into iframe
  React.useEffect(() => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;

    const tailwind = doc.createElement('script');
    tailwind.src = 'https://cdn.tailwindcss.com';
    
    const config = doc.createElement('script');
    config.innerHTML = `
      tailwind.config = {
        theme: {
          extend: {
            colors: {
              'mahindra-red': '#ed1c24',
              'mahindra-blue': '#002d62',
            }
          }
        }
      }
    `;

    const styles = doc.createElement('style');
    styles.innerHTML = `
      body { margin: 0; font-family: system-ui, -apple-system, sans-serif; overflow-x: hidden; }
      .selected-section { outline: 3px solid #ed1c24; outline-offset: -3px; }
      .no-scrollbar::-webkit-scrollbar { display: none; }
      .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    `;

    doc.head.appendChild(tailwind);
    doc.head.appendChild(config);
    doc.head.appendChild(styles);
  }, []);

  // Update content
  return (
    <iframe
      ref={iframeRef}
      className="w-full h-full border-0 bg-white shadow-inner"
      title="Preview"
      srcDoc={`
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>${pageTitle || 'Default Title'}</title>
            <meta name="description" content="${metaDescription || 'Default description for SEO optimization.'}">
            <link rel="canonical" href="${canonicalUrl || 'https://www.example.com'}">
          </head>
          <body class="no-scrollbar">
            <div id="preview-root"></div>
          </body>
        </html>
      `}
      onLoad={(e) => {
        const doc = (e.target as HTMLIFrameElement).contentDocument;
        if (!doc) return;
        
        // This is a simplified version. In a real app, we'd use a portal.
        // For this task, I'll use a more direct approach to ensure styles apply.
      }}
    />
  );
};

export default PreviewFrame;
