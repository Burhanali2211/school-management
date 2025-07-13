import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  helperText?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  readOnly?: boolean;
  success?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type = "text", 
    error, 
    label, 
    id, 
    helperText,
    icon,
    fullWidth = true,
    readOnly = false,
    success = false,
    ...props 
  }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={id}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              {icon}
            </div>
          )}
          <input
            type={type}
            id={id}
            className={cn(
              "block transition-all duration-200 appearance-none rounded-lg border px-4 py-3 text-sm",
              "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
              icon ? 'pl-10' : 'pl-4',
              fullWidth ? 'w-full' : '',
              success ? "border-green-500 focus:ring-green-500" : '',
              error ? "border-red-500 focus:ring-red-500" : 'border-gray-300',
              readOnly ? "bg-gray-100 cursor-not-allowed" : "bg-white",
              className
            )}
            ref={ref}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
            readOnly={readOnly}
            {...props}
          />
          {error && (
            <p id={`${id}-error`} className="text-sm text-red-500 mt-1">
              {error}
            </p>
          )}
          {helperText && !error && (
            <p id={`${id}-helper`} className="text-sm text-gray-600 mt-1">
              {helperText}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
