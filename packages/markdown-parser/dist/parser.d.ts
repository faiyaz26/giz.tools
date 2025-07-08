import { MarkdownDocument, ParserOptions, ParseResult } from "./types.js";
/**
 * Markdown Parser for Husky CMS
 * Parses markdown files and converts them to structured JSON format
 */
export declare class MarkdownParser {
    private yamlPattern;
    private h2Pattern;
    private h3Pattern;
    private codeBlockPattern;
    constructor();
    /**
     * Parse a markdown file and return structured data
     */
    parseFile(filePath: string, options?: ParserOptions): Promise<ParseResult>;
    /**
     * Parse markdown content and return structured data
     */
    parseContent(content: string, options?: ParserOptions): MarkdownDocument;
    /**
     * Extract and parse YAML front matter
     */
    private extractMetadata;
    /**
     * Parse H2 and H3 sections from content
     */
    private parseSections;
    /**
     * Parse H3 sections and their cards
     */
    private parseH3Sections;
    /**
     * Parse cards from section content
     */
    private parseCards;
    /**
     * Split content into code blocks and text parts
     */
    private splitContentIntoParts;
    /**
     * Convert parsed document to JSON string
     */
    toJSON(document: MarkdownDocument, indent?: number): string;
    /**
     * Parse multiple files in batch
     */
    parseFiles(filePaths: string[], options?: ParserOptions): Promise<ParseResult[]>;
}
//# sourceMappingURL=parser.d.ts.map