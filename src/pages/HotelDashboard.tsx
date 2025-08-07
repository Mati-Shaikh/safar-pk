import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Building, Calendar, User, Mail, Bed } from 'lucide-react';
import Footer from '@/components/layout/Footer';

export const HotelDashboard: React.FC = () => {
  const { bookings, updateBooking } = useData();
  const { user } = useAuth();

  const hotelBookings = bookings.filter(booking => 
    booking.type === 'hotel' && booking.providerId === user?.id
  );

  const handleBookingAction = (bookingId: string, action: 'confirmed' | 'rejected') => {
    updateBooking(bookingId, { status: action });
  };

  return (
    <>
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Hotel Dashboard</h1>
        <p className="text-muted-foreground mt-2">Manage your hotel bookings and guests</p>
      </div>

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
              <CardTitle>Hotel Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Rooms</span>
                  <span>25</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Available Rooms</span>
                  <span>18</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rating</span>
                  <span>4.5/5</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full">
                Update Room Availability
              </Button>
              <Button variant="outline" className="w-full">
                Manage Pricing
              </Button>
              <Button variant="outline" className="w-full">
                Edit Hotel Details
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
};