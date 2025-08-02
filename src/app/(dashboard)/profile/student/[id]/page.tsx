"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  GraduationCap, 
  Users, 
  BookOpen, 
  Clock,
  Edit3,
  Save,
  X,
  Camera,
  Award,
  TrendingUp,
  FileText,
  Heart,
  UserCheck,
  Target,
  BarChart3
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  parent: {
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
}

const StudentProfilePage = () => {
  const params = useParams();
  const studentId = params.id as string;
  
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
    address: '',
    bloodType: ''
  });

  useEffect(() => {
    fetchStudent();
  }, [studentId]);

  const fetchStudent = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/students/${studentId}`);
      if (!response.ok) throw new Error('Failed to fetch student');
      const data = await response.json();
      setStudent(data);
      setFormData({
        name: data.name || '',
        surname: data.surname || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        bloodType: data.bloodType || ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/students/${studentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) throw new Error('Failed to update student');
      
      await fetchStudent();
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
    }
  };

  const handleCancel = () => {
    if (student) {
      setFormData({
        name: student.name || '',
        surname: student.surname || '',
        email: student.email || '',
        phone: student.phone || '',
        address: student.address || '',
        bloodType: student.bloodType || ''
      });
    }
    setIsEditing(false);
  };

  const calculateAttendanceRate = () => {
    if (!student?.attendances?.length) return 0;
    const presentCount = student.attendances.filter(a => a.present).length;
    return Math.round((presentCount / student.attendances.length) * 100);
  };

  const calculateAverageGrade = () => {
    if (!student?.results?.length) return 0;
    const total = student.results.reduce((sum, result) => sum + result.score, 0);
    return Math.round(total / student.results.length);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Student Not Found</h2>
          <p className="text-gray-600">{error || 'The requested student profile could not be found.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="relative h-48 bg-gradient-to-r from-green-600 to-blue-600 rounded-t-lg">
            <div className="absolute inset-0 bg-black bg-opacity-20 rounded-t-lg"></div>
            <div className="absolute bottom-6 left-6 flex items-end space-x-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-white bg-white overflow-hidden">
                  <Image
                    src={student.img || '/noavatar.png'}
                    alt={`${student.name} ${student.surname}`}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>
                {isEditing && (
                  <button className="absolute bottom-2 right-2 bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="text-white pb-4">
                <h1 className="text-3xl font-bold">{student.name} {student.surname}</h1>
                <p className="text-green-100 text-lg">Student • {student.username}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    {student.class.name}
                  </Badge>
                  {student.class.grade && (
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      Grade {student.class.grade.level}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="absolute top-6 right-6">
              {isEditing ? (
                <div className="flex space-x-2">
                  <Button
                    onClick={handleSave}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="academic">Academic</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="fees">Fees</TabsTrigger>
            <TabsTrigger value="parent">Parent Info</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Personal Information */}
              <div className="lg:col-span-2">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-green-600" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {isEditing ? (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                          <input
                            type="text"
                            value={formData.surname}
                            onChange={(e) => setFormData({...formData, surname: e.target.value})}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                          <textarea
                            value={formData.address}
                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            rows={3}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
                          <select
                            value={formData.bloodType}
                            onChange={(e) => setFormData({...formData, bloodType: e.target.value})}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          >
                            <option value="">Select Blood Type</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                          </select>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center space-x-3">
                          <Mail className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium">{student.email || 'Not provided'}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Phone className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="font-medium">{student.phone || 'Not provided'}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <MapPin className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Address</p>
                            <p className="font-medium">{student.address || 'Not provided'}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Calendar className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Birthday</p>
                            <p className="font-medium">{formatDate(student.birthday)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <User className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Gender</p>
                            <p className="font-medium">{student.sex}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Heart className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Blood Type</p>
                            <p className="font-medium">{student.bloodType || 'Not provided'}</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </Card>
              </div>

              {/* Quick Stats */}
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                    Academic Overview
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Average Grade</span>
                      <span className="font-semibold text-2xl text-blue-600">{calculateAverageGrade()}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Attendance Rate</span>
                      <span className="font-semibold text-2xl text-green-600">{calculateAttendanceRate()}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total Exams</span>
                      <span className="font-semibold text-2xl text-purple-600">
                        {student.results?.filter(r => r.exam).length || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Enrollment Date</span>
                      <span className="font-medium text-gray-900">{formatDate(student.createdAt)}</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-orange-600" />
                    Performance Metrics
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Academic Performance</span>
                        <span className="text-sm font-medium">{calculateAverageGrade()}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{width: `${calculateAverageGrade()}%`}}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Attendance Rate</span>
                        <span className="text-sm font-medium">{calculateAttendanceRate()}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{width: `${calculateAttendanceRate()}%`}}
                        ></div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="academic" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Exams */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  Recent Exam Results
                </h3>
                <div className="space-y-3">
                  {student.results?.filter(r => r.exam).slice(0, 5).map((result) => (
                    <div key={result.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{result.exam?.title}</p>
                        <p className="text-sm text-gray-500">
                          {result.exam?.startTime && formatDate(result.exam.startTime)}
                        </p>
                      </div>
                      <Badge 
                        variant={result.score >= 80 ? "default" : result.score >= 60 ? "secondary" : "destructive"}
                      >
                        {result.score}%
                      </Badge>
                    </div>
                  )) || <p className="text-gray-500">No exam results available</p>}
                </div>
              </Card>

              {/* Recent Assignments */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-green-600" />
                  Recent Assignments
                </h3>
                <div className="space-y-3">
                  {student.results?.filter(r => r.assignment).slice(0, 5).map((result) => (
                    <div key={result.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{result.assignment?.title}</p>
                        <p className="text-sm text-gray-500">
                          Due: {result.assignment?.dueDate && formatDate(result.assignment.dueDate)}
                        </p>
                      </div>
                      <Badge 
                        variant={result.score >= 80 ? "default" : result.score >= 60 ? "secondary" : "destructive"}
                      >
                        {result.score}%
                      </Badge>
                    </div>
                  )) || <p className="text-gray-500">No assignment results available</p>}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="attendance" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <UserCheck className="w-5 h-5 mr-2 text-green-600" />
                Attendance Record
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Date</th>
                      <th className="text-left p-3 font-medium">Subject</th>
                      <th className="text-left p-3 font-medium">Lesson</th>
                      <th className="text-left p-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {student.attendances?.slice(0, 10).map((attendance) => (
                      <tr key={attendance.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">{formatDate(attendance.date)}</td>
                        <td className="p-3">{attendance.lesson.subject.name}</td>
                        <td className="p-3">{attendance.lesson.name}</td>
                        <td className="p-3">
                          <Badge variant={attendance.present ? "default" : "destructive"}>
                            {attendance.present ? "Present" : "Absent"}
                          </Badge>
                        </td>
                      </tr>
                    )) || (
                      <tr>
                        <td colSpan={4} className="p-3 text-center text-gray-500">No attendance records</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="fees" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-orange-600" />
                Fee Status
              </h3>
              <div className="space-y-3">
                {student.fees?.map((fee) => (
                  <div key={fee.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">${fee.amount}</p>
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
                )) || <p className="text-gray-500">No fee records available</p>}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="parent" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-purple-600" />
                Parent/Guardian Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{student.parent.name} {student.parent.surname}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{student.parent.phone || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{student.parent.email || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users className="w-12 h-12 text-purple-600" />
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentProfilePage;