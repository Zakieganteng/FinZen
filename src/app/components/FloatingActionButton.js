"use client";

import { useState } from "react";
import { AddTransactionModal } from "../ui";

export default function FloatingActionButton() {
  const [openModal, setOpenModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpenModal(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 md:h-16 md:w-16 rounded-full bg-[#2563eb] text-white shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center text-2xl md:text-3xl font-semibold focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:ring-offset-2 dark:focus:ring-offset-[var(--card)]"
        aria-label="Tambah transaksi cepat"
      >
        +
      </button>
      <AddTransactionModal open={openModal} onClose={() => setOpenModal(false)} quickMode={true} />
    </>
  );
}

