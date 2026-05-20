"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Card, ProgressBar } from "../ui";
import { generateWeeklyChallenge, checkChallengeProgress, getWeekRange, showToast } from "../../lib/utils";

export default function WeeklyChallengeCard({ transactions, budgets, goals, goalHistory }) {
  const [challenge, setChallenge] = useState(null);
  const [progress, setProgress] = useState({ progress: 0, target: 0, completed: false });
  const [wasCompleted, setWasCompleted] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const weeklyChallenge = generateWeeklyChallenge();
      setChallenge(weeklyChallenge);
    }
  }, []);

  useEffect(() => {
    if (challenge && typeof window !== "undefined") {
      const progressData = checkChallengeProgress(challenge, transactions, budgets, goals, goalHistory);
      setProgress(progressData);

      // Check if just completed
      if (progressData.completed && !wasCompleted) {
        setWasCompleted(true);
        showToast(`🎉 Challenge selesai! ${challenge.reward.value}`, "success");
      }
    }
  }, [challenge, transactions, budgets, goals, goalHistory, wasCompleted]);

  const { sunday } = useMemo(() => getWeekRange(), []);
  const timeLeft = useMemo(() => {
    const now = new Date();
    const diff = sunday - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return { days, hours };
  }, [sunday]);

  if (!challenge) return null;

  const progressPct = progress.target > 0 ? Math.min(1, progress.progress / progress.target) : 0;

  return (
    <Card>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs uppercase tracking-wide text-muted mb-1">Weekly Challenge</div>
            <h3 className="text-lg font-semibold">{challenge.title}</h3>
            <p className="text-sm text-muted mt-1">{challenge.description}</p>
          </div>
          <div className="text-2xl">🎯</div>
        </div>

        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span>
              Progress: {progress.progress} / {progress.target}
            </span>
            <span className={progress.completed ? "text-green-600 font-semibold" : ""}>
              {progress.completed ? "✓ Selesai!" : `${Math.round(progressPct * 100)}%`}
            </span>
          </div>
          <ProgressBar value={progressPct} showTooltip={true} current={progress.progress} target={progress.target} />
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="text-muted">
            {timeLeft.days > 0 ? (
              <span>Tersisa {timeLeft.days} hari {timeLeft.hours} jam</span>
            ) : (
              <span>Tersisa {timeLeft.hours} jam</span>
            )}
          </div>
          <div className="text-muted">
            Reward: <span className="font-medium">{challenge.reward.value}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

