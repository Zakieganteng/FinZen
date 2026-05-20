# 📑 Product Requirement Document (PRD) v2.0
## FinZen - Web Pengelolaan Keuangan Gen Z

*Versi:* 2.0 (Updated berdasarkan user feedback)  
*Target Pengguna:* Generasi Z (usia 18–26 tahun, mahasiswa & pekerja muda, aktif digital)  
*Platform:* Web app (desktop & mobile browser)  
*Metode Desain:* User-Centered Design (ISO 9241-210)  
*Tujuan Utama:* Mengurangi cognitive load & meningkatkan konsistensi pencatatan keuangan

---

## 1. Latar Belakang & Masalah

### Masalah Existing
1. **Dashboard**: Informatif tapi belum mengarahkan tindakan, cognitive load tinggi, user cepat bosan
2. **Gamifikasi**: Motivasi mencatat belum konsisten, risiko over-gamification & financial anxiety
3. **Transaksi**: User malas & lupa mencatat, terlalu banyak langkah saat input
4. **Goals**: Sudah ada tapi belum actionable, proyeksi & motivasi jangka panjang kurang terasa

### Solusi yang Diusulkan
- Dashboard action-oriented dengan daily focus & insight otomatis
- Gamifikasi ringan non-kompetitif dengan badge & weekly challenge
- Input transaksi minim friksi dengan quick add global & smart suggestions
- Goals actionable dengan milestone notification & celebration state

---

## 2. Tujuan Produk (Updated)

### Primary Goals
1. **Mengurangi Cognitive Load**: Dashboard cepat dipahami dengan hierarki informasi jelas
2. **Meningkatkan Konsistensi**: Input transaksi lebih cepat & minim friksi
3. **Memotivasi Tanpa Tekanan**: Gamifikasi ringan fokus personal progress, bukan kompetisi
4. **Membangun Keterikatan Emosional**: Goals dengan milestone & celebration untuk motivasi jangka panjang

### Success Metrics
- **Waktu input transaksi**: < 30 detik (target: 15 detik)
- **Daily Active Users (DAU)**: Peningkatan 40% dalam 3 bulan
- **Retention rate mingguan**: ≥ 60% (dari baseline 30%)
- **Rata-rata streak per user**: ≥ 7 hari (dari baseline 3 hari)
- **Goal completion rate**: ≥ 50% (dari baseline 25%)

---

## 3. Fitur Utama (Enhanced)

### 3.1 Dashboard Action-Oriented

**Masalah yang Diselesaikan:**
- Dashboard existing informatif tapi tidak mengarahkan tindakan
- Cognitive load tinggi, user cepat bosan

**Fitur Baru:**

#### 3.1.1 Daily Focus Card
- **Deskripsi**: 1 aksi utama per hari yang ditampilkan di bagian atas dashboard
- **Logika**:
  - Jika belum catat transaksi hari ini → "Catat pengeluaran hari ini"
  - Jika budget hampir penuh → "Cek anggaran [kategori]"
  - Jika goal mendekati deadline → "Top up goal [nama]"
  - Jika streak baru dimulai → "Jaga streak hari ini"
- **Visual**: Card besar dengan CTA jelas, warna accent berbeda per prioritas
- **Interaction**: One-tap langsung ke aksi yang dimaksud

#### 3.1.2 Insight Otomatis Pengeluaran
- **Deskripsi**: Highlight pola penting pengeluaran dengan teks ringkas
- **Contoh Insight**:
  - "Pengeluaran [kategori] naik 30% vs minggu lalu"
  - "Hari ini sudah 80% dari budget harian ideal"
  - "Streak 5 hari! Pertahankan momentum"
  - "Goal [nama] butuh Rp 500k lagi untuk milestone 50%"
- **Visual**: Card kecil dengan icon, warna sesuai jenis insight (info/warning/success)
- **Frequency**: Maksimal 2-3 insight per hari untuk menghindari overload

#### 3.1.3 Micro-interaction pada Streak & Progress
- **Streak**: Animasi confetti ringan saat streak naik, pulse effect pada badge
- **Progress Bar**: Smooth animation saat progress update, color transition saat milestone
- **Summary Cards**: Hover effect dengan detail tooltip, subtle bounce saat value berubah

