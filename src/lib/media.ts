import { API_URL } from './api';

const backendBaseUrl = API_URL.replace(/\/api\/?$/, '');

export const resolveMediaUrl = (url?: string): string => {
  if (!url) return '';

  const trimmed = url.trim();

  // Absolute URLs (http, https, //) and data/blob URIs — return as-is
  if (
    /^(https?:)?\/\//i.test(trimmed) ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  // Upload paths — resolve to backend
  if (trimmed.startsWith('/uploads/')) {
    return `${backendBaseUrl}${trimmed}`;
  }

  if (trimmed.startsWith('uploads/')) {
    return `${backendBaseUrl}/${trimmed}`;
  }

  // Relative paths — return as-is (encodeURI removed to avoid corrupting URLs)
  return trimmed;
};