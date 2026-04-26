export interface Source {
  title: string;
  publisher: string;
  url: string;
}

export interface ExecutiveSummaryItem {
  date: string;
  time: string;
  event_type: string;
  company_or_institution: string;
  core_info: string;
}

export interface EventListItem {
  time: string;
  event_type: string;
  company_or_institution: string;
  summary: string;
  impact_assessment: string;
  credibility: string;
  source: Source;
}

export interface LargeDeal {
  signatory: string;
  buyer: string;
  product_or_service: string;
  amount_range: string;
  time: string;
  source: Source;
}

export interface ResearchViews {
  has_new_report: boolean;
  core_conclusion: string;
  industry_judgement: string;
  source: Source;
}

export interface WatchlistCompany {
  company: string;
  tracking_reason: string;
  key_metrics: string;
}

export interface NextWeekFocus {
  meetings_events: string[];
  policy_regulation: string[];
  technical_metrics: string[];
  market_capital: string[];
}

export interface TimeRange {
  start: string;
  end: string;
}

export interface WeeklyReport {
  report_type: string;
  time_range: TimeRange;
  executive_summary: ExecutiveSummaryItem[];
  executive_trend_judgement: string;
  event_list: EventListItem[];
  large_deals: LargeDeal[];
  research_views: ResearchViews;
  watchlist_companies: WatchlistCompany[];
  next_week_focus: NextWeekFocus;
}

export interface ReportRow {
  id: number;
  report_type: string;
  time_range_start: string;
  time_range_end: string;
  executive_trend_judgement: string;
  executive_summary: string;
  event_list: string;
  large_deals: string;
  research_views: string;
  watchlist_companies: string;
  next_week_focus: string;
  created_at: string;
}
