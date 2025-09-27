import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Car, X, Plus, Trash2 } from 'lucide-react';
import { Vehicle } from '@/types';
import { createVehicle, updateVehicle } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface VehicleFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  driverId: string;
  vehicle?: Vehicle | null;
}

const vehicleTypes = [
  'Sedan',
  'SUV',
  'Hatchback',
  'Coupe',
  'Convertible',
  'Truck',
  'Van',
  'Bus',
  'Motorcycle'
];

const commonFeatures = [
  'Air Conditioning',
  'GPS Navigation',
  'Bluetooth',
  'USB Charging',
  'WiFi',
  'Leather Seats',
  'Sunroof',
  'Backup Camera',
  'Cruise Control',
  'Automatic Transmission',
  'Manual Transmission',
  '4WD',
  'Child Seat',
  'Pet Friendly'
];

export const VehicleForm: React.FC<VehicleFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  driverId,
  vehicle
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    seats: 4,
    price_per_day: 0,
    description: '',
    features: [] as string[],
    images: [] as string[],
    available: true
  });

  const [newFeature, setNewFeature] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    if (vehicle) {
      setFormData({
        name: vehicle.name,
        type: vehicle.type,
        seats: vehicle.seats,
        price_per_day: vehicle.price_per_day,
        description: vehicle.description || '',
        features: vehicle.features,
        images: vehicle.images,
        available: vehicle.available
      });
    } else {
      setFormData({
        name: '',
        type: '',
        seats: 4,
        price_per_day: 0,
        description: '',
        features: [],
        images: [],
        available: true
      });
    }
  }, [vehicle, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const vehicleData = {
        driver_id: driverId,
        name: formData.name,
        type: formData.type,
        seats: formData.seats,
        price_per_day: formData.price_per_day,
        description: formData.description,
        features: formData.features,
        images: formData.images,
        available: formData.available
      };

      if (vehicle) {
        await updateVehicle(vehicle.id, vehicleData);
        toast({
          title: "Vehicle Updated",
          description: "Vehicle information has been updated successfully.",
        });
      } else {
        await createVehicle(vehicleData);
        toast({
          title: "Vehicle Added",
          description: "New vehicle has been added to your fleet.",
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving vehicle:', error);
      toast({
        title: "Error",
        description: "Failed to save vehicle. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(f => f !== feature)
    }));
  };

  const addImage = () => {
    if (newImageUrl.trim() && !formData.images.includes(newImageUrl.trim())) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, newImageUrl.trim()]
      }));
      setNewImageUrl('');
    }
  };

  const removeImage = (imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img !== imageUrl)
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            {vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
          </DialogTitle>
          <DialogDescription>
            {vehicle ? 'Update your vehicle information' : 'Add a new vehicle to your fleet'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Vehicle Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Toyota Corolla"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Vehicle Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle type" />
                </SelectTrigger>
                <SelectContent>
                  {vehicleTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="seats">Number of Seats</Label>
              <Input
                id="seats"
                type="number"
                min="1"
                max="50"
                value={formData.seats}
                onChange={(e) => setFormData(prev => ({ ...prev, seats: parseInt(e.target.value) || 4 }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price per Day (PKR)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="100"
                value={formData.price_per_day}
                onChange={(e) => setFormData(prev => ({ ...prev, price_per_day: parseFloat(e.target.value) || 0 }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your vehicle, its condition, and any special notes..."
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="available"
                checked={formData.available}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, available: checked }))}
              />
              <Label htmlFor="available">Available for booking</Label>
            </div>
          </div>

          <div className="space-y-4">
            <Label>Features</Label>
            <div className="flex gap-2">
              <Input
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                placeholder="Add a feature"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
              />
              <Button type="button" onClick={addFeature} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {formData.features.map((feature) => (
                <Badge key={feature} variant="secondary" className="flex items-center gap-1">
                  {feature}
                  <button
                    type="button"
                    onClick={() => removeFeature(feature)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            <div className="text-sm text-muted-foreground">
              Quick add:
              <div className="flex flex-wrap gap-1 mt-1">
                {commonFeatures.map((feature) => (
                  <button
                    key={feature}
                    type="button"
                    onClick={() => {
                      if (!formData.features.includes(feature)) {
                        setFormData(prev => ({
                          ...prev,
                          features: [...prev.features, feature]
                        }));
                      }
                    }}
                    className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-md"
                    disabled={formData.features.includes(feature)}
                  >
                    {feature}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Label>Images</Label>
            <div className="flex gap-2">
              <Input
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Image URL"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
              />
              <Button type="button" onClick={addImage} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {formData.images.map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={imageUrl}
                      alt={`Vehicle ${index + 1}`}
                      className="w-full h-20 object-cover rounded-md"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(imageUrl)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : vehicle ? 'Update Vehicle' : 'Add Vehicle'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
