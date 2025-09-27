import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, MapPin, Building, Car, BarChart3, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AdminStats {
  totalUsers: number;
  totalDestinations: number;
  totalHotels: number;
  totalRooms: number;
  totalVehicles: number;
  totalTrips: number;
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  totalRevenue: number;
  userDistribution: {
    customers: number;
    drivers: number;
    hotels: number;
    admins: number;
  };
  recentActivity: {
    type: string;
    description: string;
    timestamp: string;
  }[];
}

export const AdminStats: React.FC = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalDestinations: 0,
    totalHotels: 0,
    totalRooms: 0,
    totalVehicles: 0,
    totalTrips: 0,
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    totalRevenue: 0,
    userDistribution: {
      customers: 0,
      drivers: 0,
      hotels: 0,
      admins: 0
    },
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Fetch all data from Supabase in parallel
      const [
        { data: users, error: usersError },
        { data: destinations, error: destinationsError },
        { data: hotels, error: hotelsError },
        { data: rooms, error: roomsError },
        { data: vehicles, error: vehiclesError },
        { data: trips, error: tripsError },
        { data: bookings, error: bookingsError }
      ] = await Promise.all([
        supabase.from('user_profiles').select('*'),
        supabase.from('destinations').select('*'),
        supabase.from('hotels').select('*'),
        supabase.from('hotel_rooms').select('*'),
        supabase.from('vehicles').select('*'),
        supabase.from('trips').select('*'),
        supabase.from('bookings').select('*')
      ]);

      // Log any errors for debugging
      if (usersError) console.error('Users error:', usersError);
      if (destinationsError) console.error('Destinations error:', destinationsError);
      if (hotelsError) console.error('Hotels error:', hotelsError);
      if (roomsError) console.error('Rooms error:', roomsError);
      if (vehiclesError) console.error('Vehicles error:', vehiclesError);
      if (tripsError) console.error('Trips error:', tripsError);
      if (bookingsError) console.error('Bookings error:', bookingsError);

      // Calculate user distribution
      const userDistribution = {
        customers: (users || []).filter((u: any) => u.role === 'customer').length,
        drivers: (users || []).filter((u: any) => u.role === 'driver').length,
        hotels: (users || []).filter((u: any) => u.role === 'hotel').length,
        admins: (users || []).filter((u: any) => u.role === 'admin').length
      };

      // Calculate booking stats
      const pendingBookings = (bookings || []).filter((b: any) => b.status === 'pending').length;
      const confirmedBookings = (bookings || []).filter((b: any) => b.status === 'confirmed').length;
      const totalRevenue = (bookings || [])
        .filter((b: any) => b.status === 'confirmed')
        .reduce((sum: number, b: any) => sum + (b.total_price || 0), 0);

      // Generate recent activity (mock data for now)
      const recentActivity = [
        {
          type: 'user',
          description: 'New customer registered',
          timestamp: new Date().toISOString()
        },
        {
          type: 'booking',
          description: 'New booking confirmed',
          timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
          type: 'hotel',
          description: 'New hotel added',
          timestamp: new Date(Date.now() - 7200000).toISOString()
        }
      ];

      setStats({
        totalUsers: (users || []).length,
        totalDestinations: (destinations || []).length,
        totalHotels: (hotels || []).length,
        totalRooms: (rooms || []).length,
        totalVehicles: (vehicles || []).length,
        totalTrips: (trips || []).length,
        totalBookings: (bookings || []).length,
        pendingBookings,
        confirmedBookings,
        totalRevenue,
        userDistribution,
        recentActivity
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <p className="text-sm text-muted-foreground">Destinations</p>
                <p className="text-2xl font-bold">{stats.totalDestinations}</p>
              </div>
              <MapPin className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Hotels</p>
                <p className="text-2xl font-bold">{stats.totalHotels}</p>
              </div>
              <Building className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vehicles</p>
                <p className="text-2xl font-bold">{stats.totalVehicles}</p>
              </div>
              <Car className="h-8 w-8 text-primary" />
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
              <BarChart3 className="h-8 w-8 text-primary" />
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
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Bookings</p>
                <p className="text-2xl font-bold">{stats.pendingBookings}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">PKR {stats.totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Distribution</CardTitle>
            <CardDescription>
              Breakdown of users by role
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Customers</span>
              <Badge variant="secondary">{stats.userDistribution.customers}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Drivers</span>
              <Badge variant="secondary">{stats.userDistribution.drivers}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Hotels</span>
              <Badge variant="secondary">{stats.userDistribution.hotels}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Admins</span>
              <Badge variant="default">{stats.userDistribution.admins}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Booking Status</CardTitle>
            <CardDescription>
              Current booking status overview
            </CardDescription>
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
                PKR {stats.totalRevenue.toLocaleString()}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Rooms</span>
              <Badge variant="secondary">{stats.totalRooms}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest platform activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{activity.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
                <Badge variant="outline">{activity.type}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
