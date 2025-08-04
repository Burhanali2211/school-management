"use client";

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  Users,
  GraduationCap,
  Clock,
  Award,
  TrendingUp,
  X
} from 'lucide-react';

interface ModernTeacherPreviewProps {
  teacher: any;
  onClose: () => void;
  onEdit?: () => void;
}

export function ModernTeacherPreview({ teacher, onClose, onEdit }: ModernTeacherPreviewProps) {
  if (!teacher) return null;

  const stats = [
    { label: 'Classes', value: teacher.classes?.length || 0, icon: Users },
    { label: 'Subjects', value: teacher.subjects?.length || 0, icon: BookOpen },
    { label: 'Students', value: teacher.students?.length || 0, icon: GraduationCap },
    { label: 'Experience', value: '5+ years', icon: Award },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white p-6 rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-start space-x-6">
            <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center">
              {teacher.img ? (
                <img
                  src={teacher.img}
                  alt={`${teacher.name} ${teacher.surname}`}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <User className="w-12 h-12 text-white/80" />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">
                {teacher.name} {teacher.surname}
              </h1>
              <p className="text-primary-100 mb-4">Teacher • ID: {teacher.id}</p>
              <div className="flex flex-wrap gap-2">
                {teacher.subjects?.map((subject: any) => (
                  <Badge key={subject.id} variant="secondary" className="bg-white/20 text-white border-white/30">
                    {subject.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="p-6 border-b border-neutral-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-xl p-4 text-center"
              >
                <stat.icon className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
                <p className="text-sm text-neutral-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-900 flex items-center">
                <User className="w-5 h-5 mr-2 text-primary-600" />
                Personal Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-neutral-400" />
                  <span className="text-neutral-600">{teacher.email || 'No email provided'}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-neutral-400" />
                  <span className="text-neutral-600">{teacher.phone || 'No phone provided'}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-neutral-400" />
                  <span className="text-neutral-600">{teacher.address || 'No address provided'}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-neutral-400" />
                  <span className="text-neutral-600">
                    Born: {teacher.birthday ? new Date(teacher.birthday).toLocaleDateString() : 'Not specified'}
                  </span>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-900 flex items-center">
                <GraduationCap className="w-5 h-5 mr-2 text-primary-600" />
                Professional Details
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-neutral-500">Username</p>
                  <p className="font-medium text-neutral-900">{teacher.username}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Blood Type</p>
                  <p className="font-medium text-neutral-900">{teacher.bloodType || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Gender</p>
                  <p className="font-medium text-neutral-900">{teacher.sex || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Joined</p>
                  <p className="font-medium text-neutral-900">
                    {teacher.createdAt ? new Date(teacher.createdAt).toLocaleDateString() : 'Not available'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Subjects */}
          {teacher.subjects && teacher.subjects.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-900 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-primary-600" />
                Teaching Subjects
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {teacher.subjects.map((subject: any) => (
                  <div key={subject.id} className="bg-primary-50 border border-primary-200 rounded-lg p-3">
                    <p className="font-medium text-primary-900">{subject.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Classes */}
          {teacher.classes && teacher.classes.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-900 flex items-center">
                <Users className="w-5 h-5 mr-2 text-primary-600" />
                Assigned Classes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {teacher.classes.map((classItem: any) => (
                  <div key={classItem.id} className="bg-secondary-50 border border-secondary-200 rounded-lg p-4">
                    <p className="font-medium text-secondary-900">{classItem.name}</p>
                    <p className="text-sm text-secondary-600">
                      Grade {classItem.grade?.level || 'N/A'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-neutral-200 flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {onEdit && (
            <Button onClick={onEdit} className="bg-primary-600 hover:bg-primary-700">
              Edit Teacher
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}