-- Migration: 0000_initial_schema
-- Description: Creates core tables for OneMinute challenge

-- Create Users Table (Extensions to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT,
  email TEXT NOT NULL,
  native_language TEXT,
  challenge_start_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Create Scenarios Table
CREATE TABLE IF NOT EXISTS public.scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_number INTEGER NOT NULL UNIQUE,
  title TEXT NOT NULL,
  situation TEXT NOT NULL,
  role TEXT NOT NULL,
  objective TEXT NOT NULL,
  constraint_text TEXT,
  time_limit INTEGER DEFAULT 90, -- in seconds
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for scenarios (Read only for authenticated users)
ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Any authenticated user can view scenarios" ON public.scenarios FOR SELECT USING (auth.role() = 'authenticated');

-- Create Recordings Table
CREATE TABLE IF NOT EXISTS public.recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) NOT NULL,
  day_number INTEGER NOT NULL,
  audio_url TEXT,
  transcript TEXT,
  clarity_score INTEGER,
  structure_score INTEGER,
  confidence_score INTEGER,
  tone_score INTEGER,
  conciseness_score INTEGER,
  filler_count INTEGER,
  overall_score INTEGER,
  feedback_summary JSONB, -- stores GPT feedback JSON
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, day_number)
);

-- Enable RLS for recordings
ALTER TABLE public.recordings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own recordings" ON public.recordings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own recordings" ON public.recordings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own recordings" ON public.recordings FOR UPDATE USING (auth.uid() = user_id);

-- Create Analytics Table
CREATE TABLE IF NOT EXISTS public.analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) NOT NULL,
  milestone_day INTEGER NOT NULL, -- 10, 20, 30
  avg_score NUMERIC,
  improvement_percent NUMERIC,
  feedback_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, milestone_day)
);

-- Enable RLS for analytics
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own analytics" ON public.analytics FOR SELECT USING (auth.uid() = user_id);

-- Setup Storage bucket for audio
INSERT INTO storage.buckets (id, name, public) 
VALUES ('recordings', 'recordings', false)
ON CONFLICT (id) DO NOTHING;

-- RLS for storage (Assume bucket is internal/private to user)
CREATE POLICY "Users can upload their own recordings" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'recordings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own recordings" 
ON storage.objects FOR SELECT 
USING (
  bucket_id = 'recordings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Helper triggers to auto-create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
