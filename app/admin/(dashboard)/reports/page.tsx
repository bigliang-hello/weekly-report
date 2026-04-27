import Link from "next/link";
import { getAllReports, getModerationStatsForReports } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const [reports, stats] = await Promise.all([
    getAllReports(),
    getModerationStatsForReports(),
  ]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-foreground)]">
            周报审核
          </h1>
          <p className="text-sm text-[var(--color-muted)] mt-1">
            共 {reports.length} 条周报
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-neutral-100)]">
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-fg)]">
                  ID
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-fg)]">
                  时间范围
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-fg)]">
                  类型
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-fg)]">
                  创建时间
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-fg)]">
                  状态
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-fg)]">
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
                    className="transition-colors hover:bg-[var(--color-neutral-100)]"
                  >
                    <td className="px-5 py-3.5 font-mono text-xs text-[var(--color-muted-fg)]">
                      #{report.id}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-[var(--color-foreground)]">
                      {report.time_range.start} ~ {report.time_range.end}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center rounded-md bg-[var(--color-accent-dim)] px-2 py-0.5 text-xs font-medium text-[var(--color-accent)]">
                        {report.report_type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[var(--color-muted)]">
                      {new Date(
                        report.created_at + " UTC"
                      ).toLocaleString("zh-CN")}
                    </td>
                    <td className="px-5 py-3.5">
                      {hiddenCount > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-[var(--color-danger)]/10 px-2 py-0.5 text-xs font-medium text-[var(--color-danger)]">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" x2="12" y1="8" y2="12" />
                            <line x1="12" x2="12.01" y1="16" y2="16" />
                          </svg>
                          已下架 {hiddenCount} 条
                        </span>
                      ) : (
                        <span className="text-xs text-[var(--color-muted)]">
                          正常
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/admin/reports/${report.id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-accent)] hover:text-[var(--color-amber-700)] transition-colors"
                      >
                        审核
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {reports.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-sm text-[var(--color-muted)]"
                  >
                    暂无周报数据
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
