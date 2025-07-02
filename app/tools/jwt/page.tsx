'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Copy, Share2, RotateCcw, Download, Upload, Shuffle, AlertTriangle, CheckCircle, Clock, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface JWTHeader {
  alg?: string;
  typ?: string;
  kid?: string;
  [key: string]: any;
}

interface JWTPayload {
  iss?: string;
  sub?: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
  [key: string]: any;
}

interface DecodedJWT {
  header: JWTHeader;
  payload: JWTPayload;
  signature: string;
  isValid: boolean;
  isExpired: boolean;
  expiresIn?: string;
}

function JWTTool() {
  const [input, setInput] = useState('');
  const [decoded, setDecoded] = useState<DecodedJWT | null>(null);
  const [error, setError] = useState('');
  
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
    const urlInput = searchParams.get('token');
    if (urlInput) {
      const decodedInput = decodeFromUrl(urlInput);
      if (decodedInput) {
        setInput(decodedInput);
      }
    }
  }, [searchParams]);

  // Generate example JWT tokens
  const generateExampleJWT = () => {
    const examples = [
      // Example 1: Standard user token
      {
        header: { alg: "HS256", typ: "JWT" },
        payload: {
          sub: "1234567890",
          name: "John Doe",
          email: "john.doe@example.com",
          role: "user",
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24 hours
          iss: "devtools-hub.com",
          aud: "api.devtools-hub.com"
        }
      },
      // Example 2: Admin token with permissions
      {
        header: { alg: "RS256", typ: "JWT", kid: "key-1" },
        payload: {
          sub: "admin-user-456",
          name: "Jane Admin",
          email: "jane.admin@company.com",
          role: "admin",
          permissions: ["read", "write", "delete", "admin"],
          department: "Engineering",
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + (60 * 60 * 8), // 8 hours
          iss: "company-auth.com",
          aud: ["api.company.com", "admin.company.com"]
        }
      },
      // Example 3: API key token
      {
        header: { alg: "HS512", typ: "JWT" },
        payload: {
          sub: "api-key-789",
          client_id: "mobile-app-v2",
          scope: ["read:profile", "write:posts", "read:analytics"],
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30), // 30 days
          iss: "api-gateway.service.com",
          aud: "api.service.com",
          jti: "unique-token-id-" + Math.random().toString(36).substr(2, 9)
        }
      },
      // Example 4: Expired token
      {
        header: { alg: "HS256", typ: "JWT" },
        payload: {
          sub: "expired-user-123",
          name: "Test User",
          email: "test@example.com",
          iat: Math.floor(Date.now() / 1000) - (60 * 60 * 25), // 25 hours ago
          exp: Math.floor(Date.now() / 1000) - (60 * 60), // 1 hour ago (expired)
          iss: "test-service.com",
          aud: "test-api.com"
        }
      }
    ];

    const randomExample = examples[Math.floor(Math.random() * examples.length)];
    
    // Create a mock JWT (header.payload.signature format)
    const headerEncoded = btoa(JSON.stringify(randomExample.header));
    const payloadEncoded = btoa(JSON.stringify(randomExample.payload));
    const signature = btoa("mock-signature-" + Math.random().toString(36).substr(2, 20));
    
    const mockJWT = `${headerEncoded}.${payloadEncoded}.${signature}`;
    setInput(mockJWT);
    toast.success('Example JWT generated!');
  };

  // Decode JWT
  useEffect(() => {
    if (!input.trim()) {
      setDecoded(null);
      setError('');
      return;
    }

    try {
      const parts = input.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format. JWT must have 3 parts separated by dots.');
      }

      const [headerPart, payloadPart, signaturePart] = parts;

      // Decode header
      const headerDecoded = JSON.parse(atob(headerPart.replace(/-/g, '+').replace(/_/g, '/')));
      
      // Decode payload
      const payloadDecoded = JSON.parse(atob(payloadPart.replace(/-/g, '+').replace(/_/g, '/')));

      // Check if token is expired
      const now = Math.floor(Date.now() / 1000);
      const isExpired = payloadDecoded.exp ? payloadDecoded.exp < now : false;
      
      // Calculate time until expiration
      let expiresIn = '';
      if (payloadDecoded.exp) {
        const secondsUntilExp = payloadDecoded.exp - now;
        if (secondsUntilExp > 0) {
          const days = Math.floor(secondsUntilExp / (24 * 60 * 60));
          const hours = Math.floor((secondsUntilExp % (24 * 60 * 60)) / (60 * 60));
          const minutes = Math.floor((secondsUntilExp % (60 * 60)) / 60);
          
          if (days > 0) {
            expiresIn = `${days}d ${hours}h ${minutes}m`;
          } else if (hours > 0) {
            expiresIn = `${hours}h ${minutes}m`;
          } else {
            expiresIn = `${minutes}m`;
          }
        } else {
          const secondsSinceExp = Math.abs(secondsUntilExp);
          const days = Math.floor(secondsSinceExp / (24 * 60 * 60));
          const hours = Math.floor((secondsSinceExp % (24 * 60 * 60)) / (60 * 60));
          const minutes = Math.floor((secondsSinceExp % (60 * 60)) / 60);
          
          if (days > 0) {
            expiresIn = `Expired ${days}d ${hours}h ${minutes}m ago`;
          } else if (hours > 0) {
            expiresIn = `Expired ${hours}h ${minutes}m ago`;
          } else {
            expiresIn = `Expired ${minutes}m ago`;
          }
        }
      }

      setDecoded({
        header: headerDecoded,
        payload: payloadDecoded,
        signature: signaturePart,
        isValid: true,
        isExpired,
        expiresIn
      });
      setError('');
    } catch (err) {
      setError('Invalid JWT token. Please check the format and try again.');
      setDecoded(null);
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
    url.searchParams.set('token', encodeForUrl(input));
    
    navigator.clipboard.writeText(url.toString()).then(() => {
      toast.success('Shareable URL copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to create shareable URL');
    });
  };

  const downloadResult = () => {
    if (!decoded) return;
    
    const result = {
      header: decoded.header,
      payload: decoded.payload,
      signature: decoded.signature,
      metadata: {
        isValid: decoded.isValid,
        isExpired: decoded.isExpired,
        expiresIn: decoded.expiresIn,
        decodedAt: new Date().toISOString()
      }
    };
    
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jwt-decoded.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('JWT data downloaded!');
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
    setDecoded(null);
    setError('');
    router.push('/tools/jwt');
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const getAlgorithmColor = (alg: string) => {
    const colors: { [key: string]: string } = {
      'HS256': 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300',
      'HS384': 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300',
      'HS512': 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300',
      'RS256': 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300',
      'RS384': 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300',
      'RS512': 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300',
      'ES256': 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300',
      'ES384': 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300',
      'ES512': 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300',
    };
    return colors[alg] || 'bg-gray-100 dark:bg-gray-900/50 text-gray-700 dark:text-gray-300';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">JWT Decoder</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Decode and inspect JSON Web Tokens. Analyze headers, payloads, and verify token validity with shareable URLs.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <Card className="h-fit bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2 dark:text-white">
                <Shield className="h-5 w-5" />
                <span>JWT Token</span>
              </CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={generateExampleJWT}>
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
                  accept=".txt,.jwt"
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
              Paste your JWT token to decode and inspect its contents
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
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
              <CardTitle className="dark:text-white">Decoded JWT</CardTitle>
              <div className="flex space-x-2">
                {decoded && (
                  <Button variant="outline" size="sm" onClick={downloadResult}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                )}
              </div>
            </div>
            <CardDescription className="dark:text-gray-300">
              Decoded header, payload, and signature information
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  <p className="text-red-600 dark:text-red-400 text-sm font-medium">Invalid JWT Token</p>
                </div>
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</p>
              </div>
            ) : decoded ? (
              <div className="space-y-6">
                {/* Token Status */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 rounded-lg">
                  <div className="flex items-center space-x-2">
                    {decoded.isExpired ? (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    <span className={`font-medium ${decoded.isExpired ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                      {decoded.isExpired ? 'Token Expired' : 'Token Valid'}
                    </span>
                  </div>
                  {decoded.expiresIn && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="h-4 w-4" />
                      <span>{decoded.expiresIn}</span>
                    </div>
                  )}
                </div>

                <Tabs defaultValue="header" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="header">Header</TabsTrigger>
                    <TabsTrigger value="payload">Payload</TabsTrigger>
                    <TabsTrigger value="signature">Signature</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="header" className="space-y-4">
                    <div className="space-y-3">
                      {decoded.header.alg && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Algorithm:</span>
                          <Badge className={getAlgorithmColor(decoded.header.alg)}>
                            {decoded.header.alg}
                          </Badge>
                        </div>
                      )}
                      {decoded.header.typ && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Type:</span>
                          <Badge variant="outline">{decoded.header.typ}</Badge>
                        </div>
                      )}
                      {decoded.header.kid && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Key ID:</span>
                          <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{decoded.header.kid}</code>
                        </div>
                      )}
                    </div>
                    <Textarea
                      value={JSON.stringify(decoded.header, null, 2)}
                      readOnly
                      className="min-h-[150px] font-mono text-xs bg-gray-50 dark:bg-slate-900 border-gray-300 dark:border-gray-600"
                    />
                  </TabsContent>
                  
                  <TabsContent value="payload" className="space-y-4">
                    <div className="space-y-3">
                      {decoded.payload.iss && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Issuer:</span>
                          <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{decoded.payload.iss}</code>
                        </div>
                      )}
                      {decoded.payload.sub && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Subject:</span>
                          <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{decoded.payload.sub}</code>
                        </div>
                      )}
                      {decoded.payload.aud && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Audience:</span>
                          <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                            {Array.isArray(decoded.payload.aud) ? decoded.payload.aud.join(', ') : decoded.payload.aud}
                          </code>
                        </div>
                      )}
                      {decoded.payload.exp && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Expires:</span>
                          <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{formatTimestamp(decoded.payload.exp)}</code>
                        </div>
                      )}
                      {decoded.payload.iat && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Issued At:</span>
                          <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{formatTimestamp(decoded.payload.iat)}</code>
                        </div>
                      )}
                      {decoded.payload.nbf && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Not Before:</span>
                          <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{formatTimestamp(decoded.payload.nbf)}</code>
                        </div>
                      )}
                    </div>
                    <Textarea
                      value={JSON.stringify(decoded.payload, null, 2)}
                      readOnly
                      className="min-h-[200px] font-mono text-xs bg-gray-50 dark:bg-slate-900 border-gray-300 dark:border-gray-600"
                    />
                  </TabsContent>
                  
                  <TabsContent value="signature" className="space-y-4">
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                        <p className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">Signature Verification</p>
                      </div>
                      <p className="text-yellow-600 dark:text-yellow-400 text-sm mt-1">
                        Signature verification requires the secret key or public key and is not performed in this tool for security reasons.
                      </p>
                    </div>
                    <Textarea
                      value={decoded.signature}
                      readOnly
                      className="min-h-[100px] font-mono text-xs bg-gray-50 dark:bg-slate-900 border-gray-300 dark:border-gray-600"
                    />
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Paste a JWT token to see the decoded content</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Info Section */}
      <Card className="mt-8 bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">About JWT (JSON Web Tokens)</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <p className="text-gray-600 dark:text-gray-300">
            JSON Web Tokens (JWT) are a compact, URL-safe means of representing claims to be transferred between two parties. 
            JWTs are commonly used for authentication and information exchange in web applications.
          </p>
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">JWT Structure:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• <strong>Header:</strong> Contains algorithm and token type</li>
                <li>• <strong>Payload:</strong> Contains claims and user data</li>
                <li>• <strong>Signature:</strong> Verifies token authenticity</li>
                <li>• Format: header.payload.signature</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Common Claims:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• <strong>iss:</strong> Issuer of the token</li>
                <li>• <strong>sub:</strong> Subject (user ID)</li>
                <li>• <strong>aud:</strong> Intended audience</li>
                <li>• <strong>exp:</strong> Expiration time</li>
                <li>• <strong>iat:</strong> Issued at time</li>
                <li>• <strong>nbf:</strong> Not valid before time</li>
              </ul>
            </div>
          </div>
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Security Note:</h4>
            <p className="text-blue-800 dark:text-blue-300 text-sm">
              This tool only decodes JWT tokens and does not verify signatures. Never paste sensitive or production tokens into online tools. 
              All processing happens client-side for your security.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function JWTPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div></div>}>
      <JWTTool />
    </Suspense>
  );
}