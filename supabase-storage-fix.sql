-- Updated Storage Policies for Development/Demo
-- Run this in your Supabase SQL Editor if you're having upload issues

-- First, let's remove existing storage policies if they exist
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own photos" ON storage.objects;

-- Create more permissive policies for development
CREATE POLICY "Anyone can view photos" ON storage.objects FOR SELECT USING (bucket_id = 'photos');
CREATE POLICY "Anyone can upload photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'photos');
CREATE POLICY "Anyone can update photos" ON storage.objects FOR UPDATE USING (bucket_id = 'photos');
CREATE POLICY "Anyone can delete photos" ON storage.objects FOR DELETE USING (bucket_id = 'photos');

-- Make sure the photos bucket exists and is public
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('photos', 'photos', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Check bucket configuration
SELECT * FROM storage.buckets WHERE id = 'photos';
