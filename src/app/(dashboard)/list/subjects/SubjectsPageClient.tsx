"use client";

import { useState, useEffect } from 'react';
import { ModernModal } from '@/components/ui/modern-modal';
import { SubjectForm } from '@/components/modern-forms/SubjectForm';
import { PageHeader, PageHeaderActions } from "@/components/ui/page-header";
import { StatsGrid, StatsCard } from "@/components/ui/stats-card";
import { DataTable, Column } from "@/components/ui/data-table";
import { AdvancedFilters, FilterOption } from "@/components/ui/advanced-filters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BookOpen,
  Users,
  Plus,
  Eye,
  Edit,
  Trash2,
  GraduationCap,
  Calendar,
  Award,
  Clock,
  FileText,
  TrendingUp,
  School,
  Search,
  Filter,
  MoreVertical,
  RefreshCw
} from "lucide-react";
import { generateInitials } from "@/lib/utils";
import { SubjectList } from "./page";
import { useAuth } from '@/contexts/AuthContext';
import { toast, Toaster } from '@/lib/notifications';

interface SubjectsPageClientProps {
  data: SubjectList[];
  isAdmin: boolean;
  totalSubjects: number;
  subjectsWithTeachers: number;
  totalTeachers: number;
  totalLessons: number;
  availableTeachers?: { id: string; name: string; surname: string }[];
}

