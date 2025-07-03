import { Metadata } from "next";
import {
  generateToolMetadata,
  generateToolStructuredData,
} from "@/lib/metadata";

export const metadata: Metadata = generateToolMetadata("/tools/pdf-splitter");

export default function PDFSplitterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const structuredData = generateToolStructuredData("/tools/pdf-splitter");

  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      {children}
    </>
  );
}
