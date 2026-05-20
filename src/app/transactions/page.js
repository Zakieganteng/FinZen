"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Card, SectionHeader, AddTransactionModal } from "../ui";
import { checkBadges, calculateStreak, showToast } from "../../lib/utils";
import { useAuth } from "../../contexts/AuthContext";
import { getTransactions, createTransaction, updateTransaction, deleteTransaction } from "../../lib/supabase/data-service";

// Lazy load Recharts components
const ResponsiveContainer = dynamic(() => import("recharts").then(mod => mod.ResponsiveContainer), { ssr: false });
const BarChart = dynamic(() => import("recharts").then(mod => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then(mod => mod.Bar), { ssr: false });
const XAxis = dynamic(() => import("recharts").then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then(mod => mod.YAxis), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then(mod => mod.Tooltip), { ssr: false });

export default function TransactionsPage() {
  const { user, loading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
        })).sort((a, b) => {
          // Sort by date descending (newest first), then by id if same date
          const dateCompare = b.date.localeCompare(a.date);
          return dateCompare !== 0 ? dateCompare : b.id.localeCompare(a.id);
        });

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

  const dailyAgg = useMemo(() => {
    const map = new Map();
    transactions.forEach((t) => {
      map.set(t.date, (map.get(t.date) || 0) + t.amount);
    });
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, value]) => ({ date, value }));
  }, [transactions]);

  // Pagination logic
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = transactions.slice(startIndex, endIndex);

  // Reset to page 1 when transactions change
  useEffect(() => {
    setCurrentPage(1);
  }, [transactions.length]);

  const onAdded = async (item) => {
    if (!user?.id) return;

    try {
      const { data, error } = await createTransaction(user.id, {
        date: item.date,
        category: item.category,
        amount: item.amount,
        note: item.note || "",
      });

      if (error) throw error;

      const newTransaction = {
        id: data.id,
        date: data.date,
        category: data.category,
        amount: parseFloat(data.amount),
        note: data.note || "",
      };

      setTransactions((prev) => [newTransaction, ...prev]);
      showToast("✓ Transaksi berhasil ditambahkan", "success");

      // Check badges after transaction added
      const newTransactions = [newTransaction, ...transactions];
      const streak = calculateStreak(newTransactions);
      const transactionCount = newTransactions.length;
      
      // Get unique dates to calculate consecutive days
      const dates = [...new Set(newTransactions.map(t => t.date))].sort((a, b) => b.localeCompare(a));
      let consecutiveDays = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let currentDate = new Date(today);
      
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
      
      // Check transaction badges
      checkBadges("transaction", { transactionCount, consecutiveDays });
      // Check streak badges
      checkBadges("streak", { streak });
    } catch (error) {
      console.error("Error adding transaction:", error);
      showToast("Gagal menambahkan transaksi. Coba lagi.", "error");
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6] mx-auto mb-4"></div>
          <p className="text-muted">Memuat transaksi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Transaksi</h1>
        <button onClick={() => setOpenAdd(true)} className="text-sm px-3 py-2 rounded-md border border-base bg-[#2563eb] text-white shadow-sm hover:shadow-md hover:-translate-y-[1px] transition">+ Tambah Transaksi</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <SectionHeader title="Total Hari Ini" subtitle="Akumulasi transaksi" />
          <div className="text-2xl font-semibold">{transactions
            .filter((t) => t.date === new Date().toISOString().slice(0,10))
            .reduce((s, t) => s + t.amount, 0).toLocaleString("id-ID")}</div>
        </Card>
        <Card>
          <SectionHeader title="Jumlah Transaksi" subtitle="Total item tercatat" />
          <div className="text-2xl font-semibold">{transactions.length}</div>
        </Card>
        <Card>
          <SectionHeader title="Rata-rata per Item" subtitle="Per transaksi" />
          <div className="text-2xl font-semibold">{transactions.length > 0 ? Math.round(transactions.reduce((s,t)=>s+t.amount,0) / transactions.length).toLocaleString("id-ID") : 0}</div>
        </Card>
      </div>

      <Card>
        <SectionHeader title="Grafik Harian" subtitle="Total pengeluaran per tanggal" />
        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <BarChart data={dailyAgg}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(v) => v.toLocaleString("id-ID")} />
              <Bar dataKey="value" fill="#22C55E" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <SectionHeader title="Daftar Transaksi" subtitle={`Menampilkan ${startIndex + 1}-${Math.min(endIndex, transactions.length)} dari ${transactions.length} transaksi`} />
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
              {paginatedTransactions.length > 0 ? paginatedTransactions.map((t) => (
                <tr key={t.id} className="border-t border-base">
                  <td className="p-3">{t.date}</td>
                  <td className="p-3">{t.category}</td>
                  <td className="p-3">{t.amount.toLocaleString("id-ID")}</td>
                  <td className="p-3">{t.note}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted">
                    Belum ada transaksi. Tambah transaksi pertama Anda!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {transactions.length > itemsPerPage && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-base">
            <div className="text-sm text-muted">
              Halaman {currentPage} dari {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm rounded-md border border-base disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black/[.03] dark:hover:bg-white/[.06] transition-colors"
              >
                ← Sebelumnya
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                        currentPage === pageNum
                          ? 'bg-[#2563eb] text-white border-[#2563eb]'
                          : 'border-base hover:bg-black/[.03] dark:hover:bg-white/[.06]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-sm rounded-md border border-base disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black/[.03] dark:hover:bg-white/[.06] transition-colors"
              >
                Selanjutnya →
              </button>
            </div>
          </div>
        )}
      </Card>

      <AddTransactionModal open={openAdd} onClose={() => setOpenAdd(false)} onAdded={onAdded} />
    </div>
  );
}


