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
  title: "giz.tools - Essential Online Tools",
  description:
    "A comprehensive collection of free online tools including Base64 encoder/decoder, image converter, PDF tools, and more. Fast, secure, and private.",
  keywords:
    "online tools, image converter, pdf merger, pdf splitter, base64, jwt, encoder, decoder, utilities, text diff, timezone converter",
  authors: [{ name: "giz.tools" }],
  creator: "giz.tools",
  publisher: "giz.tools",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.json",
  themeColor: "#3B82F6",
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://giz.tools",
    siteName: "giz.tools",
    title: "giz.tools - Essential Online Tools",
    description:
      "A comprehensive collection of free online tools including Base64 encoder/decoder, image converter, PDF tools, and more.",
    images: [
      {
        url: "https://giz.tools/og-image.png",
        width: 1200,
        height: 630,
        alt: "giz.tools - Essential Online Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "giz.tools - Essential Online Tools",
    description:
      "A comprehensive collection of free online tools including Base64 encoder/decoder, image converter, PDF tools, and more.",
    images: ["https://giz.tools/og-image.png"],
    creator: "@giztools",
  },
  alternates: {
    canonical: "https://giz.tools",
    languages: {
      "en-US": "https://giz.tools",
    },
  },
  category: "Technology",
  verification: {
    google: "google-site-verification-code",
    yandex: "yandex-verification-code",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="giz.tools" />
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
