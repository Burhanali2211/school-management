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
import { BookOpen, Users, GraduationCap, Calendar, TrendingUp } from 'lucide-react';

interface SubjectData {
  id: string;
  name: string;
  teachers?: {
    id: string;
    name: string;
    surname: string;
    img?: string;
  }[];
  lessons?: {
    id: string;
    class: {
      name: string;
      grade?: {
        level: number;
      };
    };
    day: string;
    startTime: Date;
    endTime: Date;
  }[];
  // Additional data
  description?: string;
  credits?: number;
  department?: string;
  prerequisites?: string[];
  statistics?: {
    totalStudents: number;
    averageGrade: number;
    passRate: number;
    totalLessons: number;
  };
}

interface SubjectPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  subject: SubjectData | null;
  isLoading?: boolean;
}

const SubjectPreview: React.FC<SubjectPreviewProps> = ({
  isOpen,
  onClose,
  subject,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <BasePreviewModal
        isOpen={isOpen}
        onClose={onClose}
        title="Loading Subject Details..."
        size="xl"
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </BasePreviewModal>
    );
  }

  if (!subject) {
    return (
      <BasePreviewModal
        isOpen={isOpen}
        onClose={onClose}
        title="Subject Not Found"
        size="xl"
      >
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">Subject data not available</p>
        </div>
      </BasePreviewModal>
    );
  }

  return (
    <BasePreviewModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Subject Details - ${subject.name}`}
      size="xl"
    >
      <div className="space-y-6">
        {/* Header */}
        <PreviewHeader
          title={subject.name}
          subtitle={subject.department || 'Academic Subject'}
          badge={{
            text: `${subject.teachers?.length || 0} Teachers`,
            variant: 'secondary'
          }}
        />

        {/* Subject Information */}
        <PreviewSection title="Subject Information" icon={<BookOpen className="w-5 h-5" />}>
          <PreviewGrid columns={2}>
            <PreviewField
              label="Subject Name"
              value={subject.name}
              icon={<BookOpen className="w-4 h-4" />}
            />
            <PreviewField
              label="Department"
              value={subject.department}
              icon={<GraduationCap className="w-4 h-4" />}
            />
            <PreviewField
              label="Credits"
              value={subject.credits}
              icon={<TrendingUp className="w-4 h-4" />}
            />
            <PreviewField
              label="Total Teachers"
              value={subject.teachers?.length || 0}
              icon={<Users className="w-4 h-4" />}
            />
          </PreviewGrid>
        </PreviewSection>

        {/* Description */}
        {subject.description && (
          <PreviewSection title="Description" icon={<BookOpen className="w-5 h-5" />}>
            <div className="p-4 bg-neutral-50 rounded-lg">
              <p className="text-neutral-700">{subject.description}</p>
            </div>
          </PreviewSection>
        )}

        {/* Prerequisites */}
        {subject.prerequisites && subject.prerequisites.length > 0 && (
          <PreviewSection title="Prerequisites" icon={<GraduationCap className="w-5 h-5" />}>
            <div className="flex flex-wrap gap-2">
              {subject.prerequisites.map((prerequisite, index) => (
                <Badge key={index} variant="outline">
                  {prerequisite}
                </Badge>
              ))}
            </div>
          </PreviewSection>
        )}

        {/* Teachers */}
        {subject.teachers && subject.teachers.length > 0 && (
          <PreviewSection title="Teaching Staff" icon={<Users className="w-5 h-5" />}>
            <div className="grid gap-3">
              {subject.teachers.map((teacher) => (
                <div key={teacher.id} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-neutral-900">
                      {teacher.name} {teacher.surname}
                    </div>
                    <div className="text-sm text-neutral-600">Subject Teacher</div>
                  </div>
                </div>
              ))}
            </div>
          </PreviewSection>
        )}

        {/* Statistics */}
        {subject.statistics && (
          <PreviewSection title="Subject Statistics" icon={<TrendingUp className="w-5 h-5" />}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{subject.statistics.totalStudents}</div>
                <div className="text-sm text-blue-700">Total Students</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{subject.statistics.averageGrade}</div>
                <div className="text-sm text-green-700">Average Grade</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{subject.statistics.passRate}%</div>
                <div className="text-sm text-purple-700">Pass Rate</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{subject.statistics.totalLessons}</div>
                <div className="text-sm text-orange-700">Total Lessons</div>
              </div>
            </div>
          </PreviewSection>
        )}

        {/* Schedule */}
        {subject.lessons && subject.lessons.length > 0 && (
          <PreviewSection title="Class Schedule" icon={<Calendar className="w-5 h-5" />}>
            <div className="space-y-2">
              {subject.lessons.map((lesson) => (
                <div key={lesson.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div>
                    <div className="font-medium text-neutral-900">{lesson.class.name}</div>
                    {lesson.class.grade && (
                      <div className="text-sm text-neutral-600">Grade {lesson.class.grade.level}</div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-primary-600">
                      {new Date(lesson.startTime).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })} - {new Date(lesson.endTime).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
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

export default SubjectPreview;
