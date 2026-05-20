"use client";

import InsightCard from "./InsightCard";
import { generateInsights } from "../../lib/utils";
import { getABVariant, calculateDynamicMaxInsights } from "../../lib/ab-testing";
import { useMemo, useEffect, useState } from "react";

export default function InsightCards({ transactions, budgets, goals, streak }) {
  const [variant, setVariant] = useState(null);
  const [maxInsights, setMaxInsights] = useState(3);
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      const v = getABVariant();
      setVariant(v);
      
      if (v.id === "C") {
        // Dynamic variant
        const dynamic = calculateDynamicMaxInsights(streak, transactions.length);
        setMaxInsights(dynamic);
      } else {
        setMaxInsights(v.maxInsights);
      }
    }
  }, [streak, transactions.length]);
  
  const insights = useMemo(
    () => generateInsights(transactions, budgets, goals, streak, maxInsights),
    [transactions, budgets, goals, streak, maxInsights]
  );

  if (!insights || insights.length === 0) return null;

  return (
    <section>
      <div className="mb-2">
        <h2 className="font-medium" style={{ color: "var(--foreground)" }}>
          Insight Hari Ini
        </h2>
        <p className="text-sm text-muted mt-0.5">Pola penting dari aktivitas finansialmu</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {insights.map((insight, idx) => (
          <InsightCard key={idx} insight={insight} />
        ))}
      </div>
    </section>
  );
}

