import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useBuilderStore } from '../store/useBuilderStore';
import SectionRenderer from '../components/SectionRenderer';
import OtpModal from '../components/ui/OtpModal';
import api from '../lib/api';
import SEO from "../components/SEO";
import { capturePageUTM, getStoredUTMParams } from '../lib/utm';

const BrandLoader = () => (
  <div className="h-screen flex items-center justify-center bg-white">
    <img src="/mahindra-loader-new.gif" alt="Loading..." className="w-24 h-24 object-contain" />
  </div>
);

const LivePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const page = useBuilderStore((state) => state.page);
  const setPage = useBuilderStore((state) => state.setPage);
  const setStoreView = useBuilderStore((state) => state.setView);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [view, setView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [formMobile, setFormMobile] = useState('');
  const pendingFormRef = useRef<HTMLFormElement | null>(null);
  const isDraftPreview = new URLSearchParams(location.search).get('mode') === 'draft';
  const draftStorageKey = new URLSearchParams(location.search).get('draftKey');

  const scrollToHeroForm = () => {
    const targets = Array.from(document.querySelectorAll<HTMLElement>('[data-hero-form-target="true"]'));
    const visibleTarget = targets.find((element) => {
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });

    if (!visibleTarget) return;

    visibleTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
    visibleTarget.animate(
      [
        { transform: 'scale(1)', boxShadow: '0 0 0 rgba(227, 24, 55, 0)' },
        { transform: 'scale(1.02)', boxShadow: '0 0 0 10px rgba(227, 24, 55, 0.12)' },
        { transform: 'scale(1)', boxShadow: '0 0 0 rgba(227, 24, 55, 0)' }
      ],
      { duration: 700, easing: 'ease-out' }
    );
  };

  // OTP verified → submit form data to API
  const handleOtpVerified = useCallback(async (verifiedMobile: string) => {
    setShowOtpModal(false);
    const form = pendingFormRef.current;
    if (!form) return;

    try {
      const formDataObj: Record<string, string> = {};
      const formElements = form.querySelectorAll('input, select, textarea');
      formElements.forEach((el: any) => {
        const name = el.name || el.getAttribute('name');
        if (name && el.type !== 'submit' && el.type !== 'button') {
          if (el.type === 'checkbox' || el.type === 'radio') {
            if (el.checked) formDataObj[name] = el.value;
          } else {
            formDataObj[name] = el.value || '';
          }
        }
      });

      if (!formDataObj.phone && !formDataObj.mobile) {
        formDataObj.phone = verifiedMobile;
      }

      const currentSlug = slug || 'mahindralogistic';
      const resolvedSlug = page?.slug && page.slug !== 'preview' ? page.slug : currentSlug;
      const resolvedName = page?.pageName || resolvedSlug;

      const storedUTM = getStoredUTMParams();

      await api.post('/leads', {
        ...formDataObj,
        ...storedUTM,
        sourcePageName: resolvedName,
        sourcePageSlug: resolvedSlug,
        sourcePath: location.pathname,
        pageId: page?._id,
      });

      navigate(`/${currentSlug}/thank-you${location.search || ''}`);
    } catch (err) {
      console.error('Error submitting lead:', err);
      alert('Error submitting form. Please try again.');
    } finally {
      pendingFormRef.current = null;
    }
  }, [slug, page, navigate, location]);

  // Intercept form submissions using native DOM listener on document
  useEffect(() => {
    const intercept = (e: Event) => {
      const form = e.target as HTMLFormElement;
      if (!form || form.tagName !== 'FORM') return;
      const heroFormTarget = form.querySelector('[data-hero-form-target]') || form.closest('[data-hero-form-target]');
      if (heroFormTarget) return;
      const action = (form.getAttribute('action') || '').toLowerCase();
      if (action.includes('salesforce.com')) return;

      e.preventDefault();
      e.stopPropagation();
      pendingFormRef.current = form;

      // Extract mobile from the form
      const mobileInput = form.querySelector('input[name="mobile"], input[name="phone"]') as HTMLInputElement | null;
      const extractedMobile = mobileInput?.value || '';
      setFormMobile(extractedMobile);
      setShowOtpModal(true);
    };
    document.addEventListener('submit', intercept);
    console.log('[OTP] Form interceptor attached');
    return () => {
      document.removeEventListener('submit', intercept);
      console.log('[OTP] Form interceptor removed');
    };
  }, []);

  useEffect(() => {
    const fetchPage = async () => {
      if (isDraftPreview) {
        const draftSnapshot =
          (draftStorageKey ? localStorage.getItem(draftStorageKey) : null) ||
          localStorage.getItem('builder-preview-page') ||
          sessionStorage.getItem('builder-preview-page');
        if (draftSnapshot) {
          try {
            setPage(JSON.parse(draftSnapshot));
            setError(false);
            setLoading(false);
            return;
          } catch {
            // Fallback to published fetch if snapshot is invalid
          }
        }
      }

      try {
        const currentSlug = slug || 'preview';
        const res = await api.get(`/pages/published?slug=${currentSlug}`);
        setPage(res.data);

        capturePageUTM({
          pageId: res.data?._id,
          pageName: res.data?.pageName,
          pageSlug: res.data?.slug || currentSlug,
          sourcePath: location.pathname,
        });
      } catch (err) {
        console.error('No published page found or error fetching', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, [slug, location.search, setPage, isDraftPreview, draftStorageKey]);

  useEffect(() => {
    if (!isDraftPreview) return;

    const syncDraftPreview = (event: StorageEvent) => {
      const keyMatches =
        event.key === 'builder-preview-page' ||
        (draftStorageKey ? event.key === draftStorageKey : false);

      if (!keyMatches || !event.newValue) return;

      try {
        setPage(JSON.parse(event.newValue));
        setError(false);
      } catch {
        // Ignore malformed draft payloads
      }
    };

    window.addEventListener('storage', syncDraftPreview);
    return () => window.removeEventListener('storage', syncDraftPreview);
  }, [isDraftPreview, draftStorageKey, setPage]);

  useEffect(() => {
    const handleResize = () => {
      let currentView: 'desktop' | 'tablet' | 'mobile' = 'desktop';
      if (window.innerWidth < 768) currentView = 'mobile';
      else if (window.innerWidth < 1024) currentView = 'tablet';
      
      setView(currentView);
      setStoreView(currentView);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setStoreView]);

  if (loading) return <BrandLoader />;

  if (error || !page.sections || page.sections.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-4xl font-bold text-mahindra-blue mb-4">Site Under Construction</h1>
        <p className="text-gray-600 mb-8 max-w-md">The Mahindra Logistics landing page is currently being built. Please check back later or visit the admin dashboard to publish your content.</p>
      </div>
    );
  }

  const floatingCta = page.meta?.floatingCta;
  const floatingCtaText = floatingCta?.text?.trim() || 'Get Free Quote';
  const floatingCtaBg = floatingCta?.backgroundColor || '#E31837';
  const floatingCtaTextColor = floatingCta?.textColor || '#ffffff';
  const floatingCtaBorderColor = floatingCta?.borderColor || '';

  return (
    <div className="min-h-screen">
      <SEO pageName={page.pageName} slug={slug || page.slug} meta={page.meta} />
      {page.sections.filter((section) => section.type !== 'thank-you').map((section) => (
        <SectionRenderer key={section.id} section={section} isEditing={false} view={view} />
      ))}
      
      {/* Sticky CTA */}
      <div
        className={`fixed z-[9999] ${
          view === 'desktop' ? 'bottom-8 right-8' : view === 'tablet' ? 'bottom-5 right-5' : 'bottom-4 right-4'
        }`}
      >
        <button
          type="button"
          onClick={scrollToHeroForm}
          className={`bg-mahindra-red text-white shadow-2xl font-bold flex items-center justify-center transition-all hover:scale-110 active:scale-95 rounded-full overflow-hidden ${
            view === 'desktop' ? 'px-8 py-4' : view === 'tablet' ? 'w-14 h-14' : 'w-12 h-12'
          }`}
          style={{
            backgroundColor: floatingCtaBg,
            color: floatingCtaTextColor,
            border: floatingCtaBorderColor ? `2px solid ${floatingCtaBorderColor}` : undefined,
          }}
        >
          {view === 'desktop' ? (
            <span className="flex items-center gap-3">{floatingCtaText}</span>
          ) : (
            <svg
              className={`${view === 'tablet' ? 'w-7 h-7' : 'w-6 h-6'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M17 7L7 17M17 7H7M17 7V17"
              />
            </svg>
          )}
        </button>
      </div>

      {/* OTP Verification Modal */}
      <OtpModal
        isOpen={showOtpModal}
        onClose={() => { setShowOtpModal(false); pendingFormRef.current = null; }}
        onVerified={handleOtpVerified}
        formMobile={formMobile}
      />
    </div>
  );
};

export default LivePage;
