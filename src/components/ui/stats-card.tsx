
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    positive: boolean;
  };
  className?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon,
  trend,
  className,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        "bg-white p-6 rounded-lg shadow-sm border border-lacos-rose",
        className
      )}
    >
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h2 className="text-3xl font-bold text-lacos-primary">{value}</h2>
          {description && (
            <p className="text-xs text-gray-400">{description}</p>
          )}
          {trend && (
            <div className="flex items-center text-xs">
              <span
                className={
                  trend.positive ? "text-green-600" : "text-red-600"
                }
              >
                {trend.positive ? "+" : "-"}
                {Math.abs(trend.value)}%
              </span>
              <span className="text-gray-500 ml-1">desde o mês passado</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="h-12 w-12 rounded-lg bg-lacos-rose text-lacos-primary flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
