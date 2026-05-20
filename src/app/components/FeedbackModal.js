"use client";

import { useState } from "react";
import { Modal } from "../ui";
import { saveFeedback, showToast } from "../../lib/utils";
import { useAuth } from "../../contexts/AuthContext";

export default function FeedbackModal({ open, onClose }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    rating: 0,
    comment: "",
    category: "suggestion",
  });
  const [hoveredStar, setHoveredStar] = useState(0);

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.rating === 0) {
      showToast("⚠ Mohon beri rating", "warning");
      return;
    }

    try {
      await saveFeedback(
        {
          rating: form.rating,
          comment: form.comment,
          category: form.category,
        },
        user?.id
      );

      showToast("✓ Terima kasih atas feedbackmu!", "success");
      setForm({ rating: 0, comment: "", category: "suggestion" });
      onClose?.();
    } catch (error) {
      console.error("Error saving feedback:", error);
      showToast("⚠ Gagal menyimpan feedback. Coba lagi.", "error");
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Feedback"
      description="Bantu kami meningkatkan FinZen dengan feedbackmu"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Rating</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setForm({ ...form, rating: star })}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                className="text-2xl transition-transform duration-150 hover:scale-110"
                aria-label={`Rate ${star} stars`}
              >
                {star <= (hoveredStar || form.rating) ? "⭐" : "☆"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Kategori</label>
          <select
            className="w-full border border-base rounded-md px-3 py-2"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option value="bug">Bug</option>
            <option value="suggestion">Saran</option>
            <option value="question">Pertanyaan</option>
            <option value="other">Lainnya</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Komentar (opsional)</label>
          <textarea
            className="w-full border border-base rounded-md px-3 py-2 min-h-[100px]"
            placeholder="Bagikan pendapatmu tentang FinZen..."
            value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="text-sm px-4 py-2 rounded-md border border-base"
          >
            Batal
          </button>
          <button
            type="submit"
            className="text-sm px-4 py-2 rounded-md border border-base bg-black/[.04] dark:bg-white/[.06] hover:opacity-80 transition"
          >
            Kirim
          </button>
        </div>
      </form>
    </Modal>
  );
}

