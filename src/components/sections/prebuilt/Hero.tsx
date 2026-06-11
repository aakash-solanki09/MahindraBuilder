import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../../../lib/api';
import { resolveMediaUrl } from '../../../lib/media';
import { cn } from '../../../lib/utils';
import { useBuilderStore } from '../../../store/useBuilderStore';

interface HeroProps {
  content: {
    title1?: string;
    title2?: string;
    title3?: string;
    title1Color?: string;
    title2Color?: string;
    title3Color?: string;
    title1BgColor?: string;
    title2BgColor?: string;
    title3BgColor?: string;
    title1BorderColor?: string;
    title2BorderColor?: string;
    title3BorderColor?: string;
    title?: string;
    subtitle: string;
    submitButtonText?: string;
    buttonText: string;
    backgroundImage?: string;
    formTitle?: string;
    formFields?: Array<{
      name: string;
      label?: string;
      placeholder: string;
      type: string;
      prefix?: string;
      maxLength?: number;
      options?: string[];
      labelColor?: string;
      labelBgColor?: string;
      labelBorderColor?: string;
      placeholderColor?: string;
      placeholderBgColor?: string;
      placeholderBorderColor?: string;
    }>;
    formTitleColor?: string;
    formTitleBgColor?: string;
    submitButtonTextColor?: string;
    submitButtonTextBgColor?: string;
    submitButtonTextBorderColor?: string;
    subtitleColor?: string;
    subtitleBgColor?: string;
    thankYouHeading?: string;
    thankYouTitle?: string;
    thankYouMessage?: string;
    thankYouButtonText?: string;
  };
  styles: any;
  isEditing?: boolean;
}

