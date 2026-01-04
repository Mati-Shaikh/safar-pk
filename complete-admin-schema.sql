-- Complete Admin Panel Database Schema for SAFARPk
-- Run these commands in your Supabase SQL Editor

-- 1. Create user_profiles table (main user table)
-- Updated to allow same email for different roles
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('customer', 'driver', 'hotel', 'admin')),
    phone TEXT,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Composite unique constraint: same email can be used for different roles
    CONSTRAINT user_profiles_email_role_unique UNIQUE (email, role)
);

-- 2. Create destinations table
CREATE TABLE IF NOT EXISTS destinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    region TEXT NOT NULL,
    description TEXT,
    images TEXT[],
    attractions TEXT[],
    weather TEXT,
    popularity INTEGER DEFAULT 0 CHECK (popularity >= 0 AND popularity <= 100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create hotels table
CREATE TABLE IF NOT EXISTS hotels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    location TEXT NOT NULL,
    amenities TEXT[],
    images TEXT[],
    rating DECIMAL(2,1) DEFAULT 0.0 CHECK (rating >= 0.0 AND rating <= 5.0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create hotel_rooms table
CREATE TABLE IF NOT EXISTS hotel_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    description TEXT,
    price_per_night DECIMAL(8,2) NOT NULL,
    capacity INTEGER NOT NULL,
    amenities TEXT[],
    images TEXT[],
    available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- 6. Create trips table
CREATE TABLE IF NOT EXISTS trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    destinations TEXT[],
    number_of_people INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    hotel_id UUID REFERENCES hotels(id),
    driver_id UUID REFERENCES user_profiles(id),
    needs_car BOOLEAN DEFAULT false,
    car_type TEXT,
    itinerary JSONB,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'upcoming', 'ongoing', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('hotel', 'car')),
    provider_id UUID NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'completed')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotel_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles table
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (id = auth.uid()::text);

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (id = auth.uid()::text);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (id = auth.uid()::text);

-- Admin policies for user_profiles
CREATE POLICY "Admins can view all profiles" ON user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid()::text AND role = 'admin'
        )
    );

CREATE POLICY "Admins can insert profiles" ON user_profiles
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid()::text AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update profiles" ON user_profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid()::text AND role = 'admin'
        )
    );

CREATE POLICY "Admins can delete profiles" ON user_profiles
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid()::text AND role = 'admin'
        )
    );

-- Create RLS policies for destinations table
CREATE POLICY "Anyone can view destinations" ON destinations
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage destinations" ON destinations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid()::text AND role = 'admin'
        )
    );

-- Create RLS policies for hotels table
CREATE POLICY "Anyone can view hotels" ON hotels
    FOR SELECT USING (true);

CREATE POLICY "Hotel owners can manage their hotels" ON hotels
    FOR ALL USING (owner_id = auth.uid()::text);

CREATE POLICY "Admins can manage all hotels" ON hotels
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid()::text AND role = 'admin'
        )
    );

-- Create RLS policies for hotel_rooms table
CREATE POLICY "Anyone can view hotel rooms" ON hotel_rooms
    FOR SELECT USING (true);

CREATE POLICY "Hotel owners can manage their rooms" ON hotel_rooms
    FOR ALL USING (
        hotel_id IN (
            SELECT id FROM hotels WHERE owner_id = auth.uid()::text
        )
    );

CREATE POLICY "Admins can manage all hotel rooms" ON hotel_rooms
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid()::text AND role = 'admin'
        )
    );

-- Create RLS policies for vehicles table
CREATE POLICY "Anyone can view vehicles" ON vehicles
    FOR SELECT USING (true);

CREATE POLICY "Drivers can manage their vehicles" ON vehicles
    FOR ALL USING (driver_id = auth.uid()::text);

CREATE POLICY "Admins can manage all vehicles" ON vehicles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid()::text AND role = 'admin'
        )
    );

-- Create RLS policies for trips table
CREATE POLICY "Users can view their own trips" ON trips
    FOR SELECT USING (customer_id = auth.uid()::text);

CREATE POLICY "Users can insert their own trips" ON trips
    FOR INSERT WITH CHECK (customer_id = auth.uid()::text);

