import { DailyRecord } from "@/lib/types";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, Plus } from "lucide-react";

interface VarietyCardProps {
  record: DailyRecord;
  onIncrease?: () => void;
  onDecrease?: () => void;
  onTap?: () => void;
}

export const VarietyCard = ({ record, onIncrease, onDecrease, onTap }: VarietyCardProps) => {

  const profit = record.sellingPrice && record.cost 
    ? (record.sellingPrice - record.cost) * record.sales 
    : 0;

  const getTrend = () => {
    // Mock trend - in real app, compare with yesterday
    const random = Math.random();
    if (random > 0.6) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (random < 0.4) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <div className="relative glass rounded-2xl shadow-[var(--shadow-card)] overflow-hidden">
      {/* Decrease Button (Left) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDecrease?.();
        }}
        className="absolute left-0 top-0 bottom-0 w-16 bg-[hsl(var(--raspberry))]/20 hover:bg-[hsl(var(--raspberry))]/30 
                   transition-all duration-200 flex items-center justify-center group z-10"
      >
        <Minus className="w-6 h-6 text-[hsl(var(--raspberry))] group-hover:scale-110 transition-transform" />
      </button>

      {/* Increase Button (Right) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onIncrease?.();
        }}
        className="absolute right-0 top-0 bottom-0 w-16 bg-[hsl(var(--mint))]/20 hover:bg-[hsl(var(--mint))]/30 
                   transition-all duration-200 flex items-center justify-center group z-10"
      >
        <Plus className="w-6 h-6 text-[hsl(var(--mint))] group-hover:scale-110 transition-transform" />
      </button>

      {/* Main Card Content */}
      <div
        onClick={onTap}
        className="px-20 py-4 cursor-pointer transition-all duration-200 hover:bg-accent/5"
      >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-1">{record.variety}</h3>
          <p className="text-xs text-muted-foreground">{record.category}</p>
        </div>
        <div className="flex items-center gap-1">
          {getTrend()}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <div className="text-2xl font-bold text-[hsl(var(--mint))]">{record.stock}</div>
          <div className="text-xs text-muted-foreground mt-1">Stock</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-[hsl(var(--mango))]">{record.remaining}</div>
          <div className="text-xs text-muted-foreground mt-1">Remaining</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-[hsl(var(--raspberry))]">{record.sales}</div>
          <div className="text-xs text-muted-foreground mt-1">Sales</div>
        </div>
      </div>

      {profit > 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="text-sm text-muted-foreground">
            Profit: <span className="font-semibold text-foreground">₹{profit}</span>
          </div>
        </div>
      )}

      <div className="mt-2 text-xs text-muted-foreground text-center">
        Click sides to adjust stock
      </div>
      </div>
    </div>
  );
};
