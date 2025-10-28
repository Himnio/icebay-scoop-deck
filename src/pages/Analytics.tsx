import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface DailyData {
  date: string;
  sales: number;
  profit: number;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

const Analytics = () => {
  const navigate = useNavigate();
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      // Fetch orders from the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: orders, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (*)
        `)
        .eq("status", "paid")
        .gte("timestamp", sevenDaysAgo.toISOString())
        .order("timestamp", { ascending: true });

      if (error) throw error;

      // Process daily data
      const dailyMap = new Map<string, { sales: number; profit: number }>();
      const categoryMap = new Map<string, number>();

      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      for (const order of orders || []) {
        const date = new Date(order.timestamp);
        const dayName = days[date.getDay()];
        
        const current = dailyMap.get(dayName) || { sales: 0, profit: 0 };
        const orderTotal = typeof order.total === 'string' ? parseFloat(order.total) : order.total;
        
        // Calculate profit (assuming 40% margin as example)
        let orderProfit = 0;
        for (const item of order.order_items) {
          const itemPrice = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
          const itemCost = itemPrice * 0.6; // Assuming cost is 60% of selling price
          orderProfit += (itemPrice - itemCost) * item.quantity;
        }
        
        dailyMap.set(dayName, {
          sales: current.sales + orderTotal,
          profit: current.profit + orderProfit,
        });

        // Process category data
        for (const item of order.order_items) {
          const currentCat = categoryMap.get(item.category) || 0;
          const itemTotal = typeof item.total === 'string' ? parseFloat(item.total) : item.total;
          categoryMap.set(item.category, currentCat + itemTotal);
        }
      }

      // Convert to array format for charts
      const processedDailyData: DailyData[] = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const dayName = days[date.getDay()];
        const data = dailyMap.get(dayName) || { sales: 0, profit: 0 };
        processedDailyData.push({
          date: dayName,
          sales: Math.round(data.sales),
          profit: Math.round(data.profit),
        });
      }

      const colors = [
        "hsl(var(--chart-1))",
        "hsl(var(--chart-2))",
        "hsl(var(--chart-3))",
        "hsl(var(--chart-4))",
      ];

      const processedCategoryData: CategoryData[] = Array.from(categoryMap.entries()).map(
        ([name, value], index) => ({
          name,
          value: Math.round(value),
          color: colors[index % colors.length],
        })
      );

      setDailyData(processedDailyData);
      setCategoryData(processedCategoryData);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const COLORS = categoryData.map(cat => cat.color);

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
        {loading ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4 animate-bounce">📊</div>
            <p className="text-lg font-medium">Loading analytics...</p>
          </div>
        ) : (
          <>
            {/* Daily Performance */}
            <div className="glass rounded-xl p-6 shadow-[var(--shadow-card)]">
              <h2 className="text-xl font-bold mb-4">Daily Performance (Last 7 Days)</h2>
              {dailyData.length > 0 && dailyData.some(d => d.sales > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="date"
                      stroke="hsl(var(--foreground))"
                      tick={{ fill: "hsl(var(--foreground))" }}
                    />
                    <YAxis
                      stroke="hsl(var(--foreground))"
                      tick={{ fill: "hsl(var(--foreground))" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke="hsl(var(--mint))"
                      strokeWidth={2}
                      name="Sales (₹)"
                    />
                    <Line
                      type="monotone"
                      dataKey="profit"
                      stroke="hsl(var(--raspberry))"
                      strokeWidth={2}
                      name="Profit (₹)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center py-8 text-muted-foreground">No sales data available for the last 7 days</p>
              )}
            </div>

            {/* Category Share */}
            <div className="glass rounded-xl p-6 shadow-[var(--shadow-card)]">
              <h2 className="text-xl font-bold mb-4">Category Sales (Last 7 Days)</h2>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center py-8 text-muted-foreground">No category data available</p>
              )}
            </div>

            {/* Weekly Comparison */}
            <div className="glass rounded-xl p-6 shadow-[var(--shadow-card)]">
              <h2 className="text-xl font-bold mb-4">Weekly Comparison</h2>
              {dailyData.length > 0 && dailyData.some(d => d.sales > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="date"
                      stroke="hsl(var(--foreground))"
                      tick={{ fill: "hsl(var(--foreground))" }}
                    />
                    <YAxis
                      stroke="hsl(var(--foreground))"
                      tick={{ fill: "hsl(var(--foreground))" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="sales" fill="hsl(var(--mint))" name="Sales (₹)" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center py-8 text-muted-foreground">No comparison data available</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics;