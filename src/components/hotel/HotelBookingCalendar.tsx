import React, { useState, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Event, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, isWithinInterval, parseISO, addDays } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, Calendar as CalendarIcon, Clock, User, MapPin, Bed, X, Building, Plus, CreditCard, Phone as PhoneIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

// Setup date-fns localizer for react-big-calendar
const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface BookingEvent extends Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    bookingId: string;
    customerId: string;
    customerName?: string;
    hotelRoomId: string;
    roomType: string;
    hotelName: string;
    tripId: string;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    totalPrice: number;
    notes?: string;
    isOfflineBooking?: boolean;
    offlineCustomerName?: string;
    offlineCnic?: string;
    offlinePhone?: string;
  };
}

interface Booking {
  id: string;
  trip_id: string;
  customer_id: string;
  provider_id: string;
  hotel_room_id: string;
  booking_type: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: string;
  created_at: string;
  is_offline_booking?: boolean;
  offline_customer_name?: string;
  offline_cnic?: string;
  offline_phone?: string;
}

interface HotelRoom {
  id: string;
  hotel_id: string;
  type: string;
  description?: string;
  price_per_night: number;
  capacity: number;
  available: boolean;
}

interface Hotel {
  id: string;
  name: string;
  location: string;
}

interface HotelBookingCalendarProps {
  bookings: Booking[];
  hotels: Hotel[];
  rooms: { [hotelId: string]: HotelRoom[] };
  onBookingClick?: (booking: Booking) => void;
  onBookingUpdate?: (bookingId: string, status: string) => void;
}

