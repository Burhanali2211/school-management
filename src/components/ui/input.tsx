"use client";

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
            className="block text-sm font-medium text-secondary-700 mb-1"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400">
              {icon}
            </div>
          )}
          <input
            type={type}
            id={id}
            className={cn(
              "block transition-all duration-200 appearance-none rounded-lg border px-4 py-3 text-sm",
              "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-secondary-50",
              "placeholder:text-secondary-400",
              icon ? 'pl-10' : 'pl-4',
              fullWidth ? 'w-full' : '',
              success ? "border-success-500 focus:ring-success-500 focus:border-success-500" : '',
              error ? "border-error-500 focus:ring-error-500 focus:border-error-500" : 'border-secondary-300 hover:border-secondary-400',
              readOnly ? "bg-secondary-50 cursor-not-allowed text-secondary-600" : "bg-white",
              className
            )}
            ref={ref}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
            readOnly={readOnly}
            {...props}
          />
        </div>
        {error && (
          <p id={`${id}-error`} className="text-sm text-error-600 mt-1 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${id}-helper`} className="text-sm text-secondary-500 mt-1">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
