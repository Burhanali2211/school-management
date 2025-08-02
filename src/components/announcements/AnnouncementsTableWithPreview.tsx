"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Megaphone, Calendar, User, AlertTriangle } from "lucide-react";
import FormContainer from "@/components/FormContainer";
import { AnnouncementPreview, usePreviewModal } from '@/components/preview';

interface Announcement {
  id: number;
  title: string;
  description?: string;
  date: Date;
  class?: {
    id: number;
    name: string;
  } | null;
}

interface AnnouncementsTableWithPreviewProps {
  announcements: Announcement[];
  columns: { header: string; accessor: string; className?: string }[];
  isAdmin: boolean;
}

const AnnouncementsTableWithPreview: React.FC<AnnouncementsTableWithPreviewProps> = ({
  announcements,
  columns,
  isAdmin
}) => {
  const { isOpen, selectedItem, isLoading, openPreview, closePreview } = usePreviewModal();

  const handleRowClick = (announcement: Announcement, event: React.MouseEvent) => {
    // Don't trigger preview if clicking on buttons or links
    const target = event.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) {
      return;
    }
    
    openPreview(announcement);
  };

  const getPriorityIcon = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('urgent') || lowerTitle.includes('emergency')) {
      return <AlertTriangle className="w-5 h-5 text-red-600" />;
    }
    return <Megaphone className="w-5 h-5 text-blue-600" />;
  };

  const getPriorityColor = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('urgent') || lowerTitle.includes('emergency')) {
      return 'bg-red-100';
    }
    return 'bg-blue-100';
  };

  const renderRow = (item: Announcement) => (
    <TableRow 
      key={item.id} 
      className="hover:bg-primary-50 transition-colors duration-200 cursor-pointer"
      onClick={(e) => handleRowClick(item, e)}
    >
      <TableCell className="py-4">
        <div className="flex items-center space-x-4">
          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getPriorityColor(item.title)}`}>
            {getPriorityIcon(item.title)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-neutral-900 truncate">
              {item.title}
            </p>
            <p className="text-sm text-neutral-500 truncate">
              {item.description || 'No description'}
            </p>
          </div>
        </div>
      </TableCell>
      
      <TableCell className="hidden md:table-cell">
        {item.class ? (
          <Badge variant="secondary">
            {item.class.name}
          </Badge>
        ) : (
          <Badge variant="outline">
            All Classes
          </Badge>
        )}
      </TableCell>
      
      <TableCell className="hidden md:table-cell">
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-neutral-400" />
          <span className="text-sm text-neutral-600">
            {new Date(item.date).toLocaleDateString()}
          </span>
        </div>
      </TableCell>
      
      <TableCell>
        <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => openPreview(item)}
            className="hover:bg-primary-50"
          >
            <Eye className="w-4 h-4" />
          </Button>

          {isAdmin && (
            <>
              <FormContainer table="announcement" type="update" data={item} />
              <FormContainer table="announcement" type="delete" id={item.id} />
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.accessor} className={col.className}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {announcements.map(renderRow)}
        </TableBody>
      </Table>

      {announcements.length === 0 && (
        <div className="text-center py-12">
          <div className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">No announcements found</p>
          <p className="text-gray-400 text-sm mt-2">Try adjusting your search criteria</p>
        </div>
      )}

      {/* Preview Modal */}
      <AnnouncementPreview
        isOpen={isOpen}
        onClose={closePreview}
        announcement={selectedItem}
        isLoading={isLoading}
      />
    </>
  );
};

export default AnnouncementsTableWithPreview;
