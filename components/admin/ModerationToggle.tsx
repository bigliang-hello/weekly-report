"use client";

import { useState } from "react";

interface Props {
  reportId: number;
  section: string;
  itemIndex: number;
  subSection?: string | null;
  initialHidden: boolean;
  initialReason: string | null;
}

export default function ModerationToggle({
  reportId,
  section,
  itemIndex,
  subSection,
  initialHidden,
  initialReason,
}: Props) {
  const [isHidden, setIsHidden] = useState(initialHidden);
  const [reason, setReason] = useState(initialReason ?? "");
  const [loading, setLoading] = useState(false);

  async function callApi(nextHidden: boolean, nextReason: string | null) {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/moderation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId,
          section,
          itemIndex,
          subSection: subSection ?? undefined,
          isHidden: nextHidden,
          reason: nextReason,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsHidden(nextHidden);
      }
    } catch (err) {
      console.error("Toggle failed:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle() {
    const nextHidden = !isHidden;
    await callApi(nextHidden, reason.trim() || null);
  }

  async function handleReasonBlur() {
    if (!isHidden) return;
    await callApi(true, reason.trim() || null);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <button
          onClick={handleToggle}
          disabled={loading}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            isHidden
              ? "bg-[var(--color-danger)]"
              : "bg-[var(--color-neutral-300)]"
          } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          role="switch"
          aria-checked={isHidden}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              isHidden ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
        <span
          className={`text-xs font-medium ${
            isHidden
              ? "text-[var(--color-danger)]"
              : "text-[var(--color-muted)]"
          }`}
        >
          {isHidden ? "已下架" : "正常"}
        </span>
      </div>

      {isHidden && (
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          onBlur={handleReasonBlur}
          placeholder="下架原因（可选）"
          rows={2}
          className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 py-1 text-xs text-[var(--color-foreground)] outline-none focus:border-[var(--color-accent)] resize-none"
        />
      )}
    </div>
  );
}
