"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
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
  BarChart3,
  Baby,
  MessageCircle,
  Bell,
  CreditCard
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDate } from '@/lib/utils';

interface Parent {
  id: string;
  name: string;
  surname: string;
  username: string;
  email?: string | null;
  phone?: string | null;
  address?: string;
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
      };
    };
    attendances?: {
      present: boolean;
      date: Date;
    }[];
    results?: {
      score: number;
      exam?: {
        title: string;
      };
      assignment?: {
        title: string;
      };
    }[];
    fees?: {
      amount: number;
      status: string;
      dueDate: Date;
    }[];
  }[];
}

const ParentProfilePage = () => {
  const params = useParams();
  const parentId = params.id as string;
  
  const [parent, setParent] = useState<Parent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    fetchParent();
  }, [parentId]);

  const fetchParent = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/parents/${parentId}`);
      if (!response.ok) throw new Error('Failed to fetch parent');
      const data = await response.json();
      setParent(data);
      setFormData({
        name: data.name || '',
        surname: data.surname || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/parents/${parentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) throw new Error('Failed to update parent');
      
      await fetchParent();
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
    }
  };

  const handleCancel = () => {
    if (parent) {
      setFormData({
        name: parent.name || '',
        surname: parent.surname || '',
        email: parent.email || '',
        phone: parent.phone || '',
        address: parent.address || ''
      });
    }
    setIsEditing(false);
  };

  const calculateChildAttendance = (student: any) => {
    if (!student.attendances?.length) return 0;
    const presentCount = student.attendances.filter((a: any) => a.present).length;
    return Math.round((presentCount / student.attendances.length) * 100);
  };

  const calculateChildAverage = (student: any) => {
    if (!student.results?.length) return 0;
    const total = student.results.reduce((sum: number, result: any) => sum + result.score, 0);
    return Math.round(total / student.results.length);
  };

  const getTotalOutstandingFees = () => {
    return parent?.students.reduce((total, student) => {
      return total + (student.fees?.filter(fee => fee.status !== 'PAID').reduce((sum, fee) => sum + fee.amount, 0) || 0);
    }, 0) || 0;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !parent) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Parent Not Found</h2>
          <p className="text-gray-600">{error || 'The requested parent profile could not be found.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="relative h-48 bg-gradient-to-r from-purple-600 to-pink-600 rounded-t-lg">
            <div className="absolute inset-0 bg-black bg-opacity-20 rounded-t-lg"></div>
            <div className="absolute bottom-6 left-6 flex items-end space-x-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-white bg-white overflow-hidden">
                  <div className="w-full h-full bg-purple-100 flex items-center justify-center">
                    <Users className="w-16 h-16 text-purple-600" />
                  </div>
                </div>
                {isEditing && (
                  <button className="absolute bottom-2 right-2 bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="text-white pb-4">
                <h1 className="text-3xl font-bold">{parent.name} {parent.surname}</h1>
                <p className="text-purple-100 text-lg">Parent/Guardian • {parent.username}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    {parent.students.length} {parent.students.length === 1 ? 'Child' : 'Children'}
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    Active Parent
                  </Badge>
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
            <TabsTrigger value="children">Children</TabsTrigger>
            <TabsTrigger value="academic">Academic Summary</TabsTrigger>
            <TabsTrigger value="fees">Fees & Payments</TabsTrigger>
            <TabsTrigger value="communication">Communication</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Personal Information */}
              <div className="lg:col-span-2">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-purple-600" />
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
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                          <input
                            type="text"
                            value={formData.surname}
                            onChange={(e) => setFormData({...formData, surname: e.target.value})}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                          <textarea
                            value={formData.address}
                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            rows={3}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center space-x-3">
                          <Mail className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium">{parent.email || 'Not provided'}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Phone className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="font-medium">{parent.phone || 'Not provided'}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <MapPin className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Address</p>
                            <p className="font-medium">{parent.address || 'Not provided'}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Calendar className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Registration Date</p>
                            <p className="font-medium">{formatDate(parent.createdAt)}</p>
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
                    Family Overview
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total Children</span>
                      <span className="font-semibold text-2xl text-purple-600">{parent.students.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Outstanding Fees</span>
                      <span className="font-semibold text-2xl text-red-600">${getTotalOutstandingFees()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Active Classes</span>
                      <span className="font-semibold text-2xl text-green-600">
                        {new Set(parent.students.map(s => s.class?.id)).size}
                      </span>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Bell className="w-5 h-5 mr-2 text-orange-600" />
                    Quick Actions
                  </h3>
                  <div className="space-y-3">
                    <Button className="w-full justify-start" variant="outline">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message Teachers
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Pay Fees
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <FileText className="w-4 h-4 mr-2" />
                      View Reports
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="children" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {parent.students.map((student) => (
                <Card key={student.id} className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100">
                      <Image
                        src={student.img || '/noavatar.png'}
                        alt={`${student.name} ${student.surname}`}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold">{student.name} {student.surname}</h4>
                      <p className="text-gray-600">{student.class?.name}</p>
                      {student.class?.grade && (
                        <Badge variant="secondary">Grade {student.class.grade.level}</Badge>
                      )}
                    </div>
                    <Link href={`/profile/student/${student.id}`}>
                      <Button variant="outline" size="sm">
                        View Profile
                      </Button>
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{calculateChildAverage(student)}%</p>
                      <p className="text-sm text-gray-600">Average Grade</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{calculateChildAttendance(student)}%</p>
                      <p className="text-sm text-gray-600">Attendance</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="academic" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {parent.students.map((student) => (
                <Card key={student.id} className="p-6">
                  <h4 className="text-lg font-semibold mb-4 flex items-center">
                    <Baby className="w-5 h-5 mr-2 text-blue-600" />
                    {student.name} {student.surname} - Academic Summary
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Overall Performance</span>
                        <span className="text-sm font-medium">{calculateChildAverage(student)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{width: `${calculateChildAverage(student)}%`}}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Attendance Rate</span>
                        <span className="text-sm font-medium">{calculateChildAttendance(student)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{width: `${calculateChildAttendance(student)}%`}}
                        ></div>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <h5 className="font-medium mb-2">Recent Results</h5>
                      <div className="space-y-2">
                        {student.results?.slice(0, 3).map((result, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{result.exam?.title || result.assignment?.title}</span>
                            <Badge variant={result.score >= 80 ? "default" : result.score >= 60 ? "secondary" : "destructive"}>
                              {result.score}%
                            </Badge>
                          </div>
                        )) || <p className="text-sm text-gray-500">No recent results</p>}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="fees" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-green-600" />
                Fee Summary
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">${getTotalOutstandingFees()}</p>
                  <p className="text-sm text-gray-600">Outstanding</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    ${parent.students.reduce((total, student) => {
                      return total + (student.fees?.filter(fee => fee.status === 'PAID').reduce((sum, fee) => sum + fee.amount, 0) || 0);
                    }, 0)}
                  </p>
                  <p className="text-sm text-gray-600">Paid This Year</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{parent.students.length}</p>
                  <p className="text-sm text-gray-600">Active Students</p>
                </div>
              </div>

              <div className="space-y-4">
                {parent.students.map((student) => (
                  <div key={student.id} className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-3">{student.name} {student.surname}</h4>
                    <div className="space-y-2">
                      {student.fees?.map((fee) => (
                        <div key={fee.amount} className="flex items-center justify-between p-3 bg-gray-50 rounded">
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
                      )) || <p className="text-sm text-gray-500">No fee records</p>}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="communication" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2 text-blue-600" />
                  Recent Messages
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">Math Teacher - Ms. Johnson</p>
                    <p className="text-sm text-gray-600">Regarding homework completion...</p>
                    <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">Class Teacher - Mr. Smith</p>
                    <p className="text-sm text-gray-600">Parent-teacher meeting scheduled...</p>
                    <p className="text-xs text-gray-400 mt-1">1 day ago</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">School Administration</p>
                    <p className="text-sm text-gray-600">Fee payment reminder...</p>
                    <p className="text-xs text-gray-400 mt-1">3 days ago</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-orange-600" />
                  Notifications & Alerts
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                    <p className="font-medium text-yellow-800">Fee Due Reminder</p>
                    <p className="text-sm text-yellow-700">Monthly fee due in 3 days</p>
                  </div>
                  <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                    <p className="font-medium text-blue-800">Parent-Teacher Meeting</p>
                    <p className="text-sm text-blue-700">Scheduled for next Friday</p>
                  </div>
                  <div className="p-3 bg-green-50 border-l-4 border-green-400 rounded">
                    <p className="font-medium text-green-800">Excellent Performance</p>
                    <p className="text-sm text-green-700">Your child scored 95% in Math</p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ParentProfilePage;