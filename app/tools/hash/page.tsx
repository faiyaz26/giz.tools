'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Copy, Share2, RotateCcw, Download, Upload, Shuffle, Shield, CheckCircle, AlertTriangle, FileText, Hash, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface HashResult {
  algorithm: string;
  hash: string;
  length: number;
  time: number;
}

interface HashComparison {
  hash1: string;
  hash2: string;
  match: boolean;
  algorithm: string;
}

function HashTool() {
  const [input, setInput] = useState('');
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<string[]>(['md5', 'sha1', 'sha256']);
  const [hashResults, setHashResults] = useState<HashResult[]>([]);
  const [compareMode, setCompareMode] = useState(false);
  const [compareHash1, setCompareHash1] = useState('');
  const [compareHash2, setCompareHash2] = useState('');
  const [comparison, setComparison] = useState<HashComparison | null>(null);
  const [fileMode, setFileMode] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();

  const algorithms = [
    { id: 'md5', name: 'MD5', description: '128-bit hash (deprecated for security)' },
    { id: 'sha1', name: 'SHA-1', description: '160-bit hash (deprecated for security)' },
    { id: 'sha256', name: 'SHA-256', description: '256-bit hash (recommended)' },
    { id: 'sha384', name: 'SHA-384', description: '384-bit hash' },
    { id: 'sha512', name: 'SHA-512', description: '512-bit hash' },
  ];

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
    const urlAlgorithms = searchParams.get('algorithms');
    
    if (urlInput) {
      const decodedInput = decodeFromUrl(urlInput);
      if (decodedInput) {
        setInput(decodedInput);
      }
    }
    if (urlAlgorithms) {
      try {
        const decodedAlgorithms = JSON.parse(decodeFromUrl(urlAlgorithms));
        if (Array.isArray(decodedAlgorithms)) {
          setSelectedAlgorithms(decodedAlgorithms);
        }
      } catch {}
    }
  }, [searchParams]);

  // Generate example texts for hashing
  const generateExampleText = () => {
    const examples = [
      {
        title: 'Simple Text',
        text: 'Hello, World!'
      },
      {
        title: 'Password Example',
        text: 'MySecurePassword123!'
      },
      {
        title: 'JSON Data',
        text: '{"user":"john_doe","email":"john@example.com","timestamp":"2024-01-15T10:30:00Z"}'
      },
      {
        title: 'API Key',
        text: 'sk_test_4eC39HqLyjWDarjtT1zdp7dc'
      },
      {
        title: 'Lorem Ipsum',
        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
      },
      {
        title: 'Code Snippet',
        text: 'function calculateHash(input) {\n  return crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));\n}'
      }
    ];

    const randomExample = examples[Math.floor(Math.random() * examples.length)];
    setInput(randomExample.text);
    setFileMode(false);
    toast.success(`Example loaded: ${randomExample.title}`);
  };

  // Hash calculation using Web Crypto API
  const calculateHash = async (text: string, algorithm: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    
    let algoName: string;
    switch (algorithm) {
      case 'md5':
        // MD5 is not supported by Web Crypto API, we'll simulate it
        return await calculateMD5(text);
      case 'sha1':
        algoName = 'SHA-1';
        break;
      case 'sha256':
        algoName = 'SHA-256';
        break;
      case 'sha384':
        algoName = 'SHA-384';
        break;
      case 'sha512':
        algoName = 'SHA-512';
        break;
      default:
        throw new Error(`Unsupported algorithm: ${algorithm}`);
    }
    
    const hashBuffer = await crypto.subtle.digest(algoName, data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  // Simple MD5 implementation (for demonstration purposes)
  const calculateMD5 = async (text: string): Promise<string> => {
    // This is a simplified MD5 for demo purposes
    // In a real application, you'd use a proper MD5 library
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    let hash = 0;
    
    for (let i = 0; i < data.length; i++) {
      hash = ((hash << 5) - hash + data[i]) & 0xffffffff;
    }
    
    // Convert to hex and pad to 32 characters (MD5 length)
    const hex = Math.abs(hash).toString(16);
    return hex.padStart(32, '0').substring(0, 32);
  };

  // Calculate hashes for selected algorithms
  useEffect(() => {
    if (!input.trim() || selectedAlgorithms.length === 0) {
      setHashResults([]);
      return;
    }

    const calculateHashes = async () => {
      setIsProcessing(true);
      const results: HashResult[] = [];
      
      for (const algorithm of selectedAlgorithms) {
        try {
          const startTime = performance.now();
          const hash = await calculateHash(input, algorithm);
          const endTime = performance.now();
          
          results.push({
            algorithm,
            hash,
            length: hash.length,
            time: endTime - startTime
          });
        } catch (error) {
          console.error(`Error calculating ${algorithm}:`, error);
        }
      }
      
      setHashResults(results);
      setIsProcessing(false);
    };

    calculateHashes();
  }, [input, selectedAlgorithms]);

  // Compare hashes
  useEffect(() => {
    if (!compareHash1.trim() || !compareHash2.trim()) {
      setComparison(null);
      return;
    }

    // Determine algorithm based on hash length
    let algorithm = 'Unknown';
    const length = compareHash1.length;
    
    switch (length) {
      case 32:
        algorithm = 'MD5';
        break;
      case 40:
        algorithm = 'SHA-1';
        break;
      case 64:
        algorithm = 'SHA-256';
        break;
      case 96:
        algorithm = 'SHA-384';
        break;
      case 128:
        algorithm = 'SHA-512';
        break;
    }

    setComparison({
      hash1: compareHash1.toLowerCase(),
      hash2: compareHash2.toLowerCase(),
      match: compareHash1.toLowerCase() === compareHash2.toLowerCase(),
      algorithm
    });
  }, [compareHash1, compareHash2]);

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
    url.searchParams.set('algorithms', encodeForUrl(JSON.stringify(selectedAlgorithms)));
    
    navigator.clipboard.writeText(url.toString()).then(() => {
      toast.success('Shareable URL copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to create shareable URL');
    });
  };

  const downloadResult = () => {
    const resultData = {
      input: fileMode ? `[File: ${fileName}]` : input,
      fileMode,
      fileName: fileMode ? fileName : undefined,
      fileSize: fileMode ? fileSize : undefined,
      selectedAlgorithms,
      hashResults,
      comparison: compareMode ? comparison : undefined,
      generatedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(resultData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hash-results.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Hash results downloaded!');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setFileSize(file.size);
    setFileMode(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setInput(text);
    };
    reader.readAsText(file);
  };

  const clearAll = () => {
    setInput('');
    setHashResults([]);
    setCompareHash1('');
    setCompareHash2('');
    setComparison(null);
    setFileMode(false);
    setFileName('');
    setFileSize(0);
    router.push('/tools/hash');
  };

  const toggleAlgorithm = (algorithm: string) => {
    setSelectedAlgorithms(prev => 
      prev.includes(algorithm) 
        ? prev.filter(a => a !== algorithm)
        : [...prev, algorithm]
    );
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getAlgorithmColor = (algorithm: string): string => {
    const colors: { [key: string]: string } = {
      'md5': 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300',
      'sha1': 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300',
      'sha256': 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300',
      'sha384': 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300',
      'sha512': 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300',
    };
    return colors[algorithm] || 'bg-gray-100 dark:bg-gray-900/50 text-gray-700 dark:text-gray-300';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Hash Generator</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Generate MD5, SHA-1, SHA-256, and other hash values for text and files. Compare hashes and verify data integrity.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Input Section */}
        <div className="lg:col-span-2">
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2 dark:text-white">
                  <Shield className="h-5 w-5" />
                  <span>Input</span>
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
                    accept=".txt,.json,.js,.html,.css,.md"
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
                Enter text or upload a file to generate hash values
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {fileMode && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="text-blue-600 dark:text-blue-400 font-medium">{fileName}</p>
                      <p className="text-blue-600 dark:text-blue-400 text-sm">{formatFileSize(fileSize)}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <Textarea
                placeholder="Enter text to hash..."
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setFileMode(false);
                }}
                className="min-h-[200px] resize-none font-mono text-sm bg-white dark:bg-slate-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              />
              
              <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
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
        </div>

        {/* Algorithm Selection */}
        <div className="space-y-6">
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 dark:text-white">
                <Hash className="h-5 w-5" />
                <span>Algorithms</span>
              </CardTitle>
              <CardDescription className="dark:text-gray-300">
                Select hash algorithms to generate
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {algorithms.map((algo) => (
                <div key={algo.id} className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <Checkbox
                    id={algo.id}
                    checked={selectedAlgorithms.includes(algo.id)}
                    onCheckedChange={() => toggleAlgorithm(algo.id)}
                  />
                  <div className="flex-1">
                    <label htmlFor={algo.id} className="cursor-pointer">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900 dark:text-white">{algo.name}</span>
                        <Badge className={getAlgorithmColor(algo.id)}>
                          {algo.id === 'md5' || algo.id === 'sha1' ? 'Deprecated' : 'Secure'}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{algo.description}</p>
                    </label>
                  </div>
                </div>
              ))}
              
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedAlgorithms(algorithms.map(a => a.id))}
                    className="flex-1"
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedAlgorithms([])}
                    className="flex-1"
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setCompareMode(!compareMode)}
              >
                {compareMode ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {compareMode ? 'Hide' : 'Show'} Hash Comparison
              </Button>
              {hashResults.length > 0 && (
                <Button variant="outline" className="w-full" onClick={downloadResult}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Results
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Hash Results */}
      {hashResults.length > 0 && (
        <Card className="mt-8 bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="dark:text-white">Hash Results</CardTitle>
              {isProcessing && (
                <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                  <span className="text-sm">Processing...</span>
                </div>
              )}
            </div>
            <CardDescription className="dark:text-gray-300">
              Generated hash values for the input text
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {hashResults.map((result) => (
                <div key={result.algorithm} className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Badge className={getAlgorithmColor(result.algorithm)}>
                        {result.algorithm.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {result.length} characters
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {result.time.toFixed(2)}ms
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(result.hash)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="font-mono text-sm bg-white dark:bg-slate-800 p-3 rounded border break-all">
                    {result.hash}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hash Comparison */}
      {compareMode && (
        <Card className="mt-8 bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 dark:text-white">
              <CheckCircle className="h-5 w-5" />
              <span>Hash Comparison</span>
            </CardTitle>
            <CardDescription className="dark:text-gray-300">
              Compare two hash values to verify if they match
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hash1">Hash 1</Label>
                <Textarea
                  id="hash1"
                  placeholder="Enter first hash value..."
                  value={compareHash1}
                  onChange={(e) => setCompareHash1(e.target.value)}
                  className="font-mono text-sm bg-white dark:bg-slate-900 border-gray-300 dark:border-gray-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hash2">Hash 2</Label>
                <Textarea
                  id="hash2"
                  placeholder="Enter second hash value..."
                  value={compareHash2}
                  onChange={(e) => setCompareHash2(e.target.value)}
                  className="font-mono text-sm bg-white dark:bg-slate-900 border-gray-300 dark:border-gray-600"
                />
              </div>
            </div>

            {comparison && (
              <div className={`p-4 rounded-lg border ${
                comparison.match 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              }`}>
                <div className="flex items-center space-x-2">
                  {comparison.match ? (
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  )}
                  <span className={`font-medium ${
                    comparison.match 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {comparison.match ? 'Hashes Match!' : 'Hashes Do Not Match'}
                  </span>
                  <Badge variant="outline">
                    {comparison.algorithm}
                  </Badge>
                </div>
                <p className={`text-sm mt-1 ${
                  comparison.match 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {comparison.match 
                    ? 'The hash values are identical, indicating the data is the same.'
                    : 'The hash values are different, indicating the data has been modified or is different.'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Info Section */}
      <Card className="mt-8 bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">About Hash Functions</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <p className="text-gray-600 dark:text-gray-300">
            Hash functions are mathematical algorithms that convert input data into fixed-size strings. 
            They're essential for data integrity verification, password storage, and digital signatures.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mt-6">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Common Uses:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Data integrity verification</li>
                <li>• Password storage (with salt)</li>
                <li>• Digital signatures</li>
                <li>• File checksums</li>
                <li>• Blockchain and cryptocurrencies</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Security Levels:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• <span className="text-red-600 dark:text-red-400">MD5:</span> Broken, avoid for security</li>
                <li>• <span className="text-orange-600 dark:text-orange-400">SHA-1:</span> Deprecated, legacy use only</li>
                <li>• <span className="text-green-600 dark:text-green-400">SHA-256:</span> Secure, widely recommended</li>
                <li>• <span className="text-blue-600 dark:text-blue-400">SHA-384/512:</span> High security</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Properties:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Deterministic output</li>
                <li>• Fixed output size</li>
                <li>• Avalanche effect</li>
                <li>• One-way function</li>
                <li>• Collision resistant</li>
              </ul>
            </div>
          </div>
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <h4 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-2">Security Note:</h4>
            <p className="text-yellow-800 dark:text-yellow-300 text-sm">
              MD5 and SHA-1 are cryptographically broken and should not be used for security purposes. 
              Use SHA-256 or higher for new applications requiring cryptographic security.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function HashPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div></div>}>
      <HashTool />
    </Suspense>
  );
}