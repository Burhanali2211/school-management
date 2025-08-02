"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";

interface TableSearchProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

const TableSearch = ({
  placeholder = "Search...",
  value: controlledValue,
  onChange: controlledOnChange,
  className = ""
}: TableSearchProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [internalValue, setInternalValue] = useState("");

  const isControlled = controlledValue !== undefined;
  const inputValue = isControlled ? controlledValue : internalValue;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isControlled) {
      const params = new URLSearchParams(searchParams);
      if (inputValue.trim()) {
        params.set("search", inputValue.trim());
      } else {
        params.delete("search");
      }
      router.push(`${pathname}?${params}`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isControlled && controlledOnChange) {
      controlledOnChange(e);
    } else {
      setInternalValue(e.target.value);
    }
  };

  const handleClear = () => {
    if (isControlled && controlledOnChange) {
      controlledOnChange({ target: { value: "" } } as React.ChangeEvent<HTMLInputElement>);
    } else {
      setInternalValue("");
      const params = new URLSearchParams(searchParams);
      params.delete("search");
      router.push(`${pathname}?${params}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative flex items-center w-full max-w-md ${className}`}
    >
      <div className="relative flex-1 min-w-0">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-neutral-400" />
        <input
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 bg-white border border-neutral-300 rounded-xl text-sm sm:text-base placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md focus:shadow-lg"
          style={{ minHeight: '44px' }} // Ensure 44px minimum touch target
        />
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors p-1 rounded-full hover:bg-neutral-100"
            style={{ minWidth: '44px', minHeight: '44px' }} // Ensure 44px minimum touch target
            aria-label="Clear search"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}
      </div>
    </form>
  );
};

export default TableSearch;