const Hero: React.FC<HeroProps> = ({
  content,
  styles,
  isEditing,
}) => {
  const { view, page } = useBuilderStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { slug } = useParams<{ slug: string }>();

  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [isCompactDesktop, setIsCompactDesktop] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Builder mobile/tablet view
  const isCenteredView =
    view === 'mobile' || view === 'tablet';

  const defaultFormFields = [
    {
      name: 'first_name',
      label: 'First Name *',
      placeholder: 'Enter first name...',
      type: 'text',
      required: true,
    },
    {
      name: 'last_name',
      label: 'Last Name *',
      placeholder: 'Enter last name...',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      label: 'Email *',
      placeholder: 'Enter email address...',
      type: 'email',
      required: true,
    },
    {
      name: 'mobile',
      label: 'Mobile *',
      placeholder: 'Enter 10-digit mobile...',
      type: 'text',
      prefix: '+91',
      maxLength: 10,
      pattern: '[0-9]*',
      inputMode: 'numeric',
      required: true,
    },
    {
      name: 'company',
      label: 'Company *',
      placeholder: 'Enter company name...',
      type: 'text',
      required: true,
    },
    {
      name: 'city',
      label: 'City',
      placeholder: 'Enter city...',
      type: 'text',
      required: false,
    },
    {
      name: 'zip',
      label: 'Pin Code',
      placeholder: 'Enter pin code...',
      type: 'text',
      maxLength: 20,
      pattern: '[0-9]*',
      inputMode: 'numeric',
      required: false,
    },
    {
      name: '00N4x00000bbbE3',
      label: 'Interested In *',
      placeholder: 'Select Option',
      type: 'select',
      options: ['Surface Express'],
      required: true,
    },
    {
      name: '00N4x00000bbbEM',
      label: 'Remarks *',
      placeholder: 'Enter remarks...',
      type: 'text',
      maxLength: 255,
      required: true,
    },
  ];

  const contentFormFields = Array.isArray(content.formFields) ? content.formFields : [];
  const fieldStyleByName = new Map(
    contentFormFields
      .filter((field: any) => typeof field?.name === 'string')
      .map((field: any) => [String(field.name).toLowerCase(), field])
  );

  // Keep form structure static. Only style props can be overridden from content.formFields.
  const fields = defaultFormFields.map((field: any) => {
    const styleSource = fieldStyleByName.get(String(field.name).toLowerCase());

    if (!styleSource) {
      return field;
    }

    return {
      ...field,
      options: styleSource.options || field.options,
      labelColor: styleSource.labelColor,
      labelBgColor: styleSource.labelBgColor,
      labelBorderColor: styleSource.labelBorderColor,
      placeholderColor: styleSource.placeholderColor,
      placeholderBgColor: styleSource.placeholderBgColor,
      placeholderBorderColor: styleSource.placeholderBorderColor,
      inputColor: styleSource.inputColor,
      inputBgColor: styleSource.inputBgColor,
      inputBorderColor: styleSource.inputBorderColor,
    };
  });

  const submitLeadData = async () => {
    const isPreview = slug === 'preview' || location.pathname.includes('/preview');
    const resolvedSlug = isPreview 
      ? (page?.slug && page.slug !== 'preview' ? page.slug : 'mahindralogistic') 
      : (slug || page?.slug || 'mahindralogistic');
    const resolvedName = isPreview 
      ? (page?.pageName || 'Mahindra Logistics') 
      : (page?.pageName || resolvedSlug);

    await api.post('/leads', {
      ...formData,
      oid: '00D4x000007sh6p',
      retURL: 'http://google.com',
      recordType: '012Vt0000023hFO',
      Vertical_DH__c: 'Not specified',
      lead_source: 'Campaign',
      Entity__c: 'MESPL',
      debug: 0,
      debugEmail: 'amin.noumita@mahindralogistics.com',
      sourcePageName: resolvedName,
      sourcePageSlug: resolvedSlug,
      sourcePath: location.pathname,
      pageId: page?._id
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const phone = String(formData.mobile || '').replace(/\D/g, '');
    if (!phone || phone.length < 10) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }

    setSendingOtp(true);
    try {
      await api.post('/otp/send-otp', { mobile: phone });
      setOtpSent(true);
      setOtpVerified(false);
      setOtp('');
      setOtpError('');
      setResendTimer(30);
      setIsOtpModalOpen(true);
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'mobile' && otpVerified) {
      setOtpVerified(false);
      setOtp('');
    }

    if (name === 'mobile') {
      setOtpSent(false);
    }
  };

  const handleResendOtp = async () => {
    const phone = String(formData.mobile || '').replace(/\D/g, '');
    if (!phone || phone.length < 10) {
      setOtpError('Invalid mobile number.');
      return;
    }

    setSendingOtp(true);
    setOtpError('');
    try {
      await api.post('/otp/send-otp', { mobile: phone });
      setOtpSent(true);
      setOtpVerified(false);
      setOtp('');
      setResendTimer(30);
      alert('OTP has been resent to your mobile number.');
    } catch (err: any) {
      console.error(err);
      setOtpError(err?.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyAndSubmit = async () => {
    const phone = String(formData.mobile || '').replace(/\D/g, '');
    if (!phone || phone.length < 10) {
      setOtpError('Please enter a valid mobile number.');
      return;
    }
    if (!otp.trim() || otp.length !== 4) {
      setOtpError('Please enter a valid 4-digit OTP.');
      return;
    }

    setVerifyingOtp(true);
    setOtpError('');
    try {
      await api.post('/otp/verify-otp', { mobile: phone, otp: otp.trim() });
      setOtpVerified(true);
      setIsOtpModalOpen(false);

      setLoading(true);
      try {
        await submitLeadData();
        setFormData({});
        setOtp('');
        setOtpVerified(false);
        setOtpSent(false);

        // Redirect to thank-you page
        const isPreview = slug === 'preview' || location.pathname.includes('/preview');
        const resolvedSlug = isPreview 
          ? (page?.slug && page.slug !== 'preview' ? page.slug : 'mahindralogistic') 
          : (slug || page?.slug || 'mahindralogistic');
        navigate(`/${resolvedSlug}/thank-you${location.search || ''}`);
      } catch (err) {
        console.error(err);
        alert('Error sending inquiry');
      } finally {
        setLoading(false);
      }
    } catch (err: any) {
      console.error(err);
      setOtpVerified(false);
      setOtpError(err?.response?.data?.message || 'Invalid OTP. Please check and try again.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const isDesktopView = view === 'desktop';
  const isTabletView = view === 'tablet';
  const isMobileView = view === 'mobile';
  const hasTitle = Boolean((content.title1 && content.title1.trim()) || (content.title2 && content.title2.trim()) || (content.title3 && content.title3.trim()));

  useEffect(() => {
    const updateCompactMode = () => {
      const zoomRatio = window.devicePixelRatio || 1;
      const compact =
        view === 'desktop' &&
        (zoomRatio >= 1.25 || window.innerWidth <= 1440 || window.innerHeight <= 860);
      setIsCompactDesktop(compact);
    };

    updateCompactMode();
    window.addEventListener('resize', updateCompactMode);
    return () => window.removeEventListener('resize', updateCompactMode);
  }, [view]);

  const renderTitle = () => {
    const getStyle = (key: string) => ({
      color: (content as any)[`${key}Color`],
      backgroundColor: (content as any)[`${key}BgColor`],
      borderColor: (content as any)[`${key}BorderColor`],
      borderWidth: (content as any)[`${key}BorderColor`] ? '1px' : undefined,
      padding: (content as any)[`${key}BgColor`] ? '2px 8px' : undefined,
      borderRadius: (content as any)[`${key}BgColor`] ? '4px' : undefined,
      textShadow: '0 2px 4px rgba(0,0,0,0.6)'
    });

    return (
      <div className="flex flex-col w-full">
        {(isMobileView || isTabletView) ? (
          <div className="flex flex-col items-start text-left">
            {content.title1?.trim() && <span className="block whitespace-nowrap" style={getStyle('title1')}>{content.title1}</span>}
            {content.title2?.trim() && (
              <span className="block mt-0.5" style={getStyle('title2')}>
                {content.title2}
              </span>
            )}
            {content.title3?.trim() && (
              <span className={cn("block mt-0.5", !(content as any).title3Color && "text-mahindra-red")} style={getStyle('title3')}>
                {content.title3}
              </span>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-start text-left">
            <div className="lg:hidden flex flex-col items-start text-left">
              {content.title1?.trim() && <span className="block whitespace-nowrap" style={getStyle('title1')}>{content.title1}</span>}
              {content.title2?.trim() && <span className="block mt-0.5" style={getStyle('title2')}>{content.title2}</span>}
              {content.title3?.trim() && (
                <span className={cn("block mt-0.5", !(content as any).title3Color && "text-mahindra-red")} style={getStyle('title3')}>
                  {content.title3}
                </span>
              )}
            </div>
            <div className="hidden lg:flex flex-col items-start text-left">
              {content.title1?.trim() && <span className="block whitespace-nowrap" style={getStyle('title1')}>{content.title1}</span>}
              {content.title2?.trim() && <span className="block" style={getStyle('title2')}>{content.title2}</span>}
              {content.title3?.trim() && (
                <span className={cn("block", !(content as any).title3Color && "text-mahindra-red")} style={getStyle('title3')}>
                  {content.title3}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const bgImg = resolveMediaUrl(
    content.backgroundImage || '/assets/images/woman-working-laptop-street-cafe-wearing-stylish-smart-clothes-jacket-glasses 2.png'
  );

  return (
    <div className="flex flex-col w-full relative">
      <section
        className={cn(
          'relative flex transition-all duration-500 bg-no-repeat w-full bg-cover',
          isDesktopView ? 'min-h-[82vh] xl:min-h-[85vh] py-8 lg:py-10 bg-center items-center' : 'h-[65vh] bg-top items-center'
        )}
        style={{
          backgroundImage: `url("${bgImg}")`,
          backgroundColor: styles.backgroundColor || '#000000',
        }}
      >
        {/* Soft gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-transparent z-0 pointer-events-none" />
        <div
          className={cn(
            'container mx-auto px-4 lg:px-6 relative z-10 w-full',
            isDesktopView ? 'pb-0' : 'pb-0'
          )}
        >
          <div
            className={cn(
              'grid items-center',
              isDesktopView ? 'grid-cols-1 xl:grid-cols-[1.2fr,480px] gap-8 xl:gap-12' : 'grid-cols-1 gap-8'
            )}
          >
            {/* Left Content */}
            <div
              className={cn(
                'text-white flex flex-col items-start text-left',
                isDesktopView ? 'space-y-5 pl-4 lg:pl-6 xl:pl-0 xl:translate-y-10 2xl:translate-y-20' : 'space-y-5'
              )}
            >
              {hasTitle && (
                <h1
                  className={cn(
                    'font-bold tracking-tight max-w-[680px]',
                    isDesktopView ? 'text-[28px] lg:text-[38px] xl:text-[58px] 2xl:text-[64px] leading-[1.05]' : 'text-[32px] leading-[1.1]'
                  )}
                >
                  {renderTitle()}
                </h1>
              )}

              {content.subtitle?.trim() && (
                <p
                  className={cn(
                    'font-normal text-left leading-relaxed',
                    isDesktopView ? 'text-[15px] xl:text-[20px] lg:max-w-[560px]' : 'text-[14px] max-w-[320px]',
                    !(content as any).subtitleColor && 'text-white/90'
                  )}
                  style={{
                    color: (content as any).subtitleColor,
                    backgroundColor: (content as any).subtitleBgColor,
                    padding: (content as any).subtitleBgColor ? '4px 12px' : undefined,
                    borderRadius: (content as any).subtitleBgColor ? '6px' : undefined,
                  }}
                >
                  {content.subtitle}
                </p>
              )}
            </div>

            {/* Desktop Form */}
            <div
              className={cn(
                'w-full ml-auto',
                isCompactDesktop ? 'max-w-[440px]' : 'max-w-[480px]',
                isCenteredView
                  ? 'hidden'
                  : 'hidden xl:block'
              )}
            >
              <div
                data-hero-form-target="true"
                className={cn(
                  "backdrop-blur-[0px] bg-[#8C8C8C]/20 border border-white/10 rounded-[22px] shadow-2xl",
                  isCompactDesktop ? "px-5 lg:px-6 pt-5 pb-5" : "px-6 lg:px-8 pt-6 pb-6"
                )}
              >
                {content.formTitle?.trim() && (
                  <h2 
                    className={cn(
                      isCompactDesktop ? "text-[24px] font-bold mb-4 text-left tracking-tight" : "text-[28px] font-bold mb-6 text-left tracking-tight",
                      !content.formTitleColor && "text-white"
                    )}
                    style={{
                      color: content.formTitleColor,
                      backgroundColor: content.formTitleBgColor,
                      padding: content.formTitleBgColor ? '4px 12px' : undefined,
                      borderRadius: content.formTitleBgColor ? '8px' : undefined,
                    }}
                  >
                    {content.formTitle}
                  </h2>
                )}

                <Form
                  fields={fields}
                  formData={formData}
                  handleChange={handleChange}
                  handleSubmit={handleSubmit}
                  loading={loading}
                  sendingOtp={sendingOtp}
                  isCenteredView={false}
                  isCompactDesktop={isCompactDesktop}
                  content={content}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile / Tablet Form */}
      <section
        className={cn(
          'bg-[#F3F8FF] w-full py-12 px-6 xl:hidden'
        )}
      >
        <div className="max-w-[500px] mx-auto bg-[#F3F8FF] rounded-[30px]">
          {content.formTitle?.trim() && (
            <h2 
              className={cn(
                "text-2xl font-bold mb-8 text-center tracking-tight",
                !content.formTitleColor && "text-gray-900"
              )}
              style={{
                color: content.formTitleColor,
                backgroundColor: content.formTitleBgColor,
                padding: content.formTitleBgColor ? '4px 12px' : undefined,
                borderRadius: content.formTitleBgColor ? '8px' : undefined,
              }}
            >
              {content.formTitle}
            </h2>
          )}

          <div data-hero-form-target="true">
            <Form
              fields={fields}
              formData={formData}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              loading={loading}
              sendingOtp={sendingOtp}
              isCenteredView={true}
              isCompactDesktop={false}
              content={content}
            />
          </div>
        </div>
      </section>

      {/* OTP Popup Modal */}
      {isOtpModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-[#0c0f1d]/75 backdrop-blur-md" onClick={() => setIsOtpModalOpen(false)}></div>
          
          {/* Modal Container */}
          <div className="bg-[#181D31]/95 border border-white/10 rounded-[28px] w-full max-w-md p-8 shadow-2xl relative text-white animate-in fade-in zoom-in duration-200">
            <h3 className="text-2xl font-bold mb-2 tracking-tight text-white">Verify Your Mobile</h3>
            <p className="text-gray-300 text-sm mb-6 leading-relaxed">
              We've sent a 4-digit OTP code to <span className="font-semibold text-white">+91 {formData.mobile}</span> via SMS.
            </p>

            <div className="space-y-4">
              <div className="space-y-2 text-left">
                <label className="text-[11px] font-extrabold uppercase tracking-tight text-white/60 ml-1">
                  4-Digit OTP *
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, '').slice(0, 4));
                    setOtpError('');
                  }}
                  placeholder="Enter OTP"
                  className="w-full rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-mahindra-red outline-none border border-white/10 bg-white/5 text-white placeholder-white/35 shadow-sm text-center tracking-[0.25em] font-mono text-lg font-bold"
                  required
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && otp.length === 4 && !verifyingOtp) {
                      handleVerifyAndSubmit();
                    }
                  }}
                />
                {otpError && (
                  <p className="text-red-400 text-xs font-semibold mt-1 ml-1">
                    {otpError}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleVerifyAndSubmit}
                  disabled={verifyingOtp || otp.length !== 4}
                  className="w-full h-12 rounded-xl font-bold text-base transition-all bg-[#E31837] hover:bg-red-700 text-white shadow-xl flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {verifyingOtp ? (
                    <>
                      <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Verifying OTP...
                    </>
                  ) : 'Verify & Submit'}
                </button>

                <div className="flex items-center justify-between text-xs font-medium text-white/60 px-1 mt-1">
                  <span>Didn't receive code?</span>
                  {resendTimer > 0 ? (
                    <span>Resend in <strong className="text-white">{resendTimer}s</strong></span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={sendingOtp}
                      className="text-mahindra-red hover:underline font-bold"
                    >
                      {sendingOtp ? 'Sending...' : 'Resend OTP'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOtpModalOpen(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white text-2xl font-bold leading-none p-1"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable Form Component with Grid Layout
const Form = ({
  fields,
  formData,
  handleChange,
  handleSubmit,
  loading,
  sendingOtp,
  isCenteredView,
  isCompactDesktop,
  content,
}: any) => (
  <form
    className={cn(
      isCenteredView ? 'space-y-6' : isCompactDesktop ? 'space-y-3' : 'space-y-4'
    )}
    onSubmit={handleSubmit}
  >
    <div className={cn(
      "grid gap-x-4",
      isCenteredView ? "grid-cols-1 gap-y-4" : "grid-cols-2 gap-y-2.5"
    )}>
      {fields.map((field: any, idx: number) => {
        const isFullWidth = field.name === '00N4x00000bbbEM' || field.type === 'textarea';
        return (
          <div
            key={idx}
            className={cn(
              "space-y-1.5 text-left relative",
              isFullWidth && "col-span-2"
            )}
          >
            <label
              className={cn(
                isCompactDesktop ? 'text-[11px] font-extrabold uppercase tracking-tight ml-1' : 'text-[12px] font-extrabold uppercase tracking-tight ml-1',
                !field.labelColor && (isCenteredView ? 'text-gray-900' : 'text-white')
              )}
              style={{
                color: field.labelColor,
                backgroundColor: field.labelBgColor,
                padding: field.labelBgColor ? '2px 8px' : undefined,
                borderRadius: field.labelBgColor ? '4px' : undefined,
                border: field.labelBorderColor ? `1px solid ${field.labelBorderColor}` : undefined
              }}
            >
              {field.label}
            </label>

            <div className="relative group">
              {field.prefix && (
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium border-r border-gray-200 pr-3">
                  {field.prefix}
                </span>
              )}

              {field.type === 'select' ? (
                <div className="relative">
                  <select
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleChange}
                    className={cn(
                      isCompactDesktop
                        ? "w-full rounded-xl px-4 py-2.5 text-[13px] focus:ring-2 focus:ring-mahindra-red outline-none border shadow-sm appearance-none"
                        : "w-full rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-mahindra-red outline-none border shadow-sm appearance-none",
                      !field.inputBgColor && "bg-white",
                      !field.inputColor && "text-gray-900",
                      !field.inputBorderColor && "border-gray-200"
                    )}
                    style={{
                      color: field.inputColor || field.placeholderColor,
                      backgroundColor: field.inputBgColor || field.placeholderBgColor,
                      borderColor: field.inputBorderColor || field.placeholderBorderColor,
                    }}
                    required={field.required}
                  >
                    <option value="" disabled>
                      {field.placeholder}
                    </option>

                    {field.options?.map(
                      (opt: string, oIdx: number) => (
                        <option
                          key={oIdx}
                          value={opt}
                        >
                          {opt}
                        </option>
                      )
                    )}
                  </select>

                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              ) : field.type === 'textarea' ? (
                <div className="w-full">
                  <textarea
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    maxLength={field.maxLength}
                    className={cn(
                      isCompactDesktop
                        ? "w-full rounded-xl px-4 py-2.5 text-[13px] focus:ring-2 focus:ring-mahindra-red outline-none border min-h-[56px] shadow-sm resize-none"
                        : "w-full rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-mahindra-red outline-none border min-h-[72px] shadow-sm resize-none",
                      !field.inputBgColor && "bg-white",
                      !field.inputColor && "text-gray-900",
                      !field.inputBorderColor && "border-gray-200"
                    )}
                    style={{
                      color: field.inputColor || field.placeholderColor,
                      backgroundColor: field.inputBgColor || field.placeholderBgColor,
                      borderColor: field.inputBorderColor || field.placeholderBorderColor,
                    }}
                    required={field.required}
                  />
                </div>
              ) : (
                <input
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  onInput={field.maxLength || field.pattern ? (e: React.FormEvent<HTMLInputElement>) => {
                    const target = e.currentTarget;
                    if (field.pattern) {
                      target.value = target.value.replace(/\D/g, '');
                    }
                    if (field.maxLength) {
                      target.value = target.value.slice(0, field.maxLength);
                    }
                  } : undefined}
                  type={field.type}
                  placeholder={field.placeholder}
                  maxLength={field.maxLength}
                  pattern={field.pattern}
                  inputMode={field.inputMode as any}
                  className={cn(
                    isCompactDesktop
                      ? 'w-full rounded-xl px-4 py-2.5 text-[13px] focus:ring-2 focus:ring-mahindra-red outline-none border shadow-sm'
                      : 'w-full rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-mahindra-red outline-none border shadow-sm',
                    field.prefix && 'pl-16',
                    !field.inputBgColor && "bg-white",
                    !field.inputColor && "text-gray-900",
                    !field.inputBorderColor && "border-gray-200"
                  )}
                  style={{
                    color: field.inputColor || field.placeholderColor,
                    backgroundColor: field.inputBgColor || field.placeholderBgColor,
                    borderColor: field.inputBorderColor || field.placeholderBorderColor,
                  }}
                  required={field.required}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>

    {/* Checkbox */}
    <div className="flex items-center gap-3 pt-1">
      <input
        type="checkbox"
        id="terms"
        required
        className="rounded border-gray-300 text-mahindra-red focus:ring-mahindra-red w-5 h-5 cursor-pointer"
      />

      <label
        htmlFor="terms"
        className={cn(
          isCompactDesktop ? 'text-[12px] font-medium cursor-pointer' : 'text-[13px] font-medium cursor-pointer',
          isCenteredView
            ? 'text-gray-700'
            : 'text-white'
        )}
      >
        I agree to the Terms & Conditions
      </label>
    </div>

    {/* Submit Button */}
    <button
      type="submit"
      disabled={loading}
      className={cn(
        isCompactDesktop
          ? "w-full h-10 rounded-xl font-bold text-sm transition-all shadow-xl flex items-center justify-center gap-2"
          : "w-full h-12 rounded-xl font-bold text-base transition-all shadow-xl flex items-center justify-center gap-2",
        !(content as any).submitButtonTextBgColor && "bg-[#E31837] hover:bg-red-700",
        !(content as any).submitButtonTextColor && "text-white"
      )}
      style={{
        color: (content as any).submitButtonTextColor,
        backgroundColor: (content as any).submitButtonTextBgColor,
        borderColor: (content as any).submitButtonTextBorderColor,
        borderWidth: (content as any).submitButtonTextBorderColor ? '2px' : undefined,
      }}
    >
      {loading ? 'Processing...' : (sendingOtp ? 'Sending OTP...' : (content.submitButtonText || 'Submit Inquiry'))}
    </button>
  </form>
);

export default Hero;
