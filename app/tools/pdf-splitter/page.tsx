"use client";

import { useState, useRef, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Copy,
  Download,
  RotateCcw,
  Upload,
  FileText,
  Scissors,
  AlertTriangle,
  CheckCircle,
  Eye,
  FileCheck,
  Archive,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";

// Remove metadata export from client component
// export const metadata = {
//   title: 'PDF Splitter - giz.tools',
//   description: 'Split PDF pages into individual files and download them as a ZIP archive. Choose specific pages, ranges, or extract all pages. Free online PDF splitter with no watermarks.',
//   keywords: 'pdf splitter, split pdf, extract pdf pages, pdf extractor, pdf tools, document splitter, pdf page extractor',
//   openGraph: {
//     title: 'PDF Splitter - giz.tools',
//     description: 'Split PDF pages into individual files and download them as a ZIP archive. Choose specific pages, ranges, or extract all pages.'
//   }
// };

interface PDFFile {
  id: string;
  file: File;
  name: string;
  size: number;
  pages: number;
  pdfDoc: PDFDocument;
}

interface PageSelection {
  pageNumber: number;
  selected: boolean;
}

function PDFSplitterTool() {
  const [pdfFile, setPdfFile] = useState<PDFFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pageSelections, setPageSelections] = useState<PageSelection[]>([]);
  const [splitMode, setSplitMode] = useState<"all" | "range" | "selected">(
    "all"
  );
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [zipUrl, setZipUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate unique ID
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Load PDF and get page count
  const loadPDFInfo = async (
    file: File
  ): Promise<{ pages: number; pdfDoc: PDFDocument }> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPageCount();
      return { pages, pdfDoc };
    } catch (error) {
      console.error("Error loading PDF:", error);
      throw new Error(
        "Failed to load PDF. The file might be corrupted or password-protected."
      );
    }
  };

  // Handle file upload
  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.type !== "application/pdf") {
      toast.error("Please select a PDF file");
      return;
    }

    setIsLoading(true);
    setZipUrl(null);

    try {
      const { pages, pdfDoc } = await loadPDFInfo(file);

      const pdfFileData: PDFFile = {
        id: generateId(),
        file,
        name: file.name,
        size: file.size,
        pages,
        pdfDoc,
      };

      setPdfFile(pdfFileData);

      // Initialize page selections
      const selections: PageSelection[] = Array.from(
        { length: pages },
        (_, i) => ({
          pageNumber: i + 1,
          selected: true,
        })
      );
      setPageSelections(selections);

      // Set default range
      setRangeStart("1");
      setRangeEnd(pages.toString());

      toast.success(`PDF loaded successfully! ${pages} pages found.`);
    } catch (error) {
      toast.error(
        `Error loading PDF: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle drag and drop
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const files = e.dataTransfer.files;
      handleFileUpload(files);
    },
    [handleFileUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // Handle file input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Toggle page selection
  const togglePageSelection = (pageNumber: number) => {
    setPageSelections((prev) =>
      prev.map((page) =>
        page.pageNumber === pageNumber
          ? { ...page, selected: !page.selected }
          : page
      )
    );
  };

  // Select all pages
  const selectAllPages = () => {
    setPageSelections((prev) =>
      prev.map((page) => ({ ...page, selected: true }))
    );
  };

  // Deselect all pages
  const deselectAllPages = () => {
    setPageSelections((prev) =>
      prev.map((page) => ({ ...page, selected: false }))
    );
  };

  // Get pages to split based on mode
  const getPagesToSplit = (): number[] => {
    if (!pdfFile) return [];

    switch (splitMode) {
      case "all":
        return Array.from({ length: pdfFile.pages }, (_, i) => i + 1);

      case "range":
        const start = parseInt(rangeStart) || 1;
        const end = parseInt(rangeEnd) || pdfFile.pages;
        const validStart = Math.max(1, Math.min(start, pdfFile.pages));
        const validEnd = Math.max(validStart, Math.min(end, pdfFile.pages));
        return Array.from(
          { length: validEnd - validStart + 1 },
          (_, i) => validStart + i
        );

      case "selected":
        return pageSelections
          .filter((page) => page.selected)
          .map((page) => page.pageNumber);

      default:
        return [];
    }
  };

  // Split PDF and create ZIP
  const splitPDF = async () => {
    if (!pdfFile) {
      toast.error("Please upload a PDF file first");
      return;
    }

    const pagesToSplit = getPagesToSplit();
    if (pagesToSplit.length === 0) {
      toast.error("Please select at least one page to split");
      return;
    }

    setIsProcessing(true);

    try {
      const zip = new JSZip();
      const baseName = pdfFile.name.replace(/\.pdf$/i, "");

      // Create individual PDF for each selected page
      for (let i = 0; i < pagesToSplit.length; i++) {
        const pageNumber = pagesToSplit[i];

        // Create new PDF document
        const newPdf = await PDFDocument.create();

        // Copy the specific page
        const [copiedPage] = await newPdf.copyPages(pdfFile.pdfDoc, [
          pageNumber - 1,
        ]);
        newPdf.addPage(copiedPage);

        // Serialize the PDF
        const pdfBytes = await newPdf.save();

        // Add to ZIP with proper naming
        const fileName = `${baseName}_page_${pageNumber
          .toString()
          .padStart(3, "0")}.pdf`;
        zip.file(fileName, pdfBytes);
      }

      // Generate ZIP file
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      setZipUrl(url);

      toast.success(
        `Successfully split ${pagesToSplit.length} page${
          pagesToSplit.length !== 1 ? "s" : ""
        } into individual PDFs!`
      );
    } catch (error) {
      console.error("Split error:", error);
      toast.error(
        `Failed to split PDF: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Download ZIP file
  const downloadZip = () => {
    if (!zipUrl || !pdfFile) return;

    const link = document.createElement("a");
    link.href = zipUrl;
    const baseName = pdfFile.name.replace(/\.pdf$/i, "");
    link.download = `${baseName}_split_pages.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("ZIP file downloaded!");
  };

  // Preview PDF
  const previewPDF = () => {
    if (!pdfFile) return;
    const url = URL.createObjectURL(pdfFile.file);
    window.open(url, "_blank");
  };

  // Clear all
  const clearAll = () => {
    setPdfFile(null);
    setPageSelections([]);
    setZipUrl(null);
    setRangeStart("");
    setRangeEnd("");
    setSplitMode("all");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.success("Cleared all data");
  };

  const selectedPagesCount = pageSelections.filter((page) => page.selected)
    .length;
  const pagesToSplit = getPagesToSplit();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          PDF Splitter
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Split PDF pages into individual files and download them as a ZIP
          archive. Choose to split all pages, a range, or specific pages.
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
                      {pdfFile.pages} page{pdfFile.pages !== 1 ? "s" : ""}
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
                    <Button variant="outline" size="sm" onClick={clearAll}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                  )}
                </div>
              </div>
              <CardDescription className="dark:text-gray-300">
                Upload a PDF file to split into individual pages
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleInputChange}
                className="hidden"
              />

              {/* Drop Zone or File Info */}
              {!pdfFile ? (
                <div
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isLoading ? (
                    <div className="flex flex-col items-center">
                      <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Loading PDF...
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Please wait while we analyze your PDF
                      </p>
                    </div>
                  ) : (
                    <>
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
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* File Info */}
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-700">
                    <FileCheck className="h-8 w-8 text-green-600" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {pdfFile.name}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {formatFileSize(pdfFile.size)} • {pdfFile.pages} page
                        {pdfFile.pages !== 1 ? "s" : ""}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={previewPDF}>
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                  </div>

                  {/* Split Mode Selection */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Split Options
                    </h4>

                    <div className="space-y-3">
                      {/* All Pages */}
                      <div className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <input
                          type="radio"
                          id="split-all"
                          name="splitMode"
                          checked={splitMode === "all"}
                          onChange={() => setSplitMode("all")}
                          className="h-4 w-4 text-blue-600"
                        />
                        <label
                          htmlFor="split-all"
                          className="flex-1 cursor-pointer"
                        >
                          <div className="font-medium text-gray-900 dark:text-white">
                            Split All Pages
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Extract all {pdfFile.pages} pages as individual PDFs
                          </div>
                        </label>
                      </div>

                      {/* Page Range */}
                      <div className="flex items-start space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <input
                          type="radio"
                          id="split-range"
                          name="splitMode"
                          checked={splitMode === "range"}
                          onChange={() => setSplitMode("range")}
                          className="h-4 w-4 text-blue-600 mt-1"
                        />
                        <div className="flex-1">
                          <label
                            htmlFor="split-range"
                            className="cursor-pointer"
                          >
                            <div className="font-medium text-gray-900 dark:text-white">
                              Page Range
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              Extract a specific range of pages
                            </div>
                          </label>
                          <div className="flex items-center space-x-2">
                            <Label htmlFor="range-start" className="text-sm">
                              From:
                            </Label>
                            <Input
                              id="range-start"
                              type="number"
                              min="1"
                              max={pdfFile.pages}
                              value={rangeStart}
                              onChange={(e) => setRangeStart(e.target.value)}
                              className="w-20"
                              disabled={splitMode !== "range"}
                            />
                            <Label htmlFor="range-end" className="text-sm">
                              To:
                            </Label>
                            <Input
                              id="range-end"
                              type="number"
                              min="1"
                              max={pdfFile.pages}
                              value={rangeEnd}
                              onChange={(e) => setRangeEnd(e.target.value)}
                              className="w-20"
                              disabled={splitMode !== "range"}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Selected Pages */}
                      <div className="flex items-start space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <input
                          type="radio"
                          id="split-selected"
                          name="splitMode"
                          checked={splitMode === "selected"}
                          onChange={() => setSplitMode("selected")}
                          className="h-4 w-4 text-blue-600 mt-1"
                        />
                        <div className="flex-1">
                          <label
                            htmlFor="split-selected"
                            className="cursor-pointer"
                          >
                            <div className="font-medium text-gray-900 dark:text-white">
                              Selected Pages
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              Choose specific pages to extract (
                              {selectedPagesCount} selected)
                            </div>
                          </label>

                          {splitMode === "selected" && (
                            <div className="space-y-3">
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={selectAllPages}
                                >
                                  Select All
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={deselectAllPages}
                                >
                                  Deselect All
                                </Button>
                              </div>

                              <div className="grid grid-cols-8 gap-2 max-h-40 overflow-y-auto p-2 bg-gray-50 dark:bg-slate-900 rounded">
                                {pageSelections.map((page) => (
                                  <div
                                    key={page.pageNumber}
                                    className="flex items-center space-x-1"
                                  >
                                    <Checkbox
                                      id={`page-${page.pageNumber}`}
                                      checked={page.selected}
                                      onCheckedChange={() =>
                                        togglePageSelection(page.pageNumber)
                                      }
                                    />
                                    <label
                                      htmlFor={`page-${page.pageNumber}`}
                                      className="text-xs cursor-pointer"
                                    >
                                      {page.pageNumber}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Actions and Status */}
        <div className="space-y-6">
          {/* Split Actions */}
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 dark:text-white">
                <Scissors className="h-5 w-5" />
                <span>Split PDF</span>
              </CardTitle>
              <CardDescription className="dark:text-gray-300">
                Extract pages as individual PDFs in a ZIP file
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={splitPDF}
                disabled={!pdfFile || isProcessing || pagesToSplit.length === 0}
                className="w-full"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                    Splitting PDF...
                  </>
                ) : (
                  <>
                    <Scissors className="h-4 w-4 mr-2" />
                    Split {pagesToSplit.length} Page
                    {pagesToSplit.length !== 1 ? "s" : ""}
                  </>
                )}
              </Button>

              {!pdfFile && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    <span className="text-sm text-yellow-600 dark:text-yellow-400">
                      Upload a PDF file to get started
                    </span>
                  </div>
                </div>
              )}

              {pdfFile && pagesToSplit.length === 0 && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    <span className="text-sm text-yellow-600 dark:text-yellow-400">
                      Select at least one page to split
                    </span>
                  </div>
                </div>
              )}

              {zipUrl && (
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                        PDF split successfully!
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={downloadZip}
                    variant="outline"
                    className="w-full"
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    Download ZIP File
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary */}
          {pdfFile && (
            <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Total pages:
                  </span>
                  <Badge variant="outline">{pdfFile.pages}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Pages to split:
                  </span>
                  <Badge variant="outline">{pagesToSplit.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    File size:
                  </span>
                  <Badge variant="outline">
                    {formatFileSize(pdfFile.size)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Status:
                  </span>
                  <Badge variant={zipUrl ? "default" : "outline"}>
                    {zipUrl ? "Ready to download" : "Ready to split"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tips */}
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 dark:text-blue-400">•</span>
                  <span>Each page becomes a separate PDF file</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 dark:text-blue-400">•</span>
                  <span>Files are automatically named with page numbers</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 dark:text-blue-400">•</span>
                  <span>
                    All files are packaged in a convenient ZIP archive
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 dark:text-blue-400">•</span>
                  <span>Processing happens entirely in your browser</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 dark:text-blue-400">•</span>
                  <span>Password-protected PDFs are not supported</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Info Section */}
      <Card className="mt-8 bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">About PDF Splitter</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <p className="text-gray-600 dark:text-gray-300">
            This PDF splitter tool uses PDF-lib to extract individual pages from
            PDF documents and JSZip to package them into a convenient ZIP
            archive. All processing happens locally in your browser for maximum
            privacy and security.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mt-6">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Features:
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Split all pages or select specific ones</li>
                <li>• Page range selection</li>
                <li>• Individual page selection</li>
                <li>• ZIP archive creation</li>
                <li>• Client-side processing</li>
                <li>• Automatic file naming</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Output Format:
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Individual PDF files per page</li>
                <li>• Organized in ZIP archive</li>
                <li>• Sequential file naming</li>
                <li>• Original quality preserved</li>
                <li>• Metadata maintained</li>
                <li>• ⚠️ Password-protected PDFs not supported</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Use Cases:
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Extract specific pages from reports</li>
                <li>• Separate chapters or sections</li>
                <li>• Create individual handouts</li>
                <li>• Archive important pages</li>
                <li>• Share specific content</li>
                <li>• Organize document collections</li>
              </ul>
            </div>
          </div>
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
              Privacy & Security:
            </h4>
            <p className="text-blue-800 dark:text-blue-300 text-sm">
              Your PDF files are processed entirely in your browser using
              PDF-lib and JSZip. No files are uploaded to any server, ensuring
              complete privacy and security of your documents.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PDFSplitterPage() {
  return <PDFSplitterTool />;
}
