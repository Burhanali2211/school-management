"use client";

import React, { useState, useEffect } from 'react';
import { ModernModal } from '@/components/ui/modern-modal';
import { StudentForm } from '@/components/modern-forms/StudentForm';
import { ModernStudentPreview } from '@/components/modern-preview/ModernStudentPreview';
import { PageHeader, PageHeaderActions } from "@/components/ui/page-header";
import { StatsGrid, StatsCard } from "@/components/ui/stats-card";
import { DataTable, Column } from "@/components/ui/data-table";
import { AdvancedFilters, FilterOption } from "@/components/ui/advanced-filters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users,
  GraduationCap,
  Phone,
  MapPin,
  Mail,
  Plus,
  Eye,
  Edit,
  Trash2,
  BookOpen,
  Calendar,
  Award,
  Clock,
  UserCheck,
  UserX,
  TrendingUp,
  School,
  Search,
  Filter,
  MoreVertical,
  RefreshCw
} from "lucide-react";
import { generateInitials, getStatusColor } from "@/lib/utils";
import { StudentList } from "./page";
import { useAuth } from '@/contexts/AuthContext';
import { toast, Toaster } from '@/lib/notifications';

interface StudentsPageClientProps {
  data: StudentList[];
  isAdmin: boolean;
  totalStudents: number;
  activeStudents: number;
  studentsWithParents: number;
  averageGradeLevel: number;
  availableClasses: { id: number; name: string }[];
  availableParents: { id: string; name: string; surname: string }[];
  availableGrades: { id: number; name: string; level: number }[];
}

