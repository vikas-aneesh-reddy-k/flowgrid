import { Package, AlertTriangle, TrendingDown, CheckCircle } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";

export function InventoryStatus() {
  const { data: productsData, isLoading } = useProducts();
  const products = productsData?.data || [];

  // Calculate inventory statistics
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.status === 'active').length;
  const lowStockProducts = products.filter(p => p.status === 'low_stock').length;
  const outOfStockProducts = products.filter(p => p.status === 'out_of_stock').length;
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);

  const inventoryItems = [
    {
      name: "In Stock",
      stock: totalProducts > 0 ? Math.round((activeProducts / totalProducts) * 100) : 0,
      status: "optimal",
      items: activeProducts,
      trend: `${activeProducts} items`,
    },
    {
      name: "Low Stock",
      stock: totalProducts > 0 ? Math.round((lowStockProducts / totalProducts) * 100) : 0,
      status: "low",
      items: lowStockProducts,
      trend: `${lowStockProducts} items`,
    },
    {
      name: "Out of Stock",
      stock: totalProducts > 0 ? Math.round((outOfStockProducts / totalProducts) * 100) : 0,
      status: "critical",
      items: outOfStockProducts,
      trend: `${outOfStockProducts} items`,
    },
    {
      name: "Total Value",
      stock: 100,
      status: "normal",
      items: totalProducts,
      trend: `$${totalValue.toLocaleString()}`,
    },
  ];

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg p-6 shadow-card">
        <h3 className="text-lg font-semibold text-card-foreground mb-4">Inventory Status</h3>
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      </div>
    );
  }
  const getStatusColor = (status: string) => {
    switch (status) {
      case "optimal":
        return "text-success";
      case "normal":
        return "text-info";
      case "low":
        return "text-warning";
      case "critical":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "optimal":
        return CheckCircle;
      case "normal":
        return Package;
      case "low":
        return TrendingDown;
      case "critical":
        return AlertTriangle;
      default:
        return Package;
    }
  };

  const getProgressColor = (stock: number) => {
    if (stock >= 70) return "bg-success";
    if (stock >= 40) return "bg-info";
    if (stock >= 20) return "bg-warning";
    return "bg-destructive";
  };

  return (
    <div className="bg-card rounded-lg p-6 shadow-card">
      <h3 className="text-lg font-semibold text-card-foreground mb-4">Inventory Status</h3>
      <div className="space-y-4">
        {inventoryItems.map((item) => {
          const Icon = getStatusIcon(item.status);
          return (
            <div key={item.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${getStatusColor(item.status)}`} />
                  <span className="text-sm font-medium text-card-foreground">{item.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{item.items} items</span>
                  <span className={`text-xs font-medium ${item.trend.startsWith('+') ? 'text-success' : 'text-destructive'}`}>
                    {item.trend}
                  </span>
                </div>
              </div>
              <div className="relative">
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-base ${getProgressColor(item.stock)}`}
                    style={{ width: `${item.stock}%` }}
                  />
                </div>
                <span className="absolute right-0 -top-5 text-xs text-muted-foreground">
                  {item.stock}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}