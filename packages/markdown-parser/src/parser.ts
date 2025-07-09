import * as fs from "fs";
import * as yaml from "js-yaml";
import {
  Card,
  Section,
  MarkdownDocument,
  MarkdownMetadata,
  ParsedContent,
  ParserOptions,
  ParseResult,
  KeyboardShortcut,
} from "./types.js";

/**
 * Markdown Parser for Husky CMS
 * Parses markdown files and converts them to structured JSON format
 */
export class MarkdownParser {
  private yamlPattern: RegExp;
  private h2Pattern: RegExp;
  private h3Pattern: RegExp;
  private codeBlockPattern: RegExp;

  constructor() {
    this.yamlPattern = new RegExp("^---\\n([\\s\\S]*?)\\n---\\n", "m");
    this.h2Pattern = /^## (.+)$/gm;
    this.h3Pattern = /^### (.+?)(\s*\{[^}]+\})?\s*$/gm;
    this.codeBlockPattern = new RegExp("```(\\w+)?\\n([\\s\\S]*?)\\n```", "g");
  }

  /**
   * Parse a markdown file and return structured data
   */
  public async parseFile(
    filePath: string,
    options: ParserOptions = {}
  ): Promise<ParseResult> {
    try {
      const content = await fs.promises.readFile(filePath, "utf-8");
      const document = this.parseContent(content, options);

      return {
        success: true,
        document,
        filePath,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        filePath,
      };
    }
  }

  /**
   * Parse markdown content and return structured data
   */
  public parseContent(
    content: string,
    options: ParserOptions = {}
  ): MarkdownDocument {
    const {
      includeMetadata = true,
      preserveCodeBlocks = true,
      extractSpanConfig = true,
    } = options;

    // Extract YAML front matter
    const metadata = includeMetadata ? this.extractMetadata(content) : {};

    // Remove YAML front matter from content
    const contentWithoutYaml = this.yamlPattern.test(content)
      ? content.replace(this.yamlPattern, "")
      : content;

    // Clean and normalize content
    const cleanedContent = this.cleanMarkdownContent(contentWithoutYaml);

    // Parse sections
    const sections = this.parseSections(cleanedContent, {
      preserveCodeBlocks,
      extractSpanConfig,
    });

    return {
      metadata,
      sections,
    };
  }

  /**
   * Extract and parse YAML front matter
   */
  private extractMetadata(content: string): MarkdownMetadata {
    const match = this.yamlPattern.exec(content);
    if (match) {
      const yamlContent = match[1];
      try {
        return (yaml.load(yamlContent) as MarkdownMetadata) || {};
      } catch (error) {
        console.warn("Error parsing YAML:", error);
        return {};
      }
    }
    return {};
  }

  /**
   * Parse H2 and H3 sections from content
   */
  private parseSections(
    content: string,
    options: Partial<ParserOptions>
  ): Section[] {
    const sections: Section[] = [];

    // Split content by H2 headings
    const h2Matches = Array.from(content.matchAll(this.h2Pattern));

    for (let i = 0; i < h2Matches.length; i++) {
      const currentMatch = h2Matches[i];
      const nextMatch = h2Matches[i + 1];

      const h2Title = currentMatch[1].trim();
      const h2StartIndex = currentMatch.index! + currentMatch[0].length;
      const h2EndIndex = nextMatch ? nextMatch.index! : content.length;
      const h2Content = content.slice(h2StartIndex, h2EndIndex);

      const section: Section = {
        title: h2Title,
        level: 2,
        cards: [],
        subsections: this.parseH3Sections(h2Content, options),
      };

      sections.push(section);
    }

    return sections;
  }

