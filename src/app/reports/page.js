"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Card, SectionHeader } from "../ui";
import { useAuth } from "../../contexts/AuthContext";
import { getTransactions } from "../../lib/supabase/data-service";
import { showToast } from "../../lib/utils";

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

  const currentMonthTx = useMemo(() => transactions.filter(t => (t.date || "").startsWith(ym + "-")), [transactions, ym]);
  const prevMonthTx = useMemo(() => transactions.filter(t => (t.date || "").startsWith(prevYm + "-")), [transactions, prevYm]);

  const txForPreset = useMemo(() => {
    if (preset === "this-month") return currentMonthTx;
    if (preset === "last-3") {
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      return transactions.filter(t => {
        const d = new Date(t.date);
        return d >= threeMonthsAgo && d <= now;
      });
    }
    // YTD
    const start = new Date(now.getFullYear(), 0, 1);
    return transactions.filter(t => {
      const d = new Date(t.date);
      return d >= start && d <= now;
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
    
    monthTransactions.forEach(t => {
      const current = categoryMap.get(t.category) || 0;
      categoryMap.set(t.category, current + t.amount);
    });

    return Array.from(categoryMap.entries()).map(([category, value]) => ({
      category,
      value,
    }));
  }, [transactions, ym]);

  const budgetKey = `finzen-budgets-${ym}`;
  const budgetTotal = useMemo(() => {
    try {
      const arr = JSON.parse(localStorage.getItem(budgetKey) || "null");
      if (!arr) return 0;
      return arr.reduce((s,c)=>s+(c.budget||0),0);
    } catch (e) { return 0; }
  }, [budgetKey]);
  const varianceToBudget = budgetTotal ? currentTotal - budgetTotal : 0;

  function download(filename, content, type = "text/plain") {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function exportCsvRaw() {
    const header = ["id","date","category","amount","note"]; 
    const rows = [header.join(",")].concat(
      transactions.map(t => [t.id, t.date, t.category, t.amount, (t.note||"").replace(/,/g,";")].join(","))
    );
    download(`finzen-transactions.csv`, rows.join("\n"), "text/csv;charset=utf-8");
  }

  function exportCsvAgg() {
    const header = ["category","value"]; 
    const rows = [header.join(",")].concat(
      currentAgg.map(r => [r.category, r.value].join(","))
    );
    download(`finzen-agg-${ym}.csv`, rows.join("\n"), "text/csv;charset=utf-8");
  }

  function exportPngSummary() {
    const width = 1080;
    const height = 1350;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    // background
    ctx.fillStyle = getComputedStyle(document.documentElement).classList?.contains?.("dark") ? "#0a0a0a" : "#ffffff";
    // Fallback: use computed var
    const bg = getComputedStyle(document.body).getPropertyValue("background-color") || "#ffffff";
    ctx.fillStyle = bg;
    ctx.fillRect(0,0,width,height);
    // header
    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue("color") || "#171717";
    ctx.font = "bold 48px system-ui, -apple-system, Segoe UI, Roboto";
    ctx.fillText("FinZen — Monthly Summary", 60, 120);
    ctx.font = "24px system-ui, -apple-system, Segoe UI, Roboto";
    ctx.fillText(`Periode: ${ym}`, 60, 170);
    // cards
    const cardY = 230;
    const cardH = 180;
    const gap = 40;
    const cardW = (width - 60*2 - gap*2) / 3;
    const metrics = [
      { label: "Total Pengeluaran", value: currentTotal.toLocaleString("id-ID") },
      { label: "MoM", value: `${momDelta>=0?"+":""}${momDelta.toLocaleString("id-ID")} (${Math.round(momPct*100)}%)` },
      { label: "Vs Budget", value: budgetTotal?`${varianceToBudget>=0?"+":""}${varianceToBudget.toLocaleString("id-ID")}`:"-" },
    ];
    metrics.forEach((m, i) => {
      const x = 60 + i*(cardW+gap);
      // card bg
      ctx.fillStyle = "rgba(0,0,0,0.06)";
      const radius = 20;
      roundRect(ctx, x, cardY, cardW, cardH, radius);
      ctx.fill();
      // text
      ctx.fillStyle = getComputedStyle(document.body).getPropertyValue("color") || "#171717";
      ctx.font = "bold 28px system-ui";
      ctx.fillText(m.label, x+24, cardY+56);
      ctx.font = "48px system-ui";
      ctx.fillText(m.value, x+24, cardY+120);
    });
    // footer
    ctx.font = "20px system-ui";
    ctx.fillText("#FinZen • jaga konsistensi finansialmu", 60, height-60);

    const link = document.createElement("a");
    link.download = `finzen-summary-${ym}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function copyCaption() {
    const caption = `Laporan Bulanan ${ym}\nTotal: ${currentTotal.toLocaleString('id-ID')}\nMoM: ${momDelta>=0?'+':''}${momDelta.toLocaleString('id-ID')} (${Math.round(momPct*100)}%)\n#FinZen #FinancialHabit`;
    navigator.clipboard.writeText(caption).catch(()=>{});
  }

  const chartsData = (preset === 'this-month' ? currentAgg : presetAgg).length ? (preset === 'this-month' ? currentAgg : presetAgg) : monthlySpendingByCategory;

  const [showExportMenu, setShowExportMenu] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Laporan</h1>
        {/* Desktop: Show all buttons */}
        <div className="hidden md:flex gap-2 flex-wrap">
          <button className="text-sm px-3 py-2 rounded-md border border-base hover:bg-black/[.03] dark:hover:bg-white/[.05] transition-colors whitespace-nowrap" onClick={exportCsvRaw}>Ekspor CSV (Transaksi)</button>
          <button className="text-sm px-3 py-2 rounded-md border border-base hover:bg-black/[.03] dark:hover:bg-white/[.05] transition-colors whitespace-nowrap" onClick={exportCsvAgg}>Ekspor CSV (Kategori/Bulan)</button>
          <button className="text-sm px-3 py-2 rounded-md border border-base hover:bg-black/[.03] dark:hover:bg-white/[.05] transition-colors whitespace-nowrap" onClick={exportPngSummary}>Ekspor PNG (IG)</button>
          <button className="text-sm px-3 py-2 rounded-md border border-base hover:bg-black/[.03] dark:hover:bg-white/[.05] transition-colors whitespace-nowrap" onClick={copyCaption}>Salin Caption</button>
        </div>
        {/* Mobile: Show dropdown menu */}
        <div className="md:hidden relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="w-full text-sm px-4 py-2 rounded-md border border-base bg-[var(--card)] hover:bg-black/[.03] dark:hover:bg-white/[.05] transition-colors flex items-center justify-between"
          >
            <span>Ekspor & Salin</span>
            <svg
              className={`w-4 h-4 transition-transform ${showExportMenu ? 'rotate-180' : ''}`}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
          {showExportMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowExportMenu(false)}
              />
              <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--card)] border border-base rounded-md shadow-lg z-20 overflow-hidden">
                <button
                  className="w-full text-left text-sm px-4 py-3 border-b border-base hover:bg-black/[.03] dark:hover:bg-white/[.05] transition-colors"
                  onClick={() => {
                    exportCsvRaw();
                    setShowExportMenu(false);
                  }}
                >
                  Ekspor CSV (Transaksi)
                </button>
                <button
                  className="w-full text-left text-sm px-4 py-3 border-b border-base hover:bg-black/[.03] dark:hover:bg-white/[.05] transition-colors"
                  onClick={() => {
                    exportCsvAgg();
                    setShowExportMenu(false);
                  }}
                >
                  Ekspor CSV (Kategori/Bulan)
                </button>
                <button
                  className="w-full text-left text-sm px-4 py-3 border-b border-base hover:bg-black/[.03] dark:hover:bg-white/[.05] transition-colors"
                  onClick={() => {
                    exportPngSummary();
                    setShowExportMenu(false);
                  }}
                >
                  Ekspor PNG (IG)
                </button>
                <button
                  className="w-full text-left text-sm px-4 py-3 hover:bg-black/[.03] dark:hover:bg-white/[.05] transition-colors"
                  onClick={() => {
                    copyCaption();
                    setShowExportMenu(false);
                  }}
                >
                  Salin Caption
                </button>
              </div>
            </>
          )}
        </div>
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
          <SectionHeader title="Variance vs Budget" subtitle="Selisih dengan total anggaran" />
          <div className="text-2xl font-semibold">{budgetTotal?`${varianceToBudget>=0?"+":""}${varianceToBudget.toLocaleString("id-ID")}`:"-"}</div>
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
              </tr>
            </thead>
            <tbody>
              {[...txForPreset].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,10).map((t)=> (
                <tr key={t.id} className="border-t border-base">
                  <td className="p-3">{t.date}</td>
                  <td className="p-3">{t.category}</td>
                  <td className="p-3">{(t.amount||0).toLocaleString('id-ID')}</td>
                  <td className="p-3">{t.note}</td>
                </tr>
              ))}
              {txForPreset.length===0 ? (
                <tr><td className="p-3 text-muted" colSpan={4}>Belum ada transaksi pada rentang ini.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}


