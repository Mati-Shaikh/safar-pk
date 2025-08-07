-- Supabase Database Setup for SAFARPk
-- Run these commands in your Supabase SQL Editor

-- 1. Create customers table
CREATE TABLE customers (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- 2. Create admins table
CREATE TABLE admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- 3. Create hotel_managers table
CREATE TABLE hotel_managers (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- 4. Create drivers table
CREATE TABLE drivers (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotel_managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for customers table
CREATE POLICY "Users can view their own customer data" ON customers
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own customer data" ON customers
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own customer data" ON customers
  FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for admins table
CREATE POLICY "Users can view their own admin data" ON admins
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own admin data" ON admins
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own admin data" ON admins
  FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for hotel_managers table
CREATE POLICY "Users can view their own hotel manager data" ON hotel_managers
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own hotel manager data" ON hotel_managers
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own hotel manager data" ON hotel_managers
  FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for drivers table
CREATE POLICY "Users can view their own driver data" ON drivers
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own driver data" ON drivers
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own driver data" ON drivers
  FOR UPDATE USING (auth.uid() = id); 