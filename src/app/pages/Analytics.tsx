import { useEffect, useState } from "react";
import { analyticsApi, AnalyticsResponse } from "../../api/analytics";
import { motion } from "motion/react";
import { Loader2 } from "lucide-react";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { toast } from "sonner";

const tip = { background: "rgba(0,0,0,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" };

export const Analytics = () => {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi.getAnalytics()
      .then(setData)
      .catch(() => toast.error("Failed to load analytics"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#00D4FF" }} />
    </div>
  );

  if (!data) return null;

  const pnlColors = ["#FF4D4D","#FF6B6B","#FF9999","#85FFB8","#5CFFAA","#00FF85"];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl text-white mb-1">Analytics</h1>
        <p className="text-white/60">Deep dive into your trading patterns</p>
      </div>

      {/* Behavioral tag analysis */}
      {data.tag_analysis.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-6 border" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.08)" }}>
          <h3 className="text-xl text-white mb-1">Behavioral Tag Analysis</h3>
          <p className="text-white/50 text-sm mb-4">Impact of your trading behavior tags on PnL</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.tag_analysis}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="tag" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 12 }} />
              <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={tip} />
              <Bar dataKey="total_pnl" name="Total PnL" radius={[4,4,0,0]}>
                {data.tag_analysis.map((e, i) => <Cell key={i} fill={e.total_pnl >= 0 ? "#00FF85" : "#FF4D4D"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Symbol performance */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-xl p-6 border" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.08)" }}>
          <h3 className="text-xl text-white mb-4">Top Symbols by PnL</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.symbol_performance} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis type="number" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="symbol" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} width={50} />
              <Tooltip contentStyle={tip} />
              <Bar dataKey="total_pnl" name="Total PnL" radius={[0,4,4,0]}>
                {data.symbol_performance.map((e, i) => <Cell key={i} fill={e.total_pnl >= 0 ? "#00FF85" : "#FF4D4D"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* PnL distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-xl p-6 border" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.08)" }}>
          <h3 className="text-xl text-white mb-4">PnL Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={data.pnl_distribution.filter((r) => r.count > 0)}
                cx="50%" cy="50%" outerRadius={90}
                labelLine={false} label={({ range, percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ""}
                dataKey="count" nameKey="range">
                {data.pnl_distribution.filter((r) => r.count > 0).map((_, i) => (
                  <Cell key={i} fill={pnlColors[i % pnlColors.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tip} formatter={(v, n, p) => [v, p.payload.range]} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Hourly performance */}
      {data.hourly_performance.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-xl p-6 border" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.08)" }}>
          <h3 className="text-xl text-white mb-1">Performance by Time of Day</h3>
          <p className="text-white/50 text-sm mb-4">Identify your best and worst trading hours</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.hourly_performance}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="hour" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} />
              <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={tip} />
              <Bar dataKey="avg_pnl" name="Avg PnL" radius={[4,4,0,0]}>
                {data.hourly_performance.map((e, i) => <Cell key={i} fill={e.avg_pnl >= 0 ? "#00FF85" : "#FF4D4D"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Auto-generated insights */}
      {data.insights.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="rounded-xl p-6 border"
          style={{ background: "rgba(0,212,255,0.04)", borderColor: "rgba(0,212,255,0.2)" }}>
          <h3 className="text-xl text-white mb-4">Key Insights</h3>
          <div className="space-y-3">
            {data.insights.map((insight, i) => (
              <p key={i} className="text-white/80 text-sm leading-relaxed">
                <span className="text-[#00D4FF] mr-2">•</span>{insight}
              </p>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};
