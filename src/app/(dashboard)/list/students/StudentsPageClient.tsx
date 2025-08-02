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
  Clock,
  UserCheck,
  UserX,
  TrendingUp,
  School
} from "lucide-react";
import { generateInitials, getStatusColor } from "@/lib/utils";
import { StudentList } from "./page";
import { StudentPreview, usePreviewModal } from '@/components/preview';

interface StudentsPageClientProps {
  data: StudentList[];
  isAdmin: boolean;
  totalStudents: number;
  activeStudents: number;
  studentsWithParents: number;
  averageGradeLevel: number;
  availableClasses: { id: number; name: string }[];
  availableParents: { id: string; name: string; surname: string }[];
}

const StudentsPageClient = ({
  data,
  isAdmin,
  totalStudents,
  activeStudents,
  studentsWithParents,
  averageGradeLevel,
  availableClasses,
  availableParents
}: StudentsPageClientProps) => {
  const { isOpen, selectedItem, isLoading, openPreview, closePreview } = usePreviewModal();
  // Define table columns with enhanced rendering
  const columns: Column<StudentList>[] = [
    {
      key: "student",
      header: "Student",
      sortable: true,
      render: (_, student) => (
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={student.img || undefined} alt={student.name} />
            <AvatarFallback className="bg-green-100 text-green-600 font-medium">
              {generateInitials(student.name, student.surname)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-slate-900">
              {student.name} {student.surname}
            </div>
            <div className="text-sm text-slate-500 flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {student.email}
            </div>
          </div>
        </div>
      )
    },
    {
      key: "username",
      header: "Student ID",
      sortable: true,
      className: "hidden md:table-cell",
      render: (value) => (
        <Badge variant="outline" className="font-mono">
          {value}
        </Badge>
      )
    },
    {
      key: "class",
      header: "Class",
      className: "hidden md:table-cell",
      render: (_, student) => (
        <Badge variant="secondary" className="flex items-center gap-1">
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
        <Badge className="bg-blue-100 text-blue-700">
          Grade {student.grade.level}
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
              <div className="text-sm font-medium">
                {student.parent.name} {student.parent.surname}
              </div>
              <div className="text-sm text-slate-500 flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {student.parent.phone}
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
      className: "hidden lg:table-cell",
      render: (_, student) => (
        <div className="space-y-1">
          <div className="text-sm flex items-center gap-1">
            <Phone className="w-3 h-3 text-slate-400" />
            {student.phone}
          </div>
          <div className="text-sm flex items-center gap-1 text-slate-500">
            <MapPin className="w-3 h-3 text-slate-400" />
            {student.address}
          </div>
        </div>
      )
    },
    {
      key: "stats",
      header: "Academic Stats",
      className: "hidden xl:table-cell",
      render: (_, student) => (
        <div className="space-y-1">
          <div className="text-sm flex items-center gap-1">
            <UserCheck className="w-3 h-3 text-green-500" />
            {student._count.attendances} attendances
          </div>
          <div className="text-sm flex items-center gap-1 text-slate-500">
            <Award className="w-3 h-3 text-blue-500" />
            {student._count.results} results
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/50">
      <div className="space-y-8 p-6 max-w-7xl mx-auto">
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
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Student
                </Button>
              )}
            </PageHeaderActions>
          }
        />

        {/* Statistics Cards */}
        <StatsGrid columns={4}>
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
        <Card className="p-0 border-0 shadow-xl bg-white/80 backdrop-blur-sm" shadow="extra">
          <div className="p-6 border-b border-slate-200/60 bg-gradient-to-r from-slate-50/50 to-white">
            <AdvancedFilters
              searchPlaceholder="Search students by name, email, or ID..."
              filters={filterOptions}
              showExport={true}
              showCreate={isAdmin}
              createButtonText="Add Student"
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
              view: (student) => {
                // Open student preview modal
                openPreview(student);
              },
              edit: (student) => {
                // Open edit modal
                console.log("Edit student:", student);
              },
              delete: (student) => {
                // Open delete confirmation
                console.log("Delete student:", student);
              }
            } : undefined}
            onRowClick={(student) => {
              // Open student preview modal
              openPreview(student);
            }}
          />
        </Card>

        {/* Preview Modal */}
        <StudentPreview
          isOpen={isOpen}
          onClose={closePreview}
          student={selectedItem}
        />
      </div>
    </div>
  );
};

export default StudentsPageClient;