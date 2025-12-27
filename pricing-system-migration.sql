-- Pricing System Migration for Vendors (Hotels & Drivers)
-- Run this in your Supabase SQL Editor

-- =============================================
-- 1. HOTEL ROOM PRICING TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS hotel_room_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES hotel_rooms(id) ON DELETE CASCADE,
    
    -- Season Pricing
    off_season_months INTEGER[] DEFAULT '{}', -- Array of months (1-12) for off season
    off_season_price DECIMAL(8,2), -- Price per night in off season
    
    on_season_months INTEGER[] DEFAULT '{}', -- Array of months (1-12) for on season
    on_season_price DECIMAL(8,2), -- Price per night in on season
    
    closed_months INTEGER[] DEFAULT '{}', -- Array of months (1-12) when closed
    
    -- Last Minute Discount
    last_minute_enabled BOOLEAN DEFAULT false,
    last_minute_days_before INTEGER, -- How many days before booking the discount applies (e.g., 1, 2, 3)
    last_minute_discount_price DECIMAL(8,2), -- Discounted price for last-minute bookings
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_months_off_season CHECK (
        off_season_months <@ ARRAY[1,2,3,4,5,6,7,8,9,10,11,12]
    ),
    CONSTRAINT valid_months_on_season CHECK (
        on_season_months <@ ARRAY[1,2,3,4,5,6,7,8,9,10,11,12]
    ),
    CONSTRAINT valid_months_closed CHECK (
        closed_months <@ ARRAY[1,2,3,4,5,6,7,8,9,10,11,12]
    ),
    CONSTRAINT positive_prices CHECK (
        (off_season_price IS NULL OR off_season_price > 0) AND
        (on_season_price IS NULL OR on_season_price > 0) AND
        (last_minute_discount_price IS NULL OR last_minute_discount_price > 0)
    ),
    CONSTRAINT valid_last_minute_days CHECK (
        last_minute_days_before IS NULL OR last_minute_days_before > 0
    ),
    CONSTRAINT last_minute_complete CHECK (
        (NOT last_minute_enabled) OR 
        (last_minute_enabled AND last_minute_days_before IS NOT NULL AND last_minute_discount_price IS NOT NULL)
    ),
    -- One pricing record per room
    CONSTRAINT unique_room_pricing UNIQUE (room_id)
);

-- =============================================
-- 2. VEHICLE PRICING TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS vehicle_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    
    -- Season Pricing
    off_season_months INTEGER[] DEFAULT '{}', -- Array of months (1-12) for off season
    off_season_price DECIMAL(8,2), -- Price per day in off season
    
    on_season_months INTEGER[] DEFAULT '{}', -- Array of months (1-12) for on season
    on_season_price DECIMAL(8,2), -- Price per day in on season
    
    closed_months INTEGER[] DEFAULT '{}', -- Array of months (1-12) when unavailable
    
    -- Last Minute Discount
    last_minute_enabled BOOLEAN DEFAULT false,
    last_minute_days_before INTEGER, -- How many days before booking the discount applies (e.g., 1, 2, 3)
    last_minute_discount_price DECIMAL(8,2), -- Discounted price for last-minute bookings
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_months_off_season CHECK (
        off_season_months <@ ARRAY[1,2,3,4,5,6,7,8,9,10,11,12]
    ),
    CONSTRAINT valid_months_on_season CHECK (
        on_season_months <@ ARRAY[1,2,3,4,5,6,7,8,9,10,11,12]
    ),
    CONSTRAINT valid_months_closed CHECK (
        closed_months <@ ARRAY[1,2,3,4,5,6,7,8,9,10,11,12]
    ),
    CONSTRAINT positive_prices CHECK (
        (off_season_price IS NULL OR off_season_price > 0) AND
        (on_season_price IS NULL OR on_season_price > 0) AND
        (last_minute_discount_price IS NULL OR last_minute_discount_price > 0)
    ),
    CONSTRAINT valid_last_minute_days CHECK (
        last_minute_days_before IS NULL OR last_minute_days_before > 0
    ),
    CONSTRAINT last_minute_complete CHECK (
        (NOT last_minute_enabled) OR 
        (last_minute_enabled AND last_minute_days_before IS NOT NULL AND last_minute_discount_price IS NOT NULL)
    ),
    -- One pricing record per vehicle
    CONSTRAINT unique_vehicle_pricing UNIQUE (vehicle_id)
);

-- =============================================
-- 3. VALIDATION FUNCTION
-- =============================================
-- Function to validate no overlap between seasons and closed months
CREATE OR REPLACE FUNCTION validate_pricing_months()
RETURNS TRIGGER AS $$
DECLARE
    overlap_off_closed INTEGER[];
    overlap_on_closed INTEGER[];
    overlap_off_on INTEGER[];
