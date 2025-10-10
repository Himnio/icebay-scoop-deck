import { DailyRecord } from "@/lib/types";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useState } from "react";

interface VarietyCardProps {
  record: DailyRecord;
  onSwipeRight?: () => void;
  onSwipeLeft?: () => void;
  onTap?: () => void;
}

export const VarietyCard = ({ record, onSwipeRight, onSwipeLeft, onTap }: VarietyCardProps) => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && onSwipeLeft) {
      setSwipeDirection("left");
      setTimeout(() => {
        onSwipeLeft();
        setSwipeDirection(null);
      }, 200);
    }
    
    if (isRightSwipe && onSwipeRight) {
      setSwipeDirection("right");
      setTimeout(() => {
        onSwipeRight();
        setSwipeDirection(null);
      }, 200);
    }
  };

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
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onClick={onTap}
      className={cn(
        "glass rounded-2xl p-4 shadow-[var(--shadow-card)] cursor-pointer",
        "transition-all duration-200 active:scale-95",
        "hover:shadow-[var(--shadow-soft)]",
        swipeDirection === "right" && "translate-x-4 opacity-70",
        swipeDirection === "left" && "-translate-x-4 opacity-70"
      )}
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
        Swipe → to add • Swipe ← to reduce
      </div>
    </div>
  );
};
