import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost";
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: "bg-black text-white shadow-soft",
      destructive: "bg-error-600 text-white shadow-soft",
      outline: "border-2 border-black bg-white text-black",
      secondary: "bg-gray-100 text-black shadow-soft",
      ghost: "text-black hover:bg-gray-100",
    };

    return (
      <div
        className={cn(
          "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2",
          variants[variant],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";

export { Badge };
