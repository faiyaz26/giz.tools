"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ClientOnlySyntaxHighlighter } from "./client-only-syntax-highlighter";
import { toast } from "sonner";

// Type definitions
export interface CheatsheetCard {
  title: string;
  body: string;
  footer: string;
  spanConfig: string;
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
  tags?: (string | null)[];
  categories?: string[];
  intro?: string;
  plugins?: string[];
}

export interface CheatsheetData {
  metadata: CheatsheetMetadata;
  sections: CheatsheetSection[];
}

// Keyboard Shortcut Component
const KeyboardShortcut = ({ shortcut }: { shortcut: string }) => {
  const parseShortcut = (text: string) => {
    const keyPattern = /`([^`]+)`/g;
    const keys = [];
    let match;

    while ((match = keyPattern.exec(text)) !== null) {
      keys.push(match[1]);
    }

    return keys.length > 0 ? keys : [text.replace(/`/g, "")];
  };

  const keys = parseShortcut(shortcut);

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {keys.map((key, index) => (
        <React.Fragment key={index}>
          <kbd className="inline-flex items-center justify-center px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded shadow-sm dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 min-w-[1.5rem] h-6">
            {key}
          </kbd>
          {index < keys.length - 1 && (
            <span className="text-gray-400 dark:text-gray-500 text-xs font-medium">
              +
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// Code Block Component
const CodeBlock = ({ code, language }: { code: string; language: string }) => {
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Code copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy code");
    }
  };

  const getLanguage = (lang: string) => {
    const langMap: { [key: string]: string } = {
      py: "python",
      js: "javascript",
      ts: "typescript",
      sh: "bash",
      shell: "bash",
    };
    return langMap[lang] || lang;
  };

  return (
    <div className="relative group">
      <button
        onClick={copyCode}
        className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 hover:bg-gray-700 text-white p-1.5 rounded text-xs"
      >
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      </button>
      <ClientOnlySyntaxHighlighter
        language={getLanguage(language)}
        customStyle={{
          margin: 0,
          borderRadius: "8px",
          fontSize: "14px",
          background: theme === "dark" ? "#0f172a" : "#ffffff", // Consistent dark:slate-900 / white
          border: theme === "dark" ? "1px solid #334155" : "1px solid #e2e8f0",
        }}
        showLineNumbers={code.split("\n").length > 3}
      >
        {code}
      </ClientOnlySyntaxHighlighter>
    </div>
  );
};

// Shortcut Table Component
const ShortcutTable = ({ content }: { content: string }) => {
  const parseTable = (tableContent: string) => {
    const lines = tableContent.split("\n").filter((line) => line.trim());
    const rows = lines.slice(2); // Skip header and separator

    return rows
      .map((row) => {
        const cells = row
          .split("|")
          .map((cell) => cell.trim())
          .filter((cell) => cell);
        if (cells.length >= 2) {
          return {
            shortcut: cells[0],
            action: cells[1],
          };
        }
        return null;
      })
      .filter(Boolean);
  };

  const shortcuts = parseTable(content);

  return (
    <div className="space-y-2">
      {shortcuts.map(
        (shortcut, index) =>
          shortcut && (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-all duration-200"
            >
              <div className="flex-shrink-0">
                <KeyboardShortcut shortcut={shortcut.shortcut} />
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300 ml-4 flex-1 text-right">
                {shortcut.action}
              </span>
            </div>
          )
      )}
    </div>
  );
};

// Parse span configuration
const parseSpanConfig = (spanConfig: string) => {
  const spans = { rowSpan: 1, colSpan: 1 };

  if (spanConfig) {
    const rowMatch = spanConfig.match(/row-span-(\d+)/);
    const colMatch = spanConfig.match(/col-span-(\d+)/);

    if (rowMatch) spans.rowSpan = parseInt(rowMatch[1]);
    if (colMatch) spans.colSpan = parseInt(colMatch[1]);
  }

  return spans;
};

// Helper function to check if content contains keyboard shortcuts
const containsShortcuts = (content: string): boolean => {
  return (
    content.includes("{.shortcuts}") ||
    /\|\s*`[^`]+`\s*`[^`]+`\s*`[^`]+`\s*\|/.test(content)
  );
};

// Card Component
const CheatsheetCard = ({ card }: { card: CheatsheetCard }) => {
  const spans = parseSpanConfig(card.spanConfig);
  const isShortcutCard = containsShortcuts(card.footer);

  // Generate CSS classes for spans
  const getSpanClasses = () => {
    const classes: string[] = [];
    if (spans.rowSpan === 2) classes.push("row-span-2");
    if (spans.rowSpan === 3) classes.push("row-span-3");
    if (spans.colSpan === 2) classes.push("col-span-2");
    if (spans.colSpan === 3) classes.push("col-span-3");
    return classes.join(" ");
  };

  return (
    <div
      className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 ${getSpanClasses()}`}
    >
      {/* Card Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {card.title}
        </h3>
      </div>

      {/* Card Content */}
      <div className="p-4">
        {/* Body Content */}
        {card.body && (
          <div className="mb-4 text-gray-700 dark:text-gray-300">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || "");
                  const code = String(children).replace(/\n$/, "");

                  return match ? (
                    <CodeBlock code={code} language={match[1]} />
                  ) : (
                    <code
                      className="px-1.5 py-0.5 text-sm font-mono bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                p: ({ children }) => (
                  <p className="mb-2 leading-relaxed">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside space-y-1 mb-2">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside space-y-1 mb-2">
                    {children}
                  </ol>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-gray-900 dark:text-gray-100">
                    {children}
                  </strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-blue-600 dark:text-blue-400">
                    {children}
                  </em>
                ),
              }}
            >
              {card.body}
            </ReactMarkdown>
          </div>
        )}

        {/* Footer Content */}
        {card.footer && (
          <div className="text-sm">
            {isShortcutCard ? (
              <ShortcutTable content={card.footer} />
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || "");
                    const code = String(children).replace(/\n$/, "");

                    return match ? (
                      <CodeBlock code={code} language={match[1]} />
                    ) : (
                      <code
                        className="px-1.5 py-0.5 text-sm font-mono bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                  p: ({ children }) => (
                    <p className="mb-2 leading-relaxed text-gray-600 dark:text-gray-400">
                      {children}
                    </p>
                  ),
                }}
              >
                {card.footer}
              </ReactMarkdown>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Section Component with proper responsive grid
const Section = ({
  section,
}: {
  section: CheatsheetSection | CheatsheetSubsection;
}) => {
  return (
    <div className="mb-12">
      {/* Section Title */}
      {section.title && (
        <h2
          className={`font-bold text-gray-900 dark:text-gray-100 mb-6 ${
            section.level === 2 ? "text-2xl" : "text-xl"
          }`}
        >
          {section.title}
        </h2>
      )}

      {/* Cards Grid - Responsive: 1 column on mobile, 2 on tablet, 3 on desktop */}
      {section.cards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {section.cards.map((card, index) => (
            <CheatsheetCard
              key={`${section.title}-card-${index}`}
              card={card}
            />
          ))}
        </div>
      )}

      {/* Subsections */}
      {section.subsections.map((subsection, index) => (
        <Section
          key={`${section.title}-subsection-${index}`}
          section={subsection}
        />
      ))}
    </div>
  );
};

// Main Cheatsheet Display Component
export const CheatsheetDisplay = ({ data }: { data: CheatsheetData }) => {
  const { metadata, sections } = data;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading cheatsheet...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          {/* Categories */}
          {metadata.categories && metadata.categories.length > 0 && (
            <div className="flex items-center justify-center gap-2 mb-4">
              {metadata.categories.map((category, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                >
                  {category}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            {metadata.title}
          </h1>

          {/* Intro */}
          {metadata.intro && (
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              {metadata.intro.trim()}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="space-y-12">
          {sections.map((section, index) => (
            <Section key={`section-${index}`} section={section} />
          ))}
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Last updated: {new Date(metadata.date).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheatsheetDisplay;
