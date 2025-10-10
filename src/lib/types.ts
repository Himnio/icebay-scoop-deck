export type Category = "WATER BASE" | "MILK BASE" | "FAMILY PACK" | "4L TUBS";

export interface Variety {
  id: string;
  name: string;
  category: Category;
}

export interface DailyRecord {
  id: string;
  date: string; // ISO format YYYY-MM-DD
  varietyId: string;
  variety: string;
  category: Category;
  stock: number;
  remaining: number;
  sales: number;
  sellingPrice?: number;
  cost?: number;
}

export interface DailySummary {
  date: string;
  totalSales: number;
  totalStock: number;
  totalRemaining: number;
  categoryBreakdown: {
    category: Category;
    sales: number;
    stock: number;
    remaining: number;
  }[];
}

export interface PriceConfig {
  varietyId: string;
  variety: string;
  sellingPrice: number;
  cost: number;
}
