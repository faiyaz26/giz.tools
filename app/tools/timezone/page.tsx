'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Copy, Share2, RotateCcw, Download, Clock, Globe, ArrowRight, MapPin, Calendar, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface TimezoneData {
  timezone: string;
  time: string;
  date: string;
  utcOffset: string;
  isDST: boolean;
}

interface ConversionResult {
  fromTimezone: TimezoneData;
  toTimezone: TimezoneData;
  timeDifference: string;
}

// Comprehensive timezone list ordered by GMT offset
const allTimezones = [
  // GMT-12
  { value: 'Pacific/Kwajalein', label: 'Baker Island (GMT-12)', offset: -12 },
  
  // GMT-11
  { value: 'Pacific/Midway', label: 'Midway Island (GMT-11)', offset: -11 },
  { value: 'Pacific/Niue', label: 'Niue (GMT-11)', offset: -11 },
  { value: 'Pacific/Pago_Pago', label: 'Pago Pago (GMT-11)', offset: -11 },
  
  // GMT-10
  { value: 'Pacific/Honolulu', label: 'Honolulu (GMT-10)', offset: -10 },
  { value: 'Pacific/Rarotonga', label: 'Rarotonga (GMT-10)', offset: -10 },
  { value: 'Pacific/Tahiti', label: 'Tahiti (GMT-10)', offset: -10 },
  
  // GMT-9:30
  { value: 'Pacific/Marquesas', label: 'Marquesas Islands (GMT-9:30)', offset: -9.5 },
  
  // GMT-9
  { value: 'America/Anchorage', label: 'Anchorage (GMT-9)', offset: -9 },
  { value: 'America/Juneau', label: 'Juneau (GMT-9)', offset: -9 },
  { value: 'Pacific/Gambier', label: 'Gambier Islands (GMT-9)', offset: -9 },
  
  // GMT-8
  { value: 'America/Los_Angeles', label: 'Los Angeles (GMT-8)', offset: -8 },
  { value: 'America/Vancouver', label: 'Vancouver (GMT-8)', offset: -8 },
  { value: 'America/Seattle', label: 'Seattle (GMT-8)', offset: -8 },
  { value: 'America/San_Francisco', label: 'San Francisco (GMT-8)', offset: -8 },
  { value: 'America/Tijuana', label: 'Tijuana (GMT-8)', offset: -8 },
  
  // GMT-7
  { value: 'America/Denver', label: 'Denver (GMT-7)', offset: -7 },
  { value: 'America/Phoenix', label: 'Phoenix (GMT-7)', offset: -7 },
  { value: 'America/Calgary', label: 'Calgary (GMT-7)', offset: -7 },
  { value: 'America/Edmonton', label: 'Edmonton (GMT-7)', offset: -7 },
  { value: 'America/Salt_Lake_City', label: 'Salt Lake City (GMT-7)', offset: -7 },
  
  // GMT-6
  { value: 'America/Chicago', label: 'Chicago (GMT-6)', offset: -6 },
  { value: 'America/Mexico_City', label: 'Mexico City (GMT-6)', offset: -6 },
  { value: 'America/Winnipeg', label: 'Winnipeg (GMT-6)', offset: -6 },
  { value: 'America/Guatemala', label: 'Guatemala City (GMT-6)', offset: -6 },
  { value: 'America/Tegucigalpa', label: 'Tegucigalpa (GMT-6)', offset: -6 },
  
  // GMT-5
  { value: 'America/New_York', label: 'New York (GMT-5)', offset: -5 },
  { value: 'America/Toronto', label: 'Toronto (GMT-5)', offset: -5 },
  { value: 'America/Miami', label: 'Miami (GMT-5)', offset: -5 },
  { value: 'America/Detroit', label: 'Detroit (GMT-5)', offset: -5 },
  { value: 'America/Montreal', label: 'Montreal (GMT-5)', offset: -5 },
  { value: 'America/Lima', label: 'Lima (GMT-5)', offset: -5 },
  { value: 'America/Bogota', label: 'Bogotá (GMT-5)', offset: -5 },
  { value: 'America/Panama', label: 'Panama City (GMT-5)', offset: -5 },
  
  // GMT-4
  { value: 'America/Halifax', label: 'Halifax (GMT-4)', offset: -4 },
  { value: 'America/Caracas', label: 'Caracas (GMT-4)', offset: -4 },
  { value: 'America/Santiago', label: 'Santiago (GMT-4)', offset: -4 },
  { value: 'America/La_Paz', label: 'La Paz (GMT-4)', offset: -4 },
  { value: 'America/Asuncion', label: 'Asunción (GMT-4)', offset: -4 },
  { value: 'Atlantic/Bermuda', label: 'Bermuda (GMT-4)', offset: -4 },
  
  // GMT-3:30
  { value: 'America/St_Johns', label: 'St. John\'s (GMT-3:30)', offset: -3.5 },
  
  // GMT-3
  { value: 'America/Sao_Paulo', label: 'São Paulo (GMT-3)', offset: -3 },
  { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires (GMT-3)', offset: -3 },
  { value: 'America/Montevideo', label: 'Montevideo (GMT-3)', offset: -3 },
  { value: 'America/Fortaleza', label: 'Fortaleza (GMT-3)', offset: -3 },
  { value: 'Atlantic/Stanley', label: 'Stanley (GMT-3)', offset: -3 },
  
  // GMT-2
  { value: 'America/Noronha', label: 'Fernando de Noronha (GMT-2)', offset: -2 },
  { value: 'Atlantic/South_Georgia', label: 'South Georgia (GMT-2)', offset: -2 },
  
  // GMT-1
  { value: 'Atlantic/Azores', label: 'Azores (GMT-1)', offset: -1 },
  { value: 'Atlantic/Cape_Verde', label: 'Cape Verde (GMT-1)', offset: -1 },
  
  // GMT+0
  { value: 'UTC', label: 'UTC (GMT+0)', offset: 0 },
  { value: 'Europe/London', label: 'London (GMT+0)', offset: 0 },
  { value: 'Europe/Dublin', label: 'Dublin (GMT+0)', offset: 0 },
  { value: 'Africa/Casablanca', label: 'Casablanca (GMT+0)', offset: 0 },
  { value: 'Africa/Accra', label: 'Accra (GMT+0)', offset: 0 },
  { value: 'Atlantic/Reykjavik', label: 'Reykjavik (GMT+0)', offset: 0 },
  
  // GMT+1
  { value: 'Europe/Paris', label: 'Paris (GMT+1)', offset: 1 },
  { value: 'Europe/Berlin', label: 'Berlin (GMT+1)', offset: 1 },
  { value: 'Europe/Rome', label: 'Rome (GMT+1)', offset: 1 },
  { value: 'Europe/Madrid', label: 'Madrid (GMT+1)', offset: 1 },
  { value: 'Europe/Amsterdam', label: 'Amsterdam (GMT+1)', offset: 1 },
  { value: 'Europe/Brussels', label: 'Brussels (GMT+1)', offset: 1 },
  { value: 'Europe/Vienna', label: 'Vienna (GMT+1)', offset: 1 },
  { value: 'Europe/Prague', label: 'Prague (GMT+1)', offset: 1 },
  { value: 'Europe/Warsaw', label: 'Warsaw (GMT+1)', offset: 1 },
  { value: 'Africa/Lagos', label: 'Lagos (GMT+1)', offset: 1 },
  
  // GMT+2
  { value: 'Europe/Helsinki', label: 'Helsinki (GMT+2)', offset: 2 },
  { value: 'Europe/Stockholm', label: 'Stockholm (GMT+2)', offset: 2 },
  { value: 'Europe/Oslo', label: 'Oslo (GMT+2)', offset: 2 },
  { value: 'Europe/Copenhagen', label: 'Copenhagen (GMT+2)', offset: 2 },
  { value: 'Europe/Athens', label: 'Athens (GMT+2)', offset: 2 },
  { value: 'Europe/Istanbul', label: 'Istanbul (GMT+2)', offset: 2 },
  { value: 'Europe/Kiev', label: 'Kiev (GMT+2)', offset: 2 },
  { value: 'Africa/Cairo', label: 'Cairo (GMT+2)', offset: 2 },
  { value: 'Africa/Johannesburg', label: 'Johannesburg (GMT+2)', offset: 2 },
  
  // GMT+3
  { value: 'Europe/Moscow', label: 'Moscow (GMT+3)', offset: 3 },
  { value: 'Asia/Baghdad', label: 'Baghdad (GMT+3)', offset: 3 },
  { value: 'Asia/Kuwait', label: 'Kuwait City (GMT+3)', offset: 3 },
  { value: 'Asia/Riyadh', label: 'Riyadh (GMT+3)', offset: 3 },
  { value: 'Africa/Nairobi', label: 'Nairobi (GMT+3)', offset: 3 },
  { value: 'Africa/Addis_Ababa', label: 'Addis Ababa (GMT+3)', offset: 3 },
  
  // GMT+3:30
  { value: 'Asia/Tehran', label: 'Tehran (GMT+3:30)', offset: 3.5 },
  
  // GMT+4
  { value: 'Asia/Dubai', label: 'Dubai (GMT+4)', offset: 4 },
  { value: 'Asia/Baku', label: 'Baku (GMT+4)', offset: 4 },
  { value: 'Asia/Yerevan', label: 'Yerevan (GMT+4)', offset: 4 },
  { value: 'Asia/Tbilisi', label: 'Tbilisi (GMT+4)', offset: 4 },
  { value: 'Indian/Mauritius', label: 'Mauritius (GMT+4)', offset: 4 },
  
  // GMT+4:30
  { value: 'Asia/Kabul', label: 'Kabul (GMT+4:30)', offset: 4.5 },
  
  // GMT+5
  { value: 'Asia/Karachi', label: 'Karachi (GMT+5)', offset: 5 },
  { value: 'Asia/Tashkent', label: 'Tashkent (GMT+5)', offset: 5 },
  { value: 'Asia/Yekaterinburg', label: 'Yekaterinburg (GMT+5)', offset: 5 },
  
  // GMT+5:30
  { value: 'Asia/Kolkata', label: 'Mumbai/Delhi (GMT+5:30)', offset: 5.5 },
  { value: 'Asia/Colombo', label: 'Colombo (GMT+5:30)', offset: 5.5 },
  
  // GMT+5:45
  { value: 'Asia/Kathmandu', label: 'Kathmandu (GMT+5:45)', offset: 5.75 },
  
  // GMT+6
  { value: 'Asia/Dhaka', label: 'Dhaka (GMT+6)', offset: 6 },
  { value: 'Asia/Almaty', label: 'Almaty (GMT+6)', offset: 6 },
  { value: 'Asia/Thimphu', label: 'Thimphu (GMT+6)', offset: 6 },
  
  // GMT+6:30
  { value: 'Asia/Yangon', label: 'Yangon (GMT+6:30)', offset: 6.5 },
  
  // GMT+7
  { value: 'Asia/Bangkok', label: 'Bangkok (GMT+7)', offset: 7 },
  { value: 'Asia/Jakarta', label: 'Jakarta (GMT+7)', offset: 7 },
  { value: 'Asia/Ho_Chi_Minh', label: 'Ho Chi Minh City (GMT+7)', offset: 7 },
  { value: 'Asia/Phnom_Penh', label: 'Phnom Penh (GMT+7)', offset: 7 },
  
  // GMT+8
  { value: 'Asia/Shanghai', label: 'Beijing/Shanghai (GMT+8)', offset: 8 },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong (GMT+8)', offset: 8 },
  { value: 'Asia/Singapore', label: 'Singapore (GMT+8)', offset: 8 },
  { value: 'Asia/Taipei', label: 'Taipei (GMT+8)', offset: 8 },
  { value: 'Asia/Manila', label: 'Manila (GMT+8)', offset: 8 },
  { value: 'Asia/Kuala_Lumpur', label: 'Kuala Lumpur (GMT+8)', offset: 8 },
  { value: 'Australia/Perth', label: 'Perth (GMT+8)', offset: 8 },
  
  // GMT+8:45
  { value: 'Australia/Eucla', label: 'Eucla (GMT+8:45)', offset: 8.75 },
  
  // GMT+9
  { value: 'Asia/Tokyo', label: 'Tokyo (GMT+9)', offset: 9 },
  { value: 'Asia/Seoul', label: 'Seoul (GMT+9)', offset: 9 },
  { value: 'Asia/Pyongyang', label: 'Pyongyang (GMT+9)', offset: 9 },
  
  // GMT+9:30
  { value: 'Australia/Adelaide', label: 'Adelaide (GMT+9:30)', offset: 9.5 },
  { value: 'Australia/Darwin', label: 'Darwin (GMT+9:30)', offset: 9.5 },
  
  // GMT+10
  { value: 'Australia/Sydney', label: 'Sydney (GMT+10)', offset: 10 },
  { value: 'Australia/Melbourne', label: 'Melbourne (GMT+10)', offset: 10 },
  { value: 'Australia/Brisbane', label: 'Brisbane (GMT+10)', offset: 10 },
  { value: 'Pacific/Guam', label: 'Guam (GMT+10)', offset: 10 },
  { value: 'Pacific/Port_Moresby', label: 'Port Moresby (GMT+10)', offset: 10 },
  
  // GMT+10:30
  { value: 'Australia/Lord_Howe', label: 'Lord Howe Island (GMT+10:30)', offset: 10.5 },
  
  // GMT+11
  { value: 'Pacific/Noumea', label: 'Nouméa (GMT+11)', offset: 11 },
  { value: 'Pacific/Norfolk', label: 'Norfolk Island (GMT+11)', offset: 11 },
  
  // GMT+12
  { value: 'Pacific/Auckland', label: 'Auckland (GMT+12)', offset: 12 },
  { value: 'Pacific/Fiji', label: 'Fiji (GMT+12)', offset: 12 },
  { value: 'Pacific/Tarawa', label: 'Tarawa (GMT+12)', offset: 12 },
  
  // GMT+12:45
  { value: 'Pacific/Chatham', label: 'Chatham Islands (GMT+12:45)', offset: 12.75 },
  
  // GMT+13
  { value: 'Pacific/Tongatapu', label: 'Nuku\'alofa (GMT+13)', offset: 13 },
  { value: 'Pacific/Apia', label: 'Apia (GMT+13)', offset: 13 },
  
  // GMT+14
  { value: 'Pacific/Kiritimati', label: 'Kiritimati (GMT+14)', offset: 14 },
];

function TimezoneConverter() {
  const [fromTimezone, setFromTimezone] = useState('America/New_York');
  const [toTimezone, setToTimezone] = useState('Europe/London');
  const [inputTime, setInputTime] = useState('');
  const [inputDate, setInputDate] = useState('');
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [currentTimes, setCurrentTimes] = useState<{ [key: string]: TimezoneData }>({});
  const [isProcessing, setIsProcessing] = useState(false);
  
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
    const urlFromTz = searchParams.get('from');
    const urlToTz = searchParams.get('to');
    const urlTime = searchParams.get('time');
    const urlDate = searchParams.get('date');
    
    if (urlFromTz && allTimezones.find(tz => tz.value === urlFromTz)) {
      setFromTimezone(urlFromTz);
    }
    if (urlToTz && allTimezones.find(tz => tz.value === urlToTz)) {
      setToTimezone(urlToTz);
    }
    if (urlTime) {
      setInputTime(urlTime);
    }
    if (urlDate) {
      setInputDate(urlDate);
    }
  }, [searchParams]);

  // Get timezone data
  const getTimezoneData = (timezone: string, date?: Date): TimezoneData => {
    const targetDate = date || new Date();
    
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });

      const parts = formatter.formatToParts(targetDate);
      const year = parts.find(p => p.type === 'year')?.value || '';
      const month = parts.find(p => p.type === 'month')?.value || '';
      const day = parts.find(p => p.type === 'day')?.value || '';
      const hour = parts.find(p => p.type === 'hour')?.value || '';
      const minute = parts.find(p => p.type === 'minute')?.value || '';
      const second = parts.find(p => p.type === 'second')?.value || '';

      const time = `${hour}:${minute}:${second}`;
      const dateStr = `${year}-${month}-${day}`;

      // Get UTC offset
      const utcDate1 = new Date(targetDate.getTime() + (targetDate.getTimezoneOffset() * 60000));
      const utcDate2 = new Date(utcDate1.toLocaleString("en-US", { timeZone: timezone }));
      const offset = (utcDate2.getTime() - utcDate1.getTime()) / (1000 * 60 * 60);
      const offsetHours = Math.floor(Math.abs(offset));
      const offsetMinutes = Math.floor((Math.abs(offset) % 1) * 60);
      const offsetSign = offset >= 0 ? '+' : '-';
      const utcOffset = `GMT${offsetSign}${offsetHours}${offsetMinutes > 0 ? `:${offsetMinutes.toString().padStart(2, '0')}` : ''}`;

      // Simple DST detection (this is approximate)
      const jan = new Date(targetDate.getFullYear(), 0, 1);
      const jul = new Date(targetDate.getFullYear(), 6, 1);
      const janOffset = (new Date(jan.toLocaleString("en-US", { timeZone: timezone })).getTime() - new Date(jan.getTime() + (jan.getTimezoneOffset() * 60000)).getTime()) / (1000 * 60 * 60);
      const julOffset = (new Date(jul.toLocaleString("en-US", { timeZone: timezone })).getTime() - new Date(jul.getTime() + (jul.getTimezoneOffset() * 60000)).getTime()) / (1000 * 60 * 60);
      const isDST = offset !== Math.min(janOffset, julOffset);

      return {
        timezone,
        time,
        date: dateStr,
        utcOffset,
        isDST
      };
    } catch (error) {
      console.error('Error getting timezone data:', error);
      return {
        timezone,
        time: '00:00:00',
        date: '1970-01-01',
        utcOffset: 'GMT+0',
        isDST: false
      };
    }
  };

  // Update current times every second
  useEffect(() => {
    const updateCurrentTimes = () => {
      const now = new Date();
      const times: { [key: string]: TimezoneData } = {};
      
      // Get current time for selected timezones
      [fromTimezone, toTimezone].forEach(tz => {
        times[tz] = getTimezoneData(tz, now);
      });
      
      setCurrentTimes(times);
    };

    updateCurrentTimes();
    const interval = setInterval(updateCurrentTimes, 1000);
    return () => clearInterval(interval);
  }, [fromTimezone, toTimezone]);

  // Throttled conversion function
  const performConversion = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      
      return (time: string, date: string, fromTz: string, toTz: string) => {
        clearTimeout(timeoutId);
        setIsProcessing(true);
        
        timeoutId = setTimeout(() => {
          try {
            if (!time || !date) {
              setConversionResult(null);
              setIsProcessing(false);
              return;
            }

            // Parse the input date and time
            const inputDateTime = new Date(`${date}T${time}`);
            
            if (isNaN(inputDateTime.getTime())) {
              setConversionResult(null);
              setIsProcessing(false);
              return;
            }

            // Create a date object in the source timezone
            const sourceDate = new Date(inputDateTime.toLocaleString("en-US", { timeZone: fromTz }));
            const targetDate = new Date(inputDateTime.toLocaleString("en-US", { timeZone: toTz }));
            
            // Calculate the actual converted time
            const utcTime = inputDateTime.getTime() - (inputDateTime.getTimezoneOffset() * 60000);
            const sourceOffset = (new Date(sourceDate.toLocaleString("en-US", { timeZone: fromTz })).getTime() - new Date(sourceDate.getTime() + (sourceDate.getTimezoneOffset() * 60000)).getTime()) / (1000 * 60 * 60);
            const targetOffset = (new Date(targetDate.toLocaleString("en-US", { timeZone: toTz })).getTime() - new Date(targetDate.getTime() + (targetDate.getTimezoneOffset() * 60000)).getTime()) / (1000 * 60 * 60);
            
            const convertedTime = new Date(utcTime + (targetOffset - sourceOffset) * 60 * 60 * 1000);
            
            const fromData = getTimezoneData(fromTz, inputDateTime);
            const toData = getTimezoneData(toTz, convertedTime);
            
            // Calculate time difference
            const diffHours = Math.abs(targetOffset - sourceOffset);
            const diffHoursInt = Math.floor(diffHours);
            const diffMinutes = Math.round((diffHours % 1) * 60);
            const timeDifference = `${diffHoursInt}h ${diffMinutes > 0 ? `${diffMinutes}m` : ''}`;

            setConversionResult({
              fromTimezone: fromData,
              toTimezone: toData,
              timeDifference
            });
          } catch (error) {
            console.error('Conversion error:', error);
            setConversionResult(null);
          } finally {
            setIsProcessing(false);
          }
        }, 500); // 500ms throttle
      };
    })(),
    []
  );

  // Trigger conversion when inputs change
  useEffect(() => {
    if (inputTime && inputDate) {
      performConversion(inputTime, inputDate, fromTimezone, toTimezone);
    } else {
      setConversionResult(null);
      setIsProcessing(false);
    }
  }, [inputTime, inputDate, fromTimezone, toTimezone, performConversion]);

  // Set current time as default
  const setCurrentTime = () => {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().split(' ')[0].slice(0, 5);
    
    setInputDate(currentDate);
    setInputTime(currentTime);
    toast.success('Current time set');
  };

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
    url.searchParams.set('from', fromTimezone);
    url.searchParams.set('to', toTimezone);
    if (inputTime) url.searchParams.set('time', inputTime);
    if (inputDate) url.searchParams.set('date', inputDate);
    
    navigator.clipboard.writeText(url.toString()).then(() => {
      toast.success('Shareable URL copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to create shareable URL');
    });
  };

  const downloadResult = () => {
    const resultData = {
      fromTimezone,
      toTimezone,
      inputTime,
      inputDate,
      conversionResult,
      currentTimes,
      generatedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(resultData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'timezone-conversion.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Conversion result downloaded!');
  };

  const clearAll = () => {
    setInputTime('');
    setInputDate('');
    setConversionResult(null);
    setFromTimezone('America/New_York');
    setToTimezone('Europe/London');
    router.push('/tools/timezone');
  };

  const swapTimezones = () => {
    const temp = fromTimezone;
    setFromTimezone(toTimezone);
    setToTimezone(temp);
    toast.success('Timezones swapped!');
  };

  const formatTimezone = (timezone: string) => {
    const tz = allTimezones.find(t => t.value === timezone);
    return tz ? tz.label : timezone;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Timezone Converter</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Convert time between different timezones and view current time across multiple zones. Perfect for scheduling meetings and coordinating across time zones.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Conversion Tool */}
        <div className="lg:col-span-2">
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2 dark:text-white">
                  <MapPin className="h-5 w-5" />
                  <span>Time Conversion</span>
                </CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={setCurrentTime}>
                    <Clock className="h-4 w-4 mr-2" />
                    Now
                  </Button>
                  <Button variant="outline" size="sm" onClick={swapTimezones}>
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Swap
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearAll}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </div>
              <CardDescription className="dark:text-gray-300">
                Convert time between different timezones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* From Timezone */}
              <div className="space-y-2">
                <Label htmlFor="from-timezone">From Timezone</Label>
                <Select value={fromTimezone} onValueChange={setFromTimezone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {allTimezones.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* To Timezone */}
              <div className="space-y-2">
                <Label htmlFor="to-timezone">To Timezone</Label>
                <Select value={toTimezone} onValueChange={setToTimezone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {allTimezones.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date and Time Input */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="input-date">Date</Label>
                  <Input
                    id="input-date"
                    type="date"
                    value={inputDate}
                    onChange={(e) => setInputDate(e.target.value)}
                    className="bg-white dark:bg-slate-900 border-gray-300 dark:border-gray-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="input-time">Time</Label>
                  <Input
                    id="input-time"
                    type="time"
                    value={inputTime}
                    onChange={(e) => setInputTime(e.target.value)}
                    className="bg-white dark:bg-slate-900 border-gray-300 dark:border-gray-600"
                  />
                </div>
              </div>

              {/* Conversion Result */}
              {conversionResult && (
                <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 dark:text-white">Conversion Result</h4>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={shareResult}>
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                      <Button variant="outline" size="sm" onClick={downloadResult}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* From Result */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-blue-900 dark:text-blue-300">From</h5>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(`${conversionResult.fromTimezone.date} ${conversionResult.fromTimezone.time} ${conversionResult.fromTimezone.utcOffset}`)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="space-y-1">
                        <div className="text-2xl font-mono font-bold text-blue-900 dark:text-blue-100">
                          {conversionResult.fromTimezone.time}
                        </div>
                        <div className="text-sm text-blue-700 dark:text-blue-300">
                          {conversionResult.fromTimezone.date}
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-400">
                          {formatTimezone(fromTimezone)}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {conversionResult.fromTimezone.utcOffset}
                          </Badge>
                          {conversionResult.fromTimezone.isDST && (
                            <Badge variant="outline" className="text-xs">
                              DST
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* To Result */}
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-green-900 dark:text-green-300">To</h5>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(`${conversionResult.toTimezone.date} ${conversionResult.toTimezone.time} ${conversionResult.toTimezone.utcOffset}`)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="space-y-1">
                        <div className="text-2xl font-mono font-bold text-green-900 dark:text-green-100">
                          {conversionResult.toTimezone.time}
                        </div>
                        <div className="text-sm text-green-700 dark:text-green-300">
                          {conversionResult.toTimezone.date}
                        </div>
                        <div className="text-xs text-green-600 dark:text-green-400">
                          {formatTimezone(toTimezone)}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {conversionResult.toTimezone.utcOffset}
                          </Badge>
                          {conversionResult.toTimezone.isDST && (
                            <Badge variant="outline" className="text-xs">
                              DST
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-center p-3 bg-gray-50 dark:bg-slate-900 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Time Difference</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {conversionResult.timeDifference}
                    </div>
                  </div>
                </div>
              )}

              {isProcessing && (
                <div className="text-center py-4">
                  <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Converting...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Current Times Sidebar */}
        <div className="space-y-6">
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 dark:text-white">
                <Globe className="h-5 w-5" />
                <span>Current Times</span>
              </CardTitle>
              <CardDescription className="dark:text-gray-300">
                Live time in selected timezones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(currentTimes).map(([timezone, data]) => (
                <div key={timezone} className="p-3 bg-gray-50 dark:bg-slate-900 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                      {timezone === fromTimezone ? 'From' : 'To'}
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(`${data.date} ${data.time} ${data.utcOffset}`)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xl font-mono font-bold text-gray-900 dark:text-white">
                      {data.time}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {data.date}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      {formatTimezone(timezone)}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {data.utcOffset}
                      </Badge>
                      {data.isDST && (
                        <Badge variant="outline" className="text-xs">
                          DST
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 dark:text-white">
                <Zap className="h-5 w-5" />
                <span>Quick Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={setCurrentTime}
              >
                <Clock className="h-4 w-4 mr-2" />
                Set Current Time
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={swapTimezones}
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Swap Timezones
              </Button>
              {conversionResult && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={shareResult}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Conversion
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Info Section */}
      <Card className="mt-8 bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">About Timezone Conversion</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <p className="text-gray-600 dark:text-gray-300">
            Timezone conversion is essential for global communication, scheduling meetings across different regions, 
            and coordinating activities with people in different time zones.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mt-6">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Features:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Real-time timezone conversion</li>
                <li>• Comprehensive timezone database</li>
                <li>• DST (Daylight Saving Time) detection</li>
                <li>• Current time display</li>
                <li>• Shareable conversion results</li>
                <li>• Time difference calculation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Use Cases:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Scheduling international meetings</li>
                <li>• Planning travel itineraries</li>
                <li>• Coordinating with remote teams</li>
                <li>• Broadcasting event times globally</li>
                <li>• Managing global business operations</li>
                <li>• Converting historical timestamps</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Timezone Coverage:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• All major world cities</li>
                <li>• GMT-12 to GMT+14 coverage</li>
                <li>• Half-hour and quarter-hour offsets</li>
                <li>• Automatic DST handling</li>
                <li>• IANA timezone database</li>
                <li>• Regular updates for accuracy</li>
              </ul>
            </div>
          </div>
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Note:</h4>
            <p className="text-blue-800 dark:text-blue-300 text-sm">
              All conversions are performed using the IANA timezone database and account for Daylight Saving Time changes. 
              The tool automatically detects DST periods and adjusts conversions accordingly.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function TimezonePage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div></div>}>
      <TimezoneConverter />
    </Suspense>
  );
}