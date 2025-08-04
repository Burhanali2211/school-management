"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, BookOpen, Users, GraduationCap, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import FormContainer from "@/components/FormContainer";
import { SubjectPreview, usePreviewModal } from '@/components/preview';

interface Subject {
  id: number;
  name: string;
  teachers: {
    id: string;
    name: string;
    surname: string;
    img?: string | null;
  }[];
}

interface SubjectsTableWithPreviewProps {
  subjects: Subject[];
  columns: { header: string; accessor: string; className?: string }[];
  isAdmin: boolean;
}

const SubjectsTableWithPreview: React.FC<SubjectsTableWithPreviewProps> = ({
  subjects,
  columns,
  isAdmin
}) => {
  const { isOpen, selectedItem, isLoading, openPreview, closePreview } = usePreviewModal();

  const handleRowClick = (subject: Subject, event: React.MouseEvent) => {
    // Don't trigger preview if clicking on buttons or links
    const target = event.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) {
      return;
    }
    
    openPreview(subject);
  };

  const renderRow = (item: Subject) => (
    <TableRow 
      key={item.id} 
      className="hover:bg-primary-50 transition-colors duration-200 cursor-pointer"
      onClick={(e) => handleRowClick(item, e)}
    >
      <TableCell className="py-4">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-neutral-900 truncate">
              {item.name}
            </p>
            <p className="text-sm text-neutral-500 truncate">
              {item.teachers.length} {item.teachers.length === 1 ? 'teacher' : 'teachers'}
            </p>
          </div>
        </div>
      </TableCell>
      
      <TableCell className="hidden md:table-cell">
        <div className="space-y-1">
          {item.teachers.slice(0, 2).map((teacher) => (
            <div key={teacher.id} className="flex items-center space-x-2">
              {teacher.img && (
                <Image
                  src={teacher.img}
                  alt={`${teacher.name} ${teacher.surname}`}
                  width={20}
                  height={20}
                  className="w-5 h-5 rounded-full object-cover"
                />
              )}
              <span className="text-sm text-neutral-900">
                {teacher.name} {teacher.surname}
              </span>
            </div>
          ))}
          {item.teachers.length > 2 && (
            <div className="text-xs text-neutral-500">
              +{item.teachers.length - 2} more
            </div>
          )}
          {item.teachers.length === 0 && (
            <span className="text-sm text-neutral-500">No teachers assigned</span>
          )}
        </div>
      </TableCell>
      
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0 hover:bg-muted"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openPreview(item)}>
              <Eye className="mr-2 h-4 w-4" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/list/subjects/${item.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </DropdownMenuItem>
            {isAdmin && (
              <>
                <DropdownMenuItem onClick={() => {
                  // Trigger the update form
                  const updateButton = document.querySelector(`[data-table="subject"][data-type="update"][data-id="${item.id}"]`) as HTMLButtonElement;
                  if (updateButton) updateButton.click();
                }}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => {
                    // Trigger the delete form
                    const deleteButton = document.querySelector(`[data-table="subject"][data-type="delete"][data-id="${item.id}"]`) as HTMLButtonElement;
                    if (deleteButton) deleteButton.click();
                  }}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Hidden FormContainer buttons for admin actions */}
        {isAdmin && (
          <div className="hidden">
            <FormContainer table="subject" type="update" data={item} />
            <FormContainer table="subject" type="delete" id={item.id} />
          </div>
        )}
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
          {subjects.map(renderRow)}
        </TableBody>
      </Table>

      {subjects.length === 0 && (
        <div className="text-center py-12">
          <div className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">No subjects found</p>
          <p className="text-gray-400 text-sm mt-2">Try adjusting your search criteria</p>
        </div>
      )}

      {/* Preview Modal */}
      <SubjectPreview
        isOpen={isOpen}
        onClose={closePreview}
        subject={selectedItem}
        isLoading={isLoading}
      />
    </>
  );
};

export default SubjectsTableWithPreview;
