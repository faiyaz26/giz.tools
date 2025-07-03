import { Metadata } from "next";
import { tools, getToolByHref } from "./tools-data";

export interface PageMetadataProps {
  title?: string;
  description?: string;
  path?: string;
  keywords?: string[];
  ogImage?: string;
  noIndex?: boolean;
}

export function generateToolMetadata(toolHref: string): Metadata {
  const tool = getToolByHref(toolHref);

  if (!tool) {
    return {};
  }

  const title = `${tool.name} - Free Online Tool`;
  const description = `${tool.description} Privacy-first, client-side processing. No data leaves your browser. Part of giz.tools suite.`;
  const url = `https://giz.tools${tool.href}`;

  return {
    title,
    description,
    keywords: [
      ...tool.keywords,
      "free online tool",
      "privacy-first",
      "client-side",
      "no data collection",
      "browser-based",
      "giz.tools",
    ],
    openGraph: {
      title,
      description,
      url,
      type: "website",
      siteName: "giz.tools",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: `${tool.name} - Free Online Tool | giz.tools`,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"],
      creator: "@giztools",
      site: "@giztools",
    },
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export function generatePageMetadata({
  title,
  description,
  path = "",
  keywords = [],
  ogImage = "/og-image.png",
  noIndex = false,
}: PageMetadataProps): Metadata {
  const fullTitle = title ? `${title} | giz.tools` : "giz.tools";
  const url = `https://giz.tools${path}`;

  return {
    title: fullTitle,
    description,
    keywords: [
      ...keywords,
      "giz.tools",
      "online tools",
      "free tools",
      "privacy-first",
    ],
    openGraph: {
      title: fullTitle,
      description,
      url,
      type: "website",
      siteName: "giz.tools",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: fullTitle,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage],
      creator: "@giztools",
      site: "@giztools",
    },
    alternates: {
      canonical: url,
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
    },
  };
}

export function generateToolStructuredData(toolHref: string) {
  const tool = getToolByHref(toolHref);

  if (!tool) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.name,
    url: `https://giz.tools${tool.href}`,
    description: tool.description,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "All",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    publisher: {
      "@type": "Organization",
      name: "giz.tools",
      url: "https://giz.tools",
    },
    keywords: tool.keywords.join(", "),
    features: tool.features,
    isAccessibleForFree: true,
    browserRequirements: "Modern web browser with JavaScript enabled",
  };
}

export function generateBreadcrumbStructuredData(
  breadcrumbs: Array<{ name: string; url: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
}

export function generateSiteSearchStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: "https://giz.tools",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://giz.tools/tools?search={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function generateOrganizationStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "giz.tools",
    url: "https://giz.tools",
    logo: "https://giz.tools/icon-512.png",
    description:
      "Your one-stop shop for essential online tools. Privacy-first, client-side processing.",
    foundingDate: "2024",
    sameAs: ["https://twitter.com/giztools"],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      url: "https://giz.tools",
    },
  };
}
