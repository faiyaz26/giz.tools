"use client";

import Link from "next/link";
import { ArrowRight, Code, BookOpen, Search, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { loadCheatsheetsIndex } from "@/lib/cheatsheet-data-client";
import { cn } from "@/lib/utils";
import { useState, useEffect, useMemo } from "react";

// Function to sanitize section titles by removing markdown annotations
const sanitizeSectionTitle = (title: string): string => {
  // Handle null, undefined, or empty strings
  if (!title || typeof title !== "string") {
    return "";
  }

  return title
    .replace(/\{[^}]*\}/g, "") // Remove {.class-name} style annotations
    .replace(/\[[^\]]*\]/g, "") // Remove [attribute] style annotations
    .replace(/#+ ?/g, "") // Remove markdown headers (# ## ###)
    .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold markdown (**text**)
    .replace(/\*(.*?)\*/g, "$1") // Remove italic markdown (*text*)
    .replace(/`(.*?)`/g, "$1") // Remove inline code markdown (`code`)
    .replace(/^\s*-\s*/, "") // Remove leading list markers (- )
    .replace(/^\s*\d+\.\s*/, "") // Remove numbered list markers (1. )
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .trim(); // Remove leading/trailing whitespace
};

// Add placeholders for future cheatsheets
const placeholderCheatsheets = [
  {
    title: "JavaScript",
    description: "Essential JavaScript concepts and syntax for web development",
    href: "#",
    icon: Code,
    color: "from-yellow-500 to-amber-600",
    badge: "Coming Soon",
    items: ["Syntax", "Data Types", "Functions", "DOM", "Async"],
    keywords: ["javascript", "js", "web", "frontend"],
    categories: ["Programming"],
  },
  {
    title: "React",
    description: "Quick reference for React hooks, components and patterns",
    href: "#",
    icon: Code,
    color: "from-emerald-500 to-green-600",
    badge: "Coming Soon",
    items: ["Components", "Hooks", "State", "Props", "Lifecycle"],
    keywords: ["react", "jsx", "hooks", "components"],
    categories: ["Frontend"],
  },
  {
    title: "Git",
    description: "Common Git commands and workflows for version control",
    href: "#",
    icon: Code,
    color: "from-orange-500 to-red-600",
    badge: "Coming Soon",
    items: ["Basic Commands", "Branching", "Merging", "Remote", "Advanced"],
    keywords: ["git", "version", "control", "vcs"],
    categories: ["Development"],
  },
];