**Outcome:**
- Dashboard jadi pusat arahan tindakan
- User lebih cepat memahami kondisi keuangan
- Cognitive load berkurang lewat hierarki informasi jelas

---

### 3.2 Gamifikasi Ringan Non-Kompetitif

**Masalah yang Diselesaikan:**
- Motivasi mencatat belum konsisten
- Risiko over-gamification & financial anxiety

**Prinsip Desain:**
- Gamification loop: **Action → Feedback → Reward**
- Tidak kompetitif, fokus ke **personal progress**
- Reward ringan, tidak menekan secara finansial

**Fitur Baru:**

#### 3.2.1 Badge Pencapaian
- **Kategori Badge**:
  - **Consistency**: "First Week" (7 hari streak), "Month Warrior" (30 hari streak)
  - **Transaction**: "Record Keeper" (100 transaksi), "Daily Tracker" (30 hari berturut-turut)
  - **Budget**: "Budget Master" (1 bulan tidak overspend), "Smart Spender" (3 bulan on track)
  - **Goals**: "Goal Getter" (1 goal tercapai), "Multi Achiever" (3 goals tercapai)
- **Visual**: Badge icon dengan nama, unlock animation, koleksi di profile section
- **Storage**: `finzen-badges` di localStorage

#### 3.2.2 Weekly Challenge Ringan
- **Deskripsi**: Challenge personal mingguan yang tidak menekan
- **Contoh Challenge**:
  - "Catat 5 transaksi minggu ini" → Reward: Badge "Week Starter"
  - "Jaga budget semua kategori di bawah 80%" → Reward: Insight "Budget Pro"
  - "Top up goal minimal 1x" → Reward: Celebration animation
- **Visual**: Card challenge di dashboard dengan progress bar, deadline countdown
- **Frequency**: 1 challenge per minggu, otomatis reset setiap Senin

#### 3.2.3 Feedback Instan Setelah Aksi
- **Input Transaksi**: 
  - Toast notification: "✓ Transaksi tercatat! Streak +1"
  - Subtle animation pada summary card yang terupdate
- **Saving/Goal Progress**:
  - Milestone alert dengan confetti (25%, 50%, 75%, 100%)
  - Progress bar animation dengan color transition
- **Budget Update**:
  - Visual feedback saat adjust budget (+50k/-50k)
  - Status update dengan smooth transition

**Outcome:**
- Gamifikasi mendorong kebiasaan mencatat bertahap
- Engagement meningkat tanpa tekanan finansial
- User merasa dihargai setiap aksi kecil

---

### 3.3 Input Transaksi Minim Friksi

**Masalah yang Diselesaikan:**
- User malas & sering lupa mencatat transaksi
- Terlalu banyak langkah saat input

**Prinsip Desain:**
- **Efisiensi**: Minim langkah, maksim kecepatan
- **Minim Friksi**: One-flow interaction
- **Smart Defaults**: Pre-fill data yang mungkin

**Fitur Baru:**

#### 3.3.1 Quick Add Button Global
- **Deskripsi**: Floating action button (FAB) yang selalu terlihat di semua halaman
- **Position**: Bottom-right corner, sticky saat scroll
- **Visual**: Circular button dengan icon "+", shadow untuk depth
- **Interaction**: 
  - Click → Modal quick add langsung terbuka
  - Modal pre-filled dengan: tanggal hari ini, kategori terakhir digunakan
  - Hanya perlu input: amount & note (opsional)

#### 3.3.2 Smart Category Suggestion
- **Deskripsi**: AI-like suggestion kategori berdasarkan pola pengguna
- **Logika**:
  - Kategori terakhir digunakan (priority 1)
  - Kategori paling sering di waktu yang sama (priority 2)
  - Kategori default berdasarkan waktu (priority 3)
    - Pagi (06-12): Makan
    - Siang (12-18): Transportasi/Makan
    - Malam (18-24): Hiburan
- **Visual**: Dropdown dengan kategori teratas di highlight, atau chips untuk quick select

