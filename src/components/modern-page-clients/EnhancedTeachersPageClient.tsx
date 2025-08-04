"use client";

import React, { useState, useEffect } from 'react';
import { ModernModal } from '@/components/ui/modern-modal';
import { TeacherForm } from '@/components/modern-forms/TeacherForm';
import { ModernTeacherPreview } from '@/components/modern-preview/ModernTeacherPreview';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { toast, Toaster } from 'react-hot-toast';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  GraduationCap,
  Users,
  BookOpen,
  Mail,
  Phone,
  Eye,
  RefreshCw,
  MoreHorizontal
} from 'lucide-react';
import Image from 'next/image';

interface Teacher {
  id: string;
  name: string;
  surname: string;
  username: string;
  email?: string | null;
  phone?: string | null;
  address?: string;
  img?: string | null;
  bloodType?: string;
  sex: string;
  birthday: Date;
  createdAt: Date;
  subjects?: Array<{
    id: number;
    name: string;
    department?: string;
  }>;
  classes?: Array<{
    id: number;
    name: string;
    grade?: {
      level: number;
      name: string;
    };
    _count?: {
      students: number;
    };
  }>;
}

interface RelatedData {
  subjects: Array<{ id: number; name: string }>;
  classes: Array<{ id: number; name: string }>;
}

interface EnhancedTeachersPageClientProps {
  initialTeachers: Teacher[];
  relatedData: RelatedData;
  isAdmin: boolean;
}

