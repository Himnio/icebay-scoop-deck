import { useState, useMemo, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Category, Order, OrderItem } from "@/lib/types";
import { Search, ShoppingCart, Home as HomeIcon, DollarSign, BarChart3, ClipboardList, X, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Variety {
  id: string;
  name: string;
  category: Category;
  stock: number;
  cost: number;
  selling_price: number;
}

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [unpaidOrders, setUnpaidOrders] = useState<Order[]>([]);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editingIsUnpaid, setEditingIsUnpaid] = useState(false);
  const [varieties, setVarieties] = useState<Variety[]>([]);
  const [loading, setLoading] = useState(true);

  const categories: Category[] = ["WATER BASE", "MILK BASE", "FAMILY PACK", "4L TUBS"];

  useEffect(() => {
    fetchVarieties();
    fetchOrders();
  }, []);

  const fetchVarieties = async () => {
    try {
      const { data, error } = await supabase
        .from("varieties")
        .select("*")
        .order("name");
      
      if (error) throw error;
      setVarieties((data as Variety[]) || []);
    } catch (error) {
      console.error("Error fetching varieties:", error);
      toast.error("Failed to load varieties");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (*)
        `)
        .order("timestamp", { ascending: false });
      
      if (error) throw error;
      
      const formattedOrders: Order[] = (data || []).map((order: any) => ({
        id: order.id,
        orderNumber: order.order_number,
        items: order.order_items.map((item: any) => ({
          varietyId: item.variety_id,
          variety: item.variety_name,
          category: item.category as Category,
          quantity: item.quantity,
          price: parseFloat(item.price),
          total: parseFloat(item.total),
        })),
        total: parseFloat(order.total),
        status: order.status as "paid" | "unpaid",
        timestamp: order.timestamp,
      }));
      
      setOrders(formattedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  // Filter varieties based on search and selected categories
  const filteredVarieties = useMemo(() => {
    let filtered = varieties;
    
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(v => selectedCategories.includes(v.category));
    }
    
    if (searchQuery) {
      filtered = filtered.filter(v => 
        v.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [searchQuery, selectedCategories, varieties]);

  const toggleCategory = (category: Category) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const addToCart = (variety: Variety) => {
    // Check if enough stock is available
    const currentInCart = cart.find(item => item.varietyId === variety.id)?.quantity || 0;
    if (variety.stock <= currentInCart) {
      toast.error(`Not enough stock for ${variety.name}`);
      return;
    }

    const existingItem = cart.find(item => item.varietyId === variety.id);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.varietyId === variety.id
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
          : item
      ));
    } else {
      const price = variety.selling_price;
      setCart([...cart, {
        varietyId: variety.id,
        variety: variety.name,
        category: variety.category,
        quantity: 1,
        price,
        total: price,
      }]);
    }
    toast.success(`${variety.name} added to cart`);
  };

  const updateQuantity = (varietyId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(varietyId);
      return;
    }

    // Check stock availability
    const variety = varieties.find(v => v.id === varietyId);
    if (variety && newQuantity > variety.stock) {
      toast.error(`Only ${variety.stock} units available`);
      return;
    }
    
    setCart(cart.map(item =>
      item.varietyId === varietyId
        ? { ...item, quantity: newQuantity, total: newQuantity * item.price }
        : item
    ));
  };

  const removeFromCart = (varietyId: string) => {
    setCart(cart.filter(item => item.varietyId !== varietyId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.total, 0);

  const createOrder = async (status: "paid" | "unpaid") => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    try {
      if (status === "paid") {
        // Check stock availability for all items
        for (const item of cart) {
          const variety = varieties.find(v => v.id === item.varietyId);
          if (!variety || variety.stock < item.quantity) {
            toast.error(`Not enough stock for ${item.variety}`);
            return;
          }
        }

        if (editingOrderId) {
          if (editingIsUnpaid) {
            // Remove from unpaid orders and save to database
            setUnpaidOrders(prev => prev.filter(o => o.id !== editingOrderId));
            
            // Get next order number
            const { data: maxOrderData } = await supabase
              .from("orders")
              .select("order_number")
              .order("order_number", { ascending: false })
              .limit(1)
              .single();

            const nextOrderNumber = maxOrderData ? maxOrderData.order_number + 1 : 1;

            // Create new order
            const { data: orderData, error: orderError } = await supabase
              .from("orders")
              .insert({
                order_number: nextOrderNumber,
                total: cartTotal,
                status,
              })
              .select()
              .single();

            if (orderError) throw orderError;

            // Insert order items
            const orderItems = cart.map(item => ({
              order_id: orderData.id,
              variety_id: item.varietyId,
              variety_name: item.variety,
              category: item.category,
              quantity: item.quantity,
              price: item.price,
              total: item.total,
            }));

            const { error: itemsError } = await supabase
              .from("order_items")
              .insert(orderItems);

            if (itemsError) throw itemsError;

            toast.success(`Order #${nextOrderNumber} saved and paid`);
          } else {
            // Update existing paid order
            const { error: updateError } = await supabase
              .from("orders")
              .update({ total: cartTotal, status })
              .eq("id", editingOrderId);

            if (updateError) throw updateError;

            // Delete old order items
            await supabase
              .from("order_items")
              .delete()
              .eq("order_id", editingOrderId);

            // Insert new order items
            const orderItems = cart.map(item => ({
              order_id: editingOrderId,
              variety_id: item.varietyId,
              variety_name: item.variety,
              category: item.category,
              quantity: item.quantity,
              price: item.price,
              total: item.total,
            }));

            const { error: itemsError } = await supabase
              .from("order_items")
              .insert(orderItems);

            if (itemsError) throw itemsError;

            toast.success("Order updated and paid");
          }

          // Update stock for all items
          for (const item of cart) {
            const variety = varieties.find(v => v.id === item.varietyId);
            if (variety) {
              await supabase
                .from("varieties")
                .update({ stock: variety.stock - item.quantity })
                .eq("id", item.varietyId);
            }
          }

          setEditingOrderId(null);
          setEditingIsUnpaid(false);
        } else {
          // Get next order number
          const { data: maxOrderData } = await supabase
            .from("orders")
            .select("order_number")
            .order("order_number", { ascending: false })
            .limit(1)
            .single();

          const nextOrderNumber = maxOrderData ? maxOrderData.order_number + 1 : 1;

          // Create new order
          const { data: orderData, error: orderError } = await supabase
            .from("orders")
            .insert({
              order_number: nextOrderNumber,
              total: cartTotal,
              status,
            })
            .select()
            .single();

          if (orderError) throw orderError;

          // Insert order items
          const orderItems = cart.map(item => ({
            order_id: orderData.id,
            variety_id: item.varietyId,
            variety_name: item.variety,
            category: item.category,
            quantity: item.quantity,
            price: item.price,
            total: item.total,
          }));

          const { error: itemsError } = await supabase
            .from("order_items")
            .insert(orderItems);

          if (itemsError) throw itemsError;

          // Update stock for all items
          for (const item of cart) {
            const variety = varieties.find(v => v.id === item.varietyId);
            if (variety) {
              await supabase
                .from("varieties")
                .update({ stock: variety.stock - item.quantity })
                .eq("id", item.varietyId);
            }
          }

          toast.success(`Order #${nextOrderNumber} completed`);
        }

        // Refresh data
        await fetchVarieties();
        await fetchOrders();
        setCart([]);
      } else {
        // Handle unpaid orders - store locally only
        if (editingOrderId && editingIsUnpaid) {
          // Update existing unpaid order
          setUnpaidOrders(prev => prev.map(o => 
            o.id === editingOrderId 
              ? { ...o, items: cart, total: cartTotal, timestamp: new Date().toISOString() }
              : o
          ));
          toast.success("Unpaid order updated");
        } else {
          // Create new unpaid order
          const nextOrderNumber = Math.max(
            ...orders.map(o => o.orderNumber),
            ...unpaidOrders.map(o => o.orderNumber),
            0
          ) + 1;
          
          const newUnpaidOrder: Order = {
            id: `unpaid-${Date.now()}`,
            orderNumber: nextOrderNumber,
            items: [...cart],
            total: cartTotal,
            status: "unpaid",
            timestamp: new Date().toISOString(),
          };
          
          setUnpaidOrders(prev => [newUnpaidOrder, ...prev]);
          toast.success(`Unpaid order #${nextOrderNumber} created`);
        }
        
        setCart([]);
        setEditingOrderId(null);
        setEditingIsUnpaid(false);
      }
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Failed to create order");
    }
  };

  const loadOrder = (order: Order) => {
    if (order.status === "paid") {
      toast.error("Paid orders cannot be edited");
      return;
    }
    setCart(order.items);
    setEditingOrderId(order.id);
    setEditingIsUnpaid(order.status === "unpaid");
    toast.success(`Order #${order.orderNumber} loaded for editing`);
  };

  const cancelEdit = () => {
    setEditingOrderId(null);
    setEditingIsUnpaid(false);
    setCart([]);
    toast.info("Edit cancelled");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="glass sticky top-0 z-10 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[hsl(var(--mint))] to-[hsl(var(--raspberry))] bg-clip-text text-transparent">
            ICE BAY POS
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Point of Sale System</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 pb-24">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Side - Item Selection */}
          <div className="lg:col-span-2 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search ice cream..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategories.includes(category) ? "default" : "outline"}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => toggleCategory(category)}
                >
                  {category}
                </Badge>
              ))}
              {selectedCategories.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCategories([])}
                  className="h-auto py-1 px-2 text-xs"
                >
                  Clear
                </Button>
              )}
            </div>

            {/* Item Grid */}
            <ScrollArea className="h-[calc(100vh-350px)]">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredVarieties.map((variety) => {
                  const isLowStock = variety.stock < 5;
                  return (
                    <button
                      key={variety.id}
                      onClick={() => addToCart(variety)}
                      className={`glass rounded-xl p-4 text-left hover:shadow-lg transition-all hover:scale-105 active:scale-95 border-2 ${
                        isLowStock 
                          ? "border-red-500 bg-red-50 dark:bg-red-950/20" 
                          : "border-transparent hover:border-primary"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-sm mb-1">{variety.name}</div>
                        <Package className={`w-4 h-4 ${isLowStock ? 'text-red-500' : 'text-[hsl(var(--mint))]'}`} />
                      </div>
                      <div className="text-xs text-muted-foreground mb-2">{variety.category}</div>
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-bold text-primary">₹{variety.selling_price}</div>
                        <div className={`text-xs ${isLowStock ? 'text-red-600 font-bold' : 'text-muted-foreground'}`}>
                          Stock: {variety.stock}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Right Side - Bill Panel */}
          <div className="lg:col-span-1">
            <div className="glass rounded-2xl p-5 shadow-[var(--shadow-card)] border-2 border-primary/20 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                  {editingOrderId ? "Edit Order" : "Current Bill"}
                </h2>
                {editingOrderId && (
                  <Button variant="ghost" size="sm" onClick={cancelEdit}>
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* Cart Items */}
              <ScrollArea className="h-[300px] mb-4">
                {cart.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">No items added</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.varietyId} className="glass-dark rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{item.variety}</div>
                            <div className="text-xs text-muted-foreground">{item.category}</div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.varietyId)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.varietyId, item.quantity - 1)}
                              className="h-7 w-7 p-0"
                            >
                              -
                            </Button>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.varietyId, parseInt(e.target.value) || 0)}
                              className="w-16 h-7 text-center"
                              min="0"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.varietyId, item.quantity + 1)}
                              className="h-7 w-7 p-0"
                            >
                              +
                            </Button>
                          </div>
                          <div className="font-bold">₹{item.total}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Total */}
              <div className="border-t border-border pt-4 mb-4">
                <div className="flex items-center justify-between text-2xl font-bold">
                  <span>Total</span>
                  <span className="text-primary">₹{cartTotal}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => createOrder("unpaid")}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  disabled={cart.length === 0}
                >
                  Unpaid
                </Button>
                <Button
                  onClick={() => createOrder("paid")}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={cart.length === 0}
                >
                  Paid
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Order History */}
        {(orders.length > 0 || unpaidOrders.length > 0) && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Order History</h2>
            <div className="space-y-2">
              {[...unpaidOrders, ...orders].map((order) => (
                <button
                  key={order.id}
                  onClick={() => loadOrder(order)}
                  disabled={order.status === "paid"}
                  className={`w-full glass rounded-xl p-4 text-left transition-all border-2 ${
                    order.status === "paid"
                      ? "opacity-60 cursor-not-allowed border-green-500/30"
                      : "hover:shadow-lg hover:border-primary cursor-pointer"
                  } ${editingOrderId === order.id ? "border-primary bg-primary/5" : "border-transparent"}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                        #{order.orderNumber}
                      </div>
                      <div>
                        <div className="font-medium">Order #{order.orderNumber}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(order.timestamp).toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {order.items.length} item(s)
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">₹{order.total}</div>
                      <Badge
                        variant={order.status === "paid" ? "default" : "destructive"}
                        className={order.status === "paid" ? "bg-green-600" : ""}
                      >
                        {order.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </button>
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