"use client";

import * as React from "react";
import { useState } from "react";
import { SortAsc, SortDesc, ChevronDown, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface SortOption {
  key: string;
  label: string;
  defaultDirection?: "asc" | "desc";
}

export interface SortDropdownProps {
  sortOptions: SortOption[];
  currentSort?: {
    key: string;
    direction: "asc" | "desc";
  };
  onSortChange: (key: string, direction: "asc" | "desc") => void;
  onClearSort: () => void;
  className?: string;
}

const SortDropdown = React.forwardRef<HTMLDivElement, SortDropdownProps>(
  ({ sortOptions, currentSort, onSortChange, onClearSort, className }, ref) => {
    const [isOpen, setIsOpen] = useState(false);

    const currentSortOption = currentSort 
      ? sortOptions.find(option => option.key === currentSort.key)
      : null;

    const handleSortSelect = (key: string, direction: "asc" | "desc") => {
      // If clicking the same sort option with same direction, clear it
      if (currentSort?.key === key && currentSort?.direction === direction) {
        onClearSort();
      } else {
        onSortChange(key, direction);
      }
      setIsOpen(false);
    };

    const toggleDirection = () => {
      if (currentSort) {
        const newDirection = currentSort.direction === "asc" ? "desc" : "asc";
        onSortChange(currentSort.key, newDirection);
      }
    };

    return (
      <div className={cn("relative", className)} ref={ref}>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "gap-2 transition-all duration-200",
              currentSort && "border-primary-500 bg-primary-50 text-primary-700"
            )}
          >
            <ArrowUpDown className="w-4 h-4" />
            Sort
            {currentSort && (
              <Badge variant="primary" size="sm" className="ml-1 px-1.5 py-0.5 text-xs">
                {currentSortOption?.label}
              </Badge>
            )}
            <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
          </Button>

          {/* Quick direction toggle when sort is active */}
          {currentSort && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDirection}
              className="px-2 hover:bg-primary-50"
              title={`Sort ${currentSort.direction === "asc" ? "descending" : "ascending"}`}
            >
              {currentSort.direction === "asc" ? (
                <SortAsc className="w-4 h-4 text-primary-600" />
              ) : (
                <SortDesc className="w-4 h-4 text-primary-600" />
              )}
            </Button>
          )}
        </div>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-strong border border-secondary-200 z-50 overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b border-secondary-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-secondary-900">Sort By</h3>
                  {currentSort && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onClearSort();
                        setIsOpen(false);
                      }}
                      className="text-error-600 hover:text-error-700 hover:bg-error-50"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>

              {/* Sort Options */}
              <div className="max-h-64 overflow-y-auto">
                {sortOptions.map((option) => (
                  <div key={option.key} className="border-b border-secondary-100 last:border-b-0">
                    <div className="p-3">
                      <div className="font-medium text-secondary-900 mb-2">{option.label}</div>
                      <div className="flex gap-2">
                        {/* Ascending */}
                        <button
                          onClick={() => handleSortSelect(option.key, "asc")}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 flex-1",
                            currentSort?.key === option.key && currentSort?.direction === "asc"
                              ? "bg-primary-100 text-primary-700 border border-primary-300"
                              : "hover:bg-secondary-50 text-secondary-600 border border-transparent"
                          )}
                        >
                          <SortAsc className="w-4 h-4" />
                          <span>Ascending</span>
                        </button>

                        {/* Descending */}
                        <button
                          onClick={() => handleSortSelect(option.key, "desc")}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 flex-1",
                            currentSort?.key === option.key && currentSort?.direction === "desc"
                              ? "bg-primary-100 text-primary-700 border border-primary-300"
                              : "hover:bg-secondary-50 text-secondary-600 border border-transparent"
                          )}
                        >
                          <SortDesc className="w-4 h-4" />
                          <span>Descending</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer with current sort info */}
              {currentSort && (
                <div className="p-3 bg-secondary-50 border-t border-secondary-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-secondary-600">
                      Sorted by: <span className="font-medium text-secondary-900">{currentSortOption?.label}</span>
                    </span>
                    <div className="flex items-center gap-1 text-primary-600">
                      {currentSort.direction === "asc" ? (
                        <SortAsc className="w-4 h-4" />
                      ) : (
                        <SortDesc className="w-4 h-4" />
                      )}
                      <span className="capitalize">{currentSort.direction}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  }
);

SortDropdown.displayName = "SortDropdown";

export { SortDropdown };
