export interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'driver' | 'hotel' | 'admin';
  createdAt: string;
}

export interface Customer extends User {
  role: 'customer';
  phone?: string;
  preferences?: string[];
}

export interface Driver extends User {
  role: 'driver';
  vehicleType: string;
  vehicleModel: string;
  licenseNumber: string;
  rating: number;
  isAvailable: boolean;
  pricePerDay: number;
}

export interface Hotel extends User {
  role: 'hotel';
  hotelName: string;
  location: string;
  description: string;
  amenities: string[];
  roomTypes: RoomType[];
  images: string[];
  rating: number;
}

export interface RoomType {
  id: string;
  name: string;
  price: number;
  capacity: number;
  available: number;
}

export interface Destination {
  id: string;
  name: string;
  region: string;
  description: string;
  images: string[];
  attractions: string[];
  weather: string;
  popularity: number;
}

export interface Trip {
  id: string;
  customerId: string;
  name: string;
  destinations: string[];
  numberOfPeople: number;
  startDate: string;
  endDate: string;
  hotelId?: string;
  driverId?: string;
  needsCar: boolean;
  itinerary: ItineraryItem[];
  status: 'draft' | 'booked' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface ItineraryItem {
  id: string;
  day: number;
  time: string;
  activity: string;
  location: string;
}

export interface Booking {
  id: string;
  tripId: string;
  customerId: string;
  type: 'hotel' | 'car';
  providerId: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'completed';
  startDate: string;
  endDate: string;
  totalPrice: number;
  createdAt: string;
}