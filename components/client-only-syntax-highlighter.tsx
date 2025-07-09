"use client";

import React, { useState, useEffect } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  vscDarkPlus,
  vs,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "next-themes";

interface ClientOnlySyntaxHighlighterProps {
  language: string;
  children: string;
  showLineNumbers?: boolean;
  customStyle?: React.CSSProperties;
  wrapLongLines?: boolean;
}

export function ClientOnlySyntaxHighlighter({
  language,
  children,
  showLineNumbers = false,
  customStyle = {},
  wrapLongLines = false,
}: ClientOnlySyntaxHighlighterProps) {
  const { theme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Return a basic placeholder during SSR
  if (!isMounted) {
    return (
      <pre
        style={{
          ...customStyle,
          margin: 0,
          padding: "1rem",
          borderRadius: "0.375rem",
          fontSize: "0.875rem",
          lineHeight: "1.25rem",
          backgroundColor: "var(--bg-placeholder, #f1f5f9)", // Use CSS variable with fallback
          border: "1px solid var(--border-placeholder, #e2e8f0)",
          overflow: "auto",
        }}
      >
        <code>{children}</code>
      </pre>
    );
  }

  // Client-side render with proper styling
  const baseTheme = theme === "dark" ? vscDarkPlus : vs;

  // Override background colors to match the rest of the site
  const modifiedTheme = {
    ...baseTheme,
    'pre[class*="language-"]': {
      ...baseTheme['pre[class*="language-"]'],
      background: theme === "dark" ? "#0f172a" : "#ffffff", // Dark: slate-900, Light: white
      color: theme === "dark" ? "#d4d4d4" : "#393a34", // Text colors that match the site theme
    },
    'code[class*="language-"]': {
      ...baseTheme['code[class*="language-"]'],
      background: "transparent",
      color: theme === "dark" ? "#d4d4d4" : "#393a34",
    },
  };

  return (
    <SyntaxHighlighter
      language={language}
      style={modifiedTheme}
      customStyle={{
        ...customStyle,
        background: theme === "dark" ? "#0f172a" : "#ffffff",
        border: theme === "dark" ? "1px solid #334155" : "1px solid #e2e8f0",
      }}
      showLineNumbers={showLineNumbers}
      wrapLongLines={wrapLongLines}
    >
      {children}
    </SyntaxHighlighter>
  );
}
