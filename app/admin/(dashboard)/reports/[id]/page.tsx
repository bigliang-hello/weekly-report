import { notFound } from "next/navigation";
import Link from "next/link";
import { getReportById, getModerationByReportId } from "@/lib/db";
import type { ModerationRecord } from "@/lib/db";
import ModerationToggle from "@/components/admin/ModerationToggle";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

function isHiddenBy(
  moderation: ModerationRecord[],
  section: string,
  index: number,
  subSection?: string | null
) {
  return moderation.some(
    (m) =>
      m.section === section &&
      m.item_index === index &&
      m.sub_section === (subSection ?? null) &&
      m.is_hidden === 1
  );
}



function SectionCard({
  children,
  hidden,
}: {
  children: React.ReactNode;
  hidden: boolean;
}) {
  return (
    <div
      className={`
        rounded-xl border transition-all duration-200
        ${hidden
          ? "border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 opacity-80"
          : "border-[var(--color-border)] bg-[var(--color-surface)]"
        }
      `}
    >
      {children}
    </div>
  );
}

function SectionHeader({
  title,
  total,
  hidden,
  accentColor = "accent",
}: {
  title: string;
  total: number;
  hidden: number;
  accentColor?: "accent" | "success" | "info" | "danger";
}) {
  const colors = {
    accent: "bg-[var(--color-accent)]",
    success: "bg-[var(--color-success)]",
    info: "bg-[var(--color-info)]",
    danger: "bg-[var(--color-danger)]",
  };
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className={`w-1 h-5 rounded-full ${colors[accentColor]}`} />
        <h2 className="text-[15px] font-bold text-[var(--color-foreground)]">
          {title}
        </h2>
        <span className="text-xs text-[var(--color-muted)] font-mono">
          {total} 条
        </span>
      </div>
      {hidden > 0 && (
        <span className="text-xs text-[var(--color-danger)] font-semibold bg-[var(--color-danger)]/10 px-2 py-0.5 rounded-full">
          {hidden} 已下架
        </span>
      )}
    </div>
  );
}

