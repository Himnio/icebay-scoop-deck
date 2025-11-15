import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { LogOut, Plus, Pencil, Trash2, Search } from "lucide-react";
import { CategoryChip } from "@/components/CategoryChip";
import { FooterNav } from "@/components/FooterNav";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Category } from "@/lib/types";

interface Variety {
  id: string;
  name: string;
  category: Category;
  stock: number;
  cost: number;
  selling_price: number;
}

const Admin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [varieties, setVarieties] = useState<Variety[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVariety, setEditingVariety] = useState<Variety | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | "ALL">("ALL");
  const [formData, setFormData] = useState({
    name: "",
    category: "" as Category,
    stock: 0,
    cost: 0,
    selling_price: 0,
  });

  const categories: Category[] = ["WATER BASE", "MILK BASE", "FAMILY PACK", "4L TUBS"];

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    // Bypass authentication for all environments (development and production)
    // NOTE: For production authentication, uncomment the code below and remove the bypass
    
    console.warn('Bypassing authentication - Admin access is unrestricted');
    setIsAdmin(true);
    // setUser({ email: 'admin@icebay.test' });
    fetchVarieties();
    setLoading(false);

    /* 
    // PRODUCTION AUTHENTICATION FLOW (currently disabled)
    // Uncomment this section to enable authentication verification
    
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);

      // Check if user is admin
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .single();

      if (roleError || !roleData) {
        toast.error("Access denied. Admin privileges required.");
        navigate("/");
        return;
      }

      setIsAdmin(true);
      fetchVarieties();
    } catch (error) {
      console.error("Auth error:", error);
      navigate("/auth");
    } finally {
      setLoading(false);
    }
    */
  };

  const fetchVarieties = async () => {
    try {
      const { data, error } = await supabase
        .from("varieties")
        .select("*")
        .order("category", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw error;
      setVarieties((data as Variety[]) || []);
    } catch (error: any) {
      toast.error("Failed to fetch varieties");
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingVariety) {
        const { error } = await supabase
          .from("varieties")
          .update({
            name: formData.name,
            category: formData.category,
            stock: formData.stock,
            cost: formData.cost,
            selling_price: formData.selling_price,
          })
          .eq("id", editingVariety.id);

        if (error) throw error;
        toast.success("Variety updated successfully");
      } else {
        const { error } = await supabase.from("varieties").insert([
          {
            name: formData.name,
            category: formData.category,
            stock: formData.stock,
            cost: formData.cost,
            selling_price: formData.selling_price,
          },
        ]);

        if (error) throw error;
        toast.success("Variety added successfully");
      }

      setDialogOpen(false);
      resetForm();
      fetchVarieties();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleEdit = (variety: Variety) => {
    setEditingVariety(variety);
    setFormData({
      name: variety.name,
      category: variety.category,
      stock: variety.stock,
      cost: variety.cost,
      selling_price: variety.selling_price,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this variety?")) return;

    try {
      const { error } = await supabase.from("varieties").delete().eq("id", id);

      if (error) throw error;
      toast.success("Variety deleted successfully");
      fetchVarieties();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const resetForm = () => {
    setEditingVariety(null);
    setFormData({
      name: "",
      category: "" as Category,
      stock: 0,
      cost: 0,
      selling_price: 0,
    });
  };

  const filteredVarieties = varieties.filter((variety) => {
    const matchesSearch = variety.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "ALL" || variety.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🍦</div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="glass sticky top-0 z-10 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[hsl(var(--mint))] to-[hsl(var(--raspberry))] bg-clip-text text-transparent">
                ADMIN PANEL
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {user?.email}
              </p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="w-5 h-5 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Manage Varieties ({filteredVarieties.length})</h2>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-5 h-5 mr-2" />
                Add Variety
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingVariety ? "Edit Variety" : "Add New Variety"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Vanilla"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: Category) =>
                      setFormData({ ...formData, category: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Stock Quantity</label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Cost Price (₹)</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) =>
                      setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Selling Price (₹)</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.selling_price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        selling_price: parseFloat(e.target.value) || 0,
                      })
                    }
                    required
                  />
                </div>

                {formData.cost > 0 && formData.selling_price > 0 && (
                  <div className="p-4 rounded-lg bg-muted">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Profit Margin:</span>
                      <span className="text-lg font-bold text-[hsl(var(--mint))]">
                        ₹{(formData.selling_price - formData.cost).toFixed(2)} (
                        {(
                          ((formData.selling_price - formData.cost) / formData.cost) *
                          100
                        ).toFixed(1)}
                        %)
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingVariety ? "Update" : "Add"} Variety
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filter Section */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search varieties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <CategoryChip
              category="ALL"
              active={selectedCategory === "ALL"}
              onClick={() => setSelectedCategory("ALL")}
            />
            {categories.map((category) => (
              <CategoryChip
                key={category}
                category={category}
                active={selectedCategory === category}
                onClick={() => setSelectedCategory(category)}
              />
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          {filteredVarieties.map((variety) => {
            const profit = variety.selling_price - variety.cost;
            const profitMargin = variety.cost > 0 ? (profit / variety.cost) * 100 : 0;

            return (
              <Card key={variety.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{variety.name}</h3>
                    <p className="text-sm text-muted-foreground">{variety.category}</p>
                    <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Stock</p>
                        <p className="font-semibold">{variety.stock}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Cost</p>
                        <p className="font-semibold">₹{variety.cost}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Selling Price</p>
                        <p className="font-semibold">₹{variety.selling_price}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Profit Margin</p>
                        <p className="font-semibold text-[hsl(var(--mint))]">
                          ₹{profit.toFixed(2)} ({profitMargin.toFixed(1)}%)
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleEdit(variety)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleDelete(variety.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <FooterNav />
    </div>
  );
};

export default Admin;
