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
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">Manage SAFARPk platform</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="px-4 sm:px-0">
            <TabsList className="grid w-full grid-cols-7 min-w-[640px] sm:min-w-0 h-auto">
              <TabsTrigger value="overview" className="text-xs sm:text-sm px-2 py-2 sm:py-2.5">Overview</TabsTrigger>
              <TabsTrigger value="users" className="text-xs sm:text-sm px-2 py-2 sm:py-2.5">Users</TabsTrigger>
              <TabsTrigger value="trips" className="text-xs sm:text-sm px-2 py-2 sm:py-2.5">Trips</TabsTrigger>
              <TabsTrigger value="vehicles" className="text-xs sm:text-sm px-2 py-2 sm:py-2.5">Vehicles</TabsTrigger>
              <TabsTrigger value="hotels" className="text-xs sm:text-sm px-2 py-2 sm:py-2.5">Hotels</TabsTrigger>
              <TabsTrigger value="destinations" className="text-xs sm:text-sm px-2 py-2 sm:py-2.5">Destinations</TabsTrigger>
              <TabsTrigger value="bookings" className="text-xs sm:text-sm px-2 py-2 sm:py-2.5">Bookings</TabsTrigger>
            </TabsList>
          </div>
        </div>

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

        <TabsContent value="bookings" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <BarChart3 className="h-5 w-5" />
                Booking Management
              </CardTitle>
              <CardDescription className="text-sm">
                Monitor all platform bookings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {bookings.slice(0, 10).map((booking) => (
                  <div key={booking.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 sm:p-4 border rounded-lg gap-2 sm:gap-0">
                    <div>
                      <h4 className="font-medium text-sm sm:text-base">Booking #{booking.id.slice(-6)}</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {booking.type === 'hotel' ? 'Hotel' : 'Transportation'} • Customer: {booking.customerId.slice(-6)}
                      </p>
                      <p className="text-sm font-medium">PKR {booking.totalPrice}</p>
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