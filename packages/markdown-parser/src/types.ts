/**
 * Core types for the markdown parser
 */

export interface KeyboardShortcut {
  shortcut: string;
  action: string;
}

export interface Card {
  title: string;
  body: string;
  footer: string;
  spanConfig: string; // e.g., "row-span-2", "col-span-2"
  shortcuts?: KeyboardShortcut[]; // For keyboard shortcut tables
  isShortcutsCard?: boolean; // Flag to identify shortcut cards
}

export interface Section {
  title: string;
  level: number; // 2 for H2, 3 for H3
  cards: Card[];
  subsections: Section[];
}

export interface MarkdownMetadata {
  title?: string;
  date?: string;
  background?: string;
  tags?: string[];
  categories?: string[];
  intro?: string;
  plugins?: string[];
  [key: string]: any;
}

export interface MarkdownDocument {
  metadata: MarkdownMetadata;
  sections: Section[];
}

export interface ParsedContent {
  code: string;
  footer: string;
}

export interface ParserOptions {
  includeMetadata?: boolean;
  preserveCodeBlocks?: boolean;
  extractSpanConfig?: boolean;
  unifiedOutput?: boolean; // New option for unified output
}

export interface ParseResult {
  success: boolean;
  document?: MarkdownDocument;
  error?: string;
  filePath?: string;
}

// New unified cheatsheet interfaces
export interface UnifiedCheatsheetItem {
  id: string;
  metadata: MarkdownMetadata;
  sections: Section[];
}

export interface UnifiedCheatsheetData {
  cheatsheets: UnifiedCheatsheetItem[];
  createdAt: string;
  version: string;
}

// Individual cheatsheet interfaces
export interface CheatsheetIndexItem {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  categories: string[];
  status: "Available" | "Coming Soon";
  gradient: string;
  badge: string;
  icon: string;
  sections: string[];
  lastUpdated: string;
}

export interface CheatsheetIndexData {
  cheatsheets: CheatsheetIndexItem[];
  createdAt: string;
  version: string;
}
