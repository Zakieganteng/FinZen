-- ============================================
-- Database Indexes for Performance
-- Migration: 003_indexes.sql
-- ============================================

-- ============================================
-- TRANSACTIONS INDEXES
-- ============================================
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

-- ============================================
-- BUDGETS INDEXES
-- ============================================
-- Index for filtering by user_id
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON public.budgets(user_id);

-- Index for filtering by year_month
CREATE INDEX IF NOT EXISTS idx_budgets_year_month ON public.budgets(year_month);

-- Index for filtering by user and year_month (common combination)
CREATE INDEX IF NOT EXISTS idx_budgets_user_year_month ON public.budgets(user_id, year_month);

-- Index for filtering by category
CREATE INDEX IF NOT EXISTS idx_budgets_category_id ON public.budgets(category_id);

-- ============================================
-- GOALS INDEXES
-- ============================================
-- Index for filtering by user_id
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON public.goals(user_id);

-- Index for filtering by completed status
CREATE INDEX IF NOT EXISTS idx_goals_completed ON public.goals(completed);

-- Index for filtering by due_date (for approaching deadlines)
CREATE INDEX IF NOT EXISTS idx_goals_due_date ON public.goals(due_date) WHERE due_date IS NOT NULL;

-- Index for filtering by user and completed
CREATE INDEX IF NOT EXISTS idx_goals_user_completed ON public.goals(user_id, completed);

-- ============================================
-- GOAL_HISTORY INDEXES
-- ============================================
-- Index for filtering by goal_id
CREATE INDEX IF NOT EXISTS idx_goal_history_goal_id ON public.goal_history(goal_id);

-- Index for filtering by user_id
CREATE INDEX IF NOT EXISTS idx_goal_history_user_id ON public.goal_history(user_id);

-- Index for filtering by date
CREATE INDEX IF NOT EXISTS idx_goal_history_date ON public.goal_history(date);

-- Index for filtering by user and date
CREATE INDEX IF NOT EXISTS idx_goal_history_user_date ON public.goal_history(user_id, date DESC);

-- ============================================
-- UNLOCKED_BADGES INDEXES
-- ============================================
-- Index for filtering by user_id
CREATE INDEX IF NOT EXISTS idx_unlocked_badges_user_id ON public.unlocked_badges(user_id);

-- Index for filtering by badge_id
CREATE INDEX IF NOT EXISTS idx_unlocked_badges_badge_id ON public.unlocked_badges(badge_id);

-- Index for filtering by unlocked_at (for sorting)
CREATE INDEX IF NOT EXISTS idx_unlocked_badges_unlocked_at ON public.unlocked_badges(unlocked_at DESC);

-- ============================================
-- WEEKLY_CHALLENGES INDEXES
-- ============================================
-- Index for filtering by user_id
CREATE INDEX IF NOT EXISTS idx_weekly_challenges_user_id ON public.weekly_challenges(user_id);

-- Index for filtering by week_string
CREATE INDEX IF NOT EXISTS idx_weekly_challenges_week_string ON public.weekly_challenges(week_string);

-- Index for filtering by user and week_string
CREATE INDEX IF NOT EXISTS idx_weekly_challenges_user_week ON public.weekly_challenges(user_id, week_string);

-- Index for filtering by completed status
CREATE INDEX IF NOT EXISTS idx_weekly_challenges_completed ON public.weekly_challenges(completed);

-- ============================================
-- FEEDBACK INDEXES
-- ============================================
-- Index for filtering by user_id
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON public.feedback(user_id);

-- Index for filtering by rating
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON public.feedback(rating);

-- Index for filtering by category
CREATE INDEX IF NOT EXISTS idx_feedback_category ON public.feedback(category);

-- Index for filtering by created_at (for sorting)
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback(created_at DESC);

-- ============================================
-- AB_TESTING_METRICS INDEXES
-- ============================================
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

-- ============================================
-- USER_PREFERENCES INDEXES
-- ============================================
-- Index for filtering by user_id (already unique, but good for queries)
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);


