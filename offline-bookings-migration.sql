-- Migration to add offline booking support to bookings table
-- Run this in your Supabase SQL Editor

-- Add offline booking columns to the bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS is_offline_booking BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS offline_customer_name TEXT,
ADD COLUMN IF NOT EXISTS offline_cnic TEXT,
ADD COLUMN IF NOT EXISTS offline_phone TEXT;

-- Add comments to document the new columns
COMMENT ON COLUMN bookings.is_offline_booking IS 'Flag to indicate if this is an offline booking (made outside the system)';
COMMENT ON COLUMN bookings.offline_customer_name IS 'Customer name for offline bookings';
COMMENT ON COLUMN bookings.offline_cnic IS 'Customer CNIC for offline bookings';
COMMENT ON COLUMN bookings.offline_phone IS 'Customer phone number for offline bookings';

-- Create an index on is_offline_booking for faster filtering
CREATE INDEX IF NOT EXISTS idx_bookings_offline ON bookings(is_offline_booking);

-- Optional: Update existing bookings to ensure they're marked as system bookings
UPDATE bookings 
SET is_offline_booking = FALSE 
WHERE is_offline_booking IS NULL;
