"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "success" | "warning" | "accent" | "neutral";
  size?: "default" | "sm" | "lg" | "icon" | "xs";
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  gradient?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = "default", 
    size = "default", 
    loading = false,
    leftIcon,
    rightIcon,
    gradient = false,
    children,
    disabled,
    ...props 
  }, ref) => {
    const baseStyles = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden transform hover:scale-105";
    
    const variants = {
      default: gradient 
        ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 shadow-medium hover:shadow-strong"
        : "bg-primary-500 text-white hover:bg-primary-600 shadow-medium hover:shadow-strong active:scale-[0.98]",
      destructive: gradient
        ? "bg-gradient-to-r from-error-500 to-error-600 text-white hover:from-error-600 hover:to-error-700 shadow-medium hover:shadow-strong"
        : "bg-error-500 text-white hover:bg-error-600 shadow-medium hover:shadow-strong active:scale-[0.98]",
      success: gradient
        ? "bg-gradient-to-r from-success-500 to-success-600 text-white hover:from-success-600 hover:to-success-700 shadow-medium hover:shadow-strong"
        : "bg-success-500 text-white hover:bg-success-600 shadow-medium hover:shadow-strong active:scale-[0.98]",
      warning: gradient
        ? "bg-gradient-to-r from-warning-500 to-warning-600 text-white hover:from-warning-600 hover:to-warning-700 shadow-medium hover:shadow-strong"
        : "bg-warning-500 text-white hover:bg-warning-600 shadow-medium hover:shadow-strong active:scale-[0.98]",
      outline: "border-2 border-secondary-200 bg-white hover:bg-secondary-50 hover:border-secondary-300 text-secondary-700 shadow-soft hover:shadow-medium",
      secondary: "bg-secondary-100 text-secondary-700 hover:bg-secondary-200 shadow-soft hover:shadow-medium",
      ghost: "hover:bg-secondary-100 text-secondary-700 hover:text-secondary-900",
      link: "text-primary-500 underline-offset-4 hover:underline hover:text-primary-600",
      accent: gradient
        ? "bg-gradient-to-r from-accent-500 to-accent-600 text-white hover:from-accent-600 hover:to-accent-700 shadow-medium hover:shadow-strong"
        : "bg-accent-500 text-white hover:bg-accent-600 shadow-medium hover:shadow-strong active:scale-[0.98]",
      neutral: gradient
        ? "bg-gradient-to-r from-neutral-500 to-neutral-600 text-white hover:from-neutral-600 hover:to-neutral-700 shadow-medium hover:shadow-strong"
        : "bg-neutral-500 text-white hover:bg-neutral-600 shadow-medium hover:shadow-strong active:scale-[0.98]",
    };

    const sizes = {
      xs: "h-8 px-3 py-1 text-xs rounded-lg",
      sm: "h-10 px-4 py-2 text-sm rounded-lg",
      default: "h-12 px-6 py-3 text-sm",
      lg: "h-14 px-8 py-4 text-base rounded-xl",
      icon: "h-10 w-10 p-0",
    };

    const isDisabled = disabled || loading;

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {/* Shimmer effect for gradient buttons */}
        {gradient && (
          <div className="absolute inset-0 -top-1/2 aspect-square w-32 rotate-12 bg-white/20 blur-sm transition-all duration-700 hover:translate-x-full" />
        )}
        
        {loading && (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}
        
        {!loading && leftIcon && (
          <span className="flex items-center">{leftIcon}</span>
        )}
        
        {children && (
          <span className={loading ? "opacity-70" : ""}>{children}</span>
        )}
        
        {!loading && rightIcon && (
          <span className="flex items-center">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
