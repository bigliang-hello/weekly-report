import { notFound } from "next/navigation";
import Link from "next/link";
import { getReportById, getModerationByReportId } from "@/lib/db";
import type { ModerationRecord } from "@/lib/db";
import ModerationToggle from "@/components/admin/ModerationToggle";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

function checkHidden(
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

function getReason(
  moderation: ModerationRecord[],
  section: string,
  index: number,
  subSection?: string | null
) {
  const m = moderation.find(
    (m) =>
      m.section === section &&
      m.item_index === index &&
      m.sub_section === (subSection ?? null)
  );
  return m?.reason ?? null;
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

  // Count totals and hidden
  let totalItems = 0;
  let hiddenItems = 0;

  const sections = [] as {
    id: string;
    label: string;
    count: number;
    hiddenCount: number;
  }[];

  const execHidden = report.executive_summary.filter((_, i) =>
    checkHidden(moderation, "executive_summary", i)
  ).length;
  totalItems += report.executive_summary.length;
  hiddenItems += execHidden;
  if (report.executive_summary.length > 0) {
    sections.push({
      id: "executive-summary",
      label: "执行摘要",
      count: report.executive_summary.length,
      hiddenCount: execHidden,
    });
  }

  const eventHidden = report.event_list.filter((_, i) =>
    checkHidden(moderation, "event_list", i)
  ).length;
  totalItems += report.event_list.length;
  hiddenItems += eventHidden;
  if (report.event_list.length > 0) {
    sections.push({
      id: "event-list",
      label: "事件列表",
      count: report.event_list.length,
      hiddenCount: eventHidden,
    });
  }

  const dealsHidden = report.large_deals.filter((_, i) =>
    checkHidden(moderation, "large_deals", i)
  ).length;
  totalItems += report.large_deals.length;
  hiddenItems += dealsHidden;
  if (report.large_deals.length > 0) {
    sections.push({
      id: "large-deals",
      label: "大额交易",
      count: report.large_deals.length,
      hiddenCount: dealsHidden,
    });
  }

  const researchHidden = report.research_views
    ? checkHidden(moderation, "research_views", 0)
      ? 1
      : 0
    : 0;
  totalItems += report.research_views ? 1 : 0;
  hiddenItems += researchHidden;
  if (report.research_views) {
    sections.push({
      id: "research-views",
      label: "研报观点",
      count: 1,
      hiddenCount: researchHidden,
    });
  }

  const watchHidden = report.watchlist_companies.filter((_, i) =>
    checkHidden(moderation, "watchlist_companies", i)
  ).length;
  totalItems += report.watchlist_companies.length;
  hiddenItems += watchHidden;
  if (report.watchlist_companies.length > 0) {
    sections.push({
      id: "watchlist",
      label: "观察清单",
      count: report.watchlist_companies.length,
      hiddenCount: watchHidden,
    });
  }

  const nextWeek = report.next_week_focus;
  let nextWeekTotal = 0;
  let nextWeekHidden = 0;
  const nextWeekSections = [] as {
    key: string;
    label: string;
    items: string[];
  }[];
  if (nextWeek) {
    if (nextWeek.meetings_events.length > 0) {
      nextWeekTotal += nextWeek.meetings_events.length;
      nextWeekHidden += nextWeek.meetings_events.filter((_, i) =>
        checkHidden(moderation, "next_week_focus", i, "meetings_events")
      ).length;
      nextWeekSections.push({
        key: "meetings_events",
        label: "会议 / 事件",
        items: nextWeek.meetings_events,
      });
    }
    if (nextWeek.policy_regulation.length > 0) {
      nextWeekTotal += nextWeek.policy_regulation.length;
      nextWeekHidden += nextWeek.policy_regulation.filter((_, i) =>
        checkHidden(moderation, "next_week_focus", i, "policy_regulation")
      ).length;
      nextWeekSections.push({
        key: "policy_regulation",
        label: "政策 / 监管",
        items: nextWeek.policy_regulation,
      });
    }
    if (nextWeek.technical_metrics.length > 0) {
      nextWeekTotal += nextWeek.technical_metrics.length;
      nextWeekHidden += nextWeek.technical_metrics.filter((_, i) =>
        checkHidden(moderation, "next_week_focus", i, "technical_metrics")
      ).length;
      nextWeekSections.push({
        key: "technical_metrics",
        label: "技术指标",
        items: nextWeek.technical_metrics,
      });
    }
    if (nextWeek.market_capital.length > 0) {
      nextWeekTotal += nextWeek.market_capital.length;
      nextWeekHidden += nextWeek.market_capital.filter((_, i) =>
        checkHidden(moderation, "next_week_focus", i, "market_capital")
      ).length;
      nextWeekSections.push({
        key: "market_capital",
        label: "市场 / 资本",
        items: nextWeek.market_capital,
      });
    }
  }
  totalItems += nextWeekTotal;
  hiddenItems += nextWeekHidden;
  if (nextWeekTotal > 0) {
    sections.push({
      id: "next-week",
      label: "下周关注",
      count: nextWeekTotal,
      hiddenCount: nextWeekHidden,
    });
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/reports"
            className="flex items-center gap-1 text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors"
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
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            返回列表
          </Link>
        </div>
        <span className="text-xs font-mono text-[var(--color-muted-fg)]">
          #{report.id}
        </span>
      </div>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-[var(--color-foreground)]">
          {reportTitle}
        </h1>
        <div className="flex items-center gap-3 mt-2 text-sm text-[var(--color-muted)]">
          <span className="inline-flex items-center rounded-md bg-[var(--color-accent-dim)] px-2 py-0.5 text-xs font-medium text-[var(--color-accent)]">
            {report.report_type}
          </span>
          <span>
            创建于{" "}
            {new Date(report.created_at + " UTC").toLocaleString("zh-CN")}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <div className="text-2xl font-bold text-[var(--color-foreground)]">
            {totalItems}
          </div>
          <div className="text-xs text-[var(--color-muted)] mt-1">总条目</div>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <div className="text-2xl font-bold text-[var(--color-danger)]">
            {hiddenItems}
          </div>
          <div className="text-xs text-[var(--color-muted)] mt-1">已下架</div>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <div className="text-2xl font-bold text-[var(--color-success)]">
            {totalItems - hiddenItems}
          </div>
          <div className="text-xs text-[var(--color-muted)] mt-1">正常显示</div>
        </div>
      </div>

      {/* Section nav */}
      {sections.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:border-[var(--color-border-subtle)] transition-colors"
            >
              {s.label}
              {s.hiddenCount > 0 && (
                <span className="inline-flex items-center justify-center rounded-full bg-[var(--color-danger)]/10 px-1.5 py-0 text-[10px] font-medium text-[var(--color-danger)]">
                  {s.hiddenCount}
                </span>
              )}
            </a>
          ))}
        </div>
      )}

      {/* Executive Summary */}
      {report.executive_summary.length > 0 && (
        <section id="executive-summary" className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-5 rounded-full bg-[var(--color-accent)]" />
            <h2 className="text-base font-bold text-[var(--color-foreground)]">
              执行摘要
            </h2>
            <span className="text-xs text-[var(--color-muted)]">
              ({report.executive_summary.length} 条)
            </span>
          </div>
          <div className="space-y-3">
            {report.executive_summary.map((item, idx) => {
              const hidden = checkHidden(moderation, "executive_summary", idx);
              return (
                <div
                  key={idx}
                  className={`rounded-xl border p-4 flex items-start justify-between gap-4 transition-colors ${
                    hidden
                      ? "border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 opacity-60"
                      : "border-[var(--color-border)] bg-[var(--color-surface)]"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="inline-flex items-center rounded-md bg-[var(--color-accent-dim)] px-2 py-0.5 text-xs font-medium text-[var(--color-accent)]">
                        {item.event_type}
                      </span>
                      <span className="text-xs font-mono text-[var(--color-muted-fg)]">
                        {item.time}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-[var(--color-foreground)]">
                      {item.company_or_institution}
                    </div>
                    <div className="text-sm text-[var(--color-muted)] mt-1">
                      {item.core_info}
                    </div>
                    {hidden && (
                      <div className="mt-2 text-xs text-[var(--color-danger)]">
                        原因：
                        {getReason(moderation, "executive_summary", idx) ||
                          "未填写"}
                      </div>
                    )}
                  </div>
                  <div className="shrink-0">
                    <ModerationToggle
                      reportId={reportId}
                      section="executive_summary"
                      itemIndex={idx}
                      initialHidden={hidden}
                      initialReason={getReason(
                        moderation,
                        "executive_summary",
                        idx
                      )}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Event List */}
      {report.event_list.length > 0 && (
        <section id="event-list" className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-5 rounded-full bg-[var(--color-accent)]" />
            <h2 className="text-base font-bold text-[var(--color-foreground)]">
              事件列表
            </h2>
            <span className="text-xs text-[var(--color-muted)]">
              ({report.event_list.length} 条)
            </span>
          </div>
          <div className="space-y-3">
            {report.event_list.map((item, idx) => {
              const hidden = checkHidden(moderation, "event_list", idx);
              return (
                <div
                  key={idx}
                  className={`rounded-xl border p-4 flex items-start justify-between gap-4 transition-colors ${
                    hidden
                      ? "border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 opacity-60"
                      : "border-[var(--color-border)] bg-[var(--color-surface)]"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="inline-flex items-center rounded-md bg-[var(--color-neutral-100)] px-2 py-0.5 text-xs font-medium text-[var(--color-muted)] border border-[var(--color-border-subtle)]">
                        {item.event_type}
                      </span>
                      <span className="text-xs font-mono text-[var(--color-muted-fg)]">
                        {item.time}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-[var(--color-foreground)]">
                      {item.company_or_institution}
                    </div>
                    <div className="text-sm text-[var(--color-muted)] mt-1">
                      {item.summary}
                    </div>
                    {hidden && (
                      <div className="mt-2 text-xs text-[var(--color-danger)]">
                        原因：
                        {getReason(moderation, "event_list", idx) || "未填写"}
                      </div>
                    )}
                  </div>
                  <div className="shrink-0">
                    <ModerationToggle
                      reportId={reportId}
                      section="event_list"
                      itemIndex={idx}
                      initialHidden={hidden}
                      initialReason={getReason(moderation, "event_list", idx)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Large Deals */}
      {report.large_deals.length > 0 && (
        <section id="large-deals" className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-5 rounded-full bg-[var(--color-accent)]" />
            <h2 className="text-base font-bold text-[var(--color-foreground)]">
              大额交易
            </h2>
            <span className="text-xs text-[var(--color-muted)]">
              ({report.large_deals.length} 条)
            </span>
          </div>
          <div className="space-y-3">
            {report.large_deals.map((item, idx) => {
              const hidden = checkHidden(moderation, "large_deals", idx);
              return (
                <div
                  key={idx}
                  className={`rounded-xl border p-4 flex items-start justify-between gap-4 transition-colors ${
                    hidden
                      ? "border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 opacity-60"
                      : "border-[var(--color-border)] bg-[var(--color-surface)]"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <div className="text-xs text-[var(--color-muted-fg)] mb-0.5">
                          签约方
                        </div>
                        <div className="font-medium text-[var(--color-foreground)]">
                          {item.signatory}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-[var(--color-muted-fg)] mb-0.5">
                          买方
                        </div>
                        <div className="text-[var(--color-foreground)]">
                          {item.buyer}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-[var(--color-muted-fg)] mb-0.5">
                          产品/服务
                        </div>
                        <div className="text-[var(--color-foreground)]">
                          {item.product_or_service}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-[var(--color-muted-fg)] mb-0.5">
                          金额
                        </div>
                        <div className="inline-flex items-center rounded-md bg-[var(--color-accent-dim)] px-2 py-0.5 text-xs font-medium text-[var(--color-accent)]">
                          {item.amount_range}
                        </div>
                      </div>
                    </div>
                    {hidden && (
                      <div className="mt-2 text-xs text-[var(--color-danger)]">
                        原因：
                        {getReason(moderation, "large_deals", idx) || "未填写"}
                      </div>
                    )}
                  </div>
                  <div className="shrink-0">
                    <ModerationToggle
                      reportId={reportId}
                      section="large_deals"
                      itemIndex={idx}
                      initialHidden={hidden}
                      initialReason={getReason(moderation, "large_deals", idx)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Research Views */}
      {report.research_views && (
        <section id="research-views" className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-5 rounded-full bg-[var(--color-accent)]" />
            <h2 className="text-base font-bold text-[var(--color-foreground)]">
              研报观点
            </h2>
          </div>
          <div
            className={`rounded-xl border p-4 flex items-start justify-between gap-4 transition-colors ${
              checkHidden(moderation, "research_views", 0)
                ? "border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 opacity-60"
                : "border-[var(--color-border)] bg-[var(--color-surface)]"
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="space-y-3">
                <div>
                  <div className="text-xs font-semibold text-[var(--color-muted-fg)] mb-1">
                    核心结论
                  </div>
                  <div className="text-sm text-[var(--color-muted)]">
                    {report.research_views.core_conclusion}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-[var(--color-muted-fg)] mb-1">
                    行业判断
                  </div>
                  <div className="text-sm text-[var(--color-muted)]">
                    {report.research_views.industry_judgement}
                  </div>
                </div>
              </div>
              {checkHidden(moderation, "research_views", 0) && (
                <div className="mt-2 text-xs text-[var(--color-danger)]">
                  原因：
                  {getReason(moderation, "research_views", 0) || "未填写"}
                </div>
              )}
            </div>
            <div className="shrink-0">
              <ModerationToggle
                reportId={reportId}
                section="research_views"
                itemIndex={0}
                initialHidden={checkHidden(moderation, "research_views", 0)}
                initialReason={getReason(moderation, "research_views", 0)}
              />
            </div>
          </div>
        </section>
      )}

      {/* Watchlist */}
      {report.watchlist_companies.length > 0 && (
        <section id="watchlist" className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-5 rounded-full bg-[var(--color-accent)]" />
            <h2 className="text-base font-bold text-[var(--color-foreground)]">
              观察清单
            </h2>
            <span className="text-xs text-[var(--color-muted)]">
              ({report.watchlist_companies.length} 条)
            </span>
          </div>
          <div className="space-y-3">
            {report.watchlist_companies.map((item, idx) => {
              const hidden = checkHidden(moderation, "watchlist_companies", idx);
              return (
                <div
                  key={idx}
                  className={`rounded-xl border p-4 flex items-start justify-between gap-4 transition-colors ${
                    hidden
                      ? "border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 opacity-60"
                      : "border-[var(--color-border)] bg-[var(--color-surface)]"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-[var(--color-foreground)] mb-2">
                      {item.company}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-xs text-[var(--color-muted-fg)] mb-0.5">
                          跟踪理由
                        </div>
                        <div className="text-[var(--color-muted)]">
                          {item.tracking_reason}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-[var(--color-muted-fg)] mb-0.5">
                          关键指标
                        </div>
                        <div className="text-[var(--color-muted)]">
                          {item.key_metrics}
                        </div>
                      </div>
                    </div>
                    {hidden && (
                      <div className="mt-2 text-xs text-[var(--color-danger)]">
                        原因：
                        {getReason(moderation, "watchlist_companies", idx) ||
                          "未填写"}
                      </div>
                    )}
                  </div>
                  <div className="shrink-0">
                    <ModerationToggle
                      reportId={reportId}
                      section="watchlist_companies"
                      itemIndex={idx}
                      initialHidden={hidden}
                      initialReason={getReason(
                        moderation,
                        "watchlist_companies",
                        idx
                      )}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Next Week Focus */}
      {nextWeekSections.length > 0 && (
        <section id="next-week" className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-5 rounded-full bg-[var(--color-accent)]" />
            <h2 className="text-base font-bold text-[var(--color-foreground)]">
              下周关注
            </h2>
            <span className="text-xs text-[var(--color-muted)]">
              ({nextWeekTotal} 条)
            </span>
          </div>
          <div className="space-y-6">
            {nextWeekSections.map((sub) => (
              <div key={sub.key}>
                <h3 className="text-sm font-semibold text-[var(--color-muted-fg)] mb-3">
                  {sub.label}
                </h3>
                <div className="space-y-2">
                  {sub.items.map((item, idx) => {
                    const hidden = checkHidden(
                      moderation,
                      "next_week_focus",
                      idx,
                      sub.key
                    );
                    return (
                      <div
                        key={idx}
                        className={`rounded-lg border p-3 flex items-start justify-between gap-4 transition-colors ${
                          hidden
                            ? "border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 opacity-60"
                            : "border-[var(--color-border)] bg-[var(--color-surface)]"
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-[var(--color-foreground)]">
                            {item}
                          </div>
                          {hidden && (
                            <div className="mt-1 text-xs text-[var(--color-danger)]">
                              原因：
                              {getReason(
                                moderation,
                                "next_week_focus",
                                idx,
                                sub.key
                              ) || "未填写"}
                            </div>
                          )}
                        </div>
                        <div className="shrink-0">
                          <ModerationToggle
                            reportId={reportId}
                            section="next_week_focus"
                            itemIndex={idx}
                            subSection={sub.key}
                            initialHidden={hidden}
                            initialReason={getReason(
                              moderation,
                              "next_week_focus",
                              idx,
                              sub.key
                            )}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
