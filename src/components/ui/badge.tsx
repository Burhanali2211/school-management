import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info" | "primary" | "accent" | "neutral";
  size?: "sm" | "md" | "lg";
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    const baseStyles = "inline-flex items-center rounded-full font-medium transition-all duration-200";
    
    const variants = {
      default: "bg-primary-500 text-white shadow-soft",
      secondary: "bg-secondary-100 text-secondary-700 border border-secondary-200",
      destructive: "bg-error-500 text-white shadow-soft",
      outline: "border border-secondary-300 text-secondary-700 bg-white",
      success: "bg-success-500 text-white shadow-soft",
      warning: "bg-warning-500 text-white shadow-soft",
      info: "bg-blue-500 text-white shadow-soft",
      primary: "bg-primary-500 text-white shadow-soft",
      accent: "bg-accent-500 text-white shadow-soft",
      neutral: "bg-neutral-500 text-white shadow-soft",
    };

    const sizes = {
      sm: "px-2 py-0.5 text-xs",
      md: "px-3 py-1 text-sm",
      lg: "px-4 py-1.5 text-base",
    };

    return (
      <div
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";

export { Badge };
