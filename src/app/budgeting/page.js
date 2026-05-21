"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { ProgressBar, Card, SectionHeader, AddTransactionModal, Modal } from "../ui";
import { showToast, parseCurrencyInput, handleCurrencyInputChange } from "../../lib/utils";
import { isExpense } from "../../lib/balance";
import { useAuth } from "../../contexts/AuthContext";
import { getBudgets, upsertBudget, deleteBudget, getTransactions, createTransaction } from "../../lib/supabase/data-service";
import { categories as presetCategories } from "../../lib/data";

// Lazy load Recharts components
const ResponsiveContainer = dynamic(() => import("recharts").then(mod => mod.ResponsiveContainer), { ssr: false });
const PieChart = dynamic(() => import("recharts").then(mod => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import("recharts").then(mod => mod.Pie), { ssr: false });
const Cell = dynamic(() => import("recharts").then(mod => mod.Cell), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then(mod => mod.Tooltip), { ssr: false });
const Legend = dynamic(() => import("recharts").then(mod => mod.Legend), { ssr: false });

function txYearMonth(dateStr) {
  if (!dateStr) return "";
  const s = String(dateStr);
  return s.length >= 7 ? s.slice(0, 7) : "";
}

function sumSpentForCategoryMonth(transactions, categoryName, yearMonth) {
  return (transactions || []).reduce((sum, t) => {
    if (!isExpense(t)) return sum;
    if (t.category !== categoryName) return sum;
    if (txYearMonth(t.date) !== yearMonth) return sum;
    return sum + parseFloat(t.amount || 0);
  }, 0);
}

export default function BudgetingPage() {
  const { user, loading: authLoading } = useAuth();
  const [openAdd, setOpenAdd] = useState(false);
  const [addCat, setAddCat] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAddBudget, setOpenAddBudget] = useState(false);
  const [addBudgetForm, setAddBudgetForm] = useState({
    mode: "preset",
    presetId: "",
    customName: "",
    amount: "",
  });
  const [addBudgetSubmitting, setAddBudgetSubmitting] = useState(false);
  const [deletingBudgetId, setDeletingBudgetId] = useState(null);

  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  useEffect(() => {
    if (authLoading || !user?.id) return;

    const loadBudgets = async () => {
      setLoading(true);
      try {
        const { data, error } = await getBudgets(user.id, ym);
        if (error) throw error;

        const bg = (data || []).map((b) => ({
          budgetId: b.id,
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

  useEffect(() => {
    const onFabTransaction = (e) => {
      const tx = e.detail;
      if (!tx?.id || txYearMonth(tx.date) !== ym || (tx.type || "expense") !== "expense") return;

      setCategories((prev) =>
        prev.map((c) =>
          c.name === tx.category ? { ...c, spent: c.spent + tx.amount } : c
        )
      );
    };

    const onTransactionDeleted = (e) => {
      const tx = e.detail;
      if (!tx?.id || txYearMonth(tx.date) !== ym || (tx.type || "expense") !== "expense") return;

      setCategories((prev) =>
        prev.map((c) =>
          c.name === tx.category
            ? { ...c, spent: Math.max(0, c.spent - tx.amount) }
            : c
        )
      );
    };

    window.addEventListener("finzen:transaction-added", onFabTransaction);
    window.addEventListener("finzen:transaction-deleted", onTransactionDeleted);
    return () => {
      window.removeEventListener("finzen:transaction-added", onFabTransaction);
      window.removeEventListener("finzen:transaction-deleted", onTransactionDeleted);
    };
  }, [ym]);

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

  const availablePresets = useMemo(
    () => presetCategories.filter((p) => !categories.some((c) => c.id === p.id)),
    [categories]
  );

  function openAddBudgetModal() {
    const available = presetCategories.filter((p) => !categories.some((c) => c.id === p.id));
    setAddBudgetForm({
      mode: available.length ? "preset" : "custom",
      presetId: available[0]?.id || presetCategories[0]?.id || "",
      customName: "",
      amount: "",
    });
    setOpenAddBudget(true);
  }

  async function handleAddBudget(e) {
    e.preventDefault();
    if (!user?.id) return;

    const amount = parseCurrencyInput(addBudgetForm.amount);
    if (!amount || amount <= 0) {
      showToast("Masukkan nominal budget yang valid.", "warning");
      return;
    }

    let categoryId;
    let categoryName;
    let color;

    if (addBudgetForm.mode === "preset") {
      const preset = presetCategories.find((p) => p.id === addBudgetForm.presetId);
      if (!preset) {
        showToast("Pilih kategori template.", "warning");
        return;
      }
      if (categories.some((c) => c.id === preset.id)) {
        showToast("Kategori ini sudah punya budget di bulan ini.", "warning");
        return;
      }
      categoryId = preset.id;
      categoryName = preset.name;
      color = preset.color;
    } else {
      const name = addBudgetForm.customName.trim();
      if (!name) {
        showToast("Isi nama kategori.", "warning");
        return;
      }
      categoryId =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? `custom-${crypto.randomUUID()}`
          : `custom-${Date.now()}`;
      categoryName = name;
      color = colors[categories.length % colors.length];
    }

    setAddBudgetSubmitting(true);
    try {
      const { data: txs, error: txErr } = await getTransactions(user.id);
      if (txErr) throw txErr;
      const spent = sumSpentForCategoryMonth(txs || [], categoryName, ym);

      const { data, error } = await upsertBudget(user.id, {
        category_id: categoryId,
        category_name: categoryName,
        year_month: ym,
        budget_amount: amount,
        color,
        spent_amount: spent,
      });

      if (error) throw error;

      const spentFinal = parseFloat(data?.spent_amount ?? spent);

      setCategories((prev) => {
        const next = [
          ...prev,
          {
            budgetId: data.id,
            id: categoryId,
            name: categoryName,
            color,
            budget: amount,
            spent: spentFinal,
          },
        ];
        next.sort((a, b) => a.name.localeCompare(b.name, "id"));
        return next;
      });

      showToast("Budget berhasil ditambahkan.", "success");
      setOpenAddBudget(false);
    } catch (err) {
      console.error("Error adding budget:", err);
      showToast("Gagal menambah budget. Coba lagi.", "error");
    } finally {
      setAddBudgetSubmitting(false);
    }
  }

  function openQuickAdd(categoryName) {
    setAddCat(categoryName);
    setOpenAdd(true);
  }

  const onTransactionAdded = async (item) => {
    if (!user?.id) {
      showToast("Silakan login terlebih dahulu.", "warning");
      throw new Error("not authenticated");
    }

    const { data, error } = await createTransaction(user.id, {
      date: item.date,
      category: item.category,
      amount: item.amount,
      type: item.type || "expense",
      note: item.note || "",
    });

    if (error) throw error;

    const txType = data.type || item.type || "expense";
    if (txYearMonth(item.date) === ym && txType === "expense") {
      setCategories((prev) =>
        prev.map((c) =>
          c.name === item.category ? { ...c, spent: c.spent + item.amount } : c
        )
      );
    }

    showToast("Transaksi berhasil disimpan.", "success");
  };

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

      setCategories((prev) =>
        prev.map((c) =>
          c.id === categoryId
            ? { ...c, budget: budgetAmount, budgetId: data?.id || c.budgetId }
            : c
        )
      );
      showToast("✓ Budget diperbarui", "success");
    } catch (error) {
      console.error("Error updating budget:", error);
      showToast("Gagal memperbarui budget. Coba lagi.", "error");
    }
  };

  const onDeleteBudget = async (category) => {
    if (!category.budgetId) {
      showToast("Data budget tidak valid. Refresh halaman.", "error");
      return;
    }

    if (
      !confirm(
        `Hapus budget "${category.name}" untuk bulan ini?\n\nLimit ${category.budget.toLocaleString("id-ID")} akan dihapus. Transaksi tetap ada di riwayat.`
      )
    ) {
      return;
    }

    setDeletingBudgetId(category.budgetId);
    try {
      const { error } = await deleteBudget(category.budgetId);
      if (error) throw error;

      setCategories((prev) => prev.filter((c) => c.budgetId !== category.budgetId));

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("finzen:budget-deleted", {
            detail: { categoryId: category.id, name: category.name },
          })
        );
      }

      showToast("Budget berhasil dihapus.", "success");
    } catch (err) {
      console.error("Error deleting budget:", err);
      showToast("Gagal menghapus budget. Coba lagi.", "error");
    } finally {
      setDeletingBudgetId(null);
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Budgeting</h1>
        <button
          type="button"
          onClick={openAddBudgetModal}
          className="text-sm px-4 py-2 rounded-md border border-base bg-black/[.04] dark:bg-white/[.06] font-medium"
        >
          + Tambah budget
        </button>
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
              <div className="flex flex-wrap gap-2 mt-3">
                <button
                  type="button"
                  className="text-sm px-3 py-1.5 rounded-md border border-base"
                  onClick={() => setBudget(c.id, Math.max(0, c.budget - 50000))}
                >
                  -50k
                </button>
                <button
                  type="button"
                  className="text-sm px-3 py-1.5 rounded-md border border-base"
                  onClick={() => setBudget(c.id, c.budget + 50000)}
                >
                  +50k
                </button>
                <button
                  type="button"
                  className="text-sm px-3 py-1.5 rounded-md border border-base"
                  onClick={() => openQuickAdd(c.name)}
                >
                  + Catat
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteBudget(c)}
                  disabled={deletingBudgetId === c.budgetId}
                  className="ml-auto text-sm px-3 py-1.5 rounded-md border border-base text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                >
                  {deletingBudgetId === c.budgetId ? "Menghapus…" : "Hapus"}
                </button>
              </div>
            </Card>
          );
        }) : (
          <Card>
            <div className="text-center py-8 space-y-4">
              <p className="text-sm text-muted">Belum ada budget untuk bulan ini. Tambahkan kategori dan nominal limit.</p>
              <button
                type="button"
                onClick={openAddBudgetModal}
                className="text-sm px-4 py-2 rounded-md border border-base bg-black/[.04] dark:bg-white/[.06]"
              >
                + Tambah budget
              </button>
            </div>
          </Card>
        )}
      </div>

      <Modal
        open={openAddBudget}
        onClose={() => !addBudgetSubmitting && setOpenAddBudget(false)}
        title="Tambah budget"
        description={`Anggaran untuk ${ym}. Pemakaian dari transaksi akan mengikuti nama kategori yang sama.`}
      >
        <form onSubmit={handleAddBudget} className="space-y-4">
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="budgetMode"
                checked={addBudgetForm.mode === "preset"}
                onChange={() => setAddBudgetForm((f) => ({ ...f, mode: "preset" }))}
                disabled={!availablePresets.length}
              />
              Template
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="budgetMode"
                checked={addBudgetForm.mode === "custom"}
                onChange={() => setAddBudgetForm((f) => ({ ...f, mode: "custom" }))}
              />
              Kategori sendiri
            </label>
          </div>

          {addBudgetForm.mode === "preset" ? (
            <div>
              <label className="text-xs text-muted block mb-1">Kategori</label>
              {availablePresets.length ? (
                <select
                  className="form-control w-full border border-base rounded-md px-3 py-2"
                  value={addBudgetForm.presetId}
                  onChange={(e) => setAddBudgetForm((f) => ({ ...f, presetId: e.target.value }))}
                >
                  {availablePresets.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-sm text-muted">Semua template sudah punya budget. Gunakan &quot;Kategori sendiri&quot;.</p>
              )}
            </div>
          ) : (
            <div>
              <label className="text-xs text-muted block mb-1">Nama kategori</label>
              <input
                className="w-full border border-base rounded-md px-3 py-2"
                placeholder="Contoh: Tagihan, Belanja, dll."
                value={addBudgetForm.customName}
                onChange={(e) => setAddBudgetForm((f) => ({ ...f, customName: e.target.value }))}
              />
            </div>
          )}

          <div>
            <label className="text-xs text-muted block mb-1">Limit budget (IDR)</label>
            <input
              className="form-control w-full border border-base rounded-md px-3 py-2"
              type="text"
              placeholder="500000"
              value={addBudgetForm.amount}
              onChange={(e) => handleCurrencyInputChange(e, setAddBudgetForm, "amount")}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              className="text-sm px-3 py-2 rounded-md border border-base"
              disabled={addBudgetSubmitting}
              onClick={() => setOpenAddBudget(false)}
            >
              Batal
            </button>
            <button
              type="submit"
              className="text-sm px-3 py-2 rounded-md border border-base bg-black/[.04] dark:bg-white/[.06]"
              disabled={addBudgetSubmitting || (addBudgetForm.mode === "preset" && !availablePresets.length)}
            >
              {addBudgetSubmitting ? "Menyimpan…" : "Simpan"}
            </button>
          </div>
        </form>
      </Modal>

      <AddTransactionModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        initialCategory={addCat}
        onAdded={onTransactionAdded}
      />
    </div>
  );
}


