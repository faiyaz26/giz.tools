'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Copy, Share2, RotateCcw, Download, Clock, Calendar, RefreshCw, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';

interface TimestampData {
  timestamp: number;
  humanReadable: {
    local: string;
    utc: string;
    iso: string;
    relative: string;
  };
  breakdown: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
    dayOfWeek: string;
    dayOfYear: number;
    weekOfYear: number;
  };
}

function UnixTool() {
  const [currentTimestamp, setCurrentTimestamp] = useState<TimestampData | null>(null);
  const [inputTimestamp, setInputTimestamp] = useState('');
  const [convertedFromTimestamp, setConvertedFromTimestamp] = useState<TimestampData | null>(null);
  const [inputDate, setInputDate] = useState('');
  const [inputTime, setInputTime] = useState('');
  const [convertedToTimestamp, setConvertedToTimestamp] = useState<number | null>(null);
  const [timestampError, setTimestampError] = useState('');
  const [dateError, setDateError] = useState('');
  
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
    const urlTimestamp = searchParams.get('timestamp');
    const urlDate = searchParams.get('date');
    const urlTime = searchParams.get('time');
    
    if (urlTimestamp) {
      const decodedTimestamp = decodeFromUrl(urlTimestamp);
      if (decodedTimestamp) {
        setInputTimestamp(decodedTimestamp);
      }
    }
    if (urlDate) {
      const decodedDate = decodeFromUrl(urlDate);
      if (decodedDate) {
        setInputDate(decodedDate);
      }
    }
    if (urlTime) {
      const decodedTime = decodeFromUrl(urlTime);
      if (decodedTime) {
        setInputTime(decodedTime);
      }
    }
  }, [searchParams]);

  // Generate timestamp data from a given timestamp
  const generateTimestampData = (timestamp: number): TimestampData => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    
    // Calculate relative time
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    let relative = '';
    if (Math.abs(diffYears) >= 1) {
      relative = diffYears > 0 ? `${diffYears} year${diffYears !== 1 ? 's' : ''} ago` : `in ${Math.abs(diffYears)} year${Math.abs(diffYears) !== 1 ? 's' : ''}`;
    } else if (Math.abs(diffMonths) >= 1) {
      relative = diffMonths > 0 ? `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago` : `in ${Math.abs(diffMonths)} month${Math.abs(diffMonths) !== 1 ? 's' : ''}`;
    } else if (Math.abs(diffWeeks) >= 1) {
      relative = diffWeeks > 0 ? `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago` : `in ${Math.abs(diffWeeks)} week${Math.abs(diffWeeks) !== 1 ? 's' : ''}`;
    } else if (Math.abs(diffDays) >= 1) {
      relative = diffDays > 0 ? `${diffDays} day${diffDays !== 1 ? 's' : ''} ago` : `in ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`;
    } else if (Math.abs(diffHours) >= 1) {
      relative = diffHours > 0 ? `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago` : `in ${Math.abs(diffHours)} hour${Math.abs(diffHours) !== 1 ? 's' : ''}`;
    } else if (Math.abs(diffMinutes) >= 1) {
      relative = diffMinutes > 0 ? `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago` : `in ${Math.abs(diffMinutes)} minute${Math.abs(diffMinutes) !== 1 ? 's' : ''}`;
    } else {
      relative = 'just now';
    }

    // Calculate day of year
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

    // Calculate week of year
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const weekOfYear = Math.ceil(((date.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);

    return {
      timestamp,
      humanReadable: {
        local: date.toLocaleString(),
        utc: date.toUTCString(),
        iso: date.toISOString(),
        relative
      },
      breakdown: {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
        hour: date.getHours(),
        minute: date.getMinutes(),
        second: date.getSeconds(),
        dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'long' }),
        dayOfYear,
        weekOfYear
      }
    };
  };

  // Update current timestamp every second
  useEffect(() => {
    const updateCurrentTimestamp = () => {
      const now = Math.floor(Date.now() / 1000);
      setCurrentTimestamp(generateTimestampData(now));
    };

    updateCurrentTimestamp();
    const interval = setInterval(updateCurrentTimestamp, 1000);

    return () => clearInterval(interval);
  }, []);

  // Convert timestamp to human readable
  useEffect(() => {
    if (!inputTimestamp.trim()) {
      setConvertedFromTimestamp(null);
      setTimestampError('');
      return;
    }

    try {
      const timestamp = parseInt(inputTimestamp);
      
      if (isNaN(timestamp)) {
        throw new Error('Invalid timestamp format');
      }

      // Handle both seconds and milliseconds
      let normalizedTimestamp = timestamp;
      if (timestamp.toString().length === 13) {
        // Milliseconds
        normalizedTimestamp = Math.floor(timestamp / 1000);
      } else if (timestamp.toString().length !== 10) {
        throw new Error('Timestamp must be 10 digits (seconds) or 13 digits (milliseconds)');
      }

      // Validate reasonable timestamp range (1970 to 2100)
      if (normalizedTimestamp < 0 || normalizedTimestamp > 4102444800) {
        throw new Error('Timestamp out of reasonable range');
      }

      setConvertedFromTimestamp(generateTimestampData(normalizedTimestamp));
      setTimestampError('');
    } catch (error) {
      setTimestampError(error instanceof Error ? error.message : 'Invalid timestamp');
      setConvertedFromTimestamp(null);
    }
  }, [inputTimestamp]);

  // Convert date/time to timestamp
  useEffect(() => {
    if (!inputDate.trim() && !inputTime.trim()) {
      setConvertedToTimestamp(null);
      setDateError('');
      return;
    }

    try {
      let dateTimeString = '';
      
      if (inputDate && inputTime) {
        dateTimeString = `${inputDate}T${inputTime}`;
      } else if (inputDate) {
        dateTimeString = `${inputDate}T00:00:00`;
      } else {
        throw new Error('Date is required');
      }

      const date = new Date(dateTimeString);
      
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date/time format');
      }

      setConvertedToTimestamp(Math.floor(date.getTime() / 1000));
      setDateError('');
    } catch (error) {
      setDateError(error instanceof Error ? error.message : 'Invalid date/time');
      setConvertedToTimestamp(null);
    }
  }, [inputDate, inputTime]);

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
    if (inputTimestamp) url.searchParams.set('timestamp', encodeForUrl(inputTimestamp));
    if (inputDate) url.searchParams.set('date', encodeForUrl(inputDate));
    if (inputTime) url.searchParams.set('time', encodeForUrl(inputTime));
    
    navigator.clipboard.writeText(url.toString()).then(() => {
      toast.success('Shareable URL copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to create shareable URL');
    });
  };

  const downloadResult = () => {
    const resultData = {
      currentTimestamp,
      conversions: {
        fromTimestamp: convertedFromTimestamp,
        toTimestamp: convertedToTimestamp
      },
      inputs: {
        timestamp: inputTimestamp,
        date: inputDate,
        time: inputTime
      },
      generatedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(resultData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'unix-conversion-result.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Conversion result downloaded!');
  };

  const clearAll = () => {
    setInputTimestamp('');
    setInputDate('');
    setInputTime('');
    setConvertedFromTimestamp(null);
    setConvertedToTimestamp(null);
    setTimestampError('');
    setDateError('');
    router.push('/tools/unix');
  };

  const setCurrentAsInput = () => {
    if (currentTimestamp) {
      setInputTimestamp(currentTimestamp.timestamp.toString());
    }
  };

  const setNowAsDate = () => {
    const now = new Date();
    setInputDate(now.toISOString().split('T')[0]);
    setInputTime(now.toTimeString().split(' ')[0].slice(0, 5));
  };

  const generateExampleTimestamps = () => {
    const examples = [
      { name: 'Unix Epoch Start', timestamp: 0 },
      { name: 'Y2K', timestamp: 946684800 },
      { name: 'iPhone Launch', timestamp: 1183248000 },
      { name: 'Bitcoin Genesis', timestamp: 1231006505 },
      { name: 'COVID-19 WHO Declaration', timestamp: 1583971200 },
      { name: 'Current Time', timestamp: Math.floor(Date.now() / 1000) }
    ];

    const randomExample = examples[Math.floor(Math.random() * examples.length)];
    setInputTimestamp(randomExample.timestamp.toString());
    toast.success(`Example loaded: ${randomExample.name}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Unix Timestamp Tool</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Convert between Unix timestamps and human-readable dates. View current timestamp and perform bidirectional conversions.
        </p>
      </div>

      {/* Current Timestamp Display */}
      <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2 dark:text-white">
              <Clock className="h-5 w-5" />
              <span>Current Unix Timestamp</span>
            </CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={setCurrentAsInput}>
                <Zap className="h-4 w-4 mr-2" />
                Use Current
              </Button>
              <Button variant="outline" size="sm" onClick={() => currentTimestamp && copyToClipboard(currentTimestamp.timestamp.toString())}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
          </div>
          <CardDescription className="dark:text-gray-300">
            Live Unix timestamp updating every second
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentTimestamp && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="text-3xl font-mono font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {currentTimestamp.timestamp}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Unix Timestamp (seconds)
                  </div>
                </div>
                <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="text-lg font-mono font-semibold text-purple-600 dark:text-purple-400 mb-1">
                    {currentTimestamp.timestamp * 1000}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Milliseconds
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Local Time</div>
                  <div className="font-mono text-sm">{currentTimestamp.humanReadable.local}</div>
                </div>
                <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">UTC</div>
                  <div className="font-mono text-sm">{currentTimestamp.humanReadable.utc}</div>
                </div>
                <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">ISO 8601</div>
                  <div className="font-mono text-sm">{currentTimestamp.humanReadable.iso}</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Timestamp to Date Converter */}
        <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2 dark:text-white">
                <RefreshCw className="h-5 w-5" />
                <span>Timestamp to Date</span>
              </CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={generateExampleTimestamps}>
                  <Clock className="h-4 w-4 mr-2" />
                  Example
                </Button>
                <Button variant="outline" size="sm" onClick={clearAll}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            </div>
            <CardDescription className="dark:text-gray-300">
              Convert Unix timestamp to human-readable date
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="timestamp-input">Unix Timestamp</Label>
              <Input
                id="timestamp-input"
                placeholder="1640995200 (seconds) or 1640995200000 (milliseconds)"
                value={inputTimestamp}
                onChange={(e) => setInputTimestamp(e.target.value)}
                className="font-mono bg-white dark:bg-slate-900 border-gray-300 dark:border-gray-600"
              />
              {timestampError && (
                <div className="text-red-600 dark:text-red-400 text-sm">{timestampError}</div>
              )}
            </div>

            {convertedFromTimestamp && (
              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900 dark:text-white">Converted Date</h4>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(convertedFromTimestamp.humanReadable.iso)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy ISO
                  </Button>
                </div>

                <Tabs defaultValue="formats" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="formats">Formats</TabsTrigger>
                    <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="formats" className="space-y-3">
                    <div className="space-y-2">
                      <div className="p-3 bg-gray-50 dark:bg-slate-900 rounded-lg">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Local Time</div>
                        <div className="font-mono text-sm">{convertedFromTimestamp.humanReadable.local}</div>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-slate-900 rounded-lg">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">UTC</div>
                        <div className="font-mono text-sm">{convertedFromTimestamp.humanReadable.utc}</div>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-slate-900 rounded-lg">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">ISO 8601</div>
                        <div className="font-mono text-sm">{convertedFromTimestamp.humanReadable.iso}</div>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-slate-900 rounded-lg">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Relative</div>
                        <div className="font-mono text-sm">{convertedFromTimestamp.humanReadable.relative}</div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="breakdown" className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-50 dark:bg-slate-900 rounded-lg">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Year</div>
                        <div className="font-mono font-semibold">{convertedFromTimestamp.breakdown.year}</div>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-slate-900 rounded-lg">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Month</div>
                        <div className="font-mono font-semibold">{convertedFromTimestamp.breakdown.month}</div>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-slate-900 rounded-lg">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Day</div>
                        <div className="font-mono font-semibold">{convertedFromTimestamp.breakdown.day}</div>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-slate-900 rounded-lg">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Hour</div>
                        <div className="font-mono font-semibold">{convertedFromTimestamp.breakdown.hour}</div>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-slate-900 rounded-lg">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Minute</div>
                        <div className="font-mono font-semibold">{convertedFromTimestamp.breakdown.minute}</div>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-slate-900 rounded-lg">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Second</div>
                        <div className="font-mono font-semibold">{convertedFromTimestamp.breakdown.second}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="p-3 bg-gray-50 dark:bg-slate-900 rounded-lg">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Day of Week</div>
                        <div className="font-mono font-semibold">{convertedFromTimestamp.breakdown.dayOfWeek}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-gray-50 dark:bg-slate-900 rounded-lg">
                          <div className="text-xs text-gray-500 dark:text-gray-400">Day of Year</div>
                          <div className="font-mono font-semibold">{convertedFromTimestamp.breakdown.dayOfYear}</div>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-slate-900 rounded-lg">
                          <div className="text-xs text-gray-500 dark:text-gray-400">Week of Year</div>
                          <div className="font-mono font-semibold">{convertedFromTimestamp.breakdown.weekOfYear}</div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Date to Timestamp Converter */}
        <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2 dark:text-white">
                <Calendar className="h-5 w-5" />
                <span>Date to Timestamp</span>
              </CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={setNowAsDate}>
                  <Clock className="h-4 w-4 mr-2" />
                  Now
                </Button>
                {(convertedToTimestamp || convertedFromTimestamp) && (
                  <Button variant="outline" size="sm" onClick={shareResult}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                )}
              </div>
            </div>
            <CardDescription className="dark:text-gray-300">
              Convert human-readable date to Unix timestamp
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date-input">Date</Label>
                <Input
                  id="date-input"
                  type="date"
                  value={inputDate}
                  onChange={(e) => setInputDate(e.target.value)}
                  className="bg-white dark:bg-slate-900 border-gray-300 dark:border-gray-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time-input">Time (optional)</Label>
                <Input
                  id="time-input"
                  type="time"
                  value={inputTime}
                  onChange={(e) => setInputTime(e.target.value)}
                  className="bg-white dark:bg-slate-900 border-gray-300 dark:border-gray-600"
                />
              </div>
            </div>
            
            {dateError && (
              <div className="text-red-600 dark:text-red-400 text-sm">{dateError}</div>
            )}

            {convertedToTimestamp !== null && (
              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900 dark:text-white">Converted Timestamp</h4>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(convertedToTimestamp.toString())}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadResult}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Unix Timestamp (seconds)</div>
                    <div className="text-2xl font-mono font-bold text-blue-600 dark:text-blue-400">
                      {convertedToTimestamp}
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Milliseconds</div>
                    <div className="text-lg font-mono font-semibold text-purple-600 dark:text-purple-400">
                      {convertedToTimestamp * 1000}
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">ISO 8601</div>
                    <div className="font-mono text-sm">{new Date(convertedToTimestamp * 1000).toISOString()}</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Info Section */}
      <Card className="mt-8 bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">About Unix Timestamps</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <p className="text-gray-600 dark:text-gray-300">
            Unix timestamp (also known as Epoch time) is a system for describing a point in time. 
            It represents the number of seconds that have elapsed since January 1, 1970, 00:00:00 UTC.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mt-6">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Common Uses:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Database timestamps</li>
                <li>• API responses</li>
                <li>• Log files</li>
                <li>• System scheduling</li>
                <li>• File metadata</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Formats:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• <strong>Seconds:</strong> 10 digits (1640995200)</li>
                <li>• <strong>Milliseconds:</strong> 13 digits (1640995200000)</li>
                <li>• <strong>ISO 8601:</strong> 2022-01-01T00:00:00.000Z</li>
                <li>• <strong>Human readable:</strong> Jan 1, 2022</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Key Facts:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Epoch: January 1, 1970 UTC</li>
                <li>• Timezone independent</li>
                <li>• Always in UTC</li>
                <li>• 32-bit limit: 2038-01-19</li>
                <li>• 64-bit safe until year 292 billion</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function UnixPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div></div>}>
      <UnixTool />
    </Suspense>
  );
}