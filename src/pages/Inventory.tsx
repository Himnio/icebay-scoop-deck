import { useState } from "react";
import { getTodayRecords } from "@/lib/mockData";
import { Category } from "@/lib/types";
import { CategoryChip } from "@/components/CategoryChip";
import { ArrowLeft, Search, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const Inventory = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  
  const todayRecords = getTodayRecords();
  
  const filteredRecords = todayRecords.filter((record) => {
    const matchesCategory = !selectedCategory || record.category === selectedCategory;
    const matchesSearch = record.variety.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories: Category[] = ["WATER BASE", "MILK BASE", "FAMILY PACK", "4L TUBS"];

  const handleStockChange = (id: string, value: string) => {
    setInputValues(prev => ({ ...prev, [id]: value }));
  };

  const handleStockSubmit = (id: string, varietyName: string, currentStock: number) => {
    const value = inputValues[id];
    if (!value || value.trim() === "") return;

    const trimmedValue = value.trim();
    let newStock = currentStock;
    let operation = "";

    if (trimmedValue.startsWith("+")) {
      const addAmount = parseInt(trimmedValue.substring(1));
      if (!isNaN(addAmount)) {
        newStock = currentStock + addAmount;
        operation = `+${addAmount}`;
      }
    } else if (trimmedValue.startsWith("-")) {
      const subtractAmount = parseInt(trimmedValue.substring(1));
      if (!isNaN(subtractAmount)) {
        newStock = Math.max(0, currentStock - subtractAmount);
        operation = `-${subtractAmount}`;
      }
    } else {
      const directValue = parseInt(trimmedValue);
      if (!isNaN(directValue)) {
        newStock = Math.max(0, directValue);
        operation = `set to ${directValue}`;
      }
    }

    if (newStock !== currentStock) {
      toast.success(`${varietyName} updated`, {
        description: `Stock: ${currentStock} → ${newStock}`,
        duration: 2000,
      });
    }

    // Clear input
    setInputValues(prev => ({ ...prev, [id]: "" }));
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="glass sticky top-0 z-10 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold">Inventory</h1>
              <p className="text-sm text-muted-foreground">
                {filteredRecords.length} varieties
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search flavors..."
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

        {/* Inventory Cards */}
        <div className="grid gap-4">
          {filteredRecords.map((record) => (
            <div key={record.id} className="glass rounded-xl p-4 shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{record.variety}</h3>
                  <CategoryChip category={record.category} />
                </div>
                <Package className="w-5 h-5 text-[hsl(var(--mint))]" />
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                <div>
                  <div className="text-xs text-muted-foreground">Stock</div>
                  <div className="text-lg font-bold text-[hsl(var(--mint))]">{record.stock}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Remaining</div>
                  <div className="text-lg font-bold text-[hsl(var(--mango))]">{record.remaining}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Sales</div>
                  <div className="text-lg font-bold text-[hsl(var(--raspberry))]">{record.sales}</div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted-foreground block">
                  Update Stock (e.g., 10, +5, or -3)
                </label>
                <Input
                  type="text"
                  placeholder="Type and press Enter"
                  value={inputValues[record.id] || ""}
                  onChange={(e) => handleStockChange(record.id, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleStockSubmit(record.id, record.variety, record.stock);
                    }
                  }}
                  className="text-center h-11"
                />
              </div>
            </div>
          ))}
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

export default Inventory;
