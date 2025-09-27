import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { X, Plus, Bed } from 'lucide-react';
import { HotelRoom } from '@/types';
import { ImageUpload } from './ImageUpload';

interface RoomFormProps {
  room?: HotelRoom;
  hotelId: string;
  onSubmit: (roomData: {
    type: string;
    description: string;
    price_per_night: number;
    capacity: number;
    amenities: string[];
    images: string[];
    available: boolean;
  }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const RoomForm: React.FC<RoomFormProps> = ({
  room,
  hotelId,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    type: room?.type || '',
    description: room?.description || '',
    price_per_night: room?.price_per_night || 0,
    capacity: room?.capacity || 1,
    amenities: room?.amenities || [],
    images: room?.images || [],
    available: room?.available ?? true
  });

  const [newAmenity, setNewAmenity] = useState('');

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addAmenity = () => {
    if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()]
      }));
      setNewAmenity('');
    }
  };

  const removeAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter(a => a !== amenity)
    }));
  };

  const handleImagesChange = (images: string[]) => {
    setFormData(prev => ({ ...prev, images }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.type.trim() && formData.price_per_night > 0 && formData.capacity > 0) {
      onSubmit(formData);
    }
  };

  return (
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
        <form onSubmit={handleSubmit} className="space-y-6">
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
              min="0"
              step="0.01"
              value={formData.price_per_night}
              onChange={(e) => handleInputChange('price_per_night', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
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
            <div className="flex gap-2">
              <Input
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                placeholder="Add amenity (e.g., Air Conditioning, TV, Mini Bar)"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
              />
              <Button type="button" onClick={addAmenity} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.amenities.map((amenity, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {amenity}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeAmenity(amenity)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <ImageUpload
            images={formData.images}
            onImagesChange={handleImagesChange}
            maxImages={8}
            label="Room Images"
          />

          <div className="flex items-center space-x-2">
            <Switch
              id="available"
              checked={formData.available}
              onCheckedChange={(checked) => handleInputChange('available', checked)}
            />
            <Label htmlFor="available">Room Available</Label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading || !formData.type.trim() || formData.price_per_night <= 0 || formData.capacity <= 0}>
              {isLoading ? 'Saving...' : (room ? 'Update Room' : 'Create Room')}
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
