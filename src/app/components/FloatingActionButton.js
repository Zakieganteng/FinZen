"use client";

import { useState } from "react";
import { AddTransactionModal } from "../ui";
import { useAuth } from "../../contexts/AuthContext";
import { createTransaction } from "../../lib/supabase/data-service";
import { showToast } from "../../lib/utils";

export default function FloatingActionButton() {
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

  return (
    <>
      <button
        onClick={() => setOpenModal(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 md:h-16 md:w-16 rounded-full bg-[#2563eb] text-white shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center text-2xl md:text-3xl font-semibold focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:ring-offset-2 dark:focus:ring-offset-[var(--card)]"
        aria-label="Tambah transaksi cepat"
      >
        +
      </button>
      <AddTransactionModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onAdded={onAdded}
        quickMode={true}
      />
    </>
  );
}

