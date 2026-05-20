"use client";

export default function RepeatTransactionCard({ repeatable, onRepeat }) {
  if (!repeatable || repeatable.length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      <div className="text-xs text-muted mb-2">Transaksi yang sering diulang:</div>
      {repeatable.map((item, idx) => (
        <div
          key={idx}
          className="flex items-center justify-between p-3 rounded-lg border border-base card hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-3 flex-1">
            <div className="text-xl">🔄</div>
            <div className="flex-1">
              <div className="text-sm font-medium">{item.category}</div>
              <div className="text-xs text-muted">
                {item.averageAmount.toLocaleString("id-ID")} • {item.count}x dalam 7 hari terakhir
              </div>
            </div>
          </div>
          <button
            onClick={() => onRepeat(item.transaction)}
            className="text-sm px-3 py-1.5 rounded-md border border-base bg-black/[.04] dark:bg-white/[.06] hover:opacity-80 transition"
          >
            Ulangi
          </button>
        </div>
      ))}
    </div>
  );
}

