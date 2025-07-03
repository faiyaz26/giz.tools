import { Metadata } from "next";
import {
  generateToolMetadata,
  generateToolStructuredData,
} from "@/lib/metadata";

export const metadata: Metadata = generateToolMetadata("/tools/json");

export default function JSONLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const structuredData = generateToolStructuredData("/tools/json");

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