export default function CheatsheetIndexPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [availableCheatsheets, setAvailableCheatsheets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Scroll to top when component mounts, unless there's a hash
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  // Load cheatsheets on component mount
  useEffect(() => {
    loadCheatsheetsIndex()
      .then((data) => {
        setAvailableCheatsheets(data.cheatsheets);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to load cheatsheets:", error);
        setLoading(false);
      });
  }, []);

  // Create dynamic cheatsheet list based on index data
  const cheatsheets = useMemo(() => {
    return availableCheatsheets.map((cheatsheet) => {
      // Determine icon and color based on cheatsheet type
      const getIcon = (iconName: string) => {
        switch (iconName) {
          case "Code":
            return Code;
          case "BookOpen":
            return BookOpen;
          default:
            return Code;
        }
      };

      return {
        title: cheatsheet.name,
        description: cheatsheet.description,
        href: `/cheatsheets/${cheatsheet.id}`,
        icon: getIcon(cheatsheet.icon),
        color: cheatsheet.gradient,
        badge: cheatsheet.badge,
        items: cheatsheet.sections
          .slice(0, 5)
          .map((section: string) => sanitizeSectionTitle(section))
          .filter((item: string) => item.length > 0), // Remove empty items after sanitization
        keywords: cheatsheet.keywords,
        categories: cheatsheet.categories,
      };
    });
  }, [availableCheatsheets]);

  // Combine dynamic and placeholder cheatsheets
  const allCheatsheets = useMemo(() => {
    return [...cheatsheets, ...placeholderCheatsheets];
  }, [cheatsheets]);

  // Filter cheatsheets based on search query and sort alphabetically
  const filteredCheatsheets = useMemo(() => {
    let results = allCheatsheets;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = allCheatsheets.filter((sheet) => {
        return (
          sheet.title.toLowerCase().includes(query) ||
          sheet.description.toLowerCase().includes(query) ||
          sheet.keywords?.some((keyword: string) =>
            keyword.toLowerCase().includes(query)
          ) ||
          sheet.categories?.some((category: string) =>
            category.toLowerCase().includes(query)
          ) ||
          sheet.items.some((item: string) => item.toLowerCase().includes(query))
        );
      });
    }

    // Sort alphabetically by title (A-Z)
    return results.sort((a, b) => a.title.localeCompare(b.title));
  }, [allCheatsheets, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <p className="mt-4 text-lg text-gray-600 dark:text-slate-300">
              Loading cheatsheets...
            </p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-500 dark:to-purple-600 mb-6">
            Productivity Cheatsheets
          </h1>
          <p className="text-xl text-gray-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
            Quick reference guides for programming languages, developer tools,
            applications, and shortcuts. Find syntax, commands, and essential
            concepts all in one place.
          </p>
          <div className="mb-6">
            <Badge
              variant="outline"
              className="text-lg px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30"
            >
              {loading
                ? "Loading..."
                : `${availableCheatsheets.length} cheatsheets available`}
            </Badge>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <Badge
              variant="secondary"
              className="text-blue-600 border-blue-200 bg-blue-50 dark:text-blue-400 dark:border-blue-400/20 dark:bg-blue-400/10"
            >
              Quick Reference
            </Badge>
            <Badge
              variant="secondary"
              className="text-green-600 border-green-200 bg-green-50 dark:text-green-400 dark:border-green-400/20 dark:bg-green-400/10"
            >
              Copy-Paste Ready
            </Badge>
            <Badge
              variant="secondary"
              className="text-purple-600 border-purple-200 bg-purple-50 dark:text-purple-400 dark:border-purple-400/20 dark:bg-purple-400/10"
            >
              Syntax Highlighting
            </Badge>
          </div>
        </div>

        {/* Source Attribution */}
        <div className="text-center mb-12">
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="border-gray-300 text-gray-600 hover:text-gray-800 hover:border-gray-400 dark:border-slate-700/50 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:border-slate-600/50"
            >
              <a
                href="https://github.com/Fechin/reference/tree/main"
                target="_blank"
                rel="noopener noreferrer"
              >
                Source Repository
              </a>
            </Button>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="border-gray-300 text-gray-600 hover:text-gray-800 hover:border-gray-400 dark:border-slate-700/50 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:border-slate-600/50"
            >
              <a
                href="https://cheatsheets.zip/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Alternative Site
              </a>
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search cheatsheets by name, description, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-12 py-4 text-lg border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-slate-800 shadow-lg"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          {searchQuery && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {filteredCheatsheets.length} result
                {filteredCheatsheets.length !== 1 ? "s" : ""} found for &quot;
                {searchQuery}&quot;
              </p>
            </div>
          )}
        </div>

        {/* Cheatsheets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCheatsheets.length === 0 && searchQuery ? (
            <div className="col-span-full text-center py-16">
              <Search className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No cheatsheets found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Try adjusting your search terms or browse all cheatsheets below.
              </p>
              <Button
                onClick={() => setSearchQuery("")}
                variant="outline"
                className="border-gray-300 text-gray-600 hover:text-gray-800 hover:border-gray-400 dark:border-slate-600 dark:text-slate-400 dark:hover:text-slate-300"
              >
                Clear search
              </Button>
            </div>
          ) : (
            filteredCheatsheets.map((sheet, index) => {
              const IconComponent = sheet.icon;
              const isAvailable = sheet.href !== "#";

              const CardWrapper = ({
                children,
              }: {
                children: React.ReactNode;
              }) => {
                if (isAvailable) {
                  return (
                    <Link href={sheet.href} className="block h-full">
                      {children}
                    </Link>
                  );
                }
                return <>{children}</>;
              };

              return (
                <CardWrapper key={index}>
                  <Card
                    className={cn(
                      "group relative overflow-hidden border-gray-200 bg-white hover:shadow-xl transition-all duration-300 hover:scale-105 dark:border-slate-800/50 dark:bg-slate-900/50 dark:backdrop-blur-sm flex flex-col h-full",
                      isAvailable
                        ? "hover:border-blue-300 hover:shadow-blue-100/50 dark:hover:border-blue-500/50 dark:hover:shadow-lg dark:hover:shadow-blue-500/10 cursor-pointer"
                        : "opacity-75"
                    )}
                  >
                    <div
                      className={cn(
                        "absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity",
                        sheet.color
                      )}
                    />
                    <CardHeader className="relative">
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className={cn(
                            "p-3 rounded-lg bg-gradient-to-br",
                            sheet.color
                          )}
                        >
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <Badge
                          variant={isAvailable ? "default" : "secondary"}
                          className={cn(
                            isAvailable
                              ? "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-600/20 dark:text-blue-400 dark:border-blue-500/30"
                              : "bg-gray-100 text-gray-600 border-gray-200 dark:bg-slate-700/50 dark:text-slate-400 dark:border-slate-600/30"
                          )}
                        >
                          {sheet.badge}
                        </Badge>
                      </div>
                      <CardTitle className="text-gray-900 group-hover:text-blue-600 transition-colors dark:text-white dark:group-hover:text-blue-400">
                        {sheet.title}
                      </CardTitle>
                      <CardDescription className="text-gray-600 line-clamp-2 dark:text-slate-400">
                        {sheet.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative flex-1 flex flex-col">
                      <div className="space-y-3 mb-6 flex-1">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300">
                          Key Topics:
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {sheet.items
                            .slice(0, 5)
                            .map((item: string, itemIndex: number) => (
                              <Badge
                                key={itemIndex}
                                variant="outline"
                                className="text-xs text-gray-600 border-gray-300 dark:text-slate-400 dark:border-slate-700/50"
                              >
                                {item}
                              </Badge>
                            ))}
                        </div>
                      </div>
                      {isAvailable ? (
                        <Button
                          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 group/button mt-auto"
                          asChild
                        >
                          <span>
                            Explore Cheatsheet
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/button:translate-x-1" />
                          </span>
                        </Button>
                      ) : (
                        <Button disabled className="w-full mt-auto">
                          Coming Soon
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </CardWrapper>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
