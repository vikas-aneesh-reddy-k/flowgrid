import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ElementType;
  iconColor?: string;
  prefix?: string;
}

export function MetricCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  iconColor = "bg-primary",
  prefix = "",
}: MetricCardProps) {
  const getTrendIcon = () => {
    if (!change) return null;
    if (change > 0) return <TrendingUp className="w-4 h-4" />;
    if (change < 0) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = () => {
    if (!change) return "text-muted-foreground";
    if (change > 0) return "text-success";
    if (change < 0) return "text-destructive";
    return "text-muted-foreground";
  };

  return (
    <div className="bg-card rounded-lg p-6 shadow-card hover:shadow-md transition-all duration-base">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-2xl font-bold text-card-foreground mt-2">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {change !== undefined && (
            <div className={cn("flex items-center gap-1 mt-2", getTrendColor())}>
              {getTrendIcon()}
              <span className="text-sm font-medium">
                {change > 0 ? "+" : ""}{change}%
              </span>
              {changeLabel && (
                <span className="text-xs text-muted-foreground ml-1">{changeLabel}</span>
              )}
            </div>
          )}
        </div>
        {Icon && (
          <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", iconColor)}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        )}
      </div>
    </div>
  );
}