export function EnhancedTeachersPageClient({ 
  initialTeachers, 
  relatedData, 
  isAdmin 
}: EnhancedTeachersPageClientProps) {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  // Refresh data
  const refreshTeachers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/teachers?limit=100');
      if (response.ok) {
        const data = await response.json();
        setTeachers(data.teachers || []);
      } else {
        toast.error('Failed to refresh teachers data');
      }
    } catch (error) {
      toast.error('Network error while refreshing data');
    } finally {
      setLoading(false);
    }
  };

  // Filter teachers based on search and subject
  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = 
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSubject = selectedSubject === '' || 
      teacher.subjects?.some(subject => subject.id.toString() === selectedSubject);
    
    return matchesSearch && matchesSubject;
  });

  // Handle actions
  const handleAddTeacher = () => {
    setSelectedTeacher(null);
    setShowAddModal(true);
  };

  const handleEditTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setShowEditModal(true);
  };

  const handlePreviewTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setShowPreviewModal(true);
  };

  const handleDeleteTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedTeacher) return;

    try {
      const response = await fetch(`/api/teachers/${selectedTeacher.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Teacher deleted successfully');
        setTeachers(prev => prev.filter(t => t.id !== selectedTeacher.id));
        setShowDeleteModal(false);
        setSelectedTeacher(null);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to delete teacher');
      }
    } catch (error) {
      toast.error('Network error while deleting teacher');
    }
  };

  const handleFormSuccess = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedTeacher(null);
    refreshTeachers();
  };

  const handleFormCancel = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedTeacher(null);
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">Teachers Management</h1>
            <p className="text-neutral-600">Manage teacher accounts, assignments, and information</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshTeachers}
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
            {isAdmin && (
              <Button onClick={handleAddTeacher} leftIcon={<Plus className="w-4 h-4" />}>
                Add Teacher
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mt-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input
              placeholder="Search teachers by name, username, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Subjects</option>
            {relatedData.subjects.map(subject => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Teachers</p>
                <p className="text-2xl font-bold text-blue-700">{teachers.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-green-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Active Teachers</p>
                <p className="text-2xl font-bold text-green-700">{filteredTeachers.length}</p>
              </div>
              <GraduationCap className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-purple-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Subjects</p>
                <p className="text-2xl font-bold text-purple-700">{relatedData.subjects.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          <div className="bg-orange-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Classes</p>
                <p className="text-2xl font-bold text-orange-700">{relatedData.classes.length}</p>
              </div>
              <Users className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTeachers.map((teacher, index) => (
          <div
            key={teacher.id}
            className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200 hover:shadow-lg transition-all duration-300 group"
          >
            {/* Avatar and basic info */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center overflow-hidden">
                  {teacher.img ? (
                    <Image
                      src={teacher.img}
                      alt={`${teacher.name} ${teacher.surname}`}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <GraduationCap className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 truncate">
                    {teacher.name} {teacher.surname}
                  </h3>
                  <p className="text-sm text-neutral-500">@{teacher.username}</p>
                </div>
              </div>
              
              {/* Actions dropdown */}
              <div className="relative">
                <button className="p-2 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100 opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Contact info */}
            <div className="space-y-2 mb-4">
              {teacher.email && (
                <div className="flex items-center space-x-2 text-sm text-neutral-600">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{teacher.email}</span>
                </div>
              )}
              {teacher.phone && (
                <div className="flex items-center space-x-2 text-sm text-neutral-600">
                  <Phone className="w-4 h-4" />
                  <span>{teacher.phone}</span>
                </div>
              )}
            </div>

            {/* Subjects */}
            {teacher.subjects && teacher.subjects.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-neutral-700">Subjects</p>
                  <span className="text-xs text-neutral-500 bg-neutral-50 px-2 py-1 rounded-md">
                    {teacher.subjects.length} assigned
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {teacher.subjects.slice(0, 2).map(subject => (
                    <span key={subject.id} className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-md border-0">
                      {subject.name}
                    </span>
                  ))}
                  {teacher.subjects.length > 2 && (
                    <span className="text-xs text-neutral-500 bg-neutral-50 px-2 py-1 rounded-md">
                      +{teacher.subjects.length - 2}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Classes */}
            {teacher.classes && teacher.classes.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-neutral-700">Classes</p>
                  <span className="text-xs text-neutral-500 bg-neutral-50 px-2 py-1 rounded-md">
                    {teacher.classes.length} assigned
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {teacher.classes.slice(0, 2).map(cls => (
                    <span key={cls.id} className="text-xs bg-accent-50 text-accent-700 px-2 py-1 rounded-md border-0">
                      {cls.name}
                    </span>
                  ))}
                  {teacher.classes.length > 2 && (
                    <span className="text-xs text-neutral-500 bg-neutral-50 px-2 py-1 rounded-md">
                      +{teacher.classes.length - 2}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="text-center p-2 bg-blue-50 rounded-lg">
                <p className="text-lg font-bold text-blue-700">
                  {teacher.classes?.reduce((total, cls) => total + (cls._count?.students || 0), 0) || 0}
                </p>
                <p className="text-xs text-blue-600">Students</p>
              </div>
              <div className="text-center p-2 bg-green-50 rounded-lg">
                <p className="text-lg font-bold text-green-700">{teacher.classes?.length || 0}</p>
                <p className="text-xs text-green-600">Classes</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end">
              <DropdownMenu
                trigger={
                  <Button
                    variant="ghost"
                    className="h-8 w-8 p-0 hover:bg-muted"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                }
              >
                <DropdownMenuItem onClick={() => handlePreviewTeacher(teacher)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuItem onClick={() => handleEditTeacher(teacher)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDeleteTeacher(teacher)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {filteredTeachers.length === 0 && (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-10 h-10 text-neutral-400" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">No teachers found</h3>
          <p className="text-neutral-600 mb-4">
            {searchTerm || selectedSubject 
              ? 'Try adjusting your search criteria or filters'
              : 'Get started by adding your first teacher'
            }
          </p>
          {isAdmin && !searchTerm && !selectedSubject && (
            <Button onClick={handleAddTeacher} leftIcon={<Plus className="w-4 h-4" />}>
              Add Teacher
            </Button>
          )}
        </div>
      )}

      {/* Add Teacher Modal */}
      <ModernModal
        isOpen={showAddModal}
        onClose={handleFormCancel}
        title="Add New Teacher"
        subtitle="Create a new teacher account"
        size="2xl"
      >
        <TeacherForm
          mode="create"
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
          relatedData={relatedData}
        />
      </ModernModal>

      {/* Edit Teacher Modal */}
      <ModernModal
        isOpen={showEditModal}
        onClose={handleFormCancel}
        title="Edit Teacher"
        subtitle="Update teacher information"
        size="2xl"
      >
        {selectedTeacher && (
          <TeacherForm
            mode="edit"
            initialData={selectedTeacher}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
            relatedData={relatedData}
          />
        )}
      </ModernModal>

      {/* Preview Teacher Modal */}
      <ModernModal
        isOpen={showPreviewModal}
        onClose={() => {
          setShowPreviewModal(false);
          setSelectedTeacher(null);
        }}
        title={selectedTeacher ? `${selectedTeacher.name} ${selectedTeacher.surname}` : 'Teacher Details'}
        size="2xl"
      >
        <ModernTeacherPreview
          teacher={selectedTeacher}
          onEdit={isAdmin ? () => {
            setShowPreviewModal(false);
            handleEditTeacher(selectedTeacher!);
          } : undefined}
        />
      </ModernModal>

      {/* Delete Confirmation Modal */}
      <ModernModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedTeacher(null);
        }}
        title="Delete Teacher"
        subtitle="This action cannot be undone"
        variant="error"
        size="md"
        footer={
          <div className="flex items-center justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedTeacher(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Teacher
            </Button>
          </div>
        }
      >
        <div className="py-4">
          <p className="text-neutral-700">
            Are you sure you want to delete <strong>{selectedTeacher?.name} {selectedTeacher?.surname}</strong>? 
            This will permanently remove the teacher account and all associated data.
          </p>
        </div>
      </ModernModal>
    </div>
  );
}

export default EnhancedTeachersPageClient;