CREATE POLICY "Users can update their own trips" ON trips
    FOR UPDATE USING (customer_id = auth.uid()::text);

CREATE POLICY "Admins can view all trips" ON trips
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid()::text AND role = 'admin'
        )
    );

-- Create RLS policies for bookings table
CREATE POLICY "Users can view their own bookings" ON bookings
    FOR SELECT USING (customer_id = auth.uid()::text);

CREATE POLICY "Users can insert their own bookings" ON bookings
    FOR INSERT WITH CHECK (customer_id = auth.uid()::text);

CREATE POLICY "Users can update their own bookings" ON bookings
    FOR UPDATE USING (customer_id = auth.uid()::text);

CREATE POLICY "Admins can view all bookings" ON bookings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid()::text AND role = 'admin'
        )
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_destinations_region ON destinations(region);
CREATE INDEX IF NOT EXISTS idx_destinations_popularity ON destinations(popularity);
CREATE INDEX IF NOT EXISTS idx_hotels_owner_id ON hotels(owner_id);
CREATE INDEX IF NOT EXISTS idx_hotels_location ON hotels(location);
CREATE INDEX IF NOT EXISTS idx_hotel_rooms_hotel_id ON hotel_rooms(hotel_id);
CREATE INDEX IF NOT EXISTS idx_hotel_rooms_available ON hotel_rooms(available);
CREATE INDEX IF NOT EXISTS idx_vehicles_driver_id ON vehicles(driver_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_available ON vehicles(available);
CREATE INDEX IF NOT EXISTS idx_vehicles_type ON vehicles(type);
CREATE INDEX IF NOT EXISTS idx_trips_customer_id ON trips(customer_id);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_destinations_updated_at 
    BEFORE UPDATE ON destinations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hotels_updated_at 
    BEFORE UPDATE ON hotels 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hotel_rooms_updated_at 
    BEFORE UPDATE ON hotel_rooms 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at 
    BEFORE UPDATE ON vehicles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trips_updated_at 
    BEFORE UPDATE ON trips 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at 
    BEFORE UPDATE ON bookings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample admin user (replace with your actual admin email)
INSERT INTO user_profiles (id, email, name, role, phone, address) 
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'admin@safarpk.com',
    'Admin User',
    'admin',
    '+92-300-1234567',
    'Karachi, Pakistan'
) ON CONFLICT (id) DO NOTHING;

-- Insert sample destinations
INSERT INTO destinations (name, region, description, images, attractions, weather, popularity) VALUES
('Hunza Valley', 'Gilgit-Baltistan', 'A beautiful valley known for its stunning landscapes and friendly people', 
 ARRAY['https://example.com/hunza1.jpg', 'https://example.com/hunza2.jpg'],
 ARRAY['Baltit Fort', 'Altit Fort', 'Attabad Lake', 'Passu Cones'],
 'Mild and pleasant', 95),
('Swat Valley', 'Khyber Pakhtunkhwa', 'The Switzerland of Pakistan with lush green valleys', 
 ARRAY['https://example.com/swat1.jpg', 'https://example.com/swat2.jpg'],
 ARRAY['Malam Jabba', 'Kalam Valley', 'Mingora Bazaar', 'Fizagat Park'],
 'Cool and refreshing', 88),
('Murree', 'Punjab', 'Popular hill station near Islamabad', 
 ARRAY['https://example.com/murree1.jpg', 'https://example.com/murree2.jpg'],
 ARRAY['Mall Road', 'Pindi Point', 'Patriata Chairlift', 'Ayubia National Park'],
 'Cool and misty', 75),
('Lahore', 'Punjab', 'Cultural capital of Pakistan', 
 ARRAY['https://example.com/lahore1.jpg', 'https://example.com/lahore2.jpg'],
 ARRAY['Badshahi Mosque', 'Lahore Fort', 'Shalimar Gardens', 'Food Street'],
 'Hot and humid', 90),
('Karachi', 'Sindh', 'Economic hub and largest city of Pakistan', 
 ARRAY['https://example.com/karachi1.jpg', 'https://example.com/karachi2.jpg'],
 ARRAY['Clifton Beach', 'Mazar-e-Quaid', 'Frere Hall', 'Port Grand'],
 'Hot and humid', 85);

