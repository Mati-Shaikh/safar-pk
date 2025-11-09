import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, Plus, Edit, Trash2, Search, Bed, Image, X, ExternalLink, Car } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { ImageUpload } from '@/components/hotel/ImageUpload';

const AVAILABLE_AMENITIES = [
  'WiFi',
  'Swimming Pool',
  'Gym/Fitness Center',
  'Restaurant',
  'Bar/Lounge',
  'Room Service',
  'Parking',
  'Free Parking',
  'Spa',
  'Concierge',
  'Laundry Service',
  'Business Center',
  'Conference Rooms',
  'Airport Shuttle',
  'Pet Friendly',
  'Air Conditioning',
  'Breakfast Included',
  '24/7 Front Desk',
  'Elevator',
  'Non-Smoking Rooms'
];

interface Hotel {
  id: string;
  owner_id: string;
  name: string;
  description?: string;
  location: string;
  amenities: string[];
  images: string[];
  rating: number;
  created_at: string;
  updated_at: string;
}

interface HotelRoom {
  id: string;
  hotel_id: string;
  type: string;
  description?: string;
  price_per_night: number;
  capacity: number;
  amenities: string[];
  images: string[];
  available: boolean;
  created_at: string;
  updated_at: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

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

export const HotelManagement: React.FC = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [rooms, setRooms] = useState<HotelRoom[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [hotelOwners, setHotelOwners] = useState<User[]>([]);
  const [drivers, setDrivers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddHotelDialogOpen, setIsAddHotelDialogOpen] = useState(false);
  const [isEditHotelDialogOpen, setIsEditHotelDialogOpen] = useState(false);
  const [isAddRoomDialogOpen, setIsAddRoomDialogOpen] = useState(false);
  const [isEditRoomDialogOpen, setIsEditRoomDialogOpen] = useState(false);
  const [isAddVehicleDialogOpen, setIsAddVehicleDialogOpen] = useState(false);
  const [isEditVehicleDialogOpen, setIsEditVehicleDialogOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [editingRoom, setEditingRoom] = useState<HotelRoom | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<string>('');
  const [selectedHotelForVehicles, setSelectedHotelForVehicles] = useState<string>('');
  const [newHotel, setNewHotel] = useState({
    owner_id: '',
    name: '',
    description: '',
    location: '',
    amenities: [] as string[],
    images: [] as string[],
    rating: 0
  });
  const [newRoom, setNewRoom] = useState({
    hotel_id: '',
    type: '',
    description: '',
    price_per_night: 0,
    capacity: 1,
    amenities: [] as string[],
    images: [] as string[],
    available: true
  });
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
  const { toast } = useToast();

  useEffect(() => {
    fetchHotels();
    fetchHotelOwners();
    fetchDrivers();
    fetchVehicles();
  }, []);

  useEffect(() => {
    if (selectedHotel) {
      fetchRooms(selectedHotel);
    }
  }, [selectedHotel]);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('hotels')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Fetched hotels:', data);
      setHotels(data || []);
    } catch (error) {
      console.error('Error fetching hotels:', error);
      toast({
        title: "Error",
        description: "Failed to fetch hotels. Please check your database connection.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async (hotelId: string) => {
    try {
      const { data, error } = await supabase
        .from('hotel_rooms')
        .select('*')
        .eq('hotel_id', hotelId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRooms(data || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const fetchHotelOwners = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, full_name, email')
        .eq('role', 'hotel_owner');

      if (error) throw error;
      // Map full_name to name for compatibility with the User interface
      const mappedData = (data || []).map(owner => ({
        id: owner.id,
        name: owner.full_name,
        email: owner.email
      }));
      setHotelOwners(mappedData);
    } catch (error) {
      console.error('Error fetching hotel owners:', error);
    }
  };

  const fetchDrivers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, full_name, email')
        .eq('role', 'driver');

      if (error) throw error;
      setDrivers(data || []);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const fetchVehicles = async () => {
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
      console.error('Error fetching vehicles:', error);
    }
  };

  const handleAddHotel = async () => {
    if (!newHotel.owner_id) {
      toast({
        title: "Validation Error",
        description: "Please select a hotel owner",
        variant: "destructive",
      });
      return;
    }

    if (!newHotel.name || !newHotel.location) {
      toast({
        title: "Validation Error",
        description: "Hotel name and location are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('hotels')
        .insert([newHotel]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Hotel added successfully",
      });

      setNewHotel({
        owner_id: '',
        name: '',
        description: '',
        location: '',
        amenities: [],
        images: [],
        rating: 0
      });
      setIsAddHotelDialogOpen(false);
      fetchHotels();
    } catch (error) {
      console.error('Error adding hotel:', error);
      toast({
        title: "Error",
        description: "Failed to add hotel",
        variant: "destructive",
      });
    }
  };

  const handleEditHotel = async () => {
    if (!editingHotel) return;

    try {
      const { error } = await supabase
        .from('hotels')
        .update(editingHotel)
        .eq('id', editingHotel.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Hotel updated successfully",
      });
      
      setIsEditHotelDialogOpen(false);
      setEditingHotel(null);
      fetchHotels();
    } catch (error) {
      console.error('Error updating hotel:', error);
      toast({
        title: "Error",
        description: "Failed to update hotel",
        variant: "destructive",
      });
    }
  };

  const handleDeleteHotel = async (hotelId: string) => {
    try {
      const { error } = await supabase
        .from('hotels')
        .delete()
        .eq('id', hotelId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Hotel deleted successfully",
      });
      
      fetchHotels();
    } catch (error) {
      console.error('Error deleting hotel:', error);
      toast({
        title: "Error",
        description: "Failed to delete hotel",
        variant: "destructive",
      });
    }
  };

  const handleAddRoom = async () => {
    try {
      const { error } = await supabase
        .from('hotel_rooms')
        .insert([newRoom]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Room added successfully",
      });
      
      setNewRoom({
        hotel_id: '',
        type: '',
        description: '',
        price_per_night: 0,
        capacity: 1,
        amenities: [],
        images: [],
        available: true
      });
      setIsAddRoomDialogOpen(false);
      if (selectedHotel) {
        fetchRooms(selectedHotel);
      }
    } catch (error) {
      console.error('Error adding room:', error);
      toast({
        title: "Error",
        description: "Failed to add room",
        variant: "destructive",
      });
    }
  };

  const handleEditRoom = async () => {
    if (!editingRoom) return;

    try {
      const { error } = await supabase
        .from('hotel_rooms')
        .update(editingRoom)
        .eq('id', editingRoom.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Room updated successfully",
      });
      
      setIsEditRoomDialogOpen(false);
      setEditingRoom(null);
      if (selectedHotel) {
        fetchRooms(selectedHotel);
      }
    } catch (error) {
      console.error('Error updating room:', error);
      toast({
        title: "Error",
        description: "Failed to update room",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    try {
      const { error } = await supabase
        .from('hotel_rooms')
        .delete()
        .eq('id', roomId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Room deleted successfully",
      });

      if (selectedHotel) {
        fetchRooms(selectedHotel);
      }
    } catch (error) {
      console.error('Error deleting room:', error);
      toast({
        title: "Error",
        description: "Failed to delete room",
        variant: "destructive",
      });
    }
  };

  const handleAddVehicle = async () => {
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
      setIsAddVehicleDialogOpen(false);
      fetchVehicles();
    } catch (error) {
      console.error('Error adding vehicle:', error);
      toast({
        title: "Error",
        description: "Failed to add vehicle",
        variant: "destructive",
      });
    }
  };

  const handleEditVehicle = async () => {
    if (!editingVehicle) return;

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

      setIsEditVehicleDialogOpen(false);
      setEditingVehicle(null);
      fetchVehicles();
    } catch (error) {
      console.error('Error updating vehicle:', error);
      toast({
        title: "Error",
        description: "Failed to update vehicle",
        variant: "destructive",
      });
    }
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    try {
      const { error} = await supabase
        .from('vehicles')
        .delete()
        .eq('id', vehicleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Vehicle deleted successfully",
      });

      fetchVehicles();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast({
        title: "Error",
        description: "Failed to delete vehicle",
        variant: "destructive",
      });
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

  const toggleAmenity = (amenity: string) => {
    setNewHotel(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const toggleEditHotelAmenity = (amenity: string) => {
    if (!editingHotel) return;
    setEditingHotel(prev => ({
      ...prev!,
      amenities: prev!.amenities.includes(amenity)
        ? prev!.amenities.filter(a => a !== amenity)
        : [...prev!.amenities, amenity]
    }));
  };

  const filteredHotels = hotels.filter(hotel =>
    (hotel.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (hotel.location?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (hotelOwners.find(owner => owner.id === hotel.owner_id)?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading hotels...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="hotels" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="hotels">Hotels</TabsTrigger>
          <TabsTrigger value="rooms">Rooms</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
        </TabsList>

        <TabsContent value="hotels" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Hotel Management
              </CardTitle>
              <CardDescription>
                Manage all hotels in the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search hotels..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Dialog open={isAddHotelDialogOpen} onOpenChange={setIsAddHotelDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Hotel
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add New Hotel</DialogTitle>
                      <DialogDescription>
                        Add a new hotel to the platform.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="owner">Hotel Owner</Label>
                        <select
                          id="owner"
                          value={newHotel.owner_id}
                          onChange={(e) => setNewHotel({ ...newHotel, owner_id: e.target.value })}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="">Select a hotel owner</option>
                          {hotelOwners.map((owner) => (
                            <option key={owner.id} value={owner.id}>
                              {owner.name} ({owner.email})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Hotel Name</Label>
                          <Input
                            id="name"
                            value={newHotel.name}
                            onChange={(e) => setNewHotel({ ...newHotel, name: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            value={newHotel.location}
                            onChange={(e) => setNewHotel({ ...newHotel, location: e.target.value })}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={newHotel.description}
                          onChange={(e) => setNewHotel({ ...newHotel, description: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="rating">Rating (0-5)</Label>
                        <Input
                          id="rating"
                          type="number"
                          min="0"
                          max="5"
                          step="0.1"
                          value={newHotel.rating}
                          onChange={(e) => setNewHotel({ ...newHotel, rating: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                      <div>
                        <Label>Hotel Amenities</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 border rounded-md max-h-60 overflow-y-auto">
                          {AVAILABLE_AMENITIES.map((amenity) => (
                            <div key={amenity} className="flex items-center space-x-2">
                              <Checkbox
                                id={`new-${amenity}`}
                                checked={newHotel.amenities.includes(amenity)}
                                onCheckedChange={() => toggleAmenity(amenity)}
                              />
                              <Label
                                htmlFor={`new-${amenity}`}
                                className="text-sm font-normal cursor-pointer"
                              >
                                {amenity}
                              </Label>
                            </div>
                          ))}
                        </div>
                        {newHotel.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            <p className="text-sm text-muted-foreground w-full">Selected amenities:</p>
                            {newHotel.amenities.map((amenity, index) => (
                              <Badge key={index} variant="secondary">
                                {amenity}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <ImageUpload
                        images={newHotel.images}
                        onImagesChange={(images) => setNewHotel({ ...newHotel, images })}
                        maxImages={10}
                        label="Hotel Images"
                      />
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddHotelDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddHotel}>Add Hotel</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hotel</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Images</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHotels.map((hotel) => (
                    <TableRow key={hotel.id}>
                      <TableCell className="font-medium">{hotel.name}</TableCell>
                      <TableCell>{hotelOwners.find(owner => owner.id === hotel.owner_id)?.name || 'Unknown'}</TableCell>
                      <TableCell>{hotel.location}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Image className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{hotel.images?.length || 0} images</span>
                          {hotel.images && hotel.images.length > 0 && (
                            <div className="flex -space-x-2">
                              {hotel.images.slice(0, 3).map((img, idx) => (
                                <img
                                  key={idx}
                                  src={img}
                                  alt={`${hotel.name} ${idx + 1}`}
                                  className="w-8 h-8 rounded-full border-2 border-white object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Im0xNSAxMi0zIDMtMy0zIiBzdHJva2U9IiM5Y2EzYWYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjwvcG5nPgo=';
                                  }}
                                />
                              ))}
                              {hotel.images.length > 3 && (
                                <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                                  +{hotel.images.length - 3}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span>{hotel.rating}</span>
                          <span className="text-yellow-500">★</span>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(hotel.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingHotel(hotel);
                              setIsEditHotelDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the hotel and all its rooms.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteHotel(hotel.id)}>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rooms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bed className="h-5 w-5" />
                Room Management
              </CardTitle>
              <CardDescription>
                Manage hotel rooms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-4">
                  <div>
                    <Label htmlFor="hotel-select">Select Hotel</Label>
                    <select
                      id="hotel-select"
                      value={selectedHotel}
                      onChange={(e) => setSelectedHotel(e.target.value)}
                      className="w-64 p-2 border rounded-md"
                    >
                      <option value="">Select a hotel</option>
                      {hotels.map((hotel) => (
                        <option key={hotel.id} value={hotel.id}>
                          {hotel.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {selectedHotel && (
                  <Dialog open={isAddRoomDialogOpen} onOpenChange={setIsAddRoomDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Room
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Room</DialogTitle>
                        <DialogDescription>
                          Add a new room to the selected hotel.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="room-type">Room Type</Label>
                            <Input
                              id="room-type"
                              value={newRoom.type}
                              onChange={(e) => setNewRoom({ ...newRoom, type: e.target.value })}
                              placeholder="e.g., Standard, Deluxe, Suite"
                            />
                          </div>
                          <div>
                            <Label htmlFor="room-capacity">Capacity</Label>
                            <Input
                              id="room-capacity"
                              type="number"
                              value={newRoom.capacity}
                              onChange={(e) => setNewRoom({ ...newRoom, capacity: parseInt(e.target.value) || 1 })}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="room-price">Price per Night (PKR)</Label>
                          <Input
                            id="room-price"
                            type="number"
                            value={newRoom.price_per_night}
                            onChange={(e) => setNewRoom({ ...newRoom, price_per_night: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="room-description">Description</Label>
                          <Textarea
                            id="room-description"
                            value={newRoom.description}
                            onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                          />
                        </div>
                        <ImageUpload
                          images={newRoom.images}
                          onImagesChange={(images) => setNewRoom({ ...newRoom, images })}
                          maxImages={8}
                          label="Room Images"
                        />
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="room-available"
                            checked={newRoom.available}
                            onChange={(e) => setNewRoom({ ...newRoom, available: e.target.checked })}
                          />
                          <Label htmlFor="room-available">Available</Label>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddRoomDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={() => {
                          setNewRoom({ ...newRoom, hotel_id: selectedHotel });
                          handleAddRoom();
                        }}>Add Room</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              {selectedHotel ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Price/Night</TableHead>
                      <TableHead>Images</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rooms.map((room) => (
                      <TableRow key={room.id}>
                        <TableCell className="font-medium">{room.type}</TableCell>
                        <TableCell>{room.capacity}</TableCell>
                        <TableCell>PKR {room.price_per_night}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Image className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{room.images?.length || 0} images</span>
                            {room.images && room.images.length > 0 && (
                              <div className="flex -space-x-2">
                                {room.images.slice(0, 2).map((img, idx) => (
                                  <img
                                    key={idx}
                                    src={img}
                                    alt={`${room.type} ${idx + 1}`}
                                    className="w-6 h-6 rounded border border-white object-cover"
                                    onError={(e) => {
                                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Im0xNSAxMi0zIDMtMy0zIiBzdHJva2U9IiM5Y2EzYWYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjwvcG5nPgo=';
                                    }}
                                  />
                                ))}
                                {room.images.length > 2 && (
                                  <div className="w-6 h-6 rounded border border-white bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                                    +{room.images.length - 2}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={room.available ? 'default' : 'secondary'}>
                            {room.available ? 'Available' : 'Unavailable'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingRoom(room);
                                setIsEditRoomDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the room.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteRoom(room.id)}>
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
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  Select a hotel to view its rooms
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vehicles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Vehicle Management
              </CardTitle>
              <CardDescription>
                Manage hotel vehicles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search vehicles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Dialog open={isAddVehicleDialogOpen} onOpenChange={setIsAddVehicleDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Vehicle
                    </Button>
                  </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add New Vehicle</DialogTitle>
                        <DialogDescription>
                          Add a new vehicle to the selected hotel.
                        </DialogDescription>
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
                                {(driver as any).full_name} ({driver.email})
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
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddVehicleDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddVehicle}>Add Vehicle</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
              </div>

              <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Driver</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Seats</TableHead>
                      <TableHead>Price/Day</TableHead>
                      <TableHead>Images</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vehicles.map((vehicle) => (
                      <TableRow key={vehicle.id}>
                        <TableCell className="font-medium">{vehicle.name}</TableCell>
                        <TableCell>{(vehicle as any).user_profiles?.full_name || 'Unknown'}</TableCell>
                        <TableCell>{vehicle.type}</TableCell>
                        <TableCell>{vehicle.seats}</TableCell>
                        <TableCell>PKR {vehicle.price_per_day}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Image className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{vehicle.images?.length || 0} images</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={vehicle.available ? 'default' : 'secondary'}>
                            {vehicle.available ? 'Available' : 'Unavailable'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingVehicle(vehicle);
                                setIsEditVehicleDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="h-4 w-4" />
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
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Hotel Dialog */}
      <Dialog open={isEditHotelDialogOpen} onOpenChange={setIsEditHotelDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Hotel</DialogTitle>
            <DialogDescription>
              Update hotel information.
            </DialogDescription>
          </DialogHeader>
          {editingHotel && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Hotel Name</Label>
                  <Input
                    id="edit-name"
                    value={editingHotel.name}
                    onChange={(e) => setEditingHotel({ ...editingHotel, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-location">Location</Label>
                  <Input
                    id="edit-location"
                    value={editingHotel.location}
                    onChange={(e) => setEditingHotel({ ...editingHotel, location: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingHotel.description || ''}
                  onChange={(e) => setEditingHotel({ ...editingHotel, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-rating">Rating (0-5)</Label>
                <Input
                  id="edit-rating"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={editingHotel.rating}
                  onChange={(e) => setEditingHotel({ ...editingHotel, rating: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Hotel Amenities</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 border rounded-md max-h-60 overflow-y-auto">
                  {AVAILABLE_AMENITIES.map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-${amenity}`}
                        checked={editingHotel.amenities.includes(amenity)}
                        onCheckedChange={() => toggleEditHotelAmenity(amenity)}
                      />
                      <Label
                        htmlFor={`edit-${amenity}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {amenity}
                      </Label>
                    </div>
                  ))}
                </div>
                {editingHotel.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    <p className="text-sm text-muted-foreground w-full">Selected amenities:</p>
                    {editingHotel.amenities.map((amenity, index) => (
                      <Badge key={index} variant="secondary">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <ImageUpload
                images={editingHotel.images}
                onImagesChange={(images) => setEditingHotel({ ...editingHotel, images })}
                maxImages={10}
                label="Hotel Images"
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditHotelDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditHotel}>Update Hotel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Room Dialog */}
      <Dialog open={isEditRoomDialogOpen} onOpenChange={setIsEditRoomDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Room</DialogTitle>
            <DialogDescription>
              Update room information.
            </DialogDescription>
          </DialogHeader>
          {editingRoom && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-room-type">Room Type</Label>
                  <Input
                    id="edit-room-type"
                    value={editingRoom.type}
                    onChange={(e) => setEditingRoom({ ...editingRoom, type: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-room-capacity">Capacity</Label>
                  <Input
                    id="edit-room-capacity"
                    type="number"
                    value={editingRoom.capacity}
                    onChange={(e) => setEditingRoom({ ...editingRoom, capacity: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-room-price">Price per Night (PKR)</Label>
                <Input
                  id="edit-room-price"
                  type="number"
                  value={editingRoom.price_per_night}
                  onChange={(e) => setEditingRoom({ ...editingRoom, price_per_night: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="edit-room-description">Description</Label>
                <Textarea
                  id="edit-room-description"
                  value={editingRoom.description || ''}
                  onChange={(e) => setEditingRoom({ ...editingRoom, description: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-room-available"
                  checked={editingRoom.available}
                  onChange={(e) => setEditingRoom({ ...editingRoom, available: e.target.checked })}
                />
                <Label htmlFor="edit-room-available">Available</Label>
              </div>
              <ImageUpload
                images={editingRoom.images}
                onImagesChange={(images) => setEditingRoom({ ...editingRoom, images })}
                maxImages={8}
                label="Room Images"
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditRoomDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditRoom}>Update Room</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Vehicle Dialog */}
      <Dialog open={isEditVehicleDialogOpen} onOpenChange={setIsEditVehicleDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Vehicle</DialogTitle>
            <DialogDescription>
              Update vehicle information.
            </DialogDescription>
          </DialogHeader>
          {editingVehicle && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-vehicle-name">Vehicle Name</Label>
                  <Input
                    id="edit-vehicle-name"
                    value={editingVehicle.name}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-vehicle-type">Type</Label>
                  <Input
                    id="edit-vehicle-type"
                    value={editingVehicle.type}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, type: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-vehicle-seats">Seats</Label>
                  <Input
                    id="edit-vehicle-seats"
                    type="number"
                    value={editingVehicle.seats}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, seats: parseInt(e.target.value) || 4 })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-vehicle-price">Price per Day (PKR)</Label>
                  <Input
                    id="edit-vehicle-price"
                    type="number"
                    value={editingVehicle.price_per_day}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, price_per_day: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-vehicle-description">Description</Label>
                <Textarea
                  id="edit-vehicle-description"
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
                  id="edit-vehicle-available"
                  checked={editingVehicle.available}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, available: e.target.checked })}
                />
                <Label htmlFor="edit-vehicle-available">Available</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditVehicleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditVehicle}>Update Vehicle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
