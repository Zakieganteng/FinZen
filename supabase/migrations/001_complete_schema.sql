-- ============================================
-- FinZen Database Schema - Complete
-- Migration: 001_complete_schema.sql
-- Combines: schema, indexes, and triggers
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

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- TRANSACTIONS INDEXES
-- Index for filtering by user_id (most common query)
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);

-- Index for filtering by date (for date range queries)
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date);

-- Index for filtering by user and date (common combination)
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, date DESC);

-- Index for filtering by category
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.transactions(category);

-- Index for filtering by user and category
CREATE INDEX IF NOT EXISTS idx_transactions_user_category ON public.transactions(user_id, category);

-- BUDGETS INDEXES
-- Index for filtering by user_id
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON public.budgets(user_id);

-- Index for filtering by year_month
CREATE INDEX IF NOT EXISTS idx_budgets_year_month ON public.budgets(year_month);

-- Index for filtering by user and year_month (common combination)
CREATE INDEX IF NOT EXISTS idx_budgets_user_year_month ON public.budgets(user_id, year_month);

-- Index for filtering by category
CREATE INDEX IF NOT EXISTS idx_budgets_category_id ON public.budgets(category_id);

-- GOALS INDEXES
-- Index for filtering by user_id
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON public.goals(user_id);

-- Index for filtering by completed status
CREATE INDEX IF NOT EXISTS idx_goals_completed ON public.goals(completed);

-- Index for filtering by due_date (for approaching deadlines)
CREATE INDEX IF NOT EXISTS idx_goals_due_date ON public.goals(due_date) WHERE due_date IS NOT NULL;

-- Index for filtering by user and completed
CREATE INDEX IF NOT EXISTS idx_goals_user_completed ON public.goals(user_id, completed);

-- GOAL_HISTORY INDEXES
-- Index for filtering by goal_id
CREATE INDEX IF NOT EXISTS idx_goal_history_goal_id ON public.goal_history(goal_id);

-- Index for filtering by user_id
CREATE INDEX IF NOT EXISTS idx_goal_history_user_id ON public.goal_history(user_id);

-- Index for filtering by date
CREATE INDEX IF NOT EXISTS idx_goal_history_date ON public.goal_history(date);

-- Index for filtering by user and date
CREATE INDEX IF NOT EXISTS idx_goal_history_user_date ON public.goal_history(user_id, date DESC);

-- UNLOCKED_BADGES INDEXES
-- Index for filtering by user_id
CREATE INDEX IF NOT EXISTS idx_unlocked_badges_user_id ON public.unlocked_badges(user_id);

-- Index for filtering by badge_id
CREATE INDEX IF NOT EXISTS idx_unlocked_badges_badge_id ON public.unlocked_badges(badge_id);

-- Index for filtering by unlocked_at (for sorting)
CREATE INDEX IF NOT EXISTS idx_unlocked_badges_unlocked_at ON public.unlocked_badges(unlocked_at DESC);

-- WEEKLY_CHALLENGES INDEXES
-- Index for filtering by user_id
CREATE INDEX IF NOT EXISTS idx_weekly_challenges_user_id ON public.weekly_challenges(user_id);

-- Index for filtering by week_string
CREATE INDEX IF NOT EXISTS idx_weekly_challenges_week_string ON public.weekly_challenges(week_string);

-- Index for filtering by user and week_string
CREATE INDEX IF NOT EXISTS idx_weekly_challenges_user_week ON public.weekly_challenges(user_id, week_string);

-- Index for filtering by completed status
CREATE INDEX IF NOT EXISTS idx_weekly_challenges_completed ON public.weekly_challenges(completed);

-- FEEDBACK INDEXES
-- Index for filtering by user_id
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON public.feedback(user_id);

-- Index for filtering by rating
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON public.feedback(rating);

-- Index for filtering by category
CREATE INDEX IF NOT EXISTS idx_feedback_category ON public.feedback(category);

-- Index for filtering by created_at (for sorting)
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback(created_at DESC);

-- AB_TESTING_METRICS INDEXES
-- Index for filtering by user_id
CREATE INDEX IF NOT EXISTS idx_ab_metrics_user_id ON public.ab_testing_metrics(user_id);

