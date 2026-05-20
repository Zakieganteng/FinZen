"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { monthlySpendingByCategory } from "../../lib/data";
import { useAuth } from "../../contexts/AuthContext";
import { updateUserInitialBalance } from "../../lib/supabase/data-service";
import { showToast, parseCurrencyInput, formatCurrencyInput } from "../../lib/utils";

// Lazy load Recharts components
const ResponsiveContainer = dynamic(() => import("recharts").then(mod => mod.ResponsiveContainer), { ssr: false });
const BarChart = dynamic(() => import("recharts").then(mod => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then(mod => mod.Bar), { ssr: false });
const XAxis = dynamic(() => import("recharts").then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then(mod => mod.YAxis), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then(mod => mod.Tooltip), { ssr: false });
const LineChart = dynamic(() => import("recharts").then(mod => mod.LineChart), { ssr: false });
const Line = dynamic(() => import("recharts").then(mod => mod.Line), { ssr: false });

export default function OnboardingPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [theme, setTheme] = useState("light");
  const [initialBalanceInput, setInitialBalanceInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("finzen-theme") : null;
    if (saved) setTheme(saved);
  }, []);

  function selectTheme(t) {
    setTheme(t);
    if (typeof window !== "undefined") {
      localStorage.setItem("finzen-theme", t);
    }
    document.documentElement.classList.toggle("dark", t === "dark");
  }

  async function finish() {
    if (user?.id) {
      const parsed = parseCurrencyInput(initialBalanceInput);
      if (parsed > 0) {
        setSaving(true);
        try {
          const { error } = await updateUserInitialBalance(user.id, parsed);
          if (error) throw error;
          await refreshUser();
          showToast("Saldo awal tersimpan.", "success");
        } catch (err) {
          console.error(err);
          showToast("Gagal menyimpan saldo awal. Coba dari dashboard.", "warning");
        } finally {
          setSaving(false);
        }
      }
    }
    router.push("/");
  }

  const weeklyTrend = useMemo(
    () => [
      { day: "Sen", value: 45 },
      { day: "Sel", value: 32 },
      { day: "Rab", value: 50 },
      { day: "Kam", value: 28 },
      { day: "Jum", value: 36 },
      { day: "Sab", value: 40 },
      { day: "Min", value: 30 },
    ],
    []
  );

  const quickActions = [
    { href: "/transactions", title: "Tambah Transaksi", desc: "Catat pemasukan/pengeluaran harian dengan cepat.", icon: "➕" },
    { href: "/budgeting", title: "Atur Budget", desc: "Tetapkan batas pengeluaran per kategori.", icon: "📊" },
    { href: "/goals", title: "Buat Goals", desc: "Rencanakan target tabungan dan pantau progres.", icon: "🎯" },
    { href: "/reports", title: "Lihat Laporan", desc: "Pantau ringkasan pengeluaran bulanan.", icon: "📈" },
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="space-y-2">
        <h1 className="text-xl font-semibold">Selamat datang di FinZen</h1>
        <p className="text-sm text-black/70 dark:text-white/70">Pilih tema awal dan mulai dengan beberapa aksi cepat.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-sm">
        <button onClick={() => selectTheme("light")} className={`border rounded-lg p-4 ${theme === "light" ? "ring-2 ring-blue-500" : ""}`}>☀️ Light</button>
        <button onClick={() => selectTheme("dark")} className={`border rounded-lg p-4 ${theme === "dark" ? "ring-2 ring-blue-500" : ""}`}>🌙 Dark</button>
      </div>

      <section className="rounded-lg border p-4 max-w-md space-y-3">
        <h2 className="font-medium">Saldo awal (opsional)</h2>
        <p className="text-sm text-black/70 dark:text-white/70">
          Berapa uang yang Anda punya sekarang? Ini dipakai untuk menghitung saldo di dashboard.
        </p>
        <input
          className="w-full border rounded-md px-3 py-2 bg-[var(--background)]"
          type="text"
          placeholder="Contoh: 2.000.000"
          value={initialBalanceInput}
          onChange={(e) => {
            const raw = e.target.value;
            setInitialBalanceInput(raw ? formatCurrencyInput(raw) : "");
          }}
        />
      </section>

      <section className="space-y-3">
        <h2 className="font-medium">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((qa) => (
            <Link key={qa.href} href={qa.href} className="rounded-lg border p-4 hover:bg-black/[.03] dark:hover:bg-white/[.05] transition-colors">
              <div className="flex items-start gap-3">
                <div className="text-xl">{qa.icon}</div>
                <div>
                  <div className="font-medium">{qa.title}</div>
                  <p className="text-sm text-black/70 dark:text-white/70 mt-1">{qa.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border p-4">
          <h3 className="font-medium mb-3">Bar Chart: Komposisi Pengeluaran</h3>
          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer>
              <BarChart data={monthlySpendingByCategory}>
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip formatter={(v) => v.toLocaleString("id-ID")} />
                <Bar dataKey="value" fill="#3B82F6" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <h3 className="font-medium mb-3">Line Chart: Tren Mingguan</h3>
          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer>
              <LineChart data={weeklyTrend}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#A855F7" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="rounded-lg border p-4">
        <h3 className="font-medium">Motivasi Hari Ini</h3>
        <p className="text-sm text-black/80 dark:text-white/80 mt-2">"Langkah kecil konsisten mengalahkan lompatan besar yang jarang." — Ayo catat transaksi hari ini dan jangan putus streak!</p>
        <div className="mt-4">
          <button onClick={finish} disabled={saving} className="border rounded-md px-4 py-2 hover:bg-black/[.04] dark:hover:bg-white/[.06] disabled:opacity-50">
            {saving ? "Menyimpan…" : "Mulai Sekarang"}
          </button>
        </div>
      </section>
    </div>
  );
}


