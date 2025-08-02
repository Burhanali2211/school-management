"use client";

import { PageHeader, PageHeaderActions } from "@/components/ui/page-header";
import { StatsGrid, StatsCard } from "@/components/ui/stats-card";
import { DataTable, Column } from "@/components/ui/data-table";
import { AdvancedFilters, FilterOption } from "@/components/ui/advanced-filters";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users,
  Phone,
  MapPin,
  Mail,
  Plus,
  Calendar,
  Baby,
} from "lucide-react";
import { generateInitials, formatDate } from "@/lib/utils";
import { ParentList } from "./page";
import { ParentPreview, usePreviewModal } from '@/components/preview';

interface ParentsPageClientProps {
  data: ParentList[];
  isAdmin: boolean;
  totalParents: number;
  parentsWithChildren: number;
  totalChildren: number;
  averageChildrenPerParent: number;
}

const ParentsPageClient = ({
  data,
  isAdmin,
  totalParents,
  parentsWithChildren,
  totalChildren,
  averageChildrenPerParent
}: ParentsPageClientProps) => {
  const { isOpen, selectedItem, isLoading, openPreview, closePreview } = usePreviewModal();
  const columns: Column<ParentList>[] = [
    {
      key: "parent",
      header: "Parent",
      sortable: true,
      render: (_, parent) => (
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={parent.img || undefined} alt={parent.name} />
            <AvatarFallback className="bg-pink-100 text-pink-600 font-medium">
              {generateInitials(parent.name, parent.surname)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-slate-900">
              {parent.name} {parent.surname}
            </div>
            <div className="text-sm text-slate-500 flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {parent.email}
            </div>
          </div>
        </div>
      )
    },
    {
      key: "students",
      header: "Children",
      className: "hidden md:table-cell",
      render: (_, parent) => (
        <div className="space-y-1">
          {parent.students.length > 0 ? (
            parent.students.slice(0, 2).map((student) => (
              <div key={student.id} className="flex items-center gap-1">
                <Baby className="w-3 h-3 text-blue-500" />
                <span className="text-sm">{student.name} {student.surname}</span>
              </div>
            ))
          ) : (
            <span className="text-sm text-slate-400">No children assigned</span>
          )}
          {parent.students.length > 2 && (
            <div className="text-xs text-slate-500">
              +{parent.students.length - 2} more
            </div>
          )}
        </div>
      )
    },
    {
      key: "contact",
      header: "Contact",
      className: "hidden lg:table-cell",
      render: (_, parent) => (
        <div className="space-y-1">
          <div className="text-sm flex items-center gap-1">
            <Phone className="w-3 h-3 text-slate-400" />
            {parent.phone}
          </div>
          <div className="text-sm flex items-center gap-1 text-slate-500">
            <MapPin className="w-3 h-3 text-slate-400" />
            {parent.address}
          </div>
        </div>
      )
    },
    {
      key: "stats",
      header: "Family Stats",
      className: "hidden xl:table-cell",
      render: (_, parent) => (
        <div className="space-y-1">
          <div className="text-sm flex items-center gap-1">
            <Users className="w-3 h-3 text-slate-400" />
            {parent.students.length} children
          </div>
          <div className="text-sm flex items-center gap-1 text-slate-500">
            <Calendar className="w-3 h-3 text-slate-400" />
            Joined {formatDate(parent.createdAt)}
          </div>
        </div>
      )
    }
  ];

  const filterOptions: FilterOption[] = [
    {
      key: "studentCount",
      label: "Children Count",
      type: "select",
      options: [
        { label: "Has Children", value: "1" },
        { label: "No Children", value: "0" },
        { label: "Multiple Children", value: "2" }
      ]
    }
  ];

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Parents Management"
        subtitle="Manage parent information and family connections"
        icon="heart"
        iconColor="text-pink-600"
        iconBgColor="bg-pink-100"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Management", href: "/list" },
          { label: "Parents" }
        ]}
        actions={
          <PageHeaderActions>
            {isAdmin && (
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Parent
              </Button>
            )}
          </PageHeaderActions>
        }
      />

      <StatsGrid columns={4}>
        <StatsCard
          title="Total Parents"
          value={totalParents}
          subtitle="All registered parents"
          icon="users"
          iconColor="text-pink-600"
          iconBgColor="bg-pink-100"
        />
        <StatsCard
          title="With Children"
          value={parentsWithChildren}
          subtitle="Parents with assigned children"
          icon="user-check"
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
          trend={{
            value: Math.round((parentsWithChildren / totalParents) * 100),
            label: "of total",
            isPositive: true
          }}
        />
        <StatsCard
          title="Total Children"
          value={totalChildren}
          subtitle="Children under care"
          icon="baby"
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
        />
        <StatsCard
          title="Avg Children/Parent"
          value={averageChildrenPerParent}
          subtitle="Family size average"
          icon="school"
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
        />
      </StatsGrid>

      <Card className="p-0" shadow="medium">
        <div className="p-6 border-b border-slate-200">
          <AdvancedFilters
            searchPlaceholder="Search parents by name, email, or phone..."
            filters={filterOptions}
            showExport={true}
            showCreate={isAdmin}
            createButtonText="Add Parent"
            createButtonIcon={<Plus className="w-4 h-4" />}
          />
        </div>

        <DataTable
          data={data}
          columns={columns}
          searchable={false}
          filterable={false}
          selectable={isAdmin}
          pagination={false}
          actions={isAdmin ? {
            view: (parent) => {
              // Open parent preview modal
              openPreview(parent);
            },
            edit: (parent) => {
              // Open edit modal
              console.log("Edit parent:", parent);
            },
            delete: (parent) => {
              // Open delete confirmation
              console.log("Delete parent:", parent);
            }
          } : undefined}
          onRowClick={(parent) => {
            // Open parent preview modal
            openPreview(parent);
          }}
        />
      </Card>

      {/* Preview Modal */}
      <ParentPreview
        isOpen={isOpen}
        onClose={closePreview}
        parent={selectedItem}
      />
    </div>
  );
};

export default ParentsPageClient;