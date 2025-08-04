"use client";

import { useState } from "react";
import { X, User, Mail, Phone, MapPin, Calendar, GraduationCap, Users, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface Student {
  id: string;
  username: string;
  name: string;
  surname: string;
  email?: string;
  phone?: string;
  address: string;
  img?: string;
  bloodType: string;
  sex: "MALE" | "FEMALE";
  birthday: Date | string;
  createdAt: Date | string;
  class?: {
    id: number;
    name: string;
    grade: {
      name: string;
      level: number;
    };
  };
  parent?: {
    id: string;
    name: string;
    surname: string;
    phone: string;
    email?: string;
  };
  _count?: {
    attendances: number;
    results: number;
    fees: number;
  };
}

interface ModernStudentPreviewProps {
  student: Student;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (student: Student) => void;
  onDelete?: (studentId: string) => void;
}

export function ModernStudentPreview({
  student,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: ModernStudentPreviewProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "academic" | "parent">("overview");

  if (!isOpen) return null;

  const age = new Date().getFullYear() - new Date(student.birthday).getFullYear();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                {student.img ? (
                  <img
                    src={student.img}
                    alt={`${student.name} ${student.surname}`}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-white" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {student.name} {student.surname}
                </h2>
                <p className="text-primary-100">
                  Student ID: {student.username}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    {student.class?.name || "No Class"}
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    Grade {student.class?.grade.level || "N/A"}
                  </Badge>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-neutral-200">
          <div className="flex space-x-8 px-6">
            {[
              { id: "overview", label: "Overview", icon: User },
              { id: "academic", label: "Academic", icon: BookOpen },
              { id: "parent", label: "Parent Info", icon: Users },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-primary-600 text-primary-600"
                    : "border-transparent text-neutral-600 hover:text-neutral-900"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-neutral-900">Personal Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-neutral-400" />
                      <span className="text-neutral-600">
                        {student.email || "No email provided"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="w-4 h-4 text-neutral-400" />
                      <span className="text-neutral-600">
                        {student.phone || "No phone provided"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-4 h-4 text-neutral-400" />
                      <span className="text-neutral-600">{student.address}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-4 h-4 text-neutral-400" />
                      <span className="text-neutral-600">
                        {formatDate(student.birthday)} (Age: {age})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-neutral-900">Additional Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Gender:</span>
                      <span className="font-medium">{student.sex}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Blood Type:</span>
                      <span className="font-medium">{student.bloodType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Enrolled:</span>
                      <span className="font-medium">{formatDate(student.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "academic" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600">Class</p>
                      <p className="text-lg font-semibold text-neutral-900">
                        {student.class?.name || "Not Assigned"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600">Attendance</p>
                      <p className="text-lg font-semibold text-neutral-900">
                        {student._count?.attendances || 0} Records
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600">Results</p>
                      <p className="text-lg font-semibold text-neutral-900">
                        {student._count?.results || 0} Records
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-neutral-50 rounded-lg p-4">
                <h4 className="font-semibold text-neutral-900 mb-2">Academic Performance</h4>
                <p className="text-neutral-600">
                  Academic performance data will be displayed here once available.
                </p>
              </div>
            </div>
          )}

          {activeTab === "parent" && (
            <div className="space-y-6">
              {student.parent ? (
                <div className="bg-neutral-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">Parent/Guardian Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-neutral-600">Name</p>
                      <p className="font-medium text-neutral-900">
                        {student.parent.name} {student.parent.surname}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600">Phone</p>
                      <p className="font-medium text-neutral-900">{student.parent.phone}</p>
                    </div>
                    {student.parent.email && (
                      <div>
                        <p className="text-sm text-neutral-600">Email</p>
                        <p className="font-medium text-neutral-900">{student.parent.email}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                  <p className="text-neutral-600">No parent information available</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-200 px-6 py-4 bg-neutral-50">
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {onEdit && (
              <Button onClick={() => onEdit(student)}>
                Edit Student
              </Button>
            )}
            {onDelete && (
              <Button
                variant="destructive"
                onClick={() => onDelete(student.id)}
              >
                Delete Student
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModernStudentPreview;