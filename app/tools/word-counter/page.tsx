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
  FileText,
  BarChart3,
  TrendingUp,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

interface WordFrequency {
  word: string;
  count: number;
  percentage: number;
}

interface TextStatistics {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  averageWordsPerSentence: number;
  averageCharactersPerWord: number;
  readingTime: number;
  speakingTime: number;
  readabilityScore: number;
  readabilityLevel: string;
}

function WordCounterTool() {
  const [text, setText] = useState("");
  const [statistics, setStatistics] = useState<TextStatistics>({
    characters: 0,
    charactersNoSpaces: 0,
    words: 0,
    sentences: 0,
    paragraphs: 0,
    lines: 0,
    averageWordsPerSentence: 0,
    averageCharactersPerWord: 0,
    readingTime: 0,
    speakingTime: 0,
    readabilityScore: 0,
    readabilityLevel: "Unknown",
  });
  const [wordFrequency, setWordFrequency] = useState<WordFrequency[]>([]);
  const [showTopWords, setShowTopWords] = useState(10);

  const searchParams = useSearchParams();
  const router = useRouter();

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

  useEffect(() => {
    const urlText = searchParams.get("text");
    if (urlText) {
      const decodedText = decodeFromUrl(urlText);
      if (decodedText) {
        setText(decodedText);
      }
    }
  }, [searchParams]);

  const calculateReadabilityScore = (
    words: number,
    sentences: number,
    syllables: number
  ): number => {
    if (sentences === 0 || words === 0) return 0;
    return 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
  };

  const countSyllables = (word: string): number => {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;

    const vowels = "aeiouy";
    let syllableCount = 0;
    let previousWasVowel = false;

    for (let i = 0; i < word.length; i++) {
      const isVowel = vowels.includes(word[i]);
      if (isVowel && !previousWasVowel) {
        syllableCount++;
      }
      previousWasVowel = isVowel;
    }

    if (word.endsWith("e")) {
      syllableCount--;
    }

    return Math.max(1, syllableCount);
  };

  const getReadabilityLevel = (score: number): string => {
    if (score >= 90) return "Very Easy";
    if (score >= 80) return "Easy";
    if (score >= 70) return "Fairly Easy";
    if (score >= 60) return "Standard";
    if (score >= 50) return "Fairly Difficult";
    if (score >= 30) return "Difficult";
    return "Very Difficult";
  };

  const generateExampleText = () => {
    const examples = [
      {
        title: "Technical Documentation",
        text: `API Documentation

The REST API provides programmatic access to our platform's core functionality. Authentication is required for all endpoints using Bearer tokens.

Getting Started:
1. Register for an API key
2. Include the Authorization header in requests
3. Handle rate limiting appropriately

Base URL: https://api.example.com/v1

Authentication:
All API requests must include a valid Bearer token in the Authorization header. Tokens can be generated from your dashboard.

Rate Limiting:
The API enforces rate limits to ensure fair usage. Standard accounts are limited to 1000 requests per hour. Premium accounts have higher limits.

Error Handling:
The API returns standard HTTP status codes. Error responses include detailed messages to help with debugging.`,
      },
      {
        title: "Blog Post",
        text: `The Future of Web Development

Web development has evolved dramatically over the past decade. From simple static websites to complex single-page applications, the landscape continues to change rapidly.

Modern frameworks like React, Vue, and Angular have revolutionized how we build user interfaces. These tools provide powerful abstractions that make development faster and more maintainable.

The rise of serverless architecture has also transformed backend development. Developers can now deploy functions without managing servers, reducing operational complexity significantly.

Looking ahead, we can expect several trends to shape the future:

1. WebAssembly will enable high-performance applications in browsers
2. Progressive Web Apps will blur the line between web and native apps
3. AI-powered development tools will automate routine tasks
4. Edge computing will bring processing closer to users

The key to success in this evolving landscape is continuous learning and adaptation. Developers who embrace new technologies while maintaining strong fundamentals will thrive in the years ahead.`,
      },
    ];

    const randomExample = examples[Math.floor(Math.random() * examples.length)];
    setText(randomExample.text);
    toast.success(`Example loaded: ${randomExample.title}`);
  };

  useEffect(() => {
    if (!text.trim()) {
      setStatistics({
        characters: 0,
        charactersNoSpaces: 0,
        words: 0,
        sentences: 0,
        paragraphs: 0,
        lines: 0,
        averageWordsPerSentence: 0,
        averageCharactersPerWord: 0,
        readingTime: 0,
        speakingTime: 0,
        readabilityScore: 0,
        readabilityLevel: "Unknown",
      });
      setWordFrequency([]);
      return;
    }

    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, "").length;
    const lines = text.split("\n").length;
    const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0)
      .length;

    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 0);

    const wordCount = words.length;

    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const sentenceCount = sentences.length;

    const averageWordsPerSentence =
      sentenceCount > 0 ? wordCount / sentenceCount : 0;
    const averageCharactersPerWord =
      wordCount > 0 ? charactersNoSpaces / wordCount : 0;

    const readingTime = wordCount / 200;
    const speakingTime = wordCount / 150;

    const totalSyllables = words.reduce(
      (total, word) => total + countSyllables(word),
      0
    );

    const readabilityScore = calculateReadabilityScore(
      wordCount,
      sentenceCount,
      totalSyllables
    );
    const readabilityLevel = getReadabilityLevel(readabilityScore);

    setStatistics({
      characters,
      charactersNoSpaces,
      words: wordCount,
      sentences: sentenceCount,
      paragraphs,
      lines,
      averageWordsPerSentence,
      averageCharactersPerWord,
      readingTime,
      speakingTime,
      readabilityScore,
      readabilityLevel,
    });

    const wordCounts = new Map<string, number>();
    const commonWords = new Set([
      "the",
      "a",
      "an",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
      "by",
      "is",
      "are",
      "was",
      "were",
      "be",
      "been",
      "have",
      "has",
      "had",
      "do",
      "does",
      "did",
      "will",
      "would",
      "could",
      "should",
      "may",
      "might",
      "can",
      "this",
      "that",
      "these",
      "those",
      "i",
      "you",
      "he",
      "she",
      "it",
      "we",
      "they",
      "me",
      "him",
      "her",
      "us",
      "them",
    ]);

    words.forEach((word) => {
      if (word.length > 2 && !commonWords.has(word)) {
        wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
      }
    });

    const sortedWords = Array.from(wordCounts.entries())
      .map(([word, count]) => ({
        word,
        count,
        percentage: (count / wordCount) * 100,
      }))
      .sort((a, b) => b.count - a.count);

    setWordFrequency(sortedWords);
  }, [text]);

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
    url.searchParams.set("text", encodeForUrl(text));

    navigator.clipboard
      .writeText(url.toString())
      .then(() => {
        toast.success("Shareable URL copied to clipboard!");
      })
      .catch(() => {
        toast.error("Failed to create shareable URL");
      });
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 1) {
      return `${Math.round(minutes * 60)} seconds`;
    } else if (minutes < 60) {
      return `${Math.round(minutes)} minute${
        Math.round(minutes) !== 1 ? "s" : ""
      }`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = Math.round(minutes % 60);
      return `${hours}h ${remainingMinutes}m`;
    }
  };

  const clearAll = () => {
    setText("");
    router.push("/tools/word-counter");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Word Counter & Text Analyzer
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Analyze your text with comprehensive statistics including word count,
          character count, frequency analysis, and readability metrics.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2 dark:text-white">
                  <FileText className="h-5 w-5" />
                  <span>Text Input</span>
                </CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateExampleText}
                  >
                    <Shuffle className="h-4 w-4 mr-2" />
                    Example
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearAll}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </div>
              <CardDescription className="dark:text-gray-300">
                Paste or type your text to analyze word count, character count,
                and more
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter your text here to analyze..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[400px] resize-none text-sm bg-white dark:bg-slate-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              />

              <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                <span>
                  Live count: {statistics.words} words, {statistics.characters}{" "}
                  characters
                </span>
                {text && (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(text)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button variant="outline" size="sm" onClick={shareResult}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 dark:text-white">
                <BarChart3 className="h-5 w-5" />
                <span>Quick Stats</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {statistics.words}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Words
                  </div>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {statistics.characters}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Characters
                  </div>
                </div>
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {statistics.sentences}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Sentences
                  </div>
                </div>
                <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {statistics.paragraphs}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Paragraphs
                  </div>
                </div>
              </div>

              {statistics.words > 0 && (
                <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Reading time:
                    </span>
                    <span className="font-medium">
                      {formatTime(statistics.readingTime)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Speaking time:
                    </span>
                    <span className="font-medium">
                      {formatTime(statistics.speakingTime)}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {statistics.words > 0 && wordFrequency.length > 0 && (
            <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 dark:text-white">
                  <TrendingUp className="h-5 w-5" />
                  <span>Top Words</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {wordFrequency.slice(0, showTopWords).map((item, index) => (
                    <div
                      key={item.word}
                      className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-900 rounded"
                    >
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant="outline"
                          className="text-xs w-6 h-6 flex items-center justify-center"
                        >
                          {index + 1}
                        </Badge>
                        <span className="font-mono text-sm">{item.word}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{item.count}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {item.percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {wordFrequency.length > showTopWords && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3"
                    onClick={() =>
                      setShowTopWords((prev) =>
                        Math.min(prev + 10, wordFrequency.length)
                      )
                    }
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Show More ({wordFrequency.length - showTopWords} remaining)
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default function WordCounterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      }
    >
      <WordCounterTool />
    </Suspense>
  );
}
