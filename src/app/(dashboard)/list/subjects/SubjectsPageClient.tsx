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
  School
} from "lucide-react";
import { generateInitials } from "@/lib/utils";
import { SubjectList } from "./page";

interface SubjectsPageClientProps {
  data: SubjectList[];
  isAdmin: boolean;
  totalSubjects: number;
  subjectsWithTeachers: number;
  totalTeachers: number;
  totalLessons: number;
}

const SubjectsPageClient = ({
  data,
  isAdmin,
  totalSubjects,
  subjectsWithTeachers,
  totalTeachers,
  totalLessons
}: SubjectsPageClientProps) => {
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
      key: "stats",
      header: "Statistics",
      className: "hidden lg:table-cell",
      render: (_, subject) => (
        <div className="space-y-1">
          <div className="text-sm flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            {subject._count.lessons} lessons
          </div>
          <div className="text-sm flex items-center gap-1 text-slate-500">
            <Users className="w-3 h-3 text-slate-400" />
            {subject.teachers.length} teachers
          </div>
        </div>
      )
    }
  ];

  // Define filter options
  const filterOptions: FilterOption[] = [
    {
      key: "teacherCount",
      label: "Teacher Assignment",
      type: "select",
      options: [
        { label: "Has Teachers", value: "1" },
        { label: "No Teachers", value: "0" }
      ]
    }
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <PageHeader
        title="Subjects Management"
        subtitle="Manage academic subjects and curriculum"
        icon="book-open"
        iconColor="text-orange-600"
        iconBgColor="bg-orange-100"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Management", href: "/list" },
          { label: "Subjects" }
        ]}
        actions={
          <PageHeaderActions>
            {isAdmin && (
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Plus className="w-4 h-4 mr-2" />
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
            view: (subject) => {
              // Navigate to subject detail page
              console.log("View subject:", subject);
            },
            edit: (subject) => {
              // Open edit modal
              console.log("Edit subject:", subject);
            },
            delete: (subject) => {
              // Open delete confirmation
              console.log("Delete subject:", subject);
            }
          } : undefined}
          onRowClick={(subject) => {
            // Navigate to subject detail page or show details
            console.log("Subject clicked:", subject);
          }}
        />
      </Card>
    </div>
  );
};

export default SubjectsPageClient;