"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { ProgressBar, Card, SectionHeader, AddTransactionModal } from "../ui";
import { showToast } from "../../lib/utils";
import { useAuth } from "../../contexts/AuthContext";
import { getBudgets, upsertBudget, getTransactions } from "../../lib/supabase/data-service";

// Lazy load Recharts components
const ResponsiveContainer = dynamic(() => import("recharts").then(mod => mod.ResponsiveContainer), { ssr: false });
const PieChart = dynamic(() => import("recharts").then(mod => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import("recharts").then(mod => mod.Pie), { ssr: false });
const Cell = dynamic(() => import("recharts").then(mod => mod.Cell), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then(mod => mod.Tooltip), { ssr: false });
const Legend = dynamic(() => import("recharts").then(mod => mod.Legend), { ssr: false });

export default function BudgetingPage() {
  const { user, loading: authLoading } = useAuth();
  const [openAdd, setOpenAdd] = useState(false);
  const [addCat, setAddCat] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  useEffect(() => {
    if (authLoading || !user?.id) return;

    const loadBudgets = async () => {
      setLoading(true);
      try {
        const { data, error } = await getBudgets(user.id, ym);
        if (error) throw error;

        const bg = (data || []).map(b => ({
          id: b.category_id,
          name: b.category_name,
          color: b.color || "#3B82F6",
          budget: parseFloat(b.budget_amount),
          spent: parseFloat(b.spent_amount || 0),
        }));

        setCategories(bg);
      } catch (error) {
        console.error("Error loading budgets:", error);
        showToast("Gagal memuat budgets. Coba refresh halaman.", "error");
      } finally {
        setLoading(false);
      }
    };

    loadBudgets();
  }, [user?.id, ym, authLoading]);

  const totalBudget = useMemo(() => categories.reduce((s, c) => s + c.budget, 0), [categories]);
  const totalSpent = useMemo(() => categories.reduce((s, c) => s + c.spent, 0), [categories]);
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const day = now.getDate();
  const daysLeft = daysInMonth - day;
  const idealDaily = totalBudget / daysInMonth;
  const actualDaily = totalSpent / day;
  const forecast = Math.round(actualDaily * daysInMonth);

  const pieData = categories.map((c) => ({ name: c.name, value: c.spent }));
  const colors = ["#3B82F6", "#22C55E", "#A855F7", "#EAB308", "#EF4444", "#06B6D4"];

  function openQuickAdd(categoryName) {
    setAddCat(categoryName);
    setOpenAdd(true);
  }

  const setBudget = async (categoryId, budgetAmount) => {
    if (!user?.id) return;

    try {
      // Find category to get name
      const category = categories.find(c => c.id === categoryId);
      if (!category) return;

      const { data, error } = await upsertBudget(user.id, {
        category_id: categoryId,
        category_name: category.name,
        year_month: ym,
        budget_amount: budgetAmount,
        color: category.color,
      });

      if (error) throw error;

      setCategories((prev) => prev.map((c) => (c.id === categoryId ? { ...c, budget: budgetAmount } : c)));
      showToast("✓ Budget diperbarui", "success");
    } catch (error) {
      console.error("Error updating budget:", error);
      showToast("Gagal memperbarui budget. Coba lagi.", "error");
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6] mx-auto mb-4"></div>
          <p className="text-muted">Memuat budgets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Budgeting</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <SectionHeader title="Total Anggaran" subtitle="Semua kategori bulan ini" />
          <div className="text-2xl font-semibold">{totalBudget.toLocaleString("id-ID")}</div>
        </Card>
        <Card>
          <SectionHeader title="Terpakai" subtitle="Akumulasi pemakaian" />
          <div className="text-2xl font-semibold">{totalSpent.toLocaleString("id-ID")}</div>
        </Card>
        <Card>
          <SectionHeader title="Sisa & Hari Tersisa" subtitle={`${daysLeft} hari tersisa`} />
          <div className="text-2xl font-semibold">{(totalBudget - totalSpent).toLocaleString("id-ID")}</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <SectionHeader title="Komposisi Pemakaian" subtitle="Donut chart per kategori" />
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie 
                  data={pieData} 
                  dataKey="value" 
                  nameKey="name" 
                  innerRadius={70} 
                  outerRadius={110} 
                  paddingAngle={3}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={colors[i % colors.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(v) => v.toLocaleString("id-ID")} 
                  contentStyle={{ 
                    backgroundColor: 'var(--card)', 
                    border: '1px solid var(--border)',
                    color: 'var(--foreground)'
                  }}
                  itemStyle={{ color: 'var(--foreground)' }}
                  labelStyle={{ color: 'var(--foreground)' }}
                />
                <Legend 
                  wrapperStyle={{ color: 'var(--foreground)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <SectionHeader title="Burn Rate & Forecast" subtitle="Ideal vs aktual dan prediksi" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-muted">Ideal per hari</div>
              <div className="text-xl font-semibold">{Math.round(idealDaily).toLocaleString("id-ID")}</div>
            </div>
            <div>
              <div className="text-xs text-muted">Aktual per hari</div>
              <div className="text-xl font-semibold">{Math.round(actualDaily).toLocaleString("id-ID")}</div>
            </div>
            <div>
              <div className="text-xs text-muted">Forecast akhir bulan</div>
              <div className="text-xl font-semibold">{forecast.toLocaleString("id-ID")}</div>
            </div>
            <div>
              <div className="text-xs text-muted">Status</div>
              <div className="text-sm">{forecast > totalBudget ? "Berpotensi overspend" : "Aman"}</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.length > 0 ? categories.map((c) => {
          const pct = c.budget > 0 ? Math.min(1, c.spent / c.budget) : 0;
          const status = pct < 0.75 ? "Aman" : pct < 1 ? "Hampir Penuh" : "Melewati";
          const statusColor = pct < 0.75 ? "#22C55E" : pct < 1 ? "#EAB308" : "#EF4444";
          return (
            <Card key={c.id}>
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-medium">{c.name}</h2>
                <span className="text-sm" style={{ color: statusColor }}>{status}</span>
              </div>
              <div className="text-sm text-muted mb-2">{c.spent.toLocaleString("id-ID")} / {c.budget.toLocaleString("id-ID")}</div>
              <ProgressBar value={pct} color={c.color} current={c.spent} target={c.budget} showTooltip={true} />
              <div className="flex gap-2 mt-3">
                <button className="text-sm px-3 py-1.5 rounded-md border border-base" onClick={() => setBudget(c.id, Math.max(0, c.budget - 50000))}>-50k</button>
                <button className="text-sm px-3 py-1.5 rounded-md border border-base" onClick={() => setBudget(c.id, c.budget + 50000)}>+50k</button>
                <button className="ml-auto text-sm px-3 py-1.5 rounded-md border border-base" onClick={() => openQuickAdd(c.name)}>+ Catat</button>
              </div>
            </Card>
          );
        }) : (
          <Card>
            <p className="text-sm text-muted text-center py-8">Belum ada budget. Buat budget pertama Anda dengan mengatur kategori di atas.</p>
          </Card>
        )}
      </div>

      <AddTransactionModal open={openAdd} onClose={() => setOpenAdd(false)} initialCategory={addCat} />
    </div>
  );
}


