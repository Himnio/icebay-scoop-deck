import { getTodayRecords, varieties } from "@/lib/mockData";
import { CategoryChip } from "@/components/CategoryChip";
import { Category } from "@/lib/types";
import { Calendar as CalendarIcon, TrendingUp, Package, DollarSign, ShoppingCart, Home as HomeIcon, BarChart3, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

const Home = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedCategory, setSelectedCategory] = useState<Category | "">("");
  const [selectedVariety, setSelectedVariety] = useState("");
  const [saleQuantity, setSaleQuantity] = useState("");
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

  const filteredVarieties = selectedCategory 
    ? varieties.filter(v => v.category === selectedCategory)
    : varieties;

  const handleSale = () => {
    if (!selectedCategory || !selectedVariety || !saleQuantity) {
      toast({
        title: "Missing Information",
        description: "Please select category, variety, and enter quantity",
        variant: "destructive",
      });
      return;
    }

    const quantity = parseInt(saleQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      toast({
        title: "Invalid Quantity",
        description: "Please enter a valid quantity",
        variant: "destructive",
      });
      return;
    }

    // In future, this will update the actual data
    toast({
      title: "Sale Recorded!",
      description: `Sold ${quantity} ${selectedVariety} (${selectedCategory})`,
    });

    // Reset form
    setSelectedCategory("");
    setSelectedVariety("");
    setSaleQuantity("");
  };

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

      <div className="container mx-auto px-4 py-6 space-y-6 pb-24">
        {/* Selected Date */}
        <div className="text-center mb-4">
          <p className="text-sm text-muted-foreground">{displayDate}</p>
        </div>

        {/* Quick Sale Form */}
        <div className="glass rounded-2xl p-5 shadow-[var(--shadow-card)] border-2 border-primary/20">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            Record Sale
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={selectedCategory} onValueChange={(value) => {
                setSelectedCategory(value as Category);
                setSelectedVariety("");
              }}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WATER BASE">Water Base</SelectItem>
                  <SelectItem value="MILK BASE">Milk Base</SelectItem>
                  <SelectItem value="FAMILY PACK">Family Pack</SelectItem>
                  <SelectItem value="4L TUBS">4L Tubs</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Variety</label>
              <Select 
                value={selectedVariety} 
                onValueChange={setSelectedVariety}
                disabled={!selectedCategory}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select variety" />
                </SelectTrigger>
                <SelectContent>
                  {filteredVarieties.map((variety) => (
                    <SelectItem key={variety.id} value={variety.name}>
                      {variety.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Quantity (boxes)</label>
              <Input
                type="number"
                placeholder="Enter quantity"
                value={saleQuantity}
                onChange={(e) => setSaleQuantity(e.target.value)}
                min="1"
              />
            </div>

            <Button 
              onClick={handleSale}
              className="w-full h-12 text-lg bg-[hsl(var(--raspberry))] hover:bg-[hsl(var(--raspberry))]/90 text-white"
            >
              Record Sale
            </Button>
          </div>
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

      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 glass border-t border-border z-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-4 gap-2 py-3">
            <Button
              variant="ghost"
              className="flex flex-col items-center gap-1 h-auto py-2"
              onClick={() => navigate("/")}
            >
              <HomeIcon className="w-5 h-5 text-primary" />
              <span className="text-xs font-medium">Home</span>
            </Button>
            <Button
              variant="ghost"
              className="flex flex-col items-center gap-1 h-auto py-2"
              onClick={() => navigate("/daily-stocks")}
            >
              <DollarSign className="w-5 h-5" />
              <span className="text-xs">Daily Stocks</span>
            </Button>
            <Button
              variant="ghost"
              className="flex flex-col items-center gap-1 h-auto py-2"
              onClick={() => navigate("/inventory")}
            >
              <ClipboardList className="w-5 h-5" />
              <span className="text-xs">Inventory</span>
            </Button>
            <Button
              variant="ghost"
              className="flex flex-col items-center gap-1 h-auto py-2"
              onClick={() => navigate("/analytics")}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="text-xs">Analytics</span>
            </Button>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Home;
