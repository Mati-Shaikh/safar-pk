import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Star, 
  MapPin, 
  Users, 
  Calendar, 
  ArrowRight, 
  Search, 
  Filter, 
  Heart, 
  Share2, 
  Phone, 
  Mail,
  Eye,
  Mountain,
  Plane,
  Camera,
  X
} from 'lucide-react';
import Footer from '@/components/layout/Footer';

// Same destinations data from TripPage
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

const TRIP_CATEGORIES = ["All", "Adventure", "Cultural", "Desert", "Nature", "Trekking"];

const Destinations = () => {
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredTrips = useMemo(() => {
    return pakistanTrips.filter(trip => {
      const matchesSearch = trip.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           trip.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           trip.destinations.some(dest => dest.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'All' || trip.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-black via-gray-800 to-black text-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Discover Pakistan's Destinations
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8">
              Explore breathtaking landscapes, rich culture, and unforgettable adventures
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search destinations, trips, or activities..." 
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

        {/* Destinations Grid */}
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

  <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl lg:max-w-4xl px-4 sm:px-6 py-6">
    <DialogHeader>
      <DialogTitle className="text-lg sm:text-2xl text-gray-800">{trip.name}</DialogTitle>
      <DialogDescription className="text-sm sm:text-base">{trip.description}</DialogDescription>
    </DialogHeader>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      <img 
        src={trip.image} 
        alt={trip.name} 
        className="w-full h-48 sm:h-64 object-cover rounded-lg" 
      />
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Calendar className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-1 text-gray-600" />
            <div className="font-semibold text-sm sm:text-base">{trip.duration}</div>
            <div className="text-xs text-gray-600">Duration</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Users className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-1 text-gray-600" />
            <div className="font-semibold text-sm sm:text-base">{trip.groupSize}</div>
            <div className="text-xs text-gray-600">Group Size</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center">
            <Star className="h-4 w-4 sm:h-5 sm:w-5 fill-yellow-400 text-yellow-400 mr-1" />
            <span className="font-semibold text-sm sm:text-base">{trip.rating}/5</span>
            <span className="text-gray-500 text-xs sm:text-sm ml-2">({trip.reviews} reviews)</span>
          </div>
          <Badge className={`text-xs sm:text-sm ${
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
    
    <div className="space-y-6 mt-6">
      <div>
        <h4 className="font-semibold text-base sm:text-lg text-gray-800 mb-2">Destinations</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {trip.destinations.map((dest, index) => (
            <Badge key={index} variant="outline" className="flex items-center justify-center text-xs p-2">
              <MapPin className="h-3 w-3 mr-1" />
              {dest}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-base sm:text-lg text-gray-800 mb-2">Trip Highlights</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {trip.highlights.map((highlight, index) => (
            <div key={index} className="flex items-center p-2 bg-gray-50 rounded-lg text-sm">
              <Camera className="h-4 w-4 text-gray-600 mr-2" />
              <span>{highlight}</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    <DialogFooter className="pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="text-center sm:text-left">
        <span className="text-xl sm:text-2xl font-bold text-gray-800">{trip.price}</span>
        <span className="text-gray-500 ml-1 text-sm">per person</span>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        <Button variant="outline" className="w-full sm:w-auto border-gray-300 text-sm">
          <Plane className="mr-2 h-4 w-4" />
          Book Now
        </Button>
        <Button className="w-full sm:w-auto bg-gradient-to-r from-gray-800 to-black text-white hover:from-gray-900 hover:to-gray-800 text-sm">
          <Mountain className="mr-2 h-4 w-4" />
          Explore More
        </Button>
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
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No destinations found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Contact Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Need Help Planning Your Trip?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Our travel experts are here to help you plan the perfect adventure
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-gray-800 to-black text-white hover:from-gray-900 hover:to-gray-800">
              <Phone className="h-4 w-4 mr-2" />
              Call Us
            </Button>
            <Button size="lg" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
              <Mail className="h-4 w-4 mr-2" />
              Email Us
            </Button>
          </div>
        </div>
      </section>
    </div>
    <Footer />
    </>
  );
};

export default Destinations; 