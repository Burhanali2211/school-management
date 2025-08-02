"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { 
  LucideIcon,
  Users,
  GraduationCap,
  BookOpen,
  Heart,
  Calendar,
  Award,
  UserCheck,
  TrendingUp,
  Baby,
  School
} from 'lucide-react';
import { Card } from './card';

// Icon mapping for string-based icons
const iconMap: Record<string, LucideIcon> = {
  'users': Users,
  'graduation-cap': GraduationCap,
  'book-open': BookOpen,
  'heart': Heart,
  'calendar': Calendar,
  'award': Award,
  'user-check': UserCheck,
  'trending-up': TrendingUp,
  'baby': Baby,
  'school': School,
};

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  iconColor?: string;
  iconBgColor?: string;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  className?: string;
  onClick?: () => void;
  loading?: boolean;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  iconColor = "text-blue-600",
  iconBgColor = "bg-blue-100",
  trend,
  className,
  onClick,
  loading = false
}: StatsCardProps) {
  // Determine the icon component to use
  let IconComponent: LucideIcon | null = null;
  
  if (icon && typeof icon === 'string') {
    IconComponent = iconMap[icon] || null;
  }

  if (loading) {
    return (
      <Card className={cn("p-6", className)} hover={!!onClick} onClick={onClick}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-slate-200 rounded w-24"></div>
            <div className={cn("w-10 h-10 rounded-lg", iconBgColor, "opacity-50")}></div>
          </div>
          <div className="h-8 bg-slate-200 rounded w-16 mb-2"></div>
          <div className="h-3 bg-slate-200 rounded w-20"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-0 bg-gradient-to-br from-white to-slate-50/50",
        className
      )}
      hover={!!onClick}
      onClick={onClick}
      interactive={!!onClick}
      shadow="medium"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-700 truncate uppercase tracking-wide">{title}</h3>
        {IconComponent && (
          <div className={cn(
            "p-2.5 rounded-xl shadow-sm ring-1 ring-black/5 transition-all duration-200 hover:shadow-md",
            iconBgColor
          )}>
            <IconComponent className={cn("w-5 h-5", iconColor)} />
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="text-3xl font-bold text-slate-900 tracking-tight">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>

        {(subtitle || trend) && (
          <div className="flex items-center justify-between">
            {subtitle && (
              <p className="text-sm text-slate-600 truncate font-medium">{subtitle}</p>
            )}

            {trend && (
              <div className={cn(
                "flex items-center text-xs font-semibold px-2.5 py-1.5 rounded-full shadow-sm",
                trend.isPositive
                  ? "text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200"
                  : "text-red-700 bg-red-50 ring-1 ring-red-200"
              )}>
                <span className="mr-1 text-sm">
                  {trend.isPositive ? "↗" : "↘"}
                </span>
                {Math.abs(trend.value)}% {trend.label}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

interface StatsGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
}

export function StatsGrid({
  children,
  className,
  columns = 4
}: StatsGridProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
  };

  return (
    <div className={cn(
      "grid gap-6",
      gridCols[columns],
      className
    )}>
      {children}
    </div>
  );
}