#### 3.3.3 One-Tap Repeat Transaksi
- **Deskripsi**: Tombol "Ulangi" untuk transaksi yang sering dilakukan
- **Logika**: 
  - Deteksi transaksi dengan kategori & amount yang sama dalam 7 hari terakhir
  - Tampilkan sebagai "Quick Repeat" di modal add transaction
- **Visual**: Card kecil dengan detail transaksi terakhir, tombol "Ulangi" dengan icon refresh
- **Interaction**: Click "Ulangi" → Auto-fill form, user hanya perlu konfirmasi atau edit amount

**Outcome:**
- Waktu input transaksi < 15 detik (dari baseline 45 detik)
- Konsistensi pencatatan meningkat
- Cognitive load & interaction cost menurun

---

### 3.4 Goals Actionable dengan Milestone & Celebration

**Masalah yang Diselesaikan:**
- Goals sudah ada tapi belum actionable
- Proyeksi dan motivasi jangka panjang kurang terasa

**Fitur Baru:**

#### 3.4.1 Rekomendasi Tabungan Otomatis
- **Deskripsi**: Kalkulasi & rekomendasi tabungan per bulan berdasarkan due date
- **Enhancement Existing**:
  - Tampilkan lebih prominent di goal card
  - Visual indicator: "Aman" (hijau), "Mengejar" (kuning), "Kritis" (merah)
  - Action button: "Set Reminder" untuk notifikasi bulanan
- **Visual**: Card rekomendasi dengan breakdown: "Butuh Rp X/bulan untuk mencapai target"

#### 3.4.2 Milestone Notification Enhanced
- **Deskripsi**: Upgrade milestone alert dengan visual celebration
- **Milestone**: 25%, 50%, 75%, 100%
- **Visual**:
  - Modal celebration dengan confetti animation
  - Progress bar dengan milestone markers
  - Badge unlock untuk milestone tertentu
- **Message**:
  - 25%: "🔥 Keren! Sudah melewati 25% target."
  - 50%: "💪 Mantap! Setengah jalan sudah terlewati."
  - 75%: "👏 Hebat! Hampir sampai di finish line."
  - 100%: "🎉 Selamat! Goal tercapai 100%! Achievement Unlocked!"

#### 3.4.3 Celebration State saat Goal Tercapai
- **Deskripsi**: Full celebration experience saat goal mencapai 100%
- **Visual**:
  - Full-screen celebration modal dengan confetti
  - Achievement badge unlock animation
  - Share button untuk posting ke social media (optional)
- **Action**: 
  - "Buat Goal Baru" → Redirect ke goal creation
  - "Lihat Detail" → Show goal history & stats
  - "Tutup" → Return to goals page dengan goal marked as "Completed"

**Outcome:**
- Goals lebih terarah & actionable
- Motivasi jangka panjang meningkat
- Keterikatan emosional user terhadap goals

---

## 4. Alur Pengguna (User Flow) - Updated

### 4.1 First Time User (Enhanced)
```
1. Akses aplikasi → /onboarding
2. Pilih tema (Light/Dark) → Preview
3. Quick actions preview → Charts preview
4. Klik "Mulai Sekarang" → Redirect ke /
5. Daily Focus Card muncul dengan aksi: "Catat pengeluaran hari ini"
6. Quick Expense Modal muncul (existing)
7. User catat transaksi → Feedback instan: "✓ Transaksi tercatat! Streak +1"
8. Dashboard update dengan insight otomatis
```

### 4.2 Daily Usage Flow (Enhanced)
```
1. Akses aplikasi → Dashboard load
2. Daily Focus Card menampilkan aksi prioritas hari ini
3. Insight otomatis muncul (maksimal 2-3)
4. User bisa:
   a. Quick add via FAB → Smart category suggestion → One-tap save
   b. Klik Daily Focus → Direct action
   c. Lihat insight → Understand pattern
5. Setiap aksi → Feedback instan (toast, animation)
6. Weekly challenge progress update
```

### 4.3 Transaction Input Flow (Enhanced)
```
1. User klik FAB atau "Tambah Transaksi"
2. Modal quick add terbuka dengan:
   - Date: Hari ini (pre-filled)
   - Category: Smart suggestion (terakhir/paling sering)
   - Amount: Empty (required)
   - Note: Empty (optional)
3. User input amount → Category auto-suggest jika amount mirip
4. User bisa:
   a. Pilih "Ulangi" jika ada transaksi serupa
   b. Pilih kategori dari suggestion chips
   c. Manual select dari dropdown
5. Click "Simpan" → 
   - Toast: "✓ Transaksi tercatat! Streak +1"
   - Animation pada summary card
   - Modal tutup
   - Dashboard update
```

### 4.4 Goal Management Flow (Enhanced)
```
1. User di halaman Goals
2. Goal card menampilkan:
   - Progress bar dengan milestone markers
   - Rekomendasi tabungan per bulan (prominent)
   - Status: "Aman" / "Mengejar" / "Kritis"
3. User klik "+ Top up"
4. Modal top up → Input amount
5. Simpan → 
   - Progress update dengan animation
   - Check milestone (25%, 50%, 75%, 100%)
   - Jika milestone → Celebration modal dengan confetti
   - Badge unlock (jika applicable)
6. Jika 100% → Full celebration state
   - Confetti animation
   - Achievement badge
   - Share option (optional)
```

---

## 5. Guideline UI/UX (Updated)

### 5.1 Visual Hierarchy
- **Priority 1**: Daily Focus Card (besar, warna accent, CTA jelas)
- **Priority 2**: Summary Cards (4 cards, equal size)
- **Priority 3**: Insight Cards (kecil, maksimal 2-3)
- **Priority 4**: Charts & Visualizations (secondary information)

### 5.2 Micro-interactions
- **Button Hover**: Subtle scale (1.02x) dengan shadow increase
- **Card Hover**: Lift effect (-2px translateY) dengan shadow
- **Progress Update**: Smooth animation (300ms ease-out)
- **Streak Update**: Confetti ringan (particle count: 20-30)
- **Milestone**: Celebration modal dengan confetti (particle count: 50-100)

