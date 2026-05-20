"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getTips, updateTip, deleteTip } from "../../../../lib/supabase/tips-service";
import { showToast } from "../../../../lib/utils";
import Link from "next/link";
import { Modal } from "../../../ui";

export default function EditTipPage() {
  const router = useRouter();
  const params = useParams();
  const tipId = params.id;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    content: "",
    type: "artikel",
    is_active: true,
  });

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await getTips({ activeOnly: false });
      const tip = data?.find((t) => t.id === tipId);
      if (tip) {
        setForm({
          title: tip.title || "",
          content: tip.content || "",
          type: tip.type || "artikel",
          is_active: tip.is_active ?? true,
        });
      } else {
        showToast("Tips tidak ditemukan", "error");
        router.push("/admin/tips");
      }
      setLoading(false);
    }
    if (tipId) load();
  }, [tipId, router]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      showToast("Judul dan konten wajib diisi", "error");
      return;
    }

    setSaving(true);
    const { error } = await updateTip(tipId, form);
    setSaving(false);

    if (error) {
      showToast("Gagal memperbarui tips", "error");
    } else {
      showToast("Tips berhasil diperbarui", "success");
      router.push("/admin/tips");
    }
  }

  async function handleDelete() {
    setSaving(true);
    const { error } = await deleteTip(tipId);
    setSaving(false);

    if (error) {
      showToast("Gagal menghapus tips", "error");
    } else {
      showToast("Tips dihapus", "success");
      router.push("/admin/tips");
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Edit Tips</h1>
        <p className="text-sm text-muted">Memuat...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Edit Tips</h1>
          <p className="text-sm text-muted">Edit tips edukasi finansial</p>
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
            disabled={saving}
            className="px-4 py-2 bg-[#2563eb] text-white rounded-md hover:bg-[#1d4ed8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            disabled={saving}
            className="px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hapus
          </button>
          <Link
            href="/admin/tips"
            className="px-4 py-2 border border-base rounded-md hover:bg-black/[.03] dark:hover:bg-white/[.06] transition"
          >
            Batal
          </Link>
        </div>
      </form>

      <Modal
        open={confirmOpen}
        onClose={() => (!saving ? setConfirmOpen(false) : null)}
        title="Hapus Tips?"
        description={`Tips "${form.title}" akan dihapus permanen.`}
      >
        <p className="text-sm text-muted mb-4">
          Aksi ini tidak bisa dibatalkan. Pengguna tidak akan lagi melihat tips ini
          di halaman Tips.
        </p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setConfirmOpen(false)}
            disabled={saving}
            className="text-sm px-3 py-2 rounded-md border border-base"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={saving}
            className="text-sm px-3 py-2 rounded-md border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Menghapus..." : "Hapus"}
          </button>
        </div>
      </Modal>
    </div>
  );
}

