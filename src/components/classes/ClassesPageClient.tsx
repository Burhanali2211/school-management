"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FilterDropdown, FilterOption } from "@/components/ui/filter-dropdown";
import { SortDropdown, SortOption } from "@/components/ui/sort-dropdown";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import { Plus, School } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ModernModal } from "@/components/ui/modern-modal";
import ClassForm from "@/components/forms/ClassForm";

interface ClassesPageClientProps {
  isAdmin: boolean;
  children: React.ReactNode;
  availableGrades?: { level: number }[];
  availableTeachers?: { id: string; name: string }[];
}

const ClassesPageClient = ({ 
  isAdmin, 
  children, 
  availableGrades = [], 
  availableTeachers = [] 
}: ClassesPageClientProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showAddClassModal, setShowAddClassModal] = useState(false);

  // Filter configuration
  const filterOptions: FilterOption[] = useMemo(() => [
    {
      key: "grade",
      label: "Grade Level",
      value: "grade",
      type: "multiselect",
      options: availableGrades.map(grade => ({
        label: grade.name || `Grade ${grade.level}`,
        value: grade.id.toString()
      }))
    },
    {
      key: "supervisor",
      label: "Supervisor",
      value: "supervisor",
      type: "select",
      options: availableTeachers.map(teacher => ({
        label: teacher.name,
        value: teacher.id
      }))
    },
    {
      key: "capacity",
      label: "Capacity Range",
      value: "capacity",
      type: "select",
      options: [
        { label: "Small (1-20)", value: "small" },
        { label: "Medium (21-30)", value: "medium" },
        { label: "Large (31+)", value: "large" }
      ]
    },
    {
      key: "status",
      label: "Status",
      value: "status",
      type: "select",
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" }
      ]
    }
  ], [availableGrades, availableTeachers]);

  // Sort configuration
  const sortOptions: SortOption[] = [
    { key: "name", label: "Class Name", defaultDirection: "asc" },
    { key: "grade", label: "Grade Level", defaultDirection: "asc" },
    { key: "capacity", label: "Capacity", defaultDirection: "desc" },
    { key: "supervisor", label: "Supervisor", defaultDirection: "asc" },
    { key: "id", label: "Class ID", defaultDirection: "desc" },
    { key: "studentCount", label: "Student Count", defaultDirection: "desc" }
  ];

  // Get current filters from URL
  const getCurrentFilters = useCallback(() => {
    const filters: Record<string, string | string[]> = {};
    
    // Parse grade filter
    const gradeParam = searchParams.get("grade");
    if (gradeParam) {
      filters.grade = gradeParam.split(",");
    }
    
    // Parse supervisor filter
    const supervisorParam = searchParams.get("supervisor");
    if (supervisorParam) {
      filters.supervisor = supervisorParam;
    }
    
    // Parse capacity filter
    const capacityParam = searchParams.get("capacity");
    if (capacityParam) {
      filters.capacity = capacityParam;
    }
    
    // Parse status filter
    const statusParam = searchParams.get("status");
    if (statusParam) {
      filters.status = statusParam;
    }
    
    return filters;
  }, [searchParams]);

  // Get current sort from URL
  const getCurrentSort = useCallback(() => {
    const sortBy = searchParams.get("sortBy");
    const sortOrder = searchParams.get("sortOrder") as "asc" | "desc";
    
    if (sortBy && sortOrder) {
      return { key: sortBy, direction: sortOrder };
    }
    
    return undefined;
  }, [searchParams]);

  // Handle filter changes
  const handleFilterChange = useCallback((key: string, value: string | string[] | null) => {
    const params = new URLSearchParams(searchParams);
    
    if (value === null || (Array.isArray(value) && value.length === 0)) {
      params.delete(key);
    } else if (Array.isArray(value)) {
      params.set(key, value.join(","));
    } else {
      params.set(key, value);
    }
    
    // Reset to first page when filtering
    params.set("page", "1");
    
    router.replace(`/list/classes?${params.toString()}`);
  }, [router, searchParams]);

  // Handle clear all filters
  const handleClearAllFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    
    // Remove all filter params
    filterOptions.forEach(filter => {
      params.delete(filter.key);
    });
    
    // Reset to first page
    params.set("page", "1");
    
    router.replace(`/list/classes?${params.toString()}`);
  }, [router, searchParams, filterOptions]);

  // Handle sort changes
  const handleSortChange = useCallback((key: string, direction: "asc" | "desc") => {
    const params = new URLSearchParams(searchParams);
    
    params.set("sortBy", key);
    params.set("sortOrder", direction);
    params.set("page", "1"); // Reset to first page when sorting
    
    router.replace(`/list/classes?${params.toString()}`);
  }, [router, searchParams]);

  // Handle clear sort
  const handleClearSort = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    
    params.delete("sortBy");
    params.delete("sortOrder");
    
    router.replace(`/list/classes?${params.toString()}`);
  }, [router, searchParams]);

  // Handle add class
  const handleAddClass = () => {
    setShowAddClassModal(true);
  };

  // Handle close add class modal
  const handleCloseAddClassModal = () => {
    setShowAddClassModal(false);
  };

  // Prepare related data for the form
  const relatedData = {
    teachers: availableTeachers.map(teacher => ({
      id: teacher.id,
      name: teacher.name,
      surname: ""
    })),
    grades: availableGrades.map(grade => ({
      id: grade.id,
      level: grade.level,
      name: grade.name
    }))
  };

  return (
    <Card className="space-y-6" fullWidth fullHeight background="transparent" border={false} shadow="none" padding="lg">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <School className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">All Classes</h1>
            <p className="text-secondary-500 text-sm">Manage your class structure</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Search */}
          <SearchInput 
            placeholder="Search classes..." 
            searchKey="search"
            className="w-64"
          />
          
          {/* Filter */}
          <FilterDropdown
            filters={filterOptions}
            activeFilters={getCurrentFilters()}
            onFilterChange={handleFilterChange}
            onClearAll={handleClearAllFilters}
          />
          
          {/* Sort */}
          <SortDropdown
            sortOptions={sortOptions}
            currentSort={getCurrentSort()}
            onSortChange={handleSortChange}
            onClearSort={handleClearSort}
          />
          
          {/* Add Class */}
          {isAdmin && (
            <Button 
              onClick={handleAddClass}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Class
            </Button>
          )}
        </div>
      </div>
      
      {/* Content */}
      {children}

      {/* Add Class Modal */}
      <ModernModal
        isOpen={showAddClassModal}
        onClose={handleCloseAddClassModal}
        title="Add New Class"
        size="lg"
      >
        <ClassForm
          type="create"
          setOpen={setShowAddClassModal}
          relatedData={relatedData}
        />
      </ModernModal>
    </Card>
  );
};

export default ClassesPageClient;
