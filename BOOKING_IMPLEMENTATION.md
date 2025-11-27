# Booking Implementation Documentation

## Overview
This document explains how bookings are automatically created when users create trips with activities that include vehicles and hotel rooms.

## Implementation Details

### 1. Database Schema
The bookings table has the following key columns:
- `trip_id`: UUID reference to the trips table
- `customer_id`: UUID reference to the user who made the booking
- `provider_id`: UUID reference to the service provider (driver for vehicles, hotel owner for rooms)
- `vehicle_id`: UUID reference to vehicles table (null for hotel bookings)
- `hotel_room_id`: UUID reference to hotel_rooms table (null for vehicle bookings)
- `booking_type`: Either 'vehicle' or 'hotel_room'
- `start_date`: Timestamp for booking start
- `end_date`: Timestamp for booking end
- `total_price`: Decimal price for the booking
- `status`: Booking status (pending, confirmed, cancelled, completed)

### 2. Helper Functions in `src/lib/supabase.ts`

#### `getVehicleOwnerId(vehicleId: string)`
Fetches the driver_id (provider_id) for a given vehicle.

```typescript
const { data: driverId } = await getVehicleOwnerId(vehicleId);
```

#### `getHotelOwnerIdFromRoom(roomId: string)`
Fetches the hotel owner_id (provider_id) for a given hotel room.
Uses a nested query to join hotel_rooms with hotels table.

```typescript
const { data: hotelOwnerId } = await getHotelOwnerIdFromRoom(roomId);
```

#### `createBookingsFromItinerary(tripId, customerId, itinerary)`
Main function that processes the entire trip itinerary and creates bookings for:
- All activities with `transportNeeded = true` and a selected vehicle
- All activities with `hotelRoomNeeded = true` and a selected room

**Process for each activity slot:**

1. **Vehicle Bookings:**
   - Extract vehicle ID from `slot.selectedCar.id`
   - Fetch driver_id using `getVehicleOwnerId()`
   - Parse price from format "PKR 8,000" to numeric value
   - Create booking with:
     - `start_date`: Day date + slot start time (e.g., "2024-12-25T09:00:00")
     - `end_date`: Day date + slot end time (e.g., "2024-12-25T17:00:00")
     - `booking_type`: 'vehicle'

2. **Hotel Room Bookings:**
   - Extract room ID from `slot.selectedRoom.id`
   - Fetch owner_id using `getHotelOwnerIdFromRoom()`
   - Parse price from format "PKR 25,000" to numeric value
   - Create booking with:
     - `start_date`: Day date + slot start time
     - `end_date`: Day date + end of day (23:59:59)
     - `booking_type`: 'hotel_room'

**Return Value:**
```typescript
{
  bookings: Array<Booking>,  // Successfully created bookings
  errors: Array<{            // Failed booking attempts
    type: 'vehicle' | 'hotel',
    slot: number,
    error: string
  }>,
  success: boolean           // true if no errors
}
```

### 3. Integration in TripPage.tsx

The booking creation is integrated into the `handleCreateTrip()` function:

```typescript
// After creating the trip
const bookingResult = await createBookingsFromItinerary(
  data.id,      // trip_id
  user.id,      // customer_id
  tripForm.itinerary
);

// Handle results
if (bookingResult.errors.length > 0) {
  console.warn('Some bookings failed:', bookingResult.errors);
}
```

### 4. User Flow

1. User creates a custom trip with dates and activities
2. For each activity, user can optionally:
   - Select "Transportation Required" and choose a vehicle
   - Select "Hotel Room" and choose a hotel + specific room
3. User reviews the trip in step 3
4. User clicks "Create My Trip"
5. System creates:
   - Trip record in `trips` table
   - Booking records in `bookings` table for each activity with vehicle/room

### 5. Price Extraction

Prices are stored in UI format (e.g., "PKR 8,000" or "PKR 25,000") and need to be parsed:

```typescript
const priceMatch = priceString.match(/[\d,]+/);
const numericPrice = priceMatch ? parseFloat(priceMatch[0].replace(/,/g, '')) : 0;
```

### 6. Date/Time Format

Bookings use ISO 8601 timestamp format:
- Format: `YYYY-MM-DDTHH:mm:ss`
- Example: `2024-12-25T09:00:00`

### 7. Error Handling

The implementation is fault-tolerant:
- Trip creation succeeds even if some bookings fail
- Errors are logged to console
- User receives notification about partial failures
- Each booking failure is tracked with details (type, slot ID, error message)

### 8. Provider ID Mapping

The `provider_id` field maps to:
- **For vehicles:** `vehicles.driver_id` → User profile of the driver
- **For hotel rooms:** `hotel_rooms → hotels.owner_id` → User profile of the hotel owner

This allows providers to query their bookings:
```sql
SELECT * FROM bookings WHERE provider_id = 'current_user_id';
```

### 9. Testing

To test the implementation:

1. Create test data:
   - Add vehicles with a driver user profile
   - Add hotels with an owner user profile
   - Add hotel rooms linked to hotels

2. Create a trip:
   - Select dates
   - Add activities with time ranges
   - Select vehicles for some activities
   - Select hotel rooms for some activities

3. Verify bookings:
   - Check `bookings` table for new records
   - Verify `provider_id` matches vehicle driver or hotel owner
   - Verify date/time ranges match activity slots
   - Verify prices are correctly parsed

### 10. Future Enhancements

Potential improvements:
- Add booking confirmation workflow
- Send notifications to providers when bookings are created
- Add availability checking before creating bookings
- Calculate total trip cost from all bookings
- Add payment integration
- Support multi-day vehicle rentals (calculate price accordingly)
- Support check-in/check-out times for hotels

## Database Queries for Verification

### View all bookings for a trip
```sql
SELECT * FROM bookings WHERE trip_id = 'trip_uuid';
```

### View bookings by provider
```sql
SELECT
  b.*,
  t.name as trip_name,
  up.full_name as customer_name
FROM bookings b
JOIN trips t ON b.trip_id = t.id
JOIN user_profiles up ON b.customer_id = up.id
WHERE b.provider_id = 'provider_uuid'
ORDER BY b.start_date;
```

### View vehicle bookings with details
```sql
SELECT
  b.*,
  v.name as vehicle_name,
  up.full_name as driver_name
FROM bookings b
JOIN vehicles v ON b.vehicle_id = v.id
JOIN user_profiles up ON b.provider_id = up.id
WHERE b.booking_type = 'vehicle';
```

### View hotel bookings with details
```sql
SELECT
  b.*,
  hr.type as room_type,
  h.name as hotel_name,
  up.full_name as owner_name
FROM bookings b
JOIN hotel_rooms hr ON b.hotel_room_id = hr.id
JOIN hotels h ON hr.hotel_id = h.id
JOIN user_profiles up ON b.provider_id = up.id
WHERE b.booking_type = 'hotel_room';
```
