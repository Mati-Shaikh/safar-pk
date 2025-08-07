import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useData } from '@/contexts/DataContext';
import { Users, MapPin, Building, Car, BarChart3, Settings } from 'lucide-react';
import Footer from '@/components/layout/Footer';

export const AdminDashboard: React.FC = () => {
  const { destinations, trips, bookings } = useData();

  // Get users from localStorage
  const users = JSON.parse(localStorage.getItem('safarpk_users') || '[]');
  const customers = users.filter((u: any) => u.role === 'customer');
  const drivers = users.filter((u: any) => u.role === 'driver');
  const hotels = users.filter((u: any) => u.role === 'hotel');

  const stats = {
    totalUsers: users.length,
    totalTrips: trips.length,
    totalBookings: bookings.length,
    totalDestinations: destinations.length,
    pendingBookings: bookings.filter(b => b.status === 'pending').length,
    confirmedBookings: bookings.filter(b => b.status === 'confirmed').length,
  };

  return (
    <>
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">Manage SAFARPk platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Trips</p>
                <p className="text-2xl font-bold">{stats.totalTrips}</p>
              </div>
              <MapPin className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
                <p className="text-2xl font-bold">{stats.totalBookings}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Destinations</p>
                <p className="text-2xl font-bold">{stats.totalDestinations}</p>
              </div>
              <MapPin className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="destinations">Destinations</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Customers</span>
                  <Badge variant="secondary">{customers.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Drivers</span>
                  <Badge variant="secondary">{drivers.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Hotels</span>
                  <Badge variant="secondary">{hotels.length}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Booking Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Pending</span>
                  <Badge variant="outline">{stats.pendingBookings}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Confirmed</span>
                  <Badge variant="default">{stats.confirmedBookings}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Revenue</span>
                  <Badge variant="secondary">
                    ${bookings
                      .filter(b => b.status === 'confirmed')
                      .reduce((sum, b) => sum + b.totalPrice, 0)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
              <CardDescription>
                Manage all platform users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.slice(0, 10).map((user: any) => (
                  <div key={user.id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{user.name}</h4>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="destinations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Destination Management
              </CardTitle>
              <CardDescription>
                Manage tourist destinations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {destinations.map((destination) => (
                  <div key={destination.id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{destination.name}</h4>
                      <p className="text-sm text-muted-foreground">{destination.region}</p>
                      <p className="text-sm">Popularity: {destination.popularity}/100</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="mt-4">
                Add New Destination
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Booking Management
              </CardTitle>
              <CardDescription>
                Monitor all platform bookings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bookings.slice(0, 10).map((booking) => (
                  <div key={booking.id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Booking #{booking.id.slice(-6)}</h4>
                      <p className="text-sm text-muted-foreground">
                        {booking.type === 'hotel' ? 'Hotel' : 'Transportation'} • Customer: {booking.customerId.slice(-6)}
                      </p>
                      <p className="text-sm">${booking.totalPrice}</p>
                    </div>
                    <Badge variant={
                      booking.status === 'confirmed' ? 'default' :
                      booking.status === 'pending' ? 'outline' : 'secondary'
                    }>
                      {booking.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Platform Settings
              </CardTitle>
              <CardDescription>
                Configure platform settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start">
                Manage Platform Policies
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Email Notifications Settings
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Payment Configuration
              </Button>
              <Button variant="outline" className="w-full justify-start">
                System Maintenance
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    <Footer />
    </>
  );
};