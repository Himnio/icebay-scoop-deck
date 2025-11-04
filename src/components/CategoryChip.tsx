import { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CategoryChipProps {
  category: Category | "ALL";
  active?: boolean;
  onClick?: () => void;
}

const categoryColors: Record<Category | "ALL", string> = {
  "ALL": "bg-primary text-primary-foreground",
  "WATER BASE": "bg-[hsl(var(--mint))] text-foreground",
  "MILK BASE": "bg-[hsl(var(--raspberry))] text-foreground",
  "FAMILY PACK": "bg-[hsl(var(--mango))] text-foreground",
  "4L TUBS": "bg-[hsl(var(--vanilla))] text-foreground",
};

export const CategoryChip = ({ category, active, onClick }: CategoryChipProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
        "hover:scale-105 active:scale-95",
        categoryColors[category],
        active && "ring-2 ring-ring ring-offset-2 ring-offset-background scale-105"
      )}
    >
      {category}
    </button>
  );
};
