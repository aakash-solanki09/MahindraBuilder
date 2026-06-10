import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility function to generate default metadata based on the page name
export function generateMetaTags(pageName: string, overrides: Partial<Record<string, string>> = {}) {
  const defaultMeta = {
    title: `${pageName} | MyWebsite`,
    description: `Learn more about ${pageName} on MyWebsite.`,
    keywords: `${pageName.toLowerCase()}, mywebsite, react seo`,
    author: "MyWebsite",
    robots: "index, follow",
    viewport: "width=device-width, initial-scale=1.0",
    themeColor: "#ffffff",
    canonical: `https://mywebsite.com/${pageName.toLowerCase().replace(/\s+/g, '-')}`,
    ogType: "website",
    ogTitle: `${pageName} | MyWebsite`,
    ogDescription: `Discover ${pageName} on MyWebsite.`,
    ogUrl: `https://mywebsite.com/${pageName.toLowerCase().replace(/\s+/g, '-')}`,
    ogImage: "https://mywebsite.com/images/default-banner.jpg",
    ogSiteName: "MyWebsite",
    ogLocale: "en_US",
    twitterCard: "summary_large_image",
    twitterTitle: `${pageName} | MyWebsite`,
    twitterDescription: `Explore ${pageName} on MyWebsite.`,
    twitterImage: "https://mywebsite.com/images/default-banner.jpg",
    twitterSite: "@mywebsite",
    contentLanguage: "en",
    rating: "general",
    distribution: "global",
    revisitAfter: "7 days",
    favicon: "/favicon.ico",
    appleTouchIcon: "/apple-touch-icon.png",
  };

  return { ...defaultMeta, ...overrides };
}
