"use client";

import React from 'react';
import Image from 'next/image';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import FormContainer from "@/components/FormContainer";
import { StudentPreview, usePreviewModal } from '@/components/preview';

interface Student {
  id: string;
  name: string;
  surname: string;
  username: string;
  email?: string | null;
  phone?: string | null;
  address?: string;
  img?: string | null;
  bloodType?: string;
  sex: string;
  birthday: Date;
  class: {
    id: number;
    name: string;
    grade?: {
      level: number;
      name: string;
    };
  };
}

interface StudentsTableWithPreviewProps {
  students: Student[];
  columns: { header: string; accessor: string; className?: string }[];
  isAdmin: boolean;
}

const StudentsTableWithPreview: React.FC<StudentsTableWithPreviewProps> = ({
  students,
  columns,
  isAdmin
}) => {
  const { isOpen, selectedItem, isLoading, openPreview, closePreview } = usePreviewModal();

  const handleRowClick = (student: Student, event: React.MouseEvent) => {
    // Don't trigger preview if clicking on buttons or links
    const target = event.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) {
      return;
    }
    openPreview(student);
  };

  const renderRow = (item: Student, index: number) => (
    <TableRow 
      key={item.id} 
      className="hover:bg-primary-50 transition-colors duration-200 cursor-pointer"
      onClick={(e) => handleRowClick(item, e)}
    >
      <TableCell className="py-4">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <Image
              src={item.img || "/noAvatar.png"}
              alt={item.name}
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-neutral-900 truncate">
              {item.name} {item.surname}
            </p>
            <p className="text-sm text-neutral-500 truncate">
              {item.class.name}
            </p>
          </div>
        </div>
      </TableCell>
      
      <TableCell className="hidden md:table-cell">
        <span className="text-sm text-neutral-900">{item.username}</span>
      </TableCell>
      
      <TableCell className="hidden md:table-cell">
        {item.class.grade && (
          <Badge variant="secondary">
            {item.class.grade.name}
          </Badge>
        )}
      </TableCell>
      
      <TableCell className="hidden lg:table-cell">
        <span className="text-sm text-neutral-600">{item.phone}</span>
      </TableCell>
      
      <TableCell className="hidden lg:table-cell">
        <span className="text-sm text-neutral-600">{item.address}</span>
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
            {isAdmin && (
              <>
                <DropdownMenuItem onClick={() => {
                  // Trigger the update form
                  const updateButton = document.querySelector(`[data-table="student"][data-type="update"][data-id="${item.id}"]`) as HTMLButtonElement;
                  if (updateButton) updateButton.click();
                }}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => {
                    // Trigger the delete form
                    const deleteButton = document.querySelector(`[data-table="student"][data-type="delete"][data-id="${item.id}"]`) as HTMLButtonElement;
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
            <FormContainer table="student" type="update" data={item} />
            <FormContainer table="student" type="delete" id={item.id} />
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
          {students.map((student, index) => renderRow(student, index))}
        </TableBody>
      </Table>

      {students.length === 0 && (
        <div className="text-center py-12">
          <div className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">No students found</p>
          <p className="text-gray-400 text-sm mt-2">Try adjusting your search criteria</p>
        </div>
      )}

      {/* Preview Modal */}
      <StudentPreview
        isOpen={isOpen}
        onClose={closePreview}
        student={selectedItem}
      />
    </>
  );
};

export default StudentsTableWithPreview;