import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Building } from 'lucide-react';
import { Hotel } from '@/types';
import { ImageUpload } from './ImageUpload';

const AVAILABLE_AMENITIES = [
  'WiFi',
  'Swimming Pool',
  'Gym/Fitness Center',
  'Restaurant',
  'Bar/Lounge',
  'Room Service',
  'Parking',
  'Free Parking',
  'Spa',
  'Concierge',
  'Laundry Service',
  'Business Center',
  'Conference Rooms',
  'Airport Shuttle',
  'Pet Friendly',
  'Air Conditioning',
  'Breakfast Included',
  '24/7 Front Desk',
  'Elevator',
  'Non-Smoking Rooms'
];

interface HotelFormProps {
  hotel?: Hotel;
  onSubmit: (hotelData: {
    name: string;
    description: string;
    location: string;
    amenities: string[];
    images: string[];
  }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const HotelForm: React.FC<HotelFormProps> = ({
  hotel,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    name: hotel?.name || '',
    description: hotel?.description || '',
    location: hotel?.location || '',
    amenities: hotel?.amenities || [],
    images: hotel?.images || []
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleImagesChange = (images: string[]) => {
    setFormData(prev => ({ ...prev, images }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim() && formData.location.trim()) {
      onSubmit(formData);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          {hotel ? 'Edit Hotel' : 'Create New Hotel'}
        </CardTitle>
        <CardDescription>
          {hotel ? 'Update your hotel information' : 'Add a new hotel to your portfolio'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Hotel Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter hotel name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="Enter hotel location"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your hotel"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Hotel Amenities</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 border rounded-md max-h-60 overflow-y-auto">
              {AVAILABLE_AMENITIES.map((amenity) => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox
                    id={amenity}
                    checked={formData.amenities.includes(amenity)}
                    onCheckedChange={() => toggleAmenity(amenity)}
                  />
                  <Label
                    htmlFor={amenity}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {amenity}
                  </Label>
                </div>
              ))}
            </div>
            {formData.amenities.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                <p className="text-sm text-muted-foreground w-full">Selected amenities:</p>
                {formData.amenities.map((amenity, index) => (
                  <Badge key={index} variant="secondary">
                    {amenity}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <ImageUpload
            images={formData.images}
            onImagesChange={handleImagesChange}
            maxImages={10}
            label="Hotel Images"
          />

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading || !formData.name.trim() || !formData.location.trim()}>
              {isLoading ? 'Saving...' : (hotel ? 'Update Hotel' : 'Create Hotel')}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
