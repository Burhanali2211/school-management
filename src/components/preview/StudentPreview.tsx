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
  BarChart3
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

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
      <BasePreviewModal
        isOpen={isOpen}
        onClose={onClose}
        title="Student Not Found"
        size="lg"
      >
        <div className="text-center py-8">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Student information could not be loaded.</p>
        </div>
      </BasePreviewModal>
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

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-green-600';
    if (grade >= 80) return 'text-blue-600';
    if (grade >= 70) return 'text-yellow-600';
    if (grade >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600';
    if (rate >= 85) return 'text-blue-600';
    if (rate >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const attendanceRate = student.statistics?.attendanceRate || calculateAttendanceRate();
  const averageGrade = student.statistics?.averageGrade || calculateAverageGrade();

  return (
    <BasePreviewModal
      isOpen={isOpen}
      onClose={onClose}
      title={`${student.name} ${student.surname}`}
      size="xl"
    >
      <div className="space-y-6">
        {/* Header */}
        <PreviewHeader
          image={student.img}
          title={`${student.name} ${student.surname}`}
          subtitle={`Student • ${student.username}`}
          badges={[
            { text: student.class.name, variant: 'secondary' },
            ...(student.class.grade ? [{ text: `Grade ${student.class.grade.level}`, variant: 'outline' }] : [])
          ]}
        />

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Average Grade</p>
                <p className={`text-2xl font-bold ${getGradeColor(averageGrade)}`}>
                  {averageGrade}%
                </p>
              </div>
              <Award className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Attendance</p>
                <p className={`text-2xl font-bold ${getAttendanceColor(attendanceRate)}`}>
                  {attendanceRate}%
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Total Exams</p>
                <p className="text-2xl font-bold text-purple-700">
                  {student.statistics?.totalExams || student.results?.filter(r => r.exam).length || 0}
                </p>
              </div>
              <FileText className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Assignments</p>
                <p className="text-2xl font-bold text-orange-700">
                  {student.statistics?.totalAssignments || student.results?.filter(r => r.assignment).length || 0}
                </p>
              </div>
              <BookOpen className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <PreviewSection title="Personal Information" icon={<User className="w-5 h-5" />}>
          <PreviewGrid columns={2}>
            <PreviewField
              label="Full Name"
              value={`${student.name} ${student.surname}`}
              icon={<User className="w-4 h-4" />}
            />
            <PreviewField
              label="Username"
              value={student.username}
              icon={<User className="w-4 h-4" />}
            />
            <PreviewField
              label="Email"
              value={student.email || 'Not provided'}
              icon={<Mail className="w-4 h-4" />}
            />
            <PreviewField
              label="Phone"
              value={student.phone || 'Not provided'}
              icon={<Phone className="w-4 h-4" />}
            />
            <PreviewField
              label="Address"
              value={student.address || 'Not provided'}
              icon={<MapPin className="w-4 h-4" />}
            />
            <PreviewField
              label="Birthday"
              value={formatDate(student.birthday)}
              icon={<Calendar className="w-4 h-4" />}
            />
            <PreviewField
              label="Gender"
              value={student.sex}
              icon={<User className="w-4 h-4" />}
            />
            <PreviewField
              label="Blood Type"
              value={student.bloodType || 'Not provided'}
              icon={<Heart className="w-4 h-4" />}
            />
          </PreviewGrid>
        </PreviewSection>

        {/* Academic Information */}
        <PreviewSection title="Academic Information" icon={<GraduationCap className="w-5 h-5" />}>
          <PreviewGrid columns={2}>
            <PreviewField
              label="Class"
              value={student.class.name}
              icon={<Users className="w-4 h-4" />}
            />
            {student.class.grade && (
              <PreviewField
                label="Grade Level"
                value={`Grade ${student.class.grade.level}`}
                icon={<GraduationCap className="w-4 h-4" />}
              />
            )}
            <PreviewField
              label="Enrollment Date"
              value={formatDate(student.createdAt)}
              icon={<Calendar className="w-4 h-4" />}
            />
            <PreviewField
              label="Student ID"
              value={student.id}
              icon={<FileText className="w-4 h-4" />}
            />
          </PreviewGrid>
        </PreviewSection>

        {/* Performance Overview */}
        <PreviewSection title="Performance Overview" icon={<BarChart3 className="w-5 h-5" />}>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Academic Performance</span>
                <span className={`text-sm font-bold ${getGradeColor(averageGrade)}`}>
                  {averageGrade}%
                </span>
              </div>
              <Progress value={averageGrade} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Attendance Rate</span>
                <span className={`text-sm font-bold ${getAttendanceColor(attendanceRate)}`}>
                  {attendanceRate}%
                </span>
              </div>
              <Progress value={attendanceRate} className="h-2" />
            </div>
          </div>
        </PreviewSection>

        {/* Recent Academic Results */}
        {student.results && student.results.length > 0 && (
          <PreviewSection title="Recent Academic Results" icon={<Award className="w-5 h-5" />}>
            <div className="space-y-3">
              {student.results.slice(0, 5).map((result) => (
                <div key={result.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {result.exam?.title || result.assignment?.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      {result.exam ? 'Exam' : 'Assignment'} • {' '}
                      {result.exam?.startTime 
                        ? formatDate(result.exam.startTime)
                        : result.assignment?.dueDate 
                        ? `Due: ${formatDate(result.assignment.dueDate)}`
                        : 'No date'
                      }
                    </p>
                  </div>
                  <Badge 
                    variant={
                      result.score >= 90 ? "default" : 
                      result.score >= 80 ? "secondary" : 
                      result.score >= 70 ? "outline" : "destructive"
                    }
                    className="ml-3"
                  >
                    {result.score}%
                  </Badge>
                </div>
              ))}
            </div>
          </PreviewSection>
        )}

        {/* Recent Attendance */}
        {student.attendances && student.attendances.length > 0 && (
          <PreviewSection title="Recent Attendance" icon={<Clock className="w-5 h-5" />}>
            <div className="space-y-2">
              {student.attendances.slice(0, 5).map((attendance) => (
                <div key={attendance.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{attendance.lesson.subject.name}</p>
                    <p className="text-sm text-gray-500">
                      {attendance.lesson.name} • {formatDate(attendance.date)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {attendance.present ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <Badge variant={attendance.present ? "default" : "destructive"}>
                      {attendance.present ? "Present" : "Absent"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </PreviewSection>
        )}

        {/* Fee Information */}
        {student.fees && student.fees.length > 0 && (
          <PreviewSection title="Fee Information" icon={<DollarSign className="w-5 h-5" />}>
            <div className="space-y-3">
              {student.fees.slice(0, 5).map((fee) => (
                <div key={fee.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">${fee.amount}</p>
                    <p className="text-sm text-gray-500">Due: {formatDate(fee.dueDate)}</p>
                  </div>
                  <Badge 
                    variant={
                      fee.status === 'PAID' ? "default" : 
                      fee.status === 'OVERDUE' ? "destructive" : "secondary"
                    }
                  >
                    {fee.status}
                  </Badge>
                </div>
              ))}
            </div>
          </PreviewSection>
        )}

        {/* Parent Information */}
        {student.parent && (
          <PreviewSection title="Parent/Guardian Information" icon={<Users className="w-5 h-5" />}>
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-purple-900">
                    {student.parent.name} {student.parent.surname}
                  </h4>
                  <div className="space-y-1 mt-2">
                    {student.parent.phone && (
                      <p className="text-sm text-purple-700 flex items-center gap-2">
                        <Phone className="w-3 h-3" />
                        {student.parent.phone}
                      </p>
                    )}
                    {student.parent.email && (
                      <p className="text-sm text-purple-700 flex items-center gap-2">
                        <Mail className="w-3 h-3" />
                        {student.parent.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </PreviewSection>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button 
            onClick={() => window.open(`/profile/student/${student.id}`, '_blank')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <User className="w-4 h-4 mr-2" />
            View Full Profile
          </Button>
        </div>
      </div>
    </BasePreviewModal>
  );
};

export default StudentPreview;