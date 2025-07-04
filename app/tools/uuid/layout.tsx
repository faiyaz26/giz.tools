import { Metadata } from "next";
import { generateToolMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateToolMetadata("/tools/uuid");

export default function UUIDLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