const StudentsPageClient = ({
  data: initialData,
  isAdmin,
  totalStudents,
  activeStudents,
  studentsWithParents,
  averageGradeLevel,
  availableClasses,
  availableParents,
  availableGrades
}: StudentsPageClientProps) => {
  const { user } = useAuth();
  const [students, setStudents] = useState<StudentList[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentList | null>(null);

  // Refresh data
  const refreshStudents = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/students?limit=100');
      if (response.ok) {
        const data = await response.json();
        setStudents(data.students || []);
      }
    } catch (error) {
      console.error('Error refreshing students:', error);
      toast.error('Failed to refresh students');
    } finally {
      setLoading(false);
    }
  };

  // Filter students based on search term
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Event handlers
  const handleAddStudent = () => {
    setShowAddModal(true);
  };

  const handleEditStudent = (student: StudentList) => {
    setSelectedStudent(student);
    setShowEditModal(true);
  };

  const handlePreviewStudent = (student: StudentList) => {
    setSelectedStudent(student);
    setShowPreviewModal(true);
  };

  const handleDeleteStudent = (student: StudentList) => {
    setSelectedStudent(student);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedStudent) return;

    try {
      const response = await fetch(`/api/students/${selectedStudent.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setStudents(students.filter(s => s.id !== selectedStudent.id));
        toast.success('Student deleted successfully');
        setShowDeleteModal(false);
        setSelectedStudent(null);
      } else {
        throw new Error('Failed to delete student');
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error('Failed to delete student');
    }
  };

  const handleFormSuccess = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedStudent(null);
    refreshStudents();
  };

  const handleFormCancel = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedStudent(null);
  };

  // Define table columns with enhanced rendering
  const columns: Column<StudentList>[] = [
    {
      key: "student",
      header: "Student",
      sortable: true,
      render: (_, student) => (
        <div className="flex items-center gap-2 sm:gap-3">
          <Avatar className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
            <AvatarImage src={student.img || undefined} alt={student.name} />
            <AvatarFallback className="bg-green-100 text-green-600 font-medium text-xs sm:text-sm">
              {generateInitials(student.name, student.surname)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-slate-900 text-sm sm:text-base truncate">
              {student.name} {student.surname}
            </div>
            <div className="text-xs sm:text-sm text-slate-500 flex items-center gap-1 truncate">
              <Mail className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{student.email}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      key: "username",
      header: "Student ID",
      sortable: true,
      className: "hidden sm:table-cell",
      render: (value) => (
        <Badge variant="outline" className="font-mono text-xs">
          {value}
        </Badge>
      )
    },
    {
      key: "class",
      header: "Class",
      className: "hidden md:table-cell",
      render: (_, student) => (
        <Badge variant="secondary" className="flex items-center gap-1 text-xs">
          <School className="w-3 h-3" />
          {student.class.name}
        </Badge>
      )
    },
    {
      key: "grade",
      header: "Grade Level",
      className: "hidden md:table-cell",
      render: (_, student) => (
        <Badge className="bg-blue-100 text-blue-700 text-xs">
          {student.grade.name}
        </Badge>
      )
    },
    {
      key: "parent",
      header: "Parent",
      className: "hidden lg:table-cell",
      render: (_, student) => (
        <div className="space-y-1">
          {student.parent ? (
            <>
              <div className="text-sm font-medium truncate">
                {student.parent.name} {student.parent.surname}
              </div>
              <div className="text-sm text-slate-500 flex items-center gap-1 truncate">
                <Phone className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{student.parent.phone}</span>
              </div>
            </>
          ) : (
            <span className="text-sm text-slate-400">No parent assigned</span>
          )}
        </div>
      )
    },
    {
      key: "contact",
      header: "Contact",
      className: "hidden xl:table-cell",
      render: (_, student) => (
        <div className="space-y-1">
          <div className="text-sm flex items-center gap-1 truncate">
            <Phone className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <span className="truncate">{student.phone}</span>
          </div>
          <div className="text-sm flex items-center gap-1 text-slate-500 truncate">
            <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <span className="truncate">{student.address}</span>
          </div>
        </div>
      )
    },
    {
      key: "stats",
      header: "Academic Stats",
      className: "hidden 2xl:table-cell",
      render: (_, student) => (
        <div className="space-y-1">
          <div className="text-sm flex items-center gap-1">
            <UserCheck className="w-3 h-3 text-green-500 flex-shrink-0" />
            <span className="truncate">{student._count.attendances} attendances</span>
          </div>
          <div className="text-sm flex items-center gap-1 text-slate-500">
            <Award className="w-3 h-3 text-blue-500 flex-shrink-0" />
            <span className="truncate">{student._count.results} results</span>
          </div>
        </div>
      )
    }
  ];

  // Define filter options
  const filterOptions: FilterOption[] = [
    {
      key: "classId",
      label: "Class",
      type: "select",
      options: availableClasses.map(cls => ({
        label: cls.name,
        value: cls.id.toString()
      }))
    },
    {
      key: "grade",
      label: "Grade Level",
      type: "select",
      options: [
        { label: "Grade 1", value: "1" },
        { label: "Grade 2", value: "2" },
        { label: "Grade 3", value: "3" },
        { label: "Grade 4", value: "4" },
        { label: "Grade 5", value: "5" },
        { label: "Grade 6", value: "6" },
        { label: "Grade 7", value: "7" },
        { label: "Grade 8", value: "8" },
        { label: "Grade 9", value: "9" },
        { label: "Grade 10", value: "10" },
        { label: "Grade 11", value: "11" },
        { label: "Grade 12", value: "12" }
      ]
    },
    {
      key: "parentId",
      label: "Parent",
      type: "select",
      options: availableParents.map(parent => ({
        label: `${parent.name} ${parent.surname}`,
        value: parent.id
      }))
    }
  ];

  // Prepare related data for forms
  const relatedData = {
    parents: availableParents,
    classes: availableClasses,
    grades: availableGrades
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/50">
      <div className="space-y-6 p-4 sm:p-6 lg:p-8 w-full">
        {/* Page Header */}
        <PageHeader
          title="Students Management"
          subtitle="Manage student records and academic progress"
          icon="graduation-cap"
          iconColor="text-emerald-600"
          iconBgColor="bg-emerald-50"
          breadcrumbs={[
            { label: "Dashboard", href: "/" },
            { label: "Management", href: "/list" },
            { label: "Students" }
          ]}
          actions={
            <PageHeaderActions>
              {isAdmin && (
                <Button 
                  variant="default" 
                  size="sm" 
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={handleAddStudent}
                >
                  Add Student
                </Button>
              )}
            </PageHeaderActions>
          }
        />

        {/* Statistics Cards */}
        <StatsGrid columns={{ default: 1, sm: 2, lg: 4 }}>
          <StatsCard
            title="Total Students"
            value={totalStudents}
            subtitle="All registered students"
            icon="users"
            iconColor="text-emerald-600"
            iconBgColor="bg-emerald-50"
          />
          <StatsCard
            title="Active Students"
            value={activeStudents}
            subtitle="Students with classes"
            icon="user-check"
            iconColor="text-blue-600"
            iconBgColor="bg-blue-50"
            trend={{
              value: Math.round((activeStudents / totalStudents) * 100),
              label: "of total",
              isPositive: true
            }}
          />
          <StatsCard
            title="Average Grade Level"
            value={`Grade ${averageGradeLevel}`}
            subtitle="Overall grade level"
            icon="trending-up"
            iconColor="text-purple-600"
            iconBgColor="bg-purple-50"
            trend={{
              value: 5,
              label: "grade levels",
              isPositive: true
            }}
          />
          <StatsCard
            title="With Parents"
            value={studentsWithParents}
            subtitle="Parent connections"
            icon="users"
            iconColor="text-orange-600"
            iconBgColor="bg-orange-50"
          />
        </StatsGrid>

        {/* Enhanced Data Table */}
        <Card className="p-0 border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden" shadow="extra">
          <div className="p-4 sm:p-6 border-b border-slate-200/60 bg-gradient-to-r from-slate-50/50 to-white">
            <AdvancedFilters
              searchPlaceholder="Search students by name, email, or ID..."
              filters={filterOptions}
              showExport={true}
              showCreate={isAdmin}
              createButtonText="Add Student"
              createButtonIcon={<Plus className="w-4 h-4" />}
              onCreateClick={handleAddStudent}
            />
          </div>

          <DataTable
            data={filteredStudents}
            columns={columns}
            searchable={false} // We handle search in AdvancedFilters
            filterable={false} // We handle filters in AdvancedFilters
            selectable={isAdmin}
            pagination={false} // We'll implement custom pagination
            actions={isAdmin ? {
              view: (student) => handlePreviewStudent(student),
              edit: (student) => handleEditStudent(student),
              delete: (student) => handleDeleteStudent(student)
            } : undefined}
            onRowClick={(student) => handlePreviewStudent(student)}
          />
        </Card>

        {/* Add Student Modal */}
        <ModernModal
          isOpen={showAddModal}
          onClose={handleFormCancel}
          title="Add New Student"
          subtitle="Create a new student account"
          size="2xl"
        >
          <StudentForm
            mode="create"
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
            relatedData={relatedData}
          />
        </ModernModal>

        {/* Edit Student Modal */}
        <ModernModal
          isOpen={showEditModal}
          onClose={handleFormCancel}
          title="Edit Student"
          subtitle="Update student information"
          size="2xl"
        >
          {selectedStudent && (
            <StudentForm
              mode="edit"
              initialData={selectedStudent}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
              relatedData={relatedData}
            />
          )}
        </ModernModal>

        {/* Preview Student Modal */}
        <ModernModal
          isOpen={showPreviewModal}
          onClose={() => {
            setShowPreviewModal(false);
            setSelectedStudent(null);
          }}
          title="Student Details"
          subtitle="View student information"
          size="xl"
        >
          {selectedStudent && (
            <ModernStudentPreview student={selectedStudent} />
          )}
        </ModernModal>

        {/* Delete Confirmation Modal */}
        <ModernModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedStudent(null);
          }}
          title="Delete Student"
          subtitle="Are you sure you want to delete this student?"
          variant="error"
          size="md"
          footer={
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedStudent(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
              >
                Delete Student
              </Button>
            </div>
          }
        >
          <div className="text-center py-4">
            <p className="text-gray-600 mb-4">
              This action cannot be undone. This will permanently delete the student
              <strong> {selectedStudent?.name} {selectedStudent?.surname}</strong> and all associated data.
            </p>
          </div>
        </ModernModal>

        <Toaster position="top-right" />
      </div>
    </div>
  );
};

export default StudentsPageClient;