import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Building, Calendar, User, Mail, Bed, Plus, Settings, Car, Edit, Trash2, Eye, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Footer from '@/components/layout/Footer';
import { HotelList } from '@/components/hotel/HotelList';
import { HotelForm } from '@/components/hotel/HotelForm';
import { ImageUpload } from '@/components/hotel/ImageUpload';
import { HotelBookingCalendar } from '@/components/hotel/HotelBookingCalendar';
import '@/components/driver/booking-calendar.css';
import { Hotel, HotelRoom } from '@/types';
import {
  createHotel,
  getHotelsByOwner,
  updateHotel,
  deleteHotel,
  createHotelRoom,
  getHotelRooms,
  updateHotelRoom,
  deleteHotelRoom,
  getHotelBookingsByOwner,
  updateBookingStatus,
  createOrUpdateRoomPricing
} from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

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

// Room Image Gallery Component for Preview
const RoomImageGallery: React.FC<{ room: HotelRoom; selectedRoom: HotelRoom | null }> = ({ room, selectedRoom }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % room.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + room.images.length) % room.images.length);
  };

  const goToImage = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(index);
  };

  return (
    <div className="relative group">
      <img
        src={room.images[currentImageIndex] || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop'}
        alt={`${room.type} - Image ${currentImageIndex + 1}`}
        className="w-full h-64 object-cover rounded-t-lg"
      />

      {/* Capacity Badge */}
      <div className="absolute top-4 left-4">
        <Badge variant="secondary" className="bg-white/90 text-black">
          {room.capacity} {room.capacity === 1 ? 'Guest' : 'Guests'}
        </Badge>
      </div>

      {/* Navigation Arrows */}
      {room.images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-8 w-8"
            onClick={prevImage}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-8 w-8"
            onClick={nextImage}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

      {/* Image Dots */}
      {room.images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1">
          {room.images.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentImageIndex ? 'bg-white' : 'bg-white/50'
              }`}
              onClick={(e) => goToImage(index, e)}
            />
          ))}
        </div>
      )}

      {/* Image Counter */}
      <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded">
        {currentImageIndex + 1} / {room.images.length}
      </div>
    </div>
  );
};

// Hotel Preview Modal Component
const HotelPreviewModal: React.FC<{
  hotel: Hotel | null;
  rooms: HotelRoom[];
  isOpen: boolean;
  onClose: () => void;
}> = ({ hotel, rooms, isOpen, onClose }) => {
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState<HotelRoom | null>(null);

  if (!hotel) return null;

  const hotelRooms = rooms.filter(room => room.available);

  const nextRoom = () => {
    setCurrentRoomIndex((prev) => (prev + 1) % hotelRooms.length);
  };

  const prevRoom = () => {
    setCurrentRoomIndex((prev) => (prev - 1 + hotelRooms.length) % hotelRooms.length);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Eye className="h-6 w-6 text-primary" />
            Customer Preview - {hotel.name}
          </DialogTitle>
          <DialogDescription>
            This is how customers will see your hotel and rooms
          </DialogDescription>
        </DialogHeader>

        {/* Hotel Information */}
        <div className="space-y-6">
          {/* Hotel Header */}
          <div className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-lg border">
            <div className="flex items-start gap-4">
              {hotel.images && hotel.images.length > 0 && (
                <img
                  src={hotel.images[0]}
                  alt={hotel.name}
                  className="w-32 h-32 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{hotel.name}</h2>
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <MapPin className="h-4 w-4" />
                  <span>{hotel.address}</span>
                </div>
                <p className="text-gray-600 text-sm">{hotel.description}</p>
                {hotel.amenities && hotel.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {hotel.amenities.map((amenity, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Rooms Section */}
          {hotelRooms.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Bed className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No available rooms</p>
              <p className="text-sm text-gray-500">Add rooms to show them to customers</p>
            </div>
          ) : (
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Available Rooms</h3>
              
              {/* Room Carousel */}
              <div className="relative">
                <div className="overflow-hidden rounded-lg">
                  <div
                    className="flex transition-transform duration-300 ease-in-out"
                    style={{ transform: `translateX(-${currentRoomIndex * 100}%)` }}
                  >
                    {hotelRooms.map((room) => (
                      <div key={room.id} className="w-full flex-shrink-0">
                        <Card
                          className={`cursor-pointer transition-all duration-300 border-2 ${
                            selectedRoom?.id === room.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedRoom(room)}
                        >
                          <div className="relative">
                            <RoomImageGallery room={room} selectedRoom={selectedRoom} />
                          </div>

                          <CardContent className="p-6">
                            <div className="space-y-4">
                              <div>
                                <h3 className="text-2xl font-bold text-gray-800">{room.type}</h3>
                                <p className="text-sm text-gray-500 mt-2">{room.description}</p>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-3xl font-bold text-gray-800">PKR {room.price_per_night?.toLocaleString() || 'N/A'}</span>
                                <span className="text-sm text-gray-500">per night</span>
                              </div>

                              <div>
                                <h4 className="font-medium text-gray-700 mb-2">Amenities:</h4>
                                <div className="flex flex-wrap gap-2">
                                  {room.amenities && room.amenities.length > 0 ? (
                                    room.amenities.map((amenity, index) => (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        {amenity}
                                      </Badge>
                                    ))
                                  ) : (
                                    <span className="text-sm text-gray-400">No amenities listed</span>
                                  )}
                                </div>
                              </div>

                              <div className="pt-4 border-t">
                                <Button
                                  className="w-full bg-gradient-to-r from-gray-800 to-black text-white hover:from-gray-900 hover:to-gray-800"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedRoom(room);
                                  }}
                                >
                                  {selectedRoom?.id === room.id ? 'Selected' : 'Select This Room'}
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Navigation buttons */}
                {hotelRooms.length > 1 && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white z-10"
                      onClick={prevRoom}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white z-10"
                      onClick={nextRoom}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}

                {/* Dots indicator */}
                {hotelRooms.length > 1 && (
                  <div className="flex justify-center mt-4 space-x-2">
                    {hotelRooms.map((_, index) => (
                      <button
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentRoomIndex ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                        onClick={() => setCurrentRoomIndex(index)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Preview Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Eye className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Preview Mode</h4>
                <p className="text-sm text-blue-700">
                  This is exactly how customers will see your hotel and rooms when booking their trips. 
                  Make sure all information is accurate and images are high quality.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="bg-gradient-to-r from-gray-800 to-black text-white hover:from-gray-900 hover:to-gray-800">
            Close Preview
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Vehicle Image Gallery Component for Preview
const VehicleImageGallery: React.FC<{ vehicle: Vehicle }> = ({ vehicle }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % vehicle.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + vehicle.images.length) % vehicle.images.length);
  };

  const goToImage = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(index);
  };

  if (!vehicle.images || vehicle.images.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-t-lg flex items-center justify-center">
        <Car className="h-16 w-16 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="relative group">
      <img
        src={vehicle.images[currentImageIndex]}
        alt={`${vehicle.name} - Image ${currentImageIndex + 1}`}
        className="w-full h-96 object-cover rounded-t-lg"
      />

      {/* Seats Badge */}
      <div className="absolute top-4 left-4">
        <Badge variant="secondary" className="bg-white/90 text-black flex items-center gap-1">
          <User className="h-3 w-3" />
          {vehicle.seats} Seats
        </Badge>
      </div>

      {/* Available Badge */}
      <div className="absolute top-4 right-4">
        <Badge className={vehicle.available ? 'bg-green-500' : 'bg-gray-500'}>
          {vehicle.available ? 'Available' : 'Not Available'}
        </Badge>
      </div>

      {/* Navigation Arrows */}
      {vehicle.images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-8 w-8"
            onClick={prevImage}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-8 w-8"
            onClick={nextImage}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

      {/* Image Dots */}
      {vehicle.images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1">
          {vehicle.images.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentImageIndex ? 'bg-white' : 'bg-white/50'
              }`}
              onClick={(e) => goToImage(index, e)}
            />
          ))}
        </div>
      )}

      {/* Image Counter */}
      <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded">
        {currentImageIndex + 1} / {vehicle.images.length}
      </div>
    </div>
  );
};

// Vehicle Preview Modal Component
const VehiclePreviewModal: React.FC<{
  vehicle: Vehicle | null;
  isOpen: boolean;
  onClose: () => void;
}> = ({ vehicle, isOpen, onClose }) => {
  if (!vehicle) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Eye className="h-6 w-6 text-primary" />
            Customer Preview - {vehicle.name}
          </DialogTitle>
          <DialogDescription>
            This is how customers will see your vehicle when booking transportation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Vehicle Images */}
          <VehicleImageGallery vehicle={vehicle} />

          {/* Vehicle Details Card */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Header */}
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h2 className="text-3xl font-bold text-gray-800 mb-1">{vehicle.name}</h2>
                      <p className="text-lg text-gray-600">{vehicle.type}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-800">PKR {vehicle.price_per_day.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">per day</div>
                    </div>
                  </div>
                  {vehicle.description && (
                    <p className="text-gray-600 mt-3">{vehicle.description}</p>
                  )}
                </div>

                {/* Vehicle Specs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="flex justify-center mb-2">
                      <User className="h-6 w-6 text-gray-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-800">{vehicle.seats}</div>
                    <div className="text-xs text-gray-600">Seats</div>
                  </div>
                  <div className="text-center">
                    <div className="flex justify-center mb-2">
                      <Car className="h-6 w-6 text-gray-600" />
                    </div>
                    <div className="text-sm font-semibold text-gray-800">{vehicle.type}</div>
                    <div className="text-xs text-gray-600">Type</div>
                  </div>
                  <div className="text-center">
                    <div className="flex justify-center mb-2">
                      <Settings className="h-6 w-6 text-gray-600" />
                    </div>
                    <div className="text-sm font-semibold text-gray-800">
                      {vehicle.features.length > 0 ? `${vehicle.features.length} Features` : 'Standard'}
                    </div>
                    <div className="text-xs text-gray-600">Amenities</div>
                  </div>
                  <div className="text-center">
                    <div className="flex justify-center mb-2">
                      <Badge className={vehicle.available ? 'bg-green-500' : 'bg-gray-500'}>
                        {vehicle.available ? '✓' : '✗'}
                      </Badge>
                    </div>
                    <div className="text-sm font-semibold text-gray-800">
                      {vehicle.available ? 'Available' : 'Unavailable'}
                    </div>
                    <div className="text-xs text-gray-600">Status</div>
                  </div>
                </div>

                {/* Features */}
                {vehicle.features && vehicle.features.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Vehicle Features & Amenities
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {vehicle.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                          <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Call to Action */}
                <div className="border-t pt-6">
                  <Button className="w-full bg-gradient-to-r from-gray-800 to-black text-white hover:from-gray-900 hover:to-gray-800 h-12 text-lg">
                    <Car className="h-5 w-5 mr-2" />
                    Book This Vehicle
                  </Button>
                  <p className="text-xs text-center text-gray-500 mt-2">
                    This is how the booking button appears to customers
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Eye className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Preview Mode</h4>
                <p className="text-sm text-blue-700">
                  This is exactly how customers will see your vehicle when selecting transportation for their trips. 
                  Make sure all details are accurate, images are clear, and features are up-to-date.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="bg-gradient-to-r from-gray-800 to-black text-white hover:from-gray-900 hover:to-gray-800">
            Close Preview
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const HotelDashboard: React.FC = () => {
  const { bookings, updateBooking } = useData();
  const { user, profile } = useAuth();
  const { toast } = useToast();

  // Hotel management state
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [rooms, setRooms] = useState<{ [hotelId: string]: HotelRoom[] }>({});
  const [hotelBookings, setHotelBookings] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [showCreateHotel, setShowCreateHotel] = useState(false);
  const [showCreateVehicle, setShowCreateVehicle] = useState(false);
  const [showCreateDriver, setShowCreateDriver] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [previewHotel, setPreviewHotel] = useState<Hotel | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewVehicle, setPreviewVehicle] = useState<Vehicle | null>(null);
  const [vehiclePreviewDialogOpen, setVehiclePreviewDialogOpen] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    driver_id: '',
    name: '',
    type: '',
    seats: '4',
    price_per_day: '',
    description: '',
    features: [] as string[],
    images: [] as string[],
    available: true
  });
  const [newDriver, setNewDriver] = useState({
    email: '',
    full_name: '',
    phone_number: '',
    password: '',
    confirmPassword: '',
    cnic_front_image: [] as string[],
    cnic_back_image: [] as string[]
  });
  const [featureInput, setFeatureInput] = useState('');

  // Legacy bookings from context (keeping for backward compatibility)
  const contextHotelBookings = bookings.filter(booking =>
    booking.type === 'hotel' && booking.providerId === user?.id
  );

  const handleBookingAction = async (bookingId: string, action: 'confirmed' | 'cancelled') => {
    try {
      const { error } = await updateBookingStatus(bookingId, action);
      if (error) {
        console.error('Error updating booking status:', error);
        toast({
          title: "Error",
          description: "Failed to update booking status",
          variant: "destructive",
        });
      } else {
        // Reload bookings
        loadBookings();
        toast({
          title: "Success",
          description: `Booking ${action} successfully!`,
        });
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive",
      });
    }
  };

  // Load bookings
  const loadBookings = async () => {
    if (!user?.id) return;

    setLoadingBookings(true);
    try {
      const { data, error } = await getHotelBookingsByOwner(user.id);
      if (error) {
        console.error('Error loading bookings:', error);
      } else {
        setHotelBookings(data || []);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoadingBookings(false);
    }
  };

  // Load hotels, rooms, drivers, vehicles, and bookings
  useEffect(() => {
    if (user?.id && profile?.role === 'hotel_owner') {
      loadHotels();
      loadDrivers();
      loadVehicles();
      loadBookings();
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

  const handleCreateRoom = async (hotelId: string, roomData: any, pricingData?: any) => {
    setIsLoading(true);
    try {
      const { data, error } = await createHotelRoom({
        ...roomData,
        hotel_id: hotelId
      });
      if (error) throw error;

      // Save pricing if provided
      if (pricingData && data?.id) {
        await createOrUpdateRoomPricing({
          room_id: data.id,
          ...pricingData
        });
      }

      setRooms(prev => ({
        ...prev,
        [hotelId]: [data, ...(prev[hotelId] || [])]
      }));
      toast({
        title: "Success",
        description: "Room created successfully with pricing configuration",
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

  const handleUpdateRoom = async (roomId: string, roomData: any, pricingData?: any) => {
    setIsLoading(true);
    try {
      const { data, error } = await updateHotelRoom(roomId, roomData);
      if (error) throw error;

      // Update pricing if provided
      if (pricingData) {
        await createOrUpdateRoomPricing({
          room_id: roomId,
          ...pricingData
        });
      }

      setRooms(prev => {
        const newRooms = { ...prev };
        Object.keys(newRooms).forEach(hotelId => {
          newRooms[hotelId] = newRooms[hotelId].map(r => r.id === roomId ? data : r);
        });
        return newRooms;
      });
      toast({
        title: "Success",
        description: "Room updated successfully with pricing configuration",
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

  // Vehicle management functions
  const loadDrivers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, full_name, email')
        .eq('role', 'driver');

      if (error) throw error;
      setDrivers(data || []);
    } catch (error) {
      console.error('Error loading drivers:', error);
    }
  };

  const loadVehicles = async () => {
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
      console.error('Error loading vehicles:', error);
      toast({
        title: "Error",
        description: "Failed to load vehicles",
        variant: "destructive",
      });
    }
  };

  const handleCreateVehicle = async () => {
    setIsLoading(true);
    try {
      const vehicleData = {
        ...newVehicle,
        seats: parseInt(newVehicle.seats),
        price_per_day: parseFloat(newVehicle.price_per_day)
      };
      
      const { error } = await supabase
        .from('vehicles')
        .insert([vehicleData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Vehicle added successfully",
      });

      setNewVehicle({
        driver_id: '',
        name: '',
        type: '',
        seats: '4',
        price_per_day: '',
        description: '',
        features: [],
        images: [],
        available: true
      });
      setShowCreateVehicle(false);
      loadVehicles();
    } catch (error) {
      console.error('Error adding vehicle:', error);
      toast({
        title: "Error",
        description: "Failed to add vehicle",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateVehicle = async () => {
    if (!editingVehicle) return;

    setIsLoading(true);
    try {
      // Only send the fields that should be updated, excluding id, timestamps, and driver_id
      const updateData = {
        name: editingVehicle.name,
        type: editingVehicle.type,
        seats: editingVehicle.seats,
        price_per_day: editingVehicle.price_per_day,
        description: editingVehicle.description,
        features: editingVehicle.features,
        images: editingVehicle.images,
        available: editingVehicle.available
      };

      const { error } = await supabase
        .from('vehicles')
        .update(updateData)
        .eq('id', editingVehicle.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Vehicle updated successfully",
      });

      setEditingVehicle(null);
      loadVehicles();
    } catch (error) {
      console.error('Error updating vehicle:', error);
      toast({
        title: "Error",
        description: "Failed to update vehicle",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', vehicleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Vehicle deleted successfully",
      });

      loadVehicles();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast({
        title: "Error",
        description: "Failed to delete vehicle",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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

  const handleCreateDriver = async () => {
    // Validation
    if (!newDriver.full_name || !newDriver.email || !newDriver.password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (newDriver.cnic_front_image.length === 0 || newDriver.cnic_back_image.length === 0) {
      toast({
        title: "Error",
        description: "Please upload both CNIC front and back images",
        variant: "destructive",
      });
      return;
    }

    if (newDriver.password !== newDriver.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newDriver.password.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Create driver user profile with CNIC images
      const driverId = crypto.randomUUID();
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          id: driverId,
          email: newDriver.email,
          full_name: newDriver.full_name,
          phone_number: newDriver.phone_number || null,
          role: 'driver',
          password_hash: btoa(newDriver.password),
          cnic_front_image: newDriver.cnic_front_image[0] || null,
          cnic_back_image: newDriver.cnic_back_image[0] || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Driver account created successfully",
      });

      // Reset form and close dialog
      setNewDriver({
        email: '',
        full_name: '',
        phone_number: '',
        password: '',
        confirmPassword: '',
        cnic_front_image: [],
        cnic_back_image: []
      });
      setShowCreateDriver(false);
      
      // Reload drivers
      loadDrivers();
    } catch (error: any) {
      console.error('Error creating driver:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create driver account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDriver = async (driverId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', driverId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Driver deleted successfully",
      });

      loadDrivers();
    } catch (error) {
      console.error('Error deleting driver:', error);
      toast({
        title: "Error",
        description: "Failed to delete driver",
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

        <Tabs defaultValue="calendar" className="space-y-6">
          <TabsList>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Calendar View
            </TabsTrigger>
            <TabsTrigger value="hotels" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Hotels & Rooms
            </TabsTrigger>
            <TabsTrigger value="drivers" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Drivers
            </TabsTrigger>
            <TabsTrigger value="vehicles" className="flex items-center gap-2">
              <Car className="h-4 w-4" />
              Vehicles
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Booking List
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Booking Calendar</h2>
              <p className="text-muted-foreground">View and manage your hotel room bookings in calendar view</p>
            </div>

            {loadingBookings ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading bookings...</p>
              </div>
            ) : (
              <HotelBookingCalendar
                bookings={hotelBookings}
                hotels={hotels}
                rooms={rooms}
                onBookingClick={(booking) => console.log('Booking clicked:', booking)}
                onBookingUpdate={handleBookingAction}
              />
            )}
          </TabsContent>

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

            <div className="space-y-4">
            <HotelList
              hotels={hotels}
              rooms={rooms}
              onCreateHotel={handleCreateHotel}
              onUpdateHotel={handleUpdateHotel}
              onDeleteHotel={handleDeleteHotel}
              onCreateRoom={handleCreateRoom}
              onUpdateRoom={handleUpdateRoom}
              onDeleteRoom={handleDeleteRoom}
              onPreviewHotel={(hotel) => {
                setPreviewHotel(hotel);
                setPreviewDialogOpen(true);
              }}
              isLoading={isLoading}
            />

            {/* Preview Modal */}
            <HotelPreviewModal
              hotel={previewHotel}
              rooms={previewHotel ? (rooms[previewHotel.id] || []) : []}
              isOpen={previewDialogOpen}
              onClose={() => {
                setPreviewDialogOpen(false);
                setPreviewHotel(null);
              }}
            />
            </div>
          </TabsContent>

          <TabsContent value="drivers" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Your Drivers</h2>
              <Dialog open={showCreateDriver} onOpenChange={setShowCreateDriver}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Driver
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Driver</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="driver-name">Full Name *</Label>
                      <Input
                        id="driver-name"
                        value={newDriver.full_name}
                        onChange={(e) => setNewDriver({ ...newDriver, full_name: e.target.value })}
                        placeholder="Enter driver's full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="driver-email">Email *</Label>
                      <Input
                        id="driver-email"
                        type="email"
                        value={newDriver.email}
                        onChange={(e) => setNewDriver({ ...newDriver, email: e.target.value })}
                        placeholder="Enter driver's email"
                      />
                    </div>
                    <div>
                      <Label htmlFor="driver-phone">Phone Number</Label>
                      <Input
                        id="driver-phone"
                        type="tel"
                        value={newDriver.phone_number}
                        onChange={(e) => setNewDriver({ ...newDriver, phone_number: e.target.value })}
                        placeholder="Enter driver's phone number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="driver-password">Password *</Label>
                      <Input
                        id="driver-password"
                        type="password"
                        value={newDriver.password}
                        onChange={(e) => setNewDriver({ ...newDriver, password: e.target.value })}
                        placeholder="Create password (min 8 characters)"
                      />
                    </div>
                    <div>
                      <Label htmlFor="driver-confirm-password">Confirm Password *</Label>
                      <Input
                        id="driver-confirm-password"
                        type="password"
                        value={newDriver.confirmPassword}
                        onChange={(e) => setNewDriver({ ...newDriver, confirmPassword: e.target.value })}
                        placeholder="Confirm password"
                      />
                    </div>
                    <div>
                      <ImageUpload
                        images={newDriver.cnic_front_image}
                        onImagesChange={(images) => setNewDriver({ ...newDriver, cnic_front_image: images })}
                        maxImages={1}
                        label="CNIC Front Image *"
                        bucket="hotel-images"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Upload a clear photo of the front side of the driver's CNIC
                      </p>
                    </div>
                    <div>
                      <ImageUpload
                        images={newDriver.cnic_back_image}
                        onImagesChange={(images) => setNewDriver({ ...newDriver, cnic_back_image: images })}
                        maxImages={1}
                        label="CNIC Back Image *"
                        bucket="hotel-images"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Upload a clear photo of the back side of the driver's CNIC
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleCreateDriver} disabled={isLoading} className="flex-1">
                        {isLoading ? 'Creating...' : 'Create Driver'}
                      </Button>
                      <Button variant="outline" onClick={() => setShowCreateDriver(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {drivers.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No drivers added yet</p>
                  <p className="text-sm text-muted-foreground">Add drivers to manage vehicles and bookings</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {drivers.map((driver) => (
                  <Card key={driver.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{driver.full_name}</h3>
                          </div>
                        </div>
                        <Badge variant="secondary">Driver</Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span>{driver.email}</span>
                        </div>
                        {driver.phone_number && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <span>📱</span>
                            <span>{driver.phone_number}</span>
                          </div>
                        )}
                      </div>
                      {(driver.cnic_front_image || driver.cnic_back_image) && (
                        <div className="mt-3 border-t pt-3">
                          <p className="text-xs font-medium text-muted-foreground mb-2">CNIC Documents</p>
                          <div className="grid grid-cols-2 gap-2">
                            {driver.cnic_front_image && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Front</p>
                                <img
                                  src={driver.cnic_front_image}
                                  alt="CNIC Front"
                                  className="w-full h-20 object-cover rounded border cursor-pointer"
                                  onClick={() => window.open(driver.cnic_front_image, '_blank')}
                                />
                              </div>
                            )}
                            {driver.cnic_back_image && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Back</p>
                                <img
                                  src={driver.cnic_back_image}
                                  alt="CNIC Back"
                                  className="w-full h-20 object-cover rounded border cursor-pointer"
                                  onClick={() => window.open(driver.cnic_back_image, '_blank')}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="mt-4">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full">
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the driver account.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteDriver(driver.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="vehicles" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Your Vehicles</h2>
              <Dialog open={showCreateVehicle} onOpenChange={setShowCreateVehicle}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Vehicle
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Vehicle</DialogTitle>
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
                            {driver.full_name} ({driver.email})
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
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={newVehicle.seats}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            setNewVehicle({ ...newVehicle, seats: value });
                          }}
                          onBlur={(e) => {
                            if (!e.target.value || parseInt(e.target.value) <= 0) {
                              setNewVehicle({ ...newVehicle, seats: '4' });
                            }
                          }}
                          placeholder="e.g., 4"
                        />
                      </div>
                      <div>
                        <Label htmlFor="vehicle-price">Price per Day (PKR)</Label>
                        <Input
                          id="vehicle-price"
                          type="number"
                          step="1"
                          min="0"
                          value={newVehicle.price_per_day}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Only allow integers (no decimals)
                            if (value === '' || /^\d+$/.test(value)) {
                              setNewVehicle({ ...newVehicle, price_per_day: value });
                            }
                          }}
                          placeholder="e.g., 5000"
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
                      bucket="vehicle-images"
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
                    <div className="flex gap-2 pt-4">
                      <Button onClick={handleCreateVehicle} disabled={isLoading}>
                        {isLoading ? 'Adding...' : 'Add Vehicle'}
                      </Button>
                      <Button variant="outline" onClick={() => setShowCreateVehicle(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {vehicles.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No vehicles added yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles.map((vehicle) => (
                  <Card key={vehicle.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{vehicle.name}</h3>
                          <p className="text-sm text-muted-foreground">{vehicle.type}</p>
                        </div>
                        <Badge variant={vehicle.available ? 'default' : 'secondary'}>
                          {vehicle.available ? 'Available' : 'Unavailable'}
                        </Badge>
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Driver:</span>
                          <span>{(vehicle as any).user_profiles?.full_name || 'Unknown'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Seats:</span>
                          <span>{vehicle.seats}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Price/Day:</span>
                          <span className="font-semibold">PKR {vehicle.price_per_day}</span>
                        </div>
                        {vehicle.images.length > 0 && (
                          <img
                            src={vehicle.images[0]}
                            alt={vehicle.name}
                            className="w-full h-32 object-cover rounded mt-2"
                          />
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setPreviewVehicle(vehicle);
                            setVehiclePreviewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                        <Dialog open={editingVehicle?.id === vehicle.id} onOpenChange={(open) => !open && setEditingVehicle(null)}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="flex-1" onClick={() => setEditingVehicle(vehicle)}>
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Edit Vehicle</DialogTitle>
                            </DialogHeader>
                            {editingVehicle && editingVehicle.id === vehicle.id && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Vehicle Name</Label>
                                    <Input
                                      value={editingVehicle.name}
                                      onChange={(e) => setEditingVehicle({ ...editingVehicle, name: e.target.value })}
                                    />
                                  </div>
                                  <div>
                                    <Label>Type</Label>
                                    <Input
                                      value={editingVehicle.type}
                                      onChange={(e) => setEditingVehicle({ ...editingVehicle, type: e.target.value })}
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Seats</Label>
                                    <Input
                                      type="text"
                                      inputMode="numeric"
                                      pattern="[0-9]*"
                                      value={editingVehicle.seats.toString()}
                                      onChange={(e) => {
                                        const value = e.target.value.replace(/[^0-9]/g, '');
                                        setEditingVehicle({ ...editingVehicle, seats: parseInt(value) || 4 });
                                      }}
                                      onBlur={(e) => {
                                        if (!e.target.value || parseInt(e.target.value) <= 0) {
                                          setEditingVehicle({ ...editingVehicle, seats: 4 });
                                        }
                                      }}
                                      placeholder="e.g., 4"
                                    />
                                  </div>
                                  <div>
                                    <Label>Price per Day (PKR)</Label>
                                    <Input
                                      type="number"
                                      step="1"
                                      min="0"
                                      value={editingVehicle.price_per_day.toString()}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        // Only allow integers (no decimals)
                                        if (value === '' || /^\d+$/.test(value)) {
                                          setEditingVehicle({ ...editingVehicle, price_per_day: parseFloat(value) || 0 });
                                        }
                                      }}
                                      placeholder="e.g., 5000"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <Label>Description</Label>
                                  <Textarea
                                    value={editingVehicle.description || ''}
                                    onChange={(e) => setEditingVehicle({ ...editingVehicle, description: e.target.value })}
                                  />
                                </div>
                                <ImageUpload
                                  images={editingVehicle.images}
                                  onImagesChange={(images) => setEditingVehicle({ ...editingVehicle, images })}
                                  maxImages={8}
                                  label="Vehicle Images"
                                  bucket="vehicle-images"
                                />
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    checked={editingVehicle.available}
                                    onChange={(e) => setEditingVehicle({ ...editingVehicle, available: e.target.checked })}
                                  />
                                  <Label>Available</Label>
                                </div>
                                <div className="flex gap-2">
                                  <Button onClick={handleUpdateVehicle} disabled={isLoading}>
                                    {isLoading ? 'Updating...' : 'Update Vehicle'}
                                  </Button>
                                  <Button variant="outline" onClick={() => setEditingVehicle(null)}>
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="flex-1">
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Vehicle Preview Modal */}
            <VehiclePreviewModal
              vehicle={previewVehicle}
              isOpen={vehiclePreviewDialogOpen}
              onClose={() => {
                setVehiclePreviewDialogOpen(false);
                setPreviewVehicle(null);
              }}
            />
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">All Bookings</h2>
              <p className="text-muted-foreground">Complete list of all your room reservations</p>
            </div>

            {loadingBookings ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading bookings...</p>
              </div>
            ) : hotelBookings.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Bed className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No bookings yet</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-semibold">Status</th>
                          <th className="text-left p-3 font-semibold">Customer ID</th>
                          <th className="text-left p-3 font-semibold">Room</th>
                          <th className="text-left p-3 font-semibold">Check-in</th>
                          <th className="text-left p-3 font-semibold">Check-out</th>
                          <th className="text-left p-3 font-semibold">Nights</th>
                          <th className="text-left p-3 font-semibold">Price</th>
                          <th className="text-left p-3 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {hotelBookings.map((booking) => {
                          const room = Object.values(rooms).flat().find(r => r.id === booking.hotel_room_id);
                          const hotel = hotels.find(h => h.id === room?.hotel_id);
                          const nights = Math.ceil((new Date(booking.end_date).getTime() - new Date(booking.start_date).getTime()) / (1000 * 60 * 60 * 24));

                          return (
                            <tr key={booking.id} className="border-b hover:bg-gray-50">
                              <td className="p-3">
                                <Badge
                                  className={`
                                    ${booking.status === 'pending' ? 'bg-orange-500' : ''}
                                    ${booking.status === 'confirmed' ? 'bg-green-500' : ''}
                                    ${booking.status === 'completed' ? 'bg-indigo-500' : ''}
                                    ${booking.status === 'cancelled' ? 'bg-red-500' : ''}
                                  `}
                                >
                                  {booking.status}
                                </Badge>
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm font-mono">{booking.customer_id.slice(0, 8)}...</span>
                                </div>
                              </td>
                              <td className="p-3">
                                <div>
                                  <div className="font-medium">{room?.type || 'Unknown Room'}</div>
                                  <div className="text-sm text-gray-500">{hotel?.name || 'Unknown Hotel'}</div>
                                </div>
                              </td>
                              <td className="p-3 text-sm">{new Date(booking.start_date).toLocaleDateString()}</td>
                              <td className="p-3 text-sm">{new Date(booking.end_date).toLocaleDateString()}</td>
                              <td className="p-3 text-sm">{nights}</td>
                              <td className="p-3">
                                <span className="font-semibold text-green-600">PKR {booking.total_price.toLocaleString()}</span>
                              </td>
                              <td className="p-3">
                                {booking.status === 'pending' ? (
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => handleBookingAction(booking.id, 'confirmed')}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      Confirm
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleBookingAction(booking.id, 'cancelled')}
                                    >
                                      Decline
                                    </Button>
                                  </div>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    disabled
                                  >
                                    {booking.status}
                                  </Button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Stats */}
                  <div className="mt-6 pt-6 border-t grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {hotelBookings.filter(b => b.status === 'pending').length}
                      </div>
                      <div className="text-sm text-gray-600">Pending</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {hotelBookings.filter(b => b.status === 'confirmed').length}
                      </div>
                      <div className="text-sm text-gray-600">Confirmed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-600">
                        {hotelBookings.filter(b => b.status === 'completed').length}
                      </div>
                      <div className="text-sm text-gray-600">Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        PKR {hotelBookings
                          .filter(b => b.status === 'confirmed' || b.status === 'completed')
                          .reduce((sum, b) => sum + (b.total_price || 0), 0).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Total Revenue</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </>
  );
};