BEGIN
    -- Check overlap between off-season and closed months
    SELECT ARRAY(
        SELECT UNNEST(NEW.off_season_months)
        INTERSECT
        SELECT UNNEST(NEW.closed_months)
    ) INTO overlap_off_closed;
    
    -- Check overlap between on-season and closed months
    SELECT ARRAY(
        SELECT UNNEST(NEW.on_season_months)
        INTERSECT
        SELECT UNNEST(NEW.closed_months)
    ) INTO overlap_on_closed;
    
    -- Check overlap between off-season and on-season
    SELECT ARRAY(
        SELECT UNNEST(NEW.off_season_months)
        INTERSECT
        SELECT UNNEST(NEW.on_season_months)
    ) INTO overlap_off_on;
    
    IF array_length(overlap_off_closed, 1) > 0 THEN
        RAISE EXCEPTION 'Off-season months cannot overlap with closed months. Overlapping months: %', overlap_off_closed;
    END IF;
    
    IF array_length(overlap_on_closed, 1) > 0 THEN
        RAISE EXCEPTION 'On-season months cannot overlap with closed months. Overlapping months: %', overlap_on_closed;
    END IF;
    
    IF array_length(overlap_off_on, 1) > 0 THEN
        RAISE EXCEPTION 'Off-season and on-season months cannot overlap. Overlapping months: %', overlap_off_on;
    END IF;
    
    -- Validate prices are set when months are selected
    IF array_length(NEW.off_season_months, 1) > 0 AND NEW.off_season_price IS NULL THEN
        RAISE EXCEPTION 'Off-season price must be set when off-season months are selected';
    END IF;
    
    IF array_length(NEW.on_season_months, 1) > 0 AND NEW.on_season_price IS NULL THEN
        RAISE EXCEPTION 'On-season price must be set when on-season months are selected';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply validation triggers
CREATE TRIGGER validate_hotel_room_pricing_months
    BEFORE INSERT OR UPDATE ON hotel_room_pricing
    FOR EACH ROW
    EXECUTE FUNCTION validate_pricing_months();

CREATE TRIGGER validate_vehicle_pricing_months
    BEFORE INSERT OR UPDATE ON vehicle_pricing
    FOR EACH ROW
    EXECUTE FUNCTION validate_pricing_months();

-- =============================================
-- 4. HELPER FUNCTION TO GET CURRENT PRICE
-- =============================================
-- Function to calculate the current applicable price for a room
CREATE OR REPLACE FUNCTION get_room_current_price(
    p_room_id UUID,
    p_booking_date DATE DEFAULT CURRENT_DATE
)
RETURNS DECIMAL(8,2) AS $$
DECLARE
    v_pricing RECORD;
    v_month INTEGER;
    v_days_until INTEGER;
    v_base_price DECIMAL(8,2);
BEGIN
    -- Get pricing configuration
    SELECT * INTO v_pricing
    FROM hotel_room_pricing
    WHERE room_id = p_room_id;
    
    -- If no pricing config, return the base price from room
    IF NOT FOUND THEN
        SELECT price_per_night INTO v_base_price
        FROM hotel_rooms
        WHERE id = p_room_id;
        RETURN v_base_price;
    END IF;
    
    v_month := EXTRACT(MONTH FROM p_booking_date);
    v_days_until := p_booking_date - CURRENT_DATE;
    
    -- Check if closed
    IF v_month = ANY(v_pricing.closed_months) THEN
        RETURN NULL; -- Indicates closed/unavailable
    END IF;
    
    -- Check last-minute discount
    IF v_pricing.last_minute_enabled AND 
       v_days_until > 0 AND 
       v_days_until <= v_pricing.last_minute_days_before THEN
        RETURN v_pricing.last_minute_discount_price;
    END IF;
    
    -- Check on-season
    IF v_month = ANY(v_pricing.on_season_months) THEN
        RETURN v_pricing.on_season_price;
    END IF;
    
    -- Check off-season
    IF v_month = ANY(v_pricing.off_season_months) THEN
        RETURN v_pricing.off_season_price;
    END IF;
    
    -- Fallback to base price
    SELECT price_per_night INTO v_base_price
    FROM hotel_rooms
    WHERE id = p_room_id;
    
    RETURN v_base_price;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate the current applicable price for a vehicle
CREATE OR REPLACE FUNCTION get_vehicle_current_price(
    p_vehicle_id UUID,
    p_booking_date DATE DEFAULT CURRENT_DATE
)
RETURNS DECIMAL(8,2) AS $$
DECLARE
    v_pricing RECORD;
    v_month INTEGER;
    v_days_until INTEGER;
    v_base_price DECIMAL(8,2);
