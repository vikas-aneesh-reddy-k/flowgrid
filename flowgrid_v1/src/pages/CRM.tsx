import { Users, Phone, Mail, Calendar, MessageSquare, Target, TrendingUp, Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useCustomers, useCreateCustomer } from "@/hooks/useCustomers";

export default function CRM() {
  const [showAddCustomerDialog, setShowAddCustomerDialog] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerCompany, setCustomerCompany] = useState("");
  const [customerSegment, setCustomerSegment] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

  // Use the actual hooks to fetch and create customers
  const { data: customersData, isLoading } = useCustomers();
  const createCustomer = useCreateCustomer();

  const handleAddCustomer = () => {
    setShowAddCustomerDialog(true);
    toast.info("Add Customer", {
      description: "Customer creation form opening...",
    });
  };

  const handleCreateCustomer = async () => {
    if (!customerName || !customerEmail || !customerCompany) {
      toast.error("Missing Information", {
        description: "Please fill in all required fields (Name, Email, Company).",
      });
      return;
    }

    // Create customer data object matching the API structure
    const customerData = {
      name: customerName,
      email: customerEmail,
      phone: customerPhone || undefined,
      company: customerCompany,
      segment: customerSegment || "SMB", // Default to SMB if no segment selected
      address: customerAddress ? {
        street: customerAddress,
        city: "N/A",
        state: "N/A", 
        zipCode: "N/A",
      } : {
        street: "N/A",
        city: "N/A",
        state: "N/A",
        zipCode: "N/A",
      },
      status: 'active', // Set as active customer by default
    };

    // Use the mutation to create the customer
    createCustomer.mutate(customerData, {
      onSuccess: () => {
        // Reset form and close dialog
        setShowAddCustomerDialog(false);
        setCustomerName("");
        setCustomerEmail("");
        setCustomerPhone("");
        setCustomerCompany("");
        setCustomerSegment("");
        setCustomerAddress("");
      },
      onError: (error: any) => {
        console.error("Failed to create customer:", error);
      },
    });
  };
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Customer Relationship Management</h1>
          <p className="text-muted-foreground">Manage customers, leads, contacts, and opportunities</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button 
            className="bg-gradient-primary text-primary-foreground"
            onClick={handleAddCustomer}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,845</div>
            <p className="text-xs text-success">+125 this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">Worth $1.2M</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28.5%</div>
            <p className="text-xs text-success">+3.2% vs last quarter</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg. Deal Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$28,500</div>
            <p className="text-xs text-muted-foreground">+12% growth</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="customers" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
        </TabsList>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Customer Database</CardTitle>
                  <CardDescription>Complete list of all active customers</CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search customers..." className="pl-10" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { 
                    name: "Acme Corporation", 
                    contact: "John Smith", 
                    value: "$245,000", 
                    status: "active",
                    lastContact: "2 days ago",
                    segment: "Enterprise"
                  },
                  { 
                    name: "TechStart Inc.", 
                    contact: "Sarah Johnson", 
                    value: "$125,000", 
                    status: "active",
                    lastContact: "1 week ago",
                    segment: "SMB"
                  },
                  { 
                    name: "Global Solutions Ltd.", 
                    contact: "Mike Chen", 
                    value: "$450,000", 
                    status: "premium",
                    lastContact: "Today",
                    segment: "Enterprise"
                  },
                  { 
                    name: "Innovation Labs", 
                    contact: "Emily Davis", 
                    value: "$85,000", 
                    status: "at-risk",
                    lastContact: "3 weeks ago",
                    segment: "Startup"
                  },
                  { 
                    name: "Digital Dynamics", 
                    contact: "Robert Brown", 
                    value: "$320,000", 
                    status: "active",
                    lastContact: "5 days ago",
                    segment: "Enterprise"
                  },
                ].map((customer) => (
                  <div key={customer.name} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback>{customer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">{customer.contact} • {customer.segment}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-medium">{customer.value}</p>
                        <p className="text-xs text-muted-foreground">Last contact: {customer.lastContact}</p>
                      </div>
                      <Badge variant={
                        customer.status === "premium" ? "default" :
                        customer.status === "active" ? "secondary" : "destructive"
                      } className={
                        customer.status === "premium" ? "bg-gradient-primary text-primary-foreground" :
                        customer.status === "active" ? "bg-success text-success-foreground" : ""
                      }>
                        {customer.status === "premium" ? "Premium" :
                         customer.status === "active" ? "Active" : "At Risk"}
                      </Badge>
                      <Button variant="outline" size="sm">View Details</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leads Tab */}
        <TabsContent value="leads" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lead Pipeline</CardTitle>
              <CardDescription>Track and manage potential customers through stages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {[
                  { stage: "New", count: 15, color: "bg-info-light" },
                  { stage: "Contacted", count: 12, color: "bg-warning-light" },
                  { stage: "Qualified", count: 8, color: "bg-primary/10" },
                  { stage: "Proposal", count: 5, color: "bg-success-light" },
                  { stage: "Negotiation", count: 3, color: "bg-gradient-success text-success-foreground" },
                ].map((stage) => (
                  <div key={stage.stage} className={`${stage.color} rounded-lg p-4`}>
                    <h4 className="font-medium text-foreground">{stage.stage}</h4>
                    <p className="text-3xl font-bold mt-2">{stage.count}</p>
                    <p className="text-sm text-muted-foreground">leads</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-3">
                <h4 className="font-medium">Recent Leads</h4>
                {[
                  { name: "Tech Innovations Co.", source: "Website", score: 85, stage: "Qualified" },
                  { name: "Future Systems Ltd.", source: "Referral", score: 72, stage: "Contacted" },
                  { name: "Smart Solutions Inc.", source: "Campaign", score: 68, stage: "New" },
                ].map((lead) => (
                  <div key={lead.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{lead.name}</p>
                      <p className="text-sm text-muted-foreground">Source: {lead.source}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">Score: {lead.score}</p>
                        <p className="text-xs text-muted-foreground">{lead.stage}</p>
                      </div>
                      <Button size="sm">Convert</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Opportunities Tab */}
        <TabsContent value="opportunities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales Opportunities</CardTitle>
              <CardDescription>Active deals and their progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { 
                  name: "Enterprise Package - Acme Corp",
                  value: "$125,000",
                  probability: 75,
                  stage: "Negotiation",
                  closeDate: "Dec 30, 2024"
                },
                { 
                  name: "Cloud Migration - TechStart",
                  value: "$85,000",
                  probability: 60,
                  stage: "Proposal",
                  closeDate: "Jan 15, 2025"
                },
                { 
                  name: "Annual License - Global Solutions",
                  value: "$200,000",
                  probability: 90,
                  stage: "Contract Review",
                  closeDate: "Dec 20, 2024"
                },
                { 
                  name: "Consulting Services - Innovation Labs",
                  value: "$45,000",
                  probability: 40,
                  stage: "Qualification",
                  closeDate: "Feb 1, 2025"
                },
              ].map((opp) => (
                <div key={opp.name} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{opp.name}</p>
                      <p className="text-sm text-muted-foreground">Close date: {opp.closeDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{opp.value}</p>
                      <Badge>{opp.stage}</Badge>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Probability</span>
                      <span className="font-medium">{opp.probability}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-base ${
                          opp.probability >= 70 ? 'bg-success' : 
                          opp.probability >= 40 ? 'bg-warning' : 'bg-destructive'
                        }`}
                        style={{ width: `${opp.probability}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contacts Tab */}
        <TabsContent value="contacts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact Directory</CardTitle>
              <CardDescription>All customer contacts and communication history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { 
                    name: "John Smith",
                    company: "Acme Corporation",
                    role: "CEO",
                    email: "john@acme.com",
                    phone: "+1 555-0123",
                    lastInteraction: "Email - 2 days ago"
                  },
                  { 
                    name: "Sarah Johnson",
                    company: "TechStart Inc.",
                    role: "CTO",
                    email: "sarah@techstart.com",
                    phone: "+1 555-0124",
                    lastInteraction: "Meeting - 1 week ago"
                  },
                  { 
                    name: "Mike Chen",
                    company: "Global Solutions Ltd.",
                    role: "VP Sales",
                    email: "mike@global.com",
                    phone: "+1 555-0125",
                    lastInteraction: "Phone call - Today"
                  },
                  { 
                    name: "Emily Davis",
                    company: "Innovation Labs",
                    role: "Product Manager",
                    email: "emily@innovation.com",
                    phone: "+1 555-0126",
                    lastInteraction: "Email - 3 weeks ago"
                  },
                ].map((contact) => (
                  <div key={contact.email} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback>{contact.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{contact.name}</p>
                        <p className="text-sm text-muted-foreground">{contact.role} at {contact.company}</p>
                        <p className="text-xs text-muted-foreground mt-1">{contact.lastInteraction}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <Mail className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activities Tab */}
        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Activities & Tasks</CardTitle>
                  <CardDescription>Upcoming activities and communication history</CardDescription>
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Activities</SelectItem>
                    <SelectItem value="calls">Calls</SelectItem>
                    <SelectItem value="meetings">Meetings</SelectItem>
                    <SelectItem value="emails">Emails</SelectItem>
                    <SelectItem value="tasks">Tasks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    type: "meeting",
                    title: "Product Demo with Acme Corp",
                    time: "Today, 2:00 PM",
                    participant: "John Smith",
                    status: "upcoming",
                    icon: Calendar,
                    color: "bg-info"
                  },
                  {
                    type: "call",
                    title: "Follow-up call with TechStart",
                    time: "Today, 4:30 PM",
                    participant: "Sarah Johnson",
                    status: "upcoming",
                    icon: Phone,
                    color: "bg-success"
                  },
                  {
                    type: "email",
                    title: "Send proposal to Global Solutions",
                    time: "Tomorrow, 10:00 AM",
                    participant: "Mike Chen",
                    status: "pending",
                    icon: Mail,
                    color: "bg-warning"
                  },
                  {
                    type: "task",
                    title: "Prepare contract for Innovation Labs",
                    time: "Dec 20, 2024",
                    participant: "Emily Davis",
                    status: "in-progress",
                    icon: Target,
                    color: "bg-primary"
                  },
                  {
                    type: "meeting",
                    title: "Quarterly review with Digital Dynamics",
                    time: "Dec 22, 2024",
                    participant: "Robert Brown",
                    status: "scheduled",
                    icon: Calendar,
                    color: "bg-info"
                  },
                ].map((activity, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className={`w-10 h-10 rounded-lg ${activity.color} flex items-center justify-center flex-shrink-0`}>
                      <activity.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.participant}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                    </div>
                    <Badge variant={activity.status === "upcoming" ? "default" : "secondary"}>
                      {activity.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Customer Dialog */}
      <Dialog open={showAddCustomerDialog} onOpenChange={setShowAddCustomerDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription>
              Add a new customer to your CRM database. Fill in the details below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Customer Name *</label>
                <Input 
                  placeholder="Enter customer name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address *</label>
                <Input 
                  type="email"
                  placeholder="customer@company.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number</label>
                <Input 
                  placeholder="+1 (555) 123-4567"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Company Name *</label>
                <Input 
                  placeholder="Company Inc."
                  value={customerCompany}
                  onChange={(e) => setCustomerCompany(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Customer Segment</label>
              <Select value={customerSegment} onValueChange={setCustomerSegment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer segment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Enterprise">Enterprise</SelectItem>
                  <SelectItem value="SMB">Small & Medium Business</SelectItem>
                  <SelectItem value="Startup">Startup</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Address</label>
              <Input 
                placeholder="123 Business St, City, State 12345"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowAddCustomerDialog(false)}
                disabled={createCustomer.isPending}
              >
                Cancel
              </Button>
              <Button 
                className="bg-gradient-primary text-primary-foreground"
                onClick={handleCreateCustomer}
                disabled={createCustomer.isPending}
              >
                {createCustomer.isPending ? "Creating..." : "Add Customer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}