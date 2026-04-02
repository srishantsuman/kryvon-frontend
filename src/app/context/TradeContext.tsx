import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { toast } from "sonner";
import { tradesApi, Trade, TradeCreate, TradeUpdate } from "../../api/trades";

// Keep the Trade type compatible with frontend usage (camelCase aliases)
export type { Trade };

interface TradeContextType {
  trades: Trade[];
  total: number;
  isLoading: boolean;
  fetchTrades: (filters?: Record<string, unknown>) => Promise<void>;
  addTrade: (trade: TradeCreate) => Promise<void>;
  editTrade: (id: number, trade: TradeUpdate) => Promise<void>;
  deleteTrade: (id: number) => Promise<void>;
  // Convenience helpers used by calendar / dashboard (work on loaded trades)
  getTradesByDate: (date: string) => Trade[];
  getDailyPnL: (date: string) => number;
  getTotalPnL: () => number;
  getWinRate: () => number;
  getTotalTrades: () => number;
  getAvgRiskReward: () => number;
}

const TradeContext = createContext<TradeContextType | undefined>(undefined);

export const TradeProvider = ({ children }: { children: ReactNode }) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTrades = useCallback(async (filters = {}) => {
    setIsLoading(true);
    try {
      const res = await tradesApi.list({ page_size: 200, ...filters });
      setTrades(res.trades);
      setTotal(res.total);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(msg || "Failed to load trades");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addTrade = async (trade: TradeCreate) => {
    const newTrade = await tradesApi.create(trade);
    setTrades((prev) => [newTrade, ...prev]);
    setTotal((t) => t + 1);
    toast.success("Trade added successfully");
  };

  const editTrade = async (id: number, trade: TradeUpdate) => {
    const updated = await tradesApi.update(id, trade);
    setTrades((prev) => prev.map((t) => (t.id === id ? updated : t)));
    toast.success("Trade updated");
  };

  const deleteTrade = async (id: number) => {
    await tradesApi.delete(id);
    setTrades((prev) => prev.filter((t) => t.id !== id));
    setTotal((t) => t - 1);
    toast.success("Trade deleted");
  };

  // ── Local computation helpers (no extra API calls needed) ──────
  const getTradesByDate = (date: string) => trades.filter((t) => t.date === date);
  const getDailyPnL = (date: string) =>
    trades.filter((t) => t.date === date).reduce((s, t) => s + Number(t.pnl), 0);
  const getTotalPnL = () => trades.reduce((s, t) => s + Number(t.pnl), 0);
  const getWinRate = () => {
    if (!trades.length) return 0;
    return (trades.filter((t) => t.pnl > 0).length / trades.length) * 100;
  };
  const getTotalTrades = () => trades.length;
  const getAvgRiskReward = () => {
    const wins = trades.filter((t) => t.pnl > 0);
    const losses = trades.filter((t) => t.pnl < 0);
    if (!losses.length) return 0;
    const avgWin = wins.reduce((s, t) => s + Number(t.pnl), 0) / wins.length;
    const avgLoss = Math.abs(losses.reduce((s, t) => s + Number(t.pnl), 0) / losses.length);
    return avgLoss > 0 ? avgWin / avgLoss : 0;
  };

  return (
    <TradeContext.Provider
      value={{
        trades, total, isLoading,
        fetchTrades, addTrade, editTrade, deleteTrade,
        getTradesByDate, getDailyPnL, getTotalPnL, getWinRate, getTotalTrades, getAvgRiskReward,
      }}
    >
      {children}
    </TradeContext.Provider>
  );
};

export const useTrades = () => {
  const ctx = useContext(TradeContext);
  if (!ctx) throw new Error("useTrades must be used within TradeProvider");
  return ctx;
};
