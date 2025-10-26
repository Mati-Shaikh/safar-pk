-- Create collect_email table for storing email subscriptions
-- Run this script in your Supabase SQL Editor

-- Create collect_email table
CREATE TABLE IF NOT EXISTS collect_email (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    subscribed_at TIMESTAMPTZ DEFAULT NOW(),
    source TEXT DEFAULT 'coming_soon_page'
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_collect_email_email ON collect_email(email);
CREATE INDEX IF NOT EXISTS idx_collect_email_subscribed_at ON collect_email(subscribed_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE collect_email ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow anyone to insert (subscribe) - public access
CREATE POLICY "Anyone can subscribe via email" ON collect_email
    FOR INSERT WITH CHECK (true);

-- Allow anyone to view (since we're using custom auth, not Supabase Auth)
-- In production, you can restrict this to admins only via application logic
CREATE POLICY "Anyone can view collected emails" ON collect_email
    FOR SELECT USING (true);

-- Allow anyone to delete (can be restricted via application logic)
CREATE POLICY "Anyone can delete emails" ON collect_email
    FOR DELETE USING (true);
