"use client";

import { useEffect } from "react";
import { Modal } from "../ui";
import { getBadgeById } from "../../lib/badges";

export default function BadgeUnlockModal({ open, onClose, badgeId }) {
  const badge = badgeId ? getBadgeById(badgeId) : null;

  useEffect(() => {
    if (open && badge) {
      // Auto-close after 3 seconds
      const timer = setTimeout(() => {
        onClose?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [open, badge, onClose]);

  if (!open || !badge) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="🎉 Badge Unlocked!"
      description={badge.name}
    >
      <div className="space-y-4 text-center">
        <div className="text-6xl animate-bounce">{badge.icon}</div>
        <div>
          <h3 className="text-lg font-semibold mb-1">{badge.name}</h3>
          <p className="text-sm text-muted">{badge.description}</p>
        </div>
        <button
          onClick={onClose}
          className="text-sm px-4 py-2 rounded-md border border-base bg-black/[.04] dark:bg-white/[.06] hover:opacity-80 transition"
        >
          Tutup
        </button>
      </div>
    </Modal>
  );
}

