import { Metadata } from "next";
import { generatePageMetadata } from "@/lib/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "All Tools - Free Online Utilities",
  description:
    "Browse our complete collection of free online tools. Convert images, merge PDFs, encode Base64, decode JWT, format JSON, and more. Privacy-first, client-side processing.",
  path: "/tools",
  keywords: [
    "online tools collection",
    "free utilities",
    "web tools",
    "developer tools",
    "productivity tools",
    "image converter",
    "pdf tools",
    "encoding tools",
    "text tools",
    "security tools",
    "client-side processing",
    "privacy-first tools",
  ],
});

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
