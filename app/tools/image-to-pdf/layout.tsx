import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image to PDF Converter - giz.tools",
  description:
    "Convert multiple images to a single PDF document. Upload JPG, PNG, GIF, WebP and other image formats, reorder them, and create a custom PDF. Free online image to PDF converter with no watermarks.",
  keywords:
    "image to pdf, convert images to pdf, jpg to pdf, png to pdf, image converter, pdf creator, merge images pdf",
  openGraph: {
    title: "Image to PDF Converter - giz.tools",
    description:
      "Convert multiple images to a single PDF document. Upload images, reorder them, and create a custom PDF.",
  },
};

export default function ImageToPdfLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
