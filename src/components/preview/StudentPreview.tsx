"use client";

import React from 'react';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  Calendar, 
  Award,
  Clock,
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
  X,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { formatDate, generateInitials } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface Student {
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
  class: {
    id: number;
    name: string;
    grade?: {
      level: number;
      name: string;
    };
  };
  parent?: {
    id: string;
    name: string;
    surname: string;
    phone?: string;
    email?: string;
  };
  attendances?: {
    id: number;
    date: Date;
    present: boolean;
    lesson: {
      name: string;
      subject: {
        name: string;
      };
    };
  }[];
  results?: {
    id: number;
    score: number;
    exam?: {
      title: string;
      startTime: Date;
    };
    assignment?: {
      title: string;
      dueDate: Date;
    };
  }[];
  fees?: {
    id: number;
    amount: number;
    dueDate: Date;
    status: string;
  }[];
  statistics?: {
    totalExams: number;
    averageGrade: number;
    attendanceRate: number;
    totalAssignments: number;
    pendingFees: number;
    totalFees: number;
  };
}

interface StudentPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
}

const StudentPreview: React.FC<StudentPreviewProps> = ({
  isOpen,
  onClose,
  student
}) => {
  if (!student) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <div className="text-center py-12">
          <User className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-500">Student information could not be loaded.</p>
        </div>
      </Modal>
    );
  }

  const calculateAttendanceRate = () => {
    if (!student.attendances?.length) return 0;
    const presentCount = student.attendances.filter(a => a.present).length;
    return Math.round((presentCount / student.attendances.length) * 100);
  };

  const calculateAverageGrade = () => {
    if (!student.results?.length) return 0;
    const total = student.results.reduce((sum, result) => sum + result.score, 0);
    return Math.round(total / student.results.length);
  };

  const attendanceRate = student.statistics?.attendanceRate || calculateAttendanceRate();
  const averageGrade = student.statistics?.averageGrade || calculateAverageGrade();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" className="max-w-4xl">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={student.img || undefined} alt={student.name} />
            <AvatarFallback className="bg-emerald-100 text-emerald-600 text-lg font-semibold">
              {generateInitials(student.name, student.surname)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {student.name} {student.surname}
            </h2>
            <p className="text-slate-600 flex items-center gap-2">
              <User className="w-4 h-4" />
              {student.username}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                {student.class.name}
              </Badge>
              {student.class.grade && (
                <Badge variant="outline" className="text-xs">
                  {student.class.grade.name}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-600 font-medium">Average Grade</p>
                <p className="text-lg font-bold text-slate-900">{averageGrade}%</p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-600 font-medium">Attendance</p>
                <p className="text-lg font-bold text-slate-900">{attendanceRate}%</p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-slate-600 font-medium">Total Exams</p>
                <p className="text-lg font-bold text-slate-900">
                  {student.statistics?.totalExams || student.results?.filter(r => r.exam).length || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-slate-600 font-medium">Assignments</p>
                <p className="text-lg font-bold text-slate-900">
                  {student.statistics?.totalAssignments || student.results?.filter(r => r.assignment).length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-slate-600" />
            Performance Overview
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-700">Academic Performance</span>
                <span className="text-sm font-semibold text-slate-900">{averageGrade}%</span>
              </div>
              <Progress value={averageGrade} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-700">Attendance Rate</span>
                <span className="text-sm font-semibold text-slate-900">{attendanceRate}%</span>
              </div>
              <Progress value={attendanceRate} className="h-2" />
            </div>
          </div>
        </div>

        {/* Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-slate-600" />
              Personal Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-slate-400" />
                <div className="flex-1">
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="text-sm font-medium text-slate-900">
                    {student.email || 'Not provided'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-slate-400" />
                <div className="flex-1">
                  <p className="text-xs text-slate-500">Phone</p>
                  <p className="text-sm font-medium text-slate-900">
                    {student.phone || 'Not provided'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-slate-400" />
                <div className="flex-1">
                  <p className="text-xs text-slate-500">Address</p>
                  <p className="text-sm font-medium text-slate-900">
                    {student.address || 'Not provided'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-slate-400" />
                <div className="flex-1">
                  <p className="text-xs text-slate-500">Birthday</p>
                  <p className="text-sm font-medium text-slate-900">
                    {formatDate(student.birthday)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-slate-400" />
                <div className="flex-1">
                  <p className="text-xs text-slate-500">Gender</p>
                  <p className="text-sm font-medium text-slate-900">{student.sex}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Heart className="w-4 h-4 text-slate-400" />
                <div className="flex-1">
                  <p className="text-xs text-slate-500">Blood Type</p>
                  <p className="text-sm font-medium text-slate-900">
                    {student.bloodType || 'Not provided'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-slate-600" />
              Academic Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-slate-400" />
                <div className="flex-1">
                  <p className="text-xs text-slate-500">Class</p>
                  <p className="text-sm font-medium text-slate-900">{student.class.name}</p>
                </div>
              </div>
              {student.class.grade && (
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-4 h-4 text-slate-400" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-500">Grade Level</p>
                    <p className="text-sm font-medium text-slate-900">
                      {student.class.grade.name}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-slate-400" />
                <div className="flex-1">
                  <p className="text-xs text-slate-500">Enrollment Date</p>
                  <p className="text-sm font-medium text-slate-900">
                    {formatDate(student.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-slate-400" />
                <div className="flex-1">
                  <p className="text-xs text-slate-500">Student ID</p>
                  <p className="text-sm font-medium text-slate-900">{student.id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Parent Information */}
        {student.parent && (
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-slate-600" />
              Parent/Guardian Information
            </h3>
            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-slate-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900">
                    {student.parent.name} {student.parent.surname}
                  </h4>
                  <div className="space-y-1 mt-2">
                    {student.parent.phone && (
                      <p className="text-sm text-slate-600 flex items-center gap-2">
                        <Phone className="w-3 h-3" />
                        {student.parent.phone}
                      </p>
                    )}
                    {student.parent.email && (
                      <p className="text-sm text-slate-600 flex items-center gap-2">
                        <Mail className="w-3 h-3" />
                        {student.parent.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <Button 
            onClick={() => window.open(`/profile/student/${student.id}`, '_blank')}
            className="bg-slate-900 hover:bg-slate-800"
            leftIcon={<User className="w-4 h-4" />}
          >
            View Full Profile
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default StudentPreview;