"use client";

import React from 'react';
import { User, Mail, Phone, MapPin, Calendar, Clock, Shield, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { UserType } from '@prisma/client';

interface UserInfoProps {
  user: {
    id: string;
    name: string;
    surname: string;
    email: string;
    phone?: string;
    address?: string;
    dateOfBirth?: Date;
    userType: UserType;
    createdAt: Date;
    updatedAt: Date;
    isActive?: boolean;
    profileImage?: string;
  };
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

const UserInfo: React.FC<UserInfoProps> = ({
  user,
  onEdit,
  onDelete,
  showActions = true,
}) => {
  const getUserTypeColor = (userType: UserType) => {
    switch (userType) {
      case 'ADMIN':
        return "bg-primary-100 text-primary-900";
      case 'TEACHER':
        return "bg-secondary-100 text-secondary-800";
      case 'STUDENT':
        return "bg-accent-100 text-accent-800";
      case 'PARENT':
        return "bg-warning-100 text-warning-800";
      default:
        return "bg-neutral-100 text-neutral-800";
    }
  };

  const getUserTypeIcon = (userType: UserType) => {
    switch (userType) {
      case 'ADMIN':
        return <Shield className="w-4 h-4" />;
      case 'TEACHER':
        return <User className="w-4 h-4" />;
      case 'STUDENT':
        return <User className="w-4 h-4" />;
      case 'PARENT':
        return <User className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className="p-6 bg-white border border-neutral-200 shadow-soft">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-800 to-primary-950 rounded-full flex items-center justify-center text-white text-xl font-semibold shadow-soft">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={`${user.name} ${user.surname}`}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                `${user.name.charAt(0)}${user.surname.charAt(0)}`
              )}
            </div>
            {user.isActive && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-success-500 border-2 border-white rounded-full"></span>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">
              {user.name} {user.surname}
            </h2>
            <div className="flex items-center space-x-2 mt-1">
              <Badge className={getUserTypeColor(user.userType)}>
                <div className="flex items-center space-x-1">
                  {getUserTypeIcon(user.userType)}
                  <span>{user.userType}</span>
                </div>
              </Badge>
              {user.isActive ? (
                <Badge className="bg-success-100 text-success-800">
                  Active
                </Badge>
              ) : (
                <Badge className="bg-neutral-100 text-neutral-800">
                  Inactive
                </Badge>
              )}
            </div>
          </div>
        </div>

        {showActions && (
          <div className="flex items-center space-x-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
                className="flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDelete}
                className="px-3 py-1 text-sm text-error-600 hover:bg-error-50 rounded-md transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
              <Mail className="w-4 h-4 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Email</p>
              <p className="text-neutral-900">{user.email}</p>
            </div>
          </div>

          {user.phone && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-secondary-100 rounded-lg flex items-center justify-center">
                <Phone className="w-4 h-4 text-secondary-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-500">Phone</p>
                <p className="text-neutral-900">{user.phone}</p>
              </div>
            </div>
          )}

          {user.address && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-accent-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-4 h-4 text-accent-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-500">Address</p>
                <p className="text-neutral-900">{user.address}</p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {user.dateOfBirth && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-500">Date of Birth</p>
                <p className="text-neutral-900">{formatDate(user.dateOfBirth)}</p>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-secondary-100 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-secondary-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Created</p>
              <p className="text-neutral-900">{formatDateTime(user.createdAt)}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-accent-100 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-accent-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Last Updated</p>
              <p className="text-neutral-900">{formatDateTime(user.updatedAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default UserInfo;
