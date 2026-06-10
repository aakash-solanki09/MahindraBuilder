import React from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { Plus, Minus } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface FAQProps {
  content: {
    title1?: string;
    title2?: string;
    title1Color?: string;
    title2Color?: string;
    subtitle?: string;
    subtitleColor?: string;
    items: Array<{ 
      question: string; 
      answer: string;
      questionColor?: string;
      answerColor?: string;
    }>;
  };
  styles: any;
  isEditing?: boolean;
}

const FAQ: React.FC<FAQProps> = ({ content, styles, isEditing }) => {
  const hasHeading = Boolean((content.title1 && content.title1.trim()) || (content.title2 && content.title2.trim()));
  const getStyle = (key: string, baseContent: any = content) => ({
    color: baseContent[`${key}Color`],
    backgroundColor: baseContent[`${key}BgColor`],
    padding: baseContent[`${key}BgColor`] ? '2px 8px' : undefined,
    borderRadius: baseContent[`${key}BgColor`] ? '4px' : undefined,
    border: baseContent[`${key}BorderColor`] ? `1px solid ${baseContent[`${key}BorderColor`]}` : undefined
  });

  const faqItems = content.items || [];

  return (
    <section 
      className="py-10 lg:py-14 bg-[#F3F8FF] font-['Georama']" 
      style={{ backgroundColor: styles.backgroundColor || '#F3F8FF' }}
    >
      <div className="max-w-[1600px] mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 lg:mb-12">
          {hasHeading && (
            <h2 className="text-[32px] lg:text-[42px] font-bold mb-4">
              {content.title1?.trim() && (
                <span style={getStyle('title1')} className={cn(!content.title1Color && "text-[#000000]")}>
                  {content.title1}
                </span>
              )}
              {content.title1?.trim() && content.title2?.trim() && ' '}
              {content.title2?.trim() && (
                <span style={getStyle('title2')} className={cn(!content.title2Color && "text-mahindra-red")}>
                  {content.title2}
                </span>
              )}
            </h2>
          )}
          {content.subtitle && (
            <p 
              className={cn("text-[14px] lg:text-[16px] leading-relaxed", !content.subtitleColor && "text-gray-500")}
              style={getStyle('subtitle')}
            >
              {content.subtitle}
            </p>
          )}
        </div>
        
        <div className="max-w-4xl mx-auto">
          <Accordion.Root type="single" collapsible className="space-y-4">
            {faqItems.map((item, idx) => (
              <Accordion.Item 
                key={idx} 
                value={`item-${idx}`} 
                className="bg-white rounded-[20px] lg:rounded-[24px] overflow-hidden border border-transparent data-[state=open]:border-mahindra-red transition-all duration-300 shadow-sm data-[state=open]:shadow-xl"
              >
                <Accordion.Header>
                  <Accordion.Trigger className="w-full flex items-center justify-between p-4 lg:p-6 text-left group">
                    <span 
                      className={cn("text-[16px] lg:text-[18px] font-bold pr-4", !item.questionColor && "text-[#001a3a]")}
                      style={getStyle('question', item)}
                    >
                      {item.question}
                    </span>
                    <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 group-data-[state=open]:bg-mahindra-red bg-blue-50">
                      <Plus className="w-4 h-4 text-mahindra-red group-data-[state=open]:hidden" />
                      <Minus className="w-4 h-4 text-white hidden group-data-[state=open]:block" />
                    </div>
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content 
                  className={cn("px-4 lg:px-6 pb-4 lg:pb-6 text-[14px] lg:text-[15px] leading-relaxed animate-in slide-in-from-top-2 duration-300 overflow-hidden", !item.answerColor && "text-gray-500")}
                  style={getStyle('answer', item)}
                >
                  <div className="pt-2 border-t border-gray-50">
                    {item.answer}
                  </div>
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
