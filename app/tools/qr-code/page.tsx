"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
  Upload,
  QrCode,
  Smartphone,
  Globe,
  Link2,
  Type,
  RefreshCw,
  Settings,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// QR Code types
type QRCodeType = "text" | "url" | "email" | "phone" | "sms" | "wifi";
type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";

interface QRCodeOptions {
  text: string;
  type: QRCodeType;
  size: number;
  errorCorrectionLevel: ErrorCorrectionLevel;
  margin: number;
  foregroundColor: string;
  backgroundColor: string;
}

// QR Code library is loaded from CDN
declare global {
  interface Window {
    qrcode: any;
  }
}

function QRCodeGenerator() {
  const [options, setOptions] = useState<QRCodeOptions>({
    text: "",
    type: "text",
    size: 256,
    errorCorrectionLevel: "M",
    margin: 4,
    foregroundColor: "#000000",
    backgroundColor: "#ffffff",
  });

  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [isLibraryLoaded, setIsLibraryLoaded] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
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

  // Load QR code library
  useEffect(() => {
    const loadQRCodeLibrary = async () => {
      if (typeof window !== "undefined" && !window.qrcode) {
        try {
          const script = document.createElement("script");
          script.src =
            "https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js";
          script.async = true;
          script.onload = () => {
            setIsLibraryLoaded(true);
          };
          script.onerror = () => {
            setError("Failed to load QR code library");
          };
          document.head.appendChild(script);
        } catch (err) {
          setError("Failed to load QR code library");
        }
      } else if (window.qrcode) {
        setIsLibraryLoaded(true);
      }
    };

    loadQRCodeLibrary();
  }, []);

  // Load from URL parameters on mount
  useEffect(() => {
    const urlText = searchParams.get("text");
    const urlType = searchParams.get("type") as QRCodeType;
    const urlSize = searchParams.get("size");
    const urlErrorLevel = searchParams.get(
      "errorLevel"
    ) as ErrorCorrectionLevel;

    if (urlText) {
      const decodedText = decodeFromUrl(urlText);
      if (decodedText) {
        setOptions((prev) => ({ ...prev, text: decodedText }));
      }
    }
    if (
      urlType &&
      ["text", "url", "email", "phone", "sms", "wifi"].includes(urlType)
    ) {
      setOptions((prev) => ({ ...prev, type: urlType }));
    }
    if (urlSize) {
      const sizeNum = parseInt(urlSize, 10);
      if (!isNaN(sizeNum) && sizeNum >= 128 && sizeNum <= 512) {
        setOptions((prev) => ({ ...prev, size: sizeNum }));
      }
    }
    if (urlErrorLevel && ["L", "M", "Q", "H"].includes(urlErrorLevel)) {
      setOptions((prev) => ({ ...prev, errorCorrectionLevel: urlErrorLevel }));
    }
  }, [searchParams]);

  // Generate QR code whenever options change
  useEffect(() => {
    const generateQRCode = async () => {
      if (!options.text.trim() || !isLibraryLoaded) {
        setQrCodeDataUrl("");
        return;
      }

      setIsGenerating(true);
      setError("");

      try {
        // Create QR code
        const qr = window.qrcode(0, options.errorCorrectionLevel);
        let qrText = options.text;

        // Format text based on type
        switch (options.type) {
          case "url":
            if (
              !qrText.startsWith("http://") &&
              !qrText.startsWith("https://")
            ) {
              qrText = `https://${qrText}`;
            }
            break;
          case "email":
            if (!qrText.startsWith("mailto:")) {
              qrText = `mailto:${qrText}`;
            }
            break;
          case "phone":
            if (!qrText.startsWith("tel:")) {
              qrText = `tel:${qrText}`;
            }
            break;
          case "sms":
            if (!qrText.startsWith("sms:")) {
              qrText = `sms:${qrText}`;
            }
            break;
          // text and wifi don't need special formatting
          default:
            break;
        }

        qr.addData(qrText);
        qr.make();

        // Create canvas and draw QR code
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = options.size;
        canvas.height = options.size;

        // Clear canvas
        ctx.fillStyle = options.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw QR code
        const moduleCount = qr.getModuleCount();
        const moduleSize = (options.size - 2 * options.margin) / moduleCount;

        ctx.fillStyle = options.foregroundColor;
        for (let row = 0; row < moduleCount; row++) {
          for (let col = 0; col < moduleCount; col++) {
            if (qr.isDark(row, col)) {
              ctx.fillRect(
                options.margin + col * moduleSize,
                options.margin + row * moduleSize,
                moduleSize,
                moduleSize
              );
            }
          }
        }

        // Convert to data URL
        const dataUrl = canvas.toDataURL("image/png");
        setQrCodeDataUrl(dataUrl);

        toast.success("QR code generated successfully!");
      } catch (err) {
        console.error("Error generating QR code:", err);
        setError("Failed to generate QR code. Please check your input.");
        toast.error("Failed to generate QR code");
      } finally {
        setIsGenerating(false);
      }
    };

    if (options.text && isLibraryLoaded) {
      generateQRCode();
    }
  }, [options, isLibraryLoaded]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  const shareResult = () => {
    try {
      if (typeof window === "undefined") {
        toast.error("Sharing is not available on the server");
        return;
      }

      const url = new URL(window.location.href);
      url.searchParams.set("text", encodeForUrl(options.text));
      url.searchParams.set("type", options.type);
      url.searchParams.set("size", options.size.toString());
      url.searchParams.set("errorLevel", options.errorCorrectionLevel);

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
            // Fallback: show URL in prompt
            prompt("Copy this URL:", urlString);
            toast.success("Shareable URL created!");
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
          prompt("Copy this URL:", urlString);
          toast.success("Shareable URL created!");
        }
        document.body.removeChild(textArea);
      }
    } catch (error) {
      console.error("Error in shareResult:", error);
      toast.error("Failed to create shareable URL");
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeDataUrl) return;

    const link = document.createElement("a");
    link.href = qrCodeDataUrl;
    link.download = `qr-code-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearAll = () => {
    setOptions({
      text: "",
      type: "text",
      size: 256,
      errorCorrectionLevel: "M",
      margin: 4,
      foregroundColor: "#000000",
      backgroundColor: "#ffffff",
    });
    setQrCodeDataUrl("");
    setError("");
    toast.success("Cleared all inputs");
  };

  const generateExample = () => {
    const examples = [
      {
        type: "text" as QRCodeType,
        text: "Hello, World! This is a sample QR code.",
      },
      {
        type: "url" as QRCodeType,
        text: "https://giz.tools",
      },
      {
        type: "email" as QRCodeType,
        text: "contact@example.com",
      },
      {
        type: "phone" as QRCodeType,
        text: "+1-555-123-4567",
      },
      {
        type: "sms" as QRCodeType,
        text: "+1-555-123-4567",
      },
    ];

    const example = examples[Math.floor(Math.random() * examples.length)];
    setOptions((prev) => ({
      ...prev,
      text: example.text,
      type: example.type,
    }));
    toast.success(`Generated ${example.type} example!`);
  };

  const getTypeIcon = (type: QRCodeType) => {
    switch (type) {
      case "url":
        return <Globe className="h-4 w-4" />;
      case "email":
        return <Link2 className="h-4 w-4" />;
      case "phone":
        return <Smartphone className="h-4 w-4" />;
      case "sms":
        return <Smartphone className="h-4 w-4" />;
      default:
        return <Type className="h-4 w-4" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          QR Code Generator
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Generate QR codes from text, URLs, emails, phone numbers, and more.
          All processing happens in your browser for complete privacy.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Input Section */}
        <div className="lg:col-span-2">
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2 dark:text-white">
                  <QrCode className="h-5 w-5" />
                  <span>QR Code Input</span>
                  {options.text && (
                    <Badge
                      variant="outline"
                      className="flex items-center space-x-1"
                    >
                      {getTypeIcon(options.type)}
                      <span>{options.type}</span>
                    </Badge>
                  )}
                </CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={generateExample}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Example
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearAll}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                  {options.text && (
                    <Button variant="outline" size="sm" onClick={shareResult}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  )}
                </div>
              </div>
              <CardDescription className="dark:text-gray-300">
                Enter your text, URL, email, or other data to generate a QR
                code.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Type Selection */}
              <div className="space-y-2">
                <Label>QR Code Type</Label>
                <Select
                  value={options.type}
                  onValueChange={(value) =>
                    setOptions((prev) => ({
                      ...prev,
                      type: value as QRCodeType,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Plain Text</SelectItem>
                    <SelectItem value="url">URL/Website</SelectItem>
                    <SelectItem value="email">Email Address</SelectItem>
                    <SelectItem value="phone">Phone Number</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="wifi">WiFi Network</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Text Input */}
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea
                  value={options.text}
                  onChange={(e) =>
                    setOptions((prev) => ({ ...prev, text: e.target.value }))
                  }
                  placeholder={
                    options.type === "url"
                      ? "Enter URL (e.g., https://example.com)"
                      : options.type === "email"
                      ? "Enter email address"
                      : options.type === "phone"
                      ? "Enter phone number"
                      : options.type === "sms"
                      ? "Enter phone number"
                      : options.type === "wifi"
                      ? "Enter WiFi details"
                      : "Enter your text here..."
                  }
                  className="min-h-[100px]"
                />
                {options.text && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {options.text.length} characters
                  </div>
                )}
              </div>

              {/* Error Display */}
              {error && (
                <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* QR Code Display */}
              {qrCodeDataUrl && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Generated QR Code
                    </h3>
                    <Button onClick={downloadQRCode} size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download PNG
                    </Button>
                  </div>
                  <div className="flex justify-center">
                    <div className="p-4 bg-white rounded-lg shadow-md">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={qrCodeDataUrl}
                        alt="Generated QR Code"
                        className="max-w-full h-auto"
                        style={{ imageRendering: "pixelated" }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Hidden canvas for generation */}
              <canvas
                ref={canvasRef}
                className="hidden"
                width={options.size}
                height={options.size}
              />
            </CardContent>
          </Card>
        </div>

        {/* Settings Sidebar */}
        <div className="lg:col-span-1">
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 dark:text-white">
                <Settings className="h-5 w-5" />
                <span>QR Code Settings</span>
              </CardTitle>
              <CardDescription className="dark:text-gray-300">
                Customize your QR code appearance and quality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Size (pixels)</Label>
                <Input
                  type="number"
                  min="128"
                  max="512"
                  value={options.size}
                  onChange={(e) =>
                    setOptions((prev) => ({
                      ...prev,
                      size: parseInt(e.target.value, 10) || 256,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Error Correction Level</Label>
                <Select
                  value={options.errorCorrectionLevel}
                  onValueChange={(value) =>
                    setOptions((prev) => ({
                      ...prev,
                      errorCorrectionLevel: value as ErrorCorrectionLevel,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">Low (7%)</SelectItem>
                    <SelectItem value="M">Medium (15%)</SelectItem>
                    <SelectItem value="Q">Quartile (25%)</SelectItem>
                    <SelectItem value="H">High (30%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Margin (pixels)</Label>
                <Input
                  type="number"
                  min="0"
                  max="20"
                  value={options.margin}
                  onChange={(e) =>
                    setOptions((prev) => ({
                      ...prev,
                      margin: parseInt(e.target.value, 10) || 4,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Foreground Color</Label>
                <Input
                  type="color"
                  value={options.foregroundColor}
                  onChange={(e) =>
                    setOptions((prev) => ({
                      ...prev,
                      foregroundColor: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Background Color</Label>
                <Input
                  type="color"
                  value={options.backgroundColor}
                  onChange={(e) =>
                    setOptions((prev) => ({
                      ...prev,
                      backgroundColor: e.target.value,
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Info Panel */}
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700 mt-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 dark:text-white">
                <CheckCircle className="h-5 w-5" />
                <span>QR Code Info</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Type:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white capitalize">
                    {options.type}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Size:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {options.size} × {options.size}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Error Level:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {options.errorCorrectionLevel}
                  </span>
                </div>
                {options.text && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Characters:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {options.text.length}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Generated:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {qrCodeDataUrl ? "Yes" : "No"}
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

export default function QRCodePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <QRCodeGenerator />
    </Suspense>
  );
}
