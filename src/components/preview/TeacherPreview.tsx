"use client";

import React from 'react';
import { 
  BasePreviewModal,
  PreviewHeader,
  PreviewSection,
  PreviewField,
  PreviewGrid,
  PreviewIcons
} from './BasePreviewModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardHeader, CardBody, CardTitle } from '@/components/ui/card';
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  Award,
  Clock,
  Target,
  Heart,
  Phone,
  Mail,
  MapPin,
  User,
  FileText,
  CheckCircle,
  XCircle,
  DollarSign,
  BarChart3,
  Briefcase,
  Star,
  ChevronRight,
  School,
  Timer,
  UserCheck,
  Globe
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

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
  subjects?: {
    id: number;
    name: string;
    department?: string;
    credits?: number;
  }[];
  classes?: {
    id: number;
    name: string;
    grade?: {
      level: number;
    };
    _count?: {
      students: number;
    };
  }[];
  lessons?: {
    id: number;
    name: string;
    day: string;
    startTime: Date;
    endTime: Date;
    subject: {
      name: string;
    };
    class: {
      name: string;
    };
  }[];
  statistics?: {
    totalStudents: number;
    totalClasses: number;
    totalSubjects: number;
    averageClassSize: number;
    totalLessons: number;
    experienceYears: number;
  };
}

interface TeacherPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: Teacher | null;
}

