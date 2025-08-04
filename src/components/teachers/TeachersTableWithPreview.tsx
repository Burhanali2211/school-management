"use client";

import React from 'react';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, GraduationCap, Phone, MapPin, Mail, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import FormContainer from "@/components/FormContainer";
import { TeacherPreview, usePreviewModal } from '@/components/preview';

interface Teacher {
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
  subjects?: {
    id: number;
    name: string;
  }[];
  classes?: {
    id: number;
    name: string;
    grade?: {
      level: number;
      name: string;
    };
    _count?: {
      students: number;
    };
  }[];
}

interface TeachersTableWithPreviewProps {
  teachers: Teacher[];
  columns: { header: string; accessor: string; className?: string }[];
  isAdmin: boolean;
}

const TeachersTableWithPreview: React.FC<TeachersTableWithPreviewProps> = ({
  teachers,
  columns,
  isAdmin
}) => {
  const { isOpen, selectedItem, isLoading, openPreview, closePreview } = usePreviewModal();

  const handleRowClick = (teacher: Teacher, event: React.MouseEvent) => {
    // Don't trigger preview if clicking on buttons or links
    const target = event.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) {
      return;
    }
    openPreview(teacher);
  };

  const renderRow = (item: Teacher) => (
    <TableRow 
      key={item.id} 
      className="hover:bg-secondary-50 transition-colors cursor-pointer"
      onClick={(e) => handleRowClick(item, e)}
    >
      <TableCell className="flex items-center gap-4 p-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
        <div className="flex flex-col">
          <h3 className="font-semibold text-secondary-900">{item.name} {item.surname}</h3>
          <div className="flex items-center gap-1 text-xs text-secondary-500">
            <Mail className="w-3 h-3" />
            {item?.email}
          </div>
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell text-center">
        <Badge variant="secondary">{item.username}</Badge>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <div className="flex flex-wrap gap-1">
          {item.subjects?.slice(0, 2).map((subject) => (
            <Badge key={subject.id} variant="outline" className="text-xs">
              {subject.name}
            </Badge>
          ))}
          {item.subjects && item.subjects.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{item.subjects.length - 2}
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <div className="flex flex-wrap gap-1">
          {item.classes?.slice(0, 2).map((cls) => (
            <Badge key={cls.id} variant="secondary" className="text-xs">
              {cls.name}
            </Badge>
          ))}
          {item.classes && item.classes.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{item.classes.length - 2}
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        <div className="flex items-center gap-1 text-sm text-secondary-600">
          <Phone className="w-4 h-4" />
          {item.phone}
        </div>
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        <div className="flex items-center gap-1 text-sm text-secondary-600">
          <MapPin className="w-4 h-4" />
          {item.address}
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
            {isAdmin && (
              <>
                <DropdownMenuItem onClick={() => {
                  // Trigger the update form
                  const updateButton = document.querySelector(`[data-table="teacher"][data-type="update"][data-id="${item.id}"]`) as HTMLButtonElement;
                  if (updateButton) updateButton.click();
                }}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => {
                    // Trigger the delete form
                    const deleteButton = document.querySelector(`[data-table="teacher"][data-type="delete"][data-id="${item.id}"]`) as HTMLButtonElement;
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
            <FormContainer table="teacher" type="update" data={item} />
            <FormContainer table="teacher" type="delete" id={item.id} />
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
          {teachers.map(renderRow)}
        </TableBody>
      </Table>

      {teachers.length === 0 && (
        <div className="text-center py-12">
          <div className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">No teachers found</p>
          <p className="text-gray-400 text-sm mt-2">Try adjusting your search criteria</p>
        </div>
      )}

      {/* Preview Modal */}
      <TeacherPreview
        isOpen={isOpen}
        onClose={closePreview}
        teacher={selectedItem}
      />
    </>
  );
};

export default TeachersTableWithPreview;