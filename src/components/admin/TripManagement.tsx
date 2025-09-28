import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plane, Plus, Edit, Trash2, Search, Eye, Users, Calendar, MapPin, Star, Camera, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import AdminTripBuilder from './AdminTripBuilder';

interface Trip {
  id: string;
  user_id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  budget?: number;
  number_of_people: number;
  needs_car: boolean;
  car_type?: string;
  preferences?: string;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  trip_type: 'custom' | 'package';
  destinations?: string[];
  highlights?: string[];
  itinerary?: any;
  created_at: string;
  user_profiles?: {
    full_name: string;
    email: string;
  };
}

export const TripManagement: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isTripBuilderOpen, setIsTripBuilderOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [viewingTrip, setViewingTrip] = useState<Trip | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchTrips();
    fetchUsers();
  }, []);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          user_profiles!trips_user_id_fkey (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Fetched trips:', data);
      setTrips(data || []);
    } catch (error) {
      console.error('Error fetching trips:', error);
      toast({
        title: "Error",
        description: "Failed to fetch trips. Please check your database connection.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, full_name, email')
        .order('full_name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreateTrip = async (tripData: any) => {
    try {
      const { error } = await supabase
        .from('trips')
        .insert([tripData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Trip created successfully with detailed itinerary",
      });

      fetchTrips();
    } catch (error) {
      console.error('Error creating trip:', error);
      throw error; // Let AdminTripBuilder handle the error display
    }
  };

  const handleEditTrip = async () => {
    if (!editingTrip) return;

    try {
      const { user_profiles, ...tripData } = editingTrip;
      const { error } = await supabase
        .from('trips')
        .update(tripData)
        .eq('id', editingTrip.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Trip updated successfully",
      });

      setIsEditDialogOpen(false);
      setEditingTrip(null);
      fetchTrips();
    } catch (error) {
      console.error('Error updating trip:', error);
      toast({
        title: "Error",
        description: "Failed to update trip",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    try {
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', tripId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Trip deleted successfully",
      });

      fetchTrips();
    } catch (error) {
      console.error('Error deleting trip:', error);
      toast({
        title: "Error",
        description: "Failed to delete trip",
        variant: "destructive",
      });
    }
  };

  const filteredTrips = trips.filter(trip => {
    const matchesSearch =
      (trip.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (trip.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (trip.user_profiles?.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (trip.user_profiles?.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || trip.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'planned': return 'secondary';
      case 'active': return 'default';
      case 'completed': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case 'planned': return 'Planned';
      case 'active': return 'Active';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const formatPrice = (budget: number | null) => {
    if (!budget) return 'No budget set';
    return `PKR ${budget.toLocaleString()}`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading trips...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            Trip Management
          </CardTitle>
          <CardDescription>
            Manage all platform trips and bookings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search trips..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => setIsTripBuilderOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Custom Trip
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trip Name</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>People</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrips.map((trip) => (
                  <TableRow key={trip.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-medium">{trip.name}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {trip.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{trip.user_profiles?.full_name || 'Unknown'}</div>
                        <div className="text-sm text-muted-foreground">{trip.user_profiles?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {trip.number_of_people}
                      </div>
                    </TableCell>
                    <TableCell>{formatPrice(trip.budget)}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(trip.status)}>
                        {getStatusDisplayName(trip.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(trip.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setViewingTrip(trip);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingTrip(trip);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the trip.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteTrip(trip.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredTrips.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No trips found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Trip Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto p-0">
          {viewingTrip && (
            <div className="relative">
              {/* Gradient Overlay Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 opacity-50"></div>

              {/* Content Container */}
              <div className="relative z-10">
                {/* Header with Gradient */}
                <div className="relative bg-gradient-to-r from-black via-gray-900 to-gray-800 p-6 text-white">
                  {/* Gradient overlay pattern */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="w-full h-full bg-white/5 bg-[radial-gradient(circle_at_1px_1px,_white_1px,_transparent_0)] bg-[length:20px_20px]"></div>
                  </div>
                  <div className="relative flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                        <Plane className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <Badge className="bg-white/10 text-white border-white/20 backdrop-blur-sm mb-2">
                          {viewingTrip.trip_type === 'custom' ? 'Custom Trip' : 'Package Trip'}
                        </Badge>
                        <h3 className="text-xl font-bold text-white leading-tight">
                          {viewingTrip.name}
                        </h3>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant="secondary"
                        className="bg-white/90 text-gray-900 font-semibold mb-2"
                      >
                        {(() => {
                          const startDate = new Date(viewingTrip.start_date);
                          const endDate = new Date(viewingTrip.end_date);
                          const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                          return `${diffDays} days`;
                        })()}
                      </Badge>
                      <div className="text-right">
                        <Badge variant={getStatusBadgeVariant(viewingTrip.status)} className="bg-white/90">
                          {getStatusDisplayName(viewingTrip.status)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-200 text-sm leading-relaxed line-clamp-2">
                    {viewingTrip.description}
                  </p>
                </div>

                {/* Trip Content */}
                <div className="p-6 space-y-6">
                  {/* Trip Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                      <div className="flex items-center justify-center mb-2">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Users className="h-4 w-4 text-green-600" />
                        </div>
                      </div>
                      <div className="text-lg font-bold text-gray-900">{viewingTrip.number_of_people}</div>
                      <div className="text-xs text-gray-500">{viewingTrip.number_of_people === 1 ? 'Person' : 'People'}</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                      <div className="flex items-center justify-center mb-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Calendar className="h-4 w-4 text-blue-600" />
                        </div>
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {new Date(viewingTrip.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="text-xs text-gray-500">Start Date</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                      <div className="flex items-center justify-center mb-2">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Calendar className="h-4 w-4 text-purple-600" />
                        </div>
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {new Date(viewingTrip.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="text-xs text-gray-500">End Date</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                      <div className="flex items-center justify-center mb-2">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                          <Star className="h-4 w-4 text-yellow-600" />
                        </div>
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {viewingTrip.budget ? `${(viewingTrip.budget / 1000).toFixed(0)}K` : 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">Budget (PKR)</div>
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1 bg-blue-100 rounded">
                        <Users className="h-4 w-4 text-blue-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900">Customer Information</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Name:</span>
                        <span className="ml-2 text-gray-600">{viewingTrip.user_profiles?.full_name || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Email:</span>
                        <span className="ml-2 text-gray-600">{viewingTrip.user_profiles?.email || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Destinations */}
                  {viewingTrip.destinations && viewingTrip.destinations.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-1 bg-orange-100 rounded">
                          <MapPin className="h-4 w-4 text-orange-600" />
                        </div>
                        <h4 className="font-semibold text-gray-900">Destinations</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {viewingTrip.destinations.map((dest, index) => (
                          <Badge key={index} variant="outline" className="flex items-center gap-1 text-orange-700 border-orange-200">
                            <MapPin className="h-3 w-3" />
                            {dest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Highlights */}
                  {viewingTrip.highlights && viewingTrip.highlights.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-1 bg-purple-100 rounded">
                          <Star className="h-4 w-4 text-purple-600" />
                        </div>
                        <h4 className="font-semibold text-gray-900">Trip Highlights</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {viewingTrip.highlights.map((highlight, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm p-2 bg-purple-50 rounded border border-purple-100">
                            <Camera className="h-3 w-3 text-purple-600" />
                            {highlight}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Preferences */}
                  {viewingTrip.preferences && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-1 bg-green-100 rounded">
                          <Eye className="h-4 w-4 text-green-600" />
                        </div>
                        <h4 className="font-semibold text-gray-900">Preferences & Requirements</h4>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{viewingTrip.preferences}</p>
                    </div>
                  )}

                  {/* Detailed Itinerary */}
                  {viewingTrip.itinerary && viewingTrip.itinerary.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-1 bg-indigo-100 rounded">
                          <Calendar className="h-4 w-4 text-indigo-600" />
                        </div>
                        <h4 className="font-semibold text-gray-900">Detailed Itinerary</h4>
                      </div>
                      <div className="space-y-4 max-h-60 overflow-y-auto">
                        {viewingTrip.itinerary.map((day: any, dayIndex: number) => (
                          <div key={day.date} className="border border-gray-100 rounded-lg p-3">
                            <h5 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-indigo-600" />
                              Day {dayIndex + 1} - {new Date(day.date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </h5>
                            {day.slots && day.slots.length > 0 ? (
                              <div className="space-y-2">
                                {day.slots.map((slot: any, slotIndex: number) => (
                                  <div key={slot.id || slotIndex} className="text-sm bg-gray-50 p-2 rounded">
                                    <div className="font-medium text-gray-700">{slot.activity || 'Activity not specified'}</div>
                                    {slot.location && (
                                      <div className="text-gray-600 flex items-center gap-1 mt-1">
                                        <MapPin className="h-3 w-3" />
                                        {slot.location}
                                      </div>
                                    )}
                                    {(slot.startTime || slot.endTime) && (
                                      <div className="text-gray-600 flex items-center gap-1 mt-1">
                                        <Clock className="h-3 w-3" />
                                        {slot.startTime} - {slot.endTime}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">No activities planned for this day</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Footer */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      Created on {new Date(viewingTrip.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingTrip(viewingTrip);
                          setIsViewDialogOpen(false);
                          setIsEditDialogOpen(true);
                        }}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Trip
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsViewDialogOpen(false)}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Trip Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Trip</DialogTitle>
            <DialogDescription>
              Update trip information and status.
            </DialogDescription>
          </DialogHeader>
          {editingTrip && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Trip Name</Label>
                  <Input
                    id="edit-name"
                    value={editingTrip.name}
                    onChange={(e) => setEditingTrip({ ...editingTrip, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-people">Number of People</Label>
                  <Input
                    id="edit-people"
                    type="number"
                    min="1"
                    value={editingTrip.number_of_people}
                    onChange={(e) => setEditingTrip({ ...editingTrip, number_of_people: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingTrip.description}
                  onChange={(e) => setEditingTrip({ ...editingTrip, description: e.target.value })}
                  className="min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-start-date">Start Date</Label>
                  <Input
                    id="edit-start-date"
                    type="date"
                    value={editingTrip.start_date}
                    onChange={(e) => setEditingTrip({ ...editingTrip, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-end-date">End Date</Label>
                  <Input
                    id="edit-end-date"
                    type="date"
                    value={editingTrip.end_date}
                    onChange={(e) => setEditingTrip({ ...editingTrip, end_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-budget">Budget (PKR)</Label>
                  <Input
                    id="edit-budget"
                    type="number"
                    value={editingTrip.budget || ''}
                    onChange={(e) => setEditingTrip({ ...editingTrip, budget: parseFloat(e.target.value) || null })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select value={editingTrip.status} onValueChange={(value: any) => setEditingTrip({ ...editingTrip, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-preferences">Preferences</Label>
                <Textarea
                  id="edit-preferences"
                  value={editingTrip.preferences || ''}
                  onChange={(e) => setEditingTrip({ ...editingTrip, preferences: e.target.value })}
                  className="min-h-[60px]"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditTrip}>Update Trip</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admin Trip Builder */}
      <AdminTripBuilder
        isOpen={isTripBuilderOpen}
        onClose={() => {
          setIsTripBuilderOpen(false);
          setSelectedCustomerId('');
        }}
        onTripCreate={handleCreateTrip}
        selectedCustomerId={selectedCustomerId}
        customers={users}
        onCustomerChange={setSelectedCustomerId}
      />
    </div>
  );
};