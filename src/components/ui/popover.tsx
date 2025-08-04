import * as React from "react";
import { cn } from "@/lib/utils";

export interface PopoverProps {
  children: React.ReactNode;
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const Popover = ({ children, className, open, onOpenChange }: PopoverProps) => {
  const [isOpen, setIsOpen] = React.useState(open ?? false);
  const popoverRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        const newOpen = false;
        setIsOpen(newOpen);
        onOpenChange?.(newOpen);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onOpenChange]);

  React.useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  return (
    <div className={cn("relative", className)} ref={popoverRef}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            isOpen,
            setIsOpen: (newOpen: boolean) => {
              setIsOpen(newOpen);
              onOpenChange?.(newOpen);
            }
          } as any);
        }
        return child;
      })}
    </div>
  );
};

const PopoverTrigger = ({ children, className, isOpen, setIsOpen, asChild = false, ...props }: any) => {
  if (asChild && React.isValidElement(children)) {
    const { asChild: _, ...restProps } = props;
    return React.cloneElement(children, {
      className,
      onClick: (e: any) => {
        e.preventDefault();
        setIsOpen && setIsOpen(!isOpen);
        if (children.props && (children.props as any).onClick) {
          (children.props as any).onClick(e);
        }
      },
      ...restProps,
    });
  }
  const { asChild: _, ...restProps } = props;
  return (
    <button
      type="button"
      className={className}
      onClick={() => setIsOpen(!isOpen)}
      {...restProps}
    >
      {children}
    </button>
  );
};

const PopoverContent = ({ children, className, isOpen, side = "bottom", align = "center", ...props }: any) => {
  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        side === "top" && "bottom-full mb-1",
        side === "bottom" && "top-full mt-1",
        side === "left" && "right-full mr-1",
        side === "right" && "left-full ml-1",
        align === "start" && "left-0",
        align === "end" && "right-0",
        align === "center" && "left-1/2 -translate-x-1/2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export { Popover, PopoverTrigger, PopoverContent };
