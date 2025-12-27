export interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'driver' | 'hotel' | 'admin';
  phone?: string;
  address?: string;
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

// Database Hotel interface (matches the hotels table)
export interface Hotel {
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

// Database Hotel Room interface (matches the hotel_rooms table)
export interface HotelRoom {
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

// Legacy Hotel interface for backward compatibility
export interface HotelLegacy extends User {
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

export interface ItinerarySlot {
  id: number;
  startTime: string;
  endTime: string;
  activity: string;
  transportNeeded: boolean;
  notes: string;
}

export interface ItineraryDay {
  date: string;
  slots: ItinerarySlot[];
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
  carType?: string;
  itinerary: ItineraryDay[];
  status: 'draft' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: string;
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

// Vehicle interface (matches the vehicles table)
export interface Vehicle {
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

// Pricing interfaces for vendors
export interface HotelRoomPricing {
  id: string;
  room_id: string;
  off_season_months: number[];
  off_season_price: number | null;
  on_season_months: number[];
  on_season_price: number | null;
  closed_months: number[];
  last_minute_enabled: boolean;
  last_minute_days_before: number | null;
  last_minute_discount_price: number | null;
  created_at: string;
  updated_at: string;
}

export interface VehiclePricing {
  id: string;
  vehicle_id: string;
  off_season_months: number[];
  off_season_price: number | null;
  on_season_months: number[];
  on_season_price: number | null;
  closed_months: number[];
  last_minute_enabled: boolean;
  last_minute_days_before: number | null;
  last_minute_discount_price: number | null;
  created_at: string;
  updated_at: string;
}