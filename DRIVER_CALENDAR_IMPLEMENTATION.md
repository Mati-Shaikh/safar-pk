# Driver Dashboard Calendar Implementation

## Overview
This document describes the implementation of an interactive booking calendar for the Driver Dashboard. The calendar provides a visual, color-coded view of all vehicle bookings with advanced search and filtering capabilities.

## Features Implemented

### 1. **Interactive Calendar View**
- **Library**: `react-big-calendar` with `date-fns` for date handling
- **Views**: Month, Week, Day, and Agenda views
- **Real-time Updates**: Automatic refresh when bookings change

### 2. **Color-Coded Booking Status**
Bookings are color-coded by status for easy visual identification:

| Status | Color | Hex Code |
|--------|-------|----------|
| Pending | Orange | #f59e0b |
| Confirmed | Green | #10b981 |
| Completed | Indigo | #6366f1 |
| Cancelled | Red | #ef4444 |

### 3. **Advanced Search & Filtering**

#### Search Capabilities
- Search by vehicle name
- Search by booking ID
- Search by customer ID
- Search by trip ID
- Real-time search results

#### Filter Options
1. **Status Filter**:
   - All Statuses
   - Pending
   - Confirmed
   - Completed
   - Cancelled

2. **Vehicle Filter**:
   - All Vehicles
   - Individual vehicle selection

### 4. **Statistics Dashboard**
Real-time stats for current calendar view:
- Total bookings count
- Pending requests count
- Confirmed trips count
- Completed trips count
- Total revenue from confirmed and completed bookings

### 5. **Interactive Event Details**
Click on any calendar event to see:
- Vehicle name
- Customer information
- Trip details
- Start and end date/time
- Total price
- Booking status
- Duration calculation
- Action buttons (for pending bookings)

### 6. **Responsive Design**
- Mobile-friendly layout
- Adaptive calendar views
- Touch-friendly event selection

## Component Structure

### Main Components

#### 1. `BookingCalendar.tsx`
Located at: `/src/components/driver/BookingCalendar.tsx`

**Props**:
```typescript
interface BookingCalendarProps {
  bookings: Booking[];
  vehicles: Vehicle[];
  onBookingClick?: (booking: Booking) => void;
}
```

**Features**:
- Event transformation from bookings to calendar events
- Custom event styling based on status
- Search and filter logic
- Stats calculation
- Event detail modal

#### 2. Updated `DriverDashboard.tsx`
Located at: `/src/pages/DriverDashboard.tsx`

**New Features**:
- Calendar tab integration
- Booking data fetching from Supabase
- Real-time stats calculation
- Booking status update handlers

### Database Functions

Added to `/src/lib/supabase.ts`:

```typescript
// Get all bookings for a provider (driver or hotel owner)
export const getBookingsByProvider = async (providerId: string)

// Get only vehicle bookings for a driver
export const getVehicleBookingsByDriver = async (driverId: string)
```

## Usage

### For Drivers

1. **Navigate to Driver Dashboard**
2. **Select "Calendar View" Tab**
3. **View Bookings**:
   - Color-coded events on calendar
   - Click events for details
   - Use different calendar views (Month/Week/Day/Agenda)

4. **Search & Filter**:
   - Use search box to find specific bookings
   - Filter by status or vehicle
   - Clear all filters with one click

5. **Manage Bookings**:
   - Click pending bookings to accept/decline
   - View confirmed and completed bookings
   - Track earnings and statistics

### Calendar Navigation

- **Month View**: Shows all bookings for the month
- **Week View**: Shows weekly schedule
- **Day View**: Shows detailed day schedule with time slots
- **Agenda View**: List view of all bookings in date order

### Keyboard Navigation

- Arrow keys: Navigate dates
- Page Up/Down: Navigate months (in month view)
- Home/End: Go to first/last date of current view

## Technical Details

### Event Transformation

Bookings are transformed into calendar events:

```typescript
{
  id: booking.id,
  title: `${vehicleName} - ${status}`,
  start: parseISO(booking.start_date),
  end: parseISO(booking.end_date),
  resource: {
    bookingId: booking.id,
    customerId: booking.customer_id,
    vehicleId: booking.vehicle_id,
    vehicleName: vehicleName,
    tripId: booking.trip_id,
    status: booking.status,
    totalPrice: booking.total_price,
  }
}
```

### Styling

Custom CSS in `/src/components/driver/booking-calendar.css`:
- Calendar theme customization
- Responsive breakpoints
- Event hover effects
- Status-based colors
- Toolbar styling

### Performance Optimizations

1. **useMemo** for expensive calculations:
   - Event transformation
   - Statistics calculation
   - Filtering operations

