import fs from "fs";
import path from "path";
import pythonCheatsheetData from "./python-cheatsheet.json";
import unifiedCheatsheetsData from "./unified-cheatsheets.json";

// Type definitions for the parsed cheatsheet data
export interface KeyboardShortcut {
  shortcut: string;
  action: string;
}

export interface CheatsheetCardSubsection {
  title: string;
  content: string;
  type: "text" | "code";
}

export interface CheatsheetCard {
  title: string;
  body: string;
  footer: string;
  spanConfig: string;
  subsections?: CheatsheetCardSubsection[];
  shortcuts?: KeyboardShortcut[]; // For keyboard shortcut tables
  isShortcutsCard?: boolean; // Flag to identify shortcut cards
}

export interface CheatsheetSubsection {
  title: string;
  level: number;
  cards: CheatsheetCard[];
  subsections: CheatsheetSubsection[];
}

export interface CheatsheetSection {
  title: string;
  level: number;
  cards: CheatsheetCard[];
  subsections: CheatsheetSubsection[];
}

export interface CheatsheetMetadata {
  title: string;
  date: string;
  background: string;
  tags: string[];
  categories: string[];
  intro: string;
  plugins?: string[];
  label?: string;
}

export interface CheatsheetData {
  metadata: CheatsheetMetadata;
  sections: CheatsheetSection[];
}

// Unified cheatsheet interfaces
export interface UnifiedCheatsheetItem {
  id: string;
  metadata: CheatsheetMetadata;
  sections: CheatsheetSection[];
}

export interface UnifiedCheatsheetData {
  cheatsheets: UnifiedCheatsheetItem[];
  createdAt: string;
  version: string;
}

// Load parsed cheatsheet data
export function loadCheatsheetData(filename: string): CheatsheetData {
  if (filename === "python-cheatsheet-parsed.json") {
    return pythonCheatsheetData as CheatsheetData;
  }

  if (filename === "finder-cheatsheet.json") {
    try {
      const finderData = require("./finder-cheatsheet.json");
      return finderData as CheatsheetData;
    } catch (error) {
      console.error("Failed to load finder cheatsheet:", error);
      throw new Error("Finder cheatsheet data not found");
    }
  }

  throw new Error(`Cheatsheet data not found: ${filename}`);
}

// Load unified cheatsheet data
export function loadUnifiedCheatsheetData(): UnifiedCheatsheetData {
  return unifiedCheatsheetsData as UnifiedCheatsheetData;
}

// Get a specific cheatsheet from unified data
export function getCheatsheetById(id: string): CheatsheetData | null {
  const unified = loadUnifiedCheatsheetData();
  const cheatsheet = unified.cheatsheets.find((cs) => cs.id === id);

  if (cheatsheet) {
    return {
      metadata: cheatsheet.metadata,
      sections: cheatsheet.sections,
    };
  }

  return null;
}

// Get all available cheatsheets from unified data
export function getAllCheatsheets(): UnifiedCheatsheetItem[] {
  const unified = loadUnifiedCheatsheetData();
  return unified.cheatsheets;
}

// Parse span configuration into CSS classes
export function parseSpanConfig(
  spanConfig: string
): {
  gridColumn?: string;
  gridRow?: string;
  className: string;
} {
  if (!spanConfig) {
    return { className: "" };
  }

  const classes = spanConfig.split(" ").filter((c) => c.trim());
  let gridColumn = "";
  let gridRow = "";
  let className = "";

  classes.forEach((cls) => {
    const cleanClass = cls.replace(/^\./, ""); // Remove leading dot if present

    if (cleanClass.includes("col-span-")) {
      const match = cleanClass.match(/col-span-(\d+)/);
      if (match) {
        gridColumn = `span ${match[1]}`;
        className += ` ${cleanClass}`;
      }
    } else if (cleanClass.includes("row-span-")) {
      const match = cleanClass.match(/row-span-(\d+)/);
      if (match) {
        gridRow = `span ${match[1]}`;
        className += ` ${cleanClass}`;
      }
    } else {
      className += ` ${cleanClass}`;
    }
  });

  return {
    gridColumn: gridColumn || undefined,
    gridRow: gridRow || undefined,
    className: className.trim(),
  };
}

// Extract code from markdown code blocks
export function extractCodeFromMarkdown(
  markdown: string
): {
  language: string;
  code: string;
} {
  const codeBlockMatch = markdown.match(/```(\w+)?\n([\s\S]*?)\n```/);

  if (codeBlockMatch) {
    return {
      language: codeBlockMatch[1] || "text",
      code: codeBlockMatch[2].trim(),
    };
  }

  return {
    language: "text",
    code: markdown,
  };
}

// Process markdown content into structured format
export function processMarkdownContent(
  content: string
): {
  type: "code" | "text" | "table";
  language?: string;
  code?: string;
  text?: string;
  rows?: { key: string; value: string }[];
} {
  // Check if it's a code block
  if (content.includes("```")) {
    const { language, code } = extractCodeFromMarkdown(content);
    return {
      type: "code",
      language,
      code,
    };
  }

  // Check if it's a table (markdown table format)
  if (content.includes("|") && content.includes("---")) {
    const lines = content.split("\n").filter((line) => line.trim());
    const rows: { key: string; value: string }[] = [];

    for (const line of lines) {
      if (line.includes("|") && !line.includes("---")) {
        const columns = line
          .split("|")
          .map((col) => col.trim())
          .filter((col) => col);
        if (columns.length >= 2) {
          rows.push({
            key: columns[0],
            value: columns[1],
          });
        }
      }
    }

    if (rows.length > 0) {
      return {
        type: "table",
        rows,
      };
    }
  }

  // Default to text
  return {
    type: "text",
    text: content,
  };
}
