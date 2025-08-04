"use client";

import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  children?: ReactNode;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className,
  children,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-lg border border-neutral-200 p-6 shadow-sm hover:shadow-md transition-shadow",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary-100 rounded-lg">
            <Icon className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-600">{title}</p>
            <p className="text-2xl font-bold text-neutral-900">{value}</p>
          </div>
        </div>
        {trend && (
          <div
            className={cn(
              "flex items-center space-x-1 text-sm font-medium",
              trend.isPositive ? "text-green-600" : "text-red-600"
            )}
          >
            <span>{trend.isPositive ? "+" : ""}{trend.value}%</span>
          </div>
        )}
      </div>
      {description && (
        <p className="mt-2 text-sm text-neutral-500">{description}</p>
      )}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}

// StatsGrid component for organizing multiple stats cards
interface StatsGridProps {
  children: ReactNode;
  className?: string;
}

export function StatsGrid({ children, className }: StatsGridProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", className)}>
      {children}
    </div>
  );
}

export default StatsCard;