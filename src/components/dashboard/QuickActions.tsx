import { FileText, Package, Users, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const actions = [
  {
    label: "New Invoice",
    icon: FileText,
    color: "bg-gradient-primary",
    route: "/finance",
    action: "invoice",
  },
  {
    label: "Add Product",
    icon: Package,
    color: "bg-gradient-success",
    route: "/inventory",
    action: "product",
  },
  {
    label: "New Employee",
    icon: Users,
    color: "bg-gradient-info",
    route: "/hr",
    action: "employee",
  },
  {
    label: "Create Order",
    icon: Receipt,
    color: "bg-warning",
    route: "/sales",
    action: "order",
  },
];

export function QuickActions() {
  const navigate = useNavigate();

  const handleAction = (action: typeof actions[0]) => {
    // Navigate to the appropriate page
    navigate(action.route);
    
    // Show toast notification
    toast.success(`Opening ${action.label}`, {
      description: `Redirecting to ${action.route.replace('/', '')} page...`,
    });
  };

  return (
    <div className="bg-card rounded-lg p-6 shadow-card">
      <h3 className="text-lg font-semibold text-card-foreground mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            className="h-auto flex flex-col items-center gap-2 p-4 hover:bg-muted transition-all duration-base"
            onClick={() => handleAction(action)}
          >
            <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center`}>
              <action.icon className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium">{action.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}