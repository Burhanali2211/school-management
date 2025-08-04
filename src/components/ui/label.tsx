import * as React from "react";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  className?: string;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ children, className = "", ...props }, ref) => (
    <label
      ref={ref}
      className={`block text-sm font-medium text-gray-700 mb-1 ${className}`.trim()}
      {...props}
    >
      {children}
    </label>
  )
);
Label.displayName = "Label";