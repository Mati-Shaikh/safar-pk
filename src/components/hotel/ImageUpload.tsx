import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

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

  const addImage = () => {
    if (newImageUrl.trim() && !images.includes(newImageUrl.trim()) && images.length < maxImages) {
      onImagesChange([...images, newImageUrl.trim()]);
      setNewImageUrl('');
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

      {images.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
          <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No images added yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Add image URLs to showcase your property
          </p>
        </div>
      )}
    </div>
  );
};
