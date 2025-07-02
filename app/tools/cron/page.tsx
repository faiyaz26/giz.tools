'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Copy, Share2, RotateCcw, Download, Shuffle, AlertTriangle, CheckCircle, Clock, Calendar, Info, Play } from 'lucide-react';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CronField {
  name: string;
  value: string;
  description: string;
  range: string;
  specialValues: string[];
}

interface CronParsed {
  isValid: boolean;
  error?: string;
  fields: CronField[];
  description: string;
  nextExecutions: Date[];
  frequency: string;
  timezone: string;
}

interface CronExample {
  expression: string;
  description: string;
  category: string;
}

function CronTool() {
  const [cronExpression, setCronExpression] = useState('0 9 * * 1-5');
  const [parsed, setParsed] = useState<CronParsed | null>(null);
  const [timezone, setTimezone] = useState('UTC');
  const [showNextExecutions, setShowNextExecutions] = useState(10);
  
  const searchParams = useSearchParams();
  const router = useRouter();

  const cronExamples: CronExample[] = [
    // Basic examples
    { expression: '0 9 * * *', description: 'Every day at 9:00 AM', category: 'Daily' },
    { expression: '0 9 * * 1-5', description: 'Every weekday at 9:00 AM', category: 'Daily' },
    { expression: '0 0 * * 0', description: 'Every Sunday at midnight', category: 'Weekly' },
    { expression: '0 0 1 * *', description: 'First day of every month at midnight', category: 'Monthly' },
    { expression: '0 0 1 1 *', description: 'Every January 1st at midnight', category: 'Yearly' },
    
    // Common intervals
    { expression: '*/5 * * * *', description: 'Every 5 minutes', category: 'Frequent' },
    { expression: '0 */2 * * *', description: 'Every 2 hours', category: 'Hourly' },
    { expression: '*/15 * * * *', description: 'Every 15 minutes', category: 'Frequent' },
    { expression: '0 */6 * * *', description: 'Every 6 hours', category: 'Hourly' },
    
    // Business hours
    { expression: '0 9-17 * * 1-5', description: 'Every hour from 9 AM to 5 PM, weekdays only', category: 'Business' },
    { expression: '0 12 * * 1-5', description: 'Every weekday at noon', category: 'Business' },
    { expression: '0 18 * * 5', description: 'Every Friday at 6:00 PM', category: 'Business' },
    
    // Maintenance windows
    { expression: '0 2 * * 0', description: 'Every Sunday at 2:00 AM (maintenance)', category: 'Maintenance' },
    { expression: '0 3 1 * *', description: 'First day of month at 3:00 AM', category: 'Maintenance' },
    { expression: '0 1 * * 6', description: 'Every Saturday at 1:00 AM', category: 'Maintenance' },
    
    // Complex examples
    { expression: '0 8,12,16 * * 1-5', description: 'At 8 AM, 12 PM, and 4 PM on weekdays', category: 'Complex' },
    { expression: '30 9 1,15 * *', description: 'At 9:30 AM on the 1st and 15th of every month', category: 'Complex' },
    { expression: '0 0 * * 1,3,5', description: 'Every Monday, Wednesday, and Friday at midnight', category: 'Complex' },
    { expression: '0 22 * * 1-5', description: 'Every weekday at 10:00 PM', category: 'Complex' },
  ];

  const timezones = [
    'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo', 'Asia/Shanghai',
    'Asia/Kolkata', 'Australia/Sydney', 'Pacific/Auckland'
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
    const urlExpression = searchParams.get('expression');
    const urlTimezone = searchParams.get('timezone');
    
    if (urlExpression) {
      const decodedExpression = decodeFromUrl(urlExpression);
      if (decodedExpression) {
        setCronExpression(decodedExpression);
      }
    }
    if (urlTimezone && timezones.includes(urlTimezone)) {
      setTimezone(urlTimezone);
    }
  }, [searchParams]);

  // Parse cron expression
  const parseCronExpression = (expression: string): CronParsed => {
    const parts = expression.trim().split(/\s+/);
    
    if (parts.length !== 5) {
      return {
        isValid: false,
        error: 'Cron expression must have exactly 5 fields (minute hour day month weekday)',
        fields: [],
        description: '',
        nextExecutions: [],
        frequency: '',
        timezone
      };
    }

    const [minute, hour, day, month, weekday] = parts;

    // Validate each field
    const fields: CronField[] = [
      {
        name: 'Minute',
        value: minute,
        description: parseField(minute, 'minute'),
        range: '0-59',
        specialValues: ['*', '*/n', 'n-m', 'n,m']
      },
      {
        name: 'Hour',
        value: hour,
        description: parseField(hour, 'hour'),
        range: '0-23',
        specialValues: ['*', '*/n', 'n-m', 'n,m']
      },
      {
        name: 'Day',
        value: day,
        description: parseField(day, 'day'),
        range: '1-31',
        specialValues: ['*', '*/n', 'n-m', 'n,m']
      },
      {
        name: 'Month',
        value: month,
        description: parseField(month, 'month'),
        range: '1-12',
        specialValues: ['*', '*/n', 'n-m', 'n,m', 'JAN-DEC']
      },
      {
        name: 'Weekday',
        value: weekday,
        description: parseField(weekday, 'weekday'),
        range: '0-7 (0,7=Sun)',
        specialValues: ['*', '*/n', 'n-m', 'n,m', 'SUN-SAT']
      }
    ];

    // Validate field values
    for (const field of fields) {
      if (!isValidField(field.value, field.name.toLowerCase())) {
        return {
          isValid: false,
          error: `Invalid ${field.name.toLowerCase()} value: ${field.value}`,
          fields,
          description: '',
          nextExecutions: [],
          frequency: '',
          timezone
        };
      }
    }

    const description = generateDescription(fields);
    const frequency = calculateFrequency(fields);
    const nextExecutions = calculateNextExecutions(expression, 10);

    return {
      isValid: true,
      fields,
      description,
      nextExecutions,
      frequency,
      timezone
    };
  };

  // Parse individual field
  const parseField = (value: string, fieldType: string): string => {
    if (value === '*') {
      return `Every ${fieldType}`;
    }

    if (value.includes('/')) {
      const [range, step] = value.split('/');
      if (range === '*') {
        return `Every ${step} ${fieldType}${step !== '1' ? 's' : ''}`;
      } else {
        return `Every ${step} ${fieldType}${step !== '1' ? 's' : ''} starting from ${range}`;
      }
    }

    if (value.includes('-')) {
      const [start, end] = value.split('-');
      return `From ${formatFieldValue(start, fieldType)} to ${formatFieldValue(end, fieldType)}`;
    }

    if (value.includes(',')) {
      const values = value.split(',');
      return `At ${values.map(v => formatFieldValue(v, fieldType)).join(', ')}`;
    }

    return `At ${formatFieldValue(value, fieldType)}`;
  };

  // Format field value for display
  const formatFieldValue = (value: string, fieldType: string): string => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    if (fieldType === 'month') {
      const monthNum = parseInt(value);
      if (monthNum >= 1 && monthNum <= 12) {
        return monthNames[monthNum - 1];
      }
      // Handle month names
      const monthIndex = monthNames.findIndex(m => m.toLowerCase() === value.toLowerCase());
      if (monthIndex !== -1) {
        return monthNames[monthIndex];
      }
    }

    if (fieldType === 'weekday') {
      const dayNum = parseInt(value);
      if (dayNum >= 0 && dayNum <= 7) {
        return dayNames[dayNum === 7 ? 0 : dayNum];
      }
      // Handle day names
      const dayIndex = dayNames.findIndex(d => d.toLowerCase() === value.toLowerCase());
      if (dayIndex !== -1) {
        return dayNames[dayIndex];
      }
    }

    if (fieldType === 'hour') {
      const hour = parseInt(value);
      if (hour >= 0 && hour <= 23) {
        return hour === 0 ? '12 AM' : hour <= 12 ? `${hour} AM` : `${hour - 12} PM`;
      }
    }

    return value;
  };

  // Validate field value
  const isValidField = (value: string, fieldType: string): boolean => {
    // Allow special characters
    if (value === '*') return true;
    
    // Handle step values
    if (value.includes('/')) {
      const [range, step] = value.split('/');
      if (!step || isNaN(parseInt(step))) return false;
      if (range !== '*' && !isValidField(range, fieldType)) return false;
      return true;
    }

    // Handle ranges
    if (value.includes('-')) {
      const [start, end] = value.split('-');
      return isValidField(start, fieldType) && isValidField(end, fieldType);
    }

    // Handle lists
    if (value.includes(',')) {
      return value.split(',').every(v => isValidField(v.trim(), fieldType));
    }

    // Validate numeric values
    const num = parseInt(value);
    if (isNaN(num)) {
      // Check for named values
      if (fieldType === 'month') {
        return ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
          .includes(value.toLowerCase());
      }
      if (fieldType === 'weekday') {
        return ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
          .includes(value.toLowerCase());
      }
      return false;
    }

    // Check ranges
    switch (fieldType) {
      case 'minute': return num >= 0 && num <= 59;
      case 'hour': return num >= 0 && num <= 23;
      case 'day': return num >= 1 && num <= 31;
      case 'month': return num >= 1 && num <= 12;
      case 'weekday': return num >= 0 && num <= 7;
      default: return false;
    }
  };

  // Generate human-readable description
  const generateDescription = (fields: CronField[]): string => {
    const [minute, hour, day, month, weekday] = fields;
    
    let description = 'Runs ';

    // Handle frequency
    if (minute.value.includes('/')) {
      const step = minute.value.split('/')[1];
      description += `every ${step} minute${step !== '1' ? 's' : ''}`;
    } else if (hour.value.includes('/')) {
      const step = hour.value.split('/')[1];
      description += `every ${step} hour${step !== '1' ? 's' : ''}`;
    } else if (day.value.includes('/')) {
      const step = day.value.split('/')[1];
      description += `every ${step} day${step !== '1' ? 's' : ''}`;
    } else {
      description += 'at ';
      
      // Time
      if (hour.value !== '*' || minute.value !== '*') {
        const hourDesc = hour.value === '*' ? 'every hour' : formatFieldValue(hour.value, 'hour');
        const minuteDesc = minute.value === '*' ? '' : `:${minute.value.padStart(2, '0')}`;
        description += `${hourDesc}${minuteDesc}`;
      }
    }

    // Day/weekday constraints
    if (weekday.value !== '*' && day.value !== '*') {
      description += ` on ${formatFieldValue(weekday.value, 'weekday')} and day ${day.value}`;
    } else if (weekday.value !== '*') {
      description += ` on ${weekday.description.toLowerCase().replace('at ', '')}`;
    } else if (day.value !== '*') {
      description += ` on ${day.description.toLowerCase().replace('at ', '')} of the month`;
    }

    // Month constraint
    if (month.value !== '*') {
      description += ` in ${month.description.toLowerCase().replace('at ', '')}`;
    }

    return description;
  };

  // Calculate frequency
  const calculateFrequency = (fields: CronField[]): string => {
    const [minute, hour, day, month, weekday] = fields;

    if (minute.value.includes('/')) {
      const step = parseInt(minute.value.split('/')[1]);
      return `Every ${step} minute${step !== 1 ? 's' : ''}`;
    }

    if (hour.value.includes('/')) {
      const step = parseInt(hour.value.split('/')[1]);
      return `Every ${step} hour${step !== 1 ? 's' : ''}`;
    }

    if (day.value.includes('/')) {
      const step = parseInt(day.value.split('/')[1]);
      return `Every ${step} day${step !== 1 ? 's' : ''}`;
    }

    if (weekday.value !== '*' && day.value === '*' && month.value === '*') {
      return 'Weekly';
    }

    if (day.value !== '*' && month.value === '*') {
      return 'Monthly';
    }

    if (month.value !== '*') {
      return 'Yearly';
    }

    if (hour.value !== '*' && minute.value !== '*') {
      return 'Daily';
    }

    return 'Custom';
  };

  // Calculate next execution times (simplified)
  const calculateNextExecutions = (expression: string, count: number): Date[] => {
    const executions: Date[] = [];
    const now = new Date();
    
    // This is a simplified calculation for demonstration
    // In a real implementation, you'd use a proper cron parser library
    const parts = expression.split(' ');
    const [minutePart, hourPart] = parts;

    for (let i = 0; i < count; i++) {
      const nextDate = new Date(now);
      nextDate.setDate(now.getDate() + i);
      
      // Set time based on cron expression (simplified)
      if (hourPart !== '*') {
        const hour = parseInt(hourPart);
        if (!isNaN(hour)) {
          nextDate.setHours(hour);
        }
      }
      
      if (minutePart !== '*') {
        const minute = parseInt(minutePart);
        if (!isNaN(minute)) {
          nextDate.setMinutes(minute);
        }
      }
      
      nextDate.setSeconds(0);
      nextDate.setMilliseconds(0);
      
      executions.push(nextDate);
    }

    return executions;
  };

  // Process cron expression
  useEffect(() => {
    if (!cronExpression.trim()) {
      setParsed(null);
      return;
    }

    const result = parseCronExpression(cronExpression);
    setParsed(result);
  }, [cronExpression, timezone]);

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
    url.searchParams.set('expression', encodeForUrl(cronExpression));
    url.searchParams.set('timezone', timezone);
    
    navigator.clipboard.writeText(url.toString()).then(() => {
      toast.success('Shareable URL copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to create shareable URL');
    });
  };

  const downloadResult = () => {
    const resultData = {
      expression: cronExpression,
      timezone,
      parsed,
      generatedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(resultData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cron-analysis.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Analysis downloaded!');
  };

  const loadExample = (example: CronExample) => {
    setCronExpression(example.expression);
    toast.success(`Example loaded: ${example.description}`);
  };

  const generateRandomExample = () => {
    const randomExample = cronExamples[Math.floor(Math.random() * cronExamples.length)];
    loadExample(randomExample);
  };

  const clearAll = () => {
    setCronExpression('');
    setParsed(null);
    router.push('/tools/cron');
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleString('en-US', {
      timeZone: timezone,
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getFrequencyColor = (frequency: string): string => {
    const colors: { [key: string]: string } = {
      'Custom': 'bg-gray-100 dark:bg-gray-900/50 text-gray-700 dark:text-gray-300',
      'Daily': 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300',
      'Weekly': 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300',
      'Monthly': 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300',
      'Yearly': 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300',
    };
    
    // Handle "Every X minutes/hours/days" patterns
    if (frequency.includes('minute')) {
      return 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300';
    }
    if (frequency.includes('hour')) {
      return 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300';
    }
    
    return colors[frequency] || colors['Custom'];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Cron Parser</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Parse and analyze cron expressions. Understand scheduling patterns and see next execution times.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Input Section */}
        <div className="lg:col-span-2">
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2 dark:text-white">
                  <Clock className="h-5 w-5" />
                  <span>Cron Expression</span>
                </CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={generateRandomExample}>
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
                Enter a cron expression to parse and analyze
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cron-input">Cron Expression</Label>
                <Input
                  id="cron-input"
                  placeholder="0 9 * * 1-5"
                  value={cronExpression}
                  onChange={(e) => setCronExpression(e.target.value)}
                  className="font-mono text-lg bg-white dark:bg-slate-900 border-gray-300 dark:border-gray-600"
                />
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Format: minute hour day month weekday
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz} value={tz}>
                          {tz}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="executions">Next Executions</Label>
                  <Select value={showNextExecutions.toString()} onValueChange={(value) => setShowNextExecutions(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Quick Actions */}
              {cronExpression && (
                <div className="flex space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(cronExpression)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={shareResult}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  {parsed && (
                    <Button variant="outline" size="sm" onClick={downloadResult}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Examples Sidebar */}
        <div className="space-y-6">
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 dark:text-white">
                <Play className="h-5 w-5" />
                <span>Quick Examples</span>
              </CardTitle>
              <CardDescription className="dark:text-gray-300">
                Click to load common cron patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="daily" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="daily" className="text-xs">Daily</TabsTrigger>
                  <TabsTrigger value="business" className="text-xs">Business</TabsTrigger>
                  <TabsTrigger value="complex" className="text-xs">Complex</TabsTrigger>
                </TabsList>
                
                <TabsContent value="daily" className="space-y-2 max-h-[300px] overflow-y-auto">
                  {cronExamples.filter(ex => ex.category === 'Daily' || ex.category === 'Weekly' || ex.category === 'Monthly').map((example, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 dark:bg-slate-900 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                      onClick={() => loadExample(example)}
                    >
                      <div className="font-mono text-sm text-blue-600 dark:text-blue-400 mb-1">
                        {example.expression}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {example.description}
                      </div>
                    </div>
                  ))}
                </TabsContent>
                
                <TabsContent value="business" className="space-y-2 max-h-[300px] overflow-y-auto">
                  {cronExamples.filter(ex => ex.category === 'Business' || ex.category === 'Maintenance').map((example, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 dark:bg-slate-900 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                      onClick={() => loadExample(example)}
                    >
                      <div className="font-mono text-sm text-blue-600 dark:text-blue-400 mb-1">
                        {example.expression}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {example.description}
                      </div>
                    </div>
                  ))}
                </TabsContent>
                
                <TabsContent value="complex" className="space-y-2 max-h-[300px] overflow-y-auto">
                  {cronExamples.filter(ex => ex.category === 'Complex' || ex.category === 'Frequent').map((example, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 dark:bg-slate-900 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                      onClick={() => loadExample(example)}
                    >
                      <div className="font-mono text-sm text-blue-600 dark:text-blue-400 mb-1">
                        {example.expression}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {example.description}
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Results */}
      {parsed && (
        <div className="mt-8 space-y-6">
          {/* Status and Description */}
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="dark:text-white">Analysis Result</CardTitle>
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                  parsed.isValid 
                    ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                    : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
                }`}>
                  {parsed.isValid ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium">
                    {parsed.isValid ? 'Valid Expression' : 'Invalid Expression'}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {parsed.isValid ? (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Description:</h4>
                    <p className="text-blue-800 dark:text-blue-300">{parsed.description}</p>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Frequency:</span>
                      <Badge className={getFrequencyColor(parsed.frequency)}>
                        {parsed.frequency}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Timezone:</span>
                      <Badge variant="outline">{parsed.timezone}</Badge>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    <h4 className="font-semibold text-red-900 dark:text-red-300">Error:</h4>
                  </div>
                  <p className="text-red-800 dark:text-red-300 mt-1">{parsed.error}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Field Breakdown */}
          {parsed.isValid && (
            <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Field Breakdown</CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Detailed analysis of each cron field
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {parsed.fields.map((field, index) => (
                    <div key={index} className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline">{field.name}</Badge>
                          <code className="text-sm bg-white dark:bg-slate-800 px-2 py-1 rounded border font-mono">
                            {field.value}
                          </code>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Range: {field.range}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        {field.description}
                      </p>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Special values: {field.specialValues.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Next Executions */}
          {parsed.isValid && parsed.nextExecutions.length > 0 && (
            <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 dark:text-white">
                  <Calendar className="h-5 w-5" />
                  <span>Next {showNextExecutions} Executions</span>
                </CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Upcoming execution times in {timezone} timezone
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 max-h-[400px] overflow-y-auto">
                  {parsed.nextExecutions.slice(0, showNextExecutions).map((date, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className="w-8 h-6 flex items-center justify-center text-xs">
                          {index + 1}
                        </Badge>
                        <span className="font-mono text-sm">{formatDate(date)}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(date.toISOString())}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Info Section */}
      <Card className="mt-8 bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 dark:text-white">
            <Info className="h-5 w-5" />
            <span>About Cron Expressions</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <p className="text-gray-600 dark:text-gray-300">
            Cron expressions are used to schedule tasks in Unix-like operating systems. 
            They consist of five fields representing minute, hour, day of month, month, and day of week.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mt-6">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Field Format:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• <code>*</code> - Any value</li>
                <li>• <code>*/n</code> - Every n units</li>
                <li>• <code>n-m</code> - Range from n to m</li>
                <li>• <code>n,m</code> - Specific values</li>
                <li>• <code>@yearly</code> - Special strings</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Field Ranges:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• <strong>Minute:</strong> 0-59</li>
                <li>• <strong>Hour:</strong> 0-23</li>
                <li>• <strong>Day:</strong> 1-31</li>
                <li>• <strong>Month:</strong> 1-12 or JAN-DEC</li>
                <li>• <strong>Weekday:</strong> 0-7 or SUN-SAT</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Common Examples:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• <code>0 0 * * *</code> - Daily at midnight</li>
                <li>• <code>0 9 * * 1-5</code> - Weekdays at 9 AM</li>
                <li>• <code>*/15 * * * *</code> - Every 15 minutes</li>
                <li>• <code>0 0 1 * *</code> - First of month</li>
              </ul>
            </div>
          </div>
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Note:</h4>
            <p className="text-blue-800 dark:text-blue-300 text-sm">
              This tool provides a simplified cron parser for educational purposes. 
              For production use, always test your cron expressions in your target environment.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CronPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div></div>}>
      <CronTool />
    </Suspense>
  );
}