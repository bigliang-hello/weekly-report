import Link from "next/link";
import { getAllReports, getModerationStatsForReports } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const [reports, stats] = await Promise.all([
    getAllReports(),
    getModerationStatsForReports(),
  ]);

  const totalHidden = Object.values(stats).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-full">
      {/* Page header */}
      <div className="px-8 pt-8 pb-6 border-b border-[var(--color-border)]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-[var(--color-foreground)] tracking-tight">
              周报审核
            </h1>
            <p className="text-sm text-[var(--color-muted)] mt-1">
              {reports.length} 份周报 · {totalHidden} 条内容已下架
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="px-8 py-6">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="text-left px-5 py-3.5 text-[11px] font-semibold uppercase tracking-widest text-[var(--color-muted-fg)]">
                  ID
                </th>
                <th className="text-left px-5 py-3.5 text-[11px] font-semibold uppercase tracking-widest text-[var(--color-muted-fg)]">
                  时间范围
                </th>
                <th className="text-left px-5 py-3.5 text-[11px] font-semibold uppercase tracking-widest text-[var(--color-muted-fg)]">
                  类型
                </th>
                <th className="text-left px-5 py-3.5 text-[11px] font-semibold uppercase tracking-widest text-[var(--color-muted-fg)]">
                  创建时间
                </th>
                <th className="text-left px-5 py-3.5 text-[11px] font-semibold uppercase tracking-widest text-[var(--color-muted-fg)]">
                  状态
                </th>
                <th className="text-right px-5 py-3.5 text-[11px] font-semibold uppercase tracking-widest text-[var(--color-muted-fg)]">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {reports.map((report) => {
                const hiddenCount = stats[report.id] || 0;
                return (
                  <tr
                    key={report.id}
                    className="group transition-colors hover:bg-[var(--color-neutral-100)]"
                  >
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs text-[var(--color-muted-fg)] bg-[var(--color-neutral-100)] px-1.5 py-0.5 rounded">
                        #{report.id}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-medium text-[var(--color-foreground)] text-sm">
                        {report.time_range.start}
                      </span>
                      <span className="text-[var(--color-muted)] mx-1">—</span>
                      <span className="font-medium text-[var(--color-foreground)] text-sm">
                        {report.time_range.end}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center rounded-md bg-[var(--color-accent-dim)] px-2 py-0.5 text-xs font-semibold text-[var(--color-accent)] border border-[var(--color-accent)]/20">
                        {report.report_type}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[var(--color-muted)] text-xs font-mono">
                        {new Date(report.created_at + " UTC").toLocaleString("zh-CN", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {hiddenCount > 0 ? (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-danger)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--color-danger)] border border-[var(--color-danger)]/20">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="10"
                              height="10"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <circle cx="12" cy="12" r="10" />
                              <line x1="12" x2="12" y1="8" y2="12" />
                              <line x1="12" x2="12.01" y1="16" y2="16" />
                            </svg>
                            {hiddenCount} 条下架
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] inline-block" />
                          正常
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/reports/${report.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-accent)] hover:text-[var(--color-amber-700)] transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M9 11l3 3L22 4" />
                          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                        </svg>
                        审核
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {reports.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-16 text-center"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[var(--color-neutral-100)] flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-[var(--color-muted)]"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                      </div>
                      <p className="text-sm text-[var(--color-muted)]">暂无周报数据</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
