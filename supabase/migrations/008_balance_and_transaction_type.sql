-- Saldo awal user + tipe transaksi (pemasukan/pengeluaran)

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS initial_balance NUMERIC(15, 2) DEFAULT 0 CHECK (initial_balance >= 0);

ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'expense'
  CHECK (type IN ('income', 'expense'));

COMMENT ON COLUMN public.users.initial_balance IS 'Saldo awal rekening/dompet saat mulai pakai aplikasi';
COMMENT ON COLUMN public.transactions.type IS 'income = pemasukan, expense = pengeluaran';

-- Budget spent hanya dari pengeluaran
CREATE OR REPLACE FUNCTION public.update_budget_spent()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_category TEXT;
  v_date DATE;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_user_id := OLD.user_id;
    v_category := OLD.category;
    v_date := OLD.date;
  ELSE
    v_user_id := NEW.user_id;
    v_category := NEW.category;
    v_date := NEW.date;
  END IF;

  UPDATE public.budgets
  SET spent_amount = (
    SELECT COALESCE(SUM(amount), 0)
    FROM public.transactions
    WHERE user_id = v_user_id
      AND category = v_category
      AND type = 'expense'
      AND date >= DATE_TRUNC('month', v_date)::DATE
      AND date < (DATE_TRUNC('month', v_date) + INTERVAL '1 month')::DATE
  ),
  updated_at = NOW()
  WHERE user_id = v_user_id
    AND category_name = v_category
    AND year_month = TO_CHAR(v_date, 'YYYY-MM');

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
