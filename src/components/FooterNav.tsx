import { Home as HomeIcon, BarChart3, Package, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";

export const FooterNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <footer className="fixed bottom-0 left-0 right-0 glass border-t border-border z-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-4 gap-2 py-2">
          <Button
            variant="ghost"
            className={`flex flex-col items-center gap-1 h-auto py-2 ${
              isActive("/") ? "text-primary" : ""
            }`}
            onClick={() => navigate("/")}
          >
            <HomeIcon className="w-5 h-5" />
            <span className="text-xs font-medium">Home</span>
          </Button>
          <Button
            variant="ghost"
            className={`flex flex-col items-center gap-1 h-auto py-2 ${
              isActive("/inventory") ? "text-primary" : ""
            }`}
            onClick={() => navigate("/inventory")}
          >
            <Package className="w-5 h-5" />
            <span className="text-xs">Inventory</span>
          </Button>
          <Button
            variant="ghost"
            className={`flex flex-col items-center gap-1 h-auto py-2 ${
              isActive("/analytics") ? "text-primary" : ""
            }`}
            onClick={() => navigate("/analytics")}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-xs">Analytics</span>
          </Button>
          <Button
            variant="ghost"
            className={`flex flex-col items-center gap-1 h-auto py-2 ${
              isActive("/admin") ? "text-primary" : ""
            }`}
            onClick={() => navigate("/admin")}
          >
            <Shield className="w-5 h-5" />
            <span className="text-xs">Admin</span>
          </Button>
        </div>
      </div>
    </footer>
  );
};