export const HotelBookingCalendar: React.FC<HotelBookingCalendarProps> = ({
  bookings,
  hotels,
  rooms,
  onBookingClick,
  onBookingUpdate,
}) => {
  const { user } = useAuth();
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [hotelFilter, setHotelFilter] = useState<string>('all');
  const [roomTypeFilter, setRoomTypeFilter] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<BookingEvent | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // Offline booking state
  const [isOfflineBookingOpen, setIsOfflineBookingOpen] = useState(false);
  const [offlineBookingData, setOfflineBookingData] = useState({
    customerName: '',
    cnic: '',
    phone: '',
    duration: '',
    checkInDate: '',
    roomId: '',
  });
  const [offlineBookingLoading, setOfflineBookingLoading] = useState(false);
  const [offlineBookingError, setOfflineBookingError] = useState('');

  // Get all rooms as flat array
  const allRooms = useMemo(() => {
    return Object.values(rooms).flat();
  }, [rooms]);

  // Get room details helper
  const getRoomDetails = (roomId: string) => {
    const room = allRooms.find(r => r.id === roomId);
    if (!room) return { type: 'Unknown Room', hotelName: 'Unknown Hotel', hotelId: '' };

    const hotel = hotels.find(h => h.id === room.hotel_id);
    return {
      type: room.type,
      hotelName: hotel?.name || 'Unknown Hotel',
      hotelId: room.hotel_id,
    };
  };

  // Get unique room types for filter
  const roomTypes = useMemo(() => {
    return [...new Set(allRooms.map(r => r.type))];
  }, [allRooms]);

  // Convert bookings to calendar events
  const events: BookingEvent[] = useMemo(() => {
    return bookings
      .filter(booking => {
        // Apply filters
        if (statusFilter !== 'all' && booking.status !== statusFilter) return false;

        const roomDetails = getRoomDetails(booking.hotel_room_id);

        if (hotelFilter !== 'all' && roomDetails.hotelId !== hotelFilter) return false;
        if (roomTypeFilter !== 'all' && roomDetails.type !== roomTypeFilter) return false;

        // Apply search
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          const matchesSearch =
            roomDetails.type.toLowerCase().includes(searchLower) ||
            roomDetails.hotelName.toLowerCase().includes(searchLower) ||
            booking.id.toLowerCase().includes(searchLower) ||
            booking.customer_id.toLowerCase().includes(searchLower) ||
            (booking.offline_customer_name && booking.offline_customer_name.toLowerCase().includes(searchLower)) ||
            booking.trip_id.toLowerCase().includes(searchLower);

          if (!matchesSearch) return false;
        }

        return true;
      })
      .map(booking => {
        const roomDetails = getRoomDetails(booking.hotel_room_id);
        const isOffline = booking.is_offline_booking === true;
        const displayName = isOffline ? booking.offline_customer_name : 'System Booking';

        return {
          id: booking.id,
          title: `${roomDetails.type}${isOffline ? ' (Offline)' : ''} - ${booking.status}`,
          start: parseISO(booking.start_date),
          end: parseISO(booking.end_date),
          resource: {
            bookingId: booking.id,
            customerId: booking.customer_id,
            hotelRoomId: booking.hotel_room_id,
            roomType: roomDetails.type,
            hotelName: roomDetails.hotelName,
            tripId: booking.trip_id,
            status: booking.status as 'pending' | 'confirmed' | 'cancelled' | 'completed',
            totalPrice: booking.total_price,
            isOfflineBooking: isOffline,
            offlineCustomerName: booking.offline_customer_name,
            offlineCnic: booking.offline_cnic,
            offlinePhone: booking.offline_phone,
          },
        };
      });
  }, [bookings, hotels, rooms, searchTerm, statusFilter, hotelFilter, roomTypeFilter]);

  // Custom event style getter for color coding
  const eventStyleGetter = (event: BookingEvent) => {
    let backgroundColor = '#3174ad';
    let borderColor = '#265985';

    // If it's an offline booking, use purple/violet color scheme
    if (event.resource.isOfflineBooking) {
      switch (event.resource.status) {
        case 'pending':
          backgroundColor = '#a855f7'; // Purple
          borderColor = '#9333ea';
          break;
        case 'confirmed':
          backgroundColor = '#8b5cf6'; // Violet
          borderColor = '#7c3aed';
          break;
        case 'cancelled':
          backgroundColor = '#c084fc'; // Light purple
          borderColor = '#a855f7';
          break;
        case 'completed':
          backgroundColor = '#6366f1'; // Indigo
          borderColor = '#4f46e5';
          break;
      }
    } else {
      // System bookings - original colors
      switch (event.resource.status) {
        case 'pending':
          backgroundColor = '#f59e0b'; // Orange/Yellow
          borderColor = '#d97706';
          break;
        case 'confirmed':
          backgroundColor = '#10b981'; // Green
          borderColor = '#059669';
          break;
        case 'cancelled':
          backgroundColor = '#ef4444'; // Red
          borderColor = '#dc2626';
          break;
        case 'completed':
          backgroundColor = '#6366f1'; // Indigo
          borderColor = '#4f46e5';
          break;
      }
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        borderWidth: '2px',
        borderStyle: event.resource.isOfflineBooking ? 'dashed' : 'solid',
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        fontSize: '0.85rem',
        padding: '2px 4px',
      },
    };
  };

  // Handle event selection
  const handleSelectEvent = (event: BookingEvent) => {
    setSelectedEvent(event);
    setIsDetailModalOpen(true);
  };

  // Get stats for current view
  const stats = useMemo(() => {
    const now = new Date();
    const viewStart = view === 'month'
      ? new Date(date.getFullYear(), date.getMonth(), 1)
      : new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay());
    const viewEnd = view === 'month'
      ? new Date(date.getFullYear(), date.getMonth() + 1, 0)
      : new Date(viewStart.getTime() + 7 * 24 * 60 * 60 * 1000);

    const viewEvents = events.filter(event =>
      isWithinInterval(event.start, { start: viewStart, end: viewEnd }) ||
      isWithinInterval(event.end, { start: viewStart, end: viewEnd })
    );

    return {
      total: viewEvents.length,
      pending: viewEvents.filter(e => e.resource.status === 'pending').length,
      confirmed: viewEvents.filter(e => e.resource.status === 'confirmed').length,
      completed: viewEvents.filter(e => e.resource.status === 'completed').length,
      cancelled: viewEvents.filter(e => e.resource.status === 'cancelled').length,
      revenue: viewEvents
        .filter(e => e.resource.status === 'confirmed' || e.resource.status === 'completed')
        .reduce((sum, e) => sum + e.resource.totalPrice, 0),
    };
  }, [events, date, view]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setHotelFilter('all');
    setRoomTypeFilter('all');
  };

  // Handle booking status update
  const handleStatusUpdate = (status: 'confirmed' | 'cancelled') => {
    if (selectedEvent && onBookingUpdate) {
      onBookingUpdate(selectedEvent.resource.bookingId, status);
      setIsDetailModalOpen(false);
    }
  };

  // Handle offline booking form change
  const handleOfflineBookingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOfflineBookingData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Handle offline booking submission
  const handleOfflineBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOfflineBookingLoading(true);
    setOfflineBookingError('');

    try {
      // Validation
      if (!offlineBookingData.customerName || !offlineBookingData.cnic || 
          !offlineBookingData.phone || !offlineBookingData.duration || 
          !offlineBookingData.checkInDate) {
        setOfflineBookingError('Please fill in all required fields');
        setOfflineBookingLoading(false);
        return;
      }

      const duration = parseInt(offlineBookingData.duration);
      if (isNaN(duration) || duration <= 0) {
        setOfflineBookingError('Duration must be a positive number');
        setOfflineBookingLoading(false);
        return;
      }

      const checkInDate = new Date(offlineBookingData.checkInDate);
      const checkOutDate = addDays(checkInDate, duration);

      // Create offline booking
      const { error } = await supabase.from('bookings').insert({
        trip_id: null, // No trip for offline bookings
        customer_id: user?.id || null, // Link to hotel owner
        provider_id: user?.id || '', // Hotel owner ID
        hotel_room_id: offlineBookingData.roomId && offlineBookingData.roomId !== 'no-room' ? offlineBookingData.roomId : null,
        vehicle_id: null,
        booking_type: 'hotel_room',
        start_date: checkInDate.toISOString().split('T')[0],
        end_date: checkOutDate.toISOString().split('T')[0],
        total_price: 0, // Can be updated later
        status: 'confirmed', // Offline bookings are auto-confirmed
        is_offline_booking: true,
        offline_customer_name: offlineBookingData.customerName,
        offline_cnic: offlineBookingData.cnic,
        offline_phone: offlineBookingData.phone,
      });

      if (error) throw error;

      // Reset form and close modal
      setOfflineBookingData({
        customerName: '',
        cnic: '',
        phone: '',
        duration: '',
        checkInDate: '',
        roomId: '',
      });
      setIsOfflineBookingOpen(false);

      // Refresh the page to show new booking
      window.location.reload();
    } catch (err: any) {
      setOfflineBookingError(err.message || 'Failed to create offline booking');
    } finally {
      setOfflineBookingLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Total Bookings</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Pending</div>
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Confirmed</div>
            <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Completed</div>
            <div className="text-2xl font-bold text-indigo-600">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Revenue</div>
            <div className="text-2xl font-bold text-blue-600">PKR {stats.revenue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Booking Calendar
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={() => setIsOfflineBookingOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Offline Booking
              </Button>
              {(searchTerm || statusFilter !== 'all' || hotelFilter !== 'all' || roomTypeFilter !== 'all') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="flex items-center gap-1"
                >
                  <X className="h-3 w-3" />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search and Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              {/* Hotel Filter */}
              <Select value={hotelFilter} onValueChange={setHotelFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by hotel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Hotels</SelectItem>
                  {hotels.map(hotel => (
                    <SelectItem key={hotel.id} value={hotel.id}>
                      {hotel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Room Type Filter */}
              <Select value={roomTypeFilter} onValueChange={setRoomTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by room type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Room Types</SelectItem>
                  {roomTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 pt-2 border-t">
              <span className="text-sm font-medium text-gray-600">Legend:</span>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded border-2 border-orange-600"></div>
                <span className="text-sm">System - Pending</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded border-2 border-green-600"></div>
                <span className="text-sm">System - Confirmed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-purple-500 rounded border-2 border-purple-600" style={{ borderStyle: 'dashed' }}></div>
                <span className="text-sm">Offline Booking</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-indigo-500 rounded border-2 border-indigo-600"></div>
                <span className="text-sm">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded border-2 border-red-600"></div>
                <span className="text-sm">Cancelled</span>
              </div>
            </div>

            {/* Calendar */}
            <div className="border rounded-lg p-4 bg-white" style={{ height: '600px' }}>
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                view={view}
                onView={setView}
                date={date}
                onNavigate={setDate}
                eventPropGetter={eventStyleGetter}
                onSelectEvent={handleSelectEvent}
                popup
                tooltipAccessor={(event: BookingEvent) =>
                  `${event.resource.roomType} at ${event.resource.hotelName} - ${event.resource.status.toUpperCase()}`
                }
                views={['month', 'week', 'day', 'agenda']}
                style={{ height: '100%' }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Event Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bed className="h-5 w-5" />
              Booking Details {selectedEvent?.resource.isOfflineBooking && <Badge className="bg-purple-500">Offline</Badge>}
            </DialogTitle>
            <DialogDescription>
              {selectedEvent?.resource.isOfflineBooking 
                ? 'Offline booking (outside system)' 
                : 'System booking information'}
            </DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{selectedEvent.resource.roomType}</h3>
                  <p className="text-sm text-gray-600">{selectedEvent.resource.hotelName}</p>
                </div>
                <div className="flex gap-2">
                  {selectedEvent.resource.isOfflineBooking && (
                    <Badge className="bg-purple-500">OFFLINE</Badge>
                  )}
                  <Badge
                    className={`
                      ${selectedEvent.resource.status === 'pending' ? 'bg-orange-500' : ''}
                      ${selectedEvent.resource.status === 'confirmed' ? 'bg-green-500' : ''}
                      ${selectedEvent.resource.status === 'completed' ? 'bg-indigo-500' : ''}
                      ${selectedEvent.resource.status === 'cancelled' ? 'bg-red-500' : ''}
                    `}
                  >
                    {selectedEvent.resource.status.toUpperCase()}
                  </Badge>
                </div>
              </div>

              {/* Offline Customer Info */}
              {selectedEvent.resource.isOfflineBooking && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold text-purple-900 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Offline Customer Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <span className="text-sm text-purple-700">Name:</span>
                      <p className="font-medium">{selectedEvent.resource.offlineCustomerName}</p>
                    </div>
                    <div>
                      <span className="text-sm text-purple-700">CNIC:</span>
                      <p className="font-medium font-mono">{selectedEvent.resource.offlineCnic}</p>
                    </div>
                    <div>
                      <span className="text-sm text-purple-700">Phone:</span>
                      <p className="font-medium">{selectedEvent.resource.offlinePhone}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Booking Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <Clock className="h-4 w-4" />
                      <span>Check-in</span>
                    </div>
                    <div className="text-lg font-medium">
                      {format(selectedEvent.start, 'PPP p')}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <Clock className="h-4 w-4" />
                      <span>Check-out</span>
                    </div>
                    <div className="text-lg font-medium">
                      {format(selectedEvent.end, 'PPP p')}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <Building className="h-4 w-4" />
                      <span>Hotel</span>
                    </div>
                    <div className="text-lg font-medium">
                      {selectedEvent.resource.hotelName}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <User className="h-4 w-4" />
                      <span>Customer ID</span>
                    </div>
                    <div className="text-sm font-mono bg-gray-100 p-2 rounded">
                      {selectedEvent.resource.customerId}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <MapPin className="h-4 w-4" />
                      <span>Trip ID</span>
                    </div>
                    <div className="text-sm font-mono bg-gray-100 p-2 rounded">
                      {selectedEvent.resource.tripId}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <span className="font-medium">💰</span>
                      <span>Total Price</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      PKR {selectedEvent.resource.totalPrice.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Duration */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900">Number of Nights</span>
                  <span className="text-lg font-bold text-blue-700">
                    {Math.ceil((selectedEvent.end.getTime() - selectedEvent.start.getTime()) / (1000 * 60 * 60 * 24))} nights
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
                  Close
                </Button>
                {selectedEvent.resource.status === 'pending' && (
                  <>
                    <Button variant="destructive" onClick={() => handleStatusUpdate('cancelled')}>
                      Decline
                    </Button>
                    <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleStatusUpdate('confirmed')}>
                      Confirm Booking
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Offline Booking Form Modal */}
      <Dialog open={isOfflineBookingOpen} onOpenChange={setIsOfflineBookingOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add Offline Booking
            </DialogTitle>
            <DialogDescription>
              Record a booking made outside the system (walk-in, phone call, etc.)
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleOfflineBookingSubmit} className="space-y-4">
            {offlineBookingError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {offlineBookingError}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="customerName">
                Customer Name <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="customerName"
                  name="customerName"
                  placeholder="Enter customer name"
                  value={offlineBookingData.customerName}
                  onChange={handleOfflineBookingChange}
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnic">
                CNIC Number <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="cnic"
                  name="cnic"
                  placeholder="xxxxx-xxxxxxx-x"
                  value={offlineBookingData.cnic}
                  onChange={handleOfflineBookingChange}
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                Phone Number <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="03XX-XXXXXXX"
                  value={offlineBookingData.phone}
                  onChange={handleOfflineBookingChange}
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="checkInDate">
                  Check-in Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="checkInDate"
                  name="checkInDate"
                  type="date"
                  value={offlineBookingData.checkInDate}
                  onChange={handleOfflineBookingChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">
                  Duration (Days) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  min="1"
                  placeholder="Number of days"
                  value={offlineBookingData.duration}
                  onChange={handleOfflineBookingChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="roomId">
                Room (Optional)
              </Label>
              <Select 
                value={offlineBookingData.roomId} 
                onValueChange={(value) => setOfflineBookingData(prev => ({ ...prev, roomId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a room (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-room">No specific room</SelectItem>
                  {allRooms.map(room => {
                    const hotel = hotels.find(h => h.id === room.hotel_id);
                    return (
                      <SelectItem key={room.id} value={room.id}>
                        {hotel?.name} - {room.type}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <p className="text-sm text-purple-800">
                💡 Offline bookings are automatically marked as <strong>confirmed</strong> and 
                will be displayed with a <strong>purple/dashed border</strong> in the calendar.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsOfflineBookingOpen(false);
                  setOfflineBookingError('');
                }}
                disabled={offlineBookingLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700"
                disabled={offlineBookingLoading}
              >
                {offlineBookingLoading ? 'Creating...' : 'Create Offline Booking'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
