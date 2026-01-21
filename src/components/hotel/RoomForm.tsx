import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Bed } from 'lucide-react';
import { HotelRoom, HotelRoomPricing } from '@/types';
import { ImageUpload } from './ImageUpload';
import { PricingConfiguration } from '@/components/ui/PricingConfiguration';

interface RoomFormProps {
  room?: HotelRoom;
  hotelId: string;
  onSubmit: (roomData: {
    type: string;
    description: string;
    price_per_night: string;
    capacity: number;
    amenities: string[];
    images: string[];
    available: boolean;
  }, pricingData?: Partial<HotelRoomPricing>) => void;
  onCancel: () => void;
  isLoading?: boolean;
  existingPricing?: HotelRoomPricing | null;
}

const AVAILABLE_AMENITIES = [
  'Air Conditioning',
  'WiFi',
  'TV',
  'Mini Bar',
  'Room Service',
  'Balcony',
  'Sea View',
  'City View',
  'Private Bathroom',
  'Shower',
  'Bathtub',
  'Hair Dryer',
  'Safe',
  'Coffee Maker',
  'Refrigerator',
  'Iron',
  'Work Desk',
  'Telephone',
  'Wardrobe'
];

export const RoomForm: React.FC<RoomFormProps> = ({
  room,
  onSubmit,
  onCancel,
  isLoading = false,
  existingPricing
}) => {
  const [formData, setFormData] = useState({
    type: room?.type || '',
    description: room?.description || '',
    price_per_night: room?.price_per_night?.toString() || '',
    capacity: room?.capacity || 1,
    amenities: room?.amenities || [],
    images: room?.images || [],
    available: room?.available ?? true
  });

  const [pricingData, setPricingData] = useState<Partial<HotelRoomPricing> | undefined>(undefined);

  const handleInputChange = (field: string, value: string | number | boolean) => {
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

  const handleSubmit = () => {
    if (formData.type.trim() && formData.price_per_night.trim() && formData.capacity > 0) {
      // Only pass pricing data if it has been configured
      const hasPricingConfig = pricingData && (
        (pricingData.off_season_months && pricingData.off_season_months.length > 0) ||
        (pricingData.on_season_months && pricingData.on_season_months.length > 0) ||
        (pricingData.closed_months && pricingData.closed_months.length > 0)
      );
      onSubmit(formData, hasPricingConfig ? pricingData : undefined);
    }
  };

  const isFormValid = formData.type.trim() && formData.price_per_night.trim() && formData.capacity > 0;

  return (
    <div className="space-y-6">
      <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bed className="h-5 w-5" />
          {room ? 'Edit Room' : 'Create New Room'}
        </CardTitle>
        <CardDescription>
          {room ? 'Update room information' : 'Add a new room to your hotel'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Room Type *</Label>
              <Input
                id="type"
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                placeholder="e.g., Deluxe, Suite, Standard"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity *</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                value={formData.capacity}
                onChange={(e) => handleInputChange('capacity', parseInt(e.target.value) || 1)}
                placeholder="Number of guests"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price_per_night">Price per Night *</Label>
            <Input
              id="price_per_night"
              type="number"
              step="1"
              min="0"
              value={formData.price_per_night}
              onChange={(e) => {
                const value = e.target.value;
                // Only allow integers (no decimals)
                if (value === '' || /^\d+$/.test(value)) {
                  handleInputChange('price_per_night', value);
                }
              }}
              placeholder="e.g., 5000"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe the room features"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Room Amenities</Label>
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
            maxImages={8}
            label="Room Images"
            bucket="hotel-images"
          />

          <div className="flex items-center space-x-2">
            <Switch
              id="available"
              checked={formData.available}
              onCheckedChange={(checked) => handleInputChange('available', checked)}
            />
            <Label htmlFor="available">Room Available</Label>
          </div>
        </div>
      </CardContent>
    </Card>

      {/* Pricing Configuration */}
      <div className="w-full max-w-2xl mx-auto">
        <PricingConfiguration
          pricing={existingPricing}
          priceLabel="per night"
          onChange={setPricingData}
        />
      </div>

      {/* Submit buttons at the end */}
      <div className="w-full max-w-2xl mx-auto flex gap-2 pt-4">
        <Button 
          onClick={handleSubmit}
          disabled={isLoading || !isFormValid}
        >
          {isLoading ? 'Saving...' : (room ? 'Update Room' : 'Create Room')}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
};
