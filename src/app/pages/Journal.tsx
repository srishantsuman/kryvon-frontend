import { useState, useEffect } from "react";
import { useTrades } from "../context/TradeContext";
import { motion } from "motion/react";
import { Button } from "../components/ui/button";
import { Plus, Trash2, Pencil, Loader2 } from "lucide-react";
import { AddTradeModal } from "../components/AddTradeModal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Trade } from "../../api/trades";

export const Journal = () => {
  const { trades, isLoading, fetchTrades, deleteTrade } = useTrades();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);

  useEffect(() => { fetchTrades(); }, [fetchTrades]);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this trade?")) return;
    await deleteTrade(id);
  };

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-white mb-1">Trading Journal</h1>
          <p className="text-white/60">Log and review your trades</p>
        </div>
        <Button onClick={() => { setEditingTrade(null); setIsModalOpen(true); }}
          style={{ background: "linear-gradient(135deg, #00D4FF 0%, #7A5CFF 100%)", border: "none" }}>
          <Plus className="w-4 h-4 mr-2" /> Add Trade
        </Button>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border overflow-hidden"
        style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.08)" }}>
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#00D4FF" }} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  {["Date","Symbol","Type","Entry","Exit","Qty","PnL","Tags","Notes",""].map((h) => (
                    <TableHead key={h} className="text-white/60 text-xs uppercase tracking-wider">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {trades.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-white/40 py-16">
                      No trades yet — add your first trade to get started
                    </TableCell>
                  </TableRow>
                ) : (
                  trades.map((trade, idx) => (
                    <motion.tr key={trade.id}
                      initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="border-white/5 hover:bg-white/[0.03] transition-colors">
                      <TableCell className="text-white/80 text-sm">{fmt(trade.date)}</TableCell>
                      <TableCell className="text-white font-mono font-medium">{trade.symbol}</TableCell>
                      <TableCell>
                        <Badge className={trade.trade_type === "buy"
                          ? "bg-[#00D4FF]/15 text-[#00D4FF] border-[#00D4FF]/25"
                          : "bg-[#7A5CFF]/15 text-[#7A5CFF] border-[#7A5CFF]/25"}>
                          {trade.trade_type.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white/80 font-mono">${Number(trade.entry_price).toFixed(2)}</TableCell>
                      <TableCell className="text-white/80 font-mono">${Number(trade.exit_price).toFixed(2)}</TableCell>
                      <TableCell className="text-white/80">{trade.quantity}</TableCell>
                      <TableCell>
                        <span className="font-mono font-medium" style={{ color: trade.pnl >= 0 ? "#00FF85" : "#FF4D4D" }}>
                          {trade.pnl >= 0 ? "+" : ""}${Number(trade.pnl).toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {trade.tags.map((tag) => (
                            <Badge key={tag} variant="outline"
                              className="bg-[#FF4D4D]/10 text-[#FF4D4D] border-[#FF4D4D]/25 text-xs">{tag}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-white/50 max-w-[160px] truncate text-sm">
                        {trade.notes || "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon"
                            className="text-white/30 hover:text-[#00D4FF] hover:bg-[#00D4FF]/10 h-8 w-8"
                            onClick={() => { setEditingTrade(trade); setIsModalOpen(true); }}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon"
                            className="text-white/30 hover:text-[#FF4D4D] hover:bg-[#FF4D4D]/10 h-8 w-8"
                            onClick={() => handleDelete(trade.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </motion.div>

      <AddTradeModal open={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingTrade(null); }} editTrade={editingTrade} />
    </div>
  );
};
