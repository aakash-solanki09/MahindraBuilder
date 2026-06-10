import { API_URL } from './api';

const backendBaseUrl = API_URL.replace(/\/api\/?$/, '');

export const resolveMediaUrl = (url?: string): string => {
  if (!url) return '';

  const safeUrl = encodeURI(url.trim());

  if (
    /^(https?:)?\/\//i.test(safeUrl) ||
    safeUrl.startsWith('data:') ||
    safeUrl.startsWith('blob:')
  ) {
    return safeUrl;
  }

  if (safeUrl.startsWith('/uploads/')) {
    return `${backendBaseUrl}${safeUrl}`;
  }

  if (safeUrl.startsWith('uploads/')) {
    return `${backendBaseUrl}/${safeUrl}`;
  }

  return safeUrl;
};