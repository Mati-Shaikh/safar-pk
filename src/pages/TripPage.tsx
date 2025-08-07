import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
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
  Eye,
  Mountain,
  Plane,
  Camera,
  Search,
  Filter,
  X
} from 'lucide-react';

// New Mock Data
const pakistanTrips = [
  {
    id: 1,
    name: "Northern Pakistan Adventure",
    description: "Explore the breathtaking valleys of Hunza, Skardu, and Fairy Meadows",
    duration: "10 days",
    price: "PKR 85,000",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=500&h=300&fit=crop",
    destinations: ["Hunza Valley", "Skardu", "Fairy Meadows", "Naran Kaghan"],
    highlights: ["K2 Base Camp Trek", "Hunza Cherry Blossoms", "Deosai Plains", "Attabad Lake"],
    difficulty: "Moderate",
    groupSize: "6-12 people",
    rating: 4.8,
    reviews: 127,
    category: "Adventure"
  },
  {
    id: 2,
    name: "Cultural Heritage Tour",
    description: "Journey through Pakistan's rich history and ancient civilizations",
    duration: "8 days",
    price: "PKR 65,000",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=300&fit=crop",
    destinations: ["Lahore", "Karachi", "Islamabad", "Multan"],
    highlights: ["Badshahi Mosque", "Shalimar Gardens", "Mohenjo Daro", "Pakistan Monument"],
    difficulty: "Easy",
    groupSize: "8-15 people",
    rating: 4.6,
    reviews: 89,
    category: "Cultural"
  },
  {
    id: 3,
    name: "Karakoram Highway Expedition",
    description: "The ultimate road trip on the world's highest paved road",
    duration: "12 days",
    price: "PKR 95,000",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop",
    destinations: ["Islamabad", "Gilgit", "Hunza", "Khunjerab Pass"],
    highlights: ["Khunjerab Pass", "Passu Cones", "Rakaposhi View", "China Border"],
    difficulty: "Challenging",
    groupSize: "4-8 people",
    rating: 4.9,
    reviews: 156,
    category: "Adventure"
  },
  {
    id: 4,
    name: "Desert Safari & Coastal Beauty",
    description: "Experience the golden deserts of Thar and coastal charm of Karachi",
    duration: "7 days",
    price: "PKR 55,000",
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500&h=300&fit=crop",
    destinations: ["Karachi", "Thar Desert", "Makli Necropolis", "Thatta"],
    highlights: ["Camel Safari", "Desert Camping", "Clifton Beach", "Port Grand"],
    difficulty: "Easy",
    groupSize: "6-10 people",
    rating: 4.4,
    reviews: 73,
    category: "Desert"
  },
  {
    id: 5,
    name: "Swat Valley Paradise",
    description: "Discover the Switzerland of Pakistan with lush green valleys",
    duration: "6 days",
    price: "PKR 45,000",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop",
    destinations: ["Swat", "Kalam", "Malam Jabba", "Mingora"],
    highlights: ["Kalam Valley", "Malam Jabba Skiing", "White Palace", "River Swat"],
    difficulty: "Easy",
    groupSize: "8-12 people",
    rating: 4.7,
    reviews: 94,
    category: "Nature"
  },
  {
    id: 6,
    name: "Baltistan Explorer",
    description: "Journey to the roof of the world with stunning mountain peaks",
    duration: "14 days",
    price: "PKR 120,000",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=500&h=300&fit=crop",
    destinations: ["Skardu", "Askole", "Concordia", "Gasherbrum Base Camp"],
    highlights: ["Concordia Trek", "Gasherbrum Views", "Baltoro Glacier", "Trango Towers"],
    difficulty: "Expert",
    groupSize: "4-6 people",
    rating: 4.9,
    reviews: 45,
    category: "Trekking"
  }
];

interface ItinerarySlot {
  id: number;
  startTime: string;
  endTime: string;
  activity: string;
  location: string;
  transportNeeded: boolean;
  notes: string;
}

interface ItineraryDay {
  date: string;
  slots: ItinerarySlot[];
}

const CAR_TYPES = ["Sedan", "SUV", "Van", "Coaster", "4WD"];
const TRIP_CATEGORIES = ["All", "Adventure", "Cultural", "Desert", "Nature", "Trekking"];

