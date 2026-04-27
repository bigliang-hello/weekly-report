import { notFound } from "next/navigation";
import Link from "next/link";
import { getReportByIdWithModeration } from "@/lib/db";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

const SECTIONS = [
  { id: "executive-summary", label: "执行摘要" },
  { id: "event-list", label: "事件列表" },
  { id: "large-deals", label: "大额交易" },
  { id: "research-views", label: "研报观点" },
  { id: "watchlist", label: "观察清单" },
  { id: "next-week", label: "下周关注" },
] as const;

function SectionHeader({ title, count }: { title: string; count?: number }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-1 h-6 rounded-full bg-[var(--color-accent)]" />
      <h2 className="text-lg font-bold tracking-tight text-[var(--color-foreground)]">
        {title}
      </h2>
      {count !== undefined && (
        <span className="inline-flex items-center justify-center rounded-full bg-[var(--color-neutral-100)] border border-[var(--color-border)] px-2 py-0.5 text-xs font-mono text-[var(--color-muted)]">
          {count}
        </span>
      )}
    </div>
  );
}

function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "accent" | "success" | "muted";
}) {
  const variants = {
    default: "bg-[var(--color-neutral-100)] text-[var(--color-muted)] border-[var(--color-border-subtle)]",
    accent: "bg-[var(--color-accent-dim)] text-[var(--color-accent)] border-[var(--color-accent)]/30",
    success: "bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/20",
    muted: "bg-[var(--color-background)] text-[var(--color-muted-fg)] border-[var(--color-border)]",
  };
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${variants[variant]}`}
    >
      {children}
    </span>
  );
}

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition-colors hover:border-[var(--color-border-subtle)] ${className}`}
    >
      {children}
    </div>
  );
}

function SourceLink({
  url,
  title,
  publisher,
}: {
  url: string;
  title: string;
  publisher: string;
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group/link inline-flex items-center gap-1.5 text-xs text-[var(--color-muted-fg)] hover:text-[var(--color-accent)] transition-colors"
    >
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
        <path d="M15 3h6v6" />
        <path d="M10 14 21 3" />
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      </svg>
      {title} — {publisher}
    </a>
  );
}

