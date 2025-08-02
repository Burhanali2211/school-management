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
  BarChart3,
  Briefcase,
  Star,
  ChevronRight
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
        <div className="text-center py-8">
          <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Teacher information could not be loaded.</p>
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
      <div className="space-y-6">
        {/* Header */}
        <PreviewHeader
          image={teacher.img}
          title={`${teacher.name} ${teacher.surname}`}
          subtitle={`Teacher • ${teacher.username}`}
          badges={[
            { text: `${totalSubjects} Subject${totalSubjects !== 1 ? 's' : ''}`, variant: 'secondary' },
            { text: `${totalClasses} Class${totalClasses !== 1 ? 'es' : ''}`, variant: 'outline' },
            { text: `${experienceYears} Year${experienceYears !== 1 ? 's' : ''} Experience`, variant: 'default' }
          ]}
        />

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Students</p>
                <p className="text-2xl font-bold text-blue-700">{totalStudents}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Classes</p>
                <p className="text-2xl font-bold text-green-700">{totalClasses}</p>
              </div>
              <GraduationCap className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Subjects</p>
                <p className="text-2xl font-bold text-purple-700">{totalSubjects}</p>
              </div>
              <BookOpen className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Avg Class Size</p>
                <p className="text-2xl font-bold text-orange-700">{averageClassSize}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <PreviewSection title="Personal Information" icon={<User className="w-5 h-5" />}>
          <PreviewGrid columns={2}>
            <PreviewField
              label="Full Name"
              value={`${teacher.name} ${teacher.surname}`}
              icon={<User className="w-4 h-4" />}
            />
            <PreviewField
              label="Username"
              value={teacher.username}
              icon={<User className="w-4 h-4" />}
            />
            <PreviewField
              label="Email"
              value={teacher.email || 'Not provided'}
              icon={<Mail className="w-4 h-4" />}
            />
            <PreviewField
              label="Phone"
              value={teacher.phone || 'Not provided'}
              icon={<Phone className="w-4 h-4" />}
            />
            <PreviewField
              label="Address"
              value={teacher.address || 'Not provided'}
              icon={<MapPin className="w-4 h-4" />}
            />
            <PreviewField
              label="Birthday"
              value={formatDate(teacher.birthday)}
              icon={<Calendar className="w-4 h-4" />}
            />
            <PreviewField
              label="Gender"
              value={teacher.sex}
              icon={<User className="w-4 h-4" />}
            />
            <PreviewField
              label="Blood Type"
              value={teacher.bloodType || 'Not provided'}
              icon={<Heart className="w-4 h-4" />}
            />
          </PreviewGrid>
        </PreviewSection>

        {/* Professional Information */}
        <PreviewSection title="Professional Information" icon={<Briefcase className="w-5 h-5" />}>
          <PreviewGrid columns={2}>
            <PreviewField
              label="Employee ID"
              value={teacher.id}
              icon={<FileText className="w-4 h-4" />}
            />
            <PreviewField
              label="Join Date"
              value={formatDate(teacher.createdAt)}
              icon={<Calendar className="w-4 h-4" />}
            />
            <PreviewField
              label="Experience"
              value={`${experienceYears} year${experienceYears !== 1 ? 's' : ''}`}
              icon={<Award className="w-4 h-4" />}
            />
            <PreviewField
              label="Total Students"
              value={totalStudents.toString()}
              icon={<Users className="w-4 h-4" />}
            />
          </PreviewGrid>
        </PreviewSection>

        {/* Teaching Load Overview */}
        <PreviewSection title="Teaching Load Overview" icon={<BarChart3 className="w-5 h-5" />}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-700">{totalSubjects}</p>
              <p className="text-sm text-blue-600">Subjects Teaching</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <GraduationCap className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-700">{totalClasses}</p>
              <p className="text-sm text-green-600">Classes Assigned</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-700">{totalStudents}</p>
              <p className="text-sm text-purple-600">Total Students</p>
            </div>
          </div>
        </PreviewSection>

        {/* Subjects Teaching */}
        {teacher.subjects && teacher.subjects.length > 0 && (
          <PreviewSection title="Subjects Teaching" icon={<BookOpen className="w-5 h-5" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {teacher.subjects.map((subject) => (
                <div key={subject.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-blue-900">{subject.name}</p>
                      {subject.department && (
                        <p className="text-sm text-blue-600">{subject.department}</p>
                      )}
                    </div>
                  </div>
                  {subject.credits && (
                    <Badge variant="secondary" className="bg-blue-200 text-blue-800">
                      {subject.credits} Credits
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </PreviewSection>
        )}

        {/* Classes Assigned */}
        {teacher.classes && teacher.classes.length > 0 && (
          <PreviewSection title="Classes Assigned" icon={<GraduationCap className="w-5 h-5" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {teacher.classes.map((classItem) => (
                <div key={classItem.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-green-900">{classItem.name}</p>
                      <div className="flex items-center space-x-2 text-sm text-green-600">
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
                  </div>
                  <ChevronRight className="w-5 h-5 text-green-500" />
                </div>
              ))}
            </div>
          </PreviewSection>
        )}

        {/* Weekly Schedule */}
        {teacher.lessons && teacher.lessons.length > 0 && (
          <PreviewSection title="Weekly Schedule" icon={<Clock className="w-5 h-5" />}>
            <div className="space-y-2">
              {teacher.lessons.slice(0, 8).map((lesson) => (
                <div key={lesson.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{lesson.subject.name}</p>
                      <p className="text-sm text-gray-500">
                        {lesson.class.name} • {lesson.day}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(lesson.startTime).toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: true 
                      })} - {new Date(lesson.endTime).toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: true 
                      })}
                    </p>
                    <p className="text-xs text-gray-500">{lesson.name}</p>
                  </div>
                </div>
              ))}
              {teacher.lessons.length > 8 && (
                <div className="text-center py-2">
                  <p className="text-sm text-gray-500">
                    +{teacher.lessons.length - 8} more lessons
                  </p>
                </div>
              )}
            </div>
          </PreviewSection>
        )}

        {/* Performance Metrics */}
        <PreviewSection title="Performance Metrics" icon={<TrendingUp className="w-5 h-5" />}>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Class Load Efficiency</span>
                <span className="text-sm font-bold text-blue-600">
                  {Math.min(100, Math.round((totalClasses / 8) * 100))}%
                </span>
              </div>
              <Progress value={Math.min(100, Math.round((totalClasses / 8) * 100))} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Student Engagement</span>
                <span className="text-sm font-bold text-green-600">
                  {Math.min(100, Math.round((totalStudents / 200) * 100))}%
                </span>
              </div>
              <Progress value={Math.min(100, Math.round((totalStudents / 200) * 100))} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Subject Expertise</span>
                <span className="text-sm font-bold text-purple-600">
                  {Math.min(100, Math.round((totalSubjects / 5) * 100))}%
                </span>
              </div>
              <Progress value={Math.min(100, Math.round((totalSubjects / 5) * 100))} className="h-2" />
            </div>
          </div>
        </PreviewSection>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button 
            onClick={() => window.open(`/profile/teacher/${teacher.id}`, '_blank')}
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

export default TeacherPreview;