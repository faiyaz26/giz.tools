import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Navigation } from "@/components/navigation";
import { PWAProvider } from "@/components/pwa-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { CommandPalette } from "@/components/command-palette";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://giz.tools"),
  title: {
    default: "giz.tools - Free Online Tools for Developers & Everyone",
    template: "%s | giz.tools",
  },
  description:
    "Your one-stop shop for essential online tools. Convert images, merge PDFs, encode Base64, decode JWT, format JSON, and more. Privacy-first, client-side processing - your data never leaves your browser.",
  keywords: [
    "online tools",
    "free tools",
    "privacy-first tools",
    "client-side processing",
    "image converter",
    "pdf merger",
    "pdf splitter",
    "base64 encoder",
    "base64 decoder",
    "jwt decoder",
    "json formatter",
    "text diff",
    "word counter",
    "url encoder",
    "hash generator",
    "markdown preview",
    "regex tester",
    "timezone converter",
    "unix timestamp",
    "cron parser",
    "developer tools",
    "productivity tools",
    "file converter",
    "text tools",
    "encoding tools",
    "security tools",
    "web utilities",
    "browser tools",
  ],
  authors: [{ name: "giz.tools Team", url: "https://giz.tools" }],
  creator: "giz.tools",
  publisher: "giz.tools",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.json",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#3B82F6" },
    { media: "(prefers-color-scheme: dark)", color: "#1E40AF" },
  ],
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://giz.tools",
    siteName: "giz.tools",
    title: "giz.tools - Free Online Tools for Developers & Everyone",
    description:
      "Your one-stop shop for essential online tools. Convert images, merge PDFs, encode Base64, decode JWT, format JSON, and more. Privacy-first, client-side processing.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "giz.tools - Free Online Tools for Developers & Everyone",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "giz.tools - Free Online Tools for Developers & Everyone",
    description:
      "Your one-stop shop for essential online tools. Privacy-first, client-side processing - your data never leaves your browser.",
    images: ["/og-image.png"],
    creator: "@giztools",
    site: "@giztools",
  },
  alternates: {
    canonical: "https://giz.tools",
    languages: {
      "en-US": "https://giz.tools",
    },
  },
  category: "Technology",
  classification: "Business",
  verification: {
    google: "google-site-verification-code",
    yandex: "yandex-verification-code",
    other: {
      "msvalidate.01": "bing-site-verification-code",
    },
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "giz.tools",
    "mobile-web-app-capable": "yes",
    "application-name": "giz.tools",
    "theme-color": "#3B82F6",
    "msapplication-TileColor": "#3B82F6",
    "msapplication-config": "/browserconfig.xml",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "giz.tools",
    url: "https://giz.tools",
    description:
      "Your one-stop shop for essential online tools. Convert images, merge PDFs, encode Base64, decode JWT, format JSON, and more. Privacy-first, client-side processing.",
    publisher: {
      "@type": "Organization",
      name: "giz.tools",
      url: "https://giz.tools",
    },
    potentialAction: {
      "@type": "SearchAction",
      target: "https://giz.tools/tools?search={search_term_string}",
      "query-input": "required name=search_term_string",
    },
    sameAs: ["https://twitter.com/giztools"],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="giz.tools" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="giz.tools" />
        <meta name="msapplication-TileColor" content="#3B82F6" />
        <meta name="msapplication-config" content="/browserconfig.xml" />

        {/* Preconnect to improve performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <PWAProvider />
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            <Navigation />
            <main>{children}</main>
          </div>
          <CommandPalette />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
