import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Building, Calendar, User, Mail, Bed, Plus, Settings, Car, Edit, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Footer from '@/components/layout/Footer';
import { HotelList } from '@/components/hotel/HotelList';
import { HotelForm } from '@/components/hotel/HotelForm';
import { ImageUpload } from '@/components/hotel/ImageUpload';
import { Hotel, HotelRoom } from '@/types';
import {
  createHotel,
  getHotelsByOwner,
  updateHotel,
  deleteHotel,
  createHotelRoom,
  getHotelRooms,
  updateHotelRoom,
  deleteHotelRoom
} from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface Vehicle {
  id: string;
  driver_id: string;
  name: string;
  type: string;
  seats: number;
  price_per_day: number;
  description?: string;
  features: string[];
  images: string[];
  available: boolean;
  created_at: string;
  updated_at: string;
}

export const HotelDashboard: React.FC = () => {
  const { bookings, updateBooking } = useData();
  const { user, profile } = useAuth();
  const { toast } = useToast();

  // Hotel management state
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [rooms, setRooms] = useState<{ [hotelId: string]: HotelRoom[] }>({});
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateHotel, setShowCreateHotel] = useState(false);
  const [showCreateVehicle, setShowCreateVehicle] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [newVehicle, setNewVehicle] = useState({
    driver_id: '',
    name: '',
    type: '',
    seats: 4,
    price_per_day: 0,
    description: '',
    features: [] as string[],
    images: [] as string[],
    available: true
  });
  const [featureInput, setFeatureInput] = useState('');

  const hotelBookings = bookings.filter(booking => 
    booking.type === 'hotel' && booking.providerId === user?.id
  );

  const handleBookingAction = (bookingId: string, action: 'confirmed' | 'rejected') => {
    updateBooking(bookingId, { status: action });
  };

  // Load hotels, rooms, drivers, and vehicles
  useEffect(() => {
    if (user?.id && profile?.role === 'hotel_owner') {
      loadHotels();
      loadDrivers();
      loadVehicles();
    }
  }, [user?.id, profile?.role]);

  const loadHotels = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const { data: hotelsData, error: hotelsError } = await getHotelsByOwner(user.id);
      if (hotelsError) throw hotelsError;

      setHotels(hotelsData || []);

      // Load rooms for each hotel
      const roomsData: { [hotelId: string]: HotelRoom[] } = {};
      for (const hotel of hotelsData || []) {
        const { data: hotelRooms, error: roomsError } = await getHotelRooms(hotel.id);
        if (!roomsError && hotelRooms) {
          roomsData[hotel.id] = hotelRooms;
        }
      }
      setRooms(roomsData);
    } catch (error) {
      console.error('Error loading hotels:', error);
      toast({
        title: "Error",
        description: "Failed to load hotels",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateHotel = async (hotelData: any) => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const { data, error } = await createHotel({
        ...hotelData,
        owner_id: user.id
      });

      if (error) throw error;

      setHotels(prev => [data, ...prev]);
      setShowCreateHotel(false);
      toast({
        title: "Success",
        description: "Hotel created successfully",
      });
    } catch (error) {
      console.error('Error creating hotel:', error);
      toast({
        title: "Error",
        description: "Failed to create hotel",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateHotel = async (hotelId: string, hotelData: any) => {
    setIsLoading(true);
    try {
      const { data, error } = await updateHotel(hotelId, hotelData);
      if (error) throw error;

      setHotels(prev => prev.map(h => h.id === hotelId ? data : h));
      toast({
        title: "Success",
        description: "Hotel updated successfully",
      });
    } catch (error) {
      console.error('Error updating hotel:', error);
      toast({
        title: "Error",
        description: "Failed to update hotel",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteHotel = async (hotelId: string) => {
    setIsLoading(true);
    try {
      const { error } = await deleteHotel(hotelId);
      if (error) throw error;

      setHotels(prev => prev.filter(h => h.id !== hotelId));
      setRooms(prev => {
        const newRooms = { ...prev };
        delete newRooms[hotelId];
        return newRooms;
      });
      toast({
        title: "Success",
        description: "Hotel deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting hotel:', error);
      toast({
        title: "Error",
        description: "Failed to delete hotel",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRoom = async (hotelId: string, roomData: any) => {
    setIsLoading(true);
    try {
      const { data, error } = await createHotelRoom({
        ...roomData,
        hotel_id: hotelId
      });
      if (error) throw error;

      setRooms(prev => ({
        ...prev,
        [hotelId]: [data, ...(prev[hotelId] || [])]
      }));
      toast({
        title: "Success",
        description: "Room created successfully",
      });
    } catch (error) {
      console.error('Error creating room:', error);
      toast({
        title: "Error",
        description: "Failed to create room",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRoom = async (roomId: string, roomData: any) => {
    setIsLoading(true);
    try {
      const { data, error } = await updateHotelRoom(roomId, roomData);
      if (error) throw error;

      setRooms(prev => {
        const newRooms = { ...prev };
        Object.keys(newRooms).forEach(hotelId => {
          newRooms[hotelId] = newRooms[hotelId].map(r => r.id === roomId ? data : r);
        });
        return newRooms;
      });
      toast({
        title: "Success",
        description: "Room updated successfully",
      });
    } catch (error) {
      console.error('Error updating room:', error);
      toast({
        title: "Error",
        description: "Failed to update room",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    setIsLoading(true);
    try {
      const { error } = await deleteHotelRoom(roomId);
      if (error) throw error;

      setRooms(prev => {
        const newRooms = { ...prev };
        Object.keys(newRooms).forEach(hotelId => {
          newRooms[hotelId] = newRooms[hotelId].filter(r => r.id !== roomId);
        });
        return newRooms;
      });
      toast({
        title: "Success",
        description: "Room deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting room:', error);
      toast({
        title: "Error",
        description: "Failed to delete room",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Vehicle management functions
  const loadDrivers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, full_name, email')
        .eq('role', 'driver');

      if (error) throw error;
      setDrivers(data || []);
    } catch (error) {
      console.error('Error loading drivers:', error);
    }
  };

  const loadVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select(`
          *,
          user_profiles!vehicles_driver_id_fkey(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVehicles(data || []);
    } catch (error) {
      console.error('Error loading vehicles:', error);
      toast({
        title: "Error",
        description: "Failed to load vehicles",
        variant: "destructive",
      });
    }
  };

  const handleCreateVehicle = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('vehicles')
        .insert([newVehicle]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Vehicle added successfully",
      });

      setNewVehicle({
        driver_id: '',
        name: '',
        type: '',
        seats: 4,
        price_per_day: 0,
        description: '',
        features: [],
        images: [],
        available: true
      });
      setShowCreateVehicle(false);
      loadVehicles();
    } catch (error) {
      console.error('Error adding vehicle:', error);
      toast({
        title: "Error",
        description: "Failed to add vehicle",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateVehicle = async () => {
    if (!editingVehicle) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('vehicles')
        .update(editingVehicle)
        .eq('id', editingVehicle.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Vehicle updated successfully",
      });

      setEditingVehicle(null);
      loadVehicles();
    } catch (error) {
      console.error('Error updating vehicle:', error);
      toast({
        title: "Error",
        description: "Failed to update vehicle",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', vehicleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Vehicle deleted successfully",
      });

      loadVehicles();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast({
        title: "Error",
        description: "Failed to delete vehicle",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setNewVehicle({
        ...newVehicle,
        features: [...newVehicle.features, featureInput.trim()]
      });
      setFeatureInput('');
    }
  };

  const removeFeature = (index: number) => {
    setNewVehicle({
      ...newVehicle,
      features: newVehicle.features.filter((_, i) => i !== index)
    });
  };

  // Check if user is hotel owner
  if (profile?.role !== 'hotel_owner') {
    return (
      <>
        <div className="max-w-7xl mx-auto p-6">
          <div className="text-center py-12">
            <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground">
              You need to be a hotel owner to access this dashboard.
            </p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Hotel Management Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage your hotels, rooms, and bookings
          </p>
        </div>

        <Tabs defaultValue="hotels" className="space-y-6">
          <TabsList>
            <TabsTrigger value="hotels" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Hotels & Rooms
            </TabsTrigger>
            <TabsTrigger value="vehicles" className="flex items-center gap-2">
              <Car className="h-4 w-4" />
              Vehicles
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Bookings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hotels" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Your Hotels</h2>
              <Dialog open={showCreateHotel} onOpenChange={setShowCreateHotel}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Hotel
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Hotel</DialogTitle>
                  </DialogHeader>
                  <HotelForm
                    onSubmit={handleCreateHotel}
                    onCancel={() => setShowCreateHotel(false)}
                    isLoading={isLoading}
                  />
                </DialogContent>
              </Dialog>
            </div>

            <HotelList
              hotels={hotels}
              rooms={rooms}
              onCreateHotel={handleCreateHotel}
              onUpdateHotel={handleUpdateHotel}
              onDeleteHotel={handleDeleteHotel}
              onCreateRoom={handleCreateRoom}
              onUpdateRoom={handleUpdateRoom}
              onDeleteRoom={handleDeleteRoom}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="vehicles" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Your Vehicles</h2>
              <Dialog open={showCreateVehicle} onOpenChange={setShowCreateVehicle}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Vehicle
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Vehicle</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="vehicle-driver">Driver</Label>
                      <select
                        id="vehicle-driver"
                        value={newVehicle.driver_id}
                        onChange={(e) => setNewVehicle({ ...newVehicle, driver_id: e.target.value })}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="">Select a driver</option>
                        {drivers.map((driver) => (
                          <option key={driver.id} value={driver.id}>
                            {driver.full_name} ({driver.email})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="vehicle-name">Vehicle Name</Label>
                        <Input
                          id="vehicle-name"
                          value={newVehicle.name}
                          onChange={(e) => setNewVehicle({ ...newVehicle, name: e.target.value })}
                          placeholder="e.g., Toyota Corolla 2020"
                        />
                      </div>
                      <div>
                        <Label htmlFor="vehicle-type">Type</Label>
                        <Input
                          id="vehicle-type"
                          value={newVehicle.type}
                          onChange={(e) => setNewVehicle({ ...newVehicle, type: e.target.value })}
                          placeholder="e.g., Sedan, SUV"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="vehicle-seats">Seats</Label>
                        <Input
                          id="vehicle-seats"
                          type="number"
                          value={newVehicle.seats}
                          onChange={(e) => setNewVehicle({ ...newVehicle, seats: parseInt(e.target.value) || 4 })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="vehicle-price">Price per Day (PKR)</Label>
                        <Input
                          id="vehicle-price"
                          type="number"
                          value={newVehicle.price_per_day}
                          onChange={(e) => setNewVehicle({ ...newVehicle, price_per_day: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="vehicle-description">Description</Label>
                      <Textarea
                        id="vehicle-description"
                        value={newVehicle.description}
                        onChange={(e) => setNewVehicle({ ...newVehicle, description: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Features</Label>
                      <div className="flex gap-2 mb-2">
                        <Input
                          value={featureInput}
                          onChange={(e) => setFeatureInput(e.target.value)}
                          placeholder="Add a feature"
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                        />
                        <Button type="button" onClick={addFeature}>Add</Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {newVehicle.features.map((feature, index) => (
                          <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeFeature(index)}>
                            {feature} ×
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <ImageUpload
                      images={newVehicle.images}
                      onImagesChange={(images) => setNewVehicle({ ...newVehicle, images })}
                      maxImages={8}
                      label="Vehicle Images"
                    />
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="vehicle-available"
                        checked={newVehicle.available}
                        onChange={(e) => setNewVehicle({ ...newVehicle, available: e.target.checked })}
                      />
                      <Label htmlFor="vehicle-available">Available</Label>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button onClick={handleCreateVehicle} disabled={isLoading}>
                        {isLoading ? 'Adding...' : 'Add Vehicle'}
                      </Button>
                      <Button variant="outline" onClick={() => setShowCreateVehicle(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {vehicles.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No vehicles added yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles.map((vehicle) => (
                  <Card key={vehicle.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{vehicle.name}</h3>
                          <p className="text-sm text-muted-foreground">{vehicle.type}</p>
                        </div>
                        <Badge variant={vehicle.available ? 'default' : 'secondary'}>
                          {vehicle.available ? 'Available' : 'Unavailable'}
                        </Badge>
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Driver:</span>
                          <span>{(vehicle as any).user_profiles?.full_name || 'Unknown'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Seats:</span>
                          <span>{vehicle.seats}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Price/Day:</span>
                          <span className="font-semibold">PKR {vehicle.price_per_day}</span>
                        </div>
                        {vehicle.images.length > 0 && (
                          <img
                            src={vehicle.images[0]}
                            alt={vehicle.name}
                            className="w-full h-32 object-cover rounded mt-2"
                          />
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="flex-1" onClick={() => setEditingVehicle(vehicle)}>
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Edit Vehicle</DialogTitle>
                            </DialogHeader>
                            {editingVehicle && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Vehicle Name</Label>
                                    <Input
                                      value={editingVehicle.name}
                                      onChange={(e) => setEditingVehicle({ ...editingVehicle, name: e.target.value })}
                                    />
                                  </div>
                                  <div>
                                    <Label>Type</Label>
                                    <Input
                                      value={editingVehicle.type}
                                      onChange={(e) => setEditingVehicle({ ...editingVehicle, type: e.target.value })}
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Seats</Label>
                                    <Input
                                      type="number"
                                      value={editingVehicle.seats}
                                      onChange={(e) => setEditingVehicle({ ...editingVehicle, seats: parseInt(e.target.value) || 4 })}
                                    />
                                  </div>
                                  <div>
                                    <Label>Price per Day (PKR)</Label>
                                    <Input
                                      type="number"
                                      value={editingVehicle.price_per_day}
                                      onChange={(e) => setEditingVehicle({ ...editingVehicle, price_per_day: parseFloat(e.target.value) || 0 })}
                                    />
                                  </div>
                                </div>
                                <div>
                                  <Label>Description</Label>
                                  <Textarea
                                    value={editingVehicle.description || ''}
                                    onChange={(e) => setEditingVehicle({ ...editingVehicle, description: e.target.value })}
                                  />
                                </div>
                                <ImageUpload
                                  images={editingVehicle.images}
                                  onImagesChange={(images) => setEditingVehicle({ ...editingVehicle, images })}
                                  maxImages={8}
                                  label="Vehicle Images"
                                />
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    checked={editingVehicle.available}
                                    onChange={(e) => setEditingVehicle({ ...editingVehicle, available: e.target.checked })}
                                  />
                                  <Label>Available</Label>
                                </div>
                                <div className="flex gap-2">
                                  <Button onClick={handleUpdateVehicle} disabled={isLoading}>
                                    {isLoading ? 'Updating...' : 'Update Vehicle'}
                                  </Button>
                                  <Button variant="outline" onClick={() => setEditingVehicle(null)}>
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="flex-1">
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the vehicle.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteVehicle(vehicle.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      New Booking Requests
                    </CardTitle>
                    <CardDescription>
                      Recent reservations from customers
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {hotelBookings.filter(b => b.status === 'pending').length === 0 ? (
                      <div className="text-center py-8">
                        <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No pending booking requests</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {hotelBookings.filter(b => b.status === 'pending').map((booking) => (
                          <Card key={booking.id}>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    <span className="font-medium">Customer ID: {booking.customerId}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span className="text-sm">
                                      Check-in: {new Date(booking.startDate).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span className="text-sm">
                                      Check-out: {new Date(booking.endDate).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Bed className="h-4 w-4" />
                                    <span className="text-sm">Trip ID: {booking.tripId}</span>
                                  </div>
                                  <p className="text-lg font-semibold text-primary">
                                    ${booking.totalPrice}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleBookingAction(booking.id, 'confirmed')}
                                  >
                                    Confirm
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleBookingAction(booking.id, 'rejected')}
                                  >
                                    Decline
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bed className="h-5 w-5" />
                      Confirmed Reservations
                    </CardTitle>
                    <CardDescription>
                      Your upcoming guests
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {hotelBookings.filter(b => b.status === 'confirmed').length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No confirmed reservations</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {hotelBookings.filter(b => b.status === 'confirmed').map((booking) => (
                          <Card key={booking.id}>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    <span className="font-medium">Customer ID: {booking.customerId}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span className="text-sm">
                                      {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="text-lg font-semibold text-green-600">
                                    ${booking.totalPrice}
                                  </p>
                                </div>
                                <Badge variant="default">Confirmed</Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Booking Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pending Requests</span>
                      <span className="font-semibold">
                        {hotelBookings.filter(b => b.status === 'pending').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Confirmed Bookings</span>
                      <span className="font-semibold">
                        {hotelBookings.filter(b => b.status === 'confirmed').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Revenue</span>
                      <span className="font-semibold text-primary">
                        ${hotelBookings
                          .filter(b => b.status === 'confirmed')
                          .reduce((sum, b) => sum + b.totalPrice, 0)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Hotel Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Hotels</span>
                        <span className="font-semibold">{hotels.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Rooms</span>
                        <span className="font-semibold">
                          {Object.values(rooms).reduce((sum, hotelRooms) => sum + hotelRooms.length, 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Available Rooms</span>
                        <span className="font-semibold">
                          {Object.values(rooms).reduce((sum, hotelRooms) => 
                            sum + hotelRooms.filter(room => room.available).length, 0
                          )}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </>
  );
};