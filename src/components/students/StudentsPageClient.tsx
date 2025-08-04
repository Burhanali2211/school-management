"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FilterDropdown, FilterOption } from "@/components/ui/filter-dropdown";
import { SortDropdown, SortOption } from "@/components/ui/sort-dropdown";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StudentsPageClientProps {
  isAdmin: boolean;
  children: React.ReactNode;
  availableClasses?: { id: number; name: string }[];
  availableGrades?: { id: number; level: number }[];
}

const StudentsPageClient = ({ 
  isAdmin, 
  children, 
  availableClasses = [], 
  availableGrades = [] 
}: StudentsPageClientProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);

  // Filter configuration
  const filterOptions: FilterOption[] = useMemo(() => [
    {
      key: "classId",
      label: "Class",
      value: "classId",
      type: "select",
      options: availableClasses.map(cls => ({
        label: cls.name,
        value: cls.id.toString()
      }))
    },
    {
      key: "grade",
      label: "Grade",
      value: "grade",
      type: "multiselect",
      options: availableGrades.map(grade => ({
        label: grade.name || `Grade ${grade.level}`,
        value: grade.id.toString()
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
    },
    {
      key: "gender",
      label: "Gender",
      value: "gender",
      type: "select",
      options: [
        { label: "Male", value: "MALE" },
        { label: "Female", value: "FEMALE" }
      ]
    }
  ], [availableClasses, availableGrades]);

  // Sort configuration
  const sortOptions: SortOption[] = [
    { key: "name", label: "Name", defaultDirection: "asc" },
    { key: "username", label: "Student ID", defaultDirection: "asc" },
    { key: "email", label: "Email", defaultDirection: "asc" },
    { key: "createdAt", label: "Date Added", defaultDirection: "desc" },
    { key: "birthday", label: "Age", defaultDirection: "asc" },
    { key: "class", label: "Class", defaultDirection: "asc" }
  ];

  // Get current filters from URL
  const getCurrentFilters = useCallback(() => {
    const filters: Record<string, string | string[]> = {};
    
    // Parse class filter
    const classParam = searchParams.get("classId");
    if (classParam) {
      filters.classId = classParam;
    }
    
    // Parse grade filter
    const gradeParam = searchParams.get("grade");
    if (gradeParam) {
      filters.grade = gradeParam.split(",");
    }
    
    // Parse status filter
    const statusParam = searchParams.get("status");
    if (statusParam) {
      filters.status = statusParam;
    }
    
    // Parse gender filter
    const genderParam = searchParams.get("gender");
    if (genderParam) {
      filters.gender = genderParam;
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
    
    router.replace(`/list/students?${params.toString()}`);
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
    
    router.replace(`/list/students?${params.toString()}`);
  }, [router, searchParams, filterOptions]);

  // Handle sort changes
  const handleSortChange = useCallback((key: string, direction: "asc" | "desc") => {
    const params = new URLSearchParams(searchParams);
    
    params.set("sortBy", key);
    params.set("sortOrder", direction);
    params.set("page", "1"); // Reset to first page when sorting
    
    router.replace(`/list/students?${params.toString()}`);
  }, [router, searchParams]);

  // Handle clear sort
  const handleClearSort = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    
    params.delete("sortBy");
    params.delete("sortOrder");
    
    router.replace(`/list/students?${params.toString()}`);
  }, [router, searchParams]);

  // Handle add student
  const handleAddStudent = () => {
    setShowAddStudentModal(true);
  };

  return (
    <Card className="space-y-6" fullWidth fullHeight background="transparent" border={false} shadow="none" padding="lg">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Users className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">All Students</h1>
            <p className="text-secondary-500 text-sm">Manage your student body</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Search */}
          <SearchInput 
            placeholder="Search students..." 
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
          
          {/* Add Student */}
          {isAdmin && (
            <Button 
              onClick={handleAddStudent}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Student
            </Button>
          )}
        </div>
      </div>
      
      {/* Content */}
      {children}
    </Card>
  );
};

export default StudentsPageClient;
