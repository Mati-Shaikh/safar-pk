import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, MapPin, Star, Calendar, Car, Building, Trash2, Copy, ArrowRight, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import Footer from '@/components/layout/Footer';

interface ItinerarySlot {
  id: number;
  startTime: string;
  endTime: string;
  activity: string;
  transportNeeded: boolean;
  notes: string;
}

interface ItineraryDay {
  date: string;
  slots: ItinerarySlot[];
}

const CAR_TYPES = ["Sedan", "SUV", "Van", "Coaster"];

export const CustomerDashboard: React.FC<{
  user?: any;
  onRequireAuth?: (tripForm: any) => void;
  initialTripForm?: any;
}> = ({ user: propUser, onRequireAuth, initialTripForm }) => {
  const { destinations, trips, addTrip } = useData();
  const { user: contextUser } = useAuth();
  const user = propUser || contextUser;
  
  const [currentStep, setCurrentStep] = useState(1);
  const [tripForm, setTripForm] = useState(initialTripForm || {
    name: '',
    numberOfPeople: 1,
    startDate: '',
    endDate: '',
    needsCar: false,
    carType: 'Sedan',
    destinations: [] as string[],
    itinerary: [] as ItineraryDay[],
  });

  const userTrips = trips.filter(trip => trip.customerId === user?.id);

  const destinationDetails = useMemo(() => 
    destinations.reduce((acc, dest) => {
      acc[dest.id] = dest;
      return acc;
    }, {} as Record<string, typeof destinations[0]>)
  , [destinations]);

  const handleCreateTrip = () => {
    if (tripForm.name && tripForm.destinations.length > 0) {
      if (!user && onRequireAuth) {
        onRequireAuth(tripForm);
        return;
      }
      addTrip({
        customerId: user!.id,
        name: tripForm.name,
        destinations: tripForm.destinations,
        numberOfPeople: tripForm.numberOfPeople,
        startDate: tripForm.startDate,
        endDate: tripForm.endDate,
        needsCar: tripForm.needsCar,
        carType: tripForm.carType,
        itinerary: tripForm.itinerary,
        status: 'upcoming'
      });
      
      // Reset form
      setTripForm({
        name: '',
        numberOfPeople: 1,
        startDate: '',
        endDate: '',
        needsCar: false,
        carType: 'Sedan',
        destinations: [],
        itinerary: [],
      });
      setCurrentStep(1);
      // Ideally, switch to the "My Trips" tab
    }
  };

  const toggleDestination = (destinationId: string) => {
    setTripForm(prev => ({
      ...prev,
      destinations: prev.destinations.includes(destinationId)
        ? prev.destinations.filter(id => id !== destinationId)
        : [...prev.destinations, destinationId]
    }));
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      // Initialize itinerary when moving to step 2
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
  const handlePrevStep = () => setCurrentStep(prev => prev - 1);

  const getDaysArray = (start: string, end: string) => {
    if (!start || !end) return [];
    const days = [];
    let currentDate = new Date(start);
    const endDate = new Date(end);
    // Add timezone offset to avoid off-by-one errors
    currentDate.setMinutes(currentDate.getMinutes() + currentDate.getTimezoneOffset());
    endDate.setMinutes(endDate.getMinutes() + endDate.getTimezoneOffset());
    while (currentDate <= endDate) {
        days.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return days;
  };

  const updateItinerary = (dayIndex: number, newSlots: ItinerarySlot[]) => {
    setTripForm(prev => {
      const newItinerary = [...prev.itinerary];
      newItinerary[dayIndex].slots = newSlots;
      return { ...prev, itinerary: newItinerary };
    });
  };

  const selectedDestinationDetails = tripForm.destinations.map(id => destinationDetails[id]).filter(Boolean);
  const allAttractions = selectedDestinationDetails.flatMap(d => d.attractions.map(a => `${a} (${d.name})`));

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Phase1_TripDetails />;
      case 2:
        return <Phase2_ItineraryBuilder />;
      case 3:
        return <Phase3_Review />;
      default:
        return <Phase1_TripDetails />;
    }
  };

  const Phase1_TripDetails = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tripName">Trip Name</Label>
          <Input id="tripName" placeholder="e.g., Summer Escape to Hunza" value={tripForm.name} onChange={(e) => setTripForm({ ...tripForm, name: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="people">Number of People</Label>
          <Input id="people" type="number" min="1" value={tripForm.numberOfPeople} onChange={(e) => setTripForm({ ...tripForm, numberOfPeople: Number(e.target.value) })} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input id="startDate" type="date" value={tripForm.startDate} onChange={(e) => setTripForm({ ...tripForm, startDate: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <Input id="endDate" type="date" value={tripForm.endDate} onChange={(e) => setTripForm({ ...tripForm, endDate: e.target.value })} />
        </div>
      </div>
      <div>
        <Label>Select Destinations</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-2">
          {destinations.map((destination) => (
            <div key={destination.id} className={`p-3 border rounded-md cursor-pointer transition-colors ${tripForm.destinations.includes(destination.id) ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`} onClick={() => toggleDestination(destination.id)}>
              <h4 className="font-medium">{destination.name}</h4>
              <p className="text-sm text-muted-foreground">{destination.region}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="needsCar" checked={tripForm.needsCar} onCheckedChange={(checked) => setTripForm({ ...tripForm, needsCar: !!checked })} />
        <Label htmlFor="needsCar">Do you need car transport during your trip?</Label>
      </div>
      {tripForm.needsCar && (
        <div className="space-y-2">
          <Label htmlFor="carType">Preferred Car Type</Label>
          <Select value={tripForm.carType} onValueChange={(value) => setTripForm({ ...tripForm, carType: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select a car type" />
            </SelectTrigger>
            <SelectContent>
              {CAR_TYPES.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}
      <Button onClick={handleNextStep} className="w-full" disabled={!tripForm.name || !tripForm.startDate || !tripForm.endDate || tripForm.destinations.length === 0}>
        Build Itinerary <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );

  const Phase2_ItineraryBuilder = () => (
    <div className="space-y-6">
      {tripForm.itinerary.map((day, dayIndex) => (
        <ItineraryDayCard key={day.date} day={day} dayIndex={dayIndex} updateItinerary={updateItinerary} allAttractions={allAttractions} />
      ))}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handlePrevStep}><ArrowLeft className="mr-2 h-4 w-4" /> Back to Details</Button>
        <Button onClick={handleNextStep}>Review Trip <ArrowRight className="ml-2 h-4 w-4" /></Button>
      </div>
    </div>
  );

  const Phase3_Review = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{tripForm.name}</CardTitle>
          <CardDescription>
            {tripForm.numberOfPeople} people | {new Date(tripForm.startDate).toLocaleDateString()} - {new Date(tripForm.endDate).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold">Destinations</h4>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedDestinationDetails.map(d => <Badge key={d.id} variant="secondary">{d.name}</Badge>)}
            </div>
          </div>
          {tripForm.needsCar && (
            <div>
              <h4 className="font-semibold">Transportation</h4>
              <p>Car required: {tripForm.carType}</p>
            </div>
          )}
          <div>
            <h4 className="font-semibold">Daily Itinerary</h4>
            <div className="space-y-4 mt-2">
              {tripForm.itinerary.map(day => (
                <div key={day.date}>
                  <h5 className="font-medium">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</h5>
                  <ul className="list-disc list-inside pl-4 text-sm text-muted-foreground">
                    {day.slots.map(slot => (
                      <li key={slot.id}>{slot.startTime} - {slot.endTime}: {slot.activity} {slot.transportNeeded && <Car className="inline h-4 w-4 ml-1" />}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep(2)}><ArrowLeft className="mr-2 h-4 w-4" /> Edit Itinerary</Button>
        <Button onClick={handleCreateTrip}>Confirm & Create Trip</Button>
      </div>
    </div>
  );

  return (
    <>
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
        <p className="text-muted-foreground mt-2">Plan your next adventure in Pakistan</p>
      </div>

      <Tabs defaultValue="discover" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="create">Create Trip</TabsTrigger>
          <TabsTrigger value="trips">My Trips</TabsTrigger>
        </TabsList>

        <TabsContent value="discover">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" /> Popular Destinations</CardTitle>
              <CardDescription>Explore the most beautiful places in Pakistan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {destinations.map((destination) => (
                  <Card key={destination.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <img src={destination.images[0]} alt={destination.name} className="w-full h-32 object-cover rounded-md mb-3" />
                      <h3 className="font-semibold text-lg">{destination.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{destination.region}</p>
                      <p className="text-sm mb-3">{destination.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{destination.popularity}/100</span>
                        </div>
                        <Badge variant="secondary">{destination.attractions.length} attractions</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5" /> Create New Trip</CardTitle>
              <CardDescription>Phase {currentStep} of 3: {currentStep === 1 ? 'Trip Details' : currentStep === 2 ? 'Itinerary Builder' : 'Review & Confirm'}</CardDescription>
            </CardHeader>
            <CardContent>
              {renderStep()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trips">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> My Trips</CardTitle>
              <CardDescription>View and manage your travel plans</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="upcoming" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>
                <TabsContent value="upcoming" className="mt-4">
                  <TripList trips={userTrips.filter(t => t.status === 'upcoming')} />
                </TabsContent>
                <TabsContent value="ongoing" className="mt-4">
                  <TripList trips={userTrips.filter(t => t.status === 'ongoing')} />
                </TabsContent>
                <TabsContent value="completed" className="mt-4">
                  <TripList trips={userTrips.filter(t => t.status === 'completed')} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    <Footer />
    </>
  );
};

const ItineraryDayCard: React.FC<{ day: ItineraryDay, dayIndex: number, updateItinerary: (dayIndex: number, slots: ItinerarySlot[]) => void, allAttractions: string[], }> = ({ day, dayIndex, updateItinerary, allAttractions }) => {
  
  const addSlot = () => {
    const newSlot: ItinerarySlot = { id: Date.now(), startTime: '09:00', endTime: '11:00', activity: '', transportNeeded: false, notes: '' };
    updateItinerary(dayIndex, [...day.slots, newSlot]);
  };

  const removeSlot = (slotId: number) => {
    updateItinerary(dayIndex, day.slots.filter(s => s.id !== slotId));
  };

  const updateSlot = (slotId: number, field: keyof ItinerarySlot, value: string | boolean) => {
    const newSlots = day.slots.map(s => s.id === slotId ? { ...s, [field]: value } : s);
    updateItinerary(dayIndex, newSlots);
  };

  const copyPreviousDay = () => {
    // This is a placeholder for more complex logic.
    // For now, it just adds a default slot.
    addSlot();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' })}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {day.slots.map((slot) => (
          <div key={slot.id} className="p-4 border rounded-lg space-y-4 relative">
            <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeSlot(slot.id)}><Trash2 className="h-4 w-4" /></Button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Time Range</Label>
                <div className="flex items-center gap-2">
                  <Input type="time" value={slot.startTime} onChange={e => updateSlot(slot.id, 'startTime', e.target.value)} />
                  <span>-</span>
                  <Input type="time" value={slot.endTime} onChange={e => updateSlot(slot.id, 'endTime', e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Place / Activity</Label>
                <Select onValueChange={val => updateSlot(slot.id, 'activity', val)} defaultValue={slot.activity}>
                  <SelectTrigger><SelectValue placeholder="Select an activity" /></SelectTrigger>
                  <SelectContent>
                    {allAttractions.map(att => <SelectItem key={att} value={att}>{att}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea placeholder="e.g., Prefer sunset view at 5 PM" value={slot.notes} onChange={e => updateSlot(slot.id, 'notes', e.target.value)} />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id={`transport-${slot.id}`} checked={slot.transportNeeded} onCheckedChange={checked => updateSlot(slot.id, 'transportNeeded', !!checked)} />
              <Label htmlFor={`transport-${slot.id}`}>Transport Required?</Label>
            </div>
          </div>
        ))}
        <div className="flex gap-2">
          <Button variant="outline" onClick={addSlot}>Add Another Slot</Button>
          {dayIndex > 0 && <Button variant="outline" onClick={copyPreviousDay}><Copy className="mr-2 h-4 w-4" /> Copy Previous Day's Plan</Button>}
        </div>
      </CardContent>
    </Card>
  );
};

const TripList: React.FC<{ trips: any[] }> = ({ trips }) => {
  if (trips.length === 0) {
    return <div className="text-center py-8"><p className="text-muted-foreground">No trips in this category.</p></div>;
  }
  return (
    <div className="space-y-4">
      {trips.map((trip) => (
        <Card key={trip.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{trip.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {trip.destinations.length} destination(s) • {trip.numberOfPeople} people
                </p>
                <div className="flex items-center gap-4 mt-2">
                  {trip.startDate && (
                    <span className="text-sm flex items-center gap-1"><Calendar className="h-4 w-4" /> {new Date(trip.startDate).toLocaleDateString()}</span>
                  )}
                  {trip.needsCar && (
                    <span className="text-sm flex items-center gap-1"><Car className="h-4 w-4" /> Transportation needed</span>
                  )}
                </div>
              </div>
              <Badge variant={trip.status === 'completed' ? 'outline' : 'default'}>{trip.status}</Badge>
            </div>
            <div className="border-t mt-4 pt-4 flex gap-2">
                <Button variant="secondary" size="sm">View Itinerary</Button>
                <Button variant="outline" size="sm">Edit Trip</Button>
                <Button variant="outline" size="sm">Cancel</Button>
                <Button variant="outline" size="sm">Book Again</Button>
                <Button variant="outline" size="sm">Export PDF</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
