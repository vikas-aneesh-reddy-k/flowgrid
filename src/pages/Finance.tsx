import { DollarSign, FileText, TrendingUp, Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrders, useCreateOrder } from "@/hooks/useOrders";
import { useEmployees } from "@/hooks/useEmployees";
import { useCustomers } from "@/hooks/useCustomers";
import { useProducts } from "@/hooks/useProducts";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Finance() {
  const [showNewInvoiceDialog, setShowNewInvoiceDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [dueDate, setDueDate] = useState("");
  
  const { data: ordersData, isLoading: ordersLoading } = useOrders();
  const { data: employeesData, isLoading: employeesLoading } = useEmployees();
  const { data: customersData } = useCustomers();
  const { data: productsData } = useProducts();
  const createOrder = useCreateOrder();

  const orders = ordersData?.data || [];
  const employees = employeesData?.data || [];
  const customers = customersData?.data || [];
  const products = productsData?.data || [];

  const handleNewInvoice = () => {
    setShowNewInvoiceDialog(true);
    toast.info("New Invoice", {
      description: "Invoice creation form opening...",
    });
  };

  const handleCreateInvoice = async () => {
    if (!selectedCustomer || !selectedProduct || !dueDate) {
      toast.error("Missing Information", {
        description: "Please fill in all required fields.",
      });
      return;
    }

    const customer = customers.find(c => c._id === selectedCustomer);
    const product = products.find(p => p._id === selectedProduct);

    if (!customer || !product) {
      toast.error("Invalid Selection", {
        description: "Please select valid customer and product.",
      });
      return;
    }

    // Create an order which automatically creates an invoice
    const orderData = {
      customerId: customer._id,
      orderItems: [{
        productId: product._id,
        quantity: quantity,
      }],
      shippingAddress: customer.address || {
        street: "N/A",
        city: "N/A",
        state: "N/A",
        zipCode: "N/A",
      },
    };

    createOrder.mutate(orderData, {
      onSuccess: (data) => {
        // The useCreateOrder hook already invalidates queries and shows a toast
        // Just close the dialog and reset the form
        setShowNewInvoiceDialog(false);
        setSelectedCustomer("");
        setSelectedProduct("");
        setQuantity(1);
        setDueDate("");
      },
      onError: (error: any) => {
        // Error toast is already handled by the hook
        console.error("Failed to create invoice:", error);
      },
    });
  };

  const handleExport = () => {
    toast.success("Export Started", {
      description: "Downloading financial data...",
    });
  };

  // Calculate financial metrics
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const pendingInvoices = orders.filter(order => 
    order.invoice?.status === 'pending'
  );
  const paidInvoices = orders.filter(order => 
    order.invoice?.status === 'paid'
  );
  const outstandingReceivables = pendingInvoices.reduce((sum, order) => 
    sum + (order.invoice?.amount || 0), 0
  );
  const totalExpenses = employees.reduce((sum, emp) => sum + (emp.salary || 0), 0);
  const profitMargin = totalRevenue > 0 
    ? ((totalRevenue - totalExpenses) / totalRevenue * 100).toFixed(1)
    : 0;

  // Sort invoices by due date
  const sortedInvoices = [...orders]
    .filter(order => order.invoice)
    .sort((a, b) => {
      const dateA = new Date(a.invoice?.dueDate || 0);
      const dateB = new Date(b.invoice?.dueDate || 0);
      return dateA.getTime() - dateB.getTime();
    });

  const getInvoiceStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-success text-success-foreground">Paid</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (ordersLoading || employeesLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Finance & Accounting</h1>
          <p className="text-muted-foreground">Manage invoices, expenses, and financial reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button 
            className="bg-gradient-primary text-primary-foreground"
            onClick={handleNewInvoice}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Receivables</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${outstandingReceivables.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{pendingInvoices.length} pending invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{orders.length} total orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profitMargin}%</div>
            <p className="text-xs text-success">Revenue vs Expenses</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="invoices" className="space-y-4">
        <TabsList>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="ledger">General Ledger</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Invoices</CardTitle>
              <CardDescription>Manage and track all your invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sortedInvoices.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No invoices found</p>
                ) : (
                  sortedInvoices.map((order) => (
                    <div key={order._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <p className="font-medium">{order.invoice?.invoiceNumber}</p>
                          {getInvoiceStatusBadge(order.invoice?.status || 'pending')}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {order.customerName} • Order {order.orderNumber}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${(order.invoice?.amount || order.total || 0).toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.invoice?.status === 'paid' 
                            ? `Paid ${formatDistanceToNow(new Date(order.invoice.paidDate || order.orderDate), { addSuffix: true })}`
                            : `Due ${formatDistanceToNow(new Date(order.invoice?.dueDate || order.orderDate), { addSuffix: true })}`
                          }
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Expenses</CardTitle>
              <CardDescription>Monthly employee salary expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted">
                  <div>
                    <p className="font-medium">Total Monthly Payroll</p>
                    <p className="text-sm text-muted-foreground">{employees.length} employees</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">${totalExpenses.toLocaleString()}</p>
                  </div>
                </div>
                {employees.slice(0, 5).map((employee) => (
                  <div key={employee._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{employee.name}</p>
                      <p className="text-sm text-muted-foreground">{employee.position} • {employee.department}</p>
                    </div>
                    <p className="font-medium">${(employee.salary || 0).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ledger" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Ledger</CardTitle>
              <CardDescription>All financial transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold text-success">${totalRevenue.toLocaleString()}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Expenses</p>
                    <p className="text-2xl font-bold text-destructive">${totalExpenses.toLocaleString()}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Net Profit</p>
                    <p className="text-2xl font-bold">${(totalRevenue - totalExpenses).toLocaleString()}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Profit Margin</p>
                    <p className="text-2xl font-bold">{profitMargin}%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Financial Reports</CardTitle>
              <CardDescription>Generate and download financial reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Profit & Loss Statement
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Balance Sheet
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Cash Flow Statement
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Accounts Receivable Aging
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Invoice Dialog */}
      <Dialog open={showNewInvoiceDialog} onOpenChange={setShowNewInvoiceDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
            <DialogDescription>
              Create a new invoice for your customer. Fill in the details below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Customer *</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
              >
                <option value="">Select a customer...</option>
                {customers.map((customer) => (
                  <option key={customer._id} value={customer._id}>
                    {customer.name} - {customer.email}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Product/Service *</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
              >
                <option value="">Select a product...</option>
                {products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.name} - ${product.price} (Stock: {product.stock})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Quantity *</label>
                <input 
                  type="number" 
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Due Date *</label>
                <input 
                  type="date" 
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>

            {selectedProduct && (
              <div className="p-4 bg-muted rounded-md">
                <p className="text-sm font-medium">Invoice Preview</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Amount: ${((products.find(p => p._id === selectedProduct)?.price || 0) * quantity).toLocaleString()}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowNewInvoiceDialog(false)}
                disabled={createOrder.isPending}
              >
                Cancel
              </Button>
              <Button 
                className="bg-gradient-primary text-primary-foreground"
                onClick={handleCreateInvoice}
                disabled={createOrder.isPending}
              >
                {createOrder.isPending ? "Creating..." : "Create Invoice"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}