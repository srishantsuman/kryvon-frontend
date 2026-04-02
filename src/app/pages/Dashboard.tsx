import { useEffect } from "react";
import { useTrades } from "../context/TradeContext";
import { motion } from "motion/react";
import { TrendingUp, TrendingDown, Target, Activity, Loader2 } from "lucide-react";
import {
  LineChart, Line, PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const chartTooltipStyle = {
  background: "rgba(0,0,0,0.9)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "8px",
  color: "#fff",
};

export const Dashboard = () => {
  const { trades, isLoading, fetchTrades, getTotalPnL, getWinRate, getTotalTrades, getAvgRiskReward } = useTrades();

  useEffect(() => { fetchTrades(); }, [fetchTrades]);

  const totalPnL = getTotalPnL();
  const winRate = getWinRate();
  const totalTrades = getTotalTrades();
  const avgRR = getAvgRiskReward();

  // Build daily + cumulative PnL
  const dailyMap: Record<string, { pnl: number; trades: number }> = {};
  trades.forEach((t) => {
    if (!dailyMap[t.date]) dailyMap[t.date] = { pnl: 0, trades: 0 };
    dailyMap[t.date].pnl += Number(t.pnl);
    dailyMap[t.date].trades += 1;
  });
  const dailyPnLData = Object.entries(dailyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({ date, ...v }));

  let cumulative = 0;
  const cumulativePnLData = dailyPnLData.map((d) => {
    cumulative += d.pnl;
    return { date: d.date, pnl: cumulative };
  });

  const wins = trades.filter((t) => t.pnl > 0).length;
  const losses = trades.filter((t) => t.pnl < 0).length;
  const winLossData = [
    { name: "Wins", value: wins, color: "#00FF85" },
    { name: "Losses", value: losses, color: "#FF4D4D" },
  ];

  const stats = [
    { label: "Total PnL", value: `$${totalPnL.toFixed(2)}`, icon: totalPnL >= 0 ? TrendingUp : TrendingDown, color: totalPnL >= 0 ? "#00FF85" : "#FF4D4D" },
    { label: "Win Rate", value: `${winRate.toFixed(1)}%`, icon: Target, color: "#00D4FF" },
    { label: "Total Trades", value: totalTrades.toString(), icon: Activity, color: "#7A5CFF" },
    { label: "Avg Risk/Reward", value: avgRR > 0 ? avgRR.toFixed(2) : "N/A", icon: TrendingUp, color: "#00D4FF" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#00D4FF" }} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl text-white mb-1">Dashboard</h1>
        <p className="text-white/60">Track your trading performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-xl p-6 border"
            style={{ background: `${stat.color}10`, borderColor: `${stat.color}25` }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
              style={{ background: `${stat.color}20` }}>
              <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
            </div>
            <p className="text-white/60 text-sm mb-1">{stat.label}</p>
            <p className="text-3xl text-white font-mono">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="rounded-xl p-6 border" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.08)" }}>
          <h3 className="text-xl text-white mb-4">Cumulative PnL</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={cumulativePnLData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }}
                tickFormatter={(v) => new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })} />
              <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Line type="monotone" dataKey="pnl" stroke="#00D4FF" strokeWidth={2} dot={{ fill: "#00D4FF", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }}
          className="rounded-xl p-6 border" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.08)" }}>
          <h3 className="text-xl text-white mb-4">Win / Loss</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={winLossData} cx="50%" cy="50%" outerRadius={90}
                labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} dataKey="value">
                {winLossData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={chartTooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Daily PnL bar chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="rounded-xl p-6 border" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.08)" }}>
        <h3 className="text-xl text-white mb-4">Daily PnL</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={dailyPnLData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }}
              tickFormatter={(v) => new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })} />
            <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={chartTooltipStyle} />
            <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
              {dailyPnLData.map((e, i) => <Cell key={i} fill={e.pnl >= 0 ? "#00FF85" : "#FF4D4D"} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
};
