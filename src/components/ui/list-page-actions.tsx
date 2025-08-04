"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Filter, SortAsc, Plus, ChevronDown } from "lucide-react";
import { toast } from "react-toastify";

interface ListPageActionsProps {
  showFilter?: boolean;
  showSort?: boolean;
  showCreate?: boolean;
  createButtonText?: string;
  createButtonIcon?: React.ReactNode;
  createButtonClassName?: string;
  filterText?: string;
  sortText?: string;
  filterAction?: string;
  sortAction?: string;
  createAction?: string;
  onCreateClick?: () => void;
}

export const ListPageActions = ({
  showFilter = true,
  showSort = true,
  showCreate = false,
  createButtonText = "Create",
  createButtonIcon = <Plus className="w-4 h-4" />,
  createButtonClassName = "",
  filterText = "Filter",
  sortText = "Sort",
  filterAction = "filter",
  sortAction = "sort",
  createAction = "create",
  onCreateClick,
}: ListPageActionsProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  const handleFilterClick = () => {
    setShowFilterMenu(!showFilterMenu);
    toast.info(`${filterAction} - Basic filtering coming soon!`);
  };

  const handleSortClick = () => {
    setShowSortMenu(!showSortMenu);
    // Add basic sorting functionality
    const params = new URLSearchParams(searchParams);
    const currentSort = params.get('sortBy');
    const currentOrder = params.get('sortOrder');

    // Toggle between asc/desc or set default
    if (currentSort) {
      const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';
      params.set('sortOrder', newOrder);
    } else {
      params.set('sortBy', 'name');
      params.set('sortOrder', 'asc');
    }

    router.push(`?${params.toString()}`);
    toast.success(`Sorted by name ${params.get('sortOrder')}`);
  };

  const handleCreateClick = () => {
    if (onCreateClick) {
      onCreateClick();
    } else {
      toast.info(`${createAction} functionality - Use the + button in the table rows`);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      {showFilter && (
        <Button variant="outline" size="sm" onClick={handleFilterClick}>
          <Filter className="w-4 h-4" />
          {filterText}
          <ChevronDown className="w-3 h-3" />
        </Button>
      )}
      {showSort && (
        <Button variant="outline" size="sm" onClick={handleSortClick}>
          <SortAsc className="w-4 h-4" />
          {sortText}
        </Button>
      )}
      {showCreate && (
        <Button 
          variant="default" 
          size="sm" 
          className={createButtonClassName} 
          onClick={handleCreateClick}
          leftIcon={createButtonIcon}
        >
          {createButtonText}
        </Button>
      )}
    </div>
  );
};

export default ListPageActions;
