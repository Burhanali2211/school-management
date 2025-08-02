"use client";

import React from 'react';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Users, Phone, MapPin } from "lucide-react";
import FormContainer from "@/components/FormContainer";
import { ParentPreview, usePreviewModal } from '@/components/preview';

interface Parent {
  id: string;
  name: string;
  surname: string;
  username: string;
  email?: string | null;
  phone?: string | null;
  address?: string;
  students: {
    id: string;
    name: string;
    surname: string;
    img?: string | null;
    class?: {
      name: string;
      grade?: {
        level: number;
      };
    };
  }[];
}

interface ParentsTableWithPreviewProps {
  parents: Parent[];
  columns: { header: string; accessor: string; className?: string }[];
  isAdmin: boolean;
}

const ParentsTableWithPreview: React.FC<ParentsTableWithPreviewProps> = ({
  parents,
  columns,
  isAdmin
}) => {
  const { isOpen, selectedItem, isLoading, openPreview, closePreview } = usePreviewModal();

  const handleRowClick = (parent: Parent, event: React.MouseEvent) => {
    // Don't trigger preview if clicking on buttons or links
    const target = event.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) {
      return;
    }
    openPreview(parent);
  };

  const renderRow = (item: Parent) => (
    <TableRow 
      key={item.id} 
      className="hover:bg-primary-50 transition-colors duration-200 cursor-pointer"
      onClick={(e) => handleRowClick(item, e)}
    >
      <TableCell className="py-4">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-600" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-neutral-900 truncate">
              {item.name} {item.surname}
            </p>
            <p className="text-sm text-neutral-500 truncate">
              {item.students.length} {item.students.length === 1 ? 'child' : 'children'}
            </p>
          </div>
        </div>
      </TableCell>
      
      <TableCell className="hidden md:table-cell">
        <div className="space-y-1">
          {item.students.slice(0, 2).map((student) => (
            <div key={student.id} className="text-sm text-neutral-900">
              {student.name} {student.surname}
            </div>
          ))}
          {item.students.length > 2 && (
            <div className="text-xs text-neutral-500">
              +{item.students.length - 2} more
            </div>
          )}
        </div>
      </TableCell>
      
      <TableCell className="hidden lg:table-cell">
        <div className="flex items-center space-x-1">
          <Phone className="w-4 h-4 text-neutral-400" />
          <span className="text-sm text-neutral-600">{item.phone || 'N/A'}</span>
        </div>
      </TableCell>
      
      <TableCell className="hidden lg:table-cell">
        <div className="flex items-center space-x-1">
          <MapPin className="w-4 h-4 text-neutral-400" />
          <span className="text-sm text-neutral-600 truncate max-w-[200px]">
            {item.address || 'N/A'}
          </span>
        </div>
      </TableCell>
      
      <TableCell>
        <div className="flex items-center space-x-2">
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
              <FormContainer table="parent" type="update" data={item} />
              <FormContainer table="parent" type="delete" id={item.id} />
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
          {parents.map(renderRow)}
        </TableBody>
      </Table>

      {parents.length === 0 && (
        <div className="text-center py-12">
          <div className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">No parents found</p>
          <p className="text-gray-400 text-sm mt-2">Try adjusting your search criteria</p>
        </div>
      )}

      {/* Preview Modal */}
      <ParentPreview
        isOpen={isOpen}
        onClose={closePreview}
        parent={selectedItem}
      />
    </>
  );
};

export default ParentsTableWithPreview;