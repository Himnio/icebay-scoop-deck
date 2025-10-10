import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getLastNDays, mockDailyRecords } from "@/lib/mockData";
import { Category } from "@/lib/types";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Analytics = () => {
  const navigate = useNavigate();
  const last7Days = getLastNDays(7).reverse();

  // Prepare daily sales data
  const dailySalesData = last7Days.map((date) => {
    const dayRecords = mockDailyRecords.filter((r) => r.date === date);
    const totalSales = dayRecords.reduce((sum, r) => sum + r.sales, 0);
    const totalProfit = dayRecords.reduce((sum, r) => {
      const profit = (r.sellingPrice || 0) - (r.cost || 0);
      return sum + profit * r.sales;
    }, 0);

    return {
      date: new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
      sales: totalSales,
      profit: Math.round(totalProfit),
    };
  });

  // Category breakdown
  const categories: Category[] = ["WATER BASE", "MILK BASE", "FAMILY PACK", "4L TUBS"];
  const categoryColors = {
    "WATER BASE": "hsl(145, 50%, 75%)",
    "MILK BASE": "hsl(330, 100%, 85%)",
    "FAMILY PACK": "hsl(43, 100%, 80%)",
    "4L TUBS": "hsl(42, 100%, 94%)",
  };

  const todayRecords = mockDailyRecords.filter(
    (r) => r.date === new Date().toISOString().split("T")[0]
  );

  const categoryData = categories.map((category) => {
    const categoryRecords = todayRecords.filter((r) => r.category === category);
    const sales = categoryRecords.reduce((sum, r) => sum + r.sales, 0);
    return {
      name: category,
      value: sales,
      color: categoryColors[category],
    };
  }).filter((c) => c.value > 0);

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
              <h1 className="text-xl font-bold">Analytics</h1>
              <p className="text-sm text-muted-foreground">Last 7 days</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Daily Sales & Profit Chart */}
        <div className="glass rounded-2xl p-5 shadow-[var(--shadow-card)]">
          <h2 className="text-lg font-semibold mb-4">Daily Performance</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dailySalesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="hsl(var(--raspberry))"
                strokeWidth={2}
                name="Sales (boxes)"
              />
              <Line
                type="monotone"
                dataKey="profit"
                stroke="hsl(var(--mint))"
                strokeWidth={2}
                name="Profit (₹)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Share */}
        <div className="glass rounded-2xl p-5 shadow-[var(--shadow-card)]">
          <h2 className="text-lg font-semibold mb-4">Category Share (Today)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Comparison */}
        <div className="glass rounded-2xl p-5 shadow-[var(--shadow-card)]">
          <h2 className="text-lg font-semibold mb-4">Weekly Comparison</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dailySalesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem",
                }}
              />
              <Legend />
              <Bar dataKey="sales" fill="hsl(var(--raspberry))" name="Sales" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
