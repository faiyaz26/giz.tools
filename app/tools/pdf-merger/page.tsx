'use client';

import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Download, RotateCcw, Upload, FileText, GripVertical, X, Plus, Merge, AlertTriangle, CheckCircle, Eye, FileCheck } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { PDFDocument } from 'pdf-lib';

export const metadata = {
  title: 'PDF Merger - giz.tools',
  description: 'Merge multiple PDF files into a single document. Reorder pages, preview files, and download the combined PDF. Free online PDF merger with no watermarks.',
  keywords: 'pdf merger, combine pdf, merge pdf files, pdf joiner, pdf combiner, pdf tools, document merger',
  openGraph: {
    title: 'PDF Merger - giz.tools',
    description: 'Merge multiple PDF files into a single document. Reorder pages, preview files, and download the combined PDF.'
  }
};

interface PDFFile {
  id: string;
  file: File;
  name: string;
  size: number;
  pages?: number;
  preview?: string;
  pdfDoc?: PDFDocument;
}

function PDFMergerTool() {
  const [pdfFiles, setPdfFiles] = useState<PDFFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [loadingFiles, setLoadingFiles] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate unique ID for files
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Load PDF and get page count
  const loadPDFInfo = async (file: File): Promise<{ pages: number; pdfDoc: PDFDocument }> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPageCount();
      return { pages, pdfDoc };
    } catch (error) {
      console.error('Error loading PDF:', error);
      throw new Error('Failed to load PDF. The file might be corrupted or password-protected.');
    }
  };

  // Handle file upload
  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files) return;

    const newFiles: PDFFile[] = [];
    const filesToProcess: File[] = [];
    
    Array.from(files).forEach((file) => {
      if (file.type === 'application/pdf') {
        const pdfFile: PDFFile = {
          id: generateId(),
          file,
          name: file.name,
          size: file.size
        };
        newFiles.push(pdfFile);
        filesToProcess.push(file);
      } else {
        toast.error(`${file.name} is not a PDF file`);
      }
    });

    if (newFiles.length > 0) {
      setPdfFiles(prev => [...prev, ...newFiles]);
      
      // Load PDF info for each file
      for (let i = 0; i < newFiles.length; i++) {
        const pdfFile = newFiles[i];
        const file = filesToProcess[i];
        
        setLoadingFiles(prev => new Set(prev).add(pdfFile.id));
        
        try {
          const { pages, pdfDoc } = await loadPDFInfo(file);
          
          setPdfFiles(prev => prev.map(f => 
            f.id === pdfFile.id 
              ? { ...f, pages, pdfDoc }
              : f
          ));
          
          setLoadingFiles(prev => {
            const newSet = new Set(prev);
            newSet.delete(pdfFile.id);
            return newSet;
          });
        } catch (error) {
          toast.error(`Error loading ${pdfFile.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          setPdfFiles(prev => prev.filter(f => f.id !== pdfFile.id));
          setLoadingFiles(prev => {
            const newSet = new Set(prev);
            newSet.delete(pdfFile.id);
            return newSet;
          });
        }
      }
      
      toast.success(`Added ${newFiles.length} PDF file${newFiles.length !== 1 ? 's' : ''}`);
    }
  }, []);

  // Handle drag and drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // Handle file input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove file
  const removeFile = (id: string) => {
    setPdfFiles(prev => prev.filter(file => file.id !== id));
    setLoadingFiles(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
    toast.success('PDF removed');
  };

  // Clear all files
  const clearAll = () => {
    setPdfFiles([]);
    setLoadingFiles(new Set());
    setMergedPdfUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.success('All PDFs cleared');
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
    
    if (draggedIndex === null || draggedIndex === index) return;

    const newFiles = [...pdfFiles];
    const draggedFile = newFiles[draggedIndex];
    
    // Remove dragged item
    newFiles.splice(draggedIndex, 1);
    
    // Insert at new position
    newFiles.splice(index, 0, draggedFile);
    
    setPdfFiles(newFiles);
    setDraggedIndex(index);
  };

  // Move file up/down
  const moveFile = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= pdfFiles.length) return;

    const newFiles = [...pdfFiles];
    [newFiles[index], newFiles[newIndex]] = [newFiles[newIndex], newFiles[index]];
    setPdfFiles(newFiles);
  };

  // Merge PDFs using PDF-lib
  const mergePDFs = async () => {
    if (pdfFiles.length < 2) {
      toast.error('Please add at least 2 PDF files to merge');
      return;
    }

    // Check if all PDFs are loaded
    const unloadedFiles = pdfFiles.filter(file => !file.pdfDoc);
    if (unloadedFiles.length > 0) {
      toast.error('Please wait for all PDFs to finish loading');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Create a new PDF document
      const mergedPdf = await PDFDocument.create();
      
      // Copy pages from each PDF in order
      for (const pdfFile of pdfFiles) {
        if (!pdfFile.pdfDoc) continue;
        
        const pageIndices = pdfFile.pdfDoc.getPageIndices();
        const copiedPages = await mergedPdf.copyPages(pdfFile.pdfDoc, pageIndices);
        
        copiedPages.forEach((page) => {
          mergedPdf.addPage(page);
        });
      }
      
      // Serialize the PDF
      const pdfBytes = await mergedPdf.save();
      
      // Create blob and URL
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setMergedPdfUrl(url);
      
      toast.success('PDFs merged successfully!');
    } catch (error) {
      console.error('Merge error:', error);
      toast.error(`Failed to merge PDFs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Download merged PDF
  const downloadMergedPDF = () => {
    if (!mergedPdfUrl) return;

    const link = document.createElement('a');
    link.href = mergedPdfUrl;
    link.download = `merged-document-${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Merged PDF downloaded!');
  };

  // Preview PDF (simplified)
  const previewPDF = (file: PDFFile) => {
    const url = URL.createObjectURL(file.file);
    window.open(url, '_blank');
  };

  const totalSize = pdfFiles.reduce((sum, file) => sum + file.size, 0);
  const totalPages = pdfFiles.reduce((sum, file) => sum + (file.pages || 0), 0);
  const allFilesLoaded = pdfFiles.length > 0 && pdfFiles.every(file => file.pdfDoc);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">PDF Merger</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Upload multiple PDF files, reorder them as needed, and merge them into a single document. All processing happens in your browser for complete privacy.
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
                  <span>PDF Files</span>
                  {pdfFiles.length > 0 && (
                    <Badge variant="outline">{pdfFiles.length} file{pdfFiles.length !== 1 ? 's' : ''}</Badge>
                  )}
                </CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add PDFs
                  </Button>
                  {pdfFiles.length > 0 && (
                    <Button variant="outline" size="sm" onClick={clearAll}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Clear All
                    </Button>
                  )}
                </div>
              </div>
              <CardDescription className="dark:text-gray-300">
                Upload PDF files and reorder them by dragging. The files will be merged in the order shown.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* File Input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,application/pdf"
                onChange={handleInputChange}
                className="hidden"
              />

              {/* Drop Zone */}
              {pdfFiles.length === 0 && (
                <div
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Upload PDF Files
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Drag and drop PDF files here, or click to browse
                  </p>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Files
                  </Button>
                </div>
              )}

              {/* File List */}
              {pdfFiles.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <span>Drag files to reorder • {pdfFiles.length} files • {formatFileSize(totalSize)}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add More
                    </Button>
                  </div>

                  {pdfFiles.map((file, index) => {
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
                          <GripVertical className={cn("h-5 w-5", isLoading && "opacity-50")} />
                          <Badge variant="outline" className="w-8 h-6 flex items-center justify-center text-xs">
                            {index + 1}
                          </Badge>
                        </div>

                        {/* File Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <FileText className="h-4 w-4 text-red-600" />
                            <span className="font-medium text-gray-900 dark:text-white truncate">
                              {file.name}
                            </span>
                            {isLoading && (
                              <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                            )}
                            {file.pdfDoc && (
                              <FileCheck className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {formatFileSize(file.size)}
                            {file.pages && ` • ${file.pages} page${file.pages !== 1 ? 's' : ''}`}
                            {isLoading && ' • Loading...'}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => previewPDF(file)}
                            title="Preview PDF"
                            disabled={isLoading}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          <div className="flex flex-col space-y-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveFile(index, 'up')}
                              disabled={index === 0 || isLoading}
                              className="h-6 w-6 p-0"
                              title="Move up"
                            >
                              ↑
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveFile(index, 'down')}
                              disabled={index === pdfFiles.length - 1 || isLoading}
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
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            title="Remove file"
                            disabled={isLoading}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Drop zone for adding more files */}
                  <div
                    className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Plus className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Drop more PDF files here or click to add
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Actions and Status */}
        <div className="space-y-6">
          {/* Merge Actions */}
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 dark:text-white">
                <Merge className="h-5 w-5" />
                <span>Merge PDFs</span>
              </CardTitle>
              <CardDescription className="dark:text-gray-300">
                Combine all uploaded PDFs into a single document
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={mergePDFs}
                disabled={pdfFiles.length < 2 || isProcessing || !allFilesLoaded}
                className="w-full"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                    Merging PDFs...
                  </>
                ) : (
                  <>
                    <Merge className="h-4 w-4 mr-2" />
                    Merge {pdfFiles.length} PDF{pdfFiles.length !== 1 ? 's' : ''}
                  </>
                )}
              </Button>

              {pdfFiles.length < 2 && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    <span className="text-sm text-yellow-600 dark:text-yellow-400">
                      Add at least 2 PDF files to merge
                    </span>
                  </div>
                </div>
              )}

              {pdfFiles.length >= 2 && !allFilesLoaded && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                    <span className="text-sm text-blue-600 dark:text-blue-400">
                      Loading PDF files...
                    </span>
                  </div>
                </div>
              )}

              {mergedPdfUrl && (
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                        PDFs merged successfully!
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={downloadMergedPDF}
                    variant="outline"
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Merged PDF
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* File Summary */}
          {pdfFiles.length > 0 && (
            <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total files:</span>
                  <Badge variant="outline">{pdfFiles.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total pages:</span>
                  <Badge variant="outline">{totalPages}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total size:</span>
                  <Badge variant="outline">{formatFileSize(totalSize)}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                  <Badge variant={mergedPdfUrl ? "default" : allFilesLoaded ? "outline" : "secondary"}>
                    {mergedPdfUrl ? "Merged" : allFilesLoaded ? "Ready to merge" : "Loading..."}
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
                  <span>Drag files to reorder them before merging</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 dark:text-blue-400">•</span>
                  <span>Use the arrow buttons for precise positioning</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 dark:text-blue-400">•</span>
                  <span>Preview files before merging to verify content</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 dark:text-blue-400">•</span>
                  <span>All processing happens in your browser</span>
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
          <CardTitle className="dark:text-white">About PDF Merger</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <p className="text-gray-600 dark:text-gray-300">
            This PDF merger tool uses PDF-lib to combine multiple PDF documents into a single file. 
            All processing happens locally in your browser for maximum privacy and security.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mt-6">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Features:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Drag and drop file upload</li>
                <li>• Reorder files with drag and drop</li>
                <li>• Preview PDFs before merging</li>
                <li>• Client-side processing</li>
                <li>• Page count detection</li>
                <li>• Real PDF merging with PDF-lib</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Supported Files:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• PDF documents (.pdf)</li>
                <li>• Any PDF version</li>
                <li>• Scanned documents</li>
                <li>• Form-filled PDFs</li>
                <li>• Multi-page documents</li>
                <li>• ⚠️ Password-protected PDFs not supported</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Use Cases:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Combine report chapters</li>
                <li>• Merge contract documents</li>
                <li>• Consolidate invoices</li>
                <li>• Create document packages</li>
                <li>• Combine presentation slides</li>
                <li>• Archive related documents</li>
              </ul>
            </div>
          </div>
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Privacy & Security:</h4>
            <p className="text-blue-800 dark:text-blue-300 text-sm">
              Your PDF files are processed entirely in your browser using PDF-lib. No files are uploaded to any server, 
              ensuring complete privacy and security of your documents.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PDFMergerPage() {
  return <PDFMergerTool />;
}