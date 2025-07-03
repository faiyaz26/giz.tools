import { Metadata } from "next";
import {
  generateToolMetadata,
  generateToolStructuredData,
} from "@/lib/metadata";

export const metadata: Metadata = generateToolMetadata("/tools/base64");

export default function Base64Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const structuredData = generateToolStructuredData("/tools/base64");

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