2. **Efficient Filtering**:
   - Combined filter logic in single pass
   - Early return for non-matching items

3. **Lazy Loading**:
   - Bookings loaded only when dashboard mounts
   - Vehicles cached after first load

## Data Flow

```
User Actions
    ↓
DriverDashboard
    ↓
getVehicleBookingsByDriver() ← Supabase
    ↓
Transform to Calendar Events
    ↓
BookingCalendar Component
    ↓
react-big-calendar
    ↓
User Interaction (Click Event)
    ↓
Event Detail Modal
    ↓
Accept/Decline Actions
    ↓
updateBookingStatus() → Supabase
    ↓
Reload Bookings
```

## Color Legend

The calendar includes a visual legend showing:
- 🟠 Pending - Awaiting driver confirmation
- 🟢 Confirmed - Driver accepted, trip scheduled
- 🟣 Completed - Trip finished successfully
- 🔴 Cancelled - Booking cancelled

## Future Enhancements

Potential improvements:
1. **Drag & Drop**: Reschedule bookings by dragging
2. **Conflict Detection**: Highlight overlapping bookings
3. **Export**: Export calendar to PDF or iCal
4. **Notifications**: Real-time push notifications for new bookings
5. **Recurring Bookings**: Support for recurring trips
6. **Multi-Vehicle View**: Color-code by vehicle, not just status
7. **Availability Management**: Set availability/unavailable periods
8. **Integration with Maps**: Show pickup locations
9. **Customer Profiles**: Quick view customer history
10. **Revenue Forecasting**: Predict earnings based on bookings

## Testing Checklist

### Calendar Display
- [ ] Month view shows all events correctly
- [ ] Week view displays time slots properly
- [ ] Day view shows detailed schedule
- [ ] Agenda view lists events in order
- [ ] Colors match booking status
- [ ] Today's date is highlighted

### Interactivity
- [ ] Click event opens detail modal
- [ ] Modal shows correct booking information
- [ ] Accept button updates status to confirmed
- [ ] Decline button updates status to cancelled
- [ ] Close button dismisses modal

### Search & Filter
- [ ] Search finds bookings by vehicle name
- [ ] Search finds bookings by booking ID
- [ ] Status filter shows only selected status
- [ ] Vehicle filter shows only selected vehicle
- [ ] Clear filters button resets all filters
- [ ] Multiple filters work together

### Stats
- [ ] Total bookings count is accurate
- [ ] Pending count matches filtered events
- [ ] Confirmed count matches filtered events
- [ ] Revenue calculation includes only confirmed/completed
- [ ] Stats update when changing calendar view

### Responsive Design
- [ ] Calendar displays correctly on mobile
- [ ] Touch events work on tablets
- [ ] Filters stack vertically on small screens
- [ ] Modal is scrollable on small screens

## Troubleshooting

### Calendar Not Showing Events
1. Check if bookings are being fetched: Look for console errors
2. Verify date format: Ensure dates are valid ISO strings
3. Check filters: Make sure filters aren't hiding events

### Colors Not Showing Correctly
1. Verify CSS import in DriverDashboard.tsx
2. Check booking status values match expected values
3. Clear browser cache

### Search Not Working
1. Check search term is trimming whitespace
2. Verify vehicle names are being fetched
3. Ensure case-insensitive comparison

### Performance Issues
1. Limit date range for large datasets
2. Implement pagination for bookings
3. Use virtualization for large event lists

## API Reference

### BookingCalendar Component

```typescript
<BookingCalendar
  bookings={driverBookings}        // Array of booking objects
  vehicles={vehicles}              // Array of vehicle objects
  onBookingClick={(booking) => {}} // Optional callback when booking clicked
/>
```

### Booking Object Structure

```typescript
interface Booking {
  id: string;
  trip_id: string;
  customer_id: string;
  provider_id: string;
  vehicle_id: string;
  booking_type: string;
  start_date: string;  // ISO format
  end_date: string;    // ISO format
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
}
```

## Dependencies

```json
{
  "react-big-calendar": "^1.x.x",
  "date-fns": "^3.x.x"
}
```

## Browser Compatibility

- Chrome: ✅ Latest 2 versions
- Firefox: ✅ Latest 2 versions
- Safari: ✅ Latest 2 versions
- Edge: ✅ Latest 2 versions
- Mobile Safari: ✅ iOS 12+
- Mobile Chrome: ✅ Android 8+

## Accessibility

- Keyboard navigation supported
- Screen reader friendly
- ARIA labels on interactive elements
- Focus indicators visible
- Color contrast meets WCAG AA standards

## License

Part of Safar Pakistan project - All rights reserved
