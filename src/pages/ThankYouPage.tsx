import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../lib/api';
import type { PageData, Section } from '../types';
import ThankYouSection from '../components/sections/prebuilt/ThankYou';
import SEO from '../components/SEO';

const BrandLoader = () => (
  <div className="h-screen flex items-center justify-center bg-white">
    <img src="/mahindra-loader-new.gif" alt="Loading..." className="w-24 h-24 object-contain" />
  </div>
);

const ThankYouPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const isDraftPreview = new URLSearchParams(location.search).get('mode') === 'draft';
  const draftStorageKey = new URLSearchParams(location.search).get('draftKey');

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
            // Ignore invalid draft payload and fallback to API call.
          }
        }
      }

      try {
        const currentSlug = slug || 'preview';
        const res = await api.get(`/pages/published?slug=${currentSlug}`);
        setPage(res.data);
        setError(false);
      } catch (err) {
        console.error('Failed to load thank-you page content', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug, isDraftPreview, draftStorageKey]);

  const heroContent = useMemo(() => {
    const heroSection = page?.sections?.find((section: Section) => section.type === 'hero');
    return heroSection?.content || {};
  }, [page]);

  const thankYouSection = useMemo(() => {
    return page?.sections?.find((section: Section) => section.type === 'thank-you');
  }, [page]);

  if (loading) {
    return <BrandLoader />;
  }

  const resolvedContent = thankYouSection?.content || {
    heading: heroContent.thankYouHeading || heroContent.formTitle || 'Connect With Us',
    title: heroContent.thankYouTitle || 'Thank You!',
    message:
      heroContent.thankYouMessage ||
      'Thank you for your interest! We will get in touch with you shortly.',
    buttonText: heroContent.thankYouButtonText || 'Back to Landing Page',
  };

  const resolvedStyles = thankYouSection?.styles || {
    backgroundColor: '#F7F8FA',
    textColor: '#111827',
    headingColor: '#0A2A57',
    primaryColor: '#E31837',
    borderColor: '#d1d5db',
  };

  return (
    <>
      <SEO
        pageName={page?.pageName || 'Thank You'}
        slug={`${slug || 'preview'}/thank-you`}
        meta={page?.meta}
      />
      <ThankYouSection
        content={resolvedContent}
        styles={resolvedStyles}
        onPrimaryAction={() => navigate(`/${slug || 'preview'}${location.search || ''}`)}
      />
      {error && (
        <p className="mt-5 text-sm text-gray-500 text-center">
          Live content unavailable, showing default thank-you content.
        </p>
      )}
    </>
  );
};

export default ThankYouPage;
