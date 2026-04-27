"use client";

import { useState } from "react";

interface Props {
  reportId: number;
  onDeleted: (id: number) => void;
}

export default function DeleteReportButton({ reportId, onDeleted }: Props) {
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);

  async function handleDelete() {
    if (!confirm) {
      setConfirm(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reports?id=${reportId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        onDeleted(reportId);
      }
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setLoading(false);
      setConfirm(false);
    }
  }

  function handleBlur() {
    // Delay to allow click on confirm button
    setTimeout(() => setConfirm(false), 150);
  }

  return (
    <button
      onClick={handleDelete}
      onBlur={handleBlur}
      disabled={loading}
      className={`
        inline-flex items-center gap-1.5 text-xs font-medium transition-all duration-150
        ${confirm
          ? "text-white bg-[var(--color-danger)] px-2.5 py-1 rounded-md"
          : "text-[var(--color-muted)] hover:text-[var(--color-danger)]"
        }
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      {loading ? (
        <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      ) : confirm ? (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          确认删除
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
          删除
        </>
      )}
    </button>
  );
}
