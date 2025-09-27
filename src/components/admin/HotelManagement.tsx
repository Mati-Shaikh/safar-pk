import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, Plus, Edit, Trash2, Search, Bed } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

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

export const HotelManagement: React.FC = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [rooms, setRooms] = useState<HotelRoom[]>([]);
  const [hotelOwners, setHotelOwners] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddHotelDialogOpen, setIsAddHotelDialogOpen] = useState(false);
  const [isEditHotelDialogOpen, setIsEditHotelDialogOpen] = useState(false);
  const [isAddRoomDialogOpen, setIsAddRoomDialogOpen] = useState(false);
  const [isEditRoomDialogOpen, setIsEditRoomDialogOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [editingRoom, setEditingRoom] = useState<HotelRoom | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<string>('');
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
  const [amenityInput, setAmenityInput] = useState('');
  const [imageInput, setImageInput] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchHotels();
    fetchHotelOwners();
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
        .select('id, name, email')
        .eq('role', 'hotel');

      if (error) throw error;
      setHotelOwners(data || []);
    } catch (error) {
      console.error('Error fetching hotel owners:', error);
    }
  };

  const handleAddHotel = async () => {
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

  const addAmenity = () => {
    if (amenityInput.trim()) {
      setNewHotel({
        ...newHotel,
        amenities: [...newHotel.amenities, amenityInput.trim()]
      });
      setAmenityInput('');
    }
  };

  const removeAmenity = (index: number) => {
    setNewHotel({
      ...newHotel,
      amenities: newHotel.amenities.filter((_, i) => i !== index)
    });
  };

  const addImage = () => {
    if (imageInput.trim()) {
      setNewHotel({
        ...newHotel,
        images: [...newHotel.images, imageInput.trim()]
      });
      setImageInput('');
    }
  };

  const removeImage = (index: number) => {
    setNewHotel({
      ...newHotel,
      images: newHotel.images.filter((_, i) => i !== index)
    });
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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="hotels">Hotels</TabsTrigger>
          <TabsTrigger value="rooms">Rooms</TabsTrigger>
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
                        <Label>Amenities</Label>
                        <div className="flex gap-2 mb-2">
                          <Input
                            value={amenityInput}
                            onChange={(e) => setAmenityInput(e.target.value)}
                            placeholder="Add an amenity"
                            onKeyPress={(e) => e.key === 'Enter' && addAmenity()}
                          />
                          <Button type="button" onClick={addAmenity}>Add</Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {newHotel.amenities.map((amenity, index) => (
                            <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeAmenity(index)}>
                              {amenity} ×
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label>Images</Label>
                        <div className="flex gap-2 mb-2">
                          <Input
                            value={imageInput}
                            onChange={(e) => setImageInput(e.target.value)}
                            placeholder="Add image URL"
                            onKeyPress={(e) => e.key === 'Enter' && addImage()}
                          />
                          <Button type="button" onClick={addImage}>Add</Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {newHotel.images.map((image, index) => (
                            <Badge key={index} variant="outline" className="cursor-pointer" onClick={() => removeImage(index)}>
                              Image {index + 1} ×
                            </Badge>
                          ))}
                        </div>
                      </div>
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
    </div>
  );
};
