"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Copy, Play, ExternalLink, Check } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { CodeBlock } from "./code-block";
import type {
  CheatsheetCard,
  CheatsheetSubsection,
} from "@/lib/cheatsheet-data";

interface ContentCardProps {
  card: CheatsheetCard;
  subsection?: CheatsheetSubsection;
  spanConfig?: {
    gridColumn?: string;
    gridRow?: string;
    className: string;
  };
}

export const ContentCard: React.FC<ContentCardProps> = ({
  card,
  subsection,
  spanConfig,
}) => {
  const [copied, setCopied] = useState<string | null>(null);

  // Skip shortcuts cards in content card
  if (card.isShortcutsCard) {
    return null;
  }

  const copyCode = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(id);
      toast.success("Code copied to clipboard!");
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      toast.error("Failed to copy code");
    }
  };

  return (
    <Card
      className={cn(
        "bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700 h-full overflow-hidden transition-all duration-200 hover:shadow-md hover:shadow-primary/20 flex flex-col",
        spanConfig?.className
      )}
      style={{
        gridColumn: spanConfig?.gridColumn,
        gridRow: spanConfig?.gridRow,
      }}
    >
      <CardHeader className="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-gray-700 pb-3">
        <CardTitle className="text-gray-900 dark:text-white text-lg">
          {card.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4 flex-1">
        {card.body && (
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                table({ children, ...props }) {
                  return <div className="space-y-2 mb-6">{children}</div>;
                },
                tbody({ children, ...props }) {
                  return <div className="space-y-2">{children}</div>;
                },
                tr({ children, ...props }) {
                  const cells = React.Children.toArray(children);
                  const [firstCell, secondCell] = cells;

                  return (
                    <div className="flex items-start gap-4 p-3 rounded-lg bg-gray-50/50 dark:bg-slate-700/50 border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 hover:bg-gray-100/50 dark:hover:bg-slate-600/50">
                      <div className="flex-shrink-0 min-w-0 max-w-[40%]">
                        <span className="text-sm font-mono text-gray-800 dark:text-gray-200 font-medium break-words">
                          {firstCell}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 text-right text-gray-600 dark:text-gray-300 text-sm leading-relaxed font-medium flex items-center justify-end">
                        {secondCell}
                      </div>
                    </div>
                  );
                },
                td({ children, ...props }) {
                  return <>{children}</>;
                },
                thead() {
                  return null; // Hide table header
                },
                th() {
                  return null; // Hide table header cells
                },
                pre({ children, ...props }) {
                  return <pre {...props}>{children}</pre>;
                },
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  const language = match ? match[1] : "";
                  const codeString = String(children).replace(/\n$/, "");

                  if (language) {
                    return <CodeBlock code={codeString} language={language} />;
                  }

                  return (
                    <code
                      className="px-1.5 py-0.5 bg-muted rounded-md text-sm font-mono text-muted-foreground border border-border"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                a({ href, children, ...props }) {
                  if (href?.startsWith("http")) {
                    return (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 underline inline-flex items-center gap-1"
                        {...props}
                      >
                        {children}
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    );
                  }
                  return (
                    <a
                      href={href}
                      className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 underline"
                      {...props}
                    >
                      {children}
                    </a>
                  );
                },
              }}
            >
              {card.body}
            </ReactMarkdown>
          </div>
        )}

        {/* Footer text */}
        {card.footer && (
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  const language = match ? match[1] : "";
                  const codeString = String(children).replace(/\n$/, "");

                  if (language) {
                    return <CodeBlock code={codeString} language={language} />;
                  }

                  return (
                    <code
                      className="px-1.5 py-0.5 bg-muted rounded-md text-sm font-mono text-muted-foreground border border-border"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                a({ href, children, ...props }) {
                  if (href?.startsWith("http")) {
                    return (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 underline inline-flex items-center gap-1"
                        {...props}
                      >
                        {children}
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    );
                  }
                  return (
                    <a
                      href={href}
                      className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 underline"
                      {...props}
                    >
                      {children}
                    </a>
                  );
                },
              }}
            >
              {card.footer}
            </ReactMarkdown>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
