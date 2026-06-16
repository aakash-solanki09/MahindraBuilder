import React, { useState, useEffect, useRef } from 'react';
import api from '../../lib/api';
import { cn } from '../../lib/utils';

interface OtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (mobile: string) => void;
  /** Mobile number pre-filled from the form. If provided, OTP is auto-sent on open. */
  formMobile?: string;
}

const OtpModal: React.FC<OtpModalProps> = ({ isOpen, onClose, onVerified, formMobile }) => {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const hasAutoSent = useRef(false);

  // When modal opens with a pre-filled mobile, auto-send OTP immediately
  useEffect(() => {
    if (!isOpen) {
      hasAutoSent.current = false;
      return;
    }
    if (formMobile) {
      const clean = formMobile.replace(/\D/g, '');
      if (clean.length >= 10 && !hasAutoSent.current) {
        hasAutoSent.current = true;
        setMobile(clean);
        setStep('otp');
        setSending(true);
        setError('');
        setSuccess('');
        api.post('/otp/send-otp', { mobile: clean })
          .then(() => setSuccess('OTP sent to your mobile via SMS.'))
          .catch((err: any) => {
            setError(err?.response?.data?.message || 'Failed to send OTP.');
            setStep('phone');
          })
          .finally(() => setSending(false));
      }
    }
  }, [isOpen, formMobile]);

  if (!isOpen) return null;

  const handleSendOtp = async () => {
    const clean = mobile.replace(/\D/g, '');
    if (clean.length < 10) { setError('Please enter a valid 10-digit mobile number.'); return; }
    setError('');
    setSending(true);
    try {
      await api.post('/otp/send-otp', { mobile: clean });
      setStep('otp');
      setSuccess('OTP sent to your mobile via SMS.');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to send OTP.');
    } finally { setSending(false); }
  };

  const handleVerifyOtp = async () => {
    const clean = mobile.replace(/\D/g, '');
    if (!otp.trim() || otp.trim().length !== 4) { setError('Please enter the 4-digit OTP.'); return; }
    setError('');
    setVerifying(true);
    try {
      await api.post('/otp/verify-otp', { mobile: clean, otp: otp.trim() });
      onVerified(clean);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid OTP.');
    } finally { setVerifying(false); }
  };

  const handleClose = () => {
    setMobile(''); setOtp(''); setStep('phone');
    setError(''); setSuccess(''); hasAutoSent.current = false;
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-in zoom-in-95">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-mahindra-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-mahindra-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900">Verify Your Phone</h3>
          <p className="text-sm text-gray-500 mt-1">
            {step === 'phone'
              ? 'Enter your mobile number to receive an OTP.'
              : 'Enter the 4-digit OTP sent to your phone.'}
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all',
            step === 'phone' ? 'bg-mahindra-red text-white' : 'bg-emerald-500 text-white'
          )}>
            {step === 'phone' ? '1' : '✓'}
          </div>
          <div className="w-8 h-px bg-gray-300" />
          <div className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all',
            step === 'otp' ? 'bg-mahindra-red text-white' : 'bg-gray-200 text-gray-500'
          )}>
            2
          </div>
        </div>

        {/* Error / Success messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-start gap-2">
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 flex items-start gap-2">
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {success}
          </div>
        )}

        {/* Phone Input Step */}
        {step === 'phone' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                Mobile Number *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium border-r border-gray-200 pr-3">
                  +91
                </span>
                <input
                  type="text"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="Enter 10-digit number"
                  className="w-full pl-16 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-mahindra-red focus:border-transparent outline-none transition-all"
                  maxLength={10}
                  inputMode="numeric"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                />
              </div>
            </div>
            <button
              onClick={handleSendOtp}
              disabled={sending || mobile.replace(/\D/g, '').length < 10}
              className="w-full h-12 bg-mahindra-red hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {sending ? (
                <>
                  <img src="/mahindra-loader-new.gif" alt="" className="w-5 h-5" />
                  Sending OTP...
                </>
              ) : (
                'Send OTP'
              )}
            </button>
          </div>
        )}

        {/* OTP Input Step */}
        {step === 'otp' && (
          <div className="space-y-4">
            {formMobile && (
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  OTP sent to <span className="font-bold text-gray-900">+91 {mobile}</span>
                </p>
              </div>
            )}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                Enter OTP *
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="Enter 4-digit OTP"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-center text-lg tracking-[0.5em] font-bold focus:ring-2 focus:ring-mahindra-red focus:border-transparent outline-none transition-all"
                maxLength={4}
                inputMode="numeric"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
              />
            </div>

            <button
              onClick={handleVerifyOtp}
              disabled={verifying || otp.length !== 4}
              className="w-full h-12 bg-mahindra-red hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {verifying ? (
                <>
                  <img src="/mahindra-loader-new.gif" alt="" className="w-5 h-5" />
                  Verifying...
                </>
              ) : (
                'Verify OTP'
              )}
            </button>

            <div className="text-center">
              <button
                onClick={() => { setStep('phone'); setOtp(''); setError(''); setSuccess(''); }}
                className="text-sm text-gray-500 hover:text-mahindra-red transition-colors"
              >
                ← Change mobile number
              </button>
            </div>

            <button
              onClick={handleSendOtp}
              disabled={sending}
              className="w-full text-sm text-mahindra-red hover:text-red-700 font-medium transition-colors"
            >
              {sending ? 'Resending...' : 'Resend OTP'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OtpModal;
