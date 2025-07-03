import { Metadata } from "next";
import {
  generateToolMetadata,
  generateToolStructuredData,
} from "@/lib/metadata";

export const metadata: Metadata = generateToolMetadata(
  "/tools/image-converter"
);

export default function ImageConverterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const structuredData = generateToolStructuredData("/tools/image-converter");

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