const SubjectsPageClient = ({
  data: initialData,
  isAdmin,
  totalSubjects,
  subjectsWithTeachers,
  totalTeachers,
  totalLessons,
  availableTeachers = []
}: SubjectsPageClientProps) => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<SubjectList[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<SubjectList | null>(null);

  // Refresh data
  const refreshSubjects = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/subjects?limit=100');
      if (response.ok) {
        const data = await response.json();
        setSubjects(data.subjects || []);
      }
    } catch (error) {
      console.error('Error refreshing subjects:', error);
      toast.error('Failed to refresh subjects');
    } finally {
      setLoading(false);
    }
  };

  // Filter subjects based on search term
  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Event handlers
  const handleAddSubject = () => {
    setShowAddModal(true);
  };

  const handleEditSubject = (subject: SubjectList) => {
    setSelectedSubject(subject);
    setShowEditModal(true);
  };

  const handlePreviewSubject = (subject: SubjectList) => {
    setSelectedSubject(subject);
    setShowPreviewModal(true);
  };

  const handleDeleteSubject = (subject: SubjectList) => {
    setSelectedSubject(subject);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedSubject) return;

    try {
      const response = await fetch(`/api/subjects/${selectedSubject.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Subject deleted successfully!');
        refreshSubjects();
        setShowDeleteModal(false);
        setSelectedSubject(null);
      } else {
        toast.error('Failed to delete subject');
      }
    } catch (error) {
      console.error('Error deleting subject:', error);
      toast.error('Failed to delete subject');
    }
  };

  const handleFormSuccess = () => {
    refreshSubjects();
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedSubject(null);
  };

  const handleFormCancel = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedSubject(null);
  };

  // Define table columns with enhanced rendering
  const columns: Column<SubjectList>[] = [
    {
      key: "subject",
      header: "Subject",
      sortable: true,
      render: (_, subject) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <BookOpen className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <div className="font-medium text-slate-900">
              {subject.name}
            </div>
            <div className="text-sm text-slate-500">
              Subject ID: {subject.id}
            </div>
          </div>
        </div>
      )
    },
    {
      key: "teachers",
      header: "Teachers",
      className: "hidden md:table-cell",
      render: (_, subject) => (
        <div className="space-y-2">
          {subject.teachers.length > 0 ? (
            <>
              <div className="flex flex-wrap gap-1">
                {subject.teachers.slice(0, 3).map((teacher) => (
                  <div key={teacher.id} className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-md">
                    <Avatar className="w-5 h-5">
                      <AvatarImage src={teacher.img || undefined} alt={teacher.name} />
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                        {generateInitials(teacher.name, teacher.surname)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium">
                      {teacher.name} {teacher.surname}
                    </span>
                  </div>
                ))}
              </div>
              {subject.teachers.length > 3 && (
                <div className="text-xs text-slate-500">
                  +{subject.teachers.length - 3} more teachers
                </div>
              )}
            </>
          ) : (
            <span className="text-sm text-slate-400">No teachers assigned</span>
          )}
        </div>
      )
    },
    {
      key: "lessons",
      header: "Lessons",
      className: "hidden lg:table-cell",
      render: (_, subject) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium">{subject.lessons?.length || 0}</span>
          <span className="text-xs text-slate-500">lessons</span>
        </div>
      )
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (_, subject) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handlePreviewSubject(subject)}
            className="text-slate-600 hover:text-slate-900"
          >
            <Eye className="w-4 h-4" />
          </Button>
          {isAdmin && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEditSubject(subject)}
                className="text-blue-600 hover:text-blue-700"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteSubject(subject)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      )
    }
  ];

  // Filter options
  const filterOptions: FilterOption[] = [
    {
      key: "teachers",
      label: "Teachers",
      type: "select",
      options: availableTeachers.map(teacher => ({
        value: teacher.id,
        label: `${teacher.name} ${teacher.surname}`
      }))
    }
  ];

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Page Header */}
      <PageHeader
        title="Subjects"
        subtitle="Manage academic subjects and their teacher assignments"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Management", href: "/list" },
          { label: "Subjects" }
        ]}
        actions={
          <PageHeaderActions>
            {isAdmin && (
              <Button 
                variant="default" 
                size="sm" 
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={handleAddSubject}
              >
                Add Subject
              </Button>
            )}
          </PageHeaderActions>
        }
      />

      {/* Statistics Cards */}
      <StatsGrid columns={4}>
        <StatsCard
          title="Total Subjects"
          value={totalSubjects}
          subtitle="All academic subjects"
          icon="book-open"
          iconColor="text-orange-600"
          iconBgColor="bg-orange-100"
        />
        <StatsCard
          title="With Teachers"
          value={subjectsWithTeachers}
          subtitle="Subjects with assigned teachers"
          icon="graduation-cap"
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
          trend={{
            value: Math.round((subjectsWithTeachers / totalSubjects) * 100),
            label: "of total",
            isPositive: true
          }}
        />
        <StatsCard
          title="Total Teachers"
          value={totalTeachers}
          subtitle="Teachers across subjects"
          icon="users"
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />
        <StatsCard
          title="Total Lessons"
          value={totalLessons}
          subtitle="Scheduled lessons"
          icon="calendar"
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
        />
      </StatsGrid>

      {/* Enhanced Data Table */}
      <Card className="p-0" shadow="medium">
        <div className="p-6 border-b border-slate-200">
          <AdvancedFilters
            searchPlaceholder="Search subjects by name..."
            filters={filterOptions}
            showExport={true}
            showCreate={isAdmin}
            createButtonText="Add Subject"
            createButtonIcon={<Plus className="w-4 h-4" />}
            onCreateClick={handleAddSubject}
          />
        </div>

        <DataTable
          data={filteredSubjects}
          columns={columns}
          searchable={false} // We handle search in AdvancedFilters
          filterable={false} // We handle filters in AdvancedFilters
          selectable={isAdmin}
          pagination={false} // We'll implement custom pagination
        />
      </Card>

      {/* Add Subject Modal */}
      <ModernModal
        isOpen={showAddModal}
        onClose={handleFormCancel}
        title="Add New Subject"
        subtitle="Create a new subject and assign teachers"
        size="2xl"
      >
        <SubjectForm
          mode="create"
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
          relatedData={{ teachers: availableTeachers }}
        />
      </ModernModal>

      {/* Edit Subject Modal */}
      <ModernModal
        isOpen={showEditModal}
        onClose={handleFormCancel}
        title="Edit Subject"
        subtitle="Modify subject information and teacher assignments"
        size="2xl"
      >
        <SubjectForm
          mode="update"
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
          initialData={selectedSubject || undefined}
          relatedData={{ teachers: availableTeachers }}
        />
      </ModernModal>

      {/* Delete Confirmation Modal */}
      <ModernModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Subject"
        subtitle={`Are you sure you want to delete "${selectedSubject?.name}"? This action cannot be undone.`}
        size="md"
      >
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => setShowDeleteModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={confirmDelete}
          >
            Delete Subject
          </Button>
        </div>
      </ModernModal>
    </div>
  );
};

export default SubjectsPageClient;