import { notFound } from "next/navigation";
import Link from "next/link";
import { getReportById } from "@/lib/db";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ReportDetailPage({ params }: Props) {
  const { id } = await params;
  const reportId = Number(id);
  if (Number.isNaN(reportId)) notFound();

  const report = await getReportById(reportId);
  if (!report) notFound();

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">
          ← 返回列表
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-2">{report.report_type}</h1>
      <p className="text-gray-500 mb-8">
        {report.time_range.start} ~ {report.time_range.end}
      </p>

      {/* 高管摘要 */}
      {report.executive_summary?.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">高管摘要</h2>
          <div className="space-y-3">
            {report.executive_summary.map((item, idx) => (
              <div key={idx} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <span>{item.time}</span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                    {item.event_type}
                  </span>
                </div>
                <div className="font-medium">{item.company_or_institution}</div>
                <div className="text-gray-700 mt-1">{item.core_info}</div>
              </div>
            ))}
          </div>
          {report.executive_trend_judgement && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
              <span className="font-medium">趋势判断：</span>
              {report.executive_trend_judgement}
            </div>
          )}
        </section>
      )}

      {/* 事件列表 */}
      {report.event_list?.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">事件列表</h2>
          <div className="space-y-4">
            {report.event_list.map((item, idx) => (
              <div key={idx} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{item.time}</span>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                      {item.event_type}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                    可信度：{item.credibility}
                  </span>
                </div>
                <div className="font-medium mb-1">{item.company_or_institution}</div>
                <div className="text-gray-700 mb-2">{item.summary}</div>
                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded mb-2">
                  <span className="font-medium">影响评估：</span>
                  {item.impact_assessment}
                </div>
                <a
                  href={item.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  {item.source.title} — {item.source.publisher}
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 大额交易 */}
      {report.large_deals?.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">大额交易</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">时间</th>
                  <th className="text-left px-4 py-2 font-medium">签约方</th>
                  <th className="text-left px-4 py-2 font-medium">买方</th>
                  <th className="text-left px-4 py-2 font-medium">产品/服务</th>
                  <th className="text-left px-4 py-2 font-medium">金额</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {report.large_deals.map((deal, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-2">{deal.time}</td>
                    <td className="px-4 py-2">{deal.signatory}</td>
                    <td className="px-4 py-2">{deal.buyer}</td>
                    <td className="px-4 py-2">{deal.product_or_service}</td>
                    <td className="px-4 py-2">{deal.amount_range}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 研报观点 */}
      {report.research_views && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">研报观点</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                {report.research_views.has_new_report ? "有新报告" : "无新报告"}
              </span>
            </div>
            <div className="mb-2">
              <span className="font-medium">核心结论：</span>
              {report.research_views.core_conclusion}
            </div>
            <div className="mb-3">
              <span className="font-medium">行业判断：</span>
              {report.research_views.industry_judgement}
            </div>
            <a
              href={report.research_views.source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              {report.research_views.source.title} — {report.research_views.source.publisher}
            </a>
          </div>
        </section>
      )}

      {/* 观察清单 */}
      {report.watchlist_companies?.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">观察清单</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {report.watchlist_companies.map((item, idx) => (
              <div key={idx} className="border rounded-lg p-4">
                <div className="font-medium mb-1">{item.company}</div>
                <div className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">跟踪理由：</span>
                  {item.tracking_reason}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">关键指标：</span>
                  {item.key_metrics}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 下周关注 */}
      {report.next_week_focus && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">下周关注</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { title: "会议/事件", items: report.next_week_focus.meetings_events },
              { title: "政策/监管", items: report.next_week_focus.policy_regulation },
              { title: "技术指标", items: report.next_week_focus.technical_metrics },
              { title: "市场/资本", items: report.next_week_focus.market_capital },
            ].map(
              (section) =>
                section.items?.length > 0 && (
                  <div key={section.title} className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium mb-2">{section.title}</h3>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      {section.items.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )
            )}
          </div>
        </section>
      )}
    </main>
  );
}
