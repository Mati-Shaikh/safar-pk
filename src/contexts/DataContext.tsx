import React, { createContext, useContext, useState, useEffect } from 'react';
import { Destination, Hotel, Driver, Trip, Booking } from '@/types';

interface DataContextType {
  destinations: Destination[];
  hotels: Hotel[];
  drivers: Driver[];
  trips: Trip[];
  bookings: Booking[];
  addTrip: (trip: Omit<Trip, 'id' | 'createdAt'>) => void;
  updateTrip: (id: string, updates: Partial<Trip>) => void;
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => void;
  updateBooking: (id: string, updates: Partial<Booking>) => void;
  initializeData: () => void;
}

const DataContext = createContext<DataContextType | null>(null);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

const mockDestinations: Destination[] = [
  {
    id: '1',
    name: 'Hunza Valley',
    region: 'Gilgit-Baltistan',
    description: 'Beautiful valley known for its stunning mountain views and apricot blossoms.',
    images: ['/placeholder.svg'],
    attractions: ['Karimabad', 'Altit Fort', 'Baltit Fort', 'Attabad Lake'],
    weather: 'Cold winters, mild summers',
    popularity: 95
  },
  {
    id: '2',
    name: 'Skardu',
    region: 'Gilgit-Baltistan',
    description: 'Gateway to K2 and other mighty peaks of Karakoram range.',
    images: ['/placeholder.svg'],
    attractions: ['Shangrila Resort', 'Deosai Plains', 'Sheosar Lake'],
    weather: 'Alpine climate',
    popularity: 90
  },
  {
    id: '3',
    name: 'Swat Valley',
    region: 'Khyber Pakhtunkhwa',
    description: 'Switzerland of Pakistan with lush green valleys and beautiful lakes.',
    images: ['/placeholder.svg'],
    attractions: ['Kalam', 'Mingora', 'Ushu Forest', 'Mahodand Lake'],
    weather: 'Temperate climate',
    popularity: 85
  }
];

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const initializeData = () => {
    // Initialize with mock data if not exists
    const storedDestinations = localStorage.getItem('safarpk_destinations');
    if (!storedDestinations) {
      localStorage.setItem('safarpk_destinations', JSON.stringify(mockDestinations));
      setDestinations(mockDestinations);
    } else {
      setDestinations(JSON.parse(storedDestinations));
    }

    // Load other data
    setHotels(JSON.parse(localStorage.getItem('safarpk_hotels') || '[]'));
    setDrivers(JSON.parse(localStorage.getItem('safarpk_drivers') || '[]'));
    setTrips(JSON.parse(localStorage.getItem('safarpk_trips') || '[]'));
    setBookings(JSON.parse(localStorage.getItem('safarpk_bookings') || '[]'));
  };

  const addTrip = (tripData: Omit<Trip, 'id' | 'createdAt'>) => {
    const newTrip: Trip = {
      ...tripData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    const updatedTrips = [...trips, newTrip];
    setTrips(updatedTrips);
    localStorage.setItem('safarpk_trips', JSON.stringify(updatedTrips));
  };

  const updateTrip = (id: string, updates: Partial<Trip>) => {
    const updatedTrips = trips.map(trip => 
      trip.id === id ? { ...trip, ...updates } : trip
    );
    setTrips(updatedTrips);
    localStorage.setItem('safarpk_trips', JSON.stringify(updatedTrips));
  };

  const addBooking = (bookingData: Omit<Booking, 'id' | 'createdAt'>) => {
    const newBooking: Booking = {
      ...bookingData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    const updatedBookings = [...bookings, newBooking];
    setBookings(updatedBookings);
    localStorage.setItem('safarpk_bookings', JSON.stringify(updatedBookings));
  };

  const updateBooking = (id: string, updates: Partial<Booking>) => {
    const updatedBookings = bookings.map(booking => 
      booking.id === id ? { ...booking, ...updates } : booking
    );
    setBookings(updatedBookings);
    localStorage.setItem('safarpk_bookings', JSON.stringify(updatedBookings));
  };

  useEffect(() => {
    initializeData();
  }, []);

  return (
    <DataContext.Provider value={{
      destinations,
      hotels,
      drivers,
      trips,
      bookings,
      addTrip,
      updateTrip,
      addBooking,
      updateBooking,
      initializeData
    }}>
      {children}
    </DataContext.Provider>
  );
};