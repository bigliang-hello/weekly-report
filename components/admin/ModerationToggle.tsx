"use client";

import { useState } from "react";

interface Props {
  reportId: number;
  section: string;
  itemIndex: number;
  subSection?: string | null;
  initialHidden: boolean;
}

export default function ModerationToggle({
  reportId,
  section,
  itemIndex,
  subSection,
  initialHidden,
}: Props) {
  const [isHidden, setIsHidden] = useState(initialHidden);
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    const nextHidden = !isHidden;
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

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      aria-label={isHidden ? "恢复显示" : "下架"}
      className={`
        relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-md
        border transition-all duration-200 ease-out focus-visible:outline-none
        focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2
        ${loading ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
        ${
          isHidden
            ? "border-[var(--color-danger)]/40 bg-[var(--color-danger)]/10"
            : "border-[var(--color-success)]/40 bg-[var(--color-success)]/10"
        }
      `}
    >
      {/* Knob */}
      <span
        className={`
          absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-md shadow-sm
          transition-all duration-200 ease-out flex items-center justify-center
          ${isHidden ? "left-[22px]" : "left-[3px]"}
        `}
      >
        {isHidden ? (
          /* Eye-off icon */
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[var(--color-danger)]"
          >
            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
            <line x1="2" x2="22" y1="2" y2="22" />
          </svg>
        ) : (
          /* Eye icon */
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[var(--color-success)]"
          >
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </span>

      {/* Track label — subtle text at ends */}
      <span
        className={`
          absolute inset-0 flex items-center justify-center
          text-[9px] font-mono font-medium tracking-wider
          transition-opacity duration-200
          ${isHidden ? "text-[var(--color-danger)] opacity-100" : "text-[var(--color-success)] opacity-0"}
        `}
        style={{ pointerEvents: "none" }}
      >
        OFF
      </span>
    </button>
  );
}
