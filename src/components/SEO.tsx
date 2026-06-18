import { Helmet } from "react-helmet-async";
import { API_URL } from "../lib/api";

type MetaAttribute = {
  name?: string;
  property?: string;
  httpEquiv?: string;
  content?: string;
};

type MetaLink = {
  rel?: string;
  href?: string;
};

interface SEOProps {
  pageName?: string;
  slug?: string;
  meta?: {
    title?: string;
    description?: string;
    gaMeasurementId?: string;
    gtmId?: string;
    pixelId?: string;
    attributes?: MetaAttribute[];
    links?: MetaLink[];
  };
}

const resolveAssetUrl = (url?: string) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;

  if (url.startsWith("/uploads/") || url.startsWith("uploads/")) {
    const backendBase = API_URL.replace("/api", "");
    const normalizedPath = url.startsWith("/") ? url : `/${url}`;
    return `${backendBase}${normalizedPath}`;
  }

  return url;
};

export default function SEO({
  pageName,
  slug,
  meta,
}: SEOProps) {
  const safePageName = (pageName || "Mahindra Logistics").trim();
  const title = (meta?.title || safePageName).trim();
  const description =
    (meta?.description || `Learn more about ${safePageName}.`).trim();
  const path = slug && slug !== "preview" ? `/${slug}` : "/";
  const canonical =
    typeof window !== "undefined"
      ? `${window.location.origin}${path}`
      : `https://mywebsite.com${path}`;

  const defaults: MetaAttribute[] = [
    { name: "keywords", content: `${safePageName}, logistics, warehousing, supply chain` },
    { name: "author", content: "MyWebsite" },
    { name: "robots", content: "index, follow" },
    { name: "viewport", content: "width=device-width, initial-scale=1.0" },
    { name: "theme-color", content: "#ffffff" },
    { property: "og:type", content: "website" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: canonical },
    { property: "og:image", content: "https://mywebsite.com/images/seo-banner.jpg" },
    { property: "og:site_name", content: "MyWebsite" },
    { property: "og:locale", content: "en_US" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: "https://mywebsite.com/images/seo-banner.jpg" },
    { name: "twitter:site", content: "@mywebsite" },
    { httpEquiv: "Content-Language", content: "en" },
    { name: "rating", content: "general" },
    { name: "distribution", content: "global" },
    { name: "revisit-after", content: "7 days" },
  ];

  const customAttributes = (meta?.attributes || []).filter(
    (item) =>
      !!item &&
      !!(item.name || item.property || item.httpEquiv) &&
      !!item.content?.trim()
  );

  const mergedAttributeMap = new Map<string, MetaAttribute>();

  for (const item of defaults) {
    const key = item.name
      ? `name:${item.name}`
      : item.property
      ? `property:${item.property}`
      : `httpEquiv:${item.httpEquiv}`;
    mergedAttributeMap.set(key, item);
  }

  for (const item of customAttributes) {
    const key = item.name
      ? `name:${item.name}`
      : item.property
      ? `property:${item.property}`
      : `httpEquiv:${item.httpEquiv}`;
    mergedAttributeMap.set(key, {
      name: item.name?.trim(),
      property: item.property?.trim(),
      httpEquiv: item.httpEquiv?.trim(),
      content:
        item.name?.trim()?.toLowerCase() === "twitter:image" ||
        item.property?.trim()?.toLowerCase() === "og:image"
          ? resolveAssetUrl(item.content?.trim())
          : item.content?.trim(),
    });
  }

  const mergedLinks: MetaLink[] = [
    { rel: "canonical", href: canonical },
    { rel: "icon", href: "/favicon.ico" },
    { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
  ];

  const customLinks = (meta?.links || []).filter(
    (item) => !!item.rel?.trim() && !!item.href?.trim()
  );

  for (const link of customLinks) {
    const existingIndex = mergedLinks.findIndex((base) => base.rel === link.rel);
    if (existingIndex >= 0) {
      mergedLinks[existingIndex] = {
        rel: link.rel?.trim(),
        href:
          link.rel?.trim()?.toLowerCase() === "icon" ||
          link.rel?.trim()?.toLowerCase() === "apple-touch-icon"
            ? resolveAssetUrl(link.href?.trim())
            : link.href?.trim(),
      };
    } else {
      mergedLinks.push({
        rel: link.rel?.trim(),
        href:
          link.rel?.trim()?.toLowerCase() === "icon" ||
          link.rel?.trim()?.toLowerCase() === "apple-touch-icon"
            ? resolveAssetUrl(link.href?.trim())
            : link.href?.trim(),
      });
    }
  }

  const ogImage =
    mergedAttributeMap.get("property:og:image")?.content ||
    "https://mywebsite.com/images/seo-banner.jpg";

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    image: resolveAssetUrl(ogImage),
    author: {
      "@type": "Person",
      name: "Site Admin",
    },
    publisher: {
      "@type": "Organization",
      name: "MyWebsite",
      logo: {
        "@type": "ImageObject",
        url: "https://mywebsite.com/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonical,
    },
  };

  const gaId = (meta?.gaMeasurementId || '').trim().toUpperCase();
  const hasGa = /^G-[A-Z0-9]+$/.test(gaId);

  const gtmId = (meta?.gtmId || '').trim().toUpperCase();
  const hasGtm = /^GTM-[A-Z0-9]+$/.test(gtmId);

  const pixelId = (meta?.pixelId || '').trim();
  const hasPixel = /^[0-9]+$/.test(pixelId);

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {Array.from(mergedAttributeMap.values()).map((tag, idx) => {
        if (tag.name) {
          return <meta key={`name-${tag.name}-${idx}`} name={tag.name} content={tag.content} />;
        }
        if (tag.property) {
          return (
            <meta
              key={`property-${tag.property}-${idx}`}
              property={tag.property}
              content={tag.content}
            />
          );
        }
        return (
          <meta
            key={`http-${tag.httpEquiv}-${idx}`}
            httpEquiv={tag.httpEquiv}
            content={tag.content}
          />
        );
      })}
      {mergedLinks.map((link, idx) => (
        <link key={`${link.rel}-${idx}`} rel={link.rel} href={link.href} />
      ))}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      {hasGa && (
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
      )}
      {hasGa && (
        <script>
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}');`}
        </script>
      )}
      {hasGtm && (
        <script>
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`}
        </script>
      )}
      {hasGtm && (
        <noscript>
          {`<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`}
        </noscript>
      )}
      {hasPixel && (
        <script>
          {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${pixelId}');
fbq('track', 'PageView');`}
        </script>
      )}
      {hasPixel && (
        <noscript>
          {`<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1" />`}
        </noscript>
      )}
    </Helmet>
  );
}