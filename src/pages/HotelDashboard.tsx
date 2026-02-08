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
import { HotelBookingCalendar } from '@/components/hotel/HotelBookingCalendar';
import '@/components/driver/booking-calendar.css';
import { Hotel, HotelRoom } from '@/types';
import {
  createHotel,
  getHotelsByOwner,
  updateHotel,
  deleteHotel,
  createHotelRoom,
  getHotelRooms,
  updateHotelRoom,
  deleteHotelRoom,
  getHotelBookingsByOwner,
  updateBookingStatus,
  createOrUpdateRoomPricing
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
  const [hotelBookings, setHotelBookings] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [showCreateHotel, setShowCreateHotel] = useState(false);
  const [showCreateVehicle, setShowCreateVehicle] = useState(false);
  const [showCreateDriver, setShowCreateDriver] = useState(false);
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
  const [newDriver, setNewDriver] = useState({
    email: '',
    full_name: '',
    phone_number: '',
    password: '',
    confirmPassword: ''
  });
  const [featureInput, setFeatureInput] = useState('');

  // Legacy bookings from context (keeping for backward compatibility)
  const contextHotelBookings = bookings.filter(booking =>
    booking.type === 'hotel' && booking.providerId === user?.id
  );

  const handleBookingAction = async (bookingId: string, action: 'confirmed' | 'cancelled') => {
    try {
      const { error } = await updateBookingStatus(bookingId, action);
      if (error) {
        console.error('Error updating booking status:', error);
        toast({
          title: "Error",
          description: "Failed to update booking status",
          variant: "destructive",
        });
      } else {
        // Reload bookings
        loadBookings();
        toast({
          title: "Success",
          description: `Booking ${action} successfully!`,
        });
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive",
      });
    }
  };

  // Load bookings
  const loadBookings = async () => {
    if (!user?.id) return;

    setLoadingBookings(true);
    try {
      const { data, error } = await getHotelBookingsByOwner(user.id);
      if (error) {
        console.error('Error loading bookings:', error);
      } else {
        setHotelBookings(data || []);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoadingBookings(false);
    }
  };

  // Load hotels, rooms, drivers, vehicles, and bookings
  useEffect(() => {
    if (user?.id && profile?.role === 'hotel_owner') {
      loadHotels();
      loadDrivers();
      loadVehicles();
      loadBookings();
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

  const handleCreateRoom = async (hotelId: string, roomData: any, pricingData?: any) => {
    setIsLoading(true);
    try {
      const { data, error } = await createHotelRoom({
        ...roomData,
        hotel_id: hotelId
      });
      if (error) throw error;

      // Save pricing if provided
      if (pricingData && data?.id) {
        await createOrUpdateRoomPricing({
          room_id: data.id,
          ...pricingData
        });
      }

      setRooms(prev => ({
        ...prev,
        [hotelId]: [data, ...(prev[hotelId] || [])]
      }));
      toast({
        title: "Success",
        description: "Room created successfully with pricing configuration",
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

  const handleUpdateRoom = async (roomId: string, roomData: any, pricingData?: any) => {
    setIsLoading(true);
    try {
      const { data, error } = await updateHotelRoom(roomId, roomData);
      if (error) throw error;

      // Update pricing if provided
      if (pricingData) {
        await createOrUpdateRoomPricing({
          room_id: roomId,
          ...pricingData
        });
      }

      setRooms(prev => {
        const newRooms = { ...prev };
        Object.keys(newRooms).forEach(hotelId => {
          newRooms[hotelId] = newRooms[hotelId].map(r => r.id === roomId ? data : r);
        });
        return newRooms;
      });
      toast({
        title: "Success",
        description: "Room updated successfully with pricing configuration",
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

  const handleCreateDriver = async () => {
    // Validation
    if (!newDriver.full_name || !newDriver.email || !newDriver.password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (newDriver.password !== newDriver.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newDriver.password.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Create driver user profile
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          email: newDriver.email,
          full_name: newDriver.full_name,
          phone_number: newDriver.phone_number || null,
          role: 'driver',
          password_hash: btoa(newDriver.password),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Driver account created successfully",
      });

      // Reset form and close dialog
      setNewDriver({
        email: '',
        full_name: '',
        phone_number: '',
        password: '',
        confirmPassword: ''
      });
      setShowCreateDriver(false);
      
      // Reload drivers
      loadDrivers();
    } catch (error: any) {
      console.error('Error creating driver:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create driver account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDriver = async (driverId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', driverId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Driver deleted successfully",
      });

      loadDrivers();
    } catch (error) {
      console.error('Error deleting driver:', error);
      toast({
        title: "Error",
        description: "Failed to delete driver",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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

        <Tabs defaultValue="calendar" className="space-y-6">
          <TabsList>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Calendar View
            </TabsTrigger>
            <TabsTrigger value="hotels" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Hotels & Rooms
            </TabsTrigger>
            <TabsTrigger value="drivers" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Drivers
            </TabsTrigger>
            <TabsTrigger value="vehicles" className="flex items-center gap-2">
              <Car className="h-4 w-4" />
              Vehicles
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Booking List
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Booking Calendar</h2>
              <p className="text-muted-foreground">View and manage your hotel room bookings in calendar view</p>
            </div>

            {loadingBookings ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading bookings...</p>
              </div>
            ) : (
              <HotelBookingCalendar
                bookings={hotelBookings}
                hotels={hotels}
                rooms={rooms}
                onBookingClick={(booking) => console.log('Booking clicked:', booking)}
                onBookingUpdate={handleBookingAction}
              />
            )}
          </TabsContent>

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

          <TabsContent value="drivers" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Your Drivers</h2>
              <Dialog open={showCreateDriver} onOpenChange={setShowCreateDriver}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Driver
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Driver</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="driver-name">Full Name *</Label>
                      <Input
                        id="driver-name"
                        value={newDriver.full_name}
                        onChange={(e) => setNewDriver({ ...newDriver, full_name: e.target.value })}
                        placeholder="Enter driver's full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="driver-email">Email *</Label>
                      <Input
                        id="driver-email"
                        type="email"
                        value={newDriver.email}
                        onChange={(e) => setNewDriver({ ...newDriver, email: e.target.value })}
                        placeholder="Enter driver's email"
                      />
                    </div>
                    <div>
                      <Label htmlFor="driver-phone">Phone Number</Label>
                      <Input
                        id="driver-phone"
                        type="tel"
                        value={newDriver.phone_number}
                        onChange={(e) => setNewDriver({ ...newDriver, phone_number: e.target.value })}
                        placeholder="Enter driver's phone number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="driver-password">Password *</Label>
                      <Input
                        id="driver-password"
                        type="password"
                        value={newDriver.password}
                        onChange={(e) => setNewDriver({ ...newDriver, password: e.target.value })}
                        placeholder="Create password (min 8 characters)"
                      />
                    </div>
                    <div>
                      <Label htmlFor="driver-confirm-password">Confirm Password *</Label>
                      <Input
                        id="driver-confirm-password"
                        type="password"
                        value={newDriver.confirmPassword}
                        onChange={(e) => setNewDriver({ ...newDriver, confirmPassword: e.target.value })}
                        placeholder="Confirm password"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleCreateDriver} disabled={isLoading} className="flex-1">
                        {isLoading ? 'Creating...' : 'Create Driver'}
                      </Button>
                      <Button variant="outline" onClick={() => setShowCreateDriver(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {drivers.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No drivers added yet</p>
                  <p className="text-sm text-muted-foreground">Add drivers to manage vehicles and bookings</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {drivers.map((driver) => (
                  <Card key={driver.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{driver.full_name}</h3>
                          </div>
                        </div>
                        <Badge variant="secondary">Driver</Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span>{driver.email}</span>
                        </div>
                        {driver.phone_number && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <span>📱</span>
                            <span>{driver.phone_number}</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-4">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full">
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the driver account.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteDriver(driver.id)}>
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
            <div>
              <h2 className="text-2xl font-bold mb-2">All Bookings</h2>
              <p className="text-muted-foreground">Complete list of all your room reservations</p>
            </div>

            {loadingBookings ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading bookings...</p>
              </div>
            ) : hotelBookings.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Bed className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No bookings yet</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-semibold">Status</th>
                          <th className="text-left p-3 font-semibold">Customer ID</th>
                          <th className="text-left p-3 font-semibold">Room</th>
                          <th className="text-left p-3 font-semibold">Check-in</th>
                          <th className="text-left p-3 font-semibold">Check-out</th>
                          <th className="text-left p-3 font-semibold">Nights</th>
                          <th className="text-left p-3 font-semibold">Price</th>
                          <th className="text-left p-3 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {hotelBookings.map((booking) => {
                          const room = Object.values(rooms).flat().find(r => r.id === booking.hotel_room_id);
                          const hotel = hotels.find(h => h.id === room?.hotel_id);
                          const nights = Math.ceil((new Date(booking.end_date).getTime() - new Date(booking.start_date).getTime()) / (1000 * 60 * 60 * 24));

                          return (
                            <tr key={booking.id} className="border-b hover:bg-gray-50">
                              <td className="p-3">
                                <Badge
                                  className={`
                                    ${booking.status === 'pending' ? 'bg-orange-500' : ''}
                                    ${booking.status === 'confirmed' ? 'bg-green-500' : ''}
                                    ${booking.status === 'completed' ? 'bg-indigo-500' : ''}
                                    ${booking.status === 'cancelled' ? 'bg-red-500' : ''}
                                  `}
                                >
                                  {booking.status}
                                </Badge>
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm font-mono">{booking.customer_id.slice(0, 8)}...</span>
                                </div>
                              </td>
                              <td className="p-3">
                                <div>
                                  <div className="font-medium">{room?.type || 'Unknown Room'}</div>
                                  <div className="text-sm text-gray-500">{hotel?.name || 'Unknown Hotel'}</div>
                                </div>
                              </td>
                              <td className="p-3 text-sm">{new Date(booking.start_date).toLocaleDateString()}</td>
                              <td className="p-3 text-sm">{new Date(booking.end_date).toLocaleDateString()}</td>
                              <td className="p-3 text-sm">{nights}</td>
                              <td className="p-3">
                                <span className="font-semibold text-green-600">PKR {booking.total_price.toLocaleString()}</span>
                              </td>
                              <td className="p-3">
                                {booking.status === 'pending' ? (
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => handleBookingAction(booking.id, 'confirmed')}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      Confirm
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleBookingAction(booking.id, 'cancelled')}
                                    >
                                      Decline
                                    </Button>
                                  </div>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    disabled
                                  >
                                    {booking.status}
                                  </Button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Stats */}
                  <div className="mt-6 pt-6 border-t grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {hotelBookings.filter(b => b.status === 'pending').length}
                      </div>
                      <div className="text-sm text-gray-600">Pending</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {hotelBookings.filter(b => b.status === 'confirmed').length}
                      </div>
                      <div className="text-sm text-gray-600">Confirmed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-600">
                        {hotelBookings.filter(b => b.status === 'completed').length}
                      </div>
                      <div className="text-sm text-gray-600">Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        PKR {hotelBookings
                          .filter(b => b.status === 'confirmed' || b.status === 'completed')
                          .reduce((sum, b) => sum + (b.total_price || 0), 0).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Total Revenue</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </>
  );
};