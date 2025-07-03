import { generateToolMetadata } from "@/lib/metadata";

export const metadata = generateToolMetadata("/tools/pdf-to-image");

export default function PDFToImageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
