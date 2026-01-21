import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Car, X, Plus, Trash2 } from 'lucide-react';
import { Vehicle, VehiclePricing } from '@/types';
import { createVehicle, updateVehicle, createOrUpdateVehiclePricing, getVehiclePricing } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { ImageUpload } from '../hotel/ImageUpload';
import { PricingConfiguration } from '@/components/ui/PricingConfiguration';

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

const AVAILABLE_FEATURES = [
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
  '4WD/AWD',
  'Child Seat Available',
  'Pet Friendly',
  'Heated Seats',
  'Apple CarPlay',
  'Android Auto',
  'Parking Sensors',
  'Lane Assist',
  'Adaptive Cruise Control',
  'Keyless Entry',
  'Push Start',
  'Roof Rack',
  'Tinted Windows'
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
  
  const [pricingData, setPricingData] = useState<Partial<VehiclePricing> | undefined>(undefined);
  const [existingPricing, setExistingPricing] = useState<VehiclePricing | null>(null);


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
      
      // Load existing pricing if editing
      const loadPricing = async () => {
        const { data } = await getVehiclePricing(vehicle.id);
        if (data) {
          setExistingPricing(data);
        }
      };
      loadPricing();
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
      setExistingPricing(null);
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

      let vehicleId: string;
      
      if (vehicle) {
        await updateVehicle(vehicle.id, vehicleData);
        vehicleId = vehicle.id;
        toast({
          title: "Vehicle Updated",
          description: "Vehicle information has been updated successfully.",
        });
      } else {
        const result = await createVehicle(vehicleData);
        vehicleId = result.data?.id;
        toast({
          title: "Vehicle Added",
          description: "New vehicle has been added to your fleet.",
        });
      }
      
      // Save pricing if configured
      if (pricingData && vehicleId) {
        await createOrUpdateVehiclePricing({
          vehicle_id: vehicleId,
          ...pricingData
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

  const toggleFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handleImagesChange = (images: string[]) => {
    setFormData(prev => ({ ...prev, images }));
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
            <Label>Vehicle Features</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 border rounded-md max-h-60 overflow-y-auto">
              {AVAILABLE_FEATURES.map((feature) => (
                <div key={feature} className="flex items-center space-x-2">
                  <Checkbox
                    id={feature}
                    checked={formData.features.includes(feature)}
                    onCheckedChange={() => toggleFeature(feature)}
                  />
                  <Label
                    htmlFor={feature}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {feature}
                  </Label>
                </div>
              ))}
            </div>
            {formData.features.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                <p className="text-sm text-muted-foreground w-full">Selected features:</p>
                {formData.features.map((feature, index) => (
                  <Badge key={index} variant="secondary">
                    {feature}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <ImageUpload
            images={formData.images}
            onImagesChange={handleImagesChange}
            maxImages={10}
            label="Vehicle Images"
            bucket="vehicle-images"
          />
          
          {/* Pricing Configuration Section */}
          <div className="pt-4 border-t">
            <h3 className="text-lg font-semibold mb-4">Dynamic Pricing</h3>
            <PricingConfiguration
              pricing={existingPricing}
              priceLabel="per day"
              onChange={setPricingData}
            />
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
