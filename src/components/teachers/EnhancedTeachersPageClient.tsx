"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FilterDropdown, FilterOption } from "@/components/ui/filter-dropdown";
import { SortDropdown, SortOption } from "@/components/ui/sort-dropdown";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  GraduationCap, 
  Download, 
  Upload, 
  Trash2, 
  Edit, 
  Eye,
  MoreHorizontal,
  CheckSquare,
  Square,
  AlertTriangle
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import TeacherFormNew from "@/components/forms/TeacherFormNew";
import { toast } from "react-toastify";

interface Teacher {
  id: string;
  username: string;
  name: string;
  surname: string;
  email?: string;
  phone?: string;
  address: string;
  bloodType: string;
  sex: string;
  birthday: string;
  createdAt: string;
  subjects?: { id: number; name: string }[];
  classes?: { id: number; name: string }[];
  statistics?: {
    totalClasses: number;
    totalSubjects: number;
    totalStudents: number;
    experienceYears: number;
  };
}

interface EnhancedTeachersPageClientProps {
  isAdmin: boolean;
  children: React.ReactNode;
  teachers: Teacher[];
  availableSubjects?: { id: number; name: string }[];
  availableClasses?: { id: number; name: string }[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const EnhancedTeachersPageClient = ({ 
  isAdmin, 
  children, 
  teachers,
  availableSubjects = [], 
  availableClasses = [],
  pagination
}: EnhancedTeachersPageClientProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Modal states
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [showEditTeacherModal, setShowEditTeacherModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  
  // Selection states
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  
  // Loading states
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Update select all state based on selected items
  useEffect(() => {
    if (teachers.length === 0) {
      setSelectAll(false);
    } else if (selectedTeachers.length === teachers.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedTeachers.length, teachers.length]);

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
      key: "gender",
      label: "Gender",
      value: "gender",
      type: "select",
      options: [
        { label: "Male", value: "MALE" },
        { label: "Female", value: "FEMALE" }
      ]
    },
    {
      key: "bloodType",
      label: "Blood Type",
      value: "bloodType",
      type: "select",
      options: [
        { label: "A+", value: "A+" },
        { label: "A-", value: "A-" },
        { label: "B+", value: "B+" },
        { label: "B-", value: "B-" },
        { label: "AB+", value: "AB+" },
        { label: "AB-", value: "AB-" },
        { label: "O+", value: "O+" },
        { label: "O-", value: "O-" }
      ]
    }
  ], [availableSubjects, availableClasses]);

  // Sort configuration
  const sortOptions: SortOption[] = [
    { key: "name", label: "Name", defaultDirection: "asc" },
    { key: "username", label: "Teacher ID", defaultDirection: "asc" },
    { key: "email", label: "Email", defaultDirection: "asc" },
    { key: "createdAt", label: "Date Added", defaultDirection: "desc" },
    { key: "experience", label: "Experience", defaultDirection: "desc" },
    { key: "subjects", label: "Subject Count", defaultDirection: "desc" },
    { key: "classes", label: "Class Count", defaultDirection: "desc" }
  ];

  // Get current filters from URL
  const getCurrentFilters = useCallback(() => {
    const filters: Record<string, string | string[]> = {};
    
    filterOptions.forEach(option => {
      const param = searchParams.get(option.key);
      if (param) {
        if (option.type === "multiselect") {
          filters[option.key] = param.split(",");
        } else {
          filters[option.key] = param;
        }
      }
    });
    
    return filters;
  }, [searchParams, filterOptions]);

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
    
    params.set("page", "1");
    router.replace(`/list/teachers?${params.toString()}`);
  }, [router, searchParams]);

  // Handle clear all filters
  const handleClearAllFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    
    filterOptions.forEach(filter => {
      params.delete(filter.key);
    });
    
    params.set("page", "1");
    router.replace(`/list/teachers?${params.toString()}`);
  }, [router, searchParams, filterOptions]);

  // Handle sort changes
  const handleSortChange = useCallback((key: string, direction: "asc" | "desc") => {
    const params = new URLSearchParams(searchParams);
    
    params.set("sortBy", key);
    params.set("sortOrder", direction);
    params.set("page", "1");
    
    router.replace(`/list/teachers?${params.toString()}`);
  }, [router, searchParams]);

  // Handle clear sort
  const handleClearSort = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    
    params.delete("sortBy");
    params.delete("sortOrder");
    
    router.replace(`/list/teachers?${params.toString()}`);
  }, [router, searchParams]);

  // Selection handlers
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedTeachers([]);
    } else {
      setSelectedTeachers(teachers.map(teacher => teacher.id));
    }
  };

  const handleSelectTeacher = (teacherId: string) => {
    setSelectedTeachers(prev => {
      if (prev.includes(teacherId)) {
        return prev.filter(id => id !== teacherId);
      } else {
        return [...prev, teacherId];
      }
    });
  };

  // Action handlers
  const handleAddTeacher = () => {
    setShowAddTeacherModal(true);
  };

  const handleEditTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setShowEditTeacherModal(true);
  };

  const handleDeleteTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setShowDeleteConfirm(true);
  };

  const handleBulkDelete = () => {
    setShowBulkDeleteConfirm(true);
  };

  // Delete single teacher
  const confirmDeleteTeacher = async () => {
    if (!selectedTeacher) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/teachers/${selectedTeacher.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete teacher");
      }

      toast.success("Teacher deleted successfully");
      router.refresh();
      setShowDeleteConfirm(false);
      setSelectedTeacher(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete teacher");
    } finally {
      setIsDeleting(false);
    }
  };

  // Delete multiple teachers
  const confirmBulkDelete = async () => {
    setIsBulkDeleting(true);
    try {
      const response = await fetch(`/api/teachers?ids=${selectedTeachers.join(",")}&force=false`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete teachers");
      }

      const result = await response.json();
      toast.success(`${result.results.deleted.length} teachers deleted successfully`);
      
      if (result.results.errors.length > 0) {
        toast.warning(`${result.results.errors.length} teachers could not be deleted due to dependencies`);
      }

      router.refresh();
      setShowBulkDeleteConfirm(false);
      setSelectedTeachers([]);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete teachers");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // Export teachers
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams(searchParams);
      params.set("export", "true");
      
      const response = await fetch(`/api/teachers?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error("Failed to export data");
      }

      const data = await response.json();
      
      // Convert to CSV
      const csv = [
        ["ID", "Username", "Name", "Surname", "Email", "Phone", "Address", "Blood Type", "Gender", "Birthday", "Subjects", "Classes"].join(","),
        ...data.teachers.map((teacher: Teacher) => [
          teacher.id,
          teacher.username,
          teacher.name,
          teacher.surname,
          teacher.email || "",
          teacher.phone || "",
          `"${teacher.address}"`,
          teacher.bloodType,
          teacher.sex,
          teacher.birthday,
          `"${teacher.subjects?.map(s => s.name).join("; ") || ""}"`,
          `"${teacher.classes?.map(c => c.name).join("; ") || ""}"`
        ].join(","))
      ].join("\n");

      // Download file
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `teachers_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success("Teachers data exported successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = () => {
    // TODO: Implement import functionality
    toast.info("Import functionality coming soon");
  };

  return (
    <>
      <Card className="space-y-6" fullWidth fullHeight background="transparent" border={false} shadow="none" padding="lg">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <GraduationCap className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-secondary-900">All Teachers</h1>
              <p className="text-secondary-500 text-sm">
                {pagination ? `${pagination.total} total teachers` : "Manage your teaching staff"}
              </p>
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
            
            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Export */}
              <Button
                variant="outline"
                onClick={handleExport}
                disabled={isExporting}
                leftIcon={<Download className="w-4 h-4" />}
              >
                {isExporting ? "Exporting..." : "Export"}
              </Button>

              {/* Import */}
              {isAdmin && (
                <Button
                  variant="outline"
                  onClick={handleImport}
                  leftIcon={<Upload className="w-4 h-4" />}
                >
                  Import
                </Button>
              )}

              {/* Add Teacher */}
              {isAdmin && (
                <Button 
                  onClick={handleAddTeacher}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Add Teacher
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedTeachers.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-blue-900">
                  {selectedTeachers.length} teacher{selectedTeachers.length > 1 ? "s" : ""} selected
                </span>
                <button
                  onClick={() => setSelectedTeachers([])}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear selection
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <Button
                    variant="outline"
                    onClick={handleBulkDelete}
                    leftIcon={<Trash2 className="w-4 h-4" />}
                  >
                    Delete Selected
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Selection Header */}
        {teachers.length > 0 && (
          <div className="flex items-center gap-3 pb-2 border-b border-neutral-200">
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-800"
            >
              {selectAll ? (
                <CheckSquare className="w-4 h-4" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              Select all
            </button>
            
            <span className="text-sm text-neutral-500">
              {selectedTeachers.length} of {teachers.length} selected
            </span>
          </div>
        )}
        
        {/* Content */}
        {children}
      </Card>

      {/* Add Teacher Modal */}
      <Modal
        isOpen={showAddTeacherModal}
        onClose={() => setShowAddTeacherModal(false)}
        title="Add New Teacher"
        size="xl"
      >
        <TeacherFormNew
          type="create"
          setOpen={setShowAddTeacherModal}
          relatedData={{
            subjects: availableSubjects,
            classes: availableClasses
          }}
        />
      </Modal>

      {/* Edit Teacher Modal */}
      <Modal
        isOpen={showEditTeacherModal}
        onClose={() => {
          setShowEditTeacherModal(false);
          setSelectedTeacher(null);
        }}
        title="Edit Teacher"
        size="xl"
      >
        {selectedTeacher && (
          <TeacherFormNew
            type="update"
            data={selectedTeacher}
            setOpen={setShowEditTeacherModal}
            relatedData={{
              subjects: availableSubjects,
              classes: availableClasses
            }}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setSelectedTeacher(null);
        }}
        title="Delete Teacher"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-red-600">
            <AlertTriangle className="w-6 h-6" />
            <span className="font-medium">Are you sure you want to delete this teacher?</span>
          </div>
          
          {selectedTeacher && (
            <div className="bg-neutral-50 p-3 rounded-lg">
              <p className="font-medium">{selectedTeacher.name} {selectedTeacher.surname}</p>
              <p className="text-sm text-neutral-600">{selectedTeacher.username}</p>
            </div>
          )}
          
          <p className="text-sm text-neutral-600">
            This action cannot be undone. The teacher will be permanently removed from the system.
          </p>
          
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteConfirm(false);
                setSelectedTeacher(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDeleteTeacher}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete Teacher"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bulk Delete Confirmation Modal */}
      <Modal
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        title="Delete Multiple Teachers"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-red-600">
            <AlertTriangle className="w-6 h-6" />
            <span className="font-medium">Are you sure you want to delete {selectedTeachers.length} teachers?</span>
          </div>
          
          <p className="text-sm text-neutral-600">
            This action cannot be undone. The selected teachers will be permanently removed from the system.
          </p>
          
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowBulkDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmBulkDelete}
              disabled={isBulkDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isBulkDeleting ? "Deleting..." : `Delete ${selectedTeachers.length} Teachers`}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default EnhancedTeachersPageClient;