  /**
   * Parse H3 sections and their cards
   */
  private parseH3Sections(
    content: string,
    options: Partial<ParserOptions>
  ): Section[] {
    const subsections: Section[] = [];

    // Split content by H3 headings
    const h3Matches = Array.from(content.matchAll(this.h3Pattern));

    for (let i = 0; i < h3Matches.length; i++) {
      const currentMatch = h3Matches[i];
      const nextMatch = h3Matches[i + 1];

      const h3Title = currentMatch[1].trim();
      const spanConfig = currentMatch[2] ? currentMatch[2].trim() : "";

      const h3StartIndex = currentMatch.index! + currentMatch[0].length;
      const h3EndIndex = nextMatch ? nextMatch.index! : content.length;
      const h3Content = content.slice(h3StartIndex, h3EndIndex);

      // Parse span configuration
      let spanClass = "";
      if (spanConfig && options.extractSpanConfig) {
        const spanMatch = spanConfig.match(/\{\.([^}]+)\}/);
        if (spanMatch) {
          spanClass = spanMatch[1];
        }
      }

      // Parse cards from H3 content
      const cards = this.parseCards(h3Content, h3Title, spanClass, options);

      const subsection: Section = {
        title: h3Title,
        level: 3,
        cards,
        subsections: [],
      };

      subsections.push(subsection);
    }

