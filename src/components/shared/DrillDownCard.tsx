"use client";

import React from 'react';
import Card from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Users, BookOpen, GraduationCap, School } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DrillDownCardProps {
  id: string | number;
  title: string;
  subtitle?: string;
  description?: string;
  count?: number;
  countLabel?: string;
  type: 'school' | 'class' | 'section' | 'student';
  onClick: (id: string | number) => void;
  className?: string;
  isActive?: boolean;
  metadata?: Record<string, any>;
}

const typeConfig = {
  school: {
    icon: School,
    color: 'bg-blue-500',
    lightColor: 'bg-blue-50',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-200',
  },
  class: {
    icon: BookOpen,
    color: 'bg-purple-500',
    lightColor: 'bg-purple-50',
    textColor: 'text-purple-600',
    borderColor: 'border-purple-200',
  },
  section: {
    icon: Users,
    color: 'bg-green-500',
    lightColor: 'bg-green-50',
    textColor: 'text-green-600',
    borderColor: 'border-green-200',
  },
  student: {
    icon: GraduationCap,
    color: 'bg-orange-500',
    lightColor: 'bg-orange-50',
    textColor: 'text-orange-600',
    borderColor: 'border-orange-200',
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

  const handleClick = () => {
    onClick(id);
  };

  return (
    <div
      className={cn(
        'group relative overflow-hidden transition-all duration-200 cursor-pointer hover:shadow-lg hover:scale-[1.02]',
        isActive && `ring-2 ring-offset-2 ${config.borderColor.replace('border-', 'ring-')}`,
        className
      )}
      onClick={handleClick}
    >
      <Card>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={cn('p-2 rounded-lg', config.lightColor)}>
              <Icon className={cn('w-5 h-5', config.textColor)} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {title}
              </h3>
              {subtitle && (
                <p className="text-sm text-gray-500 truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          
          {count !== undefined && (
            <Badge variant="secondary" className="ml-2">
              {count} {countLabel || 'items'}
            </Badge>
          )}
        </div>

        {/* Description */}
        {description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {description}
          </p>
        )}

        {/* Metadata */}
        {metadata && Object.keys(metadata).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.entries(metadata).map(([key, value]) => (
              <div key={key} className="text-xs text-gray-500">
                <span className="font-medium">{key}:</span> {value}
              </div>
            ))}
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'group-hover:bg-gray-100 transition-colors',
              config.textColor
            )}
          >
            View Details
            <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>

      {/* Hover Effect */}
      <div className={cn(
        'absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity',
        config.color
      )} />
      </Card>
    </div>
  );
};

export default DrillDownCard;
