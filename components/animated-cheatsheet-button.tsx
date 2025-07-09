"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

const cheatsheetNames = [
  { name: "Python", id: "python" },
  { name: "Bash", id: "bash" },
  { name: "ChatGPT", id: "chatgpt" },
  { name: "Cron", id: "cron" },
  { name: "Docker", id: "docker" },
  { name: "Firefox", id: "firefox" },
];

export function AnimatedCheatsheetButton() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % cheatsheetNames.length);
    }, 2000); // Change every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="lg"
        asChild
        className="text-lg px-8 py-3 relative overflow-hidden border-2 border-purple-300 hover:border-purple-400 dark:border-purple-600 dark:hover:border-purple-500 group"
      >
        <Link href={`/cheatsheets/${cheatsheetNames[currentIndex].id}`}>
          <BookOpen className="mr-2 h-5 w-5 text-purple-600 dark:text-purple-400" />
          <span className="relative">
            <span className="text-gray-600 dark:text-gray-300">Quick </span>
            <span className="inline-block min-w-[80px] text-left">
              <span
                key={currentIndex}
                className="inline-block animate-in slide-in-from-bottom-2 duration-300 text-purple-600 dark:text-purple-400 font-semibold"
              >
                {cheatsheetNames[currentIndex].name}
              </span>
            </span>
            <span className="text-gray-600 dark:text-gray-300"> Guide</span>
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Link>
      </Button>
    </div>
  );
}
