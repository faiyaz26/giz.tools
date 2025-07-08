/**
 * Core types for the markdown parser
 */

export interface Card {
  title: string;
  body: string;
  footer: string;
  spanConfig: string; // e.g., "row-span-2", "col-span-2"
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
}

export interface ParseResult {
  success: boolean;
  document?: MarkdownDocument;
  error?: string;
  filePath?: string;
}
