import Link from "next/link";
import { ArrowRight, Code, BookOpen } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAllCheatsheets } from "@/lib/cheatsheet-data";
import { cn } from "@/lib/utils";

// Load cheatsheets from unified data
const availableCheatsheets = getAllCheatsheets();

// Create dynamic cheatsheet list based on unified data
const cheatsheets = availableCheatsheets.map((cheatsheet) => {
  // Determine icon and color based on cheatsheet type
  const getIcon = (id: string, categories: string[]) => {
    if (categories.includes("Keyboard Shortcuts")) return Code;
    if (categories.includes("Programming")) return Code;
    return BookOpen;
  };

  const getColor = (id: string) => {
    switch (id) {
      case "python":
        return "from-blue-500 to-indigo-600";
      case "finder":
        return "from-blue-500 to-cyan-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const getBadge = (id: string) => {
    switch (id) {
      case "python":
        return "Popular";
      case "finder":
        return "New";
      default:
        return "Available";
    }
  };

  // Extract key topics from sections
  const getItems = (sections: any[]) => {
    return sections.slice(0, 5).map((section) => section.title);
  };

  return {
    title: cheatsheet.metadata.title,
    description:
      cheatsheet.metadata.intro ||
      `Quick reference for ${cheatsheet.metadata.title}`,
    href: `/cheatsheets/${cheatsheet.id}`,
    icon: getIcon(cheatsheet.id, cheatsheet.metadata.categories),
    color: getColor(cheatsheet.id),
    badge: getBadge(cheatsheet.id),
    items: getItems(cheatsheet.sections),
  };
});

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
  },
  {
    title: "React",
    description: "Quick reference for React hooks, components and patterns",
    href: "#",
    icon: Code,
    color: "from-emerald-500 to-green-600",
    badge: "Coming Soon",
    items: ["Components", "Hooks", "State", "Props", "Lifecycle"],
  },
  {
    title: "Git",
    description: "Common Git commands and workflows for version control",
    href: "#",
    icon: Code,
    color: "from-orange-500 to-red-600",
    badge: "Coming Soon",
    items: ["Basic Commands", "Branching", "Merging", "Remote", "Advanced"],
  },
];

// Combine dynamic and placeholder cheatsheets
const allCheatsheets = [...cheatsheets, ...placeholderCheatsheets];

export default function CheatsheetIndexPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-500 dark:to-purple-600 mb-6">
            Programming Cheatsheets
          </h1>
          <p className="text-xl text-gray-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
            Quick reference guides for programming languages, tools, and
            technologies. Find syntax, examples, and essential concepts all in
            one place.
          </p>
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

        {/* Cheatsheets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allCheatsheets.map((sheet, index) => {
            const IconComponent = sheet.icon;
            const isAvailable = sheet.href !== "#";

            return (
              <Card
                key={index}
                className={cn(
                  "group relative overflow-hidden border-gray-200 bg-white hover:shadow-xl transition-all duration-300 hover:scale-105 dark:border-slate-800/50 dark:bg-slate-900/50 dark:backdrop-blur-sm",
                  isAvailable
                    ? "hover:border-blue-300 hover:shadow-blue-100/50 dark:hover:border-blue-500/50 dark:hover:shadow-lg dark:hover:shadow-blue-500/10"
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
                <CardContent className="relative">
                  <div className="space-y-3 mb-6">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300">
                      Key Topics:
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {sheet.items.slice(0, 5).map((item, itemIndex) => (
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
                    <Link href={sheet.href}>
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 group">
                        Explore Cheatsheet
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  ) : (
                    <Button disabled className="w-full">
                      Coming Soon
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
