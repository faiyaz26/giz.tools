"use client";

import React from "react";
import { Command } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyboardShortcut } from "@/components/keyboard-button";
import { cn } from "@/lib/utils";
import type { CheatsheetCard } from "@/lib/cheatsheet-data";

interface ShortcutsCardProps {
  card: CheatsheetCard;
  spanConfig?: {
    gridColumn?: string;
    gridRow?: string;
    className: string;
  };
}

export const ShortcutsCard: React.FC<ShortcutsCardProps> = ({
  card,
  spanConfig,
}) => {
  if (!card.shortcuts || !card.isShortcutsCard) {
    return null;
  }

  return (
    <Card
      className={cn(
        "bg-card border-border h-fit overflow-hidden transition-all duration-200 hover:shadow-md hover:shadow-primary/20",
        spanConfig?.className
      )}
      style={{
        gridColumn: spanConfig?.gridColumn,
        gridRow: spanConfig?.gridRow,
      }}
    >
      <CardHeader className="bg-card/50 border-b border-border pb-3">
        <CardTitle className="text-card-foreground text-lg flex items-center gap-2">
          <Command className="h-4 w-4 text-blue-500 dark:text-blue-400" />
          {card.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-2">
          {card.shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-4 p-3 rounded-lg bg-muted/50 border border-border hover:border-border/80 transition-all duration-200 hover:bg-muted/70"
            >
              <div className="flex-shrink-0 min-w-fit">
                <KeyboardShortcut shortcut={shortcut.shortcut} />
              </div>
              <div className="flex-1 text-right text-muted-foreground text-sm leading-relaxed font-medium">
                {shortcut.action}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
