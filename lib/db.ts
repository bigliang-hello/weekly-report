import { createClient, type Client } from "@libsql/client";
import type { WeeklyReport, ReportRow } from "@/types/report";

function getClient(): Client {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    throw new Error("Missing TURSO_DATABASE_URL environment variable");
  }

  return createClient({ url, authToken });
}

async function initTables(client: Client) {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_type TEXT NOT NULL,
      time_range_start TEXT NOT NULL,
      time_range_end TEXT NOT NULL,
      executive_trend_judgement TEXT,
      executive_summary TEXT NOT NULL DEFAULT '[]',
      event_list TEXT NOT NULL DEFAULT '[]',
      large_deals TEXT NOT NULL DEFAULT '[]',
      research_views TEXT,
      watchlist_companies TEXT NOT NULL DEFAULT '[]',
      next_week_focus TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_reports_time_range ON reports(time_range_start, time_range_end)
  `);

  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at)
  `);
}

export async function insertReport(data: WeeklyReport): Promise<number> {
  const client = getClient();
  await initTables(client);

  const result = await client.execute({
    sql: `
      INSERT INTO reports (
        report_type, time_range_start, time_range_end,
        executive_trend_judgement, executive_summary, event_list,
        large_deals, research_views, watchlist_companies, next_week_focus
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      data.report_type,
      data.time_range.start,
      data.time_range.end,
      data.executive_trend_judgement ?? null,
      JSON.stringify(data.executive_summary ?? []),
      JSON.stringify(data.event_list ?? []),
      JSON.stringify(data.large_deals ?? []),
      data.research_views ? JSON.stringify(data.research_views) : null,
      JSON.stringify(data.watchlist_companies ?? []),
      data.next_week_focus ? JSON.stringify(data.next_week_focus) : null,
    ],
  });

  return Number(result.lastInsertRowid);
}

export async function getReportById(
  id: number
): Promise<(WeeklyReport & { id: number; created_at: string }) | null> {
  const client = getClient();
  await initTables(client);

  const result = await client.execute({
    sql: "SELECT * FROM reports WHERE id = ?",
    args: [id],
  });

  const row = result.rows[0] as unknown as ReportRow | undefined;
  if (!row) return null;
  return parseReportRow(row);
}

export async function getAllReports(): Promise<
  Array<WeeklyReport & { id: number; created_at: string }>
> {
  const client = getClient();
  await initTables(client);

  const result = await client.execute(
    "SELECT * FROM reports ORDER BY time_range_start DESC"
  );

  const rows = result.rows as unknown as ReportRow[];
  return rows.map(parseReportRow);
}

function parseReportRow(
  row: ReportRow
): WeeklyReport & { id: number; created_at: string } {
  return {
    id: row.id,
    report_type: row.report_type,
    time_range: {
      start: row.time_range_start,
      end: row.time_range_end,
    },
    executive_trend_judgement: row.executive_trend_judgement,
    executive_summary: JSON.parse(row.executive_summary),
    event_list: JSON.parse(row.event_list),
    large_deals: JSON.parse(row.large_deals),
    research_views: row.research_views ? JSON.parse(row.research_views) : null,
    watchlist_companies: JSON.parse(row.watchlist_companies),
    next_week_focus: row.next_week_focus ? JSON.parse(row.next_week_focus) : null,
    created_at: row.created_at,
  } as WeeklyReport & { id: number; created_at: string };
}
