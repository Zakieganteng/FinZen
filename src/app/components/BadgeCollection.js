"use client";

import { useEffect, useState } from "react";
import { badgeDefinitions, getBadgeById } from "../../lib/badges";

export default function BadgeCollection({ compact = false }) {
  const [unlocked, setUnlocked] = useState([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = JSON.parse(localStorage.getItem("finzen-badges") || "[]");
        setUnlocked(saved);
      } catch (e) {}
    }
  }, []);

  const unlockedIds = new Set(unlocked.map(b => b.id));
  const unlockedCount = unlockedIds.size;
  const totalCount = badgeDefinitions.length;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted">Badges:</span>
        <span className="text-sm font-medium">
          {unlockedCount} / {totalCount}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Badges</h3>
        <span className="text-xs text-muted">{unlockedCount} / {totalCount}</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {badgeDefinitions.map((badge) => {
          const isUnlocked = unlockedIds.has(badge.id);
          return (
            <div
              key={badge.id}
              className={`relative p-2 rounded-lg border text-center transition-all ${
                isUnlocked
                  ? "border-base card"
                  : "border-base opacity-40"
              }`}
              title={badge.description}
            >
              <div className="text-2xl mb-1">{badge.icon}</div>
              <div className="text-xs font-medium truncate">{badge.name}</div>
              {!isUnlocked && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg">🔒</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

