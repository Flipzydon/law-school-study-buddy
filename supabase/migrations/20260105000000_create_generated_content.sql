-- Phase 2: Database & Storage Setup
-- Generated Content Table and RLS Policies

-- 1. Create the generated_content table
CREATE TABLE IF NOT EXISTS generated_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pdf_filename TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('flashcards', 'podcast', 'slides', 'quiz')),
  content_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_generated_content_user ON generated_content(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_content_user_type ON generated_content(user_id, content_type);
CREATE INDEX IF NOT EXISTS idx_generated_content_created ON generated_content(created_at DESC);

-- 3. Enable Row Level Security
ALTER TABLE generated_content ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for generated_content

-- Users can only view their own content
CREATE POLICY "Users can view own content"
  ON generated_content FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own content
CREATE POLICY "Users can insert own content"
  ON generated_content FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own content
CREATE POLICY "Users can update own content"
  ON generated_content FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own content
CREATE POLICY "Users can delete own content"
  ON generated_content FOR DELETE
  USING (auth.uid() = user_id);

-- 5. Grant permissions
GRANT ALL ON generated_content TO authenticated;
GRANT SELECT ON generated_content TO anon;