-- Index for filtering by variant
CREATE INDEX IF NOT EXISTS idx_ab_metrics_variant ON public.ab_testing_metrics(variant);

-- Index for filtering by metric
CREATE INDEX IF NOT EXISTS idx_ab_metrics_metric ON public.ab_testing_metrics(metric);

-- Index for filtering by user and variant (for analysis)
CREATE INDEX IF NOT EXISTS idx_ab_metrics_user_variant ON public.ab_testing_metrics(user_id, variant);

-- Index for filtering by created_at
CREATE INDEX IF NOT EXISTS idx_ab_metrics_created_at ON public.ab_testing_metrics(created_at DESC);

-- USER_PREFERENCES INDEXES
-- Index for filtering by user_id (already unique, but good for queries)
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);

-- ============================================
-- TRIGGERS AND FUNCTIONS
-- ============================================

-- ============================================
-- FUNCTION: Update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: Tidak ada trigger untuk auto-create user dari auth.users
-- karena kita menggunakan custom auth (langsung insert ke tabel users)

-- ============================================
-- TRIGGERS: Auto-update updated_at
-- ============================================

-- Users table
DROP TRIGGER IF EXISTS set_updated_at_users ON public.users;
CREATE TRIGGER set_updated_at_users
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Transactions table
DROP TRIGGER IF EXISTS set_updated_at_transactions ON public.transactions;
CREATE TRIGGER set_updated_at_transactions
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Budgets table
DROP TRIGGER IF EXISTS set_updated_at_budgets ON public.budgets;
CREATE TRIGGER set_updated_at_budgets
  BEFORE UPDATE ON public.budgets
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Goals table
DROP TRIGGER IF EXISTS set_updated_at_goals ON public.goals;
CREATE TRIGGER set_updated_at_goals
  BEFORE UPDATE ON public.goals
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Weekly challenges table
DROP TRIGGER IF EXISTS set_updated_at_weekly_challenges ON public.weekly_challenges;
CREATE TRIGGER set_updated_at_weekly_challenges
  BEFORE UPDATE ON public.weekly_challenges
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- User preferences table
DROP TRIGGER IF EXISTS set_updated_at_user_preferences ON public.user_preferences;
CREATE TRIGGER set_updated_at_user_preferences
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- FUNCTION: Update goal saved amount on history insert
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_goal_history_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the goal's saved amount
  UPDATE public.goals
  SET saved = saved + NEW.amount,
      updated_at = NOW()
  WHERE id = NEW.goal_id;
  
  -- Check if goal is completed
  UPDATE public.goals
  SET completed = TRUE,
      updated_at = NOW()
  WHERE id = NEW.goal_id
    AND saved >= target
    AND completed = FALSE;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGER: Auto-update goal saved on history insert
-- ============================================
DROP TRIGGER IF EXISTS on_goal_history_insert ON public.goal_history;
CREATE TRIGGER on_goal_history_insert
  AFTER INSERT ON public.goal_history
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_goal_history_insert();

-- ============================================
-- FUNCTION: Calculate budget spent from transactions
-- ============================================
CREATE OR REPLACE FUNCTION public.update_budget_spent()
RETURNS TRIGGER AS $$
BEGIN
  -- Update budget spent amount based on transactions
  UPDATE public.budgets
  SET spent_amount = (
    SELECT COALESCE(SUM(amount), 0)
    FROM public.transactions
    WHERE user_id = NEW.user_id
      AND category = NEW.category
      AND date >= DATE_TRUNC('month', NEW.date)::DATE
      AND date < (DATE_TRUNC('month', NEW.date) + INTERVAL '1 month')::DATE
  ),
  updated_at = NOW()
  WHERE user_id = NEW.user_id
    AND category_name = NEW.category
    AND year_month = TO_CHAR(NEW.date, 'YYYY-MM');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGER: Auto-update budget spent on transaction insert/update/delete
-- ============================================
DROP TRIGGER IF EXISTS on_transaction_budget_update ON public.transactions;
CREATE TRIGGER on_transaction_budget_update
  AFTER INSERT OR UPDATE OR DELETE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_budget_spent();

