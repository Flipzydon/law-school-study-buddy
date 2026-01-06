-- Create scores table
CREATE TABLE IF NOT EXISTS scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name TEXT,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  percentage DECIMAL(5, 2) NOT NULL,
  pdf_filename TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create an index on created_at for faster queries
CREATE INDEX IF NOT EXISTS idx_scores_created_at ON scores(created_at DESC);

-- Enable Row Level Security (optional, adjust based on your needs)
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- Policy to allow all reads (you can restrict this as needed)
CREATE POLICY "Allow all reads" ON scores
  FOR SELECT USING (true);

-- Policy to allow inserts (you can restrict this as needed)
CREATE POLICY "Allow all inserts" ON scores
  FOR INSERT WITH CHECK (true);

