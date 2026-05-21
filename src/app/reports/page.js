"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Card, SectionHeader } from "../ui";
import { useAuth } from "../../contexts/AuthContext";
import { getTransactions, deleteTransaction } from "../../lib/supabase/data-service";
import { showToast } from "../../lib/utils";
import { isExpense } from "../../lib/balance";
import {
  downloadInstagramReport,
  getPeriodLabel,
  getPresetLabel,
} from "../../lib/instagram-export";

// Lazy load Recharts components
const ResponsiveContainer = dynamic(() => import("recharts").then(mod => mod.ResponsiveContainer), { ssr: false });
const BarChart = dynamic(() => import("recharts").then(mod => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then(mod => mod.Bar), { ssr: false });
const XAxis = dynamic(() => import("recharts").then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then(mod => mod.YAxis), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then(mod => mod.Tooltip), { ssr: false });
const PieChart = dynamic(() => import("recharts").then(mod => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import("recharts").then(mod => mod.Pie), { ssr: false });
const Cell = dynamic(() => import("recharts").then(mod => mod.Cell), { ssr: false });
const Legend = dynamic(() => import("recharts").then(mod => mod.Legend), { ssr: false });

const colors = ["#3B82F6", "#22C55E", "#A855F7", "#EAB308", "#EF4444", "#06B6D4"];

export default function ReportsPage() {
  const { user, loading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [preset, setPreset] = useState("this-month");
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const prevYm = `${now.getFullYear()}-${String(now.getMonth()).padStart(2, "0")}`;

  useEffect(() => {
    if (authLoading || !user?.id) return;

    const loadTransactions = async () => {
      setLoading(true);
      try {
        const { data, error } = await getTransactions(user.id);
        if (error) throw error;

        const tx = (data || []).map(t => ({
          id: t.id,
          date: t.date,
          category: t.category,
          type: t.type || "expense",
          amount: parseFloat(t.amount),
          note: t.note || "",
        }));

        setTransactions(tx);
      } catch (error) {
        console.error("Error loading transactions:", error);
        showToast("Gagal memuat transaksi. Coba refresh halaman.", "error");
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, [user?.id, authLoading]);

  const currentMonthTx = useMemo(
    () => transactions.filter((t) => (t.date || "").startsWith(ym + "-") && isExpense(t)),
    [transactions, ym]
  );
  const prevMonthTx = useMemo(
    () => transactions.filter((t) => (t.date || "").startsWith(prevYm + "-") && isExpense(t)),
    [transactions, prevYm]
  );

  const txForPreset = useMemo(() => {
    if (preset === "this-month") return currentMonthTx;
    if (preset === "last-3") {
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      return transactions.filter((t) => {
        const d = new Date(t.date);
        return d >= threeMonthsAgo && d <= now && isExpense(t);
      });
    }
    // YTD
    const start = new Date(now.getFullYear(), 0, 1);
    return transactions.filter((t) => {
      const d = new Date(t.date);
      return d >= start && d <= now && isExpense(t);
    });
  }, [preset, transactions, currentMonthTx, now]);

  const currentTotal = useMemo(() => currentMonthTx.reduce((s,t)=>s+(t.amount||0),0), [currentMonthTx]);
  const prevTotal = useMemo(() => prevMonthTx.reduce((s,t)=>s+(t.amount||0),0), [prevMonthTx]);
  const momDelta = currentTotal - prevTotal;
  const momPct = prevTotal ? momDelta / prevTotal : 0;

  const currentAgg = useMemo(() => {
    const map = new Map();
    currentMonthTx.forEach((t) => map.set(t.category, (map.get(t.category)||0)+t.amount));
    return Array.from(map.entries()).map(([category, value]) => ({ category, value }));
  }, [currentMonthTx]);

  const presetAgg = useMemo(() => {
    const map = new Map();
    txForPreset.forEach((t) => map.set(t.category, (map.get(t.category)||0)+t.amount));
    return Array.from(map.entries()).map(([category, value]) => ({ category, value }));
  }, [txForPreset]);

  const dailyTrend = useMemo(() => {
    const map = new Map();
    txForPreset.forEach((t) => map.set(t.date, (map.get(t.date)||0)+t.amount));
    return Array.from(map.entries()).sort((a,b)=>a[0].localeCompare(b[0])).map(([date, value])=>({ date, value }));
  }, [txForPreset]);

  // Calculate monthly spending by category from transactions
  const monthlySpendingByCategory = useMemo(() => {
    const monthTransactions = transactions.filter(t => t.date.startsWith(ym));
    const categoryMap = new Map();
    
    monthTransactions.filter(isExpense).forEach((t) => {
      const current = categoryMap.get(t.category) || 0;
      categoryMap.set(t.category, current + t.amount);
    });

    return Array.from(categoryMap.entries()).map(([category, value]) => ({
      category,
      value,
    }));
  }, [transactions, ym]);

  const presetTotal = useMemo(
    () => txForPreset.reduce((s, t) => s + (t.amount || 0), 0),
    [txForPreset]
  );

  const chartsData = (preset === "this-month" ? currentAgg : presetAgg).length
    ? preset === "this-month"
      ? currentAgg
      : presetAgg
    : monthlySpendingByCategory;

  const [exporting, setExporting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const onDeleteTransaction = async (t) => {
    const label = `${t.category} · ${(t.amount || 0).toLocaleString("id-ID")}`;
    if (!confirm(`Hapus transaksi ini?\n\n${label}`)) return;

    setDeletingId(t.id);
    try {
      const { error } = await deleteTransaction(t.id);
      if (error) throw error;

      setTransactions((prev) => prev.filter((x) => x.id !== t.id));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("finzen:transaction-deleted", { detail: t }));
      }
      showToast("Transaksi berhasil dihapus.", "success");
    } catch (err) {
      console.error(err);
      showToast("Gagal menghapus transaksi.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  function exportInstagramPng() {
    if (chartsData.length === 0 && presetTotal === 0) {
      showToast("Belum ada data untuk di-share. Catat transaksi dulu ya!", "warning");
      return;
    }

    setExporting(true);
    try {
      const ok = downloadInstagramReport(
        {
          userName: user?.name || "kamu",
          periodLabel: getPeriodLabel(preset, ym),
          presetLabel: getPresetLabel(preset),
          totalSpending: presetTotal,
          momDelta,
          momPct,
          showMom: preset === "this-month",
          topCategories: chartsData.map((r) => ({
            category: r.category,
            value: r.value,
          })),
        },
        `finzen-recap-${preset}-${ym}.png`
      );

      if (ok) {
        showToast("PNG siap posting! Cek folder download kamu 📲✨", "success");
      } else {
        showToast("Gagal membuat gambar. Coba lagi.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Gagal membuat gambar. Coba lagi.", "error");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Laporan</h1>
          <p className="text-sm text-muted mt-1">Ringkas, shareable, vibes Gen Z 📲</p>
        </div>
        <button
          type="button"
          onClick={exportInstagramPng}
          disabled={exporting || loading}
          className="text-sm font-semibold px-5 py-2.5 rounded-xl text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap"
          style={{
            background: "linear-gradient(135deg, #a855f7 0%, #6366f1 45%, #22d3ee 100%)",
          }}
        >
          {exporting ? "Bikin gambar…" : "📲 Share recap ke IG"}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2">
        <span className="text-sm text-muted">Rentang:</span>
        <div className="flex gap-2 flex-wrap">
          <button onClick={()=>setPreset('this-month')} className={`text-sm px-3 py-1.5 rounded-md border border-base hover:bg-black/[.03] dark:hover:bg-white/[.05] transition-colors ${preset==='this-month'?'bg-black/[.04] dark:bg-white/[.06]':''}`}>Bulan ini</button>
          <button onClick={()=>setPreset('last-3')} className={`text-sm px-3 py-1.5 rounded-md border border-base hover:bg-black/[.03] dark:hover:bg-white/[.05] transition-colors ${preset==='last-3'?'bg-black/[.04] dark:bg-white/[.06]':''}`}>3 bulan</button>
          <button onClick={()=>setPreset('ytd')} className={`text-sm px-3 py-1.5 rounded-md border border-base hover:bg-black/[.03] dark:hover:bg-white/[.05] transition-colors ${preset==='ytd'?'bg-black/[.04] dark:bg-white/[.06]':''}`}>YTD</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <SectionHeader title="Total Bulan Ini" subtitle="Akumulasi transaksi" />
          <div className="text-2xl font-semibold">{currentTotal.toLocaleString("id-ID")}</div>
        </Card>
        <Card>
          <SectionHeader title="MoM" subtitle="Perbandingan dengan bulan lalu" />
          <div className="text-2xl font-semibold">{`${momDelta>=0?"+":""}${momDelta.toLocaleString("id-ID")} (${Math.round(momPct*100)}%)`}</div>
        </Card>
        <Card>
          <SectionHeader title="Total (rentang)" subtitle="Sesuai filter di atas" />
          <div className="text-2xl font-semibold">{presetTotal.toLocaleString("id-ID")}</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <SectionHeader title="Pengeluaran per Kategori" subtitle="Bar chart bulan ini" />
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={chartsData}>
                <XAxis 
                  dataKey="category" 
                  tick={{ fill: 'var(--foreground)' }}
                />
                <YAxis 
                  tick={{ fill: 'var(--foreground)' }}
                />
                <Tooltip 
                  formatter={(v) => v.toLocaleString("id-ID")} 
                  contentStyle={{ 
                    backgroundColor: 'var(--card)', 
                    border: '1px solid var(--border)',
                    color: 'var(--foreground)'
                  }}
                />
                <Bar dataKey="value" fill="#60A5FA"  radius={[4, 4, 0, 0]}>
                  {chartsData.map((_, idx) => (
                    <Cell 
                      key={idx} 
                      fill={colors[idx % colors.length]} 
                      style={{ fill: colors[idx % colors.length], fillOpacity: 1, opacity: 1 }}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <SectionHeader title="Komposisi Pengeluaran" subtitle="Pie chart bulan ini" />
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={chartsData}
                  dataKey="value"
                  nameKey="category"
                  outerRadius={100}
                  innerRadius={50}
                  paddingAngle={4}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {chartsData.map((_, idx) => (
                    <Cell key={idx} fill={colors[idx % colors.length]} />
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <SectionHeader title="Tren Harian" subtitle="Total pengeluaran per hari (berdasarkan rentang)" />
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={dailyTrend}>
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: 'var(--foreground)' }}
                />
                <YAxis 
                  tick={{ fill: 'var(--foreground)' }}
                />
                <Tooltip 
                  formatter={(v)=>v.toLocaleString('id-ID')} 
                  contentStyle={{ 
                    backgroundColor: 'var(--card)', 
                    border: '1px solid var(--border)',
                    color: 'var(--foreground)'
                  }}
                />
                <Bar dataKey="value" fill="#60A5FA" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <SectionHeader title="Top Kategori" subtitle="5 tertinggi berdasarkan rentang" />
          <div className="space-y-2">
            {[...chartsData].sort((a,b)=>b.value-a.value).slice(0,5).map((r,i)=> (
              <div key={r.category} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-md text-xs" style={{backgroundColor: colors[i%colors.length], color:'#fff'}}>{i+1}</span>
                  <span>{r.category}</span>
                </div>
                <span>{r.value.toLocaleString('id-ID')}</span>
              </div>
            ))}
            {chartsData.length===0 ? <div className="text-sm text-muted">Belum ada data</div> : null}
          </div>
        </Card>
      </div>

      <Card>
        <SectionHeader title="Transaksi Terbaru" subtitle="10 transaksi paling baru berdasarkan rentang" />
        <div className="rounded-lg border border-base overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-black/[.03] dark:bg-white/[.06]">
              <tr>
                <th className="text-left p-3">Tanggal</th>
                <th className="text-left p-3">Kategori</th>
                <th className="text-left p-3">Jumlah</th>
                <th className="text-left p-3">Catatan</th>
                <th className="text-right p-3 w-24">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {[...txForPreset].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,10).map((t)=> (
                <tr key={t.id} className="border-t border-base">
                  <td className="p-3">{t.date}</td>
                  <td className="p-3">{t.category}</td>
                  <td className="p-3">{(t.amount||0).toLocaleString('id-ID')}</td>
                  <td className="p-3">{t.note || "—"}</td>
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      onClick={() => onDeleteTransaction(t)}
                      disabled={deletingId === t.id}
                      className="text-sm px-2.5 py-1.5 rounded-md border border-base text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                    >
                      {deletingId === t.id ? "…" : "Hapus"}
                    </button>
                  </td>
                </tr>
              ))}
              {txForPreset.length===0 ? (
                <tr><td className="p-3 text-muted" colSpan={5}>Belum ada transaksi pada rentang ini.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}


