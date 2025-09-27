import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Car, Edit, Trash2, Users, Calendar, DollarSign, Image, Wrench, Eye } from 'lucide-react';
import { Vehicle } from '@/types';
import { deleteVehicle, toggleVehicleAvailability } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface VehicleListProps {
  vehicles: Vehicle[];
  onEdit: (vehicle: Vehicle) => void;
  onRefresh: () => void;
}

export const VehicleList: React.FC<VehicleListProps> = ({
  vehicles,
  onEdit,
  onRefresh
}) => {
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const handleDelete = (vehicle: Vehicle) => {
    setVehicleToDelete(vehicle);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!vehicleToDelete) return;

    setLoading(vehicleToDelete.id);
    try {
      await deleteVehicle(vehicleToDelete.id);
      toast({
        title: "Vehicle Deleted",
        description: "Vehicle has been removed from your fleet.",
      });
      onRefresh();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast({
        title: "Error",
        description: "Failed to delete vehicle. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
      setDeleteDialogOpen(false);
      setVehicleToDelete(null);
    }
  };

  const handleToggleAvailability = async (vehicle: Vehicle) => {
    setLoading(vehicle.id);
    try {
      await toggleVehicleAvailability(vehicle.id, !vehicle.available);
      toast({
        title: vehicle.available ? "Vehicle Unavailable" : "Vehicle Available",
        description: `Vehicle is now ${!vehicle.available ? 'available' : 'unavailable'} for booking.`,
      });
      onRefresh();
    } catch (error) {
      console.error('Error toggling vehicle availability:', error);
      toast({
        title: "Error",
        description: "Failed to update vehicle availability. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  if (vehicles.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Car className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Vehicles Added</h3>
          <p className="text-muted-foreground text-center mb-4">
            You haven't added any vehicles to your fleet yet. Add your first vehicle to start accepting bookings.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((vehicle) => (
          <Card key={vehicle.id} className="overflow-hidden">
            <div className="aspect-video bg-gray-100 relative">
              {vehicle.images.length > 0 ? (
                <img
                  src={vehicle.images[0]}
                  alt={vehicle.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Image className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              <div className="absolute top-2 right-2">
                <Badge variant={vehicle.available ? "default" : "secondary"}>
                  {vehicle.available ? "Available" : "Unavailable"}
                </Badge>
              </div>
            </div>

            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{vehicle.name}</CardTitle>
                  <CardDescription className="capitalize">{vehicle.type}</CardDescription>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit(vehicle)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(vehicle)}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    disabled={loading === vehicle.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{vehicle.seats} seats</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>PKR {vehicle.price_per_day}/day</span>
                </div>
              </div>

              {vehicle.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {vehicle.description}
                </p>
              )}

              {vehicle.features.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Features</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {vehicle.features.slice(0, 3).map((feature) => (
                      <Badge key={feature} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {vehicle.features.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{vehicle.features.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={vehicle.available}
                    onCheckedChange={() => handleToggleAvailability(vehicle)}
                    disabled={loading === vehicle.id}
                    size="sm"
                  />
                  <span className="text-sm text-muted-foreground">
                    Available for booking
                  </span>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                Added {new Date(vehicle.created_at).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Vehicle</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{vehicleToDelete?.name}"? This action cannot be undone.
              All bookings for this vehicle will be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
              disabled={loading === vehicleToDelete?.id}
            >
              {loading === vehicleToDelete?.id ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
