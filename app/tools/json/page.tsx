'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Copy, Share2, RotateCcw, Download, Upload, Shuffle, AlertTriangle, CheckCircle, Braces, Minimize, Maximize, TreePine, FileText, ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface JSONValidationResult {
  isValid: boolean;
  error?: string;
  lineNumber?: number;
  columnNumber?: number;
}

interface TreeNode {
  key: string;
  value: any;
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';
  children?: TreeNode[];
  isExpanded?: boolean;
  level: number;
}

function JSONTreeView({ data, onToggle }: { data: TreeNode[], onToggle: (path: string[]) => void }) {
  const renderNode = (node: TreeNode, path: string[] = []) => {
    const currentPath = [...path, node.key];
    const hasChildren = node.children && node.children.length > 0;
    
    const getValueColor = (type: string) => {
      switch (type) {
        case 'string': return 'text-green-600 dark:text-green-400';
        case 'number': return 'text-blue-600 dark:text-blue-400';
        case 'boolean': return 'text-purple-600 dark:text-purple-400';
        case 'null': return 'text-gray-500 dark:text-gray-400';
        default: return 'text-gray-900 dark:text-gray-100';
      }
    };

    const formatValue = (value: any, type: string) => {
      if (type === 'string') return `"${value}"`;
      if (type === 'null') return 'null';
      return String(value);
    };

    return (
      <div key={currentPath.join('.')} className="select-text">
        <div 
          className="flex items-center py-1 hover:bg-gray-50 dark:hover:bg-slate-800 rounded px-2 cursor-pointer"
          style={{ paddingLeft: `${node.level * 20 + 8}px` }}
          onClick={() => hasChildren && onToggle(currentPath)}
        >
          {hasChildren ? (
            <span className="mr-2 text-gray-400">
              {node.isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </span>
          ) : (
            <span className="mr-6"></span>
          )}
          
          <span className="text-blue-700 dark:text-blue-300 font-medium mr-2">
            {node.key}:
          </span>
          
          {!hasChildren ? (
            <span className={`font-mono ${getValueColor(node.type)}`}>
              {formatValue(node.value, node.type)}
            </span>
          ) : (
            <span className="text-gray-600 dark:text-gray-400">
              {node.type === 'array' ? `[${node.children?.length || 0}]` : `{${node.children?.length || 0}}`}
            </span>
          )}
        </div>
        
        {hasChildren && node.isExpanded && node.children && (
          <div>
            {node.children.map(child => renderNode(child, currentPath))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="font-mono text-sm bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-md p-4 min-h-[300px] max-h-[500px] overflow-auto">
      {data.map(node => renderNode(node))}
    </div>
  );
}

function JSONTool() {
  const [input, setInput] = useState('');
  const [formatted, setFormatted] = useState('');
  const [minified, setMinified] = useState('');
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [validation, setValidation] = useState<JSONValidationResult>({ isValid: true });
  const [mode, setMode] = useState<'format' | 'minify' | 'validate'>('format');
  const [viewMode, setViewMode] = useState<'tree' | 'text'>('tree');
  
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
    const urlInput = searchParams.get('json');
    const urlMode = searchParams.get('mode');
    const urlViewMode = searchParams.get('view');
    
    if (urlInput) {
      const decodedInput = decodeFromUrl(urlInput);
      if (decodedInput) {
        setInput(decodedInput);
      }
    }
    if (urlMode === 'format' || urlMode === 'minify' || urlMode === 'validate') {
      setMode(urlMode);
    }
    if (urlViewMode === 'tree' || urlViewMode === 'text') {
      setViewMode(urlViewMode);
    }
  }, [searchParams]);

  // Convert JSON object to tree structure
  const jsonToTree = (obj: any, key: string = 'root', level: number = 0): TreeNode => {
    const getType = (value: any): TreeNode['type'] => {
      if (value === null) return 'null';
      if (Array.isArray(value)) return 'array';
      if (typeof value === 'object') return 'object';
      return typeof value as TreeNode['type'];
    };

    const type = getType(obj);
    const node: TreeNode = {
      key,
      value: obj,
      type,
      level,
      isExpanded: level < 2 // Auto-expand first 2 levels
    };

    if (type === 'object' && obj !== null) {
      node.children = Object.entries(obj).map(([k, v]) => 
        jsonToTree(v, k, level + 1)
      );
    } else if (type === 'array') {
      node.children = obj.map((item: any, index: number) => 
        jsonToTree(item, `[${index}]`, level + 1)
      );
    }

    return node;
  };

  // Toggle tree node expansion
  const toggleNode = (path: string[], data: TreeNode[]): TreeNode[] => {
    return data.map(node => {
      if (path.length === 1 && node.key === path[0]) {
        return { ...node, isExpanded: !node.isExpanded };
      } else if (path.length > 1 && node.key === path[0] && node.children) {
        return {
          ...node,
          children: toggleNode(path.slice(1), node.children)
        };
      }
      return node;
    });
  };

  const handleToggle = (path: string[]) => {
    setTreeData(prev => toggleNode(path, prev));
  };

  // Generate example JSON
  const generateExampleJSON = () => {
    const examples = [
      // Example 1: User profile
      {
        user: {
          id: 12345,
          name: "John Doe",
          email: "john.doe@example.com",
          profile: {
            avatar: "https://example.com/avatar.jpg",
            bio: "Software developer passionate about clean code",
            location: "San Francisco, CA",
            website: "https://johndoe.dev"
          },
          preferences: {
            theme: "dark",
            notifications: {
              email: true,
              push: false,
              sms: true
            },
            privacy: {
              profileVisible: true,
              showEmail: false
            }
          },
          roles: ["user", "developer"],
          createdAt: "2023-01-15T10:30:00Z",
          lastLogin: "2024-01-15T14:22:33Z",
          isActive: true
        }
      },
      // Example 2: API response
      {
        status: "success",
        data: {
          products: [
            {
              id: "prod_001",
              name: "Wireless Headphones",
              price: 199.99,
              currency: "USD",
              category: "Electronics",
              tags: ["wireless", "bluetooth", "audio"],
              inStock: true,
              inventory: 45,
              ratings: {
                average: 4.5,
                count: 128,
                distribution: {
                  "5": 65,
                  "4": 42,
                  "3": 15,
                  "2": 4,
                  "1": 2
                }
              }
            },
            {
              id: "prod_002",
              name: "Smart Watch",
              price: 299.99,
              currency: "USD",
              category: "Wearables",
              tags: ["smartwatch", "fitness", "health"],
              inStock: false,
              inventory: 0,
              ratings: {
                average: 4.2,
                count: 89,
                distribution: {
                  "5": 38,
                  "4": 35,
                  "3": 12,
                  "2": 3,
                  "1": 1
                }
              }
            }
          ],
          pagination: {
            page: 1,
            limit: 10,
            total: 2,
            hasNext: false,
            hasPrev: false
          }
        },
        meta: {
          timestamp: "2024-01-15T16:45:22Z",
          version: "1.2.0",
          requestId: "req_abc123def456"
        }
      },
      // Example 3: Configuration object
      {
        app: {
          name: "DevTools Hub",
          version: "2.1.0",
          environment: "production",
          debug: false,
          features: {
            authentication: true,
            analytics: true,
            darkMode: true,
            notifications: false
          }
        },
        database: {
          host: "localhost",
          port: 5432,
          name: "devtools_db",
          ssl: true,
          poolSize: 10,
          timeout: 30000
        },
        cache: {
          provider: "redis",
          host: "cache.example.com",
          port: 6379,
          ttl: 3600,
          maxMemory: "256mb"
        },
        logging: {
          level: "info",
          format: "json",
          outputs: ["console", "file"],
          rotation: {
            enabled: true,
            maxSize: "100mb",
            maxFiles: 5
          }
        }
      },
      // Example 4: Complex nested structure
      {
        company: {
          name: "Tech Innovations Inc.",
          founded: 2015,
          headquarters: {
            address: {
              street: "123 Innovation Drive",
              city: "Silicon Valley",
              state: "CA",
              zipCode: "94000",
              country: "USA"
            },
            coordinates: {
              latitude: 37.4419,
              longitude: -122.1430
            }
          },
          departments: [
            {
              name: "Engineering",
              head: "Alice Johnson",
              employees: 45,
              budget: 2500000,
              teams: [
                {
                  name: "Frontend",
                  lead: "Bob Smith",
                  members: 12,
                  technologies: ["React", "TypeScript", "Next.js"]
                },
                {
                  name: "Backend",
                  lead: "Carol Davis",
                  members: 18,
                  technologies: ["Node.js", "Python", "PostgreSQL"]
                },
                {
                  name: "DevOps",
                  lead: "David Wilson",
                  members: 8,
                  technologies: ["Docker", "Kubernetes", "AWS"]
                }
              ]
            },
            {
              name: "Product",
              head: "Eve Brown",
              employees: 15,
              budget: 800000,
              teams: [
                {
                  name: "Design",
                  lead: "Frank Miller",
                  members: 8,
                  technologies: ["Figma", "Adobe Creative Suite"]
                },
                {
                  name: "Research",
                  lead: "Grace Lee",
                  members: 7,
                  technologies: ["Analytics", "User Testing"]
                }
              ]
            }
          ],
          financials: {
            revenue: {
              "2023": 15000000,
              "2022": 12000000,
              "2021": 8500000
            },
            expenses: {
              "2023": 11000000,
              "2022": 9500000,
              "2021": 7200000
            }
          }
        }
      }
    ];

    const randomExample = examples[Math.floor(Math.random() * examples.length)];
    setInput(JSON.stringify(randomExample, null, 2));
    toast.success('Example JSON generated!');
  };

  // Validate and process JSON
  useEffect(() => {
    if (!input.trim()) {
      setFormatted('');
      setMinified('');
      setTreeData([]);
      setValidation({ isValid: true });
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const formattedJson = JSON.stringify(parsed, null, 2);
      const minifiedJson = JSON.stringify(parsed);
      
      setFormatted(formattedJson);
      setMinified(minifiedJson);
      
      // Generate tree data
      const tree = jsonToTree(parsed);
      setTreeData([tree]);
      
      setValidation({ isValid: true });
    } catch (error) {
      setFormatted('');
      setMinified('');
      setTreeData([]);
      
      if (error instanceof SyntaxError) {
        // Try to extract line and column information
        const match = error.message.match(/at position (\d+)/);
        let lineNumber, columnNumber;
        
        if (match) {
          const position = parseInt(match[1]);
          const lines = input.substring(0, position).split('\n');
          lineNumber = lines.length;
          columnNumber = lines[lines.length - 1].length + 1;
        }
        
        setValidation({
          isValid: false,
          error: error.message,
          lineNumber,
          columnNumber
        });
      } else {
        setValidation({
          isValid: false,
          error: 'Unknown JSON parsing error'
        });
      }
    }
  }, [input]);

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
    url.searchParams.set('json', encodeForUrl(input));
    url.searchParams.set('mode', mode);
    url.searchParams.set('view', viewMode);
    
    navigator.clipboard.writeText(url.toString()).then(() => {
      toast.success('Shareable URL copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to create shareable URL');
    });
  };

  const downloadResult = () => {
    let content = '';
    let filename = '';
    
    switch (mode) {
      case 'format':
        content = formatted;
        filename = 'formatted.json';
        break;
      case 'minify':
        content = minified;
        filename = 'minified.json';
        break;
      case 'validate':
        content = JSON.stringify({
          isValid: validation.isValid,
          error: validation.error,
          lineNumber: validation.lineNumber,
          columnNumber: validation.columnNumber,
          validatedAt: new Date().toISOString()
        }, null, 2);
        filename = 'validation-result.json';
        break;
    }
    
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('File downloaded!');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setInput(text);
    };
    reader.readAsText(file);
  };

  const clearAll = () => {
    setInput('');
    setFormatted('');
    setMinified('');
    setTreeData([]);
    setValidation({ isValid: true });
    router.push('/tools/json');
  };

  const getOutput = () => {
    switch (mode) {
      case 'format':
        return formatted;
      case 'minify':
        return minified;
      case 'validate':
        return validation.isValid ? 'Valid JSON ✓' : `Invalid JSON: ${validation.error}`;
      default:
        return '';
    }
  };

  const getOutputPlaceholder = () => {
    switch (mode) {
      case 'format':
        return 'Formatted JSON will appear here...';
      case 'minify':
        return 'Minified JSON will appear here...';
      case 'validate':
        return 'Validation result will appear here...';
      default:
        return '';
    }
  };

  const getStats = () => {
    if (!validation.isValid) return null;
    
    try {
      const parsed = JSON.parse(input);
      const objectCount = JSON.stringify(parsed).split('{').length - 1;
      const arrayCount = JSON.stringify(parsed).split('[').length - 1;
      const stringCount = JSON.stringify(parsed).split('"').length / 2 - 1;
      
      return {
        objects: objectCount,
        arrays: arrayCount,
        strings: Math.floor(stringCount),
        originalSize: input.length,
        formattedSize: formatted.length,
        minifiedSize: minified.length
      };
    } catch {
      return null;
    }
  };

  const stats = getStats();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">JSON Tools</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Format, validate, and minify JSON data with tree view and detailed analysis.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <Card className="h-fit bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2 dark:text-white">
                <Braces className="h-5 w-5" />
                <span>JSON Input</span>
              </CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={generateExampleJSON}>
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
                  accept=".json,.txt"
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
              Paste your JSON data to format, validate, or minify
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={mode} onValueChange={(value) => setMode(value as 'format' | 'minify' | 'validate')}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="format" className="flex items-center space-x-2">
                  <Maximize className="h-4 w-4" />
                  <span>Format</span>
                </TabsTrigger>
                <TabsTrigger value="minify" className="flex items-center space-x-2">
                  <Minimize className="h-4 w-4" />
                  <span>Minify</span>
                </TabsTrigger>
                <TabsTrigger value="validate" className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Validate</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Textarea
              placeholder='{"name": "John", "age": 30, "city": "New York"}'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[300px] resize-none font-mono text-sm bg-white dark:bg-slate-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
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
              <CardTitle className="dark:text-white">
                {mode === 'format' && 'Formatted JSON'}
                {mode === 'minify' && 'Minified JSON'}
                {mode === 'validate' && 'Validation Result'}
              </CardTitle>
              <div className="flex space-x-2">
                {mode === 'format' && validation.isValid && (
                  <div className="flex space-x-1 border border-gray-200 dark:border-gray-700 rounded-md">
                    <Button
                      variant={viewMode === 'tree' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('tree')}
                      className="rounded-r-none"
                    >
                      <TreePine className="h-4 w-4 mr-2" />
                      Tree
                    </Button>
                    <Button
                      variant={viewMode === 'text' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('text')}
                      className="rounded-l-none"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Text
                    </Button>
                  </div>
                )}
                {getOutput() && (
                  <>
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
              {mode === 'format' && 'Pretty-printed JSON with proper indentation'}
              {mode === 'minify' && 'Compressed JSON with minimal whitespace'}
              {mode === 'validate' && 'JSON syntax validation and error reporting'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Validation Status */}
            {input && (
              <div className={`p-4 rounded-lg border ${
                validation.isValid 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              }`}>
                <div className="flex items-center space-x-2">
                  {validation.isValid ? (
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  )}
                  <span className={`font-medium ${
                    validation.isValid 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {validation.isValid ? 'Valid JSON' : 'Invalid JSON'}
                  </span>
                </div>
                {!validation.isValid && validation.error && (
                  <div className="mt-2">
                    <p className="text-red-600 dark:text-red-400 text-sm">{validation.error}</p>
                    {validation.lineNumber && validation.columnNumber && (
                      <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                        Line {validation.lineNumber}, Column {validation.columnNumber}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Output Content */}
            {mode === 'validate' ? (
              <div className="space-y-4">
                {validation.isValid && stats && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">Structure</h4>
                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex justify-between">
                          <span>Objects:</span>
                          <Badge variant="outline">{stats.objects}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Arrays:</span>
                          <Badge variant="outline">{stats.arrays}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Strings:</span>
                          <Badge variant="outline">{stats.strings}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">Size</h4>
                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex justify-between">
                          <span>Original:</span>
                          <Badge variant="outline">{stats.originalSize} chars</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Formatted:</span>
                          <Badge variant="outline">{stats.formattedSize} chars</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Minified:</span>
                          <Badge variant="outline">{stats.minifiedSize} chars</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : mode === 'format' && validation.isValid && viewMode === 'tree' && treeData.length > 0 ? (
              <JSONTreeView data={treeData} onToggle={handleToggle} />
            ) : (
              <Textarea
                placeholder={getOutputPlaceholder()}
                value={getOutput()}
                readOnly
                className="min-h-[300px] resize-none font-mono text-sm bg-gray-50 dark:bg-slate-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              />
            )}
            
            {getOutput() && mode !== 'validate' && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Characters: {getOutput().length}
                {stats && mode === 'minify' && (
                  <span className="ml-4">
                    Compression: {Math.round((1 - stats.minifiedSize / stats.originalSize) * 100)}%
                  </span>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Info Section */}
      <Card className="mt-8 bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">About JSON Tools</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <p className="text-gray-600 dark:text-gray-300">
            JSON (JavaScript Object Notation) is a lightweight data-interchange format that's easy for humans to read and write. 
            It's commonly used for APIs, configuration files, and data storage.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mt-6">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Formatting:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Pretty-print with proper indentation</li>
                <li>• Tree view for easy navigation</li>
                <li>• Improve readability</li>
                <li>• Easy debugging</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Tree View:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Expandable/collapsible nodes</li>
                <li>• Color-coded value types</li>
                <li>• Easy navigation of nested data</li>
                <li>• Copy always returns text format</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Validation:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Syntax error detection</li>
                <li>• Line and column reporting</li>
                <li>• Structure analysis</li>
                <li>• Size statistics</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function JSONPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div></div>}>
      <JSONTool />
    </Suspense>
  );
}