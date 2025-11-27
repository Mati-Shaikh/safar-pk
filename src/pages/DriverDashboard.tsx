import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { VehicleForm } from '@/components/driver/VehicleForm';
import { VehicleList } from '@/components/driver/VehicleList';
import { BookingCalendar } from '@/components/driver/BookingCalendar';
import '@/components/driver/booking-calendar.css';
import { Car, Calendar, MapPin, User, Clock, Plus, Settings, Star, Phone, Mail, MapPin as LocationIcon } from 'lucide-react';
import { Vehicle } from '@/types';
import { getVehiclesByDriver, getVehicleBookingsByDriver, updateBookingStatus } from '@/lib/supabase';
import Footer from '@/components/layout/Footer';

export const DriverDashboard: React.FC = () => {
  const { bookings, updateBooking } = useData();
  const { user, profile } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [driverBookings, setDriverBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [vehicleFormOpen, setVehicleFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  // Legacy bookings from context (keeping for backward compatibility)
  const contextDriverBookings = bookings.filter(booking =>
    booking.type === 'car' && booking.providerId === user?.id
  );

  const handleBookingAction = async (bookingId: string, action: 'confirmed' | 'cancelled') => {
    try {
      const { error } = await updateBookingStatus(bookingId, action);
      if (error) {
        console.error('Error updating booking status:', error);
        alert('Failed to update booking status');
      } else {
        // Reload bookings
        loadBookings();
        alert(`Booking ${action} successfully!`);
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Failed to update booking status');
    }
  };

  const loadVehicles = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { data, error } = await getVehiclesByDriver(user.id);
      if (error) {
        console.error('Error loading vehicles:', error);
      } else {
        setVehicles(data || []);
      }
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async () => {
    if (!user?.id) return;

    setLoadingBookings(true);
    try {
      const { data, error } = await getVehicleBookingsByDriver(user.id);
      if (error) {
        console.error('Error loading bookings:', error);
      } else {
        setDriverBookings(data || []);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    loadVehicles();
    loadBookings();
  }, [user?.id]);

  const handleVehicleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setVehicleFormOpen(true);
  };

  const handleVehicleFormClose = () => {
    setVehicleFormOpen(false);
    setEditingVehicle(null);
  };

  const handleVehicleFormSuccess = () => {
    loadVehicles();
  };

  const availableVehicles = vehicles.filter(v => v.available);

  // Calculate stats from actual bookings
  const totalEarnings = driverBookings
    .filter(b => b.status === 'confirmed' || b.status === 'completed')
    .reduce((sum, b) => sum + (b.total_price || 0), 0);

  const pendingBookings = driverBookings.filter(b => b.status === 'pending').length;
  const confirmedBookings = driverBookings.filter(b => b.status === 'confirmed').length;

  return (
    <>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Driver Dashboard</h1>
              <p className="text-muted-foreground mt-2">Manage your vehicles and bookings</p>
            </div>
            <Button onClick={() => setVehicleFormOpen(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Vehicle
            </Button>
          </div>
        </div>

        {/* Driver Profile Section */}
        {profile && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Driver Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{profile.full_name}</h3>
                    <p className="text-muted-foreground">Professional Driver</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium">4.8</span>
                    <span className="text-muted-foreground">(127 reviews)</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{profile.email}</span>
                  </div>
                  {profile.phone_number && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{profile.phone_number}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Member since {new Date(profile.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{vehicles.length}</div>
                    <div className="text-sm text-muted-foreground">Total Vehicles</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">{availableVehicles.length}</div>
                    <div className="text-sm text-muted-foreground">Available Now</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                  <p className="text-2xl font-bold">PKR {totalEarnings}</p>
                </div>
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Requests</p>
                  <p className="text-2xl font-bold">{pendingBookings}</p>
                </div>
                <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="h-4 w-4 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Confirmed Trips</p>
                  <p className="text-2xl font-bold">{confirmedBookings}</p>
                </div>
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Car className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average Rating</p>
                  <p className="text-2xl font-bold">4.8</p>
                </div>
                <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Star className="h-4 w-4 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="calendar" className="space-y-6">
          <TabsList>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            <TabsTrigger value="vehicles">My Vehicles</TabsTrigger>
            <TabsTrigger value="bookings">Booking List</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Booking Calendar</h2>
              <p className="text-muted-foreground">View and manage your bookings in calendar view</p>
            </div>

            {loadingBookings ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading bookings...</p>
              </div>
            ) : (
              <BookingCalendar
                bookings={driverBookings}
                vehicles={vehicles}
                onBookingClick={(booking) => console.log('Booking clicked:', booking)}
              />
            )}
          </TabsContent>

          <TabsContent value="vehicles" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">My Vehicles</h2>
                <p className="text-muted-foreground">Manage your vehicle fleet</p>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading vehicles...</p>
              </div>
            ) : (
              <VehicleList
                vehicles={vehicles}
                onEdit={handleVehicleEdit}
                onRefresh={loadVehicles}
              />
            )}
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Booking Management</h2>
              <p className="text-muted-foreground">Manage your trip bookings</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pending Requests */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Pending Requests
                  </CardTitle>
                  <CardDescription>
                    New booking requests awaiting your response
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {driverBookings.filter(b => b.status === 'pending').length === 0 ? (
                    <div className="text-center py-8">
                      <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No pending booking requests</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {driverBookings.filter(b => b.status === 'pending').map((booking) => (
                        <Card key={booking.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4" />
                                  <span className="font-medium">Customer ID: {booking.customer_id}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  <span className="text-sm">
                                    {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  <span className="text-sm">Trip ID: {booking.trip_id}</span>
                                </div>
                                <p className="text-lg font-semibold text-primary">
                                  PKR {booking.total_price}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleBookingAction(booking.id, 'confirmed')}
                                >
                                  Accept
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleBookingAction(booking.id, 'cancelled')}
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

              {/* Confirmed Bookings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Confirmed Bookings
                  </CardTitle>
                  <CardDescription>
                    Your upcoming and completed trips
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {driverBookings.filter(b => b.status === 'confirmed').length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No confirmed bookings</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {driverBookings.filter(b => b.status === 'confirmed').map((booking) => (
                        <Card key={booking.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4" />
                                  <span className="font-medium">Customer ID: {booking.customer_id}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  <span className="text-sm">
                                    {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-lg font-semibold text-green-600">
                                  PKR {booking.total_price}
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
          </TabsContent>
        </Tabs>
      </div>

      {/* Vehicle Form Modal */}
      <VehicleForm
        isOpen={vehicleFormOpen}
        onClose={handleVehicleFormClose}
        onSuccess={handleVehicleFormSuccess}
        driverId={user?.id || ''}
        vehicle={editingVehicle}
      />

      <Footer />
    </>
  );
};