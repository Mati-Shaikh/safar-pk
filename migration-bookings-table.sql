-- Migration script to update bookings table structure
-- Run this in your Supabase SQL Editor

-- Drop existing bookings table if it exists (only if you don't have important data)
DROP TABLE IF EXISTS bookings CASCADE;

-- Create bookings table with correct schema
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    hotel_room_id UUID REFERENCES hotel_rooms(id) ON DELETE SET NULL,
    booking_type TEXT NOT NULL CHECK (booking_type IN ('vehicle', 'hotel_room')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- IMPORTANT: Since this app uses custom authentication (not Supabase Auth),
-- we need to DISABLE Row Level Security OR use permissive policies
-- Option 1: Disable RLS (simpler for custom auth)
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;

-- Option 2: If you want RLS, use permissive policies that allow all authenticated users
-- Comment out the line above and uncomment the section below:

-- ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
--
-- -- Allow all operations for now (you can add more specific policies later)
-- CREATE POLICY "Allow all for authenticated users" ON bookings
--     FOR ALL
--     USING (true)
--     WITH CHECK (true);
--
-- -- Or if you want to add specific policies based on custom auth:
-- -- 1. Customers can view their own bookings
-- CREATE POLICY "Customers can view their own bookings" ON bookings
--     FOR SELECT
--     USING (true);  -- Allow all since we handle auth in application layer
--
-- -- 2. Customers can insert their own bookings
-- CREATE POLICY "Customers can insert their own bookings" ON bookings
--     FOR INSERT
--     WITH CHECK (true);  -- Allow all since we handle auth in application layer
--
-- -- 3. Allow all updates and deletes
-- CREATE POLICY "Allow all updates" ON bookings
--     FOR UPDATE
--     USING (true);
--
-- CREATE POLICY "Allow all deletes" ON bookings
--     FOR DELETE
--     USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bookings_trip_id ON bookings(trip_id);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_provider_id ON bookings(provider_id);
CREATE INDEX IF NOT EXISTS idx_bookings_vehicle_id ON bookings(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_bookings_hotel_room_id ON bookings(hotel_room_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(start_date, end_date);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample bookings (optional - remove if not needed)
-- Make sure to replace these UUIDs with actual IDs from your database

-- Example vehicle booking
-- INSERT INTO bookings (trip_id, customer_id, provider_id, vehicle_id, booking_type, start_date, end_date, total_price, status)
-- VALUES (
--     'your-trip-id-here',
--     'your-customer-id-here',
--     'your-driver-id-here',
--     'your-vehicle-id-here',
--     'vehicle',
--     '2024-12-01',
--     '2024-12-05',
--     15000.00,
--     'pending'
-- );

-- Example hotel room booking
-- INSERT INTO bookings (trip_id, customer_id, provider_id, hotel_room_id, booking_type, start_date, end_date, total_price, status)
-- VALUES (
--     'your-trip-id-here',
--     'your-customer-id-here',
--     'your-hotel-id-here',
--     'your-room-id-here',
--     'hotel_room',
--     '2024-12-01',
--     '2024-12-05',
--     12000.00,
--     'pending'
-- );
