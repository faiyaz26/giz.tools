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

const cheatsheets = [
  {
    title: "Python",
    description: "A comprehensive guide to Python programming language basics",
    href: "/cheatsheets/python",
    icon: Code,
    color: "from-blue-500 to-indigo-600",
    badge: "Popular",
    items: ["Syntax", "Data Types", "Control Flow", "Functions", "Modules"],
  },
  {
    title: "Finder",
    description: "Keyboard shortcuts for macOS Finder application",
    href: "/cheatsheets/finder",
    icon: Code,
    color: "from-blue-500 to-cyan-600",
    badge: "New",
    items: [
      "Navigation",
      "File Operations",
      "View Options",
      "Quick Actions",
      "System",
    ],
  },
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
    color: "from-cyan-500 to-blue-600",
    badge: "Coming Soon",
    items: ["Components", "Hooks", "State", "Props", "Context"],
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

export default function CheatsheetIndexPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 mb-6">
            Programming Cheatsheets
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Quick reference guides for programming languages, frameworks, and
            tools. Find syntax, examples, and best practices all in one place.
          </p>
        </div>

        {/* Cheatsheets Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {cheatsheets.map((cheatsheet) => (
            <Card
              key={cheatsheet.title}
              className="bg-slate-800 border-slate-700 overflow-hidden transition-all duration-300 hover:shadow-xl group"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity ${cheatsheet.color}`}
              ></div>

              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-br ${cheatsheet.color}`}
                  >
                    <cheatsheet.icon className="h-6 w-6 text-white" />
                  </div>
                  <Badge
                    className={
                      cheatsheet.badge === "Coming Soon"
                        ? "bg-amber-600"
                        : cheatsheet.badge === "New"
                        ? "bg-emerald-600"
                        : "bg-green-600"
                    }
                  >
                    {cheatsheet.badge}
                  </Badge>
                </div>
                <CardTitle className="text-2xl text-slate-100">
                  {cheatsheet.title}
                </CardTitle>
                <CardDescription className="text-slate-300">
                  {cheatsheet.description}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-slate-400 mb-2">
                    Includes:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {cheatsheet.items.map((item) => (
                      <Badge
                        key={item}
                        variant="outline"
                        className="bg-slate-700/50 text-slate-300 border-slate-600"
                      >
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button
                  asChild={cheatsheet.badge !== "Coming Soon"}
                  disabled={cheatsheet.badge === "Coming Soon"}
                  className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700"
                >
                  {cheatsheet.badge !== "Coming Soon" ? (
                    <Link href={cheatsheet.href}>
                      View Cheatsheet
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  ) : (
                    <span>
                      Coming Soon
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </span>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Need more resources?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Check out our collection of articles and guides for in-depth
            learning.
          </p>
          <Button
            size="lg"
            variant="secondary"
            asChild
            className="text-lg px-8 py-3"
          >
            <Link href="/articles">
              Explore Articles
              <BookOpen className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
