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
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {language || "code"}
        </span>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={copyCode}
            className="h-7 px-2 text-xs opacity-70 hover:opacity-100 transition-opacity"
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
        </div>
      </div>
      <div className="overflow-x-auto">
        <ClientOnlySyntaxHighlighter
          language={mappedLanguage}
          showLineNumbers={code.split("\n").length > 3}
          customStyle={{
            fontSize: "13px",
            lineHeight: "1.4",
            padding: "16px",
            margin: 0,
            background: "transparent",
          }}
        >
          {code}
        </ClientOnlySyntaxHighlighter>
      </div>
    </div>
  );
};
