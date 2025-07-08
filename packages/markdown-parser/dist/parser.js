import * as fs from "fs";
import * as yaml from "js-yaml";
/**
 * Markdown Parser for Husky CMS
 * Parses markdown files and converts them to structured JSON format
 */
export class MarkdownParser {
    constructor() {
        this.yamlPattern = /^---\n(.*?)\n---\n/ms;
        this.h2Pattern = /^## (.+)$/gm;
        this.h3Pattern = /^### (.+?)(\s*\{[^}]+\})?\s*$/gm;
        this.codeBlockPattern = /```(\w+)?\n(.*?)\n```/gs;
    }
    /**
     * Parse a markdown file and return structured data
     */
    async parseFile(filePath, options = {}) {
        try {
            const content = await fs.promises.readFile(filePath, "utf-8");
            const document = this.parseContent(content, options);
            return {
                success: true,
                document,
                filePath,
            };
        }
        catch (error) {
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
    parseContent(content, options = {}) {
        const { includeMetadata = true, preserveCodeBlocks = true, extractSpanConfig = true, } = options;
        // Extract YAML front matter
        const metadata = includeMetadata ? this.extractMetadata(content) : {};
        // Remove YAML front matter from content
        const contentWithoutYaml = this.yamlPattern.test(content)
            ? content.replace(this.yamlPattern, "")
            : content;
        // Parse sections
        const sections = this.parseSections(contentWithoutYaml, {
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
    extractMetadata(content) {
        const match = this.yamlPattern.exec(content);
        if (match) {
            const yamlContent = match[1];
            try {
                return yaml.load(yamlContent) || {};
            }
            catch (error) {
                console.warn("Error parsing YAML:", error);
                return {};
            }
        }
        return {};
    }
    /**
     * Parse H2 and H3 sections from content
     */
    parseSections(content, options) {
        const sections = [];
        // Split content by H2 headings
        const h2Matches = Array.from(content.matchAll(this.h2Pattern));
        for (let i = 0; i < h2Matches.length; i++) {
            const currentMatch = h2Matches[i];
            const nextMatch = h2Matches[i + 1];
            const h2Title = currentMatch[1].trim();
            const h2StartIndex = currentMatch.index + currentMatch[0].length;
            const h2EndIndex = nextMatch ? nextMatch.index : content.length;
            const h2Content = content.slice(h2StartIndex, h2EndIndex);
            const section = {
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
    parseH3Sections(content, options) {
        const subsections = [];
        // Split content by H3 headings
        const h3Matches = Array.from(content.matchAll(this.h3Pattern));
        for (let i = 0; i < h3Matches.length; i++) {
            const currentMatch = h3Matches[i];
            const nextMatch = h3Matches[i + 1];
            const h3Title = currentMatch[1].trim();
            const spanConfig = currentMatch[2] ? currentMatch[2].trim() : "";
            const h3StartIndex = currentMatch.index + currentMatch[0].length;
            const h3EndIndex = nextMatch ? nextMatch.index : content.length;
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
            const subsection = {
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
     * Parse cards from section content
     */
    parseCards(content, sectionTitle, spanClass, options) {
        const cards = [];
        // Split content into potential cards
        const parts = this.splitContentIntoParts(content, options);
        if (parts.code || parts.footer) {
            const card = {
                title: sectionTitle,
                body: parts.code,
                footer: parts.footer,
                spanConfig: spanClass,
            };
            cards.push(card);
        }
        return cards;
    }
    /**
     * Split content into code blocks and text parts
     */
    splitContentIntoParts(content, options) {
        const parts = {
            code: "",
            footer: "",
        };
        // Find code blocks
        const codeBlocks = Array.from(content.matchAll(this.codeBlockPattern));
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
            }
            else {
                parts.code = codeContent;
            }
            // Get text after the code block as footer
            const afterCodeIndex = firstCodeBlock.index + firstCodeBlock[0].length;
            const afterCode = content.slice(afterCodeIndex).trim();
            if (afterCode) {
                // Clean up the footer text
                const footerLines = afterCode
                    .split("\n")
                    .map((line) => line.trim())
                    .filter((line) => line && !line.startsWith("#"));
                parts.footer = footerLines.join("\n");
            }
        }
        else {
            // No code blocks, treat all content as footer
            const cleanContent = content.trim();
            if (cleanContent) {
                parts.footer = cleanContent;
            }
        }
        return parts;
    }
    /**
     * Convert parsed document to JSON string
     */
    toJSON(document, indent = 2) {
        return JSON.stringify(document, null, indent);
    }
    /**
     * Parse multiple files in batch
     */
    async parseFiles(filePaths, options = {}) {
        const promises = filePaths.map((filePath) => this.parseFile(filePath, options));
        return Promise.all(promises);
    }
}
//# sourceMappingURL=parser.js.map