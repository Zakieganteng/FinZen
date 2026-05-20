"use client";

import { trackMetric } from "../../lib/ab-testing";
import { getABVariant } from "../../lib/ab-testing";

export default function InsightCard({ insight }) {
  if (!insight) return null;

  function handleClick() {
    if (typeof window !== "undefined") {
      const variant = getABVariant();
      trackMetric(variant.id, "insight_click", insight.type);
    }
  }

  return (
    <div
      className="rounded-lg border p-4 card transition-transform duration-150 ease-out hover:shadow-md hover:-translate-y-[1px] cursor-pointer"
      style={{
        borderColor: `${insight.color}40`,
        backgroundColor: `${insight.color}10`,
        willChange: "transform",
      }}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl flex-shrink-0">{insight.icon}</div>
        <div className="flex-1">
          <p className="text-sm" style={{ color: "var(--foreground)" }}>
            {insight.message}
          </p>
        </div>
      </div>
    </div>
  );
}

