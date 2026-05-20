"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { ProgressBar, Card, SectionHeader, GoalModal, TopUpGoalModal } from "../ui";
import MilestoneCelebrationModal from "../components/MilestoneCelebrationModal";
import FullCelebrationModal from "../components/FullCelebrationModal";
import BadgeUnlockModal from "../components/BadgeUnlockModal";
import { showToast, checkMilestone, checkBadges } from "../../lib/utils";
import { useAuth } from "../../contexts/AuthContext";
import { getGoals, createGoal, updateGoal, deleteGoal as deleteGoalFromDB, getGoalHistory, addGoalHistory } from "../../lib/supabase/data-service";

// Lazy load Recharts components
const ResponsiveContainer = dynamic(() => import("recharts").then(mod => mod.ResponsiveContainer), { ssr: false });
const AreaChart = dynamic(() => import("recharts").then(mod => mod.AreaChart), { ssr: false });
const Area = dynamic(() => import("recharts").then(mod => mod.Area), { ssr: false });
const XAxis = dynamic(() => import("recharts").then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then(mod => mod.YAxis), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then(mod => mod.Tooltip), { ssr: false });
const PieChart = dynamic(() => import("recharts").then(mod => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import("recharts").then(mod => mod.Pie), { ssr: false });
const Cell = dynamic(() => import("recharts").then(mod => mod.Cell), { ssr: false });
const Legend = dynamic(() => import("recharts").then(mod => mod.Legend), { ssr: false });

export default function GoalsPage() {
  const { user, loading: authLoading } = useAuth();
  const [goals, setGoals] = useState([]);
  const [openGoal, setOpenGoal] = useState(false);
  const [editGoal, setEditGoal] = useState(null);
  const [openTopUp, setOpenTopUp] = useState(false);
  const [topUpGoal, setTopUpGoal] = useState(null);
  const [history, setHistory] = useState([]);
  const [milestoneCelebration, setMilestoneCelebration] = useState({ open: false, milestone: null, goal: null });
  const [fullCelebration, setFullCelebration] = useState({ open: false, goal: null });
  const [badgeUnlock, setBadgeUnlock] = useState({ open: false, badgeId: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user?.id) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const [goalsResult, historyResult] = await Promise.all([
          getGoals(user.id),
          getGoalHistory(user.id),
        ]);

        if (goalsResult.error) throw goalsResult.error;
        if (historyResult.error) throw historyResult.error;

        const g = (goalsResult.data || []).map(gl => ({
          id: gl.id,
          title: gl.title,
          target: parseFloat(gl.target),
          saved: parseFloat(gl.saved || 0),
          dueDate: gl.due_date,
          due_date: gl.due_date,
          priority: gl.priority || "normal",
          completed: gl.completed || false,
        }));

        const h = (historyResult.data || []).map(hist => ({
          id: hist.id,
          goalId: hist.goal_id,
          date: hist.date,
          amount: parseFloat(hist.amount),
          note: hist.note || "",
        }));

        setGoals(g);
        setHistory(h);
      } catch (error) {
        console.error("Error loading goals:", error);
        showToast("Gagal memuat goals. Coba refresh halaman.", "error");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id, authLoading]);

  const saveGoal = async (goal) => {
    if (!user?.id) return;

    try {
      let result;
      if (goal.id && goals.find(g => g.id === goal.id)) {
        result = await updateGoal(goal.id, {
          title: goal.title,
          target: goal.target,
          saved: goal.saved,
          due_date: goal.due_date,
          priority: goal.priority,
          completed: goal.completed,
        });
      } else {
        result = await createGoal(user.id, {
          title: goal.title,
          target: goal.target,
          saved: goal.saved || 0,
          due_date: goal.due_date,
          priority: goal.priority || "normal",
        });
      }

      if (result.error) throw result.error;

      const savedGoal = {
        id: result.data.id,
        title: result.data.title,
        target: parseFloat(result.data.target),
        saved: parseFloat(result.data.saved || 0),
        dueDate: result.data.due_date,
        due_date: result.data.due_date,
        priority: result.data.priority || "normal",
        completed: result.data.completed || false,
      };

      setGoals((prev) => {
        const exists = prev.find((g) => g.id === savedGoal.id);
        const updated = exists ? prev.map((g) => (g.id === savedGoal.id ? savedGoal : g)) : [savedGoal, ...prev];
        
        const completedGoals = updated.filter(g => g.saved >= g.target).length;
        const newlyUnlocked = checkBadges("goal", { completedGoals });
        if (newlyUnlocked.length > 0) {
          setBadgeUnlock({ open: true, badgeId: newlyUnlocked[0] });
        }
        
        return updated;
      });

      showToast("✓ Goal berhasil disimpan", "success");
    } catch (error) {
      console.error("Error saving goal:", error);
      showToast("Gagal menyimpan goal. Coba lagi.", "error");
    }
  };

  const deleteGoal = async (id) => {
    if (!confirm("Hapus goal ini?")) return;
    if (!user?.id) return;

    try {
      const { error } = await deleteGoalFromDB(id);
      if (error) throw error;

      setGoals((prev) => prev.filter((g) => g.id !== id));
      setHistory((prev) => prev.filter((h) => h.goalId !== id));
      showToast("✓ Goal berhasil dihapus", "success");
    } catch (error) {
      console.error("Error deleting goal:", error);
      showToast("Gagal menghapus goal. Coba lagi.", "error");
    }
  };

  const onTopUp = async (item) => {
    if (!user?.id) return;

    const goal = goals.find(g => g.id === item.goalId);
    if (!goal) return;
    
    try {
      const { data, error } = await addGoalHistory(item.goalId, user.id, {
        amount: item.amount,
        date: item.date,
        note: item.note || "",
      });

      if (error) throw error;

      const historyItem = {
        id: data.id,
        goalId: data.goal_id,
        date: data.date,
        amount: parseFloat(data.amount),
        note: data.note || "",
      };

      const previousSaved = goal.saved;
      const newSaved = goal.saved + item.amount;
      
      setHistory((prev) => [historyItem, ...prev]);
      setGoals((prev) => prev.map((g) => (g.id === item.goalId ? { ...g, saved: newSaved } : g)));
      
      showToast("✓ Top up berhasil", "success");
      
      if (newSaved >= goal.target && previousSaved < goal.target) {
        setTimeout(() => {
          setFullCelebration({
            open: true,
            goal: { ...goal, saved: newSaved },
          });
        }, 500);
      } else {
        const milestone = checkMilestone(newSaved, goal.target, previousSaved);
        if (milestone && milestone.crossed) {
          setTimeout(() => {
            setMilestoneCelebration({
              open: true,
              milestone: milestone.milestone,
              goal: { ...goal, saved: newSaved },
            });
          }, 500);
        }
      }
      
      const updatedGoals = goals.map((g) => (g.id === item.goalId ? { ...g, saved: newSaved } : g));
      const completedGoals = updatedGoals.filter(g => g.saved >= g.target).length;
      const newlyUnlocked = checkBadges("goal", { completedGoals });
      if (newlyUnlocked.length > 0) {
        setTimeout(() => {
          setBadgeUnlock({ open: true, badgeId: newlyUnlocked[0] });
        }, 2000);
      }
    } catch (error) {
      console.error("Error adding top up:", error);
      showToast("Gagal menambahkan top up. Coba lagi.", "error");
    }
  };
  
  const markGoalCompleted = async (goalId) => {
    if (!user?.id) return;

    try {
      const result = await updateGoal(goalId, { completed: true });
      if (result.error) throw result.error;

      setGoals((prev) =>
        prev.map((g) => (g.id === goalId ? { ...g, completed: true } : g))
      );
      showToast("✓ Goal ditandai selesai", "success");
    } catch (error) {
      console.error("Error marking goal completed:", error);
      showToast("Gagal menandai goal selesai", "error");
    }
  };

  const allocation = useMemo(() => goals.map((g) => ({ name: g.title, value: g.saved })), [goals]);
  const colors = ["#3B82F6", "#22C55E", "#A855F7", "#EAB308", "#EF4444", "#06B6D4"];

  function monthlyRecommendation(goal) {
    if (!goal.dueDate) return null;
    const today = new Date();
    const due = new Date(goal.dueDate);
    const months = Math.max(1, (due.getFullYear() - today.getFullYear()) * 12 + (due.getMonth() - today.getMonth()));
    const remaining = Math.max(0, goal.target - goal.saved);
    return Math.ceil(remaining / months);
  }

  function riskStatus(goal) {
    const rec = monthlyRecommendation(goal);
    if (!rec) return { label: "Tanpa target", color: "#9ca3af" };
    const ratio = rec / Math.max(1, goal.target);
    if (ratio > 0.1) return { label: "Mengejar", color: "#EAB308" };
    return { label: "Aman", color: "#22C55E" };
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Goals</h1>
        <button onClick={() => { setEditGoal(null); setOpenGoal(true); }} className="text-sm px-3 py-2 rounded-md border border-base bg-[#2563eb] text-white shadow-sm hover:shadow-md hover:-translate-y-[1px] transition">+ Buat Goal</button>
      </div>

      <div className="flex items-center gap-3">
        <select className="border border-base rounded-md px-3 py-2 text-sm" onChange={(e) => {
          const v = e.target.value;
          setGoals((prev) => {
            const arr = [...prev];
            if (v === 'priority') arr.sort((a,b)=> (a.priority||'normal').localeCompare(b.priority||'normal'));
            if (v === 'due') arr.sort((a,b)=> (a.dueDate||'9999-12-31').localeCompare(b.dueDate||'9999-12-31'));
            if (v === 'remaining') arr.sort((a,b)=> (a.target-a.saved)-(b.target-b.saved));
            return arr;
          });
        }}>
          <option value="">Urutkan</option>
          <option value="priority">Prioritas</option>
          <option value="due">Terdekat (due date)</option>
          <option value="remaining">Sisa target</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <SectionHeader title="Alokasi Terkumpul" subtitle="Komposisi tabungan per goal" />
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie 
                  data={allocation} 
                  dataKey="value" 
                  nameKey="name" 
                  innerRadius={70} 
                  outerRadius={110} 
                  paddingAngle={3}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {allocation.map((_, i) => (
                    <Cell key={i} fill={colors[i % colors.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(v) => v.toLocaleString("id-ID")} 
                  contentStyle={{ 
                    backgroundColor: 'var(--card)', 
                    border: '1px solid var(--border)',
                    color: 'var(--foreground)'
                  }}
                  itemStyle={{ color: 'var(--foreground)' }}
                  labelStyle={{ color: 'var(--foreground)' }}
                />
                <Legend 
                  wrapperStyle={{ color: 'var(--foreground)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <SectionHeader title="Proyeksi" subtitle="Rekomendasi tabungan per bulan (jika ada target tanggal)" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((g) => (
              <div key={g.id} className="rounded-lg border border-base p-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium truncate">{g.title}</div>
                  <span className="text-xs" style={{ color: riskStatus(g).color }}>{riskStatus(g).label}</span>
                </div>
                <div className="text-sm text-muted mt-1">Rekomendasi/bulan: {monthlyRecommendation(g)?.toLocaleString("id-ID") || "-"}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map((g) => {
          const pct = Math.min(1, g.saved / Math.max(1, g.target));
          const spark = history
            .filter((h) => h.goalId === g.id)
            .sort((a, b) => a.date.localeCompare(b.date))
            .reduce((acc, h) => {
              const last = acc.length ? acc[acc.length-1].value : (g.saved - history.filter((x)=>x.goalId===g.id && x.date>=h.date).reduce((s,x)=>s+x.amount,0));
              acc.push({ date: h.date, value: last + h.amount });
              return acc;
            }, []);
          return (
            <Card key={g.id}>
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-medium truncate">{g.title}</h2>
                <div className="flex gap-2">
                  <button className="text-sm px-2 py-1.5 rounded-md border border-base" onClick={() => { setEditGoal(g); setOpenGoal(true); }}>Edit</button>
                  <button className="text-sm px-2 py-1.5 rounded-md border border-base" onClick={() => deleteGoal(g.id)}>Hapus</button>
                </div>
              </div>
              <div className="text-sm text-muted mb-2">{g.saved.toLocaleString("id-ID")} / {g.target.toLocaleString("id-ID")}</div>
              <ProgressBar value={pct} current={g.saved} target={g.target} showTooltip={true} />
              {spark.length > 0 && (
                <div className="mt-3" style={{ width: "100%", height: 100 }}>
                  <ResponsiveContainer>
                    <AreaChart data={spark}>
                      <XAxis dataKey="date" hide />
                      <YAxis hide />
                      <Tooltip formatter={(v) => v.toLocaleString('id-ID')} />
                      <Area type="monotone" dataKey="value" stroke="#60A5FA" fill="#93C5FD55" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="flex items-center justify-between mt-3">
                <button className="text-sm px-3 py-1.5 rounded-md border border-base" onClick={() => { setTopUpGoal(g); setOpenTopUp(true); }}>+ Top up</button>
                <span className="text-sm">{Math.round(pct*100)}%</span>
              </div>
              <div className="mt-3">
                <SectionHeader title="Riwayat" subtitle="Top up terbaru" />
                <div className="space-y-2 max-h-40 overflow-auto">
                  {history.filter((h) => h.goalId === g.id).slice(0,6).map((h) => (
                    <div key={h.id} className="text-sm flex items-center justify-between">
                      <span className="text-muted">{h.date}</span>
                      <span>{h.amount.toLocaleString("id-ID")}</span>
                    </div>
                  ))}
                  {history.filter((h) => h.goalId === g.id).length === 0 && (
                    <div className="text-sm text-muted">Belum ada top up</div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <GoalModal open={openGoal} onClose={() => setOpenGoal(false)} initialGoal={editGoal} onSave={saveGoal} />
      <TopUpGoalModal open={openTopUp} onClose={() => setOpenTopUp(false)} goal={topUpGoal} onTopUp={onTopUp} />
      <MilestoneCelebrationModal
        open={milestoneCelebration.open}
        onClose={() => setMilestoneCelebration({ open: false, milestone: null, goal: null })}
        milestone={milestoneCelebration.milestone}
        goal={milestoneCelebration.goal}
      />
      <FullCelebrationModal
        open={fullCelebration.open}
        onClose={() => setFullCelebration({ open: false, goal: null })}
        goal={fullCelebration.goal}
        onMarkCompleted={markGoalCompleted}
      />
      <BadgeUnlockModal
        open={badgeUnlock.open}
        onClose={() => setBadgeUnlock({ open: false, badgeId: null })}
        badgeId={badgeUnlock.badgeId}
      />
    </div>
  );
}