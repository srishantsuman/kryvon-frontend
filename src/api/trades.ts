import apiClient from "./client";

export type TradeType = "buy" | "sell";

export interface Trade {
  id: number;
  date: string;
  symbol: string;
  entry_price: number;
  exit_price: number;
  quantity: number;
  trade_type: TradeType;
  pnl: number;
  notes: string | null;
  tags: string[];
  created_at: string;
}

export interface TradeCreate {
  date: string;
  symbol: string;
  entry_price: number;
  exit_price: number;
  quantity: number;
  trade_type: TradeType;
  notes?: string;
  tags?: string[];
}

export interface TradeUpdate extends Partial<TradeCreate> {}

export interface TradeListResponse {
  trades: Trade[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface TradeFilters {
  page?: number;
  page_size?: number;
  symbol?: string;
  date_from?: string;
  date_to?: string;
  tag?: string;
}

export const tradesApi = {
  list: async (filters: TradeFilters = {}): Promise<TradeListResponse> => {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== undefined && v !== "")
    );
    const { data } = await apiClient.get<TradeListResponse>("/trades", { params });
    return data;
  },

  create: async (trade: TradeCreate): Promise<Trade> => {
    const { data } = await apiClient.post<Trade>("/trades", trade);
    return data;
  },

  update: async (id: number, trade: TradeUpdate): Promise<Trade> => {
    const { data } = await apiClient.patch<Trade>(`/trades/${id}`, trade);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/trades/${id}`);
  },
};
