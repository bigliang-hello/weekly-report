import Link from "next/link";
import { getAllReports } from "@/lib/db";

export const dynamic = "force-dynamic";

function ReportCard({
  report,
}: {
  report: Awaited<ReturnType<typeof getAllReports>>[number];
}) {
  const dateLabel = new Date(report.created_at + " UTC").toLocaleDateString("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Shanghai",
  });

  const title = `${report.time_range.start} ~ ${report.time_range.end} 周报`;

  return (
    <Link
      key={report.id}
      href={`/reports/${report.id}`}
      className="group block relative rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition-all duration-300 hover:border-[var(--color-border-subtle)] hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-base font-semibold text-[var(--color-foreground)] truncate">
              {title}
            </h2>
            <span className="shrink-0 inline-flex items-center rounded-full bg-[var(--color-accent-dim)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-accent)]">
              {report.report_type}
            </span>
          </div>
          {report.executive_trend_judgement && (
            <p className="text-sm text-[var(--color-muted)] leading-relaxed line-clamp-2">
              {report.executive_trend_judgement}
            </p>
          )}
        </div>
        <div className="shrink-0 text-right">
          <time className="text-xs font-mono text-[var(--color-muted-fg)]">{dateLabel}</time>
          <div className="mt-3 flex justify-end">
            <span className="inline-flex items-center justify-center rounded-full bg-[var(--color-neutral-100)] w-8 h-8 text-[var(--color-muted-fg)] transition-all duration-300 group-hover:bg-[var(--color-accent)] group-hover:text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default async function HomePage() {
  const reports = await getAllReports();

  return (
    <main className="min-h-screen bg-[var(--color-background)]">
      {/* Header */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-8 rounded-full bg-[var(--color-accent)]" />
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-foreground)]">
              具身智能行业周报
            </h1>
          </div>
          <p className="text-sm text-[var(--color-muted)] ml-5">
            周报数据汇总与洞察分析
          </p>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-[var(--color-muted-fg)]"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-[var(--color-foreground)] mb-2">
              暂无周报数据
            </h3>
            <p className="text-sm text-[var(--color-muted)] max-w-sm">
              请通过 Webhook 推送数据，报告将自动出现在此列表中
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-mono uppercase tracking-wider text-[var(--color-muted-fg)]">
                共 {reports.length} 条报告
              </span>
            </div>
            <div className="space-y-3">
              {reports.map((report) => (
                <ReportCard key={report.id} report={report} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] mt-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <p className="text-xs text-[var(--color-muted-fg)] text-center">
            具身智能行业周报 Viewer
          </p>
        </div>
      </footer>
    </main>
  );
}
