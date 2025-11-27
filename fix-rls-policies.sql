-- Fix RLS Policies for Custom Authentication System
-- This app uses custom authentication with localStorage, not Supabase Auth
-- So we need to disable RLS or use permissive policies

-- ============================================
-- IMPORTANT: Run this script in Supabase SQL Editor
-- ============================================

-- Option 1: Disable RLS for all tables (RECOMMENDED for custom auth)
-- ============================================
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE destinations DISABLE ROW LEVEL SECURITY;
ALTER TABLE hotels DISABLE ROW LEVEL SECURITY;
ALTER TABLE hotel_rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles DISABLE ROW LEVEL SECURITY;
ALTER TABLE trips DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;

-- ============================================
-- Option 2: If you MUST have RLS enabled, use permissive policies
-- Comment out the above section and uncomment this section:
-- ============================================

-- -- Enable RLS on all tables
-- ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE hotel_rooms ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- -- Drop all existing policies
-- DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
-- DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
-- DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
-- DROP POLICY IF EXISTS "Anyone can view destinations" ON destinations;
-- DROP POLICY IF EXISTS "Anyone can view hotels" ON hotels;
-- DROP POLICY IF EXISTS "Anyone can view hotel rooms" ON hotel_rooms;
-- DROP POLICY IF EXISTS "Anyone can view vehicles" ON vehicles;
-- DROP POLICY IF EXISTS "Users can view their own trips" ON trips;
-- DROP POLICY IF EXISTS "Users can insert their own trips" ON trips;
-- DROP POLICY IF EXISTS "Users can update their own trips" ON trips;
-- DROP POLICY IF EXISTS "Customers can view their own bookings" ON bookings;
-- DROP POLICY IF EXISTS "Customers can insert their own bookings" ON bookings;
-- DROP POLICY IF EXISTS "Drivers can view their vehicle bookings" ON bookings;
-- DROP POLICY IF EXISTS "Hotel owners can view their room bookings" ON bookings;
-- DROP POLICY IF EXISTS "Providers can update booking status" ON bookings;
-- DROP POLICY IF EXISTS "Admins can view all bookings" ON bookings;
-- DROP POLICY IF EXISTS "Admins can manage all bookings" ON bookings;

-- -- Create permissive policies that allow all operations
-- -- (Since authentication is handled in the application layer)

-- -- User Profiles: Allow all operations
-- CREATE POLICY "Allow all on user_profiles" ON user_profiles
--     FOR ALL USING (true) WITH CHECK (true);

-- -- Destinations: Public read, admin write
-- CREATE POLICY "Allow read on destinations" ON destinations
--     FOR SELECT USING (true);

-- CREATE POLICY "Allow write on destinations" ON destinations
--     FOR ALL USING (true) WITH CHECK (true);

-- -- Hotels: Public read, owner write
-- CREATE POLICY "Allow read on hotels" ON hotels
--     FOR SELECT USING (true);

-- CREATE POLICY "Allow write on hotels" ON hotels
--     FOR ALL USING (true) WITH CHECK (true);

-- -- Hotel Rooms: Public read, owner write
-- CREATE POLICY "Allow read on hotel_rooms" ON hotel_rooms
--     FOR SELECT USING (true);

-- CREATE POLICY "Allow write on hotel_rooms" ON hotel_rooms
--     FOR ALL USING (true) WITH CHECK (true);

-- -- Vehicles: Public read, driver write
-- CREATE POLICY "Allow read on vehicles" ON vehicles
--     FOR SELECT USING (true);

-- CREATE POLICY "Allow write on vehicles" ON vehicles
--     FOR ALL USING (true) WITH CHECK (true);

-- -- Trips: Allow all operations
-- CREATE POLICY "Allow all on trips" ON trips
--     FOR ALL USING (true) WITH CHECK (true);

-- -- Bookings: Allow all operations
-- CREATE POLICY "Allow all on bookings" ON bookings
--     FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- Verify RLS status (run after applying changes)
-- ============================================
SELECT
    tablename,
    rowsecurity as "RLS Enabled"
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('user_profiles', 'destinations', 'hotels', 'hotel_rooms', 'vehicles', 'trips', 'bookings')
ORDER BY tablename;

-- Check existing policies
SELECT
    tablename,
    policyname,
    permissive,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
