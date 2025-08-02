"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { 
  LucideIcon, 
  ChevronRight,
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
import { Button } from './button';
import Link from 'next/link';

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

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
  iconColor?: string;
  iconBgColor?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  icon,
  iconColor = "text-blue-600",
  iconBgColor = "bg-blue-100",
  breadcrumbs,
  actions,
  className,
  children
}: PageHeaderProps) {
  // Determine the icon component to use
  let IconComponent: LucideIcon | null = null;
  
  if (icon && typeof icon === 'string') {
    IconComponent = iconMap[icon] || null;
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center space-x-2 text-sm text-slate-500">
          {breadcrumbs.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && <ChevronRight className="w-4 h-4" />}
              {item.href ? (
                <Link
                  href={item.href}
                  className="hover:text-slate-700 transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={index === breadcrumbs.length - 1 ? "text-slate-900 font-medium" : ""}>
                  {item.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Header Content */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {IconComponent && (
            <div className={cn(
              "p-3 rounded-xl shadow-sm ring-1 ring-black/5 transition-all duration-200 hover:shadow-md",
              iconBgColor
            )}>
              <IconComponent className={cn("w-6 h-6", iconColor)} />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{title}</h1>
            {subtitle && (
              <p className="text-slate-600 mt-2 text-lg">{subtitle}</p>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>

      {/* Additional Content */}
      {children && (
        <div className="pt-4 border-t border-slate-200">
          {children}
        </div>
      )}
    </div>
  );
}

interface PageHeaderActionsProps {
  children: React.ReactNode;
  className?: string;
}

export function PageHeaderActions({ children, className }: PageHeaderActionsProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {children}
    </div>
  );
}

interface QuickStatsProps {
  stats: Array<{
    label: string;
    value: string | number;
    color?: string;
  }>;
  className?: string;
}

export function QuickStats({ stats, className }: QuickStatsProps) {
  return (
    <div className={cn("flex items-center gap-8", className)}>
      {stats.map((stat, index) => (
        <div key={index} className="text-center">
          <div className={cn(
            "text-2xl font-bold",
            stat.color || "text-slate-900"
          )}>
            {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
          </div>
          <div className="text-sm text-slate-600">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}