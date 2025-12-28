import { Users, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useEmployees, useCreateEmployee, useProcessPayroll } from "@/hooks/useEmployees";
import { useState } from "react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function HR() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPayrollDialog, setShowPayrollDialog] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: "",
    name: "",
    email: "",
    phone: "",
    position: "",
    department: "",
    salary: "",
    hireDate: "",
  });
  const [payrollData, setPayrollData] = useState({
    payPeriodStart: "",
    payPeriodEnd: "",
  });

  const { data: employeesData, isLoading } = useEmployees();
  const createEmployee = useCreateEmployee();
  const processPayroll = useProcessPayroll();

  const employees = employeesData?.data || [];

  // Calculate metrics
  const totalEmployees = employees.length;
  const pendingLeaveRequests = employees.reduce((sum, emp) => 
    sum + (emp.leaveRequests?.filter((req: any) => req.status === 'pending').length || 0), 0
  );
  const monthlyPayroll = employees.reduce((sum, emp) => sum + (emp.baseSalary || 0), 0);

  // Get recent hires (last 30 days)
  const recentHires = employees
    .filter(emp => {
      const hireDate = new Date(emp.hireDate);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return hireDate >= thirtyDaysAgo;
    })
    .sort((a, b) => new Date(b.hireDate).getTime() - new Date(a.hireDate).getTime())
    .slice(0, 5);

  // Get all pending leave requests
  const allLeaveRequests = employees.flatMap(emp => 
    (emp.leaveRequests || [])
      .filter((req: any) => req.status === 'pending')
      .map((req: any) => ({
        ...req,
        employeeName: emp.name,
      }))
  ).slice(0, 4);

  // Department statistics
  const departmentStats = employees.reduce((acc: any, emp) => {
    if (!acc[emp.department]) {
      acc[emp.department] = { count: 0, totalSalary: 0 };
    }
    acc[emp.department].count++;
    acc[emp.department].totalSalary += (emp.baseSalary || 0);
    return acc;
  }, {});

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createEmployee.mutateAsync({
        ...formData,
        baseSalary: parseFloat(formData.salary),
        hireDate: new Date(formData.hireDate),
      });
      toast.success("Employee created successfully");
      setShowCreateDialog(false);
      setFormData({
        employeeId: "",
        name: "",
        email: "",
        phone: "",
        position: "",
        department: "",
        salary: "",
        hireDate: "",
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create employee");
    }
  };

  const handleProcessPayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await processPayroll.mutateAsync(payrollData);
      const data = result.data;
      toast.success(`Payroll processed for ${data.processed} employees`);
      if (data.failed > 0) {
        toast.error(`Failed to process ${data.failed} employees`);
      }
      setShowPayrollDialog(false);
      setPayrollData({
        payPeriodStart: "",
        payPeriodEnd: "",
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to process payroll");
    }
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
          <h1 className="text-2xl font-bold text-foreground">HR & Payroll</h1>
          <p className="text-muted-foreground">Manage employees, attendance, and payroll processing</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPayrollDialog(true)}>
            Process Payroll
          </Button>
          <Button 
            className="bg-gradient-primary text-primary-foreground"
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
            <p className="text-xs text-muted-foreground">Active workforce</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Recent Hires</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentHires.length}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{pendingLeaveRequests}</div>
            <p className="text-xs text-muted-foreground">Require approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Monthly Payroll</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${monthlyPayroll.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total salaries</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Hires</CardTitle>
            <CardDescription>New employees joined in the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentHires.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No recent hires</p>
              ) : (
                recentHires.map((employee) => (
                  <div key={employee._id} className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback>{employee.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{employee.name}</p>
                      <p className="text-sm text-muted-foreground">{employee.position} • {employee.department}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(employee.hireDate), { addSuffix: true })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leave Requests</CardTitle>
            <CardDescription>Pending approval for time off</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {allLeaveRequests.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No pending requests</p>
              ) : (
                allLeaveRequests.map((request: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{request.employeeName}</p>
                      <p className="text-sm text-muted-foreground">
                        {request.type} • {request.days} days
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {new Date(request.startDate).toLocaleDateString()}
                      </span>
                      <Badge variant="secondary">Pending</Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Department Overview</CardTitle>
          <CardDescription>Employee distribution across departments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(departmentStats).map(([dept, stats]: [string, any]) => (
              <div key={dept} className="text-center p-4 bg-muted rounded-lg">
                <Users className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="font-medium">{dept}</p>
                <p className="text-2xl font-bold mt-1">{stats.count}</p>
                <p className="text-xs text-muted-foreground">employees</p>
                <p className="text-sm font-medium mt-2">${stats.totalSalary.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">monthly</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Employee Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
            <DialogDescription>Create a new employee record</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateEmployee}>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee ID</Label>
                <Input
                  id="employeeId"
                  placeholder="e.g., EMP001"
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="e.g., john.doe@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  placeholder="e.g., +1 (555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  placeholder="e.g., Software Engineer"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  placeholder="e.g., Engineering"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary">Salary</Label>
                <Input
                  id="salary"
                  type="number"
                  placeholder="e.g., 75000"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hireDate">Hire Date</Label>
                <Input
                  id="hireDate"
                  type="date"
                  value={formData.hireDate}
                  onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createEmployee.isPending}>
                {createEmployee.isPending ? "Creating..." : "Create Employee"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Process Payroll Dialog */}
      <Dialog open={showPayrollDialog} onOpenChange={setShowPayrollDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Payroll</DialogTitle>
            <DialogDescription>
              Process payroll for all active employees for the specified pay period
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleProcessPayroll}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="payPeriodStart">Pay Period Start</Label>
                <Input
                  id="payPeriodStart"
                  type="date"
                  value={payrollData.payPeriodStart}
                  onChange={(e) => setPayrollData({ ...payrollData, payPeriodStart: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payPeriodEnd">Pay Period End</Label>
                <Input
                  id="payPeriodEnd"
                  type="date"
                  value={payrollData.payPeriodEnd}
                  onChange={(e) => setPayrollData({ ...payrollData, payPeriodEnd: e.target.value })}
                  required
                />
              </div>
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p className="text-sm font-medium">Summary</p>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Active Employees:</span>
                  <span className="font-medium">{totalEmployees}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Payroll:</span>
                  <span className="font-medium">${monthlyPayroll.toLocaleString()}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Deductions: 20% tax, 5% insurance
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowPayrollDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={processPayroll.isPending}>
                {processPayroll.isPending ? "Processing..." : "Process Payroll"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}