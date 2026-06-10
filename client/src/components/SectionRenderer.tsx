import React from 'react';
import type { Section } from '../types';
import Hero from './sections/prebuilt/Hero';
import Features from './sections/prebuilt/Features';
import About from './sections/prebuilt/About';
import Industries from './sections/prebuilt/Industries';
import WarehouseNetwork from './sections/prebuilt/WarehouseNetwork';
import FAQ from './sections/prebuilt/FAQ';
import Footer from './sections/prebuilt/Footer';
import Navbar from './sections/prebuilt/Navbar';
import WhyChooseUs from './sections/prebuilt/WhyChooseUs';
import Brands from './sections/prebuilt/Brands';
import CustomSection from './sections/custom/CustomSection';
import HtmlBuilderSection from './sections/custom/HtmlBuilderSection';
import TechnologyOperations from './sections/prebuilt/TechnologyOperations';
import FacilityShowcase from './sections/prebuilt/FacilityShowcase';
import Testimonials from './sections/prebuilt/Testimonials';
import CaseStudies from './sections/prebuilt/CaseStudies';
import Network from './sections/prebuilt/Network';
import ThankYou from './sections/prebuilt/ThankYou';

interface SectionRendererProps {
  section: Section;
  isEditing?: boolean;
  view?: 'desktop' | 'tablet' | 'mobile';
}

const SectionRenderer: React.FC<SectionRendererProps> = ({ section, isEditing, view }) => {
  switch (section.type) {
    case 'hero':
      return <Hero content={section.content} styles={section.styles} isEditing={isEditing} />;
    case 'features':
      return <Features content={section.content} styles={section.styles} isEditing={isEditing} />;
    case 'about':
      return <About content={section.content} styles={section.styles} isEditing={isEditing} view={view} />;
    case 'industries':
      return <Industries content={section.content} styles={section.styles} isEditing={isEditing} />;
    case 'warehouses':
      return <WarehouseNetwork content={section.content} styles={section.styles} isEditing={isEditing} view={view} />;
    case 'faq':
      return <FAQ content={section.content} styles={section.styles} isEditing={isEditing} />;
    case 'footer':
      return <Footer content={section.content} styles={section.styles} isEditing={isEditing} view={view} />;
    case 'navbar':
      return <Navbar content={section.content} styles={section.styles} isEditing={isEditing} />;
    case 'why-choose-us':
      return <WhyChooseUs content={section.content} styles={section.styles} isEditing={isEditing} view={view} />;
    case 'brands':
      return <Brands content={section.content} styles={section.styles} isEditing={isEditing} view={view} />;
    case 'case-studies':
      return <CaseStudies content={section.content} styles={section.styles} isEditing={isEditing} view={view} />;
    case 'custom':
      return <CustomSection content={section.content} styles={section.styles} isEditing={isEditing} />;
    case 'html-builder':
      return <HtmlBuilderSection content={section.content} styles={section.styles} isEditing={isEditing} view={view} />;
    case 'technology-operations':
      return <TechnologyOperations content={section.content} styles={section.styles} isEditing={isEditing} />;
    case 'facility-showcase':
      return <FacilityShowcase content={section.content} styles={section.styles} isEditing={isEditing} />;
    case 'testimonials':
      return <Testimonials content={section.content} styles={section.styles} isEditing={isEditing} view={view} />;
    case 'network':
      return <Network content={section.content} styles={section.styles} isEditing={isEditing} view={view} />;
    case 'thank-you':
      return <ThankYou content={section.content} styles={section.styles} isEditing={isEditing} />;
    case 'maps':
    case 'video':
      return <div className="p-12 bg-gray-50 text-center rounded-xl border-2 border-dashed border-gray-200 m-4">
        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">
          Section Type "{section.type}" is configured but component not found.
        </p>
      </div>;
    default:
      return (
        <div className="p-12 border-2 border-dashed border-gray-200 rounded-[2rem] text-center bg-gray-50 m-4">
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">
            Section Placeholder: {section.type}
          </p>
        </div>
      );
  }
};

export default SectionRenderer;
