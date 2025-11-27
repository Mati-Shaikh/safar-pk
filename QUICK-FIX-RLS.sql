-- ============================================
-- QUICK FIX: Disable RLS on all tables
-- Copy and paste this into Supabase SQL Editor and run it
-- This will fix the 401/400 errors immediately
-- ============================================

-- Disable Row Level Security on all tables
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE destinations DISABLE ROW LEVEL SECURITY;
ALTER TABLE hotels DISABLE ROW LEVEL SECURITY;
ALTER TABLE hotel_rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles DISABLE ROW LEVEL SECURITY;
ALTER TABLE trips DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled (should show false for all tables)
SELECT
    tablename,
    rowsecurity as "RLS Enabled (should be false)"
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('user_profiles', 'destinations', 'hotels', 'hotel_rooms', 'vehicles', 'trips', 'bookings')
ORDER BY tablename;
