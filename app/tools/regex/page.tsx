'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Copy, Share2, RotateCcw, Download, Upload, Shuffle, AlertTriangle, CheckCircle, Search, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';

interface RegexMatch {
  match: string;
  index: number;
  groups: string[];
  namedGroups: { [key: string]: string };
}

interface RegexResult {
  isValid: boolean;
  error?: string;
  matches: RegexMatch[];
  totalMatches: number;
}

function RegexTool() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState({
    global: true,
    ignoreCase: false,
    multiline: false,
    dotAll: false,
    unicode: false,
    sticky: false
  });
  const [testString, setTestString] = useState('');
  const [result, setResult] = useState<RegexResult>({ isValid: true, matches: [], totalMatches: 0 });
  const [highlightedText, setHighlightedText] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);
  
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
    const urlPattern = searchParams.get('pattern');
    const urlFlags = searchParams.get('flags');
    const urlText = searchParams.get('text');
    
    if (urlPattern) {
      const decodedPattern = decodeFromUrl(urlPattern);
      if (decodedPattern) {
        setPattern(decodedPattern);
      }
    }
    if (urlFlags) {
      try {
        const decodedFlags = JSON.parse(decodeFromUrl(urlFlags));
        setFlags({ ...flags, ...decodedFlags });
      } catch {}
    }
    if (urlText) {
      const decodedText = decodeFromUrl(urlText);
      if (decodedText) {
        setTestString(decodedText);
      }
    }
  }, [searchParams]);

  // Generate example regex patterns
  const generateExampleRegex = () => {
    const examples = [
      {
        pattern: '\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b',
        text: 'Contact us at support@example.com or sales@company.org for more information. You can also reach admin@test.co.uk.',
        description: 'Email validation pattern'
      },
      {
        pattern: '\\b\\d{3}-\\d{3}-\\d{4}\\b',
        text: 'Call us at 555-123-4567 or 800-555-0199. Our fax is 555-987-6543.',
        description: 'US phone number pattern'
      },
      {
        pattern: '#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})\\b',
        text: 'The colors are #FF5733, #33FF57, #3357FF, and #FFF for white.',
        description: 'Hex color code pattern'
      },
      {
        pattern: '\\b(?:https?:\\/\\/)?(?:www\\.)?[a-zA-Z0-9-]+\\.[a-zA-Z]{2,}(?:\\/[^\\s]*)?\\b',
        text: 'Visit https://example.com or www.google.com. Also check out github.com/user/repo.',
        description: 'URL pattern'
      },
      {
        pattern: '\\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\\s+\\d{1,2},?\\s+\\d{4}\\b',
        text: 'Important dates: Jan 15, 2024, Feb 29 2024, and December 31, 2023.',
        description: 'Date pattern (Month DD, YYYY)'
      },
      {
        pattern: '\\$\\d{1,3}(?:,\\d{3})*(?:\\.\\d{2})?\\b',
        text: 'Prices: $19.99, $1,234.56, $999, and $1,000,000.00.',
        description: 'Currency pattern (USD)'
      },
      {
        pattern: '\\b[A-Z]{2,3}\\d{2,4}\\b',
        text: 'Flight numbers: AA1234, UA567, DL89, and BA2001.',
        description: 'Flight number pattern'
      },
      {
        pattern: '(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}',
        text: 'Passwords: Password123!, weakpass, StrongP@ss1, and Test123@',
        description: 'Strong password pattern'
      }
    ];

    const randomExample = examples[Math.floor(Math.random() * examples.length)];
    setPattern(randomExample.pattern);
    setTestString(randomExample.text);
    setFlags({ ...flags, global: true, ignoreCase: false });
    toast.success(`Example loaded: ${randomExample.description}`);
  };

  // Test regex pattern
  useEffect(() => {
    if (!pattern.trim()) {
      setResult({ isValid: true, matches: [], totalMatches: 0 });
      setHighlightedText(testString);
      return;
    }

    try {
      const flagString = Object.entries(flags)
        .filter(([_, enabled]) => enabled)
        .map(([flag, _]) => {
          switch (flag) {
            case 'global': return 'g';
            case 'ignoreCase': return 'i';
            case 'multiline': return 'm';
            case 'dotAll': return 's';
            case 'unicode': return 'u';
            case 'sticky': return 'y';
            default: return '';
          }
        })
        .join('');

      const regex = new RegExp(pattern, flagString);
      const matches: RegexMatch[] = [];
      let match;
      let lastIndex = 0;
      let highlighted = '';

      if (flags.global) {
        while ((match = regex.exec(testString)) !== null) {
          // Add text before match
          highlighted += testString.slice(lastIndex, match.index);
          
          // Add highlighted match
          highlighted += `<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">${match[0]}</mark>`;
          
          matches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
            namedGroups: match.groups || {}
          });
          
          lastIndex = match.index + match[0].length;
          
          // Prevent infinite loop
          if (match[0].length === 0) {
            regex.lastIndex++;
          }
        }
        // Add remaining text
        highlighted += testString.slice(lastIndex);
      } else {
        match = regex.exec(testString);
        if (match) {
          highlighted = testString.slice(0, match.index) +
            `<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">${match[0]}</mark>` +
            testString.slice(match.index + match[0].length);
          
          matches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
            namedGroups: match.groups || {}
          });
        } else {
          highlighted = testString;
        }
      }

      setResult({
        isValid: true,
        matches,
        totalMatches: matches.length
      });
      setHighlightedText(highlighted);
    } catch (error) {
      setResult({
        isValid: false,
        error: error instanceof Error ? error.message : 'Invalid regex pattern',
        matches: [],
        totalMatches: 0
      });
      setHighlightedText(testString);
    }
  }, [pattern, flags, testString]);

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
    url.searchParams.set('pattern', encodeForUrl(pattern));
    url.searchParams.set('flags', encodeForUrl(JSON.stringify(flags)));
    url.searchParams.set('text', encodeForUrl(testString));
    
    navigator.clipboard.writeText(url.toString()).then(() => {
      toast.success('Shareable URL copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to create shareable URL');
    });
  };

  const downloadResult = () => {
    const resultData = {
      pattern,
      flags,
      testString,
      result,
      generatedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(resultData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'regex-test-result.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Test result downloaded!');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setTestString(text);
    };
    reader.readAsText(file);
  };

  const clearAll = () => {
    setPattern('');
    setTestString('');
    setFlags({
      global: true,
      ignoreCase: false,
      multiline: false,
      dotAll: false,
      unicode: false,
      sticky: false
    });
    setResult({ isValid: true, matches: [], totalMatches: 0 });
    router.push('/tools/regex');
  };

  const getFlagString = () => {
    return Object.entries(flags)
      .filter(([_, enabled]) => enabled)
      .map(([flag, _]) => {
        switch (flag) {
          case 'global': return 'g';
          case 'ignoreCase': return 'i';
          case 'multiline': return 'm';
          case 'dotAll': return 's';
          case 'unicode': return 'u';
          case 'sticky': return 'y';
          default: return '';
        }
      })
      .join('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Regex Tester</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Test and debug regular expressions with real-time matching, highlighting, and detailed analysis.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          {/* Pattern Input */}
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2 dark:text-white">
                  <Search className="h-5 w-5" />
                  <span>Regular Expression</span>
                </CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={generateExampleRegex}>
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
                Enter your regular expression pattern
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 font-mono">/</span>
                <Input
                  placeholder="Enter regex pattern..."
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  className="pl-8 pr-16 font-mono bg-white dark:bg-slate-900 border-gray-300 dark:border-gray-600"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 font-mono">
                  /{getFlagString()}
                </span>
              </div>

              {/* Flags */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Flags:</h4>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(flags).map(([flag, enabled]) => (
                    <div key={flag} className="flex items-center space-x-2">
                      <Checkbox
                        id={flag}
                        checked={enabled}
                        onCheckedChange={(checked) => 
                          setFlags(prev => ({ ...prev, [flag]: checked as boolean }))
                        }
                      />
                      <label htmlFor={flag} className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                        {flag === 'global' && 'Global (g)'}
                        {flag === 'ignoreCase' && 'Ignore Case (i)'}
                        {flag === 'multiline' && 'Multiline (m)'}
                        {flag === 'dotAll' && 'Dot All (s)'}
                        {flag === 'unicode' && 'Unicode (u)'}
                        {flag === 'sticky' && 'Sticky (y)'}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pattern Status */}
              {pattern && (
                <div className={`p-3 rounded-lg border ${
                  result.isValid 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                }`}>
                  <div className="flex items-center space-x-2">
                    {result.isValid ? (
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    )}
                    <span className={`font-medium ${
                      result.isValid 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {result.isValid ? 'Valid Pattern' : 'Invalid Pattern'}
                    </span>
                  </div>
                  {!result.isValid && result.error && (
                    <p className="text-red-600 dark:text-red-400 text-sm mt-1">{result.error}</p>
                  )}
                  {result.isValid && (
                    <p className="text-green-600 dark:text-green-400 text-sm mt-1">
                      {result.totalMatches} match{result.totalMatches !== 1 ? 'es' : ''} found
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test String Input */}
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="dark:text-white">Test String</CardTitle>
                <div className="flex space-x-2">
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
                  {testString && (
                    <Button variant="outline" size="sm" onClick={shareResult}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  )}
                </div>
              </div>
              <CardDescription className="dark:text-gray-300">
                Enter text to test your regex pattern against
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter test string here..."
                value={testString}
                onChange={(e) => setTestString(e.target.value)}
                className="min-h-[200px] resize-none font-mono text-sm bg-white dark:bg-slate-900 border-gray-300 dark:border-gray-600"
              />
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Characters: {testString.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {/* Highlighted Results */}
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="dark:text-white">Highlighted Matches</CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowExplanation(!showExplanation)}
                  >
                    {showExplanation ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                    {showExplanation ? 'Hide' : 'Show'} Details
                  </Button>
                  {result.totalMatches > 0 && (
                    <Button variant="outline" size="sm" onClick={downloadResult}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  )}
                </div>
              </div>
              <CardDescription className="dark:text-gray-300">
                Matches are highlighted in yellow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-700 min-h-[200px]">
                  {highlightedText ? (
                    <div 
                      className="font-mono text-sm whitespace-pre-wrap text-gray-900 dark:text-gray-100"
                      dangerouslySetInnerHTML={{ __html: highlightedText }}
                    />
                  ) : (
                    <div className="text-gray-500 dark:text-gray-400 text-center py-8">
                      Enter a pattern and test string to see matches
                    </div>
                  )}
                </div>

                {result.totalMatches > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Total matches: {result.totalMatches}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(highlightedText.replace(/<[^>]*>/g, ''))}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Text
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Match Details */}
          {showExplanation && result.totalMatches > 0 && (
            <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Match Details</CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Detailed information about each match
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="matches" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="matches">Matches</TabsTrigger>
                    <TabsTrigger value="groups">Groups</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="matches" className="space-y-3">
                    <div className="max-h-[300px] overflow-y-auto space-y-2">
                      {result.matches.map((match, index) => (
                        <div key={index} className="p-3 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline">Match {index + 1}</Badge>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Position: {match.index}
                            </span>
                          </div>
                          <code className="text-sm bg-white dark:bg-slate-800 px-2 py-1 rounded border">
                            {match.match}
                          </code>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="groups" className="space-y-3">
                    <div className="max-h-[300px] overflow-y-auto space-y-2">
                      {result.matches.map((match, index) => (
                        <div key={index} className="p-3 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline">Match {index + 1}</Badge>
                          </div>
                          {match.groups.length > 0 ? (
                            <div className="space-y-1">
                              {match.groups.map((group, groupIndex) => (
                                <div key={groupIndex} className="flex items-center space-x-2">
                                  <span className="text-xs text-gray-500 dark:text-gray-400 w-16">
                                    Group {groupIndex + 1}:
                                  </span>
                                  <code className="text-sm bg-white dark:bg-slate-800 px-2 py-1 rounded border">
                                    {group || '(empty)'}
                                  </code>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500 dark:text-gray-400">No capture groups</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Info Section */}
      <Card className="mt-8 bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">About Regular Expressions</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <p className="text-gray-600 dark:text-gray-300">
            Regular expressions (regex) are powerful patterns used for matching character combinations in strings. 
            They're essential for text processing, validation, and data extraction tasks.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mt-6">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Common Patterns:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• <code>\d</code> - Any digit (0-9)</li>
                <li>• <code>\w</code> - Word character</li>
                <li>• <code>\s</code> - Whitespace</li>
                <li>• <code>.</code> - Any character</li>
                <li>• <code>^</code> - Start of string</li>
                <li>• <code>$</code> - End of string</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Quantifiers:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• <code>*</code> - Zero or more</li>
                <li>• <code>+</code> - One or more</li>
                <li>• <code>?</code> - Zero or one</li>
                <li>• <code>{'{n}'}</code> - Exactly n times</li>
                <li>• <code>{'{n,m}'}</code> - Between n and m</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Flags:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• <code>g</code> - Global (find all matches)</li>
                <li>• <code>i</code> - Case insensitive</li>
                <li>• <code>m</code> - Multiline mode</li>
                <li>• <code>s</code> - Dot matches newlines</li>
                <li>• <code>u</code> - Unicode support</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function RegexPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div></div>}>
      <RegexTool />
    </Suspense>
  );
}