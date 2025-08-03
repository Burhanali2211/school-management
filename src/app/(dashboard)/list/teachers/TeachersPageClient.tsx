"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
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
  Search,
  Download,
  Filter,
  X,
  ChevronDown,
  Grid3X3,
  List,
  SlidersHorizontal,
  Star,
  CheckCircle,
  AlertCircle,
  Clock,
  MoreVertical
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardBody, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { generateInitials } from "@/lib/utils";
import { TeacherList } from "./page";
import FormContainer from "@/components/FormContainer";
import { TeacherPreview } from '@/components/preview';

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
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State management
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherList | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'subjects' | 'created'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Filter and search functionality
  const filteredData = useMemo(() => {
    let filtered = [...data];
    
    if (searchTerm) {
      filtered = filtered.filter(teacher => 
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (activeFilters.subjects && activeFilters.subjects.length > 0) {
      filtered = filtered.filter(teacher => 
        teacher.subjects.some(subject => activeFilters.subjects.includes(subject.id.toString()))
      );
    }
    
    if (activeFilters.classes && activeFilters.classes.length > 0) {
      filtered = filtered.filter(teacher => 
        teacher.classes.some(cls => activeFilters.classes.includes(cls.id.toString()))
      );
    }
    
    if (activeFilters.status) {
      if (activeFilters.status === 'active') {
        filtered = filtered.filter(teacher => teacher.subjects.length > 0);
      } else if (activeFilters.status === 'inactive') {
        filtered = filtered.filter(teacher => teacher.subjects.length === 0);
      }
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = `${a.name} ${a.surname}`.localeCompare(`${b.name} ${b.surname}`);
          break;
        case 'subjects':
          comparison = a.subjects.length - b.subjects.length;
          break;
        case 'created':
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return filtered;
  }, [data, searchTerm, activeFilters, sortBy, sortOrder]);
  
  // Handlers
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    router.push(`?${params.toString()}`);
  }, [searchParams, router]);
  
  const handleFilterChange = useCallback((key: string, value: any) => {
    setActiveFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);
  
  const handleClearFilters = useCallback(() => {
    setActiveFilters({});
    setSearchTerm('');
    router.push('/list/teachers');
  }, [router]);
  
  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      const csvContent = "data:text/csv;charset=utf-8," + 
        "Name,Email,Phone,Subjects,Classes\n" +
        filteredData.map(teacher => 
          `"${teacher.name} ${teacher.surname}","${teacher.email || ''}","${teacher.phone || ''}","${teacher.subjects.map(s => s.name).join('; ')}","${teacher.classes.map(c => c.name).join('; ')}"`
        ).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `teachers_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Teachers data exported successfully!');
    } catch (error) {
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  }, [filteredData]);
  
  const handleCreateTeacher = useCallback(() => {
    setShowCreateModal(true);
  }, []);
  
  const handleSelectionChange = useCallback((selectedData: TeacherList[]) => {
    setSelectedRows(selectedData.map(teacher => teacher.id));
  }, []);
  
  const openPreview = useCallback((teacher: TeacherList) => {
    setSelectedTeacher(teacher);
    setShowPreview(true);
  }, []);
  
  const closePreview = useCallback(() => {
    setSelectedTeacher(null);
    setShowPreview(false);
  }, []);

  const TeacherCard = ({ teacher }: { teacher: TeacherList }) => (
    <Card 
      variant="elevated" 
      hover 
      className="group cursor-pointer overflow-hidden transition-all duration-300"
      onClick={() => openPreview(teacher)}
    >
      <CardBody className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            <div className="relative">
              <Avatar className="w-16 h-16 border-2 border-white shadow-lg">
                <AvatarImage src={teacher.img || undefined} alt={teacher.name} />
                <AvatarFallback className="bg-gradient-to-br from-primary-500 to-primary-600 text-white text-lg font-semibold">
                  {generateInitials(teacher.name, teacher.surname)}
                </AvatarFallback>
              </Avatar>
              {teacher.subjects.length > 0 && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-accent-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors">
                {teacher.name} {teacher.surname}
              </h3>
              <p className="text-sm text-secondary-600 font-mono mb-2">{teacher.username}</p>
              <div className="flex items-center gap-2 text-sm text-secondary-500">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{teacher.email || 'No email'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                openPreview(teacher);
              }}
              className="h-8 w-8 p-0 hover:bg-primary-50 hover:text-primary-600"
            >
              <Eye className="w-4 h-4" />
            </Button>
            {isAdmin && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => e.stopPropagation()}
                className="h-8 w-8 p-0 hover:bg-secondary-100"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-secondary-700">Subjects</span>
              <Badge variant="outline" className="text-xs">
                {teacher.subjects.length} assigned
              </Badge>
            </div>
            <div className="flex flex-wrap gap-1">
              {teacher.subjects.length > 0 ? (
                teacher.subjects.slice(0, 3).map((subject) => (
                  <Badge key={subject.id} variant="secondary" className="text-xs">
                    {subject.name}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-secondary-400 italic">No subjects assigned</span>
              )}
              {teacher.subjects.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{teacher.subjects.length - 3} more
                </Badge>
              )}
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-secondary-700">Classes</span>
              <Badge variant="outline" className="text-xs">
                {teacher.classes.length} assigned
              </Badge>
            </div>
            <div className="flex flex-wrap gap-1">
              {teacher.classes.length > 0 ? (
                teacher.classes.slice(0, 3).map((cls) => (
                  <Badge key={cls.id} variant="outline" className="text-xs">
                    {cls.name}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-secondary-400 italic">No classes assigned</span>
              )}
              {teacher.classes.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{teacher.classes.length - 3} more
                </Badge>
              )}
            </div>
          </div>
          
          <div className="pt-2 border-t border-secondary-100">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-secondary-600">
                <Phone className="w-4 h-4" />
                <span className="truncate">{teacher.phone || 'No phone'}</span>
              </div>
              <div className="flex items-center gap-1">
                {teacher.subjects.length > 0 ? (
                  <Badge variant="default" className="status-badge-active text-xs border">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="status-badge-inactive text-xs border">
                    Inactive
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-default via-primary-50/30 to-accent-50/20">
      <div className="container mx-auto px-4 py-8 space-y-8">


        {/* Enhanced Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card variant="gradient" padding="lg" hover className="text-center group">
            <div className="flex flex-col items-center space-y-3">
              <div className="p-4 bg-primary-100 rounded-2xl group-hover:bg-primary-200 transition-colors">
                <Users className="w-8 h-8 text-primary-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-secondary-900">{totalTeachers}</p>
                <p className="text-sm font-medium text-secondary-600">Total Teachers</p>
                <p className="text-xs text-secondary-500 mt-1">All registered faculty</p>
              </div>
            </div>
          </Card>

          <Card variant="gradient" padding="lg" hover className="text-center group">
            <div className="flex flex-col items-center space-y-3">
              <div className="p-4 bg-accent-100 rounded-2xl group-hover:bg-accent-200 transition-colors">
                <Star className="w-8 h-8 text-accent-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-secondary-900">{activeTeachers}</p>
                <p className="text-sm font-medium text-secondary-600">Active Teachers</p>
                <p className="text-xs text-secondary-500 mt-1">
                  {Math.round((activeTeachers / totalTeachers) * 100)}% with assignments
                </p>
              </div>
            </div>
          </Card>

          <Card variant="gradient" padding="lg" hover className="text-center group">
            <div className="flex flex-col items-center space-y-3">
              <div className="p-4 bg-purple-100 rounded-2xl group-hover:bg-purple-200 transition-colors">
                <BookOpen className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-secondary-900">{totalSubjects}</p>
                <p className="text-sm font-medium text-secondary-600">Subjects</p>
                <p className="text-xs text-secondary-500 mt-1">Available courses</p>
              </div>
            </div>
          </Card>

          <Card variant="gradient" padding="lg" hover className="text-center group">
            <div className="flex flex-col items-center space-y-3">
              <div className="p-4 bg-orange-100 rounded-2xl group-hover:bg-orange-200 transition-colors">
                <Calendar className="w-8 h-8 text-orange-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-secondary-900">{totalClasses}</p>
                <p className="text-sm font-medium text-secondary-600">Classes</p>
                <p className="text-xs text-secondary-500 mt-1">Active sessions</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Enhanced Action Bar */}
        <Card variant="elevated" padding="lg">
          <div className="flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between">
            {/* Search and Filters */}
            <div className="flex-1 space-y-4 lg:space-y-0 lg:flex lg:items-center lg:gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
                <Input
                  placeholder="Search teachers by name, email, or subject..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-12 h-12 text-base border-secondary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 rounded-xl search-input-modern"
                />
              </div>
              
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 h-12 px-6 rounded-xl transition-all ${
                    showFilters ? 'bg-primary-50 border-primary-300 text-primary-700' : ''
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Filters</span>
                  {Object.keys(activeFilters).length > 0 && (
                    <Badge variant="default" className="ml-1 bg-primary-600 text-white text-xs">
                      {Object.keys(activeFilters).length}
                    </Badge>
                  )}
                </Button>
                
                <div className="flex items-center gap-2 p-1 bg-secondary-100 rounded-xl">
                  <Button
                    variant={viewMode === 'cards' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('cards')}
                    className="h-10 px-4 rounded-lg view-toggle-button"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                    className="h-10 px-4 rounded-lg view-toggle-button"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={handleExport} 
                disabled={isExporting}
                className="flex items-center gap-2 h-12 px-6 rounded-xl hover:bg-secondary-50 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </Button>
              
              {isAdmin && (
                <Button 
                  onClick={handleCreateTeacher} 
                  className="flex items-center gap-2 h-12 px-6 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Teacher</span>
                </Button>
              )}
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-secondary-200 filter-panel-slide">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Status</label>
                  <select 
                    value={activeFilters.status || ''}
                    onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                    className="w-full h-10 px-3 border border-secondary-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                  >
                    <option value="">All Teachers</option>
                    <option value="active">Active (With Subjects)</option>
                    <option value="inactive">Inactive (No Subjects)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Sort By</label>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full h-10 px-3 border border-secondary-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                  >
                    <option value="name">Name (A-Z)</option>
                    <option value="subjects">Subject Count</option>
                    <option value="created">Recently Added</option>
                  </select>
                </div>
                
                <div className="flex items-end gap-2">
                  <Button
                    variant="outline"
                    onClick={handleClearFilters}
                    className="flex items-center gap-2 h-10 px-4 text-secondary-600 hover:text-secondary-700"
                  >
                    <X className="w-4 h-4" />
                    <span>Clear Filters</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Content Area */}
        <div className="space-y-6">
          {/* Results Summary */}
          <div className="flex items-center justify-between">
            <p className="text-secondary-600">
              Showing <span className="font-semibold text-secondary-900">{filteredData.length}</span> of{' '}
              <span className="font-semibold text-secondary-900">{totalTeachers}</span> teachers
            </p>
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSearchChange('')}
                className="text-secondary-500 hover:text-secondary-700"
              >
                <X className="w-4 h-4 mr-1" />
                Clear search
              </Button>
            )}
          </div>

          {/* Cards View */}
          {viewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredData.map((teacher) => (
                <TeacherCard key={teacher.id} teacher={teacher} />
              ))}
            </div>
          )}

          {/* Table View */}
          {viewMode === 'table' && (
            <Card variant="elevated" padding="none" className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary-50 border-b border-secondary-200">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-secondary-700">Teacher</th>
                      <th className="text-left py-4 px-6 font-semibold text-secondary-700">ID</th>
                      <th className="text-left py-4 px-6 font-semibold text-secondary-700">Subjects</th>
                      <th className="text-left py-4 px-6 font-semibold text-secondary-700">Classes</th>
                      <th className="text-left py-4 px-6 font-semibold text-secondary-700">Contact</th>
                      <th className="text-left py-4 px-6 font-semibold text-secondary-700">Status</th>
                      <th className="text-center py-4 px-6 font-semibold text-secondary-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-100">
                    {filteredData.map((teacher) => (
                      <tr key={teacher.id} className="hover:bg-secondary-25 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={teacher.img || undefined} alt={teacher.name} />
                              <AvatarFallback className="bg-primary-100 text-primary-700 font-medium">
                                {generateInitials(teacher.name, teacher.surname)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-secondary-900">{teacher.name} {teacher.surname}</p>
                              <p className="text-sm text-secondary-500">{teacher.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Badge variant="outline" className="font-mono text-xs">
                            {teacher.username}
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
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
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-wrap gap-1">
                            {teacher.classes.slice(0, 2).map((cls) => (
                              <Badge key={cls.id} variant="outline" className="text-xs">
                                {cls.name}
                              </Badge>
                            ))}
                            {teacher.classes.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{teacher.classes.length - 2}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-secondary-600">
                          {teacher.phone || 'No phone'}
                        </td>
                        <td className="py-4 px-6">
                          {teacher.subjects.length > 0 ? (
                            <Badge variant="default" className="status-badge-active border">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="status-badge-inactive border">
                              Inactive
                            </Badge>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openPreview(teacher)}
                              className="h-8 w-8 p-0 hover:bg-primary-50 hover:text-primary-600"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {isAdmin && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 hover:bg-secondary-100"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Empty State */}
          {filteredData.length === 0 && (
            <Card variant="elevated" padding="lg" className="text-center py-12">
              <div className="w-20 h-20 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-10 h-10 text-secondary-400" />
              </div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">No teachers found</h3>
              <p className="text-secondary-600 mb-6">
                {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first teacher'}
              </p>
              {isAdmin && !searchTerm && (
                <Button onClick={handleCreateTeacher} className="mx-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Teacher
                </Button>
              )}
            </Card>
          )}
        </div>
      </div>

      {/* Modals */}
      <TeacherPreview
        isOpen={showPreview}
        onClose={closePreview}
        teacher={selectedTeacher}
      />

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowCreateModal(false)}
          />
          <Card variant="elevated" className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <FormContainer 
              table="teacher" 
              type="create" 
              relatedData={{
                subjects: availableSubjects
              }}
            />
          </Card>
        </div>
      )}
    </div>
  );
};

export default TeachersPageClient;