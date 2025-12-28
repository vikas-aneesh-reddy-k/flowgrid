import { TrendingUp, Download, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useDashboardStats, useAnalytics } from "@/hooks/useDashboard";
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";

const COLORS = {
  Engineering: 'hsl(217, 89%, 45%)',
  Sales: 'hsl(158, 64%, 42%)',
  Marketing: 'hsl(43, 96%, 56%)',
  Operations: 'hsl(199, 89%, 48%)',
  HR: 'hsl(280, 65%, 60%)',
  Finance: 'hsl(25, 95%, 53%)',
};

export default function Analytics() {
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year' | 'custom'>('month');
  const [showCustomDialog, setShowCustomDialog] = useState(false);
  const [customDates, setCustomDates] = useState({
    startDate: '',
    endDate: '',
  });

  const getDateParams = () => {
    const now = new Date();
    let startDate: Date;
    
    switch (dateRange) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'custom':
        if (customDates.startDate && customDates.endDate) {
          return {
            startDate: customDates.startDate,
            endDate: customDates.endDate,
          };
        }
        return undefined;
      default: // month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0],
    };
  };

  const { data: dashboardData, isLoading: dashboardLoading } = useDashboardStats();
  const { data: analyticsData, isLoading: analyticsLoading } = useAnalytics(getDateParams());

  const handleCustomDateApply = () => {
    if (!customDates.startDate || !customDates.endDate) {
      toast.error('Please select both start and end dates');
      return;
    }
    if (new Date(customDates.startDate) > new Date(customDates.endDate)) {
      toast.error('Start date must be before end date');
      return;
    }
    setDateRange('custom');
    setShowCustomDialog(false);
  };

  const handleExportReport = () => {
    try {
      // Create CSV content
      let csvContent = 'Analytics Report\n';
      csvContent += `Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}\n`;
      csvContent += `Date Range: ${dateRange === 'custom' ? `${customDates.startDate} to ${customDates.endDate}` : dateRange}\n\n`;
      
      // Metrics section
      csvContent += 'Key Metrics\n';
      csvContent += 'Metric,Value\n';
      csvContent += `Total Revenue,$${totalRevenue.toFixed(2)}\n`;
      csvContent += `Revenue Change,${revenueChange.toFixed(1)}%\n`;
      csvContent += `Active Orders,${activeOrders}\n`;
      csvContent += `Inventory Value,$${inventoryValue.toFixed(2)}\n`;
      csvContent += `Average Order Value,$${avgOrderValue.toFixed(2)}\n\n`;
      
      // Top Products
      if (topProducts.length > 0) {
        csvContent += 'Top Products\n';
        csvContent += 'Product Name,Quantity,Revenue\n';
        topProducts.forEach((product: any) => {
          csvContent += `"${product.productName || 'Unknown'}",${product.totalQuantity},$${product.totalRevenue.toFixed(2)}\n`;
        });
        csvContent += '\n';
      }
      
      // Orders by Status
      if (ordersByStatus.length > 0) {
        csvContent += 'Orders by Status\n';
        csvContent += 'Status,Count,Total Value\n';
        ordersByStatus.forEach((status: any) => {
          csvContent += `${status._id},${status.count},$${status.total.toFixed(2)}\n`;
        });
        csvContent += '\n';
      }
      
      // Department Distribution
      if (departmentData.length > 0) {
        csvContent += 'Department Distribution\n';
        csvContent += 'Department,Employee Count,Percentage\n';
        departmentData.forEach((dept: any) => {
          csvContent += `${dept.name},${dept.value},${((dept.value / totalDeptCount) * 100).toFixed(1)}%\n`;
        });
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Report exported successfully');
    } catch (error) {
      toast.error('Failed to export report');
    }
  };
  const metrics = dashboardData?.data?.metrics;
  const analytics = analyticsData?.data;
  const monthlyRevenue = dashboardData?.data?.monthlyRevenue || [];

  // Process monthly revenue data for chart
  const salesData = monthlyRevenue.map((item: any) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return {
      month: monthNames[item._id.month - 1],
      sales: item.revenue,
      target: item.revenue * 0.9, // Target is 90% of actual for demo
    };
  });

  // Process department data for pie chart
  const departmentData = (analytics?.departmentStats || []).map((dept: any) => ({
    name: dept._id,
    value: dept.count,
    color: COLORS[dept._id as keyof typeof COLORS] || 'hsl(200, 70%, 50%)',
  }));

  const totalDeptCount = departmentData.reduce((sum: number, d: any) => sum + d.value, 0);

  // Calculate KPIs from real data
  const totalRevenue = metrics?.totalRevenue?.value || 0;
  const activeOrders = metrics?.activeOrders?.value || 0;
  const inventoryValue = metrics?.inventoryValue?.value || 0;
  const revenueChange = metrics?.totalRevenue?.change || 0;

  // Calculate additional metrics
  const avgOrderValue = activeOrders > 0 ? totalRevenue / activeOrders : 0;
  const topProducts = analytics?.topProducts || [];
  const ordersByStatus = analytics?.ordersByStatus || [];

  if (dashboardLoading || analyticsLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics & Reports</h1>
          <p className="text-muted-foreground">Business intelligence and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => setShowCustomDialog(true)}>
            <Calendar className="w-4 h-4 mr-2" />
            Custom Range
          </Button>
          <Button onClick={handleExportReport}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalRevenue / 1000).toFixed(1)}K</div>
            <p className={`text-xs ${revenueChange >= 0 ? 'text-success' : 'text-destructive'}`}>
              {revenueChange >= 0 ? '+' : ''}{revenueChange.toFixed(1)}% vs last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeOrders}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(inventoryValue / 1000).toFixed(1)}K</div>
            <p className="text-xs text-muted-foreground">Current stock value</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${avgOrderValue.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">Per order</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sales Performance</CardTitle>
            <CardDescription>Revenue trend over time</CardDescription>
          </CardHeader>
          <CardContent>
            {salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(217, 89%, 45%)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(217, 89%, 45%)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(158, 64%, 42%)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(158, 64%, 42%)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="hsl(217, 89%, 45%)" 
                    strokeWidth={2}
                    fill="url(#colorSales)"
                    name="Sales"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="target" 
                    stroke="hsl(158, 64%, 42%)" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    fill="url(#colorTarget)"
                    name="Target"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No sales data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Department Distribution</CardTitle>
            <CardDescription>Employee allocation by department</CardDescription>
          </CardHeader>
          <CardContent>
            {departmentData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${((value / totalDeptCount) * 100).toFixed(0)}%`}
                  >
                    {departmentData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No department data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Products</CardTitle>
          <CardDescription>Best performing products by revenue</CardDescription>
        </CardHeader>
        <CardContent>
          {topProducts.length > 0 ? (
            <div className="space-y-4">
              {topProducts.slice(0, 5).map((product: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{product.productName || 'Unknown Product'}</p>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {product.totalQuantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${product.totalRevenue.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">No product data available</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Orders by Status</CardTitle>
          <CardDescription>Current order distribution</CardDescription>
        </CardHeader>
        <CardContent>
          {ordersByStatus.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {ordersByStatus.map((status: any) => (
                <div key={status._id} className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium capitalize">{status._id}</p>
                  <p className="text-2xl font-bold mt-1">{status.count}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    ${status.total.toFixed(0)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">No order data available</p>
          )}
        </CardContent>
      </Card>

      {/* Custom Date Range Dialog */}
      <Dialog open={showCustomDialog} onOpenChange={setShowCustomDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Custom Date Range</DialogTitle>
            <DialogDescription>
              Select a custom date range for analytics
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={customDates.startDate}
                onChange={(e) => setCustomDates({ ...customDates, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={customDates.endDate}
                onChange={(e) => setCustomDates({ ...customDates, endDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowCustomDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCustomDateApply}>
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}