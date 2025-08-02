"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FilterDropdown, FilterOption } from "@/components/ui/filter-dropdown";
import { SortDropdown, SortOption } from "@/components/ui/sort-dropdown";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import { Plus, GraduationCap } from "lucide-react";
import { Card } from "@/components/ui/card";

interface TeachersPageClientProps {
  isAdmin: boolean;
  children: React.ReactNode;
  availableSubjects?: { id: number; name: string }[];
  availableClasses?: { id: number; name: string }[];
}

const TeachersPageClient = ({ 
  isAdmin, 
  children, 
  availableSubjects = [], 
  availableClasses = [] 
}: TeachersPageClientProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);

  // Filter configuration
  const filterOptions: FilterOption[] = useMemo(() => [
    {
      key: "subjects",
      label: "Subjects",
      value: "subjects",
      type: "multiselect",
      options: availableSubjects.map(subject => ({
        label: subject.name,
        value: subject.id.toString()
      }))
    },
    {
      key: "classes",
      label: "Classes",
      value: "classes",
      type: "multiselect",
      options: availableClasses.map(cls => ({
        label: cls.name,
        value: cls.id.toString()
      }))
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
  ], [availableSubjects, availableClasses]);

  // Sort configuration
  const sortOptions: SortOption[] = [
    { key: "name", label: "Name", defaultDirection: "asc" },
    { key: "username", label: "Teacher ID", defaultDirection: "asc" },
    { key: "email", label: "Email", defaultDirection: "asc" },
    { key: "createdAt", label: "Date Added", defaultDirection: "desc" },
    { key: "subjects", label: "Subject Count", defaultDirection: "desc" },
    { key: "classes", label: "Class Count", defaultDirection: "desc" }
  ];

  // Get current filters from URL
  const getCurrentFilters = useCallback(() => {
    const filters: Record<string, string | string[]> = {};
    
    // Parse subjects filter
    const subjectsParam = searchParams.get("subjects");
    if (subjectsParam) {
      filters.subjects = subjectsParam.split(",");
    }
    
    // Parse classes filter
    const classesParam = searchParams.get("classes");
    if (classesParam) {
      filters.classes = classesParam.split(",");
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
    
    router.replace(`/list/teachers?${params.toString()}`);
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
    
    router.replace(`/list/teachers?${params.toString()}`);
  }, [router, searchParams, filterOptions]);

  // Handle sort changes
  const handleSortChange = useCallback((key: string, direction: "asc" | "desc") => {
    const params = new URLSearchParams(searchParams);
    
    params.set("sortBy", key);
    params.set("sortOrder", direction);
    params.set("page", "1"); // Reset to first page when sorting
    
    router.replace(`/list/teachers?${params.toString()}`);
  }, [router, searchParams]);

  // Handle clear sort
  const handleClearSort = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    
    params.delete("sortBy");
    params.delete("sortOrder");
    
    router.replace(`/list/teachers?${params.toString()}`);
  }, [router, searchParams]);

  // Handle add teacher
  const handleAddTeacher = () => {
    setShowAddTeacherModal(true);
  };

  return (
    <Card className="space-y-6" fullWidth fullHeight background="transparent" border={false} shadow="none" padding="lg">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <GraduationCap className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">All Teachers</h1>
            <p className="text-secondary-500 text-sm">Manage your teaching staff</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Search */}
          <SearchInput 
            placeholder="Search teachers..." 
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
          
          {/* Add Teacher */}
          {isAdmin && (
            <Button 
              onClick={handleAddTeacher}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Teacher
            </Button>
          )}
        </div>
      </div>
      
      {/* Content */}
      {children}
    </Card>
  );
};

export default TeachersPageClient;
