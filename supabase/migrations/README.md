# Supabase Migrations

File-file SQL migration untuk setup database FinZen di Supabase.

## Urutan Eksekusi

Jalankan migration files dalam urutan berikut:

1. **001_initial_schema.sql** - Create semua tables
2. **002_rls_policies.sql** - Setup Row Level Security policies
3. **003_indexes.sql** - Create indexes untuk performance
4. **004_triggers.sql** - Setup triggers (auto-update timestamps, etc.)

## Cara Menjalankan

### Via Supabase Dashboard
1. Buka Supabase Dashboard
2. Pilih project Anda
3. Pergi ke **SQL Editor**
4. Copy-paste setiap file SQL secara berurutan
5. Klik **Run**

### Via Supabase CLI
```bash
# Install Supabase CLI terlebih dahulu
npm install -g supabase

# Login ke Supabase
supabase login

# Link ke project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

## Struktur Database

### Tables Overview

1. **users** - User profiles (extends auth.users)
2. **transactions** - Financial transactions
3. **budgets** - Monthly budgets per category
4. **goals** - Savings goals
5. **goal_history** - Goal top-up history
6. **unlocked_badges** - User badges
7. **weekly_challenges** - Weekly challenges
8. **feedback** - User feedback
9. **ab_testing_metrics** - A/B testing metrics
10. **user_preferences** - User preferences

### Security

- Semua tables memiliki **Row Level Security (RLS)** enabled
- Users hanya bisa akses data mereka sendiri (`user_id = auth.uid()`)
- Policies untuk SELECT, INSERT, UPDATE, DELETE sudah disetup

### Performance

- Indexes sudah dibuat untuk:
  - Foreign keys (user_id, goal_id, etc.)
  - Frequent queries (date, category, etc.)
  - Composite indexes untuk common query patterns

### Automation

- **Triggers** untuk:
  - Auto-update `updated_at` timestamp
  - Auto-create user profile saat signup
  - Auto-update goal saved amount saat history insert
  - Auto-update budget spent amount dari transactions

## Notes

- Semua timestamps menggunakan `TIMESTAMP WITH TIME ZONE`
- UUID menggunakan extension `uuid-ossp`
- Check constraints untuk data validation
- Foreign keys dengan `ON DELETE CASCADE` untuk data integrity

## Troubleshooting

Jika ada error saat menjalankan migration:

1. Pastikan Supabase project sudah dibuat
2. Pastikan extension `uuid-ossp` sudah enabled
3. Pastikan auth.users table sudah ada (dibuat otomatis oleh Supabase)
4. Check error message untuk detail masalah


