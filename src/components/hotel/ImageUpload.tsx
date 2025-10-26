import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon, Link } from 'lucide-react';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  label?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onImagesChange,
  maxImages = 10,
  label = "Images"
}) => {
  const [newImageUrl, setNewImageUrl] = useState('');
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addImage = () => {
    if (newImageUrl.trim() && !images.includes(newImageUrl.trim()) && images.length < maxImages) {
      onImagesChange([...images, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = maxImages - images.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    const newImages: string[] = [];
    let processedCount = 0;

    filesToProcess.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          newImages.push(base64String);
          processedCount++;

          // Once all files are processed, update the images array
          if (processedCount === filesToProcess.length) {
            onImagesChange([...images, ...newImages]);
          }
        };
        reader.readAsDataURL(file);
      }
    });

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (imageUrl: string) => {
    onImagesChange(images.filter(img => img !== imageUrl));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addImage();
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
          >
            <Upload className="h-4 w-4 mr-1" />
            Upload Files
          </Button>
          <Button
            type="button"
            variant={uploadMode === 'url' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setUploadMode('url')}
          >
            <Link className="h-4 w-4 mr-1" />
            Add URL
          </Button>
        </div>

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
            />
            <label htmlFor="file-upload">
              <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-muted-foreground/50 transition-colors">
                <div className="text-center">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload images from your device
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {images.length}/{maxImages} images uploaded
                  </p>
                </div>
              </div>
            </label>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="Add image URL"
              onKeyPress={handleKeyPress}
              disabled={images.length >= maxImages}
            />
            <Button
              type="button"
              onClick={addImage}
              size="sm"
              disabled={!newImageUrl.trim() || images.includes(newImageUrl.trim()) || images.length >= maxImages}
            >
              <Upload className="h-4 w-4" />
            </Button>
          </div>
        )}

        {images.length >= maxImages && (
          <p className="text-sm text-muted-foreground">
            Maximum {maxImages} images allowed
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
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(imageUrl)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {images.length === 0 && uploadMode === 'url' && (
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
