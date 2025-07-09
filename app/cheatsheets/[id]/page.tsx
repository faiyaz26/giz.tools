import React from "react";
import { DynamicCheatsheetPage } from "@/components/cheatsheet/dynamic-cheatsheet-page";
import { getAllCheatsheets } from "@/lib/cheatsheet-data";

// Generate static params for all available cheatsheets
export function generateStaticParams() {
  const cheatsheets = getAllCheatsheets();
  return cheatsheets.map((cheatsheet) => ({
    id: cheatsheet.id,
  }));
}

interface CheatsheetPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CheatsheetPage({ params }: CheatsheetPageProps) {
  const { id } = await params;
  return <DynamicCheatsheetPage cheatsheetId={id} />;
}
