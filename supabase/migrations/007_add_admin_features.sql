-- ============================================
-- Admin Features: Roles, Tips, and Admin-Friendly Schema
-- Migration: 007_add_admin_features.sql
-- ============================================

-- 1) Add role column to users table
ALTER TABLE IF EXISTS public.users
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user'
  CHECK (role IN ('user', 'admin', 'superadmin'));

-- Index to speed up admin queries by role
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Ensure existing users have at least 'user' role
UPDATE public.users
SET role = 'user'
WHERE role IS NULL;

-- 2) Create tips table for dynamic financial education content
CREATE TABLE IF NOT EXISTS public.tips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('artikel', 'infografis', 'kuis')),
  content TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Useful indexes for admin & user queries
CREATE INDEX IF NOT EXISTS idx_tips_is_active ON public.tips(is_active);
CREATE INDEX IF NOT EXISTS idx_tips_order_index ON public.tips(order_index);
CREATE INDEX IF NOT EXISTS idx_tips_type ON public.tips(type);

-- Seed initial tips (mirror existing static tips)
INSERT INTO public.tips (title, type, content, order_index, is_active)
VALUES
  ('Atur 50/30/20', 'artikel', 'Pisahkan kebutuhan, keinginan, dan tabungan.', 1, true),
  ('Hentikan impulse buying', 'infografis', 'Tunggu 24 jam sebelum membeli.', 2, true),
  ('Kuis singkat budgeting', 'kuis', 'Berapa % ideal untuk tabungan?', 3, true)
ON CONFLICT DO NOTHING;

-- 3) Feedback indexes for admin analytics (table already exists)
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON public.feedback(rating);
CREATE INDEX IF NOT EXISTS idx_feedback_category ON public.feedback(category);

-- NOTE: RLS / admin-only policies can be added later once Supabase Auth is reintroduced.


