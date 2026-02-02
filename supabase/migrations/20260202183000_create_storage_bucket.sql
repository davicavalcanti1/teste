-- Migration: Create Storage Bucket for Inspection Images
-- Description: Creates a public bucket for storing inspection photos and sets RLS policies.

-- 1. Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('inspection-images', 'inspection-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Enable RLS on objects (standard Supabase practice, though often enabled by default)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Allow Public View (Anyone can view the images)
CREATE POLICY "Public Access View"
ON storage.objects FOR SELECT
USING ( bucket_id = 'inspection-images' );

-- 4. Policy: Allow Public Upload (Anyone can upload via the public forms)
CREATE POLICY "Public Access Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'inspection-images' );

-- 5. Policy: Allow Authenticated Update/Delete (Optional, for admin management)
CREATE POLICY "Admin Access All"
ON storage.objects FOR ALL
TO authenticated
USING ( bucket_id = 'inspection-images' )
WITH CHECK ( bucket_id = 'inspection-images' );
