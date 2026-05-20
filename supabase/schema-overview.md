# Database Schema Overview

Dokumentasi lengkap struktur database FinZen.

## 📊 Database Diagram

```
┌─────────────────┐
│   auth.users    │ (Supabase Auth)
└────────┬────────┘
         │
         │ 1:1
         ▼
┌─────────────────┐
│     users       │ (Profile: name, email, theme)
└────────┬────────┘
         │
         │ 1:N
         ├─────────────────────────────────────────────┐
         │                                             │
         ▼                                             ▼
┌─────────────────┐                    ┌─────────────────┐
│  transactions   │                    │     budgets     │
│  - date         │                    │  - year_month   │
│  - category     │                    │  - category_id  │
│  - amount       │                    │  - budget_amount│
│  - note         │                    │  - spent_amount │
└─────────────────┘                    └─────────────────┘
         │
         │
         ▼
┌─────────────────┐
│     goals       │
│  - title        │
│  - target       │
│  - saved        │
│  - due_date     │
│  - completed    │
└────────┬────────┘
         │ 1:N
         ▼
┌─────────────────┐
│  goal_history   │
│  - amount       │
│  - date         │
│  - note         │
└─────────────────┘

┌─────────────────┐
│unlocked_badges │
│  - badge_id     │
│  - unlocked_at  │
└─────────────────┘

┌─────────────────┐
│weekly_challenges│
│  - week_string  │
│  - progress     │
│  - target       │
│  - completed    │
└─────────────────┘

┌─────────────────┐
│    feedback     │
│  - rating       │
│  - category     │
│  - comment      │
└─────────────────┘

┌─────────────────┐
│ab_testing_metrics│
│  - variant      │
│  - metric       │
│  - value        │
└─────────────────┘

┌─────────────────┐
│user_preferences │
│  - ab_variant   │
│  - last_category│
└─────────────────┘
```

## 📋 Tables Detail

### 1. users
Extends Supabase auth.users dengan profile data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, FK → auth.users | User ID (same as auth.users.id) |
| email | TEXT | NOT NULL | User email |
| name | TEXT | NOT NULL | User display name |
| theme | TEXT | DEFAULT 'light' | UI theme preference |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Relationships:**
- 1:1 dengan `auth.users`
- 1:N dengan semua other tables

---

### 2. transactions
Financial transactions (income/expenses).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Transaction ID |
| user_id | UUID | FK → users.id | Owner user |
| date | DATE | NOT NULL | Transaction date |
| category | TEXT | NOT NULL | Category name |
| amount | NUMERIC(15,2) | NOT NULL, >= 0 | Transaction amount |
| note | TEXT | NULL | Optional note |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- user_id
- date
- user_id + date (composite)
- category
- user_id + category (composite)

---

### 3. budgets
Monthly budgets per category.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Budget ID |
| user_id | UUID | FK → users.id | Owner user |
| category_id | TEXT | NOT NULL | Category identifier |
| category_name | TEXT | NOT NULL | Category display name |
| year_month | TEXT | NOT NULL | Format: 'YYYY-MM' |
| budget_amount | NUMERIC(15,2) | NOT NULL, >= 0 | Budget limit |
| spent_amount | NUMERIC(15,2) | DEFAULT 0, >= 0 | Current spending |
| color | TEXT | NULL | Hex color code |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Unique Constraint:**
- (user_id, category_id, year_month)

**Indexes:**
- user_id
- year_month
- user_id + year_month (composite)
- category_id

**Triggers:**
- Auto-update spent_amount dari transactions

---

### 4. goals
Savings goals/targets.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Goal ID |
| user_id | UUID | FK → users.id | Owner user |
| title | TEXT | NOT NULL | Goal title |
| target | NUMERIC(15,2) | NOT NULL, > 0 | Target amount |
| saved | NUMERIC(15,2) | DEFAULT 0, >= 0 | Current saved amount |
| due_date | DATE | NULL | Target completion date |
| priority | TEXT | DEFAULT 'normal' | Priority level |
| completed | BOOLEAN | DEFAULT FALSE | Completion status |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- user_id
- completed
- due_date (where not null)
- user_id + completed (composite)

**Triggers:**
- Auto-update saved dari goal_history inserts

---

