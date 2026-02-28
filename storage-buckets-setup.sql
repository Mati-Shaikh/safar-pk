-- Storage Buckets Setup for SAFARPk
-- This script creates all required storage buckets for the application
-- Run this in your Supabase SQL Editor

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================

-- 1. Create hotel-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'hotel-images',
  'hotel-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Create vehicle-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vehicle-images',
  'vehicle-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- 3. Create destination-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'destination-images',
  'destination-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- 4. Create trip-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'trip-images',
  'trip-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STORAGE POLICIES
-- ============================================================================

-- Policy for hotel-images bucket
-- Allow anyone to read (public access)
CREATE POLICY "Public Access for hotel-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'hotel-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload hotel-images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'hotel-images');

-- Allow authenticated users to update their own files
CREATE POLICY "Authenticated users can update hotel-images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'hotel-images');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete hotel-images"
ON storage.objects FOR DELETE
USING (bucket_id = 'hotel-images');

-- Policy for vehicle-images bucket
-- Allow anyone to read (public access)
CREATE POLICY "Public Access for vehicle-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'vehicle-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload vehicle-images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'vehicle-images');

-- Allow authenticated users to update their own files
CREATE POLICY "Authenticated users can update vehicle-images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'vehicle-images');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete vehicle-images"
ON storage.objects FOR DELETE
USING (bucket_id = 'vehicle-images');

-- Policy for destination-images bucket
-- Allow anyone to read (public access)
CREATE POLICY "Public Access for destination-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'destination-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload destination-images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'destination-images');

-- Allow authenticated users to update their own files
CREATE POLICY "Authenticated users can update destination-images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'destination-images');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete destination-images"
ON storage.objects FOR DELETE
USING (bucket_id = 'destination-images');

-- Policy for trip-images bucket
-- Allow anyone to read (public access)
CREATE POLICY "Public Access for trip-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'trip-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload trip-images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'trip-images');

-- Allow authenticated users to update their own files
CREATE POLICY "Authenticated users can update trip-images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'trip-images');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete trip-images"
ON storage.objects FOR DELETE
USING (bucket_id = 'trip-images');

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify buckets were created
SELECT id, name, public, file_size_limit, allowed_mime_types, created_at
FROM storage.buckets
WHERE id IN ('hotel-images', 'vehicle-images', 'destination-images', 'trip-images')
ORDER BY id;

-- Verify policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'objects'
AND policyname LIKE '%hotel-images%'
   OR policyname LIKE '%vehicle-images%'
   OR policyname LIKE '%destination-images%'
   OR policyname LIKE '%trip-images%'
ORDER BY policyname;
