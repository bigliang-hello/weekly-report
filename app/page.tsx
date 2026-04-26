import Link from "next/link";
import { getAllReports } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const reports = await getAllReports();

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">周报列表</h1>

      {reports.length === 0 ? (
        <div className="text-gray-500 text-center py-20">
          暂无周报数据，请通过 Webhook 推送数据
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <Link
              key={report.id}
              href={`/reports/${report.id}`}
              className="block border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{report.report_type}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {report.time_range.start} ~ {report.time_range.end}
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  {new Date(report.created_at).toLocaleString("zh-CN")}
                </div>
              </div>
              {report.executive_trend_judgement && (
                <div className="mt-2 text-sm text-amber-700 bg-amber-50 inline-block px-2 py-1 rounded">
                  {report.executive_trend_judgement}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
