"use client";

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
  Clock
} from "lucide-react";
import { generateInitials } from "@/lib/utils";
import { TeacherList } from "./page";
import { TeacherPreview, usePreviewModal } from '@/components/preview';

interface TeachersPageClientProps {
  data: TeacherList[];
  isAdmin: boolean;
  totalTeachers: number;
  activeTeachers: number;
  totalSubjects: number;
  totalClasses: number;
  availableSubjects: { id: number; name: string }[];
  availableClasses: { id: number; name: string }[];
}

const TeachersPageClient = ({
  data,
  isAdmin,
  totalTeachers,
  activeTeachers,
  totalSubjects,
  totalClasses,
  availableSubjects,
  availableClasses
}: TeachersPageClientProps) => {
  const { isOpen, selectedItem, isLoading, openPreview, closePreview } = usePreviewModal();
  // Define table columns with enhanced rendering
  const columns: Column<TeacherList>[] = [
    {
      key: "teacher",
      header: "Teacher",
      sortable: true,
      render: (_, teacher) => (
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={teacher.img || undefined} alt={teacher.name} />
            <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
              {generateInitials(teacher.name, teacher.surname)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-slate-900">
              {teacher.name} {teacher.surname}
            </div>
            <div className="text-sm text-slate-500 flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {teacher.email}
            </div>
          </div>
        </div>
      )
    },
    {
      key: "username",
      header: "Teacher ID",
      sortable: true,
      className: "hidden md:table-cell",
      render: (value) => (
        <Badge variant="outline" className="font-mono">
          {value}
        </Badge>
      )
    },
    {
      key: "subjects",
      header: "Subjects",
      className: "hidden md:table-cell",
      render: (_, teacher) => (
        <div className="flex flex-wrap gap-1">
          {teacher.subjects.slice(0, 2).map((subject) => (
            <Badge key={subject.id} variant="secondary" className="text-xs">
              {subject.name}
            </Badge>
          ))}
          {teacher.subjects.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{teacher.subjects.length - 2}
            </Badge>
          )}
        </div>
      )
    },
    {
      key: "classes",
      header: "Classes",
      className: "hidden md:table-cell",
      render: (_, teacher) => (
        <div className="flex flex-wrap gap-1">
          {teacher.classes.slice(0, 2).map((cls) => (
            <Badge key={cls.id} variant="secondary" className="text-xs">
              {cls.name}
            </Badge>
          ))}
          {teacher.classes.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{teacher.classes.length - 2}
            </Badge>
          )}
        </div>
      )
    },
    {
      key: "contact",
      header: "Contact",
      className: "hidden lg:table-cell",
      render: (_, teacher) => (
        <div className="space-y-1">
          <div className="text-sm flex items-center gap-1">
            <Phone className="w-3 h-3 text-slate-400" />
            {teacher.phone}
          </div>
          <div className="text-sm flex items-center gap-1 text-slate-500">
            <MapPin className="w-3 h-3 text-slate-400" />
            {teacher.address}
          </div>
        </div>
      )
    },
    {
      key: "stats",
      header: "Stats",
      className: "hidden xl:table-cell",
      render: (_, teacher) => (
        <div className="space-y-1">
          <div className="text-sm flex items-center gap-1">
            <BookOpen className="w-3 h-3 text-slate-400" />
            {teacher._count.lessons} lessons
          </div>
          <div className="text-sm flex items-center gap-1 text-slate-500">
            <GraduationCap className="w-3 h-3 text-slate-400" />
            {teacher._count.classes} classes
          </div>
        </div>
      )
    }
  ];

  // Define filter options
  const filterOptions: FilterOption[] = [
    {
      key: "subjects",
      label: "Subjects",
      type: "multiselect",
      options: availableSubjects.map(subject => ({
        label: subject.name,
        value: subject.id.toString()
      }))
    },
    {
      key: "classes",
      label: "Classes",
      type: "multiselect",
      options: availableClasses.map(cls => ({
        label: cls.name,
        value: cls.id.toString()
      }))
    },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" }
      ]
    }
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <PageHeader
        title="Teachers Management"
        subtitle="Manage your teaching staff and their assignments"
        icon="graduation-cap"
        iconColor="text-blue-600"
        iconBgColor="bg-blue-100"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Management", href: "/list" },
          { label: "Teachers" }
        ]}
        actions={
          <PageHeaderActions>
            {isAdmin && (
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Teacher
              </Button>
            )}
          </PageHeaderActions>
        }
      />

      {/* Statistics Cards */}
      <StatsGrid columns={4}>
        <StatsCard
          title="Total Teachers"
          value={totalTeachers}
          subtitle="All registered teachers"
          icon="users"
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
        />
        <StatsCard
          title="Active Teachers"
          value={activeTeachers}
          subtitle="Teachers with subjects"
          icon="award"
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
          trend={{
            value: Math.round((activeTeachers / totalTeachers) * 100),
            label: "of total",
            isPositive: true
          }}
        />
        <StatsCard
          title="Total Subjects"
          value={totalSubjects}
          subtitle="Available subjects"
          icon="book-open"
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
        />
        <StatsCard
          title="Total Classes"
          value={totalClasses}
          subtitle="Active classes"
          icon="calendar"
          iconColor="text-orange-600"
          iconBgColor="bg-orange-100"
        />
      </StatsGrid>

      {/* Enhanced Data Table */}
      <Card className="p-0" shadow="medium">
        <div className="p-6 border-b border-slate-200">
          <AdvancedFilters
            searchPlaceholder="Search teachers by name, email, or ID..."
            filters={filterOptions}
            showExport={true}
            showCreate={isAdmin}
            createButtonText="Add Teacher"
            createButtonIcon={<Plus className="w-4 h-4" />}
          />
        </div>

        <DataTable
          data={data}
          columns={columns}
          searchable={false} // We handle search in AdvancedFilters
          filterable={false} // We handle filters in AdvancedFilters
          selectable={isAdmin}
          pagination={false} // We'll implement custom pagination
          actions={isAdmin ? {
            view: (teacher) => {
              // Open teacher preview modal
              openPreview(teacher);
            },
            edit: (teacher) => {
              // Open edit modal
              console.log("Edit teacher:", teacher);
            },
            delete: (teacher) => {
              // Open delete confirmation
              console.log("Delete teacher:", teacher);
            }
          } : undefined}
          onRowClick={(teacher) => {
            // Open teacher preview modal
            openPreview(teacher);
          }}
        />
      </Card>

      {/* Preview Modal */}
      <TeacherPreview
        isOpen={isOpen}
        onClose={closePreview}
        teacher={selectedItem}
      />
    </div>
  );
};

export default TeachersPageClient;