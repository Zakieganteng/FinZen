"use client";

import { useEffect } from "react";
import { Modal, ProgressBar } from "../ui";
import ShareButton from "./ShareButton";

export default function MilestoneCelebrationModal({ open, onClose, milestone, goal }) {
  useEffect(() => {
    if (open && typeof window !== "undefined") {
      // Check prefers-reduced-motion
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReducedMotion) return;
      
      // Import and trigger confetti
      import("canvas-confetti").then((confetti) => {
        const duration = 2000; // Reduced from 3000
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
    }
  }, [open]);

  if (!open || !milestone || !goal) return null;

  const messages = {
    25: "🔥 Keren! Sudah melewati 25% target.",
    50: "💪 Mantap! Setengah jalan sudah terlewati.",
    75: "👏 Hebat! Hampir sampai di finish line.",
    100: "🎉 Selamat! Goal tercapai 100%! Achievement Unlocked!",
  };

  const message = messages[milestone] || "🎉 Milestone tercapai!";
  const currentPct = goal.saved / Math.max(1, goal.target);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Milestone ${milestone}%`}
      description={message}
    >
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-5xl font-bold mb-2" style={{ color: "#A855F7" }}>
            {milestone}%
          </div>
          <p className="text-sm text-muted">{goal.title}</p>
        </div>

        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span>Progress</span>
            <span>{Math.round(currentPct * 100)}%</span>
          </div>
          <ProgressBar value={currentPct} current={goal.saved} target={goal.target} showTooltip={true} />
          
          {/* Milestone markers */}
          <div className="relative h-2 mt-1">
            {[25, 50, 75, 100].map((m) => (
              <div
                key={m}
                className="absolute w-1 h-2 rounded-full"
                style={{
                  left: `${m}%`,
                  transform: "translateX(-50%)",
                  backgroundColor: currentPct >= m / 100 ? "#A855F7" : "rgba(127,127,127,0.3)",
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <ShareButton goal={goal} milestone={milestone} type="milestone" />
          <button
            onClick={onClose}
            className="text-sm px-4 py-2 rounded-md border border-base bg-black/[.04] dark:bg-white/[.06] hover:opacity-80 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </Modal>
  );
}