BEGIN
    -- Get pricing configuration
    SELECT * INTO v_pricing
    FROM vehicle_pricing
    WHERE vehicle_id = p_vehicle_id;
    
    -- If no pricing config, return the base price from vehicle
    IF NOT FOUND THEN
        SELECT price_per_day INTO v_base_price
        FROM vehicles
        WHERE id = p_vehicle_id;
        RETURN v_base_price;
    END IF;
    
    v_month := EXTRACT(MONTH FROM p_booking_date);
    v_days_until := p_booking_date - CURRENT_DATE;
    
    -- Check if closed
    IF v_month = ANY(v_pricing.closed_months) THEN
        RETURN NULL; -- Indicates closed/unavailable
    END IF;
    
    -- Check last-minute discount
    IF v_pricing.last_minute_enabled AND 
       v_days_until > 0 AND 
       v_days_until <= v_pricing.last_minute_days_before THEN
        RETURN v_pricing.last_minute_discount_price;
    END IF;
    
    -- Check on-season
    IF v_month = ANY(v_pricing.on_season_months) THEN
        RETURN v_pricing.on_season_price;
    END IF;
    
    -- Check off-season
    IF v_month = ANY(v_pricing.off_season_months) THEN
        RETURN v_pricing.off_season_price;
    END IF;
    
    -- Fallback to base price
    SELECT price_per_day INTO v_base_price
    FROM vehicles
    WHERE id = p_vehicle_id;
    
    RETURN v_base_price;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 5. ENABLE ROW LEVEL SECURITY
-- =============================================
ALTER TABLE hotel_room_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_pricing ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hotel_room_pricing
CREATE POLICY "Anyone can view room pricing" ON hotel_room_pricing
    FOR SELECT USING (true);

CREATE POLICY "Hotel owners can manage room pricing" ON hotel_room_pricing
    FOR ALL USING (
        room_id IN (
            SELECT hr.id FROM hotel_rooms hr
            JOIN hotels h ON hr.hotel_id = h.id
            WHERE h.owner_id::uuid = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all room pricing" ON hotel_room_pricing
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id::uuid = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for vehicle_pricing
CREATE POLICY "Anyone can view vehicle pricing" ON vehicle_pricing
    FOR SELECT USING (true);

CREATE POLICY "Drivers can manage their vehicle pricing" ON vehicle_pricing
    FOR ALL USING (
        vehicle_id IN (
            SELECT id FROM vehicles 
            WHERE driver_id::uuid = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all vehicle pricing" ON vehicle_pricing
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id::uuid = auth.uid() AND role = 'admin'
        )
    );

-- =============================================
-- 6. CREATE INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX IF NOT EXISTS idx_hotel_room_pricing_room_id ON hotel_room_pricing(room_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_pricing_vehicle_id ON vehicle_pricing(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_hotel_room_pricing_off_season ON hotel_room_pricing USING GIN(off_season_months);
CREATE INDEX IF NOT EXISTS idx_hotel_room_pricing_on_season ON hotel_room_pricing USING GIN(on_season_months);
CREATE INDEX IF NOT EXISTS idx_hotel_room_pricing_closed ON hotel_room_pricing USING GIN(closed_months);
CREATE INDEX IF NOT EXISTS idx_vehicle_pricing_off_season ON vehicle_pricing USING GIN(off_season_months);
CREATE INDEX IF NOT EXISTS idx_vehicle_pricing_on_season ON vehicle_pricing USING GIN(on_season_months);
CREATE INDEX IF NOT EXISTS idx_vehicle_pricing_closed ON vehicle_pricing USING GIN(closed_months);

-- =============================================
-- 7. UPDATE TIMESTAMP TRIGGERS
-- =============================================
CREATE TRIGGER update_hotel_room_pricing_updated_at 
    BEFORE UPDATE ON hotel_room_pricing 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicle_pricing_updated_at 
    BEFORE UPDATE ON vehicle_pricing 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 8. SAMPLE QUERIES FOR TESTING
-- =============================================
-- Example: Get current price for a room
-- SELECT get_room_current_price('room-uuid-here', '2024-07-15');

-- Example: Get current price for a vehicle
-- SELECT get_vehicle_current_price('vehicle-uuid-here', '2024-12-20');

-- Example: Insert pricing for a room
-- INSERT INTO hotel_room_pricing (room_id, off_season_months, off_season_price, on_season_months, on_season_price, closed_months, last_minute_enabled, last_minute_days_before, last_minute_discount_price)
-- VALUES (
--     'room-uuid-here',
--     ARRAY[1,2,3,11,12], -- Off season: Jan, Feb, Mar, Nov, Dec
--     5000, -- PKR 5000 per night in off season
--     ARRAY[6,7,8], -- On season: June, July, August
--     8000, -- PKR 8000 per night in on season
--     ARRAY[9,10], -- Closed in Sept, Oct for maintenance
--     true, -- Last minute discount enabled
--     2, -- Discount applies 2 days before
--     4000 -- Last minute price: PKR 4000
-- );