const TeacherPreview: React.FC<TeacherPreviewProps> = ({
  isOpen,
  onClose,
  teacher
}) => {
  if (!teacher) {
    return (
      <BasePreviewModal
        isOpen={isOpen}
        onClose={onClose}
        title="Teacher Not Found"
        size="lg"
      >
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-10 h-10 text-secondary-400" />
          </div>
          <h3 className="text-lg font-semibold text-secondary-900 mb-2">Teacher Not Found</h3>
          <p className="text-secondary-600">Teacher information could not be loaded.</p>
        </div>
      </BasePreviewModal>
    );
  }

  const calculateTotalStudents = () => {
    if (!teacher.classes?.length) return 0;
    return teacher.classes.reduce((total, cls) => total + (cls._count?.students || 0), 0);
  };

  const calculateAverageClassSize = () => {
    const totalStudents = calculateTotalStudents();
    const totalClasses = teacher.classes?.length || 0;
    return totalClasses > 0 ? Math.round(totalStudents / totalClasses) : 0;
  };

  const getExperienceYears = () => {
    const joinDate = new Date(teacher.createdAt);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate.getTime() - joinDate.getTime());
    const diffYears = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 365));
    return diffYears;
  };

  const totalStudents = teacher.statistics?.totalStudents || calculateTotalStudents();
  const totalClasses = teacher.statistics?.totalClasses || teacher.classes?.length || 0;
  const totalSubjects = teacher.statistics?.totalSubjects || teacher.subjects?.length || 0;
  const averageClassSize = teacher.statistics?.averageClassSize || calculateAverageClassSize();
  const experienceYears = teacher.statistics?.experienceYears || getExperienceYears();

  return (
    <BasePreviewModal
      isOpen={isOpen}
      onClose={onClose}
      title={`${teacher.name} ${teacher.surname}`}
      size="xl"
    >
      <div className="space-y-6 p-4">
        {/* Compact AI Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 via-purple-500/20 to-accent-500/20 rounded-2xl blur-lg"></div>
          <Card variant="gradient" className="relative backdrop-blur-sm border-white/30">
            <CardBody className="p-6">
              <div className="flex items-center gap-4">
                {/* Compact Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <GraduationCap className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center border-2 border-white">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                
                {/* Compact Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h1 className="text-xl font-bold text-secondary-900 truncate">
                        {teacher.name} {teacher.surname}
                      </h1>
                      <p className="text-sm text-secondary-600 font-medium truncate">
                        {teacher.username} • Educational Professional
                      </p>
                      
                      {/* Inline Compact Badges */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded-lg">
                          <BookOpen className="w-3 h-3" />
                          {totalSubjects}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-accent-100 text-accent-700 rounded-lg">
                          <GraduationCap className="w-3 h-3" />
                          {totalClasses}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-lg">
                          <Clock className="w-3 h-3" />
                          {experienceYears}y
                        </span>
            </div>
          </div>
          
                    {/* AI Status Indicator */}
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-600 font-medium hidden sm:inline">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
          </div>
          
        {/* AI-Powered Compact Stats */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-green-500/10 rounded-3xl blur-xl"></div>
          <Card variant="gradient" className="relative backdrop-blur-sm border-white/20">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-secondary-900 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  Performance Analytics
                </h3>
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                  Real-time
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="group cursor-pointer">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200/50 hover:shadow-md transition-all">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center shadow-sm">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-2xl font-bold text-blue-700 leading-none">{totalStudents}</p>
                      <p className="text-xs font-medium text-blue-600 truncate">Students</p>
                    </div>
            </div>
          </div>
          
                <div className="group cursor-pointer">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200/50 hover:shadow-md transition-all">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center shadow-sm">
                      <GraduationCap className="w-5 h-5 text-white" />
              </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-2xl font-bold text-green-700 leading-none">{totalClasses}</p>
                      <p className="text-xs font-medium text-green-600 truncate">Classes</p>
            </div>
          </div>
        </div>

                <div className="group cursor-pointer">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200/50 hover:shadow-md transition-all">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center shadow-sm">
                      <BookOpen className="w-5 h-5 text-white" />
            </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-2xl font-bold text-purple-700 leading-none">{totalSubjects}</p>
                      <p className="text-xs font-medium text-purple-600 truncate">Subjects</p>
            </div>
            </div>
          </div>
                
                <div className="group cursor-pointer">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200/50 hover:shadow-md transition-all">
                    <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center shadow-sm">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-2xl font-bold text-orange-700 leading-none">{averageClassSize}</p>
                      <p className="text-xs font-medium text-orange-600 truncate">Avg Size</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* AI Insight Bar */}
              <div className="mt-4 p-3 bg-gradient-to-r from-indigo-50 to-cyan-50 rounded-xl border border-indigo-200/50">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse"></div>
                  <span className="font-medium text-indigo-700">AI Analysis:</span>
                  <span className="text-indigo-600">
                    {totalStudents > 15 ? "High engagement teacher" : 
                     totalSubjects > 3 ? "Multi-subject specialist" : 
                     "Focused teaching approach"}
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Compact Information Grid */}
        <div className="teacher-info-sections grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Personal Information */}
          <Card variant="elevated" className="w-full">
            <CardHeader variant="bordered">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-600" />
                </div>
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardBody className="p-6">
              <div className="space-y-6">
                {/* Basic Information Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-secondary-600 mb-1">
                      <User className="w-4 h-4" />
                      Full Name
                    </div>
                    <div className="text-lg font-semibold text-secondary-900">
                      {teacher.name} {teacher.surname}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-secondary-600 mb-1">
                      <Globe className="w-4 h-4" />
                      Username
                    </div>
                    <div className="text-base font-mono text-secondary-800 bg-secondary-50 px-3 py-2 rounded-lg">
                      {teacher.username}
                    </div>
                  </div>
                </div>

                {/* Contact Information Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-secondary-600 mb-1">
                      <Mail className="w-4 h-4" />
                      Email Address
                    </div>
                    {teacher.email ? (
                      <a 
                        href={`mailto:${teacher.email}`}
                        className="text-primary-600 hover:text-primary-700 hover:underline break-words text-base"
                      >
                        {teacher.email}
                      </a>
                    ) : (
                      <span className="text-secondary-400 italic text-base">Not provided</span>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-secondary-600 mb-1">
                      <Phone className="w-4 h-4" />
                      Phone Number
                    </div>
                    {teacher.phone ? (
                      <a 
                        href={`tel:${teacher.phone}`}
                        className="text-primary-600 hover:text-primary-700 hover:underline text-base"
                      >
                        {teacher.phone}
                      </a>
                    ) : (
                      <span className="text-secondary-400 italic text-base">Not provided</span>
                    )}
                  </div>
                </div>

                {/* Personal Details Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-secondary-600 mb-1">
                      <Calendar className="w-4 h-4" />
                      Birthday
                    </div>
                    <div className="text-base text-secondary-800">
                      {formatDate(teacher.birthday)}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-secondary-600 mb-1">
                      <User className="w-4 h-4" />
                      Gender
                    </div>
                    <Badge variant="outline" className="text-sm px-3 py-1 w-fit">
                      {teacher.sex}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-secondary-600 mb-1">
                      <Heart className="w-4 h-4" />
                      Blood Type
                    </div>
                    <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200 text-sm px-3 py-1 w-fit">
                      {teacher.bloodType || 'Not provided'}
                    </Badge>
                  </div>
                </div>

                {/* Address Row */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-secondary-600 mb-1">
                    <MapPin className="w-4 h-4" />
                    Address
                  </div>
                  <div className="text-base text-secondary-800 bg-secondary-50 px-4 py-3 rounded-lg">
                    {teacher.address || 'Not provided'}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Professional Information */}
          <Card variant="elevated" className="w-full">
            <CardHeader variant="bordered">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="w-8 h-8 bg-accent-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-accent-600" />
                </div>
                Professional Information
              </CardTitle>
            </CardHeader>
            <CardBody className="p-6">
              <div className="space-y-6">
                {/* Employee Details Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-secondary-600 mb-1">
                      <FileText className="w-4 h-4" />
                      Employee ID
                    </div>
                    <div className="text-base font-mono text-secondary-800 bg-secondary-50 px-3 py-2 rounded-lg">
                      TCH-{teacher.id.slice(-12).toUpperCase()}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-secondary-600 mb-1">
                      <Calendar className="w-4 h-4" />
                      Join Date
                    </div>
                    <div className="text-base text-secondary-800">
                      {formatDate(teacher.createdAt)}
                    </div>
                  </div>
                </div>

                {/* Experience Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-secondary-600 mb-2">
                    <Clock className="w-4 h-4" />
                    Experience
                  </div>
                  <div className="bg-secondary-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="default" className="bg-accent-100 text-accent-700 text-base px-4 py-2">
                        {experienceYears} year{experienceYears !== 1 ? 's' : ''}
                      </Badge>
                      <span className="text-sm text-secondary-600">{Math.min((experienceYears / 10) * 100, 100).toFixed(0)}%</span>
                    </div>
                    <Progress value={Math.min((experienceYears / 10) * 100, 100)} className="h-3" />
                    <p className="text-xs text-secondary-500 mt-2">Professional Development Progress</p>
                  </div>
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-4 rounded-xl border border-primary-200/50 text-center">
                    <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-3xl font-bold text-primary-700 mb-1">{totalClasses}</p>
                    <p className="text-sm font-medium text-primary-600">Active Classes</p>
                    <p className="text-xs text-primary-500">Teaching Load</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200/50 text-center">
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-3xl font-bold text-purple-700 mb-1">{totalSubjects}</p>
                    <p className="text-sm font-medium text-purple-600">Subjects</p>
                    <p className="text-xs text-purple-500">Teaching Areas</p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Compact Subjects and Classes */}
        {((teacher.subjects && teacher.subjects.length > 0) || (teacher.classes && teacher.classes.length > 0)) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Subjects */}
            {teacher.subjects && teacher.subjects.length > 0 && (
              <Card variant="elevated">
                <CardHeader variant="bordered">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-purple-600" />
                    </div>
                    Subjects ({teacher.subjects.length})
                  </CardTitle>
                </CardHeader>
                <CardBody className="p-4">
                  <div className="grid grid-cols-1 gap-2">
                    {teacher.subjects.map((subject) => (
                      <div key={subject.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-purple-50 transition-colors">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-secondary-900 truncate">{subject.name}</p>
                          {subject.department && (
                            <p className="text-xs text-secondary-500 truncate">{subject.department}</p>
                          )}
                        </div>
                        {subject.credits && (
                          <Badge variant="secondary" className="text-xs flex-shrink-0">
                            {subject.credits}cr
                          </Badge>
                        )}
                </div>
              ))}
            </div>
                </CardBody>
              </Card>
        )}

            {/* Classes */}
        {teacher.classes && teacher.classes.length > 0 && (
              <Card variant="elevated">
                <CardHeader variant="bordered">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="w-8 h-8 bg-accent-100 rounded-lg flex items-center justify-center">
                      <GraduationCap className="w-4 h-4 text-accent-600" />
                    </div>
                    Classes ({teacher.classes.length})
                  </CardTitle>
                </CardHeader>
                <CardBody className="p-4">
                  <div className="grid grid-cols-1 gap-2">
                    {teacher.classes.map((classItem) => (
                      <div key={classItem.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent-50 transition-colors">
                        <div className="w-8 h-8 bg-accent-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <GraduationCap className="w-4 h-4 text-accent-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-secondary-900 truncate">{classItem.name}</p>
                          <div className="flex items-center gap-2 text-xs text-secondary-500">
                        {classItem.grade && (
                          <span>Grade {classItem.grade.level}</span>
                        )}
                        {classItem._count?.students && (
                          <>
                            <span>•</span>
                            <span>{classItem._count.students} students</span>
                          </>
                        )}
                      </div>
                    </div>
                        <ChevronRight className="w-4 h-4 text-secondary-400 flex-shrink-0" />
                </div>
              ))}
            </div>
                </CardBody>
              </Card>
            )}
          </div>
        )}

        {/* Compact Schedule */}
        {teacher.lessons && teacher.lessons.length > 0 && (
          <Card variant="elevated">
            <CardHeader variant="bordered">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-orange-600" />
                </div>
                Schedule ({teacher.lessons.length} lessons)
              </CardTitle>
            </CardHeader>
            <CardBody className="p-4">
              <div className="grid grid-cols-1 gap-2">
                {teacher.lessons.map((lesson) => (
                  <div key={lesson.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 transition-colors border border-orange-100/50">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-secondary-900 truncate">{lesson.name}</p>
                        <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded flex-shrink-0 ml-2">
                          {lesson.day}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-secondary-500 mt-1">
                        <span>
                          {lesson.startTime.toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })} - {lesson.endTime.toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                        <span>•</span>
                        <span className="truncate">{lesson.subject.name}</span>
                        <span>•</span>
                        <span className="truncate">{lesson.class.name}</span>
                      </div>
                  </div>
                </div>
              ))}
                </div>
            </CardBody>
          </Card>
        )}
      </div>
    </BasePreviewModal>
  );
};

export default TeacherPreview;