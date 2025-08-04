"use client";

import React from 'react';
import { School, BookOpen, Users, GraduationCap } from 'lucide-react';

export interface DrillDownCardProps {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  count?: number;
  countLabel?: string;
  type: 'school' | 'class' | 'section' | 'student';
  onClick?: () => void;
  className?: string;
  isActive?: boolean;
  metadata?: Record<string, any>;
}

const typeConfig = {
  school: {
    icon: School,
    color: 'bg-primary-600',
    lightColor: 'bg-primary-50',
    textColor: 'text-primary-600',
    borderColor: 'border-primary-200',
  },
  class: {
    icon: BookOpen,
    color: 'bg-secondary-600',
    lightColor: 'bg-secondary-50',
    textColor: 'text-secondary-600',
    borderColor: 'border-secondary-200',
  },
  section: {
    icon: Users,
    color: 'bg-accent-600',
    lightColor: 'bg-accent-50',
    textColor: 'text-accent-600',
    borderColor: 'border-accent-200',
  },
  student: {
    icon: GraduationCap,
    color: 'bg-primary-700',
    lightColor: 'bg-primary-100',
    textColor: 'text-primary-700',
    borderColor: 'border-primary-300',
  },
};

const DrillDownCard: React.FC<DrillDownCardProps> = ({
  id,
  title,
  subtitle,
  description,
  count,
  countLabel,
  type,
  onClick,
  className,
  isActive = false,
  metadata,
}) => {
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={`relative p-6 rounded-2xl border transition-all duration-300 cursor-pointer group hover:shadow-elevated ${
        isActive
          ? `${config.borderColor} ${config.lightColor} shadow-elevated`
          : 'border-neutral-200 bg-white hover:border-neutral-300'
      } ${className || ''}`}
      onClick={onClick}
    >
      {/* Background pattern for active state */}
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent rounded-2xl" />
      )}

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${config.color} text-white shadow-soft`}
            >
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
              {subtitle && (
                <p className="text-sm text-neutral-600">{subtitle}</p>
              )}
            </div>
          </div>

          {/* Count badge */}
          {count !== undefined && (
            <div className={`px-3 py-1 rounded-full ${config.lightColor} ${config.textColor} text-sm font-medium border ${config.borderColor}`}>
              {count} {countLabel}
            </div>
          )}
        </div>

        {/* Description */}
        {description && (
          <p className="text-neutral-600 text-sm mb-4 leading-relaxed">
            {description}
          </p>
        )}

        {/* Metadata */}
        {metadata && Object.keys(metadata).length > 0 && (
          <div className="space-y-2">
            {Object.entries(metadata).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="text-neutral-500 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                </span>
                <span className="text-neutral-700 font-medium">{String(value)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Hover indicator */}
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className={`w-2 h-2 rounded-full ${config.color}`} />
        </div>
      </div>
    </div>
  );
};

export default DrillDownCard;
