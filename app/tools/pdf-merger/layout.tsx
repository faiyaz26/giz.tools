import { Metadata } from "next";
import {
  generateToolMetadata,
  generateToolStructuredData,
} from "@/lib/metadata";

export const metadata: Metadata = generateToolMetadata("/tools/pdf-merger");

export default function PDFMergerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const structuredData = generateToolStructuredData("/tools/pdf-merger");

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
