"use client";

import * as React from "react";
import { useState } from "react";
import { Filter, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface FilterOption {
  key: string;
  label: string;
  value: string;
  type?: "select" | "multiselect" | "date" | "range";
  options?: { label: string; value: string }[];
}

export interface FilterDropdownProps {
  filters: FilterOption[];
  activeFilters: Record<string, string | string[]>;
  onFilterChange: (key: string, value: string | string[] | null) => void;
  onClearAll: () => void;
  className?: string;
}

const FilterDropdown = React.forwardRef<HTMLDivElement, FilterDropdownProps>(
  ({ filters, activeFilters, onFilterChange, onClearAll, className }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const activeFilterCount = Object.keys(activeFilters).filter(
      key => activeFilters[key] && 
      (Array.isArray(activeFilters[key]) ? (activeFilters[key] as string[]).length > 0 : activeFilters[key])
    ).length;

    const filteredFilters = filters.filter(filter =>
      filter.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleFilterSelect = (filterKey: string, value: string, isMultiselect = false) => {
      if (isMultiselect) {
        const currentValues = (activeFilters[filterKey] as string[]) || [];
        const newValues = currentValues.includes(value)
          ? currentValues.filter(v => v !== value)
          : [...currentValues, value];
        onFilterChange(filterKey, newValues.length > 0 ? newValues : null);
      } else {
        onFilterChange(filterKey, activeFilters[filterKey] === value ? null : value);
      }
    };

    const clearFilter = (filterKey: string) => {
      onFilterChange(filterKey, null);
    };

    return (
      <div className={cn("relative", className)} ref={ref}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "gap-2 transition-all duration-200",
            activeFilterCount > 0 && "border-primary-500 bg-primary-50 text-primary-700"
          )}
        >
          <Filter className="w-4 h-4" />
          Filter
          {activeFilterCount > 0 && (
            <Badge variant="primary" size="sm" className="ml-1 px-1.5 py-0.5 text-xs">
              {activeFilterCount}
            </Badge>
          )}
          <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
        </Button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-strong border border-secondary-200 z-50 max-h-96 overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b border-secondary-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-secondary-900">Filters</h3>
                  {activeFilterCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClearAll}
                      className="text-error-600 hover:text-error-700 hover:bg-error-50"
                    >
                      Clear All
                    </Button>
                  )}
                </div>
                
                {/* Search */}
                <input
                  type="text"
                  placeholder="Search filters..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Active Filters */}
              {activeFilterCount > 0 && (
                <div className="p-4 border-b border-secondary-200 bg-secondary-50">
                  <h4 className="text-sm font-medium text-secondary-700 mb-2">Active Filters</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(activeFilters).map(([key, value]) => {
                      if (!value || (Array.isArray(value) && value.length === 0)) return null;
                      
                      const filter = filters.find(f => f.key === key);
                      if (!filter) return null;

                      const displayValue = Array.isArray(value) 
                        ? `${value.length} selected`
                        : filter.options?.find(opt => opt.value === value)?.label || value;

                      return (
                        <Badge
                          key={key}
                          variant="secondary"
                          className="flex items-center gap-1 pr-1"
                        >
                          <span className="text-xs">{filter.label}: {displayValue}</span>
                          <button
                            onClick={() => clearFilter(key)}
                            className="ml-1 hover:bg-secondary-200 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Filter Options */}
              <div className="max-h-64 overflow-y-auto">
                {filteredFilters.length === 0 ? (
                  <div className="p-4 text-center text-secondary-500">
                    No filters found
                  </div>
                ) : (
                  filteredFilters.map((filter) => (
                    <div key={filter.key} className="p-4 border-b border-secondary-100 last:border-b-0">
                      <h4 className="font-medium text-secondary-900 mb-2">{filter.label}</h4>
                      
                      {filter.options && (
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {filter.options.map((option) => {
                            const isSelected = filter.type === "multiselect"
                              ? ((activeFilters[filter.key] as string[]) || []).includes(option.value)
                              : activeFilters[filter.key] === option.value;

                            return (
                              <label
                                key={option.value}
                                className="flex items-center gap-2 cursor-pointer hover:bg-secondary-50 p-1 rounded"
                              >
                                <input
                                  type={filter.type === "multiselect" ? "checkbox" : "radio"}
                                  name={filter.key}
                                  checked={isSelected}
                                  onChange={() => handleFilterSelect(filter.key, option.value, filter.type === "multiselect")}
                                  className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                                />
                                <span className="text-sm text-secondary-700">{option.label}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }
);

FilterDropdown.displayName = "FilterDropdown";

export { FilterDropdown };
