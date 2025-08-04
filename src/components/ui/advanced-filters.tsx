"use client";

import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Badge } from './badge';
import { 
  Search, 
  Filter, 
  X, 
  ChevronDown,
  SlidersHorizontal,
  Download,
  Plus
} from 'lucide-react';

export interface FilterOption {
  key: string;
  label: string;
  type: 'select' | 'multiselect' | 'date' | 'range' | 'text';
  options?: Array<{ label: string; value: string }>;
  placeholder?: string;
}

interface AdvancedFiltersProps {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filters?: FilterOption[];
  activeFilters?: Record<string, any>;
  onFilterChange?: (key: string, value: any) => void;
  onClearFilters?: () => void;
  showExport?: boolean;
  onExport?: () => void;
  showCreate?: boolean;
  onCreateClick?: () => void;
  createButtonText?: string;
  createButtonIcon?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

export function AdvancedFilters({
  searchPlaceholder = "Search...",
  searchValue = "",
  onSearchChange,
  filters = [],
  activeFilters = {},
  onFilterChange,
  onClearFilters,
  showExport = true,
  onExport,
  showCreate = false,
  onCreateClick,
  createButtonText = "Create",
  createButtonIcon = <Plus className="w-4 h-4" />,
  className,
  children
}: AdvancedFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState(searchValue);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    onSearchChange?.(value);
  }, [onSearchChange]);

  const activeFilterCount = Object.values(activeFilters).filter(value => 
    value !== null && value !== undefined && value !== '' && 
    (!Array.isArray(value) || value.length > 0)
  ).length;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          />
          {searchTerm && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Filter Toggle */}
          {filters.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="relative"
              leftIcon={<SlidersHorizontal className="w-4 h-4" />}
              rightIcon={<ChevronDown className={cn(
                "w-4 h-4 transition-transform",
                showFilters && "rotate-180"
              )} />}
            >
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          )}

          {/* Export Button */}
          {showExport && (
            <Button variant="outline" size="sm" onClick={onExport} leftIcon={<Download className="w-4 h-4" />}>
              <span className="hidden sm:inline">Export</span>
            </Button>
          )}

          {/* Create Button */}
          {showCreate && (
            <Button size="sm" onClick={onCreateClick} leftIcon={createButtonIcon}>
              {createButtonText}
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 px-3 sm:px-4">
          <span className="text-sm text-slate-600 flex-shrink-0">Active filters:</span>
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            {Object.entries(activeFilters).map(([key, value]) => {
              if (!value || (Array.isArray(value) && value.length === 0)) return null;
              
              const filter = filters.find(f => f.key === key);
              const displayValue = Array.isArray(value) ? value.join(', ') : String(value);
              
              return (
                <Badge
                  key={key}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  <span className="text-xs">
                    {filter?.label}: {displayValue}
                  </span>
                  <button
                    onClick={() => onFilterChange?.(key, null)}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              );
            })}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-xs h-6 px-2"
            >
              Clear all
            </Button>
          </div>
        </div>
      )}

      {/* Expanded Filters */}
      {showFilters && filters.length > 0 && (
        <div className="p-3 sm:p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filters.map((filter) => (
              <div key={filter.key} className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  {filter.label}
                </label>
                
                {filter.type === 'select' && (
                  <select
                    value={activeFilters[filter.key] || ''}
                    onChange={(e) => onFilterChange?.(filter.key, e.target.value || null)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{filter.placeholder || 'Select...'}</option>
                    {filter.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}

                {filter.type === 'multiselect' && (
                  <div className="space-y-2 max-h-32 overflow-y-auto border border-slate-200 rounded-lg p-2">
                    {filter.options?.map((option) => (
                      <label key={option.value} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={(activeFilters[filter.key] || []).includes(option.value)}
                          onChange={(e) => {
                            const current = activeFilters[filter.key] || [];
                            const updated = e.target.checked
                              ? [...current, option.value]
                              : current.filter((v: string) => v !== option.value);
                            onFilterChange?.(filter.key, updated.length > 0 ? updated : null);
                          }}
                          className="rounded border-gray-300 text-black focus:ring-black"
                        />
                        <span className="text-sm text-slate-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                )}

                {filter.type === 'text' && (
                  <input
                    type="text"
                    placeholder={filter.placeholder}
                    value={activeFilters[filter.key] || ''}
                    onChange={(e) => onFilterChange?.(filter.key, e.target.value || null)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}

                {filter.type === 'date' && (
                  <input
                    type="date"
                    value={activeFilters[filter.key] || ''}
                    onChange={(e) => onFilterChange?.(filter.key, e.target.value || null)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Additional Content */}
      {children}
    </div>
  );
}
