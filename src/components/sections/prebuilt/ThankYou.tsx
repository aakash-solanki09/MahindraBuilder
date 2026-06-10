import React from 'react';
import { cn } from '../../../lib/utils';

interface ThankYouProps {
  content: {
    heading?: string;
    title?: string;
    message?: string;
    buttonText?: string;
    headingColor?: string;
    headingBgColor?: string;
    headingBorderColor?: string;
    titleColor?: string;
    titleBgColor?: string;
    titleBorderColor?: string;
    messageColor?: string;
    messageBgColor?: string;
    messageBorderColor?: string;
    buttonTextColor?: string;
    buttonTextBgColor?: string;
    buttonTextBorderColor?: string;
  };
  styles: any;
  isEditing?: boolean;
  onPrimaryAction?: () => void;
}

const ThankYou: React.FC<ThankYouProps> = ({ content, styles, isEditing, onPrimaryAction }) => {
  const heading = content.heading?.trim() || 'Connect With Us';
  const title = content.title?.trim() || 'Thank You!';
  const message = content.message?.trim() || 'Thank you for your interest! We will get in touch with you shortly.';
  const buttonText = content.buttonText?.trim() || 'Back to Landing Page';

  const headingParts = heading.split(' ');
  const headingAccent = headingParts[0] || 'Connect';
  const headingRest = headingParts.slice(1).join(' ') || 'With Us';

  const headingColor = content.headingColor || styles.headingColor || '#0A2A57';
  const headingBgColor = content.headingBgColor || 'transparent';
  const headingBorderColor = content.headingBorderColor || 'transparent';
  const titleColor = content.titleColor || styles.textColor || '#111827';
  const titleBgColor = content.titleBgColor || 'transparent';
  const titleBorderColor = content.titleBorderColor || 'transparent';
  const messageColor = content.messageColor || styles.textColor || '#1f2937';
  const messageBgColor = content.messageBgColor || 'transparent';
  const messageBorderColor = content.messageBorderColor || 'transparent';
  const buttonTextColor = content.buttonTextColor || '#ffffff';
  const buttonBgColor = content.buttonTextBgColor || styles.primaryColor || '#E31837';
  const buttonBorderColor = content.buttonTextBorderColor || 'transparent';

  return (
    <section className="min-h-screen bg-[#F7F8FA] py-16 px-4" style={{ backgroundColor: styles.backgroundColor || '#F7F8FA' }}>
      <div className="max-w-4xl mx-auto">
        <h1
          className="text-[40px] md:text-[48px] font-bold text-[#0A2A57] leading-none"
          style={{
            color: headingColor,
            backgroundColor: headingBgColor,
            border: headingBorderColor !== 'transparent' ? `1px solid ${headingBorderColor}` : undefined,
          }}
        >
          <span className="text-[#E31837]" style={{ color: styles.primaryColor || '#E31837' }}>{headingAccent} </span>
          <span>{headingRest}</span>
        </h1>

        <div className="mt-12 border border-gray-300 rounded-sm bg-white px-6 py-12 md:px-12 text-center" style={{ borderColor: styles.borderColor || '#d1d5db' }}>
          <h2
            className="text-4xl md:text-5xl font-semibold text-gray-900"
            style={{
              color: titleColor,
              backgroundColor: titleBgColor,
              border: titleBorderColor !== 'transparent' ? `1px solid ${titleBorderColor}` : undefined,
            }}
          >
            {title}
          </h2>
          <p
            className="mt-6 text-xl md:text-2xl text-gray-800 leading-relaxed max-w-3xl mx-auto"
            style={{
              color: messageColor,
              backgroundColor: messageBgColor,
              border: messageBorderColor !== 'transparent' ? `1px solid ${messageBorderColor}` : undefined,
            }}
          >
            {message}
          </p>

          <button
            type="button"
            onClick={onPrimaryAction}
            disabled={!onPrimaryAction || isEditing}
            className={cn(
              'mt-10 inline-flex items-center justify-center rounded-full text-white px-8 py-3 text-sm font-bold uppercase tracking-wide',
              (!onPrimaryAction || isEditing) ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90'
            )}
            style={{
              color: buttonTextColor,
              backgroundColor: buttonBgColor,
              border: buttonBorderColor !== 'transparent' ? `1px solid ${buttonBorderColor}` : undefined,
            }}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </section>
  );
};

export default ThankYou;
