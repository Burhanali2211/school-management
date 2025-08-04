"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface DropdownMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const DropdownMenu = ({ trigger, children, className }: DropdownMenuProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>
      {isOpen && (
        <div className={cn(
          "absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-strong border border-secondary-200 focus:outline-none z-50",
          "animate-in fade-in-0 zoom-in-95 duration-200",
          className
        )}>
          <div className="py-2">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

const DropdownMenuItem = ({
  children,
  onClick,
  className
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) => {
  return (
    <button
      className={cn(
        "block w-full px-4 py-2 text-left text-sm text-secondary-700 hover:bg-primary-50 hover:text-primary-700",
        "transition-colors duration-150 rounded-lg mx-2 focus-visible-ring",
        className
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

const DropdownMenuSeparator = () => {
  return <div className="my-2 h-px bg-secondary-200 mx-2" />;
};

const DropdownMenuTrigger = ({ children, asChild = false, ...props }: React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean }) => {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
    });
  }
  return <div {...props}>{children}</div>;
};

const DropdownMenuContent = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn("py-1", className)} {...props}>{children}</div>;
};

const DropdownMenuLabel = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn("px-4 py-2 text-sm font-semibold text-secondary-900", className)} {...props}>{children}</div>;
};

const DropdownMenuGroup = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return <div {...props}>{children}</div>;
};

const DropdownMenuSub = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return <div {...props}>{children}</div>;
};

const DropdownMenuSubTrigger = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return <div {...props}>{children}</div>;
};

const DropdownMenuSubContent = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn("py-1", className)} {...props}>{children}</div>;
};

const DropdownMenuRadioGroup = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return <div {...props}>{children}</div>;
};

const DropdownMenuRadioItem = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return <div {...props}>{children}</div>;
};

const DropdownMenuCheckboxItem = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return <div {...props}>{children}</div>;
};

const DropdownMenuShortcut = ({ children, className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return <span className={cn("ml-auto text-xs tracking-widest opacity-60", className)} {...props}>{children}</span>;
};

export { 
  DropdownMenu, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuLabel, 
  DropdownMenuGroup, 
  DropdownMenuSub, 
  DropdownMenuSubTrigger, 
  DropdownMenuSubContent, 
  DropdownMenuRadioGroup, 
  DropdownMenuRadioItem, 
  DropdownMenuCheckboxItem, 
  DropdownMenuShortcut 
};
