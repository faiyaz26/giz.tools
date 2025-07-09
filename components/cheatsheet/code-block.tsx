"use client";

import React, { useState } from "react";
import { useTheme } from "next-themes";
import { Copy, Play, Check } from "lucide-react";
import { ClientOnlySyntaxHighlighter } from "@/components/client-only-syntax-highlighter";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CodeBlockProps {
  code: string;
  language: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language }) => {
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

  // Map common language names to syntax highlighter supported languages
  const getLanguage = (lang: string) => {
    const langMap: { [key: string]: string } = {
      python: "python",
      py: "python",
      javascript: "javascript",
      js: "javascript",
      typescript: "typescript",
      ts: "typescript",
      bash: "bash",
      shell: "bash",
      sh: "bash",
      zsh: "bash",
      json: "json",
      yaml: "yaml",
      yml: "yaml",
      html: "html",
      css: "css",
      sql: "sql",
      markdown: "markdown",
      md: "markdown",
      xml: "xml",
      dockerfile: "dockerfile",
      plaintext: "text",
      text: "text",
    };
    return langMap[lang.toLowerCase()] || "text";
  };

  const mappedLanguage = getLanguage(language);

  return (
    <div className="relative group rounded-lg overflow-hidden border border-border bg-muted/30">
      {/* Copy button positioned in top right */}
      <Button
        size="sm"
        variant="ghost"
        onClick={copyCode}
        className="absolute top-2 right-2 z-10 h-8 px-3 text-xs opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-background"
      >
        {copied ? (
          <>
            <Check className="w-3 h-3 mr-1" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="w-3 h-3 mr-1" />
            Copy
          </>
        )}
      </Button>
      <div className="overflow-x-auto">
        <ClientOnlySyntaxHighlighter
          language={mappedLanguage}
          customStyle={{
            fontSize: "13px",
            lineHeight: "1.4",
            padding: "8px",
            margin: 0,
          }}
        >
          {code}
        </ClientOnlySyntaxHighlighter>
      </div>
    </div>
  );
};
