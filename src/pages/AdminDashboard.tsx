import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useData } from '@/contexts/DataContext';
import { Users, MapPin, Building, Car, BarChart3, Settings, Database } from 'lucide-react';
import Footer from '@/components/layout/Footer';
import { AdminStats } from '@/components/admin/AdminStats';
import { UserManagement } from '@/components/admin/UserManagement';
import { VehicleManagement } from '@/components/admin/VehicleManagement';
import { HotelManagement } from '@/components/admin/HotelManagement';
import { DestinationManagement } from '@/components/admin/DestinationManagement';
import { TripManagement } from '@/components/admin/TripManagement';
import { DebugData } from '@/components/admin/DebugData';

export const AdminDashboard: React.FC = () => {
  const { destinations, trips, bookings } = useData();

  return (
    <>
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">Manage SAFARPk platform</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="trips">Trips</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
          <TabsTrigger value="hotels">Hotels</TabsTrigger>
          <TabsTrigger value="destinations">Destinations</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          {/* <TabsTrigger value="debug">Debug</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger> */}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <AdminStats />
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <UserManagement />
        </TabsContent>

        <TabsContent value="trips" className="space-y-6">
          <TripManagement />
        </TabsContent>

        <TabsContent value="vehicles" className="space-y-6">
          <VehicleManagement />
        </TabsContent>

        <TabsContent value="hotels" className="space-y-6">
          <HotelManagement />
        </TabsContent>

        <TabsContent value="destinations" className="space-y-6">
          <DestinationManagement />
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
                      <p className="text-sm">PKR {booking.totalPrice}</p>
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

        <TabsContent value="debug" className="space-y-6">
          <DebugData />
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
                <Database className="h-4 w-4 mr-2" />
                Database Management
              </Button>
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