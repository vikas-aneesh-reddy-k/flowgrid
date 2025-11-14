import { ShoppingCart, Plus, Mail, Phone, MapPin, Building, Calendar, DollarSign, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCustomers, useCreateCustomer, useCustomer } from "@/hooks/useCustomers";
import { useOrders } from "@/hooks/useOrders";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";

export default function Sales() {
  const [showNewLeadDialog, setShowNewLeadDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    notes: "",
  });

  const { data: customersData, isLoading } = useCustomers();
  const createCustomer = useCreateCustomer();
  
  // Only fetch customer details when a customer is selected
  const { data: customerDetails, isLoading: detailsLoading } = useCustomer(selectedCustomerId || '');
  const { data: ordersData } = useOrders(
    selectedCustomerId ? { customerId: selectedCustomerId } : undefined
  );

  const customers = customersData?.data || [];
  const customerOrders = ordersData?.data || [];

  // Calculate metrics from real data
  const totalCustomers = customers.length;
  const activeLeads = customers.filter(c => c.status === 'lead').length;
  const activeCustomers = customers.filter(c => c.status === 'active').length;
  const premiumCustomers = customers.filter(c => c.status === 'premium').length;

  // Filter customers based on search
  const filteredCustomers = customers.filter((customer: any) => {
    const query = searchQuery.toLowerCase();
    return (
      customer.name.toLowerCase().includes(query) ||
      customer.email.toLowerCase().includes(query) ||
      customer.company?.toLowerCase().includes(query) ||
      customer.phone.includes(query)
    );
  });

  const handleViewDetails = (customerId: string) => {
    console.log('Opening details for customer:', customerId);
    setSelectedCustomerId(customerId);
    setShowDetailsDialog(true);
  };

  // Get selected customer from the list for immediate display
  const selectedCustomer = customers.find((c: any) => c._id === selectedCustomerId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'lead': return 'bg-blue-500';
      case 'active': return 'bg-green-500';
      case 'premium': return 'bg-purple-500';
      case 'inactive': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'lead': return 'Lead';
      case 'active': return 'Active';
      case 'premium': return 'Premium';
      case 'inactive': return 'At Risk';
      default: return status;
    }
  };

  const handleNewLead = () => {
    setShowNewLeadDialog(true);
    toast.info("New Lead", {
      description: "Lead creation form opening...",
    });
  };

  const handleCreateLead = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error("Missing Information", {
        description: "Please fill in all required fields (Name, Email, Phone).",
      });
      return;
    }

    const customerData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      company: formData.company || undefined,
      address: {
        street: formData.street || "N/A",
        city: formData.city || "N/A",
        state: formData.state || "N/A",
        zipCode: formData.zipCode || "N/A",
      },
      status: 'lead',
      notes: formData.notes || undefined,
    };

    createCustomer.mutate(customerData, {
      onSuccess: () => {
        setShowNewLeadDialog(false);
        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          company: "",
          street: "",
          city: "",
          state: "",
          zipCode: "",
          notes: "",
        });
      },
      onError: (error: any) => {
        console.error("Failed to create lead:", error);
      },
    });
  };

  if (isLoading) {
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
          <h1 className="text-2xl font-bold text-foreground">Sales & CRM</h1>
          <p className="text-muted-foreground">Manage customers, leads, and sales pipeline</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Create Quote</Button>
          <Button 
            className="bg-gradient-info text-info-foreground"
            onClick={handleNewLead}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Lead
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-success">{activeCustomers} active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeLeads}</div>
            <p className="text-xs text-muted-foreground">In pipeline</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24.5%</div>
            <p className="text-xs text-success">+3.2% vs last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Monthly Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$482,500</div>
            <p className="text-xs text-muted-foreground">86 orders</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales Pipeline</CardTitle>
          <CardDescription>Track deals through your sales process</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { stage: "Lead", count: 24, value: "$125,000", color: "bg-info-light" },
              { stage: "Qualified", count: 18, value: "$280,000", color: "bg-warning-light" },
              { stage: "Proposal", count: 12, value: "$420,000", color: "bg-primary/10" },
              { stage: "Closed", count: 8, value: "$380,000", color: "bg-success-light" },
            ].map((stage) => (
              <div key={stage.stage} className={`${stage.color} rounded-lg p-4`}>
                <h4 className="font-medium text-foreground">{stage.stage}</h4>
                <p className="text-2xl font-bold mt-2">{stage.count}</p>
                <p className="text-sm text-muted-foreground">deals</p>
                <p className="text-sm font-medium mt-2">{stage.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Customer Database</CardTitle>
              <CardDescription>Complete list of all active customers</CardDescription>
            </div>
            <Input
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredCustomers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No customers found</p>
            ) : (
              filteredCustomers.map((customer: any) => (
                <div key={customer._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {customer.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{customer.name}</p>
                        <Badge className={`${getStatusColor(customer.status)} text-white`}>
                          {getStatusLabel(customer.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {customer.company || customer.email} • {customer.segment}
                      </p>
                      {customer.lastContact && (
                        <p className="text-xs text-muted-foreground">
                          Last contact: {formatDistanceToNow(new Date(customer.lastContact), { addSuffix: true })}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-lg">${customer.totalValue.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{customer.totalOrders} orders</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewDetails(customer._id)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Customer Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={(open) => {
        console.log('Dialog state changing to:', open);
        setShowDetailsDialog(open);
        if (!open) {
          setSelectedCustomerId(null);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription>
              Complete information and order history
            </DialogDescription>
          </DialogHeader>
          
          {selectedCustomer ? (
            <div className="space-y-6 py-4">
              {(() => {
                const customer = selectedCustomer;
                console.log('Rendering customer:', customer.name);
                
                return (
                  <>
                    {/* Customer Header */}
                    <div className="flex items-start gap-4 p-4 bg-muted rounded-lg">
                      <Avatar className="w-16 h-16">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                          {customer.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-bold">{customer.name}</h3>
                          <Badge className={`${getStatusColor(customer.status)} text-white`}>
                            {getStatusLabel(customer.status)}
                          </Badge>
                        </div>
                        {customer.company && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Building className="w-4 h-4" />
                            {customer.company}
                          </p>
                        )}
                        <p className="text-sm font-medium mt-2">
                          Segment: <Badge variant="outline">{customer.segment}</Badge>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total Value</p>
                        <p className="text-2xl font-bold">${customer.totalValue.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{customer.totalOrders} orders</p>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div>
                      <h4 className="font-semibold mb-3">Contact Information</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Email</p>
                            <p className="text-sm font-medium">{customer.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Phone</p>
                            <p className="text-sm font-medium">{customer.phone}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Address */}
                    {customer.address && (
                      <div>
                        <h4 className="font-semibold mb-3">Address</h4>
                        <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                          <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                          <div>
                            <p className="text-sm">{customer.address.street}</p>
                            <p className="text-sm">
                              {customer.address.city}, {customer.address.state} {customer.address.zipCode}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Additional Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">Customer Since</p>
                        </div>
                        <p className="text-sm font-medium">
                          {new Date(customer.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {customer.lastContact && (
                        <div className="p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">Last Contact</p>
                          </div>
                          <p className="text-sm font-medium">
                            {formatDistanceToNow(new Date(customer.lastContact), { addSuffix: true })}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    {customer.notes && (
                      <div>
                        <h4 className="font-semibold mb-2">Notes</h4>
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-sm">{customer.notes}</p>
                        </div>
                      </div>
                    )}

                    {/* Order History */}
                    <div>
                      <h4 className="font-semibold mb-3">Order History</h4>
                      {customerOrders.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">No orders yet</p>
                      ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {customerOrders.map((order: any) => (
                            <div key={order._id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <Package className="w-8 h-8 text-muted-foreground" />
                                <div>
                                  <p className="font-medium">{order.orderId}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(order.orderDate).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">${order.total.toFixed(2)}</p>
                                <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                                  {order.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                        Close
                      </Button>
                    </div>
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="py-8">
              <p className="text-center text-muted-foreground">Loading customer details...</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New Lead Dialog */}
      <Dialog open={showNewLeadDialog} onOpenChange={setShowNewLeadDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Lead</DialogTitle>
            <DialogDescription>
              Add a new lead to your sales pipeline. Fill in the contact details below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name *</label>
                <input 
                  type="text" 
                  placeholder="John Doe"
                  className="w-full p-2 border rounded-md"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Company</label>
                <input 
                  type="text" 
                  placeholder="Acme Corp"
                  className="w-full p-2 border rounded-md"
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email *</label>
                <input 
                  type="email" 
                  placeholder="john@example.com"
                  className="w-full p-2 border rounded-md"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone *</label>
                <input 
                  type="tel" 
                  placeholder="+1 (555) 123-4567"
                  className="w-full p-2 border rounded-md"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Street Address</label>
              <input 
                type="text" 
                placeholder="123 Main St"
                className="w-full p-2 border rounded-md"
                value={formData.street}
                onChange={(e) => setFormData({...formData, street: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">City</label>
                <input 
                  type="text" 
                  placeholder="New York"
                  className="w-full p-2 border rounded-md"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">State</label>
                <input 
                  type="text" 
                  placeholder="NY"
                  className="w-full p-2 border rounded-md"
                  value={formData.state}
                  onChange={(e) => setFormData({...formData, state: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">ZIP Code</label>
                <input 
                  type="text" 
                  placeholder="10001"
                  className="w-full p-2 border rounded-md"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <textarea 
                placeholder="Additional information about this lead..."
                rows={3}
                className="w-full p-2 border rounded-md"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>

            <div className="p-4 bg-info/10 rounded-md">
              <p className="text-sm font-medium">Lead Status</p>
              <p className="text-xs text-muted-foreground mt-1">
                This contact will be added as a <Badge variant="secondary">Lead</Badge> in your CRM pipeline.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowNewLeadDialog(false)}
                disabled={createCustomer.isPending}
              >
                Cancel
              </Button>
              <Button 
                className="bg-gradient-info text-info-foreground"
                onClick={handleCreateLead}
                disabled={createCustomer.isPending}
              >
                {createCustomer.isPending ? "Creating..." : "Create Lead"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}