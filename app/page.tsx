import Link from "next/link";
import { ArrowRight, Zap, Shield, Globe, BookOpen } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { tools } from "@/lib/tools-data";
import { AnimatedToolButton } from "@/components/animated-tool-button";
import { AnimatedCheatsheetButton } from "@/components/animated-cheatsheet-button";
import {
  generateSiteSearchStructuredData,
  generateOrganizationStructuredData,
} from "@/lib/metadata";

const features = [
  {
    name: "Lightning Fast",
    description:
      "All processing happens client-side for instant results and maximum privacy.",
    icon: Zap,
  },
  {
    name: "Secure & Private",
    description:
      "Your data never leaves your browser. No servers, no logging, no tracking.",
    icon: Shield,
  },
  {
    name: "Quick Reference",
    description:
      "Access 190+ cheatsheets for programming languages, tools, and frameworks with syntax highlighting.",
    icon: BookOpen,
  },
  {
    name: "Share Results",
    description:
      "Generate shareable URLs with encoded results for easy collaboration.",
    icon: Globe,
  },
];

export default function Home() {
  // Filter for popular tools, prioritizing image and PDF tools
  const popularTools = [
    tools.find((t) => t.href === "/tools/image-converter"),
    tools.find((t) => t.href === "/tools/pdf-merger"),
    tools.find((t) => t.href === "/tools/pdf-splitter"),
    tools.find((t) => t.href === "/tools/base64"),
    tools.find((t) => t.href === "/tools/text-diff"),
    tools.find((t) => t.href === "/tools/timezone"),
  ].filter((tool): tool is NonNullable<typeof tool> => Boolean(tool));

  // Popular cheatsheets
  const popularCheatsheets = [
    {
      name: "Python",
      description:
        "Essential Python syntax, functions, and libraries for development",
      href: "/cheatsheets/python",
      icon: BookOpen,
      gradient: "from-blue-500 to-green-600",
      topics: [
        "Syntax",
        "Functions",
        "Libraries",
        "Data Types",
        "Control Flow",
      ],
    },
    {
      name: "Docker",
      description: "Container management commands and Docker Compose reference",
      href: "/cheatsheets/docker",
      icon: BookOpen,
      gradient: "from-blue-600 to-cyan-600",
      topics: ["Commands", "Dockerfile", "Compose", "Networks", "Volumes"],
    },
    {
      name: "Git",
      description: "Version control commands and workflows for developers",
      href: "/cheatsheets/git",
      icon: BookOpen,
      gradient: "from-orange-500 to-red-600",
      topics: ["Basic Commands", "Branching", "Merging", "Remote", "Workflows"],
    },
    {
      name: "Bash",
      description: "Shell scripting commands and terminal shortcuts",
      href: "/cheatsheets/bash",
      icon: BookOpen,
      gradient: "from-gray-600 to-gray-800",
      topics: ["Commands", "Scripting", "Variables", "Loops", "Functions"],
    },
    {
      name: "JavaScript",
      description: "Modern JavaScript syntax, methods, and ES6+ features",
      href: "/cheatsheets/javascript",
      icon: BookOpen,
      gradient: "from-yellow-500 to-orange-600",
      topics: ["Syntax", "ES6+", "DOM", "Async", "Functions"],
    },
    {
      name: "CSS3",
      description: "CSS3 properties, selectors, and modern layout techniques",
      href: "/cheatsheets/css3",
      icon: BookOpen,
      gradient: "from-pink-500 to-purple-600",
      topics: ["Selectors", "Flexbox", "Grid", "Animations", "Properties"],
    },
  ];

  const siteSearchData = generateSiteSearchStructuredData();
  const organizationData = generateOrganizationStructuredData();

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSearchData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="relative">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6">
              Essential
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                {" "}
                Online Tools{" "}
              </span>
              & Cheatsheets
            </h1>
            <div className="absolute -top-2 -left-2 w-32 h-32 bg-blue-400/20 dark:bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -top-2 -right-2 w-32 h-32 bg-purple-400/20 dark:bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            A comprehensive collection of free online tools and quick reference
            guides for developers and power users. Convert images, manage PDFs,
            encode data, and access instant cheatsheets for programming
            languages and tools. Fast, secure, and private - all processing
            happens in your browser.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button size="lg" asChild className="text-lg px-8 py-3">
              <Link href="/tools">
                Explore Tools
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="text-lg px-8 py-3 border-2 border-blue-300 hover:border-blue-400 dark:border-blue-600 dark:hover:border-blue-500"
            >
              <Link href="/cheatsheets">
                Explore Cheatsheets
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <AnimatedToolButton />
            <AnimatedCheatsheetButton />
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.name} className="text-center p-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Featured Tools Preview */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Popular Tools
            </h2>
            <Button variant="outline" asChild>
              <Link href="/tools">
                View All Tools
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularTools.map((tool) => {
              const Icon = tool.icon;
              const isAvailable = tool.status === "Available";

              return (
                <Card
                  key={tool.name}
                  className={cn(
                    "relative overflow-hidden transition-all duration-300 hover:shadow-xl group border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800",
                    isAvailable
                      ? "hover:scale-[1.02] cursor-pointer"
                      : "opacity-75"
                  )}
                >
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity",
                      tool.gradient
                    )}
                  ></div>

                  <CardHeader className="relative">
                    <div className="flex items-center justify-between">
                      <div
                        className={cn(
                          "p-3 rounded-xl bg-gradient-to-br",
                          tool.gradient
                        )}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <span
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-medium",
                          isAvailable
                            ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300"
                            : "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300"
                        )}
                      >
                        {tool.status}
                      </span>
                    </div>
                    <CardTitle className="text-xl dark:text-white">
                      {tool.name}
                    </CardTitle>
                    <CardDescription className="text-base dark:text-gray-300">
                      {tool.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="relative">
                    {isAvailable ? (
                      <Button asChild className="w-full">
                        <Link href={tool.href}>
                          Use Tool
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
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

        {/* Popular Cheatsheets Preview */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Popular Cheatsheets
            </h2>
            <Button variant="outline" asChild>
              <Link href="/cheatsheets">
                View All Cheatsheets
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularCheatsheets.map((cheatsheet) => {
              const Icon = cheatsheet.icon;

              return (
                <Card
                  key={cheatsheet.name}
                  className="relative overflow-hidden transition-all duration-300 hover:shadow-xl group border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 hover:scale-[1.02] cursor-pointer"
                >
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity",
                      cheatsheet.gradient
                    )}
                  ></div>

                  <CardHeader className="relative">
                    <div className="flex items-center justify-between">
                      <div
                        className={cn(
                          "p-3 rounded-xl bg-gradient-to-br",
                          cheatsheet.gradient
                        )}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                        Cheatsheet
                      </span>
                    </div>
                    <CardTitle className="text-xl dark:text-white">
                      {cheatsheet.name}
                    </CardTitle>
                    <CardDescription className="text-base dark:text-gray-300">
                      {cheatsheet.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="relative">
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Quick Topics:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {cheatsheet.topics.slice(0, 3).map((topic, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Button asChild className="w-full">
                      <Link href={cheatsheet.href}>
                        View Cheatsheet
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to boost your productivity?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Start using our free online tools and reference guides now. No
            sign-up required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              asChild
              className="text-lg px-8 py-3"
            >
              <Link href="/tools/image-converter">
                Try Image Converter
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="secondary"
              asChild
              className="text-lg px-8 py-3"
            >
              <Link href="/cheatsheets/python">
                Python Cheatsheet
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
