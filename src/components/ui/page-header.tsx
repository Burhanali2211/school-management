"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-neutral-900">{title}</h1>
        {description && (
          <p className="text-neutral-600">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center space-x-2">{children}</div>}
    </div>
  );
}

interface PageHeaderActionsProps {
  children: ReactNode;
  className?: string;
}

export function PageHeaderActions({ children, className }: PageHeaderActionsProps) {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {children}
    </div>
  );
}

export default PageHeader;