### 5. goal_history
History of goal top-ups.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | History entry ID |
| goal_id | UUID | FK → goals.id | Related goal |
| user_id | UUID | FK → users.id | Owner user |
| amount | NUMERIC(15,2) | NOT NULL, > 0 | Top-up amount |
| date | DATE | DEFAULT CURRENT_DATE | Top-up date |
| note | TEXT | NULL | Optional note |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Indexes:**
- goal_id
- user_id
- date
- user_id + date (composite)

**Triggers:**
- Auto-update goal.saved saat insert

---

### 6. unlocked_badges
User achievement badges.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Badge unlock ID |
| user_id | UUID | FK → users.id | Owner user |
| badge_id | TEXT | NOT NULL | Badge identifier |
| unlocked_at | TIMESTAMPTZ | DEFAULT NOW() | Unlock timestamp |

**Unique Constraint:**
- (user_id, badge_id)

**Indexes:**
- user_id
- badge_id
- unlocked_at

**Note:** Immutable - no UPDATE/DELETE policies

---

### 7. weekly_challenges
Weekly challenges for users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Challenge ID |
| user_id | UUID | FK → users.id | Owner user |
| challenge_id | TEXT | NOT NULL | Challenge template ID |
| challenge_type | TEXT | NOT NULL | Type: transaction_count, budget_track, goal_topup |
| title | TEXT | NOT NULL | Challenge title |
| description | TEXT | NULL | Challenge description |
| week_string | TEXT | NOT NULL | Format: 'YYYY-WW' |
| start_date | DATE | NOT NULL | Challenge start date |
| end_date | DATE | NOT NULL | Challenge end date |
| progress | NUMERIC(15,2) | DEFAULT 0, >= 0 | Current progress |
| target | NUMERIC(15,2) | NOT NULL, > 0 | Target value |
| completed | BOOLEAN | DEFAULT FALSE | Completion status |
| reward_type | TEXT | NULL | Reward type |
| reward_value | TEXT | NULL | Reward value |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Unique Constraint:**
- (user_id, week_string)

**Indexes:**
- user_id
- week_string
- user_id + week_string (composite)
- completed

---

### 8. feedback
User feedback submissions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Feedback ID |
| user_id | UUID | FK → users.id | Owner user |
| rating | INTEGER | NOT NULL, 1-5 | Rating (1-5 stars) |
| category | TEXT | NOT NULL | Feedback category |
| comment | TEXT | NULL | Optional comment |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Indexes:**
- user_id
- rating
- category
- created_at

**Note:** Immutable - no UPDATE/DELETE policies

---

### 9. ab_testing_metrics
A/B testing metrics tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Metric ID |
| user_id | UUID | FK → users.id | Owner user |
| variant | TEXT | NOT NULL | Variant: A, B, or C |
| metric | TEXT | NOT NULL | Metric name |
| value | TEXT | NULL | Metric value (JSON or text) |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Indexes:**
- user_id
- variant
- metric
- user_id + variant (composite)
- created_at

**Note:** Immutable - no UPDATE/DELETE policies

---

### 10. user_preferences
User preferences and settings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Preference ID |
| user_id | UUID | FK → users.id | UNIQUE | Owner user |
| ab_variant | TEXT | NULL | A/B test variant |
| last_category | TEXT | NULL | Last used category |
| last_expense_prompt_date | DATE | NULL | Last expense prompt date |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- user_id (unique)

---

## 🔒 Security (RLS Policies)

Semua tables memiliki Row Level Security (RLS) enabled dengan policies:

- **SELECT**: Users hanya bisa read data mereka sendiri
- **INSERT**: Users hanya bisa insert data untuk diri mereka sendiri
- **UPDATE**: Users hanya bisa update data mereka sendiri
- **DELETE**: Users hanya bisa delete data mereka sendiri (kecuali immutable tables)

**Policy Pattern:**
```sql
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id)
```

---

## ⚡ Performance Optimizations

### Indexes
- Foreign keys (user_id, goal_id, etc.)
- Frequent query columns (date, category, etc.)
- Composite indexes untuk common query patterns

### Triggers
- Auto-update `updated_at` timestamps
- Auto-calculate budget spent dari transactions
- Auto-update goal saved dari history

---

## 📝 Notes

1. **UUID**: Semua primary keys menggunakan UUID untuk security
2. **Timestamps**: Semua menggunakan `TIMESTAMP WITH TIME ZONE`
3. **Cascade Delete**: Foreign keys menggunakan `ON DELETE CASCADE`
4. **Data Validation**: Check constraints untuk amount >= 0, rating 1-5, etc.
5. **Immutable Data**: Badges, feedback, dan metrics tidak bisa di-update/delete


