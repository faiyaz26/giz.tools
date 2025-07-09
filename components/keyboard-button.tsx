"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface KeyboardButtonProps {
  children: React.ReactNode;
  variant?: "default" | "modifier" | "special";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function KeyboardButton({
  children,
  variant = "default",
  size = "md",
  className,
}: KeyboardButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium border rounded shadow-sm transition-all duration-200";

  const variants = {
    default:
      "bg-slate-50 border-slate-300 text-slate-700 shadow-[0_1px_0_rgb(0,0,0,0.08),0_1px_1px_rgb(0,0,0,0.1)] dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200 dark:shadow-[0_1px_0_rgb(255,255,255,0.05),0_1px_1px_rgb(0,0,0,0.3)]",
    modifier:
      "bg-blue-50 border-blue-300 text-blue-700 shadow-[0_1px_0_rgb(59,130,246,0.15),0_1px_1px_rgb(0,0,0,0.1)] dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-300 dark:shadow-[0_1px_0_rgb(59,130,246,0.1),0_1px_1px_rgb(0,0,0,0.3)]",
    special:
      "bg-purple-50 border-purple-300 text-purple-700 shadow-[0_1px_0_rgb(147,51,234,0.15),0_1px_1px_rgb(0,0,0,0.1)] dark:bg-purple-900/30 dark:border-purple-600 dark:text-purple-300 dark:shadow-[0_1px_0_rgb(147,51,234,0.1),0_1px_1px_rgb(0,0,0,0.3)]",
  };

  const sizes = {
    sm: "px-1.5 py-0.5 text-xs min-w-[20px] h-6",
    md: "px-2 py-1 text-sm min-w-[24px] h-7",
    lg: "px-3 py-1.5 text-base min-w-[32px] h-8",
  };

  return (
    <kbd className={cn(baseStyles, variants[variant], sizes[size], className)}>
      {children}
    </kbd>
  );
}

interface KeyboardShortcutProps {
  shortcut: string;
  className?: string;
}

export function KeyboardShortcut({
  shortcut,
  className,
}: KeyboardShortcutProps) {
  // Parse shortcut string and extract individual keys
  const parseShortcut = (shortcutString: string) => {
    // Remove backticks and split by spaces, but keep track of compound keys
    const cleaned = shortcutString.replace(/`/g, "");

    // Split by spaces but handle special cases like 'Bright-Down'
    const parts = cleaned.split(/\s+/);

    return parts
      .map((part) => {
        const trimmed = part.trim();

        // Determine key type for styling
        let variant: "default" | "modifier" | "special" = "default";

        if (
          ["Cmd", "Ctrl", "Opt", "Shift", "Alt", "Meta", "Win"].includes(
            trimmed
          )
        ) {
          variant = "modifier";
        } else if (
          [
            "Up",
            "Down",
            "Left",
            "Right",
            "Del",
            "Esc",
            "Tab",
            "Enter",
            "Space",
            "Bright-Up",
            "Bright-Down",
            "Vol",
          ].includes(trimmed) ||
          trimmed.includes("-")
        ) {
          variant = "special";
        }

        return {
          key: trimmed,
          variant,
        };
      })
      .filter((item) => item.key); // Remove empty keys
  };

  const keys = parseShortcut(shortcut);

  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      {keys.map((keyData, index) => (
        <React.Fragment key={index}>
          <KeyboardButton variant={keyData.variant} size="sm">
            {keyData.key}
          </KeyboardButton>
          {index < keys.length - 1 && (
            <span className="text-slate-400 dark:text-slate-500 text-xs">
              +
            </span>
          )}
        </React.Fragment>
      ))}
    </span>
  );
}
