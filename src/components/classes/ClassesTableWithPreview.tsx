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
import { Eye, Users, User, School, GraduationCap, MoreHorizontal, Edit, Trash2, ExternalLink } from "lucide-react";
import FormContainer from "@/components/FormContainer";
import { ClassPreview, usePreviewModal } from '@/components/preview';

interface Class {
  id: number;
  name: string;
  capacity?: number;
  gradeId: number;
  grade: {
    level: number;
    name: string;
  };
  supervisor?: {
    id: string;
    name: string;
    surname: string;
    img?: string | null;
  } | null;
  _count?: {
    students: number;
  };
}

interface ClassesTableWithPreviewProps {
  classes: Class[];
  columns: { header: string; accessor: string; className?: string }[];
  isAdmin: boolean;
}

const ClassesTableWithPreview: React.FC<ClassesTableWithPreviewProps> = ({
  classes,
  columns,
  isAdmin
}) => {
  const { isOpen, selectedItem, isLoading, openPreview, closePreview } = usePreviewModal();

  const handleRowClick = (classItem: Class, event: React.MouseEvent) => {
    // Don't trigger preview if clicking on buttons or links
    const target = event.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) {
      return;
    }
    
    openPreview(classItem);
  };

  const renderRow = (item: Class) => (
    <TableRow 
      key={item.id} 
      className="hover:bg-primary-50 transition-colors duration-200 cursor-pointer"
      onClick={(e) => handleRowClick(item, e)}
    >
      <TableCell className="py-4">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <School className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-neutral-900 truncate">
              {item.name}
            </p>
            <p className="text-sm text-neutral-500 truncate">
              {item.grade.name}
            </p>
          </div>
        </div>
      </TableCell>
      
      <TableCell className="hidden md:table-cell">
        <Badge variant="secondary">
          {item.grade.name}
        </Badge>
      </TableCell>
      
      <TableCell className="hidden md:table-cell">
        <div className="flex items-center space-x-1">
          <Users className="w-4 h-4 text-neutral-400" />
          <span className="text-sm text-neutral-600">
            {item._count?.students || 0} / {item.capacity || 'N/A'}
          </span>
        </div>
      </TableCell>
      
      <TableCell className="hidden lg:table-cell">
        {item.supervisor ? (
          <div className="flex items-center space-x-2">
            {item.supervisor.img && (
              <Image
                src={item.supervisor.img}
                alt={`${item.supervisor.name} ${item.supervisor.surname}`}
                width={24}
                height={24}
                className="w-6 h-6 rounded-full object-cover"
              />
            )}
            <span className="text-sm text-neutral-900">
              {item.supervisor.name} {item.supervisor.surname}
            </span>
          </div>
        ) : (
          <span className="text-sm text-neutral-500">No supervisor</span>
        )}
      </TableCell>
      
      <TableCell>
        <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
          {/* Preview Button */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => openPreview(item)}
            className="hover:bg-primary-50"
            title="Preview class details"
          >
            <Eye className="w-4 h-4" />
          </Button>
          
          {/* View Details Button */}
          <Link href={`/list/classes/${item.id}`}>
            <Button 
              variant="outline" 
              size="sm"
              title="View detailed class page"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </Link>
          
          {/* Admin Actions */}
          {isAdmin && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <div>
                    <FormContainer table="class" type="update" data={item} />
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <div className="text-red-600">
                    <FormContainer table="class" type="delete" id={item.id} />
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
          {classes.map(renderRow)}
        </TableBody>
      </Table>

      {classes.length === 0 && (
        <div className="text-center py-12">
          <div className="w-12 h-12 text-gray-400 mx-auto mb-4">
            <School className="w-12 h-12" />
          </div>
          <p className="text-gray-500 text-lg font-medium">No classes found</p>
          <p className="text-gray-400 text-sm mt-2">Try adjusting your search criteria or add a new class</p>
        </div>
      )}

      {/* Preview Modal */}
      <ClassPreview
        isOpen={isOpen}
        onClose={closePreview}
        classData={selectedItem}
        isLoading={isLoading}
      />
    </>
  );
};

export default ClassesTableWithPreview;