export default async function ReportDetailPage({ params }: Props) {
  const { id } = await params;
  const reportId = Number(id);
  if (Number.isNaN(reportId)) notFound();

  const report = await getReportByIdWithModeration(reportId);
  if (!report) notFound();

  const reportTitle = `${report.time_range.start} ~ ${report.time_range.end} 周报`;

  const hasExecutiveSummary = report.executive_summary?.length > 0;
  const hasEventList = report.event_list?.length > 0;
  const hasLargeDeals = report.large_deals?.length > 0;
  const hasResearchViews = !!report.research_views;
  const hasWatchlist = report.watchlist_companies?.length > 0;
  const hasNextWeek =
    report.next_week_focus &&
    (report.next_week_focus.meetings_events?.length > 0 ||
      report.next_week_focus.policy_regulation?.length > 0 ||
      report.next_week_focus.technical_metrics?.length > 0 ||
      report.next_week_focus.market_capital?.length > 0);

  const activeSections = SECTIONS.filter((s) => {
    if (s.id === "executive-summary") return hasExecutiveSummary;
    if (s.id === "event-list") return hasEventList;
    if (s.id === "large-deals") return hasLargeDeals;
    if (s.id === "research-views") return hasResearchViews;
    if (s.id === "watchlist") return hasWatchlist;
    if (s.id === "next-week") return hasNextWeek;
    return false;
  });

  return (
    <main className="min-h-screen bg-[var(--color-background)]">
      {/* Unified sticky nav */}
      <nav className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* Single row: back + tabs + report id */}
          <div className="flex items-center justify-between h-12">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors"
            >
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
                className="shrink-0"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
              <span className="hidden sm:inline">返回列表</span>
            </Link>

            {/* Desktop tabs */}
            {activeSections.length > 0 && (
              <div className="hidden lg:flex items-center gap-0.5 overflow-x-auto scrollbar-none">
                {activeSections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="shrink-0 px-3 py-1 text-xs font-medium rounded-md text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-neutral-100)] transition-colors"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            )}

            <span className="text-xs font-mono text-[var(--color-muted-fg)]">#{report.id}</span>
          </div>

          {/* Mobile tabs */}
          {activeSections.length > 0 && (
            <div className="lg:hidden flex items-center gap-1 overflow-x-auto pb-2.5 pt-1 scrollbar-none border-t border-[var(--color-border)]">
              {activeSections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="shrink-0 inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:border-[var(--color-border-subtle)] transition-colors"
                >
                  {s.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Hero */}
        <header className="mb-12 pb-8 border-b border-[var(--color-border)]">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--color-foreground)]">
              {reportTitle}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Badge variant="accent">{report.report_type}</Badge>
            <span className="text-[var(--color-muted-fg)]">
              创建于{" "}
              {new Date(report.created_at + " UTC").toLocaleString("zh-CN")}
            </span>
          </div>

          {report.executive_trend_judgement && (
            <div className="mt-6 rounded-xl border border-[var(--color-accent)]/30 bg-[var(--color-accent-dim)] p-5">
              <div className="flex items-center gap-2 mb-2">
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
                  className="text-[var(--color-accent)]"
                >
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                  <polyline points="16 7 22 7 22 13" />
                </svg>
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)]">
                  趋势判断
                </span>
              </div>
              <p className="text-sm leading-relaxed text-[var(--color-foreground)]/90">
                {report.executive_trend_judgement}
              </p>
            </div>
          )}
        </header>

        {/* 执行摘要 */}
        {hasExecutiveSummary && (
          <section id="executive-summary" className="mb-14 scroll-mt-24 lg:scroll-mt-12">
            <SectionHeader title="执行摘要" count={report.executive_summary!.length} />
            <div className="space-y-3">
              {report.executive_summary!.map((item, idx) => (
                <Card key={idx}>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge variant="accent">{item.event_type}</Badge>
                    <span className="text-xs font-mono text-[var(--color-muted-fg)]">{item.time}</span>
                  </div>
                  <h3 className="text-base font-semibold text-[var(--color-foreground)] mb-1">
                    {item.company_or_institution}
                  </h3>
                  <p className="text-sm leading-relaxed text-[var(--color-muted)]">{item.core_info}</p>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* 事件列表 */}
        {hasEventList && (
          <section id="event-list" className="mb-14 scroll-mt-24 lg:scroll-mt-12">
            <SectionHeader title="事件列表" count={report.event_list!.length} />
            <div className="space-y-4">
              {report.event_list!.map((item, idx) => (
                <Card key={idx} className="relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-[var(--color-accent)]/40 via-[var(--color-accent)]/10 to-transparent" />
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant={item.event_type === "发布" ? "success" : item.event_type === "政策" ? "accent" : "default"}>
                        {item.event_type}
                      </Badge>
                      <span className="text-xs font-mono text-[var(--color-muted-fg)]">{item.time}</span>
                    </div>
                    <Badge variant="muted">可信度：{item.credibility}</Badge>
                  </div>
                  <h3 className="text-base font-semibold text-[var(--color-foreground)] mb-1">
                    {item.company_or_institution}
                  </h3>
                  <p className="text-sm leading-relaxed text-[var(--color-muted)] mb-3">{item.summary}</p>
                  <div className="rounded-lg bg-[var(--color-neutral-100)] border border-[var(--color-border)] p-3 mb-3">
                    <span className="text-xs font-semibold text-[var(--color-foreground)]/80">影响评估</span>
                    <p className="text-sm text-[var(--color-muted)] mt-1">{item.impact_assessment}</p>
                  </div>
                  <SourceLink url={item.source.url} title={item.source.title} publisher={item.source.publisher} />
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* 大额交易 */}
        {hasLargeDeals && (
          <section id="large-deals" className="mb-14 scroll-mt-24 lg:scroll-mt-12">
            <SectionHeader title="大额交易" count={report.large_deals!.length} />
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] bg-[var(--color-neutral-100)]">
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-fg)] whitespace-nowrap">时间</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-fg)]">签约方</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-fg)]">买方</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-fg)]">产品/服务</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-fg)]">金额</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-fg)]">来源</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {report.large_deals!.map((deal, idx) => (
                      <tr key={idx} className="transition-colors hover:bg-[var(--color-neutral-100)]">
                        <td className="px-5 py-3.5 font-mono text-xs text-[var(--color-muted-fg)] whitespace-nowrap">{deal.time}</td>
                        <td className="px-5 py-3.5 font-medium text-[var(--color-foreground)]">{deal.signatory}</td>
                        <td className="px-5 py-3.5 text-[var(--color-muted)]">{deal.buyer}</td>
                        <td className="px-5 py-3.5 text-[var(--color-muted)]">{deal.product_or_service}</td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center rounded-md bg-[var(--color-accent-dim)] px-2 py-0.5 text-xs font-medium text-[var(--color-accent)] whitespace-nowrap">
                            {deal.amount_range}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <SourceLink url={deal.source.url} title={deal.source.title} publisher={deal.source.publisher} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* 研报观点 */}
        {hasResearchViews && (
          <section id="research-views" className="mb-14 scroll-mt-24 lg:scroll-mt-12">
            <SectionHeader title="研报观点" />
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-[var(--color-accent)]/40 via-[var(--color-accent)]/10 to-transparent" />
              <div className="flex items-center gap-2 mb-4">
                <Badge variant={report.research_views!.has_new_report ? "success" : "muted"}>
                  {report.research_views!.has_new_report ? "有新报告" : "无新报告"}
                </Badge>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-fg)] mb-1.5">核心结论</h4>
                  <p className="text-sm leading-relaxed text-[var(--color-muted)]">{report.research_views!.core_conclusion}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-fg)] mb-1.5">行业判断</h4>
                  <p className="text-sm leading-relaxed text-[var(--color-muted)]">{report.research_views!.industry_judgement}</p>
                </div>
                <SourceLink url={report.research_views!.source.url} title={report.research_views!.source.title} publisher={report.research_views!.source.publisher} />
              </div>
            </Card>
          </section>
        )}

        {/* 观察清单 */}
        {hasWatchlist && (
          <section id="watchlist" className="mb-14 scroll-mt-24 lg:scroll-mt-12">
            <SectionHeader title="观察清单" count={report.watchlist_companies!.length} />
            <div className="grid gap-3 md:grid-cols-2">
              {report.watchlist_companies!.map((item, idx) => (
                <Card key={idx} className="relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[var(--color-accent)]/60 to-[var(--color-accent)]/10" />
                  <div className="pl-3">
                    <h3 className="text-base font-semibold text-[var(--color-foreground)] mb-3">{item.company}</h3>
                    <div className="space-y-2.5">
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-fg)]">跟踪理由</span>
                        <p className="text-sm text-[var(--color-muted)] mt-1 leading-relaxed">{item.tracking_reason}</p>
                      </div>
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-fg)]">关键指标</span>
                        <p className="text-sm text-[var(--color-muted)] mt-1 leading-relaxed">{item.key_metrics}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* 下周关注 */}
        {hasNextWeek && (
          <section id="next-week" className="mb-14 scroll-mt-24 lg:scroll-mt-12">
            <SectionHeader title="下周关注" />
            <div className="grid gap-3 md:grid-cols-2">
              {([
                { title: "会议 / 事件", items: report.next_week_focus!.meetings_events, accent: "text-[var(--color-accent)]" },
                { title: "政策 / 监管", items: report.next_week_focus!.policy_regulation, accent: "text-[var(--color-success)]" },
                { title: "技术指标", items: report.next_week_focus!.technical_metrics, accent: "text-[var(--color-info)]" },
                { title: "市场 / 资本", items: report.next_week_focus!.market_capital, accent: "text-[var(--color-danger)]" },
              ] as const).map(
                (section) =>
                  section.items?.length > 0 && (
                    <Card key={section.title} className="relative overflow-hidden">
                      <div className="flex items-center gap-2 mb-4">
                        <span className={section.accent}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="18" height="18" x="3" y="4" rx="2" /><path d="M16 2v4" /><path d="M8 2v4" /><path d="M3 10h18" />
                          </svg>
                        </span>
                        <h3 className="text-sm font-semibold text-[var(--color-foreground)]">{section.title}</h3>
                      </div>
                      <ul className="space-y-2.5">
                        {section.items.map((item, idx) => (
                          <li key={idx} className="flex gap-2.5 text-sm text-[var(--color-muted)]">
                            <span className="mt-1.5 w-1 h-1 rounded-full bg-[var(--color-neutral-300)] shrink-0" />
                            <span className="leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  )
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
