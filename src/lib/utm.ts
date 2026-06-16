import api from './api';

const UTM_STORAGE_KEY = 'utm_params';

export interface UTMParams {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_id: string;
  utm_term: string;
  utm_content: string;
}

export function extractUTMFromURL(): UTMParams {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get('utm_source') || '',
    utm_medium: params.get('utm_medium') || '',
    utm_campaign: params.get('utm_campaign') || '',
    utm_id: params.get('utm_id') || '',
    utm_term: params.get('utm_term') || '',
    utm_content: params.get('utm_content') || '',
  };
}

export function hasUTMParams(params: UTMParams): boolean {
  return Object.values(params).some((v) => v.length > 0);
}

export function storeUTMParams(params: UTMParams): void {
  if (hasUTMParams(params)) {
    localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(params));
  }
}

export function getStoredUTMParams(): UTMParams {
  try {
    const stored = localStorage.getItem(UTM_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {}
  return {
    utm_source: '',
    utm_medium: '',
    utm_campaign: '',
    utm_id: '',
    utm_term: '',
    utm_content: '',
  };
}

export async function capturePageUTM(pageData: {
  pageId?: string;
  pageName?: string;
  pageSlug?: string;
  sourcePath?: string;
}): Promise<void> {
  const urlParams = extractUTMFromURL();
  const storedParams = getStoredUTMParams();
  const utm = hasUTMParams(urlParams) ? urlParams : storedParams;

  if (!hasUTMParams(utm)) return;

  storeUTMParams(urlParams);

  try {
    await api.post('/utm', {
      ...utm,
      pageId: pageData.pageId,
      pageName: pageData.pageName,
      pageSlug: pageData.pageSlug,
      sourcePath: pageData.sourcePath || window.location.pathname,
      fullUrl: window.location.href,
    });
  } catch (err) {
    console.error('[UTM] Failed to capture:', err);
  }
}
