import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import AuthModal from '@/components/auth/AuthModal';
import AuthRequiredModal from '@/components/AuthRequiredModal';

// Mock data for Pakistan trips
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

interface Room {
  id: string;
  type: string;
  description: string;
  price: string;
  capacity: number;
  amenities: string[];
  images: string[];
  available: boolean;
}

interface HotelWithRooms {
  name: string;
  rooms: Room[];
}

interface ItinerarySlot {
  id: number;
  startTime: string;
  endTime: string;
  activity: string;
  location: string;
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

const CAR_TYPES = ["Sedan", "SUV", "Van", "Coaster", "4WD"];
const TRIP_CATEGORIES = ["All", "Adventure", "Cultural", "Desert", "Nature", "Trekking"];
const HOTEL_OPTIONS = [
  "Serena Hotel, Islamabad",
  "PC Hotel, Lahore",
  "Movenpick, Karachi",
  "Serena Hotel, Gilgit",
  "Shangrila Resort, Skardu",
  "Hunza Serena Inn",
];

const HOTELS_WITH_ROOMS: HotelWithRooms[] = [
  {
    name: "Serena Hotel, Islamabad",
    rooms: [
      {
        id: "serena-deluxe",
        type: "Deluxe Room",
        description: "Spacious room with city view, modern amenities and comfortable furnishings",
        price: "PKR 25,000",
        capacity: 2,
        amenities: ["Free WiFi", "Air Conditioning", "Mini Bar", "Room Service", "City View"],
        images: [
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=600&h=400&fit=crop"
        ],
        available: true
      },
      {
        id: "serena-suite",
        type: "Executive Suite",
        description: "Luxurious suite with separate living area and premium amenities",
        price: "PKR 45,000",
        capacity: 4,
        amenities: ["Free WiFi", "Air Conditioning", "Mini Bar", "Room Service", "City View", "Separate Living Area", "Premium Bedding"],
        images: [
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop"
        ],
        available: true
      },
      {
        id: "serena-standard",
        type: "Standard Room",
        description: "Comfortable room with essential amenities for a pleasant stay",
        price: "PKR 18,000",
        capacity: 2,
        amenities: ["Free WiFi", "Air Conditioning", "Room Service"],
        images: [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=600&h=400&fit=crop"
        ],
        available: true
      }
    ]
  },
  {
    name: "PC Hotel, Lahore",
    rooms: [
      {
        id: "pc-superior",
        type: "Superior Room",
        description: "Elegant room with traditional Pakistani decor and modern comforts",
        price: "PKR 22,000",
        capacity: 2,
        amenities: ["Free WiFi", "Air Conditioning", "Mini Bar", "Room Service", "Traditional Decor"],
        images: [
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=600&h=400&fit=crop"
        ],
        available: true
      },
      {
        id: "pc-presidential",
        type: "Presidential Suite",
        description: "Luxurious presidential suite with panoramic city views",
        price: "PKR 65,000",
        capacity: 6,
        amenities: ["Free WiFi", "Air Conditioning", "Mini Bar", "Room Service", "City View", "Butler Service", "Private Balcony"],
        images: [
          "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=600&h=400&fit=crop"
        ],
        available: true
      },
      {
        id: "pc-deluxe",
        type: "Deluxe Room",
        description: "Well-appointed room with contemporary design and amenities",
        price: "PKR 28,000",
        capacity: 2,
        amenities: ["Free WiFi", "Air Conditioning", "Mini Bar", "Room Service", "Contemporary Design"],
        images: [
          "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=600&h=400&fit=crop"
        ],
        available: true
      }
    ]
  },
  {
    name: "Movenpick, Karachi",
    rooms: [
      {
        id: "movenpick-ocean",
        type: "Ocean View Room",
        description: "Beautiful room overlooking the Arabian Sea with stunning sunset views",
        price: "PKR 35,000",
        capacity: 2,
        amenities: ["Free WiFi", "Air Conditioning", "Mini Bar", "Room Service", "Ocean View", "Balcony"],
        images: [
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop"
        ],
        available: true
      },
      {
        id: "movenpick-family",
        type: "Family Room",
        description: "Spacious family room perfect for groups with children",
        price: "PKR 42,000",
        capacity: 4,
        amenities: ["Free WiFi", "Air Conditioning", "Mini Bar", "Room Service", "Family Friendly", "Extra Bedding"],
        images: [
          "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=600&h=400&fit=crop"
        ],
        available: true
      }
    ]
  },
  {
    name: "Serena Hotel, Gilgit",
    rooms: [
      {
        id: "serena-gilgit-mountain",
        type: "Mountain View Room",
        description: "Breathtaking views of the Karakoram mountains from your window",
        price: "PKR 30,000",
        capacity: 2,
        amenities: ["Free WiFi", "Heating", "Mini Bar", "Room Service", "Mountain View", "Traditional Heating"],
        images: [
          "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop"
        ],
        available: true
      },
      {
        id: "serena-gilgit-deluxe",
        type: "Deluxe Mountain Room",
        description: "Premium room with panoramic mountain views and luxury amenities",
        price: "PKR 40,000",
        capacity: 2,
        amenities: ["Free WiFi", "Heating", "Mini Bar", "Room Service", "Mountain View", "Premium Bedding", "Private Balcony"],
        images: [
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop"
        ],
        available: true
      }
    ]
  },
  {
    name: "Shangrila Resort, Skardu",
    rooms: [
      {
        id: "shangrila-luxury",
        type: "Luxury Tent",
        description: "Glamping experience with luxury tent accommodation and mountain views",
        price: "PKR 50,000",
        capacity: 2,
        amenities: ["Free WiFi", "Heating", "Private Bathroom", "Room Service", "Mountain View", "Glamping Experience"],
        images: [
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop"
        ],
        available: true
      },
      {
        id: "shangrila-suite",
        type: "Resort Suite",
        description: "Luxurious suite with modern amenities and stunning natural surroundings",
        price: "PKR 38,000",
        capacity: 4,
        amenities: ["Free WiFi", "Heating", "Mini Bar", "Room Service", "Mountain View", "Resort Amenities"],
        images: [
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&h=400&fit=crop"
        ],
        available: true
      }
    ]
  },
  {
    name: "Hunza Serena Inn",
    rooms: [
      {
        id: "hunza-valley",
        type: "Valley View Room",
        description: "Traditional Hunza architecture with modern comforts and valley views",
        price: "PKR 32,000",
        capacity: 2,
        amenities: ["Free WiFi", "Heating", "Traditional Design", "Room Service", "Valley View", "Local Architecture"],
        images: [
          "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop"
        ],
        available: true
      },
      {
        id: "hunza-heritage",
        type: "Heritage Room",
        description: "Authentic Hunza heritage room with traditional furnishings",
        price: "PKR 28,000",
        capacity: 2,
        amenities: ["Free WiFi", "Heating", "Traditional Furnishings", "Room Service", "Heritage Experience"],
        images: [
          "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop"
        ],
        available: true
      }
    ]
  }
];

interface Car {
  id: string;
  name: string;
  type: string;
  seats: number;
  pricePerDay: string;
  images: string[];
  features: string[];
  description: string;
}

const CAR_OPTIONS: Car[] = [
  {
    id: "toyota-corolla",
    name: "Toyota Corolla",
    type: "Sedan",
    seats: 4,
    pricePerDay: "PKR 8,000",
    images: [
      "https://images.unsplash.com/photo-1549399302-5bf9b5bb93b8?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1580414449872-2bc7de85f50d?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&h=400&fit=crop"
    ],
    features: ["Air Conditioning", "Fuel Efficient", "Comfortable"],
    description: "Perfect for small groups and city travel"
  },
  {
    id: "honda-city",
    name: "Honda City",
    type: "Sedan",
    seats: 4,
    pricePerDay: "PKR 8,500",
    images: [
      "https://images.unsplash.com/photo-1580414449872-2bc7de85f50d?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1549399302-5bf9b5bb93b8?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=600&h=400&fit=crop"
    ],
    features: ["Air Conditioning", "Modern Interior", "Reliable"],
    description: "Stylish and comfortable sedan for urban exploration"
  },
  {
    id: "toyota-fortuner",
    name: "Toyota Fortuner",
    type: "SUV",
    seats: 7,
    pricePerDay: "PKR 15,000",
    images: [
      "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600&h=400&fit=crop"
    ],
    features: ["4WD", "Spacious", "Off-Road Capable"],
    description: "Ideal for mountain terrain and larger groups"
  },
  {
    id: "honda-crv",
    name: "Honda CR-V",
    type: "SUV",
    seats: 5,
    pricePerDay: "PKR 12,000",
    images: [
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1580414449872-2bc7de85f50d?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=600&h=400&fit=crop"
    ],
    features: ["All-Wheel Drive", "Fuel Efficient", "Safe"],
    description: "Versatile SUV perfect for adventure trips"
  },
  {
    id: "hiace-van",
    name: "Hiace Van",
    type: "Van",
    seats: 12,
    pricePerDay: "PKR 18,000",
    images: [
      "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=400&fit=crop"
    ],
    features: ["High Capacity", "Luggage Space", "Group Travel"],
    description: "Best for large groups and extended trips"
  },
  {
    id: "coaster-bus",
    name: "Coaster Bus",
    type: "Bus",
    seats: 25,
    pricePerDay: "PKR 25,000",
    images: [
      "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop"
    ],
    features: ["Large Capacity", "Comfortable Seating", "Long Distance"],
    description: "Perfect for large groups and tour groups"
  },
  {
    id: "land-cruiser",
    name: "Land Cruiser",
    type: "4WD",
    seats: 7,
    pricePerDay: "PKR 20,000",
    images: [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=600&h=400&fit=crop"
    ],
    features: ["4WD", "Off-Road", "Rugged", "Mountain Terrain"],
    description: "Ultimate vehicle for rough terrains and mountain adventures"
  },
  {
    id: "suzuki-vitara",
    name: "Suzuki Vitara",
    type: "4WD",
    seats: 5,
    pricePerDay: "PKR 10,000",
    images: [
      "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1580414449872-2bc7de85f50d?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600&h=400&fit=crop"
    ],
    features: ["All-Wheel Drive", "Compact", "Efficient"],
    description: "Compact 4WD perfect for smaller groups on adventure trips"
  }
];

// Car Image Gallery Component
const CarImageGallery = ({ car, selectedCar }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % car.images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + car.images.length) % car.images.length);
  };

  const goToImage = (index, e) => {
    e.stopPropagation();
    setCurrentImageIndex(index);
  };

  return (
    <div className="relative group">
      <img
        src={car.images[currentImageIndex]}
        alt={`${car.name} - Image ${currentImageIndex + 1}`}
        className="w-full h-48 object-cover rounded-t-lg"
      />

      {/* Selection Badge */}
      {selectedCar?.id === car.id && (
        <div className="absolute top-4 right-4">
          <Badge className="bg-blue-500 text-white">Selected</Badge>
        </div>
      )}

      {/* Seats Badge */}
      <div className="absolute top-4 left-4">
        <Badge variant="secondary" className="bg-white/90 text-black">
          {car.seats} Seats
        </Badge>
      </div>

      {/* Navigation Arrows */}
      {car.images.length > 1 && (
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
      {car.images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1">
          {car.images.map((_, index) => (
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
        {currentImageIndex + 1} / {car.images.length}
      </div>
    </div>
  );
};

// Car Selection Modal Component
const CarSelectionModal = ({ isOpen, onClose, onCarSelect, selectedCar, onConfirm }) => {
  const [selectedCarDetails, setSelectedCarDetails] = useState(null);

  const handleCarSelect = (car) => {
    onCarSelect(car);
  };

  const handleViewDetails = (car) => {
    setSelectedCarDetails(car);
  };

  const handleBackToGrid = () => {
    setSelectedCarDetails(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-gray-800">
            {selectedCarDetails ? selectedCarDetails.name : 'Select Your Vehicle'}
          </DialogTitle>
          <DialogDescription>
            {selectedCarDetails
              ? 'Vehicle details and image gallery'
              : 'Choose the perfect vehicle for your trip with pricing per day'
            }
          </DialogDescription>
          {selectedCarDetails && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToGrid}
              className="w-fit mt-2"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to All Vehicles
            </Button>
          )}
        </DialogHeader>

        {selectedCarDetails ? (
          // Detailed view of selected car
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Image Gallery */}
              <div>
                <CarImageGallery car={selectedCarDetails} selectedCar={selectedCar} />
              </div>

              {/* Car Details */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">{selectedCarDetails.name}</h3>
                  <p className="text-lg text-gray-600">{selectedCarDetails.type}</p>
                  <p className="text-sm text-gray-500 mt-2">{selectedCarDetails.description}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl font-bold text-gray-800">{selectedCarDetails.pricePerDay}</span>
                    <span className="text-sm text-gray-500">per day</span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {selectedCarDetails.seats} Seats
                    </span>
                    <span className="flex items-center gap-1">
                      <Car className="h-4 w-4" />
                      {selectedCarDetails.type}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Features & Amenities:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedCarDetails.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => handleCarSelect(selectedCarDetails)}
                  className={`w-full ${
                    selectedCar?.id === selectedCarDetails.id
                      ? 'bg-blue-500 hover:bg-blue-600 text-white'
                      : 'bg-gradient-to-r from-gray-800 to-black text-white hover:from-gray-900 hover:to-gray-800'
                  }`}
                >
                  {selectedCar?.id === selectedCarDetails.id ? 'Selected ✓' : 'Select This Vehicle'}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          // Grid view of all cars
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
            {CAR_OPTIONS.map((car) => (
              <Card
                key={car.id}
                className={`cursor-pointer transition-all duration-300 border-2 hover:shadow-lg ${
                  selectedCar?.id === car.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="relative">
                  <img
                    src={car.images[0]}
                    alt={car.name}
                    className="w-full h-40 object-cover rounded-t-lg"
                  />

                  {/* Selection Badge */}
                  {selectedCar?.id === car.id && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-blue-500 text-white">Selected</Badge>
                    </div>
                  )}

                  {/* Seats Badge */}
                  <div className="absolute top-3 left-3">
                    <Badge variant="secondary" className="bg-white/90 text-black">
                      {car.seats} Seats
                    </Badge>
                  </div>

                  {/* Image count */}
                  <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {car.images.length} Photos
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{car.name}</h3>
                      <p className="text-sm text-gray-600">{car.type}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-gray-800">{car.pricePerDay}</span>
                      <span className="text-xs text-gray-500">per day</span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {car.features.slice(0, 2).map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {car.features.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{car.features.length - 2}
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(car);
                        }}
                        className="flex-1 text-xs"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCarSelect(car);
                        }}
                        className={`flex-1 text-xs ${
                          selectedCar?.id === car.id
                            ? 'bg-blue-500 hover:bg-blue-600 text-white'
                            : 'bg-gray-800 hover:bg-gray-900 text-white'
                        }`}
                      >
                        {selectedCar?.id === car.id ? 'Selected ✓' : 'Select'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <DialogFooter className="flex justify-between pt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={!selectedCar}
            className="bg-gradient-to-r from-gray-800 to-black text-white hover:from-gray-900 hover:to-gray-800"
          >
            Confirm Selection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Room Image Gallery Component
const RoomImageGallery = ({ room, selectedRoom }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % room.images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + room.images.length) % room.images.length);
  };

  const goToImage = (index, e) => {
    e.stopPropagation();
    setCurrentImageIndex(index);
  };

  return (
    <div className="relative group">
      <img
        src={room.images[currentImageIndex]}
        alt={`${room.type} - Image ${currentImageIndex + 1}`}
        className="w-full h-64 object-cover rounded-t-lg"
      />

      {/* Selection Badge */}
      {selectedRoom?.id === room.id && (
        <div className="absolute top-4 right-4">
          <Badge className="bg-blue-500 text-white">Selected</Badge>
        </div>
      )}

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

// Room Selection Modal Component
const RoomSelectionModal = ({ isOpen, onClose, hotelName, onRoomSelect, selectedRoom, onConfirm }) => {
  const hotel = HOTELS_WITH_ROOMS.find(h => h.name === hotelName);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!hotel) return null;

  const nextRoom = () => {
    setCurrentIndex((prev) => (prev + 1) % hotel.rooms.length);
  };

  const prevRoom = () => {
    setCurrentIndex((prev) => (prev - 1 + hotel.rooms.length) % hotel.rooms.length);
  };

  const handleRoomSelect = (room) => {
    onRoomSelect(room);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-gray-800">Select a Room - {hotelName}</DialogTitle>
          <DialogDescription>
            Choose your preferred room type and amenities for your stay
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          {/* Main carousel */}
          <div className="relative overflow-hidden rounded-lg">
            <div
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {hotel.rooms.map((room) => (
                <div key={room.id} className="w-full flex-shrink-0">
                  <Card
                    className={`cursor-pointer transition-all duration-300 border-2 ${
                      selectedRoom?.id === room.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleRoomSelect(room)}
                  >
                    <div className="relative">
                      {/* Room Image Gallery */}
                      <RoomImageGallery room={room} selectedRoom={selectedRoom} />
                    </div>

                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-800">{room.type}</h3>
                          <p className="text-sm text-gray-500 mt-2">{room.description}</p>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-3xl font-bold text-gray-800">{room.price}</span>
                          <span className="text-sm text-gray-500">per night</span>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Amenities:</h4>
                          <div className="flex flex-wrap gap-2">
                            {room.amenities.map((amenity, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {amenity}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation buttons */}
          <Button
            variant="outline"
            size="sm"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white"
            onClick={prevRoom}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white"
            onClick={nextRoom}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Dots indicator */}
          <div className="flex justify-center mt-4 space-x-2">
            {hotel.rooms.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-blue-500' : 'bg-gray-300'
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        </div>

        <DialogFooter className="flex justify-between pt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={!selectedRoom}
            className="bg-gradient-to-r from-gray-800 to-black text-white hover:from-gray-900 hover:to-gray-800"
          >
            Confirm Selection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Itinerary Day Card Component
const ItineraryDayCard = ({ day, dayIndex, updateItinerary }) => {
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [carModalOpen, setCarModalOpen] = useState(false);
  const [currentSlotId, setCurrentSlotId] = useState(null);
  const [tempSelectedRoom, setTempSelectedRoom] = useState(null);
  const [tempSelectedCar, setTempSelectedCar] = useState(null);
  const addSlot = () => {
    const newSlot = {
      id: Date.now(),
      startTime: '09:00',
      endTime: '11:00',
      activity: '',
      location: '',
      transportNeeded: false,
      hotelRoomNeeded: false,
      hotelDetails: '',
      selectedRoom: null,
      selectedCar: null,
      carDetails: '',
      notes: ''
    };
    updateItinerary(dayIndex, [...day.slots, newSlot]);
  };

  const removeSlot = (slotId) => {
    updateItinerary(dayIndex, day.slots.filter(s => s.id !== slotId));
  };

  // Helper function to check if hotel selection is allowed for this slot
  const canSelectHotel = (slotId) => {
    const hasOtherHotelSelected = day.slots.some(s =>
      s.id !== slotId && s.hotelRoomNeeded
    );
    return !hasOtherHotelSelected;
  };

  // Get the slot that already has hotel selected (if any)
  const getSelectedHotelSlot = () => {
    return day.slots.find(s => s.hotelRoomNeeded);
  };

  const updateSlot = (slotId, field, value) => {
    // Validation for hotel room selection - only one hotel per day
    if (field === 'hotelRoomNeeded' && value === true) {
      const hasOtherHotelSelected = day.slots.some(s =>
        s.id !== slotId && s.hotelRoomNeeded
      );

      if (hasOtherHotelSelected) {
        const selectedHotelSlot = getSelectedHotelSlot();
        const confirm = window.confirm(
          `Only one hotel can be selected per day.\n\nCurrently "${selectedHotelSlot?.activity}" activity has "${selectedHotelSlot?.hotelDetails}" hotel selected.\n\nDo you want to move the hotel selection to this activity instead?`
        );

        if (confirm) {
          // Clear the previous hotel selection and set it for this slot
          const newSlots = day.slots.map(s => {
            if (s.id === slotId) {
              return { ...s, hotelRoomNeeded: true };
            } else if (s.hotelRoomNeeded) {
              return {
                ...s,
                hotelRoomNeeded: false,
                hotelDetails: '',
                selectedRoom: null
              };
            }
            return s;
          });
          updateItinerary(dayIndex, newSlots);
        }
        return;
      }
    }

    // If selecting a hotel, clear other hotel selections for the day
    if (field === 'hotelDetails' && value) {
      const newSlots = day.slots.map(s => {
        if (s.id === slotId) {
          return { ...s, [field]: value };
        } else if (s.hotelRoomNeeded) {
          // Clear other hotel selections for this day
          return {
            ...s,
            hotelRoomNeeded: false,
            hotelDetails: '',
            selectedRoom: null
          };
        }
        return s;
      });
      updateItinerary(dayIndex, newSlots);
      return;
    }

    const newSlots = day.slots.map(s =>
      s.id === slotId ? { ...s, [field]: value } : s
    );
    updateItinerary(dayIndex, newSlots);
  };

  const openRoomModal = (slotId, hotelName) => {
    setCurrentSlotId(slotId);
    setTempSelectedRoom(day.slots.find(s => s.id === slotId)?.selectedRoom || null);
    setRoomModalOpen(true);
  };

  const handleRoomSelect = (room) => {
    setTempSelectedRoom(room);
  };

  const confirmRoomSelection = () => {
    if (currentSlotId && tempSelectedRoom) {
      updateSlot(currentSlotId, 'selectedRoom', tempSelectedRoom);
    }
    setRoomModalOpen(false);
    setCurrentSlotId(null);
    setTempSelectedRoom(null);
  };

  const cancelRoomSelection = () => {
    setRoomModalOpen(false);
    setCurrentSlotId(null);
    setTempSelectedRoom(null);
  };

  const openCarModal = (slotId) => {
    setCurrentSlotId(slotId);
    setTempSelectedCar(day.slots.find(s => s.id === slotId)?.selectedCar || null);
    setCarModalOpen(true);
  };

  const handleCarSelect = (car) => {
    setTempSelectedCar(car);
  };

  const confirmCarSelection = () => {
    if (currentSlotId && tempSelectedCar) {
      updateSlot(currentSlotId, 'selectedCar', tempSelectedCar);
      updateSlot(currentSlotId, 'carDetails', `${tempSelectedCar.name} (${tempSelectedCar.type}) - ${tempSelectedCar.seats} seats - ${tempSelectedCar.pricePerDay}`);
    }
    setCarModalOpen(false);
    setCurrentSlotId(null);
    setTempSelectedCar(null);
  };

  const cancelCarSelection = () => {
    setCarModalOpen(false);
    setCurrentSlotId(null);
    setTempSelectedCar(null);
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

              <div className="flex items-center space-x-4">
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
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`hotel-${slot.id}`}
                    checked={slot.hotelRoomNeeded}
                    disabled={!canSelectHotel(slot.id) && !slot.hotelRoomNeeded}
                    onCheckedChange={checked => updateSlot(slot.id, 'hotelRoomNeeded', !!checked)}
                  />
                  <Label
                    htmlFor={`hotel-${slot.id}`}
                    className={`${
                      !canSelectHotel(slot.id) && !slot.hotelRoomNeeded
                        ? 'text-gray-400'
                        : 'text-gray-700'
                    }`}
                  >
                    Hotel Room
                  </Label>
                  {!canSelectHotel(slot.id) && !slot.hotelRoomNeeded && (
                    <span className="text-xs text-orange-600 ml-2">
                      (Only one hotel per day allowed)
                    </span>
                  )}
                </div>
              </div>
              {slot.hotelRoomNeeded && (
                <div className="space-y-2 mt-4">
                  <Label className="text-gray-700 font-medium">Hotel Details</Label>
                  <Select 
                    onValueChange={val => updateSlot(slot.id, 'hotelDetails', val)} 
                    value={slot.hotelDetails}
                  >
                    <SelectTrigger className="border-gray-300 focus:border-gray-600">
                      <SelectValue placeholder="Select a hotel" />
                    </SelectTrigger>
                    <SelectContent>
                      {HOTEL_OPTIONS.map(hotel => (
                        <SelectItem key={hotel} value={hotel}>{hotel}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {slot.hotelDetails && (
                    <div className="mt-3">
                      <Button 
                        type="button"
                        variant="outline" 
                        size="sm"
                        onClick={() => openRoomModal(slot.id, slot.hotelDetails)}
                        className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        {slot.selectedRoom ? 'Change Room Selection' : 'Select Room'}
                      </Button>
                      
                      {slot.selectedRoom && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-start space-x-3">
                            <img 
                              src={slot.selectedRoom?.images?.[0]} 
                              alt={slot.selectedRoom?.type}
                              className="w-16 h-12 object-cover rounded"
                            />
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-800">{slot.selectedRoom?.type}</h4>
                              <p className="text-sm text-gray-600">{slot.selectedRoom?.price} per night</p>
                              <p className="text-xs text-gray-500">{slot.selectedRoom?.capacity} {slot.selectedRoom?.capacity === 1 ? 'guest' : 'guests'}</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {slot.selectedRoom?.amenities.slice(0, 2).map((amenity, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {amenity}
                                  </Badge>
                                ))}
                                {slot.selectedRoom?.amenities.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{slot.selectedRoom?.amenities.length - 2}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              {slot.transportNeeded && (
                <div className="space-y-2 mt-4">
                  <Label className="text-gray-700 font-medium">Vehicle Details</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => openCarModal(slot.id)}
                    className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    {slot.selectedCar ? 'Change Vehicle Selection' : 'Select Vehicle'}
                  </Button>

                  {slot.selectedCar && (
                    <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <img
                          src={slot.selectedCar?.images?.[0]}
                          alt={slot.selectedCar?.name}
                          className="w-16 h-12 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800">{slot.selectedCar?.name}</h4>
                          <p className="text-sm text-gray-600">{slot.selectedCar?.type} • {slot.selectedCar?.seats} seats</p>
                          <p className="text-sm font-semibold text-orange-600">{slot.selectedCar?.pricePerDay} per day</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {slot.selectedCar?.features.slice(0, 2).map((feature, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                            {slot.selectedCar?.features.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{slot.selectedCar?.features.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
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
      
      {/* Room Selection Modal */}
      <RoomSelectionModal
        isOpen={roomModalOpen}
        onClose={cancelRoomSelection}
        hotelName={day.slots.find(s => s.id === currentSlotId)?.hotelDetails || ''}
        onRoomSelect={handleRoomSelect}
        selectedRoom={tempSelectedRoom}
        onConfirm={confirmRoomSelection}
      />

      {/* Car Selection Modal */}
      <CarSelectionModal
        isOpen={carModalOpen}
        onClose={cancelCarSelection}
        onCarSelect={handleCarSelect}
        selectedCar={tempSelectedCar}
        onConfirm={confirmCarSelection}
      />
    </Card>
  );
};


const TripDetailsStep = ({ tripForm, setTripForm, handleNextStep, prefilledData }) => (
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

      {/* Display prefilled destination information */}
      {prefilledData && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-blue-800">Selected Destination Package</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Destinations</h4>
              <div className="flex flex-wrap gap-1">
                {prefilledData.destinations?.map((dest, index) => (
                  <Badge key={index} variant="outline" className="text-xs border-blue-300 text-blue-700">
                    <MapPin className="h-3 w-3 mr-1" />
                    {dest}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-800 mb-2">Trip Highlights</h4>
              <div className="space-y-1">
                {prefilledData.highlights?.slice(0, 3).map((highlight, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-600">
                    <Camera className="h-3 w-3 mr-2 text-blue-600" />
                    {highlight}
                  </div>
                ))}
                {prefilledData.highlights?.length > 3 && (
                  <div className="text-xs text-blue-600">+{prefilledData.highlights.length - 3} more highlights</div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-blue-200">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span><strong>Duration:</strong> {prefilledData.duration}</span>
              <span><strong>Difficulty:</strong> {prefilledData.difficulty}</span>
              <span><strong>Category:</strong> {prefilledData.category}</span>
            </div>
            <Badge className="bg-blue-100 text-blue-800">{prefilledData.price}</Badge>
          </div>

          <div className="text-xs text-blue-600 bg-blue-100 p-2 rounded">
            💡 This information has been pre-filled from your selected destination. You can now customize the dates and add your detailed itinerary!
          </div>
        </div>
      )}

      {/* <div className="flex items-center space-x-2">
        <Checkbox 
          id="needsCar" 
          checked={tripForm.needsCar} 
          onCheckedChange={(checked) => setTripForm(prev => ({ ...prev, needsCar: !!checked }))} 
        />
        <Label htmlFor="needsCar" className="text-gray-800">Do you need transportation during your trip?</Label>
      </div> */}

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

const ReviewStep = ({ tripForm, handleCreateTrip, setCurrentStep }) => {
  // Calculate trip summary data
  const totalDays = tripForm.itinerary.length;
  const totalActivities = tripForm.itinerary.reduce((sum, day) => sum + day.slots.length, 0);
  const uniqueHotels = [...new Set(tripForm.itinerary.flatMap(day => 
    day.slots.filter(slot => slot.hotelRoomNeeded && slot.hotelDetails).map(slot => slot.hotelDetails)
  ))];
  const uniqueVehicles = [...new Set(tripForm.itinerary.flatMap(day => 
    day.slots.filter(slot => slot.transportNeeded && slot.carDetails).map(slot => slot.carDetails)
  ))];
  const uniqueLocations = [...new Set(tripForm.itinerary.flatMap(day => 
    day.slots.map(slot => slot.location).filter(Boolean)
  ))];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">🎉 Your Perfect Trip is Ready!</h3>
        <p className="text-gray-600">Review all details before creating your custom adventure</p>
      </div>

      {/* Trip Overview Card */}
      <Card className="border border-gray-200">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-gray-800 flex items-center justify-center gap-2">
            <Mountain className="h-6 w-6 text-black" />
            {tripForm.name}
            <Mountain className="h-6 w-6 text-black" />
          </CardTitle>
          <CardDescription className="text-lg">
            <div className="flex items-center justify-center gap-4 text-gray-700">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {tripForm.numberOfPeople} {tripForm.numberOfPeople === 1 ? 'Person' : 'People'}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {totalDays} {totalDays === 1 ? 'Day' : 'Days'}
              </span>
              <span className="flex items-center gap-1">
                <Camera className="h-4 w-4" />
                {totalActivities} Activities
              </span>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-black" />
                <div>
                  <p className="font-medium text-gray-800">Trip Dates</p>
                  <p className="text-sm text-gray-600">
                    {new Date(tripForm.startDate).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })} - {new Date(tripForm.endDate).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              
              {tripForm.budget && (
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-black" />
                  <div>
                    <p className="font-medium text-gray-800">Budget</p>
                    <p className="text-sm text-gray-600">PKR {tripForm.budget}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium text-gray-800">Destinations</p>
                  <p className="text-sm text-gray-600">{uniqueLocations.length} unique locations</p>
                </div>
              </div>
              
              {tripForm.preferences && (
                <div className="flex items-start gap-2">
                  <Eye className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-800">Preferences</p>
                    <p className="text-sm text-gray-600 line-clamp-2">{tripForm.preferences}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accommodation & Transportation Summary */}
      {(uniqueHotels.length > 0 || uniqueVehicles.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Hotels Summary */}
          {uniqueHotels.length > 0 && (
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                  <Star className="h-5 w-5 text-black" />
                  Accommodation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {uniqueHotels.map((hotel, index) => {
                  const hotelSlots = tripForm.itinerary.flatMap(day => 
                    day.slots.filter(slot => slot.hotelRoomNeeded && slot.hotelDetails === hotel)
                  );
                  const rooms = hotelSlots.map(slot => slot.selectedRoom).filter(Boolean) as Room[];
                  const uniqueRooms = [...new Set(rooms.map(room => room.type))];
                  
                  return (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <h4 className="font-medium text-gray-800 mb-2">{hotel as string}</h4>
                      {uniqueRooms.length > 0 && (
                        <div className="space-y-2">
                          {uniqueRooms.map((roomType, roomIndex) => {
                            const room = rooms.find(r => r.type === roomType);
                            return (
                              <div key={roomIndex} className="flex items-start gap-3">
                                <img
                                  src={room.images[0]}
                                  alt={roomType}
                                  className="w-12 h-8 object-cover rounded"
                                />
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-700">{roomType}</p>
                                  <p className="text-xs text-gray-500">{room.price} per night</p>
                                  <p className="text-xs text-gray-500">{room.capacity} {room.capacity === 1 ? 'guest' : 'guests'}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Transportation Summary */}
          {uniqueVehicles.length > 0 && (
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                  <Car className="h-5 w-5 text-black" />
                  Transportation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {uniqueVehicles.map((vehicle, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <Car className="h-8 w-8 text-black" />
                      <div>
                        <p className="font-medium text-gray-700">{vehicle as string}</p>
                        <p className="text-sm text-gray-500">Available for your activities</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Detailed Daily Itinerary */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-black" />
            Daily Itinerary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {tripForm.itinerary.map((day, dayIndex) => (
              <div key={day.date} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h5 className="font-semibold text-gray-800 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Day {dayIndex + 1} - {new Date(day.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </h5>
                    {(() => {
                      const selectedHotelSlot = day.slots.find(s => s.hotelRoomNeeded);
                      return selectedHotelSlot && (
                        <div className="flex items-center gap-2 text-sm">
                          <Star className="h-4 w-4 text-blue-600" />
                          <span className="text-blue-700 font-medium">
                            Hotel: {selectedHotelSlot.hotelDetails}
                            <span className="text-gray-600 ml-1">
                              ({selectedHotelSlot.activity})
                            </span>
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                </div>
                <div className="p-4">
                  {day.slots.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="italic">No activities planned for this day</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {day.slots.map((slot, slotIndex) => (
                        <div key={slot.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <Clock className="h-4 w-4 text-black" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium text-gray-800">
                                  {slot.startTime} - {slot.endTime}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {slot.activity}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 mb-3">
                                <MapPin className="h-4 w-4 text-red-500" />
                                <span className="text-gray-700">{slot.location}</span>
                              </div>
                              
                              {/* Hotel Details */}
                              {slot.hotelRoomNeeded && slot.hotelDetails && (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
                                  <div className="flex items-start gap-3">
                                    <Star className="h-5 w-5 text-black mt-0.5" />
                                    <div className="flex-1">
                                      <h6 className="font-medium text-gray-800">{slot.hotelDetails}</h6>
                                      {slot.selectedRoom && (
                                        <div className="mt-2 flex items-start gap-3">
                                          <img 
                                            src={slot.selectedRoom?.images?.[0]} 
                                            alt={slot.selectedRoom?.type}
                                            className="w-16 h-12 object-cover rounded"
                                          />
                                          <div>
                                            <p className="text-sm font-medium text-gray-700">{slot.selectedRoom?.type}</p>
                                            <p className="text-xs text-gray-600">{slot.selectedRoom?.price} per night</p>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                              {slot.selectedRoom?.amenities.slice(0, 3).map((amenity, index) => (
                                                <Badge key={index} variant="outline" className="text-xs">
                                                  {amenity}
                                                </Badge>
                                              ))}
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {/* Vehicle Details */}
                              {slot.transportNeeded && slot.selectedCar && (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
                                  <div className="flex items-start gap-3">
                                    <img
                                      src={slot.selectedCar?.images?.[0]}
                                      alt={slot.selectedCar?.name}
                                      className="w-16 h-12 object-cover rounded"
                                    />
                                    <div>
                                      <p className="font-medium text-gray-800">{slot.selectedCar?.name}</p>
                                      <p className="text-sm text-gray-600">{slot.selectedCar?.type} • {slot.selectedCar?.seats} seats</p>
                                      <p className="text-sm font-medium text-orange-600">{slot.selectedCar?.pricePerDay} per day</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {/* Notes */}
                              {slot.notes && (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                  <div className="flex items-start gap-2">
                                    <Eye className="h-4 w-4 text-black mt-0.5" />
                                    <div>
                                      <p className="text-sm font-medium text-gray-700 mb-1">Notes</p>
                                      <p className="text-sm text-gray-600">{slot.notes}</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Action Buttons */}
      <div className="flex justify-between pt-6">
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep(2)}
          className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Edit Itinerary
        </Button>
        <Button 
          onClick={handleCreateTrip}
          className="bg-black text-white hover:bg-gray-800 px-8 py-2 text-lg font-semibold"
        >
          🚀 Create My Trip
        </Button>
      </div>
    </div>
  );
};

export default function TripsPage() {
  const { user, profile, isAuthenticated, isCustomer, loading } = useAuth();
  const location = useLocation();
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [isCreateTripOpen, setIsCreateTripOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentStep, setCurrentStep] = useState(1);
  const [userTrips, setUserTrips] = useState([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAuthRequiredModalOpen, setIsAuthRequiredModalOpen] = useState(false);
  const [pendingTripForm, setPendingTripForm] = useState(null);
  const [pendingCurrentStep, setPendingCurrentStep] = useState(null);

  // Load user trips from Supabase instead of localStorage
  useEffect(() => {
    const loadUserTrips = async () => {
      if (isAuthenticated && user) {
        try {
          const { data, error } = await supabase
            .from('trips')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Error loading trips:', error);
          } else {
            setUserTrips(data || []);
          }
        } catch (error) {
          console.error('Error loading trips:', error);
        }
      } else {
        setUserTrips([]);
      }
    };

    if (!loading) {
      loadUserTrips();
    }
  }, [isAuthenticated, user, loading]);

  // Handle prefilled data from Destinations page
  useEffect(() => {
    const prefilledData = location.state?.prefilledData;
    if (prefilledData) {
      setIsCreateTripOpen(true);
      setCurrentStep(1);
    }
  }, [location.state]);

  // Restore trip form data after successful authentication
  useEffect(() => {
    if (isAuthenticated && isCustomer && pendingTripForm && pendingCurrentStep) {
      // Restore the form data and step
      setTripForm(pendingTripForm);
      setCurrentStep(pendingCurrentStep);
      setIsCreateTripOpen(true);

      // Clear pending data
      setPendingTripForm(null);
      setPendingCurrentStep(null);

      // Close auth modals
      setIsAuthRequiredModalOpen(false);
      setIsAuthModalOpen(false);
    }
  }, [isAuthenticated, isCustomer, pendingTripForm, pendingCurrentStep]);

  const [tripForm, setTripForm] = useState(() => {
    const prefilledData = location.state?.prefilledData;
    return {
      name: prefilledData?.name || '',
      numberOfPeople: 1,
      startDate: '',
      endDate: '',
      needsCar: false,
      carType: 'Sedan',
      budget: '',
      preferences: prefilledData?.description || '',
      itinerary: [] as ItineraryDay[],
    };
  });

  const allTrips = useMemo(() => {
    return [...pakistanTrips, ...userTrips];
  }, [userTrips]);

  const filteredTrips = useMemo(() => {
    return allTrips.filter(trip => {
      const matchesSearch = trip.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           trip.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           trip.destinations.some(dest => dest.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'All' || trip.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory, allTrips]);

  const handleCreateTrip = async () => {
    if (!isAuthenticated || !user) {
      // Store the current form data and step before showing auth modal
      setPendingTripForm(tripForm);
      setPendingCurrentStep(currentStep);
      setIsAuthRequiredModalOpen(true);
      return;
    }

    if (!isCustomer) {
      // Store the current form data and step before showing auth modal
      setPendingTripForm(tripForm);
      setPendingCurrentStep(currentStep);
      setIsAuthRequiredModalOpen(true);
      return;
    }

    try {
      // Extract destinations from itinerary
      const destinations = [...new Set(
        tripForm.itinerary.flatMap(day =>
          day.slots?.map(slot => slot.location).filter(Boolean) || []
        )
      )];

      // Extract highlights from activities
      const highlights = [...new Set(
        tripForm.itinerary.flatMap(day =>
          day.slots?.map(slot => slot.activity).filter(Boolean) || []
        )
      )];

      // Create comprehensive trip data
      const tripData = {
        user_id: user.id,
        name: tripForm.name,
        description: tripForm.preferences || `A custom ${tripForm.numberOfPeople}-person trip to explore Pakistan's beautiful destinations.`,
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
        itinerary: tripForm.itinerary, // Store the complete itinerary with rooms and vehicles
      };

      console.log('Creating trip with data:', tripData);

      const { data, error } = await supabase
        .from('trips')
        .insert(tripData)
        .select('*')
        .single();

      if (error) {
        console.error('Error creating trip:', error);
        alert(`Failed to create trip: ${error.message}`);
        return;
      }

      console.log('Trip created successfully:', data);

      // Add the new trip to local state
      setUserTrips(prev => [data, ...prev]);

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

      alert(`🎉 Your custom trip "${tripData.name}" has been created successfully! You can view it in your trips section.`);
    } catch (error) {
      console.error('Error creating trip:', error);
      alert('Failed to create trip. Please try again.');
    }
  };

  // Handle Create Trip button click - allow users to fill form regardless of auth status
  const handleCreateTripClick = () => {
    setIsCreateTripOpen(true);
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

  const handleDeleteTrip = async (tripId: string) => {
    if (!confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', tripId)
        .eq('user_id', user?.id); // Additional security check

      if (error) {
        console.error('Error deleting trip:', error);
        alert('Failed to delete trip. Please try again.');
        return;
      }

      // Remove trip from local state
      setUserTrips(prev => prev.filter(trip => trip.id !== tripId));
      alert('Trip deleted successfully!');
    } catch (error) {
      console.error('Error deleting trip:', error);
      alert('Failed to delete trip. Please try again.');
    }
  };

  const formatTripDates = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const startStr = start.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
    const endStr = end.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    return `${startStr} - ${endStr}`;
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
          prefilledData={location.state?.prefilledData}
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
          prefilledData={location.state?.prefilledData}
        />;
    }
  };

  return (
    <>
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
              onClick={handleCreateTripClick}
              size="lg"
              className="bg-white text-black hover:bg-gray-100 text-lg px-8 py-3"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create Custom Trip
            </Button>
          </div>
        </div>
      </div>

      {/* My Trips Section - Only show for authenticated customers */}
      {isAuthenticated && isCustomer && (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">My Created Trips</h2>
          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-400 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading your trips...</p>
            </div>
          ) : userTrips.length === 0 ? (
            <div className="text-center py-16">
              <Mountain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No trips created yet</h3>
              <p className="text-gray-500 mb-4">Create your first custom trip to start your Pakistan adventure!</p>
              <Button
                onClick={handleCreateTripClick}
                className="bg-gradient-to-r from-gray-800 to-black text-white hover:from-gray-900 hover:to-gray-800"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Trip
              </Button>
            </div>
          ) :
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
            {userTrips.map((trip) => {
              // Calculate derived data for trips from Supabase
              const duration = trip.start_date && trip.end_date ?
                `${getDaysArray(trip.start_date, trip.end_date).length} days` :
                'Custom duration';

              // Use destinations from database if available, otherwise extract from itinerary
              const destinations: string[] = trip.destinations ||
                (trip.itinerary ?
                  [...new Set(trip.itinerary.flatMap(day => day.slots?.map(slot => slot.location) || []).filter(Boolean))] as string[] :
                  []);

              // Use highlights from database if available, otherwise extract from itinerary
              const highlights: string[] = trip.highlights ||
                (trip.itinerary ?
                  [...new Set(trip.itinerary.flatMap(day => day.slots?.map(slot => slot.activity) || []).filter(Boolean))] as string[] :
                  []);

              const price = trip.budget ? `PKR ${trip.budget.toLocaleString()}` : 'Price on request';
              const people = trip.number_of_people || 1;

              return (
                <Card key={trip.id} className="group hover:shadow-xl hover:-translate-y-2 transition-all duration-500 border-0 bg-white rounded-2xl overflow-hidden relative">
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
        <Mountain className="h-6 w-6 text-white" />
      </div>
      <div>
        <Badge className="bg-white/10 text-white border-white/20 backdrop-blur-sm mb-2">
          Custom Trip
        </Badge>
        <h3 className="text-xl font-bold text-white leading-tight">
          {trip.name}
        </h3>
      </div>
    </div>

    <div className="text-right">
      <Badge
        variant="secondary"
        className="bg-white/90 text-gray-900 font-semibold"
      >
        {duration}
      </Badge>
    </div>
  </div>

  <p className="text-gray-200 text-sm leading-relaxed line-clamp-2">
    {trip.description}
  </p>
</div>


                  <CardContent className="p-6 space-y-6">
                    {/* Trip Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                        <div className="flex items-center justify-center mb-2">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Users className="h-4 w-4 text-green-600" />
                          </div>
                        </div>
                        <div className="text-lg font-bold text-gray-900">{people}</div>
                        <div className="text-xs text-gray-500">{people === 1 ? 'Person' : 'People'}</div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                        <div className="flex items-center justify-center mb-2">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Calendar className="h-4 w-4 text-purple-600" />
                          </div>
                        </div>
                        <div className="text-lg font-bold text-gray-900 capitalize">{trip.status || 'Planned'}</div>
                        <div className="text-xs text-gray-500">Status</div>
                      </div>
                    </div>

                    {/* Destinations */}
                    {destinations.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="p-1 bg-orange-100 rounded">
                            <MapPin className="h-4 w-4 text-orange-600" />
                          </div>
                          <h4 className="font-semibold text-gray-900 text-sm">Destinations</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {destinations.slice(0, 2).map((dest, index) => (
                            <Badge key={index} className="bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200 rounded-lg px-3 py-1">
                              {dest}
                            </Badge>
                          ))}
                          {destinations.length > 2 && (
                            <Badge className="bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-200 rounded-lg px-3 py-1">
                              +{destinations.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Activities */}
                    {highlights.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="p-1 bg-blue-100 rounded">
                            <Camera className="h-4 w-4 text-blue-600" />
                          </div>
                          <h4 className="font-semibold text-gray-900 text-sm">Activities</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {highlights.slice(0, 3).map((highlight, index) => (
                            <Badge key={index} className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 rounded-lg px-3 py-1">
                              {highlight}
                            </Badge>
                          ))}
                          {highlights.length > 3 && (
                            <Badge className="bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-200 rounded-lg px-3 py-1">
                              +{highlights.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Price and Actions */}
                    <div className="border-t border-gray-100 pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200">
                          <div className="text-sm text-green-600 font-medium">Total Budget</div>
                          <div className="text-2xl font-bold text-green-700">{price}</div>
                        </div>

                        {trip.needs_car && (
                          <div className="text-center">
                            <div className="p-2 bg-blue-100 rounded-lg mb-1">
                              <Car className="h-5 w-5 text-blue-600 mx-auto" />
                            </div>
                            <div className="text-xs text-blue-600 font-medium">Transport</div>
                            <div className="text-xs text-gray-500">{trip.car_type || 'Required'}</div>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Dialog>
                        <DialogTrigger asChild>
                        <Button
  className="flex-1 bg-gradient-to-r from-black via-gray-900 to-gray-800 text-white hover:from-gray-800 hover:via-gray-900 hover:to-black rounded-xl py-3 font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
  onClick={() => setSelectedTrip(trip)}
>
  <Eye className="mr-2 h-4 w-4" />
  View Details
</Button>

                        </DialogTrigger>
                      <DialogContent className="max-h-[95vh] overflow-y-auto sm:max-w-5xl lg:max-w-7xl bg-white p-0">
                        {/* Header */}
                        <div className="bg-white border-b border-gray-200 p-6">
                          <div className="flex items-start justify-between">
                            <div>
                              <DialogTitle className="text-3xl font-bold text-black mb-2">{trip.name}</DialogTitle>
                              <DialogDescription className="text-gray-600 text-lg">{trip.description}</DialogDescription>
                            </div>
                            <div className="text-right">
                              <div className="text-4xl font-bold text-black">{trip.price}</div>
                              
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-0">
                          {/* Main Content */}
                          <div className="lg:col-span-3 p-6 space-y-8">
                            {/* Trip Header */}
                            <div className="bg-gradient-to-r from-black-50 to-indigo-50 rounded-lg p-6 border border-black-200">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-black-100 rounded-lg">
                                    <Mountain className="h-6 w-6 text-black-600" />
                                  </div>
                                  <div>
                                    <h2 className="text-2xl font-bold text-gray-900">{trip.name}</h2>
                                    {trip.category && (
                                      <span className="inline-block mt-1 px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">
                                        {trip.category}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm text-gray-500">Total Budget</div>
                                  <div className="text-2xl font-bold text-blue-600">
                                    {trip.budget ? `Rs. ${trip.budget.toLocaleString()}` : 'Custom Quote'}
                                  </div>
                                </div>
                              </div>
                              <p className="text-gray-700 leading-relaxed">{trip.description}</p>
                            </div>

                            {/* Trip Overview */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                                <div className="flex items-center gap-3">
                                  <Calendar className="h-8 w-8 text-blue-600" />
                                  <div>
                                    <div className="text-sm text-gray-500">Duration</div>
                                    <div className="font-bold text-gray-900">
                                      {trip.start_date && trip.end_date ?
                                        `${Math.ceil((new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / (1000 * 60 * 60 * 24))} days`
                                        : (trip.duration || 'Custom')
                                      }
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                                <div className="flex items-center gap-3">
                                  <Users className="h-8 w-8 text-green-600" />
                                  <div>
                                    <div className="text-sm text-gray-500">Group Size</div>
                                    <div className="font-bold text-gray-900">
                                      {trip.number_of_people || trip.groupSize || 'N/A'} people
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                                <div className="flex items-center gap-3">
                                  <Car className="h-8 w-8 text-orange-600" />
                                  <div>
                                    <div className="text-sm text-gray-500">Transportation</div>
                                    <div className="font-bold text-gray-900">
                                      {trip.needs_car ? (trip.car_type || 'Required') : 'Not Required'}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                                <div className="flex items-center gap-3">
                                  <Clock className="h-8 w-8 text-purple-600" />
                                  <div>
                                    <div className="text-sm text-gray-500">Status</div>
                                    <div className="font-bold text-gray-900 capitalize">
                                      {trip.status || 'Planned'}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Destinations */}
                            <div>
                              <h3 className="text-2xl font-bold text-black mb-4">Destinations</h3>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {trip.destinations && trip.destinations.length > 0 ? trip.destinations.map((dest, index) => (
                                  <div key={index} className="flex items-center gap-2 p-3 border border-gray-200">
                                    <MapPin className="h-4 w-4 text-black" />
                                    <span className="font-medium text-black">{dest}</span>
                                  </div>
                                )) : (
                                  <div className="col-span-full text-gray-500 text-center py-4">
                                    No destinations specified
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Trip Highlights */}
                            <div>
                              <h3 className="text-2xl font-bold text-black mb-4">Highlights</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {trip.highlights && trip.highlights.length > 0 ? trip.highlights.map((highlight, index) => (
                                  <div key={index} className="flex items-start gap-3 p-3 border border-gray-200">
                                    <Camera className="h-4 w-4 text-black mt-1" />
                                    <span className="text-black">{highlight}</span>
                                  </div>
                                )) : (
                                  <div className="col-span-full text-gray-500 text-center py-4">
                                    No highlights specified
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* User's Custom Itinerary */}
                            {trip.itinerary && trip.itinerary.length > 0 ? (
                              <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                  <Calendar className="h-7 w-7 text-blue-600" />
                                  Your Itinerary
                                </h3>
                                <div className="space-y-6">
                                  {trip.itinerary.map((day, dayIndex) => (
                                    <div key={day.date} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                                        <h4 className="font-bold text-xl text-gray-900 flex items-center gap-3">
                                          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                            {dayIndex + 1}
                                          </div>
                                          {new Date(day.date).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            month: 'long',
                                            day: 'numeric'
                                          })}
                                        </h4>
                                      </div>
                                      <div className="p-6">
                                      {day.slots.length === 0 ? (
                                        <p className="text-gray-500 italic">No activities planned</p>
                                      ) : (
                                        <div className="space-y-4">
                                          {day.slots.map((slot) => (
                                            <div key={slot.id} className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500 shadow-sm">
                                              <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                  <div className="p-2 bg-blue-100 rounded-lg">
                                                    <Clock className="h-4 w-4 text-blue-600" />
                                                  </div>
                                                  <div>
                                                    <span className="text-blue-600 font-bold text-sm">{slot.startTime} - {slot.endTime}</span>
                                                    <h5 className="font-semibold text-gray-900 text-lg">{slot.activity}</h5>
                                                  </div>
                                                </div>
                                                {slot.transportNeeded && (
                                                  <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 rounded-full">
                                                    <Car className="h-3 w-3 text-orange-600" />
                                                    <span className="text-xs text-orange-600 font-medium">Transport</span>
                                                  </div>
                                                )}
                                              </div>

                                              <div className="flex items-center gap-2 mb-3">
                                                <MapPin className="h-4 w-4 text-gray-500" />
                                                <span className="text-gray-700 font-medium">{slot.location}</span>
                                              </div>
                                              
                                              {/* Hotel Details */}
                                              {slot.hotelRoomNeeded && slot.hotelDetails && (
                                                <div className="bg-white border border-gray-200 rounded-lg p-4 mb-3">
                                                  <div className="flex items-center gap-2 mb-3">
                                                    <div className="p-1 bg-yellow-100 rounded">
                                                      <Star className="h-4 w-4 text-yellow-600" />
                                                    </div>
                                                    <h6 className="font-semibold text-gray-900">Hotel Accommodation</h6>
                                                  </div>
                                                  <p className="text-gray-700 mb-3">{slot.hotelDetails}</p>
                                                  {slot.selectedRoom && (
                                                    <div className="bg-gray-50 rounded-lg p-3">
                                                      <div className="flex items-start gap-4">
                                                        <img
                                                          src={slot.selectedRoom?.images?.[0]}
                                                          alt={slot.selectedRoom?.type}
                                                          className="w-20 h-16 object-cover rounded-lg shadow-sm"
                                                        />
                                                        <div className="flex-1">
                                                          <h6 className="font-semibold text-gray-900">{slot.selectedRoom?.type}</h6>
                                                          <p className="text-sm text-gray-600 mb-1">{slot.selectedRoom?.description}</p>
                                                          <div className="flex items-center justify-between">
                                                            <span className="text-sm font-bold text-green-600">{slot.selectedRoom?.price} per night</span>
                                                            <span className="text-xs text-gray-500">Capacity: {slot.selectedRoom?.capacity} guests</span>
                                                          </div>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  )}
                                                </div>
                                              )}
                                              
                                              {/* Vehicle Details */}
                                              {slot.transportNeeded && slot.selectedCar && (
                                                <div className="bg-white border border-orange-200 rounded-lg p-4 mb-3">
                                                  <div className="flex items-center gap-2 mb-3">
                                                    <div className="p-1 bg-orange-100 rounded">
                                                      <Car className="h-4 w-4 text-orange-600" />
                                                    </div>
                                                    <h6 className="font-semibold text-gray-900">Transportation</h6>
                                                  </div>
                                                  <div className="bg-gray-50 rounded-lg p-3">
                                                    <div className="flex items-start gap-4">
                                                      <img
                                                        src={slot.selectedCar?.images?.[0]}
                                                        alt={slot.selectedCar?.name}
                                                        className="w-20 h-16 object-cover rounded-lg shadow-sm"
                                                      />
                                                      <div className="flex-1">
                                                        <h6 className="font-semibold text-gray-900">{slot.selectedCar?.name}</h6>
                                                        <p className="text-sm text-gray-600 mb-1">{slot.selectedCar?.description}</p>
                                                        <div className="flex items-center justify-between">
                                                          <div className="flex items-center gap-3">
                                                            <span className="text-sm font-bold text-orange-600">{slot.selectedCar?.pricePerDay} per day</span>
                                                            <span className="text-xs text-gray-500">{slot.selectedCar?.type}</span>
                                                          </div>
                                                          <span className="text-xs text-gray-500">Seats: {slot.selectedCar?.seats}</span>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                              )}
                                              
                                              {/* Notes */}
                                              {slot.notes && (
                                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                                  <div className="flex items-start gap-2">
                                                    <Eye className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                                    <div>
                                                      <h6 className="font-medium text-blue-900 text-sm mb-1">Notes</h6>
                                                      <p className="text-sm text-blue-800">{slot.notes}</p>
                                                    </div>
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div>
                                <h3 className="text-2xl font-bold text-black mb-4">Itinerary</h3>
                                <div className="border border-gray-200 p-6 text-center">
                                  <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                                  <p className="text-gray-500">No custom itinerary available for this trip</p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Sidebar */}
                          <div className="bg-gray-50 p-6 space-y-6">
                            {/* Booking Card */}
                           

                            {/* Trip Details */}
                            <div className="bg-white border border-gray-200 p-6">
                              <h4 className="font-bold text-lg text-black mb-4">Trip Details</h4>
                              <div className="space-y-3 text-sm">
                               
                                
                                {/* Show user's budget if available */}
                                {trip.budget && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Your Budget:</span>
                                    <span className="text-black font-medium">PKR {trip.budget}</span>
                                  </div>
                                )}
                                {/* Show number of people if available */}
                                {trip.numberOfPeople && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">People:</span>
                                    <span className="text-black font-medium">{trip.numberOfPeople}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* User Preferences */}
                            {trip.preferences && (
                              <div className="bg-white border border-gray-200 p-6">
                                <h4 className="font-bold text-lg text-black mb-4">Your Preferences</h4>
                                <p className="text-sm text-gray-600">{trip.preferences}</p>
                              </div>
                            )}

                            {/* Support */}
                            <div className="bg-white border border-gray-200 p-6">
                              <h4 className="font-bold text-lg text-black mb-3">Support</h4>
                              <div className="space-y-2 text-sm text-gray-600">
                                <div>✓ 24/7 Customer Support</div>
                                <div>✓ Free Cancellation</div>
                                <div>✓ Instant Confirmation</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                        <Button
                          variant="outline"
                          className="px-4 py-3 border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-xl font-semibold transition-all duration-300"
                          onClick={() => handleDeleteTrip(trip.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                  </div>
                </Card>
              );
})}
          </div>
          
 } </div>
      )}
      {/* Search and Filter Section (Existing Trips) */}
   

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

      {/* Authentication Required Modal */}
      <AuthRequiredModal
        isOpen={isAuthRequiredModalOpen}
        onClose={() => setIsAuthRequiredModalOpen(false)}
        onSignInClick={() => setIsAuthModalOpen(true)}
        isAuthenticated={isAuthenticated}
        isCustomer={isCustomer}
        userRole={profile?.role}
      />

      {/* Authentication Modal (Sign In/Sign Up) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode="login"
      />
    </div>

    
    <Footer />
    </>
  );
}
