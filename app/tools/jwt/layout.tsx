import { Metadata } from "next";
import {
  generateToolMetadata,
  generateToolStructuredData,
} from "@/lib/metadata";

export const metadata: Metadata = generateToolMetadata("/tools/jwt");

export default function JWTLayout({ children }: { children: React.ReactNode }) {
  const structuredData = generateToolStructuredData("/tools/jwt");

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
