"use client";

import { useState } from "react";
import { User, Mail, Phone, MapPin, Calendar, Users, GraduationCap } from "lucide-react";

interface UserData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role: string;
  avatar?: string;
  createdAt: string;
  status: "active" | "inactive";
  class?: {
    name: string;
    grade?: {
      level: number;
      name: string;
    };
  };
  parent?: {
    name: string;
    phone?: string;
  };
}

interface UserCardClientProps {
  user: UserData | null;
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
}

export default function UserCardClient({
  user,
  onEdit,
  onDelete,
  onView,
}: UserCardClientProps) {
  const [showActions, setShowActions] = useState(false);

  if (!user) {
    return (
      <div className="bg-white border border-neutral-200 rounded-lg p-6 text-center">
        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-neutral-400" />
        </div>
        <p className="text-neutral-500">No user data available</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    return status === "active" ? "bg-green-400" : "bg-red-400";
  };

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case "student":
        return <GraduationCap className="w-4 h-4" />;
      case "teacher":
        return <Users className="w-4 h-4" />;
      case "parent":
        return <Users className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <User className="w-6 h-6 text-blue-600" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">{user.name}</h3>
            <p className="text-sm text-neutral-600">{user.role}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 ${getStatusColor(user.status)} rounded-full`}></div>
          <span className="text-xs text-neutral-500 capitalize">{user.status}</span>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center space-x-2 text-sm text-neutral-600">
          <Mail className="w-4 h-4" />
          <span>{user.email}</span>
        </div>
        {user.phone && (
          <div className="flex items-center space-x-2 text-sm text-neutral-600">
            <Phone className="w-4 h-4" />
            <span>{user.phone}</span>
          </div>
        )}
        {user.address && (
          <div className="flex items-center space-x-2 text-sm text-neutral-600">
            <MapPin className="w-4 h-4" />
            <span>{user.address}</span>
          </div>
        )}
        <div className="flex items-center space-x-2 text-sm text-neutral-600">
          <Calendar className="w-4 h-4" />
          <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Class/Additional Info */}
      {user.class && (
        <div className="mb-4 p-3 bg-neutral-50 rounded-lg">
          <h4 className="text-sm font-medium text-neutral-900 mb-1">Class Information</h4>
          <p className="text-sm text-neutral-600">{user.class.name}</p>
          {user.class.grade && (
            <p className="text-sm text-neutral-600">{user.class.grade.name}</p>
          )}
        </div>
      )}

      {user.parent && (
        <div className="mb-4 p-3 bg-neutral-50 rounded-lg">
          <h4 className="text-sm font-medium text-neutral-900 mb-1">Parent Information</h4>
          <p className="text-sm text-neutral-600">{user.parent.name}</p>
          {user.parent.phone && (
            <p className="text-sm text-neutral-600">{user.parent.phone}</p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
        <div className="flex items-center space-x-2">
          {getRoleIcon(user.role)}
          <span className="text-sm text-neutral-600 capitalize">{user.role}</span>
        </div>
        <div className="flex items-center space-x-2">
          {onView && (
            <button
              onClick={onView}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              View
            </button>
          )}
          {onEdit && (
            <button
              onClick={onEdit}
              className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}