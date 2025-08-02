"use client";

import React from 'react';
import { Modal } from '@/components/ui/modal';
import { X, Calendar, MapPin, Phone, Mail, User, GraduationCap, BookOpen } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface BasePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

interface PreviewFieldProps {
  label: string;
  value: string | number | null | undefined;
  icon?: React.ReactNode;
  className?: string;
  type?: 'text' | 'email' | 'phone' | 'date' | 'badge';
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

interface PreviewSectionProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

interface PreviewImageProps {
  src: string | null | undefined;
  alt: string;
  fallbackSrc?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Base Preview Modal Component
export const BasePreviewModal: React.FC<BasePreviewModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'lg',
  className
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      className={cn("max-h-[90vh] overflow-hidden", className)}
    >
      <div className="max-h-[calc(90vh-120px)] overflow-y-auto">
        {children}
      </div>
    </Modal>
  );
};

// Preview Field Component
export const PreviewField: React.FC<PreviewFieldProps> = ({
  label,
  value,
  icon,
  className,
  type = 'text',
  badgeVariant = 'secondary'
}) => {
  if (!value && value !== 0) {
    return (
      <div className={cn("space-y-1", className)}>
        <label className="text-sm font-medium text-neutral-600 flex items-center gap-2">
          {icon}
          {label}
        </label>
        <p className="text-sm text-neutral-400 italic">Not provided</p>
      </div>
    );
  }

  const formatValue = () => {
    switch (type) {
      case 'email':
        return (
          <a href={`mailto:${value}`} className="text-primary-600 hover:text-primary-700 hover:underline">
            {value}
          </a>
        );
      case 'phone':
        return (
          <a href={`tel:${value}`} className="text-primary-600 hover:text-primary-700 hover:underline">
            {value}
          </a>
        );
      case 'date':
        return new Date(value as string).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      case 'badge':
        return <Badge variant={badgeVariant}>{value}</Badge>;
      default:
        return value;
    }
  };

  return (
    <div className={cn("space-y-1", className)}>
      <label className="text-sm font-medium text-neutral-600 flex items-center gap-2">
        {icon}
        {label}
      </label>
      <div className="text-sm text-neutral-900">
        {formatValue()}
      </div>
    </div>
  );
};

// Preview Section Component
export const PreviewSection: React.FC<PreviewSectionProps> = ({
  title,
  children,
  icon,
  className
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2 pb-2 border-b border-neutral-200">
        {icon}
        <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

// Preview Image Component
export const PreviewImage: React.FC<PreviewImageProps> = ({
  src,
  alt,
  fallbackSrc = "/noAvatar.png",
  size = 'md',
  className
}) => {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  return (
    <div className={cn("flex-shrink-0", className)}>
      <Image
        src={src || fallbackSrc}
        alt={alt}
        width={size === 'sm' ? 64 : size === 'md' ? 96 : 128}
        height={size === 'sm' ? 64 : size === 'md' ? 96 : 128}
        className={cn(
          "rounded-full object-cover border-4 border-white shadow-lg",
          sizeClasses[size]
        )}
      />
    </div>
  );
};

// Preview Grid Component for organizing fields
export const PreviewGrid: React.FC<{ children: React.ReactNode; columns?: 1 | 2 | 3 }> = ({
  children,
  columns = 2
}) => {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
  };

  return (
    <div className={cn("grid gap-4", gridClasses[columns])}>
      {children}
    </div>
  );
};

// Preview Header Component
export const PreviewHeader: React.FC<{
  image?: string | null;
  title: string;
  subtitle?: string;
  badges?: { text: string; variant?: 'default' | 'secondary' | 'destructive' | 'outline' }[];
  children?: React.ReactNode;
}> = ({
  image,
  title,
  subtitle,
  badges,
  children
}) => {
  return (
    <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg mb-6">
      <PreviewImage src={image} alt={title} size="lg" />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 truncate">{title}</h2>
            {subtitle && (
              <p className="text-lg text-neutral-600 mt-1">{subtitle}</p>
            )}
            {badges && badges.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {badges.map((badge, index) => (
                  <Badge key={index} variant={badge.variant || 'secondary'}>
                    {badge.text}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

// Common icons for reuse
export const PreviewIcons = {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  BookOpen
};
