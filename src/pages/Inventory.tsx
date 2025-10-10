import { useState } from "react";
import { getTodayRecords } from "@/lib/mockData";
import { Category } from "@/lib/types";
import { CategoryChip } from "@/components/CategoryChip";
import { VarietyCard } from "@/components/VarietyCard";
import { ArrowLeft, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const Inventory = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const todayRecords = getTodayRecords();
  
  const filteredRecords = todayRecords.filter((record) => {
    const matchesCategory = !selectedCategory || record.category === selectedCategory;
    const matchesSearch = record.variety.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories: Category[] = ["WATER BASE", "MILK BASE", "FAMILY PACK", "4L TUBS"];

  const handleSwipeRight = (recordId: string) => {
    toast.success("Added +1 box", {
      description: `Stock increased`,
      duration: 2000,
    });
  };

  const handleSwipeLeft = (recordId: string) => {
    toast.info("Reduced -1 box", {
      description: `Stock decreased`,
      duration: 2000,
    });
  };

  const handleTap = (recordId: string) => {
    // In future, open bottom sheet with details
    console.log("Tapped record:", recordId);
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
            <VarietyCard
              key={record.id}
              record={record}
              onSwipeRight={() => handleSwipeRight(record.id)}
              onSwipeLeft={() => handleSwipeLeft(record.id)}
              onTap={() => handleTap(record.id)}
            />
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
