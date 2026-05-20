"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getTips } from "../../lib/supabase/tips-service";

const typeLabels = {
  artikel: "📄 Artikel",
  infografis: "📊 Infografis",
  kuis: "❓ Kuis",
};

const typeColors = {
  artikel: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  infografis: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  kuis: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
};

export default function TipsPage() {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await getTips({ activeOnly: true });
        if (fetchError) {
          setError("Gagal memuat tips. Silakan coba lagi nanti.");
          console.error("Error fetching tips:", fetchError);
        } else {
          setTips(data || []);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("Terjadi kesalahan saat memuat tips.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Tips Edukasi Finansial</h1>
          <p className="text-sm text-muted">Pelajari cara mengelola keuangan dengan lebih baik</p>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6] mx-auto mb-4"></div>
            <p className="text-muted">Memuat tips...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Tips Edukasi Finansial</h1>
          <p className="text-sm text-muted">Pelajari cara mengelola keuangan dengan lebih baik</p>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold mb-2">Gagal Memuat Tips</h2>
            <p className="text-muted mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#2563eb] text-white rounded-md hover:bg-[#1d4ed8] transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (tips.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Tips Edukasi Finansial</h1>
          <p className="text-sm text-muted">Pelajari cara mengelola keuangan dengan lebih baik</p>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">💡</div>
            <h2 className="text-xl font-semibold mb-2">Belum Ada Tips</h2>
            <p className="text-muted mb-2">
              Belum ada tips aktif saat ini.
            </p>
            <p className="text-sm text-muted">
              Admin akan menambahkan tips edukasi finansial segera.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Tips Edukasi Finansial</h1>
        <p className="text-sm text-muted">Pelajari cara mengelola keuangan dengan lebih baik</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tips.map((tip) => (
          <Link
            key={tip.id}
            href={`/tips/${tip.id}`}
            className="group rounded-xl border border-base p-5 card hover:shadow-lg transition-all hover:border-[#3B82F6] dark:hover:border-[#60a5fa]"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium ${typeColors[tip.type] || typeColors.artikel}`}
                >
                  {typeLabels[tip.type] || "📄 Artikel"}
                </span>
                <span className="text-xs text-muted group-hover:text-[#3B82F6] transition-colors">
                  Baca →
                </span>
              </div>
              <h2 className="font-semibold text-lg group-hover:text-[#3B82F6] transition-colors">
                {tip.title}
              </h2>
              <p className="text-sm text-muted line-clamp-3 leading-relaxed">
                {tip.content}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