export default async function AdminReportReviewPage({ params }: Props) {
  const { id } = await params;
  const reportId = Number(id);
  if (Number.isNaN(reportId)) notFound();

  const [report, moderation] = await Promise.all([
    getReportById(reportId),
    getModerationByReportId(reportId),
  ]);

  if (!report) notFound();

  const reportTitle = `${report.time_range.start} ~ ${report.time_range.end} 周报`;

  // Compute section stats
  const execTotal = report.executive_summary.length;
  const execHidden = report.executive_summary.filter((_, i) => isHiddenBy(moderation, "executive_summary", i)).length;

  const eventTotal = report.event_list.length;
  const eventHidden = report.event_list.filter((_, i) => isHiddenBy(moderation, "event_list", i)).length;

  const dealsTotal = report.large_deals.length;
  const dealsHidden = report.large_deals.filter((_, i) => isHiddenBy(moderation, "large_deals", i)).length;

  const hasResearch = !!report.research_views;
  const researchHidden = hasResearch && isHiddenBy(moderation, "research_views", 0) ? 1 : 0;

  const watchTotal = report.watchlist_companies.length;
  const watchHidden = report.watchlist_companies.filter((_, i) => isHiddenBy(moderation, "watchlist_companies", i)).length;

  const nextWeek = report.next_week_focus;
  const nextWeekGroups = nextWeek
    ? ([
        { key: "meetings_events", label: "会议 / 事件", items: nextWeek.meetings_events, color: "accent" },
        { key: "policy_regulation", label: "政策 / 监管", items: nextWeek.policy_regulation, color: "success" },
        { key: "technical_metrics", label: "技术指标", items: nextWeek.technical_metrics, color: "info" },
        { key: "market_capital", label: "市场 / 资本", items: nextWeek.market_capital, color: "danger" },
      ].filter((g) => g.items.length > 0) as {
        key: string;
        label: string;
        items: string[];
        color: "accent" | "success" | "info" | "danger";
      }[])
    : [];

  const nextWeekTotal = nextWeekGroups.reduce((acc, g) => acc + g.items.length, 0);
  const nextWeekHidden = nextWeekGroups.reduce(
    (acc, g) =>
      acc +
      g.items.filter((_, i) => isHiddenBy(moderation, "next_week_focus", i, g.key)).length,
    0
  );

  const totalItems =
    execTotal + eventTotal + dealsTotal + (hasResearch ? 1 : 0) + watchTotal + nextWeekTotal;
  const totalHidden = execHidden + eventHidden + dealsHidden + researchHidden + watchHidden + nextWeekHidden;

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="px-8 pt-8 pb-6 border-b border-[var(--color-border)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/reports"
              className="flex items-center gap-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
              返回
            </Link>
            <span className="text-[var(--color-border)]">/</span>
            <span className="text-sm font-semibold text-[var(--color-foreground)]">{reportTitle}</span>
          </div>
          <span className="font-mono text-xs text-[var(--color-muted-fg)] bg-[var(--color-neutral-100)] px-2 py-1 rounded">
            #{report.id}
          </span>
        </div>
      </div>

      {/* Stats bar */}
      <div className="px-8 py-5 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold font-mono text-[var(--color-foreground)]">{totalItems}</span>
            <span className="text-xs text-[var(--color-muted)]">总条目</span>
          </div>
          <div className="w-px h-6 bg-[var(--color-border)]" />
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold font-mono text-[var(--color-success)]">{totalItems - totalHidden}</span>
            <span className="text-xs text-[var(--color-muted)]">显示中</span>
          </div>
          <div className="w-px h-6 bg-[var(--color-border)]" />
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold font-mono text-[var(--color-danger)]">{totalHidden}</span>
            <span className="text-xs text-[var(--color-muted)]">已下架</span>
          </div>
          <div className="ml-auto">
            <span className="inline-flex items-center rounded-md bg-[var(--color-accent-dim)] px-2.5 py-1 text-xs font-semibold text-[var(--color-accent)] border border-[var(--color-accent)]/20">
              {report.report_type}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-6 space-y-10">

        {/* Executive Summary */}
        {execTotal > 0 && (
          <section>
            <SectionHeader title="执行摘要" total={execTotal} hidden={execHidden} accentColor="accent" />
            <div className="space-y-2">
              {report.executive_summary.map((item, idx) => {
                const hidden = isHiddenBy(moderation, "executive_summary", idx);
                return (
                  <SectionCard key={idx} hidden={hidden}>
                    <div className="flex items-start justify-between gap-4 p-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-flex items-center rounded-md bg-[var(--color-accent-dim)] px-2 py-0.5 text-[11px] font-bold text-[var(--color-accent)] border border-[var(--color-accent)]/20">
                            {item.event_type}
                          </span>
                          <span className="text-[11px] font-mono text-[var(--color-muted-fg)]">{item.date} {item.time}</span>
                        </div>
                        <div className="text-[13px] font-semibold text-[var(--color-foreground)] mb-1">{item.company_or_institution}</div>
                        <div className="text-[13px] text-[var(--color-muted)] leading-relaxed">{item.core_info}</div>
                      </div>
                      <div className="shrink-0 pt-1">
                        <ModerationToggle
                          reportId={reportId}
                          section="executive_summary"
                          itemIndex={idx}
                          initialHidden={hidden}
                        />
                      </div>
                    </div>
                  </SectionCard>
                );
              })}
            </div>
          </section>
        )}

        {/* Event List */}
        {eventTotal > 0 && (
          <section>
            <SectionHeader title="事件列表" total={eventTotal} hidden={eventHidden} accentColor="info" />
            <div className="space-y-2">
              {report.event_list.map((item, idx) => {
                const hidden = isHiddenBy(moderation, "event_list", idx);
                return (
                  <SectionCard key={idx} hidden={hidden}>
                    <div className="flex items-start justify-between gap-4 p-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-flex items-center rounded-md bg-[var(--color-neutral-100)] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-muted)] border border-[var(--color-border)]">
                            {item.event_type}
                          </span>
                          <span className="text-[11px] font-mono text-[var(--color-muted-fg)]">{item.time}</span>
                          <span className="text-[11px] text-[var(--color-muted)] bg-[var(--color-neutral-100)] px-1.5 py-0.5 rounded border border-[var(--color-border)]">
                            可信度 {item.credibility}
                          </span>
                        </div>
                        <div className="text-[13px] font-semibold text-[var(--color-foreground)] mb-1">{item.company_or_institution}</div>
                        <div className="text-[13px] text-[var(--color-muted)] leading-relaxed">{item.summary}</div>
                        {item.impact_assessment && (
                          <div className="mt-2 text-[12px] text-[var(--color-muted-fg)] bg-[var(--color-neutral-100)] border border-[var(--color-border)] rounded-lg px-3 py-2">
                            影响评估：{item.impact_assessment}
                          </div>
                        )}
                      </div>
                      <div className="shrink-0 pt-1">
                        <ModerationToggle
                          reportId={reportId}
                          section="event_list"
                          itemIndex={idx}
                          initialHidden={hidden}
                        />
                      </div>
                    </div>
                  </SectionCard>
                );
              })}
            </div>
          </section>
        )}

        {/* Large Deals */}
        {dealsTotal > 0 && (
          <section>
            <SectionHeader title="大额交易" total={dealsTotal} hidden={dealsHidden} accentColor="success" />
            <div className="space-y-2">
              {report.large_deals.map((item, idx) => {
                const hidden = isHiddenBy(moderation, "large_deals", idx);
                return (
                  <SectionCard key={idx} hidden={hidden}>
                    <div className="flex items-start justify-between gap-4 p-4">
                      <div className="flex-1 min-w-0">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div>
                            <div className="text-[10px] uppercase tracking-widest text-[var(--color-muted-fg)] mb-1">签约方</div>
                            <div className="text-[13px] font-semibold text-[var(--color-foreground)]">{item.signatory}</div>
                          </div>
                          <div>
                            <div className="text-[10px] uppercase tracking-widest text-[var(--color-muted-fg)] mb-1">买方</div>
                            <div className="text-[13px] text-[var(--color-foreground)]">{item.buyer}</div>
                          </div>
                          <div>
                            <div className="text-[10px] uppercase tracking-widest text-[var(--color-muted-fg)] mb-1">产品 / 服务</div>
                            <div className="text-[13px] text-[var(--color-foreground)]">{item.product_or_service}</div>
                          </div>
                          <div>
                            <div className="text-[10px] uppercase tracking-widest text-[var(--color-muted-fg)] mb-1">金额</div>
                            <div className="inline-flex items-center rounded-md bg-[var(--color-accent-dim)] px-2 py-0.5 text-[12px] font-bold text-[var(--color-accent)] border border-[var(--color-accent)]/20">
                              {item.amount_range}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0 pt-1">
                        <ModerationToggle
                          reportId={reportId}
                          section="large_deals"
                          itemIndex={idx}
                          initialHidden={hidden}
                        />
                      </div>
                    </div>
                  </SectionCard>
                );
              })}
            </div>
          </section>
        )}

        {/* Research Views */}
        {hasResearch && (
          <section>
            <SectionHeader title="研报观点" total={1} hidden={researchHidden} accentColor="accent" />
            <SectionCard hidden={!!researchHidden}>
              <div className="flex items-start justify-between gap-4 p-4">
                <div className="flex-1 min-w-0">
                  <div className="space-y-3">
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-[var(--color-muted-fg)] mb-1.5">核心结论</div>
                      <div className="text-[13px] text-[var(--color-muted)] leading-relaxed">{report.research_views!.core_conclusion}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-[var(--color-muted-fg)] mb-1.5">行业判断</div>
                      <div className="text-[13px] text-[var(--color-muted)] leading-relaxed">{report.research_views!.industry_judgement}</div>
                    </div>
                  </div>
                </div>
                <div className="shrink-0 pt-1">
                  <ModerationToggle
                    reportId={reportId}
                    section="research_views"
                    itemIndex={0}
                    initialHidden={!!researchHidden}
                  />
                </div>
              </div>
            </SectionCard>
          </section>
        )}

        {/* Watchlist */}
        {watchTotal > 0 && (
          <section>
            <SectionHeader title="观察清单" total={watchTotal} hidden={watchHidden} accentColor="accent" />
            <div className="grid gap-2 md:grid-cols-2">
              {report.watchlist_companies.map((item, idx) => {
                const hidden = isHiddenBy(moderation, "watchlist_companies", idx);
                return (
                  <SectionCard key={idx} hidden={hidden}>
                    <div className="flex items-start justify-between gap-3 p-4">
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold text-[var(--color-foreground)] mb-3">{item.company}</div>
                        <div className="space-y-2">
                          <div>
                            <div className="text-[10px] uppercase tracking-widest text-[var(--color-muted-fg)] mb-1">跟踪理由</div>
                            <div className="text-[12px] text-[var(--color-muted)] leading-relaxed">{item.tracking_reason}</div>
                          </div>
                          <div>
                            <div className="text-[10px] uppercase tracking-widest text-[var(--color-muted-fg)] mb-1">关键指标</div>
                            <div className="text-[12px] text-[var(--color-muted)] leading-relaxed">{item.key_metrics}</div>
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0 pt-1">
                        <ModerationToggle
                          reportId={reportId}
                          section="watchlist_companies"
                          itemIndex={idx}
                          initialHidden={hidden}
                        />
                      </div>
                    </div>
                  </SectionCard>
                );
              })}
            </div>
          </section>
        )}

        {/* Next Week Focus */}
        {nextWeekGroups.length > 0 && (
          <section>
            <SectionHeader title="下周关注" total={nextWeekTotal} hidden={nextWeekHidden} accentColor="accent" />
            <div className="grid gap-6 md:grid-cols-2">
              {nextWeekGroups.map((group) => {
                const colorClassMap = {
                  accent: "border-l-[var(--color-accent)]",
                  success: "border-l-[var(--color-success)]",
                  info: "border-l-[var(--color-info)]",
                  danger: "border-l-[var(--color-danger)]",
                };
                return (
                  <div key={group.key}>
                    <h3 className={`text-xs font-bold uppercase tracking-widest text-[var(--color-muted-fg)] mb-3 pl-3 border-l-2 ${colorClassMap[group.color]}`}>
                      {group.label}
                    </h3>
                    <div className="space-y-1.5">
                      {group.items.map((item, idx) => {
                        const hidden = isHiddenBy(moderation, "next_week_focus", idx, group.key);
                        return (
                          <div
                            key={idx}
                            className={`
                              flex items-start justify-between gap-3 rounded-lg border px-3 py-2.5 transition-all
                              ${hidden
                                ? "border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 opacity-75"
                                : "border-[var(--color-border)] bg-[var(--color-surface)]"
                              }
                            `}
                          >
                            <span className={`text-[12px] leading-relaxed ${hidden ? "line-through opacity-60" : "text-[var(--color-foreground)]"}`}>
                              {item}
                            </span>
                            <ModerationToggle
                              reportId={reportId}
                              section="next_week_focus"
                              itemIndex={idx}
                              subSection={group.key}
                              initialHidden={hidden}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
