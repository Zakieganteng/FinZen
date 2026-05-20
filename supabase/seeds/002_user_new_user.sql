-- ============================================
-- Seed Data: New User (User Baru)
-- File: 002_user_new_user.sql
-- Scenario: User yang baru saja mendaftar dan mulai menggunakan aplikasi
-- User ID: GANTI_MANUAL_USER_ID_DISINI
-- ============================================
-- 
-- CASE: User baru yang baru mulai tracking keuangan
-- - Sedikit transaksi (hanya minggu ini)
-- - Budget baru dibuat (belum banyak terpakai)
-- - Goals baru dibuat (progress masih kecil)
-- - Perfect untuk demo onboarding dan fitur dasar
-- ============================================

DO $$
DECLARE
  v_user_id UUID := 'GANTI_MANUAL_USER_ID_DISINI'; -- ⚠️ GANTI INI!
  v_current_month TEXT := TO_CHAR(CURRENT_DATE, 'YYYY-MM');
BEGIN

-- ============================================
-- 1. TRANSACTIONS (Hanya Minggu Ini)
-- ============================================
INSERT INTO public.transactions (user_id, date, category, amount, note) VALUES
  (v_user_id, CURRENT_DATE, 'Makan', 30000, 'Sarapan pagi'),
  (v_user_id, CURRENT_DATE, 'Transportasi', 15000, 'Gojek ke kampus'),
  (v_user_id, CURRENT_DATE - INTERVAL '1 day', 'Makan', 25000, 'Makan siang'),
  (v_user_id, CURRENT_DATE - INTERVAL '1 day', 'Transportasi', 12000, 'Gojek pulang'),
  (v_user_id, CURRENT_DATE - INTERVAL '2 days', 'Makan', 35000, 'Makan malam'),
  (v_user_id, CURRENT_DATE - INTERVAL '2 days', 'Hiburan', 50000, 'Spotify'),
  (v_user_id, CURRENT_DATE - INTERVAL '3 days', 'Makan', 28000, 'Sarapan'),
  (v_user_id, CURRENT_DATE - INTERVAL '3 days', 'Transportasi', 18000, 'Gojek'),
  (v_user_id, CURRENT_DATE - INTERVAL '4 days', 'Makan', 32000, 'Makan siang'),
  (v_user_id, CURRENT_DATE - INTERVAL '5 days', 'Makan', 30000, 'Makan malam'),
  (v_user_id, CURRENT_DATE - INTERVAL '5 days', 'Hiburan', 60000, 'Nonton film'),
  (v_user_id, CURRENT_DATE - INTERVAL '6 days', 'Makan', 27000, 'Sarapan'),
  (v_user_id, CURRENT_DATE - INTERVAL '6 days', 'Transportasi', 16000, 'Gojek');

-- ============================================
-- 2. BUDGETS (Hanya Bulan Ini)
-- ============================================
INSERT INTO public.budgets (user_id, category_id, category_name, year_month, budget_amount, spent_amount, color) VALUES
  (v_user_id, 'food', 'Makan', v_current_month, 500000, 0, '#3B82F6'),
  (v_user_id, 'transport', 'Transportasi', v_current_month, 250000, 0, '#22C55E'),
  (v_user_id, 'entertainment', 'Hiburan', v_current_month, 300000, 0, '#A855F7'),
  (v_user_id, 'savings', 'Tabungan', v_current_month, 500000, 0, '#EAB308')
ON CONFLICT (user_id, category_id, year_month) DO NOTHING;

UPDATE public.budgets b
SET spent_amount = COALESCE((
  SELECT SUM(amount)
  FROM public.transactions t
  WHERE t.user_id = b.user_id
    AND t.category = b.category_name
    AND TO_CHAR(t.date, 'YYYY-MM') = b.year_month
), 0)
WHERE b.user_id = v_user_id;

-- ============================================
-- 3. GOALS (Baru Dibuat, Progress Kecil)
-- ============================================
INSERT INTO public.goals (user_id, title, target, saved, due_date, priority, completed) VALUES
  (v_user_id, 'Beli Laptop', 8000000, 500000, CURRENT_DATE + INTERVAL '6 months', 'high', false),
  (v_user_id, 'Liburan Akhir Tahun', 3000000, 200000, CURRENT_DATE + INTERVAL '4 months', 'normal', false),
  (v_user_id, 'Emergency Fund', 5000000, 0, NULL, 'urgent', false)
ON CONFLICT DO NOTHING;

-- ============================================
-- 4. GOAL HISTORY (Sedikit Top-up)
-- ============================================
-- Beli Laptop (2 top-ups)
INSERT INTO public.goal_history (goal_id, user_id, amount, date, note)
SELECT g.id, v_user_id, 300000, CURRENT_DATE - INTERVAL '10 days', 'Tabungan awal'
FROM public.goals g WHERE g.user_id = v_user_id AND g.title = 'Beli Laptop' LIMIT 1;
INSERT INTO public.goal_history (goal_id, user_id, amount, date, note)
SELECT g.id, v_user_id, 200000, CURRENT_DATE - INTERVAL '5 days', 'Top up kedua'
FROM public.goals g WHERE g.user_id = v_user_id AND g.title = 'Beli Laptop' LIMIT 1;

-- Liburan Akhir Tahun (1 top-up)
INSERT INTO public.goal_history (goal_id, user_id, amount, date, note)
SELECT g.id, v_user_id, 200000, CURRENT_DATE - INTERVAL '7 days', 'Tabungan awal'
FROM public.goals g WHERE g.user_id = v_user_id AND g.title = 'Liburan Akhir Tahun' LIMIT 1;

UPDATE public.goals g
SET saved = COALESCE((
  SELECT SUM(amount) FROM public.goal_history gh WHERE gh.goal_id = g.id
), 0)
WHERE g.user_id = v_user_id;

END $$;

