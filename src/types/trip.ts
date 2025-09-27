export interface Room {
  id: string;
  type: string;
  description: string;
  price: string;
  capacity: number;
  amenities: string[];
  images: string[];
  available: boolean;
}

export interface HotelWithRooms {
  name: string;
  rooms: Room[];
}

export interface ItinerarySlot {
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

export interface ItineraryDay {
  date: string;
  slots: ItinerarySlot[];
}

export interface Car {
  id: string;
  name: string;
  type: string;
  seats: number;
  pricePerDay: string;
  images: string[];
  features: string[];
  description: string;
}

export interface TripForm {
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

export interface Trip {
  id: number;
  name: string;
  description: string;
  duration?: string;
  price?: string;
  image?: string;
  destinations?: string[];
  highlights?: string[];
  difficulty?: string;
  groupSize?: string;
  rating?: number;
  reviews?: number;
  category?: string;
  // Supabase fields
  user_id?: string;
  start_date?: string;
  end_date?: string;
  budget?: number;
  created_at?: string;
  updated_at?: string;
}

export const CAR_TYPES = ["Sedan", "SUV", "Van", "Coaster", "4WD"];
export const TRIP_CATEGORIES = ["All", "Adventure", "Cultural", "Desert", "Nature", "Trekking"];