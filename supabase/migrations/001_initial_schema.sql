-- ============================================
-- FinZen Database Schema
-- Migration: 001_initial_schema.sql
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS TABLE (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(id)
);

-- ============================================
-- 2. TRANSACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL CHECK (amount >= 0),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. BUDGETS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL,
  category_name TEXT NOT NULL,
  year_month TEXT NOT NULL, -- Format: 'YYYY-MM'
  budget_amount NUMERIC(15, 2) NOT NULL CHECK (budget_amount >= 0),
  spent_amount NUMERIC(15, 2) DEFAULT 0 CHECK (spent_amount >= 0),
  color TEXT, -- Hex color code
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, category_id, year_month)
);

-- ============================================
-- 4. GOALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target NUMERIC(15, 2) NOT NULL CHECK (target > 0),
  saved NUMERIC(15, 2) DEFAULT 0 CHECK (saved >= 0),
  due_date DATE,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 5. GOAL_HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.goal_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 6. UNLOCKED_BADGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.unlocked_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- ============================================
-- 7. WEEKLY_CHALLENGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.weekly_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  challenge_id TEXT NOT NULL,
  challenge_type TEXT NOT NULL, -- 'transaction_count', 'budget_track', 'goal_topup'
  title TEXT NOT NULL,
  description TEXT,
  week_string TEXT NOT NULL, -- Format: 'YYYY-WW'
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  progress NUMERIC(15, 2) DEFAULT 0 CHECK (progress >= 0),
  target NUMERIC(15, 2) NOT NULL CHECK (target > 0),
  completed BOOLEAN DEFAULT FALSE,
  reward_type TEXT,
  reward_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, week_string)
);

-- ============================================
-- 8. FEEDBACK TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  category TEXT NOT NULL CHECK (category IN ('bug', 'suggestion', 'question', 'other')),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 9. AB_TESTING_METRICS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.ab_testing_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  variant TEXT NOT NULL CHECK (variant IN ('A', 'B', 'C')),
  metric TEXT NOT NULL, -- 'insight_click', 'engagement_time', etc.
  value TEXT, -- JSON string or simple value
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 10. USER_PREFERENCES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  ab_variant TEXT CHECK (ab_variant IN ('A', 'B', 'C')),
  last_category TEXT,
  last_expense_prompt_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================
COMMENT ON TABLE public.users IS 'User profiles extending Supabase auth.users';
COMMENT ON TABLE public.transactions IS 'User financial transactions';
COMMENT ON TABLE public.budgets IS 'Monthly budgets per category';
COMMENT ON TABLE public.goals IS 'User savings goals';
COMMENT ON TABLE public.goal_history IS 'History of goal top-ups';
COMMENT ON TABLE public.unlocked_badges IS 'Badges unlocked by users';
COMMENT ON TABLE public.weekly_challenges IS 'Weekly challenges for users';
COMMENT ON TABLE public.feedback IS 'User feedback submissions';
COMMENT ON TABLE public.ab_testing_metrics IS 'A/B testing metrics tracking';
COMMENT ON TABLE public.user_preferences IS 'User preferences and settings';


