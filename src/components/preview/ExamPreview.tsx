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
import { Calendar, Clock, BookOpen, Users, Award, TrendingUp } from 'lucide-react';

interface ExamData {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  lesson?: {
    id: string;
    subject: {
      name: string;
    };
    class: {
      name: string;
      grade?: {
        level: number;
      };
    };
    teacher: {
      name: string;
      surname: string;
    };
  };
  // Additional data
  description?: string;
  totalMarks?: number;
  passingMarks?: number;
  duration?: number; // in minutes
  examType?: 'midterm' | 'final' | 'quiz' | 'assignment';
  status?: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  results?: {
    totalStudents: number;
    submittedCount: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    passCount: number;
  };
  instructions?: string[];
}

interface ExamPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  exam: ExamData | null;
  isLoading?: boolean;
}

const ExamPreview: React.FC<ExamPreviewProps> = ({
  isOpen,
  onClose,
  exam,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <BasePreviewModal
        isOpen={isOpen}
        onClose={onClose}
        title="Loading Exam Details..."
        size="xl"
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </BasePreviewModal>
    );
  }

  if (!exam) {
    return (
      <BasePreviewModal
        isOpen={isOpen}
        onClose={onClose}
        title="Exam Not Found"
        size="xl"
      >
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">Exam data not available</p>
        </div>
      </BasePreviewModal>
    );
  }

  const duration = exam.duration || Math.round((new Date(exam.endTime).getTime() - new Date(exam.startTime).getTime()) / (1000 * 60));
  const passRate = exam.results ? Math.round((exam.results.passCount / exam.results.totalStudents) * 100) : null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'secondary';
      case 'ongoing': return 'default';
      case 'completed': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getExamTypeColor = (type: string) => {
    switch (type) {
      case 'final': return 'destructive';
      case 'midterm': return 'default';
      case 'quiz': return 'secondary';
      case 'assignment': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <BasePreviewModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Exam Details - ${exam.title}`}
      size="xl"
    >
      <div className="space-y-6">
        {/* Header */}
        <PreviewHeader
          title={exam.title}
          subtitle={exam.lesson ? `${exam.lesson.subject.name} - ${exam.lesson.class.name}` : 'No lesson assigned'}
          badge={{
            text: exam.status || 'scheduled',
            variant: getStatusColor(exam.status || 'scheduled') as any
          }}
        />

        {/* Exam Information */}
        <PreviewSection title="Exam Information" icon={<BookOpen className="w-5 h-5" />}>
          <PreviewGrid columns={2}>
            <PreviewField
              label="Exam Title"
              value={exam.title}
              icon={<BookOpen className="w-4 h-4" />}
            />
            <PreviewField
              label="Exam Type"
              value={exam.examType}
              type="badge"
              badgeVariant={getExamTypeColor(exam.examType || 'quiz') as any}
              icon={<Award className="w-4 h-4" />}
            />
            <PreviewField
              label="Start Time"
              value={exam.startTime ? new Date(exam.startTime).toLocaleString() : 'N/A'}
              type="date"
              icon={<Calendar className="w-4 h-4" />}
            />
            <PreviewField
              label="End Time"
              value={exam.endTime ? new Date(exam.endTime).toLocaleString() : 'N/A'}
              type="date"
              icon={<Calendar className="w-4 h-4" />}
            />
            <PreviewField
              label="Duration"
              value={`${duration} minutes`}
              icon={<Clock className="w-4 h-4" />}
            />
            <PreviewField
              label="Status"
              value={exam.status}
              type="badge"
              badgeVariant={getStatusColor(exam.status || 'scheduled') as any}
              icon={<TrendingUp className="w-4 h-4" />}
            />
          </PreviewGrid>
        </PreviewSection>

        {/* Academic Details */}
        {exam.lesson && (
          <PreviewSection title="Academic Details" icon={<PreviewIcons.GraduationCap className="w-5 h-5" />}>
            <PreviewGrid columns={2}>
              <PreviewField
                label="Subject"
                value={exam.lesson.subject.name}
                icon={<BookOpen className="w-4 h-4" />}
              />
              <PreviewField
                label="Class"
                value={exam.lesson.class.name}
                icon={<Users className="w-4 h-4" />}
              />
              <PreviewField
                label="Grade Level"
                value={exam.lesson.class.grade?.level}
                icon={<TrendingUp className="w-4 h-4" />}
              />
              <PreviewField
                label="Teacher"
                value={`${exam.lesson.teacher.name} ${exam.lesson.teacher.surname}`}
                icon={<PreviewIcons.User className="w-4 h-4" />}
              />
            </PreviewGrid>
          </PreviewSection>
        )}

        {/* Grading Information */}
        <PreviewSection title="Grading Information" icon={<Award className="w-5 h-5" />}>
          <PreviewGrid columns={2}>
            <PreviewField
              label="Total Marks"
              value={exam.totalMarks}
              icon={<Award className="w-4 h-4" />}
            />
            <PreviewField
              label="Passing Marks"
              value={exam.passingMarks}
              icon={<TrendingUp className="w-4 h-4" />}
            />
            {exam.totalMarks && exam.passingMarks && (
              <PreviewField
                label="Pass Percentage"
                value={`${Math.round((exam.passingMarks / exam.totalMarks) * 100)}%`}
                icon={<TrendingUp className="w-4 h-4" />}
              />
            )}
          </PreviewGrid>
        </PreviewSection>

        {/* Description */}
        {exam.description && (
          <PreviewSection title="Description" icon={<BookOpen className="w-5 h-5" />}>
            <div className="p-4 bg-neutral-50 rounded-lg">
              <p className="text-neutral-700">{exam.description}</p>
            </div>
          </PreviewSection>
        )}

        {/* Instructions */}
        {exam.instructions && exam.instructions.length > 0 && (
          <PreviewSection title="Exam Instructions" icon={<BookOpen className="w-5 h-5" />}>
            <div className="space-y-2">
              {exam.instructions.map((instruction, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg">
                  <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <p className="text-neutral-700 flex-1">{instruction}</p>
                </div>
              ))}
            </div>
          </PreviewSection>
        )}

        {/* Results Summary */}
        {exam.results && (
          <PreviewSection title="Results Summary" icon={<TrendingUp className="w-5 h-5" />}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{exam.results.totalStudents}</div>
                <div className="text-sm text-blue-700">Total Students</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{exam.results.submittedCount}</div>
                <div className="text-sm text-green-700">Submitted</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{exam.results.averageScore}</div>
                <div className="text-sm text-purple-700">Average Score</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{exam.results.highestScore}</div>
                <div className="text-sm text-orange-700">Highest Score</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{exam.results.lowestScore}</div>
                <div className="text-sm text-red-700">Lowest Score</div>
              </div>
              <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600">{passRate}%</div>
                <div className="text-sm text-indigo-700">Pass Rate</div>
              </div>
            </div>
          </PreviewSection>
        )}

        {/* Schedule Information */}
        <PreviewSection title="Schedule Information" icon={<Calendar className="w-5 h-5" />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-900">Start Date & Time</span>
              </div>
              <div className="text-blue-700">
                {new Date(exam.startTime).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <div className="text-blue-600 font-medium">
                {new Date(exam.startTime).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-red-600" />
                <span className="font-medium text-red-900">End Date & Time</span>
              </div>
              <div className="text-red-700">
                {new Date(exam.endTime).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <div className="text-red-600 font-medium">
                {new Date(exam.endTime).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        </PreviewSection>
      </div>
    </BasePreviewModal>
  );
};

export default ExamPreview;
