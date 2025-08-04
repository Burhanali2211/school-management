"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  GraduationCap, 
  Users, 
  School, 
  Info, 
  X,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

interface IndianSchoolGuideProps {
  onClose?: () => void;
  showOnFirstVisit?: boolean;
}

const gradeInfo = [
  { name: "Nursery", age: "3-4 years", description: "Foundation stage - Play-based learning" },
  { name: "LKG", age: "4-5 years", description: "Lower Kindergarten - Basic skills development" },
  { name: "UKG", age: "5-6 years", description: "Upper Kindergarten - School readiness" },
  { name: "Class 1", age: "6-7 years", description: "Primary education begins" },
  { name: "Class 2", age: "7-8 years", description: "Building reading and math skills" },
  { name: "Class 3", age: "8-9 years", description: "Developing critical thinking" },
  { name: "Class 4", age: "9-10 years", description: "Expanding knowledge base" },
  { name: "Class 5", age: "10-11 years", description: "Upper primary completion" },
  { name: "Class 6", age: "11-12 years", description: "Middle school begins" },
  { name: "Class 7", age: "12-13 years", description: "Subject specialization starts" },
  { name: "Class 8", age: "13-14 years", description: "Preparing for board exams" },
  { name: "Class 9", age: "14-15 years", description: "Secondary education" },
  { name: "Class 10", age: "15-16 years", description: "Board examination year" },
  { name: "Class 11", age: "16-17 years", description: "Higher secondary - Science/Commerce/Arts" },
  { name: "Class 12", age: "17-18 years", description: "Final board examination year" },
];

const quickTips = [
  "Use 'Nursery' to 'Class 12' instead of complex grade numbers",
  "Each class can have multiple sections (A, B, C)",
  "Students are automatically assigned to appropriate classes",
  "Attendance and results are tracked per class",
  "Teachers can manage multiple classes easily",
  "Parents can view their child's progress by class",
];

export function IndianSchoolGuide({ onClose, showOnFirstVisit = false }: IndianSchoolGuideProps) {
  const [showDetails, setShowDetails] = useState(false);

  if (!showOnFirstVisit) {
    return null;
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <School className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Welcome to Indian School Management System
            </h3>
            <p className="text-sm text-gray-600">
              Simplified grade system designed for Indian schools
            </p>
          </div>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {/* Quick Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white rounded-lg border border-blue-100">
            <GraduationCap className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-900">15 Grade Levels</h4>
            <p className="text-sm text-gray-600">Nursery to Class 12</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border border-blue-100">
            <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-900">Multiple Sections</h4>
            <p className="text-sm text-gray-600">A, B, C per class</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border border-blue-100">
            <BookOpen className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-900">Easy Management</h4>
            <p className="text-sm text-gray-600">Simple and intuitive</p>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="bg-white rounded-lg p-4 border border-blue-100">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600" />
            Quick Tips for Teachers
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {quickTips.map((tip, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{tip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Grade Details Toggle */}
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => setShowDetails(!showDetails)}
            className="border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            {showDetails ? 'Hide' : 'Show'} Grade Details
            <ArrowRight className={`w-4 h-4 ml-2 transition-transform ${showDetails ? 'rotate-90' : ''}`} />
          </Button>
        </div>

        {/* Detailed Grade Information */}
        {showDetails && (
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <h4 className="font-semibold text-gray-900 mb-4">Complete Grade Structure</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {gradeInfo.map((grade, index) => (
                <div key={index} className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {grade.name}
                    </Badge>
                    <span className="text-xs text-gray-500">{grade.age}</span>
                  </div>
                  <p className="text-sm text-gray-700">{grade.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
} 