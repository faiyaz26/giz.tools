"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Copy,
  Share2,
  RotateCcw,
  Download,
  Upload,
  Shuffle,
  GitCompare,
  Eye,
  EyeOff,
  ArrowLeftRight,
  FileText,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface DiffLine {
  type: "added" | "removed" | "unchanged" | "modified";
  content: string;
  lineNumber?: number;
  originalLineNumber?: number;
  modifiedLineNumber?: number;
}

interface DiffStats {
  totalLines: number;
  addedLines: number;
  removedLines: number;
  modifiedLines: number;
  unchangedLines: number;
  addedChars: number;
  removedChars: number;
  similarity: number;
}

interface SplitViewLine {
  originalLine?: {
    content: string;
    lineNumber: number;
    type: DiffLine["type"];
  };
  modifiedLine?: {
    content: string;
    lineNumber: number;
    type: DiffLine["type"];
  };
}

function TextDiffTool() {
  const [originalText, setOriginalText] = useState("");
  const [modifiedText, setModifiedText] = useState("");
  const [diffResult, setDiffResult] = useState<DiffLine[]>([]);
  const [splitViewData, setSplitViewData] = useState<SplitViewLine[]>([]);
  const [diffStats, setDiffStats] = useState<DiffStats>({
    totalLines: 0,
    addedLines: 0,
    removedLines: 0,
    modifiedLines: 0,
    unchangedLines: 0,
    addedChars: 0,
    removedChars: 0,
    similarity: 100,
  });
  const [diffMode, setDiffMode] = useState<"unified" | "split" | "inline">(
    "unified"
  );
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [contextLines, setContextLines] = useState(3);

  const searchParams = useSearchParams();
  const router = useRouter();

  // Helper function to safely encode/decode for URL sharing
  const encodeForUrl = (text: string): string => {
    try {
      return btoa(unescape(encodeURIComponent(text)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");
    } catch {
      return "";
    }
  };

  const decodeFromUrl = (encoded: string): string => {
    try {
      const padded = encoded + "=".repeat((4 - (encoded.length % 4)) % 4);
      const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
      return decodeURIComponent(escape(atob(base64)));
    } catch {
      return "";
    }
  };

  // Load from URL parameters on mount
  useEffect(() => {
    const urlOriginal = searchParams.get("original");
    const urlModified = searchParams.get("modified");
    const urlMode = searchParams.get("mode");

    if (urlOriginal) {
      const decodedOriginal = decodeFromUrl(urlOriginal);
      if (decodedOriginal) {
        setOriginalText(decodedOriginal);
      }
    }
    if (urlModified) {
      const decodedModified = decodeFromUrl(urlModified);
      if (decodedModified) {
        setModifiedText(decodedModified);
      }
    }
    if (urlMode === "unified" || urlMode === "split" || urlMode === "inline") {
      setDiffMode(urlMode);
    }
  }, [searchParams]);

  // Generate example text pairs for comparison
  const generateExampleTexts = () => {
    const examples = [
      {
        title: "Code Changes",
        original: `function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  return total;
}

const cart = [
  { name: 'Apple', price: 1.50 },
  { name: 'Banana', price: 0.75 }
];

console.log(calculateTotal(cart));`,
        modified: `function calculateTotal(items) {
  let total = 0;
  let tax = 0;
  
  for (const item of items) {
    total += item.price;
    tax += item.price * 0.08;
  }
  
  return {
    subtotal: total,
    tax: tax,
    total: total + tax
  };
}

const cart = [
  { name: 'Apple', price: 1.50 },
  { name: 'Banana', price: 0.75 },
  { name: 'Orange', price: 2.00 }
];

const result = calculateTotal(cart);
console.log(\`Subtotal: $\${result.subtotal.toFixed(2)}\`);
console.log(\`Tax: $\${result.tax.toFixed(2)}\`);
console.log(\`Total: $\${result.total.toFixed(2)}\`);`,
      },
      {
        title: "Configuration Changes",
        original: `{
  "name": "my-app",
  "version": "1.0.0",
  "description": "A sample application",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.0",
    "lodash": "^4.17.21"
  },
  "devDependencies": {
    "jest": "^28.0.0"
  }
}`,
        modified: `{
  "name": "my-app",
  "version": "1.1.0",
  "description": "A sample web application with enhanced features",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest --coverage",
    "build": "webpack --mode production"
  },
  "dependencies": {
    "express": "^4.18.2",
    "lodash": "^4.17.21",
    "cors": "^2.8.5",
    "helmet": "^6.0.1"
  },
  "devDependencies": {
    "jest": "^29.0.0",
    "nodemon": "^2.0.20",
    "webpack": "^5.75.0"
  }
}`,
      },
      {
        title: "Documentation Updates",
        original: `# Project Setup

## Installation

1. Clone the repository
2. Run npm install
3. Start the development server

## Usage

The application provides basic functionality for user management.

## API Endpoints

- GET /users - Get all users
- POST /users - Create a new user`,
        modified: `# Project Setup Guide

## Prerequisites

- Node.js 16+ required
- npm or yarn package manager

## Installation

1. Clone the repository
   \`\`\`bash
   git clone https://github.com/example/project.git
   \`\`\`
2. Install dependencies
   \`\`\`bash
   npm install
   \`\`\`
3. Set up environment variables
   \`\`\`bash
   cp .env.example .env
   \`\`\`
4. Start the development server
   \`\`\`bash
   npm run dev
   \`\`\`

## Usage

The application provides comprehensive functionality for user management, including authentication, profile management, and role-based access control.

## API Endpoints

### Users
- GET /api/users - Get all users (requires admin)
- POST /api/users - Create a new user
- GET /api/users/:id - Get user by ID
- PUT /api/users/:id - Update user
- DELETE /api/users/:id - Delete user (requires admin)

### Authentication
- POST /api/auth/login - User login
- POST /api/auth/logout - User logout
- POST /api/auth/refresh - Refresh token`,
      },
      {
        title: "Text Content Changes",
        original: `The quick brown fox jumps over the lazy dog.
This is a sample paragraph for testing.
Lorem ipsum dolor sit amet, consectetur adipiscing elit.
Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
        modified: `The quick brown fox leaps over the sleeping dog.
This is a sample paragraph for testing purposes.
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.
Ut enim ad minim veniam, quis nostrud exercitation ullamco.
Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
      },
    ];

    const randomExample = examples[Math.floor(Math.random() * examples.length)];
    setOriginalText(randomExample.original);
    setModifiedText(randomExample.modified);
    toast.success(`Example loaded: ${randomExample.title}`);
  };

  // Simple diff algorithm (Myers algorithm simplified)
  const computeDiff = (original: string, modified: string): DiffLine[] => {
    let origLines = original.split("\n");
    let modLines = modified.split("\n");

    // Apply preprocessing options
    if (ignoreWhitespace) {
      origLines = origLines.map((line) => line.trim());
      modLines = modLines.map((line) => line.trim());
    }

    if (ignoreCase) {
      origLines = origLines.map((line) => line.toLowerCase());
      modLines = modLines.map((line) => line.toLowerCase());
    }

    const result: DiffLine[] = [];
    let origIndex = 0;
    let modIndex = 0;

    while (origIndex < origLines.length || modIndex < modLines.length) {
      if (origIndex >= origLines.length) {
        // Remaining lines are additions
        result.push({
          type: "added",
          content: modLines[modIndex],
          modifiedLineNumber: modIndex + 1,
        });
        modIndex++;
      } else if (modIndex >= modLines.length) {
        // Remaining lines are deletions
        result.push({
          type: "removed",
          content: origLines[origIndex],
          originalLineNumber: origIndex + 1,
        });
        origIndex++;
      } else if (origLines[origIndex] === modLines[modIndex]) {
        // Lines are the same
        result.push({
          type: "unchanged",
          content: origLines[origIndex],
          originalLineNumber: origIndex + 1,
          modifiedLineNumber: modIndex + 1,
        });
        origIndex++;
        modIndex++;
      } else {
        // Look ahead to find matches
        let foundMatch = false;
        const lookAhead = 5;

        // Check if original line appears later in modified
        for (let i = 1; i <= lookAhead && modIndex + i < modLines.length; i++) {
          if (origLines[origIndex] === modLines[modIndex + i]) {
            // Found match, mark intermediate lines as additions
            for (let j = 0; j < i; j++) {
              result.push({
                type: "added",
                content: modLines[modIndex + j],
                modifiedLineNumber: modIndex + j + 1,
              });
            }
            modIndex += i;
            foundMatch = true;
            break;
          }
        }

        if (!foundMatch) {
          // Check if modified line appears later in original
          for (
            let i = 1;
            i <= lookAhead && origIndex + i < origLines.length;
            i++
          ) {
            if (modLines[modIndex] === origLines[origIndex + i]) {
              // Found match, mark intermediate lines as deletions
              for (let j = 0; j < i; j++) {
                result.push({
                  type: "removed",
                  content: origLines[origIndex + j],
                  originalLineNumber: origIndex + j + 1,
                });
              }
              origIndex += i;
              foundMatch = true;
              break;
            }
          }
        }

        if (!foundMatch) {
          // No match found, treat as modification
          result.push({
            type: "removed",
            content: origLines[origIndex],
            originalLineNumber: origIndex + 1,
          });
          result.push({
            type: "added",
            content: modLines[modIndex],
            modifiedLineNumber: modIndex + 1,
          });
          origIndex++;
          modIndex++;
        }
      }
    }

    return result;
  };

  // Generate split view data
  const generateSplitViewData = (diff: DiffLine[]): SplitViewLine[] => {
    const splitData: SplitViewLine[] = [];
    let i = 0;

    while (i < diff.length) {
      const currentLine = diff[i];

      if (currentLine.type === "unchanged") {
        splitData.push({
          originalLine: {
            content: currentLine.content,
            lineNumber: currentLine.originalLineNumber!,
            type: "unchanged",
          },
          modifiedLine: {
            content: currentLine.content,
            lineNumber: currentLine.modifiedLineNumber!,
            type: "unchanged",
          },
        });
        i++;
      } else if (currentLine.type === "removed") {
        // Check if next line is an addition (modification)
        if (i + 1 < diff.length && diff[i + 1].type === "added") {
          splitData.push({
            originalLine: {
              content: currentLine.content,
              lineNumber: currentLine.originalLineNumber!,
              type: "removed",
            },
            modifiedLine: {
              content: diff[i + 1].content,
              lineNumber: diff[i + 1].modifiedLineNumber!,
              type: "added",
            },
          });
          i += 2;
        } else {
          splitData.push({
            originalLine: {
              content: currentLine.content,
              lineNumber: currentLine.originalLineNumber!,
              type: "removed",
            },
          });
          i++;
        }
      } else if (currentLine.type === "added") {
        splitData.push({
          modifiedLine: {
            content: currentLine.content,
            lineNumber: currentLine.modifiedLineNumber!,
            type: "added",
          },
        });
        i++;
      } else {
        i++;
      }
    }

    return splitData;
  };

  // Calculate diff statistics
  const calculateStats = (
    diff: DiffLine[],
    original: string,
    modified: string
  ): DiffStats => {
    const addedLines = diff.filter((line) => line.type === "added").length;
    const removedLines = diff.filter((line) => line.type === "removed").length;
    const unchangedLines = diff.filter((line) => line.type === "unchanged")
      .length;
    const modifiedLines = addedLines + removedLines;

    const addedChars = diff
      .filter((line) => line.type === "added")
      .reduce((sum, line) => sum + line.content.length, 0);

    const removedChars = diff
      .filter((line) => line.type === "removed")
      .reduce((sum, line) => sum + line.content.length, 0);

    // Calculate similarity percentage
    const totalChars = Math.max(original.length, modified.length);
    const changedChars = Math.abs(addedChars - removedChars);
    const similarity =
      totalChars > 0
        ? Math.max(0, 100 - (changedChars / totalChars) * 100)
        : 100;

    return {
      totalLines: diff.length,
      addedLines,
      removedLines,
      modifiedLines,
      unchangedLines,
      addedChars,
      removedChars,
      similarity,
    };
  };

  // Compute diff when inputs change
  useEffect(() => {
    if (!originalText && !modifiedText) {
      setDiffResult([]);
      setSplitViewData([]);
      setDiffStats({
        totalLines: 0,
        addedLines: 0,
        removedLines: 0,
        modifiedLines: 0,
        unchangedLines: 0,
        addedChars: 0,
        removedChars: 0,
        similarity: 100,
      });
      return;
    }

    const diff = computeDiff(originalText, modifiedText);
    const stats = calculateStats(diff, originalText, modifiedText);
    const splitData = generateSplitViewData(diff);

    setDiffResult(diff);
    setDiffStats(stats);
    setSplitViewData(splitData);
  }, [originalText, modifiedText, ignoreWhitespace, ignoreCase]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  const shareResult = () => {
    const url = new URL(window.location.href);
    url.searchParams.set("original", encodeForUrl(originalText));
    url.searchParams.set("modified", encodeForUrl(modifiedText));
    url.searchParams.set("mode", diffMode);

    navigator.clipboard
      .writeText(url.toString())
      .then(() => {
        toast.success("Shareable URL copied to clipboard!");
      })
      .catch(() => {
        toast.error("Failed to create shareable URL");
      });
  };

  const downloadResult = () => {
    const resultData = {
      originalText,
      modifiedText,
      diffMode,
      options: {
        ignoreWhitespace,
        ignoreCase,
        showLineNumbers,
        contextLines,
      },
      statistics: diffStats,
      diff: diffResult,
      generatedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(resultData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "text-diff-result.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Diff result downloaded!");
  };

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    target: "original" | "modified"
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (target === "original") {
        setOriginalText(text);
      } else {
        setModifiedText(text);
      }
    };
    reader.readAsText(file);
  };

  const clearAll = () => {
    setOriginalText("");
    setModifiedText("");
    setDiffResult([]);
    setSplitViewData([]);
    router.push("/tools/text-diff");
  };

  const swapTexts = () => {
    const temp = originalText;
    setOriginalText(modifiedText);
    setModifiedText(temp);
    toast.success("Texts swapped!");
  };

  const getLineClass = (type: DiffLine["type"]) => {
    switch (type) {
      case "added":
        return "bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500";
      case "removed":
        return "bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500";
      case "modified":
        return "bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500";
      default:
        return "bg-gray-50 dark:bg-slate-900";
    }
  };

  const getLinePrefix = (type: DiffLine["type"]) => {
    switch (type) {
      case "added":
        return "+";
      case "removed":
        return "-";
      default:
        return " ";
    }
  };

  const renderUnifiedDiff = () => (
    <div className="font-mono text-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
      {diffResult.length === 0 ? (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          <GitCompare className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Enter text in both fields to see the diff</p>
        </div>
      ) : (
        <div className="max-h-[600px] overflow-auto">
          {diffResult.map((line, index) => (
            <div key={index} className={`flex ${getLineClass(line.type)}`}>
              {showLineNumbers && (
                <div className="flex-shrink-0 w-20 px-2 py-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 border-r border-gray-300 dark:border-gray-600">
                  <span className="inline-block w-8 text-right">
                    {line.originalLineNumber || ""}
                  </span>
                  <span className="inline-block w-8 text-right ml-1">
                    {line.modifiedLineNumber || ""}
                  </span>
                </div>
              )}
              <div className="flex-shrink-0 w-6 px-1 py-1 text-center text-xs font-mono">
                {getLinePrefix(line.type)}
              </div>
              <div className="flex-1 px-2 py-1 whitespace-pre-wrap break-all">
                {line.content}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSplitDiff = () => (
    <div className="grid grid-cols-2 gap-4">
      <div className="font-mono text-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
        <div className="bg-red-100 dark:bg-red-900/30 px-4 py-2 border-b border-gray-300 dark:border-gray-600">
          <h4 className="font-semibold text-red-700 dark:text-red-300">
            Original
          </h4>
        </div>
        <div className="max-h-[500px] overflow-auto">
          {splitViewData.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <p>Original text will appear here</p>
            </div>
          ) : (
            splitViewData.map((line, index) => (
              <div
                key={index}
                className={`flex ${
                  line.originalLine
                    ? getLineClass(line.originalLine.type)
                    : "bg-gray-100 dark:bg-slate-700"
                }`}
              >
                {showLineNumbers && (
                  <div className="flex-shrink-0 w-12 px-2 py-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 border-r border-gray-300 dark:border-gray-600">
                    {line.originalLine?.lineNumber || ""}
                  </div>
                )}
                <div className="flex-1 px-2 py-1 whitespace-pre-wrap break-all min-h-[1.5rem]">
                  {line.originalLine?.content || ""}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="font-mono text-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
        <div className="bg-green-100 dark:bg-green-900/30 px-4 py-2 border-b border-gray-300 dark:border-gray-600">
          <h4 className="font-semibold text-green-700 dark:text-green-300">
            Modified
          </h4>
        </div>
        <div className="max-h-[500px] overflow-auto">
          {splitViewData.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <p>Modified text will appear here</p>
            </div>
          ) : (
            splitViewData.map((line, index) => (
              <div
                key={index}
                className={`flex ${
                  line.modifiedLine
                    ? getLineClass(line.modifiedLine.type)
                    : "bg-gray-100 dark:bg-slate-700"
                }`}
              >
                {showLineNumbers && (
                  <div className="flex-shrink-0 w-12 px-2 py-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 border-r border-gray-300 dark:border-gray-600">
                    {line.modifiedLine?.lineNumber || ""}
                  </div>
                )}
                <div className="flex-1 px-2 py-1 whitespace-pre-wrap break-all min-h-[1.5rem]">
                  {line.modifiedLine?.content || ""}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const renderInlineDiff = () => (
    <div className="space-y-4">
      {diffResult.length === 0 ? (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          <GitCompare className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Enter text in both fields to see the diff</p>
        </div>
      ) : (
        diffResult.map((line, index) => {
          if (line.type === "unchanged") {
            return (
              <div
                key={index}
                className="font-mono text-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden"
              >
                <div className="bg-gray-100 dark:bg-slate-700 px-4 py-2 border-b border-gray-300 dark:border-gray-600">
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300">
                    Line {line.originalLineNumber} (unchanged)
                  </h4>
                </div>
                <div className="p-4">
                  <pre className="whitespace-pre-wrap break-all">
                    {line.content}
                  </pre>
                </div>
              </div>
            );
          } else if (line.type === "removed") {
            return (
              <div
                key={index}
                className="font-mono text-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden"
              >
                <div className="bg-red-100 dark:bg-red-900/30 px-4 py-2 border-b border-gray-300 dark:border-gray-600">
                  <h4 className="font-semibold text-red-700 dark:text-red-300">
                    - Line {line.originalLineNumber} (removed)
                  </h4>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-900/20">
                  <pre className="whitespace-pre-wrap break-all">
                    {line.content}
                  </pre>
                </div>
              </div>
            );
          } else if (line.type === "added") {
            return (
              <div
                key={index}
                className="font-mono text-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden"
              >
                <div className="bg-green-100 dark:bg-green-900/30 px-4 py-2 border-b border-gray-300 dark:border-gray-600">
                  <h4 className="font-semibold text-green-700 dark:text-green-300">
                    + Line {line.modifiedLineNumber} (added)
                  </h4>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20">
                  <pre className="whitespace-pre-wrap break-all">
                    {line.content}
                  </pre>
                </div>
              </div>
            );
          }
          return null;
        })
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Text Diff Checker
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Compare two text inputs and visualize differences with multiple
          viewing modes. Perfect for code reviews, document changes, and content
          comparison.
        </p>
      </div>

      {/* Input Section */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Original Text */}
        <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2 dark:text-white">
                <FileText className="h-5 w-5" />
                <span>Original Text</span>
              </CardTitle>
              <div className="flex space-x-2">
                <label
                  htmlFor="original-file-upload"
                  className="cursor-pointer"
                >
                  <Button variant="outline" size="sm" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </span>
                  </Button>
                </label>
                <input
                  id="original-file-upload"
                  type="file"
                  accept=".txt,.md,.js,.json,.html,.css,.py,.java,.cpp,.c,.php,.rb,.go,.rs,.ts,.jsx,.tsx,.vue,.svelte"
                  onChange={(e) => handleFileUpload(e, "original")}
                  className="hidden"
                />
              </div>
            </div>
            <CardDescription className="dark:text-gray-300">
              Enter the original version of your text
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Paste your original text here..."
              value={originalText}
              onChange={(e) => setOriginalText(e.target.value)}
              className="min-h-[300px] resize-none font-mono text-sm bg-white dark:bg-slate-900 border-gray-300 dark:border-gray-600"
            />
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Lines: {originalText.split("\n").length} | Characters:{" "}
              {originalText.length}
            </div>
          </CardContent>
        </Card>

        {/* Modified Text */}
        <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2 dark:text-white">
                <FileText className="h-5 w-5" />
                <span>Modified Text</span>
              </CardTitle>
              <div className="flex space-x-2">
                <label
                  htmlFor="modified-file-upload"
                  className="cursor-pointer"
                >
                  <Button variant="outline" size="sm" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </span>
                  </Button>
                </label>
                <input
                  id="modified-file-upload"
                  type="file"
                  accept=".txt,.md,.js,.json,.html,.css,.py,.java,.cpp,.c,.php,.rb,.go,.rs,.ts,.jsx,.tsx,.vue,.svelte"
                  onChange={(e) => handleFileUpload(e, "modified")}
                  className="hidden"
                />
              </div>
            </div>
            <CardDescription className="dark:text-gray-300">
              Enter the modified version of your text
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Paste your modified text here..."
              value={modifiedText}
              onChange={(e) => setModifiedText(e.target.value)}
              className="min-h-[300px] resize-none font-mono text-sm bg-white dark:bg-slate-900 border-gray-300 dark:border-gray-600"
            />
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Lines: {modifiedText.split("\n").length} | Characters:{" "}
              {modifiedText.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card className="mb-8 bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2 dark:text-white">
              <GitCompare className="h-5 w-5" />
              <span>Diff Options</span>
            </CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={generateExampleTexts}
              >
                <Shuffle className="h-4 w-4 mr-2" />
                Example
              </Button>
              <Button variant="outline" size="sm" onClick={swapTexts}>
                <ArrowLeftRight className="h-4 w-4 mr-2" />
                Swap
              </Button>
              <Button variant="outline" size="sm" onClick={clearAll}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear
              </Button>
              {(originalText || modifiedText) && (
                <>
                  <Button variant="outline" size="sm" onClick={shareResult}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadResult}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label htmlFor="diff-mode">View Mode</Label>
              <Select
                value={diffMode}
                onValueChange={(value) =>
                  setDiffMode(value as "unified" | "split" | "inline")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unified">Unified</SelectItem>
                  <SelectItem value="split">Split</SelectItem>
                  <SelectItem value="inline">Inline</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Options</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ignore-whitespace"
                    checked={ignoreWhitespace}
                    onCheckedChange={(checked) =>
                      setIgnoreWhitespace(Boolean(checked))
                    }
                  />
                  <label
                    htmlFor="ignore-whitespace"
                    className="text-sm cursor-pointer"
                  >
                    Ignore whitespace
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ignore-case"
                    checked={ignoreCase}
                    onCheckedChange={(checked) =>
                      setIgnoreCase(Boolean(checked))
                    }
                  />
                  <label
                    htmlFor="ignore-case"
                    className="text-sm cursor-pointer"
                  >
                    Ignore case
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Display</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="show-line-numbers"
                    checked={showLineNumbers}
                    onCheckedChange={(checked) =>
                      setShowLineNumbers(Boolean(checked))
                    }
                  />
                  <label
                    htmlFor="show-line-numbers"
                    className="text-sm cursor-pointer"
                  >
                    Show line numbers
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="context-lines">Context Lines</Label>
              <Select
                value={contextLines.toString()}
                onValueChange={(value) => setContextLines(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0</SelectItem>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      {(originalText || modifiedText) && (
        <Card className="mb-8 bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 dark:text-white">
              <BarChart3 className="h-5 w-5" />
              <span>Diff Statistics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              <div className="text-center p-3 bg-gray-50 dark:bg-slate-900 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {diffStats.similarity.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Similarity
                </div>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {diffStats.addedLines}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Added
                </div>
              </div>
              <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {diffStats.removedLines}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Removed
                </div>
              </div>
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {diffStats.unchangedLines}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Unchanged
                </div>
              </div>
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {diffStats.totalLines}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Total Lines
                </div>
              </div>
              <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  +{diffStats.addedChars}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Chars Added
                </div>
              </div>
              <div className="text-center p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                  -{diffStats.removedChars}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Chars Removed
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Diff Result */}
      <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="dark:text-white">Diff Result</CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {diffMode.charAt(0).toUpperCase() + diffMode.slice(1)} View
              </Badge>
              {diffResult.length > 0 && (
                <Badge variant="outline">
                  {diffStats.addedLines + diffStats.removedLines} changes
                </Badge>
              )}
            </div>
          </div>
          <CardDescription className="dark:text-gray-300">
            Visual comparison of the two text inputs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {diffMode === "unified" && renderUnifiedDiff()}
          {diffMode === "split" && renderSplitDiff()}
          {diffMode === "inline" && renderInlineDiff()}
        </CardContent>
      </Card>

      {/* Info Section */}
      <Card className="mt-8 bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">
            About Text Diff Checker
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <p className="text-gray-600 dark:text-gray-300">
            Text diff checking is essential for comparing documents, code files,
            and any text content. This tool provides multiple viewing modes and
            options to help you identify changes quickly and accurately.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mt-6">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                View Modes:
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>
                  • <strong>Unified:</strong> Traditional diff format with +/-
                  indicators
                </li>
                <li>
                  • <strong>Split:</strong> Side-by-side comparison view
                </li>
                <li>
                  • <strong>Inline:</strong> Stacked view showing before and
                  after
                </li>
                <li>• Color-coded changes for easy identification</li>
                <li>• Line numbers for precise reference</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Options:
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>
                  • <strong>Ignore Whitespace:</strong> Focus on content changes
                </li>
                <li>
                  • <strong>Ignore Case:</strong> Case-insensitive comparison
                </li>
                <li>
                  • <strong>Context Lines:</strong> Show surrounding unchanged
                  lines
                </li>
                <li>• File upload support for various formats</li>
                <li>• Shareable URLs for collaboration</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Use Cases:
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Code review and version comparison</li>
                <li>• Document revision tracking</li>
                <li>• Configuration file changes</li>
                <li>• Content editing and proofreading</li>
                <li>• API response comparison</li>
                <li>• Legal document analysis</li>
              </ul>
            </div>
          </div>
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
              Legend:
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-200 dark:bg-green-800 border-l-4 border-green-500 rounded-sm"></div>
                <span className="text-blue-800 dark:text-blue-300">
                  Added lines
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-200 dark:bg-red-800 border-l-4 border-red-500 rounded-sm"></div>
                <span className="text-blue-800 dark:text-blue-300">
                  Removed lines
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded-sm"></div>
                <span className="text-blue-800 dark:text-blue-300">
                  Unchanged lines
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-200 dark:bg-yellow-800 border-l-4 border-yellow-500 rounded-sm"></div>
                <span className="text-blue-800 dark:text-blue-300">
                  Modified lines
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function TextDiffPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      }
    >
      <TextDiffTool />
    </Suspense>
  );
}
