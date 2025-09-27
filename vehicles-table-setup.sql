-- Create vehicles table for driver vehicle management
-- Run this script in your Supabase SQL Editor

-- Create vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    driver_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    seats INTEGER NOT NULL,
    price_per_day DECIMAL(8,2) NOT NULL,
    description TEXT,
    features TEXT[],
    images TEXT[],
    available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for vehicles table
-- Drivers can only see and manage their own vehicles
CREATE POLICY "Drivers can view their own vehicles" ON vehicles
    FOR SELECT USING (
        driver_id IN (
            SELECT id FROM user_profiles 
            WHERE id = auth.uid()::text
        )
    );

CREATE POLICY "Drivers can insert their own vehicles" ON vehicles
    FOR INSERT WITH CHECK (
        driver_id IN (
            SELECT id FROM user_profiles 
            WHERE id = auth.uid()::text
        )
    );

CREATE POLICY "Drivers can update their own vehicles" ON vehicles
    FOR UPDATE USING (
        driver_id IN (
            SELECT id FROM user_profiles 
            WHERE id = auth.uid()::text
        )
    );

CREATE POLICY "Drivers can delete their own vehicles" ON vehicles
    FOR DELETE USING (
        driver_id IN (
            SELECT id FROM user_profiles 
            WHERE id = auth.uid()::text
        )
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vehicles_driver_id ON vehicles(driver_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_available ON vehicles(available);
CREATE INDEX IF NOT EXISTS idx_vehicles_type ON vehicles(type);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_vehicles_updated_at 
    BEFORE UPDATE ON vehicles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
