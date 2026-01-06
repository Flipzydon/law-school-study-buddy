-- Phase 2: Storage Buckets Setup

-- 1. Create podcast-audio bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('podcast-audio', 'podcast-audio', false, 52428800, ARRAY['audio/mpeg'])
ON CONFLICT (id) DO NOTHING;

-- 2. Create presentation-slides bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('presentation-slides', 'presentation-slides', false, 20971520, ARRAY['application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- 3. Storage RLS Policies for podcast-audio bucket

-- Users can upload to their own folder
CREATE POLICY "Users can upload own podcast files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'podcast-audio'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can read their own files
CREATE POLICY "Users can read own podcast files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'podcast-audio'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own files
CREATE POLICY "Users can delete own podcast files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'podcast-audio'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 4. Storage RLS Policies for presentation-slides bucket

-- Users can upload to their own folder
CREATE POLICY "Users can upload own slide files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'presentation-slides'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can read their own files
CREATE POLICY "Users can read own slide files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'presentation-slides'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own files
CREATE POLICY "Users can delete own slide files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'presentation-slides'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
