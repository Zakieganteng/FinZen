"use client";

import { useEffect, useState } from "react";
import { getAllFeedback } from "../../../lib/supabase/admin-service";

export default function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await getAllFeedback({ limit: 100, offset: 0 });
      setFeedback(data || []);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Feedback</h1>
        <p className="text-sm text-muted">
          Semua feedback yang dikirim user. Halaman ini masih versi pertama
          (tanpa filter lanjutan).
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-muted">Memuat feedback...</p>
      ) : feedback.length === 0 ? (
        <p className="text-sm text-muted">Belum ada feedback.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-base">
          <table className="min-w-full text-sm">
            <thead className="bg-black/[.03] dark:bg-white/[.04]">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-muted">
                  Tanggal
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-muted">
                  Rating
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-muted">
                  Kategori
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-muted">
                  Komentar
                </th>
              </tr>
            </thead>
            <tbody>
              {feedback.map((f) => (
                <tr key={f.id} className="border-t border-base">
                  <td className="px-3 py-2 align-top text-xs">
                    {new Date(f.created_at).toLocaleString("id-ID")}
                  </td>
                  <td className="px-3 py-2 align-top text-xs">⭐ {f.rating}</td>
                  <td className="px-3 py-2 align-top text-xs capitalize">
                    {f.category}
                  </td>
                  <td className="px-3 py-2 align-top text-xs max-w-md">
                    {f.comment || (
                      <span className="text-muted">Tanpa komentar</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


