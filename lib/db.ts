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

async function initAdminTables(client: Client) {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS moderation (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_id INTEGER NOT NULL,
      section TEXT NOT NULL,
      item_index INTEGER NOT NULL DEFAULT 0,
      sub_section TEXT,
      is_hidden INTEGER NOT NULL DEFAULT 1,
      reason TEXT,
      moderated_by INTEGER,
      moderated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (report_id) REFERENCES reports(id)
    )
  `);

  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_moderation_report ON moderation(report_id)
  `);
}

async function initAllTables(client: Client) {
  await initTables(client);
  await initAdminTables(client);
}

export interface ModerationRecord {
  id: number;
  report_id: number;
  section: string;
  item_index: number;
  sub_section: string | null;
  is_hidden: number;
  reason: string | null;
  moderated_by: number | null;
  moderated_at: string;
}

export interface Admin {
  id: number;
  email: string;
  password_hash: string;
  salt: string;
  created_at: string;
}

export async function getAdminByEmail(email: string): Promise<Admin | null> {
  const client = getClient();
  await initAllTables(client);

  const result = await client.execute({
    sql: "SELECT * FROM admins WHERE email = ?",
    args: [email],
  });

  const row = result.rows[0] as unknown as Admin | undefined;
  return row ?? null;
}

export async function createAdmin(
  email: string,
  passwordHash: string,
  salt: string
): Promise<number> {
  const client = getClient();
  await initAllTables(client);

  const result = await client.execute({
    sql: "INSERT INTO admins (email, password_hash, salt) VALUES (?, ?, ?)",
    args: [email, passwordHash, salt],
  });

  return Number(result.lastInsertRowid);
}

export async function ensureDefaultAdmin(): Promise<void> {
  const client = getClient();
  await initAllTables(client);

  const countResult = await client.execute("SELECT COUNT(*) as cnt FROM admins");
  const count = Number((countResult.rows[0] as unknown as { cnt: number }).cnt);

  if (count === 0) {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    if (email && password) {
      const { hashPassword, generateSalt } = await import("@/lib/auth");
      const salt = generateSalt();
      const hash = hashPassword(password, salt);
      await createAdmin(email, hash, salt);
    }
  }
}

export async function getModerationByReportId(
  reportId: number
): Promise<ModerationRecord[]> {
  const client = getClient();
  await initAllTables(client);

  const result = await client.execute({
    sql: "SELECT * FROM moderation WHERE report_id = ?",
    args: [reportId],
  });

  return result.rows as unknown as ModerationRecord[];
}

export async function upsertModeration(data: {
  reportId: number;
  section: string;
  itemIndex: number;
  subSection?: string | null;
  isHidden: boolean;
  reason?: string | null;
  moderatedBy?: number | null;
}): Promise<number> {
  const client = getClient();
  await initAllTables(client);

  const existing = await client.execute({
    sql: `
      SELECT id FROM moderation
      WHERE report_id = ? AND section = ? AND item_index = ? AND (sub_section = ? OR (sub_section IS NULL AND ? IS NULL))
    `,
    args: [data.reportId, data.section, data.itemIndex, data.subSection ?? null, data.subSection ?? null],
  });

  if (existing.rows.length > 0) {
    const id = Number((existing.rows[0] as unknown as { id: number }).id);
    await client.execute({
      sql: `
        UPDATE moderation
        SET is_hidden = ?, reason = ?, moderated_by = ?, moderated_at = datetime('now')
        WHERE id = ?
      `,
      args: [data.isHidden ? 1 : 0, data.reason ?? null, data.moderatedBy ?? null, id],
    });
    return id;
  }

  const result = await client.execute({
    sql: `
      INSERT INTO moderation (report_id, section, item_index, sub_section, is_hidden, reason, moderated_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      data.reportId,
      data.section,
      data.itemIndex,
      data.subSection ?? null,
      data.isHidden ? 1 : 0,
      data.reason ?? null,
      data.moderatedBy ?? null,
    ],
  });

  return Number(result.lastInsertRowid);
}

export async function getReportByIdWithModeration(
  id: number
): Promise<(WeeklyReport & { id: number; created_at: string }) | null> {
  const client = getClient();
  await initAllTables(client);

  const result = await client.execute({
    sql: "SELECT * FROM reports WHERE id = ?",
    args: [id],
  });

  const row = result.rows[0] as unknown as ReportRow | undefined;
  if (!row) return null;

  const report = parseReportRow(row);
  const moderation = await getModerationByReportId(id);
  const hiddenSet = buildHiddenSet(moderation);

  return filterReportWithModeration(report, hiddenSet);
}

function buildHiddenSet(moderation: ModerationRecord[]): Set<string> {
  const set = new Set<string>();
  for (const m of moderation) {
    if (m.is_hidden) {
      const key = m.sub_section
        ? `${m.section}:${m.sub_section}:${m.item_index}`
        : `${m.section}:${m.item_index}`;
      set.add(key);
    }
  }
  return set;
}

function filterReportWithModeration(
  report: WeeklyReport & { id: number; created_at: string },
  hiddenSet: Set<string>
): WeeklyReport & { id: number; created_at: string } {
  const isHidden = (section: string, index: number, subSection?: string | null) => {
    const key = subSection ? `${section}:${subSection}:${index}` : `${section}:${index}`;
    return hiddenSet.has(key);
  };

  return {
    ...report,
    executive_summary: report.executive_summary.filter((_, i) => !isHidden("executive_summary", i)),
    event_list: report.event_list.filter((_, i) => !isHidden("event_list", i)),
    large_deals: report.large_deals.filter((_, i) => !isHidden("large_deals", i)),
    research_views: isHidden("research_views", 0) ? null : report.research_views,
    watchlist_companies: report.watchlist_companies.filter((_, i) => !isHidden("watchlist_companies", i)),
    next_week_focus: report.next_week_focus
      ? {
          meetings_events: report.next_week_focus.meetings_events.filter(
            (_, i) => !isHidden("next_week_focus", i, "meetings_events")
          ),
          policy_regulation: report.next_week_focus.policy_regulation.filter(
            (_, i) => !isHidden("next_week_focus", i, "policy_regulation")
          ),
          technical_metrics: report.next_week_focus.technical_metrics.filter(
            (_, i) => !isHidden("next_week_focus", i, "technical_metrics")
          ),
          market_capital: report.next_week_focus.market_capital.filter(
            (_, i) => !isHidden("next_week_focus", i, "market_capital")
          ),
        }
      : null,
  } as WeeklyReport & { id: number; created_at: string };
}

export async function getModerationStatsForReports(): Promise<
  Record<number, number>
> {
  const client = getClient();
  await initAllTables(client);

  const result = await client.execute(
    "SELECT report_id, COUNT(*) as cnt FROM moderation WHERE is_hidden = 1 GROUP BY report_id"
  );

  const stats: Record<number, number> = {};
  for (const row of result.rows) {
    stats[Number((row as unknown as { report_id: number }).report_id)] = Number(
      (row as unknown as { cnt: number }).cnt
    );
  }
  return stats;
}

export async function insertReport(data: WeeklyReport): Promise<number> {
  const client = getClient();
  await initAllTables(client);

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
  await initAllTables(client);

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
  await initAllTables(client);

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
