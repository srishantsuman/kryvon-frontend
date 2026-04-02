import { useState, useEffect } from "react";
import { analyticsApi, CalendarResponse } from "../../api/analytics";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { DayDetailModal } from "../components/DayDetailModal";
import { toast } from "sonner";

export const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calData, setCalData] = useState<CalendarResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  useEffect(() => {
    setLoading(true);
    analyticsApi.getCalendar(year, month)
      .then(setCalData)
      .catch(() => toast.error("Failed to load calendar"))
      .finally(() => setLoading(false));
  }, [year, month]);

  const dayMap = new Map(calData?.days.map((d) => [d.date, d]) ?? []);

  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const getPnLColor = (pnl: number) => {
    if (pnl === 0) return "rgba(255,255,255,0.04)";
    const intensity = Math.min(Math.abs(pnl) / 100, 1);
    return pnl > 0
      ? `rgba(0,255,133,${0.15 + intensity * 0.55})`
      : `rgba(255,77,77,${0.15 + intensity * 0.55})`;
  };

  const fmt = (d: number) =>
    `${year}-${String(month).padStart(2,"0")}-${String(d).padStart(2,"0")}`;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl text-white mb-1">Trading Calendar</h1>
        <p className="text-white/60">Visual performance tracking</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Monthly PnL", value: calData ? `${calData.monthly_pnl >= 0 ? "+" : ""}$${Number(calData.monthly_pnl).toFixed(2)}` : "—", color: calData && calData.monthly_pnl >= 0 ? "#00FF85" : "#FF4D4D" },
          { label: "Current Streak", value: calData ? `${calData.current_streak} ${calData.streak_type === "win" ? "🔥" : "❄️"}` : "—", color: calData?.streak_type === "win" ? "#00FF85" : "#FF4D4D" },
          { label: "Monthly Win Rate", value: calData ? `${calData.monthly_win_rate.toFixed(1)}%` : "—", color: "#00D4FF" },
        ].map((s) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-xl p-4 border" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.08)" }}>
            <p className="text-sm text-white/50 mb-1">{s.label}</p>
            <p className="text-2xl font-mono" style={{ color: s.color }}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Calendar grid */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="rounded-xl p-6 border" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.08)" }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="icon" onClick={() => setCurrentDate(new Date(year, month - 2, 1))}
            className="text-white/60 hover:text-white hover:bg-white/5">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-xl text-white">
            {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </h2>
          <Button variant="ghost" size="icon" onClick={() => setCurrentDate(new Date(year, month, 1))}
            className="text-white/60 hover:text-white hover:bg-white/5">
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
            <div key={d} className="text-center text-xs text-white/40 pb-2">{d}</div>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#00D4FF" }} />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`e-${i}`} className="aspect-square" />)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const dateStr = fmt(day);
              const stats = dayMap.get(dateStr);
              const isToday = new Date().toISOString().split("T")[0] === dateStr;

              return (
                <motion.div key={day}
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: day * 0.008 }}
                  className="aspect-square p-1.5 rounded-lg border cursor-pointer relative group"
                  style={{
                    background: getPnLColor(stats?.pnl ?? 0),
                    borderColor: isToday ? "#00D4FF" : "rgba(255,255,255,0.08)",
                    borderWidth: isToday ? 2 : 1,
                  }}
                  onClick={() => stats && setSelectedDate(dateStr)}>
                  <div className="text-xs text-white/80">{day}</div>
                  {stats && (
                    <div className="absolute inset-x-1.5 bottom-1.5 space-y-0.5">
                      <div className="text-xs font-mono leading-none"
                        style={{ color: stats.pnl >= 0 ? "#00FF85" : "#FF4D4D", fontSize: "10px" }}>
                        {stats.pnl >= 0 ? "+" : ""}${Number(stats.pnl).toFixed(0)}
                      </div>
                      <div className="text-white/40" style={{ fontSize: "9px" }}>{stats.trades}t</div>
                    </div>
                  )}
                  {/* Hover tooltip */}
                  {stats && (
                    <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 p-2.5 rounded-lg border opacity-0 group-hover:opacity-100 pointer-events-none z-20 whitespace-nowrap transition-opacity"
                      style={{ background: "rgba(0,0,0,0.95)", borderColor: "rgba(255,255,255,0.15)" }}>
                      <p className="text-xs text-white/60 mb-1">{dateStr}</p>
                      <p className="text-xs font-mono" style={{ color: stats.pnl >= 0 ? "#00FF85" : "#FF4D4D" }}>
                        PnL: {stats.pnl >= 0 ? "+" : ""}${Number(stats.pnl).toFixed(2)}
                      </p>
                      <p className="text-xs text-white/50">{stats.trades} trades · {stats.win_rate.toFixed(0)}% WR</p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div className="mt-5 flex items-center justify-center gap-6 text-xs text-white/50">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded" style={{ background: "rgba(0,255,133,0.4)" }} />Profit</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded" style={{ background: "rgba(255,77,77,0.4)" }} />Loss</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded border-2" style={{ borderColor: "#00D4FF" }} />Today</div>
        </div>
      </motion.div>

      {selectedDate && (
        <DayDetailModal date={selectedDate} open={!!selectedDate} onClose={() => setSelectedDate(null)} />
      )}
    </div>
  );
};
