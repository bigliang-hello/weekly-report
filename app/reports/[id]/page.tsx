import { notFound } from "next/navigation";
import Link from "next/link";
import { getReportById } from "@/lib/db";

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
      <div className="w-1 h-6 rounded-full bg-accent" />
      <h2 className="text-lg font-bold tracking-tight text-foreground">
        {title}
      </h2>
      {count !== undefined && (
        <span className="inline-flex items-center justify-center rounded-full bg-neutral-100 border border-border px-2 py-0.5 text-xs font-mono text-muted">
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
    default: "bg-neutral-100 text-muted border-neutral-200",
    accent: "bg-accent-dim text-accent border-amber-200",
    success: "bg-green-50 text-green-700 border-green-200",
    muted: "bg-background text-muted-fg border-border",
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
      className={`rounded-xl border border-border bg-surface p-5 transition-colors hover:border-neutral-300 ${className}`}
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
      className="group/link inline-flex items-center gap-1.5 text-xs text-muted-fg hover:text-accent transition-colors"
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

  const report = await getReportById(reportId);
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
    <main className="min-h-screen bg-background">
      {/* Sticky nav */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* Top row: back + title */}
          <div className="flex items-center justify-between py-3">
            <Link
              href="/"
              className="group inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
            >
              <span className="inline-flex items-center justify-center rounded-lg bg-surface border border-border w-8 h-8 transition-colors group-hover:border-neutral-300 group-hover:bg-neutral-50">
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
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </span>
              <span className="hidden sm:inline">返回列表</span>
            </Link>
            <span className="text-xs font-mono text-muted-fg">
              #{report.id}
            </span>
          </div>
          {/* Tab row: scrollable */}
          {activeSections.length > 0 && (
            <div className="flex items-center gap-1 overflow-x-auto pb-3 scrollbar-none">
              {activeSections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="shrink-0 inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-surface text-muted hover:text-foreground hover:border-neutral-300 transition-colors"
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
        <header className="mb-12 pb-8 border-b border-border">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              {reportTitle}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Badge variant="accent">{report.report_type}</Badge>
            <span className="text-muted-fg">
              创建于{" "}
              {new Date(report.created_at).toLocaleString("zh-CN")}
            </span>
          </div>

          {report.executive_trend_judgement && (
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50/50 p-5">
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
                  className="text-accent"
                >
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                  <polyline points="16 7 22 7 22 13" />
                </svg>
                <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                  趋势判断
                </span>
              </div>
              <p className="text-sm leading-relaxed text-foreground/90">
                {report.executive_trend_judgement}
              </p>
            </div>
          )}
        </header>

        {/* 执行摘要 */}
        {hasExecutiveSummary && (
          <section id="executive-summary" className="mb-14 scroll-mt-36">
            <SectionHeader
              title="执行摘要"
              count={report.executive_summary!.length}
            />
            <div className="space-y-3">
              {report.executive_summary!.map((item, idx) => (
                <Card key={idx}>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge variant="accent">{item.event_type}</Badge>
                    <span className="text-xs font-mono text-muted-fg">
                      {item.time}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-1">
                    {item.company_or_institution}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted">
                    {item.core_info}
                  </p>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* 事件列表 */}
        {hasEventList && (
          <section id="event-list" className="mb-14 scroll-mt-36">
            <SectionHeader
              title="事件列表"
              count={report.event_list!.length}
            />
            <div className="space-y-4">
              {report.event_list!.map((item, idx) => (
                <Card key={idx} className="relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-accent/40 via-accent/10 to-transparent" />
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          item.event_type === "发布"
                            ? "success"
                            : item.event_type === "政策"
                            ? "accent"
                            : "default"
                        }
                      >
                        {item.event_type}
                      </Badge>
                      <span className="text-xs font-mono text-muted-fg">
                        {item.time}
                      </span>
                    </div>
                    <Badge variant="muted">可信度：{item.credibility}</Badge>
                  </div>

                  <h3 className="text-base font-semibold text-foreground mb-1">
                    {item.company_or_institution}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted mb-3">
                    {item.summary}
                  </p>

                  <div className="rounded-lg bg-neutral-50 border border-border p-3 mb-3">
                    <span className="text-xs font-semibold text-foreground/80">
                      影响评估
                    </span>
                    <p className="text-sm text-muted mt-1">
                      {item.impact_assessment}
                    </p>
                  </div>

                  <SourceLink
                    url={item.source.url}
                    title={item.source.title}
                    publisher={item.source.publisher}
                  />
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* 大额交易 */}
        {hasLargeDeals && (
          <section id="large-deals" className="mb-14 scroll-mt-36">
            <SectionHeader
              title="大额交易"
              count={report.large_deals!.length}
            />
            <div className="rounded-xl border border-border bg-surface overflow-hidden mb-3">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-neutral-50">
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-fg">
                        时间
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-fg">
                        签约方
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-fg">
                        买方
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-fg">
                        产品/服务
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-fg">
                        金额
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {report.large_deals!.map((deal, idx) => (
                      <tr
                        key={idx}
                        className="transition-colors hover:bg-neutral-50"
                      >
                        <td className="px-5 py-3.5 font-mono text-xs text-muted-fg whitespace-nowrap">
                          {deal.time}
                        </td>
                        <td className="px-5 py-3.5 font-medium text-foreground">
                          {deal.signatory}
                        </td>
                        <td className="px-5 py-3.5 text-muted">
                          {deal.buyer}
                        </td>
                        <td className="px-5 py-3.5 text-muted">
                          {deal.product_or_service}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center rounded-md bg-accent-dim px-2 py-0.5 text-xs font-medium text-accent">
                            {deal.amount_range}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="space-y-2">
              {report.large_deals!.map((deal, idx) => (
                <SourceLink
                  key={idx}
                  url={deal.source.url}
                  title={deal.source.title}
                  publisher={deal.source.publisher}
                />
              ))}
            </div>
          </section>
        )}

        {/* 研报观点 */}
        {hasResearchViews && (
          <section id="research-views" className="mb-14 scroll-mt-36">
            <SectionHeader title="研报观点" />
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-accent/40 via-accent/10 to-transparent" />
              <div className="flex items-center gap-2 mb-4">
                <Badge
                  variant={
                    report.research_views!.has_new_report ? "success" : "muted"
                  }
                >
                  {report.research_views!.has_new_report
                    ? "有新报告"
                    : "无新报告"}
                </Badge>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-fg mb-1.5">
                    核心结论
                  </h4>
                  <p className="text-sm leading-relaxed text-muted">
                    {report.research_views!.core_conclusion}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-fg mb-1.5">
                    行业判断
                  </h4>
                  <p className="text-sm leading-relaxed text-muted">
                    {report.research_views!.industry_judgement}
                  </p>
                </div>
                <SourceLink
                  url={report.research_views!.source.url}
                  title={report.research_views!.source.title}
                  publisher={report.research_views!.source.publisher}
                />
              </div>
            </Card>
          </section>
        )}

        {/* 观察清单 */}
        {hasWatchlist && (
          <section id="watchlist" className="mb-14 scroll-mt-36">
            <SectionHeader
              title="观察清单"
              count={report.watchlist_companies!.length}
            />
            <div className="grid gap-3 md:grid-cols-2">
              {report.watchlist_companies!.map((item, idx) => (
                <Card
                  key={idx}
                  className="relative overflow-hidden group"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-accent/60 to-accent/10" />
                  <div className="pl-3">
                    <h3 className="text-base font-semibold text-foreground mb-3">
                      {item.company}
                    </h3>
                    <div className="space-y-2.5">
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-fg">
                          跟踪理由
                        </span>
                        <p className="text-sm text-muted mt-1 leading-relaxed">
                          {item.tracking_reason}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-fg">
                          关键指标
                        </span>
                        <p className="text-sm text-muted mt-1 leading-relaxed">
                          {item.key_metrics}
                        </p>
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
          <section id="next-week" className="mb-14 scroll-mt-36">
            <SectionHeader title="下周关注" />
            <div className="grid gap-3 md:grid-cols-2">
              {(
                [
                  {
                    title: "会议 / 事件",
                    icon: (
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
                        <rect width="18" height="18" x="3" y="4" rx="2" />
                        <path d="M16 2v4" />
                        <path d="M8 2v4" />
                        <path d="M3 10h18" />
                      </svg>
                    ),
                    items: report.next_week_focus!.meetings_events,
                    accent: "text-accent",
                  },
                  {
                    title: "政策 / 监管",
                    icon: (
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
                        <path d="m12 14 4-4" />
                        <path d="M3.34 19a10 10 0 1 1 17.32 0" />
                      </svg>
                    ),
                    items: report.next_week_focus!.policy_regulation,
                    accent: "text-success",
                  },
                  {
                    title: "技术指标",
                    icon: (
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
                        <path d="M12 2v20" />
                        <path d="m17 7-5-5-5 5" />
                        <path d="m17 17-5 5-5-5" />
                      </svg>
                    ),
                    items: report.next_week_focus!.technical_metrics,
                    accent: "text-info",
                  },
                  {
                    title: "市场 / 资本",
                    icon: (
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
                        <line x1="12" x2="12" y1="2" y2="22" />
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                    ),
                    items: report.next_week_focus!.market_capital,
                    accent: "text-danger",
                  },
                ] as const
              ).map(
                (section) =>
                  section.items?.length > 0 && (
                    <Card
                      key={section.title}
                      className="relative overflow-hidden"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <span className={section.accent}>{section.icon}</span>
                        <h3 className="text-sm font-semibold text-foreground">
                          {section.title}
                        </h3>
                      </div>
                      <ul className="space-y-2.5">
                        {section.items.map((item, idx) => (
                          <li
                            key={idx}
                            className="flex gap-2.5 text-sm text-muted"
                          >
                            <span className="mt-1.5 w-1 h-1 rounded-full bg-neutral-300 shrink-0" />
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
