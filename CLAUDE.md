# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Next.js app for viewing structured weekly reports. Reports are ingested via a webhook and stored in a local SQLite database.

## Development Commands

- `pnpm dev` — Start the development server on http://localhost:3000
- `pnpm build` — Production build
- `pnpm start` — Start production server
- `pnpm lint` — Run ESLint

This project uses `pnpm` as its package manager (`pnpm-lock.yaml` present).

## Architecture

### Stack
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- better-sqlite3 (native SQLite module)

### Data Flow
1. Reports are **pushed in** via `POST /api/webhook` (`app/api/webhook/route.ts`)
2. The webhook validates required fields (`report_type`, `time_range.start`, `time_range.end`) and calls `insertReport()`
3. Pages read directly from SQLite via `lib/db.ts` — there is no separate API layer for reads; Server Components call `getAllReports()` and `getReportById()` directly

### Database (`lib/db.ts`)
- SQLite file at `data/reports.db`
- Uses **WAL mode** (`journal_mode = WAL`)
- better-sqlite3 is declared as a `serverExternalPackages` in `next.config.ts` (required for the native module to work correctly)
- Several columns store JSON strings: `executive_summary`, `event_list`, `large_deals`, `research_views`, `watchlist_companies`, `next_week_focus`
- `parseReportRow()` handles JSON parsing when reading rows

### Report Schema (`types/report.ts`)
A report contains:
- `report_type` — display name of the report
- `time_range` — `{ start, end }` strings
- `executive_summary` — array of events with `date`, `time`, `event_type`, `company_or_institution`, `core_info`
- `executive_trend_judgement` — optional trend summary string
- `event_list` — detailed events with `impact_assessment`, `credibility`, and `source`
- `large_deals` — deal items with `signatory`, `buyer`, `product_or_service`, `amount_range`
- `research_views` — optional section with `has_new_report`, `core_conclusion`, `industry_judgement`
- `watchlist_companies` — companies being tracked with `tracking_reason` and `key_metrics`
- `next_week_focus` — categorized arrays: `meetings_events`, `policy_regulation`, `technical_metrics`, `market_capital`

### Pages
- `/` — Lists all reports, newest first, linking to detail pages
- `/reports/[id]` — Full report detail with sections for executive summary, events, deals, research views, watchlist, and next week focus

## Important Notes

- Do not delete or commit `data/reports.db` or its WAL files (`-shm`, `-wal`). These are runtime data, not build artifacts.
- The database connection is cached in module scope (`let db`) — it is initialized lazily on first call to `getDb()`.
- The project is configured for Chinese locale (`lang="zh-CN"`) and uses Chinese UI labels.
