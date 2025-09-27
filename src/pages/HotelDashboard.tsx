import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Building, Calendar, User, Mail, Bed, Plus, Settings } from 'lucide-react';
import Footer from '@/components/layout/Footer';
import { HotelList } from '@/components/hotel/HotelList';
import { HotelForm } from '@/components/hotel/HotelForm';
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
import { useToast } from '@/hooks/use-toast';

export const HotelDashboard: React.FC = () => {
  const { bookings, updateBooking } = useData();
  const { user, profile } = useAuth();
  const { toast } = useToast();

  // Hotel management state
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [rooms, setRooms] = useState<{ [hotelId: string]: HotelRoom[] }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateHotel, setShowCreateHotel] = useState(false);

  const hotelBookings = bookings.filter(booking => 
    booking.type === 'hotel' && booking.providerId === user?.id
  );

  const handleBookingAction = (bookingId: string, action: 'confirmed' | 'rejected') => {
    updateBooking(bookingId, { status: action });
  };

  // Load hotels and rooms
  useEffect(() => {
    if (user?.id && profile?.role === 'hotel_owner') {
      loadHotels();
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