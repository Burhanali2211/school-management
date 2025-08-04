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
  Users,
  GraduationCap,
  MessageSquare,
  FileText,
  X
} from 'lucide-react';

interface ModernParentPreviewProps {
  parent: any;
  onClose: () => void;
  onEdit?: () => void;
}

export function ModernParentPreview({ parent, onClose, onEdit }: ModernParentPreviewProps) {
  if (!parent) return null;

  const stats = [
    { label: 'Children', value: parent.students?.length || 0, icon: Users },
    { label: 'Messages', value: parent.messages?.length || 0, icon: MessageSquare },
    { label: 'Reports', value: parent.reports?.length || 0, icon: FileText },
    { label: 'Active', value: 'Yes', icon: GraduationCap },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-secondary-600 to-secondary-800 text-white p-6 rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-start space-x-6">
            <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center">
              {parent.img ? (
                <img
                  src={parent.img}
                  alt={`${parent.name} ${parent.surname}`}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <User className="w-12 h-12 text-white/80" />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">
                {parent.name} {parent.surname}
              </h1>
              <p className="text-secondary-100 mb-4">Parent • ID: {parent.id}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  Guardian
                </Badge>
                {parent.students?.length > 0 && (
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    {parent.students.length} Child{parent.students.length > 1 ? 'ren' : ''}
                  </Badge>
                )}
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
                <stat.icon className="w-8 h-8 text-secondary-600 mx-auto mb-2" />
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
                <User className="w-5 h-5 mr-2 text-secondary-600" />
                Personal Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-neutral-400" />
                  <span className="text-neutral-600">{parent.email || 'No email provided'}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-neutral-400" />
                  <span className="text-neutral-600">{parent.phone || 'No phone provided'}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-neutral-400" />
                  <span className="text-neutral-600">{parent.address || 'No address provided'}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-neutral-400" />
                  <span className="text-neutral-600">
                    Joined: {parent.createdAt ? new Date(parent.createdAt).toLocaleDateString() : 'Not available'}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact & Professional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-900 flex items-center">
                <GraduationCap className="w-5 h-5 mr-2 text-secondary-600" />
                Account Details
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-neutral-500">Username</p>
                  <p className="font-medium text-neutral-900">{parent.username}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Account Status</p>
                  <p className="font-medium text-green-600">Active</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Last Login</p>
                  <p className="font-medium text-neutral-900">
                    {parent.lastLogin ? new Date(parent.lastLogin).toLocaleDateString() : 'Never'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Notifications</p>
                  <p className="font-medium text-neutral-900">Email & SMS</p>
                </div>
              </div>
            </div>
          </div>

          {/* Children */}
          {parent.students && parent.students.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-900 flex items-center">
                <Users className="w-5 h-5 mr-2 text-secondary-600" />
                Children
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {parent.students.map((student: any) => (
                  <div key={student.id} className="bg-secondary-50 border border-secondary-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 bg-secondary-200 rounded-lg flex items-center justify-center">
                        <User className="w-6 h-6 text-secondary-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-secondary-900">
                          {student.name} {student.surname}
                        </p>
                        <p className="text-sm text-secondary-600">
                          Class: {student.class?.name || 'Not assigned'}
                        </p>
                        <p className="text-sm text-secondary-600">
                          Grade: {student.grade?.level || 'Not assigned'}
                        </p>
                        <div className="mt-2 flex space-x-2">
                          <Badge variant="outline" className="text-xs">
                            Student ID: {student.id}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-neutral-900 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-secondary-600" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center hover:bg-blue-100 transition-colors">
                <MessageSquare className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                <p className="text-sm font-medium text-blue-900">Send Message</p>
              </button>
              <button className="p-3 bg-green-50 border border-green-200 rounded-lg text-center hover:bg-green-100 transition-colors">
                <FileText className="w-6 h-6 text-green-600 mx-auto mb-1" />
                <p className="text-sm font-medium text-green-900">View Reports</p>
              </button>
              <button className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-center hover:bg-purple-100 transition-colors">
                <Calendar className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                <p className="text-sm font-medium text-purple-900">Schedule Meeting</p>
              </button>
              <button className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-center hover:bg-orange-100 transition-colors">
                <Phone className="w-6 h-6 text-orange-600 mx-auto mb-1" />
                <p className="text-sm font-medium text-orange-900">Call Parent</p>
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-neutral-200 flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {onEdit && (
            <Button onClick={onEdit} className="bg-secondary-600 hover:bg-secondary-700">
              Edit Parent
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}