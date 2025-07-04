"use client";

import { useState, useRef } from "react";
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
  X,
  GripVertical,
  FileCheck,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PDFDocument, PageSizes } from "pdf-lib";

type PageSize = "A4" | "Letter" | "Legal" | "A3" | "A5" | "Custom";
type ImageQuality = "high" | "medium" | "low";

interface ImageFile {
  id: string;
  file: File;
  name: string;
  size: number;
  preview: string;
  dimensions?: { width: number; height: number };
}

export default function ImageToPdfPage() {
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pageSize, setPageSize] = useState<PageSize>("A4");
  const [imageQuality, setImageQuality] = useState<ImageQuality>("high");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [loadingFiles, setLoadingFiles] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate unique ID for files
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Get image dimensions
  const getImageDimensions = (
    file: File
  ): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.src = URL.createObjectURL(file);
    });
  };

  // Handle file upload
  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;

    const newFiles: ImageFile[] = [];
    const filesToProcess: File[] = [];

    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const imageFile: ImageFile = {
          id: generateId(),
          file,
          name: file.name,
          size: file.size,
          preview: URL.createObjectURL(file),
        };
        newFiles.push(imageFile);
        filesToProcess.push(file);
      } else {
        toast.error(`${file.name} is not a valid image file`);
      }
    });

    if (newFiles.length === 0) return;

    setImageFiles((prev) => [...prev, ...newFiles]);

    // Set loading state for new files
    const newFileIds = newFiles.map((f) => f.id);
    setLoadingFiles((prev) => {
      const newSet = new Set(prev);
      newFileIds.forEach((id) => newSet.add(id));
      return newSet;
    });

    // Process each file to get dimensions
    for (let i = 0; i < filesToProcess.length; i++) {
      try {
        const dimensions = await getImageDimensions(filesToProcess[i]);
        setImageFiles((prev) =>
          prev.map((file) =>
            file.id === newFiles[i].id ? { ...file, dimensions } : file
          )
        );
      } catch (error) {
        console.error(
          `Error getting dimensions for ${filesToProcess[i].name}:`,
          error
        );
      } finally {
        setLoadingFiles((prev) => {
          const newSet = new Set(prev);
          newSet.delete(newFiles[i].id);
          return newSet;
        });
      }
    }

    toast.success(
      `Added ${newFiles.length} image${newFiles.length !== 1 ? "s" : ""}`
    );
  };

  // Handle drag and drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Handle file input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Remove file
  const removeFile = (id: string) => {
    setImageFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter((file) => file.id !== id);
    });
    setLoadingFiles((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
    toast.success("Image removed");
  };

  // Clear all files
  const clearAll = () => {
    imageFiles.forEach((file) => URL.revokeObjectURL(file.preview));
    setImageFiles([]);
    setLoadingFiles(new Set());
    setPdfUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.success("All images cleared");
  };

  // Drag and drop reordering
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleDragOverItem = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    const draggedFile = imageFiles[draggedIndex];
    const newFiles = [...imageFiles];
    newFiles.splice(draggedIndex, 1);
    newFiles.splice(index, 0, draggedFile);

    setImageFiles(newFiles);
    setDraggedIndex(index);
  };

  // Move file up/down
  const moveFile = (index: number, direction: "up" | "down") => {
    const newFiles = [...imageFiles];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newFiles.length) return;

    [newFiles[index], newFiles[targetIndex]] = [
      newFiles[targetIndex],
      newFiles[index],
    ];
    setImageFiles(newFiles);
  };

  // Get page dimensions based on size
  const getPageDimensions = (size: PageSize) => {
    switch (size) {
      case "A4":
        return PageSizes.A4;
      case "Letter":
        return PageSizes.Letter;
      case "Legal":
        return PageSizes.Legal;
      case "A3":
        return PageSizes.A3;
      case "A5":
        return PageSizes.A5;
      default:
        return PageSizes.A4;
    }
  };

  // Convert images to PDF
  const convertToPdf = async () => {
    if (imageFiles.length === 0) {
      toast.error("Please add at least one image");
      return;
    }

    setIsProcessing(true);

    try {
      const pdfDoc = await PDFDocument.create();
      const pageDimensions = getPageDimensions(pageSize);

      for (const imageFile of imageFiles) {
        const page = pdfDoc.addPage(pageDimensions);
        const { width: pageWidth, height: pageHeight } = page.getSize();

        let embeddedImage;

        // Embed image based on type
        if (
          imageFile.file.type === "image/jpeg" ||
          imageFile.file.type === "image/jpg"
        ) {
          const imageBytes = await imageFile.file.arrayBuffer();
          embeddedImage = await pdfDoc.embedJpg(imageBytes);
        } else if (imageFile.file.type === "image/png") {
          const imageBytes = await imageFile.file.arrayBuffer();
          embeddedImage = await pdfDoc.embedPng(imageBytes);
        } else {
          // For other formats, convert to PNG using canvas
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d")!;
          const img = new Image();

          await new Promise((resolve) => {
            img.onload = resolve;
            img.src = imageFile.preview;
          });

          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          const pngDataUrl = canvas.toDataURL("image/png");
          const pngBytes = await fetch(pngDataUrl).then((res) =>
            res.arrayBuffer()
          );
          embeddedImage = await pdfDoc.embedPng(pngBytes);
        }

        const { width: imgWidth, height: imgHeight } = embeddedImage.size();

        // Calculate scaling to fit image within page while maintaining aspect ratio
        const scaleX = pageWidth / imgWidth;
        const scaleY = pageHeight / imgHeight;
        const scale = Math.min(scaleX, scaleY);

        const scaledWidth = imgWidth * scale;
        const scaledHeight = imgHeight * scale;

        // Center the image on the page
        const x = (pageWidth - scaledWidth) / 2;
        const y = (pageHeight - scaledHeight) / 2;

        page.drawImage(embeddedImage, {
          x,
          y,
          width: scaledWidth,
          height: scaledHeight,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);

      toast.success(
        `PDF created with ${imageFiles.length} page${
          imageFiles.length !== 1 ? "s" : ""
        }`
      );
    } catch (error) {
      console.error("Error creating PDF:", error);
      toast.error("Failed to create PDF");
    } finally {
      setIsProcessing(false);
    }
  };

  // Download PDF
  const downloadPdf = () => {
    if (!pdfUrl) return;

    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `images-to-pdf-${
      new Date().toISOString().split("T")[0]
    }.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("PDF downloaded!");
  };

  const totalSize = imageFiles.reduce((sum, file) => sum + file.size, 0);
  const allFilesLoaded =
    imageFiles.length > 0 &&
    imageFiles.every((file) => !loadingFiles.has(file.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Image to PDF Converter
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Convert multiple images to a single PDF document. Upload images,
          reorder them, and customize the output. All processing happens in your
          browser for complete privacy.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Upload Section */}
        <div className="lg:col-span-2">
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2 dark:text-white">
                  <ImageIcon className="h-5 w-5" />
                  <span>Images</span>
                  {imageFiles.length > 0 && (
                    <Badge variant="outline">
                      {imageFiles.length} file
                      {imageFiles.length !== 1 ? "s" : ""}
                    </Badge>
                  )}
                </CardTitle>
                <div className="flex space-x-2">
                  {imageFiles.length > 0 && (
                    <Button variant="outline" size="sm" onClick={clearAll}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Clear All
                    </Button>
                  )}
                </div>
              </div>
              <CardDescription className="dark:text-gray-300">
                Upload image files and reorder them by dragging. Images will be
                converted to PDF in the order shown.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* File Input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleInputChange}
                className="hidden"
              />

              {/* Drop Zone */}
              {imageFiles.length === 0 && (
                <div
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Upload Image Files
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Drag and drop image files here, or click to browse
                  </p>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Files
                  </Button>
                </div>
              )}

              {/* File List */}
              {imageFiles.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <span>
                      Drag images to reorder • {imageFiles.length} files •{" "}
                      {formatFileSize(totalSize)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add More
                    </Button>
                  </div>

                  {imageFiles.map((file, index) => {
                    const isLoading = loadingFiles.has(file.id);
                    return (
                      <div
                        key={file.id}
                        draggable={!isLoading}
                        onDragStart={() => !isLoading && handleDragStart(index)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => handleDragOverItem(e, index)}
                        className={cn(
                          "flex items-center space-x-4 p-4 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-700 transition-all duration-200",
                          draggedIndex === index && "opacity-50 scale-95",
                          !isLoading && "hover:shadow-md cursor-move",
                          isLoading && "opacity-75"
                        )}
                      >
                        {/* Drag Handle */}
                        <div className="flex items-center space-x-2 text-gray-400">
                          <GripVertical
                            className={cn("h-5 w-5", isLoading && "opacity-50")}
                          />
                          <Badge
                            variant="outline"
                            className="w-8 h-6 flex items-center justify-center text-xs"
                          >
                            {index + 1}
                          </Badge>
                        </div>

                        {/* Image Preview */}
                        <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={file.preview}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* File Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-gray-900 dark:text-white truncate">
                              {file.name}
                            </span>
                            {isLoading && (
                              <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                            )}
                            {file.dimensions && (
                              <FileCheck className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {formatFileSize(file.size)}
                            {file.dimensions &&
                              ` • ${file.dimensions.width}×${file.dimensions.height}px`}
                            {isLoading && " • Loading..."}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          <div className="flex flex-col space-y-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveFile(index, "up")}
                              disabled={index === 0 || isLoading}
                              className="h-6 w-6 p-0"
                              title="Move up"
                            >
                              ↑
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveFile(index, "down")}
                              disabled={
                                index === imageFiles.length - 1 || isLoading
                              }
                              className="h-6 w-6 p-0"
                              title="Move down"
                            >
                              ↓
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(file.id)}
                            disabled={isLoading}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                            title="Remove image"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Convert Button */}
              {imageFiles.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Ready to convert {imageFiles.length} image
                      {imageFiles.length !== 1 ? "s" : ""} to PDF
                    </div>
                    <Button
                      onClick={convertToPdf}
                      disabled={isProcessing || !allFilesLoaded}
                      className="flex items-center space-x-2"
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                          <span>Converting...</span>
                        </>
                      ) : (
                        <>
                          <FileText className="h-4 w-4" />
                          <span>Convert to PDF</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Download PDF */}
              {pdfUrl && (
                <div className="mt-6 p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileCheck className="h-5 w-5 text-green-600" />
                      <span className="text-green-800 dark:text-green-200 font-medium">
                        PDF created successfully!
                      </span>
                    </div>
                    <Button
                      onClick={downloadPdf}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
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
                <span>PDF Settings</span>
              </CardTitle>
              <CardDescription className="dark:text-gray-300">
                Configure PDF page size and image quality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="page-size">Page Size</Label>
                <Select
                  value={pageSize}
                  onValueChange={(value) => setPageSize(value as PageSize)}
                >
                  <SelectTrigger id="page-size">
                    <SelectValue placeholder="Select page size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A4">A4 (210×297mm)</SelectItem>
                    <SelectItem value="Letter">Letter (8.5×11in)</SelectItem>
                    <SelectItem value="Legal">Legal (8.5×14in)</SelectItem>
                    <SelectItem value="A3">A3 (297×420mm)</SelectItem>
                    <SelectItem value="A5">A5 (148×210mm)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image-quality">Image Quality</Label>
                <Select
                  value={imageQuality}
                  onValueChange={(value) =>
                    setImageQuality(value as ImageQuality)
                  }
                >
                  <SelectTrigger id="image-quality">
                    <SelectValue placeholder="Select quality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High Quality</SelectItem>
                    <SelectItem value="medium">Medium Quality</SelectItem>
                    <SelectItem value="low">
                      Low Quality (Smaller File)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {imageFiles.length > 0 && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Images:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {imageFiles.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Total size:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatFileSize(totalSize)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Page size:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {pageSize}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700 mt-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 dark:text-white">
                <ImageIcon className="h-5 w-5" />
                <span>How to Use</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 dark:text-blue-400 text-xs font-medium">
                      1
                    </span>
                  </div>
                  <span>
                    Upload multiple image files (PNG, JPG, GIF, WebP, etc.)
                  </span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 dark:text-blue-400 text-xs font-medium">
                      2
                    </span>
                  </div>
                  <span>Drag and drop to reorder images as needed</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 dark:text-blue-400 text-xs font-medium">
                      3
                    </span>
                  </div>
                  <span>Choose page size and image quality settings</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 dark:text-blue-400 text-xs font-medium">
                      4
                    </span>
                  </div>
                  <span>Click Convert to PDF and download your document</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
