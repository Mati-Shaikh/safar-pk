import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Building, Edit, Trash2, Plus, Bed, Star, MapPin, Wifi, Car, Coffee, Dumbbell, Waves, Utensils } from 'lucide-react';
import { Hotel, HotelRoom } from '@/types';
import { HotelForm } from './HotelForm';
import { RoomForm } from './RoomForm';

interface HotelListProps {
  hotels: Hotel[];
  rooms: { [hotelId: string]: HotelRoom[] };
  onCreateHotel: (hotelData: any) => void;
  onUpdateHotel: (hotelId: string, hotelData: any) => void;
  onDeleteHotel: (hotelId: string) => void;
  onCreateRoom: (hotelId: string, roomData: any) => void;
  onUpdateRoom: (roomId: string, roomData: any) => void;
  onDeleteRoom: (roomId: string) => void;
  isLoading?: boolean;
}

const amenityIcons: { [key: string]: React.ReactNode } = {
  'WiFi': <Wifi className="h-4 w-4" />,
  'Parking': <Car className="h-4 w-4" />,
  'Restaurant': <Utensils className="h-4 w-4" />,
  'Gym': <Dumbbell className="h-4 w-4" />,
  'Pool': <Waves className="h-4 w-4" />,
  'Coffee': <Coffee className="h-4 w-4" />
};

export const HotelList: React.FC<HotelListProps> = ({
  hotels,
  rooms,
  onCreateHotel,
  onUpdateHotel,
  onDeleteHotel,
  onCreateRoom,
  onUpdateRoom,
  onDeleteRoom,
  isLoading = false
}) => {
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [editingRoom, setEditingRoom] = useState<HotelRoom | null>(null);
  const [creatingRoomForHotel, setCreatingRoomForHotel] = useState<string | null>(null);

  const handleCreateHotel = (hotelData: any) => {
    onCreateHotel(hotelData);
    setEditingHotel(null);
  };

  const handleUpdateHotel = (hotelData: any) => {
    if (editingHotel) {
      onUpdateHotel(editingHotel.id, hotelData);
      setEditingHotel(null);
    }
  };

  const handleCreateRoom = (roomData: any) => {
    if (creatingRoomForHotel) {
      onCreateRoom(creatingRoomForHotel, roomData);
      setCreatingRoomForHotel(null);
    }
  };

  const handleUpdateRoom = (roomData: any) => {
    if (editingRoom) {
      onUpdateRoom(editingRoom.id, roomData);
      setEditingRoom(null);
    }
  };

  const getAmenityIcon = (amenity: string) => {
    const key = Object.keys(amenityIcons).find(k => 
      amenity.toLowerCase().includes(k.toLowerCase())
    );
    return key ? amenityIcons[key] : null;
  };

  if (hotels.length === 0) {
    return (
      <div className="text-center py-12">
        <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Hotels Found</h3>
        <p className="text-muted-foreground mb-4">Create your first hotel to get started</p>
        <Dialog>
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
              onCancel={() => setEditingHotel(null)}
              isLoading={isLoading}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {hotels.map((hotel) => (
        <Card key={hotel.id} className="overflow-hidden">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  {hotel.name}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <MapPin className="h-4 w-4" />
                  {hotel.location}
                </CardDescription>
                {hotel.description && (
                  <p className="text-sm text-muted-foreground mt-2">{hotel.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Edit Hotel</DialogTitle>
                    </DialogHeader>
                    <HotelForm
                      hotel={hotel}
                      onSubmit={handleUpdateHotel}
                      onCancel={() => setEditingHotel(null)}
                      isLoading={isLoading}
                    />
                  </DialogContent>
                </Dialog>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Hotel</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{hotel.name}"? This action cannot be undone and will also delete all associated rooms.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDeleteHotel(hotel.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Hotel Amenities */}
              {hotel.amenities.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Hotel Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {hotel.amenities.map((amenity, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {getAmenityIcon(amenity)}
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Hotel Images */}
              {hotel.images.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Hotel Images</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {hotel.images.slice(0, 4).map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${hotel.name} image ${index + 1}`}
                        className="w-full h-20 object-cover rounded border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Rooms Section */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Bed className="h-4 w-4" />
                    Rooms ({rooms[hotel.id]?.length || 0})
                  </h4>
                  <Dialog open={creatingRoomForHotel === hotel.id} onOpenChange={(open) => !open && setCreatingRoomForHotel(null)}>
                    <DialogTrigger asChild>
                      <Button size="sm" onClick={() => setCreatingRoomForHotel(hotel.id)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Room
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Create New Room</DialogTitle>
                      </DialogHeader>
                      <RoomForm
                        hotelId={hotel.id}
                        onSubmit={handleCreateRoom}
                        onCancel={() => setCreatingRoomForHotel(null)}
                        isLoading={isLoading}
                      />
                    </DialogContent>
                  </Dialog>
                </div>

                {rooms[hotel.id] && rooms[hotel.id].length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rooms[hotel.id].map((room) => (
                      <Card key={room.id} className="relative">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h5 className="font-medium">{room.type}</h5>
                              <p className="text-sm text-muted-foreground">
                                ${room.price_per_night}/night
                              </p>
                            </div>
                            <div className="flex gap-1">
                              <Dialog open={editingRoom?.id === room.id} onOpenChange={(open) => !open && setEditingRoom(null)}>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="sm" onClick={() => setEditingRoom(room)}>
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>Edit Room</DialogTitle>
                                  </DialogHeader>
                                  <RoomForm
                                    room={room}
                                    hotelId={hotel.id}
                                    onSubmit={handleUpdateRoom}
                                    onCancel={() => setEditingRoom(null)}
                                    isLoading={isLoading}
                                  />
                                </DialogContent>
                              </Dialog>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Room</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this room? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => onDeleteRoom(room.id)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <span>Capacity: {room.capacity} guests</span>
                              <Badge variant={room.available ? "default" : "secondary"}>
                                {room.available ? "Available" : "Unavailable"}
                              </Badge>
                            </div>
                            
                            {room.description && (
                              <p className="text-xs text-muted-foreground">{room.description}</p>
                            )}
                            
                            {room.amenities.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {room.amenities.slice(0, 3).map((amenity, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {amenity}
                                  </Badge>
                                ))}
                                {room.amenities.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{room.amenities.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            )}
                            
                            {room.images.length > 0 && (
                              <img
                                src={room.images[0]}
                                alt={room.type}
                                className="w-full h-16 object-cover rounded mt-2"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                                }}
                              />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bed className="h-8 w-8 mx-auto mb-2" />
                    <p>No rooms added yet</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
