"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { CheatsheetMetadata } from "@/lib/cheatsheet-data";

interface CheatsheetHeaderProps {
  metadata: CheatsheetMetadata;
}

export const CheatsheetHeader: React.FC<CheatsheetHeaderProps> = ({
  metadata,
}) => {
  return (
    <div className="text-center mb-20">
      <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 mb-6">
        {metadata.title}
      </h1>
      <div className="text-xl text-muted-foreground max-w-3xl mx-auto prose prose-neutral dark:prose-invert prose-xl">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p({ children, ...props }) {
              return (
                <p className="mb-2 text-muted-foreground text-xl" {...props}>
                  {children}
                </p>
              );
            },
            a({ href, children, ...props }) {
              // External links
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
            },
          }}
        >
          {metadata.intro}
        </ReactMarkdown>
      </div>
      <div className="flex justify-center gap-2 mt-4">
        {metadata.tags.map((tag) => (
          <Badge
            key={tag}
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
          >
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
};
