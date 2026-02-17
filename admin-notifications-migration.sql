-- Admin Notifications Table Migration
-- This table stores admin notifications for events like new hotel submissions
-- Run this in your Supabase SQL Editor

-- Create admin_notifications table
CREATE TABLE IF NOT EXISTS admin_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_notifications_type ON admin_notifications(type);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_read ON admin_notifications(read);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created_at ON admin_notifications(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Only admins can view notifications
CREATE POLICY "Admins can view all notifications" ON admin_notifications
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- Only admins can insert notifications
CREATE POLICY "Admins can create notifications" ON admin_notifications
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- Only admins can update notifications (mark as read)
CREATE POLICY "Admins can update notifications" ON admin_notifications
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- Only admins can delete notifications
CREATE POLICY "Admins can delete notifications" ON admin_notifications
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_admin_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS admin_notifications_updated_at_trigger ON admin_notifications;
CREATE TRIGGER admin_notifications_updated_at_trigger
    BEFORE UPDATE ON admin_notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_admin_notifications_updated_at();

-- Grant necessary permissions
GRANT ALL ON admin_notifications TO authenticated;
GRANT ALL ON admin_notifications TO service_role;

COMMENT ON TABLE admin_notifications IS 'Stores admin notifications for events like new hotel submissions';
COMMENT ON COLUMN admin_notifications.type IS 'Type of notification (e.g., new_hotel, booking_request)';
COMMENT ON COLUMN admin_notifications.metadata IS 'Additional data about the notification in JSON format';
