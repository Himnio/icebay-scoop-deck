import { useState } from "react";
import { getTodayRecords } from "@/lib/mockData";
import { Category, DailyRecord } from "@/lib/types";
import { CategoryChip } from "@/components/CategoryChip";
import { ArrowLeft, Search, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

const DailyStocks = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVariety, setSelectedVariety] = useState<DailyRecord | null>(null);
  const [saleQuantity, setSaleQuantity] = useState<string>("");
  
  const todayRecords = getTodayRecords();
  
  const filteredRecords = todayRecords.filter((record) => {
    const matchesCategory = !selectedCategory || record.category === selectedCategory;
    const matchesSearch = record.variety.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories: Category[] = ["WATER BASE", "MILK BASE", "FAMILY PACK", "4L TUBS"];

  const isToday = format(selectedDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

  const handleSale = () => {
    if (!selectedVariety || !saleQuantity) {
      toast.error("Please select a variety and enter quantity");
      return;
    }

    const quantity = parseInt(saleQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    if (quantity > selectedVariety.remaining) {
      toast.error("Not enough stock remaining");
      return;
    }

    toast.success(`Sold ${quantity} boxes of ${selectedVariety.variety}`, {
      description: `Remaining: ${selectedVariety.remaining - quantity}`,
      duration: 3000,
    });

    // Reset form
    setSelectedVariety(null);
    setSaleQuantity("");
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="glass sticky top-0 z-10 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/")}
                className="p-2 rounded-full hover:bg-muted transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold">Daily Stocks</h1>
                <p className="text-sm text-muted-foreground">Record sales & track inventory</p>
              </div>
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
        {/* Sale Form Card */}
        {selectedVariety && (
          <Card className="p-6 glass border-[hsl(var(--mint))] border-2 animate-scale-in">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">{selectedVariety.variety}</h3>
                <p className="text-sm text-muted-foreground">{selectedVariety.category}</p>
              </div>

              <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-muted/30">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[hsl(var(--mint))]">{selectedVariety.stock}</div>
                  <div className="text-xs text-muted-foreground mt-1">Stock</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[hsl(var(--mango))]">{selectedVariety.remaining}</div>
                  <div className="text-xs text-muted-foreground mt-1">Remaining</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[hsl(var(--raspberry))]">{selectedVariety.sales}</div>
                  <div className="text-xs text-muted-foreground mt-1">Sales</div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Sale Quantity</label>
                <Input
                  type="number"
                  min="1"
                  max={selectedVariety.remaining}
                  value={saleQuantity}
                  onChange={(e) => setSaleQuantity(e.target.value)}
                  placeholder="Enter quantity"
                  className="text-lg h-12"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSale}
                  className="flex-1 h-12 text-base gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Record Sale
                </Button>
                <Button
                  onClick={() => {
                    setSelectedVariety(null);
                    setSaleQuantity("");
                  }}
                  variant="outline"
                  className="h-12"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search ice cream flavors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 rounded-2xl glass border-border"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap
              ${!selectedCategory 
                ? "bg-foreground text-background" 
                : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
          >
            All
          </button>
          {categories.map((category) => (
            <CategoryChip
              key={category}
              category={category}
              active={selectedCategory === category}
              onClick={() => setSelectedCategory(
                selectedCategory === category ? null : category
              )}
            />
          ))}
        </div>

        {/* Variety List */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Select Variety
          </h2>
          <div className="grid gap-3">
            {filteredRecords.map((record) => (
              <button
                key={record.id}
                onClick={() => {
                  setSelectedVariety(record);
                  setSaleQuantity("");
                }}
                className={`glass rounded-xl p-4 text-left transition-all duration-200 hover:shadow-[var(--shadow-soft)]
                  ${selectedVariety?.id === record.id ? "border-2 border-[hsl(var(--mint))] bg-[hsl(var(--mint))]/5" : ""}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-foreground">{record.variety}</h3>
                    <p className="text-xs text-muted-foreground">{record.category}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-sm font-bold text-[hsl(var(--mango))]">{record.remaining}</div>
                      <div className="text-xs text-muted-foreground">left</div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 text-xs">
                  <span className="text-muted-foreground">Stock: <span className="font-semibold text-foreground">{record.stock}</span></span>
                  <span className="text-muted-foreground">Sales: <span className="font-semibold text-foreground">{record.sales}</span></span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {filteredRecords.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4 animate-float">🍦</div>
            <p className="text-lg font-medium mb-2">No varieties found</p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your filters or search
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyStocks;
