import { FileText, Package, Users, DollarSign, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOrders } from "@/hooks/useOrders";
import { useProducts } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

export function RecentActivity() {
  const { data: ordersData, isLoading: ordersLoading } = useOrders();
  const { data: productsData, isLoading: productsLoading } = useProducts();

  const orders = ordersData?.data || [];
  const products = productsData?.data || [];

  // Get recent orders (last 3)
  const recentOrders = orders.slice(0, 3);
  
  // Get low stock products (last 2)
  const lowStockProducts = products.filter(p => p.status === 'low_stock' || p.status === 'out_of_stock').slice(0, 2);

  // Build activities array from real data
  const activities = [
    ...recentOrders.map(order => ({
      id: order._id,
      type: "order",
      message: `Order ${order.orderNumber} - ${order.customerName}`,
      user: order.createdByName || "System",
      time: formatDistanceToNow(new Date(order.orderDate), { addSuffix: true }),
      icon: ShoppingCart,
      color: order.status === 'completed' ? "bg-success" : "bg-primary",
    })),
    ...lowStockProducts.map(product => ({
      id: product._id,
      type: "inventory",
      message: `${product.status === 'out_of_stock' ? 'Out of stock' : 'Low stock'}: ${product.name}`,
      user: "System",
      time: "Stock alert",
      icon: Package,
      color: product.status === 'out_of_stock' ? "bg-destructive" : "bg-warning",
    })),
  ].slice(0, 5);

  if (ordersLoading || productsLoading) {
    return (
      <div className="bg-card rounded-lg p-6 shadow-card">
        <h3 className="text-lg font-semibold text-card-foreground mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="bg-card rounded-lg p-6 shadow-card">
        <h3 className="text-lg font-semibold text-card-foreground mb-4">Recent Activity</h3>
        <p className="text-center text-muted-foreground py-8">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg p-6 shadow-card">
      <h3 className="text-lg font-semibold text-card-foreground mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", activity.color)}>
              <activity.icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-card-foreground">{activity.message}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">{activity.user}</span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button className="w-full mt-4 text-sm text-primary hover:text-primary-hover transition-colors duration-fast">
        View all activity →
      </button>
    </div>
  );
}