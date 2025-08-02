"use client";

import React from 'react';
import Image from 'next/image';
import {
  BasePreviewModal,
  PreviewHeader,
  PreviewSection,
  PreviewField,
  PreviewGrid,
  PreviewIcons
} from './BasePreviewModal';
import { Badge } from '@/components/ui/badge';
import { Users, GraduationCap, Calendar, BookOpen, User, TrendingUp } from 'lucide-react';

interface ClassData {
  id: string;
  name: string;
  capacity?: number;
  grade?: {
    id: string;
    level: number;
  };
  supervisor?: {
    id: string;
    name: string;
    surname: string;
    img?: string;
    email?: string;
    phone?: string;
  };
  students?: {
    id: string;
    name: string;
    surname: string;
    img?: string;
    username: string;
  }[];
  subjects?: {
    id: string;
    name: string;
    teacher?: {
      name: string;
      surname: string;
    };
  }[];
  // Additional data
  schedule?: {
    day: string;
    subject: string;
    teacher: string;
    startTime: string;
    endTime: string;
  }[];
  statistics?: {
    averageAttendance: number;
    averageGrade: number;
    totalAssignments: number;
    completedAssignments: number;
  };
}

interface ClassPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  classData: ClassData | null;
  isLoading?: boolean;
}

const ClassPreview: React.FC<ClassPreviewProps> = ({
  isOpen,
  onClose,
  classData,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <BasePreviewModal
        isOpen={isOpen}
        onClose={onClose}
        title="Loading Class Details..."
        size="xl"
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </BasePreviewModal>
    );
  }

  if (!classData) {
    return (
      <BasePreviewModal
        isOpen={isOpen}
        onClose={onClose}
        title="Class Not Found"
        size="xl"
      >
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">Class data not available</p>
        </div>
      </BasePreviewModal>
    );
  }

  const studentCount = classData.students?.length || 0;
  const subjectCount = classData.subjects?.length || 0;

  return (
    <BasePreviewModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Class Profile - ${classData.name}`}
      size="xl"
    >
      <div className="space-y-6">
        {/* Header */}
        <PreviewHeader
          title={classData.name}
          subtitle={classData.grade ? `Grade ${classData.grade.level}` : 'No grade assigned'}
          badge={{
            text: `${studentCount} Students`,
            variant: 'secondary'
          }}
        />

        {/* Class Information */}
        <PreviewSection title="Class Information" icon={<GraduationCap className="w-5 h-5" />}>
          <PreviewGrid columns={2}>
            <PreviewField
              label="Class Name"
              value={classData.name}
              icon={<BookOpen className="w-4 h-4" />}
            />
            <PreviewField
              label="Grade Level"
              value={classData.grade?.level}
              icon={<TrendingUp className="w-4 h-4" />}
            />
            <PreviewField
              label="Capacity"
              value={classData.capacity}
              icon={<Users className="w-4 h-4" />}
            />
            <PreviewField
              label="Current Enrollment"
              value={studentCount}
              icon={<Users className="w-4 h-4" />}
            />
          </PreviewGrid>
        </PreviewSection>

        {/* Class Supervisor */}
        {classData.supervisor && (
          <PreviewSection title="Class Supervisor" icon={<User className="w-5 h-5" />}>
            <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-lg">
              <Image
                src={classData.supervisor.img || "/noAvatar.png"}
                alt={`${classData.supervisor.name} ${classData.supervisor.surname}`}
                width={64}
                height={64}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="flex-1">
                <h4 className="font-semibold text-neutral-900">
                  {classData.supervisor.name} {classData.supervisor.surname}
                </h4>
                <div className="space-y-1 mt-2">
                  {classData.supervisor.email && (
                    <p className="text-sm text-neutral-600 flex items-center gap-2">
                      <PreviewIcons.Mail className="w-3 h-3" />
                      {classData.supervisor.email}
                    </p>
                  )}
                  {classData.supervisor.phone && (
                    <p className="text-sm text-neutral-600 flex items-center gap-2">
                      <PreviewIcons.Phone className="w-3 h-3" />
                      {classData.supervisor.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </PreviewSection>
        )}

        {/* Class Statistics */}
        {classData.statistics && (
          <PreviewSection title="Class Statistics" icon={<TrendingUp className="w-5 h-5" />}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{classData.statistics.averageAttendance}%</div>
                <div className="text-sm text-green-700">Avg Attendance</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{classData.statistics.averageGrade}</div>
                <div className="text-sm text-blue-700">Avg Grade</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{classData.statistics.totalAssignments}</div>
                <div className="text-sm text-purple-700">Total Assignments</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round((classData.statistics.completedAssignments / classData.statistics.totalAssignments) * 100)}%
                </div>
                <div className="text-sm text-orange-700">Completion Rate</div>
              </div>
            </div>
          </PreviewSection>
        )}

        {/* Subjects */}
        {classData.subjects && classData.subjects.length > 0 && (
          <PreviewSection title="Subjects" icon={<BookOpen className="w-5 h-5" />}>
            <div className="grid gap-3">
              {classData.subjects.map((subject) => (
                <div key={subject.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div>
                    <div className="font-medium text-neutral-900">{subject.name}</div>
                    {subject.teacher && (
                      <div className="text-sm text-neutral-600">
                        Teacher: {subject.teacher.name} {subject.teacher.surname}
                      </div>
                    )}
                  </div>
                  <Badge variant="outline">Subject</Badge>
                </div>
              ))}
            </div>
          </PreviewSection>
        )}

        {/* Students */}
        {classData.students && classData.students.length > 0 && (
          <PreviewSection title="Students" icon={<Users className="w-5 h-5" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {classData.students.slice(0, 10).map((student) => (
                <div key={student.id} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                  <Image
                    src={student.img || "/noAvatar.png"}
                    alt={`${student.name} ${student.surname}`}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-medium text-neutral-900">
                      {student.name} {student.surname}
                    </div>
                    <div className="text-sm text-neutral-600">ID: {student.username}</div>
                  </div>
                </div>
              ))}
              {classData.students.length > 10 && (
                <div className="flex items-center justify-center p-3 bg-neutral-100 rounded-lg text-neutral-600">
                  +{classData.students.length - 10} more students
                </div>
              )}
            </div>
          </PreviewSection>
        )}

        {/* Weekly Schedule */}
        {classData.schedule && classData.schedule.length > 0 && (
          <PreviewSection title="Weekly Schedule" icon={<Calendar className="w-5 h-5" />}>
            <div className="space-y-2">
              {classData.schedule.map((lesson, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div>
                    <div className="font-medium text-neutral-900">{lesson.subject}</div>
                    <div className="text-sm text-neutral-600">{lesson.teacher}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-primary-600">
                      {lesson.startTime} - {lesson.endTime}
                    </div>
                    <div className="text-xs text-neutral-500">{lesson.day}</div>
                  </div>
                </div>
              ))}
            </div>
          </PreviewSection>
        )}
      </div>
    </BasePreviewModal>
  );
};

export default ClassPreview;
