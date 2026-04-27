import { getAllReports, getModerationStatsForReports } from "@/lib/db";
import ReportsTable from "@/components/admin/ReportsTable";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const [reports, stats] = await Promise.all([
    getAllReports(),
    getModerationStatsForReports(),
  ]);

  const totalHidden = Object.values(stats).reduce((a, b) => a + b, 0);

  const reportsWithStats = reports.map((r) => ({
    ...r,
    hiddenCount: stats[r.id] || 0,
  }));

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
        <ReportsTable reports={reportsWithStats} />
      </div>
    </div>
  );
}
