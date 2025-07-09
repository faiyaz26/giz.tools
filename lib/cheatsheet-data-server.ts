import fs from "fs";
import path from "path";
import {
  CheatsheetIndexData,
  CheatsheetIndexItem,
  CheatsheetData,
} from "./cheatsheet-data-client";

// Server-side function to get all cheatsheets for SSR/SSG
export function getAllCheatsheetsServer(): CheatsheetIndexItem[] {
  try {
    const indexPath = path.join(
      process.cwd(),
      "public/data/cheatsheets-index.json"
    );
    const indexData = JSON.parse(
      fs.readFileSync(indexPath, "utf-8")
    ) as CheatsheetIndexData;
    return indexData.cheatsheets;
  } catch (error) {
    console.error("Error loading cheatsheets index:", error);
    return [];
  }
}

// Server-side function to get individual cheatsheet for SSR/SSG
export function getCheatsheetByIdServer(id: string): CheatsheetData | null {
  try {
    const cheatsheetPath = path.join(
      process.cwd(),
      `public/data/cheatsheets/${id}.json`
    );
    const cheatsheetData = JSON.parse(
      fs.readFileSync(cheatsheetPath, "utf-8")
    ) as CheatsheetData;
    return cheatsheetData;
  } catch (error) {
    console.error(`Error loading cheatsheet ${id}:`, error);
    return null;
  }
}

// Legacy support functions for backward compatibility
export function loadCheatsheetData(filename: string): CheatsheetData {
  if (filename === "python-cheatsheet-parsed.json") {
    return getCheatsheetByIdServer("python") || ({} as CheatsheetData);
  }

  if (filename === "finder-cheatsheet.json") {
    return getCheatsheetByIdServer("finder") || ({} as CheatsheetData);
  }

  throw new Error(`Cheatsheet data not found: ${filename}`);
}

// Legacy support - use server function
export function getAllCheatsheets(): CheatsheetIndexItem[] {
  return getAllCheatsheetsServer();
}

// Legacy support - use server function
export function getCheatsheetById(id: string): CheatsheetData | null {
  return getCheatsheetByIdServer(id);
}
