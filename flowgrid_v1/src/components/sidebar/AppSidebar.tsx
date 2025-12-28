import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutGrid,
  DollarSign,
  Package,
  Users,
  UserCheck,
  ShoppingCart,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  Building2,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const mainModules = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutGrid,
    badge: null,
  },
  {
    title: "CRM",
    url: "/crm",
    icon: UserCheck,
    badge: "42",
  },
  {
    title: "Finance",
    url: "/finance",
    icon: DollarSign,
    badge: "12",
  },
  {
    title: "Inventory",
    url: "/inventory",
    icon: Package,
    badge: "Low",
  },
  {
    title: "Sales",
    url: "/sales",
    icon: ShoppingCart,
    badge: "5",
  },
  {
    title: "HR & Payroll",
    url: "/hr",
    icon: Users,
    badge: null,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
    badge: null,
  },
];

const systemItems = [
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
  {
    title: "Help Center",
    url: "/help",
    icon: HelpCircle,
  },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar className="bg-sidebar border-r border-sidebar-border">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
            <Building2 className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-sidebar-foreground">FlowGrid</h2>
            <p className="text-xs text-muted-foreground">Enterprise ERP</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase text-muted-foreground px-4">
            Core Modules
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainModules.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={cn(
                          "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-fast",
                          isActive
                            ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                            : "text-sidebar-foreground hover:bg-sidebar-hover"
                        )}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="flex-1">{item.title}</span>
                        {item.badge && (
                          <span
                            className={cn(
                              "px-2 py-0.5 text-xs rounded-full",
                              item.badge === "Low"
                                ? "bg-warning text-warning-foreground"
                                : "bg-info text-info-foreground"
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                        {isActive && <ChevronRight className="w-4 h-4" />}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase text-muted-foreground px-4">
            System
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={cn(
                          "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-fast",
                          isActive
                            ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                            : "text-sidebar-foreground hover:bg-sidebar-hover"
                        )}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <button className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-hover transition-all duration-fast w-full">
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}