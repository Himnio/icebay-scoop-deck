import { getTodayRecords } from "@/lib/mockData";
import { CategoryChip } from "@/components/CategoryChip";
import { Category } from "@/lib/types";
import { Calendar as CalendarIcon, TrendingUp, Package, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { useState } from "react";

const Home = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const todayRecords = getTodayRecords();
  
  const totalSales = todayRecords.reduce((sum, r) => sum + r.sales, 0);
  const totalStock = todayRecords.reduce((sum, r) => sum + r.stock, 0);
  const totalRemaining = todayRecords.reduce((sum, r) => sum + r.remaining, 0);
  const totalProfit = todayRecords.reduce((sum, r) => {
    const profit = (r.sellingPrice || 0) - (r.cost || 0);
    return sum + (profit * r.sales);
  }, 0);

  const categories: Category[] = ["WATER BASE", "MILK BASE", "FAMILY PACK", "4L TUBS"];
  
  const categoryBreakdown = categories.map((category) => {
    const categoryRecords = todayRecords.filter((r) => r.category === category);
    const sales = categoryRecords.reduce((sum, r) => sum + r.sales, 0);
    return { category, sales };
  }).filter(c => c.sales > 0);

  const topSellers = todayRecords
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5);

  const lowStock = todayRecords
    .filter((r) => r.remaining < 5 && r.remaining > 0)
    .sort((a, b) => a.remaining - b.remaining)
    .slice(0, 5);

  const displayDate = selectedDate.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const isToday = format(selectedDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="glass sticky top-0 z-10 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[hsl(var(--mint))] to-[hsl(var(--raspberry))] bg-clip-text text-transparent">
                ICE BAY
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Inventory Dashboard</p>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 px-3 py-2 rounded-full bg-primary/10 hover:bg-primary/20"
                >
                  <CalendarIcon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">
                    {isToday ? "Today" : format(selectedDate, "dd MMM yyyy")}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Selected Date */}
        <div className="text-center mb-4">
          <p className="text-sm text-muted-foreground">{displayDate}</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass rounded-2xl p-4 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-[hsl(var(--raspberry))]" />
              <span className="text-sm text-muted-foreground">Sales</span>
            </div>
            <div className="text-3xl font-bold text-[hsl(var(--raspberry))]">{totalSales}</div>
            <div className="text-xs text-muted-foreground mt-1">boxes sold</div>
          </div>

          <div className="glass rounded-2xl p-4 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-5 h-5 text-[hsl(var(--mint))]" />
              <span className="text-sm text-muted-foreground">Stock</span>
            </div>
            <div className="text-3xl font-bold text-[hsl(var(--mint))]">{totalStock}</div>
            <div className="text-xs text-muted-foreground mt-1">total boxes</div>
          </div>

          <div className="glass rounded-2xl p-4 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-5 h-5 text-[hsl(var(--mango))]" />
              <span className="text-sm text-muted-foreground">Remaining</span>
            </div>
            <div className="text-3xl font-bold text-[hsl(var(--mango))]">{totalRemaining}</div>
            <div className="text-xs text-muted-foreground mt-1">in stock</div>
          </div>

          <div className="glass rounded-2xl p-4 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span className="text-sm text-muted-foreground">Profit</span>
            </div>
            <div className="text-3xl font-bold text-green-600">₹{totalProfit}</div>
            <div className="text-xs text-muted-foreground mt-1">today</div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="glass rounded-2xl p-5 shadow-[var(--shadow-card)]">
          <h2 className="text-lg font-semibold mb-4">Category Performance</h2>
          <div className="space-y-3">
            {categoryBreakdown.map(({ category, sales }) => (
              <div key={category} className="flex items-center justify-between">
                <CategoryChip category={category} />
                <div className="text-right">
                  <div className="text-xl font-bold">{sales}</div>
                  <div className="text-xs text-muted-foreground">boxes</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Sellers */}
        <div className="glass rounded-2xl p-5 shadow-[var(--shadow-card)]">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[hsl(var(--raspberry))]" />
            Top Sellers
          </h2>
          <div className="space-y-3">
            {topSellers.map((record, idx) => (
              <div key={record.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[hsl(var(--raspberry))] text-white flex items-center justify-center font-bold text-sm">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{record.variety}</div>
                  <div className="text-xs text-muted-foreground">{record.category}</div>
                </div>
                <div className="text-xl font-bold text-[hsl(var(--raspberry))]">
                  {record.sales}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alert */}
        {lowStock.length > 0 && (
          <div className="glass rounded-2xl p-5 shadow-[var(--shadow-card)] border-2 border-destructive/20">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-destructive">
              <Package className="w-5 h-5" />
              Low Stock Alert
            </h2>
            <div className="space-y-3">
              {lowStock.map((record) => (
                <div key={record.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{record.variety}</div>
                    <div className="text-xs text-muted-foreground">{record.category}</div>
                  </div>
                  <div className="text-xl font-bold text-destructive">
                    {record.remaining}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => navigate("/inventory")}
            size="lg"
            className="h-14 text-lg bg-[hsl(var(--mint))] hover:bg-[hsl(var(--mint))]/90 text-foreground"
          >
            Inventory
          </Button>
          <Button
            onClick={() => navigate("/analytics")}
            size="lg"
            variant="outline"
            className="h-14 text-lg"
          >
            Analytics
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;
