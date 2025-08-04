"use client";

import { useState, useEffect } from 'react';
import { ModernModal } from '@/components/ui/modern-modal';
import { ParentForm } from '@/components/modern-forms/ParentForm';
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
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  MoreVertical,
  RefreshCw
} from "lucide-react";
import { generateInitials, formatDate } from "@/lib/utils";
import { ParentList } from "./page";
import { useAuth } from '@/contexts/AuthContext';
import { toast, Toaster } from '@/lib/notifications';

interface ParentsPageClientProps {
  data: ParentList[];
  totalParents: number;
  parentsWithChildren: number;
  totalChildren: number;
  averageChildrenPerParent: number;
  availableStudents?: { id: string; name: string; surname: string; parentId: string }[];
}

const ParentsPageClient = ({
  data: initialData,
  totalParents,
  parentsWithChildren,
  totalChildren,
  averageChildrenPerParent,
  availableStudents = []
}: ParentsPageClientProps) => {
  // Filter out students that already have parents assigned
  const orphanedStudents = availableStudents.filter(student => 
    !initialData.some(parent => 
      parent.students.some(parentStudent => parentStudent.id === student.id)
    )
  );
  const { user } = useAuth();
  const isAdmin = user?.userType === 'ADMIN';
  const [parents, setParents] = useState<ParentList[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedParent, setSelectedParent] = useState<ParentList | null>(null);

  // Refresh data
  const refreshParents = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/parents?limit=100');
      if (response.ok) {
        const data = await response.json();
        setParents(data.parents || []);
      }
    } catch (error) {
      console.error('Error refreshing parents:', error);
      toast.error('Failed to refresh parents');
    } finally {
      setLoading(false);
    }
  };

  // Filter parents based on search term
  const filteredParents = parents.filter(parent =>
    parent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parent.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parent.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parent.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Event handlers
  const handleAddParent = () => {
    setShowAddModal(true);
  };

  const handleEditParent = (parent: ParentList) => {
    setSelectedParent(parent);
    setShowEditModal(true);
  };

  const handlePreviewParent = (parent: ParentList) => {
    setSelectedParent(parent);
    setShowPreviewModal(true);
  };

  const handleDeleteParent = (parent: ParentList) => {
    setSelectedParent(parent);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedParent) return;

    try {
      const response = await fetch(`/api/parents/${selectedParent.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Parent deleted successfully!');
        refreshParents();
        setShowDeleteModal(false);
        setSelectedParent(null);
      } else {
        toast.error('Failed to delete parent');
      }
    } catch (error) {
      console.error('Error deleting parent:', error);
      toast.error('Failed to delete parent');
    }
  };

  const handleFormSuccess = () => {
    refreshParents();
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedParent(null);
  };

  const handleFormCancel = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedParent(null);
  };

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
            <MapPin className="w-3 h-3" />
            {parent.address}
          </div>
        </div>
      )
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (_, parent) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handlePreviewParent(parent)}
            className="text-slate-600 hover:text-slate-900"
          >
            <Eye className="w-4 h-4" />
          </Button>
          {isAdmin && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEditParent(parent)}
                className="text-blue-600 hover:text-blue-700"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteParent(parent)}
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
      key: "hasChildren",
      label: "Children Status",
      type: "select",
      options: [
        { label: "Has Children", value: "true" },
        { label: "No Children", value: "false" }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Page Header */}
      <PageHeader
        title="Parents"
        subtitle="Manage parent accounts and their children"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Management", href: "/list" },
          { label: "Parents" }
        ]}
        actions={
          <PageHeaderActions>
            {isAdmin && (
              <Button 
                variant="default" 
                size="sm" 
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={handleAddParent}
              >
                Add Parent
              </Button>
            )}
          </PageHeaderActions>
        }
      />

      {/* Statistics Cards */}
      <StatsGrid columns={4}>
        <StatsCard
          title="Total Parents"
          value={totalParents}
          subtitle="All parent accounts"
          icon="users"
          iconColor="text-pink-600"
          iconBgColor="bg-pink-100"
        />
        <StatsCard
          title="With Children"
          value={parentsWithChildren}
          subtitle="Parents with assigned children"
          icon="baby"
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
          trend={{
            value: Math.round((parentsWithChildren / totalParents) * 100),
            label: "of total",
            isPositive: true
          }}
        />
        <StatsCard
          title="Total Children"
          value={totalChildren}
          subtitle="Students with parents"
          icon="graduation-cap"
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />
        <StatsCard
          title="Avg Children/Parent"
          value={averageChildrenPerParent.toFixed(1)}
          subtitle="Average children per parent"
          icon="trending-up"
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
        />
      </StatsGrid>

      {/* Enhanced Data Table */}
      <Card className="p-0" shadow="medium">
        <div className="p-6 border-b border-slate-200">
          <AdvancedFilters
            searchPlaceholder="Search parents by name, email, or phone..."
            filters={filterOptions}
            showExport={true}
            showCreate={isAdmin}
            createButtonText="Add Parent"
            createButtonIcon={<Plus className="w-4 h-4" />}
            onCreateClick={handleAddParent}
          />
        </div>

        <DataTable
          data={filteredParents}
          columns={columns}
          searchable={false} // We handle search in AdvancedFilters
          filterable={false} // We handle filters in AdvancedFilters
          selectable={isAdmin}
          pagination={false} // We'll implement custom pagination
        />
      </Card>

      {/* Add Parent Modal */}
      <ModernModal
        isOpen={showAddModal}
        onClose={handleFormCancel}
        title="Add New Parent"
        subtitle="Create a new parent account"
        size="2xl"
      >
        <ParentForm
          mode="create"
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
          relatedData={{ students: orphanedStudents }}
        />
      </ModernModal>

      {/* Edit Parent Modal */}
      <ModernModal
        isOpen={showEditModal}
        onClose={handleFormCancel}
        title="Edit Parent"
        subtitle="Modify parent information"
        size="2xl"
      >
        <ParentForm
          mode="update"
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
          initialData={selectedParent || undefined}
          relatedData={{ students: orphanedStudents }}
        />
      </ModernModal>

      {/* Delete Confirmation Modal */}
      <ModernModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Parent"
        subtitle={`Are you sure you want to delete "${selectedParent?.name} ${selectedParent?.surname}"? This action cannot be undone.`}
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
            Delete Parent
          </Button>
        </div>
      </ModernModal>
    </div>
  );
};

export default ParentsPageClient;