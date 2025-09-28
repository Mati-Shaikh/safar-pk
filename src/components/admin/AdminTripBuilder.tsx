import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Plus,
  MapPin,
  Star,
  Calendar,
  Car,
  Clock,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Users,
  Camera,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Copy essential types and data from TripPage
interface ItinerarySlot {
  id: string;
  activity: string;
  location: string;
  startTime: string;
  endTime: string;
  transportNeeded: boolean;
  hotelRoomNeeded: boolean;
  hotelDetails: string;
  selectedRoom: Room | null;
  selectedCar: Car | null;
  carDetails: string;
  notes: string;
}

interface ItineraryDay {
  date: string;
  slots: ItinerarySlot[];
}

interface Room {
  id: string;
  type: string;
  price: string;
  capacity: number;
  amenities: string[];
  images: string[];
  description: string;
}

interface Car {
  id: string;
  name: string;
  type: string;
  capacity: number;
  pricePerDay: number;
  features: string[];
  image: string;
}

interface TripForm {
  name: string;
  numberOfPeople: number;
  startDate: string;
  endDate: string;
  needsCar: boolean;
  carType: string;
  budget: string;
  preferences: string;
  itinerary: ItineraryDay[];
}

interface AdminTripBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onTripCreate: (tripData: any) => Promise<void>;
  selectedCustomerId: string;
  customers: Array<{ id: string; full_name: string; email: string }>;
  onCustomerChange: (customerId: string) => void;
}

// Sample data (you'll want to import this from your existing data sources)
const CARS = [
  {
    id: '1',
    name: 'Toyota Corolla',
    type: 'Sedan',
    capacity: 4,
    pricePerDay: 5000,
    features: ['AC', 'Automatic', 'GPS'],
    image: 'https://images.unsplash.com/photo-1549399447-d3c8a3a6ff6a?w=300&h=200&fit=crop'
  },
  {
    id: '2',
    name: 'Suzuki APV',
    type: 'Van',
    capacity: 8,
    pricePerDay: 8000,
    features: ['AC', 'Manual', 'Large Space'],
    image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=300&h=200&fit=crop'
  }
];

const HOTELS_WITH_ROOMS = [
  {
    name: 'Serena Hotel Islamabad',
    rooms: [
      {
        id: '1',
        type: 'Standard Room',
        price: 'PKR 15,000 per night',
        capacity: 2,
        amenities: ['WiFi', 'AC', 'TV', 'Mini Bar'],
        images: ['https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=300&h=200&fit=crop'],
        description: 'Comfortable standard room with modern amenities'
      }
    ]
  },
  {
    name: 'Pearl Continental Lahore',
    rooms: [
      {
        id: '2',
        type: 'Deluxe Room',
        price: 'PKR 20,000 per night',
        capacity: 2,
        amenities: ['WiFi', 'AC', 'TV', 'Room Service'],
        images: ['https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=300&h=200&fit=crop'],
        description: 'Luxurious deluxe room with premium facilities'
      }
    ]
  }
];

const getDaysArray = (startDate: string, endDate: string): Date[] => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = [];

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }

  return days;
};

