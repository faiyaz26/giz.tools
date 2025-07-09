import React from "react";
import { notFound } from "next/navigation";
import { DynamicCheatsheetPage } from "@/components/cheatsheet/dynamic-cheatsheet-page";
import {
  getAllCheatsheetsServer,
  getCheatsheetByIdServer,
} from "@/lib/cheatsheet-data-server";

// Generate static params for all available cheatsheets
export function generateStaticParams() {
  const cheatsheets = getAllCheatsheetsServer();
  return cheatsheets.map((cheatsheet) => ({
    id: cheatsheet.id,
  }));
}

// Only generate pages for known cheatsheets
export const dynamicParams = false;

interface CheatsheetPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CheatsheetPage({ params }: CheatsheetPageProps) {
  const { id } = await params;

  // Check if the cheatsheet exists
  const cheatsheet = getCheatsheetByIdServer(id);
  if (!cheatsheet) {
    notFound();
  }

  return <DynamicCheatsheetPage cheatsheetId={id} />;
}
