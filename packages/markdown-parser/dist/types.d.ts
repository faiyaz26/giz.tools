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
    spanConfig: string;
    shortcuts?: KeyboardShortcut[];
    isShortcutsCard?: boolean;
}
export interface Section {
    title: string;
    level: number;
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
//# sourceMappingURL=types.d.ts.map