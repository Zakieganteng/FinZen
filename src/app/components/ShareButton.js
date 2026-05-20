"use client";

import { useState } from "react";
import { generateShareText, generateShareImage, showToast } from "../../lib/utils";

export default function ShareButton({ goal, milestone = null, type = "goal" }) {
  const [showMenu, setShowMenu] = useState(false);

  async function handleCopyText() {
    try {
      const text = generateShareText(goal, milestone);
      await navigator.clipboard.writeText(text);
      showToast("✓ Teks disalin ke clipboard", "success");
      setShowMenu(false);
    } catch (e) {
      showToast("⚠ Gagal menyalin teks", "error");
    }
  }

  async function handleShareTwitter() {
    try {
      const text = generateShareText(goal, milestone);
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
      window.open(url, "_blank");
      setShowMenu(false);
    } catch (e) {
      showToast("⚠ Gagal membuka Twitter", "error");
    }
  }

  async function handleDownloadImage() {
    try {
      const dataUrl = await generateShareImage(goal, milestone);
      if (!dataUrl) {
        showToast("⚠ Gagal membuat gambar", "error");
        return;
      }

      const link = document.createElement("a");
      link.download = `finzen-goal-${goal.id || "achievement"}.png`;
      link.href = dataUrl;
      link.click();
      showToast("✓ Gambar diunduh", "success");
      setShowMenu(false);
    } catch (e) {
      showToast("⚠ Gagal mengunduh gambar", "error");
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="px-3 py-2 rounded-md text-sm border border-base bg-black/[.04] dark:bg-white/[.06] hover:opacity-80 transition flex items-center gap-2"
      >
        <span>📤</span>
        <span>Share</span>
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-48 rounded-lg border border-base card shadow-lg z-20">
            <div className="p-1">
              <button
                onClick={handleCopyText}
                className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-black/[.04] dark:hover:bg-white/[.06] transition"
              >
                📋 Copy Text
              </button>
              <button
                onClick={handleShareTwitter}
                className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-black/[.04] dark:hover:bg-white/[.06] transition"
              >
                🐦 Share ke Twitter
              </button>
              <button
                onClick={handleDownloadImage}
                className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-black/[.04] dark:hover:bg-white/[.06] transition"
              >
                🖼️ Download Image
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

