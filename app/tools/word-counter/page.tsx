'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Copy, Share2, RotateCcw, Download, Upload, Shuffle, FileText, BarChart3, TrendingUp, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';

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
  readingTime: number; // in minutes
  speakingTime: number; // in minutes
  readabilityScore: number;
  readabilityLevel: string;
}

function WordCounterTool() {
  const [text, setText] = useState('');
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
    readabilityLevel: 'Unknown'
  });
  const [wordFrequency, setWordFrequency] = useState<WordFrequency[]>([]);
  const [showTopWords, setShowTopWords] = useState(10);
  
  const searchParams = useSearchParams();
  const router = useRouter();

  // Helper function to safely encode/decode for URL
  const encodeForUrl = (text: string): string => {
    try {
      return btoa(unescape(encodeURIComponent(text)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    } catch {
      return '';
    }
  };

  const decodeFromUrl = (encoded: string): string => {
    try {
      const padded = encoded + '='.repeat((4 - encoded.length % 4) % 4);
      const base64 = padded.replace(/-/g, '+').replace(/_/g, '/');
      return decodeURIComponent(escape(atob(base64)));
    } catch {
      return '';
    }
  };

  // Load from URL parameters on mount
  useEffect(() => {
    const urlText = searchParams.get('text');
    if (urlText) {
      const decodedText = decodeFromUrl(urlText);
      if (decodedText) {
        setText(decodedText);
      }
    }
  }, [searchParams]);

  // Calculate Flesch Reading Ease Score
  const calculateReadabilityScore = (words: number, sentences: number, syllables: number): number => {
    if (sentences === 0 || words === 0) return 0;
    return 206.835 - (1.015 * (words / sentences)) - (84.6 * (syllables / words));
  };

  // Count syllables in a word (simplified)
  const countSyllables = (word: string): number => {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    
    const vowels = 'aeiouy';
    let syllableCount = 0;
    let previousWasVowel = false;
    
    for (let i = 0; i < word.length; i++) {
      const isVowel = vowels.includes(word[i]);
      if (isVowel && !previousWasVowel) {
        syllableCount++;
      }
      previousWasVowel = isVowel;
    }
    
    // Handle silent 'e'
    if (word.endsWith('e')) {
      syllableCount--;
    }
    
    return Math.max(1, syllableCount);
  };

  // Get readability level from score
  const getReadabilityLevel = (score: number): string => {
    if (score >= 90) return 'Very Easy';
    if (score >= 80) return 'Easy';
    if (score >= 70) return 'Fairly Easy';
    if (score >= 60) return 'Standard';
    if (score >= 50) return 'Fairly Difficult';
    if (score >= 30) return 'Difficult';
    return 'Very Difficult';
  };

  // Generate example texts
  const generateExampleText = () => {
    const examples = [
      {
        title: 'Technical Documentation',
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
The API returns standard HTTP status codes. Error responses include detailed messages to help with debugging.`
      },
      {
        title: 'Blog Post',
        text: `The Future of Web Development

Web development has evolved dramatically over the past decade. From simple static websites to complex single-page applications, the landscape continues to change rapidly.

Modern frameworks like React, Vue, and Angular have revolutionized how we build user interfaces. These tools provide powerful abstractions that make development faster and more maintainable.

The rise of serverless architecture has also transformed backend development. Developers can now deploy functions without managing servers, reducing operational complexity significantly.

Looking ahead, we can expect several trends to shape the future:

1. WebAssembly will enable high-performance applications in browsers
2. Progressive Web Apps will blur the line between web and native apps
3. AI-powered development tools will automate routine tasks
4. Edge computing will bring processing closer to users

The key to success in this evolving landscape is continuous learning and adaptation. Developers who embrace new technologies while maintaining strong fundamentals will thrive in the years ahead.`
      },
      {
        title: 'Product Description',
        text: `Premium Wireless Headphones

Experience exceptional audio quality with our latest wireless headphones. Featuring advanced noise cancellation technology and premium materials.

Key Features:
• 30-hour battery life with quick charge
• Active noise cancellation
• Premium leather headband
• High-resolution audio support
• Bluetooth 5.0 connectivity
• Touch controls for easy operation

Perfect for commuting, working from home, or enjoying your favorite music. The comfortable design ensures all-day wearability without fatigue.

Available in three colors: Midnight Black, Pearl White, and Rose Gold. Each purchase includes a premium carrying case and charging cable.

30-day money-back guarantee. Free shipping on orders over $50.`
      },
      {
        title: 'Academic Paper Abstract',
        text: `Abstract

This study investigates the impact of machine learning algorithms on predictive analytics in healthcare systems. We analyzed data from 10,000 patients across multiple hospitals to evaluate the effectiveness of various ML models.

Our methodology employed supervised learning techniques including random forests, support vector machines, and neural networks. The dataset comprised electronic health records spanning five years of patient data.

Results demonstrate that ensemble methods achieved 94.2% accuracy in predicting patient readmission rates, significantly outperforming traditional statistical models. The random forest algorithm showed particular strength in handling missing data and feature importance ranking.

These findings suggest that machine learning can substantially improve healthcare outcomes through better predictive capabilities. Implementation of such systems could reduce costs while enhancing patient care quality.

Further research is needed to address ethical considerations and ensure algorithmic fairness across diverse patient populations.`
      }
    ];

    const randomExample = examples[Math.floor(Math.random() * examples.length)];
    setText(randomExample.text);
    toast.success(`Example loaded: ${randomExample.title}`);
  };

  // Analyze text and calculate statistics
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
        readabilityLevel: 'Unknown'
      });
      setWordFrequency([]);
      return;
    }

    // Basic counts
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    const lines = text.split('\n').length;
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
    
    // Word analysis
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0);
    
    const wordCount = words.length;
    
    // Sentence analysis
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const sentenceCount = sentences.length;
    
    // Calculate averages
    const averageWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0;
    const averageCharactersPerWord = wordCount > 0 ? charactersNoSpaces / wordCount : 0;
    
    // Reading and speaking time (average reading: 200 WPM, speaking: 150 WPM)
    const readingTime = wordCount / 200;
    const speakingTime = wordCount / 150;
    
    // Syllable count for readability
    const totalSyllables = words.reduce((total, word) => total + countSyllables(word), 0);
    
    // Readability score
    const readabilityScore = calculateReadabilityScore(wordCount, sentenceCount, totalSyllables);
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
      readabilityLevel
    });

    // Word frequency analysis
    const wordCounts = new Map<string, number>();
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them']);
    
    words.forEach(word => {
      if (word.length > 2 && !commonWords.has(word)) {
        wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
      }
    });

    const sortedWords = Array.from(wordCounts.entries())
      .map(([word, count]) => ({
        word,
        count,
        percentage: (count / wordCount) * 100
      }))
      .sort((a, b) => b.count - a.count);

    setWordFrequency(sortedWords);
  }, [text]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  const shareResult = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('text', encodeForUrl(text));
    
    navigator.clipboard.writeText(url.toString()).then(() => {
      toast.success('Shareable URL copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to create shareable URL');
    });
  };

  const downloadResult = () => {
    const resultData = {
      text,
      statistics,
      wordFrequency: wordFrequency.slice(0, 50), // Top 50 words
      generatedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(resultData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'word-analysis-result.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Analysis result downloaded!');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setText(text);
    };
    reader.readAsText(file);
  };

  const clearAll = () => {
    setText('');
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
      readabilityLevel: 'Unknown'
    });
    setWordFrequency([]);
    router.push('/tools/word-counter');
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 1) {
      return `${Math.round(minutes * 60)} seconds`;
    } else if (minutes < 60) {
      return `${Math.round(minutes)} minute${Math.round(minutes) !== 1 ? 's' : ''}`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = Math.round(minutes % 60);
      return `${hours}h ${remainingMinutes}m`;
    }
  };

  const getReadabilityColor = (score: number): string => {
    if (score >= 70) return 'text-green-600 dark:text-green-400';
    if (score >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Word Counter & Text Analyzer</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Analyze your text with comprehensive statistics including word count, character count, frequency analysis, and readability metrics.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Input Section */}
        <div className="lg:col-span-2">
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2 dark:text-white">
                  <FileText className="h-5 w-5" />
                  <span>Text Input</span>
                </CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={generateExampleText}>
                    <Shuffle className="h-4 w-4 mr-2" />
                    Example
                  </Button>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Button variant="outline" size="sm" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </span>
                    </Button>
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button variant="outline" size="sm" onClick={clearAll}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </div>
              <CardDescription className="dark:text-gray-300">
                Paste or type your text to analyze word count, character count, and more
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
                <span>Live count: {statistics.words} words, {statistics.characters} characters</span>
                {text && (
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(text)}>
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

        {/* Quick Stats Sidebar */}
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
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{statistics.words}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Words</div>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{statistics.characters}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Characters</div>
                </div>
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{statistics.sentences}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Sentences</div>
                </div>
                <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{statistics.paragraphs}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Paragraphs</div>
                </div>
              </div>
              
              {statistics.words > 0 && (
                <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Reading time:</span>
                    <span className="font-medium">{formatTime(statistics.readingTime)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Speaking time:</span>
                    <span className="font-medium">{formatTime(statistics.speakingTime)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Readability:</span>
                    <span className={`font-medium ${getReadabilityColor(statistics.readabilityScore)}`}>
                      {statistics.readabilityLevel}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {statistics.words > 0 && (
            <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2 dark:text-white">
                    <TrendingUp className="h-5 w-5" />
                    <span>Top Words</span>
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={downloadResult}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {wordFrequency.slice(0, showTopWords).map((item, index) => (
                    <div key={item.word} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-900 rounded">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs w-6 h-6 flex items-center justify-center">
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
                    onClick={() => setShowTopWords(prev => Math.min(prev + 10, wordFrequency.length))}
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

      {/* Detailed Analysis */}
      {statistics.words > 0 && (
        <Card className="mt-8 bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">Detailed Analysis</CardTitle>
            <CardDescription className="dark:text-gray-300">
              Comprehensive text statistics and readability metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="statistics" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="statistics">Statistics</TabsTrigger>
                <TabsTrigger value="readability">Readability</TabsTrigger>
                <TabsTrigger value="frequency">Word Frequency</TabsTrigger>
              </TabsList>
              
              <TabsContent value="statistics" className="space-y-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Character Count</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">With spaces:</span>
                        <span className="font-mono">{statistics.characters}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Without spaces:</span>
                        <span className="font-mono">{statistics.charactersNoSpaces}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Lines:</span>
                        <span className="font-mono">{statistics.lines}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Structure</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Words:</span>
                        <span className="font-mono">{statistics.words}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Sentences:</span>
                        <span className="font-mono">{statistics.sentences}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Paragraphs:</span>
                        <span className="font-mono">{statistics.paragraphs}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Averages</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Words/sentence:</span>
                        <span className="font-mono">{statistics.averageWordsPerSentence.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Chars/word:</span>
                        <span className="font-mono">{statistics.averageCharactersPerWord.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Time Estimates</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Reading:</span>
                        <span className="font-mono">{formatTime(statistics.readingTime)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Speaking:</span>
                        <span className="font-mono">{formatTime(statistics.speakingTime)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="readability" className="space-y-6">
                <div className="space-y-6">
                  <div className="text-center p-6 bg-gray-50 dark:bg-slate-900 rounded-lg">
                    <div className={`text-4xl font-bold mb-2 ${getReadabilityColor(statistics.readabilityScore)}`}>
                      {statistics.readabilityScore.toFixed(1)}
                    </div>
                    <div className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      {statistics.readabilityLevel}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Flesch Reading Ease Score
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Reading Level Guide</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 rounded">
                        <span className="text-sm">90-100: Very Easy</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">5th grade</span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded">
                        <span className="text-sm">80-89: Easy</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">6th grade</span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded">
                        <span className="text-sm">70-79: Fairly Easy</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">7th grade</span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded">
                        <span className="text-sm">60-69: Standard</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">8th-9th grade</span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded">
                        <span className="text-sm">50-59: Fairly Difficult</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">10th-12th grade</span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded">
                        <span className="text-sm">30-49: Difficult</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">College level</span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded">
                        <span className="text-sm">0-29: Very Difficult</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Graduate level</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="frequency" className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Word Frequency Analysis ({wordFrequency.length} unique words)
                    </h4>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Excluding common words (the, and, of, etc.)
                    </div>
                  </div>
                  
                  <div className="grid gap-2 max-h-[400px] overflow-y-auto">
                    {wordFrequency.map((item, index) => (
                      <div key={item.word} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline" className="w-8 h-6 flex items-center justify-center text-xs">
                            {index + 1}
                          </Badge>
                          <span className="font-mono font-medium">{item.word}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="w-24">
                            <Progress value={item.percentage} className="h-2" />
                          </div>
                          <div className="text-right min-w-[60px]">
                            <div className="font-medium">{item.count}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {item.percentage.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Info Section */}
      <Card className="mt-8 bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">About Text Analysis</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <p className="text-gray-600 dark:text-gray-300">
            Text analysis provides valuable insights into your writing. Word count and character count are essential for meeting requirements, 
            while readability scores help ensure your content is accessible to your target audience.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mt-6">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Word Count Uses:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Academic papers and essays</li>
                <li>• Blog posts and articles</li>
                <li>• Social media content</li>
                <li>• Marketing copy</li>
                <li>• Technical documentation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Readability Metrics:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Flesch Reading Ease Score</li>
                <li>• Average sentence length</li>
                <li>• Average word length</li>
                <li>• Syllable complexity</li>
                <li>• Grade level estimation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Frequency Analysis:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Identify key themes</li>
                <li>• Spot overused words</li>
                <li>• Improve vocabulary diversity</li>
                <li>• SEO keyword analysis</li>
                <li>• Content optimization</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function WordCounterPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div></div>}>
      <WordCounterTool />
    </Suspense>
  );
}