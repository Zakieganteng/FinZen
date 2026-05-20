"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTip } from "../../../../lib/supabase/tips-service";
import { showToast } from "../../../../lib/utils";
import Link from "next/link";

export default function NewTipPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    content: "",
    type: "artikel",
    is_active: true,
  });

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      showToast("Judul dan konten wajib diisi", "error");
      return;
    }

    setLoading(true);
    const { error } = await createTip(form);
    setLoading(false);

    if (error) {
      showToast("Gagal membuat tips", "error");
    } else {
      showToast("Tips berhasil dibuat", "success");
      router.push("/admin/tips");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tambah Tips Baru</h1>
          <p className="text-sm text-muted">Buat tips edukasi finansial baru</p>
        </div>
        <Link
          href="/admin/tips"
          className="text-sm px-4 py-2 rounded-md border border-base hover:bg-black/[.03] dark:hover:bg-white/[.06] transition"
        >
          ← Kembali
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-xl border border-base p-6 card space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Judul Tips *
            </label>
            <input
              id="title"
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              className="w-full border border-base rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] bg-[var(--background)]"
              placeholder="Contoh: Atur 50/30/20"
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium mb-2">
              Tipe *
            </label>
            <select
              id="type"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              required
              className="w-full border border-base rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] bg-[var(--background)]"
            >
              <option value="artikel">Artikel</option>
              <option value="infografis">Infografis</option>
              <option value="kuis">Kuis</option>
            </select>
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium mb-2">
              Konten *
            </label>
            <textarea
              id="content"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              required
              rows={6}
              className="w-full border border-base rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] bg-[var(--background)]"
              placeholder="Masukkan konten tips..."
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="is_active"
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="w-4 h-4 rounded border-base"
            />
            <label htmlFor="is_active" className="text-sm">
              Aktifkan tips ini
            </label>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-[#2563eb] text-white rounded-md hover:bg-[#1d4ed8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Menyimpan..." : "Simpan Tips"}
          </button>
          <Link
            href="/admin/tips"
            className="px-4 py-2 border border-base rounded-md hover:bg-black/[.03] dark:hover:bg-white/[.06] transition"
          >
            Batal
          </Link>
        </div>
      </form>
    </div>
  );
}

