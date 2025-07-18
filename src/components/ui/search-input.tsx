"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDebouncedCallback } from "use-debounce";

export interface SearchInputProps {
  placeholder?: string;
  searchKey?: string;
  className?: string;
  showClearButton?: boolean;
  debounceMs?: number;
  onSearchChange?: (value: string) => void;
  disabled?: boolean;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ 
    placeholder = "Search...", 
    searchKey = "search",
    className,
    showClearButton = true,
    debounceMs = 300,
    onSearchChange,
    disabled = false
  }, ref) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    
    const [searchValue, setSearchValue] = useState(searchParams.get(searchKey) || "");
    const [isSearching, setIsSearching] = useState(false);

    // Debounced search function
    const debouncedSearch = useDebouncedCallback(
      useCallback((value: string) => {
        setIsSearching(true);
        
        const params = new URLSearchParams(searchParams);
        
        if (value.trim()) {
          params.set(searchKey, value.trim());
          params.set("page", "1"); // Reset to first page when searching
        } else {
          params.delete(searchKey);
        }

        // Update URL
        router.replace(`${pathname}?${params.toString()}`);
        
        // Call external handler if provided
        if (onSearchChange) {
          onSearchChange(value.trim());
        }

        // Simulate search delay for UX
        setTimeout(() => setIsSearching(false), 200);
      }, [router, pathname, searchParams, searchKey, onSearchChange]),
      debounceMs
    );

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchValue(value);
      debouncedSearch(value);
    };

    // Handle clear search
    const handleClear = () => {
      setSearchValue("");
      debouncedSearch("");
    };

    // Handle keyboard shortcuts
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        handleClear();
        e.currentTarget.blur();
      }
    };

    // Sync with URL params when they change externally
    useEffect(() => {
      const urlSearchValue = searchParams.get(searchKey) || "";
      if (urlSearchValue !== searchValue) {
        setSearchValue(urlSearchValue);
      }
    }, [searchParams, searchKey, searchValue]);

    return (
      <div className={cn("relative flex items-center", className)}>
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400">
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </div>
          
          <Input
            ref={ref}
            type="text"
            placeholder={placeholder}
            value={searchValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            className={cn(
              "pl-10 pr-10 transition-all duration-200",
              searchValue && "border-primary-300 bg-primary-50/50",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          />

          {showClearButton && searchValue && !disabled && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-secondary-100 rounded-full"
              title="Clear search"
            >
              <X className="w-4 h-4 text-secondary-400 hover:text-secondary-600" />
            </Button>
          )}
        </div>

        {/* Search suggestions or results count could go here */}
        {searchValue && (
          <div className="absolute top-full left-0 right-0 mt-1 text-xs text-secondary-500 px-3">
            {isSearching ? (
              <span>Searching...</span>
            ) : (
              <span>Press Escape to clear</span>
            )}
          </div>
        )}
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";

export { SearchInput };
