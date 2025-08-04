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
  Baby,
  Star,
  ChevronRight,
  GraduationCap,
  Home,
  MessageCircle
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import Image from 'next/image';

interface Parent {
  id: string;
  name: string;
  surname: string;
  username: string;
  email?: string | null;
  phone?: string | null;
  address?: string;
  img?: string | null;
  createdAt: Date;
  students: {
    id: string;
    name: string;
    surname: string;
    img?: string | null;
    class?: {
      id: number;
      name: string;
      grade?: {
      level: number;
      name: string;
    };
    };
    attendances?: {
      id: number;
      date: Date;
      present: boolean;
    }[];
    results?: {
      id: number;
      score: number;
      exam?: {
        title: string;
      };
      assignment?: {
        title: string;
      };
    }[];
    fees?: {
      id: number;
      amount: number;
      status: string;
    }[];
  }[];
  messages?: {
    id: number;
    content: string;
    createdAt: Date;
    sender: {
      name: string;
      surname: string;
      role: string;
    };
  }[];
  statistics?: {
    totalChildren: number;
    totalFees: number;
    pendingFees: number;
    averageAttendance: number;
    averageGrades: number;
    totalMessages: number;
  };
}

interface ParentPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  parent: Parent | null;
}

const ParentPreview: React.FC<ParentPreviewProps> = ({
  isOpen,
  onClose,
  parent
}) => {
  if (!parent) {
    return (
      <BasePreviewModal
        isOpen={isOpen}
        onClose={onClose}
        title="Parent Not Found"
        size="lg"
      >
        <div className="text-center py-8">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Parent information could not be loaded.</p>
        </div>
      </BasePreviewModal>
    );
  }

  const calculateOverallAttendance = () => {
    if (!parent.students?.length) return 0;
    
    let totalAttendances = 0;
    let totalPresent = 0;
    
    parent.students.forEach(student => {
      if (student.attendances) {
        totalAttendances += student.attendances.length;
        totalPresent += student.attendances.filter(a => a.present).length;
      }
    });
    
    return totalAttendances > 0 ? Math.round((totalPresent / totalAttendances) * 100) : 0;
  };

  const calculateOverallGrades = () => {
    if (!parent.students?.length) return 0;
    
    let totalResults = 0;
    let totalScore = 0;
    
    parent.students.forEach(student => {
      if (student.results) {
        totalResults += student.results.length;
        totalScore += student.results.reduce((sum, result) => sum + result.score, 0);
      }
    });
    
    return totalResults > 0 ? Math.round(totalScore / totalResults) : 0;
  };

  const calculateTotalFees = () => {
    if (!parent.students?.length) return { total: 0, pending: 0 };
    
    let total = 0;
    let pending = 0;
    
    parent.students.forEach(student => {
      if (student.fees) {
        student.fees.forEach(fee => {
          total += fee.amount;
          if (fee.status !== 'PAID') {
            pending += fee.amount;
          }
        });
      }
    });
    
    return { total, pending };
  };

  const getChildrenByGrade = () => {
    const gradeGroups: { [key: string]: typeof parent.students } = {};
    
    parent.students.forEach(student => {
      const grade = student.class?.grade?.level || 'Unknown';
      const gradeKey = `Grade ${grade}`;
      
      if (!gradeGroups[gradeKey]) {
        gradeGroups[gradeKey] = [];
      }
      gradeGroups[gradeKey].push(student);
    });
    
    return gradeGroups;
  };

  const totalChildren = parent.statistics?.totalChildren || parent.students?.length || 0;
  const overallAttendance = parent.statistics?.averageAttendance || calculateOverallAttendance();
  const overallGrades = parent.statistics?.averageGrades || calculateOverallGrades();
  const feeInfo = calculateTotalFees();
  const totalFees = parent.statistics?.totalFees || feeInfo.total;
  const pendingFees = parent.statistics?.pendingFees || feeInfo.pending;
  const childrenByGrade = getChildrenByGrade();

  return (
    <BasePreviewModal
      isOpen={isOpen}
      onClose={onClose}
      title={`${parent.name} ${parent.surname}`}
      size="xl"
    >
      <div className="space-y-6">
        {/* Header */}
        <PreviewHeader
          image={parent.img}
          title={`${parent.name} ${parent.surname}`}
          subtitle={`Parent • ${parent.username}`}
          badges={[
            { text: `${totalChildren} Child${totalChildren !== 1 ? 'ren' : ''}`, variant: 'secondary' },
            { text: pendingFees > 0 ? `$${pendingFees} Pending` : 'Fees Up to Date', variant: pendingFees > 0 ? 'destructive' : 'default' }
          ]}
        />

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Children</p>
                <p className="text-2xl font-bold text-blue-700">{totalChildren}</p>
              </div>
              <Baby className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Avg Attendance</p>
                <p className="text-2xl font-bold text-green-700">{overallAttendance}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Avg Grades</p>
                <p className="text-2xl font-bold text-purple-700">{overallGrades}%</p>
              </div>
              <Award className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Pending Fees</p>
                <p className="text-2xl font-bold text-orange-700">${pendingFees}</p>
              </div>
              <DollarSign className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <PreviewSection title="Personal Information" icon={<User className="w-5 h-5" />}>
          <PreviewGrid columns={2}>
            <PreviewField
              label="Full Name"
              value={`${parent.name} ${parent.surname}`}
              icon={<User className="w-4 h-4" />}
            />
            <PreviewField
              label="Username"
              value={parent.username}
              icon={<User className="w-4 h-4" />}
            />
            <PreviewField
              label="Email"
              value={parent.email || 'Not provided'}
              icon={<Mail className="w-4 h-4" />}
            />
            <PreviewField
              label="Phone"
              value={parent.phone || 'Not provided'}
              icon={<Phone className="w-4 h-4" />}
            />
            <PreviewField
              label="Address"
              value={parent.address || 'Not provided'}
              icon={<MapPin className="w-4 h-4" />}
            />
            <PreviewField
              label="Registration Date"
              value={formatDate(parent.createdAt)}
              icon={<Calendar className="w-4 h-4" />}
            />
          </PreviewGrid>
        </PreviewSection>

        {/* Children Overview */}
        <PreviewSection title="Children Overview" icon={<Baby className="w-5 h-5" />}>
          <div className="space-y-4">
            {Object.entries(childrenByGrade).map(([grade, students]) => (
              <div key={grade} className="border rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <GraduationCap className="w-4 h-4 mr-2" />
                  {grade} ({students.length} student{students.length !== 1 ? 's' : ''})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {students.map((student) => (
                    <div key={student.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                        {student.img ? (
                          <Image
                            src={student.img}
                            alt={`${student.name} ${student.surname}`}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-blue-200 flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {student.name} {student.surname}
                        </p>
                        <p className="text-sm text-gray-500">
                          {student.class?.name || 'No class assigned'}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </PreviewSection>

        {/* Academic Performance Summary */}
        <PreviewSection title="Academic Performance Summary" icon={<BarChart3 className="w-5 h-5" />}>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Overall Attendance Rate</span>
                <span className="text-sm font-bold text-green-600">{overallAttendance}%</span>
              </div>
              <Progress value={overallAttendance} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Overall Academic Performance</span>
                <span className="text-sm font-bold text-purple-600">{overallGrades}%</span>
              </div>
              <Progress value={overallGrades} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Fee Payment Status</span>
                <span className="text-sm font-bold text-blue-600">
                  {totalFees > 0 ? Math.round(((totalFees - pendingFees) / totalFees) * 100) : 100}%
                </span>
              </div>
              <Progress 
                value={totalFees > 0 ? Math.round(((totalFees - pendingFees) / totalFees) * 100) : 100} 
                className="h-2" 
              />
            </div>
          </div>
        </PreviewSection>

        {/* Individual Student Performance */}
        {parent.students && parent.students.length > 0 && (
          <PreviewSection title="Individual Student Performance" icon={<Target className="w-5 h-5" />}>
            <div className="space-y-3">
              {parent.students.map((student) => {
                const studentAttendance = student.attendances?.length 
                  ? Math.round((student.attendances.filter(a => a.present).length / student.attendances.length) * 100)
                  : 0;
                const studentGrade = student.results?.length
                  ? Math.round(student.results.reduce((sum, r) => sum + r.score, 0) / student.results.length)
                  : 0;
                const studentPendingFees = student.fees?.filter(f => f.status !== 'PAID').reduce((sum, f) => sum + f.amount, 0) || 0;

                return (
                  <div key={student.id} className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                          {student.img ? (
                            <Image
                              src={student.img}
                              alt={`${student.name} ${student.surname}`}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-blue-200 flex items-center justify-center">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {student.name} {student.surname}
                          </p>
                          <p className="text-sm text-gray-600">
                            {student.class?.name} • {student.class?.grade?.name}
                          </p>
                        </div>
                      </div>
                      {studentPendingFees > 0 && (
                        <Badge variant="destructive">
                          ${studentPendingFees} pending
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-gray-600">Attendance</span>
                          <span className="text-xs font-medium">{studentAttendance}%</span>
                        </div>
                        <Progress value={studentAttendance} className="h-1" />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-gray-600">Grades</span>
                          <span className="text-xs font-medium">{studentGrade}%</span>
                        </div>
                        <Progress value={studentGrade} className="h-1" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </PreviewSection>
        )}

        {/* Fee Summary */}
        {totalFees > 0 && (
          <PreviewSection title="Fee Summary" icon={<DollarSign className="w-5 h-5" />}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <DollarSign className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-700">${totalFees}</p>
                <p className="text-sm text-blue-600">Total Fees</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-700">${totalFees - pendingFees}</p>
                <p className="text-sm text-green-600">Paid</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-700">${pendingFees}</p>
                <p className="text-sm text-red-600">Pending</p>
              </div>
            </div>
          </PreviewSection>
        )}

        {/* Recent Messages */}
        {parent.messages && parent.messages.length > 0 && (
          <PreviewSection title="Recent Messages" icon={<MessageCircle className="w-5 h-5" />}>
            <div className="space-y-3">
              {parent.messages.slice(0, 3).map((message) => (
                <div key={message.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-gray-900">
                      {message.sender.name} {message.sender.surname}
                    </p>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {message.sender.role}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {formatDate(message.createdAt)}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {message.content}
                  </p>
                </div>
              ))}
            </div>
          </PreviewSection>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button 
            onClick={() => window.open(`/profile/parent/${parent.id}`, '_blank')}
            className="bg-blue-600 hover:bg-blue-700"
            leftIcon={<User className="w-4 h-4" />}
          >
            View Full Profile
          </Button>
        </div>
      </div>
    </BasePreviewModal>
  );
};

export default ParentPreview;