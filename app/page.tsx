import Link from "next/link";
import { ArrowRight, Zap, Shield, Globe } from "lucide-react";
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="relative">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6">
            Essential
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              {" "}
              Online{" "}
            </span>
            Tools
          </h1>
          <div className="absolute -top-2 -left-2 w-32 h-32 bg-blue-400/20 dark:bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -top-2 -right-2 w-32 h-32 bg-purple-400/20 dark:bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
          A comprehensive collection of free online tools for everyone. Convert
          images, manage PDFs, encode data, and more. Fast, secure, and private
          - all processing happens in your browser.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild className="text-lg px-8 py-3">
            <Link href="/tools">
              Explore Tools
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <AnimatedToolButton />
        </div>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
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

      {/* CTA Section */}
      <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white">
        <h2 className="text-3xl font-bold mb-4">
          Ready to boost your productivity?
        </h2>
        <p className="text-xl mb-8 text-blue-100">
          Start using our free online tools now. No sign-up required.
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
            <Link href="/tools/pdf-merger">
              Try PDF Merger
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
