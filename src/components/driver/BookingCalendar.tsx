import React, { useState, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Event, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, isWithinInterval, parseISO } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, Calendar as CalendarIcon, Clock, User, MapPin, Car, X, Filter } from 'lucide-react';

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
    vehicleId: string;
    vehicleName: string;
    tripId: string;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    totalPrice: number;
    notes?: string;
  };
}

interface Booking {
  id: string;
  trip_id: string;
  customer_id: string;
  provider_id: string;
  vehicle_id: string;
  booking_type: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: string;
  created_at: string;
}

interface Vehicle {
  id: string;
  name: string;
  type: string;
}

interface BookingCalendarProps {
  bookings: Booking[];
  vehicles: Vehicle[];
  onBookingClick?: (booking: Booking) => void;
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({
  bookings,
  vehicles,
  onBookingClick,
}) => {
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [vehicleFilter, setVehicleFilter] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<BookingEvent | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Get vehicle name helper
  const getVehicleName = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle?.name || 'Unknown Vehicle';
  };

  // Convert bookings to calendar events
  const events: BookingEvent[] = useMemo(() => {
    return bookings
      .filter(booking => {
        // Apply filters
        if (statusFilter !== 'all' && booking.status !== statusFilter) return false;
        if (vehicleFilter !== 'all' && booking.vehicle_id !== vehicleFilter) return false;

        // Apply search
        if (searchTerm) {
          const vehicleName = getVehicleName(booking.vehicle_id).toLowerCase();
          const searchLower = searchTerm.toLowerCase();
          const matchesSearch =
            vehicleName.includes(searchLower) ||
            booking.id.toLowerCase().includes(searchLower) ||
            booking.customer_id.toLowerCase().includes(searchLower) ||
            booking.trip_id.toLowerCase().includes(searchLower);

          if (!matchesSearch) return false;
        }

        return true;
      })
      .map(booking => {
        const vehicleName = getVehicleName(booking.vehicle_id);

        return {
          id: booking.id,
          title: `${vehicleName} - ${booking.status}`,
          start: parseISO(booking.start_date),
          end: parseISO(booking.end_date),
          resource: {
            bookingId: booking.id,
            customerId: booking.customer_id,
            vehicleId: booking.vehicle_id,
            vehicleName: vehicleName,
            tripId: booking.trip_id,
            status: booking.status as 'pending' | 'confirmed' | 'cancelled' | 'completed',
            totalPrice: booking.total_price,
          },
        };
      });
  }, [bookings, vehicles, searchTerm, statusFilter, vehicleFilter]);

  // Custom event style getter for color coding
  const eventStyleGetter = (event: BookingEvent) => {
    let backgroundColor = '#3174ad';
    let borderColor = '#265985';

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

    return {
      style: {
        backgroundColor,
        borderColor,
        borderWidth: '2px',
        borderStyle: 'solid',
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
    setVehicleFilter('all');
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
              {(searchTerm || statusFilter !== 'all' || vehicleFilter !== 'all') && (
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by vehicle, booking ID, customer..."
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

              {/* Vehicle Filter */}
              <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by vehicle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vehicles</SelectItem>
                  {vehicles.map(vehicle => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 pt-2 border-t">
              <span className="text-sm font-medium text-gray-600">Status Legend:</span>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span className="text-sm">Pending</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm">Confirmed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-indigo-500 rounded"></div>
                <span className="text-sm">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
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
                  `${event.resource.vehicleName} - ${event.resource.status.toUpperCase()}`
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
              <CalendarIcon className="h-5 w-5" />
              Booking Details
            </DialogTitle>
            <DialogDescription>
              Complete information about this booking
            </DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{selectedEvent.resource.vehicleName}</h3>
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

              {/* Booking Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <Clock className="h-4 w-4" />
                      <span>Start Date & Time</span>
                    </div>
                    <div className="text-lg font-medium">
                      {format(selectedEvent.start, 'PPP p')}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <Clock className="h-4 w-4" />
                      <span>End Date & Time</span>
                    </div>
                    <div className="text-lg font-medium">
                      {format(selectedEvent.end, 'PPP p')}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <Car className="h-4 w-4" />
                      <span>Vehicle</span>
                    </div>
                    <div className="text-lg font-medium">
                      {selectedEvent.resource.vehicleName}
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
                  <span className="text-sm font-medium text-blue-900">Duration</span>
                  <span className="text-lg font-bold text-blue-700">
                    {Math.ceil((selectedEvent.end.getTime() - selectedEvent.start.getTime()) / (1000 * 60 * 60))} hours
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
                    <Button variant="destructive">
                      Decline
                    </Button>
                    <Button className="bg-green-600 hover:bg-green-700">
                      Accept Booking
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
