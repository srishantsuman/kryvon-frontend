import apiClient from "./client";

// ── Dashboard ──────────────────────────────────────────────────────
export interface DashboardStats {
  total_pnl: number;
  win_rate: number;
  total_trades: number;
  avg_risk_reward: number;
  winning_trades: number;
  losing_trades: number;
}

export interface DailyPnLPoint {
  date: string;
  pnl: number;
  trades: number;
  cumulative_pnl: number;
}

export interface DashboardResponse {
  stats: DashboardStats;
  daily_pnl: DailyPnLPoint[];
}

// ── Calendar ───────────────────────────────────────────────────────
export interface CalendarDayStats {
  date: string;
  pnl: number;
  trades: number;
  wins: number;
  losses: number;
  win_rate: number;
}

export interface CalendarResponse {
  days: CalendarDayStats[];
  monthly_pnl: number;
  monthly_win_rate: number;
  monthly_trades: number;
  current_streak: number;
  streak_type: "win" | "loss" | null;
}

// ── Analytics ──────────────────────────────────────────────────────
export interface TagStat {
  tag: string;
  count: number;
  total_pnl: number;
  avg_pnl: number;
}

export interface SymbolStat {
  symbol: string;
  total_pnl: number;
  win_rate: number;
  trades: number;
}

export interface HourlyStat {
  hour: string;
  avg_pnl: number;
  trades: number;
}

export interface PnLRange {
  range: string;
  count: number;
}

export interface AnalyticsResponse {
  tag_analysis: TagStat[];
  symbol_performance: SymbolStat[];
  hourly_performance: HourlyStat[];
  pnl_distribution: PnLRange[];
  insights: string[];
}

export const analyticsApi = {
  getDashboard: async (): Promise<DashboardResponse> => {
    const { data } = await apiClient.get<DashboardResponse>("/dashboard");
    return data;
  },

  getCalendar: async (year: number, month: number): Promise<CalendarResponse> => {
    const { data } = await apiClient.get<CalendarResponse>("/calendar", {
      params: { year, month },
    });
    return data;
  },

  getAnalytics: async (): Promise<AnalyticsResponse> => {
    const { data } = await apiClient.get<AnalyticsResponse>("/analytics");
    return data;
  },
};
