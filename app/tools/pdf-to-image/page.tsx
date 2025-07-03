"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  FileText,
  FileImage,
  Download,
  RotateCcw,
  Archive,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import JSZip from "jszip";

// Types
type ImageFormat = "png" | "jpeg" | "webp";
type ImageQuality = "low" | "medium" | "high" | "maximum";

interface ConvertedImage {
  pageNumber: number;
  dataUrl: string;
  blob: Blob;
  filename: string;
}

const formatOptions = [
  { value: "png", label: "PNG", description: "Best quality, larger file size" },
  {
    value: "jpeg",
    label: "JPEG",
    description: "Good quality, smaller file size",
  },
  {
    value: "webp",
    label: "WebP",
    description: "Modern format, excellent compression",
  },
];

const qualityOptions = [
  { value: "low", label: "Low (72 DPI)", scale: 0.5 },
  { value: "medium", label: "Medium (150 DPI)", scale: 1.0 },
  { value: "high", label: "High (300 DPI)", scale: 2.0 },
  { value: "maximum", label: "Maximum (600 DPI)", scale: 4.0 },
];

// PDF.js types for TypeScript
declare global {
  interface Window {
    pdfjsLib: any;
  }
}

export default function PDFToImageConverter() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [convertedImages, setConvertedImages] = useState<ConvertedImage[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [selectedFormat, setSelectedFormat] = useState<ImageFormat>("png");
  const [selectedQuality, setSelectedQuality] = useState<ImageQuality>(
    "medium"
  );
  const [totalPages, setTotalPages] = useState(0);
  const [pdfjsLoaded, setPdfjsLoaded] = useState(false);
  const [isLoadingPdfjs, setIsLoadingPdfjs] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load PDF.js only when needed
  const loadPdfjs = useCallback(async () => {
    if (typeof window === "undefined") return false;

    if (window.pdfjsLib) {
      setPdfjsLoaded(true);
      return true;
    }

    setIsLoadingPdfjs(true);

    try {
      // Load PDF.js library
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load PDF.js"));
        document.head.appendChild(script);
      });

      // Setup worker
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        setPdfjsLoaded(true);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Failed to load PDF.js:", error);
      toast.error("Failed to load PDF.js library");
      return false;
    } finally {
      setIsLoadingPdfjs(false);
    }
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        if (file.type !== "application/pdf") {
          toast.error("Please upload a valid PDF file");
          return;
        }

        if (file.size > 50 * 1024 * 1024) {
          toast.error("File size must be less than 50MB");
          return;
        }

        setPdfFile(file);
        setConvertedImages([]);
        setTotalPages(0);
        toast.success("PDF uploaded successfully");
      }
    },
    []
  );

  const convertPDFToImages = async () => {
    if (!pdfFile) return;

    // Load PDF.js if not already loaded
    if (!pdfjsLoaded) {
      const loaded = await loadPdfjs();
      if (!loaded) {
        toast.error("Failed to load PDF.js library");
        return;
      }
    }

    setIsConverting(true);
    setConversionProgress(0);
    setConvertedImages([]);

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer })
        .promise;
      const numPages = pdf.numPages;
      setTotalPages(numPages);

      const images: ConvertedImage[] = [];
      const quality = qualityOptions.find((q) => q.value === selectedQuality);
      const scale = quality?.scale || 1.0;

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
          await page.render({
            canvasContext: context,
            viewport: viewport,
          }).promise;

          const blob = await new Promise<Blob>((resolve) => {
            canvas.toBlob(
              (blob) => resolve(blob!),
              `image/${selectedFormat}`,
              selectedFormat === "jpeg" ? 0.9 : undefined
            );
          });

          const dataUrl = canvas.toDataURL(
            `image/${selectedFormat}`,
            selectedFormat === "jpeg" ? 0.9 : undefined
          );

          const filename = `${pdfFile.name.replace(
            ".pdf",
            ""
          )}_page_${pageNum}.${selectedFormat}`;

          images.push({
            pageNumber: pageNum,
            dataUrl,
            blob,
            filename,
          });
        }

        setConversionProgress((pageNum / numPages) * 100);
      }

      setConvertedImages(images);
      toast.success(
        `Successfully converted ${numPages} page(s) to ${selectedFormat.toUpperCase()}`
      );
    } catch (error) {
      console.error("Error converting PDF:", error);
      toast.error("Failed to convert PDF to images");
    } finally {
      setIsConverting(false);
    }
  };

  const downloadSingleImage = (image: ConvertedImage) => {
    const link = document.createElement("a");
    link.href = image.dataUrl;
    link.download = image.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllAsZip = async () => {
    if (convertedImages.length === 0) return;

    try {
      const zip = new JSZip();

      convertedImages.forEach((image) => {
        zip.file(image.filename, image.blob);
      });

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(zipBlob);
      link.download = `${pdfFile?.name.replace(".pdf", "")}_images.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("ZIP file downloaded successfully");
    } catch (error) {
      console.error("Error creating ZIP:", error);
      toast.error("Failed to create ZIP file");
    }
  };

  const resetConverter = () => {
    setPdfFile(null);
    setConvertedImages([]);
    setTotalPages(0);
    setConversionProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">PDF to Image Converter</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Convert PDF pages to images in various formats. Perfect for extracting
          charts, diagrams, or creating image previews. All processing happens
          in your browser.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload PDF File
            </CardTitle>
            <CardDescription>
              Select a PDF file to convert to images. Maximum file size: 50MB
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="pdf-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FileText className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PDF files only (MAX. 50MB)
                  </p>
                </div>
                <input
                  id="pdf-upload"
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf"
                  onChange={handleFileInputChange}
                />
              </label>
            </div>

            {pdfFile && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">{pdfFile.name}</span>
                    <Badge variant="secondary">
                      {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm" onClick={resetConverter}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Settings Section */}
        {pdfFile && (
          <Card>
            <CardHeader>
              <CardTitle>Conversion Settings</CardTitle>
              <CardDescription>
                Choose output format and quality settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="format-select">Output Format</Label>
                  <Select
                    value={selectedFormat}
                    onValueChange={(value: ImageFormat) =>
                      setSelectedFormat(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {formatOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs text-gray-500">
                              {option.description}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="quality-select">Quality</Label>
                  <Select
                    value={selectedQuality}
                    onValueChange={(value: ImageQuality) =>
                      setSelectedQuality(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {qualityOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={convertPDFToImages}
                disabled={isConverting || isLoadingPdfjs}
                className="w-full"
                size="lg"
              >
                {isConverting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Converting...
                  </>
                ) : isLoadingPdfjs ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                    Loading PDF.js...
                  </>
                ) : (
                  <>
                    <FileImage className="h-4 w-4 mr-2" />
                    Convert to Images
                  </>
                )}
              </Button>

              {isConverting && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.round(conversionProgress)}%</span>
                  </div>
                  <Progress value={conversionProgress} className="w-full" />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Results Section */}
        {convertedImages.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Converted Images
                  </CardTitle>
                  <CardDescription>
                    {convertedImages.length} image(s) ready for download
                  </CardDescription>
                </div>
                {convertedImages.length > 1 && (
                  <Button onClick={downloadAllAsZip} variant="outline">
                    <Archive className="h-4 w-4 mr-2" />
                    Download ZIP
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {convertedImages.map((image) => (
                  <div key={image.pageNumber} className="border rounded-lg p-4">
                    <div className="aspect-square mb-2 bg-gray-100 rounded overflow-hidden">
                      <Image
                        src={image.dataUrl}
                        alt={`Page ${image.pageNumber}`}
                        width={300}
                        height={300}
                        className="w-full h-full object-contain"
                        unoptimized
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">
                        Page {image.pageNumber}
                      </p>
                      <Button
                        onClick={() => downloadSingleImage(image)}
                        size="sm"
                        className="w-full"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
