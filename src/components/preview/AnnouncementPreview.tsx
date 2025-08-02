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
import { Megaphone, Calendar, Users, Clock, AlertCircle } from 'lucide-react';

interface AnnouncementData {
  id: string;
  title: string;
  description: string;
  date: Date;
  class?: {
    id: string;
    name: string;
    grade?: {
      level: number;
    };
  };
  // Additional data
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  author?: {
    name: string;
    surname: string;
    role: string;
  };
  targetAudience?: 'all' | 'students' | 'teachers' | 'parents' | 'staff';
  expiryDate?: Date;
  attachments?: {
    name: string;
    url: string;
    type: string;
  }[];
  readBy?: {
    total: number;
    students: number;
    teachers: number;
    parents: number;
  };
}

interface AnnouncementPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  announcement: AnnouncementData | null;
  isLoading?: boolean;
}

const AnnouncementPreview: React.FC<AnnouncementPreviewProps> = ({
  isOpen,
  onClose,
  announcement,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <BasePreviewModal
        isOpen={isOpen}
        onClose={onClose}
        title="Loading Announcement Details..."
        size="xl"
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </BasePreviewModal>
    );
  }

  if (!announcement) {
    return (
      <BasePreviewModal
        isOpen={isOpen}
        onClose={onClose}
        title="Announcement Not Found"
        size="xl"
      >
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">Announcement data not available</p>
        </div>
      </BasePreviewModal>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
      case 'high':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Megaphone className="w-4 h-4" />;
    }
  };

  const isExpired = announcement.expiryDate && new Date() > new Date(announcement.expiryDate);

  return (
    <BasePreviewModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Announcement - ${announcement.title}`}
      size="xl"
    >
      <div className="space-y-6">
        {/* Header */}
        <PreviewHeader
          title={announcement.title}
          subtitle={announcement.class ? `For ${announcement.class.name}` : 'General Announcement'}
          badge={{
            text: announcement.priority || 'medium',
            variant: getPriorityColor(announcement.priority || 'medium') as any
          }}
        />

        {/* Announcement Information */}
        <PreviewSection title="Announcement Details" icon={<Megaphone className="w-5 h-5" />}>
          <PreviewGrid columns={2}>
            <PreviewField
              label="Title"
              value={announcement.title}
              icon={<Megaphone className="w-4 h-4" />}
            />
            <PreviewField
              label="Category"
              value={announcement.category}
              icon={<PreviewIcons.BookOpen className="w-4 h-4" />}
            />
            <PreviewField
              label="Date Published"
              value={announcement.date ? new Date(announcement.date).toLocaleDateString() : 'N/A'}
              type="date"
              icon={<Calendar className="w-4 h-4" />}
            />
            <PreviewField
              label="Target Audience"
              value={announcement.targetAudience}
              type="badge"
              badgeVariant="outline"
              icon={<Users className="w-4 h-4" />}
            />
            <PreviewField
              label="Priority"
              value={announcement.priority}
              type="badge"
              badgeVariant={getPriorityColor(announcement.priority || 'medium') as any}
              icon={getPriorityIcon(announcement.priority || 'medium')}
            />
            {announcement.expiryDate && (
              <PreviewField
                label="Expires On"
                value={new Date(announcement.expiryDate).toLocaleDateString()}
                type="date"
                icon={<Clock className="w-4 h-4" />}
              />
            )}
          </PreviewGrid>
        </PreviewSection>

        {/* Expiry Warning */}
        {isExpired && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">This announcement has expired</span>
            </div>
            <p className="text-red-600 text-sm mt-1">
              Expired on {new Date(announcement.expiryDate!).toLocaleDateString()}
            </p>
          </div>
        )}

        {/* Author Information */}
        {announcement.author && (
          <PreviewSection title="Published By" icon={<PreviewIcons.User className="w-5 h-5" />}>
            <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <PreviewIcons.User className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-medium text-neutral-900">
                  {announcement.author.name} {announcement.author.surname}
                </div>
                <div className="text-sm text-neutral-600">{announcement.author.role}</div>
              </div>
            </div>
          </PreviewSection>
        )}

        {/* Target Class */}
        {announcement.class && (
          <PreviewSection title="Target Class" icon={<Users className="w-5 h-5" />}>
            <div className="p-3 bg-neutral-50 rounded-lg">
              <div className="font-medium text-neutral-900">{announcement.class.name}</div>
              {announcement.class.grade && (
                <div className="text-sm text-neutral-600">Grade {announcement.class.grade.level}</div>
              )}
            </div>
          </PreviewSection>
        )}

        {/* Description */}
        <PreviewSection title="Message" icon={<PreviewIcons.BookOpen className="w-5 h-5" />}>
          <div className="p-4 bg-neutral-50 rounded-lg">
            <p className="text-neutral-700 whitespace-pre-wrap">{announcement.description}</p>
          </div>
        </PreviewSection>

        {/* Attachments */}
        {announcement.attachments && announcement.attachments.length > 0 && (
          <PreviewSection title="Attachments" icon={<PreviewIcons.BookOpen className="w-5 h-5" />}>
            <div className="space-y-2">
              {announcement.attachments.map((attachment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                      <PreviewIcons.BookOpen className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-neutral-900">{attachment.name}</div>
                      <div className="text-sm text-neutral-600">{attachment.type}</div>
                    </div>
                  </div>
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    Download
                  </a>
                </div>
              ))}
            </div>
          </PreviewSection>
        )}

        {/* Read Statistics */}
        {announcement.readBy && (
          <PreviewSection title="Read Statistics" icon={<Users className="w-5 h-5" />}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{announcement.readBy.total}</div>
                <div className="text-sm text-blue-700">Total Reads</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{announcement.readBy.students}</div>
                <div className="text-sm text-green-700">Students</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{announcement.readBy.teachers}</div>
                <div className="text-sm text-purple-700">Teachers</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{announcement.readBy.parents}</div>
                <div className="text-sm text-orange-700">Parents</div>
              </div>
            </div>
          </PreviewSection>
        )}

        {/* Timeline */}
        <PreviewSection title="Timeline" icon={<Calendar className="w-5 h-5" />}>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <div className="font-medium text-green-900">Published</div>
                <div className="text-sm text-green-700">
                  {new Date(announcement.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
            {announcement.expiryDate && (
              <div className={`flex items-center gap-3 p-3 rounded-lg ${isExpired ? 'bg-red-50' : 'bg-yellow-50'}`}>
                <div className={`w-2 h-2 rounded-full ${isExpired ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                <div>
                  <div className={`font-medium ${isExpired ? 'text-red-900' : 'text-yellow-900'}`}>
                    {isExpired ? 'Expired' : 'Expires'}
                  </div>
                  <div className={`text-sm ${isExpired ? 'text-red-700' : 'text-yellow-700'}`}>
                    {new Date(announcement.expiryDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </PreviewSection>
      </div>
    </BasePreviewModal>
  );
};

export default AnnouncementPreview;
