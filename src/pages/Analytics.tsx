import { useState, useEffect } from "react";
import { ArrowLeft, TrendingUp, DollarSign, ShoppingCart, Percent } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const [metrics, setMetrics] = useState({
    totalSales: 0,
    totalProfit: 0,
    totalOrders: 0,
    profitMargin: 0,
  });

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
      
      let totalSales = 0;
      let totalProfit = 0;
      const totalOrders = orders?.length || 0;

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
        
        totalSales += orderTotal;
        totalProfit += orderProfit;

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
      
      const profitMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;

      setDailyData(processedDailyData);
      setCategoryData(processedCategoryData);
      setMetrics({
        totalSales: Math.round(totalSales),
        totalProfit: Math.round(totalProfit),
        totalOrders,
        profitMargin: Math.round(profitMargin),
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

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
              <h1 className="text-xl font-bold">Analytics Dashboard</h1>
              <p className="text-sm text-muted-foreground">Last 7 days performance</p>
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
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-mint/20 to-mint/5 border-mint/20">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Sales
                  </CardTitle>
                  <DollarSign className="h-5 w-5 text-mint" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{metrics.totalSales.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    From {metrics.totalOrders} orders
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-raspberry/20 to-raspberry/5 border-raspberry/20">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Profit
                  </CardTitle>
                  <TrendingUp className="h-5 w-5 text-raspberry" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{metrics.totalProfit.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {metrics.profitMargin}% margin
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-mango/20 to-mango/5 border-mango/20">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Orders
                  </CardTitle>
                  <ShoppingCart className="h-5 w-5 text-mango" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.totalOrders}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Completed transactions
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Profit Margin
                  </CardTitle>
                  <Percent className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.profitMargin}%</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Average profit rate
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Daily Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Performance</CardTitle>
              </CardHeader>
              <CardContent>
                {dailyData.length > 0 && dailyData.some(d => d.sales > 0) ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
                      <XAxis
                        dataKey="date"
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="sales"
                        stroke="hsl(var(--mint))"
                        strokeWidth={3}
                        name="Sales (₹)"
                        dot={{ fill: "hsl(var(--mint))", r: 5 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="profit"
                        stroke="hsl(var(--raspberry))"
                        strokeWidth={3}
                        name="Profit (₹)"
                        dot={{ fill: "hsl(var(--raspberry))", r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No sales data available for the last 7 days</p>
                )}
              </CardContent>
            </Card>

            {/* Category Share */}
            <Card>
              <CardHeader>
                <CardTitle>Category Sales Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {categoryData.length > 0 ? (
                  <div className="space-y-4">
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
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    
                    {/* Category Legend */}
                    <div className="grid grid-cols-2 gap-2">
                      {categoryData.map((cat, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{cat.name}</p>
                            <p className="text-xs text-muted-foreground">₹{cat.value.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No category data available</p>
                )}
              </CardContent>
            </Card>

            {/* Weekly Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Sales Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                {dailyData.length > 0 && dailyData.some(d => d.sales > 0) ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
                      <XAxis
                        dataKey="date"
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Bar 
                        dataKey="sales" 
                        fill="hsl(var(--mint))" 
                        name="Sales (₹)" 
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No comparison data available</p>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics;