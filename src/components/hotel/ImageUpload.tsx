import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Upload, X, Image as ImageIcon, Link, Loader2, AlertCircle } from 'lucide-react';
import { uploadImage, deleteImage, isSupabaseStorageUrl, StorageBucket } from '@/lib/supabase';
import { compressImage, validateImageFile, generateUniqueFileName } from '@/lib/imageUtils';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  label?: string;
  bucket: StorageBucket;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onImagesChange,
  maxImages = 10,
  label = "Images",
  bucket
}) => {
  const [newImageUrl, setNewImageUrl] = useState('');
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addUrlImage = () => {
    setError(null);
    if (newImageUrl.trim() && !images.includes(newImageUrl.trim()) && images.length < maxImages) {
      // Validate URL format
      try {
        new URL(newImageUrl.trim());
        onImagesChange([...images, newImageUrl.trim()]);
        setNewImageUrl('');
      } catch {
        setError('Please enter a valid URL');
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError(null);
    setUploading(true);
    setUploadProgress(0);

    const remainingSlots = maxImages - images.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    const newImageUrls: string[] = [];
    const errors: string[] = [];

    for (let i = 0; i < filesToProcess.length; i++) {
      const file = filesToProcess[i];
      
      // Validate file
      const validation = validateImageFile(file, 5);
      if (!validation.valid) {
        errors.push(`${file.name}: ${validation.error}`);
        continue;
      }

      try {
        // Compress image
        const compressedBlob = await compressImage(file, {
          maxSizeMB: 5,
          maxWidthOrHeight: 1920,
          quality: 0.8
        });

        // Generate unique filename
        const uniqueFileName = generateUniqueFileName(file.name);

        // Upload to Supabase Storage
        const result = await uploadImage(compressedBlob, bucket, uniqueFileName);

        if (result.error) {
          errors.push(`${file.name}: ${result.error}`);
        } else {
          newImageUrls.push(result.url);
        }
      } catch (err) {
        errors.push(`${file.name}: Upload failed`);
        console.error('Upload error:', err);
      }

      // Update progress
      setUploadProgress(((i + 1) / filesToProcess.length) * 100);
    }

    // Update images array with successfully uploaded URLs
    if (newImageUrls.length > 0) {
      onImagesChange([...images, ...newImageUrls]);
    }

    // Show errors if any
    if (errors.length > 0) {
      setError(errors.join(', '));
    }

    setUploading(false);
    setUploadProgress(0);

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = async (imageUrl: string) => {
    // If it's a Supabase Storage URL, delete from storage
    if (isSupabaseStorageUrl(imageUrl)) {
      try {
        await deleteImage(imageUrl);
      } catch (err) {
        console.error('Failed to delete image from storage:', err);
        // Continue with removal from array even if deletion fails
      }
    }
    
    // Remove from array
    onImagesChange(images.filter(img => img !== imageUrl));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addUrlImage();
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{label}</Label>

        {/* Toggle between file upload and URL */}
        <div className="flex gap-2 mb-2">
          <Button
            type="button"
            variant={uploadMode === 'file' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setUploadMode('file')}
            disabled={uploading}
          >
            <Upload className="h-4 w-4 mr-1" />
            Upload Files
          </Button>
          <Button
            type="button"
            variant={uploadMode === 'url' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setUploadMode('url')}
            disabled={uploading}
          >
            <Link className="h-4 w-4 mr-1" />
            Add URL
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        )}

        {uploadMode === 'file' ? (
          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
              disabled={uploading || images.length >= maxImages}
            />
            <label htmlFor="file-upload">
              <div className={`flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg transition-colors ${
                uploading || images.length >= maxImages 
                  ? 'border-muted-foreground/10 cursor-not-allowed bg-muted/20' 
                  : 'border-muted-foreground/25 cursor-pointer hover:border-muted-foreground/50'
              }`}>
                <div className="text-center">
                  {uploading ? (
                    <>
                      <Loader2 className="h-8 w-8 text-primary mx-auto mb-2 animate-spin" />
                      <p className="text-sm text-muted-foreground">
                        Uploading images...
                      </p>
                      <Progress value={uploadProgress} className="w-32 mx-auto mt-2" />
                    </>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload images
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Max 5MB per image • {images.length}/{maxImages} uploaded
                      </p>
                    </>
                  )}
                </div>
              </div>
            </label>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="Add image URL (https://...)"
              onKeyPress={handleKeyPress}
              disabled={images.length >= maxImages || uploading}
            />
            <Button
              type="button"
              onClick={addUrlImage}
              size="sm"
              disabled={!newImageUrl.trim() || images.includes(newImageUrl.trim()) || images.length >= maxImages || uploading}
            >
              <Upload className="h-4 w-4" />
            </Button>
          </div>
        )}

        {images.length >= maxImages && (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            Maximum {maxImages} images reached
          </p>
        )}
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {images.map((imageUrl, index) => (
            <Card key={index} className="relative group">
              <CardContent className="p-2">
                <div className="relative">
                  <img
                    src={imageUrl}
                    alt={`Image ${index + 1}`}
                    className="w-full h-20 object-cover rounded border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(imageUrl)}
                    disabled={uploading}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  {isSupabaseStorageUrl(imageUrl) && (
                    <div className="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-1 rounded">
                      ☁️
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
          <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No images added yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Upload files from your device or add image URLs
          </p>
        </div>
      )}
    </div>
  );
};
