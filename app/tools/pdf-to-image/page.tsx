"use client";

import { useState, useEffect, useRef } from "react";
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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Upload,
  FileText,
  Image as ImageIcon,
  Download,
  RotateCcw,
  Settings,
  CheckCircle,
  AlertTriangle,
  FileCheck,
  Archive,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type ImageFormat = "image/png" | "image/jpeg" | "image/webp";

// Type definitions for PDF.js loaded from CDN
declare global {
  interface Window {
    pdfjsLib: any;
  }
}

interface PDFDocumentProxy {
  numPages: number;
  getPage(pageNumber: number): Promise<any>;
}

interface RenderTask {
  promise: Promise<void>;
}

export default function PdfToImagePage() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [imageFormat, setImageFormat] = useState<ImageFormat>("image/png");
  const [quality, setQuality] = useState(0.92);
  const [images, setImages] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [isConverting, setIsConverting] = useState(false);
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const jszipRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  useEffect(() => {
    // Load PDF.js from CDN
    const loadPdfJs = async () => {
      if (typeof window !== "undefined" && !window.pdfjsLib) {
        // Load PDF.js library
        const script = document.createElement("script");
        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
        script.async = true;
        script.onload = () => {
          if (window.pdfjsLib) {
            // Set the worker source
            window.pdfjsLib.GlobalWorkerOptions.workerSrc =
              "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
          }
        };
        document.head.appendChild(script);
      }
    };

    loadPdfJs();

    // Dynamically import JSZip on the client side
    import("jszip").then((zip) => {
      jszipRef.current = zip.default;
    });
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (file && file.type === "application/pdf") {
      setIsLoading(true);
      setPdfFile(file);
      setImages([]);
      setProgress(0);

      try {
        if (!window.pdfjsLib) {
          toast.error("PDF.js is still loading. Please try again in a moment.");
          return;
        }

        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        setPdfDoc(pdf);
        toast.success(`PDF loaded: ${file.name} (${pdf.numPages} pages)`);
      } catch (error) {
        console.error("Error loading PDF:", error);
        toast.error(
          "Failed to load PDF file. It might be corrupted or protected."
        );
        setPdfFile(null);
        setPdfDoc(null);
      } finally {
        setIsLoading(false);
      }
    } else {
      toast.error("Please select a valid PDF file.");
      setPdfFile(null);
      setPdfDoc(null);
    }
  };

  // Handle drag and drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Clear file
  const clearFile = () => {
    setPdfFile(null);
    setPdfDoc(null);
    setImages([]);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.success("PDF cleared");
  };

  const convertPdfToImages = async () => {
    if (!pdfDoc || !pdfFile) {
      toast.error("Please load a PDF file first.");
      return;
    }

    setIsConverting(true);
    setProgress(0);
    setImages([]);
    const convertedImages: string[] = [];

    try {
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
          const renderContext = {
            canvasContext: context,
            viewport: viewport,
          };
          const renderTask: RenderTask = page.render(renderContext);
          await renderTask.promise;
          convertedImages.push(canvas.toDataURL(imageFormat, quality));
        }

        const currentProgress = (i / pdfDoc.numPages) * 100;
        setProgress(currentProgress);
      }
      setImages(convertedImages);
      toast.success(`Successfully converted ${pdfDoc.numPages} pages.`);
    } catch (error) {
      console.error("Error converting PDF:", error);
      toast.error("An error occurred during conversion.");
    } finally {
      setIsConverting(false);
      setProgress(100);
    }
  };

  const downloadImages = async () => {
    if (images.length === 0) return;

    if (images.length === 1) {
      const link = document.createElement("a");
      link.href = images[0];
      const fileExtension = imageFormat.split("/")[1];
      link.download = `${
        pdfFile?.name.replace(".pdf", "") || "image"
      }.${fileExtension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      if (!jszipRef.current) {
        toast.error(
          "ZIP library not loaded yet. Please try again in a moment."
        );
        return;
      }
      const JSZip = jszipRef.current;
      const zip = new JSZip();
      images.forEach((imgData, i) => {
        const fileExtension = imageFormat.split("/")[1];
        const fileName = `${pdfFile?.name.replace(".pdf", "") || "page"}_${
          i + 1
        }.${fileExtension}`;
        zip.file(fileName, imgData.split(",")[1], { base64: true });
      });

      try {
        const content = await zip.generateAsync({ type: "blob" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(content);
        link.download = `${pdfFile?.name.replace(".pdf", "") || "images"}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      } catch (error) {
        console.error("Error creating ZIP file:", error);
        toast.error("Failed to create ZIP file.");
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          PDF to Image Converter
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Convert your PDF pages to high-quality images in PNG, JPEG, or WebP
          format. All processing happens in your browser for complete privacy.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Upload Section */}
        <div className="lg:col-span-2">
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2 dark:text-white">
                  <FileText className="h-5 w-5" />
                  <span>PDF File</span>
                  {pdfFile && (
                    <Badge variant="outline">
                      {pdfDoc?.numPages || 0} page
                      {pdfDoc?.numPages !== 1 ? "s" : ""}
                    </Badge>
                  )}
                </CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload PDF
                  </Button>
                  {pdfFile && (
                    <Button variant="outline" size="sm" onClick={clearFile}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                  )}
                </div>
              </div>
              <CardDescription className="dark:text-gray-300">
                Upload a PDF file to convert its pages to images. Choose your
                preferred format and quality settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Drop Zone */}
              {!pdfFile && (
                <div
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Upload PDF File
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Drag and drop a PDF file here, or click to browse
                  </p>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Choose File
                  </Button>
                </div>
              )}

              {/* File Info */}
              {pdfFile && (
                <div className="mb-6">
                  <div
                    className={cn(
                      "flex items-center space-x-4 p-4 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-700",
                      isLoading && "opacity-75"
                    )}
                  >
                    <div className="flex items-center space-x-2 text-gray-400">
                      <FileText className="h-5 w-5 text-red-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900 dark:text-white truncate">
                          {pdfFile.name}
                        </span>
                        {isLoading && (
                          <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                        )}
                        {pdfDoc && (
                          <FileCheck className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {formatFileSize(pdfFile.size)}
                        {pdfDoc &&
                          ` • ${pdfDoc.numPages} page${
                            pdfDoc.numPages !== 1 ? "s" : ""
                          }`}
                        {isLoading && " • Loading..."}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Conversion Progress */}
              {isConverting && (
                <div className="mb-6">
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>Converting pages to images...</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Image Gallery */}
              {images.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Converted Images
                    </h3>
                    <Button
                      onClick={downloadImages}
                      className="flex items-center space-x-2"
                    >
                      {images.length > 1 ? (
                        <>
                          <Archive className="h-4 w-4" />
                          <span>Download ZIP</span>
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4" />
                          <span>Download Image</span>
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((src, index) => (
                      <div key={index} className="relative group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={src}
                          alt={`Page ${index + 1}`}
                          className="rounded-lg border border-gray-200 dark:border-gray-700 w-full h-auto hover:shadow-md transition-shadow"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs text-center py-1 rounded-b-lg">
                          Page {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
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
                <span>Conversion Settings</span>
              </CardTitle>
              <CardDescription className="dark:text-gray-300">
                Configure image format and quality settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image-format">Image Format</Label>
                <Select
                  value={imageFormat}
                  onValueChange={(value) =>
                    setImageFormat(value as ImageFormat)
                  }
                >
                  <SelectTrigger id="image-format">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image/png">PNG</SelectItem>
                    <SelectItem value="image/jpeg">JPEG</SelectItem>
                    <SelectItem value="image/webp">WebP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(imageFormat === "image/jpeg" ||
                imageFormat === "image/webp") && (
                <div className="space-y-2">
                  <Label htmlFor="quality">
                    Quality ({Math.round(quality * 100)}%)
                  </Label>
                  <Input
                    id="quality"
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.01"
                    value={quality}
                    onChange={(e) => setQuality(parseFloat(e.target.value))}
                  />
                </div>
              )}

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  onClick={convertPdfToImages}
                  disabled={!pdfFile || isConverting || isLoading}
                  className="w-full"
                >
                  {isConverting ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Converting...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Convert to Images
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Info Panel */}
          {pdfFile && (
            <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700 mt-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 dark:text-white">
                  <FileText className="h-5 w-5" />
                  <span>File Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      File name:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white truncate ml-2">
                      {pdfFile.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      File size:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatFileSize(pdfFile.size)}
                    </span>
                  </div>
                  {pdfDoc && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Pages:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {pdfDoc.numPages}
                      </span>
                    </div>
                  )}
                  {images.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Images:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {images.length}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
