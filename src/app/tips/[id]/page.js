"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getTips } from "../../../lib/supabase/tips-service";
import Link from "next/link";

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

export default function TipDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tipId = params.id;
  const [tip, setTip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await getTips({ activeOnly: false });
        if (fetchError) {
          setError("Gagal memuat tips");
          return;
        }
        const foundTip = data?.find((t) => t.id === tipId);
        if (!foundTip) {
          setError("Tips tidak ditemukan");
        } else if (!foundTip.is_active) {
          setError("Tips ini tidak aktif");
        } else {
          setTip(foundTip);
        }
      } catch (err) {
        console.error("Error loading tip:", err);
        setError("Terjadi kesalahan saat memuat tips");
      } finally {
        setLoading(false);
      }
    }
    if (tipId) load();
  }, [tipId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/tips"
            className="text-sm px-3 py-1.5 rounded-md border border-base hover:bg-black/[.03] dark:hover:bg-white/[.06] transition"
          >
            ← Kembali
          </Link>
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

  if (error || !tip) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/tips"
            className="text-sm px-3 py-1.5 rounded-md border border-base hover:bg-black/[.03] dark:hover:bg-white/[.06] transition"
          >
            ← Kembali
          </Link>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-xl font-semibold mb-2">Tips Tidak Ditemukan</h2>
            <p className="text-muted mb-6">{error || "Tips yang Anda cari tidak tersedia."}</p>
            <Link
              href="/tips"
              className="inline-block px-4 py-2 bg-[#2563eb] text-white rounded-md hover:bg-[#1d4ed8] transition-colors"
            >
              Kembali ke Daftar Tips
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <Link
          href="/tips"
          className="text-sm px-3 py-1.5 rounded-md border border-base hover:bg-black/[.03] dark:hover:bg-white/[.06] transition"
        >
          ← Kembali ke Tips
        </Link>
      </div>

      <article className="rounded-xl border border-base p-6 md:p-8 card space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${typeColors[tip.type] || typeColors.artikel}`}
            >
              {typeLabels[tip.type] || "📄 Artikel"}
            </span>
          </div>
          <h1 className="text-3xl font-bold">{tip.title}</h1>
        </div>

        <div className="prose prose-sm max-w-none dark:prose-invert">
          <div className="text-base leading-relaxed whitespace-pre-wrap text-foreground">
            {tip.content}
          </div>
        </div>

        <div className="pt-4 border-t border-base">
          <Link
            href="/tips"
            className="inline-flex items-center gap-2 text-sm text-[#3B82F6] hover:underline"
          >
            ← Lihat tips lainnya
          </Link>
        </div>
      </article>
    </div>
  );
}