    return subsections;
  }

  /**
   * Parse cards from section content with enhanced subsection handling
   */
  private parseCards(
    content: string,
    sectionTitle: string,
    spanClass: string,
    options: Partial<ParserOptions>
  ): Card[] {
    const cards: Card[] = [];

    // Clean the content first
    const cleanedContent = this.cleanMarkdownContent(content);

    // Check if this is a shortcuts section
    const isShortcutsSection =
      spanClass === "shortcuts" || content.includes("{.shortcuts}");

    // Check if content has #### subsections
    const h4Pattern = /^#### (.+)$/gm;
    const h4Matches = Array.from(cleanedContent.matchAll(h4Pattern));

    if (h4Matches.length > 0) {
      // Content has subsections - parse with enhanced structure
      const parts = this.parseEnhancedContent(cleanedContent, options);

      const card: Card = {
        title: sectionTitle,
        body: parts.body,
        footer: parts.footer,
        spanConfig: spanClass,
        isShortcutsCard: isShortcutsSection,
        shortcuts: isShortcutsSection
          ? this.parseShortcutsFromContent(parts.footer || parts.body)
          : undefined,
      };
      cards.push(card);
    } else {
      // No subsections - use original parsing
      const parts = this.splitContentIntoParts(cleanedContent, options);

      if (parts.code || parts.footer) {
        const card: Card = {
          title: sectionTitle,
          body: parts.code,
          footer: parts.footer,
          spanConfig: spanClass,
          isShortcutsCard: isShortcutsSection,
          shortcuts: isShortcutsSection
            ? this.parseShortcutsFromContent(parts.footer || parts.code)
            : undefined,
        };
        cards.push(card);
      }
    }

    return cards;
  }

  /**
   * Parse content with enhanced subsection structure
   */
  private parseEnhancedContent(
    content: string,
    options: Partial<ParserOptions>
  ): { body: string; footer: string } {
    const h4Pattern = /^#### (.+)$/gm;
    const h4Matches = Array.from(content.matchAll(h4Pattern));

    if (h4Matches.length === 0) {
      // No subsections, use original parsing
      const parts = this.splitContentIntoParts(content, options);
      return { body: parts.code, footer: parts.footer };
    }

    // Find content before first #### (this becomes the body)
    const firstH4Index = h4Matches[0].index!;
    const beforeH4 = content.slice(0, firstH4Index).trim();

    // Everything from first #### onwards becomes the footer
    const afterH4 = content.slice(firstH4Index).trim();

    // Parse the body part (content before first ####)
    let body = "";
    if (beforeH4) {
      const bodyParts = this.splitContentIntoParts(beforeH4, options);

      // Combine any text and code in the body section
      const bodyText = beforeH4.replace(/```[\w]*\n[\s\S]*?\n```/g, "").trim();
      const bodyCode = bodyParts.code;

      if (bodyText && bodyCode) {
        body = options.preserveCodeBlocks
          ? `${bodyText}\n\n${bodyCode}`
          : `${bodyText}\n\n\`\`\`\n${bodyCode}\n\`\`\``;
      } else if (bodyCode) {
        body = options.preserveCodeBlocks
          ? bodyCode
          : `\`\`\`\n${bodyCode}\n\`\`\``;
      } else if (bodyText) {
        body = bodyText;
      }
    }

    return {
      body: body,
      footer: afterH4,
    };
  }

  /**
   * Split content into code blocks and text parts
   */
  private splitContentIntoParts(
    content: string,
    options: Partial<ParserOptions>
  ): ParsedContent {
    const parts: ParsedContent = {
      code: "",
      footer: "",
    };

    // Clean the content first
    const cleanedContent = this.cleanMarkdownContent(content);

    // Find code blocks
    const codeBlocks = Array.from(
      cleanedContent.matchAll(this.codeBlockPattern)
    );

    if (codeBlocks.length > 0) {
      // Get the first code block as the main content
      const firstCodeBlock = codeBlocks[0];
      const language = firstCodeBlock[1] || "";
      const codeContent = firstCodeBlock[2].trim();

      // Format code block
      if (options.preserveCodeBlocks) {
        parts.code = language
          ? `\`\`\`${language}\n${codeContent}\n\`\`\``
          : `\`\`\`\n${codeContent}\n\`\`\``;
      } else {
        parts.code = codeContent;
      }

      // Get text after the code block as footer
      const afterCodeIndex = firstCodeBlock.index! + firstCodeBlock[0].length;
      const afterCode = cleanedContent.slice(afterCodeIndex).trim();

      if (afterCode) {
        // Clean up the footer text
        const footerLines = afterCode
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line && !line.startsWith("#"));

        parts.footer = footerLines.join("\n");
      }
    } else {
      // No code blocks, treat all content as footer
      const cleanContent = cleanedContent.trim();
      if (cleanContent) {
        parts.footer = cleanContent;
      }
    }

    return parts;
  }

  /**
   * Clean up markdown content to fix common parsing issues
   */
  private cleanMarkdownContent(content: string): string {
    // Remove standalone horizontal rules at the beginning of content
    let cleaned = content.replace(/^---\s*\n\n/gm, "");

    // Remove standalone horizontal rules throughout the content
    // This removes lines that are just --- or *** (horizontal rules)
    // but preserves table separator lines (which are part of table structure)
    cleaned = cleaned.replace(
      /^(\*{3,}|-{3,}|_{3,})\s*$/gm,
      (match, separator, offset, string) => {
        // Check if this horizontal rule is part of a table
        const beforeMatch = string.substring(0, offset);
        const afterMatch = string.substring(offset + match.length);

        // Look for table markers (|) in nearby lines
        const linesBefore = beforeMatch.split("\n").slice(-3);
        const linesAfter = afterMatch.split("\n").slice(0, 3);

        const hasTableMarkers = [...linesBefore, ...linesAfter].some(
          (line) => line.trim().includes("|") && !line.trim().startsWith("#")
        );

        // If surrounded by table content, keep the separator
        if (hasTableMarkers && separator.startsWith("-")) {
          return match;
        }

        // Otherwise, remove the horizontal rule
        return "";
      }
    );

    // Clean up excessive whitespace
    cleaned = cleaned.replace(/\n{3,}/g, "\n\n");

    return cleaned.trim();
  }

  /**
   * Convert parsed document to JSON string
   */
  public toJSON(document: MarkdownDocument, indent: number = 2): string {
    return JSON.stringify(document, null, indent);
  }

  /**
   * Parse multiple files in batch
   */
  public async parseFiles(
    filePaths: string[],
    options: ParserOptions = {}
  ): Promise<ParseResult[]> {
    const promises = filePaths.map((filePath) =>
      this.parseFile(filePath, options)
    );
    return Promise.all(promises);
  }

  /**
   * Parse keyboard shortcuts from markdown table content
   */
  private parseShortcutsFromContent(content: string): KeyboardShortcut[] {
    const shortcuts: KeyboardShortcut[] = [];

    if (!content) return shortcuts;

    // Remove {.shortcuts} class marker
    const cleanContent = content.replace(/\{\.shortcuts\}/g, "").trim();

    // Split content into lines and find table rows
    const lines = cleanContent.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip header line, separator line, and empty lines
      if (!line || line.startsWith("|") === false || line.includes("---"))
        continue;

      // Parse table row
      const cells = line
        .split("|")
        .map((cell) => cell.trim())
        .filter((cell) => cell);

      if (cells.length >= 2) {
        const shortcut = cells[0];
        const action = cells[1];

        // Skip header row
        if (
          shortcut.toLowerCase().includes("shortcut") &&
          action.toLowerCase().includes("action")
        )
          continue;

        shortcuts.push({
          shortcut: shortcut,
          action: action,
        });
      }
    }

    return shortcuts;
  }
}
