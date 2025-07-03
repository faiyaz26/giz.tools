import { Metadata } from "next";
import { generatePageMetadata } from "@/lib/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "Articles & Guides - Learn About Online Tools",
  description:
    "Read our articles and guides about online tools, privacy, security, and best practices. Learn how to use giz.tools effectively and understand our privacy-first approach.",
  path: "/articles",
  keywords: [
    "articles",
    "guides",
    "tutorials",
    "online tools",
    "privacy",
    "security",
    "best practices",
    "documentation",
    "how-to",
    "tips",
  ],
});

export default function ArticlesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
