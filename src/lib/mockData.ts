import { Variety, DailyRecord, Category } from "./types";

// Parse arithmetic expressions like "5+7+5+8(25)" to extract the total (25)
export const parseArithmetic = (value: string | number): number => {
  if (typeof value === "number") return value;
  if (!value || value === "NA") return 0;
  
  const str = String(value).trim();
  
  // Check for parentheses total like "5+7(12)"
  const parenMatch = str.match(/\((\d+)\)/);
  if (parenMatch) {
    return parseInt(parenMatch[1], 10);
  }
  
  // Try to evaluate arithmetic if no parentheses
  try {
    const cleanStr = str.replace(/[^0-9+\-*/().]/g, "");
    return eval(cleanStr) || 0;
  } catch {
    return 0;
  }
};

// Varieties from the Excel data
const waterBaseVarieties = [
  "Blueberry", "Butterscotch", "Grape", "Green Apple", "Green Mango",
  "Litchi", "Mango", "Nellika", "Orange", "Passion Fruit",
  "Pineapple", "Pink Guva", "Rasamalai", "Watermelon"
];

const milkBaseVarieties = [
  "Avocado", "Banana", "Banofee", "Biriyani", "Blueberry", "Bounty",
  "Bubblegum", "Cherry", "Chocolate", "Coffee", "Dates & Nuts",
  "Delight", "Fig & Honey", "Gulab Jamun", "Guava Chilli", "Jack Fruit",
  "Kitkat", "Laddu", "Lotus", "Malai Kulfi", "Mango", "Munch",
  "Jaggary payasam", "Oreo", "Palada", "Payasam", "Pista",
  "Salted Caramel", "Shamam", "Sitafal", "Snickers", "Strawberry",
  "Tender Coconut", "Tutti Fruity", "Vanilla"
];

const familyPackVarieties = [
  "Avocado - 500ml", "Chikku - 500ml", "Chocolate - 500ml", "Delight - 500ml"
];

const tubsVarieties = [
  "Chocolate - 4 L", "Mango - 4 L", "Vanilla - 4 L"
];

export const varieties: Variety[] = [
  ...waterBaseVarieties.map((name, i) => ({
    id: `wb-${i}`,
    name,
    category: "WATER BASE" as Category,
  })),
  ...milkBaseVarieties.map((name, i) => ({
    id: `mb-${i}`,
    name,
    category: "MILK BASE" as Category,
  })),
  ...familyPackVarieties.map((name, i) => ({
    id: `fp-${i}`,
    name,
    category: "FAMILY PACK" as Category,
  })),
  ...tubsVarieties.map((name, i) => ({
    id: `tb-${i}`,
    name,
    category: "4L TUBS" as Category,
  })),
];

// Generate mock daily records for the last 7 days
const generateMockData = (): DailyRecord[] => {
  const records: DailyRecord[] = [];
  const today = new Date();
  
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const date = new Date(today);
    date.setDate(date.getDate() - dayOffset);
    const dateStr = date.toISOString().split("T")[0];
    
    varieties.forEach((variety) => {
      const stock = Math.floor(Math.random() * 15) + 5;
      const sales = Math.floor(Math.random() * 8);
      const remaining = Math.max(0, stock - sales);
      
      records.push({
        id: `${dateStr}-${variety.id}`,
        date: dateStr,
        varietyId: variety.id,
        variety: variety.name,
        category: variety.category,
        stock,
        remaining,
        sales,
        sellingPrice: 60,
        cost: 40,
      });
    });
  }
  
  return records;
};

export const mockDailyRecords = generateMockData();

// Helper to get today's records
export const getTodayRecords = (): DailyRecord[] => {
  const today = new Date().toISOString().split("T")[0];
  return mockDailyRecords.filter((r) => r.date === today);
};

// Helper to get records by date
export const getRecordsByDate = (date: string): DailyRecord[] => {
  return mockDailyRecords.filter((r) => r.date === date);
};

// Helper to get last N days
export const getLastNDays = (n: number): string[] => {
  const dates: string[] = [];
  const today = new Date();
  
  for (let i = 0; i < n; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split("T")[0]);
  }
  
  return dates;
};
