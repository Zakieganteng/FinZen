"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getTips,
  updateTip,
  deleteTip,
} from "../../../lib/supabase/tips-service";
import { showToast } from "../../../lib/utils";
import { Modal } from "../../ui";

export default function AdminTipsPage() {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tipToDelete, setTipToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await getTips({ activeOnly: false });
    setTips(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleToggleActive = async (tip) => {
    const { error } = await updateTip(tip.id, { is_active: !tip.is_active });
    if (error) {
      showToast("Gagal mengubah status tips", "error");
    } else {
      showToast("Status tips diperbarui", "success");
      load();
    }
  };


  const handleDeleteClick = (tip) => {
    setTipToDelete(tip);
  };

  const confirmDelete = async () => {
    if (!tipToDelete) return;
    setDeleting(true);
    const { error } = await deleteTip(tipToDelete.id);
    setDeleting(false);

    if (error) {
      showToast("Gagal menghapus tips", "error");
    } else {
      showToast("Tips dihapus", "success");
      setTipToDelete(null);
      load();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tips</h1>
          <p className="text-sm text-muted">
            Kelola konten tips edukasi finansial yang tampil di halaman Tips.
          </p>
        </div>
        <Link
          href="/admin/tips/new"
          className="text-sm px-4 py-2 rounded-md border border-base bg-black/[.04] dark:bg-white/[.06] hover:opacity-80 transition"
        >
          + Tambah Tips
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-muted">Memuat tips...</p>
      ) : tips.length === 0 ? (
        <p className="text-sm text-muted">Belum ada tips.</p>
      ) : (
        <div className="space-y-2">
          {tips.map((t) => (
            <div
              key={t.id}
              className="rounded-lg border border-base p-3 flex items-start justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wide text-muted">
                    {t.type}
                  </span>
                  {!t.is_active && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">
                      Nonaktif
                    </span>
                  )}
                </div>
                <h2 className="font-medium mt-1">{t.title}</h2>
                <p className="text-sm text-muted mt-1 line-clamp-2">
                  {t.content}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 text-xs">
                <Link
                  href={`/admin/tips/${t.id}`}
                  className="px-2 py-1 rounded border border-base hover:bg-black/[.03] dark:hover:bg-white/[.06]"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleToggleActive(t)}
                  className="px-2 py-1 rounded border border-base hover:bg-black/[.03] dark:hover:bg-white/[.06]"
                >
                  {t.is_active ? "Nonaktifkan" : "Aktifkan"}
                </button>
                <button
                  onClick={() => handleDeleteClick(t)}
                  className="px-2 py-1 rounded border border-base text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={!!tipToDelete}
        onClose={() => (!deleting ? setTipToDelete(null) : null)}
        title="Hapus Tips?"
        description={
          tipToDelete
            ? `Tips "${tipToDelete.title}" akan dihapus permanen dari daftar tips.`
            : ""
        }
      >
        <p className="text-sm text-muted mb-4">
          Aksi ini tidak dapat dibatalkan. Pengguna tidak akan lagi melihat tips
          ini di halaman Tips.
        </p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setTipToDelete(null)}
            disabled={deleting}
            className="text-sm px-3 py-2 rounded-md border border-base"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={confirmDelete}
            disabled={deleting}
            className="text-sm px-3 py-2 rounded-md border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleting ? "Menghapus..." : "Hapus"}
          </button>
        </div>
      </Modal>
    </div>
  );
}


