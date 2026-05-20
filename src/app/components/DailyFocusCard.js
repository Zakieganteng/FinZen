"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AddTransactionModal } from "../ui";
import { useAuth } from "../../contexts/AuthContext";
import { createTransaction } from "../../lib/supabase/data-service";
import { showToast } from "../../lib/utils";

export default function DailyFocusCard({ action }) {
  const router = useRouter();
  const { user } = useAuth();
  const [openModal, setOpenModal] = useState(false);

  const onAdded = async (item) => {
    if (!user?.id) {
      showToast("Silakan login terlebih dahulu.", "warning");
      throw new Error("not authenticated");
    }

    const { data, error } = await createTransaction(user.id, {
      date: item.date,
      category: item.category,
      amount: item.amount,
      type: item.type || "expense",
      note: item.note || "",
    });

    if (error) throw error;

    showToast("Transaksi berhasil disimpan.", "success");

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("finzen:transaction-added", {
          detail: {
            id: data.id,
            date: data.date,
            category: data.category,
            type: data.type || item.type || "expense",
            amount: parseFloat(data.amount),
            note: data.note || "",
          },
        })
      );
    }
  };

  if (!action) return null;

  function handleAction() {
    switch (action.type) {
      case "record_transaction":
      case "maintain_streak":
        setOpenModal(true);
        break;
      case "check_budget":
        router.push("/budgeting");
        break;
      case "topup_goal":
        router.push("/goals");
        // Note: Auto-open topup modal bisa di-handle di goals page dengan query param
        break;
      default:
        break;
    }
  }

  return (
    <>
      <div
        className="rounded-xl border-2 p-6 card cursor-pointer transition-all hover:shadow-lg hover:-translate-y-[2px] active:translate-y-[0]"
        style={{
          borderColor: action.color,
          backgroundColor: `${action.color}15`,
        }}
        onClick={handleAction}
      >
        <div className="flex items-start gap-4">
          <div
            className="h-12 w-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0"
            style={{
              backgroundColor: `${action.color}25`,
            }}
          >
            {action.icon}
          </div>
          <div className="flex-1">
            <div className="text-xs uppercase tracking-wide mb-1" style={{ color: action.color }}>
              Fokus Hari Ini
            </div>
            <h3 className="text-lg font-semibold mb-1">{action.title}</h3>
            <p className="text-sm text-muted mb-4">{action.description}</p>
            <button
              className="px-4 py-2 rounded-md text-sm font-medium text-white transition-all hover:opacity-90 active:scale-95"
              style={{ backgroundColor: action.color }}
            >
              Aksi Sekarang →
            </button>
          </div>
        </div>
      </div>
      <AddTransactionModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onAdded={onAdded}
        quickMode={true}
      />
    </>
  );
}

