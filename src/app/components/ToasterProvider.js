"use client";

import { Toaster } from "react-hot-toast";

export default function ToasterProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 3000,
        style: {
          background: "var(--card)",
          color: "var(--foreground)",
          border: "1px solid var(--border)",
        },
        success: {
          iconTheme: {
            primary: "#22C55E",
            secondary: "white",
          },
        },
        error: {
          iconTheme: {
            primary: "#EF4444",
            secondary: "white",
          },
        },
      }}
    />
  );
}

