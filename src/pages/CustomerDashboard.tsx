import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, MapPin, Star, Calendar, Car, Building } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const CustomerDashboard: React.FC = () => {
  const { destinations, trips, addTrip } = useData();
  const { user } = useAuth();
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);
  const [tripForm, setTripForm] = useState({
    name: '',
    numberOfPeople: 1,
    needsCar: false,
    startDate: '',
    endDate: ''
  });

  const userTrips = trips.filter(trip => trip.customerId === user?.id);

  const handleCreateTrip = () => {
    if (tripForm.name && selectedDestinations.length > 0) {
      addTrip({
        customerId: user!.id,
        name: tripForm.name,
        destinations: selectedDestinations,
        numberOfPeople: tripForm.numberOfPeople,
        startDate: tripForm.startDate,
        endDate: tripForm.endDate,
        needsCar: tripForm.needsCar,
        itinerary: [],
        status: 'draft'
      });
      
      // Reset form
      setTripForm({
        name: '',
        numberOfPeople: 1,
        needsCar: false,
        startDate: '',
        endDate: ''
      });
      setSelectedDestinations([]);
    }
  };

  const toggleDestination = (destinationId: string) => {
    setSelectedDestinations(prev => 
      prev.includes(destinationId)
        ? prev.filter(id => id !== destinationId)
        : [...prev, destinationId]
    );
  };

  return (
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

        <TabsContent value="discover" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Popular Destinations
              </CardTitle>
              <CardDescription>
                Explore the most beautiful places in Pakistan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {destinations.map((destination) => (
                  <Card key={destination.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <img
                        src={destination.images[0]}
                        alt={destination.name}
                        className="w-full h-32 object-cover rounded-md mb-3"
                      />
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

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Trip
              </CardTitle>
              <CardDescription>
                Plan your perfect Pakistani adventure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tripName">Trip Name</Label>
                  <Input
                    id="tripName"
                    placeholder="My Pakistani Adventure"
                    value={tripForm.name}
                    onChange={(e) => setTripForm({ ...tripForm, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="people">Number of People</Label>
                  <Input
                    id="people"
                    type="number"
                    min="1"
                    value={tripForm.numberOfPeople}
                    onChange={(e) => setTripForm({ ...tripForm, numberOfPeople: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={tripForm.startDate}
                    onChange={(e) => setTripForm({ ...tripForm, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={tripForm.endDate}
                    onChange={(e) => setTripForm({ ...tripForm, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Select Destinations</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                  {destinations.map((destination) => (
                    <div
                      key={destination.id}
                      className={`p-3 border rounded-md cursor-pointer transition-colors ${
                        selectedDestinations.includes(destination.id)
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => toggleDestination(destination.id)}
                    >
                      <h4 className="font-medium">{destination.name}</h4>
                      <p className="text-sm text-muted-foreground">{destination.region}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="needsCar"
                  checked={tripForm.needsCar}
                  onChange={(e) => setTripForm({ ...tripForm, needsCar: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="needsCar">I need transportation (car with driver)</Label>
              </div>

              <Button onClick={handleCreateTrip} className="w-full">
                Create Trip
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trips" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                My Trips
              </CardTitle>
              <CardDescription>
                View and manage your travel plans
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userTrips.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No trips created yet</p>
                  <Button variant="outline" className="mt-4" onClick={() => {}}>
                    Create Your First Trip
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {userTrips.map((trip) => (
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
                                <span className="text-sm flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {new Date(trip.startDate).toLocaleDateString()}
                                </span>
                              )}
                              {trip.needsCar && (
                                <span className="text-sm flex items-center gap-1">
                                  <Car className="h-4 w-4" />
                                  Transportation needed
                                </span>
                              )}
                            </div>
                          </div>
                          <Badge variant={trip.status === 'draft' ? 'secondary' : 'default'}>
                            {trip.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};