'use client';

import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Download, RotateCcw, Upload, Image as ImageIcon, Crop, Maximize as Resize, Settings, AlertTriangle, CheckCircle, Eye, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export const metadata = {
  title: 'Image Converter - giz.tools',
  description: 'Convert images between formats, resize, compress, and optimize with quality control. Free online image converter with no watermarks.',
  keywords: 'image converter, image resize, image compression, jpg to png, png to jpg, webp converter, image optimizer, photo editor',
  openGraph: {
    title: 'Image Converter - giz.tools',
    description: 'Convert images between formats, resize, compress, and optimize with quality control. Free online image converter with no watermarks.'
  }
};

interface ImageFile {
  id: string;
  file: File;
  name: string;
  size: number;
  width: number;
  height: number;
  format: string;
  dataUrl: string;
}

interface ConversionSettings {
  format: string;
  quality: number;
  width: number;
  height: number;
  maintainAspectRatio: boolean;
  cropX: number;
  cropY: number;
  cropWidth: number;
  cropHeight: number;
  enableCrop: boolean;
}

interface ProcessedImage {
  dataUrl: string;
  blob: Blob;
  size: number;
  width: number;
  height: number;
  format: string;
}

function ImageConverterTool() {
  const [imageFile, setImageFile] = useState<ImageFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImage, setProcessedImage] = useState<ProcessedImage | null>(null);
  const [settings, setSettings] = useState<ConversionSettings>({
    format: 'jpeg',
    quality: 90,
    width: 0,
    height: 0,
    maintainAspectRatio: true,
    cropX: 0,
    cropY: 0,
    cropWidth: 0,
    cropHeight: 0,
    enableCrop: false
  });
  const [cropSelection, setCropSelection] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cropCanvasRef = useRef<HTMLCanvasElement>(null);

  const supportedFormats = [
    { value: 'jpeg', label: 'JPEG', extension: '.jpg' },
    { value: 'png', label: 'PNG', extension: '.png' },
    { value: 'webp', label: 'WebP', extension: '.webp' },
    { value: 'bmp', label: 'BMP', extension: '.bmp' },
    { value: 'gif', label: 'GIF', extension: '.gif' }
  ];

  // Generate unique ID
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Load image and get dimensions
  const loadImageInfo = (file: File): Promise<ImageFile> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        img.onload = () => {
          const imageFile: ImageFile = {
            id: generateId(),
            file,
            name: file.name,
            size: file.size,
            width: img.width,
            height: img.height,
            format: file.type.split('/')[1] || 'unknown',
            dataUrl
          };
          resolve(imageFile);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = dataUrl;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  // Handle file upload
  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setIsLoading(true);
    setProcessedImage(null);

    try {
      const imageData = await loadImageInfo(file);
      setImageFile(imageData);
      
      // Initialize settings with original dimensions
      setSettings(prev => ({
        ...prev,
        width: imageData.width,
        height: imageData.height,
        cropWidth: imageData.width,
        cropHeight: imageData.height
      }));

      setCropSelection({
        x: 0,
        y: 0,
        width: imageData.width,
        height: imageData.height
      });

      toast.success(`Image loaded successfully! ${imageData.width}×${imageData.height}`);
    } catch (error) {
      toast.error(`Error loading image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle drag and drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  // Handle file input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Update settings
  const updateSettings = (key: keyof ConversionSettings, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      
      // Maintain aspect ratio for width/height changes
      if (imageFile && newSettings.maintainAspectRatio) {
        const aspectRatio = imageFile.width / imageFile.height;
        
        if (key === 'width') {
          newSettings.height = Math.round(value / aspectRatio);
        } else if (key === 'height') {
          newSettings.width = Math.round(value * aspectRatio);
        }
      }
      
      return newSettings;
    });
  };

  // Process image with current settings
  const processImage = async (): Promise<ProcessedImage> => {
    if (!imageFile) throw new Error('No image loaded');

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Determine source dimensions (crop or full image)
        let sourceX = 0;
        let sourceY = 0;
        let sourceWidth = img.width;
        let sourceHeight = img.height;

        if (settings.enableCrop) {
          sourceX = settings.cropX;
          sourceY = settings.cropY;
          sourceWidth = settings.cropWidth;
          sourceHeight = settings.cropHeight;
        }

        // Set canvas dimensions to target size
        canvas.width = settings.width;
        canvas.height = settings.height;

        // Draw image with scaling and cropping
        ctx.drawImage(
          img,
          sourceX, sourceY, sourceWidth, sourceHeight,
          0, 0, settings.width, settings.height
        );

        // Convert to blob with specified format and quality
        const quality = settings.quality / 100;
        const mimeType = `image/${settings.format}`;

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob'));
              return;
            }

            const processedImage: ProcessedImage = {
              dataUrl: canvas.toDataURL(mimeType, quality),
              blob,
              size: blob.size,
              width: settings.width,
              height: settings.height,
              format: settings.format
            };

            resolve(processedImage);
          },
          mimeType,
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image for processing'));
      img.src = imageFile.dataUrl;
    });
  };

  // Convert image
  const convertImage = async () => {
    if (!imageFile) {
      toast.error('Please upload an image first');
      return;
    }

    setIsProcessing(true);

    try {
      const processed = await processImage();
      setProcessedImage(processed);
      toast.success('Image converted successfully!');
    } catch (error) {
      console.error('Conversion error:', error);
      toast.error(`Failed to convert image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Download processed image
  const downloadImage = () => {
    if (!processedImage || !imageFile) return;

    const link = document.createElement('a');
    link.href = processedImage.dataUrl;
    
    const baseName = imageFile.name.replace(/\.[^/.]+$/, '');
    const extension = supportedFormats.find(f => f.value === processedImage.format)?.extension || '.jpg';
    link.download = `${baseName}_converted${extension}`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Image downloaded!');
  };

  // Clear all
  const clearAll = () => {
    setImageFile(null);
    setProcessedImage(null);
    setSettings({
      format: 'jpeg',
      quality: 90,
      width: 0,
      height: 0,
      maintainAspectRatio: true,
      cropX: 0,
      cropY: 0,
      cropWidth: 0,
      cropHeight: 0,
      enableCrop: false
    });
    setCropSelection({ x: 0, y: 0, width: 0, height: 0 });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.success('Cleared all data');
  };

  // Quick resize presets
  const applyPreset = (preset: string) => {
    if (!imageFile) return;

    const aspectRatio = imageFile.width / imageFile.height;
    let newWidth = imageFile.width;
    let newHeight = imageFile.height;

    switch (preset) {
      case 'thumbnail':
        newWidth = 150;
        newHeight = Math.round(150 / aspectRatio);
        break;
      case 'small':
        newWidth = 400;
        newHeight = Math.round(400 / aspectRatio);
        break;
      case 'medium':
        newWidth = 800;
        newHeight = Math.round(800 / aspectRatio);
        break;
      case 'large':
        newWidth = 1200;
        newHeight = Math.round(1200 / aspectRatio);
        break;
      case 'hd':
        newWidth = 1920;
        newHeight = 1080;
        break;
      case 'square':
        const size = Math.min(imageFile.width, imageFile.height);
        newWidth = size;
        newHeight = size;
        break;
    }

    setSettings(prev => ({
      ...prev,
      width: newWidth,
      height: newHeight,
      maintainAspectRatio: preset !== 'hd' && preset !== 'square'
    }));
  };

  const compressionRatio = processedImage && imageFile 
    ? Math.round((1 - processedImage.size / imageFile.size) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Image Converter</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Convert images between formats, resize, compress, adjust quality, and crop. All processing happens in your browser for complete privacy.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Upload and Preview Section */}
        <div className="lg:col-span-2">
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2 dark:text-white">
                  <ImageIcon className="h-5 w-5" />
                  <span>Image Upload & Preview</span>
                  {imageFile && (
                    <Badge variant="outline">
                      {imageFile.width}×{imageFile.height}
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
                    Upload Image
                  </Button>
                  {imageFile && (
                    <Button variant="outline" size="sm" onClick={clearAll}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                  )}
                </div>
              </div>
              <CardDescription className="dark:text-gray-300">
                Upload an image to convert, resize, compress, or crop
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleInputChange}
                className="hidden"
              />

              {/* Drop Zone or Image Preview */}
              {!imageFile ? (
                <div
                  className={cn(
                    "border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer",
                    isDragging 
                      ? "border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                      : "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500"
                  )}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isLoading ? (
                    <div className="flex flex-col items-center">
                      <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Loading Image...
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Please wait while we process your image
                      </p>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Upload Image File
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Drag and drop an image here, or click to browse
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                        Supports: JPEG, PNG, WebP, BMP, GIF
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
                  {/* Image Info */}
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-700">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {imageFile.name}
                        </span>
                        <Badge variant="outline">{imageFile.format.toUpperCase()}</Badge>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {formatFileSize(imageFile.size)} • {imageFile.width}×{imageFile.height}
                      </div>
                    </div>
                  </div>

                  {/* Image Preview */}
                  <Tabs defaultValue="original" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="original">Original</TabsTrigger>
                      <TabsTrigger value="preview" disabled={!processedImage}>
                        Preview {processedImage && '✓'}
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="original" className="space-y-4">
                      <div className="relative border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <img
                          src={imageFile.dataUrl}
                          alt="Original"
                          className="w-full h-auto max-h-96 object-contain bg-gray-50 dark:bg-slate-900"
                        />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="preview" className="space-y-4">
                      {processedImage ? (
                        <div className="space-y-4">
                          <div className="relative border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                            <img
                              src={processedImage.dataUrl}
                              alt="Processed"
                              className="w-full h-auto max-h-96 object-contain bg-gray-50 dark:bg-slate-900"
                            />
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                            <span>
                              {processedImage.width}×{processedImage.height} • {formatFileSize(processedImage.size)}
                            </span>
                            {compressionRatio > 0 && (
                              <Badge variant="outline" className="text-green-600 dark:text-green-400">
                                {compressionRatio}% smaller
                              </Badge>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                          <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Convert the image to see preview</p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Settings Panel */}
        <div className="space-y-6">
          {/* Conversion Settings */}
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 dark:text-white">
                <Settings className="h-5 w-5" />
                <span>Conversion Settings</span>
              </CardTitle>
              <CardDescription className="dark:text-gray-300">
                Configure output format and quality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Output Format */}
              <div className="space-y-2">
                <Label htmlFor="format">Output Format</Label>
                <Select
                  value={settings.format}
                  onValueChange={(value) => updateSettings('format', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {supportedFormats.map((format) => (
                      <SelectItem key={format.value} value={format.value}>
                        {format.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quality Slider */}
              {(settings.format === 'jpeg' || settings.format === 'webp') && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="quality">Quality</Label>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {settings.quality}%
                    </span>
                  </div>
                  <Slider
                    value={[settings.quality]}
                    onValueChange={(value) => updateSettings('quality', value[0])}
                    min={10}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>
              )}

              {/* Quick Presets */}
              {imageFile && (
                <div className="space-y-2">
                  <Label>Quick Presets</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => applyPreset('thumbnail')}
                    >
                      Thumbnail
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => applyPreset('small')}
                    >
                      Small
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => applyPreset('medium')}
                    >
                      Medium
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => applyPreset('large')}
                    >
                      Large
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => applyPreset('hd')}
                    >
                      HD
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => applyPreset('square')}
                    >
                      Square
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resize Settings */}
          {imageFile && (
            <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 dark:text-white">
                  <Resize className="h-5 w-5" />
                  <span>Resize</span>
                </CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Adjust image dimensions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Maintain Aspect Ratio */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="aspectRatio"
                    checked={settings.maintainAspectRatio}
                    onChange={(e) => updateSettings('maintainAspectRatio', e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="aspectRatio" className="text-sm">
                    Maintain aspect ratio
                  </Label>
                </div>

                {/* Width and Height */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="width">Width (px)</Label>
                    <Input
                      id="width"
                      type="number"
                      min="1"
                      max="10000"
                      value={settings.width}
                      onChange={(e) => updateSettings('width', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (px)</Label>
                    <Input
                      id="height"
                      type="number"
                      min="1"
                      max="10000"
                      value={settings.height}
                      onChange={(e) => updateSettings('height', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>

                {/* Original Size Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setSettings(prev => ({
                      ...prev,
                      width: imageFile.width,
                      height: imageFile.height
                    }));
                  }}
                >
                  Reset to Original Size
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Convert Button */}
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 dark:text-white">
                <Zap className="h-5 w-5" />
                <span>Convert Image</span>
              </CardTitle>
              <CardDescription className="dark:text-gray-300">
                Process image with current settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={convertImage}
                disabled={!imageFile || isProcessing}
                className="w-full"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                    Converting...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Convert Image
                  </>
                )}
              </Button>

              {!imageFile && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    <span className="text-sm text-yellow-600 dark:text-yellow-400">
                      Upload an image to get started
                    </span>
                  </div>
                </div>
              )}

              {processedImage && (
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                        Image converted successfully!
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={downloadImage}
                    variant="outline"
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Image
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary */}
          {imageFile && (
            <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Original:</span>
                  <Badge variant="outline">
                    {imageFile.width}×{imageFile.height}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Output:</span>
                  <Badge variant="outline">
                    {settings.width}×{settings.height}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Format:</span>
                  <Badge variant="outline">
                    {imageFile.format.toUpperCase()} → {settings.format.toUpperCase()}
                  </Badge>
                </div>
                {processedImage && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Size change:</span>
                    <Badge variant={compressionRatio > 0 ? "default" : "outline"}>
                      {compressionRatio > 0 ? `-${compressionRatio}%` : `+${Math.abs(compressionRatio)}%`}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Info Section */}
      <Card className="mt-8 bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">About Image Converter</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <p className="text-gray-600 dark:text-gray-300">
            This image converter tool processes images entirely in your browser using HTML5 Canvas. 
            Convert between formats, resize, compress, and optimize images without uploading to any server.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mt-6">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Supported Formats:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• <strong>JPEG:</strong> Best for photos</li>
                <li>• <strong>PNG:</strong> Supports transparency</li>
                <li>• <strong>WebP:</strong> Modern, efficient format</li>
                <li>• <strong>BMP:</strong> Uncompressed bitmap</li>
                <li>• <strong>GIF:</strong> Simple animations</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Features:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Format conversion</li>
                <li>• Quality adjustment</li>
                <li>• Resize and scale</li>
                <li>• Aspect ratio control</li>
                <li>• Quick size presets</li>
                <li>• Real-time preview</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Use Cases:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Web optimization</li>
                <li>• Social media sizing</li>
                <li>• Email attachments</li>
                <li>• Print preparation</li>
                <li>• Thumbnail creation</li>
                <li>• Format compatibility</li>
              </ul>
            </div>
          </div>
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Privacy & Performance:</h4>
            <p className="text-blue-800 dark:text-blue-300 text-sm">
              All image processing happens locally in your browser using HTML5 Canvas. No images are uploaded to any server, 
              ensuring complete privacy and fast processing speeds.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ImageConverterPage() {
  return <ImageConverterTool />;
}