const AdminTripBuilder: React.FC<AdminTripBuilderProps> = ({
  isOpen,
  onClose,
  onTripCreate,
  selectedCustomerId,
  customers,
  onCustomerChange
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [tripForm, setTripForm] = useState<TripForm>({
    name: '',
    numberOfPeople: 1,
    startDate: '',
    endDate: '',
    needsCar: false,
    carType: 'Sedan',
    budget: '',
    preferences: '',
    itinerary: []
  });

  const { toast } = useToast();

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!tripForm.name || !tripForm.startDate || !tripForm.endDate) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields before proceeding.",
          variant: "destructive"
        });
        return;
      }

      const days = getDaysArray(tripForm.startDate, tripForm.endDate);
      setTripForm(prev => ({
        ...prev,
        itinerary: days.map(day => ({
          date: day.toISOString().split('T')[0],
          slots: []
        }))
      }));
    }
    setCurrentStep(prev => prev + 1);
  };

  const updateItinerary = (dayIndex: number, newSlots: ItinerarySlot[]) => {
    setTripForm(prev => ({
      ...prev,
      itinerary: prev.itinerary.map((day, index) =>
        index === dayIndex ? { ...day, slots: newSlots } : day
      )
    }));
  };

  const handleCreateTrip = async () => {
    try {
      if (!selectedCustomerId) {
        toast({
          title: "No Customer Selected",
          description: "Please select a customer for this trip.",
          variant: "destructive"
        });
        return;
      }

      const destinations = [...new Set(tripForm.itinerary.flatMap(day =>
        day.slots.map(slot => slot.location).filter(Boolean)
      ))];

      const highlights = [...new Set(tripForm.itinerary.flatMap(day =>
        day.slots.map(slot => slot.activity).filter(Boolean)
      ))];

      const tripData = {
        user_id: selectedCustomerId,
        name: tripForm.name,
        description: tripForm.preferences || `A custom ${tripForm.numberOfPeople}-person trip created by admin.`,
        start_date: tripForm.startDate,
        end_date: tripForm.endDate,
        budget: tripForm.budget ? parseFloat(tripForm.budget) : null,
        number_of_people: tripForm.numberOfPeople,
        needs_car: tripForm.needsCar,
        car_type: tripForm.needsCar ? tripForm.carType : null,
        preferences: tripForm.preferences,
        status: 'planned',
        trip_type: 'custom',
        destinations: destinations.length > 0 ? destinations : null,
        highlights: highlights.length > 0 ? highlights : null,
        itinerary: tripForm.itinerary
      };

      await onTripCreate(tripData);

      // Reset form
      setTripForm({
        name: '',
        numberOfPeople: 1,
        startDate: '',
        endDate: '',
        needsCar: false,
        carType: 'Sedan',
        budget: '',
        preferences: '',
        itinerary: []
      });
      setCurrentStep(1);
      onClose();

    } catch (error) {
      console.error('Error creating trip:', error);
      toast({
        title: "Error",
        description: "Failed to create trip. Please try again.",
        variant: "destructive"
      });
    }
  };

  const TripDetailsStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="customer" className="text-gray-800">Customer *</Label>
          <Select value={selectedCustomerId} onValueChange={onCustomerChange}>
            <SelectTrigger className="border-gray-300 focus:border-gray-600">
              <SelectValue placeholder="Select customer" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.full_name} ({customer.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tripName" className="text-gray-800">Trip Name *</Label>
          <Input
            id="tripName"
            placeholder="e.g., Northern Pakistan Adventure"
            value={tripForm.name}
            onChange={(e) => setTripForm(prev => ({ ...prev, name: e.target.value }))}
            className="border-gray-300 focus:border-gray-600"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="people" className="text-gray-800">Number of People</Label>
          <Input
            id="people"
            type="number"
            min="1"
            value={tripForm.numberOfPeople}
            onChange={(e) => setTripForm(prev => ({ ...prev, numberOfPeople: Number(e.target.value) }))}
            className="border-gray-300 focus:border-gray-600"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="startDate" className="text-gray-800">Start Date *</Label>
          <Input
            id="startDate"
            type="date"
            value={tripForm.startDate}
            onChange={(e) => setTripForm(prev => ({ ...prev, startDate: e.target.value }))}
            className="border-gray-300 focus:border-gray-600"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate" className="text-gray-800">End Date *</Label>
          <Input
            id="endDate"
            type="date"
            value={tripForm.endDate}
            onChange={(e) => setTripForm(prev => ({ ...prev, endDate: e.target.value }))}
            className="border-gray-300 focus:border-gray-600"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="budget" className="text-gray-800">Budget (PKR)</Label>
        <Input
          id="budget"
          placeholder="e.g., 50,000"
          value={tripForm.budget}
          onChange={(e) => setTripForm(prev => ({ ...prev, budget: e.target.value }))}
          className="border-gray-300 focus:border-gray-600"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="preferences" className="text-gray-800">Travel Preferences</Label>
        <Textarea
          id="preferences"
          placeholder="Tell us about interests, preferred activities, dietary requirements, etc."
          value={tripForm.preferences}
          onChange={(e) => setTripForm(prev => ({ ...prev, preferences: e.target.value }))}
          className="border-gray-300 focus:border-gray-600 min-h-[100px]"
        />
      </div>

      <Button
        onClick={handleNextStep}
        className="w-full bg-gradient-to-r from-gray-800 to-black text-white hover:from-gray-900 hover:to-gray-800"
        disabled={!tripForm.name || !tripForm.startDate || !tripForm.endDate || !selectedCustomerId}
      >
        Build Itinerary <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );

  const ItineraryBuilderStep = () => {
    const addSlot = (dayIndex: number) => {
      const newSlot: ItinerarySlot = {
        id: Date.now().toString(),
        activity: '',
        location: '',
        startTime: '09:00',
        endTime: '18:00',
        transportNeeded: false,
        hotelRoomNeeded: false,
        hotelDetails: '',
        selectedRoom: null,
        selectedCar: null,
        carDetails: '',
        notes: ''
      };
      updateItinerary(dayIndex, [...tripForm.itinerary[dayIndex].slots, newSlot]);
    };

    const removeSlot = (dayIndex: number, slotId: string) => {
      updateItinerary(dayIndex, tripForm.itinerary[dayIndex].slots.filter(s => s.id !== slotId));
    };

    const updateSlot = (dayIndex: number, slotId: string, field: string, value: any) => {
      const newSlots = tripForm.itinerary[dayIndex].slots.map(s =>
        s.id === slotId ? { ...s, [field]: value } : s
      );
      updateItinerary(dayIndex, newSlots);
    };

    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Plan Your Daily Activities</h3>
          <p className="text-sm text-gray-600">Create a detailed itinerary for each day of your trip</p>
        </div>

        {tripForm.itinerary.map((day, dayIndex) => (
          <div key={day.date} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h5 className="font-semibold text-gray-800 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Day {dayIndex + 1} - {new Date(day.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </h5>
            </div>
            <div className="p-4">
              {day.slots.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No activities planned for this day</p>
                  <Button
                    variant="outline"
                    className="mt-3"
                    onClick={() => addSlot(dayIndex)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Activity
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {day.slots.map((slot, slotIndex) => (
                    <div key={slot.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-start mb-4">
                        <h6 className="font-medium text-gray-800">Activity {slotIndex + 1}</h6>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSlot(dayIndex, slot.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <Label className="text-gray-700">Activity Name</Label>
                          <Input
                            placeholder="e.g., Visit Hunza Valley"
                            value={slot.activity}
                            onChange={e => updateSlot(dayIndex, slot.id, 'activity', e.target.value)}
                            className="border-gray-300 focus:border-gray-600"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-700">Location</Label>
                          <Input
                            placeholder="e.g., Hunza, Gilgit-Baltistan"
                            value={slot.location}
                            onChange={e => updateSlot(dayIndex, slot.id, 'location', e.target.value)}
                            className="border-gray-300 focus:border-gray-600"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <Label className="text-gray-700">Start Time</Label>
                          <Input
                            type="time"
                            value={slot.startTime}
                            onChange={e => updateSlot(dayIndex, slot.id, 'startTime', e.target.value)}
                            className="border-gray-300 focus:border-gray-600"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-700">End Time</Label>
                          <Input
                            type="time"
                            value={slot.endTime}
                            onChange={e => updateSlot(dayIndex, slot.id, 'endTime', e.target.value)}
                            className="border-gray-300 focus:border-gray-600"
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-6 mb-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`transport-${slot.id}`}
                            checked={slot.transportNeeded}
                            onCheckedChange={checked => updateSlot(dayIndex, slot.id, 'transportNeeded', !!checked)}
                          />
                          <Label htmlFor={`transport-${slot.id}`} className="text-gray-700">
                            Transportation
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`hotel-${slot.id}`}
                            checked={slot.hotelRoomNeeded}
                            onCheckedChange={checked => updateSlot(dayIndex, slot.id, 'hotelRoomNeeded', !!checked)}
                          />
                          <Label htmlFor={`hotel-${slot.id}`} className="text-gray-700">
                            Hotel Room
                          </Label>
                        </div>
                      </div>

                      {slot.hotelRoomNeeded && (
                        <div className="space-y-2 mb-4">
                          <Label className="text-gray-700 font-medium">Hotel Details</Label>
                          <Select
                            onValueChange={val => updateSlot(dayIndex, slot.id, 'hotelDetails', val)}
                            value={slot.hotelDetails}
                          >
                            <SelectTrigger className="border-gray-300 focus:border-gray-600">
                              <SelectValue placeholder="Select a hotel" />
                            </SelectTrigger>
                            <SelectContent>
                              {HOTELS_WITH_ROOMS.map((hotel) => (
                                <SelectItem key={hotel.name} value={hotel.name}>
                                  {hotel.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label className="text-gray-700 font-medium">Additional Notes</Label>
                        <Textarea
                          placeholder="e.g., Best time for photos, bring warm clothes..."
                          value={slot.notes}
                          onChange={e => updateSlot(dayIndex, slot.id, 'notes', e.target.value)}
                          className="border-gray-300 focus:border-gray-600 min-h-[80px]"
                        />
                      </div>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    className="w-full border-dashed"
                    onClick={() => addSlot(dayIndex)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Another Activity
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(1)}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Details
          </Button>
          <Button
            onClick={handleNextStep}
            className="bg-gradient-to-r from-gray-800 to-black text-white hover:from-gray-900 hover:to-gray-800"
          >
            Review Trip <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  const ReviewStep = () => {
    const totalDays = tripForm.itinerary.length;
    const totalActivities = tripForm.itinerary.reduce((sum, day) => sum + day.slots.length, 0);
    const destinations = [...new Set(tripForm.itinerary.flatMap(day =>
      day.slots.map(slot => slot.location).filter(Boolean)
    ))];

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">🎉 Trip is Ready!</h3>
          <p className="text-gray-600">Review all details before creating this custom trip</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Trip Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-800">Duration:</span>
                <span className="text-sm text-gray-600">{totalDays} days</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-800">Activities:</span>
                <span className="text-sm text-gray-600">{totalActivities} activities</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-800">People:</span>
                <span className="text-sm text-gray-600">{tripForm.numberOfPeople} travelers</span>
              </div>
              {tripForm.budget && (
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-800">Budget:</span>
                  <span className="text-sm text-gray-600">PKR {parseInt(tripForm.budget).toLocaleString()}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-600" />
                Destinations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {destinations.length > 0 ? (
                  destinations.map((dest, index) => (
                    <Badge key={index} variant="outline" className="mr-1 mb-1">
                      {dest}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No destinations specified</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                Customer Info
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(() => {
                  const customer = customers.find(c => c.id === selectedCustomerId);
                  return customer ? (
                    <>
                      <div className="text-sm">
                        <span className="font-medium">Name:</span> {customer.full_name}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Email:</span> {customer.email}
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">No customer selected</p>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(2)}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Itinerary
          </Button>
          <Button
            onClick={handleCreateTrip}
            className="bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800"
          >
            Create Trip <Plus className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <TripDetailsStep />;
      case 2:
        return <ItineraryBuilderStep />;
      case 3:
        return <ReviewStep />;
      default:
        return <TripDetailsStep />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-gray-800">Create Custom Trip</DialogTitle>
          <DialogDescription>
            Step {currentStep} of 3: {currentStep === 1 ? 'Trip Details' : currentStep === 2 ? 'Itinerary Builder' : 'Review & Create'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {renderStep()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminTripBuilder;