"use client";

import { SummaryCard, ProgressBar, Card, SectionHeader, QuickExpenseModal, BalanceModal } from "./ui";
import DailyFocusCard from "./components/DailyFocusCard";
import InsightCards from "./components/InsightCards";
import WeeklyChallengeCard from "./components/WeeklyChallengeCard";
import BadgeUnlockModal from "./components/BadgeUnlockModal";
import RecordingBadgesCard from "./components/RecordingBadgesCard";
import { pickRecordingBadgeUnlock } from "../lib/badges";
import ProtectedRoute from "../components/ProtectedRoute";
import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { getDailyFocusAction, calculateStreak, checkBadges, showToast } from "../lib/utils";
import { useAuth } from "../contexts/AuthContext";
import { getTransactions, getBudgets, getGoals, getGoalHistory, createTransaction, updateUserInitialBalance } from "../lib/supabase/data-service";
import { calculateBalance, isExpense } from "../lib/balance";

// Lazy load Recharts components
const ResponsiveContainer = dynamic(() => import("recharts").then(mod => mod.ResponsiveContainer), { ssr: false });
const BarChart = dynamic(() => import("recharts").then(mod => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then(mod => mod.Bar), { ssr: false });
const XAxis = dynamic(() => import("recharts").then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then(mod => mod.YAxis), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then(mod => mod.Tooltip), { ssr: false });
const LineChart = dynamic(() => import("recharts").then(mod => mod.LineChart), { ssr: false });
const Line = dynamic(() => import("recharts").then(mod => mod.Line), { ssr: false });

export default function Home() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const [openQuickExpense, setOpenQuickExpense] = useState(false);
  const [openBalanceModal, setOpenBalanceModal] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [userGoals, setUserGoals] = useState([]);
  const [goalHistory, setGoalHistory] = useState([]);
  const [badgeUnlock, setBadgeUnlock] = useState({ open: false, badgeId: null });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (authLoading || !user?.id) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const today = new Date();
        const ymd = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
        const last = typeof window !== "undefined" ? localStorage.getItem("finzen-last-expense-prompt") : null;
        if (last !== ymd) {
          setOpenQuickExpense(true);
        }

        // Fetch from Supabase
        const [txResult, budgetsResult, goalsResult, historyResult] = await Promise.all([
          getTransactions(user.id),
          getBudgets(user.id, `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`),
          getGoals(user.id),
          getGoalHistory(user.id),
        ]);

        if (txResult.error) throw txResult.error;
        if (budgetsResult.error) throw budgetsResult.error;
        if (goalsResult.error) throw goalsResult.error;
        if (historyResult.error) throw historyResult.error;

        // Convert database format to app format
        const tx = (txResult.data || []).map(t => ({
          id: t.id,
          date: t.date,
          category: t.category,
          type: t.type || "expense",
          amount: parseFloat(t.amount),
          note: t.note || "",
        }));

        const bg = (budgetsResult.data || []).map(b => ({
          id: b.category_id,
          name: b.category_name,
          color: b.color || "#3B82F6",
          budget: parseFloat(b.budget_amount),
          spent: parseFloat(b.spent_amount || 0),
        }));

        const g = (goalsResult.data || []).map(gl => ({
          id: gl.id,
          title: gl.title,
          target: parseFloat(gl.target),
          saved: parseFloat(gl.saved || 0),
          due_date: gl.due_date,
          priority: gl.priority || "normal",
          completed: gl.completed || false,
        }));

        const h = (historyResult.data || []).map(hist => ({
          id: hist.id,
          goalId: hist.goal_id,
          date: hist.date,
          amount: parseFloat(hist.amount),
          note: hist.note || "",
        }));

        setTransactions(tx);
        setBudgets(bg);
        setUserGoals(g);
        setGoalHistory(h);

        // Check badges on mount
        const streak = calculateStreak(tx);
        const transactionCount = tx.length;
        
        // Get consecutive days
        const dates = [...new Set(tx.map(t => t.date))].sort((a, b) => b.localeCompare(a));
        let consecutiveDays = 0;
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);
        let currentDate = new Date(todayDate);
        for (const dateStr of dates) {
          const txDate = new Date(dateStr);
          txDate.setHours(0, 0, 0, 0);
          const diffDays = Math.floor((currentDate - txDate) / (1000 * 60 * 60 * 24));
          if (diffDays === consecutiveDays) {
            consecutiveDays++;
            currentDate.setDate(currentDate.getDate() - 1);
          } else {
            break;
          }
        }
        
        // Check all badge types
        const newlyUnlocked = [
          ...checkBadges("streak", { streak }),
          ...checkBadges("transaction", { transactionCount, consecutiveDays }),
          ...checkBadges("goal", { completedGoals: g.filter(gl => gl.saved >= gl.target).length }),
        ];
        
        const badgeId = pickRecordingBadgeUnlock(newlyUnlocked);
        if (badgeId) {
          setBadgeUnlock({ open: true, badgeId });
        }
      } catch (error) {
        console.error("Error loading data:", error);
        showToast("Gagal memuat data. Coba refresh halaman.", "error");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id, authLoading]);

  useEffect(() => {
    const onFabTransaction = (e) => {
      const tx = e.detail;
      if (!tx?.id) return;

      setTransactions((prev) => {
        if (prev.some((t) => t.id === tx.id)) return prev;
        return [tx, ...prev];
      });

      const today = new Date();
      const ym = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
      const txYm = String(tx.date).slice(0, 7);
      if (txYm === ym && (tx.type || "expense") === "expense") {
        setBudgets((prev) =>
          prev.map((b) =>
            b.name === tx.category ? { ...b, spent: b.spent + tx.amount } : b
          )
        );
      }
    };

    const onTransactionDeleted = (e) => {
      const tx = e.detail;
      if (!tx?.id) return;

      setTransactions((prev) => prev.filter((t) => t.id !== tx.id));

      const today = new Date();
      const ym = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
      const txYm = String(tx.date).slice(0, 7);
      if (txYm === ym && (tx.type || "expense") === "expense") {
        setBudgets((prev) =>
          prev.map((b) =>
            b.name === tx.category
              ? { ...b, spent: Math.max(0, b.spent - tx.amount) }
              : b
          )
        );
      }
    };

    const onBudgetDeleted = (e) => {
      const { categoryId, name } = e.detail || {};
      setBudgets((prev) =>
        prev.filter((b) => {
          if (categoryId && b.id === categoryId) return false;
          if (name && b.name === name) return false;
          return true;
        })
      );
    };

    window.addEventListener("finzen:transaction-added", onFabTransaction);
    window.addEventListener("finzen:transaction-deleted", onTransactionDeleted);
    window.addEventListener("finzen:budget-deleted", onBudgetDeleted);
    return () => {
      window.removeEventListener("finzen:transaction-added", onFabTransaction);
      window.removeEventListener("finzen:transaction-deleted", onTransactionDeleted);
      window.removeEventListener("finzen:budget-deleted", onBudgetDeleted);
    };
  }, []);

  const streak = useMemo(() => calculateStreak(transactions), [transactions]);
  const dailyFocusAction = useMemo(() => 
    getDailyFocusAction(transactions, budgets, userGoals, streak),
    [transactions, budgets, userGoals, streak]
  );

  // Calculate dashboard summary from real data
  const dashboardSummary = useMemo(() => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    
    const initialBalance = parseFloat(user?.initial_balance) || 0;

    // Today spending (pengeluaran saja)
    const todaySpending = transactions
      .filter((t) => t.date === todayStr && isExpense(t))
      .reduce((sum, t) => sum + t.amount, 0);

    // Monthly budget used percentage
    const totalBudget = budgets.reduce((sum, b) => sum + b.budget, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
    const monthlyBudgetUsedPct = totalBudget > 0 ? totalSpent / totalBudget : 0;

    // Goals progress average
    const goalsProgressAvg = userGoals.length > 0
      ? userGoals.reduce((sum, g) => sum + (g.saved / g.target), 0) / userGoals.length
      : 0;

    const balance = calculateBalance(initialBalance, transactions);

    return {
      balance,
      todaySpending,
      monthlyBudgetUsedPct,
      goalsProgressAvg,
    };
  }, [transactions, budgets, userGoals, user?.initial_balance]);

  // Calculate monthly spending by category
  const monthlySpendingByCategory = useMemo(() => {
    const today = new Date();
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
    
    const monthTransactions = transactions.filter(t => t.date.startsWith(currentMonth));
    const categoryMap = new Map();
    
    monthTransactions.filter(isExpense).forEach(t => {
      const current = categoryMap.get(t.category) || 0;
      categoryMap.set(t.category, current + t.amount);
    });

    return Array.from(categoryMap.entries()).map(([category, value]) => ({
      category,
      value,
    }));
  }, [transactions]);

  if (loading || authLoading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6] mx-auto mb-4"></div>
            <p className="text-muted">Memuat data...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="space-y-8">
      <QuickExpenseModal 
        open={openQuickExpense} 
        onClose={() => setOpenQuickExpense(false)}
        onAdded={async (item) => {
          if (!user?.id) return;
          try {
            const { data, error } = await createTransaction(user.id, {
              ...item,
              type: item.type || "expense",
            });
            if (error) throw error;
            
            const newTransaction = {
              id: data.id,
              date: data.date,
              category: data.category,
              type: data.type || item.type || "expense",
              amount: parseFloat(data.amount),
              note: data.note || "",
            };
            
            setTransactions((prev) => {
              const updated = [newTransaction, ...prev];
              const transactionCount = updated.length;
              const newlyUnlocked = checkBadges("transaction", { transactionCount, consecutiveDays: 0 });
              const badgeId = pickRecordingBadgeUnlock(newlyUnlocked);
              if (badgeId) {
                setBadgeUnlock({ open: true, badgeId });
              }
              return updated;
            });
            showToast("✓ Transaksi tercatat! Streak +1", "success");
          } catch (error) {
            console.error("Error adding transaction:", error);
            showToast("Gagal menambahkan transaksi. Coba lagi.", "error");
          }
        }}
      />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Halo, {user?.name || "Pengguna"}</h1>
          <p className="text-sm text-muted">Jaga ritme finansialmu. Streak {streak} hari.</p>
        </div>
        <Card>
          <div className="text-xs uppercase tracking-wide text-muted">Streak</div>
          <div className="text-3xl font-semibold mt-1">{streak} 🔥</div>
        </Card>
      </div>

      <RecordingBadgesCard transactionCount={transactions.length} />

      <DailyFocusCard action={dailyFocusAction} />

      <WeeklyChallengeCard
        transactions={transactions}
        budgets={budgets}
        goals={userGoals}
        goalHistory={goalHistory}
      />

      <BalanceModal
        open={openBalanceModal}
        onClose={() => setOpenBalanceModal(false)}
        initialBalance={parseFloat(user?.initial_balance) || 0}
        onSave={async (amount) => {
          if (!user?.id) return;
          const { error } = await updateUserInitialBalance(user.id, amount);
          if (error) throw error;
          await refreshUser();
          showToast("Saldo awal berhasil disimpan.", "success");
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => setOpenBalanceModal(true)}
          className="text-left rounded-xl border border-base p-4 card hover:bg-black/[.03] dark:hover:bg-white/[.05] transition-colors"
          title="Klik untuk atur saldo awal"
        >
          <div className="text-xs uppercase tracking-wide text-muted">Saldo</div>
          <div className="text-2xl font-semibold mt-1">
            {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(dashboardSummary.balance)}
          </div>
          <p className="text-xs text-muted mt-1">Ketuk untuk atur saldo awal</p>
        </button>
        <SummaryCard title="Pengeluaran Hari Ini" value={dashboardSummary.todaySpending} type="currency" />
        <SummaryCard title="Budget Terpakai" value={dashboardSummary.monthlyBudgetUsedPct} type="percent" />
        <SummaryCard title="Rata-rata Progress Goals" value={dashboardSummary.goalsProgressAvg} type="percent" />
      </div>

      <InsightCards transactions={transactions} budgets={budgets} goals={userGoals} streak={streak} />

      <section>
        <SectionHeader title="Quick Actions" subtitle="Akses cepat fitur utama" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { href: "/transactions", title: "Tambah Transaksi", desc: "Catat pemasukan/pengeluaran harian.", icon: "➕" },
            { href: "/budgeting", title: "Atur Budget", desc: "Tetapkan batas per kategori.", icon: "📊" },
            { href: "/goals", title: "Buat Goals", desc: "Target tabungan dan progres.", icon: "🎯" },
            { href: "/reports", title: "Lihat Laporan", desc: "Ringkasan pengeluaran bulanan.", icon: "📈" },
          ].map((qa) => (
            <Link
              key={qa.href}
              href={qa.href}
              role="button"
              aria-label={qa.title}
              className="group rounded-xl border border-base p-4 card transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3B82F6] shadow-sm hover:shadow-lg hover:-translate-y-[2px] active:translate-y-[0]"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg flex items-center justify-center text-base ring-1 ring-[#93c5fd] bg-[rgba(59,130,246,0.12)] text-[#1d4ed8] group-hover:ring-[#60a5fa] group-hover:bg-[rgba(59,130,246,0.18)] transition-colors">
                    {qa.icon}
                  </div>
                  <div>
                    <div className="font-medium">{qa.title}</div>
                    <p className="text-sm text-muted mt-1">{qa.desc}</p>
                  </div>
                </div>
                <div className="h-8 w-8 rounded-full flex items-center justify-center text-lg bg-black/[.06] dark:bg-white/[.08] transition-all group-hover:translate-x-[3px] group-hover:shadow">
                  →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <SectionHeader title="Komposisi Pengeluaran" subtitle="Per kategori (bulan ini)" />
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={monthlySpendingByCategory}>
                <XAxis 
                  dataKey="category" 
                  tick={{ fill: 'var(--foreground)' }}
                  style={{ fill: 'var(--foreground)' }}
                />
                <YAxis 
                  tick={{ fill: 'var(--foreground)' }}
                  tickFormatter={(value) => {
                    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}JT`;
                    if (value >= 1000) return `${(value / 1000).toFixed(0)}RB`;
                    return value.toString();
                  }}
                />
                <Tooltip 
                  formatter={(value) => `Rp ${value.toLocaleString("id-ID")}`}
                  labelFormatter={(label) => `Kategori: ${label}`}
                  contentStyle={{ 
                    backgroundColor: 'var(--card)', 
                    border: '1px solid var(--border)',
                    color: 'var(--foreground)'
                  }}
                />
                <Bar dataKey="value" fill="#3B82F6" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <SectionHeader title="Tren Mingguan" subtitle="Aktivitas pengeluaran harian" />
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <LineChart data={(() => {
                // Calculate weekly spending (last 7 days)
                const today = new Date();
                const weekData = [];
                const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
                
                for (let i = 6; i >= 0; i--) {
                  const date = new Date(today);
                  date.setDate(date.getDate() - i);
                  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
                  const daySpending = transactions
                    .filter((t) => t.date === dateStr && isExpense(t))
                    .reduce((sum, t) => sum + t.amount, 0);
                  
                  weekData.push({
                    day: dayNames[date.getDay()],
                    value: daySpending,
                  });
                }
                
                return weekData;
              })()}>
                <XAxis 
                  dataKey="day" 
                  tick={{ fill: 'var(--foreground)' }}
                />
                <YAxis 
                  tick={{ fill: 'var(--foreground)' }}
                  tickFormatter={(value) => {
                    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}JT`;
                    if (value >= 1000) return `${(value / 1000).toFixed(0)}RB`;
                    return value.toString();
                  }}
                />
                <Tooltip 
                  formatter={(value) => `Rp ${value.toLocaleString("id-ID")}`}
                  labelFormatter={(label) => `Hari: ${label}`}
                  contentStyle={{ 
                    backgroundColor: 'var(--card)', 
                    border: '1px solid var(--border)',
                    color: 'var(--foreground)'
                  }}
                />
                <Line type="monotone" dataKey="value" stroke="#A855F7" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>

      <Card>
        <SectionHeader title="Motivasi" subtitle="Bangun kebiasaan finansial yang sehat" />
        <p className="text-sm text-black/80 dark:text-white/80">"Konsistensi kecil setiap hari membangun kebiasaan besar." — Catat transaksi hari ini dan jaga streakmu.</p>
      </Card>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <SectionHeader title="Anggaran per Kategori" subtitle="Progres pemakaian anggaran" />
          <div className="space-y-3">
            {budgets.length > 0 ? budgets.map((c) => {
              const pct = c.budget > 0 ? Math.min(1, c.spent / c.budget) : 0;
              return (
                <div key={c.id}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>{c.name}</span>
                    <span>{Math.round(pct * 100)}%</span>
                  </div>
                  <ProgressBar value={pct} color={c.color} current={c.spent} target={c.budget} showTooltip={true} />
                </div>
              );
            }) : (
              <p className="text-sm text-muted text-center py-4">Belum ada budget. Buat budget di halaman Budgeting.</p>
            )}
          </div>
        </Card>
        <Card>
          <SectionHeader title="Goals" subtitle="Pantau progres target tabungan" />
          <div className="space-y-3">
            {userGoals.length > 0 ? userGoals.map((g) => {
              const pct = g.target > 0 ? Math.min(1, g.saved / g.target) : 0;
              return (
                <div key={g.id}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>{g.title}</span>
                    <span>{Math.round(pct * 100)}%</span>
                  </div>
                  <ProgressBar value={pct} current={g.saved} target={g.target} showTooltip={true} />
                </div>
              );
            }) : (
              <p className="text-sm text-muted text-center py-4">Belum ada goals. Buat goals di halaman Goals.</p>
            )}
          </div>
        </Card>
      </section>
      
      <BadgeUnlockModal
        open={badgeUnlock.open}
        onClose={() => setBadgeUnlock({ open: false, badgeId: null })}
        badgeId={badgeUnlock.badgeId}
      />
      </div>
    </ProtectedRoute>
  );
}
