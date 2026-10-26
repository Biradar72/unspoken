-- ============================================
-- 002_create_feedback_table.sql
-- Create community feedback table and RLS policies
-- ============================================

-- 1. Create the feedback table
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  rating SMALLINT CHECK (rating >= 1 AND rating <= 5),
  category TEXT NOT NULL DEFAULT 'feature' CHECK (category IN ('feature', 'design', 'writing', 'bug', 'praise', 'general')),
  message TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Enable Row Level Security
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- 3. Allow all visitors and poets to submit feedback
DROP POLICY IF EXISTS "Anyone can submit feedback" ON public.feedback;
CREATE POLICY "Anyone can submit feedback"
  ON public.feedback FOR INSERT
  WITH CHECK (TRUE);

-- 4. Allow admins to read and review feedback
DROP POLICY IF EXISTS "Admins can view feedback" ON public.feedback;
CREATE POLICY "Admins can view feedback"
  ON public.feedback FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );
