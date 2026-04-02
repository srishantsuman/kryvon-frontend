import { useState, useEffect } from "react";
import { useTrades } from "../context/TradeContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { X, Loader2 } from "lucide-react";
import { Trade } from "../../api/trades";
import { toast } from "sonner";

const AVAILABLE_TAGS = ["overtrading", "FOMO", "revenge trading", "poor entry", "early exit"];

interface Props {
  open: boolean;
  onClose: () => void;
  editTrade?: Trade | null;
}

const emptyForm = {
  date: new Date().toISOString().split("T")[0],
  symbol: "", entryPrice: "", exitPrice: "", quantity: "",
  tradeType: "buy" as "buy" | "sell", notes: "", tags: [] as string[],
};

export const AddTradeModal = ({ open, onClose, editTrade }: Props) => {
  const { addTrade, editTrade: updateTrade } = useTrades();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (editTrade) {
      setForm({
        date: editTrade.date,
        symbol: editTrade.symbol,
        entryPrice: String(editTrade.entry_price),
        exitPrice: String(editTrade.exit_price),
        quantity: String(editTrade.quantity),
        tradeType: editTrade.trade_type,
        notes: editTrade.notes || "",
        tags: editTrade.tags,
      });
    } else {
      setForm(emptyForm);
    }
  }, [editTrade, open]);

  const previewPnL = (() => {
    const e = parseFloat(form.entryPrice), x = parseFloat(form.exitPrice), q = parseFloat(form.quantity);
    if (isNaN(e) || isNaN(x) || isNaN(q) || q <= 0) return null;
    return form.tradeType === "buy" ? (x - e) * q : (e - x) * q;
  })();

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setLoading(true);
    try {
      const payload = {
        date: form.date,
        symbol: form.symbol.toUpperCase(),
        entry_price: parseFloat(form.entryPrice),
        exit_price: parseFloat(form.exitPrice),
        quantity: parseFloat(form.quantity),
        trade_type: form.tradeType,
        notes: form.notes || undefined,
        tags: form.tags,
      };
      if (editTrade) {
        await updateTrade(editTrade.id, payload);
      } else {
        await addTrade(payload);
      }
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(msg || "Failed to save trade");
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tag: string) =>
    setForm((p) => ({ ...p, tags: p.tags.includes(tag) ? p.tags.filter((t) => t !== tag) : [...p.tags, tag] }));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl border"
        style={{ background: "rgba(10,10,10,0.97)", borderColor: "rgba(255,255,255,0.1)" }}>
        <DialogHeader>
          <DialogTitle className="text-2xl text-white">{editTrade ? "Edit Trade" : "Add New Trade"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white/90">Date</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                required className="bg-white/5 border-white/10 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-white/90">Symbol</Label>
              <Input placeholder="AAPL" value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value })}
                required className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white/90">Trade Type</Label>
            <div className="flex gap-2">
              {(["buy", "sell"] as const).map((t) => (
                <Button key={t} type="button"
                  className={`flex-1 transition-all ${form.tradeType === t
                    ? t === "buy" ? "bg-[#00D4FF] text-black hover:bg-[#00D4FF]/90" : "bg-[#7A5CFF] text-white hover:bg-[#7A5CFF]/90"
                    : "bg-white/5 border border-white/10 text-white hover:bg-white/10"}`}
                  onClick={() => setForm({ ...form, tradeType: t })}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { key: "entryPrice", label: "Entry Price", ph: "150.00" },
              { key: "exitPrice", label: "Exit Price", ph: "155.00" },
              { key: "quantity", label: "Quantity", ph: "10" },
            ].map(({ key, label, ph }) => (
              <div key={key} className="space-y-2">
                <Label className="text-white/90">{label}</Label>
                <Input type="number" step="any" placeholder={ph}
                  value={(form as Record<string, string>)[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  required className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
              </div>
            ))}
          </div>

          {previewPnL !== null && (
            <div className="p-4 rounded-lg border"
              style={{
                background: previewPnL >= 0 ? "rgba(0,255,133,0.08)" : "rgba(255,77,77,0.08)",
                borderColor: previewPnL >= 0 ? "rgba(0,255,133,0.25)" : "rgba(255,77,77,0.25)",
              }}>
              <p className="text-sm text-white/50 mb-1">Estimated PnL</p>
              <p className="text-2xl font-mono" style={{ color: previewPnL >= 0 ? "#00FF85" : "#FF4D4D" }}>
                {previewPnL >= 0 ? "+" : ""}${previewPnL.toFixed(2)}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-white/90">Behavior Tags</Label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TAGS.map((tag) => (
                <Badge key={tag} onClick={() => toggleTag(tag)}
                  className={`cursor-pointer transition-all ${form.tags.includes(tag)
                    ? "bg-[#FF4D4D] text-white hover:bg-[#FF4D4D]/80"
                    : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10"}`}>
                  {tag}{form.tags.includes(tag) && <X className="w-3 h-3 ml-1" />}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white/90">Notes</Label>
            <Textarea placeholder="Strategy, reasons, what went right/wrong..."
              value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-[90px]" />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}
              className="bg-white/5 border-white/10 text-white hover:bg-white/10">Cancel</Button>
            <Button type="submit" disabled={loading}
              style={{ background: "linear-gradient(135deg, #00D4FF 0%, #7A5CFF 100%)", border: "none" }}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {editTrade ? "Save Changes" : "Add Trade"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
