"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Modal, ProgressBar } from "../ui";
import ShareButton from "./ShareButton";
import { checkBadges } from "../../lib/utils";

export default function FullCelebrationModal({ open, onClose, goal, onMarkCompleted }) {
  const router = useRouter();

  useEffect(() => {
    if (open && typeof window !== "undefined") {
      // Check prefers-reduced-motion
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReducedMotion) return;
      
      // Trigger confetti
      import("canvas-confetti").then((confetti) => {
        const duration = 3000; // Reduced from 5000
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 25, spread: 360, ticks: 50, zIndex: 0 }; // Optimized

        function randomInRange(min, max) {
          return Math.random() * (max - min) + min;
        }

        const interval = setInterval(() => {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            return clearInterval(interval);
          }

          const particleCount = Math.min(40, 40 * (timeLeft / duration)); // Reduced max particles
          confetti.default({
            ...defaults,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
            colors: ["#3B82F6", "#22C55E", "#EAB308", "#F97316", "#A855F7"],
          });
          confetti.default({
            ...defaults,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
            colors: ["#3B82F6", "#22C55E", "#EAB308", "#F97316", "#A855F7"],
          });
        }, 300); // Increased interval for better performance
      });

      // Check badge
      if (goal) {
        const goals = JSON.parse(localStorage.getItem("finzen-goals") || "[]");
        const completedGoals = goals.filter((g) => g.saved >= g.target).length;
        checkBadges("goal", { completedGoals });
      }
    }
  }, [open, goal]);

  if (!open || !goal) return null;

  const handleNewGoal = () => {
    onClose?.();
    router.push("/goals");
    // Note: Goal modal bisa dibuka dengan state/query param
  };

  const handleViewDetail = () => {
    onClose?.();
    // Scroll to goal atau expand goal card
  };

  const handleClose = () => {
    onMarkCompleted?.(goal.id);
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 card rounded-xl p-8 text-center animate-scale-in">
        <div className="text-7xl mb-4 animate-bounce">🎉</div>
        <div className="text-5xl font-bold mb-2" style={{ color: "#A855F7" }}>
          100%
        </div>
        <h2 className="text-2xl font-semibold mb-2">Goal Tercapai!</h2>
        <p className="text-lg mb-1">{goal.title}</p>
        <p className="text-sm text-muted mb-6">
          Selamat! Kamu berhasil mencapai targetmu. Achievement Unlocked!
        </p>

        <div className="mb-6">
          <ProgressBar value={1} current={goal.saved} target={goal.target} showTooltip={true} />
        </div>

        <div className="mb-4 flex justify-center">
          <ShareButton goal={goal} type="goal" />
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={handleNewGoal}
            className="px-4 py-2 rounded-md text-sm font-medium text-white transition-all hover:opacity-90"
            style={{ backgroundColor: "#3B82F6" }}
          >
            Buat Goal Baru
          </button>
          <button
            onClick={handleViewDetail}
            className="px-4 py-2 rounded-md text-sm border border-base bg-black/[.04] dark:bg-white/[.06] hover:opacity-80 transition"
          >
            Lihat Detail
          </button>
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-md text-sm text-muted hover:underline"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

