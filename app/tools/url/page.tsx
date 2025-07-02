'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Copy, Share2, RotateCcw, Download, Upload, Shuffle, AlertTriangle, CheckCircle, Link2, Globe, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';

interface URLComponents {
  protocol: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  origin: string;
  host: string;
}

interface QueryParam {
  key: string;
  value: string;
  encoded: string;
}

interface URLAnalysis {
  isValid: boolean;
  error?: string;
  components?: URLComponents;
  queryParams: QueryParam[];
  encodedLength: number;
  decodedLength: number;
}

function URLTool() {
  const [input, setInput] = useState('');
  const [encoded, setEncoded] = useState('');
  const [decoded, setDecoded] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [analysis, setAnalysis] = useState<URLAnalysis>({ isValid: true, queryParams: [], encodedLength: 0, decodedLength: 0 });
  const [showComponents, setShowComponents] = useState(false);
  const [error, setError] = useState('');
  
  const searchParams = useSearchParams();
  const router = useRouter();

  // Helper function to safely encode/decode for URL sharing
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
    const urlInput = searchParams.get('input');
    const urlMode = searchParams.get('mode');
    
    if (urlInput) {
      const decodedInput = decodeFromUrl(urlInput);
      if (decodedInput) {
        setInput(decodedInput);
      }
    }
    if (urlMode === 'encode' || urlMode === 'decode') {
      setMode(urlMode);
    }
  }, [searchParams]);

  // Generate example URLs
  const generateExampleURL = () => {
    const examples = [
      {
        title: 'Search Query with Special Characters',
        url: 'https://example.com/search?q=hello world&category=web development&sort=date&filter=javascript & react'
      },
      {
        title: 'API Endpoint with Parameters',
        url: 'https://api.example.com/v1/users?page=1&limit=50&fields=name,email,created_at&sort=-created_at'
      },
      {
        title: 'URL with Hash Fragment',
        url: 'https://docs.example.com/guide/getting-started#installation & setup'
      },
      {
        title: 'Complex Query String',
        url: 'https://shop.example.com/products?category=electronics&price[min]=100&price[max]=500&tags[]=smartphone&tags[]=android'
      },
      {
        title: 'URL with Special Characters',
        url: 'https://example.com/path/to/resource?title=Hello, World!&description=This is a test & demo&symbols=@#$%^&*()'
      },
      {
        title: 'Social Media Share URL',
        url: 'https://twitter.com/intent/tweet?text=Check out this awesome tool!&url=https://devtools-hub.com&hashtags=webdev,tools'
      }
    ];

    const randomExample = examples[Math.floor(Math.random() * examples.length)];
    setInput(randomExample.url);
    toast.success(`Example loaded: ${randomExample.title}`);
  };

  // Parse query parameters
  const parseQueryParams = (search: string): QueryParam[] => {
    if (!search) return [];
    
    const params: QueryParam[] = [];
    const urlParams = new URLSearchParams(search);
    
    for (const [key, value] of urlParams.entries()) {
      params.push({
        key,
        value,
        encoded: encodeURIComponent(key) + '=' + encodeURIComponent(value)
      });
    }
    
    return params;
  };

  // Analyze URL and perform encoding/decoding
  useEffect(() => {
    if (!input.trim()) {
      setEncoded('');
      setDecoded('');
      setAnalysis({ isValid: true, queryParams: [], encodedLength: 0, decodedLength: 0 });
      setError('');
      return;
    }

    try {
      if (mode === 'encode') {
        // URL Encoding
        const encodedResult = encodeURIComponent(input);
        setEncoded(encodedResult);
        setDecoded('');
        
        // Try to parse as URL for analysis
        try {
          const url = new URL(input);
          const components: URLComponents = {
            protocol: url.protocol,
            hostname: url.hostname,
            port: url.port,
            pathname: url.pathname,
            search: url.search,
            hash: url.hash,
            origin: url.origin,
            host: url.host
          };
          
          const queryParams = parseQueryParams(url.search);
          
          setAnalysis({
            isValid: true,
            components,
            queryParams,
            encodedLength: encodedResult.length,
            decodedLength: input.length
          });
        } catch {
          // Not a valid URL, but still encode it
          setAnalysis({
            isValid: false,
            queryParams: [],
            encodedLength: encodedResult.length,
            decodedLength: input.length
          });
        }
      } else {
        // URL Decoding
        const decodedResult = decodeURIComponent(input);
        setDecoded(decodedResult);
        setEncoded('');
        
        // Try to parse decoded result as URL for analysis
        try {
          const url = new URL(decodedResult);
          const components: URLComponents = {
            protocol: url.protocol,
            hostname: url.hostname,
            port: url.port,
            pathname: url.pathname,
            search: url.search,
            hash: url.hash,
            origin: url.origin,
            host: url.host
          };
          
          const queryParams = parseQueryParams(url.search);
          
          setAnalysis({
            isValid: true,
            components,
            queryParams,
            encodedLength: input.length,
            decodedLength: decodedResult.length
          });
        } catch {
          setAnalysis({
            isValid: false,
            queryParams: [],
            encodedLength: input.length,
            decodedLength: decodedResult.length
          });
        }
      }
      setError('');
    } catch (err) {
      setError(mode === 'decode' ? 'Invalid URL encoding' : 'Encoding error');
      setEncoded('');
      setDecoded('');
      setAnalysis({ isValid: false, queryParams: [], encodedLength: 0, decodedLength: 0 });
    }
  }, [input, mode]);

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
    url.searchParams.set('input', encodeForUrl(input));
    url.searchParams.set('mode', mode);
    
    navigator.clipboard.writeText(url.toString()).then(() => {
      toast.success('Shareable URL copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to create shareable URL');
    });
  };

  const downloadResult = () => {
    const resultData = {
      input,
      mode,
      encoded,
      decoded,
      analysis,
      generatedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(resultData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'url-encoding-result.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Result downloaded!');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setInput(text.trim());
    };
    reader.readAsText(file);
  };

  const clearAll = () => {
    setInput('');
    setEncoded('');
    setDecoded('');
    setAnalysis({ isValid: true, queryParams: [], encodedLength: 0, decodedLength: 0 });
    setError('');
    router.push('/tools/url');
  };

  const swapInputOutput = () => {
    const output = mode === 'encode' ? encoded : decoded;
    if (output && !error) {
      setInput(output);
      setMode(mode === 'encode' ? 'decode' : 'encode');
    }
  };

  const getOutput = () => {
    return mode === 'encode' ? encoded : decoded;
  };

  const getOutputPlaceholder = () => {
    return mode === 'encode' ? 'Encoded URL will appear here...' : 'Decoded URL will appear here...';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">URL Encoder/Decoder</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Encode and decode URLs for safe transmission and proper formatting. Analyze URL components and query parameters.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <Card className="h-fit bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2 dark:text-white">
                <Link2 className="h-5 w-5" />
                <span>Input</span>
              </CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={generateExampleURL}>
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
              Enter your URL to {mode === 'encode' ? 'encode' : 'decode'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={mode} onValueChange={(value) => setMode(value as 'encode' | 'decode')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="encode">Encode</TabsTrigger>
                <TabsTrigger value="decode">Decode</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Textarea
              placeholder={mode === 'encode' ? 'Enter URL to encode...' : 'Enter encoded URL to decode...'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[200px] resize-none font-mono text-sm bg-white dark:bg-slate-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            />
            
            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
              <span>Characters: {input.length}</span>
              {input && (
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(input)}>
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

        {/* Output Section */}
        <Card className="h-fit bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="dark:text-white">Output</CardTitle>
              <div className="flex space-x-2">
                {getOutput() && (
                  <>
                    <Button variant="outline" size="sm" onClick={swapInputOutput}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Swap
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(getOutput())}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadResult}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </>
                )}
              </div>
            </div>
            <CardDescription className="dark:text-gray-300">
              {mode === 'encode' ? 'URL encoded' : 'URL decoded'} result
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  <p className="text-red-600 dark:text-red-400 text-sm font-medium">Error</p>
                </div>
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</p>
              </div>
            ) : (
              <Textarea
                placeholder={getOutputPlaceholder()}
                value={getOutput()}
                readOnly
                className="min-h-[200px] resize-none font-mono text-sm bg-gray-50 dark:bg-slate-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              />
            )}
            
            {getOutput() && (
              <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mt-2">
                <span>Characters: {getOutput().length}</span>
                {analysis.encodedLength !== analysis.decodedLength && (
                  <span>
                    {mode === 'encode' 
                      ? `+${analysis.encodedLength - analysis.decodedLength} chars` 
                      : `-${analysis.encodedLength - analysis.decodedLength} chars`
                    }
                  </span>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* URL Analysis */}
      {input && (
        <Card className="mt-8 bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2 dark:text-white">
                <Globe className="h-5 w-5" />
                <span>URL Analysis</span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                {analysis.components && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowComponents(!showComponents)}
                  >
                    {showComponents ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                    {showComponents ? 'Hide' : 'Show'} Components
                  </Button>
                )}
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                  analysis.isValid 
                    ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                    : 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300'
                }`}>
                  {analysis.isValid ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium">
                    {analysis.isValid ? 'Valid URL' : 'Text/Fragment'}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="params">Query Params</TabsTrigger>
                <TabsTrigger value="components" disabled={!analysis.components}>Components</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Statistics</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Original length:</span>
                        <Badge variant="outline">{analysis.decodedLength} chars</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Encoded length:</span>
                        <Badge variant="outline">{analysis.encodedLength} chars</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Size change:</span>
                        <Badge variant={analysis.encodedLength > analysis.decodedLength ? "destructive" : "default"}>
                          {analysis.encodedLength > analysis.decodedLength ? '+' : ''}
                          {analysis.encodedLength - analysis.decodedLength} chars
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Query parameters:</span>
                        <Badge variant="outline">{analysis.queryParams.length}</Badge>
                      </div>
                    </div>
                  </div>
                  
                  {analysis.components && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 dark:text-white">URL Info</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Protocol:</span>
                          <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                            {analysis.components.protocol}
                          </code>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Host:</span>
                          <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                            {analysis.components.host}
                          </code>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Path:</span>
                          <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                            {analysis.components.pathname || '/'}
                          </code>
                        </div>
                        {analysis.components.hash && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Hash:</span>
                            <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                              {analysis.components.hash}
                            </code>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="params" className="space-y-4">
                {analysis.queryParams.length > 0 ? (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Query Parameters ({analysis.queryParams.length})
                    </h4>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {analysis.queryParams.map((param, index) => (
                        <div key={index} className="p-3 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline">Param {index + 1}</Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(param.encoded)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500 dark:text-gray-400 w-12">Key:</span>
                              <code className="text-sm bg-white dark:bg-slate-800 px-2 py-1 rounded border flex-1">
                                {param.key}
                              </code>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500 dark:text-gray-400 w-12">Value:</span>
                              <code className="text-sm bg-white dark:bg-slate-800 px-2 py-1 rounded border flex-1">
                                {param.value}
                              </code>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500 dark:text-gray-400 w-12">Encoded:</span>
                              <code className="text-sm bg-white dark:bg-slate-800 px-2 py-1 rounded border flex-1 font-mono">
                                {param.encoded}
                              </code>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No query parameters found</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="components" className="space-y-4">
                {analysis.components && showComponents && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">URL Components Breakdown</h4>
                    <div className="grid gap-3">
                      {Object.entries(analysis.components).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 w-20">
                              {key}:
                            </Label>
                            <code className="text-sm bg-white dark:bg-slate-800 px-3 py-1 rounded border">
                              {value || '(empty)'}
                            </code>
                          </div>
                          {value && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(value)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Info Section */}
      <Card className="mt-8 bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">About URL Encoding</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <p className="text-gray-600 dark:text-gray-300">
            URL encoding (percent encoding) is a mechanism to encode information in URLs. 
            It replaces unsafe ASCII characters with a "%" followed by two hexadecimal digits.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mt-6">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Common Use Cases:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Query parameter values</li>
                <li>• Form data submission</li>
                <li>• API endpoint parameters</li>
                <li>• Special characters in URLs</li>
                <li>• International characters</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Characters Encoded:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Spaces → <code>%20</code></li>
                <li>• & → <code>%26</code></li>
                <li>• = → <code>%3D</code></li>
                <li>• ? → <code>%3F</code></li>
                <li>• # → <code>%23</code></li>
                <li>• + → <code>%2B</code></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Features:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Bidirectional conversion</li>
                <li>• URL component analysis</li>
                <li>• Query parameter parsing</li>
                <li>• Validation and error detection</li>
                <li>• File upload support</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function URLPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div></div>}>
      <URLTool />
    </Suspense>
  );
}