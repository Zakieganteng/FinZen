"use client";

import { useEffect, useState } from "react";
import { Card, SectionHeader } from "../ui";
import { recordingBadgeDefinitions } from "../../lib/badges";

const THRESHOLDS = recordingBadgeDefinitions.map((b) => b.threshold);

export default function RecordingBadgesCard({ transactionCount = 0 }) {
  const [unlockedIds, setUnlockedIds] = useState(new Set());

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = JSON.parse(localStorage.getItem("finzen-badges") || "[]");
      setUnlockedIds(new Set(saved.map((b) => b.id)));
    } catch {
      setUnlockedIds(new Set());
    }
  }, [transactionCount]);

  const unlockedRecording = recordingBadgeDefinitions.filter((b) =>
    unlockedIds.has(b.id)
  ).length;
  const nextThreshold = THRESHOLDS.find((t) => transactionCount < t) ?? 15;
  const progressToNext =
    nextThreshold > 0 ? Math.min(1, transactionCount / nextThreshold) : 1;

  return (
    <Card>
      <SectionHeader
        title="Badge Pencatat"
        subtitle="Penghargaan untuk kebiasaan mencatat transaksi"
      />
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <p className="text-sm text-muted">Total transaksi tercatat</p>
          <p className="text-2xl font-semibold">{transactionCount}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted">Badge terbuka</p>
          <p className="text-2xl font-semibold">
            {unlockedRecording} / {recordingBadgeDefinitions.length}
          </p>
        </div>
      </div>

      {transactionCount < 15 && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-muted mb-1">
            <span>Menuju {nextThreshold} transaksi</span>
            <span>
              {transactionCount} / {nextThreshold}
            </span>
          </div>
          <div className="h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#3B82F6] transition-all duration-300"
              style={{ width: `${Math.round(progressToNext * 100)}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {recordingBadgeDefinitions.map((badge) => {
          const isUnlocked = unlockedIds.has(badge.id);

          return (
            <div
              key={badge.id}
              className={`relative p-4 rounded-xl border text-center transition-all ${
                isUnlocked
                  ? "border-[#3B82F6]/40 bg-[rgba(59,130,246,0.08)]"
                  : "border-base opacity-50"
              }`}
              title={badge.description}
            >
              <div className="text-3xl mb-2">{badge.icon}</div>
              <div className="text-sm font-medium">{badge.name}</div>
              <div className="text-xs text-muted mt-1">{badge.description}</div>
              <div className="text-xs font-medium mt-2 text-[#3B82F6]">
                {badge.threshold}+ transaksi
              </div>
              {!isUnlocked && (
                <div className="absolute top-2 right-2 text-lg">🔒</div>
              )}
              {isUnlocked && (
                <div className="absolute top-2 right-2 text-xs font-medium text-[#3B82F6]">
                  ✓
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
