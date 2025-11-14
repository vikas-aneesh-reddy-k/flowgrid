import { DollarSign, Package, Users, ShoppingCart, TrendingUp, AlertTriangle } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { InventoryStatus } from "@/components/dashboard/InventoryStatus";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { useDashboardStats } from "@/hooks/useDashboard";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: dashboardData, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const stats = dashboardData?.data || {};
  const metrics = stats.metrics || {};
  const lowStockItems = stats.lowStockItems || [];

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening with your business today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Revenue"
          value={metrics.totalRevenue?.value || 0}
          prefix="$"
          change={metrics.totalRevenue?.change || 0}
          changeLabel="vs last month"
          icon={DollarSign}
          iconColor="bg-gradient-primary"
        />
        <MetricCard
          title="Active Orders"
          value={metrics.activeOrders?.value || 0}
          change={0}
          changeLabel="in progress"
          icon={ShoppingCart}
          iconColor="bg-gradient-success"
        />
        <MetricCard
          title="Inventory Value"
          value={metrics.inventoryValue?.value || 0}
          prefix="$"
          change={lowStockItems.length}
          changeLabel="low stock items"
          icon={Package}
          iconColor="bg-gradient-info"
        />
        <MetricCard
          title="Total Employees"
          value={metrics.totalEmployees?.value || 0}
          change={0}
          changeLabel="active employees"
          icon={Users}
          iconColor="bg-warning"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart - Takes 2 columns */}
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        
        {/* Quick Actions - Takes 1 column */}
        <div>
          <QuickActions />
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InventoryStatus />
        <RecentActivity />
      </div>

      {/* Alert Banner */}
      <div className="bg-warning-light border border-warning/20 rounded-lg p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
        <div className="flex-1">
          <h4 className="font-medium text-foreground">System Maintenance Scheduled</h4>
          <p className="text-sm text-muted-foreground mt-1">
            The system will undergo maintenance on Sunday, Dec 24th from 2:00 AM to 4:00 AM EST. 
            Please save your work before this time.
          </p>
        </div>
      </div>
    </div>
  );
}