### 5.3 Color System (Enhanced)
- **Primary**: Biru (#3B82F6) - Stabilitas & keuangan
- **Success**: Hijau (#22C55E) - Progress & achievement
- **Warning**: Kuning (#EAB308) - Attention & milestone
- **Danger**: Merah (#EF4444) - Overspend & kritis
- **Accent**: Ungu (#A855F7) - Highlight & celebration
- **Muted**: Gray scale untuk secondary information

### 5.4 Typography
- **Heading**: Geist Sans, bold, 24-32px
- **Body**: Geist Sans, regular, 14-16px
- **Caption**: Geist Sans, regular, 12px, muted color
- **CTA**: Geist Sans, semibold, 14-16px

### 5.5 Spacing & Layout
- **Card Padding**: 16-24px
- **Card Gap**: 16-24px
- **Section Gap**: 32-48px
- **Max Content Width**: 1280px (centered)

---

## 6. Teknologi & Implementasi

### 6.1 Tech Stack (Existing)
- **Framework**: Next.js 15.5.9 (App Router)
- **React**: 19.1.0
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts 3.2.1
- **Storage**: localStorage (client-side)

### 6.2 Libraries Tambahan (Proposed)
- **Animation**: Framer Motion (untuk micro-interactions & confetti)
- **Toast**: Sonner atau react-hot-toast (untuk feedback instan)
- **Icons**: Lucide React (untuk icon system yang konsisten)

### 6.3 Data Structure (Enhanced)

#### Badge System
```javascript
{
  id: string,
  name: string,
  description: string,
  icon: string,
  category: 'consistency' | 'transaction' | 'budget' | 'goal',
  unlockedAt: string, // ISO date
  progress: number // 0-100
}
```

#### Weekly Challenge
```javascript
{
  id: string,
  week: string, // YYYY-WW format
  type: 'transaction' | 'budget' | 'goal',
  target: number,
  current: number,
  reward: string, // badge ID or celebration type
  deadline: string // ISO date
}
```

#### Smart Category Suggestion
```javascript
{
  category: string,
  confidence: number, // 0-1
  reason: string, // 'last_used' | 'time_pattern' | 'frequency'
  lastUsed: string, // ISO date
  frequency: number // count in last 7 days
}
```

---

## 7. Prioritas Implementasi

### Phase 1: Quick Wins (Week 1-2)
1. ✅ Quick Add Button Global (FAB)
2. ✅ Smart Category Suggestion (basic)
3. ✅ Feedback Instan (Toast notifications)
4. ✅ Micro-interactions pada Progress Bar

### Phase 2: Core Features (Week 3-4)
1. ✅ Daily Focus Card
2. ✅ Insight Otomatis Pengeluaran
3. ✅ Badge System (basic)
4. ✅ Milestone Celebration Enhanced

### Phase 3: Advanced Features (Week 5-6)
1. ✅ Weekly Challenge
2. ✅ One-Tap Repeat Transaksi
3. ✅ Full Celebration State
4. ✅ Share Functionality (optional)

### Phase 4: Polish & Optimization (Week 7-8)
1. ✅ Performance optimization
2. ✅ Animation fine-tuning
3. ✅ A/B testing untuk insight frequency
4. ✅ User feedback collection

---

## 8. Success Metrics & KPI

### Primary Metrics
- **Waktu Input Transaksi**: < 15 detik (baseline: 45 detik)
- **Daily Active Users (DAU)**: +40% dalam 3 bulan
- **Retention Rate Mingguan**: ≥ 60% (baseline: 30%)
- **Rata-rata Streak per User**: ≥ 7 hari (baseline: 3 hari)
- **Goal Completion Rate**: ≥ 50% (baseline: 25%)

### Secondary Metrics
- **Badge Unlock Rate**: ≥ 30% user unlock minimal 1 badge
- **Weekly Challenge Completion**: ≥ 40% user complete challenge
- **Daily Focus Card CTR**: ≥ 60% user klik daily focus
- **Insight Engagement**: ≥ 50% user melihat insight detail

### Qualitative Metrics
- **User Satisfaction**: SUS score ≥ 75 (baseline: 65)
- **Cognitive Load**: User report "mudah dipahami" ≥ 80%
- **Motivation**: User report "termotivasi tanpa tekanan" ≥ 70%

---

## 9. Risiko & Mitigasi

### Risiko 1: Over-gamification
- **Mitigasi**: Fokus personal progress, tidak kompetitif, reward ringan

### Risiko 2: Cognitive Load Masih Tinggi
- **Mitigasi**: Limit insight maksimal 2-3 per hari, hierarki visual jelas

### Risiko 3: Performance Issue dengan Animation
- **Mitigasi**: Lazy load animation, optimize confetti particle count

### Risiko 4: User Tidak Menggunakan FAB
- **Mitigasi**: Onboarding hint, tooltip pertama kali, A/B test positioning

---

## 10. Definisi "Done"

### Feature Complete
- ✅ Semua fitur Phase 1-3 implemented
- ✅ Responsive di mobile & desktop
- ✅ Dark mode support
- ✅ Accessibility (WCAG 2.1 AA minimum)

### Quality Assurance
- ✅ No critical bugs
- ✅ Performance: Lighthouse score ≥ 90
- ✅ Cross-browser testing (Chrome, Firefox, Safari, Edge)

### Documentation
- ✅ Code comments untuk complex logic
- ✅ User guide untuk fitur baru
- ✅ Changelog untuk version update

---

## 11. Catatan untuk Developer

### Key Principles
1. **Minim Friksi**: Setiap interaksi harus cepat & jelas
2. **Feedback Instan**: Setiap aksi harus ada feedback visual
3. **Progressive Enhancement**: Fitur baru tidak break existing flow
4. **Performance First**: Animation smooth, load time minimal

### Code Organization
- **Components**: Organize by feature (dashboard/, transactions/, goals/)
- **Hooks**: Custom hooks untuk logic reuse (useStreak, useBadges, useSmartCategory)
- **Utils**: Helper functions untuk calculation & formatting
- **Constants**: Badge definitions, challenge templates, insight rules

---

**Dokumen ini adalah living document dan akan diupdate berdasarkan feedback user & hasil testing.**

*Last Updated: [Date]*
*Version: 2.0*

