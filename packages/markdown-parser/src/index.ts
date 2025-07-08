/**
 * @giz-tools/markdown-parser
 *
 * A TypeScript-based markdown parser for Husky CMS that converts
 * structured markdown files into JSON format suitable for rendering
 * in card-based layouts.
 */

export { MarkdownParser } from "./parser.js";
export type {
  Card,
  Section,
  MarkdownDocument,
  MarkdownMetadata,
  ParsedContent,
  ParserOptions,
  ParseResult,
} from "./types.js";

// Default export for convenience
export { MarkdownParser as default } from "./parser.js";