// Itinerary Day Card Component
const ItineraryDayCard = ({ day, dayIndex, updateItinerary }) => {
  const addSlot = () => {
    const newSlot = {
      id: Date.now(),
      startTime: '09:00',
      endTime: '11:00',
      activity: '',
      location: '',
      transportNeeded: false,
      notes: ''
    };
    updateItinerary(dayIndex, [...day.slots, newSlot]);
  };

  const removeSlot = (slotId) => {
    updateItinerary(dayIndex, day.slots.filter(s => s.id !== slotId));
  };

  const updateSlot = (slotId, field, value) => {
    const newSlots = day.slots.map(s => 
      s.id === slotId ? { ...s, [field]: value } : s
    );
    updateItinerary(dayIndex, newSlots);
  };

  const pakistanActivities = [
    'Sightseeing Tour', 'Mountain Hiking', 'Lake Visit', 'Cultural Site Visit', 
    'Local Market Shopping', 'Photography Session', 'Traditional Food Experience',
    'Adventure Sports', 'Historical Monument Visit', 'Nature Walk'
  ];

  const pakistanLocations = [
    'Hunza Valley', 'Skardu', 'Lahore', 'Islamabad', 'Karachi', 'Swat',
    'Naran Kaghan', 'Fairy Meadows', 'Deosai Plains', 'Khunjerab Pass',
    'Badshahi Mosque', 'Faisal Mosque', 'Minar-e-Pakistan', 'Clifton Beach'
  ];

  return (
    <Card className="border-gray-200">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
        <CardTitle className="text-lg text-gray-800">
          {new Date(day.date).toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          })}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {day.slots.map((slot) => (
            <div key={slot.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50 relative">
              <Button 
                variant="ghost" 
                size="sm" 
                className="absolute top-2 right-2 text-gray-500 hover:text-red-500" 
                onClick={() => removeSlot(slot.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Time Range</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="time" 
                      value={slot.startTime} 
                      onChange={e => updateSlot(slot.id, 'startTime', e.target.value)}
                      className="border-gray-300 focus:border-gray-600"
                    />
                    <span className="text-gray-500">to</span>
                    <Input 
                      type="time" 
                      value={slot.endTime} 
                      onChange={e => updateSlot(slot.id, 'endTime', e.target.value)}
                      className="border-gray-300 focus:border-gray-600"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Activity</Label>
                  <Select 
                    onValueChange={val => updateSlot(slot.id, 'activity', val)} 
                    value={slot.activity}
                  >
                    <SelectTrigger className="border-gray-300 focus:border-gray-600">
                      <SelectValue placeholder="Select an activity" />
                    </SelectTrigger>
                    <SelectContent>
                      {pakistanActivities.map(activity => (
                        <SelectItem key={activity} value={activity}>{activity}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <Label className="text-gray-700 font-medium">Location</Label>
                <Select 
                  onValueChange={val => updateSlot(slot.id, 'location', val)} 
                  value={slot.location}
                >
                  <SelectTrigger className="border-gray-300 focus:border-gray-600">
                    <SelectValue placeholder="Select a location" />
                  </SelectTrigger>
                  <SelectContent>
                    {pakistanLocations.map(location => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 mb-4">
                <Label className="text-gray-700 font-medium">Additional Notes</Label>
                <Textarea 
                  placeholder="e.g., Best time for photos, bring warm clothes, book tickets in advance..." 
                  value={slot.notes} 
                  onChange={e => updateSlot(slot.id, 'notes', e.target.value)}
                  className="border-gray-300 focus:border-gray-600 min-h-[80px]"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id={`transport-${slot.id}`} 
                  checked={slot.transportNeeded} 
                  onCheckedChange={checked => updateSlot(slot.id, 'transportNeeded', !!checked)} 
                />
                <Label htmlFor={`transport-${slot.id}`} className="text-gray-700">
                  Transportation Required
                </Label>
                {slot.transportNeeded && (
                  <Car className="h-4 w-4 text-gray-600 ml-2" />
                )}
              </div>
            </div>
          ))}
          
          {day.slots.length === 0 && (
            <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg bg-gray-50">
              <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No activities planned for this day</p>
              <p className="text-sm text-gray-400">Click "Add Activity" to get started</p>
            </div>
          )}

          <Button 
            variant="outline" 
            onClick={addSlot}
            className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 border-dashed"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Activity
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const TripDetailsStep = ({ tripForm, setTripForm, handleNextStep }) => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tripName" className="text-gray-800">Trip Name</Label>
          <Input 
            id="tripName" 
            placeholder="e.g., My Northern Pakistan Adventure" 
            value={tripForm.name} 
            onChange={(e) => setTripForm(prev => ({ ...prev, name: e.target.value }))}
            className="border-gray-300 focus:border-gray-600"
          />
        </div>
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
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate" className="text-gray-800">Start Date</Label>
          <Input 
            id="startDate" 
            type="date" 
            value={tripForm.startDate} 
            onChange={(e) => setTripForm(prev => ({ ...prev, startDate: e.target.value }))}
            className="border-gray-300 focus:border-gray-600"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate" className="text-gray-800">End Date</Label>
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
          placeholder="Tell us about your interests, preferred activities, dietary requirements, etc." 
          value={tripForm.preferences} 
          onChange={(e) => setTripForm(prev => ({ ...prev, preferences: e.target.value }))}
          className="border-gray-300 focus:border-gray-600 min-h-[100px]"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox 
          id="needsCar" 
          checked={tripForm.needsCar} 
          onCheckedChange={(checked) => setTripForm(prev => ({ ...prev, needsCar: !!checked }))} 
        />
        <Label htmlFor="needsCar" className="text-gray-800">Do you need transportation during your trip?</Label>
      </div>

      {tripForm.needsCar && (
        <div className="space-y-2">
          <Label htmlFor="carType" className="text-gray-800">Preferred Vehicle Type</Label>
          <Select value={tripForm.carType} onValueChange={(value) => setTripForm(prev => ({ ...prev, carType: value }))}>
            <SelectTrigger className="border-gray-300 focus:border-gray-600">
              <SelectValue placeholder="Select a vehicle type" />
            </SelectTrigger>
            <SelectContent>
              {CAR_TYPES.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      <Button 
        onClick={handleNextStep} 
        className="w-full bg-gradient-to-r from-gray-800 to-black text-white hover:from-gray-900 hover:to-gray-800" 
        disabled={!tripForm.name || !tripForm.startDate || !tripForm.endDate}
      >
        Build Itinerary <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
);

const ItineraryBuilderStep = ({ tripForm, updateItinerary, setCurrentStep, handleNextStep }) => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Plan Your Daily Activities</h3>
        <p className="text-sm text-gray-600">Create a detailed itinerary for each day of your trip</p>
      </div>
      
      {tripForm.itinerary.map((day, dayIndex) => (
        <ItineraryDayCard 
          key={day.date} 
          day={day} 
          dayIndex={dayIndex} 
          updateItinerary={updateItinerary} 
        />
      ))}
      
      <div className="flex justify-between pt-6">
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

const ReviewStep = ({ tripForm, handleCreateTrip, setCurrentStep }) => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Review Your Trip</h3>
        <p className="text-sm text-gray-600">Make sure everything looks perfect before creating your trip</p>
      </div>

      <Card className="border-gray-200">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
          <CardTitle className="text-gray-800">{tripForm.name}</CardTitle>
          <CardDescription>
            {tripForm.numberOfPeople} people | {new Date(tripForm.startDate).toLocaleDateString()} - {new Date(tripForm.endDate).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          {tripForm.budget && (
            <div>
              <h4 className="font-semibold text-gray-800">Budget</h4>
              <p className="text-gray-600">PKR {tripForm.budget}</p>
            </div>
          )}
          
          {tripForm.preferences && (
            <div>
              <h4 className="font-semibold text-gray-800">Preferences</h4>
              <p className="text-gray-600 text-sm">{tripForm.preferences}</p>
            </div>
          )}
          
          {tripForm.needsCar && (
            <div>
              <h4 className="font-semibold text-gray-800">Transportation</h4>
              <p className="text-gray-600">Vehicle required: {tripForm.carType}</p>
            </div>
          )}
          
          <div>
            <h4 className="font-semibold text-gray-800">Daily Itinerary</h4>
            <div className="space-y-3 mt-2">
              {tripForm.itinerary.map(day => (
                <div key={day.date} className="border rounded-lg p-3 bg-gray-50">
                  <h5 className="font-medium text-gray-800 mb-2">
                    {new Date(day.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h5>
                  {day.slots.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No activities planned</p>
                  ) : (
                    <ul className="space-y-1">
                      {day.slots.map(slot => (
                        <li key={slot.id} className="text-sm text-gray-600 flex items-center">
                          <Clock className="h-3 w-3 mr-2" />
                          {slot.startTime} - {slot.endTime}: {slot.activity} at {slot.location}
                          {slot.transportNeeded && <Car className="inline h-3 w-3 ml-2" />}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-between pt-6">
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep(2)}
          className="border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Edit Itinerary
        </Button>
        <Button 
          onClick={handleCreateTrip}
          className="bg-gradient-to-r from-gray-800 to-black text-white hover:from-gray-900 hover:to-gray-800"
        >
          Create My Trip
        </Button>
      </div>
    </div>
);

export default function TripsPage() {
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [isCreateTripOpen, setIsCreateTripOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentStep, setCurrentStep] = useState(1);
  
  const [tripForm, setTripForm] = useState({
    name: '',
    numberOfPeople: 1,
    startDate: '',
    endDate: '',
    needsCar: false,
    carType: 'Sedan',
    budget: '',
    preferences: '',
    itinerary: [] as ItineraryDay[],
  });

  const filteredTrips = useMemo(() => {
    return pakistanTrips.filter(trip => {
      const matchesSearch = trip.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           trip.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           trip.destinations.some(dest => dest.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'All' || trip.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const handleCreateTrip = () => {
    console.log('Creating trip:', tripForm);
    setIsCreateTripOpen(false);
    setCurrentStep(1);
    setTripForm({
      name: '',
      numberOfPeople: 1,
      startDate: '',
      endDate: '',
      needsCar: false,
      carType: 'Sedan',
      budget: '',
      preferences: '',
      itinerary: [],
    });
  };

  const getDaysArray = (start: string, end: string) => {
    if (!start || !end) return [];
    const days = [];
    let currentDate = new Date(start);
    const endDate = new Date(end);
    while (currentDate <= endDate) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return days;
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
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
    setTripForm(prev => {
      const newItinerary = [...prev.itinerary];
      newItinerary[dayIndex].slots = newSlots;
      return { ...prev, itinerary: newItinerary };
    });
  };

  const renderCreateTripStep = () => {
    switch (currentStep) {
      case 1:
        return <TripDetailsStep 
          tripForm={tripForm} 
          setTripForm={setTripForm} 
          handleNextStep={handleNextStep} 
        />;
      case 2:
        return <ItineraryBuilderStep 
          tripForm={tripForm}
          updateItinerary={updateItinerary}
          setCurrentStep={setCurrentStep}
          handleNextStep={handleNextStep}
        />;
      case 3:
        return <ReviewStep 
          tripForm={tripForm}
          handleCreateTrip={handleCreateTrip}
          setCurrentStep={setCurrentStep}
        />;
      default:
        return <TripDetailsStep 
          tripForm={tripForm} 
          setTripForm={setTripForm} 
          handleNextStep={handleNextStep} 
        />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-black via-gray-800 to-black text-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Discover Pakistan
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8">
              Explore breathtaking landscapes, rich culture, and unforgettable adventures
            </p>
            <Button 
              onClick={() => setIsCreateTripOpen(true)}
              size="lg" 
              className="bg-white text-black hover:bg-gray-100 text-lg px-8 py-3"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create Custom Trip
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search trips, destinations, or activities..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-300 focus:border-gray-600"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-48 border-gray-300 focus:border-gray-600">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {TRIP_CATEGORIES.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Trips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTrips.map((trip) => (
            <Card key={trip.id} className="group hover:shadow-2xl transition-all duration-300 border-gray-200 overflow-hidden">
              <div className="relative">
                <img 
                  src={trip.image} 
                  alt={trip.name} 
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" 
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-black/80 text-white">{trip.category}</Badge>
                </div>
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary" className="bg-white/90 text-black">
                    {trip.duration}
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="mb-3">
                  <h3 className="text-xl font-bold text-gray-800 group-hover:text-black transition-colors">
                    {trip.name}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">{trip.description}</p>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="font-medium text-sm">{trip.rating}</span>
                    <span className="text-gray-500 text-sm ml-1">({trip.reviews})</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-1" />
                    {trip.groupSize}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {trip.destinations.slice(0, 2).map((dest, index) => (
                    <Badge key={index} variant="outline" className="text-xs border-gray-300">
                      <MapPin className="h-3 w-3 mr-1" />
                      {dest}
                    </Badge>
                  ))}
                  {trip.destinations.length > 2 && (
                    <Badge variant="outline" className="text-xs border-gray-300">
                      +{trip.destinations.length - 2} more
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-gray-800">{trip.price}</span>
                    <span className="text-gray-500 text-sm ml-1">per person</span>
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        onClick={() => setSelectedTrip(trip)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-2xl text-gray-800">{trip.name}</DialogTitle>
                        <DialogDescription>{trip.description}</DialogDescription>
                      </DialogHeader>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <img 
                            src={trip.image} 
                            alt={trip.name} 
                            className="w-full h-64 object-cover rounded-lg" 
                          />
                        </div>
                        
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                              <Calendar className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                              <div className="font-semibold">{trip.duration}</div>
                              <div className="text-sm text-gray-600">Duration</div>
                            </div>
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                              <Users className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                              <div className="font-semibold">{trip.groupSize}</div>
                              <div className="text-sm text-gray-600">Group Size</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 mr-2" />
                              <span className="font-semibold">{trip.rating}/5</span>
                              <span className="text-gray-500 ml-2">({trip.reviews} reviews)</span>
                            </div>
                            <Badge className={`${
                              trip.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                              trip.difficulty === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                              trip.difficulty === 'Challenging' ? 'bg-orange-100 text-orange-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {trip.difficulty}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-semibold text-lg text-gray-800 mb-3">Destinations</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {trip.destinations.map((dest, index) => (
                              <Badge key={index} variant="outline" className="justify-center p-2">
                                <MapPin className="h-3 w-3 mr-1" />
                                {dest}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-lg text-gray-800 mb-3">Trip Highlights</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {trip.highlights.map((highlight, index) => (
                              <div key={index} className="flex items-center p-2 bg-gray-50 rounded-lg">
                                <Camera className="h-4 w-4 text-gray-600 mr-2" />
                                <span className="text-sm">{highlight}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <DialogFooter className="flex-col sm:flex-row gap-2 pt-6">
                        <div className="flex items-center justify-between w-full">
                          <div>
                            <span className="text-3xl font-bold text-gray-800">{trip.price}</span>
                            <span className="text-gray-500 ml-2">per person</span>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" className="border-gray-300">
                              <Plane className="mr-2 h-4 w-4" />
                              Book Now
                            </Button>
                            <Button 
                              onClick={() => {
                                setIsCreateTripOpen(true);
                                // Pre-fill form with trip data
                                setTripForm(prev => ({
                                  ...prev,
                                  name: `Custom ${trip.name}`,
                                }));
                              }}
                              className="bg-gradient-to-r from-gray-800 to-black text-white hover:from-gray-900 hover:to-gray-800"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Customize Trip
                            </Button>
                          </div>
                        </div>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTrips.length === 0 && (
          <div className="text-center py-16">
            <Mountain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No trips found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Create Trip Modal */}
      <Dialog open={isCreateTripOpen} onOpenChange={setIsCreateTripOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-gray-800">Create Your Custom Trip</DialogTitle>
            <DialogDescription>
              Step {currentStep} of 3: {currentStep === 1 ? 'Trip Details' : currentStep === 2 ? 'Itinerary Builder' : 'Review & Confirm'}
            </DialogDescription>
          </DialogHeader>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div 
              className="bg-gradient-to-r from-gray-800 to-black h-2 rounded-full transition-all duration-300" 
              style={{ width: `${(currentStep / 3) * 100}%` }}
            ></div>
          </div>

          {renderCreateTripStep()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
