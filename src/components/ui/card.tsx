"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outlined" | "gradient";
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
  interactive?: boolean;
  shadow?: "none" | "soft" | "medium" | "strong";
  fullWidth?: boolean;
  fullHeight?: boolean;
  border?: boolean;
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "bordered";
}

interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "bordered";
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className, 
    variant = "default", 
    padding = "md", 
    hover = false,
    interactive = false,
    shadow = "soft",
    fullWidth = false,
    fullHeight = false,
    border = true,
    ...props 
  }, ref) => {
    const variants = {
      default: "bg-white border border-neutral-200 shadow-soft",
      elevated: "bg-white shadow-medium hover:shadow-strong",
      outlined: "bg-white border-2 border-neutral-200 hover:border-neutral-300",
      gradient: "bg-gradient-to-br from-white to-primary-50/30 border border-primary-100/50 shadow-soft",
    };

    const paddings = {
      none: "",
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
    };

    const shadows = {
      none: "",
      soft: "shadow-soft",
      medium: "shadow-medium",
      strong: "shadow-strong",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl transition-all duration-200",
          variants[variant],
          paddings[padding],
          shadows[shadow],
          (hover || interactive) && "hover:shadow-medium hover:scale-[1.02] cursor-pointer",
          fullWidth && "w-full",
          fullHeight && "h-full",
          !border && "border-0",
          className
        )}
        {...props}
      />
    );
  }
);

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: "pb-4",
      bordered: "pb-4 border-b border-neutral-200 mb-4",
    };

    return (
      <div
        ref={ref}
        className={cn("flex flex-col space-y-1.5", variants[variant], className)}
        {...props}
      />
    );
  }
);

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-xl font-semibold leading-none tracking-tight text-neutral-900", className)}
      {...props}
    />
  )
);

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-neutral-600 leading-relaxed", className)}
      {...props}
    />
  )
);

const CardBody = React.forwardRef<HTMLDivElement, CardBodyProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("", className)} {...props} />
  )
);

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: "pt-4",
      bordered: "pt-4 border-t border-neutral-200 mt-4",
    };

    return (
      <div
        ref={ref}
        className={cn("flex items-center", variants[variant], className)}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";
CardHeader.displayName = "CardHeader";
CardTitle.displayName = "CardTitle";
CardDescription.displayName = "CardDescription";
CardBody.displayName = "CardBody";
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardDescription, CardBody, CardFooter };