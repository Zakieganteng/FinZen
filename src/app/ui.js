"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { formatCurrency, categories } from "../lib/data";
import { useRouter } from "next/navigation";
import { showToast, getSmartCategorySuggestion, findRepeatableTransactions, handleCurrencyInputChange, parseCurrencyInput } from "../lib/utils";
import RepeatTransactionCard from "./components/RepeatTransactionCard";

export function SummaryCard({ title, value, type = "text" }) {
  const display = type === "currency" ? formatCurrency(value) : type === "percent" ? `${Math.round(value * 100)}%` : String(value);
  return (
    <div className="rounded-xl border border-base p-4 card">
      <div className="text-xs uppercase tracking-wide text-muted">{title}</div>
      <div className="text-2xl font-semibold mt-1">{display}</div>
    </div>
  );
}

export function ProgressBar({ value, color, current, target, showTooltip = false }) {
  const pct = Math.max(0, Math.min(1, value));
  const percentage = Math.round(pct * 100);

  // Get milestone color if color not provided
  const getMilestoneColor = () => {
    if (color) return color;
    if (pct >= 1) return "#A855F7"; // Purple - 100%
    if (pct >= 0.75) return "#F97316"; // Orange - 75-100%
    if (pct >= 0.5) return "#EAB308"; // Yellow - 50-75%
    if (pct >= 0.25) return "#22C55E"; // Green - 25-50%
    return "#3B82F6"; // Blue - 0-25%
  };

  const barColor = getMilestoneColor();
  const tooltipText = showTooltip && current !== undefined && target !== undefined
    ? `${current.toLocaleString("id-ID")} / ${target.toLocaleString("id-ID")} (${percentage}%)`
    : `${percentage}%`;

  return (
    <div className="relative group">
      <div className="h-2 w-full rounded-full overflow-hidden" style={{ backgroundColor: "rgba(127,127,127,0.2)" }}>
        <div
          className="h-full progress-bar-fill"
          style={{
            width: `${pct * 100}%`,
            backgroundColor: barColor,
            transition: "width 300ms ease-out, background-color 200ms ease-in-out",
          }}
        />
      </div>
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded-md bg-[var(--card)] border border-base shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
          {tooltipText}
        </div>
      )}
    </div>
  );
}

export function ThemeToggle() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("finzen-theme") : null;
    const initial = saved ?? "light";
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("finzen-theme", next);
    }
    document.documentElement.classList.toggle("dark", next === "dark");
  }

  return (
    <button onClick={toggle} className="text-sm px-3 py-1.5 rounded-md border border-base hover:bg-black/[.04] dark:hover:bg-white/[.06]">
      {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
}

export function Card({ children }) {
  return <div className="rounded-xl border border-base p-4 card">{children}</div>;
}

export function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-2">
      <h2 className="font-medium" style={{ color: "var(--foreground)" }}>{title}</h2>
      {subtitle ? (
        <p className="text-sm text-muted mt-0.5">{subtitle}</p>
      ) : null}
    </div>
  );
}

export function Modal({ open, onClose, title, description, children }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!open) return null;
  
  const modalContent = (
    <div className="fixed inset-0" style={{ zIndex: 999999, position: "fixed", pointerEvents: "auto" }}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} style={{ pointerEvents: "auto" }} />
      <div className="absolute inset-0 flex items-center justify-center p-4" style={{ pointerEvents: "none" }}>
        <div 
          className="w-full max-w-md rounded-xl border border-base card shadow-2xl bg-[var(--card)] relative" 
          onClick={(e) => e.stopPropagation()}
          style={{ pointerEvents: "auto" }}
        >
          <div className="p-4 border-b border-base">
            <div className="text-base font-medium">{title}</div>
            {description ? <p className="text-sm text-muted mt-1">{description}</p> : null}
          </div>
          <div className="p-4">{children}</div>
        </div>
      </div>
    </div>
  );
  
  // Use portal to render modal at body level to ensure it's above everything
  if (mounted && typeof window !== "undefined") {
    return createPortal(modalContent, document.body);
  }
  
  // Fallback for SSR
  return null;
}

