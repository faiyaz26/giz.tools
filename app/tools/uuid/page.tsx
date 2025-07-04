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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Copy,
  Share2,
  RotateCcw,
  Download,
  KeyRound,
  RefreshCw,
  Settings,
  CheckCircle,
  AlertTriangle,
  Plus,
  Trash2,
  ClipboardList,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type UUIDVersion = "v1" | "v4" | "v7";

interface UUIDOptions {
  version: UUIDVersion;
  count: number;
  uppercase: boolean;
  hyphens: boolean;
}

interface GeneratedUUID {
  id: string;
  value: string;
  timestamp: number;
  version: UUIDVersion;
}

function UUIDGenerator() {
  const [options, setOptions] = useState<UUIDOptions>({
    version: "v4",
    count: 1,
    uppercase: false,
    hyphens: true,
  });

  const [uuids, setUuids] = useState<GeneratedUUID[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  // Helper function to safely encode/decode for URL sharing
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

  // Load from URL parameters on mount
  useEffect(() => {
    const urlVersion = searchParams.get("version") as UUIDVersion;
    const urlCount = searchParams.get("count");
    const urlUppercase = searchParams.get("uppercase");
    const urlHyphens = searchParams.get("hyphens");

    if (urlVersion && ["v1", "v4", "v7"].includes(urlVersion)) {
      setOptions((prev) => ({ ...prev, version: urlVersion }));
    }
    if (urlCount) {
      const countNum = parseInt(urlCount, 10);
      if (!isNaN(countNum) && countNum >= 1 && countNum <= 100) {
        setOptions((prev) => ({ ...prev, count: countNum }));
      }
    }
    if (urlUppercase === "true" || urlUppercase === "false") {
      setOptions((prev) => ({ ...prev, uppercase: urlUppercase === "true" }));
    }
    if (urlHyphens === "true" || urlHyphens === "false") {
      setOptions((prev) => ({ ...prev, hyphens: urlHyphens === "true" }));
    }
  }, [searchParams]);

  // UUID generation functions
  const generateUUIDv1 = (): string => {
    // UUID v1 implementation (time-based)
    const timestamp = Date.now();
    const randomValues = new Uint8Array(16);
    crypto.getRandomValues(randomValues);

    // Set version (4 bits) and variant (2 bits)
    randomValues[6] = (randomValues[6] & 0x0f) | 0x10; // Version 1
    randomValues[8] = (randomValues[8] & 0x3f) | 0x80; // Variant 10

    // Convert timestamp to UUID format
    const timestampHex = timestamp.toString(16).padStart(12, "0");
    const timeLow = timestampHex.slice(-8);
    const timeMid = timestampHex.slice(-12, -8);
    const timeHigh = "1" + timestampHex.slice(-15, -12);

    const clockSeq = ((randomValues[8] << 8) | randomValues[9]) & 0x3fff;
    const node = Array.from(randomValues.slice(10, 16), (b) =>
      b.toString(16).padStart(2, "0")
    ).join("");

    return `${timeLow}-${timeMid}-${timeHigh}-${clockSeq
      .toString(16)
      .padStart(4, "0")}-${node}`;
  };

  const generateUUIDv4 = (): string => {
    // UUID v4 implementation (random)
    const randomValues = new Uint8Array(16);
    crypto.getRandomValues(randomValues);

    // Set version (4 bits) and variant (2 bits)
    randomValues[6] = (randomValues[6] & 0x0f) | 0x40; // Version 4
    randomValues[8] = (randomValues[8] & 0x3f) | 0x80; // Variant 10

    const hex = Array.from(randomValues, (b) =>
      b.toString(16).padStart(2, "0")
    ).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(
      12,
      16
    )}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
  };

  const generateUUIDv7 = (): string => {
    // UUID v7 implementation (time-ordered)
    const timestamp = Date.now();
    const randomValues = new Uint8Array(16);
    crypto.getRandomValues(randomValues);

    // Set timestamp (48 bits)
    const timestampBytes = new Uint8Array(8);
    const timestampView = new DataView(timestampBytes.buffer);
    timestampView.setBigUint64(0, BigInt(timestamp), false);

    // Copy timestamp to UUID bytes
    randomValues[0] = timestampBytes[2];
    randomValues[1] = timestampBytes[3];
    randomValues[2] = timestampBytes[4];
    randomValues[3] = timestampBytes[5];
    randomValues[4] = timestampBytes[6];
    randomValues[5] = timestampBytes[7];

    // Set version (4 bits) and variant (2 bits)
    randomValues[6] = (randomValues[6] & 0x0f) | 0x70; // Version 7
    randomValues[8] = (randomValues[8] & 0x3f) | 0x80; // Variant 10

    const hex = Array.from(randomValues, (b) =>
      b.toString(16).padStart(2, "0")
    ).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(
      12,
      16
    )}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
  };

  const generateUUID = (version: UUIDVersion): string => {
    let uuid: string;

    switch (version) {
      case "v1":
        uuid = generateUUIDv1();
        break;
      case "v4":
        uuid = generateUUIDv4();
        break;
      case "v7":
        uuid = generateUUIDv7();
        break;
      default:
        uuid = generateUUIDv4();
    }

    // Apply formatting options
    if (!options.hyphens) {
      uuid = uuid.replace(/-/g, "");
    }
    if (options.uppercase) {
      uuid = uuid.toUpperCase();
    }

    return uuid;
  };

  const handleGenerate = () => {
    setIsGenerating(true);

    try {
      const newUuids: GeneratedUUID[] = [];

      for (let i = 0; i < options.count; i++) {
        const uuid = generateUUID(options.version);
        newUuids.push({
          id: `${Date.now()}-${i}`,
          value: uuid,
          timestamp: Date.now(),
          version: options.version,
        });
      }

      setUuids(newUuids);
      toast.success(
        `Generated ${options.count} UUID${
          options.count > 1 ? "s" : ""
        } successfully!`
      );
    } catch (error) {
      console.error("Error generating UUIDs:", error);
      toast.error("Failed to generate UUIDs");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  const copyAllUUIDs = async () => {
    if (uuids.length === 0) return;

    const allUuids = uuids.map((uuid) => uuid.value).join("\n");
    await copyToClipboard(allUuids);
  };

  const shareResult = () => {
    try {
      if (typeof window === "undefined") {
        toast.error("Sharing is not available on the server");
        return;
      }

      const url = new URL(window.location.href);
      url.searchParams.set("version", options.version);
      url.searchParams.set("count", options.count.toString());
      url.searchParams.set("uppercase", options.uppercase.toString());
      url.searchParams.set("hyphens", options.hyphens.toString());

      const urlString = url.toString();

      // Check if clipboard API is available
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(urlString)
          .then(() => {
            toast.success("Shareable URL copied to clipboard!");
          })
          .catch((error) => {
            console.error("Failed to copy to clipboard:", error);
            toast.error("Failed to create shareable URL");
          });
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = urlString;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand("copy");
          toast.success("Shareable URL copied to clipboard!");
        } catch (err) {
          console.error("Fallback copy failed:", err);
          toast.error("Failed to create shareable URL");
        }
        document.body.removeChild(textArea);
      }
    } catch (error) {
      console.error("Error in shareResult:", error);
      toast.error("Failed to create shareable URL");
    }
  };

  const downloadUUIDs = () => {
    if (uuids.length === 0) return;

    const content = uuids.map((uuid) => uuid.value).join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `uuids-${options.version}-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setUuids([]);
    toast.success("Cleared all UUIDs");
  };

  const removeUUID = (id: string) => {
    setUuids((prev) => prev.filter((uuid) => uuid.id !== id));
  };

  const addSingleUUID = () => {
    try {
      const uuid = generateUUID(options.version);
      const newUuid: GeneratedUUID = {
        id: `${Date.now()}-single`,
        value: uuid,
        timestamp: Date.now(),
        version: options.version,
      };

      setUuids((prev) => [...prev, newUuid]);
      toast.success("Added new UUID!");
    } catch (error) {
      console.error("Error generating UUID:", error);
      toast.error("Failed to generate UUID");
    }
  };

  const getVersionDescription = (version: UUIDVersion) => {
    switch (version) {
      case "v1":
        return "Time-based UUID with MAC address";
      case "v4":
        return "Random UUID (most common)";
      case "v7":
        return "Time-ordered UUID (sortable)";
      default:
        return "";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          UUID Generator
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Generate unique identifiers in multiple UUID versions including v1,
          v4, and v7. Perfect for databases, APIs, and distributed systems.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Generation Section */}
        <div className="lg:col-span-2">
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2 dark:text-white">
                  <KeyRound className="h-5 w-5" />
                  <span>UUID Generation</span>
                  {uuids.length > 0 && (
                    <Badge variant="outline">
                      {uuids.length} UUID{uuids.length > 1 ? "s" : ""}
                    </Badge>
                  )}
                </CardTitle>
                <div className="flex space-x-2">
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="flex items-center space-x-2"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4" />
                        <span>Generate</span>
                      </>
                    )}
                  </Button>
                  {uuids.length > 0 && (
                    <>
                      <Button variant="outline" size="sm" onClick={shareResult}>
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                      <Button variant="outline" size="sm" onClick={clearAll}>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Clear
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <CardDescription className="dark:text-gray-300">
                Configure your UUID generation settings and create unique
                identifiers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Generated UUIDs */}
              {uuids.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Generated UUIDs
                    </h3>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addSingleUUID}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add One
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyAllUUIDs}
                      >
                        <ClipboardList className="h-4 w-4 mr-2" />
                        Copy All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadUUIDs}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {uuids.map((uuid) => (
                      <div
                        key={uuid.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <code className="font-mono text-sm font-medium text-gray-900 dark:text-white break-all">
                              {uuid.value}
                            </code>
                            <Badge variant="secondary" className="text-xs">
                              {uuid.version}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Generated:{" "}
                            {new Date(uuid.timestamp).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(uuid.value)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeUUID(uuid.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {uuids.length === 0 && (
                <div className="text-center py-12">
                  <KeyRound className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No UUIDs Generated
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Configure your settings and click &quot;Generate&quot; to
                    create UUIDs.
                  </p>
                  <Button onClick={handleGenerate} disabled={isGenerating}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate UUIDs
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Settings Sidebar */}
        <div className="lg:col-span-1">
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 dark:text-white">
                <Settings className="h-5 w-5" />
                <span>Generation Settings</span>
              </CardTitle>
              <CardDescription className="dark:text-gray-300">
                Customize your UUID generation options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>UUID Version</Label>
                <Select
                  value={options.version}
                  onValueChange={(value) =>
                    setOptions((prev) => ({
                      ...prev,
                      version: value as UUIDVersion,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select version" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="v1">UUID v1 (Time-based)</SelectItem>
                    <SelectItem value="v4">UUID v4 (Random)</SelectItem>
                    <SelectItem value="v7">UUID v7 (Time-ordered)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {getVersionDescription(options.version)}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Count</Label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={options.count}
                  onChange={(e) =>
                    setOptions((prev) => ({
                      ...prev,
                      count: Math.max(
                        1,
                        Math.min(100, parseInt(e.target.value, 10) || 1)
                      ),
                    }))
                  }
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Number of UUIDs to generate (1-100)
                </p>
              </div>

              <div className="space-y-3">
                <Label>Formatting Options</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="uppercase"
                    checked={options.uppercase}
                    onChange={(e) =>
                      setOptions((prev) => ({
                        ...prev,
                        uppercase: e.target.checked,
                      }))
                    }
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                  <label
                    htmlFor="uppercase"
                    className="text-sm text-gray-700 dark:text-gray-300"
                  >
                    Uppercase
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="hyphens"
                    checked={options.hyphens}
                    onChange={(e) =>
                      setOptions((prev) => ({
                        ...prev,
                        hyphens: e.target.checked,
                      }))
                    }
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                  <label
                    htmlFor="hyphens"
                    className="text-sm text-gray-700 dark:text-gray-300"
                  >
                    Include hyphens
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info Panel */}
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700 mt-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 dark:text-white">
                <CheckCircle className="h-5 w-5" />
                <span>UUID Info</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Version:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {options.version.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Count:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {options.count}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Format:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {options.uppercase ? "Upper" : "Lower"}
                    {options.hyphens ? " + Hyphens" : ""}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Generated:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {uuids.length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function UUIDPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UUIDGenerator />
    </Suspense>
  );
}