export function QuickExpenseModal({ open, onClose, onAdded }) {
  const router = useRouter();
  const today = new Date();
  const ymd = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const [form, setForm] = useState({ date: ymd, category: categories[0]?.name || "Lainnya", amount: "", note: "" });

  async function handleSubmit(e) {
    e.preventDefault();
    const parsedAmount = parseCurrencyInput(form.amount);
    if (!form.date || !form.category || !parsedAmount) {
      showToast("⚠ Mohon lengkapi semua field", "warning");
      return;
    }
    
    const item = {
      date: form.date,
      category: form.category,
      amount: parsedAmount,
      note: form.note || "",
    };
    
    // Call onAdded callback if provided (parent will handle Supabase insert)
    if (onAdded) {
      await onAdded(item);
    }
    
    localStorage.setItem("finzen-last-expense-prompt", ymd);
    onClose?.();
  }

  function skipToday() {
    localStorage.setItem("finzen-last-expense-prompt", ymd);
    onClose?.();
  }

  return (
    <Modal
      open={open}
      onClose={skipToday}
      title="Catat Pengeluaran Hari Ini"
      description="Mulai kuatkan kebiasaanmu. Satu catatan kecil setiap hari."
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <input className="w-full border border-base rounded-md px-3 py-2" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        <select className="w-full border border-base rounded-md px-3 py-2" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
        <input className="w-full border border-base rounded-md px-3 py-2 bg-[var(--background)] text-foreground" type="text" placeholder="Jumlah (IDR)" value={form.amount} onChange={(e) => handleCurrencyInputChange(e, setForm, "amount")} />
        <input className="w-full border border-base rounded-md px-3 py-2" placeholder="Catatan (opsional)" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
        <div className="flex items-center justify-between pt-2">
          <button type="button" onClick={skipToday} className="text-sm text-muted hover:underline">Nanti saja</button>
          <div className="flex gap-2">
            <button type="button" onClick={() => { handleSubmit(new Event('submit')); router.push('/transactions'); }} className="text-sm px-3 py-2 rounded-md border border-base">Simpan & ke Transaksi</button>
            <button type="submit" className="text-sm px-3 py-2 rounded-md border border-base bg-black/[.04] dark:bg-white/[.06]">Simpan</button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

export function AddTransactionModal({ open, onClose, onAdded, initialCategory, quickMode = false }) {
  const today = new Date();
  const ymd = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  
  // Get smart category suggestion
  const getInitialCategory = () => {
    if (initialCategory) return initialCategory;
    if (quickMode && typeof window !== "undefined") {
      const transactions = JSON.parse(localStorage.getItem("finzen-transactions") || "[]");
      const suggestion = getSmartCategorySuggestion(transactions, today);
      return suggestion.category;
    }
    return categories[0]?.name || "Lainnya";
  };

  const [form, setForm] = useState({ date: ymd, category: getInitialCategory(), amount: "", note: "" });
  const [repeatable, setRepeatable] = useState([]);
  
  useEffect(() => {
    if (open && typeof window !== "undefined") {
      // Reset form when modal opens
      const suggestedCategory = initialCategory || (quickMode ? (() => {
        const transactions = JSON.parse(localStorage.getItem("finzen-transactions") || "[]");
        const suggestion = getSmartCategorySuggestion(transactions, new Date());
        return suggestion.category;
      })() : categories[0]?.name || "Lainnya");
      setForm({ date: ymd, category: suggestedCategory, amount: "", note: "" });
      
      // Find repeatable transactions
      const transactions = JSON.parse(localStorage.getItem("finzen-transactions") || "[]");
      const repeatableTx = findRepeatableTransactions(transactions);
      setRepeatable(repeatableTx);
    }
  }, [open, initialCategory, quickMode, ymd]);
  
  function handleRepeat(transaction) {
    setForm({
      date: ymd,
      category: transaction.category,
      amount: formatCurrencyInput(transaction.amount),
      note: transaction.note || "",
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const parsedAmount = parseCurrencyInput(form.amount);
    if (!form.date || !form.category || !parsedAmount) {
      showToast("⚠ Mohon lengkapi semua field", "warning");
      return;
    }
    
    const item = {
      date: form.date,
      category: form.category,
      amount: parsedAmount,
      note: form.note || "",
    };
    
    // Save last category for future suggestions
    if (typeof window !== "undefined") {
      localStorage.setItem("finzen-last-category", form.category);
    }
    
    // Call onAdded callback (parent will handle Supabase insert)
    if (onAdded) {
      await onAdded(item);
    }
    
    onClose?.();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={quickMode ? "Quick Add Transaksi" : "Tambah Transaksi"}
      description={quickMode ? "Catat pengeluaranmu dengan cepat." : "Catat pengeluaranmu hari ini."}
    >
      <RepeatTransactionCard repeatable={repeatable} onRepeat={handleRepeat} />
      <form onSubmit={handleSubmit} className="space-y-3">
        <input className="w-full border border-base rounded-md px-3 py-2" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        <select className="w-full border border-base rounded-md px-3 py-2" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
        <input className="w-full border border-base rounded-md px-3 py-2 bg-[var(--background)] text-foreground" type="text" placeholder="Jumlah (IDR)" value={form.amount} onChange={(e) => handleCurrencyInputChange(e, setForm, "amount")} />
        <input className="w-full border border-base rounded-md px-3 py-2" placeholder="Catatan (opsional)" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
        <div className="flex items-center justify-end pt-2 gap-2">
          <button type="button" onClick={onClose} className="text-sm px-3 py-2 rounded-md border border-base">Batal</button>
          <button type="submit" className="text-sm px-3 py-2 rounded-md border border-base bg-black/[.04] dark:bg-white/[.06]">Simpan</button>
        </div>
      </form>
    </Modal>
  );
}

export function GoalModal({ open, onClose, initialGoal, onSave }) {
  const [form, setForm] = useState(() => {
    const g = initialGoal || {};
    return {
      id: g.id || undefined,
      title: g.title || "",
      target: g.target ? formatCurrencyInput(g.target) : "",
      saved: g.saved ? formatCurrencyInput(g.saved) : "",
      dueDate: g.dueDate || "",
      priority: g.priority || "normal",
    };
  });

  useEffect(() => {
    const g = initialGoal || {};
    setForm({
      id: g.id || undefined,
      title: g.title || "",
      target: g.target ? formatCurrencyInput(g.target) : "",
      saved: g.saved ? formatCurrencyInput(g.saved) : "",
      dueDate: g.dueDate || "",
      priority: g.priority || "normal",
    });
  }, [initialGoal]);

  function handleSubmit(e) {
    e.preventDefault();
    const parsedTarget = parseCurrencyInput(form.target);
    if (!form.title || !parsedTarget) {
      showToast("⚠ Nama goal dan target tabungan wajib diisi", "warning");
      return;
    }
    onSave?.({
      id: form.id ?? Date.now().toString(),
      title: form.title,
      target: parsedTarget,
      saved: parseCurrencyInput(form.saved),
      dueDate: form.dueDate,
      priority: form.priority,
    });
    onClose?.();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={form.id ? "Edit Goal" : "Buat Goal"}
      description="Tetapkan tujuan tabungan, target nominal, dan kapan ingin mencapainya."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium">Nama goal *</label>
          <input
            className="w-full border border-base rounded-md px-3 py-2 bg-[var(--background)] text-foreground"
            placeholder="Contoh: Dana darurat, DP rumah, Liburan Jepang"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-sm font-medium">Target tabungan (Rp) *</label>
            <input
              className="w-full border border-base rounded-md px-3 py-2 bg-[var(--background)] text-foreground"
              type="text"
              placeholder="Contoh: 10.000.000"
              value={form.target}
              onChange={(e) => handleCurrencyInputChange(e, setForm, "target")}
            />
            <p className="text-[11px] text-muted">
              Total nominal yang ingin dicapai untuk goal ini.
            </p>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium">Tabungan saat ini (opsional)</label>
            <input
              className="w-full border border-base rounded-md px-3 py-2 bg-[var(--background)] text-foreground"
              type="text"
              placeholder="Jika sudah ada tabungan awal"
              value={form.saved}
              onChange={(e) => handleCurrencyInputChange(e, setForm, "saved")}
            />
            <p className="text-[11px] text-muted">
              Isi jika kamu sudah punya saldo awal untuk goal ini.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-sm font-medium">Target selesai (opsional)</label>
            <input
              className="w-full border border-base rounded-md px-3 py-2 bg-[var(--background)] text-foreground"
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
            <p className="text-[11px] text-muted">
              Bantu FinZen menghitung progress terhadap tenggat waktu.
            </p>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium">Prioritas</label>
            <select
              className="w-full border border-base rounded-md px-3 py-2 bg-[var(--background)] text-foreground"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              <option value="low">Prioritas Rendah – nice to have</option>
              <option value="normal">Prioritas Normal – penting</option>
              <option value="high">Prioritas Tinggi – sangat penting / urgent</option>
            </select>
            <p className="text-[11px] text-muted">
              Prioritas tinggi akan lebih sering ditampilkan di dashboard.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="text-sm px-3 py-2 rounded-md border border-base"
          >
            Batal
          </button>
          <button
            type="submit"
            className="text-sm px-3 py-2 rounded-md border border-base bg-black/[.04] dark:bg-white/[.06]"
          >
            Simpan
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function TopUpGoalModal({ open, onClose, goal, onTopUp }) {
  const today = new Date();
  const ymd = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const [form, setForm] = useState({ date: ymd, amount: "", note: "" });

  useEffect(() => {
    setForm({ date: ymd, amount: "", note: "" });
  }, [open]);

  function handleSubmit(e) {
    e.preventDefault();
    const parsedAmount = parseCurrencyInput(form.amount);
    if (!parsedAmount) {
      showToast("⚠ Mohon isi jumlah top up", "warning");
      return;
    }
    const item = { id: Date.now(), goalId: goal?.id, date: form.date, amount: parsedAmount, note: form.note };
    onTopUp?.(item);
    const pctAfter = ((goal?.saved || 0) + item.amount) / Math.max(1, goal?.target || 1);
    const progressPct = Math.round(pctAfter * 100);
    showToast(`✓ Top up berhasil! Progress ${progressPct}%`, "success");
    if (pctAfter >= 1) {
      setTimeout(() => showToast("🎉 Selamat! Goal tercapai 100%!", "success"), 500);
    } else if (pctAfter >= 0.75) {
      setTimeout(() => showToast("👏 Hebat! Sudah melewati 75% target.", "info"), 500);
    } else if (pctAfter >= 0.5) {
      setTimeout(() => showToast("💪 Mantap! Sudah melewati 50% target.", "info"), 500);
    } else if (pctAfter >= 0.25) {
      setTimeout(() => showToast("🔥 Keren! Sudah melewati 25% target.", "info"), 500);
    }
    onClose?.();
  }

  return (
    <Modal open={open} onClose={onClose} title="Top Up Goal" description={`Tambahkan tabungan untuk: ${goal?.title || "Goal"}`}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input className="w-full border border-base rounded-md px-3 py-2" type="date" value={form.date} onChange={(e)=>setForm({...form,date:e.target.value})} />
        <input className="w-full border border-base rounded-md px-3 py-2 bg-[var(--background)] text-foreground" type="text" placeholder="Jumlah (IDR)" value={form.amount} onChange={(e)=>handleCurrencyInputChange(e, setForm, "amount")} />
        <input className="w-full border border-base rounded-md px-3 py-2" placeholder="Catatan (opsional)" value={form.note} onChange={(e)=>setForm({...form,note:e.target.value})} />
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="text-sm px-3 py-2 rounded-md border border-base">Batal</button>
          <button type="submit" className="text-sm px-3 py-2 rounded-md border border-base bg-black/[.04] dark:bg-white/[.06]">Simpan</button>
        </div>
      </form>
    </Modal>
  );
}



